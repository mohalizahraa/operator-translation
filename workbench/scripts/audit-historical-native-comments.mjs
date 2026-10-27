import {planNativeCommentAnchorFromStructure} from './plan-native-comment-anchor.mjs';

/**
 * Read-only historical Google Docs comment reconciliation.
 *
 * Input: document returned by authenticated Docs get_document and comments
 * returned by get_document_comments. Never infer a source Arabic PDF page or
 * a human editorial decision from thread resolution, a quote, or an anchor.
 * No comments, Docs, or D1 rows are written by this module.
 */

export function decodeDocsQuote(value) {
  if(typeof value!=='string'||value.length>5000)return null;
  const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',laquo:'«',raquo:'»'};
  let invalid=false;
  const decoded=value.replace(/&(#x[\da-fA-F]+|#\d+|[a-zA-Z]+);/g,(_full,key)=>{
    if(key[0]==='#'){
      const hexadecimal=key[1]?.toLowerCase()==='x';
      const number=Number.parseInt(key.slice(hexadecimal?2:1),hexadecimal?16:10);
      if(!Number.isInteger(number)||number<=0||number>0x10ffff||
        (number>=0xd800&&number<=0xdfff)){invalid=true;return '';}
      return String.fromCodePoint(number);
    }
    const val=named[key.toLowerCase()];
    if(val===undefined){invalid=true;return '';}
    return val;
  });
  // Unknown HTML entities are not safe to match or silently coerce.
  if(invalid||/&(?:#(?:x[\da-fA-F]+|\d+)|[a-zA-Z]+);/.test(decoded))return null;
  // HTML markup from richer comments isn't an exact native-text witness.
  if(/<\/?[a-z][\w:-]*(?:\s[^>]*)?>/i.test(decoded))return null;
  return decoded;
}

export function auditHistoricalNativeComments({document,comments,tab_id}) {
  const document_id=document?.documentId??null;
  const document_revision=document?.revisionId??null;
  if(!document_id||!document_revision||!Array.isArray(document?.tabs)||
    !document.tabs.some(t=>t.tabId===tab_id)||!Array.isArray(comments)){
    return {ok:false,code:'invalid_source_readback',results:[]};
  }
  const seen=new Set();
  const results=comments.map(c=>{
    const id=typeof c?.id==='string'?c.id:null;
    const anchor=typeof c?.anchor==='string'?c.anchor:null;
    const quote=decodeDocsQuote(c?.quotedFileContent?.value);
    const common={comment_id:id,anchor_id:anchor,thread_resolved:c?.resolved===true,
      document_id,document_revision,tab_id,arabic_source_page:null,
      question_decision_status:'not_determined',safe_to_import_as_verified_question:false};
    if(!id||seen.has(id))return {...common,classification:'duplicate_or_missing_comment_id'};
    seen.add(id);
    if(!anchor)return {...common,classification:'missing_native_anchor'};
    if(quote===null||!quote.trim())return {...common,classification:'quote_not_safely_decodable'};
    const plan=planNativeCommentAnchorFromStructure({
      document,google_doc_id:document_id,document_revision,tab_id,
      quoted_text:quote,comment_text:'Historical comment analysis only; this is not a new Docs comment.',
    });
    if(plan.ok){
      return {...common,classification:'unique_current_quote_candidate',
        startIndex:plan.startIndex,endIndex:plan.endIndex,
        quote_length:quote.length,
        caveat:'Text matching does not prove the opaque native comment anchor still points to this candidate.'};
    }
    let classification;
    if(plan.code==='ambiguous_quote')classification='ambiguous_current_quote';
    else if(plan.code==='quote_not_found')classification='stale_or_reformatted_quote';
    else classification='manual_structure_reconciliation_required';
    return {...common,classification,quote_length:quote.length,reason:plan.code};
  });
  const counts={};
  for(const r of results)counts[r.classification]=(counts[r.classification]||0)+1;
  return {ok:true,document_id,document_revision,tab_id,comment_count:results.length,
    counts,verified_source_questions:0,review_attestations:0,results,
    note:'Read-only quote matches and native comment IDs are historical observations, not verified source passages, current native anchor locations or applied decisions.'};
}

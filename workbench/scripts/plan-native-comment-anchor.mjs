/**
 * Plan one native Google Docs anchored comment without touching Docs or D1.
 * Input comes from authenticated get_document_text() with the same live
 * Google Doc ID/revision that the caller is authorized to edit.
 *
 * An exact unique substring is required in exactly one paragraph of the
 * specified tab. Google Docs indexes UTF-16 code units (JS String.length).
 * Deliberately refuse structurally non-contiguous text or ambiguity.
 */
export function planNativeCommentAnchor({
  document, google_doc_id, document_revision, tab_id, quoted_text, comment_text,
}) {
  const fail=(code,why)=>({ok:false,code,reason:why});
  if(!document||typeof document!=='object'||!Array.isArray(document.paragraphs)){
    return fail('no_indexed_document','Read the native Google Doc with get_document_text first.');
  }
  if(typeof google_doc_id!=='string'||!google_doc_id||document.documentId!==google_doc_id){
    return fail('wrong_document','The indexed document identity differs from the required English Book.');
  }
  if(typeof document_revision!=='string'||!document_revision||
    document.revisionId!==document_revision){
    return fail('stale_revision','Obtain a fresh indexed document revision before anchoring a comment.');
  }
  if(typeof tab_id!=='string'||!tab_id||!document.paragraphs.some(p=>p.tabId===tab_id)){
    return fail('missing_tab','The chosen manuscript tab was not found in the indexed document.');
  }
  if(typeof quoted_text!=='string'||!quoted_text.trim()||
    quoted_text.includes('\n')||quoted_text.includes('\r')||quoted_text.length>1000){
    return fail('invalid_quote','Select one exact, nonempty, single-paragraph English phrase of at most 1,000 UTF-16 code units.');
  }
  if(typeof comment_text!=='string'||!comment_text.trim()||comment_text.length>6000){
    return fail('invalid_comment','Provide a nonempty bounded editorial comment.');
  }
  const matches=[];
  for(const p of document.paragraphs){
    if(p.tabId!==tab_id)continue;
    // We cannot safely convert offset to Docs range if native elements,
    // broken extraction or non-text controls change index accounting.
    if(!Number.isInteger(p.startIndex)||!Number.isInteger(p.endIndex)||
       typeof p.text!=='string'||p.startIndex<1||p.endIndex<=p.startIndex||
       p.text.length!==p.endIndex-p.startIndex){
      return fail('structural_index_mismatch','The target tab contains a paragraph with non-contiguous or unverified native text indexes.');
    }
    let at=p.text.indexOf(quoted_text);
    while(at!==-1){
      matches.push({startIndex:p.startIndex+at,endIndex:p.startIndex+at+quoted_text.length});
      if(matches.length>1) return fail('ambiguous_quote','The selected English phrase occurs more than once in the manuscript tab.');
      at=p.text.indexOf(quoted_text,at+1);
    }
  }
  if(!matches.length)return fail('quote_not_found','The exact English phrase is absent from the selected manuscript tab.');
  const {startIndex,endIndex}=matches[0];
  return {
    ok:true,google_doc_id,document_revision,tab_id,quoted_text,
    startIndex,endIndex,
    request:{insertComment:{content:comment_text,range:{startIndex,endIndex,tabId:tab_id}}},
    write_control:{requiredRevisionId:document_revision},
    note:'Plan only; caller must submit this request with the revision guard, then independently read back the native comment ID, anchor and quoted text before posting any D1 association.',
  };
}

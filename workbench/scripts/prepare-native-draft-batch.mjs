#!/usr/bin/env node
/**
 * Private, revision-guarded native Google Docs batch planner for one verified
 * Workbench source unit. Output contains private English text and must NEVER be
 * committed or printed to public logs. This planner NEVER contacts Google Docs,
 * authenticates a PDF, verifies Arabic fidelity or certifies accepted pages.
 *
 * Two-phase edit: (1) insert source-checked prose, native headings/lists and
 * note references in one Docs batchUpdate; (2) map returned note IDs and fill
 * source notes in one guarded Docs batchUpdate. Read the live target again and
 * verify its structure, rendering and note anchors after either phase.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {assertSafeSourceAppend} from './source-unit-overlap-preflight.mjs';

const FAMILY='Amiri';
const MAX_TEXT=300_000;
const MAX_NOTES=250;
const STYLES=new Map([
  ['body',{namedStyleType:'NORMAL_TEXT',fontSize:14,bold:false}],
  ['heading',{namedStyleType:'HEADING_3',fontSize:18,bold:true}],
  ['bullet',{namedStyleType:'NORMAL_TEXT',fontSize:14,bold:false,list:'BULLET_DISC_CIRCLE_SQUARE'}],
  ['numbered',{namedStyleType:'NORMAL_TEXT',fontSize:14,bold:false,list:'NUMBERED_DECIMAL_ALPHA_ROMAN'}],
]);
const fail=(code)=>{throw new Error('NATIVE_DRAFT_BATCH_BLOCKED:'+code);};
const validStr=(v)=>typeof v==='string'&&v.trim().length>0;
const positiveInt=(v)=>Number.isSafeInteger(v)&&v>=0;
const normalText=(s)=>typeof s==='string'&&s.length>0&&!/[\n\r\t\u0000-\u0008\u000b\u000c]/u.test(s)&&s===s.trim();

function targetTab(document,tabId){
  if(!validStr(tabId))fail('MISSING_TAB_ID');
  const tab=(document?.tabs||[]).find(t=>(t.tabProperties?.tabId||t.tabId)===tabId);
  if(!tab)fail('TARGET_TAB_NOT_PRESENT');
  const body=tab.documentTab?.body||tab.body;
  if(!Array.isArray(body?.content)||body.content.length<2)fail('INCOMPLETE_NATIVE_TARGET');
  const last=body.content.at(-1);
  if(!positiveInt(last?.startIndex)||!positiveInt(last?.endIndex)||last.endIndex!==last.startIndex+1||
     !last.paragraph||!Array.isArray(last.paragraph.elements)||
     last.paragraph.elements.map(e=>e.textRun?.content||'').join('')!=='\n')fail('TARGET_NOT_AT_VERIFIED_EMPTY_END');
  return {insertIndex:last.startIndex,tab};
}
function range(startIndex,endIndex,tabId){return {startIndex,endIndex,tabId};}
function fullStyle(startIndex,endIndex,tabId,size,bold=false){
  const st={weightedFontFamily:{fontFamily:FAMILY},fontSize:{magnitude:size,unit:'PT'},bold};
  if(bold)st.weightedFontFamily.weight=700;
  return {updateTextStyle:{range:range(startIndex,endIndex,tabId),textStyle:st,fields:'weightedFontFamily,fontSize,bold'}};
}
function listGroups(entries,spans,tabId){
  const out=[];
  let from=null,style=null,until=null;
  function flush(){if(from!==null){out.push({createParagraphBullets:{range:range(from,until,tabId),bulletPreset:STYLES.get(style).list}});from=null;style=null;until=null;}}
  entries.forEach((e,i)=>{
    const kind=e.type;
    if(kind!=='bullet'&&kind!=='numbered'){flush();return;}
    if(style===kind&&until===spans[i].start){until=spans[i].end;return;}
    flush();style=kind;from=spans[i].start;until=spans[i].end;
  });
  flush();return out;
}

/**
 * Requires a caller-authenticated fresh live Docs snapshot and a COMPLETE
 * audited source-to-target coverage manifest; preflight cannot prove either.
 */
export function planNativeDraftBatch({document,projectId,manifest,proposed,tabId,entries,notes=[]}){
  if(!validStr(document?.revisionId)||document.revisionId.length<12)fail('MISSING_LIVE_TARGET_REVISION');
  if(!Array.isArray(entries)||entries.length===0||entries.length>500)fail('INVALID_ENTRIES');
  if(!Array.isArray(notes)||notes.length>MAX_NOTES)fail('INVALID_NOTES');
  const {insertIndex}=targetTab(document,tabId);
  // The source ID is not inferred from any PDF or from draft text.
  assertSafeSourceAppend({projectId,currentTargetRevision:document.revisionId,
    sourceSha256:proposed?.sourceSha256,manifest,proposed});
  if(entries.some(e=>!STYLES.has(e?.type)||!normalText(e?.text)))fail('INVALID_PARAGRAPH_TEXT_OR_TYPE');
  const text=entries.map(e=>e.text+'\n').join('');
  if(text.length>MAX_TEXT)fail('BATCH_TOO_LARGE');
  const spans=[];let pos=insertIndex;
  for(const entry of entries){const end=pos+entry.text.length+1;spans.push({start:pos,end});pos=end;}
  // IMPORTANT ORDER: the live Docs pilot showed that updateParagraphStyle and
  // createParagraphBullets can clear explicit runs set earlier in the batch.
  // Set all paragraph/list structure first. Apply the complete body text style
  // LAST, then override headings, before inserting footnote anchors. This is
  // independently verified by a native Docs readback, not just unit tests.
  const requests=[
    {insertText:{endOfSegmentLocation:{tabId},text}},
    ...entries.map((entry,i)=>({updateParagraphStyle:{range:range(spans[i].start,spans[i].end,tabId),
      paragraphStyle:{namedStyleType:STYLES.get(entry.type).namedStyleType},fields:'namedStyleType'}})),
    ...listGroups(entries,spans,tabId),
    fullStyle(insertIndex,pos,tabId,14),
    ...entries.flatMap((entry,i)=>entry.type==='heading'?[
      fullStyle(spans[i].start,spans[i].end-1,tabId,18,true)
    ]:[]),
  ];
  const anchors=notes.map((note,index)=>{
    if(!positiveInt(note?.entryIndex)||note.entryIndex>=entries.length || !validStr(note?.text) ||
       !validStr(note.anchorText)||note.text.length>50_000)fail('INVALID_NOTE');
    if(/[\u0000-\u0008]/u.test(note.text))fail('INVALID_NOTE_CONTROL_CHARACTER');
    const target=entries[note.entryIndex].text;
    const at=target.indexOf(note.anchorText);
    if(at<0||target.indexOf(note.anchorText,at+1)!==-1)fail('AMBIGUOUS_OR_ABSENT_NOTE_ANCHOR');
    return {noteIndex:index,at:spans[note.entryIndex].start+at+note.anchorText.length,text:note.text};
  });
  // Notes are created in descending index order to prevent changing the index
  // of an earlier source anchor; the replies retain that request order.
  anchors.sort((a,b)=>b.at-a.at);
  if(anchors.some((x,i)=>i>0&&x.at===anchors[i-1].at))fail('DUPLICATE_NOTE_ANCHOR');
  const noteReplyOffset=requests.length;
  requests.push(...anchors.map(a=>({createFootnote:{location:{index:a.at,tabId}}})));
  return {writeControl:{requiredRevisionId:document.revisionId},requests,
    privateNotePlan:{replyOffset:noteReplyOffset,notes:anchors.map(a=>({noteIndex:a.noteIndex,text:a.text}))},
    privateReceipt:{projectId,sourceUnitId:proposed.sourceUnitId,sourcePages:[proposed.fromPage,proposed.toPage],
      entries:entries.length,notes:notes.length,utf16Units:text.length,sourceAcceptance:'OPEN'}};
}

export function planPopulateNativeNotes({firstPhaseResult,privateNotePlan,tabId}){
  const revision=firstPhaseResult?.revisionId||firstPhaseResult?.writeControl?.requiredRevisionId;
  if(!validStr(revision)||revision.length<12)fail('NO_CONFIRMED_WRITE_REVISION');
  if(!Array.isArray(firstPhaseResult?.replies)||!Array.isArray(privateNotePlan?.notes)||
      !positiveInt(privateNotePlan.replyOffset))fail('MISSING_CREATE_NOTE_REPLIES');
  const ids=new Set();const requests=[];
  for(let i=0;i<privateNotePlan.notes.length;i++){
    const note=privateNotePlan.notes[i];
    const id=firstPhaseResult.replies[privateNotePlan.replyOffset+i]?.createFootnote?.footnoteId;
    if(!validStr(id)||ids.has(id)||!validStr(note?.text))fail('NOTE_ID_MAPPING_FAILED');
    ids.add(id);
    requests.push({insertText:{endOfSegmentLocation:{segmentId:id,tabId},text:note.text}});
    // The empty Docs footnote begins with one spacer before its newline. Format
    // exactly the newly populated note, including its inherited spacer.
    requests.push(fullStyle(0,note.text.length+1,tabId,10));
    requests.at(-1).updateTextStyle.range.segmentId=id;
    delete requests.at(-1).updateTextStyle.range.tabId;
  }
  return {writeControl:{requiredRevisionId:revision},requests,
    privateReceipt:{notesToPopulate:ids.size,sourceAcceptance:'OPEN'}};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try {
    if(process.argv[2]==='--populate'){
      if(process.argv.length!==5)fail('USAGE_POPULATE');
      const [, , phaseFile, planFile, outputFile]=process.argv;
      const phase=JSON.parse(readFileSync(phaseFile,'utf8'));
      const plan=JSON.parse(readFileSync(planFile,'utf8'));
      const res=planPopulateNativeNotes({firstPhaseResult:phase,privateNotePlan:plan.privateNotePlan,tabId:plan.tabId});
      writeFileSync(outputFile,JSON.stringify(res),{flag:'wx',mode:0o600});
      console.log('PRIVATE_NOTE_POPULATION_PLAN_READY '+res.privateReceipt.notesToPopulate);
    }else {
      if(process.argv.length!==7)fail('USAGE_PRIVATE_FILES');
      const [, , docFile, manifestFile, proposalFile, batchFile, outputFile]=process.argv;
      const doc=JSON.parse(readFileSync(docFile,'utf8')),
        manifest=JSON.parse(readFileSync(manifestFile,'utf8')),
        proposed=JSON.parse(readFileSync(proposalFile,'utf8')),
        batch=JSON.parse(readFileSync(batchFile,'utf8'));
      const res=planNativeDraftBatch({document:doc,projectId:proposed.projectId,manifest,proposed,
        tabId:batch.tabId,entries:batch.entries,notes:batch.notes});
      writeFileSync(outputFile,JSON.stringify({...res,tabId:batch.tabId}),{flag:'wx',mode:0o600});
      console.log('PRIVATE_NATIVE_BATCH_PLAN_READY '+JSON.stringify(res.privateReceipt));
    }
  }catch(e){const safe=/^(?:NATIVE_DRAFT_BATCH_BLOCKED|SOURCE_APPEND_BLOCKED):[A-Z_]+$/.test(String(e.message));console.error('PRIVATE_NATIVE_BATCH_BLOCKED '+(safe?e.message:'INVALID_OR_INACCESSIBLE_PRIVATE_INPUT'));process.exitCode=1;}
}

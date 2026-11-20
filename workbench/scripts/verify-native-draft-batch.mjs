#!/usr/bin/env node
/**
 * Read-only, privacy-safe mechanical assurance for one prepared native Docs
 * batch. This is NOT Arabic source fidelity, rendering, reviewer acceptance,
 * original PDF authentication, or authorization to publish progress.
 */
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const fail=code=>{throw new Error('NATIVE_BATCH_QA_BLOCKED:'+code)};
const nonblank=x=>typeof x==='string'&&x.trim().length>0;
const int=x=>Number.isSafeInteger(x)&&x>=0;
const types=new Set(['body','heading','bullet','numbered']);
function getTab(d,tabId){
  const t=(d?.tabs||[]).find(x=>(x.tabProperties?.tabId||x.tabId)===tabId);
  if(!t||!Array.isArray((t.documentTab?.body||t.body)?.content))fail('MISSING_FULL_NATIVE_TAB');
  return {body:(t.documentTab?.body||t.body).content,footnotes:t.documentTab?.footnotes||t.footnotes||{}};
}
function textOf(e){return e?.paragraph?.elements?.map(x=>x.textRun?.content||'').join('')??null;}
function runsOf(e){return e?.paragraph?.elements?.filter(x=>x.textRun&&x.textRun.content.trim())||[];}
function anchorsOf(e){
  let pos=0;const out=[];
  for(const x of e?.paragraph?.elements||[]){
    if(x.textRun)pos+=(x.textRun.content||'').length;
    if(x.footnoteReference)out.push({id:x.footnoteReference.footnoteId,offset:pos});
  }
  return out;
}
function inspectRuns(e,expectedSize,bold){
  const runs=runsOf(e);
  if(!runs.length)fail('EMPTY_VISIBLE_PARAGRAPH');
  for(const el of runs){
    const f=el.textRun.textStyle||{};
    if(f.fontSize?.magnitude!==expectedSize||f.fontSize?.unit!=='PT'||
       f.weightedFontFamily?.fontFamily!=='Amiri')fail('INHERITED_OR_INCORRECT_TEXT_STYLE');
    if(Boolean(f.bold)!==bold)fail('INCORRECT_TEXT_WEIGHT');
  }
}
function inspectNote(note,expectedText){
  if(!Array.isArray(note?.content))fail('FOOTNOTE_MISSING');
  const elements=note.content.flatMap(x=>x.paragraph?.elements||[]);
  const content=elements.map(x=>x.textRun?.content||'').join('');
  if(content.trim()!==expectedText.trim())fail('FOOTNOTE_TEXT_MISMATCH');
  const visible=elements.filter(x=>x.textRun?.content?.trim());
  if(!visible.length)fail('FOOTNOTE_EMPTY');
  for(const e of visible){
    const f=e.textRun.textStyle||{};
    if(f.fontSize?.magnitude!==10||f.weightedFontFamily?.fontFamily!=='Amiri')fail('FOOTNOTE_FONT_MISMATCH');
  }
}
export function inspectNativeDraftBatch({document,tabId,entries,notes=[],phase1Plan,phase1Result,phase2Result}){
  const confirmed=phase2Result?.revisionId;
  if(!nonblank(confirmed)||confirmed!==document?.revisionId||!nonblank(phase1Result?.revisionId))
    fail('UNCONFIRMED_FINAL_REVISION');
  if(!nonblank(tabId)||!Array.isArray(entries)||!Array.isArray(notes)||
     !entries.length||!phase1Plan?.privateNotePlan||
     !int(phase1Plan.privateNotePlan.insertIndex))fail('INCOMPLETE_PRIVATE_BATCH_EVIDENCE');
  const {body,footnotes}=getTab(document,tabId);
  const start=phase1Plan.privateNotePlan.insertIndex;
  const ordered=body.filter(x=>int(x.startIndex)&&x.startIndex>=start && x.paragraph).slice(0,entries.length);
  if(ordered.length!==entries.length)fail('INCOMPLETE_BATCH_PARAGRAPHS');
  const actualNoteAnchors=[];
  let checked=0;
  for(let i=0;i<entries.length;i++){
    const spec=entries[i],item=ordered[i];
    if(!types.has(spec.type)||textOf(item)!==spec.text+'\n')fail('PARAGRAPH_TEXT_MISMATCH');
    if(item.paragraph.paragraphStyle?.namedStyleType!==(spec.type==='heading'?'HEADING_3':'NORMAL_TEXT'))
      fail('PARAGRAPH_STYLE_MISMATCH');
    const shouldList=spec.type==='bullet'||spec.type==='numbered';
    if(Boolean(item.paragraph.bullet)!==shouldList)fail('LIST_STRUCTURE_MISMATCH');
    inspectRuns(item,spec.type==='heading'?18:14,spec.type==='heading');
    actualNoteAnchors.push(...anchorsOf(item).map(x=>({...x,entryIndex:i})));
    checked++;
  }
  const ids=new Set();const expected=[];
  for(let i=0;i<phase1Plan.privateNotePlan.notes.length;i++){
    const n=phase1Plan.privateNotePlan.notes[i];
    const id=phase1Result?.replies?.[phase1Plan.privateNotePlan.replyOffset+i]?.createFootnote?.footnoteId;
    const spec=notes[n.noteIndex];
    if(!nonblank(id)||ids.has(id)||!spec||spec.text!==n.text||!int(spec.entryIndex)||spec.entryIndex>=entries.length)
      fail('MISSING_OR_MISMATCHED_NOTE_ID');
    ids.add(id);
    const at=entries[spec.entryIndex].text.indexOf(spec.anchorText);
    if(at<0||entries[spec.entryIndex].text.indexOf(spec.anchorText,at+1)!==-1)fail('AMBIGUOUS_EXPECTED_NOTE_ANCHOR');
    expected.push({id,entryIndex:spec.entryIndex,offset:at+spec.anchorText.length,text:spec.text});
  }
  if(expected.length!==notes.length||actualNoteAnchors.length!==expected.length)fail('NOTE_ANCHOR_COUNT_MISMATCH');
  for(const e of expected){
    const occurrences=actualNoteAnchors.filter(a=>a.id===e.id&&a.entryIndex===e.entryIndex&&a.offset===e.offset);
    if(occurrences.length!==1)fail('NOTE_ANCHOR_POSITION_MISMATCH');
    inspectNote(footnotes[e.id],e.text);
  }
  // Assert adjacent same-type list entries share one native list ID. Different
  // adjacent list types must not silently merge into one list sequence.
  for(let i=1;i<entries.length;i++){
    const a=entries[i-1].type,b=entries[i].type;
    if(!['bullet','numbered'].includes(a)||!['bullet','numbered'].includes(b))continue;
    const before=ordered[i-1].paragraph.bullet.listId,after=ordered[i].paragraph.bullet.listId;
    if(!nonblank(before)||!nonblank(after)||((a===b)!==(before===after)))fail('LIST_GROUPING_MISMATCH');
  }
  return {nativeStructureVerified:true,paragraphs:checked,notes:expected.length,
    sourceFidelity:'NOT_CHECKED',renderedPdf:'NOT_CHECKED',humanApproval:'NOT_CHECKED',sourcePagesAccepted:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    if(process.argv.length!==8)fail('USAGE_SIX_PRIVATE_JSON_FILES');
    const [docFile,batchFile,planFile,phase1File,phase2File,tabId]=process.argv.slice(2);
    const doc=JSON.parse(readFileSync(docFile,'utf8')),
      batch=JSON.parse(readFileSync(batchFile,'utf8')),
      plan=JSON.parse(readFileSync(planFile,'utf8')),
      phase1=JSON.parse(readFileSync(phase1File,'utf8')),
      phase2=JSON.parse(readFileSync(phase2File,'utf8'));
    console.log('NATIVE_BATCH_QA_RESULT '+JSON.stringify(inspectNativeDraftBatch({document:doc,tabId,
      entries:batch.entries,notes:batch.notes,phase1Plan:plan,phase1Result:phase1,phase2Result:phase2})));
  }catch(e){
    const msg=String(e?.message||'');
    console.error('NATIVE_BATCH_QA_BLOCKED '+(/^(?:NATIVE_BATCH_QA_BLOCKED:[A-Z_]+)$/.test(msg)?msg:'INVALID_OR_INACCESSIBLE_PRIVATE_INPUT'));
    process.exitCode=1;
  }
}

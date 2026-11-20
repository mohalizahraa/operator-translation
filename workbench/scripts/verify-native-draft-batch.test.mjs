import test from 'node:test';
import assert from 'node:assert/strict';
import {planNativeDraftBatch} from './prepare-native-draft-batch.mjs';
import {inspectNativeDraftBatch} from './verify-native-draft-batch.mjs';
const rev='revision-verified-src-12345', finalRev='revision-final-verified-ABCDE',sha='a'.repeat(64);
const entries=[{type:'heading',text:'A synthetic heading'},{type:'body',text:'Alpha 😀 footnote appears here.'},{type:'bullet',text:'First point'},{type:'bullet',text:'Second point'},{type:'numbered',text:'What is correct?'},{type:'numbered',text:'What is not?'}];
const notes=[{entryIndex:1,anchorText:'footnote',text:'One synthetic source note.'}];
const docBefore={revisionId:rev,tabs:[{tabId:'t.0',body:{content:[{endIndex:1,sectionBreak:{}},{startIndex:1,endIndex:30,paragraph:{elements:[{textRun:{content:'Pre-existing fixture text.\n'}}]}},{startIndex:30,endIndex:31,paragraph:{elements:[{textRun:{content:'\n'}}]}}]}}]};
const manifest={projectId:12,sourceSha256:sha,targetRevision:rev,coverageAudited:true,existingUnits:[{fromPage:1,toPage:1,sourceUnitId:'old'}]};
const proposed={mode:'append',projectId:12,sourceUnitId:'fixture-2',sourceSha256:sha,fromPage:2,toPage:2,currentTargetRevision:rev};
function fixture(){
  const plan=planNativeDraftBatch({document:docBefore,projectId:12,manifest,proposed,tabId:'t.0',entries,notes});
  const phase1Result={revisionId:'phase-one-rev-12345',replies:plan.requests.map(()=>({}))};
  const noteId='kix.synthetic';
  phase1Result.replies[plan.privateNotePlan.replyOffset]={createFootnote:{footnoteId:noteId}};
  const phase2Result={revisionId:finalRev,replies:[{},{}]};
  const st=(type)=>({weightedFontFamily:{fontFamily:'Amiri'},fontSize:{magnitude:type==='heading'?18:14,unit:'PT'},bold:type==='heading'});
  const body=[{endIndex:1,sectionBreak:{}},{startIndex:1,endIndex:30,paragraph:{elements:[{textRun:{content:'Pre-existing fixture text.\n'}}]}}];
  let idx=30;
  for(const [i,e] of entries.entries()){
    const el=[];
    if(i===1){
      const pos=e.text.indexOf('footnote')+'footnote'.length;
      el.push({textRun:{content:e.text.slice(0,pos),textStyle:st(e.type)}});
      el.push({footnoteReference:{footnoteId:noteId}});
      el.push({textRun:{content:e.text.slice(pos)+'\n',textStyle:st(e.type)}});
    }else el.push({textRun:{content:e.text+'\n',textStyle:st(e.type)}});
    const group=i===2||i===3?'a':i===4||i===5?'b':null;
    const p={elements:el,paragraphStyle:{namedStyleType:e.type==='heading'?'HEADING_3':'NORMAL_TEXT'}};
    if(group)p.bullet={listId:group,nestingLevel:0};
    const end=idx+e.text.length+1+(i===1?1:0);
    body.push({startIndex:idx,endIndex:end,paragraph:p});idx=end;
  }
  body.push({startIndex:idx,endIndex:idx+1,paragraph:{elements:[{textRun:{content:'\n'}}]}}});
  const footnotes={[noteId]:{content:[{paragraph:{elements:[{textRun:{content:' '+notes[0].text+'\n',textStyle:{weightedFontFamily:{fontFamily:'Amiri'},fontSize:{magnitude:10,unit:'PT'}}}}]}}]}};
  const document={revisionId:finalRev,tabs:[{tabId:'t.0',body:{content:body},footnotes}]};
  return {document,tabId:'t.0',entries,notes,phase1Plan:plan,phase1Result,phase2Result};
}
test('one source-controlled native batch verifies while explicitly leaving semantic/release gates open',()=>{
  const r=inspectNativeDraftBatch(fixture());
  assert.equal(r.nativeStructureVerified,true);assert.equal(r.paragraphs,6);assert.equal(r.notes,1);
  assert.equal(r.sourceFidelity,'NOT_CHECKED');assert.equal(r.renderedPdf,'NOT_CHECKED');assert.equal(r.sourcePagesAccepted,0);
});
test('one-point inherited font is a fail-closed regression',()=>{
  const f=fixture();f.document.tabs[0].body.content[4].paragraph.elements[0].textRun.textStyle.fontSize.magnitude=1;
  assert.throws(()=>inspectNativeDraftBatch(f),/INHERITED_OR_INCORRECT_TEXT_STYLE/);
});
test('wrong source note or missing anchor cannot be counted as native QA',()=>{
  const f=fixture();f.document.tabs[0].footnotes['kix.synthetic'].content[0].paragraph.elements[0].textRun.content='Wrong note\n';
  assert.throws(()=>inspectNativeDraftBatch(f),/FOOTNOTE_TEXT_MISMATCH/);
  const g=fixture();g.document.tabs[0].body.content[3].paragraph.elements=g.document.tabs[0].body.content[3].paragraph.elements.filter(x=>!x.footnoteReference);
  assert.throws(()=>inspectNativeDraftBatch(g),/NOTE_ANCHOR_COUNT_MISMATCH|PARAGRAPH_TEXT_MISMATCH/);
});
test('stale target or changed list group cannot be accepted',()=>{
  const f=fixture();f.document.revisionId='external-edit-after-phase2';
  assert.throws(()=>inspectNativeDraftBatch(f),/UNCONFIRMED_FINAL_REVISION/);
  const g=fixture();g.document.tabs[0].body.content[5].paragraph.bullet.listId='mismatched';
  assert.throws(()=>inspectNativeDraftBatch(g),/LIST_GROUPING_MISMATCH/);
});
test('wrong note placement is rejected even with matching text and reference ID',()=>{
  const f=fixture(),p=f.document.tabs[0].body.content[3].paragraph;
  const first=p.elements[0].textRun.content;
  p.elements[0].textRun.content=first.slice(0,-1);
  p.elements[2].textRun.content=first.slice(-1)+p.elements[2].textRun.content;
  assert.throws(()=>inspectNativeDraftBatch(f),/NOTE_ANCHOR_POSITION_MISMATCH/);
});

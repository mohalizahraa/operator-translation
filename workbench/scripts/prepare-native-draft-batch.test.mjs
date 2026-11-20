import test from 'node:test';
import assert from 'node:assert/strict';
import {planNativeDraftBatch,planPopulateNativeNotes} from './prepare-native-draft-batch.mjs';
const sha='a'.repeat(64), revision='revision-verifiable-123456789';
const unit={mode:'append',projectId:12,sourceUnitId:'p115-120',fromPage:115,toPage:120,sourceSha256:sha,currentTargetRevision:revision};
const manifest={projectId:12,sourceSha256:sha,targetRevision:revision,coverageAudited:true,existingUnits:[{sourceUnitId:'prior',fromPage:1,toPage:114}]};
const snap=()=>({documentId:'private-doc',revisionId:revision,tabs:[{tabProperties:{tabId:'t.0'},documentTab:{body:{content:[{startIndex:0,endIndex:20,paragraph:{elements:[{textRun:{content:'Old text\n'}}]}},{startIndex:20,endIndex:21,paragraph:{elements:[{textRun:{content:'\n'}}]}}]}}}]});
const specimen=()=>({document:snap(),projectId:12,manifest:structuredClone(manifest),proposed:structuredClone(unit),tabId:'t.0',entries:[{type:'heading',text:'New chapter'},{type:'body',text:'A very good footnote anchor in words.'},{type:'bullet',text:'One ethical practice'},{type:'bullet',text:'Another ethical practice'},{type:'numbered',text:'Question for readers'}],notes:[{entryIndex:1,anchorText:'anchor',text:'Primary source attribution and edition.'}]});
test('batch plans one insert, native headings, grouped lists, and notes without inherited 1pt',()=>{
  const p=planNativeDraftBatch(specimen());
  assert.equal(p.privateReceipt.entries,5);
  assert.equal(p.privateReceipt.notes,1);
  assert.equal(p.writeControl.requiredRevisionId,revision);
  assert.equal(p.requests.filter(r=>r.insertText&&r.insertText.endOfSegmentLocation?.tabId==='t.0').length,1);
  assert.equal(p.requests.filter(r=>r.createParagraphBullets).length,2);
  const normalizer=p.requests.find(r=>r.updateTextStyle?.range.startIndex===20&&r.updateTextStyle?.textStyle.fontSize.magnitude===14);
  assert.ok(normalizer);
  assert.equal(normalizer.updateTextStyle.textStyle.weightedFontFamily.fontFamily,'Amiri');
  const heading=p.requests.find(r=>r.updateTextStyle?.textStyle?.fontSize?.magnitude===18);
  assert.equal(heading.updateTextStyle.textStyle.bold,true);
  assert.equal(p.requests.at(-1).createFootnote.location.index,20+'New chapter\n'.length+'A very good footnote '.length+'anchor'.length);
  assert.equal(p.privateReceipt.sourceAcceptance,'OPEN');
});
test('native API phases produce private note IDs, no note content in receipts',()=>{
  const p=planNativeDraftBatch(specimen());
  const fake={revisionId:'new-native-revision-123',replies:p.requests.map(()=>({}))};
  fake.replies[p.privateNotePlan.replyOffset]={createFootnote:{footnoteId:'kix.private-1'}};
  const n=planPopulateNativeNotes({firstPhaseResult:fake,privateNotePlan:p.privateNotePlan,tabId:'t.0'});
  assert.equal(n.requests.length,2);
  assert.equal(n.requests[0].insertText.endOfSegmentLocation.segmentId,'kix.private-1');
  assert.equal(n.requests[1].updateTextStyle.textStyle.fontSize.magnitude,10);
  assert.equal(n.requests[1].updateTextStyle.textStyle.weightedFontFamily.fontFamily,'Amiri');
  assert.equal(n.writeControl.requiredRevisionId,'new-native-revision-123');
  assert.equal(JSON.stringify(n.privateReceipt).includes('Primary source'),false);
});
test('source overlap cannot append even with matching live document revision',()=>{
  const x=specimen();x.proposed.fromPage=114;
  assert.throws(()=>planNativeDraftBatch(x),/OVERLAPPING_SOURCE_PHYSICAL_PAGES/);
});
test('stale revision fails before draft write',()=>{
  const x=specimen();x.document.revisionId='new-revision-different';
  assert.throws(()=>planNativeDraftBatch(x),/STALE_MANIFEST_TARGET_REVISION/);
});
test('missing hash and unaudited coverage cannot be bypassed',()=>{
  const x=specimen();x.proposed.sourceSha256='';
  assert.throws(()=>planNativeDraftBatch(x),/UNVERIFIED_CANONICAL_SOURCE_HASH/);
  const y=specimen();y.manifest.coverageAudited=false;
  assert.throws(()=>planNativeDraftBatch(y),/CURRENT_TARGET_COVERAGE_NOT_AUDITED/);
});
test('unknown native tab and non-blank destination stop safely',()=>{
  const x=specimen();x.tabId='t.other';
  assert.throws(()=>planNativeDraftBatch(x),/TARGET_TAB_NOT_PRESENT/);
  const y=specimen();y.document.tabs[0].documentTab.body.content.at(-1).paragraph.elements[0].textRun.content='occupied\n';
  assert.throws(()=>planNativeDraftBatch(y),/TARGET_NOT_AT_VERIFIED_EMPTY_END/);
});
test('must not guess note location from missing or ambiguous quote',()=>{
  const x=specimen();x.notes[0].anchorText='missing';
  assert.throws(()=>planNativeDraftBatch(x),/AMBIGUOUS_OR_ABSENT_NOTE_ANCHOR/);
  const y=specimen();y.entries[1].text='anchor occurs twice, and anchor is ambiguous.';
  assert.throws(()=>planNativeDraftBatch(y),/AMBIGUOUS_OR_ABSENT_NOTE_ANCHOR/);
});
test('note mappings cannot be accepted without returned IDs',()=>{
  const p=planNativeDraftBatch(specimen());
  assert.throws(()=>planPopulateNativeNotes({firstPhaseResult:{revisionId:'long-revision-12345',replies:[]},privateNotePlan:p.privateNotePlan,tabId:'t.0'}),/NOTE_ID_MAPPING_FAILED/);
});
test('UTF-16 offsets preserve astral characters and cross-note descending order',()=>{
  const x=specimen();x.entries=[{type:'body',text:'Emoji 😀 appears before quote alpha.'},{type:'body',text:'Second 😀 note beta comes later.'}];
  x.notes=[{entryIndex:0,anchorText:'alpha',text:'Source A'},{entryIndex:1,anchorText:'beta',text:'Source B'}];
  const p=planNativeDraftBatch(x);
  const noteReq=p.requests.filter(z=>z.createFootnote);
  const expectedSecond=20+x.entries[0].text.length+1+x.entries[1].text.indexOf('beta')+4;
  assert.equal(noteReq[0].createFootnote.location.index,expectedSecond);
  assert.ok(noteReq[0].createFootnote.location.index>noteReq[1].createFootnote.location.index);
  assert.equal(p.privateNotePlan.notes[0].text,'Source B');
});

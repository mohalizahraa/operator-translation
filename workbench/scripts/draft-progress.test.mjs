import test from 'node:test';
import assert from 'node:assert/strict';
import {extractDraftProgress,readDraftProgress,KNOWN_TEXT_EDITION_TOTALS} from '../functions/_draft_progress.js';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {onRequestGet} from '../functions/api/projects/[id]/draft-progress.js';

const docId='1-XtipDYDsowyivR7NfnYxXPbGtRN9M5IZ0OGt21xZxk';
const target='https://docs.google.com/document/d/'+docId+'/edit';
const witness=`Working manuscript
Source text-edition page 1 — Title
Source text-edition page 2 — Publisher
Source text-edition pages 1–110 are a draft, NOT verified.
Source text-edition page 7 — Introduction
Source text-edition page 10 — Outline
Source text-edition page 110 — Example passage
Source text-edition page 110 — Duplicate marker
[[NEXT_BATCH]]
`;
test('read-only draft scanner counts unique exact headings, never notes or physical pages',()=>{
 const r=extractDraftProgress(witness);
 assert.deepEqual(r,{last_labeled_page:110,labeled_sections:5,first_labeled_page:1,
   basis:'source_text_edition',certified_pdf_pages:false});
 assert.equal(extractDraftProgress('Draft exists, no headings').last_labeled_page,null);
});
test('extracts the actual public text export, not redirect HTML',async()=>{
 const r=await readDraftProgress(docId,async url=>{
   assert.equal(url,'https://docs.google.com/document/d/'+docId+'/export?format=txt');
   return new Response(witness,{status:200,headers:{'content-type':'text/plain; charset=utf-8'}});
 });
 assert.equal(r.last_labeled_page,110);
});
test('rejects non-public, HTML, and oversized exports without inventing progress',async()=>{
 const mock=(body,status=200,type='text/plain')=>async()=>new Response(body,{status,headers:{'content-type':type}});
 await assert.rejects(readDraftProgress(docId,mock('not allowed',403)),/inaccessible/);
 await assert.rejects(readDraftProgress(docId,mock('<html>Sign in</html>',200,'text/html')),/HTML/);
});
function context({id='88',project={id:88,status:'in_progress',google_doc_url:target,translated_pages:0,pages:559}}={}){
 const calls=[];
 return {ctx:{params:{id},env:{DB:{prepare(sql){
   calls.push(sql);
   assert.ok(sql.trim().startsWith('SELECT'),'draft GET must not mutate D1');
   return {bind(value){assert.equal(value,88);return {first:async()=>project};}};
 }}}},calls};
}
test('project endpoint returns draft and verified fields independently; no D1 writes',async()=>{
 const old=globalThis.fetch;
 globalThis.fetch=async()=>new Response(witness,{headers:{'content-type':'text/plain'}});
 try{
   const {ctx,calls}=context();
   const result=await onRequestGet(ctx);
   assert.equal(result.status,200);
   const json=await result.json();
   assert.equal(json.project_id,88);
   assert.equal(json.google_doc_id,docId);
   assert.equal(json.last_labeled_page,110);
   assert.equal(json.draft_text_edition_total_pages,560);
   assert.equal(json.verified_physical_pdf_pages,0);
   assert.equal(json.verified_physical_pdf_total,559);
   assert.equal(json.certified_pdf_pages,false);
   assert.equal(calls.length,1);
 }finally{globalThis.fetch=old;}
});
test('wrong ID, missing project and absent doc never fetch arbitrary book',async()=>{
 let r=await onRequestGet({params:{id:'172abc'},env:{DB:{prepare(){throw Error('unexpected')}}}});
 assert.equal(r.status,400);
 r=await onRequestGet(context({project:null}).ctx);assert.equal(r.status,404);
 r=await onRequestGet(context({project:{id:88,google_doc_url:null}}).ctx);assert.equal(r.status,409);
});

test('live bar uses known text-edition denominator, not the different physical PDF denominator',async()=>{
 const source=await fs.readFile(new URL('../public/model-core.js',import.meta.url),'utf8');
 const scope={};vm.runInNewContext(source,scope);
 const display=scope.WorkbenchCore.translationProgressDisplay;
 const project={id:88,status:'in_progress',google_doc_url:target,page_count_verified:true,translated_pages:0,pages:559};
 const snapshot={last_labeled_page:112,labeled_sections:112,draft_text_edition_total_pages:KNOWN_TEXT_EDITION_TOTALS[88]};
 const result=display(project,snapshot);
 assert.equal(result.draftPages,112);
 assert.equal(result.draftTotal,560);
 assert.equal(result.draftPercent,20);
 assert.equal(result.verifiedPages,0);
 assert.equal(result.verifiedTotal,559);
 assert.equal(result.verifiedPercent,0);
 assert.equal(display({...project,translated_pages:28},snapshot).verifiedPercent,5);
 assert.equal(display(project,{last_labeled_page:112,draft_text_edition_total_pages:null}).draftPercent,null,
   'unknown text-edition denominator must not borrow the physical PDF denominator');
 assert.equal(display(project,{last_labeled_page:561,draft_text_edition_total_pages:560}).draftPercent,null,
   'invalid out-of-range text edition marker cannot produce a misleading full bar');
 assert.equal(display({...project,status:'review'},snapshot).draftPercent,null);
});

test('Compact progress cards: one text label plus one filled track, no explanatory rows',async()=>{
 const [coreSource,appSource,css]=await Promise.all([
  fs.readFile(new URL('../public/model-core.js',import.meta.url),'utf8'),
  fs.readFile(new URL('../public/app.js',import.meta.url),'utf8'),
  fs.readFile(new URL('../public/styles.css',import.meta.url),'utf8')
 ]);
 const scope={};vm.runInNewContext(coreSource,scope);
 const start=appSource.indexOf('function combinedProgressTrack(p, trackClass) {');
 const end=appSource.indexOf('function assignedProjectMarkup(p) {',start);
 assert.ok(start>=0 && end>start);
 const project={id:88,status:'in_progress',google_doc_url:target,page_count_verified:true,translated_pages:0,pages:559};
 const context={WorkbenchCore:scope.WorkbenchCore,state:{draftProgress:{88:{
  last_labeled_page:112,labeled_sections:112,draft_text_edition_total_pages:560}}},
  escapeHtml:(x)=>String(x),translationDisplayPages:(p)=>p.translated_pages,
  isTranslated:(p)=>['review','completed','published'].includes(p.status),
  STATUS:{review:'Needs Review',completed:'Completed',published:'Published'}};
 const markup=vm.runInNewContext(appSource.slice(start,end)+
  '\n({combinedProgressTrack,compactProgressLabel,compactProgressMarkup,translationProgressMarkup})',context);
 const cases=[
  {project,visible:'Draft · 112/560 · 20%',fill:20,certified:0},
  {project:{...project,id:118,status:'review',translated_pages:0,pages:117},
   visible:'Translated · 100%',fill:100,certified:0},
  {project:{...project,id:3,status:'completed',translated_pages:132,pages:132},
   visible:'Verified · 132/132 pages',fill:100,certified:100},
  {project:{...project,id:43,status:'published',translated_pages:0,pages:382},
   visible:'Translated · 100%',fill:100,certified:0},
  {project:{...project,id:40,status:'not_started',google_doc_url:null,translated_pages:0,pages:289},
   visible:'Verified · 0/289 pages',fill:0,certified:0}
 ];
 for(const item of cases){
  const html=markup.translationProgressMarkup(item.project,true,true);
  const live=markup.combinedProgressTrack(item.project,'live-translation-track');
  assert.ok(html.includes(item.visible),'expected '+item.visible);
  assert.match(html,new RegExp('class="draft-fill" style="width:'+item.fill+'%"'));
  assert.match(html,new RegExp('class="verified-fill" style="width:'+item.certified+'%"'));
  assert.match(live,new RegExp('class="draft-fill" style="width:'+item.fill+'%"'));
  assert.equal((html.match(/data-progress-summary-for=/g)||[]).length,1,'exactly one label');
  assert.equal((html.match(/data-progress-track-for=/g)||[]).length,1,'exactly one track');
  assert.doesNotMatch(html,/class="book-draft-progress"|class="translation-stage"/);
  assert.ok(html.length<1000,'compact card markup should not grow without a design review');
 }
 assert.ok(css.includes('.combined-progress-track .draft-fill'));
 const liveStart=appSource.indexOf('function renderTranslationLive() {');
 const liveEnd=appSource.indexOf('function render',liveStart+1);
 const liveBody=appSource.slice(liveStart,liveEnd<0?undefined:liveEnd);
 assert.match(liveBody,/compactProgressMarkup\(p,'strong'\)/);
 assert.doesNotMatch(liveBody,/translationStageMarkup\(p\)|draftProgressMarkup\(p\)/);
 assert.match(appSource,/el\.outerHTML=compactProgressMarkup\(current,/);
 assert.match(appSource,/el\.outerHTML=combinedProgressTrack\(current/);
});

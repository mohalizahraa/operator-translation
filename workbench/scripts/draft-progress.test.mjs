import test from 'node:test';
import assert from 'node:assert/strict';
import {extractDraftProgress,readDraftProgress} from '../functions/_draft_progress.js';
import {onRequestGet} from '../functions/api/projects/[id]/draft-progress.js';

const docId='1-XtipDYDsowyivR7NfnYxXPbGtRN9M5IZ0OGt21xZxk';
const target='https://docs.google.com/document/d/'+docId+'/edit';
const witness=\`Working manuscript
Source text-edition page 1 — Title
Source text-edition page 2 — Publisher
Source text-edition pages 1–110 are a draft, NOT verified.
Source text-edition page 7 — Introduction
Source text-edition page 10 — Outline
Source text-edition page 110 — Example passage
Source text-edition page 110 — Duplicate marker
[[NEXT_BATCH]]
\`;
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

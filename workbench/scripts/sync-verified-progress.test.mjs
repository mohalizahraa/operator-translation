import test from 'node:test';
import assert from 'node:assert/strict';
import {synchronizeVerifiedProgress} from './sync-verified-progress.mjs';

const digest='a'.repeat(64),source='b'.repeat(64);
const payload={sync_mode:'evidence_bound_v1',project_id:4,project_title:'Exact Book',assignee:'Mohammed',
 target_document_id:'doc_4',target_permission:{file_id:'doc_4',mime_type:'application/vnd.google-apps.document',anyone_role:'writer'},
 source_page_basis:'physical_pdf',expected_previous_pages:3,from_page:4,to_page:5,total_pages:10,
 source_pdf_sha256:source,google_doc_revision:'public-export-sha256:'+digest,qa_receipt_id:9};
function fixture({stale=false,fail=false,drop=false}={}){
 let project={id:4,title_en:'Exact Book',assignee:'Mohammed',google_doc_url:'https://docs.google.com/document/d/doc_4/edit',
  pages:10,translated_pages:3,status:'in_progress'},checkpoint=null,posts=0;
 const calls=[];
 const fetchImpl=async(url,init={})=>{
  const path=new URL(url).pathname,method=init.method||'GET';calls.push(method+' '+path);
  if(path==='/api/projects/4'&&method==='GET')return new Response(JSON.stringify({project:{...project}}));
  if(path==='/api/projects/4/integrity'&&method==='GET')return new Response(JSON.stringify({project_id:4,checkpoint}));
  if(path==='/api/projects/4/progress-sync'&&method==='GET')return new Response(JSON.stringify({project:{...project},export_sha256:stale?'c'.repeat(64):digest}));
  if(path==='/api/projects/4/progress-sync'&&method==='POST'){
   posts++;
   if(fail)return new Response(JSON.stringify({error:'server write failed'}),{status:503});
   project={...project,translated_pages:5};
   checkpoint={from_page:4,to_page:5,source_total_pages:10,source_page_basis:'physical_pdf',
    source_pdf_sha256:source,google_doc_revision:'public-export-sha256:'+digest};
   if(drop)throw new Error('response lost after commit');
   return new Response(JSON.stringify({ok:true}));
  }
  throw new Error('Unexpected request '+method+' '+path);
 };
 return {fetchImpl,calls,get posts(){return posts}};
}
test('wrong book ID fails before a write',async()=>{
 const f=fixture();
 await assert.rejects(synchronizeVerifiedProgress({projectId:172,syncPayload:payload,fetchImpl:f.fetchImpl}),/Exact project identity/);
 assert.equal(f.posts,0);
});
test('stale document revision fails before write',async()=>{
 const f=fixture({stale:true});
 await assert.rejects(synchronizeVerifiedProgress({projectId:4,syncPayload:payload,fetchImpl:f.fetchImpl}),/revision is stale/);
 assert.equal(f.posts,0);
});
test('ambiguous response after commit is resolved by exact live readback',async()=>{
 const f=fixture({drop:true});
 const result=await synchronizeVerifiedProgress({projectId:4,syncPayload:payload,fetchImpl:f.fetchImpl});
 assert.equal(result.synchronized,true);assert.equal(f.posts,1);
});
test('transient failure gets one retry only after unchanged live checkpoint readback',async()=>{
 const f=fixture({fail:true});
 await assert.rejects(synchronizeVerifiedProgress({projectId:4,syncPayload:payload,fetchImpl:f.fetchImpl}),/SYNC_OPEN/);
 assert.equal(f.posts,2);
});

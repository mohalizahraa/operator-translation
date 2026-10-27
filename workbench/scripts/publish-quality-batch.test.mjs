import test from 'node:test';
import assert from 'node:assert/strict';
import {publishQualityVerifiedBatch} from './publish-quality-batch.mjs';

const digest='a'.repeat(64),source='b'.repeat(64),docId='doc_123';
const permission={file_id:docId,mime_type:'application/vnd.google-apps.document',anyone_role:'writer'};
const driveMetadata={id:docId,mime_type:'application/vnd.google-apps.document',
 permissions:[{type:'anyone',role:'writer',allowFileDiscovery:false}]};
const report={evidence_schema_version:2,project_id:12,project_title:'Test Book',assignee:'Mohammed',
 target_document_id:docId,target_permission:permission,source_page_basis:'physical_pdf',
 expected_previous_pages:2,from_page:3,to_page:4,source_total_pages:10,source_hash:source,
 target_revision:'public-export-sha256:'+digest,
 units:[{id:'p3',source_page:3,status:'VERIFIED',target_anchor:'page-3',
   source_evidence_ref:'source-pdf-sha256:'+source+'#page=3',target_evidence_ref:'google-doc:'+docId+'#page-3'},
  {id:'p4',source_page:4,status:'VERIFIED',target_anchor:'page-4',
   source_evidence_ref:'source-pdf-sha256:'+source+'#page=4',target_evidence_ref:'google-doc:'+docId+'#page-4'}],
 checks:Object.fromEntries(['independent_critic','ambiguity_review','terminology_review','batch_formatting']
  .map(k=>[k,{status:'PASS',target_revision:'public-export-sha256:'+digest,evidence_ref:k+'#review'}]))};
const options={projectId:12,pages:4,totalPages:10,actor:'Mohammed',evidence:report,driveMetadata};
const json=(x,status=200)=>new Response(JSON.stringify(x),{status});
function fixture({failSync=false,dropAfterCommit=false,stale=false,failQa=false,dropQa=false,current=2}={}){
 const calls=[],project={id:12,title_en:'Test Book',assignee:'Mohammed',
  google_doc_url:'https://docs.google.com/document/d/'+docId+'/edit',pages:10,page_count_verified:true,
  translated_pages:current,status:'in_progress'};
 let checkpoint=null,receipt=null,qaPosts=0,syncPosts=0;
 const integrity=()=>({project_id:12,checkpoint});
 const receiptList=()=>receipt?{project_id:12,receipts:[{id:receipt,from_page:3,to_page:4,
  source_pdf_sha256:source,google_doc_revision:'public-export-sha256:'+digest}]}:{project_id:12,receipts:[]};
 const fetchImpl=async(url,init={})=>{
  const path=new URL(url).pathname,method=init.method||'GET';calls.push(method+' '+path);
  if(path==='/api/projects/12'&&method==='GET')return json({project:{...project}});
  if(path==='/api/projects/12/integrity'&&method==='GET')return json(integrity());
  if(path==='/api/projects/12/progress-sync'&&method==='GET')
   return json({project:{...project},marker_found:false,export_sha256:stale?'c'.repeat(64):digest});
  if(path==='/api/projects/12/quality'&&method==='POST'){
   qaPosts++;
   if(failQa)return json({error:'temporary write failure'},503);
   receipt=7;if(dropQa)throw new Error('QA response lost after commit');
   return json({receipt_id:7,preflight_ready:true},201);
  }
  if(path==='/api/projects/12/quality'&&method==='GET')return json(receiptList());
  if(path==='/api/projects/12/progress-sync'&&method==='POST'){
   syncPosts++;
   if(failSync)return json({error:'temporary sync failure'},503);
   if(!stale){
    project.translated_pages=4;project.status='in_progress';
    checkpoint={from_page:3,to_page:4,source_total_pages:10,source_page_basis:'physical_pdf',
      source_pdf_sha256:source,google_doc_revision:'public-export-sha256:'+digest};
   }
   if(dropAfterCommit&&syncPosts===1)throw new Error('response lost after commit');
   return json({project:{...project}});
  }
  throw new Error('Unexpected request '+method+' '+path);
 };
 return {fetchImpl,calls,get qaPosts(){return qaPosts},get syncPosts(){return syncPosts}};
}

test('syncs exact batch and confirms live checkpoint and receipt readback',async()=>{
 const f=fixture();
 const result=await publishQualityVerifiedBatch({...options,fetchImpl:f.fetchImpl});
 assert.equal(result.synchronized,true);assert.equal(result.translatedPages,4);
 assert.equal(result.qaReceiptId,7);assert.equal(f.syncPosts,1);
});
test('wrong-book report is rejected before either write',async()=>{
 const f=fixture(),wrong={...report,project_id:172};
 await assert.rejects(publishQualityVerifiedBatch({...options,evidence:wrong,fetchImpl:f.fetchImpl}),/exact live project/);
 assert.equal(f.qaPosts,0);assert.equal(f.syncPosts,0);
});
test('missing Anyone Editor permission blocks all writes',async()=>{
 const f=fixture();
 await assert.rejects(publishQualityVerifiedBatch({...options,driveMetadata:{...driveMetadata,permissions:[{type:'anyone',role:'reader'}]},fetchImpl:f.fetchImpl}),/metadata must confirm/);
 assert.equal(f.qaPosts,0);assert.equal(f.syncPosts,0);
});
test('stale checkpoint blocks before QA and checkpoint writes',async()=>{
 const f=fixture({current:3});
 await assert.rejects(publishQualityVerifiedBatch({...options,fetchImpl:f.fetchImpl}),/next physical-page range/);
 assert.equal(f.qaPosts,0);assert.equal(f.syncPosts,0);
});
test('lost QA response is reconciled from the immutable receipt before sync',async()=>{
 const f=fixture({dropQa:true});
 const result=await publishQualityVerifiedBatch({...options,fetchImpl:f.fetchImpl});
 assert.equal(result.synchronized,true);assert.equal(result.qaReceiptId,7);assert.equal(f.qaPosts,1);
});
test('stale live Doc revision blocks before QA and checkpoint writes',async()=>{
 const f=fixture({stale:true});
 await assert.rejects(publishQualityVerifiedBatch({...options,fetchImpl:f.fetchImpl}),/exact live project|current Doc revision/);
 assert.equal(f.qaPosts,0);assert.equal(f.syncPosts,0);
});
test('failed QA write never posts progress',async()=>{
 const f=fixture({failQa:true});
 await assert.rejects(publishQualityVerifiedBatch({...options,fetchImpl:f.fetchImpl}),/QA_SYNC_OPEN/);
 assert.equal(f.syncPosts,0);assert.equal(f.qaPosts,2);
});
test('failed synchronization is retried once and remains open when no checkpoint persists',async()=>{
 const f=fixture({failSync:true});
 await assert.rejects(publishQualityVerifiedBatch({...options,fetchImpl:f.fetchImpl}),/SYNC_OPEN/);
 assert.equal(f.syncPosts,2);
});
test('lost response after committed write is recovered by exact live readback',async()=>{
 const f=fixture({dropAfterCommit:true});
 const result=await publishQualityVerifiedBatch({...options,fetchImpl:f.fetchImpl});
 assert.equal(result.synchronized,true);assert.equal(f.syncPosts,1);
});

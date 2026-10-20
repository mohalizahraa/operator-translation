import test from 'node:test';
import assert from 'node:assert/strict';
import {publishQualityVerifiedBatch} from './publish-quality-batch.mjs';

const digest='a'.repeat(64),source='b'.repeat(64);
const report={from_page:3,to_page:4,source_total_pages:10,source_hash:source,
 target_revision:'public-export-sha256:'+digest,
 units:[{id:'p3',source_page:3,status:'VERIFIED',target_anchor:'doc#3'},
        {id:'p4',source_page:4,status:'VERIFIED',target_anchor:'doc#4'}],
 checks:Object.fromEntries(['independent_critic','ambiguity_review','terminology_review','batch_formatting']
  .map(k=>[k,{status:'PASS',target_revision:'public-export-sha256:'+digest,evidence_ref:k+'#1'}]))};
const marker={project:{id:12,pages:10,translated_pages:2},marker_found:true,
 marker_pages:4,marker_total:10,export_sha256:digest};
const options={projectId:12,pages:4,totalPages:10,actor:'Mohammed',evidence:report};
const json=(x,status=200)=>new Response(JSON.stringify(x),{status});

test('posts QA before checkpoint and requires matching D1 readback',async()=>{
 const calls=[];
 const fetchImpl=async(url,init)=>{
  const key=init.method+' '+new URL(url).pathname;
  calls.push(key);
  if(key==='GET /api/projects/12/progress-sync')return json(marker);
  if(key==='POST /api/projects/12/quality'){
   assert.deepEqual(JSON.parse(init.body),report);
   return json({receipt_id:7,preflight_ready:true},201);
  }
  if(key==='POST /api/projects/12/progress-sync')return json({marker_found:true,marker_pages:4});
  if(key==='GET /api/projects/12')return json({project:{id:12,pages:10,translated_pages:4,status:'in_progress'}});
  throw new Error('Unexpected request '+key);
 };
 const r=await publishQualityVerifiedBatch({...options,fetchImpl});
 assert.equal(r.qaReceiptId,7);
 assert.equal(r.synchronized,true);
 assert.deepEqual(calls,['GET /api/projects/12/progress-sync','POST /api/projects/12/quality',
  'POST /api/projects/12/progress-sync','GET /api/projects/12']);
});

test('stale marker or revision blocks every write',async()=>{
 for(const change of [{marker_pages:5},{export_sha256:'c'.repeat(64)}]){
  const calls=[];
  const fetchImpl=async(url,init)=>{calls.push(init.method);return json({...marker,...change});};
  await assert.rejects(publishQualityVerifiedBatch({...options,fetchImpl}),/Marker is absent|QA report must match/);
  assert.deepEqual(calls,['GET']);
 }
});

test('failed quality receipt prevents checkpoint mutation',async()=>{
 const calls=[];
 const fetchImpl=async(url,init)=>{
  calls.push(init.method);
  return init.method==='GET'?json(marker):json({error:'preflight failed'},409);
 };
 await assert.rejects(publishQualityVerifiedBatch({...options,fetchImpl}),/QA receipt failed/);
 assert.deepEqual(calls,['GET','POST']);
});

test('failed D1 readback cannot claim success',async()=>{
 const fetchImpl=async(url,init)=>{
  const path=new URL(url).pathname;
  if(path.endsWith('/quality'))return json({receipt_id:4,preflight_ready:true},201);
  if(path.endsWith('/progress-sync')&&init.method==='GET')return json(marker);
  if(path.endsWith('/progress-sync'))return json({marker_found:true,marker_pages:4});
  return json({project:{id:12,pages:10,translated_pages:3,status:'in_progress'}});
 };
 await assert.rejects(publishQualityVerifiedBatch({...options,fetchImpl}),/SYNC_OPEN/);
});

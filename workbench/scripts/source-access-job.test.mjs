import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deriveRequest,safeIssueNumber,stage,report} from './source-access-job.mjs';

const repo='mohalizahraa/operator-translation';
const event={action:'opened',issue:{number:36,title:'Workbench PDF source: #88',user:{login:'mohalizahraa'}}};
const base={GITHUB_REPOSITORY:repo,GITHUB_REPOSITORY_OWNER:'mohalizahraa',GITHUB_EVENT_NAME:'issues'};
test('issue owner and exact book ID are required',()=>{
  assert.deepEqual(deriveRequest({env:base,event,requestFile:'88\n'}),{projectId:88,issueNumber:'36'});
  assert.throws(()=>deriveRequest({env:base,event:{...event,issue:{...event.issue,user:{login:'stranger'}}},requestFile:'88\n'}),/owner/);
  assert.throws(()=>deriveRequest({env:base,event:{...event,issue:{...event.issue,title:'Workbench PDF source: #88/../5'}},requestFile:'88\n'}),/exact project ID/);
  assert.throws(()=>deriveRequest({env:{...base,GITHUB_REPOSITORY:'unknown/x'},event,requestFile:'88\n'}),/Unexpected repository/);
});
test('push and manual requests cannot substitute a fuzzy title',()=>{
  assert.deepEqual(deriveRequest({env:{...base,GITHUB_EVENT_NAME:'push'},event:{},requestFile:'88\n# Evidence issue: 33\n'}),{projectId:88,issueNumber:'33'});
  assert.deepEqual(deriveRequest({env:{...base,GITHUB_EVENT_NAME:'workflow_dispatch',INPUT_PROJECT_ID:'88',INPUT_EVIDENCE_ISSUE:'33'},event:{},requestFile:''}),{projectId:88,issueNumber:'33'});
  assert.equal(safeIssueNumber('33'),33);
  assert.equal(safeIssueNumber('33/other'),null);
});
test('stage produces exact PDF and an Actions artifact path only on source validation',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'workbench-source-job-'));
  try{
    const ev=join(dir,'event.json'),out=join(dir,'output.txt');
    await writeFile(ev,JSON.stringify(event));
    await writeFile(out,'');
    const pdf=Buffer.from('%PDF-1.4\n'+'0'.repeat(150)+'\n%%EOF\n');
    const env={...base,GITHUB_EVENT_PATH:ev,RUNNER_TEMP:dir,GITHUB_OUTPUT:out};
    const receipt=await stage({env,fetchImpl:async()=>new Response(pdf,{headers:{'content-type':'application/pdf','content-length':String(pdf.length)}})});
    assert.equal(receipt.projectId,88);
    assert.deepEqual(await readFile(join(dir,'workbench-source.pdf')),pdf);
    assert.match(await readFile(out,'utf8'),/project_id=88\nsha256=[a-f0-9]{64}\nbytes=/);
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('report posts only verification metadata to exact private issue',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'workbench-source-report-'));
  try{
    const ev=join(dir,'event.json');
    await writeFile(ev,JSON.stringify(event));
    const env={...base,GITHUB_EVENT_PATH:ev,GITHUB_TOKEN:'test-token',GITHUB_RUN_ID:'12345',GITHUB_SHA:'abc',VERIFY_OUTCOME:'success',FETCH_OUTCOME:'success',UPLOAD_OUTCOME:'success',FETCH_BYTES:'200',FETCH_SHA256:'a'.repeat(64)};
    let url,opts;
    const result=await report({env,fetchImpl:async(u,o)=>{url=u;opts=o;return new Response('{}',{status:201});}});
    assert.equal(result.success,true);
    assert.equal(url,'https://api.github.com/repos/'+repo+'/issues/36/comments');
    assert.match(JSON.parse(opts.body).body,/ARTIFACT_UPLOADED/);
    assert.doesNotMatch(JSON.parse(opts.body).body,/test-token/);
  } finally {await rm(dir,{recursive:true,force:true});}
});

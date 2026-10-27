import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,stat,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {parsePageRequest,processSourcePages} from './source-pages-job.mjs';

const repo='mohalizahraa/operator-translation';
const issue={action:'opened',issue:{number:39,title:'Workbench PDF pages: #88 physical 153-154',user:{login:'mohalizahraa'}}};
const base={GITHUB_REPOSITORY:repo,GITHUB_REPOSITORY_OWNER:'mohalizahraa',GITHUB_EVENT_NAME:'issues'};
test('requires owner-authored, exact project and <=4 bounded physical PDF pages',()=>{
 assert.deepEqual(parsePageRequest(base,issue),{projectId:88,from:153,to:154,issue:39});
 assert.throws(()=>parsePageRequest(base,{...issue,issue:{...issue.issue,user:{login:'outsider'}}}),/owner/);
 assert.throws(()=>parsePageRequest(base,{...issue,issue:{...issue.issue,title:'Workbench PDF pages: #88 physical 153-160'}}),/at most four/);
 assert.throws(()=>parsePageRequest(base,{...issue,issue:{...issue.issue,title:'Workbench PDF pages: #88/../5 physical 153-154'}}),/exact/);
});
const pdf=Buffer.from('%PDF-1.4\n'+'0'.repeat(150)+'\n%%EOF\n');
async function withContext(fn){
 const dir=await mkdtemp(join(tmpdir(),'workbench-pages-test-'));
 try{
  const event=join(dir,'event.json');await writeFile(event,JSON.stringify(issue));
  const env={...base,GITHUB_EVENT_PATH:event,GITHUB_TOKEN:'dummy-token',GITHUB_RUN_ID:'1234',RUNNER_TEMP:dir};
  return await fn(env,dir);
 } finally { await rm(dir,{recursive:true,force:true}); }
}
test('publishes bounded PDFKit witness with source identity and destroys temporary PDF',async()=>{
 await withContext(async (env,dir)=>{
  const posts=[];
  const r=await processSourcePages({env,fetchImpl:async()=>new Response(pdf,{headers:{'content-type':'application/pdf','content-length':String(pdf.length)}}),
    extractImpl:async(_src,_from,_to,out)=>writeFile(out,JSON.stringify({physical_page_count:559,pages:[{physical_page:153,text:'ا'.repeat(200)},{physical_page:154,text:'ب'.repeat(200)}]})),
    postFetch:async(url,options)=>{posts.push({url,body:JSON.parse(options.body).body});return new Response('{}',{status:201});}
  });
  assert.equal(r.projectId,88);
  assert.equal(posts.length,1);
  assert.match(posts[0].body,/PDFKit \*\*TEXT-LAYER WITNESS\*\*/);
  assert.match(posts[0].body,/Physical PDF page 153/);
  assert.match(posts[0].body,/PDF SHA-256: [a-f0-9]{64}/);
  assert.doesNotMatch(posts[0].body,/dummy-token/);
  assert.match(posts[0].url,/issues\/39\/comments$/);
  await assert.rejects(stat(join(dir,'workbench-source-pages.pdf')),{code:'ENOENT'});
  await assert.rejects(stat(join(dir,'workbench-source-pages.json')),{code:'ENOENT'});
 });
});
test('blank text layer is reported OPEN and does not retain PDF',async()=>{
 await withContext(async(env,dir)=>{
  const posts=[];
  await assert.rejects(processSourcePages({env,fetchImpl:async()=>new Response(pdf,{headers:{'content-type':'application/pdf'}}),
    extractImpl:async(_s,_f,_l,out)=>writeFile(out,JSON.stringify({physical_page_count:559,pages:[{physical_page:153,text:''},{physical_page:154,text:'word'.repeat(20)}]})),
    postFetch:async(_u,o)=>{posts.push(JSON.parse(o.body).body);return new Response('{}',{status:201});}
  }),/usable text layer/);
  assert.equal(posts.length,1);
  assert.match(posts[0],/remains OPEN/);
  await assert.rejects(stat(join(dir,'workbench-source-pages.pdf')),{code:'ENOENT'});
 });
});

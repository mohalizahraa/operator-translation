import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fetchWorkbenchSource,WORKBENCH_SOURCE_ORIGIN,validProjectId} from './fetch-workbench-source.mjs';

const pdf = Buffer.from('%PDF-1.4\n' + '0'.repeat(150) + '\n%%EOF\n');
const reply = (bytes=pdf,type='application/pdf',status=200) => new Response(bytes,{status,headers:{'content-type':type,'content-length':String(bytes.length)}});
async function temp(run) { const dir=await mkdtemp(join(tmpdir(),'workbench-pdf-test-'));try{return await run(join(dir,'source.pdf'));}finally{await rm(dir,{recursive:true,force:true});}}

test('canonical project ID and URL are exact, and source bytes are saved verbatim',async()=>{
  await temp(async path=>{
    let url,options;
    const result=await fetchWorkbenchSource({projectId:'88',outputPath:path,fetchImpl:async(u,o)=>{url=u;options=o;return reply();}});
    assert.equal(url,WORKBENCH_SOURCE_ORIGIN+'/api/pdf/88');
    assert.equal(options.redirect,'error');
    assert.equal(result.bytes,pdf.length);
    assert.match(result.sha256,/^[a-f0-9]{64}$/);
    assert.deepEqual(await readFile(path),pdf);
  });
});
test('rejects arbitrary host/project paths and nondecimal IDs',()=>{
  for (const value of ['0','88/../../foo','https://elsewhere',-2,'','NaN','1.0']) assert.throws(()=>validProjectId(value));
});
test('rejects HTML pretending to be a PDF and leaves no artifact',async()=>{
  await temp(async path=>{
    await assert.rejects(fetchWorkbenchSource({projectId:88,outputPath:path,fetchImpl:async()=>reply(Buffer.from('<html>no</html>'),'text/html')}),/not application\/pdf/);
    await assert.rejects(stat(path),{code:'ENOENT'});
  });
});
test('rejects invalid or truncated PDF, deletes working copy',async()=>{
  await temp(async path=>{
    const fake=Buffer.from('%PDF-1.4\n'+'0'.repeat(200));
    await assert.rejects(fetchWorkbenchSource({projectId:88,outputPath:path,fetchImpl:async()=>reply(fake)}),/signature\/completeness/);
    await assert.rejects(stat(path),{code:'ENOENT'});
  });
});
test('rejects 502 proxy failure and never creates source file',async()=>{
  await temp(async path=>{
    await assert.rejects(fetchWorkbenchSource({projectId:88,outputPath:path,fetchImpl:async()=>reply(Buffer.from('unavailable'),'application/json',502)}),/HTTP 502/);
    await assert.rejects(stat(path),{code:'ENOENT'});
  });
});

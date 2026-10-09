// Integration test: two separate runner-like Windows processes MUST NOT overlap.
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

if(process.platform !== 'win32'){
  console.log('Windows host mutex smoke skipped: non-Windows environment');
  process.exit(0);
}
const here=dirname(fileURLToPath(import.meta.url));
const wrapper=resolve(here,'with-exclusive-gpu.ps1');
const probe=resolve(here,'gpu-lock-probe.mjs');
const temp=mkdtempSync(join(tmpdir(),'translation-gpu-lock-'));
const log=join(temp,'events.jsonl');

const run=()=>new Promise((resolveDone,reject)=>{
  const child=spawn('pwsh',[
    '-NoProfile','-NonInteractive','-File',wrapper,
    '-Executable',process.execPath,
    '-CommandArguments',probe,
    '-WaitTimeoutSeconds','30'
  ],{env:{...process.env,GPU_LOCK_TEST_LOG:log},windowsHide:true});
  let stderr='';
  child.stderr.on('data',x=>{stderr+=x.toString()});
  child.on('error',reject);
  child.on('close',code=>code===0?resolveDone():reject(new Error('GPU lock child failed: '+code+' '+stderr.slice(-1200))));
});
try{
  await Promise.all([run(),run()]);
  const events=readFileSync(log,'utf8').trim().split(/\r?\n/).map(JSON.parse);
  assert.equal(events.length,4,'expected starts/ends for two isolated processes');
  assert.deepEqual(events.map(e=>e.event),['start','end','start','end'],'GPU jobs overlapped');
  assert.notEqual(events[0].pid,events[2].pid,'must test two distinct processes');
  console.log('GPU_EXCLUSIVE_CROSS_PROCESS_TEST_PASSED');
}finally{
  rmSync(temp,{recursive:true,force:true});
}

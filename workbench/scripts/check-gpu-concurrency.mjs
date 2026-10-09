// Zero-dependency rule check for future Windows translation GPU workflows.
// This is a fail-closed static ratchet, not a GPU scheduler; runtime mutex owns exclusion.
import {readFileSync,readdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','..');
const workbench=join(root,'workbench');
const policies=[
  'workbench/AGENTS.md','workbench/runner/GPU-SCHEDULING.md',
  'workbench/scripts/with-exclusive-gpu.ps1','workbench/scripts/gpu-lock-smoke.mjs'
];
const errors=[];
for(const path of policies){
  try{const x=readFileSync(join(root,path),'utf8');if(!x.trim())errors.push('Empty policy: '+path)}
  catch{errors.push('Missing policy: '+path)}
}
const lock=readFileSync(join(workbench,'scripts/with-exclusive-gpu.ps1'),'utf8');
if(!lock.includes('Global\\OperatorTranslationGpuHeavy')||!lock.includes('WaitOne')||!lock.includes('ReleaseMutex')){
  errors.push('Exclusive Windows host mutex must be preserved');
}
const gpuEvidence=/(?:#\s*GPU_HEAVY\b|\bnvidia-smi\b|\bpaddleocr\b|\bpaddlepaddle\b|\bsurya_ocr\b|\bsurya-ocr\b|\btorch\.cuda\b|\bollama\s+run\b|\bonnxruntime-gpu\b|\bCUDA_VISIBLE_DEVICES\b)/i;
const winTarget=/\bruns-on:\s*(?:\[[^\]\n]*\bWindows\b|['"]?windows-(?:latest|20\d{2}))/i;
const workflows=join(root,'.github/workflows');
let checked=0, gpuJobs=0;
for(const file of readdirSync(workflows).filter(x=>/\.ya?ml$/.test(x))){
  const source=readFileSync(join(workflows,file),'utf8');
  if(!winTarget.test(source))continue;
  checked++;
  if(!gpuEvidence.test(source))continue;
  gpuJobs++;
  if(!/\bwith-exclusive-gpu\.ps1\b/i.test(source)){
    errors.push(file+': Windows GPU job bypasses the host-wide exclusive GPU wrapper');
  }
  if(!/#\s*GPU_HEAVY\b/.test(source)){
    errors.push(file+': Windows GPU job must be explicitly marked # GPU_HEAVY');
  }
}
if(errors.length){
  for(const problem of errors)console.error('GPU_POLICY_FAILURE: '+problem);
  process.exit(1);
}
console.log('GPU_POLICY_PASS: '+checked+' Windows workflows checked, '+gpuJobs+' GPU workflows protected; two runners share one GPU mutex');

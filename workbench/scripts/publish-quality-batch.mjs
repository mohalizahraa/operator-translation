#!/usr/bin/env node
/**
 * Evidence-first Workbench checkpoint: the designated manuscript writer must
 * independently verify source/target units, formats and notes BEFORE this runs.
 * This checks receipt identity; it cannot certify scholarly translation quality.
 *
 * node scripts/publish-quality-batch.mjs --project 12 --pages 4 --total 486 --evidence /path/to/verified-report.json --actor Mohammed
 */
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {synchronizeVerifiedProgress,DEFAULT_WORKBENCH} from './sync-verified-progress.mjs';

function integer(value,name,min=0){
 const n=Number(value);
 if(!Number.isSafeInteger(n)||n<min)throw new Error(name+' must be an integer >= '+min);
 return n;
}
async function readJson(response,label){
 let data;
 try{data=await response.json();}catch{throw new Error(label+' returned invalid JSON (HTTP '+response.status+').');}
 if(!response.ok)throw new Error(label+' failed (HTTP '+response.status+'): '+(data?.error||'unknown error'));
 return data;
}
export async function publishQualityVerifiedBatch({
 projectId,pages,totalPages,evidence,actor=null,workbenchUrl=DEFAULT_WORKBENCH,fetchImpl=fetch
}){
 const id=integer(projectId,'projectId',1),target=integer(pages,'pages',1),total=integer(totalPages,'totalPages',1);
 if(target>total)throw new Error('pages exceeds physical-page denominator.');
 if(actor!==null&&!['Zahraa','Mohammed'].includes(actor))throw new Error('Unrecognized actor.');
 if(!evidence||typeof evidence!=='object'||Array.isArray(evidence))throw new Error('Evidence report is required.');
 const root=new URL(workbenchUrl);
 if(root.protocol!=='https:')throw new Error('Workbench must use HTTPS.');
 const route=path=>new URL('/api/projects/'+id+'/'+path,root);
 const marker=await readJson(await fetchImpl(route('progress-sync'),{method:'GET'}),'Live marker');
 const previous=integer(marker.project?.translated_pages,'stored translated pages');
 if(Number(marker.project?.id)!==id||Number(marker.project?.pages)!==total)
   throw new Error('Project identity/denominator does not match live Workbench.');
 if(!marker.marker_found||Number(marker.marker_pages)!==target||Number(marker.marker_total)!==total||
    !/^[a-f0-9]{64}$/i.test(marker.export_sha256||''))
   throw new Error('Marker is absent, stale, or mismatched with requested checkpoint.');
 if(target<=previous)throw new Error('No new contiguous pages are ready for QA checkpoint.');
 const revision='public-export-sha256:'+marker.export_sha256.toLowerCase();
 if(evidence.from_page!==previous+1||evidence.to_page!==target||
    evidence.source_total_pages!==total||evidence.target_revision!==revision||
    !/^[a-f0-9]{64}$/i.test(evidence.source_hash||''))
   throw new Error('QA report must match the next page range, PDF SHA-256 and exact live export revision.');
 const headers={'content-type':'application/json',...(actor?{'x-workbench-actor':actor}:{})};
 // Never fabricate evidence or retry a failed POST: a timeout may follow a commit.
 const qa=await readJson(await fetchImpl(route('quality'),{
   method:'POST',headers,body:JSON.stringify(evidence)
 }),'QA receipt');
 if(!qa.receipt_id||qa.preflight_ready===false)throw new Error('QA receipt was not confirmed.');
 // The server also checks receipt/source/revision identity when strict mode is on.
 const result=await synchronizeVerifiedProgress({projectId:id,expectedPages:target,
   totalPages:total,actor,workbenchUrl,fetchImpl});
 return {...result,qaReceiptId:qa.receipt_id,
  qaClaim:'Evidence-presence receipt, not independent source-quality certification'};
}
function parseArgs(argv){
 const args={};
 if(argv.length%2)throw new Error('Expected --key value pairs.');
 for(let i=0;i<argv.length;i+=2){
  if(!argv[i].startsWith('--'))throw new Error('Invalid argument '+argv[i]);
  args[argv[i].slice(2)]=argv[i+1];
 }
 for(const k of ['project','pages','total','evidence'])if(!args[k])throw new Error('Missing --'+k+'.');
 return args;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const a=parseArgs(process.argv.slice(2));
  const evidence=JSON.parse(await readFile(a.evidence,'utf8'));
  const result=await publishQualityVerifiedBatch({projectId:a.project,pages:a.pages,
    totalPages:a.total,actor:a.actor||null,evidence,workbenchUrl:a.origin||DEFAULT_WORKBENCH});
  process.stdout.write('WORKBENCH_QA_SYNCED '+result.projectId+' '+result.translatedPages+'/'+result.totalPages+' receipt='+result.qaReceiptId+'\n');
 }catch(error){
  process.stderr.write('WORKBENCH_QA_SYNC_OPEN: '+error.message+'\n');
  process.exitCode=1;
 }
}

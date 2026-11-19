#!/usr/bin/env node
/**
 * Evidence-bound Google Docs to Workbench checkpoint delivery.
 * This is the only supported automated route for a verified new batch. It
 * reconciles ambiguous writes against live project, checkpoint and document
 * readbacks before it retries; it never advances progress from a draft alone.
 */
import {pathToFileURL} from 'node:url';

export const DEFAULT_WORKBENCH='https://haydari-translation-workbench.pages.dev';

function integer(value,label,min=0){
 const n=Number(value);if(!Number.isSafeInteger(n)||n<min)throw new Error(label+' must be an integer >= '+min);return n;
}
function readFailure(label,status,data){
 const err=new Error(label+' failed (HTTP '+status+'): '+(data?.error||data?.message||'unknown error'));
 err.status=status;return err;
}
async function getJson(fetchImpl,url,label,init={}){
 let response;
 try{response=await fetchImpl(url,init);}catch(error){throw new Error(label+' network error: '+(error?.message||'request failed'));}
 let data;try{data=await response.json();}catch{throw new Error(label+' returned invalid JSON (HTTP '+response.status+').');}
 if(!response.ok)throw readFailure(label,response.status,data);
 return data;
}
function expectedCheckpoint(sync){
 return {fromPage:Number(sync.from_page),toPage:Number(sync.to_page),totalPages:Number(sync.total_pages),
  sourceHash:String(sync.source_pdf_sha256||'').toLowerCase(),revision:sync.google_doc_revision};
}
function checkpointMatches(project,integrity,sync){
 const want=expectedCheckpoint(sync),cp=integrity?.checkpoint;
 return Number(project?.id)===Number(sync.project_id) &&
  Number(project?.translated_pages)===want.toPage &&
  Number(project?.pages)===want.totalPages &&
  Number(cp?.from_page)===want.fromPage &&
  Number(cp?.to_page)===want.toPage &&
  Number(cp?.source_total_pages)===want.totalPages &&
  cp?.source_page_basis==='physical_pdf' &&
  String(cp?.source_pdf_sha256||'').toLowerCase()===want.sourceHash &&
  cp?.google_doc_revision===want.revision;
}
function previousMatches(project,sync){
 return Number(project?.id)===Number(sync.project_id) &&
  Number(project?.translated_pages)===Number(sync.expected_previous_pages) &&
  Number(project?.pages)===Number(sync.total_pages);
}
async function liveSnapshot(fetchImpl,root,id){
 const project=await getJson(fetchImpl,new URL('/api/projects/'+id,root),'Live project readback');
 const integrity=await getJson(fetchImpl,new URL('/api/projects/'+id+'/integrity',root),'Checkpoint readback');
 const liveDoc=await getJson(fetchImpl,new URL('/api/projects/'+id+'/progress-sync?revision_only=1',root),'Live Google Doc revision');
 return {project:project.project,integrity,liveDoc};
}
function revisionMatches(snapshot,sync){
 const digest=snapshot?.liveDoc?.export_sha256;
 return typeof digest==='string' && sync.google_doc_revision==='public-export-sha256:'+digest;
}
function assertCommitted(snapshot,sync){
 if(!checkpointMatches(snapshot.project,snapshot.integrity,sync)||!revisionMatches(snapshot,sync)){
  throw new Error('SYNC_OPEN: live project/checkpoint/Google Doc readback does not match the verified batch. Do not advance to another batch; refresh and reconcile the document revision and Workbench checkpoint.');
 }
 const allowed=Number(sync.to_page)===Number(sync.total_pages)?['review','completed','published']:['in_progress'];
 if(!allowed.includes(snapshot.project.status))throw new Error('SYNC_OPEN: unexpected live workflow status '+String(snapshot.project.status)+'.');
 return {projectId:Number(sync.project_id),translatedPages:Number(sync.to_page),totalPages:Number(sync.total_pages),
  status:snapshot.project.status,synchronized:true,checkpoint:snapshot.integrity.checkpoint};
}
function transient(error){return !Number.isInteger(error?.status)||error.status>=500;}
export async function synchronizeVerifiedProgress({
 projectId,syncPayload,actor=null,workbenchUrl=DEFAULT_WORKBENCH,fetchImpl=fetch
}){
 const id=integer(projectId,'projectId',1);
 if(!syncPayload||typeof syncPayload!=='object'||Number(syncPayload.project_id)!==id)
  throw new Error('Exact project identity and evidence-bound sync payload are required.');
 if(actor!==null&&!['Zahraa','Mohammed'].includes(actor))throw new Error('Actor must be Zahraa, Mohammed, or omitted.');
 const root=new URL(workbenchUrl);if(root.protocol!=='https:')throw new Error('Workbench must use HTTPS.');
 const to=integer(syncPayload.to_page,'to_page',1),total=integer(syncPayload.total_pages,'total_pages',1);
 if(to>total||Number(syncPayload.from_page)!==Number(syncPayload.expected_previous_pages)+1)
  throw new Error('Sync payload must describe the next contiguous physical-source range.');
 const endpoint=new URL('/api/projects/'+id+'/progress-sync',root);
 const headers={'content-type':'application/json',...(actor?{'x-workbench-actor':actor}:{})};
 const initial=await liveSnapshot(fetchImpl,root,id);
 const expectedTitle=syncPayload.project_title;
 const docId=/\/document\/d\/([A-Za-z0-9_-]+)/.exec(initial.project?.google_doc_url||'')?.[1];
 if(Number(initial.project?.id)!==id || Number(initial.project?.pages)!==total ||
  (initial.project?.title_en||initial.project?.title_ar)!==expectedTitle || initial.project?.assignee!==syncPayload.assignee ||
  docId!==syncPayload.target_document_id || initial.project?.status!=='in_progress')
  throw new Error('Project identity/status changed before checkpoint delivery.');
 if(!previousMatches(initial.project,syncPayload))
  throw new Error('SYNC_OPEN: stored checkpoint changed before delivery; refresh the project and review the next page range.');
 if(!revisionMatches(initial,syncPayload))
  throw new Error('SYNC_OPEN: Google Doc revision is stale before delivery; re-read and re-review the current document.');
 const init={method:'POST',headers,body:JSON.stringify(syncPayload)};
 let error=null;
 try{await getJson(fetchImpl,endpoint,'Evidence-bound checkpoint',init);}
 catch(e){error=e;}
 let snapshot;
 try{snapshot=await liveSnapshot(fetchImpl,root,id);}catch(e){
  throw new Error('SYNC_OPEN: progress write outcome is uncertain and live readback failed ('+e.message+'). Refresh before retrying or continuing.');
 }
 if(checkpointMatches(snapshot.project,snapshot.integrity,syncPayload)&&revisionMatches(snapshot,syncPayload))
  return assertCommitted(snapshot,syncPayload);
 if(!previousMatches(snapshot.project,syncPayload))
  throw new Error('SYNC_OPEN: project progress changed during publication; current count is '+String(snapshot.project?.translated_pages)+'. Refresh and reconcile.');
 if(!revisionMatches(snapshot,syncPayload))
  throw new Error('SYNC_OPEN: Google Doc revision changed before checkpoint publication. Re-read and re-review the current document.');
 if(!error)throw new Error('SYNC_OPEN: endpoint accepted the write but the verified checkpoint did not persist. Do not continue.');
 if(!transient(error))throw new Error('SYNC_OPEN: checkpoint was rejected and did not persist ('+error.message+').');
 // Retrying this exact immutable body is safe only after readback proved that
 // neither the checkpoint nor the target document revision changed.
 try{await getJson(fetchImpl,endpoint,'Evidence-bound checkpoint retry',init);}
 catch(e){error=e;}
 try{snapshot=await liveSnapshot(fetchImpl,root,id);}catch(e){
  throw new Error('SYNC_OPEN: retry outcome is uncertain and final readback failed ('+e.message+').');
 }
 if(checkpointMatches(snapshot.project,snapshot.integrity,syncPayload)&&revisionMatches(snapshot,syncPayload))
  return assertCommitted(snapshot,syncPayload);
 throw new Error('SYNC_OPEN: checkpoint did not persist after one safe retry ('+(error?.message||'readback mismatch')+'). Keep progress unchanged and reconcile.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 process.stderr.write('Use publish-quality-batch.mjs with a revision-matched QA report and live Google Drive metadata; bare checkpoint sync is disabled.\n');
 process.exitCode=2;
}

#!/usr/bin/env node
/**
 * Execute after the designated writer has source-checked, QA-reviewed, written,
 * and read back a batch in the exact linked Google Doc. The Drive metadata JSON
 * must come from a fresh Google Drive metadata read for that document.
 *
 * node scripts/publish-quality-batch.mjs --project 12 --pages 4 --total 486 \
 *   --evidence ./verified-report.json --drive-metadata ./drive-metadata.json --actor Mohammed
 *
 * This records evidence presence and synchronizes a checkpoint. It cannot
 * independently certify scholarly translation quality.
 */
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {synchronizeVerifiedProgress,DEFAULT_WORKBENCH} from './sync-verified-progress.mjs';

function integer(value,name,min=0){
 const n=Number(value);if(!Number.isSafeInteger(n)||n<min)throw new Error(name+' must be an integer >= '+min);return n;
}
async function responseJson(response,label){
 let data;try{data=await response.json();}catch{const e=new Error(label+' returned invalid JSON (HTTP '+response.status+').');e.status=response.status;throw e;}
 if(!response.ok){const e=new Error(label+' failed (HTTP '+response.status+'): '+(data?.error||data?.message||'unknown error'));e.status=response.status;throw e;}
 return data;
}
async function get(fetchImpl,url,label){
 let res;try{res=await fetchImpl(url,{method:'GET'});}catch(e){throw new Error(label+' network error: '+(e?.message||'request failed'));}
 return responseJson(res,label);
}
function normalizeAnyoneEditor(metadata){
 if(!metadata||typeof metadata!=='object')return null;
 const permissions=Array.isArray(metadata.permissions)?metadata.permissions:[metadata.permission||metadata.permissions].filter(Boolean);
 const anyone=permissions.find(p=>p?.type==='anyone'&&p?.role==='writer');
 const id=metadata.id||metadata.fileId||metadata.file_id;
 const mimeType=metadata.mime_type||metadata.mimeType;
 if(!id||mimeType!=='application/vnd.google-apps.document'||!anyone)return null;
 return {file_id:id,mime_type:mimeType,anyone_role:'writer'};
}
function exactReport(report,project,id,docId,permission,previous,target,total,revision){
 const expectedTitle=project.title_en||project.title_ar;
 if(report.evidence_schema_version!==2||report.project_id!==id||
  report.project_title!==expectedTitle||report.assignee!==project.assignee||
  report.target_document_id!==docId||report.source_page_basis!=='physical_pdf'||
  report.target_revision!==revision||report.expected_previous_pages!==previous||
  report.from_page!==previous+1||report.to_page!==target||
  report.source_total_pages!==total||
  report.target_permission?.file_id!==permission.file_id||report.target_permission?.mime_type!==permission.mime_type||report.target_permission?.anyone_role!==permission.anyone_role||
  !/^[a-f0-9]{64}$/.test(String(report.source_hash||'')))
  throw new Error('QA report must match the exact live project, assigned translator, linked Doc, Drive permission, next physical-page range, PDF hash and current Doc revision.');
 if(!Array.isArray(report.units)||!report.units.length)throw new Error('QA report must contain source-unit evidence for every page.');
 for(const unit of report.units){
  if(unit.source_evidence_ref!=='source-pdf-sha256:'+report.source_hash+'#page='+unit.source_page||
   typeof unit.target_evidence_ref!=='string'||!unit.target_evidence_ref.startsWith('google-doc:'+docId+'#'))
   throw new Error('Every source unit must cite its physical-PDF page and an anchor in the exact linked Doc.');
 }
}
function matchingReceipt(receipts,report){
 return (receipts||[]).find(r=>Number(r.from_page)===Number(report.from_page)&&
  Number(r.to_page)===Number(report.to_page)&&r.source_pdf_sha256===report.source_hash&&
  r.google_doc_revision===report.target_revision)||null;
}
export async function publishQualityVerifiedBatch({
 projectId,pages,totalPages,evidence,driveMetadata,actor=null,
 workbenchUrl=DEFAULT_WORKBENCH,fetchImpl=fetch
}){
 const id=integer(projectId,'projectId',1),target=integer(pages,'pages',1),total=integer(totalPages,'totalPages',1);
 if(target>total)throw new Error('pages exceeds physical-page denominator.');
 if(actor!==null&&!['Zahraa','Mohammed'].includes(actor))throw new Error('Unrecognized actor.');
 if(!evidence||typeof evidence!=='object'||Array.isArray(evidence))throw new Error('Evidence report is required.');
 const root=new URL(workbenchUrl);if(root.protocol!=='https:')throw new Error('Workbench must use HTTPS.');
 const route=path=>new URL('/api/projects/'+id+'/'+path,root);
 const docId=driveMetadata?.id||driveMetadata?.fileId;
 const permission=normalizeAnyoneEditor(driveMetadata);
 if(!permission)throw new Error('Fresh Google Drive metadata must confirm the exact native Google Doc id and Anyone with the link Editor permission.');
 if(String(docId)!==String(evidence.target_document_id))throw new Error('Drive metadata document id does not match the report or Workbench target.');
 const live=await get(fetchImpl,new URL('/api/projects/'+id+'/progress-sync?revision_only=1',root),'Live Workbench and Google Doc');
 const project=live.project,previous=integer(project?.translated_pages,'stored translated pages');
 if(Number(project?.id)!==id||Number(project?.pages)!==total||project?.page_count_verified!==true)
  throw new Error('Exact project id or verified physical-PDF denominator does not match live Workbench.');
 if(project.status!=='in_progress')throw new Error('Project must be in progress before a verified translation batch can be synchronized.');
 if(actor!==null && project.assignee!=='Both' && actor!==project.assignee)
  throw new Error('Actor must match the live Workbench assignee for this project.');
 const linkedDoc=/\/document\/d\/([A-Za-z0-9_-]+)/.exec(project.google_doc_url||'')?.[1];
 if(!linkedDoc||linkedDoc!==docId)throw new Error('Google Drive metadata id does not match the exact live Workbench-linked Google Doc.');
 if(target<=previous)throw new Error('No new contiguous pages are ready for a QA checkpoint.');
 const digest=live.export_sha256;
 if(!/^[a-f0-9]{64}$/i.test(String(digest||'')))throw new Error('Could not read a live revision for the linked Google Doc.');
 const revision='public-export-sha256:'+digest.toLowerCase();
 exactReport(evidence,project,id,docId,permission,previous,target,total,revision);
 const headers={'content-type':'application/json',...(actor?{'x-workbench-actor':actor}:{})};
 const qualityUrl=route('quality');
 let qa=null,qaError=null;
 try{qa=await responseJson(await fetchImpl(qualityUrl,{method:'POST',headers,body:JSON.stringify(evidence)}),'QA receipt');}
 catch(e){qaError=e;}
 if(!qa?.receipt_id){
  // Exact immutable QA receipt keys make the same body idempotent. Reconcile
  // before retrying a transient/ambiguous POST.
  let listed;
  try{listed=await get(fetchImpl,qualityUrl,'QA receipt readback');}
  catch(e){throw new Error('QA_SYNC_OPEN: write outcome is unknown and receipt readback failed ('+e.message+').');}
  const found=matchingReceipt(listed.receipts,evidence);
  if(found)qa={receipt_id:found.id,unchanged:true};
  else if(!qaError || Number.isInteger(qaError.status)&&qaError.status<500)
   throw new Error('QA_SYNC_OPEN: QA receipt was rejected or is absent ('+(qaError?.message||'no receipt id')+').');
  else {
   try{qa=await responseJson(await fetchImpl(qualityUrl,{method:'POST',headers,body:JSON.stringify(evidence)}),'QA receipt retry');}
   catch(e){throw new Error('QA_SYNC_OPEN: QA receipt failed after one safe idempotent retry ('+e.message+').');}
  }
 }
 if(!qa?.receipt_id)throw new Error('QA_SYNC_OPEN: receipt id was not confirmed.');
 const syncPayload={sync_mode:'evidence_bound_v1',project_id:id,project_title:project.title_en||project.title_ar,
  assignee:project.assignee,target_document_id:docId,target_permission:permission,source_page_basis:'physical_pdf',
  expected_previous_pages:previous,from_page:previous+1,to_page:target,total_pages:total,
  source_pdf_sha256:evidence.source_hash.toLowerCase(),google_doc_revision:revision,qa_receipt_id:qa.receipt_id};
 const result=await synchronizeVerifiedProgress({projectId:id,syncPayload,actor,workbenchUrl,fetchImpl});
 const finalReceipts=await get(fetchImpl,qualityUrl,'Final QA receipt readback');
 if(!matchingReceipt(finalReceipts.receipts,evidence)||
  !finalReceipts.receipts.some(r=>String(r.id)===String(qa.receipt_id)))
  throw new Error('SYNC_OPEN: final live QA receipt readback does not match the published batch.');
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
 for(const k of ['project','pages','total','evidence','drive-metadata'])if(!args[k])throw new Error('Missing --'+k+'.');
 return args;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const a=parseArgs(process.argv.slice(2));
  const evidence=JSON.parse(await readFile(a.evidence,'utf8'));
  const driveMetadata=JSON.parse(await readFile(a['drive-metadata'],'utf8'));
  const result=await publishQualityVerifiedBatch({projectId:a.project,pages:a.pages,totalPages:a.total,
    actor:a.actor||null,evidence,driveMetadata,workbenchUrl:a.origin||DEFAULT_WORKBENCH});
  process.stdout.write('WORKBENCH_QA_SYNCED '+result.projectId+' '+result.translatedPages+'/'+result.totalPages+
   ' receipt='+result.qaReceiptId+'\\n');
 }catch(error){
  process.stderr.write('WORKBENCH_QA_SYNC_OPEN: '+error.message+'\\n');
  process.exitCode=1;
 }
}

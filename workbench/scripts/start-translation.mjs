#!/usr/bin/env node
/**
 * Link an already-editable English Book and enter Translating in one existing
 * Workbench PATCH. This does NOT credit translated source-PDF pages.
 *
 * The caller must independently read Google Drive permission metadata and pass
 * the resulting anyone/writer witness. The Workbench additionally probes the
 * anonymous Google Docs text export before accepting the link.
 */
import {pathToFileURL} from 'node:url';

const DEFAULT_ROOT='https://haydari-translation-workbench.pages.dev';

function docId(url){
  try{
    const u=new URL(url);
    if(u.protocol!=='https:'||u.hostname!=='docs.google.com')return null;
    return u.pathname.match(/^\/document\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)?.[1]||null;
  }catch{return null;}
}
function requireExact(ok,message){if(!ok)throw new Error('START_OPEN: '+message);}
async function projectRead(fetchImpl,url){
  const response=await fetchImpl(url,{method:'GET'});
  const value=await response.json().catch(()=>null);
  requireExact(response.ok&&value?.project,'Project API GET failed (HTTP '+response.status+').');
  return value.project;
}
function projectIdentity(project,{projectId,title,assignee,totalPages}){
  requireExact(Number(project.id)===Number(projectId),'project ID mismatch.');
  requireExact(project.title_en===title,'book title mismatch.');
  requireExact(project.assignee===assignee,'assignee mismatch.');
  requireExact(project.page_count_verified===true&&Number(project.pages)===Number(totalPages),'verified PDF page count mismatch.');
}
function documentMatches(url,documentId){return docId(url)===documentId;}
export async function startTranslation({
  projectId,title,assignee,totalPages,documentUrl,permissionEvidence,
  workbenchUrl=DEFAULT_ROOT,fetchImpl=fetch
}){
  requireExact(Number.isSafeInteger(Number(projectId))&&Number(projectId)>0,'positive project ID required.');
  requireExact(typeof title==='string'&&title.length>0,'exact book title required.');
  requireExact(['Zahraa','Mohammed','Both'].includes(assignee),'explicit valid assignee required.');
  requireExact(Number.isSafeInteger(Number(totalPages))&&Number(totalPages)>0,'verified PDF page denominator required.');
  const documentId=docId(documentUrl);
  requireExact(Boolean(documentId),'native Google Docs URL required.');
  requireExact(permissionEvidence?.fileId===documentId&&permissionEvidence?.type==='anyone'&&permissionEvidence?.role==='writer',
    'fresh Google Drive Anyone with link -> Editor permission witness required.');
  const root=new URL(workbenchUrl);
  requireExact(root.protocol==='https:'&&root.username===''&&root.password==='','HTTPS Workbench origin required.');
  const endpoint=new URL('/api/projects/'+Number(projectId),root);
  const initial=await projectRead(fetchImpl,endpoint);
  projectIdentity(initial,{projectId,title,assignee,totalPages});
  requireExact(initial.status==='not_started'||initial.status==='in_progress','book already beyond the Translating stage.');
  requireExact(!initial.google_doc_url||documentMatches(initial.google_doc_url,documentId),'a different English Doc is already linked.');
  const originalPages=Number(initial.translated_pages);
  requireExact(Number.isSafeInteger(originalPages)&&originalPages>=0,'invalid existing page numerator.');
  if(initial.status==='not_started')requireExact(originalPages===0,'cannot silently restart a nonzero-page book.');
  const alreadyDone=initial.status==='in_progress'&&documentMatches(initial.google_doc_url,documentId);
  if(!alreadyDone){
    let patchError=null;
    try{
      const response=await fetchImpl(endpoint,{method:'PATCH',headers:{'content-type':'application/json'},
        body:JSON.stringify({google_doc_url:documentUrl,status:'in_progress'})});
      const data=await response.json().catch(()=>null);
      if(!response.ok)patchError=new Error('Workbench PATCH rejected (HTTP '+response.status+'): '+(data?.error||'unknown error'));
    }catch(error){patchError=error;}
    // Always re-read after a write, including ambiguous network responses;
    // never retry blindly and risk modifying a different/changed project.
    let latest;
    try{latest=await projectRead(fetchImpl,endpoint);}catch(error){
      throw new Error('START_OPEN: PATCH outcome uncertain and readback failed: '+error.message);
    }
    projectIdentity(latest,{projectId,title,assignee,totalPages});
    requireExact(latest.status==='in_progress'&&documentMatches(latest.google_doc_url,documentId)&&
      Number(latest.translated_pages)===originalPages&&latest.source_pdf_url===initial.source_pdf_url,
      (patchError?patchError.message+'; ':'')+'persisted status, document, page count, or source changed unexpectedly.');
    return {projectId:Number(projectId),status:latest.status,googleDocUrl:latest.google_doc_url,
      translatedPages:originalPages,totalPages:Number(totalPages),persisted:true};
  }
  return {projectId:Number(projectId),status:initial.status,googleDocUrl:initial.google_doc_url,
    translatedPages:originalPages,totalPages:Number(totalPages),persisted:true,alreadyLinked:true};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const json=process.env.WORKBENCH_START_REQUEST;
  if(!json){console.error('WORKBENCH_START_REQUEST JSON is required (projectId,title,assignee,totalPages,documentUrl,permissionEvidence).');process.exitCode=2;}
  else{
    try{const result=await startTranslation(JSON.parse(json));console.log(JSON.stringify(result));}
    catch(error){console.error(error.message);process.exitCode=1;}
  }
}

import { json, normalizeProject, googleDocIdFromUrl } from '../../../_lib.js';
import { assessTranslationEvidence, readPublicProgressMarker, readPublicEnglishDocumentRevision } from '../../../_translation.js';
import { onRequestPatch as publishProgress } from './progress.js';

function idFrom(context) {
  const n = Number(context.params.id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const MAX_SOURCE_HASH_BYTES = 64 * 1024 * 1024;

function hex(bytes) {
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2,'0')).join('');
}

async function bootstrapSourcePdfSha256(project) {
  if (project?.pdf_status !== 'available' || !project?.source_pdf_url) {
    return { error: 'Cannot bootstrap source identity without a verified available source PDF.' };
  }
  let response;
  try {
    response = await fetch(project.source_pdf_url, {
      method: 'GET', redirect: 'follow',
      headers: {'accept':'application/pdf,*/*;q=0.8','accept-encoding':'identity','user-agent':'Haydari-Translation-Workbench/1.0'},
    });
  } catch { return { error: 'Could not reach the verified source PDF while bootstrapping source identity.' }; }
  if (!response.ok) {
    try { await response.body?.cancel(); } catch {}
    return { error: 'Verified source PDF returned HTTP ' + response.status + ' while bootstrapping source identity.' };
  }
  if (!(response.headers.get('content-type') || '').toLowerCase().includes('application/pdf')) {
    try { await response.body?.cancel(); } catch {}
    return { error: 'Verified source no longer returns a PDF while bootstrapping source identity.' };
  }
  if (Number(response.headers.get('content-length') || 0) > MAX_SOURCE_HASH_BYTES) {
    try { await response.body?.cancel(); } catch {}
    return { error: 'Verified source PDF is too large for source-identity bootstrap.' };
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 1000 || bytes.byteLength > MAX_SOURCE_HASH_BYTES ||
      bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) {
    return { error: 'Verified source PDF failed source-identity bootstrap validation.' };
  }
  return { sha256: hex(await crypto.subtle.digest('SHA-256', bytes)) };
}

async function readProject(context) {
  const id=idFrom(context);
  if (!id) return {status:400,data:{error:'Invalid project id.'}};
  const project=await context.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  if (!project) return {status:404,data:{error:'Project not found.'}};
  return {status:200,data:{id,project}};
}

async function readMarker(context) {
  const found=await readProject(context);
  if(found.status!==200)return found;
  const marker=await readPublicProgressMarker(found.data.project);
  return {status:marker.status,data:{project:normalizeProject(found.data.project),...marker.data}};
}

export async function onRequestGet(context) {
  if(new URL(context.request.url).searchParams.get('revision_only')==='1'){
    const found=await readProject(context);
    if(found.status!==200)return json(found.data,found.status);
    const revision=await readPublicEnglishDocumentRevision(found.data.project);
    return json({...revision.data,project:normalizeProject(found.data.project),sync_contract:'evidence-bound-v1'},revision.status);
  }
  const result=await readMarker(context);
  return json({...result.data,sync_contract:'verified-marker-v2'},result.status);
}

async function evidenceBoundPost(context, body) {
  const found=await readProject(context);
  if(found.status!==200)return json(found.data,found.status);
  const id=found.data.id, project=found.data.project, normalized=normalizeProject(project);
  const expectedId=Number(body.project_id), docId=googleDocIdFromUrl(project.google_doc_url);
  const title=project.title_en||project.title_ar;
  if(expectedId!==id || body.project_title!==title || body.assignee!==project.assignee ||
     body.target_document_id!==docId) {
    return json({error:'Exact project id, book title, assignee and linked Google Doc id must match the live project.',code:'project_identity_mismatch'},409);
  }
  if(!body.target_permission || body.target_permission.file_id!==docId ||
     body.target_permission.mime_type!=='application/vnd.google-apps.document' ||
     body.target_permission.anyone_role!=='writer') {
    return json({error:'Google Drive metadata must confirm Anyone with the link Editor access for this exact native Google Doc.',code:'document_permission_unverified'},409);
  }
  if(!normalized.page_count_verified || body.source_page_basis!=='physical_pdf' ||
     Number(body.total_pages)!==Number(project.pages)) {
    return json({error:'Source denominator must match the verified physical-PDF project page count.',code:'physical_page_denominator_mismatch'},409);
  }
  if(project.status!=='in_progress')return json({error:'Project must be in progress before a translation batch can be synchronized.',code:'project_not_in_progress'},409);
  const current=Number(project.translated_pages||0), previous=Number(body.expected_previous_pages);
  const from=Number(body.from_page), to=Number(body.to_page), total=Number(body.total_pages);
  if(!Number.isInteger(previous)||previous!==current || from!==current+1 ||
     !Number.isInteger(to)||to<from||to>total) {
    return json({error:'Checkpoint is stale or non-contiguous. Refresh project progress and submit the next physical-page range.',code:'stale_checkpoint',current_translated_pages:current},409);
  }
  if(!/^[a-f0-9]{64}$/.test(String(body.source_pdf_sha256||'')) ||
     !/^public-export-sha256:[a-f0-9]{64}$/.test(String(body.google_doc_revision||''))) {
    return json({error:'Canonical PDF SHA-256 and exact public Google Doc revision are required.'},400);
  }
  const live=await readPublicEnglishDocumentRevision(project);
  if(live.status!==200)return json(live.data,live.status);
  if(body.google_doc_revision!=='public-export-sha256:'+live.data.export_sha256) {
    return json({error:'Google Doc changed after QA. Re-read, review and issue a new revision-bound receipt.',code:'stale_manuscript_revision'},409);
  }
  const latest=await context.env.DB.prepare('SELECT source_pdf_sha256 FROM translation_progress_checkpoints WHERE project_id=? ORDER BY id DESC LIMIT 1').bind(id).first();
  let sourceHash=String(latest?.source_pdf_sha256||'').toLowerCase();
  if(!sourceHash){
    const bootstrapped=await bootstrapSourcePdfSha256(project);
    if(!bootstrapped.sha256)return json({error:bootstrapped.error||'Could not verify source PDF identity.',code:'source_identity_unavailable'},409);
    sourceHash=bootstrapped.sha256;
  }
  if(sourceHash!==body.source_pdf_sha256)return json({error:'Evidence source SHA-256 does not match the authoritative PDF identity.',code:'source_identity_mismatch'},409);
  const receipt=await context.env.DB.prepare('SELECT * FROM translation_quality_evidence WHERE id=? AND project_id=?').bind(Number(body.qa_receipt_id),id).first();
  if(!receipt)return json({error:'Matching QA receipt was not found for this project.',code:'qa_receipt_missing'},409);
  const report=JSON.parse(receipt.report_json||'null');
  if(!report || report.evidence_schema_version!==2 || report.project_id!==id ||
     report.project_title!==title || report.assignee!==project.assignee ||
     report.target_document_id!==docId || report.expected_previous_pages!==current ||
     report.from_page!==from || report.to_page!==to || report.source_total_pages!==total ||
     report.source_hash!==body.source_pdf_sha256 || report.target_revision!==body.google_doc_revision ||
     !report.target_permission || report.target_permission.file_id!==docId ||
     report.target_permission.mime_type!=='application/vnd.google-apps.document' ||
     report.target_permission.anyone_role!=='writer') {
    return json({error:'QA receipt does not match this exact project, source range, document revision and permission check.',code:'qa_receipt_mismatch'},409);
  }
  const assessed=assessTranslationEvidence(report,false);
  if(!assessed.ready)return json({error:'QA receipt no longer passes evidence preflight.',code:'qa_evidence_invalid',blockers:assessed.blockers},409);
  const headers=new Headers(context.request.headers);
  headers.set('content-type','application/json');
  headers.set('x-workbench-actor',['Zahraa','Mohammed'].includes(project.assignee)?project.assignee:'System');
  const requestedActor=(headers.get('x-workbench-actor')||'').trim();
  const attributedActor=['Zahraa','Mohammed'].includes(requestedActor) &&
    (requestedActor===project.assignee || project.assignee==='Both')
    ? requestedActor
    : (['Zahraa','Mohammed'].includes(project.assignee)?project.assignee:'System');
  headers.set('x-workbench-actor',attributedActor);
  const request=new Request(context.request.url,{method:'PATCH',headers,body:JSON.stringify({
    translated_pages:to,expected_previous_pages:current,source_total_pages:total,
    source_pdf_sha256:sourceHash,google_doc_revision:body.google_doc_revision,
    verification_note:'Evidence-bound sync; verified physical-source page refs and revision-matched QA receipt '+receipt.id+'.',
  })});
  return publishProgress({...context,request,evidenceBoundSync:true});
}

export async function onRequestPost(context) {
  const body=await context.request.clone().json().catch(()=>null);
  if(body?.sync_mode==='evidence_bound_v1')return evidenceBoundPost(context,body);
  return json({error:'Marker-only progress updates are disabled. Submit a revision-matched QA receipt through the evidence-bound Workbench sync runner.',code:'qa_receipt_required'},409);
}

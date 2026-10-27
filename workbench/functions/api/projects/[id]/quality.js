import {ensureCatalog,json,actorFromRequest,normalizeProject,googleDocIdFromUrl} from '../../../_lib.js';
import {assessTranslationEvidence,readPublicEnglishDocumentRevision} from '../../../_translation.js';
import {requireEditorCapability} from '../../../_write_auth.js';

function idFrom(context){const n=Number(context.params.id);return Number.isInteger(n)&&n>0?n:null;}
function asHexHash(value){return typeof value==='string' && /^[a-f0-9]{64}$/i.test(value);}
function samePermission(value,id){
  return value && value.file_id===id &&
    value.mime_type==='application/vnd.google-apps.document' &&
    value.anyone_role==='writer';
}
function v2IdentityError(report,id,project){
  const docId=googleDocIdFromUrl(project.google_doc_url);
  const expectedTitle=project.title_en||project.title_ar;
  if(report.project_id!==id || report.project_title!==expectedTitle ||
    report.assignee!==project.assignee || report.target_document_id!==docId)
    return 'Evidence project identity, title, assignee or linked Google Doc does not match the live project.';
  if(!samePermission(report.target_permission,docId))
    return 'Verify the exact linked Google Doc metadata: its ID, native Docs MIME type, and Anyone with the link Editor permission are required.';
  if(report.source_page_basis!=='physical_pdf' || normalizeProject(project).page_count_verified!==true)
    return 'Verified physical-PDF page basis is required.';
  const previous=Number(project.translated_pages||0);
  if(report.expected_previous_pages!==previous || report.from_page!==previous+1)
    return 'Evidence checkpoint is stale or non-contiguous; refresh the live translated-page checkpoint.';
  return null;
}
export async function onRequestGet(context){
  const id=idFrom(context);if(!id)return json({error:'Invalid project id.'},400);
  const project=await context.env.DB.prepare('SELECT id FROM projects WHERE id=?').bind(id).first();
  if(!project)return json({error:'Project not found.'},404);
  let results;
  try{({results}=await context.env.DB.prepare(
    'SELECT id,from_page,to_page,source_pdf_sha256,google_doc_revision,recorded_by,created_at FROM translation_quality_evidence WHERE project_id=? ORDER BY to_page,id'
  ).bind(id).all());}
  catch{return json({error:'QA evidence table requires its guarded migration.',code:'schema_pending'},503);}
  return json({project_id:id,receipts:results||[],note:'These are submitted evidence-presence receipts, not independent certification that the manuscript matches its source.'});
}
export async function onRequestPost(context){
  const auth=await requireEditorCapability(context);
  if(!auth.ok)return json({error:auth.error},auth.status);
  await ensureCatalog(context.env.DB);
  const id=idFrom(context);if(!id)return json({error:'Invalid project id.'},400);
  const project=await context.env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();
  if(!project)return json({error:'Project not found.'},404);
  const report=await context.request.json().catch(()=>null);
  if(!report||typeof report!=='object')return json({error:'Invalid JSON report.'},400);
  if(!asHexHash(report.source_hash))return json({error:'Canonical PDF SHA-256 is required.'},400);
  if(typeof report.target_revision!=='string'||!/^public-export-sha256:[a-f0-9]{64}$/i.test(report.target_revision))
    return json({error:'A live public-export-sha256 Google Doc revision is required.'},400);
  if(Number(report.source_total_pages)!==Number(project.pages)||Number(report.to_page)>Number(project.pages)){
    return json({error:'Source-page denominator does not match project.'},409);
  }
  const v2=report.evidence_schema_version===2;
  if(v2){
    if(!/^[a-f0-9]{64}$/.test(report.source_hash))return json({error:'Version 2 source SHA-256 must be lowercase canonical hex.'},400);
    const identityError=v2IdentityError(report,id,project);
    if(identityError)return json({error:identityError,code:'identity_or_permission_mismatch'},409);
    const docId=googleDocIdFromUrl(project.google_doc_url);
    const live=await readPublicEnglishDocumentRevision(project);
    if(live.status!==200||!live.data.export_sha256 ||
      report.target_revision!=='public-export-sha256:'+live.data.export_sha256)
      return json({error:'Google Doc revision is stale or unavailable. Read the exact live linked document again before publishing QA.',code:'stale_manuscript_revision'},409);
    if(!Array.isArray(report.units)||report.units.some(unit=>
      unit.source_evidence_ref!=='source-pdf-sha256:'+report.source_hash+'#page='+unit.source_page ||
      typeof unit.target_evidence_ref!=='string' ||
      !unit.target_evidence_ref.startsWith('google-doc:'+docId+'#')))
      return json({error:'Every source unit needs a physical-PDF page reference and an anchor in the exact linked Google Doc.',code:'source_page_evidence_required'},409);
  }
  const wholeBook=report.from_page===1&&report.to_page===report.source_total_pages;
  const evaluated=assessTranslationEvidence(report,wholeBook);
  if(!evaluated.ready)return json({error:'Translation evidence preflight failed.',blockers:evaluated.blockers,warnings:evaluated.warnings},409);
  const latest=await context.env.DB.prepare('SELECT source_pdf_sha256 FROM translation_progress_checkpoints WHERE project_id=? ORDER BY id DESC LIMIT 1').bind(id).first();
  if(latest?.source_pdf_sha256 && latest.source_pdf_sha256!==report.source_hash && report.source_reconciled!==true){
    return json({error:'Source hash conflicts with previous checkpoint; explicit source reconciliation required.'},409);
  }
  const serialized=JSON.stringify(report);
  if(serialized.length>250000)return json({error:'Report is too large. Store compact evidence references, not full transcripts/source content.'},413);
  const actor=actorFromRequest(context.request);
  const existing=await context.env.DB.prepare('SELECT id,report_json FROM translation_quality_evidence WHERE project_id=? AND from_page=? AND to_page=? AND source_pdf_sha256=? AND google_doc_revision=?')
    .bind(id,report.from_page,report.to_page,report.source_hash,report.target_revision).first();
  if(existing){
    if(existing.report_json!==serialized)return json({error:'The same revision/range has a different receipt; change evidence version explicitly instead of overwriting.'},409);
    return json({receipt_id:existing.id,unchanged:true,warnings:evaluated.warnings,preflight_ready:true});
  }
  const commit=await context.env.DB.batch([
    context.env.DB.prepare('INSERT OR IGNORE INTO translation_quality_evidence (project_id,from_page,to_page,source_pdf_sha256,google_doc_revision,report_json,recorded_by) VALUES(?,?,?,?,?,?,?)')
      .bind(id,report.from_page,report.to_page,report.source_hash,report.target_revision,serialized,actor),
    context.env.DB.prepare("INSERT INTO activity(project_id,actor,action,before_json,after_json) SELECT ?,?,'translation QA evidence submitted',NULL,? WHERE changes()>0")
      .bind(id,actor,JSON.stringify({from_page:report.from_page,to_page:report.to_page,target_revision:report.target_revision}))
  ]);
  const receipt=await context.env.DB.prepare('SELECT id,report_json FROM translation_quality_evidence WHERE project_id=? AND from_page=? AND to_page=? AND source_pdf_sha256=? AND google_doc_revision=?')
    .bind(id,report.from_page,report.to_page,report.source_hash,report.target_revision).first();
  if(!receipt || receipt.report_json!==serialized)return json({error:'Conflicting QA receipt was saved concurrently. Refresh and reconcile rather than overwrite.'},409);
  const inserted=Number(commit?.[0]?.meta?.changes||0)>0;return json({receipt_id:receipt.id,unchanged:!inserted,preflight_ready:true,warnings:evaluated.warnings,
    limitation:'Presence and consistency of claimed evidence checked; not independently source/render verified.'},201);
}

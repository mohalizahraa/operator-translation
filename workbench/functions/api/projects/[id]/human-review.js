import {ensureCatalog,json,recordActivity} from '../../../_lib.js';
import {requireEditorCapability,requireHumanReviewerCapability} from '../../../_write_auth.js';
import {verifyLiveEnglishDocumentRevision} from '../../../_translation.js';

function idFrom(context){const n=Number(context.params.id);return Number.isInteger(n)&&n>0?n:null;}
export async function onRequestGet(context){
  const id=idFrom(context);if(!id)return json({error:'Invalid project id.'},400);
  const p=await context.env.DB.prepare('SELECT id FROM projects WHERE id=?').bind(id).first();
  if(!p)return json({error:'Project not found.'},404);
  let results;
  try{({results}=await context.env.DB.prepare(`SELECT id,reviewer_name,source_pdf_sha256,google_doc_revision,
    declared_scope,approved_at FROM translation_human_review_attestations WHERE project_id=? ORDER BY id DESC`).bind(id).all());}
  catch{return json({error:'Human review ledger requires its guarded migration.',code:'schema_pending'},503);}
  return json({project_id:id,attestations:results||[]});
}
export async function onRequestPost(context){
  const editor=await requireEditorCapability(context);
  if(!editor.ok)return json({error:editor.error},editor.status);
  const human=await requireHumanReviewerCapability(context);
  if(!human.ok)return json({error:human.error},human.status);
  await ensureCatalog(context.env.DB);
  const id=idFrom(context);if(!id)return json({error:'Invalid project id.'},400);
  const p=await context.env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();
  if(!p)return json({error:'Project not found.'},404);
  if(p.status!=='completed')return json({error:'Human review must be attested at Needs Review, not earlier.'},409);
  const body=await context.request.json().catch(()=>null);
  if(!body||body.approved!==true||body.declared_scope!=='entire final manuscript'){
    return json({error:'Explicit personal review confirmation and entire-final-manuscript scope are required.'},400);
  }
  const name=String(body.reviewer_name||'').trim();
  const revision=String(body.google_doc_revision||'').trim();
  const sourceHash=String(body.source_pdf_sha256||'').trim().toLowerCase();
  if(!['Zahraa','Mohammed'].includes(name)||!revision||!/^[a-f0-9]{64}$/.test(sourceHash)){
    return json({error:'Named authorized reviewer, exact target revision and canonical PDF SHA-256 are required.'},400);
  }
  const whole=await context.env.DB.prepare(`SELECT id FROM translation_quality_evidence
    WHERE project_id=? AND from_page=1 AND to_page=? AND source_pdf_sha256=? AND google_doc_revision=? LIMIT 1`)
    .bind(id,Number(p.pages||0),sourceHash,revision).first();
  if(!whole)return json({error:'No whole-book QA receipt matches this exact reviewed manuscript revision.'},409);
  const revisionCheck=await verifyLiveEnglishDocumentRevision(p,revision);
  if(!revisionCheck.ok)return json({error:revisionCheck.reason,code:revisionCheck.code},409);
  const open=await context.env.DB.prepare(`SELECT COUNT(*) AS count FROM translation_questions
    WHERE project_id=? AND severity='blocking' AND status<>'applied'`).bind(id).first();
  if(Number(open?.count||0)>0)return json({error:'Blocking Arabic editorial questions remain unresolved or unapplied.',open_blockers:open.count},409);
  const existing=await context.env.DB.prepare(`SELECT id FROM translation_human_review_attestations
    WHERE project_id=? AND reviewer_name=? AND source_pdf_sha256=? AND google_doc_revision=?`).bind(id,name,sourceHash,revision).first();
  if(existing)return json({attestation_id:existing.id,unchanged:true});
  const receipt=await context.env.DB.prepare(`INSERT INTO translation_human_review_attestations
    (project_id,source_pdf_sha256,google_doc_revision,reviewer_name,declared_scope)
    VALUES(?,?,?,?,'entire final manuscript') RETURNING id`).bind(id,sourceHash,revision,name).first();
  await recordActivity(context.env.DB,id,name,'human manuscript review attested',null,
    {attestation_id:receipt.id,revision,source_pdf_sha256:sourceHash});
  return json({attestation_id:receipt.id,reviewer_name:name,google_doc_revision:revision,
    note:'Recorded an explicit reviewer credential-backed attestation; this does not mechanically prove how thoroughly the human read the source.'},201);
}

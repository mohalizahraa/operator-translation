import {actorFromRequest,ensureCatalog,json,recordActivity,normalizeGoogleDocUrl,verifyGoogleDocLinkAccess} from '../../../_lib.js';
import {requireEditorCapability,requireHumanReviewerCapability} from '../../../_write_auth.js';

const idFrom=context=>{const n=Number(context.params.id);return Number.isInteger(n)&&n>0?n:null;};
const phrase=(v,max=4000)=>typeof v==='string'?v.trim().slice(0,max):'';
const statuses=new Set(['unresolved','answered','applied']);
const severities=new Set(['review','blocking']);
const validKey=s=>/^[a-zA-Z0-9_.:-]{3,180}$/.test(s);
async function projectFor(db,id){return db.prepare('SELECT id,questions_doc_url FROM projects WHERE id=?').bind(id).first();}
async function listQuestions(db,id) {
  const {results}=await db.prepare('SELECT * FROM translation_questions WHERE project_id=? ORDER BY source_page,id').bind(id).all();
  return (results||[]).map(row=>({...row,alternatives:JSON.parse(row.alternatives_json||'[]')}));
}
export async function onRequestGet(context){
  const id=idFrom(context);if(!id)return json({error:'Invalid project id.'},400);
  let project;
  try{project=await context.env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();}
  catch{return json({error:'Workbench project schema is unavailable.',code:'schema_pending'},503);}
  if(!project)return json({error:'Project not found.'},404);
  try{return json({project_id:id,questions_doc_url:project.questions_doc_url||null,questions:await listQuestions(context.env.DB,id)});}
  catch{return json({error:'Question ledger has not been migrated; a guarded mutation/deployment migration is needed.',code:'schema_pending'},503);}
}
export async function onRequestPost(context){
  const auth=await requireEditorCapability(context);
  if(!auth.ok)return json({error:auth.error},auth.status);
  await ensureCatalog(context.env.DB);
  const id=idFrom(context);if(!id)return json({error:'Invalid project id.'},400);
  const project=await projectFor(context.env.DB,id);
  if(!project)return json({error:'Project not found.'},404);
  const body=await context.request.json().catch(()=>null);
  if(!body||typeof body!=='object')return json({error:'Invalid JSON.'},400);
  const key=phrase(body.question_key,200),arabic=phrase(body.arabic_text,10000),rationale=phrase(body.rationale,8000);
  const page=Number(body.source_page);
  if(!validKey(key)||!Number.isInteger(page)||page<1||!arabic||!rationale)return json({error:'Question requires stable key, physical page, exact Arabic and rationale.'},400);
  const alternatives=body.alternatives;
  if(alternatives!==undefined&&(!Array.isArray(alternatives)||alternatives.length>15||alternatives.some(x=>typeof x!=='string'||x.length>1000))){
    return json({error:'Translation alternatives must be a bounded list of strings.'},400);
  }
  const severity=severities.has(body.severity)?body.severity:'review';
  const actor=actorFromRequest(context.request);
  const existing=await context.env.DB.prepare('SELECT * FROM translation_questions WHERE project_id=? AND question_key=?').bind(id,key).first();
  if(existing){
    // The stable key is idempotent, not a request to overwrite reviewer history.
    if(existing.source_page!==page||existing.arabic_text!==arabic) return json({error:'Question key already refers to a different source passage.'},409);
    return json({question:existing,unchanged:true});
  }
  // D1 batch is transactional: question + decision history + activity
  // either commit together or roll back. INSERT OR IGNORE handles a racing retry.
  const event=JSON.stringify({question_key:key,source_page:page});
  const result=await context.env.DB.batch([
    context.env.DB.prepare(`INSERT OR IGNORE INTO translation_questions
      (project_id,question_key,source_page,source_location,arabic_text,context_text,alternatives_json,proposed_english,rationale,confidence,severity,status)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,'unresolved')`).bind(
      id,key,page,phrase(body.source_location,1000)||null,arabic,phrase(body.context_text,6000)||null,
      JSON.stringify(alternatives||[]),phrase(body.proposed_english,6000)||null,rationale,
      phrase(body.confidence,100)||'uncertain',severity),
    context.env.DB.prepare(`INSERT INTO translation_question_events(question_id,actor,action,payload_json)
      SELECT id,?,'question captured',? FROM translation_questions
      WHERE project_id=? AND question_key=? AND changes()>0`).bind(actor,event,id,key),
    context.env.DB.prepare(`INSERT INTO activity(project_id,actor,action,before_json,after_json)
      SELECT ?,?,'translation question captured',NULL,?
      WHERE changes()>0`).bind(id,actor,JSON.stringify({question_key:key,source_page:page}))
  ]);
  const question=await context.env.DB.prepare('SELECT * FROM translation_questions WHERE project_id=? AND question_key=?').bind(id,key).first();
  if(!question || question.source_page!==page || question.arabic_text!==arabic)
    return json({error:'Question key conflicts with a concurrently captured different passage.'},409);
  const inserted=Number(result?.[0]?.meta?.changes||0)>0;
  return json({question,unchanged:!inserted},inserted?201:200);
}
export async function onRequestPatch(context){
  const auth=await requireEditorCapability(context);
  if(!auth.ok)return json({error:auth.error},auth.status);
  await ensureCatalog(context.env.DB);
  const id=idFrom(context);if(!id)return json({error:'Invalid project id.'},400);
  const body=await context.request.json().catch(()=>null);
  if(!body||typeof body!=='object')return json({error:'Invalid JSON.'},400);
  if(body.questions_doc_url!==undefined){
    const raw=phrase(body.questions_doc_url,1000);
    const normalized=normalizeGoogleDocUrl(raw);
    if(normalized===false)return json({error:'Questions document must be a valid Google Docs link.'},400);
    if(normalized){
      const access=await verifyGoogleDocLinkAccess(normalized);
      if(!access.accessible)return json({error:'Questions Google Doc cannot be read through the approved public access policy; correct its sharing first.'},409);
    }
    const old=await projectFor(context.env.DB,id);if(!old)return json({error:'Project not found.'},404);
    const actor=actorFromRequest(context.request);
    if((old.questions_doc_url||null)===(normalized||null))return json({project_id:id,questions_doc_url:normalized||null,unchanged:true});
    const updated=await context.env.DB.batch([
      context.env.DB.prepare('UPDATE projects SET questions_doc_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND questions_doc_url IS ?')
        .bind(normalized||null,id,old.questions_doc_url||null),
      context.env.DB.prepare(`INSERT INTO activity(project_id,actor,action,before_json,after_json)
        SELECT ?,?,'linked questions document',?,? WHERE changes()>0`)
        .bind(id,actor,JSON.stringify({questions_doc_url:old.questions_doc_url}),JSON.stringify({questions_doc_url:normalized||null}))
    ]);
    if(Number(updated?.[0]?.meta?.changes||0)!==1)return json({error:'Questions link changed concurrently; refresh and retry.'},409);
    return json({project_id:id,questions_doc_url:raw||null});
  }
  const key=phrase(body.question_key,200);
  if(!validKey(key)||!statuses.has(body.status))return json({error:'Provide valid question key and status.'},400);
  // The automated editor may capture/apply a decision, but cannot invent the
  // human review answer. A reviewer-only secret is required for a judgment.
  if(body.status==='answered'||body.status==='unresolved'){
    const reviewer=await requireHumanReviewerCapability(context);
    if(!reviewer.ok)return json({error:reviewer.error},reviewer.status);
  }
  const old=await context.env.DB.prepare('SELECT * FROM translation_questions WHERE project_id=? AND question_key=?').bind(id,key).first();
  if(!old)return json({error:'Question not found.'},404);
  const answer=phrase(body.reviewer_answer,10000);
  const applied=phrase(body.applied_reference,1000);
  if(body.status==='answered'&&!answer)return json({error:'Answered questions require the actual reviewer answer.'},400);
  if(body.status==='applied'&&(!old.reviewer_answer&&!answer||!applied))return json({error:'Applied questions require the prior reviewer decision and a target revision anchor.'},400);
  if(old.status==='applied'&&body.status!=='applied')return json({error:'Applied decisions are immutable; capture a new question/revision to supersede.'},409);
  if(body.status==='applied'&&old.status==='unresolved')return json({error:'A question must be answered before marking it applied.'},409);
  if(body.status==='applied' && answer && answer!==old.reviewer_answer){
    return json({error:'The automated manuscript writer cannot replace the human reviewer answer during application.'},409);
  }
  const actor=actorFromRequest(context.request);
  if(old.status===body.status)return json({question:old,unchanged:true});
  // Compare-and-swap the prior status; only one writer may claim a decision.
  // Keep question, event and activity in the same D1 transaction.
  const committed=await context.env.DB.batch([
    context.env.DB.prepare(`UPDATE translation_questions SET
      status=?,reviewer_answer=CASE WHEN ?<>'' THEN ? ELSE reviewer_answer END,
      applied_reference=CASE WHEN ?<>'' THEN ? ELSE applied_reference END,
      updated_at=CURRENT_TIMESTAMP WHERE id=? AND status=?`)
      .bind(body.status,answer,answer,applied,applied,old.id,old.status),
    context.env.DB.prepare(`INSERT INTO translation_question_events(question_id,actor,action,payload_json)
      SELECT ?,?,?,? WHERE changes()>0`).bind(
      old.id,actor,'question '+body.status,JSON.stringify({before:old.status,after:body.status,applied_reference:applied||null})),
    context.env.DB.prepare(`INSERT INTO activity(project_id,actor,action,before_json,after_json)
      SELECT ?,?,?,?,? WHERE changes()>0`).bind(
      id,actor,'translation question '+body.status,JSON.stringify({id:old.id,status:old.status}),JSON.stringify({id:old.id,status:body.status}))
  ]);
  if(Number(committed?.[0]?.meta?.changes||0)!==1)
    return json({error:'Question decision changed concurrently. Refresh to see the latest reviewer decision.'},409);
  const updated=await context.env.DB.prepare('SELECT * FROM translation_questions WHERE id=?').bind(old.id).first();
  return json({question:updated});
}

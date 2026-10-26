import {actorFromRequest,ensureCatalog,googleDocIdFromUrl,json} from '../../../_lib.js';
import {requireEditorCapability} from '../../../_write_auth.js';

// Records connector-observed native Docs comment anchors; Cloudflare does not
// have the Google OAuth grant needed to create, retrieve or verify comments.
// This route never edits a Google Doc, decides a question, or advances progress.
const idFrom=context=>{
  const id=Number(context.params.id);
  return Number.isInteger(id)&&id>0?id:null;
};
const string=(value,min,max)=>typeof value==='string'&&value.length>=min&&value.length<=max&&
  value.trim()===value&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
const keyValid=value=>string(value,3,180)&&/^[a-zA-Z0-9_.:-]+$/.test(value);
const commentValid=value=>string(value,8,180)&&/^(?:doco\.[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]{8,180})$/.test(value);
const anchorValid=value=>string(value,10,180)&&/^kix\.[a-zA-Z0-9_-]+$/.test(value);
const tabValid=value=>string(value,3,180)&&/^t\.[a-zA-Z0-9_.-]+$/.test(value);
const docIdValid=value=>string(value,20,120)&&/^[a-zA-Z0-9_-]+$/.test(value);

async function list(db,id) {
  const {results}=await db.prepare(`SELECT q.question_key,q.source_page,q.status AS decision_status,
    c.google_doc_id,c.comment_id,c.anchor_id,c.tab_id,c.quoted_text,c.document_revision,
    c.observed_state,c.verification_status,c.recorded_at,c.last_observed_revision,c.last_observed_at
    FROM translation_question_comments c
    JOIN translation_questions q ON q.id=c.question_id
    WHERE q.project_id=? ORDER BY q.source_page,q.id`).bind(id).all();
  return results||[];
}

export async function onRequestGet(context){
  const id=idFrom(context);
  if(!id)return json({error:'Invalid project id.'},400);
  const project=await context.env.DB.prepare('SELECT id,google_doc_url FROM projects WHERE id=?').bind(id).first();
  if(!project)return json({error:'Project not found.'},404);
  try{
    const currentDocId=googleDocIdFromUrl(project.google_doc_url);
    const commentLinks=(await list(context.env.DB,id)).map(link=>({
      ...link,matches_current_english_doc:link.google_doc_id===currentDocId,
    }));
    return json({project_id:id,google_doc_id:currentDocId,
      comment_links:commentLinks,stale_link_count:commentLinks.filter(link=>!link.matches_current_english_doc).length,
      observation_scope:'client_reported_unverified',
      note:'Native comment anchors are client-reported observations, not authenticated server-side Google Docs checks or independent human decisions. A mismatched manuscript link is stale and requires explicit reconciliation.'});
  }catch{
    return json({error:'Comment-link schema not yet migrated; deploy schema before reading.',code:'schema_pending'},503);
  }
}

export async function onRequestPost(context){
  const auth=await requireEditorCapability(context);
  if(!auth.ok)return json({error:auth.error},auth.status);
  const id=idFrom(context);
  if(!id)return json({error:'Invalid project id.'},400);
  const body=await context.request.json().catch(()=>null);
  if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid JSON comment observation.'},400);
  const {question_key,google_doc_id,comment_id,anchor_id,tab_id,quoted_text,document_revision,comment_text}=body;
  const isInherited=body.existing_comment_import===true;
  // A native Docs thread's last-known state cannot be presumed current from a mapping.
  // Decision and application state remain exclusively in translation_questions.
  if(!keyValid(question_key)||!docIdValid(google_doc_id)||!commentValid(comment_id)||
      !anchorValid(anchor_id)||!tabValid(tab_id)||!string(quoted_text,4,1000)||
      !string(document_revision,10,512)||!string(comment_text,8,6000)||
      (!isInherited&&!comment_text.includes(question_key))||body.confirmed_readback!==true){
    return json({error:'Supply a stable question key, exact manuscript ID, native comment/anchor/tab IDs, quoted text, revision and a connector readback including the question key.'},400);
  }
  await ensureCatalog(context.env.DB);
  const project=await context.env.DB.prepare('SELECT id,google_doc_url FROM projects WHERE id=?').bind(id).first();
  if(!project)return json({error:'Project not found.'},404);
  if(googleDocIdFromUrl(project.google_doc_url)!==google_doc_id){
    return json({error:'Comment is attached to a different document than the current Workbench English Book; no record was changed.'},409);
  }
  const question=await context.env.DB.prepare(
    'SELECT id FROM translation_questions WHERE project_id=? AND question_key=?'
  ).bind(id,question_key).first();
  if(!question)return json({error:'Capture this exact Arabic/source question in the D1 ledger before attaching a comment.'},409);

  const expected={google_doc_id,comment_id,anchor_id,tab_id,quoted_text,document_revision};
  const same=row=>row&&Object.entries(expected).every(([field,value])=>row[field]===value);
  const current=await context.env.DB.prepare(
    'SELECT * FROM translation_question_comments WHERE question_id=?'
  ).bind(question.id).first();
  if(current)return same(current)
    ? json({project_id:id,question_key,comment_id,unchanged:true,verification_status:'client_reported_unverified'})
    : json({error:'Question already has a different comment anchor. Reconcile the existing thread instead of overwriting it.'},409);

  const actor=actorFromRequest(context.request);
  const payload=JSON.stringify({question_key,comment_id,google_doc_id,tab_id,
    comment_origin:isInherited?'pre_existing':'new',verification_status:'client_reported_unverified'});
  // Atomic under D1: mapping, immutable question history, and visible activity.
  // INSERT OR IGNORE also protects the global (doc,comment) uniqueness constraint.
  await context.env.DB.batch([
    context.env.DB.prepare(`INSERT OR IGNORE INTO translation_question_comments
      (question_id,google_doc_id,comment_id,anchor_id,tab_id,quoted_text,document_revision,recorded_by)
      SELECT q.id,?,?,?,?,?,?,? FROM translation_questions q
      JOIN projects p ON p.id=q.project_id
      WHERE q.id=? AND q.project_id=? AND p.google_doc_url=?`)
      .bind(google_doc_id,comment_id,anchor_id,tab_id,quoted_text,document_revision,actor,
        question.id,id,project.google_doc_url),
    context.env.DB.prepare(`INSERT INTO translation_question_events(question_id,actor,action,payload_json)
      SELECT ? ,?,'native comment association recorded',? WHERE changes()>0`)
      .bind(question.id,actor,payload),
    context.env.DB.prepare(`INSERT INTO activity(project_id,actor,action,before_json,after_json)
      SELECT ?,?,'translation comment association recorded',NULL,? WHERE changes()>0`)
      .bind(id,actor,payload)
  ]);
  const written=await context.env.DB.prepare(
    'SELECT * FROM translation_question_comments WHERE question_id=?'
  ).bind(question.id).first();
  if(!same(written)){
    return json({error:'Comment association conflicted or the target book changed concurrently; inspect existing state.',code:'association_conflict'},409);
  }
  return json({project_id:id,question_key,comment_id,unchanged:false,
    verification_status:'client_reported_unverified',
    note:'This stores reported Docs readback only. Inherited comments may lack question keys in their original text. It is not a human decision or independent Google-side verification.'},201);
}

/* A connector-driven observation of one already-linked Docs comment.
   The server cannot authenticate Google comments itself; preserve this as
   a self-declared/client-reported snapshot, never a scholarly decision. */
export async function onRequestPatch(context){
  const auth=await requireEditorCapability(context);
  if(!auth.ok)return json({error:auth.error},auth.status);
  const id=idFrom(context);
  if(!id)return json({error:'Invalid project id.'},400);
  const body=await context.request.json().catch(()=>null);
  if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid JSON.'},400);
  const {question_key,google_doc_id,comment_id,anchor_id,quoted_text,observed_revision,resolved}=body;
  if(!keyValid(question_key)||!docIdValid(google_doc_id)||!commentValid(comment_id)||
      !anchorValid(anchor_id)||!string(quoted_text,4,1000)||
      !string(observed_revision,10,512)||typeof resolved!=='boolean'||body.confirmed_readback!==true){
    return json({error:'Provide matching source question, native comment anchor and exact quoted text, connector readback, Docs revision and explicit resolved state.'},400);
  }
  await ensureCatalog(context.env.DB);
  const db=context.env.DB;
  const project=await db.prepare('SELECT id,google_doc_url FROM projects WHERE id=?').bind(id).first();
  if(!project)return json({error:'Project not found.'},404);
  if(googleDocIdFromUrl(project.google_doc_url)!==google_doc_id)return json({error:'English Book changed; do not record a comment for another manuscript.'},409);
  const old=await db.prepare(`SELECT c.*,q.question_key FROM translation_question_comments c
    JOIN translation_questions q ON q.id=c.question_id
    WHERE q.project_id=? AND q.question_key=?`).bind(id,question_key).first();
  if(!old)return json({error:'The source question has no registered native comment association. Record/verify it before syncing thread status.'},409);
  if(old.google_doc_id!==google_doc_id||old.comment_id!==comment_id||old.anchor_id!==anchor_id||old.quoted_text!==quoted_text){
    return json({error:'Comment identity or anchor differs from its existing registered source; reconcile instead of rewriting history.'},409);
  }
  const next=resolved?'resolved':'open';
  if(old.observed_state===next&&old.last_observed_revision===observed_revision){
    return json({project_id:id,question_key,observed_state:next,unchanged:true,
      decision_status_unchanged:true,verification_status:'client_reported_unverified'});
  }
  const actor=actorFromRequest(context.request);
  const payload=JSON.stringify({question_key,comment_id,old_observed_state:old.observed_state,new_observed_state:next,
    observed_revision,verification_status:'client_reported_unverified'});
  const updates=await db.batch([
    db.prepare(`UPDATE translation_question_comments
      SET observed_state=?,last_observed_revision=?,last_observed_at=CURRENT_TIMESTAMP
      WHERE question_id=? AND observed_state=? AND last_observed_revision IS ?
      AND EXISTS(SELECT 1 FROM translation_questions q JOIN projects p ON p.id=q.project_id
        WHERE q.id=? AND p.google_doc_url=?)`)
      .bind(next,observed_revision,old.question_id,old.observed_state,old.last_observed_revision,old.question_id,project.google_doc_url),
    db.prepare(`INSERT INTO translation_question_events(question_id,actor,action,payload_json)
      SELECT ?,?,'native comment state observed',? WHERE changes()>0`).bind(old.question_id,actor,payload),
    db.prepare(`INSERT INTO activity(project_id,actor,action,before_json,after_json)
      SELECT ?,?,'translation comment state observed',NULL,? WHERE changes()>0`).bind(id,actor,payload)
  ]);
  if(Number(updates?.[0]?.meta?.changes||0)!==1)return json({error:'Comment observation changed concurrently; refresh the connector and retry.',code:'stale_comment_observation'},409);
  return json({project_id:id,question_key,observed_state:next,
    decision_status_unchanged:true,verification_status:'client_reported_unverified',
    note:'Thread resolution is not a human editorial answer or applied source check.'});
}

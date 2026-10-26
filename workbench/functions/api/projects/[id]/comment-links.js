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
  value.trim()===value&&!/[\u0000-\u001f\u007f]/.test(value);
const keyValid=value=>string(value,3,180)&&/^[a-zA-Z0-9_.:-]+$/.test(value);
const commentValid=value=>string(value,8,180)&&/^(?:doco\.[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]{8,180})$/.test(value);
const anchorValid=value=>string(value,10,180)&&/^kix\.[a-zA-Z0-9_-]+$/.test(value);
const tabValid=value=>string(value,3,180)&&/^t\.[a-zA-Z0-9_.-]+$/.test(value);
const docIdValid=value=>string(value,20,120)&&/^[a-zA-Z0-9_-]+$/.test(value);

async function list(db,id) {
  const {results}=await db.prepare(`SELECT q.question_key,q.source_page,q.status AS decision_status,
    c.google_doc_id,c.comment_id,c.anchor_id,c.tab_id,c.quoted_text,c.document_revision,
    c.observed_state,c.verification_status,c.recorded_at
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
    return json({project_id:id,google_doc_id:googleDocIdFromUrl(project.google_doc_url),
      comment_links:await list(context.env.DB,id),observation_scope:'connector_reported',
      note:'Native comment anchors are client-reported observations, not authenticated server-side Google Docs checks or independent human decisions.'});
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
    ? json({project_id:id,question_key,comment_id,unchanged:true,verification_status:'connector_reported'})
    : json({error:'Question already has a different comment anchor. Reconcile the existing thread instead of overwriting it.'},409);

  const actor=actorFromRequest(context.request);
  const payload=JSON.stringify({question_key,comment_id,google_doc_id,tab_id,
    comment_origin:isInherited?'pre_existing':'new',verification_status:'connector_reported'});
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
    verification_status:'connector_reported',
    note:'This stores reported Docs readback only. Inherited comments may lack question keys in their original text. It is not a human decision or independent Google-side verification.'},201);
}

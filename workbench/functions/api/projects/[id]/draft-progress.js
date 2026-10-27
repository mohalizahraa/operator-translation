import {json,googleDocIdFromUrl} from '../../../_lib.js';
import {readDraftProgress} from '../../../_draft_progress.js';

export async function onRequestGet(context){
  const id=Number(context.params.id);
  if(!Number.isSafeInteger(id)||id<1)return json({error:'Invalid project id.'},400);
  // Deliberately read-only: never run catalog/schema migrations on a polling path.
  const project=await context.env.DB.prepare(
    'SELECT id,status,google_doc_url,translated_pages,pages FROM projects WHERE id=?'
  ).bind(id).first();
  if(!project)return json({error:'Project not found.'},404);
  const documentId=googleDocIdFromUrl(project.google_doc_url);
  if(!documentId)return json({error:'Link an English Google Doc to read draft progress.',code:'draft_doc_missing'},409);
  try{
    const evidence=await readDraftProgress(documentId);
    return json({project_id:id,google_doc_id:documentId,
      ...evidence,checked_at:new Date().toISOString(),
      // These are displayed distinctly and never substituted for draft labels.
      verified_physical_pdf_pages:Number(project.translated_pages||0),
      verified_physical_pdf_total:Number(project.pages||0)});
  }catch(error){
    return json({error:'Cannot read draft progress from the linked Google Doc: '+error.message,
      code:'draft_export_unavailable'},502);
  }
}

import {json,normalizeProject} from '../../../_lib.js';
import {verifyLiveEnglishDocumentRevision} from '../../../_translation.js';

function pid(context){const n=Number(context.params.id);return Number.isInteger(n)&&n>0?n:null;}
export async function onRequestGet(context){
 const id=pid(context);if(!id)return json({error:'Invalid project id.'},400);
 const db=context.env.DB;
 const project=await db.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();
 if(!project)return json({error:'Project not found.'},404);
 let checkpoint,questions,receipts,attestations;
 try{
 [checkpoint,questions,receipts,attestations]=await Promise.all([
   db.prepare('SELECT source_pdf_sha256,google_doc_revision,to_pages FROM translation_progress_checkpoints WHERE project_id=? ORDER BY id DESC LIMIT 1').bind(id).first(),
   db.prepare(`SELECT status,severity,COUNT(*) AS count FROM translation_questions WHERE project_id=? GROUP BY status,severity`).bind(id).all(),
   db.prepare('SELECT from_page,to_page,source_pdf_sha256,google_doc_revision FROM translation_quality_evidence WHERE project_id=? ORDER BY from_page,to_page').bind(id).all(),
   db.prepare('SELECT reviewer_name,source_pdf_sha256,google_doc_revision,approved_at FROM translation_human_review_attestations WHERE project_id=? ORDER BY id DESC').bind(id).all()
 ]);
 }catch{return json({error:'Integrity ledger requires a guarded schema migration.',code:'schema_pending'},503);}
 const norm=normalizeProject(project),total=Number(project.pages||0);
 const allQuestions=questions?.results||[];
 const counter=(status,severity)=>Number(allQuestions.find(q=>q.status===status&&q.severity===severity)?.count||0);
 const openBlocking=counter('unresolved','blocking')+counter('answered','blocking');
 const unresolved=counter('unresolved','review')+counter('unresolved','blocking');
 const hash=checkpoint?.source_pdf_sha256||null;
 const relevant=(receipts?.results||[]).filter(r=>r.source_pdf_sha256===hash);
 let qaCovered=0;
 for(const part of relevant){if(part.from_page<=qaCovered+1&&part.to_page>qaCovered)qaCovered=part.to_page;}
 const candidates=relevant.filter(r=>r.from_page===1&&r.to_page===total);
 const whole=candidates.length?candidates[candidates.length-1]:null;
 const approval=(attestations?.results||[]).find(x=>whole&&x.source_pdf_sha256===whole.source_pdf_sha256&&x.google_doc_revision===whole.google_doc_revision)||null;
 const liveRequested=new URL(context.request.url).searchParams.get('verify_live')==='1';
 let liveRevision={ok:null,code:'not_checked'};
 if(liveRequested && whole) liveRevision=await verifyLiveEnglishDocumentRevision(project,whole.google_doc_revision);
 const approvalState=!approval?'not_attested':liveRequested&&!liveRevision.ok?'stale_or_unverifiable':liveRequested?'live_revision_matches':'not_live_checked';
 return json({
  project_id:id,book_title:project.title_en||project.title_ar,phase:project.status,
  source:{physical_pages:total,page_count_verified:norm.page_count_verified===true,pdf_status:project.pdf_status,
    current_checkpoint_pages:Number(project.translated_pages||0),source_sha256:hash},
  questions:{unresolved,blocking_open:openBlocking,answered_not_applied:counter('answered','review')+counter('answered','blocking')},
  evidence:{receipts:relevant.length,covered_pages:qaCovered,total_pages:total,whole_book_receipt:Boolean(whole),
    note:'Presence checks, not independent Arabic accuracy certification.'},
  review:{attestation_present:Boolean(approval),reviewer:approval?.reviewer_name||null,revision:approval?.google_doc_revision||null,
    status:approvalState,live_check:liveRevision.code},
  deployment:{editor_protection:'public_collaboration',
    qa_gate:context.env?.WORKBENCH_REQUIRE_QA_EVIDENCE==='1'?'enforced':'legacy'},
  warnings:[
   !norm.page_count_verified?'Source page count unverified':null,
   openBlocking?'Blocking editorial questions open':null,
   qaCovered<total?'Insufficient contiguous QA receipts':null,
   !whole?'Whole-book QA receipt absent':null,
   !approval?'No matching human approval':null,
   liveRequested&&!liveRevision.ok?'Live manuscript differs or cannot be checked':null
  ].filter(Boolean)
 });
}

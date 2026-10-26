#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
const file=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const schema=file('../schema.sql'),migration=file('../functions/_lib.js');
const questions=file('../functions/api/projects/[id]/questions.js');
const commentLinks=file('../functions/api/projects/[id]/comment-links.js');
const humanReview=file('../functions/api/projects/[id]/human-review.js');
const integrity=file('../functions/api/projects/[id]/integrity.js');
const translator=file('../functions/_translation.js');
const quality=file('../functions/api/projects/[id]/quality.js');
const progress=file('../functions/api/projects/[id]/progress.js');
const project=file('../functions/api/projects/[id].js');
const app=file('../public/app.js');
const revision=file('../functions/api/revision.js');
const health=file('../functions/api/health.js');
const middleware=file('../functions/_middleware.js');
for(const owner of [schema,migration]){
 for(const entity of ['translation_questions','translation_question_events','translation_question_comments','translation_quality_evidence','translation_human_review_attestations']){
   assert(owner.includes(entity),'Missing '+entity+' from schema or runtime migration');
 }
}
assert(questions.includes('requireEditorCapability'),'Questions writes reuse the open-collaboration middleware without a key.');
assert(questions.includes('question_key'),'Questions require stable idempotency keys');
assert(questions.includes('requireHumanReviewerCapability'),'Question answers carry human-declared decisions, not automatic model answers.');
assert(questions.includes('The automated manuscript writer cannot replace the human reviewer answer'),'Applying questions cannot rewrite reviewer decisions');
assert(questions.includes('translation_question_events'),'Questions preserve decision history');
assert(questions.includes('legacy_questions_link_read_only'),'Historical Questions-Doc URL mutations must be blocked.');
assert(!questions.includes('verifyGoogleDocLinkAccess'),'Deprecated question-link writes must not reappear as a hidden public endpoint.');
assert(questions.includes('recordActivity'),'Questions must advance shared revision token');
assert(quality.includes('assessTranslationEvidence'),'QA receipts require deterministic preflight');
assert(quality.includes('requireEditorCapability'),'QA writes pass through the open-collaboration guard.');
assert(quality.includes('recordActivity'),'QA receipts must trigger live UI sync');
assert(humanReview.includes('requireHumanReviewerCapability'),'Human approval must require explicit self-declaration, not an inferred AI approval.');
assert(humanReview.includes('requireEditorCapability'),'Human review uses the documented open editing model.');
assert(humanReview.includes('translation_quality_evidence'),'Human approval must bind to final QA revision');
assert(humanReview.includes('translation_questions'),'Blocking open translation questions must prevent approval');
assert(humanReview.includes('recordActivity'),'Human approval must update revision token');

assert(progress.includes('WORKBENCH_REQUIRE_QA_EVIDENCE'),'Quality gate must be explicitly configurable');
assert(progress.includes('qa_receipt_required'),'Marker-only updates must fail when gate is enforced');
assert(project.includes('qa_coverage_incomplete')&&project.includes('whole_book_qa_required'),'Stage changes must guard formatting and whole-book QA');
assert(project.includes('human_review_attestation_required'),'Human review cannot be inferred from automatic status');
assert(app.includes('data-open-questions')&&app.includes('data-open-legacy-questions'),'UI must open native manuscript comments while preserving historical Questions Docs.');
assert(!app.includes('data-link-questions'),'UI must not invite creation/linking of new standalone Questions Docs.');
assert(app.includes('project?.google_doc_url')&&app.includes('Review comments'),'Passage comments must open the canonical English manuscript.');
assert(commentLinks.includes('googleDocIdFromUrl(project.google_doc_url)'),'Native comment linkage must bind to the current exact English Book.');
assert(commentLinks.includes('comment_id')&&commentLinks.includes('anchor_id')&&commentLinks.includes('tab_id'),'Native comment linkage must preserve stable Google Docs anchor identity.');
assert(commentLinks.includes('connector_reported'),'No server-side Google OAuth check may be fabricated.');
assert(commentLinks.includes('question_key')&&commentLinks.includes('translation_question_events'),'Comment links must preserve D1 stable keys and question history.');
assert(commentLinks.includes('context.env.DB.batch(['),'Comment linkage and event/history must be atomic.');
assert(commentLinks.includes('confirmed_readback'),'Comment linkage must require explicit readback from the authenticated Docs client.');
assert(commentLinks.includes('existing_comment_import'),'Inherited native Docs comments must be linkable without inserting duplicate threads.');
assert(commentLinks.includes('export async function onRequestPatch'),'Native comment link API must receive connector-sourced resolved/open observations.');
assert(commentLinks.includes('decision_status_unchanged:true'),'A resolved Docs thread must not imply a scholarly answer or application.');
assert(schema.includes('last_observed_revision TEXT')&&migration.includes('last_observed_revision TEXT'),'Docs observation revisions require DB schema in both bootstrap and migration.');
assert(schema.includes("observed_state TEXT NOT NULL DEFAULT 'unknown'"),'Comment-state observations must not claim unverified existing threads are open.');
assert(!commentLinks.includes('UPDATE translation_questions SET'),'Comment thread state must not directly change human editorial decision status.');
assert(app.includes('data-human-review')&&!app.includes('x-workbench-reviewer-key'),'Human review must not ask for a credential key.');
assert(!app.includes("sessionStorage.getItem('workbench-editor-key')"),'Browser must not read an editor key to edit.');
assert(middleware.includes('Cross-origin edit requests')&&!middleware.includes('WORKBENCH_EDITOR_KEY'),'Open collaboration must retain cross-origin browser guard without any editor key.');
assert(health.includes('public_collaboration')&&health.includes('LEGACY_MARKER_ONLY'),'Public edits must be explicit and QA enforcement claims must remain evidence-bound.');
assert(revision.includes('FROM activity'),'Question/QA writes must be visible through activity revision');
assert(humanReview.includes('verifyLiveEnglishDocumentRevision'),'Human review requires live Google Doc revision check');
assert(project.includes('verifyLiveEnglishDocumentRevision'),'Publish Ready requires live Google Doc revision check');
assert(translator.includes("stale_manuscript_revision")&&translator.includes("unverifiable_revision"),'Stale or unverifiable manuscript must fail closed');
for(const route of [questions,quality,humanReview]){
  assert(route.includes('context.env.DB.batch(['),'Editorial mutation and history must be transactional');
}
assert(questions.includes('AND status=?'),'Question state updates must be compare-and-swap');
assert(integrity.includes('blocking_open')&&integrity.includes('verifyLiveEnglishDocumentRevision'),'Book integrity must show blocking questions and live stale manuscript checks');
assert(app.includes('data-view-integrity'),'Integrity UI must expose book-level readback');

console.log('Workbench editorial workflow routing and quality/security contracts: PASS (static checks; production flags not proven).');

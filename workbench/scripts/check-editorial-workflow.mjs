#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
const file=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const schema=file('../schema.sql'),migration=file('../functions/_lib.js');
const questions=file('../functions/api/projects/[id]/questions.js');
const humanReview=file('../functions/api/projects/[id]/human-review.js');
const quality=file('../functions/api/projects/[id]/quality.js');
const progress=file('../functions/api/projects/[id]/progress.js');
const project=file('../functions/api/projects/[id].js');
const app=file('../public/app.js');
const revision=file('../functions/api/revision.js');
const health=file('../functions/api/health.js');
const middleware=file('../functions/_middleware.js');
for(const owner of [schema,migration]){
 for(const entity of ['translation_questions','translation_question_events','translation_quality_evidence','translation_human_review_attestations']){
   assert(owner.includes(entity),'Missing '+entity+' from schema or runtime migration');
 }
}
assert(questions.includes('requireEditorCapability'),'Questions writes must be authorized');
assert(questions.includes('question_key'),'Questions require stable idempotency keys');
assert(questions.includes('translation_question_events'),'Questions preserve decision history');
assert(questions.includes('recordActivity'),'Questions must advance shared revision token');
assert(quality.includes('assessTranslationEvidence'),'QA receipts require deterministic preflight');
assert(quality.includes('requireEditorCapability'),'QA writes require editor capability');
assert(quality.includes('recordActivity'),'QA receipts must trigger live UI sync');
assert(humanReview.includes('requireHumanReviewerCapability'),'Human approval must have separate reviewer key');
assert(humanReview.includes('requireEditorCapability'),'Human approval must require existing edit capability');
assert(humanReview.includes('translation_quality_evidence'),'Human approval must bind to final QA revision');
assert(humanReview.includes('translation_questions'),'Blocking open translation questions must prevent approval');
assert(humanReview.includes('recordActivity'),'Human approval must update revision token');

assert(progress.includes('WORKBENCH_REQUIRE_QA_EVIDENCE'),'Quality gate must be explicitly configurable');
assert(progress.includes('qa_receipt_required'),'Marker-only updates must fail when gate is enforced');
assert(project.includes('qa_coverage_incomplete')&&project.includes('whole_book_qa_required'),'Stage changes must guard formatting and whole-book QA');
assert(project.includes('human_review_attestation_required'),'Human review cannot be inferred from automatic status');
assert(app.includes('data-link-questions')&&app.includes('data-open-questions'),'Questions Doc needs UI actions');
assert(app.includes('data-human-review')&&app.includes('x-workbench-reviewer-key'),'Review action must use reviewer-only secret per submission');
assert(app.includes("sessionStorage.getItem('workbench-editor-key')"),'Editor key should stay tab-session scoped');
assert(middleware.includes('WORKBENCH_EDITOR_KEY'),'Security policy must cover API mutations');
assert(health.includes('UNPROTECTED_LEGACY')&&health.includes('LEGACY_MARKER_ONLY'),'Do not claim security and QA are enabled by mere code presence');
assert(revision.includes('FROM activity'),'Question/QA writes must be visible through activity revision');
console.log('Workbench editorial workflow routing and quality/security contracts: PASS (static checks; production flags not proven).');

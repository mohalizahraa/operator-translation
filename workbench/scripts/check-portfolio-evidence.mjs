import assert from 'node:assert/strict';
import { summarizePortfolioEvidence, onRequestGet } from '../functions/api/portfolio-evidence.js';

const rows = [
  { id: 1, updated_at: '2026-10-20 06:15:00', whole_qa_receipt: 1, whole_qa_matched_review: 1 },
  { id: 2, updated_at: '2026-10-19 01:10:00', whole_qa_receipt: 0, whole_qa_matched_review: 0 },
  { id: 3, updated_at: '2026-10-18 01:10:00', whole_qa_receipt: 1, whole_qa_matched_review: 0 },
];
const x = summarizePortfolioEvidence(rows, '2026-10-21 03:00:00');
assert.equal(x.schema, 'workbench-portfolio-evidence-v1');
assert.equal(x.total_books, 3);
assert.equal(x.whole_book_qa_receipts_at_latest_checkpoint, 2);
assert.equal(x.self_declared_reviews_at_latest_checkpoint, 1);
assert.equal(x.source_updated_at, '2026-10-21T03:00:00.000Z');
assert.match(x.proof_limit, /Evidence-presence/);
assert.equal(JSON.stringify(x).includes('reviewer_name'), false);

const liveReads = [];
const db = {
  prepare(sql) {
    liveReads.push(sql);
    if (sql.includes('WITH latest_checkpoint')) {
      return { async all() { return { results: rows }; } };
    }
    if (sql.includes('FROM activity')) {
      return { async first() { return { last_change: '2026-10-21 03:00:00' }; } };
    }
    throw new Error('Unplanned SQL');
  },
};
const response = await onRequestGet({ env: { DB: db } });
assert.equal(response.status, 200);
const payload = await response.json();
assert.equal(payload.whole_book_qa_receipts_at_latest_checkpoint, 2);
assert.equal(payload.self_declared_reviews_at_latest_checkpoint, 1);
assert.equal(liveReads.length, 2, 'one bounded D1 join plus one source timestamp read');
assert.equal(payload.schema, 'workbench-portfolio-evidence-v1');
assert.match(payload.observed_at, /^\d{4}-/);
assert.throws(() => summarizePortfolioEvidence([], '2026-10-21 03:00:00'), /no project rows/);
assert.throws(() => summarizePortfolioEvidence([rows[0], rows[0]], '2026-10-21 03:00:00'), /duplicated/);
assert.throws(() => summarizePortfolioEvidence([
  { ...rows[1], whole_qa_matched_review: 1 },
], '2026-10-21 03:00:00'), /without a current whole-book QA/);
const failResponse = await onRequestGet({ env: { DB: { prepare() { throw Error('missing migration'); } } } });
assert.equal(failResponse.status, 503);
assert.equal((await failResponse.json()).code, 'evidence_unavailable');
console.log('Workbench portfolio evidence: revision-bound metadata counters, provenance, no sensitive data, fail-closed old schema.');

import { json } from '../_lib.js';

// Read-only aggregate of *submitted* evidence only. Presence is not Arabic
// fidelity, actual rendered formatting, an authenticated reviewer, or verified
// public publication. No source text, Google Doc links or reviewer names exit.
const QUERY = `
WITH latest_checkpoint AS (
  SELECT c.project_id, c.source_pdf_sha256, c.google_doc_revision
  FROM translation_progress_checkpoints c
  WHERE c.id = (
    SELECT MAX(x.id) FROM translation_progress_checkpoints x
    WHERE x.project_id = c.project_id
  )
)
SELECT p.id, p.updated_at,
  EXISTS (
    SELECT 1 FROM translation_quality_evidence q
    WHERE q.project_id = p.id AND p.pages > 0
      AND q.from_page = 1 AND q.to_page = p.pages
      AND q.source_pdf_sha256 = cp.source_pdf_sha256
      AND q.google_doc_revision = cp.google_doc_revision
  ) AS whole_qa_receipt,
  EXISTS (
    SELECT 1 FROM translation_human_review_attestations h
    WHERE h.project_id = p.id
      AND h.source_pdf_sha256 = cp.source_pdf_sha256
      AND h.google_doc_revision = cp.google_doc_revision
      AND EXISTS (
        SELECT 1 FROM translation_quality_evidence q
        WHERE q.project_id = p.id AND p.pages > 0
          AND q.from_page = 1 AND q.to_page = p.pages
          AND q.source_pdf_sha256 = h.source_pdf_sha256
          AND q.google_doc_revision = h.google_doc_revision
      )
  ) AS whole_qa_matched_review
FROM projects p
LEFT JOIN latest_checkpoint cp ON cp.project_id = p.id
ORDER BY p.id
`;

function epoch(value) {
  if (typeof value !== 'string' || !value.trim()) return NaN;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? value.replace(' ', 'T') + 'Z' : value;
  return Date.parse(normalized);
}

export function summarizePortfolioEvidence(rows, sourceTime) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('Portfolio evidence query returned no project rows.');
  const ids = new Set();
  let wholeQa = 0;
  let reviews = 0;
  let lastMutation = epoch(sourceTime);
  for (const row of rows) {
    const id = Number(row?.id);
    if (!Number.isSafeInteger(id) || id < 1 || ids.has(id)) {
      throw new Error('Portfolio evidence project IDs are invalid or duplicated.');
    }
    ids.add(id);
    const qa = Number(row.whole_qa_receipt) === 1;
    const review = Number(row.whole_qa_matched_review) === 1;
    if (review && !qa) throw new Error('Matched human review without a current whole-book QA receipt.');
    wholeQa += Number(qa);
    reviews += Number(review);
    const rowTime = epoch(row.updated_at);
    if (!Number.isFinite(rowTime)) throw new Error('Portfolio evidence project source timestamp is missing.');
    lastMutation = Math.max(lastMutation || 0, rowTime);
  }
  if (!Number.isFinite(lastMutation)) throw new Error('Portfolio evidence source mutation timestamp is unavailable.');
  return {
    schema: 'workbench-portfolio-evidence-v1',
    total_books: rows.length,
    whole_book_qa_receipts_at_latest_checkpoint: wholeQa,
    self_declared_reviews_at_latest_checkpoint: reviews,
    source_updated_at: new Date(lastMutation).toISOString(),
    proof_limit: 'Evidence-presence counters only; no live Google Doc revision check, source fidelity proof, authenticated reviewer identity or publication verification.',
  };
}

export async function onRequestGet(context) {
  try {
    const db = context.env?.DB;
    if (!db || typeof db.prepare !== 'function') throw new Error('Workbench DB binding unavailable.');
    const [projects, mutation] = await Promise.all([
      db.prepare(QUERY).all(),
      db.prepare('SELECT MAX(created_at) AS last_change FROM activity').first(),
    ]);
    const summary = summarizePortfolioEvidence(projects?.results || [], mutation?.last_change);
    return json({ ...summary, observed_at: new Date().toISOString() });
  } catch (error) {
    console.error('Workbench portfolio evidence unavailable:', error instanceof Error ? error.message : String(error));
    return json({ error: 'Evidence aggregate unavailable or schema migration pending.', code: 'evidence_unavailable' }, 503);
  }
}

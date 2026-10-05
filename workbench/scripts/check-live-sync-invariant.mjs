import fs from 'node:fs';

const app = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const revision = fs.readFileSync(new URL('../functions/api/revision.js', import.meta.url), 'utf8');
const pdfAudit = fs.readFileSync(new URL('../functions/api/pdf-audit.js', import.meta.url), 'utf8');

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`Live-sync invariant missing: ${label}`);
  }
}

requireText(app, 'const LIVE_REVISION_MS = 2000;', '2-second visible-tab revision polling');
requireText(app, 'const LIVE_REVISION_RETRY_MS = 1000;', '1-second retry after transient poll failure');
requireText(app, 'const LIVE_MARKER_SYNC_MS = 5000;', '5-second verified progress-marker cadence');
requireText(app, 'let markerSyncCursor = 0;', 'rotating marker-sync cursor');
requireText(app, 'const batch=Array.from({length:batchSize}', 'round-robin coverage for all eligible active translations');
requireText(app, "return String(data.revision ?? '');", 'opaque revision-token comparison');
requireText(app, "window.addEventListener('focus'", 'focus resynchronization');
requireText(app, "document.addEventListener('visibilitychange'", 'visibility resynchronization');

if (/\.sort\([\s\S]{0,250}?\.slice\(0,\s*3\)/.test(app)) {
  throw new Error('Live-sync invariant regression: marker sync is permanently capped to the same first three projects.');
}

requireText(revision, 'MAX(id)', 'activity changes in revision token');
requireText(revision, 'MAX(updated_at)', 'project/cover changes in revision token');
requireText(revision, 'FROM project_covers', 'cover changes in revision token');
requireText(revision, 'FROM workbench_meta', 'catalog/migration metadata in revision token');
requireText(revision, 'GROUP_CONCAT', 'stable metadata projection in revision token');

requireText(pdfAudit, 'pdf_check_note = ?, updated_at = ?', 'PDF-audit mutations advance project freshness');

console.log('Live-sync invariant: PASS');

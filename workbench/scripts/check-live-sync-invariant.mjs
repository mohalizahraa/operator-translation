import fs from 'node:fs';

const app = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const revision = fs.readFileSync(new URL('../functions/api/revision.js', import.meta.url), 'utf8');
const pdfAudit = fs.readFileSync(new URL('../functions/api/pdf-audit.js', import.meta.url), 'utf8');
const projectsIndex = fs.readFileSync(new URL('../functions/api/projects/index.js', import.meta.url), 'utf8');
const progressSync = fs.readFileSync(new URL('../functions/api/projects/[id]/progress-sync.js', import.meta.url), 'utf8');

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
requireText(app, "(p.status==='not_started' && (p.assignee===state.actor || p.assignee==='Both'))", 'first-checkpoint marker bootstrap candidates');
requireText(progressSync, 'bootstrapSourcePdfSha256(project)', 'server-side first-checkpoint source-identity bootstrap');
requireText(app, "return String(data.revision ?? '');", 'opaque revision-token comparison');
requireText(app, "window.addEventListener('focus'", 'focus resynchronization');
requireText(app, "document.addEventListener('visibilitychange'", 'visibility resynchronization');

if (/\.sort\([\s\S]{0,250}?\.slice\(0,\s*3\)/.test(app)) {
  throw new Error('Live-sync invariant regression: marker sync is permanently capped to the same first three projects.');
}

requireText(revision, 'MAX(id)', 'activity changes in revision token');
requireText(revision, 'MAX(updated_at)', 'project/cover changes in revision token');
requireText(revision, 'MAX(pdf_checked_at)', 'PDF-audit freshness in revision token');
requireText(revision, 'FROM project_covers', 'cover changes in revision token');
requireText(revision, 'FROM workbench_meta', 'catalog/migration metadata in revision token');
requireText(revision, 'GROUP_CONCAT', 'stable metadata projection in revision token');

if (pdfAudit.includes('pdf_check_note = ?, updated_at = ?')) {
  throw new Error('Live-sync invariant regression: background PDF audit must not overwrite semantic project updated_at.');
}

if (projectsIndex.includes('syncActiveTranslationMarkers')) {
  throw new Error('Live-sync invariant regression: GET /api/projects must remain read-only.');
}
if (progressSync.includes('SET notes =')) {
  throw new Error('Live-sync invariant regression: verified marker sync must not overwrite project notes.');
}
requireText(progressSync, "headers.get('x-workbench-actor')", 'verified marker sync preserves collaborator attribution');
for (const field of ['p.title_en','p.pages','p.notes','p.source_pdf_url','p.pdf_checked_at','p.pdf_check_note','p.page_count_verified','p.has_uploaded_cover']) {
  requireText(app, field, `shared project render signature includes ${field}`);
}


for (const path of [
  '../functions/api/health.js',
  '../functions/api/projects/index.js',
  '../functions/api/projects/[id].js',
  '../functions/api/projects/[id]/translation-context.js',
  '../functions/api/projects/[id]/source-pack.js',
  '../functions/api/translations/current.js',
  '../functions/api/cover/[id].js',
]) {
  const source=fs.readFileSync(new URL(path,import.meta.url),'utf8');
  const handler=path.endsWith('/health.js')
    ? source.split('export async function onRequest(context) {')[1]
    : source.split('export async function onRequestGet(context) {')[1]?.split(/export async function onRequest\w+\(/)[0];
  if (!handler || handler.includes('await ensureCatalog(')) {
    throw new Error(`GET read-purity regression: ${path} invokes database migrations.`);
  }
}
requireText(app,"const canRetry = String(options.method || 'GET').toUpperCase() === 'GET';",'only idempotent GETs may be retried');
requireText(app,'scheduleWorkspaceRecovery();','automatic recovery after startup 503');
requireText(app,'workspaceLoadInFlight','single-flight boot recovery');


requireText(app, 'let boardUnassignedExpanded = false;', 'persist Team inbox expansion between Board redraws');
requireText(app, "if (disclosure.open) populate();", 'initialize visible Team inbox cards');
requireText(app, "grid.dataset.loaded='true';", 'render unassigned cards only when expanded');
requireText(app, "boardUnassignedExpanded=disclosure.open;", 'preserve user open/closed choice');
requireText(app, 'data-empty=', 'mark genuinely empty Board stages for mobile projection');
const styles=fs.readFileSync(new URL('../public/styles.css',import.meta.url),'utf8');
requireText(styles, '.board[data-mobile-all="true"] .board-col[data-empty="true"]{display:none}', 'hide empty statuses from mobile All view');

console.log('Live-sync invariant: PASS');

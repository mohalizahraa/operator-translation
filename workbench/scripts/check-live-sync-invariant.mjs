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
requireText(app,'async function syncVerifiedTranslationMarkers()', 'marker-only browser write gate');
if (app.includes('/progress-sync`,{method:\'POST\'}')) {
  throw new Error('Marker-only browser sync must not advance translated progress.');
}
requireText(progressSync, "code:'qa_receipt_required'", 'marker-only progress writes fail closed');
if (progressSync.includes('SET notes =')) {
  throw new Error('Live-sync invariant regression: verified marker sync must not overwrite project notes.');
}
requireText(progressSync, "headers.get('x-workbench-actor')", 'evidence-bound sync preserves collaborator attribution');
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


requireText(app, "state.viewScope === 'Shared' ? matching : matching.filter(viewScopeMatches)",'Shared Board includes all catalogue books');
requireText(app, 'unassigned included','Unassigned books included in Board totals');
requireText(app, 'data-empty=', 'mark genuinely empty stages for mobile projection');
const styles=fs.readFileSync(new URL('../public/styles.css',import.meta.url),'utf8');
requireText(styles, '.board[data-mobile-all="true"] .board-col[data-empty="true"]{display:none}', 'hide empty mobile stages');
requireText(styles, 'align-items:start;padding-bottom:8px', 'avoid stretching kanban columns');
requireText(styles, '.board-list>.project-card{flex:none}', 'avoid stretching individual cards');

const activityApi=fs.readFileSync(new URL('../functions/api/activity.js',import.meta.url),'utf8');
requireText(activityApi,"projection === 'ui'",'compact Activity payload option');
for (const field of ['status','translated_pages','pages']) {
  requireText(activityApi, "json_extract(a.before_json, '$." + field + "')", 'retain historical before '+field);
  requireText(activityApi, "json_extract(a.after_json, '$." + field + "')", 'retain historical after '+field);
}
requireText(activityApi, "const [activity, paceEvents]", 'archival Activity route remains full fidelity');
requireText(app, "void refreshActivityData();", 'Activity refresh is independent of project load');
requireText(progressSync, "body.assignee!==project.assignee", 'evidence-bound sync must match the assigned translator');
requireText(app, 'const active=VIEW_RENDERERS[view];','render only active Workbench view');
requireText(app, 'if (state.projects.length) render();','refresh view on navigation');
const progressSyncRead=fs.readFileSync(new URL('../functions/api/projects/[id]/progress-sync.js',import.meta.url),'utf8');
const markerReader=progressSyncRead.split('async function readMarker(context) {')[1]?.split('export async function onRequestGet')[0];
if (!markerReader || markerReader.includes('ensureCatalog(')) {
  throw new Error('High-frequency marker reads must not run D1 schema migrations.');
}
requireText(progressSyncRead,"return publishProgress({...context,request,evidenceBoundSync:true});",'evidence-bound checkpoints use guarded mutation validation');
console.log('Live-sync invariant: PASS');

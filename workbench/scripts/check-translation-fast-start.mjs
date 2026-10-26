import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const schema = read('schema.sql');
const lib = read('functions/_lib.js');
const helper = read('functions/_translation.js');
const context = read('functions/api/projects/[id]/translation-context.js');
const sourcePack = read('functions/api/projects/[id]/source-pack.js');
const current = read('functions/api/translations/current.js');
const project = read('functions/api/projects/[id].js');
const projectsIndex = read('functions/api/projects/index.js');
const progress = read('functions/api/projects/[id]/progress.js');
const progressSync = read('functions/api/projects/[id]/progress-sync.js');

assert(schema.includes('CREATE TABLE IF NOT EXISTS translation_focus'), 'translation_focus table is missing.');
assert(schema.includes('CREATE TABLE IF NOT EXISTS translation_source_packs'), 'translation_source_packs table is missing.');
assert(lib.includes('ON CONFLICT(assignee) DO NOTHING'), 'Focus bootstrap must not overwrite an explicit runtime focus.');
assert(lib.includes("catalog_id='book-2'") && lib.includes('official-series-index'), 'Known book-2 source-recovery seed/index is missing.');

assert(helper.includes("context_version: 'translation-fast-start-v1'"), 'Composite fast-start context version is missing.');
assert(helper.includes('function translationResumeInstruction(project, nextSourcePage, totalPages)'), 'Fast-start context is not workflow-stage aware.');
assert(helper.includes("'Translation text is complete. Do not resume source-page translation."), 'Needs Formatting must not instruct an agent to keep translating.');
assert(helper.includes("'The book is in Needs Review. Do not resume source-page translation."), 'Needs Review must not instruct an agent to keep translating.');
assert(helper.includes('projectResumeNoteProjection') && helper.includes('volatile translation-resume note was withheld'), 'Conflicting volatile project notes are not quarantined from resume authority.');
assert(helper.includes('archived_resume_note') && helper.includes("project.status === 'in_progress'"), 'Phase-specific source-pack resume notes are not archived outside Translating.');
assert(helper.includes('normalizedProject.page_count_verified === true'), 'Fast-start marker use must require a verified physical-page denominator.');
assert(helper.includes('hasCheckpointSourceIdentity'), 'Fast-start marker use must require checkpointed source-PDF identity.');
assert(helper.includes('effective_translated_pages') && helper.includes('verified-marker-ahead-of-d1'), 'Context does not reconcile a verified live marker ahead of D1.');
assert(helper.includes('workbench_pdf_url') && helper.includes('source_pdf_sha256'), 'Context is missing canonical source identity/access.');
assert(helper.includes("sentinel: '[[NEXT_BATCH]]'"), 'Context is missing the exact manuscript continuation sentinel.');
assert(helper.includes("project.assignee === 'Both' && TRANSLATORS.has(actor)"), 'Shared-book focus preservation is missing.');

assert(helper.includes("mode: 'native_anchored_comments_with_d1_ledger'"), 'Fast-start must surface the approved manuscript-native editorial question mode.');
assert(helper.includes("comment_bridge_status: 'not_deployed'"), 'Fast-start must not claim a Google Docs comments/D1 sync bridge already exists.');
assert(helper.includes("legacy_questions_doc_role: 'read_only_migration_witness'"), 'Existing Questions Docs must remain migration witnesses, not new prerequisites.');
assert(helper.includes('Do not create separate Questions Docs.'), 'Fast-start must not tell collaborators to create new Questions Docs.');
assert(context.includes('getTranslationContext'), 'Per-project translation-context endpoint is not wired to the composite owner.');
assert(sourcePack.includes('translation_source_packs') && sourcePack.includes('recovery_routes'), 'Source-pack persistence endpoint is incomplete.');
assert(sourcePack.includes("recordActivity") && sourcePack.includes("'updated translation source pack'"), 'Source-pack mutations must participate in shared live revision via Activity.');
assert(current.includes('resolveCurrentTranslation') && current.includes('getTranslationContext'), 'Current-translation endpoint does not resolve and return a one-hop context.');
assert(current.includes("'updated translation focus'"), 'Explicit focus mutation must be recorded in Activity.');
assert(project.includes('syncTranslationFocusForProject'), 'Project lifecycle updates do not synchronize translation focus.');
assert(projectsIndex.includes('syncTranslationFocusForProject') && projectsIndex.includes('created project'), 'New projects that begin Translating do not synchronize translation focus.');
assert(progress.includes('syncTranslationFocusForProject'), 'Verified page progress does not synchronize translation focus.');
assert(progressSync.includes('readPublicProgressMarker'), 'Live marker parsing is not consolidated at the shared translation helper.');
assert(progressSync.includes("progressActor=['Zahraa','Mohammed'].includes(requestedActor)"), 'Existing collaborator attribution in marker sync was lost.');

console.log('Translation fast-start invariants: PASS');

import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const generic = read('functions/api/projects/[id].js');
const progress = read('functions/api/projects/[id]/progress.js');
const app = read('public/app.js');
const catalog = read('functions/_catalog.js');
const progressSync = read('functions/api/projects/[id]/progress-sync.js');
const translation = read('functions/_translation.js');

assert(
  generic.includes("Translation progress is verification-owned. Use the dedicated progress checkpoint endpoint."),
  'Generic project PATCH must reject translated_pages.'
);
assert(
  !/translated_pages\s*:\s*Number\(\$\('translated-pages'\)/.test(app),
  'Project editor must not submit translated_pages.'
);
assert(
  app.includes('async function syncVerifiedTranslationMarkers()') &&
  !app.includes('/progress-sync`,{method:\'POST\'}'),
  'Workbench browser must not advance translated progress from a marker alone.'
);
assert(
  progressSync.includes("code:'qa_receipt_required'"),
  'Marker-only progress writes must fail closed until a revision-matched QA receipt is submitted.'
);
assert(
  progressSync.includes('bootstrapSourcePdfSha256(project)') &&
  progressSync.includes('MAX_SOURCE_HASH_BYTES') &&
  progressSync.includes('sourceHash=bootstrapped.sha256'),
  'Verified marker sync must safely bootstrap first-checkpoint source identity from the verified available PDF.'
);
assert(
  progress.includes('Translation page checkpoints require a verified physical-PDF page denominator.'),
  'Progress endpoint must reject unverified physical-page denominators.'
);
assert(
  translation.includes('Verified marker sync requires a verified physical-PDF page denominator.'),
  'Shared marker reader must reject unverified physical-page denominators.'
);
for (const required of ['expected_previous_pages','source_total_pages','source_pdf_sha256','google_doc_revision']) {
  assert(progress.includes(required), `Progress endpoint missing required checkpoint field: ${required}`);
}
assert(
  progress.includes('Stale translation-progress checkpoint'),
  'Progress endpoint must fail closed on stale expected_previous_pages.'
);
assert(
  progress.includes('evidence_bound_sync_required') && progressSync.includes('evidenceBoundSync:true'),
  'Progress changes must be callable only through the evidence-bound sync owner.'
);
assert(
  progress.includes('translation_progress_checkpoints'),
  'Progress endpoint must persist checkpoint evidence.'
);

const book123 = catalog.match(/"catalog_id": "book-123"[\s\S]*?"date": "2013-02-03"/)?.[0] || '';
assert(book123.includes('"pages": 132'), 'Repentance physical PDF denominator must remain 132.');

console.log('Translation progress invariants: PASS');

assert(
  generic.includes('function validStatusTransition(from, to)') && generic.includes('Math.abs(a-b) === 1'),
  'Generic project PATCH must enforce adjacent workflow transitions.'
);
assert(
  generic.includes('publication is a separate step and cannot remain set while rewinding workflow.'),
  'Published must remain a separate post-Publish-Ready step.'
);
assert(
  !progressSync.includes('SET notes ='),
  'Verified progress synchronization must never overwrite freeform project notes.'
);

assert(
  generic.includes('Verified source-page translation must reach the physical PDF total before Needs Formatting.'),
  'Verified translation completion gate is missing from generic project PATCH.'
);

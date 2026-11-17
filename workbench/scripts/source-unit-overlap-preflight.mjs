#!/usr/bin/env node
/**
 * Private-manifest preflight for source-aligned English manuscript appends.
 * The manifest must be built from a FRESH read of the actual destination Doc,
 * not only from the progress dashboard, an earlier session or a stale checklist.
 * This check never calls external services or mutates a document.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const fail = code => { throw new Error('SOURCE_APPEND_BLOCKED: ' + code); };
const validId = x => Number.isSafeInteger(x) && x >= 1 && x <= 176;
const validSha = x => typeof x === 'string' && /^[a-f0-9]{64}$/i.test(x);
const validRevision = x => typeof x === 'string' && x.trim().length >= 12;
const validSpan = x => x && Number.isSafeInteger(x.fromPage) && Number.isSafeInteger(x.toPage)
  && x.fromPage >= 1 && x.toPage >= x.fromPage && x.toPage <= 20000;
const nonblank = x => typeof x === 'string' && x.trim().length > 0;

/**
 * Fail closed if the proposed source pages may already exist in the live target.
 * Page-level overlap includes partial/continuation pages: the writer must
 * reconcile a pre-existing source unit through a separate, revision-bound
 * AMEND operation, not append a second translation of the same page.
 *
 * Inputs contain NO manuscript text or private destination URLs.
 */
export function assertSafeSourceAppend({ projectId, currentTargetRevision, sourceSha256, manifest, proposed }) {
  if (!validId(projectId)) fail('INVALID_PROJECT_ID');
  if (!validRevision(currentTargetRevision)) fail('MISSING_LIVE_TARGET_REVISION');
  if (!validSha(sourceSha256)) fail('UNVERIFIED_CANONICAL_SOURCE_HASH');
  if (!manifest || manifest.projectId !== projectId || !validSha(manifest.sourceSha256)
      || manifest.sourceSha256.toLowerCase() !== sourceSha256.toLowerCase())
    fail('MANIFEST_SOURCE_IDENTITY_MISMATCH');
  if (!validRevision(manifest.targetRevision)
      || manifest.targetRevision !== currentTargetRevision)
    fail('STALE_MANIFEST_TARGET_REVISION');
  if (manifest.coverageAudited !== true || !Array.isArray(manifest.existingUnits))
    fail('CURRENT_TARGET_COVERAGE_NOT_AUDITED');
  if (manifest.existingUnits.length === 0 && manifest.blankTargetVerified !== true)
    fail('EMPTY_COVERAGE_WITHOUT_BLANK_TARGET_PROOF');
  if (!proposed || proposed.mode !== 'append' || proposed.projectId !== projectId
      || !nonblank(proposed.sourceUnitId) || !validSpan(proposed)
      || proposed.sourceSha256?.toLowerCase() !== sourceSha256.toLowerCase())
    fail('INVALID_PROPOSED_SOURCE_UNIT');

  const ids = new Set();
  for (const old of manifest.existingUnits) {
    if (!validSpan(old) || !nonblank(old.sourceUnitId)) fail('INVALID_EXISTING_SOURCE_MAP');
    if (ids.has(old.sourceUnitId)) fail('DUPLICATE_EXISTING_SOURCE_UNIT_ID');
    ids.add(old.sourceUnitId);
    if (old.sourceUnitId === proposed.sourceUnitId)
      fail('EXISTING_SOURCE_UNIT_ALREADY_DRAFTED');
    if (old.fromPage <= proposed.toPage && proposed.fromPage <= old.toPage)
      fail('OVERLAPPING_SOURCE_PHYSICAL_PAGES');
  }
  return {
    ok: true,
    projectId,
    fromPage: proposed.fromPage,
    toPage: proposed.toPage,
    checkedExistingUnits: manifest.existingUnits.length,
  };
}

/**
 * Validate a PDF search result's location: L is a global extraction line ID,
 * while P is a zero-based physical PDF page index. A line number is NEVER
 * evidence of the physical page number. This is metadata validation only:
 * it does not prove source-content absence, edition identity or fidelity.
 */
export function assertSourcePdfPageLocator({ sourceLocator, physicalPage, sourcePageCount }) {
  if (typeof sourceLocator !== 'string') fail('INVALID_SOURCE_PAGE_LOCATOR');
  const match = /^L([0-9]+)@P([0-9]+)$/.exec(sourceLocator);
  if (!match) fail('INVALID_SOURCE_PAGE_LOCATOR');
  const globalLine = Number(match[1]);
  const pdfPageIndex = Number(match[2]);
  if (!Number.isSafeInteger(sourcePageCount) || sourcePageCount < 1
      || !Number.isSafeInteger(globalLine) || !Number.isSafeInteger(pdfPageIndex)
      || pdfPageIndex < 0 || pdfPageIndex >= sourcePageCount)
    fail('INVALID_SOURCE_PDF_PAGE_RANGE');
  if (!Number.isSafeInteger(physicalPage) || physicalPage < 1
      || physicalPage > sourcePageCount || physicalPage !== pdfPageIndex + 1)
    fail('PDF_SOURCE_PAGE_MISMATCH');
  return { sourceGlobalLine: globalLine, pdfPageIndex, physicalPage, sourcePageCount };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv[2] === '--check-pdf-page') {
    if (process.argv.length !== 4) fail('USAGE: --check-pdf-page /private/witness.json');
    const witness = JSON.parse(readFileSync(process.argv[3], 'utf8'));
    const result = assertSourcePdfPageLocator(witness);
    process.stdout.write('PDF_PAGE_LOCATOR_PREFLIGHT_PASS ' + JSON.stringify(result) + '\\n');
    process.exit(0);
  }
  const [manifestPath, proposalPath] = process.argv.slice(2);
  if (!manifestPath || !proposalPath) fail('USAGE: manifest.json proposal.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const proposed = JSON.parse(readFileSync(proposalPath, 'utf8'));
  const result = assertSafeSourceAppend({
    projectId: proposed.projectId,
    currentTargetRevision: proposed.currentTargetRevision,
    sourceSha256: proposed.sourceSha256,
    manifest,
    proposed,
  });
  // Do not output revision, URLs, identities of private Google Docs, or text.
  process.stdout.write('SOURCE_APPEND_PREFLIGHT_PASS ' + JSON.stringify(result) + '\n');
}

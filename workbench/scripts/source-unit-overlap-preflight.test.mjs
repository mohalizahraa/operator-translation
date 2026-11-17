import test from 'node:test';
import assert from 'node:assert/strict';
import { assertSafeSourceAppend } from './source-unit-overlap-preflight.mjs';

const sha = 'a'.repeat(64);
const revision = 'revision-unique-20261116';
const base = () => ({
  projectId: 12,
  currentTargetRevision: revision,
  sourceSha256: sha,
  manifest: {
    projectId: 12,
    sourceSha256: sha,
    targetRevision: revision,
    coverageAudited: true,
    existingUnits: [
      { sourceUnitId: 'intro-21-24', fromPage: 21, toPage: 24 },
      { sourceUnitId: 'ritual-25-36', fromPage: 25, toPage: 36 },
      { sourceUnitId: 'sanctity-37-40', fromPage: 37, toPage: 40 },
    ],
  },
  proposed: {
    mode: 'append', projectId: 12, sourceSha256: sha,
    sourceUnitId: 'new-source-41-44', fromPage: 41, toPage: 44,
  },
});
const rejects = (modify, code) => {
  const args = base();
  modify(args);
  assert.throws(() => assertSafeSourceAppend(args), new RegExp(code));
};

test('unique later physical-page span passes with fresh audited source map', () => {
  assert.deepEqual(assertSafeSourceAppend(base()), {
    ok: true, projectId: 12, fromPage: 41, toPage: 44, checkedExistingUnits: 3,
  });
});
test('duplicate source pages fail even with a fresh revision and a different source unit ID', () => {
  rejects(x => { x.proposed.sourceUnitId = 'different-id-same-pages'; x.proposed.fromPage = 37; x.proposed.toPage = 40; }, 'OVERLAPPING_SOURCE_PHYSICAL_PAGES');
});
test('partial overlap is not an append — use bounded amend/reconciliation', () => {
  rejects(x => { x.proposed.fromPage = 40; x.proposed.toPage = 43; }, 'OVERLAPPING_SOURCE_PHYSICAL_PAGES');
});
test('same source unit ID cannot be appended twice', () => {
  rejects(x => { x.proposed.sourceUnitId = 'sanctity-37-40'; }, 'EXISTING_SOURCE_UNIT_ALREADY_DRAFTED');
});
test('stale actual target revision is blocked even if source pages appear disjoint', () => {
  rejects(x => { x.currentTargetRevision = 'revision-other-20261116'; }, 'STALE_MANIFEST_TARGET_REVISION');
});
test('a manifest from a different source PDF/edition is blocked', () => {
  rejects(x => { x.manifest.sourceSha256 = 'b'.repeat(64); }, 'MANIFEST_SOURCE_IDENTITY_MISMATCH');
});
test('unverified source mapping cannot authorize an append', () => {
  rejects(x => { x.manifest.coverageAudited = false; }, 'CURRENT_TARGET_COVERAGE_NOT_AUDITED');
});
test('empty map must come from verified blank native document', () => {
  rejects(x => { x.manifest.existingUnits = []; }, 'EMPTY_COVERAGE_WITHOUT_BLANK_TARGET_PROOF');
  const args = base();
  args.manifest.existingUnits = [];
  args.manifest.blankTargetVerified = true;
  assert.equal(assertSafeSourceAppend(args).ok, true);
});
test('invalid page numbering, source unit and project IDs fail closed', () => {
  rejects(x => { x.proposed.toPage = 0; }, 'INVALID_PROPOSED_SOURCE_UNIT');
  rejects(x => { x.proposed.sourceUnitId = ''; }, 'INVALID_PROPOSED_SOURCE_UNIT');
  rejects(x => { x.projectId = 90; }, 'MANIFEST_SOURCE_IDENTITY_MISMATCH');
  rejects(x => { x.proposed.projectId = 13; }, 'INVALID_PROPOSED_SOURCE_UNIT');
});
test('repeated IDs in existing mapping fail rather than trusting a damaged map', () => {
  rejects(x => { x.manifest.existingUnits.push({sourceUnitId:'sanctity-37-40',fromPage:500,toPage:501}); }, 'DUPLICATE_EXISTING_SOURCE_UNIT_ID');
});

#!/usr/bin/env node
/**
 * Fail-closed, read-only preflight for Google Docs manuscript migrations.
 *
 * Input is a PRIVATE per-project inventory. Never put it, source text, Drive
 * file IDs, or URLs in this repository, CI logs, or public GitHub issues.
 * This script neither creates/copies Google Docs nor calls the live Workbench.
 * The caller must independently collect fresh API and Drive evidence first.
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const CONTENT = new Set(['nonempty', 'empty', 'unknown']);
const ACTIONS = new Set(['copy_existing', 'create_draft', 'attach_target']);
const ID = /^[a-zA-Z0-9_-]{20,}$/;
const normalized = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
const validId = value => typeof value === 'string' && ID.test(value);
function block(errors, when, code) { if (when) errors.push(code); }

/**
 * Each row references one EXACT Workbench project ID and title, not fuzzy search.
 * sourceCandidates must include every known linked, historic or unlinked target.
 * A source marked empty must be verified through native content readback; Drive
 * size or a filename is not proof. "unknown" is never silently treated as empty.
 */
export function assessMigration(row, expectedOwner) {
  const errors = [];
  const p = row?.project || {};
  const source = Array.isArray(row?.sourceCandidates) ? row.sourceCandidates : [];
  const targets = Array.isArray(row?.destinationCandidates) ? row.destinationCandidates : [];
  const active = targets.filter(t => t?.disposition !== 'superseded');
  const current = active[0] || null;
  const action = row?.action;
  const ids = source.map(x => x?.fileId).filter(Boolean);
  const sameExistingSource = source.find(x => x?.fileId === row?.copySourceFileId);
  const anyNonempty = source.some(x => x?.contentState === 'nonempty');
  const unresolved = source.some(x => x?.contentState === 'unknown' || !x?.contentVerified);
  const identityOk = Number.isSafeInteger(p.id) && p.id > 0 && typeof p.title_en === 'string' && p.title_en.trim().length > 0;
  block(errors, !identityOk, 'project_identity_missing');
  block(errors, !ACTIONS.has(action), 'invalid_action');
  block(errors, row?.inventoryComplete !== true, 'inventory_incomplete');
  block(errors, row?.sourceSearchComplete !== true, 'source_search_incomplete');
  block(errors, source.some(x => !validId(x?.fileId) || !CONTENT.has(x?.contentState)), 'invalid_source_evidence');
  block(errors, new Set(ids).size !== ids.length, 'duplicate_source_id');
  block(errors, targets.some(x => !validId(x?.fileId)), 'invalid_destination_id');
  block(errors, active.length > 1, 'multiple_active_destinations');
  block(errors, source.some(x => x?.fileId === current?.fileId), 'source_equals_destination');

  // These two operations are the only file-creation authorizations.
  if (action === 'create_draft') {
    block(errors, active.length > 0, 'destination_already_exists');
    block(errors, anyNonempty, 'existing_manuscript_requires_copy');
    block(errors, unresolved, 'source_content_unknown');
    block(errors, row?.live?.status !== 'not_started', 'draft_does_not_preserve_workflow_state');
    block(errors, !Number.isSafeInteger(row?.live?.sourcePageProgress) || row.live.sourcePageProgress < 0,
      'source_progress_not_verified');
    block(errors, row?.live?.sourcePageProgress !== 0, 'existing_progress_requires_recovery');
  }
  if (action === 'copy_existing') {
    block(errors, active.length > 0, 'destination_already_exists');
    block(errors, !validId(row?.copySourceFileId) || !sameExistingSource, 'copy_source_not_in_inventory');
    block(errors, sameExistingSource?.contentState !== 'nonempty' || sameExistingSource?.contentVerified !== true,
      'copy_source_content_unverified');
    block(errors, sameExistingSource?.editionVerified !== true, 'copy_source_edition_unverified');
    block(errors, unresolved || source.filter(x => x?.contentState === 'nonempty').length !== 1,
      'multiple_or_unresolved_source_manuscripts');
  }

  // Existing copies must not be promoted to "exact" by element counts alone.
  if (action === 'attach_target') {
    block(errors, active.length !== 1, 'unique_destination_missing');
    block(errors, current?.ownerVerified !== true || normalized(current?.ownerEmail) !== normalized(expectedOwner),
      'destination_owner_not_verified');
    block(errors, current?.kind !== 'native_copy' && current?.kind !== 'new_draft',
      'destination_kind_unknown');
    if (current?.kind === 'native_copy') {
      block(errors, !source.some(x => x?.fileId === current?.sourceFileId && x?.contentState === 'nonempty' &&
        x?.contentVerified === true && x?.editionVerified === true) || unresolved,
        'source_revision_unresolved');
      block(errors, current?.textEquivalent !== true || current?.structureEquivalent !== true ||
        current?.stylesEquivalent !== true || current?.notesEquivalent !== true ||
        current?.renderEquivalent !== true || current?.sourceRevisionVerified !== true,
        'exact_copy_not_verified');
    } else {
      block(errors, anyNonempty || unresolved, 'blank_draft_may_erase_manuscript');
      block(errors, row?.live?.status !== 'not_started', 'blank_draft_wrong_stage');
      block(errors, !Number.isSafeInteger(row?.live?.sourcePageProgress) || row.live.sourcePageProgress < 0,
        'source_progress_not_verified');
      block(errors, row?.live?.sourcePageProgress !== 0, 'existing_progress_requires_recovery');
    }
    block(errors, current?.permission?.type !== 'anyone' || current?.permission?.role !== 'writer',
      'public_editor_permission_missing');
    block(errors, current?.anonymousAccessible !== true, 'anonymous_access_unverified');
    block(errors, row?.live?.observedThisRun !== true || row?.live?.id !== p.id ||
      row?.live?.title_en !== p.title_en, 'live_project_identity_unverified');
    block(errors, row?.live?.linkBefore !== row?.expectedLinkBefore,
      'live_link_changed_concurrently');
    block(errors, row?.live?.apiWritable !== true, 'live_api_unavailable');
    block(errors, current?.manuscriptRevisionVerified !== true, 'target_revision_unverified');
  }
  // Creation must also use a fresh exact live record, not only an old manifest.
  if (action === 'copy_existing' || action === 'create_draft') {
    block(errors, row?.live?.observedThisRun !== true || row?.live?.id !== p.id ||
      row?.live?.title_en !== p.title_en, 'live_project_identity_unverified');
  }

  return { projectId: p.id ?? null, action, safe: errors.length === 0, blockers: [...new Set(errors)] };
}
export function auditMigration(manifest, approvedDestinationOwner) {
  const rows = manifest?.rows;
  if (!Array.isArray(rows) || !rows.length) throw new Error('Private migration manifest requires rows.');
  if (!normalized(approvedDestinationOwner) || normalized(manifest.destinationOwner) !== normalized(approvedDestinationOwner)) {
    throw new Error('Destination owner does not match authorized account.');
  }
  const seenProject = new Set(), seenTarget = new Set();
  const results = rows.map(row => {
    const result = assessMigration(row, manifest.destinationOwner);
    if (seenProject.has(row?.project?.id)) result.blockers.push('duplicate_project_id');
    seenProject.add(row?.project?.id);
    for (const t of row?.destinationCandidates || []) {
      if (t?.disposition === 'superseded') continue;
      if (seenTarget.has(t.fileId)) result.blockers.push('destination_reused_across_projects');
      seenTarget.add(t.fileId);
    }
    result.blockers = [...new Set(result.blockers)];
    result.safe = result.blockers.length === 0;
    return result;
  });
  return { safe: results.every(x => x.safe), allowed: results.filter(x => x.safe).length,
    blocked: results.filter(x => !x.safe).length, results };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file || process.argv.length !== 3) {
    console.error('Usage: node scripts/manuscript-migration-preflight.mjs /PRIVATE/inventory.json');
    process.exitCode = 2;
  } else {
    try {
      const report = auditMigration(JSON.parse(fs.readFileSync(file, 'utf8')), process.env.MIGRATION_APPROVED_OWNER_EMAIL);
      // Never emit document IDs, URLs, source text or ownership identity into logs.
      console.log(JSON.stringify({ safe: report.safe, allowed: report.allowed,
        blocked: report.blocked, blocks: report.results.filter(x => !x.safe)
          .map(x => ({ project: x.projectId, reasons: x.blockers })) }));
      if (!report.safe) process.exitCode = 1;
    } catch (err) {
      console.error('MIGRATION_BLOCKED: ' + err.message);
      process.exitCode = 1;
    }
  }
}

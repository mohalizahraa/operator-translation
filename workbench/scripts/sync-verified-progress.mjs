#!/usr/bin/env node
/**
 * Proof-carrying Workbench checkpoint delivery for a verified English Book batch.
 * Run immediately after saving and reading back that batch's WBPROGRESS marker.
 * Never advance progress from this CLI unless the manuscript was independently verified.
 *
 *   node workbench/scripts/sync-verified-progress.mjs --project 123 --pages 42 --total 132 --actor Zahraa
 */
import { pathToFileURL } from 'node:url';

export const DEFAULT_WORKBENCH = 'https://haydari-translation-workbench.pages.dev';

function positiveInteger(value, label) {
  const num = Number(value);
  if (!Number.isSafeInteger(num) || num <= 0) throw new Error(label + ' must be a positive integer.');
  return num;
}
function nonnegativeInteger(value, label) {
  const num = Number(value);
  if (!Number.isSafeInteger(num) || num < 0) throw new Error(label + ' must be a nonnegative integer.');
  return num;
}

async function readJson(response, label) {
  let payload;
  try { payload = await response.json(); }
  catch { throw new Error(label + ' did not return valid JSON (HTTP ' + response.status + ').'); }
  if (!response.ok) {
    const detail = payload?.error || payload?.message || 'Request failed';
    throw new Error(label + ' failed (HTTP ' + response.status + '): ' + detail);
  }
  return payload;
}

/**
 * Server-side marker verification, checkpoint mutation, then an independent
 * persisted D1 readback. The exact physical PDF denominator is caller-supplied.
 * A success response from POST alone never counts as synchronized.
 */
export async function synchronizeVerifiedProgress({
  projectId, expectedPages, totalPages, actor = null,
  workbenchUrl = DEFAULT_WORKBENCH, fetchImpl = fetch
}) {
  const project = positiveInteger(projectId, 'projectId');
  const pages = nonnegativeInteger(expectedPages, 'expectedPages');
  const total = positiveInteger(totalPages, 'totalPages');
  if (pages > total) throw new Error('expectedPages cannot exceed totalPages.');
  if (actor !== null && !['Zahraa','Mohammed'].includes(actor)) {
    throw new Error('Actor must be Zahraa, Mohammed, or omitted when uncertain.');
  }
  const root = new URL(workbenchUrl);
  if (root.protocol !== 'https:') throw new Error('Workbench must use HTTPS.');
  const endpoint = new URL('/api/projects/' + project + '/progress-sync', root);
  const headers = actor ? {'x-workbench-actor': actor} : {};
  // No speculative POST retry. A failed write may have committed: reconcile first.
  const response = await fetchImpl(endpoint, {method:'POST',headers});
  const receipt = await readJson(response, 'Verified-marker checkpoint');
  if (receipt.marker_found === false) {
    throw new Error('No verified marker found in the linked public English Book.');
  }
  if (receipt.marker_pages !== undefined && Number(receipt.marker_pages) < pages) {
    throw new Error('Google Doc marker is behind the requested verified checkpoint.');
  }
  const readbackUrl = new URL('/api/projects/' + project, root);
  const stored = await readJson(await fetchImpl(readbackUrl, {method:'GET'}), 'D1 project readback');
  const p = stored.project;
  if (!p || Number(p.id) !== project || Number(p.translated_pages) !== pages || Number(p.pages) !== total) {
    throw new Error('SYNC_OPEN: live Workbench D1 readback differs from verified manuscript checkpoint (' +
      project + ', ' + pages + '/' + total + '). Do not proceed to the next batch.');
  }
  const allowed = pages === total ? ['review','completed','published'] : pages > 0 ? ['in_progress'] : ['not_started'];
  if (!allowed.includes(p.status)) {
    throw new Error('SYNC_OPEN: unexpected workflow status ' + String(p.status) + ' for ' + pages + '/' + total);
  }
  return {projectId:project,translatedPages:pages,totalPages:total,status:p.status,actor:actor || null,synchronized:true};
}

function cliOptions(argv) {
  const result = {};
  for (let i=0; i<argv.length; i+=2) {
    if (!argv[i]?.startsWith('--') || argv[i+1] === undefined) throw new Error('Expected --project ID --pages N --total N [--actor Zahraa|Mohammed].');
    result[argv[i].slice(2)] = argv[i+1];
  }
  for (const key of ['project','pages','total']) {
    if (result[key] === undefined) throw new Error('Missing required --' + key + '.');
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const o = cliOptions(process.argv.slice(2));
    const result = await synchronizeVerifiedProgress({
      projectId:o.project, expectedPages:o.pages, totalPages:o.total,
      actor:o.actor ?? null, workbenchUrl:o.origin ?? DEFAULT_WORKBENCH
    });
    process.stdout.write('WORKBENCH_SYNCED ' + result.projectId + ' ' + result.translatedPages + '/' + result.totalPages + ' (' + result.status + ')\n');
  } catch(error) {
    process.stderr.write('WORKBENCH_SYNC_OPEN: ' + error.message + '\n');
    process.exitCode = 1;
  }
}

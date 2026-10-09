// Backend-only, source-identity-bound translation batch staging.
// Staging is NEVER Workbench progress, independent source QA, or human approval.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHA256 = /^[a-f0-9]{64}$/;
const ARABIC = /[\u0600-\u06ff\u0750-\u077f\u0870-\u089f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/u;
const REPO_ROOT = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SURFACES = new Set(['front_matter', 'heading', 'body', 'quotation', 'footnote', 'endnote', 'table', 'caption', 'reference', 'header_footer', 'other']);

function fail(message) { throw new Error('ENGINE_BLOCKED: ' + message); }
function string(value, label, max = 1000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(label + ' required');
  return value.trim();
}
function int(value, label, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) fail(label + ' invalid');
  return value;
}
function inTree(dir, root) {
  const path = relative(root, dir);
  return path === '' || (path !== '..' && !path.startsWith('..' + '/') && !path.startsWith('..' + '\\') && !isAbsolute(path));
}
export function validateBatch(input) {
  if (!input || typeof input !== 'object') fail('batch manifest required');
  const s = input.source, t = input.target, b = input.batch;
  if (!s || !t || !b) fail('source, target and batch identities required');
  const projectId = int(s.projectId, 'projectId', 1);
  const pdfSha256 = string(s.pdfSha256, 'source PDF SHA-256', 64).toLowerCase();
  if (!SHA256.test(pdfSha256)) fail('source PDF SHA-256 invalid');
  const pageCount = int(s.pageCount, 'verified physical page denominator', 1);
  const documentId = string(t.documentId, 'target document ID', 200);
  const expectedRevision = string(t.expectedRevision, 'target expected revision', 200);
  const verifiedThrough = int(b.verifiedThrough, 'prior verified page');
  const fromPage = int(b.fromPage, 'first physical page', 1);
  const toPage = int(b.toPage, 'last physical page', 1);
  if (fromPage !== verifiedThrough + 1 || toPage < fromPage || toPage > pageCount)
    fail('batch must immediately follow the verified checkpoint and stay within source');
  if (!Array.isArray(input.units) || !input.units.length) fail('source units required');
  const ids = new Set(), covered = new Set();
  const units = input.units.map(u => {
    if (!u || typeof u !== 'object') fail('malformed source unit');
    const id = string(u.id, 'source unit id', 200);
    if (ids.has(id)) fail('duplicate source unit id');
    ids.add(id);
    const page = int(u.page, 'physical source page', 1);
    if (page < fromPage || page > toPage) fail('unit outside batch physical range');
    covered.add(page);
    const kind = u.kind === 'blank' ? 'blank' : u.kind === 'text' ? 'text' : fail('invalid source unit kind');
    const surface = string(u.surface, 'source surface', 40);
    if (!SURFACES.has(surface)) fail('unsupported source surface');
    const sourceRef = string(u.sourceRef, 'source PDF witness reference', 400);
    if (kind === 'blank') {
      if (u.sourceText !== undefined && u.sourceText !== '') fail('blank page must not contain translatable text');
      return { id, page, kind, surface, sourceRef };
    }
    const sourceText = string(u.sourceText, 'Arabic source text', 100000);
    return { id, page, kind, surface, sourceRef, sourceText };
  });
  for (let page = fromPage; page <= toPage; page++)
    if (!covered.has(page)) fail('physical source page has no unit or explicit blank witness');
  return {
    source: { projectId, pdfSha256, pageCount },
    target: { documentId, expectedRevision },
    batch: { verifiedThrough, fromPage, toPage },
    units
  };
}

export async function sha256File(path) {
  const file = await stat(path).catch(() => fail('canonical source PDF inaccessible'));
  if (!file.isFile()) fail('canonical source must be a regular file');
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

async function privateDirectory(directory) {
  if (typeof directory !== 'string' || !isAbsolute(directory)) fail('private output directory must be an absolute path');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const actual = await realpath(directory);
  const repo = await realpath(REPO_ROOT);
  if (inTree(actual, repo)) fail('staged book text cannot be stored in the repository');
  const info = await stat(actual);
  if (!info.isDirectory() || (info.mode & 0o077)) fail('output directory must be owner-only (0700)');
  return actual;
}

export async function stageTranslationBatch({ manifest, pdfPath, outputDir, translateUnit, critiqueUnit }) {
  const batch = validateBatch(manifest);
  if (typeof translateUnit !== 'function' || typeof critiqueUnit !== 'function')
    fail('translator and independent critic adapters required');
  if (translateUnit === critiqueUnit) fail('critic adapter must be separate from translator');
  if (typeof pdfPath !== 'string' || !isAbsolute(pdfPath)) fail('canonical source PDF path must be absolute');
  const observedHash = await sha256File(pdfPath);
  if (observedHash !== batch.source.pdfSha256) fail('canonical source PDF hash mismatch');
  const directory = await privateDirectory(outputDir);
  const results = [];
  for (const unit of batch.units) {
    if (unit.kind === 'blank') {
      results.push({ ...unit, state: 'BLANK_WITNESS_UNVERIFIED' });
      continue;
    }
    const context = { source: batch.source, target: batch.target, batch: batch.batch };
    const translated = await translateUnit(unit, context);
    const english = string(translated?.english, 'English draft for unit ' + unit.id, 200000);
    if (ARABIC.test(english)) fail('unadjudicated Arabic script in English draft unit ' + unit.id);
    const critic = await critiqueUnit({ unit, english, context });
    if (!critic || !['PASS', 'REVIEW', 'BLOCK'].includes(critic.status) ||
      !Array.isArray(critic.findings) || critic.findings.some(x => typeof x !== 'string' || x.length > 3000))
      fail('critic returned no structured disposition for unit ' + unit.id);
    results.push({ ...unit, english, critic: {
      status: critic.status, findings: critic.findings, criticId: string(critic.criticId, 'critic identity', 200)
    }, state: 'DRAFT_UNVERIFIED' });
  }
  const hasConcerns = results.some(u => u.critic?.status !== 'PASS' && u.kind !== 'blank');
  const artifact = {
    schema: 'haydari-engine-staged-batch-v1',
    ...batch,
    units: results,
    state: hasConcerns ? 'STAGED_WITH_OPEN_CRITIC_FINDINGS' : 'STAGED_NEEDS_SOURCE_AND_FORMAT_REVIEW',
    verifiedProgressAdvanced: false,
    manuscriptMutated: false,
    outstanding: ['source-to-PDF text alignment', 'independent critique evidence validation',
      'first-pass formatting and rendered inspection', 'target write/revision readback', 'Workbench QA and checkpoint readback']
  };
  const body = JSON.stringify(artifact, null, 2) + '\n';
  const digest = createHash('sha256').update(body).digest('hex');
  const name = 'project-' + batch.source.projectId + '-pages-' + batch.batch.fromPage +
    '-' + batch.batch.toPage + '-' + digest + '.json';
  const path = join(directory, name);
  let reused = false;
  try { await writeFile(path, body, { flag: 'wx', mode: 0o600 }); }
  catch (err) {
    if (err?.code !== 'EEXIST') throw err;
    const prior = await readFile(path, 'utf8');
    if (prior !== body) fail('existing staged artifact differs or is incomplete');
    reused = true;
  }
  const readback = await readFile(path, 'utf8');
  if (createHash('sha256').update(readback).digest('hex') !== digest)
    fail('staged artifact readback hash mismatch');
  return { path, digest, state: artifact.state, unitCount: results.length,
    reused, verifiedProgressAdvanced: false };
}

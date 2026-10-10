// Read-only native PDF witness extraction. Native text is NOT visually verified OCR,
// source-unit coverage, translation fidelity, or a verified Workbench checkpoint.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { open, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isAbsolute } from 'node:path';
import { sha256File, validateBatch, stageTranslationBatch } from './batch.mjs';

const runProcess = promisify(execFile);
const SHA = /^[a-f0-9]{64}$/;
const MAX_PAGES = 150;
const ARABIC = /[\u0621-\u064a\u066e-\u06d3]/u;
const SWIFT_SCRIPT = fileURLToPath(new URL('./pdfkit-source.swift', import.meta.url));

function fail(reason) { throw new Error('SOURCE_WITNESS_BLOCKED: ' + reason); }
function integer(value, label, min = 1) {
  if (!Number.isSafeInteger(value) || value < min) fail(label + ' invalid');
  return value;
}
// Static hash utility: no extracted source prose is written to logs.
import { createHash } from 'node:crypto';
function textSha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
async function runCommand(binary, args) {
  return runProcess(binary, args, { timeout: 120000, maxBuffer: 64 * 1024 * 1024,
    encoding: 'utf8', windowsHide: true });
}
function stdoutOf(result) {
  if (typeof result === 'string') return result;
  if (result && typeof result.stdout === 'string') return result.stdout;
  fail('native reader produced no valid text output');
}
async function pdfMagic(path) {
  const handle = await open(path, 'r');
  try {
    const bytes = Buffer.alloc(5);
    const data = await handle.read(bytes, 0, 5, 0);
    return data.bytesRead === 5 && bytes.toString('ascii') === '%PDF-';
  } finally {
    await handle.close();
  }
}
function normalizePages(raw, first, last) {
  if (!Array.isArray(raw) || raw.length !== last - first + 1)
    fail('reader did not return exactly one witness per physical page');
  return raw.map((row, index) => {
    const physicalPage = first + index;
    if (!row || row.page !== physicalPage || typeof row.text !== 'string')
      fail('native reader returned a missing, duplicate or misnumbered page');
    const text = row.text;
    if (Buffer.byteLength(text, 'utf8') > 2 * 1024 * 1024)
      fail('a single extracted page exceeds the safe text limit');
    return {
      physicalPage,
      nativeText: text,
      nativeTextSha256: textSha256(text),
      hasArabic: ARABIC.test(text),
      status: !text.trim() || !ARABIC.test(text)
        ? 'NEEDS_OCR_OR_VISUAL_SOURCE_REVIEW'
        : 'NATIVE_TEXT_NEEDS_PDF_VISUAL_ALIGNMENT'
    };
  });
}
export async function extractNativeSourcePages({
  pdfPath, pdfSha256, pageCount, fromPage, toPage,
  backend = process.platform === 'darwin' ? 'pdfkit' : 'poppler',
  run = runCommand
}) {
  if (typeof pdfPath !== 'string' || !isAbsolute(pdfPath))
    fail('absolute canonical PDF path required');
  if (typeof pdfSha256 !== 'string' || !SHA.test(pdfSha256))
    fail('canonical source PDF SHA-256 required');
  integer(pageCount, 'verified PDF page count');
  integer(fromPage, 'first physical page');
  integer(toPage, 'last physical page');
  if (toPage < fromPage || toPage > pageCount || toPage - fromPage + 1 > MAX_PAGES)
    fail('page range exceeds source or 150-page bound');
  if (!['pdfkit', 'poppler'].includes(backend)) fail('unsupported native PDF backend');
  if (typeof run !== 'function') fail('native PDF reader unavailable');
  const file = await stat(pdfPath).catch(() => fail('canonical PDF inaccessible'));
  if (!file.isFile() || !(await pdfMagic(pdfPath))) fail('source is not a readable PDF');
  if (await sha256File(pdfPath) !== pdfSha256)
    fail('canonical PDF bytes do not match expected source identity');

  let actualPageCount, rawPages;
  try {
    if (backend === 'pdfkit') {
      const response = JSON.parse(stdoutOf(await run('swift', [
        SWIFT_SCRIPT, pdfPath, String(fromPage), String(toPage)
      ])));
      actualPageCount = response.pageCount;
      rawPages = response.pages;
    } else {
      const info = stdoutOf(await run('pdfinfo', [pdfPath]));
      const match = info.match(/^Pages:\s*(\d+)\s*$/m);
      if (!match) fail('native PDF page count unavailable');
      actualPageCount = Number(match[1]);
      if (actualPageCount !== pageCount) fail('actual PDF physical-page denominator differs from manifest');
      const output = stdoutOf(await run('pdftotext', [
        '-f', String(fromPage), '-l', String(toPage),
        '-enc', 'UTF-8', '-layout', pdfPath, '-'
      ]));
      // pdftotext emits one form feed per page, including blank scanned pages.
      const entries = output.split('\f');
      if (entries.at(-1) === '') entries.pop();
      rawPages = entries.map((text, index) => ({ page: fromPage + index, text }));
    }
  } catch (error) {
    if (error?.message?.startsWith('SOURCE_WITNESS_BLOCKED:')) throw error;
    // Never log stderr or source text: tools sometimes echo copyrighted PDF content.
    fail('native PDF reader failed; verify local PDFKit/Poppler installation and PDF validity');
  }
  if (!Number.isSafeInteger(actualPageCount) || actualPageCount !== pageCount)
    fail('actual PDF physical-page denominator differs from manifest');
  const pages = normalizePages(rawPages, fromPage, toPage);
  return {
    schema: 'haydari-native-source-witness-v1',
    sourcePdfSha256: pdfSha256,
    physicalPageCount: actualPageCount,
    fromPage, toPage, backend,
    status: 'SOURCE_TEXT_EXTRACTED_NOT_SOURCE_VERIFIED',
    pages,
    verifiedProgressAdvanced: false
  };
}
function comparable(value) {
  return value.normalize('NFC').replace(/[\s\u200e\u200f]+/gu, ' ').trim();
}
export function compareNativeSourceUnits(manifest, witness) {
  const batch = validateBatch(manifest);
  if (!witness || witness.schema !== 'haydari-native-source-witness-v1' ||
      witness.sourcePdfSha256 !== batch.source.pdfSha256 ||
      witness.physicalPageCount !== batch.source.pageCount ||
      witness.fromPage !== batch.batch.fromPage ||
      witness.toPage !== batch.batch.toPage)
    fail('source witness is stale or belongs to another book/page range');
  const expected = batch.batch.toPage - batch.batch.fromPage + 1;
  if (!Array.isArray(witness.pages) || witness.pages.length !== expected)
    fail('source witness page coverage incomplete');
  const pageMap = new Map();
  for (let i = 0; i < expected; i++) {
    const row = witness.pages[i];
    const page = batch.batch.fromPage + i;
    if (!row || row.physicalPage !== page ||
        typeof row.nativeText !== 'string' ||
        row.nativeTextSha256 !== textSha256(row.nativeText))
      fail('source witness missing or modified after extraction');
    pageMap.set(page, comparable(row.nativeText));
  }
  const units = batch.units.map(unit => {
    if (unit.kind === 'blank') return {
      id:unit.id, physicalPage:unit.page, result:'BLANK_NEEDS_VISUAL_PROOF'
    };
    const pageText = pageMap.get(unit.page) || '';
    const query = comparable(unit.sourceText);
    const at = pageText.indexOf(query);
    let result = 'NOT_IN_NATIVE_TEXT_NEEDS_PDF_OR_OCR_REVIEW';
    if (query && at >= 0) {
      result = pageText.indexOf(query, at + query.length) < 0
        ? 'NATIVE_EXACT_TEXT_CANDIDATE' : 'REPEATED_TEXT_NEEDS_DISAMBIGUATION';
    }
    return {id:unit.id, physicalPage:unit.page, result};
  });
  return {
    schema:'haydari-native-unit-alignment-v1',
    sourcePdfSha256:batch.source.pdfSha256,
    nativeTextCandidatesMatched:units.filter(u=>u.result === 'NATIVE_EXACT_TEXT_CANDIDATE').length,
    units, status:'TEXT_ONLY_NOT_VISUALLY_VERIFIED',
    safeToClaimSourceCoverage:false,
    verifiedProgressAdvanced:false
  };
}

/**
 * Smallest connected execution slice: authentic PDF bytes -> native page text
 * -> unique text candidates -> translation/critic -> durable private draft.
 *
 * This is NOT independent source verification or a checkpoint: page images,
 * notes, segmentation coverage, semantic review and rendered target QA are open.
 */
export async function stageNativeSourceAlignedBatch({
  manifest, pdfPath, outputDir, translateUnit, critiqueUnit,
  backend, run
}) {
  const batch = validateBatch(manifest);
  const witness = await extractNativeSourcePages({
    pdfPath,
    pdfSha256:batch.source.pdfSha256,
    pageCount:batch.source.pageCount,
    fromPage:batch.batch.fromPage,
    toPage:batch.batch.toPage,
    ...(backend ? {backend} : {}),
    ...(run ? {run} : {})
  });
  const alignment = compareNativeSourceUnits(batch, witness);
  const exceptions = alignment.units.filter(
    unit => unit.result !== 'NATIVE_EXACT_TEXT_CANDIDATE'
  );
  if (exceptions.length)
    fail('source contains unresolved native-text, blank-page or alignment witnesses on physical page(s): ' +
      [...new Set(exceptions.map(u => u.physicalPage))].join(', '));
  const nativeSourceWitness = {
    status:'TEXT_ONLY_NOT_VISUALLY_VERIFIED',
    backend:witness.backend,
    pdfSha256:witness.sourcePdfSha256,
    pageTextDigests:witness.pages.map(p=>({
      physicalPage:p.physicalPage, nativeTextSha256:p.nativeTextSha256
    })),
    unitCountAligned:alignment.nativeTextCandidatesMatched
  };
  const staged = await stageTranslationBatch({
    manifest:batch,pdfPath,outputDir,translateUnit,critiqueUnit,nativeSourceWitness
  });
  return {...staged, nativeSourceWitness, verifiedProgressAdvanced:false};
}

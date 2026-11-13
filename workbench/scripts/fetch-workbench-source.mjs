#!/usr/bin/env node
/** Canonical Workbench source-PDF handoff. Never stores source bytes in Git. */
import {createHash} from 'node:crypto';
import {open,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const WORKBENCH_SOURCE_ORIGIN = 'https://haydari-translation-workbench.pages.dev';
const MAX_PDF_BYTES = 256 * 1024 * 1024;

export function validProjectId(value) {
  const s = String(value ?? '');
  if (!/^[1-9][0-9]*$/.test(s)) throw new Error('Project ID must be a positive decimal integer.');
  const id = Number(s);
  if (!Number.isSafeInteger(id)) throw new Error('Project ID exceeds the safe integer range.');
  return id;
}

export async function fetchWorkbenchSource({projectId,outputPath,fetchImpl=fetch}) {
  const id = validProjectId(projectId);
  if (typeof outputPath !== 'string' || !outputPath.trim()) throw new Error('Output path is required.');
  const destination = resolve(outputPath);
  const sourceUrl = `${WORKBENCH_SOURCE_ORIGIN}/api/pdf/${id}`;
  const response = await fetchImpl(sourceUrl, {
    method: 'GET',
    headers: {accept: 'application/pdf'},
    redirect: 'error',
    signal: AbortSignal.timeout(240_000),
  });
  if (response.status !== 200 || !response.ok) {
    await response.body?.cancel?.().catch(() => {});
    throw new Error(`Canonical Workbench PDF request failed (HTTP ${response.status}).`);
  }
  if (!/^application\/pdf(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) {
    await response.body?.cancel?.().catch(() => {});
    throw new Error('Canonical Workbench response was not application/pdf.');
  }
  if (!response.body) throw new Error('Canonical Workbench response has no PDF body.');
  const advertised = Number(response.headers.get('content-length'));
  if (advertised > MAX_PDF_BYTES) throw new Error('Source PDF exceeds the safe fetch size limit.');

  let handle;
  let bytes = 0;
  let prefix = Buffer.alloc(0);
  let tail = Buffer.alloc(0);
  const hash = createHash('sha256');
  try {
    handle = await open(destination, 'wx', 0o600);
    for await (const piece of response.body) {
      const chunk = Buffer.from(piece);
      bytes += chunk.length;
      if (bytes > MAX_PDF_BYTES) throw new Error('Source PDF exceeds the safe fetch size limit.');
      if (prefix.length < 5) prefix = Buffer.concat([prefix,chunk]).subarray(0,5);
      tail = Buffer.concat([tail,chunk]).subarray(-4096);
      hash.update(chunk);
      await handle.writeFile(chunk);
    }
    if (bytes < 128 || prefix.toString('ascii') !== '%PDF-' || !tail.includes(Buffer.from('%%EOF'))) {
      throw new Error('Source response did not pass PDF signature/completeness checks.');
    }
    if (Number.isFinite(advertised) && advertised > 0 && advertised !== bytes) {
      throw new Error('Incomplete source PDF download: Content-Length mismatch.');
    }
    await handle.close();
    handle = null;
    return {projectId:id,sourceUrl,bytes,sha256:hash.digest('hex')};
  } catch (error) {
    await handle?.close().catch(() => {});
    await rm(destination,{force:true}).catch(() => {});
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [id,out] = process.argv.slice(2);
  fetchWorkbenchSource({projectId:id,outputPath:out})
    .then(result => { console.log(JSON.stringify(result)); })
    .catch(error => { console.error(error.message); process.exitCode=1; });
}

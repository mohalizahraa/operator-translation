/**
 * A read-only, source-witness-labelled progress signal. The sole truth source is
 * the public *English* Google Doc export, never project notes or a fabricated
 * verified PDF checkpoint. Draft numbers are NOT PDF physical page numbers.
 */
const MAX_EXPORT_BYTES=8*1024*1024;
// Only source editions whose independent pagination is known may receive a
// draft-percentage bar. Do not divide text-edition numbers by physical PDF totals.
// Project #88: 560 numbered text-edition pages; canonical physical PDF: 559.
export const KNOWN_TEXT_EDITION_TOTALS=Object.freeze({88:560});
const DRAFT_HEADING=/^Source text-edition page ([1-9]\d{0,4})(?:[ \t]*[—–-][ \t]*[^\n]*)?[ \t]*$/gm;

export function extractDraftProgress(text){
  if(typeof text!=='string')throw new Error('Draft export must be text.');
  const pages=new Set();
  for(const match of text.matchAll(DRAFT_HEADING))pages.add(Number(match[1]));
  const ordered=[...pages].sort((a,b)=>a-b);
  return {last_labeled_page:ordered.at(-1)||null,labeled_sections:ordered.length,
    first_labeled_page:ordered[0]||null,basis:'source_text_edition',
    certified_pdf_pages:false};
}
export async function readDraftProgress(googleDocId,fetchImpl=fetch){
  if(!/^[a-zA-Z0-9_-]{12,}$/.test(googleDocId))throw new Error('Missing valid Google document identity.');
  const url='https://docs.google.com/document/d/'+encodeURIComponent(googleDocId)+'/export?format=txt';
  const response=await fetchImpl(url,{method:'GET',redirect:'follow',
    headers:{accept:'text/plain,*/*;q=0.8','user-agent':'Haydari-Translation-Workbench/1.0'}});
  if(!response.ok)throw new Error('Google Doc text export inaccessible (HTTP '+response.status+').');
  const contentLength=Number(response.headers.get('content-length')||0);
  if(contentLength>MAX_EXPORT_BYTES){await response.body?.cancel?.();throw new Error('Google Doc text export exceeds safety limit.');}
  const buffer=await response.arrayBuffer();
  if(buffer.byteLength>MAX_EXPORT_BYTES)throw new Error('Google Doc text export exceeds safety limit.');
  const type=(response.headers.get('content-type')||'').toLowerCase();
  const value=new TextDecoder().decode(buffer).replace(/\r\n?/g,'\n');
  if(type.includes('text/html')||/^\s*(?:<!doctype html|<html)/i.test(value))
    throw new Error('Google Doc returned HTML instead of its public plain-text export.');
  return extractDraftProgress(value);
}

#!/usr/bin/env node
/**
 * Quota-free source-page witness bridge: exact owner-authored request -> canonical
 * Workbench PDF -> macOS PDFKit text layer -> private issue comment.
 * Explicitly NOT a certified translation, OCR pass, or page alignment claim.
 */
import {readFile,rm} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {fetchWorkbenchSource,validProjectId} from './fetch-workbench-source.mjs';

const REPOSITORY='mohalizahraa/operator-translation';
const TITLE=/^Workbench PDF pages: #([1-9][0-9]*) physical ([1-9][0-9]*)-([1-9][0-9]*)$/;
const execFileAsync=promisify(execFile);

export function parsePageRequest(env,event) {
  if (env.GITHUB_REPOSITORY!==REPOSITORY) throw new Error('Unexpected repository.');
  if (env.GITHUB_EVENT_NAME!=='issues'||event?.action!=='opened') throw new Error('Owner-authored issue event required.');
  if (event?.issue?.user?.login!==env.GITHUB_REPOSITORY_OWNER) throw new Error('Request must be from repository owner.');
  const m=TITLE.exec(String(event.issue.title||''));
  if (!m) throw new Error('Expected exact project ID and physical-page range.');
  const projectId=validProjectId(m[1]),from=Number(m[2]),to=Number(m[3]),issue=Number(event.issue.number);
  if (!Number.isSafeInteger(from)||!Number.isSafeInteger(to)||to<from||to-from>3) throw new Error('Page range must span at most four consecutive physical PDF pages.');
  if (!Number.isSafeInteger(issue)||issue<=0) throw new Error('Invalid issue number.');
  return {projectId,from,to,issue};
}

async function postIssue(issue,body,env,postFetch) {
  const response=await postFetch(`https://api.github.com/repos/${REPOSITORY}/issues/${issue}/comments`,{
    method:'POST',
    headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json','User-Agent':'Workbench-Source-Pages'},
    body:JSON.stringify({body}),
  });
  if(response.status!==201)throw new Error(`Issue result post failed (HTTP ${response.status}).`);
}
function pageEvidence(payload,receipt,request,runId) {
  if(payload.physical_page_count!==559&&request.projectId===88)throw new Error('Physical PDF count for #88 is not 559.');
  if(!Array.isArray(payload.pages)||payload.pages.length!==request.to-request.from+1)throw new Error('Incomplete extracted page set.');
  const passages=payload.pages.map((p,i)=>{
    if(p.physical_page!==request.from+i||typeof p.text!=='string'||p.text.trim().length<40)
      throw new Error(`Physical PDF page ${request.from+i} lacks a usable text layer; OCR needed.`);
    return `### Physical PDF page ${p.physical_page}\n\n${p.text}`;
  });
  const body=[
    'Canonical Workbench PDFKit **TEXT-LAYER WITNESS** — not yet OCR, source-page certification, or English translation.',
    `Project: ${request.projectId}; physical pages: ${request.from}–${request.to}; physical page count: ${payload.physical_page_count}`,
    `Canonical URL: https://haydari-translation-workbench.pages.dev/api/pdf/${request.projectId}`,
    `PDF SHA-256: ${receipt.sha256}; PDF bytes: ${receipt.bytes}`,
    `Source run: https://github.com/${REPOSITORY}/actions/runs/${runId}`,
    'The text extracted from PDFKit must be checked against rendered Arabic page images before claiming fidelity.',
    ...passages
  ].join('\n\n');
  if(body.length>55000)throw new Error('Page extraction exceeds safe private-issue comment length; use a smaller page range.');
  return body;
}

export async function processSourcePages({env=process.env,fetchImpl=fetch,postFetch=fetch,extractImpl=null}={}) {
  if(!env.GITHUB_TOKEN)throw new Error('Missing private issue-reporting token.');
  const event=JSON.parse(await readFile(env.GITHUB_EVENT_PATH,'utf8'));
  const req=parsePageRequest(env,event);
  const pdfPath=join(env.RUNNER_TEMP,'workbench-source-pages.pdf');
  const jsonPath=join(env.RUNNER_TEMP,'workbench-source-pages.json');
  let receipt;
  try{
    await rm(pdfPath,{force:true});
    await rm(jsonPath,{force:true});
    receipt=await fetchWorkbenchSource({projectId:req.projectId,outputPath:pdfPath,fetchImpl});
    const run=extractImpl||((input,first,last,output)=>execFileAsync('swift',[
      fileURLToPath(new URL('./extract-source-pages.swift',import.meta.url)),input,String(first),String(last),output
    ],{timeout:180000,maxBuffer:1024*1024}));
    await run(pdfPath,req.from,req.to,jsonPath);
    const payload=JSON.parse(await readFile(jsonPath,'utf8'));
    const body=pageEvidence(payload,receipt,req,env.GITHUB_RUN_ID);
    await postIssue(req.issue,body,env,postFetch);
    return {projectId:req.projectId,from:req.from,to:req.to,sourceSha256:receipt.sha256};
  }catch(error){
    const body=`Canonical PDF page extraction remains OPEN for project #${req.projectId} physical ${req.from}–${req.to}. Runner: https://github.com/${REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}. Reason: ${String(error.message).slice(0,500)}. Do not advance any translation or source-certification counters.`;
    await postIssue(req.issue,body,env,postFetch).catch(()=>{});
    throw error;
  }finally{
    await rm(pdfPath,{force:true});
    await rm(jsonPath,{force:true});
  }
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  processSourcePages().then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e.message);process.exitCode=1;});
}

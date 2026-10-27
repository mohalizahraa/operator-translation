#!/usr/bin/env node
/**
 * Cross-platform self-hosted GitHub Actions bridge for canonical Workbench PDFs.
 * stage: validates exact project and downloads the verified source PDF.
 * report: posts a run/artifact outcome to an existing private GitHub issue.
 * No source document bytes, credentials, or source passages enter issue reports.
 */
import {readFile, appendFile, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {fetchWorkbenchSource, validProjectId} from './fetch-workbench-source.mjs';

const REPOSITORY = 'mohalizahraa/operator-translation';
const ISSUE_TITLE = /^Workbench PDF source: #([1-9][0-9]*)$/;
const ISSUE_NUMBER = /^[1-9][0-9]*$/;

export function deriveRequest({env, event, requestFile}) {
  if (env.GITHUB_REPOSITORY !== REPOSITORY) throw new Error('Unexpected repository.');
  if (env.GITHUB_EVENT_NAME === 'issues') {
    if (event?.action !== 'opened') throw new Error('Unsupported issue event action.');
    if (event?.issue?.user?.login !== env.GITHUB_REPOSITORY_OWNER) throw new Error('Request must be authored by repository owner.');
    const match = ISSUE_TITLE.exec(String(event.issue.title || ''));
    if (!match) throw new Error('Issue title must provide an exact project ID.');
    return {projectId:validProjectId(match[1]),issueNumber:String(event.issue.number)};
  }
  if (env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
    return {projectId:validProjectId(env.INPUT_PROJECT_ID),issueNumber:env.INPUT_EVIDENCE_ISSUE || null};
  }
  if (env.GITHUB_EVENT_NAME === 'push') {
    const lines = requestFile.split(/\r?\n/);
    const match = requestFile.match(/(?:^|\n)# Evidence issue: ([1-9][0-9]*)(?=\r?\n|$)/);
    return {projectId:validProjectId(lines[0].trim()),issueNumber:match?.[1] || null};
  }
  throw new Error('Unsupported trigger.');
}

export function safeIssueNumber(value) {
  if (!ISSUE_NUMBER.test(String(value||''))) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
}

async function getRequest(env) {
  const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH,'utf8'));
  const requestFile = await readFile(new URL('../source-access-request.txt',import.meta.url),'utf8');
  return deriveRequest({env,event,requestFile});
}

export async function stage({env=process.env,fetchImpl=fetch}) {
  const request = await getRequest(env);
  const outputPath = join(env.RUNNER_TEMP,'workbench-source.pdf');
  await rm(outputPath,{force:true});
  const receipt = await fetchWorkbenchSource({projectId:request.projectId,outputPath,fetchImpl});
  if (receipt.projectId !== request.projectId || receipt.bytes<=0 ||
    !/^[a-f0-9]{64}$/.test(receipt.sha256)) throw new Error('Source receipt identity or hash invalid.');
  await appendFile(env.GITHUB_OUTPUT,`path=${outputPath}\nproject_id=${receipt.projectId}\nsha256=${receipt.sha256}\nbytes=${receipt.bytes}\n`);
  return {projectId:receipt.projectId,bytes:receipt.bytes,sha256:receipt.sha256};
}

export async function report({env=process.env,fetchImpl=fetch}) {
  const req = await getRequest(env);
  const issueNumber = safeIssueNumber(req.issueNumber);
  if (!issueNumber) throw new Error('Source workflow must have a verified issue for outcome reporting.');
  const success = ['VERIFY_OUTCOME','FETCH_OUTCOME','UPLOAD_OUTCOME'].every(x=>env[x]==='success');
  const result = success ? 'ARTIFACT_UPLOADED — consumer-side readback still required' : 'FETCH_OPEN — source artifact not yet verified';
  const body = [
    `Canonical Workbench PDF bridge: ${result}`,
    `Project: ${req.projectId}`,
    `Run: https://github.com/${REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`,
    `Commit: ${env.GITHUB_SHA}`,
    `Test: ${env.VERIFY_OUTCOME}; Fetch: ${env.FETCH_OUTCOME}; Upload: ${env.UPLOAD_OUTCOME}`,
    `PDF bytes: ${env.FETCH_BYTES||'not available'}; SHA-256: ${env.FETCH_SHA256||'not available'}`,
    `Source: https://haydari-translation-workbench.pages.dev/api/pdf/${req.projectId}`,
    'This is source-access evidence, not translation or PDF-page certification.'
  ].join('\n\n');
  const uri = `https://api.github.com/repos/${REPOSITORY}/issues/${issueNumber}/comments`;
  if (!env.GITHUB_TOKEN) throw new Error('Missing GitHub issue-reporting token.');
  const response = await fetchImpl(uri,{
    method:'POST',
    headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json','User-Agent':'Workbench-source-bridge'},
    body:JSON.stringify({body}),
  });
  if (response.status!==201) throw new Error(`Failed to report source bridge outcome (HTTP ${response.status}).`);
  return {projectId:req.projectId,issueNumber,success};
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const mode=process.argv[2];
  const action=mode==='stage' ? stage : mode==='report' ? report : null;
  if (!action) {console.error('Mode must be stage or report.');process.exitCode=2;}
  else action().then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error(e.message);process.exitCode=1;});
}

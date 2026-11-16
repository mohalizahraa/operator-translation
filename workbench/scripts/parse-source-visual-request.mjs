#!/usr/bin/env node
/**
 * Exact owner-authored request for a bounded public-PDF visual source witness.
 * This parses request metadata only. It never accepts private Drive URLs,
 * manuscript text, custom source hosts, or arbitrary filesystem locations.
 */
import {pathToFileURL} from 'node:url';
export const TITLE=/^Workbench render: #([1-9][0-9]*) physical ([1-9][0-9]*)-([1-9][0-9]*)$/;
export function parseVisualRequest(event,env) {
  if(env.GITHUB_REPOSITORY!=='mohalizahraa/operator-translation' ||
     env.GITHUB_EVENT_NAME!=='issues'||event?.action!=='opened' ||
     event.issue?.user?.login!==env.GITHUB_REPOSITORY_OWNER)
    throw new Error('Owner-authored issue event required.');
  const match=TITLE.exec(String(event.issue.title||''));
  if(!match)throw new Error('Exact title required: Workbench render: #ID physical FROM-TO.');
  const id=Number(match[1]),from=Number(match[2]),to=Number(match[3]);
  if(!Number.isSafeInteger(id)||id<1||id>176)throw new Error('Project ID outside canonical 176-book catalogue.');
  if(!Number.isSafeInteger(from)||!Number.isSafeInteger(to)||from<1||to<from||to-from>3)
    throw new Error('At most four consecutive physical source pages.');
  return {projectId:id,from,to};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  try{
    const {readFileSync,appendFileSync}=await import('node:fs');
    const env=process.env;
    const request=parseVisualRequest(JSON.parse(readFileSync(env.GITHUB_EVENT_PATH,'utf8')),env);
    const vars={id:request.projectId,from:request.from,to:request.to};
    for(const [k,v] of Object.entries(vars))appendFileSync(env.GITHUB_OUTPUT,k+'='+v+'\n');
    console.log('VERIFIED_BOUNDED_RENDER_REQUEST '+JSON.stringify(request));
  }catch(err){
    console.error('RENDER_REQUEST_BLOCKED: invalid or unauthorized source request');
    process.exitCode=1;
  }
}

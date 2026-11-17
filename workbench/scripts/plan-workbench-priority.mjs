#!/usr/bin/env node
/**
 * Read-only priority projection of the LIVE Haydari Workbench catalogue.
 *
 * Never infer assignee or completed-translation status from a historical
 * handoff. This function does not advance Workbench progress or mutate Docs.
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const EXCLUDED_BOOKS = Object.freeze([
  { id: 90, title: 'The Hadith Legacy: Between Formation and Influence' },
  { id: 106, title: 'The Spirituality of Acts of Worship' },
]);
const expected = new Map(EXCLUDED_BOOKS.map(x => [x.id, x.title]));
const strip = x => String(x || '').normalize('NFKD')
  .replace(/\p{M}/gu,'').replace(/[^a-zA-Z0-9]+/g, ' ').trim().toLowerCase();
const excludedNames = new Set(EXCLUDED_BOOKS.map(x => strip(x.title)));

// Exact full-corpus gate for the current founder-authorized 176-book programme.
// A truncated or shifted API response cannot silently become today's queue.
export function assertCompleteWorkbenchSnapshot(projects) {
  const count=176;
  if(!Array.isArray(projects) || projects.length!==count)
    throw new Error('WORK_QUEUE_BLOCKED: incomplete live 176-project snapshot');
  const ids=new Set(projects.map(p=>p?.id));
  for(let id=1;id<=count;id++)
    if(!ids.has(id)) throw new Error('WORK_QUEUE_BLOCKED: missing live project ID #'+id);
  return true;
}

// Matches Workbench's site-level translated-status metric. This is NOT QA acceptance.
export const STATUS_TRANSLATED = Object.freeze(['review','completed','published']);
const translatedStatusSet = new Set(STATUS_TRANSLATED);
export const isStatusTranslated = p => translatedStatusSet.has(p?.status);

function tier(p) {
  if (p.assignee === 'Mohammed' || p.assignee === 'Brother') return 1;
  if (p.assignee === 'Zahraa') return 2;
  if (p.assignee === 'Both' || p.assignee === 'Unassigned') return 3;
  throw new Error('Unknown live assignee for project #' + p.id);
}
export function planWorkQueue(projects) {
  if (!Array.isArray(projects) || projects.length === 0)
    throw new Error('WORK_QUEUE_BLOCKED: full live project inventory required');
  const ids=new Set();
  const phases=[[],[],[]],excluded=[];
  for (const p of projects) {
    if (!Number.isSafeInteger(p?.id) || p.id < 1 || typeof p?.title_en !== 'string' ||
        !p.title_en.trim()) throw new Error('WORK_QUEUE_BLOCKED: missing exact project identity');
    if (ids.has(p.id)) throw new Error('WORK_QUEUE_BLOCKED: duplicate project ID #' + p.id);
    ids.add(p.id);
    const name = strip(p.title_en);
    const byId = expected.has(p.id), byTitle = excludedNames.has(name);
    // The two exclusions must resolve to their actual live project identities.
    if (byId !== byTitle || (byId && name !== strip(expected.get(p.id))))
      throw new Error('WORK_QUEUE_BLOCKED: exclusion identity conflict at project #' + p.id);
    if (byId) { excluded.push({id:p.id,title_en:p.title_en,assignee:p.assignee}); continue; }
    const group=tier(p);
    phases[group-1].push({id:p.id,title_en:p.title_en,assignee:p.assignee,
      status:p.status,google_doc_url:p.google_doc_url ?? null,
      translated_pages:p.translated_pages ?? null,pages:p.pages ?? null});
  }
  for (const rows of phases) rows.sort((a,b)=>a.id-b.id);
  const includedProjects = phases.flat();
  const statusCounts = Object.fromEntries(['not_started','in_progress',...STATUS_TRANSLATED]
    .map(status=>[status,includedProjects.filter(x=>x.status===status).length]));
  const statusTranslatedProjects = includedProjects.filter(isStatusTranslated);
  const newTranslationProjects = includedProjects.filter(x=>!isStatusTranslated(x));
  return {
    count:projects.length,
    included:phases.reduce((n,x)=>n+x.length,0),
    excluded,
    statusCounts,
    statusTranslatedCount:statusTranslatedProjects.length,
    statusTranslatedBookIds:statusTranslatedProjects.map(x=>x.id).sort((a,b)=>a-b),
    newTranslationCount:newTranslationProjects.length,
    newTranslationBookIds:newTranslationProjects.map(x=>x.id).sort((a,b)=>a-b),
    phases:[
      {priority:1,label:'Mohammed',projects:phases[0]},
      {priority:2,label:'Zahraa',projects:phases[1]},
      {priority:3,label:'Shared and remaining website books',projects:phases[2]},
    ],
    note:'Site statuses review/completed/published count as founder-approved translation DONE; this is separate from source-page QA, formatting, human review and actual publication.',
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path=process.argv[2];
  if (!path || process.argv.length !== 3) {
    console.error('Usage: node scripts/plan-workbench-priority.mjs /PRIVATE/live-projects.json');
    process.exitCode=2;
  } else {
    try {
      const data=JSON.parse(fs.readFileSync(path,'utf8'));
      // Require an explicit same-run observation and do not accept cached handoffs.
      if (data.observedLiveThisRun !== true || !Array.isArray(data.projects))
        throw new Error('Missing live current-run /api/projects provenance');
      assertCompleteWorkbenchSnapshot(data.projects);
      const result=planWorkQueue(data.projects);
      // Emit project IDs/titles only; no private Doc URLs in logging projection.
      console.log(JSON.stringify({
        total:result.count,eligible:result.included,
        statusCounts:result.statusCounts,translatedStatusDone:result.statusTranslatedCount,
        translatedStatusBookIds:result.statusTranslatedBookIds,
        remainingNewTranslation:result.newTranslationCount,
        remainingNewTranslationBookIds:result.newTranslationBookIds,
        excluded:result.excluded.map(x=>x.id),
        priorities:result.phases.map(x=>({priority:x.priority,group:x.label,
          count:x.projects.length,projectIds:x.projects.map(y=>y.id)}))
      }));
    } catch(err) {
      console.error('WORK_QUEUE_BLOCKED: '+err.message);
      process.exitCode=1;
    }
  }
}

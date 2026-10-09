import fs from 'node:fs';
import vm from 'node:vm';

function assert(condition,message){
  if(!condition) throw new Error(message);
}
function close(actual,expected,epsilon=1e-9){
  return Math.abs(actual-expected)<=epsilon;
}

const source=fs.readFileSync(new URL('../public/model-core.js',import.meta.url),'utf8');
const {validDateRange,validIsoDate,normalizeProject}=await import('../functions/_lib.js');
const {PDF_AUDIT}=await import('../functions/_pdf_audit.js');
const context={};
vm.createContext(context);
vm.runInContext(source,context);
const core=context.WorkbenchCore;
assert(core,'WorkbenchCore failed to load.');
assert(validIsoDate('2028-02-29'),'Valid leap day must pass.');
assert(!validIsoDate('2026-02-29'),'Impossible non-leap day must fail.');
assert(!validIsoDate('2026-13-01'),'Impossible month must fail.');
assert(!validIsoDate('2026-04-31'),'Impossible day-of-month must fail.');
assert(validIsoDate(''),'Blank optional date must pass.');
assert(validDateRange('2026-10-01','2026-10-01'),'Same-day start/deadline must pass.');
assert(validDateRange('2026-10-01','2026-10-02'),'Start before deadline must pass.');
assert(validDateRange('', '2026-10-02'),'Missing start date must remain allowed.');
assert(!validDateRange('2026-10-03','2026-10-02'),'Start after deadline must fail.');

const [auditedId,auditedEvidence]=Object.entries(PDF_AUDIT).find(([,evidence])=>evidence?.status==='available' && evidence?.url && Number(evidence?.physical_pages)>0) || [];
assert(auditedId && auditedEvidence,'Behavior test requires at least one audited available PDF.');
const canonicalRow={catalog_id:auditedId,source_pdf_url:auditedEvidence.url,pdf_status:'available',pages:Number(auditedEvidence.physical_pages),assignee:'Unassigned'};
assert(normalizeProject(canonicalRow).page_count_verified,'Exact audited PDF URL + physical count must be verified.');
assert(!normalizeProject({...canonicalRow,pdf_status:'unchecked'}).page_count_verified,'Unchecked source must not retain a verified page denominator.');
assert(!normalizeProject({...canonicalRow,source_pdf_url:'https://example.com/alternate.pdf'}).page_count_verified,'Different PDF identity must not inherit the old audited physical-page denominator.');

const projects=[
  {pages:120,page_count_verified:true},
  {pages:999,page_count_verified:false},
  {pages:360,page_count_verified:true},
];
assert(core.verifiedFallbackPages(projects)===240,'Fallback median must use verified physical counts only.');
assert(core.estimatedPages(projects[0],240,false)===120,'Verified physical count must be exact.');
assert(core.estimatedPages(projects[1],240,false)===240,'Unverified catalogue count must not be treated as exact.');
assert(core.estimatedPages({pages:999,page_count_verified:false,volumes:3},240,false)===720,'Unknown multi-volume workload must use fallback × volumes.');
assert(core.estimatedPages({pages:999,page_count_verified:false,volumes:3},240,true)===240,'Indexed volume must not multiply its own fallback.');

const daily=core.reconcilePageDeltas([
  {id:1,project_id:7,actor:'Zahraa',created_at:'2026-10-01T10:00:00Z',date_key:'2026-10-01',before_pages:0,after_pages:100},
  {id:2,project_id:7,actor:'System',created_at:'2026-10-02T10:00:00Z',date_key:'2026-10-02',before_pages:100,after_pages:80},
  {id:3,project_id:7,actor:'Zahraa',created_at:'2026-10-03T10:00:00Z',date_key:'2026-10-03',before_pages:80,after_pages:130},
],['Zahraa']);
assert(daily['2026-10-01']===80,'Correction must unwind previously credited pages instead of leaving pace inflated.');
assert(!daily['2026-10-02'],'Correction day must not count negative work as productive pages.');
assert(daily['2026-10-03']===50,'Later verified progress must remain credited.');
assert(Object.values(daily).reduce((sum,value)=>sum+value,0)===130,'A correction by another actor must still unwind the selected actor\'s overstated project credit.');

const order=['not_started','in_progress','review','completed','published'];
assert(core.statusTransitionAllowed(order,'in_progress','review'),'Adjacent forward workflow move should pass.');
assert(core.statusTransitionAllowed(order,'review','in_progress'),'Adjacent rewind should pass.');
assert(!core.statusTransitionAllowed(order,'not_started','completed'),'Workflow jumps must fail.');
assert(!core.statusTransitionAllowed(order,'in_progress','published'),'Publish Ready jump must fail.');
assert(!core.workflowTransitionAllowed(order,{status:'in_progress',page_count_verified:true,pages:100,translated_pages:99},'review'),'Verified incomplete translation must not enter Needs Formatting.');
assert(core.workflowTransitionAllowed(order,{status:'in_progress',page_count_verified:true,pages:100,translated_pages:100},'review'),'Verified complete translation may enter Needs Formatting.');
assert(core.workflowTransitionAllowed(order,{status:'in_progress',page_count_verified:false,pages:999,translated_pages:0},'review'),'Missing/unverified PDF denominator must preserve manual stage advancement.');

const history=core.completionHistory([
  {id:1,created_at:'2026-09-01',date_key:'2026-09-01',delta:1},
  {id:2,created_at:'2026-09-05',date_key:'2026-09-05',delta:-1},
  {id:3,created_at:'2026-09-09',date_key:'2026-09-09',delta:1},
],3);
assert(history.baseline===2,'History baseline must reconcile immutable transitions to current translated count.');
assert(history.dayDeltas['2026-09-05']===-1,'Workflow rewind must remain visible in completion history.');

const {assessTranslationEvidence}=await import('../functions/_translation.js');
const quality={source_hash:'source-sha',target_revision:'rev1',units:[{id:'u1',source_page:1,target_anchor:'p1',status:'VERIFIED'}],checks:Object.fromEntries(['independent_critic','ambiguity_review','terminology_review','batch_formatting','full_render','native_toc','publication_review','regression'].map(k=>[k,{status:'PASS',target_revision:'rev1',evidence_ref:k}]))};
assert(assessTranslationEvidence(quality,true).ready,'Complete evidence report should pass preflight.');
assert(!assessTranslationEvidence({...quality,units:[{...quality.units[0],status:'PARTIAL'}]},true).ready,'Partial source coverage must fail preflight.');
assert(!assessTranslationEvidence({...quality,checks:{...quality.checks,independent_critic:{status:'PASS',target_revision:'stale',evidence_ref:'critic'}}},true).ready,'Stale critic evidence must fail preflight.');
console.log('Workbench behavioral invariants: PASS');

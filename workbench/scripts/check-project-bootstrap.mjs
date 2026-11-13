import fs from 'node:fs';
import vm from 'node:vm';

// Project visibility must survive a failed Activity request. Verify the
// runtime's actual async project loader, not just a source-text marker.
const app=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const start=app.indexOf('async function fetchSharedData() {');
const end=app.indexOf('function applySharedData(',start);
if(start<0 || end<0) throw new Error('Project loader missing.');
const body=app.slice(start,end);
let activityCalls=0;
const context={
  fetchLiveRevision:async()=> 'revision-42',
  api:async path=>{
    if(path==='/api/projects')return {projects:[{id:1,catalog_id:'book-1',status:'in_progress'}]};
    if(path.startsWith('/api/activity')){activityCalls++;throw new Error('Simulated Activity 503');}
    throw new Error('Unexpected request '+path);
  },
};
vm.createContext(context);
vm.runInContext(body,context);
const result=await vm.runInContext('fetchSharedData()',context);
if(result.projects.length!==1 || result.revision!=='revision-42')throw new Error('Healthy project data failed to load.');
if(activityCalls!==0)throw new Error('Activity still blocks initial project load.');
context.fetchLiveRevision=async()=>{throw new Error('Simulated revision 503');};
const degraded=await vm.runInContext('fetchSharedData()',context);
if(degraded.projects.length!==1 || degraded.revision!==null)throw new Error('Revision outage still hides healthy project data.');

if(!app.includes('void refreshActivityData();'))throw new Error('Independent Activity refresh is not scheduled.');
if(!app.includes('state.activityLoaded=true;'))throw new Error('Activity state is never marked loaded.');
const activity=fs.readFileSync(new URL('../functions/api/activity.js',import.meta.url),'utf8');
for(const field of ['status','translated_pages','pages']){
 if(!activity.includes(`json_extract(a.before_json, '$.${field}')`)||!activity.includes(`json_extract(a.after_json, '$.${field}')`))throw new Error('Compact history lost historical '+field);
}
if(!activity.includes('const [activity, paceEvents]'))throw new Error('Default archival history route removed.');
console.log('Workbench independent project bootstrap: PASS');


// A failing health endpoint must not suppress readable project data, and a
// failing project endpoint must still enter bounded recovery instead of
// silently showing an empty catalogue.
const bootstrapStart=app.indexOf('async function loadWorkspace() {');
const bootstrapEnd=app.indexOf("document.addEventListener('visibilitychange', reconnectUnavailableWorkspace);",bootstrapStart);
if(bootstrapStart<0||bootstrapEnd<0)throw new Error('Workspace loader missing.');
const bootstrapCode=app.slice(bootstrapStart,bootstrapEnd);
let projectsLoaded=0;
let liveStarted=0;
let recoveries=0;
let workspaceError='';
const bootstrapContext={
  workspaceLoadInFlight:false,
  workspaceRecoveryTimer:null,
  workspaceRecoveryDelayMs:5000,
  state:{pdfAudit:null},
  $:()=>({disabled:false}),
  api:async path=>{if(path==='/api/health')throw new Error('Simulated health 503');throw new Error('Unexpected request '+path);},
  loadCoverMap:async()=>{},
  loadSeriesMap:async()=>{},
  loadData:async()=>{projectsLoaded++;},
  setWorkspaceError:msg=>{workspaceError=msg;},
  startLiveSync:()=>{liveStarted++;},
  clearTimeout:()=>{},
  scheduleWorkspaceRecovery:()=>{recoveries++;},
  auditPdfs:async()=>{},
  toast:()=>{},
  document:{body:{classList:{contains:()=>false}}},
};
vm.createContext(bootstrapContext);
vm.runInContext(bootstrapCode,bootstrapContext);
const booted=await vm.runInContext('loadWorkspace()',bootstrapContext);
if(!booted||projectsLoaded!==1||liveStarted!==1||recoveries!==0||workspaceError!=='') {
  throw new Error('Health 503 incorrectly prevents workspace bootstrap.');
}
bootstrapContext.loadData=async()=>{throw new Error('Simulated projects 503');};
const unavailable=await vm.runInContext('loadWorkspace()',bootstrapContext);
if(unavailable||recoveries!==1||!workspaceError.includes('Simulated projects 503')) {
  throw new Error('Project 503 was not marked unavailable and scheduled for recovery.');
}
console.log('Workbench health-independent bootstrap and recovery: PASS');

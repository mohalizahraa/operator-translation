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
if(!app.includes('void refreshActivityData();'))throw new Error('Independent Activity refresh is not scheduled.');
if(!app.includes('state.activityLoaded=true;'))throw new Error('Activity state is never marked loaded.');
const activity=fs.readFileSync(new URL('../functions/api/activity.js',import.meta.url),'utf8');
for(const field of ['status','translated_pages','pages']){
 if(!activity.includes(`json_extract(a.before_json, '$.${field}')`)||!activity.includes(`json_extract(a.after_json, '$.${field}')`))throw new Error('Compact history lost historical '+field);
}
if(!activity.includes('const [activity, paceEvents]'))throw new Error('Default archival history route removed.');
console.log('Workbench independent project bootstrap: PASS');

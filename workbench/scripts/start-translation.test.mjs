import test from 'node:test';
import assert from 'node:assert/strict';
import {startTranslation} from './start-translation.mjs';

const doc='https://docs.google.com/document/d/doc_88/edit';
const request={projectId:88,title:'Tawhid 2',assignee:'Mohammed',totalPages:559,documentUrl:doc,
  permissionEvidence:{fileId:'doc_88',type:'anyone',role:'writer'}};
function fake(project){
  let patches=0;
  const fetchImpl=async(url,options={})=>{
    if(options.method==='PATCH'){
      patches++;
      project={...project,...JSON.parse(options.body)};
    }
    return new Response(JSON.stringify({project}),{status:200});
  };
  return {fetchImpl,get patches(){return patches;}};
}
test('links exact project without increasing page progress',async()=>{
  const f=fake({id:88,title_en:'Tawhid 2',assignee:'Mohammed',page_count_verified:true,pages:559,
    translated_pages:0,status:'not_started',google_doc_url:null});
  const result=await startTranslation({...request,fetchImpl:f.fetchImpl});
  assert.equal(result.status,'in_progress');
  assert.equal(result.translatedPages,0);
  assert.equal(f.patches,1);
});
test('refuses wrong book before writing',async()=>{
  const f=fake({id:172,title_en:'Another book',assignee:'Zahraa',page_count_verified:true,pages:456,
    translated_pages:0,status:'not_started',google_doc_url:null});
  await assert.rejects(startTranslation({...request,fetchImpl:f.fetchImpl}),/project ID mismatch/);
  assert.equal(f.patches,0);
});

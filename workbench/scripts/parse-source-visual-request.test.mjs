import test from 'node:test';
import assert from 'node:assert/strict';
import {parseVisualRequest} from './parse-source-visual-request.mjs';
const env={GITHUB_REPOSITORY:'mohalizahraa/operator-translation',GITHUB_EVENT_NAME:'issues',GITHUB_REPOSITORY_OWNER:'mohalizahraa'};
const event={action:'opened',issue:{user:{login:'mohalizahraa'},title:'Workbench render: #12 physical 13-16'}};
test('exact owner metadata yields bounded project and physical page selection',()=>{
 assert.deepEqual(parseVisualRequest(event,env),{projectId:12,from:13,to:16});
});
test('cannot ask for arbitrary source URLs or uncontrolled page windows',()=>{
 for(const title of ['Workbench render: #12 physical 13-99','Workbench render: #12 physical 15-14',
   'Workbench render: #12 physical 0-1','Workbench render: #177 physical 2-3',
   'Workbench render: #12/../3 physical 2-3','Workbench render: #12 physical 3-3 https://other']){
   assert.throws(()=>parseVisualRequest({...event,issue:{...event.issue,title}},env));
 }
});
test('untrusted issue author, wrong repository, and non-open events rejected',()=>{
 assert.throws(()=>parseVisualRequest({...event,issue:{...event.issue,user:{login:'other'}}},env));
 assert.throws(()=>parseVisualRequest(event,{...env,GITHUB_REPOSITORY:'other/repo'}));
 assert.throws(()=>parseVisualRequest({...event,action:'edited'},env));
});

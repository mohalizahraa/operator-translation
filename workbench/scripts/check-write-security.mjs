#!/usr/bin/env node
import assert from 'node:assert/strict';
import {onRequest} from '../functions/_middleware.js';
import {requireEditorCapability} from '../functions/_write_auth.js';
const url='https://workbench.example/api/projects/7';
const key='editor-test-key-not-real-012345678901234567890';
const mk=(method,headers={},env={})=>({request:new Request(url,{method,headers}),env,next:async()=>new Response('NEXT',{status:200})});
let res=await onRequest(mk('GET'));assert.equal(res.status,200);
res=await onRequest(mk('PATCH',{'origin':'https://evil.example'}));assert.equal(res.status,403);
res=await onRequest(mk('PATCH',{'origin':'https://workbench.example'}));assert.equal(res.status,200,'Legacy route stays usable until a secret is provisioned; not secure.');
res=await onRequest(mk('PATCH',{}, {WORKBENCH_EDITOR_KEY:key}));assert.equal(res.status,401);
res=await onRequest(mk('PATCH',{'x-workbench-editor-key':'wrong'}, {WORKBENCH_EDITOR_KEY:key}));assert.equal(res.status,401);
res=await onRequest(mk('PATCH',{'x-workbench-editor-key':key}, {WORKBENCH_EDITOR_KEY:key}));assert.equal(res.status,200);
res=await onRequest(mk('PATCH',{'x-workbench-editor-key':key}, {WORKBENCH_EDITOR_KEY:'too-short'}));assert.equal(res.status,503,'Short configured secrets must fail closed');
const q=await requireEditorCapability(mk('POST'));assert.equal(q.status,503,'Questions endpoints must reject writes without a provisioned secret');
console.log('Workbench staged edit-access guard: PASS (live protection still requires Cloudflare secret).');

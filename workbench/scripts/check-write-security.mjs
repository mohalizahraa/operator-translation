#!/usr/bin/env node
import assert from 'node:assert/strict';
import {onRequest} from '../functions/_middleware.js';
import {requireEditorCapability,requireHumanReviewerCapability} from '../functions/_write_auth.js';
const url='https://workbench.example/api/projects/7';
const mk=(method,headers={},env={})=>({request:new Request(url,{method,headers}),env,next:async()=>new Response('NEXT',{status:200})});
let res=await onRequest(mk('GET'));assert.equal(res.status,200);
res=await onRequest(mk('PATCH',{'origin':'https://evil.example'}));assert.equal(res.status,403);
res=await onRequest(mk('PATCH',{'origin':'https://workbench.example'}));assert.equal(res.status,200);
res=await onRequest(mk('PATCH',{}, {WORKBENCH_EDITOR_KEY:'obsolete-legacy-secret'}));
assert.equal(res.status,200,'Stale Cloudflare editor secret must not reenable a credential gate.');
assert.equal((await requireEditorCapability(mk('POST'))).ok,true);
assert.equal((await requireHumanReviewerCapability(mk('POST'))).ok,true);
console.log('Workbench open collaboration: PASS (no key required; browser cross-origin write denied; identities self-reported).');

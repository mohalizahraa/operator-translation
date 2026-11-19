#!/usr/bin/env node
import assert from 'node:assert/strict';
import {onRequestGet,onRequestPost,onRequestPatch} from '../functions/api/projects/[id]/comment-links.js';

// Behavioral API smoke tests: invoke the REAL route handlers on simulated
// D1 reads. No production database, Google document or OAuth token is used.
const live='1Abcdefghijklmnopqrstuvwxy1';
const replacement='1Abcdefghijklmnopqrstuvwxy2';
let current=live;
const oldLink={
  question_key:'Q118-REV-001',source_page:5,decision_status:'unresolved',
  google_doc_id:live,comment_id:'AAACE35aTmc',anchor_id:'kix.grtyh8vkb3ih',
  tab_id:'t.0',quoted_text:'a quoted phrase',document_revision:'revDocOriginal_001',
  observed_state:'open',verification_status:'client_reported_unverified',
};
const db={
  prepare(sql){
    return {
      bind(...args){this.args=args;return this;},
      async first(){
        if(sql.includes('FROM projects WHERE id=?')){
          if(this.args[0]===999)return null;
          return {id:118,google_doc_url:`https://docs.google.com/document/d/${current}/edit`};
        }
        throw Error('Unexpected read query: '+sql);
      },
      async all(){
        if(sql.includes('FROM translation_question_comments c')&&sql.includes('JOIN translation_questions q')){
          return {results:[{...oldLink}]};
        }
        throw Error('Unexpected list query: '+sql);
      },
    };
  },
};
async function body(response){
  const payload=await response.json();
  return {status:response.status,...payload};
}
const context=(id=118,json=null)=>({
  params:{id:String(id)},env:{DB:db},request:{json:async()=>json},
});
let result=await body(await onRequestGet(context()));
assert.equal(result.status,200);
assert.equal(result.google_doc_id,live);
assert.equal(result.comment_links.length,1);
assert.equal(result.stale_link_count,0);
assert.equal(result.comment_links[0].matches_current_english_doc,true);
assert.equal(result.comment_links[0].decision_status,'unresolved');

current=replacement;
result=await body(await onRequestGet(context()));
assert.equal(result.status,200);
assert.equal(result.google_doc_id,replacement);
assert.equal(result.stale_link_count,1);
assert.equal(result.comment_links[0].matches_current_english_doc,false);
assert.equal(result.comment_links[0].comment_id,'AAACE35aTmc');
assert.equal(result.comment_links[0].decision_status,'unresolved');
assert.equal(result.observation_scope,'client_reported_unverified');

result=await body(await onRequestGet(context(999)));
assert.equal(result.status,404);

// No writes should occur on invalid payloads; these paths reject before any
// D1 migration or mutation. Real POST and PATCH persistence is separately
// exercised by SQLite transactional tests in check-comment-links.py.
result=await body(await onRequestPost(context(118,{question_key:'nope'})));
assert.equal(result.status,400);
result=await body(await onRequestPatch(context(118,{question_key:'Q118-REV-001',resolved:'yes'})));
assert.equal(result.status,400);
console.log('Native comment-link route behavioral smoke: PASS (live/stale GET, no fabricated approval, malformed writes blocked).');

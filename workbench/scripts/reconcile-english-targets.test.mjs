#!/usr/bin/env node
import assert from 'node:assert/strict';
import {reconcileEnglishTargets} from './reconcile-english-targets.mjs';

const d=id=>`https://docs.google.com/document/d/${id}/edit`;
const projects=[
  {id:13,google_doc_url:d('existingDoc13xxxxxxxxxx')},
  {id:14,google_doc_url:null},
  {id:15,google_doc_url:null},
  {id:118,google_doc_url:d('separateLive118xxxxxxx')},
  {id:119,google_doc_url:d('unnamedExisting119xxx')},
];
const candidates=[
  {id:'existingDoc13xxxxxxxxxx',title:'Volume — English Translation (Workbench #13)'},
  {id:'restrictedDoc14xxxxxxx',title:'Volume — English Translation (Workbench #14)'},
  {id:'dup15-1aaaaaaaaaaaaaa',title:'Volume — English Translation (Workbench #15)'},
  {id:'dup15-2aaaaaaaaaaaaaa',title:'Variant — English Translation (Workbench #15)'},
  {id:'inconsistent118xxxxxxx',title:'Volume — English Translation (Workbench #118)'},
  {id:'notAnEnglishQuestionDoc',title:'Questions & Evidence Log (Workbench #14)'},
];
const metadataByFileId={
  existingDoc13xxxxxxxxxx:{permissions:[{type:'user',role:'owner'},{type:'anyone',role:'writer'}]},
  restrictedDoc14xxxxxxx:{permissions:[{type:'user',role:'owner'}]},
};
const result=reconcileEnglishTargets({
  projects,candidates,metadataByFileId,restrictedFileIds:['restrictedDoc14xxxxxxx'],
});
assert.equal(result.ok,true);
assert.equal(result.total_books,5);
assert.equal(result.rows.find(x=>x.book_id===13).candidate_matches_existing_link,true);
assert.equal(result.rows.find(x=>x.book_id===13).access,'anyone_writer_metadata_confirmed');
assert.equal(result.rows.find(x=>x.book_id===14).decision,'existing_candidate_requires_access_and_content_review');
assert.equal(result.rows.find(x=>x.book_id===14).access,'no_anyone_writer_permission');
assert.equal(result.rows.find(x=>x.book_id===15).decision,'duplicate_english_candidates');
assert.equal(result.rows.find(x=>x.book_id===118).decision,'linked_other_doc_review_required');
assert.equal(result.rows.find(x=>x.book_id===119).decision,'already_linked_identity_check_pending');
assert.equal(result.rows.filter(x=>x.auto_link_document_allowed).length,0);
assert.equal(result.rows.filter(x=>x.auto_create_document_allowed).length,0);
assert.equal(JSON.stringify(result).includes('existingDoc13xxxxxxxxxx'),false);
assert.equal(JSON.stringify(result).includes('separateLive118xxxxxxx'),false);

const variant122=reconcileEnglishTargets({
  projects:[{id:122,google_doc_url:null}],
  candidates:[{id:'book122specificdocument',title:'Volume X — English Translation (Workbench #122, Arabic Volume 3)'}],
  restrictedFileIds:['book122specificdocument'],
});
assert.equal(variant122.rows[0].candidate_count,1);
assert.equal(variant122.rows[0].access,'limited_visibility_search');
const tabLink=reconcileEnglishTargets({
  projects:[{id:13,google_doc_url:d('existingDoc13xxxxxxxxxx')+'?tab=t.0#heading=h.12'}],
  candidates:[candidates[0]],
});
assert.equal(tabLink.rows[0].candidate_matches_existing_link,true);
const evilDomain=reconcileEnglishTargets({
  projects:[{id:1,google_doc_url:'https://docs.google.com.evil.tld/document/d/bad/edit'}],
  candidates:[],
});
assert.equal(evilDomain.rows[0].decision,'invalid_existing_doc_url');

const duplicate=reconcileEnglishTargets({projects:[...projects,projects[0]],candidates});
assert.equal(duplicate.code,'duplicate_workbench_book_id');
const invalid=reconcileEnglishTargets({projects:[{id:1,google_doc_url:'https://drive.google.com/open?id=1bad'}],candidates:[]});
assert.equal(invalid.rows[0].decision,'invalid_existing_doc_url');
const unknown=reconcileEnglishTargets({projects:[{id:1,google_doc_url:null}],candidates:[
  {id:'newCandidatexxxxxxxxxxx',title:'Volume — English Translation (Workbench #1)'},
],restrictedFileIds:['newCandidatexxxxxxxxxxx']});
assert.equal(unknown.rows[0].access,'limited_visibility_search');
assert.equal(unknown.rows[0].auto_link_document_allowed,false);
console.log('Workbench English target identity/access reconciliation: PASS (no duplicates, public status overclaims or blind linking).');

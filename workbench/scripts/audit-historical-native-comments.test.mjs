#!/usr/bin/env node
import assert from 'node:assert/strict';
import {decodeDocsQuote,auditHistoricalNativeComments} from './audit-historical-native-comments.mjs';

const quote='A unique and precise English passage';
const text='Prefix. '+quote+'. A comma , and a comma , afterwards.\n';
const document={documentId:'1testDocument123456789012345',revisionId:'revTest1234567890',
  tabs:[{tabId:'t.0',body:{content:[{paragraph:{elements:[
    {startIndex:1,endIndex:1+text.length,textRun:{content:text}},
  ]}}]}}]};
const comments=[
  {id:'oldNative01',anchor:'kix.unique01',resolved:false,
    quotedFileContent:{mimeType:'text/html',value:quote}},
  {id:'oldNative02',anchor:'kix.ambiguous02',resolved:true,
    quotedFileContent:{mimeType:'text/html',value:','}},
  {id:'oldNative03',anchor:'kix.stale03',resolved:true,
    quotedFileContent:{mimeType:'text/html',value:'A prior edition used this wording'}},
  {id:'oldNative04',anchor:'kix.entity04',resolved:false,
    quotedFileContent:{mimeType:'text/html',value:'&#171;'}},
  {id:'oldNative05',anchor:'kix.invalid05',resolved:false,
    quotedFileContent:{mimeType:'text/html',value:'<b>unsafe markup</b>'}},
];
const audit=auditHistoricalNativeComments({document,comments,tab_id:'t.0'});
assert.equal(audit.ok,true);
assert.equal(audit.comment_count,5);
assert.equal(audit.counts.unique_current_quote_candidate,1);
assert.equal(audit.counts.ambiguous_current_quote,1);
assert.equal(audit.counts.stale_or_reformatted_quote,2);
assert.equal(audit.counts.quote_not_safely_decodable,1);
assert.equal(audit.verified_source_questions,0);
assert.equal(audit.review_attestations,0);
assert.equal(audit.results[0].quote_length,quote.length);
assert.equal(audit.results[0].safe_to_import_as_verified_question,false);
assert.equal(audit.results[1].thread_resolved,true);
assert.equal(audit.results[1].question_decision_status,'not_determined');
assert.equal(audit.results[3].arabic_source_page,null);
assert.equal(decodeDocsQuote('&#171;Sample&#187;'),'«Sample»');
assert.equal(decodeDocsQuote('&#x1F600;'),'😀');
assert.equal(decodeDocsQuote('&amp;'),'&');
assert.equal(decodeDocsQuote('&bogus;'),null);
assert.equal(decodeDocsQuote('&#xD800;'),null);
assert.equal(decodeDocsQuote('<b>quoted</b>'),'<b>quoted</b>'); // audit caller rejects markup

const dupe=auditHistoricalNativeComments({document,tab_id:'t.0',comments:[comments[0],comments[0]]});
assert.equal(dupe.results[1].classification,'duplicate_or_missing_comment_id');
const missing=auditHistoricalNativeComments({document,tab_id:'t.0',comments:[{id:'aaabbbccc',quotedFileContent:{value:quote}}]});
assert.equal(missing.results[0].classification,'missing_native_anchor');
const invalid=auditHistoricalNativeComments({document:{...document,revisionId:null},tab_id:'t.0',comments});
assert.equal(invalid.ok,false);
console.log('Inherited native-comment audit: PASS (unique/ambiguous/stale quotes, HTML entities, resolution separate from human decision).');

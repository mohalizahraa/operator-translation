#!/usr/bin/env node
import assert from 'node:assert/strict';
import {planNativeCommentAnchor,planNativeCommentAnchorFromStructure} from './plan-native-comment-anchor.mjs';

const docId='1J4rtQ0t9bN57FG-AclGCENPbOSyGXGn0NzYkhvMGhUo';
const revision='AHj4eMSPxsWscpBs1-t2xwj6XGENGlRsT0KqEZSle';
function documentFor(lines){
  let index=1;
  const paragraphs=lines.map(({text,tabId='t.0'})=>{
    const startIndex=index,endIndex=index+text.length;
    index=endIndex;
    return {text,startIndex,endIndex,tabId};
  });
  return {documentId:docId,revisionId:revision,paragraphs};
}
const one=documentFor([
  {text:'Preface header.\n'},
  {text:'Translate سلام with care and 😊 respect.\n'},
  {text:'Footnote after this.\n'},
]);
const input=(extra={})=>({
  document:one,google_doc_id:docId,document_revision:revision,
  tab_id:'t.0',quoted_text:'سلام with care and 😊',
  comment_text:'Q118-REV-001 | source page pending | Check exact Arabic text before deciding.',
  ...extra,
});
const ok=planNativeCommentAnchor(input());
assert.equal(ok.ok,true);
assert.equal(ok.quoted_text,'سلام with care and 😊');
assert.equal(ok.endIndex-ok.startIndex,ok.quoted_text.length);
assert.equal(ok.request.insertComment.range.startIndex,ok.startIndex);
assert.equal(ok.request.insertComment.range.endIndex,ok.endIndex);
assert.equal(ok.request.insertComment.range.tabId,'t.0');
assert.equal(ok.write_control.requiredRevisionId,revision);
assert.equal(one.paragraphs[1].text.slice(ok.startIndex-one.paragraphs[1].startIndex,
  ok.endIndex-one.paragraphs[1].startIndex),ok.quoted_text);

// Each unsafe condition must STOP rather than place a misleading comment.
const rejected=[
  [input({google_doc_id:'wrong'}),'wrong_document'],
  [input({document_revision:'olderRevision'}),'stale_revision'],
  [input({tab_id:'t.notthere'}),'missing_tab'],
  [input({quoted_text:'\nFootnote'}),'invalid_quote'],
  [input({quoted_text:'missing words'}),'quote_not_found'],
  [input({comment_text:'  '}),'invalid_comment'],
  [input({document:documentFor([{text:'سلام with care and 😊 سلام with care and 😊\n'}])}),'ambiguous_quote'],
  [input({document:documentFor([{text:'سلام with care and 😊\n',tabId:'t.0'},{text:'Another line',tabId:'t.1'}]),
          tab_id:'t.1'}),'quote_not_found'],
];
for(const [args,code] of rejected){
  assert.equal(planNativeCommentAnchor(args).code,code,code);
}
const malformed=documentFor([{text:'سلام with care and 😊\n'}]);
malformed.paragraphs[0].endIndex++;
assert.equal(planNativeCommentAnchor(input({document:malformed})).code,'structural_index_mismatch');

// Native Docs structure can have an indexed inline footnote while
// get_document_text() omits that marker and its trailing newline.
const excerpt='«There is no doubt that error cannot apply to this hadith';
const begin='«There is no doubt that error cannot apply to this hadith and the remaining text. ';
const nativeDoc={
  documentId:docId,revisionId:revision,
  tabs:[{tabId:'t.0',body:{content:[
    {startIndex:1,endIndex:2,sectionBreak:{}},
    {startIndex:2,endIndex:2+begin.length+2,paragraph:{elements:[
      {startIndex:2,endIndex:2+begin.length,textRun:{content:begin}},
      {startIndex:2+begin.length,endIndex:3+begin.length,footnoteReference:{footnoteId:'fn1'}},
      {startIndex:3+begin.length,endIndex:4+begin.length,textRun:{content:'\\n'}},
    ]}},
  ]}}],
};
const nativeArgs={
  document:nativeDoc,google_doc_id:docId,document_revision:revision,tab_id:'t.0',
  quoted_text:excerpt,comment_text:'Q118-REV-002 | inspect citation boundary.',
};
const native=planNativeCommentAnchorFromStructure(nativeArgs);
assert.equal(native.ok,true,JSON.stringify(native));
assert.equal(native.source_view,'native_elements');
assert.equal(native.startIndex,2);
assert.equal(native.endIndex-native.startIndex,excerpt.length);
assert.equal(native.request.insertComment.range.tabId,'t.0');
assert.equal(native.write_control.requiredRevisionId,revision);
const crossesGap=planNativeCommentAnchorFromStructure({...nativeArgs,
  quoted_text:begin.slice(-10)+'\\n'});
assert.equal(crossesGap.code,'invalid_quote');
// There is no safe match that silently skips over a footnote marker.
const missingSpan=planNativeCommentAnchorFromStructure({...nativeArgs,
  quoted_text:'remaining text. \\n'});
assert.equal(missingSpan.code,'invalid_quote');
const repeatedStructured={
  ...nativeDoc,tabs:[{tabId:'t.0',body:{content:[
    ...nativeDoc.tabs[0].body.content,
    {paragraph:{elements:[{startIndex:1000,endIndex:1000+begin.length,textRun:{content:begin}}]}},
  ]}}],
};
assert.equal(planNativeCommentAnchorFromStructure({...nativeArgs,document:repeatedStructured}).code,'ambiguous_quote');
assert.equal(planNativeCommentAnchorFromStructure({...nativeArgs,
  document:{...nativeDoc,revisionId:'later'}}).code,'stale_revision');
const wrongNative={...nativeDoc,tabs:[{tabId:'t.0',body:{content:[
  {paragraph:{elements:[{startIndex:2,endIndex:4,textRun:{content:begin}}]}},
]}}]};
assert.equal(planNativeCommentAnchorFromStructure({...nativeArgs,document:wrongNative}).code,'structural_index_mismatch');

console.log('Native Docs exact-comment anchor planner: PASS (unique UTF-16 range, revision, doc/tab identity, ambiguity and structural drift).');

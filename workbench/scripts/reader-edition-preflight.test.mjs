import test from 'node:test';
import assert from 'node:assert/strict';
import {assessReaderEdition} from './reader-edition-preflight.mjs';
const black={foregroundColor:{color:{rgbColor:{}}}};
const gray={foregroundColor:{color:{rgbColor:{red:.4,green:.4,blue:.4}}}};
const green={foregroundColor:{color:{rgbColor:{red:56/255,green:118/255,blue:29/255}}}};
const font=(size=24)=>({fontSize:{magnitude:size,unit:'PT'},weightedFontFamily:{fontFamily:'Amiri'},bold:true});
const run=(content,textStyle={})=>({textRun:{content,textStyle}});
const par=(elements,namedStyleType='NORMAL_TEXT')=>({paragraph:{elements,paragraphStyle:{namedStyleType}}});
function fixture(){
 const body={content:[par([run('Lesson One\n',font())],'HEADING_1'),par([run('A chapter title\n',font())],'HEADING_1'),par([run('Source prose with an ordinary bibliographic page reference, p. 42.\n'),{footnoteReference:{footnoteId:'note'}}]),par([run('﴾A translated verse.﴿\n',green)])]};
 return{expectedRevision:'synthetic-r1',coverageAudited:true,document:{revisionId:'synthetic-r1',tabs:[{body,namedStyles:{styles:[{namedStyleType:'NORMAL_TEXT',textStyle:black},{namedStyleType:'HEADING_1',textStyle:black},{namedStyleType:'HEADING_3',textStyle:gray}]},footnotes:{note:{content:[par([run('Author, Book, p. 42.\n')])]}}}]}};
}
test('valid black and bracketed green manuscript with paired 24 pt headings passes',()=>assert.equal(assessReaderEdition(fixture()).ok,true));
test('production marker split over text runs is blocked in the body',()=>{let f=fixture();f.document.tabs[0].body.content.push(par([run('EDITORIAL SOURCE/ENGLISH '),run('CHECKPOINT — internal batch evidence')]));assert.equal(assessReaderEdition(f).counts.operationalMarkers,1);assert.equal(assessReaderEdition(f).ok,false);});
test('smaller chapter label fails despite valid H1',()=>{let f=fixture();f.document.tabs[0].body.content[0]=par([run('Lesson One\n',font(18))],'HEADING_1');assert.equal(assessReaderEdition(f).counts.invalidHeadingPairs,1);});
test('inherited gray and explicit gray fail; deliberate green outside verse fails',()=>{let f=fixture();f.document.tabs[0].body.content.push(par([run('Inherited heading')],'HEADING_3'),par([run('Gray body',gray)]),par([run('Not verse',green)]));assert.equal(assessReaderEdition(f).counts.nonBlackRuns,3);});
test('metadata in note and header, and proposed progress token, fail without leaking text',()=>{let f=fixture(),t=f.document.tabs[0];t.footnotes.note.content.push(par([run('Physical source page 42')]));t.headers={h:{content:[par([run('WORKING DRAFT / EVIDENCE CHECKPOINT — metadata')])]}};f.proposedParagraphs=['⟦WBPROGRESS:1:2:3⟧'];let r=assessReaderEdition(f);assert.equal(r.counts.operationalMarkers,3);assert.equal(r.ok,false);assert.ok(!JSON.stringify(r).includes('metadata'));});
test('stale revision, missing note, absent coverage, unresolved color fail closed',()=>{let f=fixture();f.expectedRevision='stale';assert.equal(assessReaderEdition(f).ok,false);f=fixture();delete f.document.tabs[0].footnotes.note;assert.equal(assessReaderEdition(f).counts.missingFootnotes,1);f=fixture();delete f.coverageAudited;assert.equal(assessReaderEdition(f).ok,false);f=fixture();f.document.tabs[0].namedStyles.styles=[];assert.ok(assessReaderEdition(f).counts.unresolvedColorRuns>0);});

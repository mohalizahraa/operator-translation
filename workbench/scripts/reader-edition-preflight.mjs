#!/usr/bin/env node
// Private native Google Docs readback/expected-candidate preflight. No manuscript
// text, source identifiers or revision IDs may be printed, committed or logged.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const markerPatterns=[
  /\bEDITORIAL\s*(?:\/\s*)?(?:SOURCE(?:\s*\/\s*ENGLISH)?\s+CHECKPOINT|STATUS\s*[—–:-]\s*WORKING DRAFT|WORKING COPY\s*[—–:-]\s*NOT COMPLETE)\b/i,
  /\bWORKING DRAFT\s*\/\s*EVIDENCE CHECKPOINT\b/i,
  /\bSOURCE[- ]EQUIVALENT STAGED DRAFT\b/i,
  /\b(?:ORIGINAL\s+)?PHYSICAL\s+(?:(?:ARABIC|SOURCE|PDF)\s+)*(?:PAGES?|PP?\.?)\s*\d/i,
  /\bCANONICAL WORKBENCH PROJECT\s*#?\d+\b/i,
  /\bSOURCE:\s*(?:THE OFFICIAL\s+\d+[- ]PAGE ARABIC PDF|CANONICAL ARABIC PDF)\b/i,
  /\b(?:NEXT\s+(?:ORIGINAL\s+)?PHYSICAL\s+(?:PDF\s+)?P?\d+|VISUALLY VERIFIED BLANK|INTENTIONALLY BLANK SOURCE PAGE|INDEPENDENT QA OPEN|OVERLAP[- ]CHECK LOGIC|NOT INTEGRATED INTO THE MAIN MANUSCRIPT|TRANSLATION AND SOURCE-ALIGNED EDITORIAL VERIFICATION)\b/i,
  /⟦WBPROGRESS:\d+:\d+:\d+⟧/i,
  /\b(?:SHA-?256|MAC (?:WORKFLOW |SOURCE-IMAGE )?RUN)\s*[a-f0-9]{6,}\b/i,
  /\b(?:SOURCE[- ]PAGE CONCORDANCE|SOURCE[- ]PAGE DISPOSITIONS DRAFTED|PHYSICAL PAGE CHECKPOINT)\b/i
];
const label=/^(?:Chapter|Lesson|Part|Book)\s+(?:\d+|[IVXLCDM]+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty(?:[- ](?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine))?)$/i;
const rgb=s=>s?.foregroundColor?.color?.rgbColor;
const exactRGB=(c,expected)=>!!c&&['red','green','blue'].every((k,i)=>Math.abs((c[k]??0)-expected[i])<0.000001);
const black=c=>exactRGB(c,[0,0,0]);
const green=c=>exactRGB(c,[56/255,118/255,29/255]);
const text=p=>(p.elements??[]).map(e=>e.textRun?.content??'').join('');
const styleType=p=>p.paragraphStyle?.namedStyleType??'NORMAL_TEXT';
const visible=p=>(p.elements??[]).filter(e=>e.textRun?.content?.trim());
const lessonRun=(e,styles,p)=>{
 const s=e.textRun.textStyle??{},n=styles[styleType(p)]??{},b=styles.NORMAL_TEXT??{};
 return (s.fontSize??n.fontSize??b.fontSize)?.magnitude===24&&
 (s.bold??n.bold??b.bold)===true&&
 (s.weightedFontFamily??n.weightedFontFamily??b.weightedFontFamily)?.fontFamily==='Amiri'&&
 black(rgb(s)??rgb(n)??rgb(b));
};
function paragraphLists(elements,visit){
 if(!Array.isArray(elements))return;
 const adjacent=[];
 for(const el of elements){
  if(el.paragraph){adjacent.push(el.paragraph);visit(el.paragraph);}
  else {
   if(adjacent.length){visit(null,adjacent.splice(0));}
   if(el.table)for(const row of el.table.tableRows??[])for(const cell of row.tableCells??[])paragraphLists(cell.content,visit);
   if(el.tableOfContents)paragraphLists(el.tableOfContents.content,visit);
  }
 }
 if(adjacent.length)visit(null,adjacent);
}
export function assessReaderEdition({document,expectedRevision,coverageAudited,proposedParagraphs=[]}={}){
 const counts={operationalMarkers:0,nonBlackRuns:0,unresolvedColorRuns:0,headingPairs:0,invalidHeadingPairs:0,missingFootnotes:0,unknownTextSurfaces:0,paragraphs:0};
 const fail=(code)=>({ok:false,code,counts});
 if(!document||typeof expectedRevision!=='string'||!expectedRevision||document.revisionId!==expectedRevision||coverageAudited!==true)return fail('unverified_revision_or_coverage');
 if(!Array.isArray(proposedParagraphs)||proposedParagraphs.some(p=>typeof p!=='string'))return fail('invalid_proposed_paragraphs');
 for(const p of proposedParagraphs)if(markerPatterns.some(rx=>rx.test(p)))counts.operationalMarkers++;
 const tabs=[];
 const walk=t=>{for(const tab of t??[]){tabs.push(tab.documentTab??tab);walk(tab.childTabs);}};
 if(Array.isArray(document.tabs))walk(document.tabs);
 else if(document.body)tabs.push(document);
 if(!tabs.length)return fail('missing_native_document');
 for(const tab of tabs){
  if(!Array.isArray(tab.body?.content)||!Array.isArray(tab.namedStyles?.styles))return fail('incomplete_native_document');
  const styles=Object.fromEntries(tab.namedStyles.styles.map(s=>[s.namedStyleType,s.textStyle??{}]));
  const refs=new Set();
  let bracketOpen=false;
  const visit=(p,list)=>{
   if(list){
    for(let i=0;i<list.length;i++){
     const a=list[i],b=list[i+1],aText=text(a).trim();
     if(!label.test(aText)||styleType(a)!=='HEADING_1')continue;
     counts.headingPairs++;
     if(!b||styleType(b)!=='HEADING_1'||!text(b).trim()||label.test(text(b).trim())||
       ![a,b].every(q=>visible(q).length&&visible(q).every(e=>lessonRun(e,styles,q))))counts.invalidHeadingPairs++;
    }
    return;
   }
   counts.paragraphs++;
   if(markerPatterns.some(rx=>rx.test(text(p))))counts.operationalMarkers++;
   for(const e of p.elements??[]){
    if(e.footnoteReference?.footnoteId)refs.add(e.footnoteReference.footnoteId);
    // The source-location and semantic authorization of green passages remain
    // independent QA gates. Here green is restricted to bracketed verse text.
    if(!e.textRun){if(!e.footnoteReference&&!e.pageBreak&&!e.columnBreak&&!e.inlineObjectElement&&!e.horizontalRule&&!e.autoText)counts.unknownTextSurfaces++;continue;}
    const s=e.textRun.textStyle??{},n=styles[styleType(p)]??{},b=styles.NORMAL_TEXT??{};
    const c=rgb(s)??rgb(n)??rgb(b);
    const content=e.textRun.content??'';
    let onlyVerse=true;
    for(const ch of content){
     if(ch==='﴾')bracketOpen=true;
     if(!bracketOpen&&!/\s/u.test(ch))onlyVerse=false;
     if(ch==='﴿')bracketOpen=false;
    }
    if(!content.trim())continue;
    if(!c)counts.unresolvedColorRuns++;
    else if(!black(c)&&!(green(c)&&onlyVerse))counts.nonBlackRuns++;
   }
  };
  paragraphLists(tab.body.content,visit);
  for(const seg of ['footnotes','headers','footers']){
   for(const entry of Object.values(tab[seg]??{})){
    if(!Array.isArray(entry.content))return fail('incomplete_native_segment');
    bracketOpen=false;paragraphLists(entry.content,visit);
   }
  }
  for(const ref of refs)if(!tab.footnotes?.[ref])counts.missingFootnotes++;
 }
 if(!counts.paragraphs)return fail('empty_native_document');
 const failures=counts.operationalMarkers+counts.nonBlackRuns+counts.unresolvedColorRuns+counts.invalidHeadingPairs+counts.missingFootnotes+counts.unknownTextSurfaces;
 return {ok:failures===0,code:failures?'READER_EDITION_PREFLIGHT_FAIL':'READER_EDITION_PREFLIGHT_PASS',counts};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const result=assessReaderEdition(JSON.parse(readFileSync(process.argv[2],'utf8')));
  console.log(JSON.stringify(result));
  if(!result.ok)process.exitCode=1;
 }catch{
  console.error('READER_EDITION_PREFLIGHT_FAIL: unreadable or invalid private input');
  process.exitCode=1;
 }
}

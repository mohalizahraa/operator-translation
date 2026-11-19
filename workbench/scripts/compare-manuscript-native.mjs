#!/usr/bin/env node
/**
 * Read-only, privacy-safe Google Docs source/copy parity gate.
 * Accepts complete PRIVATE Google Docs API document snapshots, not filenames,
 * search hits, text exports, or claimed element counts. Never logs source text,
 * document identifiers, revisions, file paths, or individual style contents.
 * Passing proves only checked native structure/text/style parity, NOT rendered,
 * comment, revision-history, shared-access, or publication equivalence.
 */
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value==='object') {
    return Object.fromEntries(Object.entries(value).filter(([k])=>!['headingId','listId'].includes(k))
      .sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));
  }
  return value;
}
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
function assertDocument(d) {
  if (!d || typeof d.documentId!=='string' || typeof d.revisionId!=='string' || !d.revisionId ||
      !(d.body?.content || (Array.isArray(d.tabs)&&d.tabs.length))) {
    throw new Error('incomplete_native_snapshot');
  }
}
function collectElements(nodes) {
  const paragraphs=[], shapes={sectionBreaks:0,inlineObjects:0,positionedObjects:0,tables:0,other:0};
  const noteIds=[];
  function visit(items) {
    for (const item of items||[]) {
      if (item.paragraph) {
        const p=item.paragraph, runs=[];
        for (const e of p.elements||[]) {
          if (e.textRun) runs.push({text:e.textRun.content||'',style:e.textRun.textStyle||{}});
          else if (e.footnoteReference) {runs.push({token:'note'});noteIds.push(e.footnoteReference.footnoteId);}
          else if (e.inlineObjectElement) {runs.push({token:'object'});shapes.inlineObjects++;}
          else if (e.autoText) runs.push({token:'autoText'});
          else {runs.push({token:'unknown'});shapes.other++;}
        }
        paragraphs.push({style:p.paragraphStyle||{},bullet:Boolean(p.bullet),runs});
      } else if (item.table) {
        shapes.tables++;
        for (const row of item.table.tableRows||[])for(const cell of row.tableCells||[])visit(cell.content);
      } else if (item.sectionBreak) shapes.sectionBreaks++;
      else if (item.tableOfContents) {shapes.other++;visit(item.tableOfContents.content);}
      else shapes.other++;
    }
  }
  visit(nodes);
  return {paragraphs,shapes,noteIds};
}
function unpack(d) {
  assertDocument(d);
  const input=d.tabs?.length?d.tabs:[{tabProperties:{title:'single'},documentTab:d}];
  return input.map(t=>{
    const x=t.documentTab||t;
    if (!x.body || !Array.isArray(x.body.content)) throw new Error('incomplete_native_tab');
    const body=collectElements(x.body.content);
    const notes=x.footnotes||{};
    const orderedIds=[...new Set(body.noteIds.filter(Boolean))];
    // If an exported snapshot has no explicit anchors, fail closed on note identity.
    if (Object.keys(notes).length && orderedIds.length!==Object.keys(notes).length)throw new Error('unresolved_footnote_anchors');
    const footnotes=orderedIds.map(id=>{
      if (!Array.isArray(notes[id]?.content))throw new Error('unresolved_footnote_anchors');
      return collectElements(notes[id].content);
    });
    const segments=(collection)=>Object.entries(collection||{}).map(([,v])=>collectElements(v.content||[]));
    return {title:t.tabProperties?.title||t.title||'',body,footnotes,
      headers:segments(x.headers),footers:segments(x.footers),
      inlineObjectCount:Object.keys(x.inlineObjects||{}).length,
      positionedObjectCount:Object.keys(x.positionedObjects||{}).length};
  });
}
function compareParagraphs(a,b,result) {
  const pa=a.paragraphs,pb=b.paragraphs;
  result.paragraphs+=Math.max(pa.length,pb.length);
  if (!equal(a.shapes,b.shapes))result.structureDifferences++;
  if (pa.length!==pb.length)result.structureDifferences++;
  for(let i=0;i<Math.min(pa.length,pb.length);i++) {
    const x=pa[i],y=pb[i];
    if(!equal(x.style,y.style)||x.bullet!==y.bullet)result.paragraphStyleDifferences++;
    const xx=x.runs.map(r=>r.text??'\uFFFC').join('');
    const yy=y.runs.map(r=>r.text??'\uFFFC').join('');
    if(xx!==yy) {result.textDifferences++;continue;}
    const cx=x.runs.flatMap(r=>[...(r.text??'\uFFFC')].map(ch=>[ch,r.token||null,JSON.stringify(canonical(r.style||{}))]));
    const cy=y.runs.flatMap(r=>[...(r.text??'\uFFFC')].map(ch=>[ch,r.token||null,JSON.stringify(canonical(r.style||{}))]));
    result.characters+=cx.length;
    for(let j=0;j<cx.length;j++)if(cx[j][1]!==cy[j][1]||cx[j][2]!==cy[j][2])result.characterStyleDifferences++;
  }
}
export function compareNativeDocumentSnapshots(source,copy) {
  const a=unpack(source),b=unpack(copy);
  const report={checked:'native_docs_snapshot',nativeParity:false,exactCopyCertified:false,
    tabs:Math.max(a.length,b.length),paragraphs:0,characters:0,
    textDifferences:0,paragraphStyleDifferences:0,characterStyleDifferences:0,
    structureDifferences:0,footnoteCount:0,
    unverified:['rendered_layout','comments','revision_history','list_numbering_definitions',
      'external_links_and_media','public_editor_permission','live_workbench_link']};
  if(a.length!==b.length)report.structureDifferences++;
  for(let i=0;i<Math.min(a.length,b.length);i++) {
    const x=a[i],y=b[i];
    if(x.title!==y.title||x.inlineObjectCount!==y.inlineObjectCount||
       x.positionedObjectCount!==y.positionedObjectCount)report.structureDifferences++;
    for(const k of ['body','footnotes','headers','footers']) {
      const aa=k==='body'?[x.body]:x[k],bb=k==='body'?[y.body]:y[k];
      if(aa.length!==bb.length)report.structureDifferences++;
      if(k==='footnotes')report.footnoteCount+=aa.length;
      for(let j=0;j<Math.min(aa.length,bb.length);j++)compareParagraphs(aa[j],bb[j],report);
    }
  }
  report.nativeParity=report.textDifferences===0&&report.paragraphStyleDifferences===0&&
    report.characterStyleDifferences===0&&report.structureDifferences===0;
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try {
    if(process.argv.length!==4)throw new Error('usage_private_source_and_copy_json_required');
    const input=process.argv.slice(2).map(p=>JSON.parse(readFileSync(p,'utf8')));
    const result=compareNativeDocumentSnapshots(...input);
    console.log(JSON.stringify(result));
    if(!result.nativeParity)process.exitCode=1;
  }catch(error){
    // No exception detail: provider/JSON errors may include confidential paths/content.
    console.error('NATIVE_PARITY_BLOCKED: '+(error.message.startsWith('incomplete_')||error.message==='unresolved_footnote_anchors' ? error.message:'invalid_or_inaccessible_private_snapshot'));
    process.exitCode=2;
  }
}

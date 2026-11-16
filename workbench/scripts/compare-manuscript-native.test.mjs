import test from 'node:test';
import assert from 'node:assert/strict';
import {compareNativeDocumentSnapshots} from './compare-manuscript-native.mjs';
const para=(runs,style={namedStyleType:'NORMAL_TEXT'})=>({paragraph:{paragraphStyle:style,elements:runs.map(r=>({textRun:{content:r.text,textStyle:r.style||{}}}))}});
const make=(runs=[{text:'A ﷻ B\n'}])=>({documentId:'private-id',revisionId:'revision-1',tabs:[{
  tabProperties:{title:'Tab 1'},documentTab:{body:{content:[para(runs)]},footnotes:{}}
}]});
test('identical native snapshots pass only native parity, not exact copy certification',()=>{
  const p=compareNativeDocumentSnapshots(make(),make());
  assert.equal(p.nativeParity,true);assert.equal(p.exactCopyCertified,false);assert.equal(p.characters,6);
});
test('same words but sacred-glyph font changed fails exact native styles',()=>{
  const a=make(),b=make([{text:'A '},{text:'ﷻ',style:{weightedFontFamily:{fontFamily:'Scheherazade New'}}},{text:' B\n'}]);
  const r=compareNativeDocumentSnapshots(a,b);
  assert.equal(r.textDifferences,0);assert.equal(r.characterStyleDifferences,1);assert.equal(r.nativeParity,false);
});
test('changed prose and paragraph styles both fail independently',()=>{
  const a=make(),b=make([{text:'Different\n'}]);
  b.tabs[0].documentTab.body.content[0].paragraph.paragraphStyle.namedStyleType='TITLE';
  const r=compareNativeDocumentSnapshots(a,b);
  assert.equal(r.textDifferences,1);assert.equal(r.paragraphStyleDifferences,1);
});
test('source must include native revision and content, not a filename-only inventory',()=>{
  const d=make();delete d.revisionId;
  assert.throws(()=>compareNativeDocumentSnapshots(d,make()),/incomplete_native_snapshot/);
});
test('native footnote content drift fails while changed footnote IDs align by anchor order',()=>{
  const a=make(),b=make();
  for(const [d,id,text] of [[a,'sourceNote','old note\n'],[b,'copyNote','new note\n']]){
    const tab=d.tabs[0].documentTab;
    tab.body.content[0].paragraph.elements.push({footnoteReference:{footnoteId:id}});
    tab.footnotes[id]={content:[para([{text}])]};
  }
  const r=compareNativeDocumentSnapshots(a,b);
  assert.equal(r.footnoteCount,1);assert.equal(r.textDifferences,1);assert.equal(r.nativeParity,false);
});

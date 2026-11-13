import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stageTranslationBatch, validateBatch } from './batch.mjs';

async function fixture(fn) {
  const root = await mkdtemp(join(tmpdir(), 'haydari-engine-'));
  try {
    const pdfPath = join(root, 'source.pdf');
    const bytes = Buffer.from('%PDF-1.4\nsynthetic source witness only\n%%EOF\n');
    await writeFile(pdfPath, bytes);
    const outputDir = join(root, 'private-artifacts');
    await mkdir(outputDir, {mode:0o700});
    const manifest = {
      source: {projectId:42,pdfSha256:createHash('sha256').update(bytes).digest('hex'),pageCount:3},
      target: {documentId:'synthetic-English-Doc',expectedRevision:'revision-before-batch'},
      batch: {verifiedThrough:0,fromPage:1,toPage:2},
      units: [
        {id:'body-1',page:1,kind:'text',surface:'body',sourceRef:'PDF page 1 paragraph 1',sourceText:'طلب العلم'},
        {id:'note-1',page:1,kind:'text',surface:'footnote',sourceRef:'PDF page 1 note 1',sourceText:'هذه حاشية'},
        {id:'body-2',page:2,kind:'text',surface:'body',sourceRef:'PDF page 2 paragraph 1',sourceText:'نص آخر'}
      ]
    };
    const translateUnit = async u => ({english:{
      'body-1':'Seeking knowledge.', 'note-1':'This is a footnote.', 'body-2':'Another passage.'
    }[u.id]});
    const critiqueUnit = async () => ({status:'PASS',findings:[],criticId:'separate-synthetic-critic'});
    await fn({root,pdfPath,outputDir,manifest,translateUnit,critiqueUnit});
  } finally { await rm(root,{recursive:true,force:true}); }
}
function run(f) {
  return stageTranslationBatch({
    manifest:f.manifest,pdfPath:f.pdfPath,outputDir:f.outputDir,
    translateUnit:f.translateUnit,critiqueUnit:f.critiqueUnit
  });
}

test('stages an exact source/target bound two-page translation without advancing progress', async () =>
  fixture(async f => {
    let translated=0, critiqued=0;
    const t=f.translateUnit, c=f.critiqueUnit;
    f.translateUnit=async (...args)=>{translated++;return t(...args);};
    f.critiqueUnit=async (...args)=>{critiqued++;return c(...args);};
    const first=await run(f);
    assert.equal(first.state,'STAGED_NEEDS_SOURCE_AND_FORMAT_REVIEW');
    assert.equal(first.verifiedProgressAdvanced,false);
    assert.equal(translated,3);
    assert.equal(critiqued,3);
    const artifact=JSON.parse(await readFile(first.path,'utf8'));
    assert.equal(artifact.manuscriptMutated,false);
    assert.equal(artifact.verifiedProgressAdvanced,false);
    assert.equal(artifact.units[1].surface,'footnote');
    assert.equal(artifact.units[1].english,'This is a footnote.');
    assert.deepEqual(artifact.batch,{verifiedThrough:0,fromPage:1,toPage:2});
    const second=await run(f);
    assert.equal(second.path,first.path);
    assert.equal(second.reused,true);
  }));

test('rejects noncontiguous ranges, holes, duplicate units and unsupported surfaces', async () =>
  fixture(async f => {
    f.manifest.batch.verifiedThrough=1;
    assert.throws(()=>validateBatch(f.manifest),/immediately follow/);
    f.manifest.batch.verifiedThrough=0;
    f.manifest.units=f.manifest.units.filter(x=>x.page===1);
    assert.throws(()=>validateBatch(f.manifest),/no unit/);
    f.manifest.units.push({...f.manifest.units[0]});
    assert.throws(()=>validateBatch(f.manifest),/duplicate/);
    f.manifest.units[1].id='new-id';
    f.manifest.units[1].surface='unknown';
    assert.throws(()=>validateBatch(f.manifest),/unsupported source surface/);
  }));

test('PDF identity fails closed before invoking the translator', async () =>
  fixture(async f => {
    f.manifest.source.pdfSha256='a'.repeat(64);
    let invoked=false;
    f.translateUnit=async ()=>{invoked=true;return {english:'Wrong'};};
    await assert.rejects(run(f),/hash mismatch/);
    assert.equal(invoked,false);
  }));

test('Arabic draft residue fails closed; does not stage an artifact', async () =>
  fixture(async f => {
    f.translateUnit=async ()=>({english:'Untranslated نص'});
    await assert.rejects(run(f),/Arabic script/);
  }));

test('critic findings are persisted as open rather than silently approved', async () =>
  fixture(async f => {
    f.critiqueUnit=async ({unit})=>({
      status:unit.id==='note-1'?'BLOCK':'PASS',
      findings:unit.id==='note-1'?['Footnote needs source comparison']:[],
      criticId:'separate-synthetic-critic'
    });
    const record=await run(f);
    assert.equal(record.state,'STAGED_WITH_OPEN_CRITIC_FINDINGS');
    const artifact=JSON.parse(await readFile(record.path,'utf8'));
    assert.equal(artifact.units[1].critic.status,'BLOCK');
    assert.equal(artifact.verifiedProgressAdvanced,false);
  }));

test('explicit blank-page witness counts as a source page, not translated text', async () =>
  fixture(async f => {
    f.manifest.units.push({id:'blank-3',page:3,kind:'blank',surface:'other',sourceRef:'PDF page 3 visual page witness'});
    f.manifest.batch.toPage=3;
    const record=await run(f);
    const artifact=JSON.parse(await readFile(record.path,'utf8'));
    assert.equal(artifact.units.at(-1).state,'BLANK_WITNESS_UNVERIFIED');
    assert.equal(artifact.units.at(-1).english,undefined);
  }));

test('rejects an output directory with group/other permissions', async () =>
  fixture(async f => {
    await chmod(f.outputDir,0o755);
    await assert.rejects(run(f),/owner-only/);
  }));

test('detects a tampered existing staged artifact, never overwrites', async () =>
  fixture(async f => {
    const first=await run(f);
    await writeFile(first.path,'tampered artifact');
    await assert.rejects(run(f),/differs or is incomplete/);
  }));

test('keeps exact Arabic lineation and English whitespace in staged evidence', async () =>
  fixture(async f => {
    f.manifest.units[0].sourceText = '  طلب العلم\\nسطر ثان  ';
    const original=f.translateUnit;
    f.translateUnit=async (unit,context)=>unit.id==='body-1'
      ? {english:'  Seeking knowledge.\\nSecond line.  '}
      : original(unit,context);
    const record=await run(f);
    const staged=JSON.parse(await readFile(record.path,'utf8'));
    assert.equal(staged.units[0].sourceText,'  طلب العلم\\nسطر ثان  ');
    assert.equal(staged.units[0].english,'  Seeking knowledge.\\nSecond line.  ');
  }));

test('rejects critic review labels without concrete findings', async () =>
  fixture(async f => {
    f.critiqueUnit=async ()=>({status:'BLOCK',findings:[],criticId:'critic'});
    await assert.rejects(run(f),/structured disposition/);
  }));

test('refuses reuse after staged artifact becomes group/world readable', async () =>
  fixture(async f => {
    const staged=await run(f);
    await chmod(staged.path,0o644);
    await assert.rejects(run(f),/private regular file/);
  }));

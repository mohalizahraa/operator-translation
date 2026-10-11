import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractNativeSourcePages, compareNativeSourceUnits, stageNativeSourceAlignedBatch } from './source.mjs';

async function fixture(fn) {
  const root=await mkdtemp(join(tmpdir(),'haydari-native-source-'));
  try {
    const pdfPath=join(root,'canonical.pdf');
    const bytes=Buffer.from('%PDF-1.4\nprivate synthetic byte witness\n%%EOF\n');
    await writeFile(pdfPath,bytes);
    const pdfSha256=createHash('sha256').update(bytes).digest('hex');
    const opts={pdfPath,pdfSha256,pageCount:3,fromPage:1,toPage:3,backend:'poppler'};
    await fn(opts);
  } finally { await rm(root,{recursive:true,force:true}); }
}

function popplerStub(pageText, expected=3) {
  const calls=[];
  const run=async (name,args)=>{
    calls.push([name,args]);
    if(name==='pdfinfo')return {stdout:'Title: Source\nPages: '+expected+'\n'};
    if(name==='pdftotext')return {stdout:pageText.join('\f')+'\f'};
    throw new Error('unexpected executable '+name);
  };
  return {run,calls};
}
test('extracts exactly three native page witnesses including an empty scanned candidate', async () =>
  fixture(async options=>{
    const {run,calls}=popplerStub(['طلب العلم\n','','هذا نص آخر\n']);
    const w=await extractNativeSourcePages({...options,run});
    assert.equal(w.pages.length,3);
    assert.deepEqual(w.pages.map(p=>p.physicalPage),[1,2,3]);
    assert.equal(w.pages[0].nativeText,'طلب العلم\n');
    assert.equal(w.pages[0].status,'NATIVE_TEXT_NEEDS_PDF_VISUAL_ALIGNMENT');
    assert.equal(w.pages[1].status,'NEEDS_OCR_OR_VISUAL_SOURCE_REVIEW');
    assert.equal(w.pages[1].hasArabic,false);
    assert.equal(w.verifiedProgressAdvanced,false);
    assert.deepEqual(calls.map(c=>c[0]),['pdfinfo','pdftotext']);
    assert.deepEqual(calls[1][1].slice(0,4),['-f','1','-l','3']);
  }));

test('rejects PDF hash mismatch before starting any reader', async () =>
  fixture(async options=>{
    let invoked=false;
    await assert.rejects(extractNativeSourcePages({...options,pdfSha256:'b'.repeat(64),
      run:async()=>{invoked=true;return '';}}),/source identity/);
    assert.equal(invoked,false);
  }));

test('rejects missing physical-page delimiters rather than shifting page labels', async () =>
  fixture(async options=>{
    const {run}=popplerStub(['طلب العلم','هذا نص']);
    await assert.rejects(extractNativeSourcePages({...options,run}),/exactly one witness/);
  }));

test('rejects wrong actual PDF denominator', async () =>
  fixture(async options=>{
    const {run}=popplerStub(['text'],4);
    await assert.rejects(extractNativeSourcePages({...options,run}),/denominator/);
  }));

test('uses macOS PDFKit path when requested and preserves physical page indexing', async () =>
  fixture(async options=>{
    const calls=[];
    const run=async (name,args)=>{
      calls.push([name,args]);
      return {stdout:JSON.stringify({pageCount:3,pages:[
        {page:1,text:'طلب العلم'}, {page:2,text:''}, {page:3,text:'هذا نص آخر'}
      ]})};
    };
    const w=await extractNativeSourcePages({...options,backend:'pdfkit',run});
    assert.equal(calls[0][0],'swift');
    assert.ok(calls[0][1][0].endsWith('pdfkit-source.swift'));
    assert.equal(w.backend,'pdfkit');
    assert.equal(w.pages[2].physicalPage,3);
  }));

test('flags unique/missing/ambiguous/blank source units; never certifies coverage', async () =>
  fixture(async options=>{
    const {run}=popplerStub(['طلب العلم ثم طلب العلم', '', 'هذا نص آخر']);
    const witness=await extractNativeSourcePages({...options,run});
    const manifest={
      source:{projectId:5,pdfSha256:options.pdfSha256,pageCount:3},
      target:{documentId:'target-doc',expectedRevision:'before'},
      batch:{verifiedThrough:0,fromPage:1,toPage:3},
      units:[
        {id:'first',page:1,kind:'text',surface:'body',sourceRef:'PDF p1',sourceText:'طلب العلم'},
        {id:'second',page:1,kind:'text',surface:'footnote',sourceRef:'PDF p1 note',sourceText:'مفقود'},
        {id:'blank',page:2,kind:'blank',surface:'other',sourceRef:'PDF p2 image witness'},
        {id:'third',page:3,kind:'text',surface:'body',sourceRef:'PDF p3',sourceText:'هذا نص آخر'}
      ]
    };
    const result=compareNativeSourceUnits(manifest,witness);
    assert.deepEqual(result.units.map(u=>u.result),[
      'REPEATED_TEXT_NEEDS_DISAMBIGUATION',
      'NOT_IN_NATIVE_TEXT_NEEDS_PDF_OR_OCR_REVIEW',
      'BLANK_NEEDS_VISUAL_PROOF',
      'NATIVE_EXACT_TEXT_CANDIDATE'
    ]);
    assert.equal(result.nativeTextCandidatesMatched,1);
    assert.equal(result.safeToClaimSourceCoverage,false);
    witness.pages[0].nativeText+='tamper';
    assert.throws(()=>compareNativeSourceUnits(manifest,witness),/modified after extraction/);
  }));

test('rejects unsupported backend, oversized window and invalid PDF header', async () =>
  fixture(async options=>{
    await assert.rejects(extractNativeSourcePages({...options,backend:'untrusted'}),/unsupported/);
    await assert.rejects(extractNativeSourcePages({...options,pageCount:200,toPage:151}),/150-page bound/);
    const wrongPath=join(tmpdir(),'not-a-source-'+process.pid+'.txt');
    await writeFile(wrongPath,'not a PDF');
    try {await assert.rejects(extractNativeSourcePages({...options,pdfPath:wrongPath}),/not a readable PDF/);}
    finally {await rm(wrongPath,{force:true});}
  }));

test('does not reveal source text or executable stderr when reader fails', async () =>
  fixture(async options=>{
    const secret='private source text must not be exposed';
    await assert.rejects(extractNativeSourcePages({...options,run:async()=>{
      throw new Error(secret);
    }}),error=>{
      assert.equal(error.message.includes(secret),false);
      assert.match(error.message,/reader failed/);
      return true;
    });
  }));

test('connected native witness -> translator -> critic -> private draft preserves no progress', async () =>
  fixture(async options=>{
    const safeDir=join(tmpdir(),'haydari-connected-'+process.pid+'-'+Date.now());
    await mkdir(safeDir,{mode:0o700});
    try {
      const manifest={
        source:{projectId:7,pdfSha256:options.pdfSha256,pageCount:3},
        target:{documentId:'target-doc',expectedRevision:'revision-before'},
        batch:{verifiedThrough:0,fromPage:1,toPage:3},
        units:[
          {id:'u1',page:1,kind:'text',surface:'body',sourceRef:'PDF physical p1',sourceText:'طلب العلم'},
          {id:'u2',page:2,kind:'text',surface:'footnote',sourceRef:'PDF physical p2 note',sourceText:'تعليق مهم'},
          {id:'u3',page:3,kind:'text',surface:'heading',sourceRef:'PDF physical p3',sourceText:'المقدمة'}
        ]
      };
      const {run}=popplerStub(['طلب العلم','تعليق مهم','المقدمة']);
      const result=await stageNativeSourceAlignedBatch({
        manifest,pdfPath:options.pdfPath,outputDir:safeDir,backend:'poppler',run,
        translateUnit:async (unit)=>({english:{u1:'Seek knowledge.',u2:'Important note.',u3:'Introduction'}[unit.id]}),
        critiqueUnit:async ()=>({status:'PASS',findings:[],criticId:'test-independent-critic'})
      });
      assert.equal(result.state,'STAGED_NEEDS_SOURCE_AND_FORMAT_REVIEW');
      assert.equal(result.nativeSourceWitness.unitCountAligned,3);
      assert.equal(result.verifiedProgressAdvanced,false);
      const draft=JSON.parse(await readFile(result.path,'utf8'));
      assert.equal(draft.units[1].surface,'footnote');
      assert.equal(draft.nativeSourceWitness.pageTextDigests.length,3);
      assert.equal(draft.nativeSourceWitness.status,'TEXT_ONLY_NOT_VISUALLY_VERIFIED');
      assert.equal(draft.verifiedProgressAdvanced,false);
    } finally { await rm(safeDir,{recursive:true,force:true}); }
  }));

test('connected path rejects ambiguous native source before any translation/model call', async () =>
  fixture(async options=>{
    const manifest={
      source:{projectId:7,pdfSha256:options.pdfSha256,pageCount:3},
      target:{documentId:'target-doc',expectedRevision:'revision-before'},
      batch:{verifiedThrough:0,fromPage:1,toPage:3},
      units:[
        {id:'u1',page:1,kind:'text',surface:'body',sourceRef:'PDF p1',sourceText:'طلب العلم'},
        {id:'u2',page:2,kind:'blank',surface:'other',sourceRef:'PDF p2 image proof still needed'},
        {id:'u3',page:3,kind:'text',surface:'body',sourceRef:'PDF p3',sourceText:'المقدمة'}
      ]
    };
    let called=0;
    const {run}=popplerStub(['طلب العلم','','المقدمة']);
    await assert.rejects(stageNativeSourceAlignedBatch({
      manifest,pdfPath:options.pdfPath,outputDir:'/private/output/unused',backend:'poppler',run,
      translateUnit:async()=>{called++;return {english:'anything'};},
      critiqueUnit:async()=>({status:'PASS',findings:[],criticId:'test'})
    }),/OCR or visual review/);
    assert.equal(called,0);
  }));

test('two units cannot claim the same single Arabic PDF text occurrence', async () =>
  fixture(async options=>{
    const {run}=popplerStub(['طلب العلم','تعليق مهم','المقدمة']);
    const witness=await extractNativeSourcePages({...options,run});
    const manifest={
      source:{projectId:9,pdfSha256:options.pdfSha256,pageCount:3},
      target:{documentId:'english',expectedRevision:'r1'},
      batch:{verifiedThrough:0,fromPage:1,toPage:3},
      units:[
        {id:'u1',page:1,kind:'text',surface:'body',sourceRef:'p1 body',sourceText:'طلب العلم'},
        {id:'u2',page:1,kind:'text',surface:'quotation',sourceRef:'p1 duplicate',sourceText:'طلب العلم'},
        {id:'u3',page:2,kind:'text',surface:'footnote',sourceRef:'p2',sourceText:'تعليق مهم'},
        {id:'u4',page:3,kind:'text',surface:'body',sourceRef:'p3',sourceText:'المقدمة'}
      ]
    };
    const comparison=compareNativeSourceUnits(manifest,witness);
    assert.equal(comparison.units[0].result,'NATIVE_EXACT_TEXT_CANDIDATE');
    assert.equal(comparison.units[1].result,'DUPLICATE_UNIT_TEXT_NEEDS_DISAMBIGUATION');
  }));

test('non-Arabic PDF native text does not certify Arabic source even on substring match', async () =>
  fixture(async options=>{
    const manifest={
      source:{projectId:9,pdfSha256:options.pdfSha256,pageCount:3},
      target:{documentId:'english',expectedRevision:'r1'},
      batch:{verifiedThrough:0,fromPage:1,toPage:3},
      units:[
        {id:'u1',page:1,kind:'text',surface:'body',sourceRef:'p1',sourceText:'The native page'},
        {id:'u2',page:2,kind:'text',surface:'body',sourceRef:'p2',sourceText:'Second native page'},
        {id:'u3',page:3,kind:'text',surface:'body',sourceRef:'p3',sourceText:'Third native page'}
      ]
    };
    const {run}=popplerStub(['The native page','Second native page','Third native page']);
    let called=false;
    await assert.rejects(stageNativeSourceAlignedBatch({
      manifest,pdfPath:options.pdfPath,outputDir:'/private/unneeded',backend:'poppler',run,
      translateUnit:async()=>{called=true;return {english:'draft'};},
      critiqueUnit:async()=>({status:'PASS',findings:[],criticId:'critic'})
    }),/no readable Arabic/);
    assert.equal(called,false);
  }));

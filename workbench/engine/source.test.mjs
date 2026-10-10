import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractNativeSourcePages, compareNativeSourceUnits } from './source.mjs';

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

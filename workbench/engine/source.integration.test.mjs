// Real PDF reader integration with a synthetic two-page text PDF.
// This proves native reader plumbing, NOT Arabic OCR or source QA quality.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractNativeSourcePages } from './source.mjs';

function syntheticPdf() {
  const contentA='BT /F1 14 Tf 80 700 Td (First physical source page) Tj ET';
  const contentB='BT /F1 14 Tf 80 700 Td (Second physical source page) Tj ET';
  const obj=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length '+Buffer.byteLength(contentA)+' >>\nstream\n'+contentA+'\nendstream',
    '<< /Length '+Buffer.byteLength(contentB)+' >>\nstream\n'+contentB+'\nendstream'
  ];
  let body='%PDF-1.4\n';
  const offsets=[0];
  for (let i=0;i<obj.length;i++){
    offsets.push(Buffer.byteLength(body));
    body+=(i+1)+' 0 obj\n'+obj[i]+'\nendobj\n';
  }
  const start=Buffer.byteLength(body);
  body+='xref\n0 '+(obj.length+1)+'\n0000000000 65535 f \n';
  for (const offset of offsets.slice(1))body+=String(offset).padStart(10,'0')+' 00000 n \n';
  body+='trailer\n<< /Size '+(obj.length+1)+' /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';
  return Buffer.from(body);
}

test('real native reader opens a PDF and preserves independent physical page text', async t=>{
  const backend=process.platform==='darwin'?'pdfkit':'poppler';
  if (backend==='poppler' && spawnSync('pdfinfo',['-v'],{encoding:'utf8'}).error){
    t.skip('Poppler absent; macOS runner exercises real PDFKit path');
    return;
  }
  const dir=await mkdtemp(join(tmpdir(),'haydari-real-pdf-'));
  try {
    const file=join(dir,'two-page.pdf');
    const data=syntheticPdf();
    await writeFile(file,data);
    const pdfSha256=createHash('sha256').update(data).digest('hex');
    const witness=await extractNativeSourcePages({
      pdfPath:file,pdfSha256,pageCount:2,fromPage:1,toPage:2,backend
    });
    assert.equal(witness.pages.length,2);
    assert.match(witness.pages[0].nativeText,/First physical source page/);
    assert.doesNotMatch(witness.pages[0].nativeText,/Second physical source page/);
    assert.match(witness.pages[1].nativeText,/Second physical source page/);
    assert.doesNotMatch(witness.pages[1].nativeText,/First physical source page/);
    assert.equal(witness.verifiedProgressAdvanced,false);
  } finally {await rm(dir,{recursive:true,force:true});}
});

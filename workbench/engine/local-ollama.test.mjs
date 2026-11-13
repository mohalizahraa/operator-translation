import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalOllamaPair } from './local-ollama.mjs';

const UNIT={id:'p1',kind:'text',surface:'body',page:1,sourceText:'طلب العلم'};
function fakeTransport({translation='Seek knowledge.',critique={status:'PASS',findings:[]},
    models=['translator:latest','critic:latest'],wrongModel=false}={}) {
  const calls=[];
  const fetchImpl=async (url,init)=>{
    calls.push({url:url.href,init});
    if(url.pathname==='/api/tags')
      return new Response(JSON.stringify({models:models.map(name=>({name}))}),{status:200});
    const request=JSON.parse(init.body);
    const response=request.model==='translator:latest'
      ? translation : JSON.stringify(critique);
    return new Response(JSON.stringify({
      done:true,model:wrongModel?'some-other:latest':request.model,response
    }),{status:200});
  };
  return {fetchImpl,calls};
}

test('offline pair uses only loopback Ollama with model-installed preflight and candidate critic',async()=>{
  const {fetchImpl,calls}=fakeTransport();
  const pair=createLocalOllamaPair({
    translatorModel:'translator:latest',criticModel:'critic:latest',fetchImpl
  });
  const available=await pair.verifyModels();
  assert.equal(available.qualityCertified,false);
  const translated=await pair.translateUnit(UNIT,{});
  assert.equal(translated.english,'Seek knowledge.');
  const review=await pair.critiqueUnit({unit:UNIT,english:translated.english});
  assert.equal(review.status,'PASS');
  assert.equal(review.criticId,'local-ollama-model:critic:latest');
  assert.equal(calls.length,4);
  assert.ok(calls.every(c=>new URL(c.url).hostname==='127.0.0.1'));
  assert.ok(calls.every(c=>c.init.redirect==='error'));
  const generated=calls.filter(c=>c.init.body).map(c=>JSON.parse(c.init.body));
  assert.ok(generated.every(c=>c.stream===false));
  assert.equal(generated[1].format,'json');
  assert.equal(generated[0].model,'translator:latest');
  assert.equal(generated[1].model,'critic:latest');
  assert.ok(generated[1].prompt.includes('طلب العلم'));
  assert.ok(generated[1].prompt.includes('Seek knowledge.'));
});

test('rejects remote model URLs and the same translator/critic',()=>{
  assert.throws(()=>createLocalOllamaPair({
    translatorModel:'translator:latest',criticModel:'critic:latest',
    origin:'https://remote.example'
  }),/loopback/);
  assert.throws(()=>createLocalOllamaPair({
    translatorModel:'translator:latest',criticModel:'translator:latest'
  }),/different explicit model/);
});

test('unavailable model is not downloaded or substituted',async()=>{
  const {fetchImpl,calls}=fakeTransport({models:['translator:latest']});
  const pair=createLocalOllamaPair({
    translatorModel:'translator:latest',criticModel:'critic:latest',fetchImpl
  });
  await assert.rejects(pair.verifyModels(),/not present/);
  assert.equal(calls.some(c=>c.init.method==='POST'),false);
});

test('translator refusal blocks rather than being counted as an English draft',async()=>{
  const {fetchImpl}=fakeTransport({translation:'لا يمكنني مشاركة محتوى هذا المصدر'});
  const pair=createLocalOllamaPair({
    translatorModel:'translator:latest',criticModel:'critic:latest',fetchImpl
  });
  await assert.rejects(pair.translateUnit(UNIT,{}),/refused/);
});

test('critic JSON is mandatory; ambiguity requires concrete findings',async()=>{
  const {fetchImpl}=fakeTransport({critique:{status:'REVIEW',findings:[]}});
  const pair=createLocalOllamaPair({
    translatorModel:'translator:latest',criticModel:'critic:latest',fetchImpl
  });
  await assert.rejects(pair.critiqueUnit({unit:UNIT,english:'Seek knowledge.'}),/invalid review disposition/);
});

test('wrong-model and incomplete generation results fail closed',async()=>{
  const {fetchImpl}=fakeTransport({wrongModel:true});
  const pair=createLocalOllamaPair({
    translatorModel:'translator:latest',criticModel:'critic:latest',fetchImpl
  });
  await assert.rejects(pair.translateUnit(UNIT,{}),/unexpected model/);
});

test('transport failures do not echo source or remote API errors',async()=>{
  const pair=createLocalOllamaPair({
    translatorModel:'translator:latest',criticModel:'critic:latest',
    fetchImpl:async()=>{throw new Error('private source was sent in rejected request');}
  });
  await assert.rejects(pair.translateUnit(UNIT,{}),e=>{
    assert.match(e.message,/endpoint unavailable/);
    assert.doesNotMatch(e.message,/private source/);
    return true;
  });
});

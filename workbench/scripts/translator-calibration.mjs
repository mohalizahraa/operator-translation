#!/usr/bin/env node
// Deterministic calibration rubric. Self-tests check the evaluator, never a translator.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const fixtureFile=new URL('./translator-calibration-fixtures.json',import.meta.url);
const data=JSON.parse(fs.readFileSync(fixtureFile,'utf8'));
const cases=data.cases;
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const round=x=>Math.round(x*1000)/1000;
function evaluate(outputs){
  assert(Array.isArray(outputs),'Predictions must be a JSON array');
  const got=new Map();
  for(const item of outputs){
    assert(item&&typeof item.id==='string'&&!got.has(item.id),'Duplicate or missing prediction id');
    got.set(item.id,item);
  }
  const known=new Set(cases.map(c=>c.id));
  assert([...got.keys()].every(k=>known.has(k)),'Predictions include unknown case ids');
  let tp=0,fp=0,fn=0,questions_correct=0,blockers_missed=0,question_misses=0,negative_false_alarms=0;
  const misses=[];
  for(const c of cases){
    const o=got.get(c.id)||{};
    const flags=Array.isArray(o.flags)?o.flags:[];
    assert(flags.every(x=>typeof x==='string'),'flags must be strings');
    const predicted=new Set(flags),expected=new Set(c.expected_flags);
    assert(predicted.size===flags.length,'Duplicate flag in '+c.id);
    for(const flag of predicted) if(expected.has(flag))tp++;else fp++;
    for(const flag of expected) if(!predicted.has(flag)){fn++;misses.push({id:c.id,issue:flag})}
    const asked=o.ask_reviewer===true,blocked=o.block_source===true;
    if(asked===c.ask_reviewer) questions_correct++;
    if(c.ask_reviewer&&!asked) question_misses++;
    if(c.block_source&&!blocked)blockers_missed++;
    if(!expected.size&&(predicted.size||asked||blocked))negative_false_alarms++;
  }
  const precision=tp+fp?tp/(tp+fp):0;
  const recall=tp+fn?tp/(tp+fn):0;
  return {cases:cases.length,provided:got.size,precision:round(precision),recall:round(recall),f1:round(precision+recall?2*precision*recall/(precision+recall):0),question_accuracy:round(questions_correct/cases.length),question_misses,blockers_missed,negative_false_alarms,false_flags:fp,missed_flags:fn,misses};
}
function selfTest(){
  const perfect=cases.map(c=>({id:c.id,flags:c.expected_flags,ask_reviewer:c.ask_reviewer,block_source:c.block_source}));
  const good=evaluate(perfect);
  assert(good.f1===1&&good.question_accuracy===1&&good.blockers_missed===0,'Perfect synthetic oracle did not pass');
  const negligent=evaluate(cases.map(c=>({id:c.id,flags:[],ask_reviewer:false,block_source:false})));
  assert(negligent.f1<1&&negligent.blockers_missed===1&&negligent.question_misses>0,'Evaluator failed to catch silence and omitted blocking source damage');
  const indiscriminate=evaluate(cases.map(c=>({id:c.id,flags:['technical_polysemy'],ask_reviewer:true,block_source:true})));
  assert(indiscriminate.negative_false_alarms>0&&indiscriminate.false_flags>0,'Evaluator failed to penalize fabricated questions');
  console.log('Translator calibration scorer self-test: PASS (no real model evaluated)');
}
function run(){
  const args=process.argv.slice(2);
  if(args.includes('--self-test')){selfTest();return}
  const idx=args.indexOf('--predictions');
  assert(idx!==-1&&args[idx+1],'Usage: node translator-calibration.mjs --predictions path.json [--baseline prior.json]');
  const candidate=evaluate(JSON.parse(fs.readFileSync(args[idx+1],'utf8')));
  const bIdx=args.indexOf('--baseline');
  const baseline=bIdx>=0?evaluate(JSON.parse(fs.readFileSync(args[bIdx+1],'utf8'))):null;
  const verdict={
    rubric:'illustrative-fixture-score-NOT-human-validated-translation-quality',
    candidate,baseline,
    regression_accepted:baseline?(
      candidate.provided===candidate.cases &&
      candidate.f1>=baseline.f1 &&
      candidate.question_misses<=baseline.question_misses &&
      candidate.blockers_missed<=baseline.blockers_missed &&
      candidate.negative_false_alarms<=baseline.negative_false_alarms
    ):null,
  };
  console.log(JSON.stringify(verdict,null,2));
  if(candidate.provided!==candidate.cases || candidate.blockers_missed>0 || verdict.regression_accepted===false) process.exitCode=1;
}
run();

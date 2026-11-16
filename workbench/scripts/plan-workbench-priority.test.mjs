import test from 'node:test';
import assert from 'node:assert/strict';
import { planWorkQueue } from './plan-workbench-priority.mjs';

const p=(id,title_en,assignee,status='not_started')=>({id,title_en,assignee,status,pages:400,translated_pages:0});
const source=()=>[
  p(70,'Some unassigned book','Unassigned'),
  p(106,'The Spirituality of Acts of Worship','Mohammed'),
  p(12,'The Ethics of Hajj and Visitation','Mohammed','in_progress'),
  p(90,'The Ḥadīth Legacy: Between Formation and Influence','Both'),
  p(1,'The Infallibility of the Prophets','Zahraa','review'),
  p(40,'A shared translation','Both'),
  p(50,'Truthfulness','Brother'),
  p(10,'Religious Marja','Zahraa'),
];
test('founder priority: Mohammed, remaining Zahraa, then Shared/Unassigned',()=>{
  const plan=planWorkQueue(source());
  assert.deepEqual(plan.phases.map(x=>x.projects.map(p=>p.id)),[[12,50],[1,10],[40,70]]);
  assert.deepEqual(plan.excluded.map(x=>x.id).sort((a,b)=>a-b),[90,106]);
  assert.equal(plan.count,8);
  assert.equal(plan.included,6);
});
test('exclusions are global: neither excluded book falls through to tier 3',()=>{
  const plan=planWorkQueue(source());
  assert.ok(!plan.phases.flatMap(x=>x.projects).some(x=>x.id===90 || x.id===106));
});
test('site status is carried without being treated as QA completion',()=>{
  const plan=planWorkQueue(source());
  assert.equal(plan.phases[1].projects[0].status,'review');
  assert.match(plan.note,/no status.*certified/i);
});
test('catalogue ID/title drift refuses to silently exclude or translate wrong book',()=>{
  assert.throws(()=>planWorkQueue([p(90,'Different book','Mohammed')]),/exclusion identity conflict/);
  assert.throws(()=>planWorkQueue([p(3,'The Spirituality of Acts of Worship','Mohammed')]),/exclusion identity conflict/);
});
test('duplicate project identity and unknown assignee block planning',()=>{
  assert.throws(()=>planWorkQueue([p(1,'X','Zahraa'),p(1,'X','Zahraa')]),/duplicate project/);
  assert.throws(()=>planWorkQueue([p(1,'X','SomeoneElse')]),/Unknown live assignee/);
});
test('empty, non-array and invalid project identities block planning',()=>{
  assert.throws(()=>planWorkQueue([]),/full live project inventory/);
  assert.throws(()=>planWorkQueue([{}]),/exact project identity/);
});

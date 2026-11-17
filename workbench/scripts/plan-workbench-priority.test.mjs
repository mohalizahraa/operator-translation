import test from 'node:test';
import assert from 'node:assert/strict';
import { planWorkQueue, assertCompleteWorkbenchSnapshot, isStatusTranslated } from './plan-workbench-priority.mjs';

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
  assert.match(plan.note,/separate from source-page QA/i);
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

const fullSnapshot=()=>Array.from({length:176},(_,i)=>{
  const id=i+1;
  return p(id,id===90?'The Ḥadīth Legacy: Between Formation and Influence':
    id===106?'The Spirituality of Acts of Worship':`Sample project ${id}`,'Unassigned');
});
test('complete catalogue gate rejects truncated and shifted 176-project data',()=>{
  const all=fullSnapshot();
  assert.equal(assertCompleteWorkbenchSnapshot(all),true);
  assert.throws(()=>assertCompleteWorkbenchSnapshot(all.slice(1)),/incomplete live/);
  const shifted=fullSnapshot();shifted[35]=p(177,'Unrelated book','Unassigned');
  assert.throws(()=>assertCompleteWorkbenchSnapshot(shifted),/missing live project ID/);
});

test('founder treats translated site statuses as counted done, not independent QA', () => {
  const plan = planWorkQueue(source());
  assert.equal(isStatusTranslated({status:'review'}), true);
  assert.equal(isStatusTranslated({status:'completed'}), true);
  assert.equal(isStatusTranslated({status:'published'}), true);
  assert.equal(isStatusTranslated({status:'in_progress'}), false);
  assert.equal(plan.statusTranslatedCount,1);
  assert.deepEqual(plan.statusTranslatedBookIds,[1]);
  assert.equal(plan.newTranslationCount,5);
  assert.deepEqual(plan.newTranslationBookIds,[10,12,40,50,70]);
  assert.equal(plan.statusCounts.review,1);
  assert.equal(plan.statusCounts.completed,0);
  assert.match(plan.note,/separate from source-page QA/i);
});

test('complete status-translated books remain visible, never requeued for NEW translation',()=>{
  const projects=fullSnapshot();
  projects[0].status='review';
  projects[1].status='completed';
  projects[2].status='published';
  projects[11].status='in_progress';
  const plan=planWorkQueue(projects);
  assert.equal(plan.included,174);
  assert.equal(plan.statusTranslatedCount,3);
  assert.equal(plan.newTranslationCount,171);
  assert.deepEqual(plan.statusTranslatedBookIds,[1,2,3]);
  assert.ok(plan.newTranslationBookIds.includes(12));
  assert.ok(!plan.newTranslationBookIds.includes(1));
  assert.ok(!plan.newTranslationBookIds.includes(90));
  assert.ok(!plan.newTranslationBookIds.includes(106));
});

test('invalid live status blocks completion counts rather than silently falling back',()=>{
  assert.throws(()=>planWorkQueue([p(1,'A','Zahraa','invalid')]),/unknown live status/);
});

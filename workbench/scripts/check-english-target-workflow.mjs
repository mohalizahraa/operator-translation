import fs from 'node:fs';
import vm from 'node:vm';
import { missingEnglishBook } from '../functions/_translation.js';

function assert(ok, message) { if (!ok) throw new Error(message); }
const stages = ['not_started','in_progress','review','completed','published'];
assert(!missingEnglishBook('not_started', null), 'Not Started may have no document.');
for (const status of stages.slice(1)) {
  assert(missingEnglishBook(status, null), status+' must flag absent English Book.');
  assert(!missingEnglishBook(status, 'linked-doc'), status+' accepts a target as a necessary prerequisite.');
}
const source=fs.readFileSync(new URL('../public/model-core.js',import.meta.url),'utf8');
const context={}; vm.createContext(context); vm.runInContext(source,context);
const core=context.WorkbenchCore;
assert(!core.workflowTransitionAllowed(stages,{status:'not_started',google_doc_url:null},'in_progress'),'Board must block premature start.');
assert(core.workflowTransitionAllowed(stages,{status:'not_started',google_doc_url:'linked-doc'},'in_progress'),'Board must allow ready start.');
assert(core.workflowTransitionAllowed(stages,{status:'in_progress',google_doc_url:null},'not_started'),'Legacy inconsistent projects must be recoverable.');
const guards = [
  ['../functions/api/projects/index.js', 'missingEnglishBook(status, googleDocUrl)'],
  ['../functions/api/projects/[id].js', 'missingEnglishBook(targetStatus, targetDoc)'],
  ['../functions/api/projects/[id]/progress.js', "missingEnglishBook('in_progress', before.google_doc_url)"],
];
for (const [file, token] of guards) {
  const code=fs.readFileSync(new URL(file,import.meta.url),'utf8');
  assert(code.includes(token),file+' lost its English target prerequisite.');
  assert(code.includes("code: 'english_book_required'"),file+' lost its error code.');
}
const resume=fs.readFileSync(new URL('../functions/_translation.js',import.meta.url),'utf8');
assert(resume.includes('The English Book is missing. Create or locate'), 'Resume must flag an absent document.');
console.log('English target workflow prerequisite tests: PASS');

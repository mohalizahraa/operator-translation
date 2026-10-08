import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the real Board renderer with the production assignment shape.
// This catches cards disappearing behind scope, state-reset, or eager backlog
// rendering defects that syntax-only checks do not detect.
const source=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const start=source.indexOf('function renderBoard() {');
const end=source.indexOf('function bindBoardDrag()',start);
if(start<0 || end<0) throw new Error('Board renderer missing.');
const implementation=source.slice(start,end);

function assert(value,message){ if(!value) throw new Error('Board render regression: '+message); }
const assigned=[
  ...Array.from({length:11},(_,i)=>({id:i+1,assignee:'Zahraa',status:i<3?'in_progress':'review'})),
  ...Array.from({length:20},(_,i)=>({id:i+12,assignee:'Mohammed',status:i<3?'published':'not_started'})),
  {id:32,assignee:'Both',status:'not_started'},
];
const backlog=Array.from({length:144},(_,i)=>({id:i+33,assignee:'Unassigned',status:'not_started'}));
const state={projects:[...assigned,...backlog],viewScope:'Shared',mobileBoardStatus:'all'};
const els={search:{value:''}};
const tabStrip={innerHTML:'',querySelectorAll:()=>[]};
const board={innerHTML:'',dataset:{}};
const summary={textContent:''};
const inbox={hidden:false,innerHTML:''};
const elements={'board-status-tabs':tabStrip,'board-unassigned':inbox,'board':board,'board-scope-summary':summary};
let bindings=0;
const context={
 state,els,localStorage:{setItem(){}},STATUS:{not_started:'Not Started',in_progress:'Translating',review:'Needs Formatting',completed:'Needs Review',published:'Publish Ready'},
 STATUS_ORDER:['not_started','in_progress','review','completed','published'],
 $:key=>elements[key],
 // Array.filter passes (project, index, array); only a wrapped callback may
 // use the predicate's default search argument instead of numeric index.
 projectMatchesSearch:(p,query='')=>{
   const text=String(query||'').trim().toLowerCase();
   return !text || String(p.title_en||'').toLowerCase().includes(text);
 },
 viewScopeMatches:p=>state.viewScope==='Shared' ? p.assignee!=='Unassigned' : p.assignee===state.viewScope || p.assignee==='Both',
 syncViewScopeSwitch(){},
 projectMarkup:p=>'<article data-card="'+p.id+'"></article>',
 bindProjectClicks(){bindings++;},
 hydrateUploadedCovers(){},
 bindBoardDrag(){},
};
vm.createContext(context);
vm.runInContext(implementation,context);
const render=()=>vm.runInContext('renderBoard()',context);
const cards=markup=>(markup.match(/data-card=/g)||[]).length;

render();
assert(summary.textContent==='176 books · 144 unassigned included','Shared includes full catalogue');
assert(cards(board.innerHTML)===176,'Shared renders all 176 books');
assert(inbox.hidden && !inbox.innerHTML,'no duplicate hidden backlog');
assert(board.dataset.mobileAll==='true','All status mode remains active');
assert(board.innerHTML.includes('data-empty="true"'),'empty workflow columns marked');
render();
assert(cards(board.innerHTML)===176,'live re-render retains all 176 books');
state.viewScope='Zahraa';
render();
assert(summary.textContent.startsWith('12 books'),'Zahraa shows 11 direct plus Shared book');
assert(cards(board.innerHTML)===12,'all Zahraa books visible');
state.viewScope='Mohammed';
render();
assert(summary.textContent.startsWith('21 books'),'Mohammed shows 20 direct plus Shared book');
assert(cards(board.innerHTML)===21,'all Mohammed books visible');
state.viewScope='Shared';
context.projectMatchesSearch=p=>p.assignee==='Unassigned';
render();
assert(cards(board.innerHTML)===144,'search for Unassigned shows all 144 in workflow');
assert(summary.textContent==='144 books · 144 unassigned included','filtered summary reconciles');

console.log('Workbench Board rendering regression: PASS');

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
const inbox={
  hidden:true,
  markup:'',
  grid:null,
  details:null,
  set innerHTML(value) {
    if(this.details) this.details.isConnected=false;
    this.markup=value;
    this.grid={innerHTML:'',dataset:{}};
    this.details=value.includes('<details') ? {
      open:/<details[^>]*\sopen(?:\s|>)/.test(value),
      isConnected:true,
      querySelector:()=>this.grid,
      addEventListener(_name,listener){this.notify=listener;},
    } : null;
  },
  get innerHTML(){return this.markup;},
  querySelector(){return this.details;},
};
const elements={'board-status-tabs':tabStrip,'board-unassigned':inbox,'board':board,'board-scope-summary':summary};
let bindings=0;
const context={
 state,els,localStorage:{setItem(){}},STATUS:{not_started:'Not Started',in_progress:'Translating',review:'Needs Formatting',completed:'Needs Review',published:'Publish Ready'},
 STATUS_ORDER:['not_started','in_progress','review','completed','published'],
 $:key=>elements[key],
 projectMatchesSearch:p=>true,
 viewScopeMatches:p=>state.viewScope==='Shared' ? p.assignee!=='Unassigned' : p.assignee===state.viewScope || p.assignee==='Both',
 syncViewScopeSwitch(){},
 projectMarkup:p=>'<article data-card="'+p.id+'"></article>',
 bindProjectClicks(){bindings++;},
 hydrateUploadedCovers(){},
 bindBoardDrag(){},
};
vm.createContext(context);
vm.runInContext('let boardUnassignedExpanded = false;\n'+implementation,context);
const render=()=>vm.runInContext('renderBoard()',context);
const cards=markup=>(markup.match(/data-card=/g)||[]).length;

render();
assert(summary.textContent==='32 team books · 144 unassigned','scope counts must reconcile to 176 books');
assert(board.dataset.mobileAll==='true','All status mode must be reflected for responsive CSS');
assert(cards(board.innerHTML)===32,'all assigned team books must be projected as cards');
assert(inbox.hidden===false && inbox.details && !inbox.details.open,'the counted Team inbox must be visible but collapsed by default');
assert(cards(inbox.grid.innerHTML)===0,'collapsed backlog must not mount 144 invisible cards');
assert(board.innerHTML.includes('data-empty="true"'),'empty workflow columns need an explicit responsive marker');

inbox.details.open=true;
inbox.details.notify();
assert(cards(inbox.grid.innerHTML)===144,'expanding Team inbox must mount the entire backlog');

render();
assert(inbox.details.open,'expanded Team inbox must remain expanded after a live-data render');
assert(cards(inbox.grid.innerHTML)===144,'expanded Team inbox must remain populated after re-render');

state.viewScope='Zahraa';
render();
assert(summary.textContent.startsWith('12 books'),'Zahraa scope must show 11 direct and one Shared assignment');
assert(cards(board.innerHTML)===12,'Zahraa scope must include Shared assignments');
assert(inbox.hidden,'individual view must keep Unassigned outside its assigned scope');

state.viewScope='Shared';
context.projectMatchesSearch=p=>p.assignee==='Unassigned';
render();
assert(cards(board.innerHTML)===0,'search confined to Team inbox must not invent assigned cards');
assert(board.innerHTML.includes('No assigned team books match'),'empty assigned search must explain the separate inbox');
assert(inbox.details.open && cards(inbox.grid.innerHTML)===144,'search matches in Unassigned must automatically open all results');

console.log('Workbench Board rendering regression: PASS');

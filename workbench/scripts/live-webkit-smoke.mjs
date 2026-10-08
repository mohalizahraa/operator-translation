import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { webkit } = require('playwright');

const ORIGIN = 'https://haydari-translation-workbench.pages.dev';
const RELEASE = JSON.parse(readFileSync(new URL('../public/release.json',import.meta.url),'utf8')).app_version;
const assert = (condition,message) => {
  if (!condition) throw new Error('LIVE WEBKIT: ' + message);
};
const browser=await webkit.launch({headless:true});
const failures=[];
try {
  for (const [device,width,height,mobile] of [
    ['desktop',1440,900,false],
    ['iphone',390,844,true],
    ['tablet',820,1180,true],
  ]) {
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error.message||error)));
    page.on('response',async response=>{
      if (new URL(response.url()).pathname !== '/api/projects') return;
      const data=await response.json().catch(()=>null);
      console.log('API_PROJECTS '+device+' status='+response.status()+' count='+(data?.projects?.length ?? '?'));
    });

    // Deployments are asynchronous. Wait for Cloudflare to serve the asset
    // version in the checked-out release manifest, rather than hard-coding an
    // obsolete release or treating a deployment-in-flight as a UI failure.
    let appAsset='';
    for (let attempt=0; attempt<14; attempt++) {
      await page.goto(ORIGIN+'/?smoke='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
      appAsset=await page.locator('script[src^="/app.js"]').first().getAttribute('src');
      if (appAsset?.includes(RELEASE)) break;
      if (attempt<13) await page.waitForTimeout(10000);
    }
    assert(appAsset?.includes(RELEASE),device+' loaded stale app asset '+appAsset+'; expected '+RELEASE);

    await page.waitForFunction(()=>/\/ 176$/.test(document.querySelector('#translation-ratio')?.textContent?.trim()||''),{timeout:45000});
    console.log(device+' dashboard: '+await page.locator('#translation-ratio').innerText());

    async function view(id) {
      await page.locator('.nav-item[data-view="'+id+'"]').click();
      await page.locator('#'+id+'-view').waitFor({state:'visible',timeout:20000});
    }
    await view('board');
    async function expectBoard(scope,expected) {
      await page.locator('#board-view [data-view-scope="'+scope+'"]').click();
      const initial=await page.evaluate(()=>({
        totalCards:document.querySelectorAll('#board .project-card').length,
        searchValue:document.querySelector('#search')?.value,
        projectCount:document.querySelector('#project-count')?.textContent,
        translationRatio:document.querySelector('#translation-ratio')?.textContent,

        columns:[...document.querySelectorAll('#board .board-col')].map(x=>({status:x.dataset.status,cards:x.querySelectorAll('.project-card').length})),
        summary:document.querySelector('#board-scope-summary')?.textContent,
        boardText:document.querySelector('#board')?.textContent?.slice(0,350),
        view:document.querySelector('#board-view')?.className,
        error:document.querySelector('#workspace-error-detail')?.textContent,
      }));
      console.log('BOARD_DIAG '+device+' '+scope+' '+JSON.stringify(initial)+' jsErrors='+JSON.stringify(errors));
      await page.waitForFunction(n=>document.querySelectorAll('#board .project-card').length===n,expected,{timeout:12000});
      const count=await page.locator('#board .project-card').count();
      assert(count===expected,device+' '+scope+' count '+count+' expected '+expected);
      const stages=await page.locator('#board .board-head .pill').allTextContents();
      const total=stages.map(s=>Number(s)||0).reduce((a,b)=>a+b,0);
      assert(total===expected,device+' '+scope+' sum of status counts '+total+' expected '+expected);
      console.log(device+' board '+scope+': '+count+' cards, stages '+stages.join(', '));
    }
    await expectBoard('Shared',176);
    if (!mobile) {
      const geometry=await page.evaluate(()=>{
        const wrap=document.querySelector('.wrap');
        const board=document.querySelector('#board');
        const backlog=document.querySelector('#board .board-list[data-status="not_started"]');
        return {
          width:wrap.getBoundingClientRect().width,
          boardOverflow:board.scrollWidth-board.clientWidth,
          listOverflow:backlog.scrollHeight-backlog.clientHeight,
          overscroll:getComputedStyle(backlog).overscrollBehaviorY,
        };
      });
      console.log('BOARD_DESKTOP_LAYOUT '+JSON.stringify(geometry));
      assert(geometry.width>1200,'Desktop workspace must use the 1440px viewport, got '+geometry.width);
      assert(geometry.boardOverflow<5,'Five workflow columns should fit together at 1440px; overflow '+geometry.boardOverflow);
      assert(geometry.listOverflow>50,'Large backlog must be vertically scrollable');
      assert(geometry.overscroll==='auto','Board columns must release scroll at boundaries');
      await page.locator('#board .board-list[data-status="not_started"]').evaluate(el=>{el.scrollTop=el.scrollHeight;});
      const scrollTop=await page.locator('#board .board-list[data-status="not_started"]').evaluate(el=>el.scrollTop);
      assert(scrollTop>0,'Backlog vertical scrolling does not work');
      await page.setViewportSize({width:960,height:900});
      await page.waitForFunction(()=>document.querySelector('#board-scroll-controls')?.hidden===false,{timeout:4000});
      const narrow=await page.evaluate(()=>{
        const board=document.querySelector('#board');
        return {overflow:board.scrollWidth-board.clientWidth,prev:document.querySelector('#board-scroll-prev').disabled,next:document.querySelector('#board-scroll-next').disabled};
      });
      assert(narrow.overflow>100 && narrow.prev && !narrow.next,'Narrow desktop Board horizontal navigation unavailable: '+JSON.stringify(narrow));
      await page.locator('#board-scroll-next').click();
      await page.waitForFunction(()=>document.querySelector('#board').scrollLeft>12,{timeout:4000});
      await page.locator('#board-scroll-prev').click();
      await page.waitForFunction(()=>document.querySelector('#board').scrollLeft<4,{timeout:4000});
      await page.setViewportSize({width:1440,height:900});
      console.log('BOARD_DESKTOP_SCROLL: PASS');
    }
    const summary=await page.locator('#board-scope-summary').innerText();
    assert(summary.includes('144 unassigned included'),device+' Shared Board summary missing Unassigned count');
    await expectBoard('Zahraa',12);
    await expectBoard('Mohammed',21);
    await expectBoard('Shared',176);

    // Search must filter by typed text, not the positional index supplied by
    // Array.filter(callback). Clear search and prove all books return.
    const search=page.locator('#search');
    await search.fill('zzz-no-such-book-search-regression');
    await page.waitForFunction(()=>document.querySelectorAll('#board .project-card').length===0 && document.querySelector('#board')?.textContent?.includes('No matching books'),{timeout:12000});
    await search.fill('');
    await page.waitForFunction(()=>document.querySelectorAll('#board .project-card').length===176,{timeout:12000});
    console.log(device+' Board search clear: all 176 cards restored');

    if (mobile && width<=720) {
      const cols=await page.locator('#board .board-col').evaluateAll(nodes=>nodes.map(n=>({status:n.dataset.status,empty:n.dataset.empty,display:getComputedStyle(n).display})));
      assert(cols.filter(c=>c.empty==='false').every(c=>c.display!=='none'),device+' visible workflow stage hidden');
      assert(cols.filter(c=>c.empty==='true').every(c=>c.display==='none'),device+' empty mobile All stage rendered');
      console.log(device+' visible mobile stages: '+cols.filter(c=>c.display!=='none').map(c=>c.status).join(','));
    }
    await view('projects');
    const rows=await page.locator('#projects-list .project-row').count();
    assert(rows===176,device+' Projects expected 176 rows got '+rows);
    await view('timeline');
    assert(await page.locator('#timeline-visual').count()===1,device+' Timeline missing');
    const timelineUnassigned=await page.locator('#timeline-unassigned .timeline-unassigned-card').count();
    assert(timelineUnassigned===144,device+' Timeline must retain all 144 Unassigned book records, got '+timelineUnassigned);
    console.log(device+' Timeline Unassigned='+timelineUnassigned);
    await view('stats');
    assert((await page.locator('#stat-translated').innerText()).trim()!=='',device+' Stats missing');
    await view('activity');
    const activity=await page.locator('#activity-list .activity-item').count();
    assert(activity>=700,device+' full Activity chronology missing: '+activity);
    console.log(device+' projects='+rows+' activity='+activity+' errors='+errors.length);
    assert(errors.length===0,device+' JavaScript exceptions: '+errors.slice(0,4).join(' | '));
    await context.close();
  }
  // Verify degraded dependencies do not prevent books from rendering. No
  // mutations: only intercept read-only revision and Activity requests.
  {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
    const page=await context.newPage();
    await page.route(/\/api\/(revision|activity)(?:\?|$)/,route=>route.fulfill({
      status:503,
      contentType:'application/json',
      body:JSON.stringify({error:'Simulated optional read outage'}),
    }));
    await page.goto(ORIGIN+'/?resilience='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>document.querySelector('#translation-ratio')?.textContent?.trim().endsWith('/ 176'),{timeout:45000});
    await page.locator('.nav-item[data-view="board"]').click();
    await page.waitForFunction(()=>document.querySelectorAll('#board .project-card').length===176,{timeout:20000});
    console.log('iphone degraded revision/Activity: 176 Board cards still rendered');
    await context.close();
  }
  console.log('LIVE WORKBENCH WEBKIT SMOKE: PASS');
} finally {
  await browser.close();
}

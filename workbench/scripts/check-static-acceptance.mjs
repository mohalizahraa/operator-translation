import fs from 'node:fs/promises';

const root = new URL('../', import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [catalogSource, coverMap, pdfAudit, seriesMap, appSource, indexSource] = await Promise.all([
  fs.readFile(new URL('functions/_catalog.js', root), 'utf8'),
  fs.readFile(new URL('public/cover-map.json', root), 'utf8').then(JSON.parse),
  fs.readFile(new URL('public/pdf-audit.json', root), 'utf8').then(JSON.parse),
  fs.readFile(new URL('public/series-map.json', root), 'utf8').then(JSON.parse),
  fs.readFile(new URL('public/app.js', root), 'utf8'),
  fs.readFile(new URL('public/index.html', root), 'utf8'),
]);
const release=JSON.parse(await fs.readFile(new URL('public/release.json',root),'utf8'));
assert(indexSource.includes('/app.js?v='+release.app_version),'Production JS asset version and release marker drifted.');
assert(indexSource.includes('/styles.css?v='+release.css_version),'Production CSS asset version and release marker drifted.');
assert(indexSource.includes('id="theme-toggle"') && indexSource.includes("localStorage.getItem('haydariTheme')") && indexSource.includes("prefers-color-scheme: dark"), 'Theme toggle or flash-free saved/system initial state is missing.');
assert(appSource.includes("localStorage.setItem('haydariTheme', next)") && appSource.includes('syncThemeToggle()'), 'Theme switcher or local persistence is missing.');
const libSource = await fs.readFile(new URL('functions/_lib.js', root), 'utf8');
const coverProxySource = await fs.readFile(new URL('functions/api/official-cover/[id].js', root), 'utf8');
const coverSourcesSource = await fs.readFile(new URL('functions/_cover_sources.js', root), 'utf8');
const stylesSource = await fs.readFile(new URL('public/styles.css', root), 'utf8');
assert(appSource.includes('class="translation-feed-detail"') && appSource.includes('class="translation-feed-update"') && appSource.includes('class="translation-feed-title"'), 'Recent page updates have lost separate progress-label and bilingual-title containers.');
assert(stylesSource.includes('.translation-feed-item>.translation-feed-detail{') && stylesSource.includes('grid-template-columns:minmax(0,1fr);') && stylesSource.includes('row-gap:10px;'), 'Recent page updates must stack the label above the bilingual title at every width.');
assert(stylesSource.includes('padding-inline-start:15px;') && stylesSource.includes('border-inline-start:2px solid var(--line)'), 'Recent page update titles need a visible, consistent second-row indentation.');
assert(!stylesSource.includes('grid-template-columns:max-content minmax(0,1fr)'), 'Previous visually cramped side-by-side feed layout still exists.');
assert(indexSource.includes('id="board-scroll-controls"') && indexSource.includes('id="board-scroll-prev"') && indexSource.includes('id="board-scroll-next"'), 'Desktop Board scrolling controls are missing.');
assert(stylesSource.includes('.wrap{width:100%;max-width:1760px}') && stylesSource.includes('.board-list{overscroll-behavior-y:auto'), 'Responsive desktop layout or vertical Board scroll boundary is missing.');
assert(appSource.includes('function updateBoardScrollControls()') && appSource.includes("addEventListener('scroll',updateBoardScrollControls"), 'Board scrolling controls are not wired.');
assert(stylesSource.includes(':root[data-theme="dark"]') && stylesSource.includes('--paper-rgb:36,48,43') && stylesSource.includes('.theme-toggle'), 'Dark token coverage and accessible switch styling are missing.');
assert(!['rgba(247,245,239,','rgba(154,131,95,','rgba(38,49,45,','rgba(89,104,97,','rgba(109,67,71,'].some(fragment => stylesSource.includes(fragment)), 'Hardcoded light-theme surface colors remain outside theme tokens.');
const headersSource = await fs.readFile(new URL('public/_headers', root), 'utf8');
const projectPatchSource = await fs.readFile(new URL('functions/api/projects/[id].js', root), 'utf8');
const revisionSource = await fs.readFile(new URL('functions/api/revision.js', root), 'utf8');
const progressSyncSource = await fs.readFile(new URL('functions/api/projects/[id]/progress-sync.js', root), 'utf8');
const translationSource = await fs.readFile(new URL('functions/_translation.js', root), 'utf8');
const modelCoreSource = await fs.readFile(new URL('public/model-core.js', root), 'utf8');
const projectsIndexSource = await fs.readFile(new URL('functions/api/projects/index.js', root), 'utf8');


assert(!appSource.includes('state.projects.filter(projectMatchesSearch)'), 'Board/Timeline must not pass optional-argument search predicate directly to Array.filter.');
assert(appSource.split('state.projects.filter(p=>projectMatchesSearch(p))').length===3, 'Board and Timeline must explicitly pass only the project into search.');
const marker = 'export const BOOK_CATALOG = ';
const markerIndex = catalogSource.indexOf(marker);
assert(markerIndex >= 0, 'BOOK_CATALOG export was not found.');
const arrayStart = catalogSource.indexOf('[', markerIndex);
const arrayEnd = catalogSource.lastIndexOf('];');
assert(arrayStart >= 0 && arrayEnd > arrayStart, 'BOOK_CATALOG array could not be isolated.');
const catalog = JSON.parse(catalogSource.slice(arrayStart, arrayEnd + 1));

const expectedTopics = new Set([
  'Qurʾānic Exegesis and Sciences',
  'Theology and Doctrine',
  'Mysticism',
  'Ethics and Education',
  'Jurisprudence',
  'Principles of Jurisprudence',
  'Epistemology',
  'Philosophy',
  'Logic',
  'Thought, Culture, and Biography',
]);

assert(catalog.length === 176, `Expected 176 catalogue books, found ${catalog.length}.`);
const catalogIds = new Set(catalog.map(book => book.catalog_id));
assert(catalogIds.size === 176, `Expected 176 unique catalogue IDs, found ${catalogIds.size}.`);

const topics = new Set(catalog.map(book => book.topic_en).filter(Boolean));
assert(topics.size === expectedTopics.size, `Expected 10 topics, found ${topics.size}.`);
for (const topic of expectedTopics) assert(topics.has(topic), `Missing canonical topic: ${topic}`);

const covers = coverMap.covers || {};
assert(Object.keys(covers).length === 176, `Expected 176 cover mappings, found ${Object.keys(covers).length}.`);
for (const id of catalogIds) assert(covers[id], `Missing cover mapping for ${id}.`);

const auditedBooks = pdfAudit.books || {};
const auditRows = Object.entries(auditedBooks).filter(([id]) => id.startsWith('book-'));
assert(auditRows.length === 176, `Expected 176 PDF audit rows, found ${auditRows.length}.`);

const counts = auditRows.reduce((acc, [id, evidence]) => {
  assert(catalogIds.has(id), `PDF audit references unknown catalogue ID ${id}.`);
  acc[evidence.status] = (acc[evidence.status] || 0) + 1;
  return acc;
}, {});
assert((counts.available || 0) === 172, `Expected 172 available PDFs, found ${counts.available || 0}.`);
assert((counts.missing || 0) === 4, `Expected 4 missing PDFs, found ${counts.missing || 0}.`);
assert((counts.unchecked || 0) === 0, `Expected 0 unchecked PDFs, found ${counts.unchecked || 0}.`);
const pageCountRows = auditRows.filter(([, evidence]) => Number.isInteger(Number(evidence.physical_pages)) && Number(evidence.physical_pages) > 0);
assert(pageCountRows.length === 172, `Expected physical page counts for all 172 available PDFs, found ${pageCountRows.length}.`);
const catalogById = new Map(catalog.map(book => [book.catalog_id, book]));
for (const [id, evidence] of auditRows.filter(([, evidence]) => evidence.status === 'available')) {
  assert(Number.isInteger(Number(evidence.physical_pages)) && Number(evidence.physical_pages) > 0, `Available PDF ${id} lacks a verified physical page count.`);
  assert(Number(catalogById.get(id)?.pages) === Number(evidence.physical_pages), `Website page count for ${id} does not match the audited physical PDF count.`);
}
assert(pdfAudit.page_count_verified === 172, `Expected page_count_verified=172, found ${pdfAudit.page_count_verified}.`);
assert(pdfAudit.page_count_mismatches === 72, `Expected 72 historical page-count mismatches, found ${pdfAudit.page_count_mismatches}.`);

const expectedMissing = new Set(['book-4', 'book-23', 'book-32', 'book-43']);
const actualMissing = new Set(auditRows.filter(([, evidence]) => evidence.status === 'missing').map(([id]) => id));
assert(actualMissing.size === expectedMissing.size, 'Unexpected number of missing PDF records.');
for (const id of expectedMissing) assert(actualMissing.has(id), `Expected missing PDF record ${id} was not missing.`);

assert(appSource.includes('function localDateKey(date = new Date())'), 'Recipient-local date helper is missing.');
assert(!appSource.includes("const today = new Date().toISOString().slice(0,10);"), 'UTC deadline boundary regression detected.');
assert(appSource.includes('function startWorkOnBook(id)'), 'Work on Book behavior is missing.');
assert(appSource.includes('data-work-on-book'), 'Work on Book action is missing from project rendering.');
assert(appSource.includes("function sortProjects(projects, sort='updated')"), 'Projects sorting behavior is missing.');
assert(indexSource.includes('id="sort-projects"'), 'Projects sort control is missing.');
assert(appSource.includes("localStorage.setItem('haydariProjectSort'"), 'Projects sort persistence is missing.');
assert(appSource.includes('openEnglishBookDialog(id,true)'), 'Work on Book auto-continue into English Book linking is missing.');
assert(appSource.includes('reservedPdfWindow'), 'Work on Book post-link popup-safe continuation is missing.');
assert(indexSource.includes('Anyone with the link → Editor') && indexSource.includes('public Editor links'), 'English Book sharing requirement/boundary is missing from the UI.');
assert(projectPatchSource.includes('publicly accessible without sign-in') && projectPatchSource.includes('Anyone with the link → Editor'), 'English Book public-access guard messaging is missing or misleading.');
assert(appSource.includes('function clearProjectFilters()'), 'Clear filters behavior is missing.');
assert(indexSource.includes('id="clear-project-filters"'), 'Clear filters control is missing.');
assert(indexSource.includes('id="my-projects"') && indexSource.includes('id="my-projects-count"'), 'Personal assigned-project dashboard is missing.');
assert(indexSource.includes('data-actor-choice="Zahraa"') && indexSource.includes('data-actor-choice="Mohammed"'), 'Segmented actor switch is missing.');
assert(appSource.includes('function syncActorSwitch()'), 'Segmented actor switch synchronization is missing.');
assert(indexSource.includes('Editing as') && !indexSource.includes('>Using as<'), 'Identity/view-scope wording is ambiguous.');
assert(indexSource.match(/data-view-scope="Zahraa"/g)?.length === 2 && indexSource.match(/data-view-scope="Mohammed"/g)?.length === 2 && indexSource.match(/data-view-scope="Shared"/g)?.length === 2, 'Board and Timeline do not expose the shared collaboration scope.');
assert(appSource.includes("localStorage.setItem('haydariViewScope'") && appSource.includes('function viewScopeMatches(project)'), 'Shared Board/Timeline scope persistence is missing.');
assert(indexSource.includes('id="timeline-unassigned"') && appSource.includes('Unassigned schedule'), 'Timeline does not retain Unassigned work distinctly in Shared view.');
assert(indexSource.includes('id="board-status-tabs"') && appSource.includes('data-board-status'), 'Mobile Board status tabs are missing.');
assert(appSource.includes("const MOBILE_BOARD_STATUSES = ['all', ...STATUS_ORDER]") && appSource.includes("mobileBoardStatus: MOBILE_BOARD_STATUSES.includes(savedMobileBoardStatus) ? savedMobileBoardStatus : 'all'"), 'Mobile Board must default to an All status projection.');
assert(appSource.includes("selectedStatusHasBooks") && appSource.includes("localStorage.setItem('haydariBoardStatus','all')"), 'Mobile Board must escape remembered empty-status traps when scope changes.');
assert(appSource.includes("state.mobileBoardStatus==='all' || state.mobileBoardStatus===status") && appSource.includes('board-empty-state'), 'Mobile Board must show all columns by default and render an explicit true-empty state.');
assert(appSource.includes("root.querySelectorAll('.quick-status')"), 'Tap-friendly Board status mutation is missing.');
assert(appSource.includes('assigneeBadgeMarkup(p)') && appSource.includes("value === 'Both' ? 'Shared'"), 'Scan-speed Shared assignee badge behavior is missing.');
assert(indexSource.includes('data-dashboard-preset') === false, 'Dashboard drill-down controls must be rendered from live state, not hard-coded stale counts.');
assert(appSource.includes('data-dashboard-preset=') && appSource.includes('function openProjectsPreset(preset)') && appSource.includes('function openPersonWork(person)'), 'Dashboard summaries are not navigational.');
assert(appSource.includes("['translating','Translating', translating]") && appSource.includes("['needs_formatting','Needs formatting', needsFormatting]") && appSource.includes("['needs_review','Needs review', needsReview]"), 'Dashboard Right now must expose literal workflow stages instead of a vague Active aggregate.');
assert(appSource.includes('const overdue=due.filter') && appSource.includes('const dueToday=due.filter') && appSource.includes('deadlineBits.push(`${overdue} overdue`)') && appSource.includes('deadlineBits.push(`${dueToday} today`)'), 'Dashboard deadline summary must distinguish overdue and due-today work.');
assert(indexSource.includes('Catalogue Books Translated') && indexSource.includes('of catalogue books translated · status-based'), 'Global translation math does not identify its corpus/status denominator.');
assert(indexSource.includes('Catalogue Books Published') && indexSource.includes('actually published · Publish Ready is separate'), 'Publication math is still conflated with Publish Ready workflow state.');
assert((indexSource.match(/Assignment ownership/g) || []).length === 2, 'Dashboard and Stats must label exclusive assignment ownership explicitly.');
assert(appSource.includes('function assignmentScopeSummary(person, projects=corpusProjects())') && appSource.includes('incl. Shared'), 'Assignment math must disclose direct ownership versus personal scope including Shared.');
assert(appSource.includes('direct +') && appSource.includes('sharedAssigned'), 'Personal assigned-project count must disclose direct + shared composition.');
assert(appSource.includes('Page-weighted translated') && appSource.includes('assigned page-equivalents'), 'Personal page-weighted percentage must show its page-equivalent numerator/denominator.');
assert(appSource.includes("['Open (not Publish Ready)',open.length]") && appSource.includes("['With deadline',scheduled.length]") && appSource.includes("['Without deadline',unscheduled]") && appSource.includes("['Publish Ready (excluded)',publishReady]"), 'Open scheduling rows must reconcile scheduled/unscheduled work and excluded Publish Ready books.');
assert(appSource.includes('function paceModel({projects=corpusProjects(), paceEvents=state.paceEvents, actor=null, universe=corpusProjects()}={})'), 'Scoped pace model contract is missing.');
assert(modelCoreSource.includes('verifiedFallbackPages') && modelCoreSource.includes('reconcilePageDeltas') && modelCoreSource.includes('completionHistory'), 'Testable calculation core is incomplete.');
assert(appSource.includes('WorkbenchCore.verifiedFallbackPages(corpusProjects(universe))'), 'Pace fallback must be derived from verified corpus page counts.');
assert(appSource.includes('const weightedHalfLifeDays=14;') && appSource.includes('cap.setDate(cap.getDate()-89);'), 'Pace model must retain the 14-day half-life over at most 90 days.');
assert(appSource.includes('observedDays>=7 && progressDays>=3'), 'Pace forecast evidence gate regressed.');
assert(appSource.includes('const pages=dailyPages.get(key)||0;') && appSource.includes('weightTotal+=weight;'), 'Pace model must include zero-progress days in the weighted denominator.');
assert(appSource.includes('if (!projectIds.has(Number(event.project_id))) continue;'), 'Pace model must scope events to the selected project set.');
assert(appSource.includes("const acceptedActors=actor ? (actor==='Mohammed' ? ['Mohammed','Brother'] : [actor]) : null;") && appSource.includes('WorkbenchCore.reconcilePageDeltas(normalizedEvents,acceptedActors)'), 'Personal pace must apply collaborator attribution after correction reconciliation.');
assert(appSource.includes('const assignedCorpus=corpusProjects(assigned);') && appSource.includes('const personalModel=paceModel({projects:assignedCorpus,actor:state.actor,universe:corpus});'), 'Dashboard pace must use the selected collaborator\'s catalogue assignments without hiding operational ad-hoc projects.');
assert(appSource.includes("toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})"), 'At this rate must show an exact calendar finish date once the evidence gate opens.');
assert(indexSource.includes('id="pace-panel-title"') && indexSource.includes('id="pace-summary"') && indexSource.includes('id="stat-forecast"'), 'NaNo-style pace/projection surfaces are missing.');
assert(!appSource.includes('chart-projection'), 'Book-count completion history must not mix in a page-workload forecast.');
assert(indexSource.includes('data-activity-actor="System"') && indexSource.includes('id="activity-type"') && appSource.includes('function activityActorGroup(activity)'), 'Activity filtering controls/logic are missing.');
assert(indexSource.includes('id="due-date-warning"') && appSource.includes('function confirmSuspiciousDeadline(value,currentValue=') && appSource.includes('deadlineDaysAgo(value) > 90'), 'Suspicious-past-deadline warning/confirmation is missing.');
assert(appSource.includes('/api/official-cover/'), 'Official covers are not routed through the same-origin proxy.');
assert(coverProxySource.includes('sourceCandidates') && coverProxySource.includes('pagespeed'), 'Official cover proxy PageSpeed fallback is missing.');
assert(coverSourcesSource.includes('book-1') && coverSourcesSource.includes('book-176'), 'Generated official cover source projection is incomplete.');
assert(stylesSource.includes('--type-action:11px') && stylesSource.includes('.english-book-button{font-family:"Inter"'), 'Shared action geometry contract is missing.');
assert(!stylesSource.includes('.english-book-button{font:inherit}'), 'English Book font inheritance regression remains.');
assert(indexSource.includes('id="timeline-jump-today"'), 'Timeline Today control is missing.');
assert(libSource.includes('export function validDateRange(startRaw, dueRaw)'), 'Shared server date-range invariant is missing.');
assert(projectPatchSource.includes('Start date cannot be after the deadline.') && projectsIndexSource.includes('Start date cannot be after the deadline.'), 'Project create/update routes do not both reject impossible start/deadline ranges.');
assert(appSource.includes('function validProjectDateRange(start,due)') && appSource.includes('syncProjectDateBounds'), 'Project editor does not prevent impossible date ranges locally.');
assert(appSource.includes('invalidSchedules') && appSource.includes('start after that deadline'), 'Batch deadline edits can partially apply across impossible schedules.');
assert(appSource.includes("state.viewScope === 'Shared' ? matching : matching.filter(viewScopeMatches)"), 'Shared Board must display Unassigned books directly alongside assigned books.');
assert(appSource.includes('Matching Unassigned books are shown below.'), 'Timeline can still contradict a matching Unassigned result in Shared scope.');
assert(appSource.includes('openUnassignedSchedule') && appSource.includes('unassigned-disclosure'), 'Timeline Unassigned schedule must remain search-aware and collapsible.');
assert(stylesSource.includes('.unassigned-disclosure>summary') && stylesSource.includes('.disclosure-chevron'), 'Unassigned disclosure lacks intentional accessible styling.');
assert(translationSource.includes('projectResumeNoteProjection') && translationSource.includes('translationResumeInstruction'), 'Translation context lacks stage-aware/stale-note protections.');
assert(projectsIndexSource.includes('syncTranslationFocusForProject(context.env.DB,result,actor)'), 'New Translating project creation does not synchronize translation focus.');

// Dashboard pace/truth closure: keep behavior and freshness assertions in the same acceptance owner.
const appAssetVersion = indexSource.match(/\/app\.js\?v=([^"'&\\s]+)/)?.[1];
const stylesAssetVersion = indexSource.match(/\/styles\.css\?v=([^"'&\\s]+)/)?.[1];
assert(appAssetVersion && stylesAssetVersion, 'Workbench JS/CSS must both carry explicit cache-busting versions.');
assert(indexSource.includes('/model-core.js?v='), 'Calculation core must be cache-busted and loaded before app.js.');
assert(headersSource.includes('/app.js') && headersSource.includes('/styles.css') && headersSource.includes('Cache-Control: no-cache'), 'Workbench JS/CSS freshness headers are missing.');
assert(appSource.includes('timeline-due-marker'), 'Timeline due marker is missing.');
assert(appSource.includes('async function setProjectDeadline(id, value)'), 'Shared deadline mutation helper is missing.');
assert(appSource.includes('function renderTranslationLive()'), 'Live translation progress renderer is missing.');
assert(appSource.includes('const LIVE_REVISION_MS = 2000') && appSource.includes('const LIVE_REVISION_RETRY_MS = 1000'), 'Near-real-time revision polling cadence regressed.');
assert(appSource.includes("api('/api/revision')") && appSource.includes('function scheduleLiveRevisionPoll('), 'Revision-gated live sync is missing.');
assert(appSource.includes("cache: options.cache || 'no-store'"), 'Workbench API reads do not explicitly bypass browser caches.');
assert(revisionSource.includes('MAX(id)') && revisionSource.includes('FROM activity'), 'Live revision endpoint is not derived from shared activity state.');
assert(appSource.includes('const LIVE_MARKER_SYNC_MS = 5000') && appSource.includes('syncVerifiedTranslationMarkers()'), 'Verified Google Doc marker sync is missing from live polling.');
assert(appSource.includes("/progress-sync\`,{method:'POST'}"), 'Live client does not publish verified marker checkpoints through the same-origin sync route.');
assert(
  translationSource.includes("export?format=txt") &&
  translationSource.includes('WBPROGRESS') &&
  progressSyncSource.includes('public-export-sha256:'),
  'Shared marker reader / progress-sync route does not bind the public Google Doc marker to an exact export identity.'
);
assert(progressSyncSource.includes("onRequestPatch as publishProgress"), 'Progress-sync route bypasses the canonical guarded progress checkpoint owner.');
assert(appSource.includes('function bookTitleMarkup(project') && appSource.includes('function activityBookTitleMarkup(activity)'), 'Whole-site bilingual book-title projection helpers are missing.');
assert(appSource.includes('live-translation-copy">\${bookTitleMarkup(p,{compact:true})}') && appSource.includes('timeline-label-title">\${bookTitleMarkup(p,{compact:true})}') && appSource.includes('activityBookTitleMarkup(a)'), 'One or more secondary surfaces regressed to Arabic-only book titles.');
assert(appSource.includes("p.assignee===state.actor || p.assignee==='Both'"), 'Live progress is not scoped to the selected collaborator.');
assert(appSource.includes('translationProgressMarkup(p,true,true)'), 'Assigned books do not show zero-state page progress.');
assert(indexSource.includes('id="live-progress-summary"'), 'Assigned live-progress summary is missing.');
assert(indexSource.includes('id="live-translation-active"') && indexSource.includes('id="live-translation-feed"'), 'Live translation Dashboard surface is missing.');
assert(indexSource.includes('id="translated-pages"'), 'Project source-page progress field is missing.');
assert(appSource.includes("['translation progress','translation progress correction'].includes(a.action)"), 'Activity does not render translation progress and corrections consistently.');
assert(appSource.includes('due_date:value || null'), 'Deadline clearing does not send explicit null.');
assert(appSource.includes('data-clear-deadline'), 'Inline Remove deadline action is missing.');
assert(indexSource.includes('id="clear-due-date"'), 'Editor Remove deadline action is missing.');
assert(indexSource.includes('id="clear-batch-deadlines"'), 'Batch Remove deadlines action is missing.');
assert(appSource.includes('async function clearBatchDeadlines()'), 'Batch deadline clearing behavior is missing.');
assert(indexSource.includes('id="filter-toggle"') && indexSource.includes('id="filter-content"'), 'Collapsible filter surface is missing.');
assert(appSource.includes("querySelectorAll('.timeline-bar').forEach"), 'Timeline bars are not directly interactive.');
assert(appSource.includes("p.assignee === state.actor || p.assignee === 'Both'"), 'Actor-scoped assignment logic is missing.');
assert(indexSource.includes('value="__mine__">My assignments'), 'My assignments filter is missing.');
assert(appSource.includes("if ($('filter-assignee')?.value === '__mine__') renderProjects();"), 'Actor changes do not refresh My assignments filtering.');
assert(indexSource.includes('id="timeline-visual"') && indexSource.includes('id="timeline-unscheduled"'), 'Real timeline surface is missing.');
assert(appSource.includes('function timelineMonths(minDay,maxDay)') && appSource.includes('timeline-bar'), 'Time-axis renderer is missing.');
assert(appSource.includes('const VIEW_RENDERERS = {dashboard:renderDashboard,projects:renderProjects,board:renderBoard,timeline:renderTimeline,stats:renderStats,activity:renderActivity}'), 'Every Workbench view must have an active renderer.');
assert(appSource.includes('if (state.projects.length) render();'), 'Switching views must render their latest shared data.');
assert(appSource.includes("api('/api/activity?projection=ui')"), 'Client must request compact Activity projection.');
assert(appSource.includes("els.dialog.close(); await loadData();"), 'Project save does not reload live state after mutation.');
assert(indexSource.includes('id="group-projects"'), 'Series grouping control is missing.');
assert(appSource.includes('function seriesGroupedMarkup(list)'), 'Series grouping renderer is missing.');
assert(appSource.includes("localStorage.setItem('haydariProjectGrouping'"), 'Series grouping preference is not remembered.');
assert(seriesMap.version === '2026-10-03-official-series-v2', 'Unexpected series-map version.');
assert(seriesMap.books['book-3']?.group === 'educational-ethics' && seriesMap.books['book-3']?.position === 5, 'Educational Ethics mapping is incomplete.');
assert(seriesMap.books['book-37']?.group === 'quranic-doctrinal-ethical-concepts' && seriesMap.books['book-37']?.position === 1, 'Concepts-series opening volume is missing.');
assert(seriesMap.books['book-133']?.group === 'quranic-doctrinal-ethical-concepts' && seriesMap.books['book-133']?.position === 7, 'Concepts-series seventh volume is missing.');
assert(seriesMap.books['book-43']?.role === 'umbrella' && seriesMap.groups['usul-lessons-commentary']?.total === 20, 'Uṣūl umbrella mapping is incomplete.');
assert(seriesMap.books['book-152']?.role === 'umbrella' && seriesMap.groups['creed-ethics-collection']?.type === 'collection', 'Creed/Ethics collection mapping is incomplete.');
for (const id of Object.keys(seriesMap.books || {})) assert(catalogIds.has(id), `Series map references unknown catalogue ID ${id}.`);
assert(appSource.includes("review: 'Needs Formatting'") && appSource.includes("completed: 'Needs Review'") && appSource.includes("published: 'Publish Ready'"), 'Production-stage labels are missing.');
assert(indexSource.includes('id="published"'), 'Separate Published control is missing.');
assert(libSource.includes("'production-stages-v2'"), 'Status-model migration is missing.');
assert(libSource.includes('pages = COALESCE(?, pages)') && libSource.includes('physical_pages'), 'Verified physical PDF page counts are not applied to Workbench runtime denominators.');
assert(appSource.includes('PDF count unverified'), 'Unverified fallback page counts are not labeled honestly in the Projects surface.');
assert(
  appSource.includes('function translationDisplayPages(p)') &&
  appSource.includes('return isTranslated(p) && p.page_count_verified && total>0 && done<total ? total : done;') &&
  !appSource.includes('Translation complete · 100% · historical checkpoint unavailable') &&
  !appSource.includes('legacy-complete') &&
  !stylesSource.includes('legacy-complete') &&
  appSource.includes('historical completion · page checkpoint unavailable'),
  'Completed pre-checkpoint books must use the normal X/Y 100% progress visual; provenance belongs in detail metadata, not a special list-card species.'
);
assert(!indexSource.includes('>In Progress</option>') && !indexSource.includes('>Review</option>') && !indexSource.includes('>Completed</option>'), 'Legacy status labels remain in the UI.');

console.log(`Workbench static acceptance passed: 176 books, 10 topics, 176 covers, 172 available PDFs, 4 missing, 0 unchecked, 172 physical page counts verified, ${pdfAudit.page_count_mismatches} catalog/page mismatches reconciled at runtime.`);

assert(!projectsIndexSource.includes('syncActiveTranslationMarkers'), 'GET /api/projects must not mutate translation progress.');
assert(!progressSyncSource.includes('SET notes ='), 'Progress sync must not overwrite project notes.');
assert(projectPatchSource.includes('validStatusTransition') && projectPatchSource.includes('Math.abs(a-b) === 1'), 'Workflow stage jumps are not blocked.');
assert(projectPatchSource.includes('before.status !== \'published\''), 'Publication can still be combined with entering Publish Ready.');
assert(projectsIndexSource.includes("!['not_started','in_progress'].includes(status)"), 'New projects can still be created past Translating.');
assert(appSource.includes('projectMatchesSearch') && appSource.includes('renderTimeline();'), 'Shared book search is not consistently projected into Timeline.');
assert(stylesSource.includes('--parchment:#EEECE6') && stylesSource.includes('--paper:#F7F5EF') && stylesSource.includes('--sage:#596861'), 'Low-light-safe cooler palette tokens are missing.');
assert(stylesSource.includes('@media (prefers-reduced-motion:reduce)') && stylesSource.includes('@media (prefers-contrast:more)'), 'Accessibility preference handling is incomplete.');
assert(stylesSource.includes('@media (hover:none) and (pointer:coarse)') && stylesSource.includes('.timeline-bar{height:44px;min-height:44px;top:7px}'), 'Coarse-pointer touch-target floor is incomplete.');
assert(stylesSource.includes('--status-not-started:#D6D5CF') && stylesSource.includes('--status-ready:#805359'), 'Low-light status palette tokens are incomplete.');
assert(!['#F4EDDC','#F7F0E1','#C7A56E','#D8D1BD','#C6A56A','#D2B980','#B88132','#CAA05D','#829987','#9DAF9F','#8F4844','#A45B55'].some(color=>stylesSource.includes(color)), 'Legacy warm visual literals remain after low-light palette consolidation.');
assert(/p\.google_doc_url\s*&&\s*p\.page_count_verified/.test(appSource), 'Verified marker sync still includes books without a verified physical-page denominator.');

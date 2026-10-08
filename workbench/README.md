# Haydari Workbench

**Canonical production owner:** `mohalizahraa/operator-translation` → `main` → `workbench/`. The similarly named `Website-Source/workbench` tree is historical/non-production and must never receive a production Workbench fix in place of this owner.

Internal collaborative work manager for translating Sayyid Kamal al-Haydari's books. This is intentionally separate from the public archive/publication surface.

## Product contract

- One shared workspace and database for Zahraa + Mohammed (Brother).
- No account/login/password UI.
- The deployed Workbench URL opens the shared workspace directly; there is no private-link/capability-key gate.
- Either collaborator may edit or reassign any project. Assignee is organizational metadata, not an ACL.
- Device identity is selected as `Zahraa` or `Mohammed` under the explicit **Editing as** control. It is used for mutation/activity attribution **and** to personalize the Dashboard's **My assigned projects** surface; `Both` assignments appear for either collaborator.
- Board and Timeline share one independent, locally remembered collaboration viewing scope: **Zahraa / Mohammed / Shared**. Individual scopes show that person's assignments plus `Both`; Shared shows Zahraa + Mohammed + `Both` and keeps `Unassigned` work visibly distinct rather than silently dropping it. Because the catalogue can contain a large Unassigned backlog, Timeline exposes it as a counted disclosure collapsed by default; Board shows it directly in status columns; a matching search (or an otherwise empty assigned scope) automatically opens it so relevant Unassigned results never appear hidden. Changing viewing scope never changes actor identity or assignment.
- Shared runtime state auto-syncs while the Workbench is open: visible tabs poll a lightweight D1-backed **change revision every ~2 seconds** and reload full project/activity state only when that revision changes; a transient revision-poll failure retries after ~1 second, and the tab forces a full resync immediately when it regains focus/visibility. Local mutations still refresh immediately. While translating, the open Workbench also checks eligible in-progress public English Docs for the temporary verified `⟦WBPROGRESS:<project>:<pages>:<total>⟧` marker about every **5 seconds**; a higher marker is reconciled through the same guarded translation-progress checkpoint route, which then advances the D1 revision and refreshes every derived surface. Every derived surface—Dashboard counts, live translation feed, per-book progress, Projects/Board/Timeline, Stats, page-throughput pace, and projected finish—must recompute from the newest synchronized state rather than remain frozen at initial page load. This revision-gated + verified-marker design is the near-real-time path; do not regress to long-interval full-state polling or a parallel unverified counter.
- **Translation checkpoint delivery invariant:** advancing a manuscript's verified `⟦WBPROGRESS:<project>:<pages>:<total>⟧` marker is not a completed Workbench update until live D1 readback reports the same stored page count. The auto-sync candidate set must include the current collaborator's assigned **Not Started** books with linked public English Docs so a first checkpoint can bootstrap from 0, and the server sync route must derive the initial source-PDF SHA-256 from the already-verified available PDF when no prior checkpoint exists. A marker/D1 mismatch is an explicit open failure: repair and verify it before calling that translation batch synchronized or moving on silently.

- **Transient 503 recovery invariant:** read-only endpoints must not run catalog/schema migrations. Provision schema changes before deploying read-only routes; mutation paths retain guarded initialization. Retry only idempotent GETs (never writes), with bounded backoff; automatically reconnect failed visible dashboards while preserving an explicit data-unavailable state until D1 responds. Never treat a 503 as proof that progress or projects were deleted.
- **Project/Activity failure isolation invariant:** Projects, Board, and Timeline must render from a successful D1 Projects response even when Activity history returns 503, is slow, or times out; they must not wait for a 3 MB historical event download. Activity history refreshes independently and retries non-destructively, with an explicit loading/unavailable state in Activity. The `/api/activity?projection=ui` projection retains every event plus the immutable `status`, `translated_pages`, and `pages` before/after evidence required for historical completion, correction, and pace calculations; bare `/api/activity` preserves full archival snapshots. A failed Activity query never implies zero books or permission to reset stored progress.
- **Read purity + notes integrity invariant:** ordinary project reads never synchronize or mutate progress. Verified Google-Doc marker synchronization runs through the dedicated mutation route, preserves the initiating collaborator when known, and may update verified progress/workflow state only; it must never overwrite the project's freeform Notes field.
- **Live render / Activity transport invariant:** Shared-state revisions always update the canonical client data, but only the active view is rendered; on navigation, the new view renders from that freshest state. This avoids rebuilding six large views (including all 176 books and full activity history) on every change. The Activity API retains the full-fidelity default response for audit clients, while the browser requests `projection=ui`: all events retain their identity/author/time/action/title, but non-translation before/after JSON snapshots are omitted; translation progress and correction snapshots remain available for pace reconciliation. Never truncate event history or drop progress evidence to improve UI latency.
- **Automatic progress attribution invariant:** The open browser may auto-sync verified in-progress and eligible Not Started English Docs only for books assigned to the selected editing collaborator or Both. It must not auto-post another person's book checkpoint under the wrong browser actor, nor spend scarce Cloudflare Free requests polling someone else's assigned manuscripts. Explicit cross-collaborator manual work remains permitted.
- **Live-sync coverage invariant:** the lightweight revision token must change for every user-visible shared-state mutation, including activity/project updates, cover changes, PDF-audit freshness, and catalog/migration metadata. The client treats the token as opaque, refreshes the full derived state whenever it changes, and round-robins the verified Google-Doc marker fallback so no eligible active translation can be starved behind a fixed top-three slice. Any new mutation route must either advance one of those revision components or explicitly extend the token before it can be considered live-safe.
- Workflow statuses: **Not Started → Translating → Needs Formatting → Needs Review → Publish Ready**. Manual workflow mutations move only one adjacent stage at a time in either direction, so formatting/review gates cannot be skipped accidentally; a verified source-page checkpoint may advance translation state automatically when the evidence itself proves completion. **Published** is tracked separately and can only be set once a book is already **Publish Ready**, and rewinding the workflow clears/forbids publication.
- The Workbench preserves the archive's parchment / paper / oxblood / gold / sage visual language and Amiri + EB Garamond typography.
- The primary Arabic-source action must open the direct PDF file. A catalogue detail/download page is never labeled as the Arabic PDF.
- Projects without a direct PDF are visibly labeled **PDF missing** and can be filtered as a group.
- **Translating** means the English translation is still in progress.
- **Needs Formatting** means translation is finished and the formatting pass is still pending.
- **Needs Review** means translation and formatting are finished and the book is waiting for Zahraa's human review. This is a human-review gate, not an automated completion state.
- **Publish Ready** means translation, formatting, and Zahraa's human review are finished.
- Translation progress numerator = `Needs Formatting + Needs Review + Publish Ready`.
- Publication progress numerator = books independently marked **Published**.
- **Math / denominator visibility invariant:** every visible ratio, percentage, pace, workload, and schedule summary must expose enough scope information for its arithmetic to reconcile without hidden denominator changes. Global translation/publication percentages use the fixed 176-book catalogue corpus. **Assignment ownership** is an exclusive partition (Zahraa / Mohammed / Shared / Unassigned) that must add back to the corpus, while a collaborator's personal assignment scope explicitly includes Shared books and must disclose the direct + shared decomposition. Page-weighted percentages must show their page-equivalent numerator and denominator rather than masquerading as book-count percentages. Open scheduling must expose its open total, scheduled/unscheduled split, and excluded Publish Ready count so the displayed rows reconcile to the corpus. Never fabricate or rewrite verification-owned progress history merely to make the UI arithmetic look cleaner.
- Assignment can be changed inline on a book: Zahraa / Mohammed / Both / Unassigned.
- Priority and blockage metadata are not part of the Workbench project model; projects are organized by workflow status, assignment, deadlines, and topic instead. The runtime schema migration removes the former legacy `priority` column rather than leaving it as hidden active state.
- Start dates and deadlines can be set or cleared and are reflected automatically in a real horizontal Timeline: ranges span start→deadline, single-date projects render as milestones, overdue work is visually distinct, and undated active work remains in a separate section. A project start date may never be later than its deadline; this invariant is enforced both in the browser and by create/update APIs, including batch deadline changes, so impossible timeline geometry cannot be persisted or partially applied. Deadline removal is an explicit UI action rather than relying on a browser date-picker clear affordance; it is available inline, in the project editor, and for selected books in batch.
- Every book always exposes an **English Book** action. If no translation Doc is linked yet, the action opens the linking flow; once linked, the same action opens that Google Doc.
- **English Book access invariant:** a linked Google Doc must be shared as **Anyone with the link → Editor**. Restricted/private Docs are not valid Workbench English Book targets. The Workbench's unauthenticated link/open guard proves the recipient can reach the Doc without Google's **Request access** screen; it does **not** prove the Drive role is Editor. Operator-created or Operator-linked Docs therefore require a separate Drive-metadata check for an `anyone` + `writer` permission before linking. Both checks must pass. An existing restricted or under-permissioned link is an access defect that must be fixed, not a usable English Book.
- Every book exposes a primary **Work on Book** action. If the English Book is not linked yet it opens the existing linking flow and automatically continues into the working materials after the link is saved; once linked, it opens the English Book and, when a verified Arabic PDF exists, opens that PDF alongside it.
- Book covers use an automatic official-cover map plus a per-project cover override.
- **Whole-site bilingual title invariant:** wherever a project/book title is visibly rendered and an English title exists, the Workbench must show that English title alongside the Arabic title rather than silently falling back to Arabic-only presentation on secondary surfaces. This applies to Projects, Board, Dashboard/live progress, Timeline (including Unassigned), and Activity.
- **Static-asset freshness invariant:** production must not serve stale JS/CSS after a Workbench deploy. `app.js` and `styles.css` use explicit cache-busting query versions and Cloudflare Pages `_headers` requires revalidation; when either asset changes, the version must advance before production verification.
- Stats use live project state and real completion/publication timestamps for translated/published counts, pace, finish projection, progress-by-person, deadline summaries, and a cumulative progress graph. Every successful project/status mutation reloads shared state and re-renders Stats automatically; moving a book to **Publish Ready** updates translation counts without falsely marking it Published.
- Projects can be filtered by the Sayyid site's own ten subject categories: Qurʾānic Exegesis and Sciences, Theology and Doctrine, Mysticism, Ethics and Education, Jurisprudence, Principles of Jurisprudence, Epistemology, Philosophy, Logic, and Thought/Culture/Biography.
- Projects also support overdue/due-this-month/no-deadline, missing-cover, and missing-English-Book filters plus multi-select batch assignment/status/deadline edits.
- Projects can be sorted by recently updated, deadline, title, lifecycle status, assignee, or topic without changing the underlying project state. The chosen sort is remembered locally on that device.
- The Projects filter surface has a one-click **Clear filters** action that clears search + filter constraints while preserving the user's chosen sort. Dashboard **Right now** and **By person** summaries are navigational and open the matching filtered Projects or scoped Board view rather than remaining inert.
- Activity supports lightweight actor filters (**All / Zahraa / Mohammed / System**) and event-type filtering without expanding the terse event prose into semantic field-by-field narration. The Activity surface uses the complete recorded event history rather than silently truncating to the latest 100 rows; progress corrections remain explicit translation events.
- Compact Board cards expose scan-speed assignment badges, rendering `Both` as human-facing **Shared** while preserving `Both` in stored data.
- **Deployment readback invariant:** `public/release.json` must match the versioned app/CSS references in `public/index.html`; the acceptance suite checks this relation. A deployment is not confirmed by CI alone: verify the production `/release.json` reflects the intended release before claiming the new frontend is live.
- **Board rendering and visibility invariant:** Shared Board displays all 176 catalogue books, including every Unassigned book directly in its workflow column. Never hide the Unassigned backlog behind a separate collapsed inbox. The counts for status columns must sum to the number of visible book cards; Zahraa and Mohammed scopes include their own assignments plus Both. Desktop status columns scroll independently without stretching card heights; mobile All hides only empty status columns. Assignment and translation progress remain unchanged by view rendering.
- Mobile Board navigation defaults to **All** so assigned work cannot disappear behind an empty remembered status. Status tabs can narrow to one workflow stage, but if a remembered narrow stage becomes empty after a scope change the Board falls back to **All**. Each card keeps a tap-friendly status selector; desktop drag/drop remains an enhancement, not the only status-change path.
- Newly entered deadlines more than 90 days in the past trigger a visible warning and explicit keep-confirmation, while legitimate historical/overdue dates remain allowed.
- Mobile controls use ≥44px touch targets and 16px form text so the iPhone/Safari recipient path is practical without accidental zoom/tiny controls. The visual system uses a cooler neutral parchment/paper base with darker sage metadata so Night Shift/True Tone warms the interface without pushing an already-yellow/red palette into harsh orange; reduced-motion and increased-contrast preferences are respected.
- The official translation progress definition remains book-count based over the fixed **176-book catalogue corpus**; ad-hoc projects do not change that denominator. Pace/ETA forecasting is separate and workload-based. Exact workload uses only **verified physical-PDF page counts**; an unverified catalogue page number is provenance, not an exact denominator, and unknown counts use the verified-corpus median fallback. Positive page deltas are aggregated by calendar day, while correction checkpoints unwind the prior positive credits they correct instead of leaving pace permanently inflated. Zero-progress days remain in the exponentially decaying **14-day half-life** denominator over at most **90 days**. The finish date is withheld until at least **7 calendar days** and **3 distinct progress days** have been observed. Remaining workload uses current verified page counters for in-progress books, zero remaining pages for books already at Needs Formatting or later, and excludes a series umbrella whenever its constituent catalogue records already represent that workload—even in collaborator-scoped views. ETA = remaining page-equivalent workload ÷ recency-weighted source pages/day. The Dashboard applies the same model only to the selected **Editing as** collaborator's assigned catalogue books and their attributable page-progress events, while Stats remains corpus-wide. Completion history is reconstructed from immutable recorded workflow transitions, including rewinds, with completion timestamps only as fallback evidence for legacy records. Once the evidence gate opens, **At this rate** shows an exact calendar finish date; before then the UI explicitly reports that it is still learning rather than fabricating an ETA.
- Founder decision 2026-10-03: do **not** turn the Dashboard into an automatically prioritized "what to do next" screen, and do **not** expand Activity into semantic field-by-field change prose as part of this improvement pass.
- Founder decision 2026-10-03: keep that review's improvement wave deliberately narrow—**Work on Book**, **Projects sorting**, automatic continuation after English Book linking, remembered sort choice, and **Clear filters**; do not carry forward unrelated workflow-expansion ideas from that review.
- Founder decision 2026-10-04: explicitly approve the later six-part collaborative UX wave: shared Board/Timeline scope + clearer identity wording, Dashboard drill-down navigation, Activity filters, scan-speed assignee badges, mobile Board status navigation/control, and suspicious-past-deadline warnings. This is a scoped later expansion, not a general reversal of the earlier anti-bloat constraint.

## Data boundary

The public book catalogue metadata is committed as `functions/_catalog.js` and is derived from the canonical archive on `main`. The Workbench reconciles that catalogue into D1 without overwriting existing assignment/progress state.

Private work state — assignments, deadlines, progress, notes, working Google Doc links, and activity — remains runtime data in D1 and must not be committed to this public repository.

Cover recovery now contains **176/176 cover mappings** from the original Haydari book pages. Books without an imported image keep the archive fallback and can receive a per-book cover override in the Workbench.

Current catalogue denominator: **176 books**. The latest full physical-PDF audit completed on 2026-10-04 on the founder's **Nexus self-hosted Mac/ARM64 runner (`nexus-mac-arm64`)** against Workbench head `7d2b29f7629229773cd5665e9f4cde53e4c1269d`. It verified **172 working direct PDFs**, **4 missing**, **0 unchecked**, **172 physical page counts**, and **72 catalogue/page-count mismatches**. Evidence is preserved in `public/pdf-audit.json` and Nexus GitHub Actions run `37192187766` / job `111409353320`. The audit remained on self-hosted compute ($0 paid GitHub Actions compute). The Workbench runtime audit owner is `functions/_pdf_audit.js`.

The four verified-missing records are:
- `book-4` — *موسوعة الإمامة في الفكر الشيعي*: the official archive exposes a RAR package for the 12-volume collection rather than one direct PDF.
- `book-23` — *موسوعة شرح نهاية الحكمة*: the official archive exposes a ZIP package for the 12-volume umbrella record; the individual volumes are represented separately.
- `book-43` — *موسوعة شرح حلقات الأصول*: the official archive exposes a ZIP package for the umbrella record; constituent works are represented separately.
- `book-32` — *قراءات في المنظومة المعرفية للسيد كمال الحيدري – ج 2*: the official direct-PDF target currently returns 404 and no verified alternate direct PDF has been recovered.

A filename ending in `.pdf` is not enough; availability is based on an actual retrievable PDF response. Transient fetch/server ambiguity is `unchecked`, not `missing`.

**PDF recovery invariant:** the corpus audit tries the catalogue's direct candidate first and, when that path is stale or unreadable, discovers the current PDF from the book's official detail page before declaring the record missing. This prevents old archive filenames from silently downgrading a still-published book.

**Physical-page denominator invariant:** for every available source PDF, the self-hosted corpus audit downloads the complete PDF and opens it with macOS PDFKit to record its physical page count. The Workbench runtime uses that verified physical count for the displayed project page count, translation X/Y denominator, pace/ETA workload, and progress validation. The catalogue's historical `pages` value is retained only as provenance/fallback; any mismatch is recorded in `public/pdf-audit.json` rather than silently trusted. A book whose PDF is missing cannot have its physical count independently verified and must not be represented as PDF-verified merely because catalogue metadata contains a page number.

## Cloudflare Pages + D1

Recommended Git-integrated Pages settings:

- Production branch: `main`
- Root directory: `workbench`
- Framework preset: none
- Build command: blank
- Build output directory: `public`
- Functions directory: `functions/`

Required runtime configuration:

- D1 binding named `DB`

The normal Workbench URL opens the workspace directly.

## Verification

`npm run check` syntax-checks the browser application and Pages Functions. Apply `schema.sql` to D1 before the first production launch, then seed the authorized project data directly into D1 without committing it to Git.


## Translation-agent PDF access bridge

The canonical Arabic source for translation remains the Workbench PDF route, not a separately chosen archive URL.

For environments that cannot resolve the Cloudflare Pages hostname directly, the repository exposes a zero-cost handoff path:

- set the desired Workbench project id on the first line of `workbench/source-access-request.txt`;
- `.github/workflows/workbench-source-fetch.yml` runs only on a **self-hosted** runner;
- the runner downloads `https://haydari-translation-workbench.pages.dev/api/pdf/<project-id>`, verifies that the response is a real PDF, and uploads it as the short-lived `workbench-source-pdf` Actions artifact;
- translation tooling can then download/materialize that artifact without switching source authority or mirroring the book into the repository.

This bridge exists only to cross runtime/network boundaries. It does not change the book's canonical source, page denominator, D1 state, or Workbench PDF behavior.

## PDF availability contract

A URL that merely ends in `.pdf` is not considered available. Candidate URLs are validated server-side in small batches and persisted in D1 as `unchecked`, `available`, or `missing`.

- The UI exposes an **Arabic PDF** button only for `available` files.
- Verified files open through the Workbench's inline PDF proxy, avoiding flaky direct navigation to the legacy archive host. The proxy forwards byte-range requests so Safari/iPhone can render and seek large PDFs inline.
- HTTP 404/410 or a successful response that is not actually a PDF becomes `missing`.
- Transient/rate-limit/server failures remain `unchecked` for later retry rather than being falsely labeled missing.
- Editing a PDF URL resets it to `unchecked`.
- The Projects view supports **Missing PDF only** filtering.


## Production-stage status migration — 2026-10-03

Existing data migrates semantically once: old Review → Needs Review; old Completed → Publish Ready; old Published remains Publish Ready with its publication timestamp. Newly translated books enter Needs Formatting. Published is independent from workflow status.


## Official series / standalone organization

The Workbench has an optional **Group: Series / standalone** Projects mode. Normal flat Projects remains the default.

Series metadata is public catalogue metadata in `public/series-map.json`, derived from Sayyid Kamal al-Haydari's official website and official archive bibliography. It distinguishes:
- numbered or named series members;
- umbrella / complete-set catalogue records;
- collections whose component books are also separately catalogued;
- true standalones (any catalogue record not mapped to an official series/collection).

In grouped mode, each official series/collection is rendered as a parchment-and-gold visual shelf with its Arabic and English series name and members ordered by official part/volume position. Standalones remain together in a quieter dedicated section. Filtering still applies before grouping; the chosen grouping mode is remembered locally on that device.

Do not infer series membership merely from similar titles or from `volumes > 1`; add relationships only when supported by the official site/archive.


### Official-site series correction — 2026-10-03

A second official-site sweep recovered the seven-book **مفاهيم قرآنية، عقائدية، أخلاقية** series. The official archive numbers the current catalogue members 1–7, from **الاسم الأعظم حقيقته ومظاهره** through **أولويات منهجية في فهم المعارف الدينية**. These records must not appear as standalones.

## Personalized workspace + modern UI floor — 2026-10-03

- The Dashboard no longer shows a generic **Recently updated** list. It shows **My assigned projects** for the selected **Using as** identity, including projects assigned to `Both`, and exposes every matching book rather than truncating the list.
- Projects offers a **My assignments** filter whose meaning follows the current **Using as** identity.
- The visual system uses contemporary component treatment (intentional selects/inputs, larger radii, focus states, quieter surfaces, modern dialogs/cards) while preserving the parchment / editorial / archival identity. Browser-default or form-era chrome is not an acceptable final visual state.

### Identity and filter interaction refinement

- The global identity control is a Zahraa/Mohammed segmented switch rather than a visible native select; the underlying semantic state remains the same.
- The Projects filter surface can be collapsed to reduce persistent form chrome.
- Timeline bars are directly clickable and open their project editor.

### Visual congruence + cover resilience — 2026-10-03

- Equivalent action roles now share one font-size/line-height/height/padding/radius contract across Dashboard, Projects, Board, Timeline, and dialogs. The prior `English Book` button font-inheritance override is explicitly eliminated.
- Typography is semantic rather than screen-local: **EB Garamond** owns editorial English headings/titles, **Amiri** owns Arabic titles, and **Inter** owns controls, event prose, and metadata. Same semantic role → same family/weight/scale. Activity rows must render event prose as UI text, the Arabic+English book title as one paired editorial unit, and date/actor/time as readable secondary metadata; ad-hoc per-surface font overrides that break this hierarchy are regressions.
- Official cover images are now requested through a same-origin `/api/official-cover/:catalogId` proxy with edge caching and a fallback that strips obsolete PageSpeed URL wrappers. This prevents brittle direct hotlink rendering from making mapped covers appear missing.
- Timeline now uses workflow-status color on bars, explicit due-end markers for ranges, and a `Today` control that centers the current date without changing project data.


## Translation-agent fast start / resume contract — 2026-10-06

The PDF access bridge remains the canonical way to cross a runtime boundary when an agent needs source bytes, but it is no longer the complete startup contract.

For a named project, `GET /api/projects/<id>/translation-context` returns one composite, no-cache resume payload containing the project/workflow identity, canonical PDF route and source hash, verified physical-page denominator, linked English Google Doc, stored checkpoint, safely usable live `WBPROGRESS` marker, exact next physical source page, `[[NEXT_BATCH]]` sentinel, explicit collaborator focus, and any durable source-recovery pack. Its resume instruction is **workflow-stage aware**: only Translating may instruct continuation from a source page; Needs Formatting, Needs Review, and Publish Ready explicitly prohibit resuming source-page translation and point to their own next gate. Volatile project/source-pack resume notes that conflict with authoritative workflow/progress state are withheld or archived in the composite projection rather than allowed to override verified state.

For an unnamed **continue/resume translating** request, `GET /api/translations/current?assignee=Zahraa` (or Mohammed/Brother) is the one-hop entry point. It prefers an explicit D1 `translation_focus` pointer and only falls back to the most recently active assigned Translating project. `PATCH /api/translations/current` sets explicit focus after validating assignment and workflow state. Verified page progress, project lifecycle changes, and creation of a new project directly in Translating keep focus synchronized automatically.

Reusable source-access discoveries belong in `translation_source_packs`, not chat memory. `GET/PATCH /api/projects/<id>/source-pack` persists only recovery/resume knowledge not already owned by the project, PDF audit, checkpoint ledger, or Google Doc. Source-pack mutations and explicit focus mutations record Activity so the existing shared revision token sees them.

The canonical Arabic PDF remains the semantic and physical-page authority. A transcript, mirror, OCR route, or other clean-text witness can accelerate source recovery but must be aligned back to the canonical PDF before physical-page progress advances. The fast-start API is a consolidated projection over existing truth owners, not a second progress counter or source authority.

**Production acceptance:** the current-translation, translation-context, and source-pack routes must return JSON from Pages Functions. A 200 response containing the static Workbench HTML/SPA shell is a stale/failed deployment, not a successful endpoint check.

## Live source-page translation progress — 2026-10-04

Each project can store a source-PDF page counter (`translated_pages`) against its authoritative catalogue page denominator. The Dashboard exposes one compact **Live translation progress** panel for the selected `Using as` identity: its assigned books (including `Both`) plus up to the five most recent page updates from those same currently assigned books. It must not leak another collaborator's assigned-book progress into the selected identity's feed. Project/assigned cards show a subtle per-book bar only after translation has begun. Translation-progress changes are written to Activity as a dedicated event, so the Activity view remains an auditable chronological feed without turning every screen into a social-feed surface.

Page progress is source-relative: **X/Y means X physical pages of the authoritative Arabic PDF have been processed into the English translation target**, not Google Doc pages. A positive first progress update automatically moves a Not Started book to Translating, but page count alone does not certify formatting, semantic review, or publication readiness.

**Live translation cadence invariant:** while an agent is actively translating a Haydari book, verified progress must be published to the Workbench continuously at the natural completed source-page batch boundary rather than being held until the requested stopping page or end of the session. After each batch has been written to the linked English Book and read back successfully, advance the temporary `WBPROGRESS` marker/checkpoint to that exact highest continuously processed physical source page so Dashboard, per-book progress, pace, and ETA can refresh in near real time. Never advance the website ahead of manuscript evidence, and never leave already-verified batches artificially stale merely to reduce checkpoint writes.

**Verified-progress invariant:** source-page progress is verification-owned state, not ordinary editable project metadata. The generic project editor and generic project PATCH route must never write `translated_pages`. Progress may advance only through the dedicated checkpoint route after the target mutation has been read back; every checkpoint carries the expected previous count (optimistic-concurrency guard), authoritative physical-PDF denominator, source-PDF SHA-256, and an exact target-state identity. Direct agent checkpoints use the current native Google Doc revision. The zero-cost live-marker bridge may instead use `public-export-sha256:<hash>`, computed server-side from the exact public text export that contains a temporary verified `WBPROGRESS` marker. The bridge must obtain the source hash from the latest existing checkpoint and then call the canonical guarded progress route; it must never write `translated_pages` directly or bootstrap a project with no prior source-hash checkpoint. All checkpoints are persisted in `translation_progress_checkpoints`. Stale writers fail closed instead of overwriting a newer count. Temporary `WBPROGRESS` markers are working-draft telemetry and must be removed during terminal publication cleanup.

The stored Workbench counter is a synchronized checkpoint projection, **not independent proof of manuscript coverage**. If it ever conflicts with authoritative source↔target evidence, stop, reconcile the manuscript, correct the checkpoint, and only then report progress. The authoritative denominator is the actual physical page count of the canonical PDF used by the translation workflow. For **Repentance / book-123**, that PDF is **132 physical pages**; the previous catalogue value of 131 was a metadata mismatch and is corrected here.

**Completed-translation display invariant:** once the canonical workflow status establishes that translation is complete (**Needs Formatting**, **Needs Review**, or **Publish Ready**), primary translation-progress surfaces must render that book through the **same ordinary X/Y progress component as every other book**: the visible numerator equals the verified physical-PDF denominator, the label reads `Y/Y pages` (or `Y/Y pages translated` where that component already uses the longer copy), and the standard track is fully filled. Do **not** create a separate grey/dashed “legacy complete” card, do not replace X/Y with “Translation complete,” and do not put “historical checkpoint unavailable” in the primary progress row. Missing historical checkpoint provenance may remain available in project-detail/editor metadata, but it must not alter the list/card visual species. This is a display projection only: never fabricate or backfill stored `translated_pages` without verification-owned checkpoint evidence.


### Assigned-workload progress baseline — 2026-10-04

The selected collaborator's assigned books now show source-page progress even at **0/Y**. The Dashboard live translation panel shows the complete assigned workload for the current `Using as` identity (including `Both`), with active work sorted first, rather than hiding books until translation begins. Assigned project cards likewise retain a quiet 0% progress track from the beginning.


**Latest successful full-corpus physical verification (2026-10-04):** Nexus self-hosted run `37192187766`, rerun job `111409353320`, verified **172 available PDFs / 4 missing / 0 unchecked / 172 physical page counts / 72 historical catalogue mismatches** against Workbench head `7d2b29f7629229773cd5665e9f4cde53e4c1269d`. The deployed Workbench has been re-read after propagation: all **172 available** records report `page_count_verified=true` with `physical_pdf` basis, and the four missing records remain explicit. Earlier run `37192638039` independently reached the same 172/4/0/72 corpus result.

# HANDOFF — Prophets final publication QA → Prophetic Measures translation/formatting

**Date:** 2026-10-05  
**Repository:** `mohalizahraa/operator-translation`  
**State described:** live Google Docs + live Haydari Workbench + current `main`  
**Purpose:** restart-safe continuation projection. This handoff does **not** replace the canonical Operator Protocol, the live Workbench state, or the authoritative Arabic PDFs.

## 1. Parent task / user contract

The user's active parent task is:

1. fully apply the current translator profile to **The Infallibility of the Prophets in the Noble Qurʾān** ("Prophets"; earlier speech-to-text sometimes rendered this as "Profix");
2. **only after Prophets is truly finished**, continue another book assigned to Zahraa from the Workbench;
3. translate that next book completely;
4. then run another **full formatting pass**, where "formatting pass" means the **entire current Arabic-book translator profile is applied**, not merely a visual cleanup or TOC insertion;
5. keep the Workbench progress/state synchronized as verified work accumulates.

The next assigned book has already been started to **6/584 source pages**, so the continuation must preserve that work, but the user's requested ordering means **freeze further progress on it until Prophets actually closes**.

## 2. Mandatory authority/routing on resume

On every fresh turn/session, do not use this handoff as behavioral authority.

Freshly load:

- `mohalizahraa/operator-protocol/AGENTS.md`;
- the owners it routes for the actual task;
- `profiles/arabic-book-translation.md`;
- the live `mohalizahraa/operator-translation/AGENTS.md` projection router when working in the translation repo;
- the Workbench/project authorities as needed.

At this handoff checkpoint, the canonical and translation-projection copies of `profiles/arabic-book-translation.md` are byte-identical:

- canonical blob: `bb8057e639c4f77a88050f69630ab3fe34eed34b`
- projection blob: `bb8057e639c4f77a88050f69630ab3fe34eed34b`

Always re-check freshness on the next turn; do not assume those SHAs remain current.

## 3. Live portfolio state

### A. Prophets — project 1 / book-80

**Arabic:** عصمة الأنبياء في القرآن الكريم  
**English:** The Infallibility of the Prophets in the Noble Qurʾān  
**Workbench project id:** `1`  
**Catalog id:** `book-80`  
**Assignee:** Zahraa  
**Physical Arabic-PDF denominator:** **209 pages**, verified by the Workbench corpus audit  
**Workbench stored progress:** **209/209**  
**Workbench raw status:** `review` (human-facing **Needs Review**)  
**English Google Doc:**  
`https://docs.google.com/document/d/1KJBqjZ41Zasg_LqrKNr4wJXZCkpOcJ77PXQal2KU1qM/edit`

**Current Google Doc revision at handoff:**
`ANLCKQlEK-EjjRGSmeeD9zSP4ONzIm08TM5GvDbsRGaIU-F48mQsjbrsoN_DUvgONNVBAiCcpH6Xd1iwCKNsEZH6kJvuf3eHPY4x1M_B8CA`

**Sharing verified:** `Anyone with the link → Editor` (`anyone` + `writer`).

**Important status correction:** the Workbench is ahead of reality here. `Needs Review` semantically means translation **and formatting** are finished, but Prophets still has an open publication-QA defect and temporary diagnostic formatting described below. Do **not** treat the Workbench `review` status as proof that the book is publication-QA verified. Reconcile the Workbench state with the real gate before claiming completion.

### B. The Prophetic Measures for Preserving the Divine Message — project 2 / book-67

**Arabic:** التدابير النبوية لحفظ الرسالة الإلهية  
**English:** The Prophetic Measures for Preserving the Divine Message  
**Workbench project id:** `2`  
**Catalog id:** `book-67`  
**Author:** Dr. Ṭalāl al-Ḥasan  
**Assignee:** Zahraa  
**Physical Arabic-PDF denominator:** **584 pages**, verified  
**Workbench stored progress:** **6/584**  
**Workbench raw status:** `in_progress` (human-facing **Translating**)  
**Progress timestamp:** `2026-10-05T11:42:18.002Z`  
**English Google Doc:**  
`https://docs.google.com/document/d/1C8ZOE14w9mUF27hBowwnk42d_fG2cl32R2T5GAeepS8/edit`

**Current Google Doc revision at handoff:**
`ANLCKQkgisHI55EceTnnVd8fwowJ8z6wUI_pLnb9hGQNZQd99Z15KHYuYl_uXySoyOcO2o-xb3SjhRSmjckzUf3FFp_hyia0iOlb7R3a8wA`

**Sharing verified:** `Anyone with the link → Editor`.

The Doc currently contains 28 text paragraphs and translated material through the opening/front-matter/foreword area represented by the verified **6-page** Workbench checkpoint. Before resuming, re-confirm source↔target alignment at page 6; then continue from **source page 7**, not from a guessed Google Doc page.

The canonical source remains the Workbench project PDF route / verified project PDF. If the environment cannot directly resolve the Workbench/Cloudflare source, use the repository's existing self-hosted source-access bridge rather than switching source authority.

## 4. Prophets — what is already completed/verified

The substantial translator-profile pass has already covered the following:

- source translation coverage is **209/209** in Workbench;
- target is English-only at the editable-text layer; current structural scan found no Arabic-script residuals other than the intentionally retained Qurʾanic brackets `﴾ ﴿` and approved sacred glyph characters;
- **295 native Google Docs footnotes** exist and were previously audited against the active profile's note geometry/font/spacing rules;
- **69 native TOC entries** currently exist;
- native page numbers exist;
- sharing is `Anyone with the link → Editor`;
- sacred/honorific glyph cleanup was run across body + native footnotes;
- the safe divine-pronoun sweep reached zero safe unmarked cases under the conservative classifier used in the pass;
- legacy prose-style honorific phrases targeted by the pass were reduced to zero;
- **67 glyph-format defects** were repaired so sacred glyphs use the designated glyph font/size rather than inheriting body formatting;
- body/headings/notes had already passed the main structural profile checks before the final trailing-page work reopened downstream layout evidence;
- the native TOC was successfully refreshed after the earlier Joseph pagination issue;
- the current TOC entry is:
  - `The Story of Joseph	90`
- rendered inspection across the book was performed and the exact end-of-book pass exposed the remaining page-185 defect below.

## 5. Prophets — current open defects / why it is NOT done

### 5.1 Critical rendered defect: blank trailing page 185

The exact current English PDF export renders **185 pages**.

- Page **184** contains the actual final conclusion/prayer text.
- Page **185** is an unintended trailing blank page carrying only the page number.

This violates the translator profile's no-empty-page / rendered-publication gate. Therefore Prophets is **not publication-QA verified**.

Do not confuse:
- **209** = physical pages in the authoritative Arabic source PDF / Workbench progress denominator;
- **185** = current English render page count.

The English edition may legitimately have a different page count; the defect is specifically that the last rendered page is blank.

### 5.2 Blank-page diagnosis already attempted — do not repeat blindly

The tail of the Google Doc contains no explicit `sectionBreak` in the inspected ending region.

The visible final body paragraph is currently:
- range approximately `224569–224891`
- starts `O Allah ﷻ, make us and all believing men and women...`

The host-managed terminal paragraph/newline is approximately:
- `224891–224892`

Attempts already made:

1. terminal empty paragraph normalized to zero indents/spacing and reduced to approximately **1 pt** text / minimal line spacing;
2. deleting the final segment newline through Docs API was attempted and rejected with:
   - `400 INVALID_ARGUMENT`
   - `The range cannot include the newline character at the end of the segment.`
3. the final visible prayer paragraph's `spaceBelow` was temporarily reduced from the v2 body value of 4 pt to **0 pt**;
4. the book was re-exported after these attempts.

**Result:** page 185 remained blank. Therefore "terminal newline is simply too tall" is not yet proven and the above changes did not solve the root cause.

### 5.3 Temporary diagnostic formatting currently violates/risks the profile

Do not leave these as silent final-state hacks:

- The final ordinary body paragraph currently has `spaceBelow=0`, while v2 ordinary body rhythm requires **4 pt below**. This was a diagnostic edit and must be restored unless a real source/edition-specific rule justifies otherwise.
- The terminal empty paragraph was artificially reduced to ~1 pt / minimal line spacing as a diagnostic.
- **The Story of Joseph** is currently an `HEADING_3` with `pageBreakBefore=true`:
  - range `102172–102192`
  - `keepWithNext=true`
  - current TOC page = 90.
  
  That forced break was introduced to align the native TOC with the actual rendered page after Google Docs had logically anchored the heading to 89 while visually moving it with following text to page 90. The active v2 profile says H3/H4 should remain continuous and rely on anti-stranding rather than receive a forced page break merely because of their level. Re-evaluate this before completion. Prefer a profile-conformant natural page-90 result; do not silently keep a special H3 forced break without a justified edition-specific reason.

## 6. Prophets native TOC refresh machinery / evidence

The existing one-shot workflow is:

`.github/workflows/one-shot-prophets-toc-refresh.yml`

Current workflow blob at handoff:
`7fa6790f2eb2bc50dcb57a18bbed241be2a27698`

It runs only on:
`[self-hosted, macOS, ARM64]`

This respects the $0 paid GitHub Actions compute constraint.

The driver was improved during this session because Google Docs' native TOC refresh control was difficult to reacquire after full-document pagination. The successful route now:

1. touches major document anchors to force pagination;
2. selects the real native `Table of contents` container;
3. clicks the visible native `Update table of contents` control.

Useful run history:

- `37298214212` — failed while trying to reacquire the TOC refresh control after pagination.
- `37298756675` — another control-selection failure.
- `37299018301` — diagnostics identified the actual Google Docs TOC/update DOM controls.
- `37299922570` — successful native visible-control refresh.
- `37302783905` — latest successful one-shot TOC refresh before the subsequent tail-layout diagnostic edits; head `f1127cfa04a7a26e912ae8d65a2e836a27c62c56`.

**Critical evidence invalidation:** the tail paragraph/spacing edits happened after the last decisive TOC refresh. The current TOC may still display the right numbers, but it is **not terminal evidence** for the exact final layout because layout-changing edits invalidate downstream TOC/render proof.

The workflow's current inline trigger comment says it is the "terminal fixed-point refresh after removing the trailing blank page." That comment is now stale because the blank page was **not** actually removed. Treat the workflow as a temporary one-shot helper, not canonical project truth. After successful completion, clean or retire stale diagnostics/comments if they no longer earn their place.

## 7. Exact Prophets resume sequence

Do these in order.

### Phase P1 — repair the final layout at the correct owner

1. Re-read the current Doc revision before mutation.
2. Inspect the rendered geometry around pages 183–185 and the final body/host-managed terminal paragraph, including any footer/page-number behavior and any pagination properties inherited by the final content.
3. Diagnose the real reason Google Docs creates page 185.
4. Fix the shared/root cause without leaving visible body text compressed, reducing the book's font/line-spacing standards, or manufacturing a blank/spacer workaround.
5. Restore the final ordinary body paragraph to v2's normal **4 pt below** rhythm unless a legitimate semantic class says otherwise.
6. Remove/reconcile the terminal-paragraph diagnostic styling if it is no longer needed.
7. Revisit the `The Story of Joseph` H3 forced page break. Remove it if natural profile-conformant anti-stranding can keep the heading on rendered page 90; if changing it reflows the book, propagate that change through all downstream evidence.

### Phase P2 — rerun all invalidated downstream gates

After **all** layout-changing edits are finished:

1. run the native TOC fixed-point refresh again using the self-hosted one-shot workflow;
2. verify the workflow truly changed/refreshed the Doc rather than trusting a synthetic click/log line alone;
3. reapply the v2 TOC presentation after refresh:
   - visible Latin/transliteration text: **Amiri**
   - visible foreground: **plain black**
   - no visible blue/underline
   - sacred glyphs retain **Scheherazade New**, reduced optical size, black;
4. export a fresh PDF;
5. verify the terminal page is not blank;
6. verify all 69 TOC entries against the exact fresh render, especially:
   - Introduction;
   - Part One;
   - Part Two;
   - The Story of Joseph;
   - Second/Third/Fourth Study;
   - A Fragrant Conclusion;
7. rerun the relevant structural/profile gates on the exact final Doc:
   - 295 native footnotes and note formatting;
   - heading hierarchy and page-break policy;
   - no profile-violating H3/H4 forced breaks unless explicitly justified;
   - body rhythm/alignment;
   - sacred glyph font/size/rendering;
   - zero unintended Arabic source text;
   - native page numbers;
   - sharing = anyone/writer;
8. inspect the **entire exact final rendered book**, not only sampled pages. Any new outlier reopens the affected class.

Only after this passes is Prophets genuinely ready for the human-review stage.

### Phase P3 — reconcile Workbench truth

Because project 1 currently says `review` while publication QA is open, reconcile the Workbench state to match reality. Do not leave a semantically false status simply because the counter is 209/209.

Once the full formatting/publication-QA pass truly passes, the correct workflow state is **Needs Review** (human review still pending), not Publish Ready.

## 8. Next book resume sequence — project 2

Once Prophets genuinely closes:

1. re-read live Workbench project 2 and the current Google Doc;
2. verify that the existing **6/584** checkpoint still matches the actual target state and canonical source PDF;
3. resume from **source page 7**;
4. maintain source-relative verified page progress through the Workbench's guarded progress route/checkpoint mechanism; do not manually invent page counts;
5. keep the website/state synchronized as verified progress increases;
6. translate **all in-scope surfaces**, not only body paragraphs:
   - front matter;
   - headings;
   - body;
   - Qurʾanic/hadith material;
   - native notes/footnotes;
   - tables/captions/headers/other text-bearing structures as present;
7. preserve the translator profile continuously during translation, but do not call the final formatting pass complete until all **584** source pages are text-complete and the terminal pass is run;
8. at 584/584:
   - move to the translation-finished / formatting-pending stage as the Workbench model requires;
   - perform a **full translator-profile pass** over the entire book;
   - create/refresh the required native English TOC only after the final layout is otherwise stable;
   - reapply TOC visual styling;
   - export and inspect the entire exact final render;
   - verify permissions and all structural gates;
9. only after translation + full formatting/publication QA passes should the book move to **Needs Review**.

Do **not** start another Zahraa-assigned book after project 2 unless the user extends the scope again.

## 9. Current project-2 content checkpoint

At handoff, the project-2 Doc:

- revision: `ANLCKQkgisHI55EceTnnVd8fwowJ8z6wUI_pLnb9hGQNZQd99Z15KHYuYl_uXySoyOcO2o-xb3SjhRSmjckzUf3FFp_hyia0iOlb7R3a8wA`
- modified: `2026-10-05T11:40:04.048Z`
- 28 text paragraphs;
- begins with:
  - `The Prophetic Measures for Preserving the Divine Message`
  - `From the Research of the Religious Marjaʿ`
  - `Sayyid Kamāl al-Ḥaydarī ﵋`
  - `Dr. Ṭalāl al-Ḥasan ﵋`
- current tail includes the al-Ḥaydarī foreword ending:
  - `Indeed, He ﷻ is the One who grants success.`
  - `Kamāl al-Ḥaydarī ﵋`
  - `13 Jumādā al-Ūlā 1437 AH`

This content is already persisted. Preserve it; do not restart the book or duplicate page 1–6.

## 10. Things not to claim

Until the gates above pass, do **not** say:

- Prophets is finished/publication-QA verified;
- the full translator profile is fully applied to Prophets;
- Prophets' current Workbench `Needs Review` state proves formatting is done;
- the current TOC is terminally verified after the later layout edits;
- project 2 is more than **6/584** unless a newer verified checkpoint exists;
- project 2 formatting is done;
- either book is Publish Ready.

## 11. Reverse-test / restart check

A fresh agent should be able to resume without the old transcript by doing:

1. fresh Operator load;
2. live Workbench read;
3. open Prophets Doc id `1KJBqjZ41Zasg_LqrKNr4wJXZCkpOcJ77PXQal2KU1qM`;
4. reproduce/inspect the page-185 blank trailing-page defect;
5. remove the defect and temporary profile deviations at root cause;
6. rerun terminal native TOC + full exact-render QA;
7. reconcile project 1 Workbench state;
8. open project 2 Doc id `1C8ZOE14w9mUF27hBowwnk42d_fG2cl32R2T5GAeepS8`;
9. verify the live checkpoint, then continue from source page 7 to 584;
10. run the complete translator-profile formatting/publication pass and move project 2 to Needs Review only after it genuinely passes.

That is the active continuation graph.

# Handoff — Prophets full-profile closure → Prophetic Measures continuation

Date: 2026-10-05  
Repository: `mohalizahraa/operator-translation`  
Branch/ref at handoff creation: `main`  
Purpose: restart-safe continuation of Zahraa's active Arabic→English translation work.

## 1. Parent outcome

The active user instruction is:

1. **Fully apply the current Operator translator profile to _The Infallibility of the Prophets in the Noble Qurʾān_**. A “formatting pass” means the current `profiles/arabic-book-translation.md` is completely applied; do not call the pass complete from a spot-check or an older formatting state.
2. **Only after Prophets actually passes that terminal profile/publication-QA gate**, continue the next Workbench book assigned to Zahraa.
3. The next active book is already started: **_The Prophetic Measures for Preserving the Divine Message_**. Continue its Arabic→English translation from the verified source-page checkpoint rather than restarting, finish the whole translation, then perform another complete translator-profile formatting/publication-QA pass on that book.
4. Keep the Workbench synchronized with real verified page progress. Workbench state is a projection of evidence, not a substitute for manuscript evidence.

Do not stop after a local child task. The parent is not complete until Prophets is truly profile-complete and the Prophetic Measures book is fully translated and then fully formatted/profile-verified.

## 2. Authority / routing on resume

Freshness is per turn.

Before doing substantive continuation work, freshly load:

- `mohalizahraa/operator-protocol/AGENTS.md`
- the owners it routes for the actual turn
- especially `profiles/arabic-book-translation.md` for translation/formatting work

The translator-facing repo is a generated projection, not independent authority. Its current `.projection-source.json` reports canonical Operator source commit:

`3d811da602b1360706e2052ed4936ed6fac0eb8e`

Always prefer the freshly loaded canonical Operator repo if accessible.

Project truth:
- live Haydari Workbench is authoritative for assignment/workflow/source linkage/progress projection;
- the authoritative Arabic source for a Workbench project remains the Workbench source/PDF route;
- the Google Doc is the editable English target;
- final profile completion is evidence-gated by the translator profile, not by Workbench column position alone.

Hard operating constraint: **$0 paid GitHub compute**. If a workflow is needed, use the compatible self-hosted runner / existing zero-cost route.

## 3. Active work graph

### A. Prophets — active blocker; DO NOT call complete yet

Workbench identity:
- Project id: **1**
- Catalogue id: **book-80**
- Arabic: **عصمة الأنبياء في القرآن الكريم**
- English: **The Infallibility of the Prophets in the Noble Qurʾān**
- Assignee: **Zahraa**
- Source PDF physical denominator: **209 pages**, verified
- Workbench translated-pages projection: **209/209**
- Workbench raw workflow status currently: **`review`** (UI-equivalent Needs Review)
- Published: **false**

Important: **the Workbench status is ahead of the actual current formatting evidence.** Treat Prophets as still formatting/publication-QA open until the defects below are fixed and the exact final artifact passes the terminal gates. Do not use the Workbench `review` state as completion proof.

English Google Doc:
- Document id: `1KJBqjZ41Zasg_LqrKNr4wJXZCkpOcJ77PXQal2KU1qM`
- Title: `The Infallibility of the Prophets in the Noble Qurʾān — English Translation`
- Exact revision observed at handoff:  
  `ANLCKQlEK-EjjRGSmeeD9zSP4ONzIm08TM5GvDbsRGaIU-F48mQsjbrsoN_DUvgONNVBAiCcpH6Xd1iwCKNsEZH6kJvuf3eHPY4x1M_B8CA`
- Sharing verified: **Anyone with the link → Writer/Editor**
- Current extracted paragraph count: **905**

#### What is already materially done

Earlier in this pass:
- the manuscript is text-complete against the 209-page source checkpoint;
- native footnotes are present and were audited as a class;
- sacred/honorific glyph normalization was performed;
- legacy prose honorific forms were normalized;
- glyph-font defects found during the pass were repaired;
- the native TOC exists;
- the TOC was refreshed after the earlier pagination changes;
- `The Story of Joseph` now renders in the TOC as page **90**;
- the TOC presentation was reapplied as black Amiri after refresh;
- a fresh whole-book PDF render was generated and visually inspected, which exposed the current terminal defect instead of passing silently.

These are prior evidence checkpoints, not a license to skip revalidation after the remaining layout changes.

#### OPEN DEFECT 1 — blank trailing physical page 185

The latest rendered English PDF remains **185 pages**, but:
- page **184** contains the real ending prayer/conclusion;
- page **185** is unintentionally blank except for the native upper-right page number.

This violates the profile's rendered-edition / unexplained-whitespace / empty-page acceptance boundary. Prophets is therefore **not publication-QA verified**.

Google Docs body tail:
- final content paragraph: indexes **224569–224891**
- mandatory terminal empty paragraph/newline: **224891–224892**

Already attempted:
1. Terminal paragraph normalized to effectively minimal geometry:
   - 0 pt above/below
   - 0/0/0 indents
   - keep-with-next false
   - keep-lines-together false
   - page-break-before false
   - line spacing minimized
   - attempted 1 pt text style
2. Final content paragraph's space-below was reduced to 0.
3. Attempted deletion of the terminal newline failed with the Google Docs API error:
   `The range cannot include the newline character at the end of the segment.`

Those attempts **did not remove page 185**.

Do not keep stacking arbitrary hacks. Diagnose what forces the terminal paragraph onto page 185 and fix the highest correct layout cause while preserving profile semantics.

#### OPEN DEFECT 2 — temporary H3 forced-break workaround violates v2

To stabilize the TOC/render mismatch around the Joseph section, this paragraph was given a forced break:

- text: **The Story of Joseph**
- indexes: **102172–102192**
- named style: **HEADING_3**
- current `pageBreakBefore`: **true**

That is not compliant with translator-profile v2, whose H3/H4 rule is continuous flow / anti-stranding, not forced page breaks merely by level.

Therefore this must be reconciled before final closure:
- remove/replace the forced H3 break with a profile-compliant solution;
- preserve natural anti-stranding / keep-with-next behavior;
- then refresh and reverify the native TOC against the final render.

Do not trade a correct TOC page number for an H3-profile violation.

#### TOC fixed-point / workflow history worth preserving

Relevant workflow:
- `.github/workflows/one-shot-prophets-toc-refresh.yml`

Successful native-TOC refresh:
- GitHub Actions run: **37299922570**
- Job: **111729946181**
- Workflow: `One-shot Prophets TOC Refresh`
- Head: `b157a530221bd582520e93c67cb717ac88cacb4a`
- Conclusion: **success**
- This run selected the native Table of contents container and clicked the real visible Google Docs `Update table of contents` control.

Before that success, several attempts failed only at reacquiring/selecting the native TOC control after deep pagination; diagnostics ultimately identified the actual DOM control. Keep the working direct native-control strategy rather than returning to blind coordinate/keyboard guessing.

After the successful native refresh, TOC text styling was reapplied through the Docs API:
- visible Latin/transliteration: **Amiri**
- visible foreground: **black**
- no visible default blue/underline
- sacred glyphs retained their glyph font

**Critical invalidation rule:** every subsequent pagination/layout change invalidates the prior TOC/render proof. The blank-page experiments occurred after the prior fixed-point work, so once layout is finally repaired, perform a fresh terminal TOC refresh and full render again.

#### Exact Prophets resume order

1. Fresh-load Operator + translator profile.
2. Read back the exact current Prophets Doc revision and current relevant paragraph styles; do not assume this handoff's revision is still current if another actor changed it.
3. Resolve the H3 `The Story of Joseph` forced-break noncompliance without regressing the natural page placement/TOC.
4. Diagnose and remove the unexplained trailing blank page 185 without violating profile body/heading/footnote geometry.
5. Re-run all **affected** structural/profile gates. At minimum:
   - H1/H2/H3/H4 pagination semantics;
   - no unexpected manual/empty break artifacts;
   - body/list geometry around changed regions;
   - native page-number continuity;
   - native TOC exists.
6. Perform the **terminal native TOC refresh on the exact final layout**.
7. Reapply v2 TOC presentation after refresh (Amiri, plain black, no visible blue/underline; glyphs use proper glyph font).
8. Export a fresh exact-final PDF.
9. Verify every TOC entry against the final render, including Joseph.
10. Inspect the exact final render for the whole-book publication denominator. Specifically prove:
    - no blank trailing page;
    - no unexplained whitespace/page artifacts;
    - no opener/heading boundary regressions;
    - no glyph/render regressions;
    - no footnote/layout regressions caused by the final changes.
11. Only then call the Prophets formatting pass/publication QA complete.
12. Reconcile Workbench status with evidence. It must not remain semantically ahead of the real gate.

### B. Prophetic Measures — next active book; already started

Workbench identity:
- Project id: **2**
- Catalogue id: **book-67**
- Arabic: **التدابير النبوية لحفظ الرسالة الإلهية**
- English: **The Prophetic Measures for Preserving the Divine Message**
- Transliteration: `Al-Tadābīr al-nabawīyah li-ḥifẓ al-risālah al-ilāhīyah`
- Author: **Dr. Ṭalāl al-Ḥasan**
- Assignee: **Zahraa**
- Raw workflow status: **`in_progress`** (Translating)
- Physical source denominator: **584 pages**, verified
- Workbench progress projection: **6/584**
- Latest progress timestamp observed: **2026-10-05T11:42:18.002Z**
- Published: **false**
- Source PDF status: **available**
- Page-count basis: **physical_pdf**

English Google Doc:
- Document id: `1C8ZOE14w9mUF27hBowwnk42d_fG2cl32R2T5GAeepS8`
- Title: `The Prophetic Measures for Preserving the Divine Message — English Translation`
- Revision observed at handoff:  
  `ANLCKQkgisHI55EceTnnVd8fwowJ8z6wUI_pLnb9hGQNZQd99Z15KHYuYl_uXySoyOcO2o-xb3SjhRSmjckzUf3FFp_hyia0iOlb7R3a8wA`
- Sharing verified: **Anyone with the link → Writer/Editor**
- Current extracted paragraph count: **28**
- No `WBPROGRESS` marker is currently present in the Doc.

Current English content already includes:
- title/front matter;
- Sayyid Kamāl al-Ḥaydarī attribution;
- Dr. Ṭalāl al-Ḥasan attribution;
- publisher/location/date material;
- the opening prefatory discussion;
- current tail ends with:
  - `Indeed, He ﷻ is the One who grants success.`
  - `Kamāl al-Ḥaydarī ﵋`
  - `13 Jumādā al-Ūlā 1437 AH`

Do **not** restart this book from page 1. Workbench says 6 physical source pages have been processed. On resume:
1. reacquire the authoritative project-2 PDF through the Workbench source route;
2. verify the page-6 boundary against the existing English Doc, because the Workbench counter is a synchronized checkpoint projection rather than independent manuscript proof;
3. resume from the first not-yet-processed source unit/page (expected source page 7 if the boundary readback confirms it);
4. preserve source→target coverage, footnotes/notes, headings, tables/images/captions, and every other in-scope text surface;
5. advance Workbench page progress only through the verified progress path after target readback; do not write `translated_pages` via generic project metadata.

If direct access to the Cloudflare PDF route is unavailable in the execution environment, use the existing zero-cost bridge:
- first line of `workbench/source-access-request.txt` = desired project id;
- workflow `.github/workflows/workbench-source-fetch.yml`;
- self-hosted runner only;
- artifact: `workbench-source-pdf`.

The bridge does not change source authority.

#### Prophetic Measures completion order

After the full 584-page translation is genuinely text-complete:
1. move/reconcile the project to **Needs Formatting** rather than jumping straight to Needs Review;
2. perform a **full translator-profile formatting pass over the entire book**;
3. “formatting pass” means the complete current profile, not merely font cleanup:
   - terminology/name/honorific rules;
   - full text-surface coverage;
   - semantic heading hierarchy;
   - REAL SCALE v2 body/list/footnote geometry;
   - major opening-page behavior where applicable;
   - native Google Docs TOC on its own page;
   - native page numbering;
   - black Amiri TOC presentation;
   - residual-Arabic gate;
   - glyph-render gate;
   - footnote structure/spacing;
   - whole-edition font-family gate;
   - whole-book rendered whitespace/pagination QA;
   - terminal TOC fixed-point refresh after every final layout change.
4. Only after translation + formatting/publication QA are actually verified should Workbench move to **Needs Review** for Zahraa's human review.

## 4. Workbench state is not proof

Live Workbench currently says:
- Prophets: 209/209 and raw `review`
- Prophetic Measures: 6/584 and raw `in_progress`

Use those as workflow/progress projections. If they conflict with exact source↔target or publication-QA evidence, the manuscript evidence wins and the Workbench state must be reconciled.

The current important conflict is Prophets: Workbench is already at Needs Review while profile completion is still open.

## 5. Do-not-regress constraints

- Do not mark Prophets done while page 185 remains blank or while the Joseph H3 forced break remains profile-noncompliant.
- Do not claim an earlier successful TOC refresh proves the final artifact after later layout edits.
- Do not use a manually typed TOC. The final TOC is Google Docs' **native TOC**.
- TOC visible text/page numbers must be black Amiri after the final refresh.
- Do not leave default blue linked TOC styling visible.
- Major openings must start on proper page boundaries according to the active profile.
- H3/H4 do not get forced new pages merely for their level.
- Native page numbers remain part of the final edition.
- Do not simulate native footnotes/endnotes with body text.
- Do not silently leave readable Arabic source text in an English-only target.
- Do not infer completion from a status column, translated-page numerator, successful batch edit, or green workflow alone.
- Do not use paid GitHub-hosted compute.
- Do not create a new Workbench project; use the existing assigned records and existing English Docs.
- Preserve `Anyone with the link → Editor` on English Docs.

## 6. Exact next action

**Resume with Prophets, not project 2.**

The very next technical task is to solve the two coupled final-layout problems on the Prophets Google Doc:
1. remove the noncompliant forced page break from H3 `The Story of Joseph` while keeping its rendered/TOC placement correct through natural anti-stranding/layout;
2. eliminate the trailing blank page 185 without violating the translator profile.

Then do the terminal native-TOC refresh, reapply TOC styling, export, and run the exact final whole-book render QA.

Only after Prophets is truly closed should the agent return to project 2 at the verified 6/584 checkpoint and continue the translation.

## 7. Completion language

Use the translator profile's exact state distinctions:
- **translation in progress**;
- **text-complete**;
- **publication-QA verified**.

At handoff:
- Prophets: **text-complete; publication-QA NOT verified**
- Prophetic Measures: **translation in progress, Workbench checkpoint 6/584**

Nothing in this handoff authorizes calling either parent task complete.

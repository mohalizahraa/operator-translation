# HANDOFF — Prophets final production QA → Prophetic Measures translation + formatting

Date: 2026-10-05  
Repository: `mohalizahraa/operator-translation`  
Branch/state described: `main` + the live Google Docs / Workbench runtime state below.

## 1. Parent outcome and strict order

The founder/user's active instruction is:

1. Fully apply the current Arabic-book translator profile to **The Infallibility of the Prophets in the Noble Qurʾān** ("Prophets"; the earlier spoken "Profix" reference was this active Prophets book).
2. Only after Prophets is genuinely publication-QA clean, continue another book actually assigned to Zahraa in the live Workbench.
3. The next book is **The Prophetic Measures for Preserving the Divine Message**.
4. Translate that book completely.
5. After translation is complete, run another **full formatting pass**, where "formatting pass" explicitly means the **entire current translator profile is applied**, not merely cosmetic cleanup.
6. Do not call either book's formatting pass complete until the current translator profile's structural + render gates pass on the exact final artifact.

Ordering update: the Prophets production-QA blocker remains open, but on this turn Zahraa explicitly instructed: **“Continue translating the current book you’re translating.”** That direct instruction overrides the earlier sequencing hold for Project 2. Preserve the Prophets blocker as an open loop while continuing Project 2 truthfully.

## 2. Live authority / profile state

Fresh-load Operator every turn from:

- `mohalizahraa/operator-protocol/AGENTS.md`
- then route the owners it requires for the turn.
- For translation/publication work, `mohalizahraa/operator-translation/AGENTS.md` is the translation-only projection router.

Current translator-profile synchronization was rechecked on 2026-10-05:

- canonical: `mohalizahraa/operator-protocol/profiles/arabic-book-translation.md`
- translation projection: `mohalizahraa/operator-translation/profiles/arabic-book-translation.md`
- both blob SHA: `bb8057e639c4f77a88050f69630ab3fe34eed34b`
- contents identical: **yes**

Therefore do not invent a separate formatting checklist. The live profile owns the acceptance contract.

GitHub compute constraint remains founder-locked at **$0 paid usage**. Any Actions work must use compatible self-hosted runners or remain queued; do not switch to potentially billable GitHub-hosted compute.

## 3. Portfolio state at handoff

| Project | Workbench ID | Assignee | Live status | Source progress | Immediate truth |
|---|---:|---|---|---:|---|
| The Infallibility of the Prophets in the Noble Qurʾān | 1 | Zahraa | `review` (UI: Needs Review) | 209/209 | **Text complete, but NOT publication-QA closed because final PDF still has an unexplained blank trailing page 185. Workbench is ahead of actual production state.** |
| The Prophetic Measures for Preserving the Divine Message | 2 | Zahraa | `in_progress` (UI: Translating) | 16/584 | Translation resumed by explicit user instruction. Pages 7–15 are translated; physical page 16 was visually verified blank. Resume with the first Chapter One body section on page 17. |

The Workbench statuses are workflow projections, not proof. In particular, Project 1 currently says `review`, but the formatting/publication gate is still open because of the blank final page.

---

# 4. PROJECT 1 — THE INFALLIBILITY OF THE PROPHETS IN THE NOBLE QURʾĀN

## Identity

Arabic: **عصمة الأنبياء في القرآن الكريم**  
English: **The Infallibility of the Prophets in the Noble Qurʾān**  
Workbench project: `1` / catalog `book-80`  
Assignee: Zahraa  
Author: Shaykh Maḥmūd Niʿmah al-Jayyāshī  
Verified authoritative Arabic PDF denominator: **209 physical pages**  
Canonical Workbench source route: `https://haydari-translation-workbench.pages.dev/api/pdf/1`  
Official source page: `https://alhaydari.com/ar/2015/02/55915/`

English Google Doc:
`https://docs.google.com/document/d/1KJBqjZ41Zasg_LqrKNr4wJXZCkpOcJ77PXQal2KU1qM/edit`

Current Doc ID:
`1KJBqjZ41Zasg_LqrKNr4wJXZCkpOcJ77PXQal2KU1qM`

Current Google Docs revision at handoff:
`ANLCKQlEK-EjjRGSmeeD9zSP4ONzIm08TM5GvDbsRGaIU-F48mQsjbrsoN_DUvgONNVBAiCcpH6Xd1iwCKNsEZH6kJvuf3eHPY4x1M_B8CA`

Sharing was re-read live and is correct:
**Anyone with the link → Writer/Editor**.

Current text scan:
- 0 residual Arabic-script characters in editable extracted body text
- 905 extracted paragraphs
- no temporary `WBPROGRESS` marker remains

## 4.1 Current structural profile evidence

Current live Doc structure rechecked at handoff:

- native TOC count: **1**
- semantic heading count: **69**
- native footnotes: **295**
- native page-number AutoText exists: **1**
- sacred glyph style defects in body + footnotes: **0**
  - required glyphs are in Scheherazade New at 8 pt where audited

Earlier in this same active task, before the last-page troubleshooting, the stricter profile audit also established:

- all 295 native footnotes passed the v2 geometry/font/spacing rules
- all 69 semantic headings passed the heading hierarchy / page-break rules
- body typography/geometry was normalized to the current profile
- legacy prose honorific phrases were reduced to **0**
- conservative divine-pronoun/honorific sweep reached **0 safe unmarked cases**
- 67 previously malformed sacred-glyph runs were corrected
- anyone-with-link Writer permission was verified

No later edit touched footnote content or the semantic translation. Later edits were pagination/TOC/end-of-document production edits, so the content/footnote checks are strong prior evidence, but final release still requires the exact-final-artifact gates below.

## 4.2 Native TOC state

The native Google Docs TOC is present and has **69 entries**.

A prior rendered mismatch existed for **The Story of Joseph**:
- TOC showed 89
- rendered heading appeared on 90 because the H3 naturally stayed with following text

The page boundary was stabilized and the native TOC was successfully refreshed.

Current live TOC readback:
- `The Story of Joseph\t90`

Successful native TOC refresh evidence:
- workflow: `.github/workflows/one-shot-prophets-toc-refresh.yml`
- workflow file blob SHA at handoff: `7fa6790f2eb2bc50dcb57a18bbed241be2a27698`
- successful run: **37299922570**
- run head SHA: `b157a530221bd582520e93c67cb717ac88cacb4a`
- run conclusion: **success**

Important diagnostic history so it is not repeated blindly:

1. The first terminal refresh path worked, but the Joseph TOC/render fixed point exposed a 89→90 mismatch.
2. Several later reruns failed only because Playwright could not reacquire the TOC control after deep pagination.
3. DOM diagnostics proved Google Docs exposed both:
   - `Table of contents`
   - `Update table of contents`
4. A synthetic hidden DOM click was not enough; it could report success without changing the document revision.
5. The working route was:
   - select the real `Table of contents` container
   - wait for the real visible `Update table of contents` control
   - click that native control
   - then verify the document readback
6. After refresh, TOC presentation was re-normalized to the profile:
   - Amiri
   - plain black
   - no visible default blue/underline
   - sacred glyphs remain Scheherazade New

Because **layout edits were made after that refresh while diagnosing page 185**, the current profile requires another **terminal TOC refresh on the exact final layout** after the blank-page defect is fixed.

## 4.3 ACTIVE BLOCKER — unexplained trailing blank page 185

This is the only known Prophets production blocker at handoff.

Latest exact render inspected in this session:
- total rendered pages: **185**
- page **184** contains the real closing content and closing prayer
- page **185** is visually blank except for the native page number

This violates the profile's **no empty interstitial/trailing pages** and exact-final-render gate.

The end of the current Google Doc structurally is:

- final real paragraph: indexes **224569–224891**
- unavoidable terminal newline paragraph: **224891–224892**

The final real paragraph begins:
> O Allah ﷻ, make us and all believing men and women...

The terminal newline cannot simply be deleted through the Docs API:
- attempted `deleteContentRange 224891:224892`
- Google rejected it because the range cannot include the newline character at the end of the segment

Already attempted, without fixing page 185:

1. terminal empty paragraph:
   - 0 spacing / 0 indents
   - no keep-with-next
   - no keep-lines-together
   - no page-break-before
   - Amiri
   - 1 pt font
   - lineSpacing forced down to 1
2. final real paragraph:
   - `spaceBelow = 0 pt`

The fresh PDF was unchanged at **185 pages** after these changes.

Therefore the remaining defect is **not proven to be ordinary paragraph spacing**. Do not keep stacking random spacer/font hacks.

### Next admissible diagnostic

Diagnose the real owner of the trailing page before mutating further. Strong routes include:

- export/read the exact final DOCX and inspect the final section / paragraph / footer / pagination properties (especially terminal section properties and footer/page-number interaction);
- inspect the final Google Docs page geometry and final paragraph layout in the renderer;
- compare the final section/page setup against a known nonblank-ending book if needed;
- identify whether the final terminal paragraph is being forced onto a new physical page by section/page/footer geometry rather than visible text spacing.

Repair the actual cause with the smallest reversible change.

### Prophets closure sequence after the blank page is fixed

Do not skip/reorder:

1. prove the final render has **no trailing blank page**;
2. verify no new pagination/whitespace anomaly was introduced;
3. rerun the **native Google Docs TOC refresh** on the exact final layout;
4. reapply TOC presentation (Amiri, black, no visible blue/underline, glyph font preserved);
5. verify TOC page numbers against the new rendered PDF;
6. export a fresh exact-final PDF;
7. rerun exact-final whole-book render QA; the profile requires full-page QA for the exact release candidate;
8. rerun zero-Arabic / sacred-glyph / footnote / heading structural checks as affected;
9. only then call the formatting pass complete / publication-QA verified;
10. reconcile Workbench Project 1 status with reality:
    - while this blocker is open, `review` is ahead of actual formatting state;
    - once formatting QA genuinely passes, **Needs Review** is appropriate;
    - do **not** claim Zahraa human review happened and do not promote to Publish Ready without it.

---

# 5. PROJECT 2 — THE PROPHETIC MEASURES FOR PRESERVING THE DIVINE MESSAGE

## Identity

Arabic: **التدابير النبوية لحفظ الرسالة الإلهية**  
English: **The Prophetic Measures for Preserving the Divine Message**  
Workbench project: `2` / catalog `book-67`  
Assignee: Zahraa  
Author: Dr. Ṭalāl al-Ḥasan  
Topic: Theology and Doctrine  
Live Workbench status: `in_progress` / Translating  
Verified authoritative source denominator: **584 physical PDF pages**  
Current verified source progress: **16/584**  
Progress timestamp in Workbench: `2026-10-05T13:14:24.835Z`

Canonical Workbench source route:
`https://haydari-translation-workbench.pages.dev/api/pdf/2`

Official source page:
`https://alhaydari.com/ar/2016/08/58211/`

Underlying verified direct PDF currently recorded by Workbench:
`https://archive.alhaydari.com/ebook/ar/%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85-%D9%88%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%A6%D8%AF/%D8%A7%D9%84%D8%AA%D8%AF%D8%A7%D8%A8%D9%8A%D8%B1-%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A%D8%A9-%D9%84%D8%AD%D9%81%D8%B8-%D8%A7%D9%84%D8%B1%D8%B3%D8%A7%D9%84%D8%A9-%D8%A7%D9%84%D8%A5%D9%84%D9%87%D9%8A%D8%A9.pdf`

The 584-page physical denominator was independently verified by the existing Workbench corpus audit on Nexus self-hosted run **37192187766**, job **111409353320**.

## 5.1 English target

Google Doc:
`https://docs.google.com/document/d/1C8ZOE14w9mUF27hBowwnk42d_fG2cl32R2T5GAeepS8/edit`

Doc ID:
`1C8ZOE14w9mUF27hBowwnk42d_fG2cl32R2T5GAeepS8`

Current revision at handoff:
`ANLCKQkDs3YjS1Y9LcLA24jOZnANJIeED6q-FbASN8xAItxWQmQ0__AY7uue6xFCVMXRVeDekVUYgfQC5zs1WjgKJlJI3wrTWwmGhN6-C28`

Sharing was re-read live:
**Anyone with the link → Writer/Editor**.

Current extracted state:
- 28 paragraphs
- 0 residual Arabic-script characters in the translated target
- no temporary `WBPROGRESS` marker remains
- front matter + opening introduction material have been translated
- last translated paragraph currently is:
  `13 Jumādā al-Ūlā 1437 AH`

The live Workbench verified progress owner now says **16/584**. Pages 7–9 contain the complete Preface, page 10 is intentionally blank, pages 11–14 contain the author Introduction, page 15 is the Chapter One opener, and physical page 16 has now been visually verified as intentionally blank. The safe continuation point is:

> **resume from authoritative source PDF physical page 17**, beginning with “The Nature and Function of the Measure.”

Do not restart or overwrite the existing 16-page coverage.

## 5.2 Translation continuation contract

After Prophets is genuinely closed:

1. Fresh-load the translator profile again for that turn.
2. Re-read Project 2 live Workbench state before mutation to avoid stale progress/revision assumptions.
3. Open the canonical Workbench Arabic PDF route and the existing English Doc.
4. Confirm the current **16/584** checkpoint and current target revision before the next mutation.
5. Resume source-relative work by verifying physical **page 16**, then continue from **page 17 / 584**.
6. Preserve structure and apply the translator profile **during translation**, not only at the end:
   - native footnotes where source notes exist
   - semantic heading levels
   - profile terminology/transliteration
   - approved sacred honorific glyphs + font handling
   - no invented content for damaged/uncertain source
   - all text-bearing surfaces, not body text only
7. Advance Workbench source-page progress only through the guarded verified-progress mechanism after target mutation/readback; never write `translated_pages` through generic metadata editing.
8. Keep the Workbench live state current as progress advances.
9. At **584/584**, do not jump directly to Needs Review:
   - translation text completion → **Needs Formatting**
   - then run the complete current translator-profile formatting/publication pass
   - terminal native TOC refresh on exact final layout
   - full render QA
   - only then → **Needs Review**
10. Human review is separate. Do not claim Publish Ready until Zahraa actually performs/approves the human review gate.

## 5.3 Important current profile observations for Project 2

The target already shows current profile conventions in the first six pages, including:
- Amiri/edition-style front matter
- semantic `TITLE` and `HEADING_1` structure
- sacred glyphs such as `﵋`, `﵊`, `ﷻ`
- English-only translated target text

One line currently says:
`I ask Allah ﷻ, Exalted and Most High, ...`

Do not assume this phrase is wrong merely because Prophets had legacy prose-honorific cleanup. Re-evaluate it under the **current live translator profile and source semantics** during the full terminology/honorific pass; preserve source meaning rather than mechanically applying a Prophets-specific string replacement.

---

## 5.4 2026-10-05 continuation checkpoint — 16/584

This turn reloaded the live Operator router/profile, re-read Workbench + both Docs, and confirmed there was no concurrent advancement before mutation.

Project 2 then advanced from **6/584 → 16/584**:

- physical pages **7–9**: complete **Preface** translated;
- physical page **10**: source is intentionally blank;
- physical pages **11–14**: author **Introduction** translated;
- physical page **15**: **Chapter One** opener and its six teaser items translated;
- physical page **16**: visually rendered from the authoritative PDF and confirmed intentionally blank;
- source PDF identity remained SHA-256 `f42595fd7c50e10116b944351e7d59150f2cf90c7d8a93315bcea03fc6f41e0d`;
- source page 7's note was created as a **native Google Docs footnote**, populated and formatted, then verified in a fresh PDF render at the page bottom under the native separator;
- newly inserted English text read back with **0 unapproved Arabic-script hits** after whitelisting only the edition's approved Qurʾanic brackets/sacred glyphs;
- Qurʾanic English spans in pages 11–14 were styled with the approved green semantic layer;
- `﵊` / `﵋` instances in the new chunk were isolated into the approved Scheherazade New glyph runs;
- fresh target PDF rendering verified the Preface, author Introduction, and Chapter One opener without an accidental blank interstitial page;
- guarded Workbench checkpoints **10/584**, **15/584**, and **16/584** completed successfully on the self-hosted macOS/ARM64 runner;
- live Workbench readback after the final guarded update confirmed **translated_pages = 16**.

Current Google Doc revision after the 15-page checkpoint:

`ANLCKQkDs3YjS1Y9LcLA24jOZnANJIeED6q-FbASN8xAItxWQmQ0__AY7uue6xFCVMXRVeDekVUYgfQC5zs1WjgKJlJI3wrTWwmGhN6-C28`

Next source boundary:

> Resume with **“The Nature and Function of the Measure”** on physical page **17**. Pages 17–18 have both authoritative self-hosted OCR and fresh rendered source images available; they introduce native footnotes, so preserve note anchors/ownership and render-check them before advancing the guarded checkpoint.


# 6. Workbench/runtime constraints

The live Workbench is the assignment/progress/status authority for this translation queue.

Relevant live state at handoff:

### Project 1
- id: 1
- assignee: Zahraa
- status: `review`
- translated_pages: 209
- page denominator: 209, verified physical PDF
- English Book linked: yes
- Arabic PDF available: yes

### Project 2
- id: 2
- assignee: Zahraa
- status: `in_progress`
- translated_pages: 6
- page denominator: 584, verified physical PDF
- English Book linked: yes
- Arabic PDF available: yes

The Workbench product contract requires:
- linked English Docs must be **Anyone with link → Editor**
- source-page progress is source-PDF-relative
- generic project PATCH must not mutate verified translation progress
- status and all derived progress/ETA surfaces should reflect current shared state
- no new duplicate project should be created for Project 2; it already exists and is linked

## 7. Exact restart order

A fresh agent should do this:

1. Fresh-load live Operator `AGENTS.md` and routed owners.
2. Fresh-load `operator-translation/AGENTS.md` and current translator profile.
3. Re-read live Workbench Project 1 + Project 2 to detect concurrent changes.
4. Re-read both Google Docs and compare revisions to the handoff revisions above.
5. If Project 1 has not been advanced by another actor:
   - diagnose/fix the page-185 trailing blank page at the real layout owner;
   - rerun terminal TOC refresh + TOC styling;
   - exact-final PDF export + all-page QA;
   - only then accept Needs Review status.
6. Under Zahraa's explicit continuation instruction, Project 2 may proceed while the Prophets blank-final-page blocker remains tracked as an open loop:
   - verify the existing 16/584 checkpoint and current target;
   - resume from source page 17;
   - continue to 584/584 with guarded progress updates;
   - move to Needs Formatting;
   - run the full translator-profile formatting/publication pass;
   - terminal TOC + exact-final render QA;
   - move to Needs Review.
7. Stop before Publish Ready unless Zahraa's human review is genuinely complete.

## 8. Do-not-regress list

- Do not call Prophets done while page 185 is blank.
- Do not treat Workbench `review` as proof that formatting is actually verified.
- The earlier sequencing hold is superseded by Zahraa's explicit 2026-10-05 instruction to continue the current translation. Keep the Prophets production-QA blocker open, but do not use it to halt Project 2 unless Zahraa redirects again.
- Do not create a duplicate Workbench project or duplicate English Doc for Project 2.
- Do not replace the native Google Docs TOC with a manually typed TOC.
- Do not leave TOC text blue/underlined; final presentation is Amiri + black, with glyph font preserved.
- Do not use body-text footnote simulations; preserve native footnotes.
- Do not claim a final render pass from an earlier artifact after a pagination-affecting edit.
- Do not assume a hidden/synthetic TOC button click refreshed anything; verify document revision/readback.
- Do not incur paid GitHub Actions compute.
- Do not mark Publish Ready without actual Zahraa human review.

## 9. Completion definition for the parent task

The parent instruction is complete only when:

- Prophets: full current translator profile applied + exact-final publication QA passes with no blank trailing page;
- Project 2: all 584 physical source pages translated into the linked English Doc with full in-scope source coverage;
- Project 2: complete current translator profile applied in the terminal formatting pass;
- Project 2: native TOC / pagination / full rendered QA pass on the exact final artifact;
- Workbench reflects the truthful workflow state;
- both Google Docs remain reachable as Anyone with link → Editor;
- Project 2 is at **Needs Review** (not Publish Ready) unless Zahraa has actually performed the human review.

This handoff is a continuation projection, not a replacement for live Operator, the live Workbench, the authoritative Arabic PDFs, or the current Google Docs.

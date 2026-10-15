# Fiqh al-Aqidah — Current Review Handoff

## Live target

- Google Doc: https://docs.google.com/document/d/1jMkWQfto0obfAQltSZ6Mi-YJex0-ywuzh9K-UeuhZJE/edit
- Current verified Doc revision: `ANLCKQnU8BGc5t3dQoFqJPCw0PGVZ7aropYPBqy0alvozNJysuMGAO1j3CNMvbtdwR2DESs1qgngPeGCwdNK93glN6EBbAkagKL0ONyuYQ`
- Authoritative Arabic source: physical PDF denominator 408 pages.
- Haydari Translation Workbench project: book-88 / project id 95.
- Workbench translation/source-review checkpoint: **408/408**.
- Workbench status after the 408/408 checkpoint: **review**.

## Review state

The continuous Arabic-source-to-English review has reached the end of the authoritative PDF.

- Physical source pages 361–396: reviewed against the existing English draft, including the conclusion, infallibility discussion, fitrah discussion, sources, and closing material.
- Physical source pages 397–408: Arabic source TOC reviewed as structural evidence against the live English native TOC and verified English heading hierarchy.
- English Sources section: 141 numbered entries present with no missing or duplicate numbers.
- Heading inventory: 283 H1–H4 headings checked.
- Heading honorific audit: 0 current suspects after repair.
- Explicit-name honorific audit after repair:
  - standalone Allah requiring `ﷻ`: 0 misses;
  - Ahl al-Bayt requiring `﵊`: 0 misses;
  - Imams requiring `﵊`: 0 misses;
  - Sayyid Kamāl al-Ḥaydarī requiring `﵋`: 0 misses;
  - the only residual Prophet detector hit is the already-correct longer phrase “the Prophet Muḥammad ﷺ.”
- Sacred `﵊` / `﵋` glyph rendering was normalized to Scheherazade New with the project’s reduced optical size in body/footnotes where required.

## Important repairs in the latest review

- Removed two blank paragraphs incorrectly carrying heading styles.
- Corrected the heading family around `العصمة بين التلميح والتصريح والاستنباط` to use **implicit indication**, **explicit statement**, and **inference** consistently.
- Replaced the spurious heading “Examples of Implicit Evidence” with “Returning to the Main Discussion.”
- Restored source quotations that earlier English had compressed into paraphrase, including:
  - Hadith al-Thaqalayn;
  - al-ʿAllāmah al-Ṭabāṭabāʾī’s quoted explanation;
  - the Abū Ḥamzah / Imam al-Ṣādiq report;
  - the al-Māzandarānī quotation;
  - the Adam / Imam al-Riḍā footnote quotation;
  - the free-will/infallibility source quotation.
- Restored a split native footnote that had previously been collapsed.
- Repaired broad honorific classes across body text, footnotes, headings, and bibliographic references, including context-confirmed pronouns and possessives for Allah, the Prophet, the Imams/Prophets, and later Shīʿī scholars.
- Fixed heading-level honorifics in:
  - “...Affirming His ﷻ Unity, and Knowing Him ﷻ”;
  - “The Infallible Imam Between Being Owed Obedience and Awareness of His ﵊ Infallibility.”
- Repaired the Imam ʿAlī classification passage so its repeated `him / his right / his walāyah` references carry `﵊` consistently.

## Repository / Workbench

The registered workflow `.github/workflows/one-shot-fiqh-progress.yml` was advanced to `TARGET_PAGES: "408"` and successfully published the verified 408/408 checkpoint to the live Haydari Translation Workbench. Live readback verification passed.

The workflow now records the post-review Doc revision above for future verification runs.

## Remaining downstream gates

Do **not** call the edition publication-ready yet.

Still open:

1. terminal native Google Docs TOC refresh after all pagination-sensitive edits;
2. normalize TOC presentation if the native refresh changes typography;
3. fresh export/render;
4. fixed-point verification that native TOC entries/page numbers match the final render;
5. final rendered whole-edition QA for glyph fallback, spacing, page breaks, footnote flow, and whitespace anomalies.

Translation/source review is complete; publication/render QA remains separate.

## 2026-10-15 — Existing manuscript rediscovery and partial REAL SCALE v3 repair

- Recovered the existing full-length target document at `https://docs.google.com/document/d/1jMkWQfto0obfAQltSZ6Mi-YJex0-ywuzh9K-UeuhZJE/edit`. This had been absent from live Workbench project #95's `google_doc_url`, which misleadingly made the 408-page translation appear missing in casual Drive searches. **Do not create another replacement draft; preserve this actual reviewed manuscript.**
- Drive permission readback: `anyone + writer`, suitable for the public-editable English Book contract. Book #95 status `review` means **Needs Formatting**; the existing 408/408 source-review evidence remains intact.
- Exact manuscript revision after the typography edits reported here: `AHj4eMT7bLgUNBve10LROQiNmtdnJJGbjzJCC8U_j7HZmW2hFsNj9amAhOleMZzjYH5A2VEV4X0lzBF0UTKKXenbah-RxpOcVrIR1GO5bVE`.
- **303 scoped native Google Docs `updateTextStyle` updates succeeded** across a two-location pilot, small batches, and larger guarded batches. These adjust sacred honorific-glyph point sizes to match same-paragraph text without changing the glyph wording or replacing native notes. This is **partial**, not a complete glyph-size parity pass; later larger edit attempts were blocked and must not be counted.
- The native document currently exposes **511 actual footnote objects** and a substantial hierarchical heading tree; do not migrate or overwrite these as though the target had no native notes/TOC.
- Fresh PDF export of the revision above: **455 pages**, **4,106,982 bytes**, SHA-256 `51b48c24b98945a38edb7d869c4440abfb44429834c3f56e0c6a816961971b37`. This is an unapproved *working proof*, not the publishable English PDF.
- Automated PDF QA found **two text-empty pages** (physical English PDF pages **3** and **18**, only page-number furniture), **14 TOC pages** (4–17) with **317 active links** styled blue/underlined, no visible target page numbers, and some Arial newline runs instead of all-Amiri TOC typography. PDF text scan found only intentionally retained Qurʾānic brackets `﴾﴿` in the Arabic Unicode ranges, but figure/image and all-page manual QA are still OPEN.
- An exact-book, self-hosted one-shot link attempt was committed as `.github/workflows/one-shot-fiqh-link-existing-doc-20261015.yml` at commit `1bfaa2201ec099e183b6f3b51097ab716b64b466`, with a current-state identity precondition and readback gate. **The last live Workbench readback still returned `google_doc_url: null`; do not call this integration completed until D1 confirms it.**
- A separate short Google Doc `1FxQsFFsMGxicuohtk1Uipnc_ua8TZHGrhQ8vCILBFxY` contains only publisher-description translation from earlier mistaken discovery; it is *supplemental*, not the main manuscript.
- NEXT: fix remaining glyph-size defects conservatively, correct blank-page and TOC styling/page-number behavior at the native Google Doc owner, rerun terminal TOC fixed-point refresh only after layout stabilizes, re-export and inspect all 455-ish pages and native note continuation, verify Workbench D1 English link, then separately route human review. Do not claim publication-ready yet.

## 2026-10-15 — Final live typography repair and numbered PDF proof

- Preserved the full English Google Docs manuscript `1jMkWQfto0obfAQltSZ6Mi-YJex0-ywuzh9K-UeuhZJE`. A separate native safety-copy Google Doc was made before continuing: `1VFPO5MKAqqcCVq7FRL11BIrnJOnx0DQpgBg9Il9Ux0g`.
- Live Google Docs revision after this repair: `AHj4eMSG7cLois9mTkS4FcjD2AqjyX-YKlPqWWyPjWUJ6atEZMb4Y9LwAStdYhHnSEXqCvttk-PhM1-RgBuYeDLeYo5RlBZ9K9QGMmvbKjs`. Preserved **511 native footnote objects**, **283 native Google Docs TOC entries**, and the complete original English body.
- Completed **869** additional honorific point-size parity updates from verified same-paragraph context, on top of the previous **303**. Also corrected **992** sacred glyphs embedded in mixed Amiri/unstyled runs by assigning the proper Scheherazade New glyph family while retaining the local semantic text point size (14pt body, 10pt native notes, etc.). Readbacks confirm those edit requests completed. No body or footnote words were deliberately replaced.
- Repaired the *entire native Google Docs TOC typography* to 14pt Amiri, black, non-underlined while retaining all native heading links. This includes the 282 newline runs that previously inherited Arial; subsequent PDF extraction confirms the TOC is Amiri and black.
- Fresh export after glyph repair was **468 English PDF pages**, replacing the earlier 455/463-page interim exports. Pagination changed after the formatting repairs; only the latest revision-bound PDF evidence is current. Source Arabic denominator remains **408 physical PDF pages**.
- The derivative PDF `Fiqh_al_Aqidah_English_Formatted_Proof.pdf` was generated with **283** displayed TOC destination-page numbers, mapped by aligning all **317** native TOC link fragments to the **283** actual Google PDF heading outlines. Every printed page number agrees with the retained clickable PDF destination. PDF output SHA-256 `6663ede0aecde294c93e93375d6ef8612035961bc70a3adb398409d4125c5fc6`, size **4,400,693 bytes**.
- Programmatically rendered all **468 PDF pages** at low resolution; checked all pages for text outside page bounds, empty pages, replacement glyph characters, residual readable Arabic script, and TOC printed-link destination mismatches. **0 machine-detected issues** in those checks. Inspected a 16-page cross-edition visual contact sheet; **human/independent all-page visual review remains open**. This is a publication-quality *proof candidate*, **not** a formally released book.
- **Native editable TOC page-number mode remains unresolved:** The actual native TOC is dynamic, Amiri, black, with clickable headings, but lacks page-number text. Printed numeric labels exist **only in the correctly paginated PDF derivative**. Docs API does not expose Google's page-number TOC rendering-mode/refresh control. Do not silently substitute a static list inside the Google Doc; use an authorized Google Docs UI route for terminal native page-number TOC refresh and re-export/fixed-point QA.
- Workbench Book #95 is still `review` (Needs Formatting), 408/408 recorded, `google_doc_url: null` at final live GET despite having a verified anyone-with-link Editor manuscript. Self-hosted, fail-closed link workflow `.github/workflows/one-shot-fiqh-link-existing-doc-20261015.yml` was activated/retryable in commit `c163669c09e94bf1f3d92389020518503ade331d`; **D1 readback has not established a successful link**. Do not conflate committed workflow with executed/succeeded mutation.
- Separate human manuscript approval, final source-aware editorial signoff and later publication are distinct reserved gates. Continue only with actual unfinished capabilities (native TOC page-number refresh, Workbench link, human review), not retranslation from zero.

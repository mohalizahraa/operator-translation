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

## 2026-10-15 — 470-page REAL SCALE v3 list-formatting and PDF proof continuation

- Continued on the existing fully translated English Doc, ID `1jMkWQfto0obfAQltSZ6Mi-YJex0-ywuzh9K-UeuhZJE`; final revision read back from Google Docs: `AHj4eMSiwhc-YdTXqWl8KFUULE4GRGWR1Q9mZVQ8i0mYtghQKsHVnZM8tBxwR4jVsNsISnUG8kj9z5rL8fCaF9RK6iUafkEAmX4cdzNM86c`.
- **334 verified Google Docs paragraph-style changes** normalized explicit bulleted, ordinal, numbered and bibliography entries to REAL SCALE v3 native 18pt first-line/marker, 36pt text-start, 0pt end hanging indents. All were mutation-acknowledged and revision-guarded. Other potentially semantic body/quote/display formatting remained deliberately untouched.
- Native source still has **511 footnote objects**. Scan found no unambiguous honorific point-size mismatch using adjacent semantic prose as denominator; 251 glyph runs have ambiguous/isolated context requiring a separate semantic check, not an assumption of perfection.
- New Google Docs export now contains **470 pages** (not the previous 455/463); earlier PDF page numbers are **stale**. The 470-page editorial proof adds only black Amiri **visible page numbers** to the 283 distinct existing native TOC headings, preserving 317 clickable native link rectangles. All **283/283** printed page numbers were machine-checked against the links' actual physical destinations.
- Final verified downstream PDF proof filename `Fiqh_al_Aqidah_470_Page_Verified_Editorial_Proof.pdf`, size **4,425,576 bytes**, SHA-256 `0da798941290950018ae5383a41caee5f1d4f5e7a3454983845ac911350d3431`. This PDF lives in the conversation artifacts, **not GitHub** because book content and generated proof are outside repository commit scope.
- All 470 pages were checked programmatically for blank/thin text pages, out-of-page text spans, replacement-glyph boxes, and unintended Arabic alphabetic text: **zero** in these checks. PDF body extraction for 454/454 non-TOC pages matches the fresh native Google Docs export exactly. Contact thumbnails were generated across all 470 pages, with front and last pages visually sampled; **full-resolution manual every-page review not yet certified**.
- Editorial Questions Doc `1x9Q2V_vtWwwDF_BU3QFSqhnjpceOcl9c9J8rUOUCkwk` had four stale discovery/formatting paragraphs reconciled with the recovered source and newer proof.
- Live Workbench D1 readback **still** returned `google_doc_url: null`, status `review` (Needs Formatting), and physical page checkpoint **408/408**. Health still showed `write_protection=UNPROTECTED_LEGACY` and `quality_gate=LEGACY_MARKER_ONLY`. The previously committed self-hosted Doc-link repair must not be called successful without live D1 readback.
- Remaining gates: genuine terminal **native Google Docs TOC** refresh and its own page-number/fixed-point acceptance (PDF-stamped page numbers are not this); complete full-resolution visual QA, semantic glyph edge cases, Workbench link/security/QA activation, separate human review, verified final English PDF release and publication. **Do not mark publication-ready**.

## 2026-10-15 — Additional source-fidelity repairs and new revision-specific PDF proof

- New independent spot-check against archived same-edition Arabic OCR for **physical source page 113** found three places where the English understated the original. Edited the **existing full English Google Doc** with three exact one-hit replacements: (1) restored Qurʾān as the source of **all religious knowledge**, the **first and final source**, and explicitly non-parallel to another original source; (2) repaired `منهجهم أخباريّ` from “predominantly Akhbārī” to “is Akhbārī”; (3) repaired `لا دور للقرآن` from “no effective role” to “no role” outside the stated conflict situation. These are targeted source-faithful changes, not a new whole-book source review.
- Google Docs mutation reply counts: **1, 1, 1**. Final accepted document revision immediately after those edits: `AHj4eMRFIAfJ5pfOEuCf2Bhmn-gbAKr2H0IGHTTJULxe0HomRX8XQXGFd-7Z4Qxl5xxu04GwZVhIwqu5c96v7o5NI9aypV9l8spwh7SoV_w`. Subsequent Doc revisions must be read afresh; that revision is **not** a frozen lock.
- New exact-revision fresh native Google Docs PDF export SHA-256: `0d74868807bb1c69f7947dfd0374540152c57b5c666c7e53f9933852258d5fc4`. **470 pages**.
- New page-numbered editorial **PDF derivative**, with actual native text unchanged outside the existing TOC: `Fiqh_al_Aqidah_Faithful_Editorial_Proof_2026-10-15.pdf`, SHA-256 `93f6e1d4fd0f8ae723b0bd2e4e7544d1a0639159662777788b315a596844fe37`, **470 pages**. Automated source-vs-proof validation: **283/283** black Amiri TOC number labels matched **283 existing native TOC target destinations**; **317** clickable links and **284** outline items remain. All-page scripted tests: no text-empty pages, no text spans outside PDF bounds, no U+FFFD, no Arabic alphabetic spans, no blue text spans, no unexpected font families, no non-TOC text mutation in the derived PDF.
- A 14-page-sample visual contact montage was inspected, representing beginning, TOC, sections, dense notes, and bibliography. **470-page full-resolution inspection is still NOT complete.**
- The Google Docs native TOC still has linkable entries but lacks its own displayed page numbers. The PDF-stamped numeric overlay **must not be mistaken for native TOC refresh or publish-ready evidence**.
- Questions Doc `1x9Q2V_vtWwwDF_BU3QFSqhnjpceOcl9c9J8rUOUCkwk` was appended with the exact three source-correlated corrections and revised proof checksum. Retain as the separate living source/question ledger.
- OPEN: independently source-check remaining pages/semantic ambiguities, exact native TOC terminal stabilization, whole-edition high-resolution visual proof, live Workbench English Doc link + production security/QA state, genuine human scholarly review/approval, and final hosted published PDF. None may be marked done from this proof.

## 2026-10-15 — Live Workbench link fixed; latest proof reconfirmed

- **Live integration SUCCESS:** The Workbench project #95 English Book URL is now the correct original full-length manuscript, `https://docs.google.com/document/d/1jMkWQfto0obfAQltSZ6Mi-YJex0-ywuzh9K-UeuhZJE/edit`. GitHub self-hosted job `38816446365` **passed**, logging `FIQH_LINK_VERIFIED project=95 status=review verified_pages=408`. A separate live Cloudflare D1 `translation-context` GET confirmed the same exact link and unchanged `408/408` and status `review` (**Needs Formatting**, not Human Needs Review). TLS cause repaired without disabling verification: the Mac runner's Python 3.14 `urllib` lacked a local CA bundle; platform `curl` used the trusted system CA store. Repair commit: `fe046a19b91af3a89ed39f48b66fee7aa7bd8eeb`.
- Workbench `/api/projects/95/integrity` still reports **0 QA receipts, 0/408 receipt-covered pages, no whole-book receipt, and no human review attestation**; `/api/health` still says `UNPROTECTED_LEGACY` / `LEGACY_MARKER_ONLY`. These are separate blockers. Do not treat the source-review handoff as a synthesized QA receipt or a human approval.
- A **fresh Google Docs export** was verified at **470 pages**, `4,115,649` bytes, SHA-256 `0bee691e2ab21d9765fa00779b86abae345cef0569070ee0aaf21f973827e7f1`. The downstream print proof with all **283 destination-matched visible TOC page numbers** was regenerated from those exact bytes: `Fiqh_al_Aqidah_Faithful_Editorial_Proof_2026-10-15.pdf`, `4,402,088` bytes, SHA-256 `422ce65d1a08522ea3792cc59e77a574309f38a564306f98c3fd5c50995e4eb3`. Validated **317 preserved TOC links**, **284 outline entries**, zero text-empty/thin pages, zero out-of-bounds text spans, zero U+FFFD replacement text, zero unintended Arabic alphabetic text, zero blue TOC spans, and **zero PDF-check errors**. The print proof only alters the TOC numerals; it does not alter body or footnote text.
- **TOC browser access discovery:** A read-only Safari/WebKit probe of the owner's safety copy redirected to Google sign-in because the safety copy is **restricted**. The original actual manuscript opened correctly in anonymous WebKit on self-hosted Mac. Its editor controls were inspectable; however the first read-only probe did **not** locate a TOC-specific page-number option or mutate the manuscript. WebKit successful probe run `38817092385`; follow-up native TOC **page-number mode** and terminal refresh remain OPEN. Use WebKit, not Chrome, under the founder browser preference. Never delete and recreate the source's 283-entry native TOC as a substitute.
- An additional focused current-turn **Arabic source OCR-to-English spot check** on canonical-source physical PDF pages **20–24** found the source argument/section sequence and corresponding English passages present in the 470-page proof, with no obvious major omissions on that limited sample. This is a **sample check**, not a scholarly certification of all 408 pages or a replacement for independent review.
- A different review authority must complete source fidelity across the entire final revision, all-page *full-resolution* visual and native-footnote inspection, native TOC fixed point, Questions/evidence receipts, **Zahraa's actual human review**, public final PDF export/hosting and downstream publication. Do not change `review` → `completed` or publish before those gates.

## 2026-10-15 — WebKit TOC probe and immutable 470-page proof

- [Safe editor discovery run](https://github.com/mohalizahraa/operator-translation/actions/runs/38817704597) **succeeded** using WebKit without Chrome. The main anyone-writer Google Doc opens anonymously, and three virtualized Google Docs pages were inspected using non-text-changing pointer actions. No native TOC-specific page-number or refresh control was exposed to the tested safe DOM selectors; **no TOC modification was attempted or claimed**. The separate original safety copy is restricted and redirects an anonymous browser to Google sign-in; do not treat it as the public edition.
- Multiple changes to the shared container's generic export/proof filenames were detected during this turn, indicative of concurrent work. A specific **immutable review snapshot** was therefore frozen as `Fiqh_Aqidah_470p_Snapshot_494d7430477b.pdf` (470 pages, SHA-256 `494d7430477b29025f6131bec9bd42cde0d18e1fad32d9ea85e4bacf87b84bfa`). Automated review of this exact frozen file: **283/283 visible TOC numbers matched their link destinations**, 317 active internal TOC links, 284 outlines, only Amiri and Scheherazade New font families; 0 blank/thin pages, 0 out-of-bounds text spans, 0 U+FFFD, 0 default-blue spans. This is a review proof, not a final book or a revision-immutable published edition.
- Review of Arabic-source OCR witness physical pages 20–24 against the corresponding English PDF excerpts found the relevant sections and quoted concepts intact at the limited spot-check level; no universal scholarly accuracy claim follows from five sample pages.
- **Still open**: native editable Google Docs TOC page-number mode/terminal refresh after layout freeze, independent whole-book source-meaning and all-page high-resolution QA, revision-tied whole-book QA receipts, the actual human reviewer signoff, security/QA Cloudflare activation, publication approval and final public English PDF.

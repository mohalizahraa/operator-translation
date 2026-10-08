# Workbench project 10 — translation coverage completed; publication formatting OPEN

Date: 2026-10-08. Scope: **The Religious Marjaʿ Sayyid Kamal al-Ḥaydarī: A Sketch of His Life, Method, and Reformist Project**, physical Arabic PDF pages 1–296.

## Authoritative live owners

- Workbench project: https://haydari-translation-workbench.pages.dev/api/projects/10/translation-context
- Source PDF route: https://haydari-translation-workbench.pages.dev/api/pdf/10
- Canonical source PDF SHA-256: `9bbce780ac632450301060024d5ab32c4fc7c5b4cc0406ebac87a93ff8c4c901`
- Current English manuscript (mutate this existing target): https://docs.google.com/document/d/1iiiuDLR_NV8mUjg4RMTxZRgt94l5w3masRqPQJZtsog/edit
- Recovery archive of 296-page draft before intensive note migration: https://docs.google.com/document/d/1p4VbX9DOdmuiM-QRhjh3hTTWyrmF_1I-e2Rgl-pTiIc/edit
- Current manuscript verification revision (last readback): `ANLCKQlAElV4F0RBLyupNxgEp3Dr96fxETyT6DyzoMmqMraV-5MZVjwc4elEfJae4PqG87BMIQSvuefjjgYVFH1szEOi5ZQe2rBvKvfbXps` (re-check live; Google revisions change with every edit).

## Completed, evidence-backed

1. Previous target ended at physical page 250; continuation rendered from original Arabic PDF and supplied the English manuscript for physical source pages 251–296, including essays, lecture list, printed works, dedication poems, and ten pages of the source's table of contents.
2. Manuscript exact parser/readback shows **296 distinct `⟦SOURCE PDF PAGE n OF 296⟧` markers**, no duplicate/missing source pages, one `⟦WBPROGRESS:10:296:296⟧` marker, and no `[[NEXT_BATCH]]` sentinel.
3. Live Workbench confirmed `stored_translated_pages=296`, `live_marker_pages=296`, `status=review`, progress state `synchronized-or-d1-only`. This proves page-coverage tracking, **not final publication acceptance**.
4. Major manuscript typography and outline improvements applied: normal text 14-pt Amiri, tightened to 0-pt above/4-pt below and 115% line spacing; 13 native H1, 28 H2, 106 H3, 10 H4 plus TITLE/SUBTITLE. The 297 source/progress labels are visually de-emphasized in small gray text. All 189 recognized legacy body-flow note paragraphs received consistent 10-pt Amiri / 0-pt vertical spacing. They have **not** become real native footnotes.
5. Direct Arabic-image spot check caught and fixed at least 16 content omissions/misattributions in pages 263, 274–279, including dropped bibliography entries, volume counts, author names, and a mistaken paragraph about the impact of unspecialized doctrinal debate. **Do not infer a book-wide semantic QA pass from spot corrections.**
6. Source PDF was successfully recovered using the existing public-repo `mohalizahraa/Website-Source` branch `workbench` workflow `.github/workflows/workbench-source-fetch.yml` and `workbench/source-access-request.txt`, triggering run 37845197968 (successful); archive artifact source is not the long-term owner. The live Workbench PDF is the authority.

## Open publication-format gates (not complete)

- **Real native footnotes: ZERO.** The manuscript still has approximately **189 recognized simulated note paragraphs** in body flow and **103 editorial placeholder/scaffold phrases** about pending native notes. Migration requires identifying the *correct note reference/callout in the actual Arabic PDF*, creating/populating the native Google Doc footnote at that correct body position, verifying the note, and only then removing its old body-flow copy. Do not mechanically attach each note to the paragraph immediately preceding the simulated note: physical source p.12 demonstrates that a note printed at the page bottom belongs to an earlier prose paragraph, not the paragraph directly above its English simulated note.
- **Target-native English TOC: ABSENT.** The source's contents were translated on source pages 287–296 at the end of the English manuscript; that is a source-content witness, not a built-in, navigable Google Docs TOC from the English edition's headings. Native Google Docs API does not expose a direct TOC-insertion batch request; do not falsely certify a manually typed list as a native TOC. Find an authorized $0 route to native generation/refresh, or escalate exact host capability limitation while keeping the gate OPEN.
- **Full fidelity QA: OPEN.** The 46 new pages were sourced from original PDF rendered images with noisy OCR plus visual checks, followed by limited spot corrections. Need a deliberate full-surface Arabic↔English comparison (especially verse, all bibliography entries, Arabic source notes), speaker/attribution check, and no missing lines.
- **Final rendered-page QA: OPEN.** Do not certify chapter-opening pagination, H2 page breaks, absence of blank interstitial pages, footnotes at page bottoms, native TOC pagination, and complete Translator Profile v2 until PDF export and visual inspection.
- Keep Workbench in `review` until formatting/review gates genuinely pass; **do not mark Completed or Published** yet.

## Safe next action

Fresh-load canonical `mohalizahraa/operator-protocol/AGENTS.md` and routed Arabic translation, execution, assurance, knowledge, communication, and reconciliation owners. Read Workbench project 10 live and the exact current manuscript before any mutations. Pilot one source-anchored native footnote end-to-end (creation, content, normalization, deletion of corresponding legacy paragraph, readback and rendered check), then use that proven method across all notes with exact source anchor ownership; follow with target-native TOC generation and rendered fixed-point QA. Preserve this file as a **handoff/status projection, not an override of the source PDF, Workbench, or Google Doc**. No paid compute, paid browser metering, or unnecessary copies.

# Translated-book quality audit — 2026-10-11

**Scope:** The 21 books whose *live* Haydari Translation Workbench status is review/completed/published as of the 2026-10-11 retrieval, **excluding book 3 Repentance** as the founder explicitly requested. No other catalogue books were assumed translated. Audited 20 linked English Google Docs through authenticated native Docs readback; book 95 had no linked English Doc. Reviewed 21 live `/api/projects/:id/integrity` responses. This is a **structural and operational audit in progress, not a whole-book Arabic semantic certification**.

## Global evidence-backed accounting

- Catalogue: 176 projects; within scope: **21 books** = 16 `review`, 2 `completed`, 3 `published` (excluding Repentance). **20/21 linked manuscripts inspected**, 1 missing link.
- **12/20 accessible documents have no native `tableOfContents` structural element**, despite the universal native English TOC requirement. The other eight have a native element, but their pagination/style/fixed-point quality has *not* been verified by final rendered-PDF comparison.
- **Eight native footnote containers with no text** in two Docs: book 5 has seven and book 156 has one. These require source-note and anchor reconciliation, not blind marker deletion.
- **Five body-flow paragraphs begin with `Note:`**: books 8 (2), 11 (1), 43 (2). These are migration candidates, not proven source notes, pending original Arabic positioning.
- Body Arabic-script scan: book 133 had 69 Arabic-containing paragraphs (64 predominantly Arabic and five mixed; 63/64 predominantly Arabic paragraphs are immediately followed by a Latin-script English paragraph); other residual localized spans were observed in books 11,118,119,134,156,169. **Do not report book 133 as 69 untranslated paragraphs:** the majority appear to have paired English translations; treat as English-only cleanup and source fidelity comparison. Foreign-script characters in editorial witness notes/URLs of book 11 cannot be indiscriminately deleted.
- Some large direct-style scan deviations may reflect host-inherited named styles or legitimate semantic exceptions. **Do not label every missing explicit `fontSize`, `lineSpacing`, or indent attribute as a confirmed formatting defect without effective-style/render inspection.**
- **0/21 live integrity endpoints report a QA receipt; 0/21 have a whole-book QA receipt; 0/21 report a human review attestation.** All 21 report `qa_gate:legacy` and `editor_protection:unprotected_legacy`. Three books are nevertheless marked Published. This is a publication-evidence gap, *not proof that prior humans did no review.*
- The live book 11 record says `translated_pages=298/298` but its detailed note explicitly documents source-verified consecutive physical pages **230/298**, with **68 remaining**. Manuscript includes `CONTENTS — INCOMPLETE DRAFT`, preliminary source-witness notices and no native TOC. This inconsistency requires source-aware correction of proof/progress, never invented evidence or an unverified counter reset.
- One post-edit exact Google Docs PDF export of book 78, Google Doc titled `REAL SCALE 2`, yielded **404 English-layout pages** with a PDF outline but **no native Docs TOC**; page 404 visually displayed a missing glyph/square after `infallible`. PDF text extraction contained a NUL in that span. This is a **confirmed rendered-glyph defect**, not mere extractor conjecture. Full-page visual and semantic review of any book was **not** completed.

## Per-book QA disposition

| Workbench ID | English title (abbreviated) | Live status | Native TOC in linked Doc | Specific open QA / next action |
|---|---|---|---|---|
| 1 | Infallibility of the Prophets | review | YES | Entire Arabic source fidelity, native TOC styling/pagination, notes and full-page render not certified |
| 2 | Prophetic Measures | review | YES | Full source→target collation, 700 native notes and final layout checks open |
| 4 | Supplication | completed | YES | Whole-book fidelity/render/TOC fixed-point and independent human proof absent from live ledger |
| 5 | Seeking Intercession | review | YES | **7 empty native footnote containers**; verify source/anchors and repair |
| 6 | Attributes of the Servants | review | YES | Body contains a temporary `WBPROGRESS` marker; normalize only after checkpoint/evidence preservation; unusually many blank paragraphs require visual investigation |
| 7 | Jurisprudential Renewal | completed | YES | Full source/footnote/render and TOC fixed-point evidence missing |
| 8 | Jurisprudence of Fasting | review | YES | Two `Note:` body-flow paragraphs require source-position check and native-footnote migration if applicable |
| 9 | Tabatabai biography | review | **NO** | Build/refresh native English TOC from source-verified native heading hierarchy |
| 10 | Religious Marja biography | review | **NO** | Repeated `SOURCE PDF PAGE` working markers; preserve source map separately before publication cleanup |
| 11 | Rites of Hajj | review | **NO** | **230/298 source-verified in notes vs 298/298 dashboard**, draft contents, witness notices, source-collation/notes/TOC unresolved |
| 43 | Junctures in Reform | published | **NO** | Two `Note:` prose blocks to crosswalk; published designation lacks formal QA receipt |
| 47 | Hadith-Centered to Quran-Centered | review | YES | Full source fidelity and formatting/render QA not established |
| 78 | Criterion for Correcting Hadith Legacy | published | **NO** | 404-page PDF render exposes missing honorific glyph, footnote/heading/page QA not certified |
| 95 | Jurisprudence of Creed | review | **UNINSPECTED** | **No linked English Book Google Doc** despite 408/408 verified-page marker; identify target before QA |
| 118 | Introduction to Imamate | review | **NO** | Source/TOC and residual note-script cleanup; no verified-page count despite translator completion report |
| 119 | Methods of Researching Imamate | review | **NO** | Source/TOC QA; no verified-page count despite translation claim |
| 125 | Study on Imamate | published | **NO** | Published but zero QA receipts, no human attestation and no native TOC |
| 133 | Methodological Priorities | review | **NO** | 64 Arabic-predominant paragraphs (63 with adjacent English), five mixed; compare pairwise against authoritative Arabic before English-only cleanup |
| 134 | Preservation of the Quran | review | **NO** | Source, note, verse reference and TOC check |
| 156 | Introduction to Ethics | review | **NO** | **One empty native footnote**; source reconciliation/TOC needed |
| 169 | Philosophy of Religion | review | **NO** | Remaining Arabic-script material in footnotes and source-aware TOC/verse QA |

## In-place verified corrections made during this audit

The following six bounded replacements were written to the original linked Google Docs and **read back successfully on a new revision**, without asserting whole-book approval:

1. Book 78: title text typo `Evauluating` → `Evaluating`.
2. Book 156: phrase `its signs and آثار` → `its signs and traces`.
3. Book 169: Qurʾanic translation phrase `left more آثار upon the earth` → `left more traces upon the earth`.
4. Book 78 note: `(اللوك)` → `(al-lawk)`.
5. Book 78 note: Arabic expression `«ما عدا مما بدا؟»` → transliteration `«Mā ʿadā mimmā badā?»`; existing English meaning was preserved.
6. Book 78 note: undeciphered source-note numerals `“ص ٦ ١٣”` → non-committal Latin-script `“p. 6 13”` with existing uncertainty annotation retained.

**No Workbench progress/status/published flag was changed**; these edits do not justify changing stage or page counters. Book 118's contemplated root-notation substitution was **not** applied because the exact string failed guarded readback match.

## Required continuation and acceptance

1. Resolve book 95's missing manuscript, and confirm Arabic-PDF source/edition hash and exact revision for every book.
2. Source-collate **every material source unit** against authoritative Arabic (body, verse, note, chapter, table, front matter, appendices); correct actual meaning errors and unresolved questions; no sampling masquerading as full review.
3. Fix verified defects with source/target maps: simulated/empty note containers, leftover working markers, English-only unpaired Arabic, semantic headings, native chapter/major-section breaks, body/list indentation, sacral glyph font/size and rendering; keep original source untouched.
4. Create/refine the **12 missing native English TOCs** using the authorized zero-additional-cost native editor route; verify all native TOCs after a stable final layout and their black Amiri presentation.
5. Render and review **all final pages** and PDF text layer of each exact candidate, including notes, glyphs, headers/footers and source page references. Bind findings to exact revisions.
6. Issue actual revision-bound, independently checked Workbench QA evidence receipts only after performing the work; preserve counter and security gaps without fabricating prior proof. Human review remains separately human-owned; do not impersonate it.
7. Then reconcile and read back live Workbench statuses/progress. Never classify a book publication-ready solely from a `review`, `completed`, or `published` label.

This evidence ledger is **OPEN** and is intentionally not a certificate of top-tier translation. Subsequent agents should continue the 21-book work graph rather than restart discovery or lose books from scope. The current universal Operator translation profiles and `workbench/AGENTS.md`, `TRANSLATION-WORKFLOW.md`, `README.md`, and `SECURITY-AND-QUALITY-ROLLOUT.md` remain authoritative; this file is inspection evidence, not a new quality policy.

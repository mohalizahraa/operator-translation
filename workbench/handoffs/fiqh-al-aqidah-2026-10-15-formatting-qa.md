# Fiqh al-ʿAqīdah — Formatting & PDF QA checkpoint (2026-10-15)

**Not certified or published.** This supersedes earlier 455-page print-QA metrics, without erasing their history.

## Source and target
- Workbench: project 95, book-88, Arabic source SHA-256 `6aea809d2d02bbbf3ce367c005d34fc8d57c04c266548f2d2215be2679d3fb03`, 408 physical pages, 408/408 stored progress; status `review` means **Needs Formatting**, not human review.
- Recovered full English working manuscript: https://docs.google.com/document/d/1jMkWQfto0obfAQltSZ6Mi-YJex0-ywuzh9K-UeuhZJE/edit . Its existing native TOC and 511 footnotes are preserved.
- Separate safety copy made before the current formatting changes: https://docs.google.com/document/d/1VFPO5MKAqqcCVq7FRL11BIrnJOnx0DQpgBg9Il9Ux0g/edit .
- The historic source-review handoff describes source comparison to Arabic physical page 408. This pass does not independently repeat it.

## Exact completed repairs
1. Verified two redundant blank-page causes on a safety copy, then applied same Google Docs native paragraph-style fixes to the actual manuscript. Native PDF export has no blank pages.
2. Styled the actual **native TOC** to remove all blue and underlined text while preserving its 283 heading entries and linked navigation. Native Amiri font was restored throughout, with Scheherazade New scoped only to sacred glyphs as needed.
3. Verified **zero remaining explicitly 8 pt sacred-glyph runs in ordinary body or footnote text**; the native document still has 511 footnotes. Existing display/heading size classes were preserved.
4. Verified public Google Doc access has an `anyone/writer` permission. **Workbench D1 English Book URL still read as null** at the last verified check; a GitHub self-hosted workflow being present is not evidence of an executed mutation.

## Revision-bound PDF QA
- Native Google Docs PDF snapshot: **463 pages**, **4,104,389 bytes**, SHA-256 `392e263b5e10943965e5fe6c577ec812b9358f0ea57d85102fdc153328a530a5`.
- Reading proof derived from that exact PDF (PDF-only page-number overlay): **463 pages**, **4,391,349 bytes**, SHA-256 `ac38afd2f7f304b01314fec8acfd3486f9353c80a897f654d35e0f60d3ced815`.
- All **283** native TOC heading destinations were mapped to their exact current PDF physical page numbers and stamped into the reading proof. Verified **283/283** correctly aligned; **0** text collisions. All **317** clickable internal hyperlinks were preserved.
- Programmatic full-PDF scan: **0** blank pages, **0** out-of-bounds text spans, **0** default-blue spans, **0** replacement glyphs, **0** Arabic script letters in the selectable layer; **284** PDF bookmarks; embedded Amiri and Scheherazade New.
- Rendered contact sheets covering all 463 pages at low resolution and inspected selected sheets/full-size TOC pages. Four unusual low-density body pages (52, 111, 326, 445) contained legitimate contextual text, not blank filler.
- The **editable Google Doc's** native TOC does **not** yet have visible native page numbers; PDF-only page numbers are a *review-proof enhancement*, not an assertion that Google Docs pagination is refreshed.

## Integrity/concurrent work
A later native text correction was rejected by `requiredRevisionId` because the live manuscript had concurrently advanced. **No conflicting write was applied**; inspect current revision before further edits and never overwrite another worker's changes.

## Pending gates
- Interactive native Google Docs TOC variant/page-number refresh and re-normalization if it resets font/color, plus fixed-point validation on the current, newly revised manuscript.
- Whole-edition **full-resolution** rendered page and footnote-flow inspection, plus final scholarly/terminology/source checks as required.
- Workbench English Book URL D1 readback, then strictly distinct QA/human review, PDF public access, English PDF linking, and publication. Do not publish the review proof as a final edition.

Last source/target evidence is retained in prior handoffs. This checkpoint is an outcome and blocker ledger, not a replacement for the original full English manuscript or authoritative Arabic.

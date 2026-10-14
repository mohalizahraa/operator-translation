# Mohammed book translation / English PDF delivery — current continuation

Status: ACTIVE / NOT COMPLETE. 2026-10-13 EDT user instruction: translate the rest of Mohammed's assigned books and attach each finished English PDF link to the Workbench. Next turn: "Just go." The authoritative source is the **live** Workbench state and source PDF, not these historical counts.

## Scope and live queue checked 2026-10-14 UTC

Production: https://haydari-translation-workbench.pages.dev
Projects API: https://haydari-translation-workbench.pages.dev/api/projects
The ten direct Mohammed assignments currently marked `not_started`, in Workbench API order:

| ID | English title | Verified source PDF physical pages | 2026-10-14 live status |
| --- | --- | ---: | --- |
| 12 | The Ethics of Ḥajj and Visitation | 486 | Not Started; 0/486 |
| 50 | Truthfulness: Perspectives on Its Concept, Domains, and Outcomes | 411 | Not Started; 0/411 |
| 79 | Reforming the Soul | 352 | Not Started; 0/352 |
| 80 | Our Ethics | 289 | Not Started; 0/289 |
| 88 | Tawḥīd: Analytical Studies in Its Levels and Implications, vol. 2 | 559 | Not Started; 0/559 |
| 89 | Tawḥīd: Analytical Studies in Its Levels and Implications, vol. 1 | 528 | Not Started; 0/528 |
| 99 | The Resurrection: A Qurʾānic Vision, vol. 2 | 467 | Not Started; 0/467 |
| 100 | The Resurrection: A Qurʾānic Vision, vol. 1 | 476 | Not Started; 0/476 |
| 106 | The Spirituality of Acts of Worship | 231 | Not Started; 0/231 |
| 107 | The Path of the Righteous: Fatwas of Sayyid Kamāl al-Ḥaydarī | 574 | Not Started; 0/574 |

Total not-yet-source-verified physical pages for this queue: **4,373**.

A separate book #90 (*The Ḥadīth Legacy*) is assigned `Both`; preserve as separately scoped, not silently count as a direct Mohammed assignment. Seven other Mohammed-assigned records are already at `review` (= **Needs Formatting** in the actual Workbench model, NOT Needs Review), and three are at `published` (= **Publish Ready**, not independent proof of publicly released PDF). Record #95 (*The Jurisprudence of Creed*) shows 408/408 and Needs Formatting but **no linked English Google Doc**; reconcile it rather than invent a missing deliverable.

## Active book #12 exact checkpoint

- Context API: https://haydari-translation-workbench.pages.dev/api/projects/12/translation-context
- Canonical source accessible through: https://haydari-translation-workbench.pages.dev/api/pdf/12
- Canonical physical source PDF: 486 pages, URL recorded by the context API. The exact source SHA-256 has **not** been established in the retrieved context; do not invent it.
- The official archive PDF has a broken text extraction/glyph mapping. Direct public PDF retrieval and visual-page screenshot were not available from the current tool runtime. Source-page OCR/recovery against the exact PDF is needed before claiming page fidelity. The host PDF is already known, so use the project-authorized PDFKit/Vision route on a permitted machine if and when it can be run.
- Created live working English Google Doc: https://docs.google.com/document/d/1J4rtQ0t9bN57FG-AclGCENPbOSyGXGn0NzYkhvMGhUo/edit
- Contents currently present: English title/frontmatter based on readable source-cover and official catalogue evidence, plus provisional translation of three source-page-5 Qurʾanic quotations. These are **not** a complete source page. The remainder of source page 5, its notes, other front matter, and every later source page still need full fidelity review. REAL SCALE v3 has only partial cover/verse styling, not a complete formatting pass.
- **Verified translation checkpoint remains 0/486**. No valid new source-page QA receipt. Live Workbench status still `not_started`; no false counter updates or stage changes made.
- Google Drive metadata for this new Doc reported **owner-only access** (`shared=false`), not required Anyone-with-link Editor. The available Drive connector does not provide the required global-anyone writer sharing operation. **Do not attach this restricted Doc as the Workbench English Book until that permission is actually set and verified.** This is a real external capability/permission block, not a founder-choice question.

## Separate English PDF website delivery

- Production Workbench originally tracked only `google_doc_url`, not a separate PDF link.
- Created PR #12: https://github.com/mohalizahraa/operator-translation/pull/12
- Branch: `workbench/english-pdf-delivery-20261013`
- Changes: add `english_pdf_url` to D1/schema and mutation path, editable field in project dialog, conditional English PDF action in per-book cards alongside English Book, README contract, asset cache version and regression checks.
- Cloudflare Pages **branch preview deployment succeeded**. GitHub Workbench acceptance `verify` was **queued** on a zero-paid self-hosted Mac runner as of last check, not green. Keep PR open; do not claim production deployment or merge red/untested work. Recheck the exact HEAD SHA `8d86e1d78e4987303a423d5a896e49448897d24e`.
- **No new English PDF was produced or attached.** A valid link requires a finalized English PDF and verified anonymous Viewer access, not merely a Word/Google Doc or provisional draft. Verify exact artifact, permissions, render and text layer before linking.
- Live production API health on latest check: `write_protection=UNPROTECTED_LEGACY`, `quality_gate=LEGACY_MARKER_ONLY`; code quality safeguards do not establish production security. Avoid unverified mutation claims.

## Next admissible actions

1. Start from live `/api/projects/12/translation-context`; ensure source/hash and exact working Doc ID agree. Recover the 486-page source reliably via the project-authorized OCR/extraction route. Preserve a page-aligned source map and all notes; do **not** commit original book content, images or bulk OCR to Git.
2. Translate coherent source-page batches for book #12, line-by-line and notes included. Use the established Arabic translation profile and REAL SCALE v3 in the first applicable pass, independently challenge fidelity, read back the actual target, then advance source-relative verified progress **only** after genuine QA and Workbench D1 readback. Do not switch content between books until the active book's accepted translation/formatting gates close.
3. Repair/verify required Anyone-with-link Editor permissions for the working Doc, attach as the live English Book only after recipient readback, then update the actual Workbench stage accurately. If sharing cannot be changed from the current connector, preserve the blocker and do not link privately.
4. When the self-hosted Workbench acceptance reaches success, recheck branch PR #12 for conflicts, merge only after genuine code/test/product checks, and verify live Cloudflare production and D1 migration. Publish real English PDF links for each subsequently finalized edition and verify anonymous Viewer access.
5. Repeat for the remaining direct Mohammed books; separately reconcile #95 missing manuscript link and the older Needs Formatting / Publish Ready records without overwriting Mohammed's work.

## Do not overclaim

- Cover and three quotations drafted ≠ a source page translated.
- Google Doc created ≠ shared, linked or PDF created.
- Cloudflare branch preview deployed ≠ production deployment.
- CI queued ≠ passing.
- `review` legacy status means **Needs Formatting** in the actual current UI. `published` code-stage means **Publish Ready**; the separate `published_at` determines actual publication.
- User expressly wants both exceptional translation quality and the finished English PDFs discoverable on the Workbench; do not weaken either.

# Arabic Book Translation — Execution Substrate

## 6. Choose the editing substrate before scaling

For long structured translations, **translation quality** and **document-mutation reliability** are separate problems. Before substantial mutation, compare the viable execution architectures rather than defaulting to the first editing primitive that happens to work on a heading or paragraph.

Evaluate materially live approaches—such as direct native API editing versus a stable structured interchange format such as DOCX—on at least:

- **structure preservation** — can it retain notes, tables, links, styles, objects, headers/footers, and semantic hierarchy?
- **deterministic targeting** — can the intended source unit be mapped to exactly one target unit without fragile string matching?
- **reversibility / rollback** — can failed transformation be discarded or reverted without harming the authoritative source?
- **scalability** — does the method remain tractable for the whole book rather than only a few clean paragraphs?
- **verifiability** — can coverage, mutations, residual Arabic, and structural integrity be audited end to end?

Prefer the simplest architecture that passes these criteria. Do not keep patching a weak architecture merely because work has already been invested in it.

### 6.1 Run a hostile-case pilot before whole-book execution

Before scaling a method across a long work, prove it on a small representative set that includes the difficult structures actually present in the book. As applicable, test:

- an ordinary body paragraph;
- a paragraph containing mixed formatting and an inline footnote/note anchor;
- a footnote/endnote;
- a chapter heading and/or TOC entry;
- a table cell;
- a header/footer or running head;
- a hyperlink/cross-reference/caption or another nontrivial inline object.

Verify both semantic output and structure after the pilot. Confirm that the Arabic source remains untouched.

If the pilot or later execution produces **partial replacements, zero-match edits, fragmented English, accumulating manual patches, unclear source→target mapping, or repeated structural damage**, stop scaling that route. Diagnose the shared cause and re-select the editing substrate. Do not layer another helper/workaround on top of a structurally unreliable process merely to preserve momentum.

### 6.2 Preferred Google Docs / DOCX strategy

For Google Docs, direct Docs API editing is appropriate when exact document indexes, segment identifiers, and structural reads provide deterministic targeting across the relevant body, notes, tables, headers/footers, and other segments, and each mutation can be verified reliably.

For book-length work where Google Docs' internal segmentation makes paragraph-level translation brittle, prefer this pipeline:

1. export the untouched authoritative Arabic source as **DOCX**;
2. translate the DOCX **structurally**, preserving the OOXML package relationships and formatting-bearing structure;
3. process body text, tables, footnotes/endnotes, headers/footers, captions, and other text-bearing parts in place;
4. run automated coverage, structure, and zero-Arabic QA on the resulting DOCX;
5. import the verified English DOCX as a **new Google Doc**;
6. use the Google Docs API only for final host-specific cleanup such as LTR direction, fonts, alignment, indentation, spacing, or other rendering normalization that is safer to perform natively.

When processing DOCX, treat the **logical paragraph/note/cell** as the translation unit while preserving its internal runs, bookmarks, links, note references, inline objects, and style relationships. Do not independently translate every run merely because the format stores a sentence across multiple runs; that produces fragmented English and can corrupt inline structure.

A temporary Sheet, `GOOGLETRANSLATE()` helper, or other bulk bridge is **not** the core translation substrate when it weakens source-unit mapping, terminology control, or structural verification. Such a helper is acceptable only when mapping back to the structured target is deterministic and independently verified. Otherwise, retire it rather than turning it into another layer of patchwork.

### 6.3 Guard direct live-native mutation

For Google Docs, DOCX, or other structured formats, the rendered/extracted text may not be byte-identical to the editable native representation. Footnote anchors, inline objects, smart punctuation, hidden runs, and segmented document structures can make a visually identical string fail an exact replacement.

Therefore, when using direct live-native edits:

1. inspect the live target structure before mutation;
2. use exact current target text/indices/segment identifiers when available rather than assuming an exported extraction is the mutation key;
3. treat body, tables, notes, headers/footers, and other segmented text regions independently when the host does;
4. use batch replacement only when the key is actually present and the operation preserves the relevant structure;
5. inspect returned occurrence/change counts;
6. treat a zero-match replacement as **no translation performed**, not as successful progress;
7. after a batch, re-read the mutated target and confirm the expected text changed before advancing.

For long works, translate in coherent sections/chunks and checkpoint coverage so a skipped surface or failed mutation cannot disappear inside a large completion claim.

### 6.4 Serialize multi-book translation; synchronize verified page progress live

When one translation program contains multiple books, **do the actual translation work one book at a time unless the user explicitly authorizes interleaving**. The default is:

> **finish the current book's source→target translation/formatting/QA sequence before beginning translation content from the next book.**

This is a contamination-control rule, not a ban on efficient setup.

- **Mechanical preparation may span the corpus** when mapping is deterministic: create target Docs, resolve source PDFs, establish permissions, attach exact source↔target identifiers, configure progress fields, and prepare tracking infrastructure.
- **Do not interleave translation content across books by default.** Do not alternate source-page batches between different books merely to increase apparent concurrency. This reduces cross-book passage mixing, footnote/citation contamination, terminology leakage, wrong-document writes, and page-counter drift.
- Within the active book, work in coherent source-page batches sized for reliable source reading, mutation, and QA. A batch boundary is a checkpoint, not a reason to switch books.
- Preserve an explicit active-book identity at every mutation: source artifact/book ID, target document ID, source-page range, and current verified source-page denominator. If any one of those is ambiguous, stop before writing.
- A book may move to the next book only after its required translation-text scope is complete and the applicable formatting/structural QA state has been recorded. Publication-ready review may remain a distinct later gate where the project separates translation completion from publication review.

When the translation project designates a **live website/dashboard/status surface** as its progress tracker, treat that surface as an active translation-project artifact, not a passive afterthought. Keep its translation-relevant project records, links, assignments, status/progress fields, and presentation behavior synchronized with verified project truth as those facts change. When the tracker implementation lives in a translator-accessible project repository (for example the Haydari Translation Workbench under `operator-translation/workbench/`), ordinary authorized translation work includes maintaining that implementation/data surface when needed for the workflow; do not require separate hosting-provider access for repository-level website tweaks when repository commits are the deployment path. Hosting/account administration remains a separate authorization boundary.

Treat progress publication as part of the batch commit:

1. translate the source-page batch into the correct target;
2. read back the target mutation and run the batch's required structural/rendered checks;
3. compute progress from **physical pages of the authoritative source PDF** (for example `5/131 source pages`), not target-document pages or unverified extracted units;
4. only after those source pages are genuinely translated and verified, update the project's live tracker to the new exact `X/Y` state;
5. verify the live surface readback shows the same book and same count before treating the checkpoint as externally synchronized.

Do **not** advance the live page counter merely because pages were opened, OCR/transcription was attempted, source text was extracted, or a draft batch was written but not verified. Never count unreadable/uncertain pages as translated.

If the live-progress update fails after a verified batch, preserve the exact unsynchronized checkpoint as pending state and repair the tracker before beginning another translation batch where practical. Do not let the public progress surface silently drift behind the actual translation state. A temporary tracker outage is an explicit synchronization blocker/status, not permission to invent or skip progress events.

The live progress surface should make the whole assigned workload legible without visual clutter: untouched assigned books remain visible at `0/Y`, active work shows `X/Y`, and recent verified checkpoints may form a restrained activity feed. Visual presentation is project-owned; the translation invariant is that the displayed count is exact, source-relative, and synchronized with verified work.

### 6.5 Founder public-access lock for book deliverables and Workbench links

For this founder's book-translation workflow, **public access is part of delivery correctness, not an optional sharing step**.

- **Editable English translation Docs:** every Google Doc created/imported for an English book and every Google Doc linked to the Haydari Workbench must be shared as **Anyone with the link → Editor** before the link is attached or the artifact is reported delivered. Specific-user sharing, organization/domain-only sharing, or a link that opens a Request access screen does not qualify.
- **Generated/Drive-hosted book PDFs:** every book PDF created for user-facing delivery/publication must be shared at least as **Anyone with the link → Viewer/Reader** so it opens without sign-in or access approval. If the PDF is accompanied by an editable source Doc, the source Doc still follows the Editor rule above.
- **Verify the permission, do not infer it from the URL.** After create/copy/import/export/upload, read current Drive permission metadata and require an `anyone` permission at the required role before linking or claiming delivery. Copy/import operations can reset sharing and therefore reopen this gate.
- **Workbench linking is conjunctive:** before Operator links an English Book to the Workbench, first verify Drive metadata shows `anyone + writer`; then verify the Workbench/public-recipient path opens without authentication. The Workbench's anonymous reachability probe is a secondary Request-access guard and does **not** substitute for Drive role metadata when Editor permission is required.
- **Existing links encountered during relevant maintenance are in scope:** when auditing or repairing Workbench English-book links, check every currently linked Drive artifact's sharing state and repair any restricted/under-permissioned file when authorized.
- If the available connector/account cannot change or verify the required sharing state, leave the link/delivery blocked and name the permission gap. Do not silently publish a restricted file or call it complete.

This is a standing founder workflow invariant for book translation/delivery and Workbench linking until the founder explicitly changes it.


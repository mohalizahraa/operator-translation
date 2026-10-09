# Workbench book-processing workflow

Status: user-approved execution plan, captured 2026-10-09. This project-owned file survives translation-projection synchronization. The current [Operator router](../AGENTS.md), [Arabic-book profile](../profiles/arabic-book-translation.md), and [Workbench contract](README.md) govern fidelity, formatting, access, progress, and publication. This plan adds scheduling and handoff guidance, not a weaker quality standard.

## Pipeline, not whole-book stage barriers

Prepare the active book once, then overlap source preparation/OCR for upcoming batches with translation of a source-checked batch. Do not require all OCR to finish before translation can begin. Whole-book extraction/OCR is allowed when measured startup costs make it cheaper and it does not delay the first usable batch or required review. Keep the ready queue bounded by downstream capacity; more busy machines are not automatically faster.

Actual translation content stays on one book at a time unless the user explicitly authorizes interleaving. Deterministic mechanical preparation may span books, as the current execution-substrate profile permits. Never trade source fidelity, complete text-surface coverage, or checkpoint verification for throughput.

## Preferred division of work

| Work | Preferred host | Boundary |
| --- | --- | --- |
| Book setup, downloads, page mapping, reusable preparation | Windows | Keep Windows OCR/preparation environments, caches, and large working artifacts on D: by default; preserve exact source identity. |
| Arabic OCR and source-text checking | Mac | Use the selected Mac route after source-fidelity checks; OCR only missing or unreliable text. Preserve notes, reading order, diacritics, and punctuation. |
| Translation drafting | Windows | Translate coherent logical paragraphs/notes/cells with book context and terminology, not isolated storage runs. |
| Source-aligned review, formatting, native document/render checks | Mac | Use the capability the artifact requires; macOS-only PDFKit/Vision work stays on Mac. This is not an automatic second translation or deferred second formatting pass. |
| Manuscript writes and Workbench checkpoint publication | One designated writer | The writer owns the exact target revision, readback, and checkpoint; other machines return batch artifacts rather than concurrently editing the final manuscript. |

These are preferred operational roles, conditional on accessible tools and measured performance, not claims that a second Mac is registered or GitHub jobs are already routed. Translation speed depends on the translation engine and its execution location, not RAM or operating-system names alone. CPU-only independent work may overlap. Any Windows GPU-heavy work still follows [GPU scheduling](runner/GPU-SCHEDULING.md) and the exclusive host lock; two runners do not create two GPUs.

## Prepare and hand off without losing authority

1. Resolve the exact active Workbench project and linked English target through the current fast-start/resume contract. Record the canonical Arabic PDF identity/hash, verified physical-page denominator, target document identity, and verified resume boundary. Do not rediscover or substitute a different source when the context supplies the correct one.
2. Preserve physical PDF page numbers and printed page labels separately. Reuse trustworthy embedded text, native extraction, or an existing aligned OCR/transcript witness before repeating OCR. Such text is an access witness: check it against the canonical Arabic PDF, especially headings, quotations, dense footnotes, and difficult scans. Never guess damaged or omitted text.
3. Cache reusable preparation/OCR by source version, page range, tool/model version, and processing settings. A changed source invalidates affected cached evidence. Keep copyrighted PDFs, page images, extracted book text, private manuscript data, and OCR output out of commits; transfer only the necessary authorized artifacts. No paid APIs or unnecessary external uploads.
4. Each handoff carries project/book identity, source hash, physical page range, target identity, expected target revision/checkpoint, batch status, and unresolved source defects. One manuscript writer serializes edits and rejects stale/wrong-book artifacts. A handoff must not silently retarget the linked English Book or overwrite concurrent work.

## A batch is finished only after verification and live sync

For every coherent source-page batch:

1. Check the Arabic source and translate every applicable text-bearing surface, including notes and quotations, under the current profile. Source review precedes acceptance; no OCR-only page counts.
2. Review the translation against the source and apply **all formatting requirements applicable to that batch in its first pass**. Do not plan a later cleanup pass for already-applicable rules. Book-wide checks remain explicitly open until their full scope is available; repair/recheck as dependencies settle. A translation pass is not accepted while its applicable profile formatting remains incomplete.
3. The designated writer writes to the linked English Book, reads back the actual target, and performs the required semantic, structural, and rendered checks. Retain precise source-to-target coverage and target-state evidence. Drafts, zero-match edits, unreadable pages, and unchecked footnotes are not verified completion.
4. Immediately publish the exact highest **continuously verified physical source page** through the current authorized checkpoint/verified-marker route. Preserve the source hash, physical denominator, expected previous count, and exact target-state identity required by that contract. Never use generic project metadata writes to advance progress.
5. GET the live Workbench state and confirm the same project, page numerator/denominator, and workflow stage. Only then begin the next translation batch. A Google Doc marker, an open browser, or polling alone does not establish synchronization. If publication/readback fails, retain the verified manuscript work and reconcile the checkpoint before advancing; independent preparation may continue without claiming translated progress.

Workbench synchronization therefore happens **as the book progresses**, not once after the whole book. Do not defer already-verified batch updates solely to reduce writes. Formatting/lifecycle changes also synchronize and read back in the same work unit, but formatting never independently advances translated-source page counters.

## Finish the book, not another first pass

After all declared source units and text surfaces are covered, perform the current profile's whole-book fidelity, terminology, notes, structure, and publication-quality checks. Complete dependency-sensitive book-wide formatting and terminal contents/layout verification under their routed owner; rerun checks invalidated by later changes. This is final integration/QA, not permission to defer first-pass requirements or automatically retranslate the book.

Keep translation/formatting completion, Zahraa's actual human review, Publish Ready, and publication distinct under the Workbench stage contract. Machine review cannot impersonate Zahraa's human-review gate. Remove working telemetry from publication artifacts as required by the current profile/contract.

## Quality safeguards approved 2026-10-09

Approved scope: independent source-aware critic, source-to-English coverage map, quality anomaly watchdog, scoped terminology memory, linked translation questions for human review, per-book publication evidence, and representative regression tests. These are acceptance requirements, not proof of deployed automation.

**Batch evidence contract:** The production helper `functions/_translation.js` exports `assessTranslationEvidence(report, wholeBook)`. The future translation runner must supply source hash, exact target revision, individually identified source units with physical page, verified target anchor, independent critic result, ambiguity review, terminology review and batch-formatting evidence. Each check must carry an actual verifiable evidence reference and revision. For whole-book review also require the all-page render, native TOC stabilization, publication QA and regression results. A passing metadata preflight is only a prerequisite; the engine must independently inspect the cited source and rendered artifacts before accepting their claims.
 Retain the existing per-batch and whole-edition gates, including REAL SCALE v3 indentation for all ordinary paragraphs (even one sentence) and indented numbered/bulleted lists. A human reviewer alone resolves human-owned translation judgments; do not auto-advance the human-review stage.

## Measure before calling it fastest

Use a representative hostile-case pilot before scaling a new OCR/editing route: ordinary paragraphs, dense footnotes, quotations, headings, difficult scans, and other structures actually present. Measure end-to-end verified batch cycle time, not OCR speed alone: preparation/startup, OCR, transfers, translation, correction/review, formatting, target readback, and Workbench sync. Record failures/rework and resource contention, not just successful runs. Character-error rates require human-verified reference text; missing Mac measurements remain unknown.

Tune batch size, OCR lookahead, and machine allocation against the observed bottleneck. Reduce OCR concurrency when it starves Mac review/formatting. Compare the same source/quality gates when changing the schedule; do not label this or a whole-book stage-by-stage alternative the absolute fastest without comparative evidence. Enforce $0 additional cost and check tool/model licenses before commercial use. Saving these instructions does not itself install runners, change workflow labels, deploy OCR, or modify live Workbench projects.

# Verified-throughput optimization plan (proposal, 2026-11-17)

Status: proposed operational improvement; **not** proof of installed automation, measured speedup, source acceptance, or permission to alter translation scope. Read `AGENTS.md`, `workbench/AGENTS.md`, `TRANSLATION-WORKFLOW.md`, and routed Operator owners first. This document adds no exception to existing quality, privacy, reviewer, one-writer, GPU, or final-only website publication gates.

## Objective and hard constraints

Minimize **elapsed time to a fully accepted, publication-ready book** and then the complete eligible portfolio, subject to all existing fidelity, source-coverage, native-footnote, first-pass formatting, independent review, rendering, human release, and provenance requirements. Draft pages/hour is a diagnostic only. Never mark accepted work from an OCR/model output or an unverified dashboard label.

**Scope authority:** On each planning run fetch the current live Workbench `/api/projects` snapshot. **Exclude every book the website marks done, translated, completed, or published from BOTH translation and formatting queues**, even if a separate source-QA metric is incomplete. Such books may be inventoried for exact-copy migration or final website reconciliation, but do not rewrite, retranslate, or reformat them under this plan. Unknown/ambiguous status fails closed to manual classification, not inclusion. Preserve the explicit exclusions #90 and #106 regardless of status. Among remaining eligible books: Mohammed direct assignments, then Zahraa, then Shared/Unassigned. Never infer current status or assignment from a prior snapshot. The exact set of website status codes must be verified against the live API and existing state contract before implementing a status predicate; no guessed enum values.

## Critical-path model

Track each book as source identity and complete PDF -> extraction/visual exceptions -> source-checked coherent units -> translation + first-pass native formatting -> independent source/target review -> book-wide integration/render -> required human acceptance -> final-only website reconciliation. Track *actual* duration, queues, blocking dependencies, rework and revision-specific acceptance per stage. Use Little's-law reasoning only with measured stable flow; optimize the **currently measured constraint**. Do not equate more parallel drafts with more completed books.

## Execution architecture

1. **Inventory and exclusion gate.** Record a fresh private snapshot of exact project IDs, status, assignee, current source and manuscript identity. Apply the completed-book and #90/#106 exclusions *before* source recovery, migration, OCR, translation, or formatting. Record unknowns as blocked. No production write from a historical status.
2. **Prepare once; reuse safely.** Recover each needed complete source PDF once, verify hash/edition/page count and representative rendered pages, persist private durable source/page/note manifests; treat short-lived workflow artifacts as transport only. Check native text health and use image-verified OCR only where necessary. Reuse verified existing manuscript text verbatim, with revision-aware unit mapping and no duplicate append.
3. **Bounded pipeline, not unbounded queues.** While the single active book's source-checked unit is translated and first-pass formatted, independently prepare the next units and run nonconflicting source/format checks. Limit ready work to downstream review capacity. Keep a single designated writer per manuscript and respect current no-interleaved-books rule. Shared RTX 4070 remains under exclusive host lock.
4. **Independent QA at unit and book levels.** Compare against the *same-edition rendered Arabic page* including footnotes, headings, continuations, tables, Qurʾān and hadith quotations. Verify native target revision, note anchoring, typography and PDF rendering; run full-book coverage/consistency/integration checks before acceptance. Uncertain extraction, edition or provenance blocks acceptance without deleting existing text.
5. **Measure the actual bottleneck.** Maintain a private per-stage ledger: source units ready, drafted, source-reviewed, format-reviewed, accepted, blocked, rework; active minutes, wall-clock lead time, waiting time, defect severity, reviewer burden, and exact revisions. Keep manuscripts, source text, IDs, links and private timing out of public GitHub and logs.
6. **Controlled optimization trials.** On a representative, blinded set of diverse source pages (clean/scanned, footnote-heavy, RTL, tables, difficult theology), compare candidate OCR/model/prompt/batch/review paths. Evaluate full downstream correction effort, source omissions, semantic fidelity, citations, layout, reviewer time, cost and resource contention. Accept a candidate only if it meets every existing quality gate and yields a reproducible net improvement in accepted-unit throughput and/or lead time; otherwise revert. Never use a model as the sole independent judge of its own output.
7. **Adaptive scheduling.** After each accepted batch, inspect queue sizes, actual bottleneck and error/rework distribution. Reallocate *independent* preparation/review capacity to the bottleneck, preserve bounded WIP, and forecast only from observed accepted units. Keep a reversible configuration and audit trail for each scheduling change.
8. **Publication separation.** Update the private progress dashboard with clearly distinguished drafted vs independently accepted vs human-approved status. Preserve founder-directed final-only production website changes, exact-ID permission and readback gates. A site label of completed is an *exclusion authority for work scope*, not proof of source QA.

## Implementation sequence and acceptance tests

**Phase 0 (first, blocking):** Read the live /api/projects state; identify and unit-test actual completed-status representations and exclusions, including review/completed/published or any website-visible 'Translated' label. Assert that completed books cannot enter *either* translation or formatting queues, including on reassignment or stale snapshot. Fail closed when status is missing or unknown. Compare planner output with the live visible website before any manuscript write.

**Phase 1:** Audit existing planner and source/target manifests; add explicit dry-run output with eligible IDs, excluded IDs and reasons, and unknown/blocked IDs. Tests must cover duplicate IDs, reassignment, two title exclusions, completed books, empty or missing fields, and no-live-snapshot refusal. Do not publish private links.

**Phase 2:** Add private metrics schema and opt-in instrumentation to existing pipeline, not a parallel ungoverned database. Establish a representative baseline with actual end-to-end accepted work and rework. Report NOT CALIBRATED until observed.

**Phase 3:** Benchmark competing source extraction/OCR, translation and review paths on identical fixed source units. Include independent expert review where required, measure total correction and reviewer effort, and preserve baseline fallback.

**Phase 4:** Enable only verified faster, quality-equivalent scheduling/engine settings; exercise GPU-lock contention, writer revision races, overlap rejection, idempotent retries, source-page/printed-page distinctions, native footnotes, and final rendered PDFs. Document real measured gain, not projected speed.

**Phase 5:** Scale only to the next proven bottleneck. Maintain a stop/revert rule on quality regression, unexpected rework, provenance gaps, stale source or manuscript revision, missing live status, or queue buildup.

## Open dependencies

Live website status enum and fresh project snapshot; current planner/tests and CI; runner/engine provisioning and resource benchmarks; complete private source/manuscript manifests; availability of independent qualified review; and the actual scope of already completed translations. This plan does **not** authorize re-opening completed website books, bypassing review, parallel content translation across books, or changing production website status mid-program.

## Success definition

A verified reduction in median/p90 **time to accepted publication-ready book**, with no worsening of source omissions, semantic accuracy, citation/footnote integrity, native formatting, independent review, or human-release compliance. Portfolio throughput improves without increasing unresolved QA debt. If baseline or follow-up measurements are missing, the outcome remains **unverified**.

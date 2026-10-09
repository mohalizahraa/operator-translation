# Operator Translation Projection Router

Status: **generated translation-only projection** of the private canonical Operator Protocol. This file is authored here and projected downstream; do not edit the generated `operator-translation/AGENTS.md` independently.

This repository contains only shared authorities for Arabic→English book/manuscript translation, review, formatting, publication, and adjacent evidence/continuity work. It is **not** the full Operator repository.

## Always governing

Always freshly load exactly:
- `protocol/00-CORE.md`

For work concerning Arabic books, translate/format/review using the task router `profiles/arabic-book-translation.md` and then **only the child owners the actual task needs**:

| Task dependency | Routed owner |
| --- | --- |
| Arabic-to-English meaning, terminology, source coverage, ambiguity capture and question decisions | `profiles/arabic-translation-fidelity.md` |
| First-pass typography, indentation (even one-sentence text and lists), page/heading/note/TOC layout | `profiles/arabic-translation-formatting.md` |
| Workbench assignment, live verified progress, project status, per-book question Doc/ledger | `profiles/arabic-translation-workbench.md` |
| Google Docs/PDF/source tools, document operations and approved artifact migration | `profiles/arabic-translation-substrate.md` |
| Independent source critique, quality calibration, revision-bound claims and publication gates | `profiles/arabic-translation-assurance.md` |
| Resuming across batches, books, machines or chats; preserving review questions and decisions | `profiles/arabic-translation-continuity.md` |

Apply **all materially applicable owners during the first formatting/translation pass**; do not defer an already applicable fidelity/formatting requirement just to reduce initial work. Source-aligned critique and question capture must be revisited whenever a material source/target change reopens them. A batch checkpoint, human review and publication are distinct evidence gates.

Load general protocol owners **by dependency, not automatically merely because a book is mentioned**:
- nontrivial reasoning, interpretation, DMSC/reconciliation → `protocol/01-REASONING-DMSC.md`
- tool actions, writes, permissions, automation, idempotency/retries → `protocol/02-EXECUTION.md`
- provenance, durable documents, historical/cross-source truth → `protocol/03-KNOWLEDGE-AND-DOCS.md`
- tests, release gates, completion, consequential quality/status claims → `protocol/04-VERIFICATION-AND-HONESTY.md`
- user-facing updates, limitations, blockers and handoffs → `protocol/05-COMMUNICATION.md`
- requirements/decisions requiring user/founder authority → `protocol/06-SPECIFICATION-COMPLETENESS.md`

Load specialized adjacent owners only when material: `profiles/research.md` for source/literature research; `profiles/public-source-access.md` when a particular public source is blocked/gated; `profiles/reconciliation.md` for competing source or model revisions; `profiles/handoff.md` for substantial restart-safe handoffs; and `profiles/assurance.md` for independent/comprehensive multi-method audits.

**Workbench project routing:** for tasks in `workbench/`, first inspect `workbench/AGENTS.md`, then its `TRANSLATION-WORKFLOW.md` and `README.md` as appropriate. Project truth lives there, not in the Operator projection. Do not claim that saving these instructions installs a runner, builds a Doc, or closes live tasks; verify the actual artifact and state.

## Projection boundary

The private canonical Operator repository governs Operator as a whole; unrelated projects, Status/roadmap data, private cases and general non-translation profiles are intentionally excluded. For out-of-scope requests, use the actual corresponding canonical authority when available rather than inventing it from this projection.

## Freshness and authority

Re-read this `AGENTS.md` and each materially routed owner **on every turn** for which this repository is the active source; do not rely on an old chat/summary. `.projection-source.json` names the exact canonical source commit.

Operator governs **how** the work is done. The user's explicit decisions, active project authorities, human reviewer judgments, and original Arabic sources govern their respective truth domains. Preserve uncertainty and authority distinctions when they disagree.

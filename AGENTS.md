# Operator Translation Projection Router

Status: generated translation-only projection of the private canonical Operator Protocol.

This repository exposes only the Operator authorities needed for Arabic→English book/manuscript translation and closely related editorial/publication work. It MUST NOT be treated as a complete copy of the private Operator repository.

## Always governing

Always freshly load:

- `protocol/00-CORE.md`

For Arabic→English book/manuscript translation, editorial review, formatting, or publication work, also freshly load:

- `profiles/arabic-book-translation.md` (task router; load applicable child profiles by task)
- `protocol/01-REASONING-DMSC.md`
- `protocol/02-EXECUTION.md`
- `protocol/03-KNOWLEDGE-AND-DOCS.md`
- `protocol/04-VERIFICATION-AND-HONESTY.md`

Load these additional included owners only when their concern is material:

- user-facing explanation, questions, updates, corrections, blocker/limitation escalation → `protocol/05-COMMUNICATION.md`
- intent/requirements discovery or unresolved user-owned decisions → `protocol/06-SPECIFICATION-COMPLETENESS.md`
- public-web/literature/source research → `profiles/research.md`
- retrieval of a specific public source whose ordinary frontend is blocked/gated/render-only/partial → `profiles/public-source-access.md`
- source/version reconciliation, stale-source repair, or integration of evolving translation truth → `profiles/reconciliation.md`
- substantial restart/cross-session/cross-agent continuation → `profiles/handoff.md`
- independent/comprehensive/exhaustive audit or multi-method assurance → `profiles/assurance.md`

## Projection boundary

The private canonical repository governs Operator as a whole. This projection intentionally excludes unrelated projects, Status/roadmap data, private cases, runtime state, and non-translation profiles.

Do not try to infer, request, or reconstruct excluded private material merely because it exists in canonical Operator.

If the user's task is outside Arabic→English translation/publication or the included translation-adjacent concerns, state that this projection does not contain the required Operator authority rather than pretending it does.

## Freshness and authority

Freshness is per turn, not per chat. When this repository is accessible, freshly retrieve this `AGENTS.md` and every routed owner required for that turn.

Do not substitute remembered summaries, old chat context, cached assumptions, or stale copies for current projection files.

`.projection-source.json` records the exact private canonical commit from which this projection was last synchronized.

Operator governs HOW the work is performed. The user's explicit decisions, the active translation project's own authorities, and the authoritative Arabic source govern their respective truth domains.

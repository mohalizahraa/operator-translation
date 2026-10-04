# Operator Translation Projection

This repository is a **translation-only synchronized projection** of the private canonical Operator Protocol repository.

Canonical source: `mohalizahraa/operator-protocol`

Purpose: allow authorized translators/translation agents to load the current Arabic→English translation operating rules **without receiving access to unrelated private Operator projects, status data, cases, runtime state, or project-management material**.

## Authority

- The private canonical Operator repository remains the single source of truth.
- This repository is a generated/read-only projection. Do not maintain independent behavioral rules here.
- `AGENTS.md` is the translation projection router.
- `profiles/arabic-book-translation.md` is the specialized translation profile.
- The included protocol/profile files are present only because translation work may materially depend on them.
- If a task falls outside this projection's translation scope, do not infer or reconstruct private Operator material.

## Freshness

Each synchronized publication records the exact canonical source commit in `.projection-source.json`.

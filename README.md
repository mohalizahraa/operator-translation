# Operator Translation Projection

This directory owns the translation-only projection published from the private canonical Operator Protocol repository to the translator-facing `mohalizahraa/operator-translation` repository.

**Authority flows one way:** Operator's canonical `protocol/` and `profiles/` files and this directory's projection router/README are the source. The destination's corresponding files are generated and must not be edited as an independent behavior authority. The destination's workbench and translation-specific work are outside this generated surface and must remain intact.

For the Sayyid Kamal al-Haydari translation program, the canonical shared Workbench is **https://haydari-translation-workbench.pages.dev**. Translation agents use `profiles/arabic-book-translation.md` for the governing Workbench synchronization rule and the Workbench project's own contract for live field/status semantics.

## Deterministic synchronization

- `manifest.txt` is the allowlist of canonical protocol/profile files copied byte-for-byte.
- `AGENTS.md` is the projection-specific router, not a replacement for canonical Operator routing.
- `scripts/translation-projection.mjs` (in the canonical repository) builds and verifies the exact managed projection, rejects obsolete managed files, and records a SHA-256 digest of the projected paths and bytes.
- The destination's `.projection-source.json` contains both `canonical_commit` (the exact Operator revision observed) and `projected_content_sha256` (the projected-file fingerprint), plus `projected_files`. An unrelated Operator diary change may update the commit without changing the projected-content fingerprint.
- `.github/workflows/sync-translation-projection.yml` runs on every Operator `main` push, manual dispatch, and a six-hour reconciliation cadence, using the designated **self-hosted** runner. Missing credentials, mismatched files, stale digests, and failed remote read-back fail visibly.
- Synchronization is verified again against a freshly fetched destination `main` after publication; a successful push by itself is not a completion claim.
- The workflow only stages the managed `AGENTS.md`, `README.md`, `.projection-source.json`, `protocol/`, and `profiles/` paths, leaving translation work and Workbench artifacts untouched. Concurrent unrelated destination commits are reconciled by bounded push retries.
- Changes to canonical routing/profiles or this projection machinery must be tested with `node scripts/translation-projection.test.mjs` and Operator's required exact-head floor checks.

The GitHub job is **eventually consistent**, not atomic across repositories. If the self-hosted runner or GitHub service is unavailable, a run may queue or fail; do not claim destination synchronization until read-back succeeds. GitHub Actions failure status is the observable error signal. No billable GitHub-hosted runner fallback is authorized.

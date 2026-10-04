# Operator Translation Projection

This directory defines the source-controlled translation-only projection published from the private canonical Operator Protocol repository to the separate translator-facing repository.

The private canonical Operator repository remains the single source of truth. The translator-facing repository is generated and must not become an independently maintained behavior authority.

The projection intentionally excludes unrelated project/status/runtime/case material. Its purpose is to expose only the protocol owners and profiles materially useful to Arabic→English book/manuscript translation and publication work.

`manifest.txt` is the allowlist of canonical files copied verbatim. `AGENTS.md` is the projection-specific router. The publishing workflow records the exact canonical source commit in the destination's `.projection-source.json`.

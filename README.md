# Operator Translation Projection

This directory defines the source-controlled translation-only projection published from the private canonical Operator Protocol repository to the separate translator-facing repository.

The private canonical Operator repository remains the single source of truth. The translator-facing repository is generated and must not become an independently maintained behavior authority.

The projection intentionally excludes unrelated project/status/runtime/case material. Its purpose is to expose only the protocol owners and profiles materially useful to Arabic→English book/manuscript translation and publication work.

For the Sayyid Kamal al-Haydari translation program, the canonical shared Workbench is **https://haydari-translation-workbench.pages.dev**. Translation agents should use the projected `profiles/arabic-book-translation.md` for the governing Workbench synchronization rule and use the Workbench project's own contract for live field/status semantics.


`manifest.txt` is the allowlist of canonical files copied verbatim. `AGENTS.md` is the projection-specific router. The publishing workflow records the exact canonical source commit in the destination's `.projection-source.json`.

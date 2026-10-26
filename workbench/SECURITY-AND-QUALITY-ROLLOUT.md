# Workbench security, questions, and quality activation

Status: **code prepared; production enforcement must be verified separately**. This is a project-specific deployment/runbook, not a substitute for Operator profiles or the approved translation workflow. Follow the zero-additional-cost/Cloudflare-only policy. Never commit, paste into chat, log, or print real secrets.

## Open collaboration — founder decision 2026-10-16

The website is intentionally accessible **without any editor/reviewer key, account, password, or login**, for both read and write. The earlier Cloudflare secret-gated design is superseded by the founder's explicit decision. Deploy the updated middleware and client together; stale Cloudflare key bindings must no longer change editing behavior. `Origin` mismatch checks remain for ordinary browser cross-origin edit requests, but are **not authentication**: any public HTTP client can submit API writes. Collaborator names and human-review declarations are self-reported and cannot establish identity. Keep field validation, D1 transactions/optimistic checks, audit history, revision/source checks, and recovery discipline.

Verification is behavioral: on the exact production release, verify `GET /api/health` returns `write_protection: public_collaboration`, that edits/questions submit without credentials, that a normal page load and read still work, and that cross-origin browser mutations are rejected. Verify the source release marker as well. Do not claim protection, privacy, collaborator identity proof, or source quality because the UI is easy to access. An openly writable D1 database has real vandalism/corruption exposure; preserve recoverable snapshots outside public GitHub artifacts, and never expose Cloudflare secrets or document source content in logs.

## Questions — per-book ledger

- `GET /api/projects/:id/questions` lists the structured ledger and the separate Questions Doc URL.
- `POST /api/projects/:id/questions` captures an exact Arabic passage, physical PDF page, stable question key, rationale and proposed English; a repeat is idempotent and cannot silently rewrite a reviewer answer.
- `PATCH /api/projects/:id/questions` links an accessible Google Doc or records answered/applied state with an immutable history event.
- The project/board card offers Questions Doc open/link actions without credentials. Public Google Doc reachability is checked before link, and at least anonymous Viewer access must be verified separately through Drive metadata; a restricted Doc is not linked.
- The Workbench API stores and displays the Questions Doc link; it does **not** automatically create Google Docs. The authorized translation/document writer must create or reuse exactly one Questions & Evidence Log for each *started* book, share it accessibly, PATCH `questions_doc_url`, then GET/read back the persisted book and test the link. The writer must prevent duplicates when resuming and must not confuse an unattached existing Doc with a missing Doc.

## Source/target revision-bound quality evidence

- `POST /api/projects/:id/quality` accepts a compact report for each physical source-page batch, exact source SHA-256, exact Google Doc revision, identified source units for **every page**, an independent-critic result, terminology/ambiguity checks and formatting evidence references; full-book reports also require all-page visual, TOC, release and regression checks.
- The endpoint stores an immutable receipt and logs activity. **A passing receipt is only evidence-presence / consistency preflight**, not proof that the claimed Arabic comparison or rendered QA actually happened. Humans or independent tooling must check the underlying evidence.
- To enforce on subsequent progress and workflow transitions, configure `WORKBENCH_REQUIRE_QA_EVIDENCE=1` in the Cloudflare environment. **Do not enable it until the real translator writer submits receipts before every new page checkpoint and a final whole-book receipt**. The legacy public WBPROGRESS-only path cannot satisfy strict QA and will be rejected. `/api/health` reports the active mode; `quality_gate: enforced` means the code checks submitted receipts, not human verification.
- A source-damaged page cannot be counted VERIFIED merely by adding a marker. Corrections require coherent source-version reconciliation. Questions/doc decisions must survive restart and an edit must be applied to a specified target revision before it is considered applied.
- In strict mode, a book cannot reach Publish Ready from Needs Review until a separately verified human-review attestation is implemented; the present transition deliberately blocks instead of impersonating the human reviewer.

## Human review — explicit declaration, not authenticated identity

- **No reviewer key is requested.** The selected `Editing as` name and the explicit final-manuscript confirmation are self-declared. An automated translator cannot truthfully impersonate a person's review; recording a declaration does not prove who clicked it or that they reviewed the book.
- The human-review API still requires `Needs Review`, a matching full-book QA receipt, canonical source hash, live exact Google Doc revision, an explicit entire-manuscript declaration, and no blocking unresolved questions. Its immutable activity entry and revision-bound receipt survive later changes; a changed edition requires fresh review.
- `Publish Ready` remains gated by the matching declaration and source/target QA, but the site cannot claim independent verification of human identity under open editing. An authenticated reviewer mechanism would be a separate, explicit future founder choice, not a hidden reintroduction of keys.

## Integrity and recovery additions — 2026-10-09

**Live manuscript freshness:** the `public-export-sha256:<digest>` in a whole-book QA receipt must match the **current** unauthenticated Google Doc text export before new human attestation, Publish Ready, or first publication in strict mode. Deleted/restricted Docs, network failures, changed text and native revision IDs that cannot be verified from the public export all **block** approval. An edit immediately after verification remains a race: true immutable publication requires a locked snapshot/verified Drive revision or a versioned release artifact. The current system cannot call an existing manuscript immutable.

**Atomic editorial writes:** question capture, question decision, Questions Doc linking, QA receipt capture, and reviewer attestation now execute their primary mutation and activity/event record within a D1 `batch()` transaction. Stable keys, uniqueness constraints, and optimistic status checks make retries idempotent and competing reviewer decisions reject stale writers. `scripts/check-editorial-transactions.py` rehearses duplicates, stale updates and rollback on synthetic SQLite data; it cannot replace a live D1 integration test.

**Recoverability:** `scripts/check-backup-restore.py` exercises an entirely synthetic `schema.sql` export/reimport, foreign-key check and preservation of questions, event history, QA and reviewer receipts. It makes **no production backup** and persists no source-book content. Real backup requires a separately authorized Cloudflare D1 export to a controlled destination, secure retention, an off-production restore rehearsal, and a monitored freshness/checksum status. Never execute a restore against production as a test, never dump live D1 into a GitHub commit or publicly downloadable CI artifact, and do not add recurring or paid storage without the owner's direction.

**Integrity readback:** `GET /api/projects/:id/integrity` is read-only, returns clearly scoped verified source denominator, metadata QA page coverage, unresolved/blocking questions, human review and whether open access and strict QA flags are active. Adding `?verify_live=1` compares the latest whole-book evidence to the live Google Doc export and reports stale/unverifiable revisions without changing any project state. Project/Board cards offer **Integrity** to open this report. Absence of warnings does not establish scholarly translation correctness.

**Full real-book acceptance still open:** a designated book must traverse canonical PDF page mapping → verified extraction/OCR → complete Arabic→English translation including notes → revision-tied Questions Doc → formatter/render and native TOC → source-aligned independent review → human final approval → interruption/recovery → publication in staging. Test first in a scratch/staging copy; do not change live book progress to fake this proof. Keep document access and source content out of automated public logs.

## Next integration work

1. Verify that the deployed Workbench preserves the founder-approved open-collaboration behavior and associated validation, audit, and recovery controls; do not reintroduce credentials.
2. Discover and reuse each book's existing Google Docs before creating replacements. For started books, establish a separate Questions & Evidence Log, confirm anonymous Viewer access, link it through the verified Workbench Questions endpoint and read back the exact project URL. Leave unstarted books without empty Questions Docs.
3. Have the translation runner emit real, independently checked Arabic source-unit maps and QA receipts at each checkpoint; only then activate strict QA for all affected books.
4. Exercise final human-review self-declaration without reviewer keys. Require actual reviewer confirmation, matching whole-book QA evidence, exact source/Google Doc revision, no blocking questions, and rejection of stale revisions, competing edits or revoked access. Editing-as names cannot prove reviewer identity.
5. Use actual reviewer-validated Arabic passages and independent model outputs to establish translation-quality calibration, not only illustrative short examples.

**Verification boundary:** CI tests module syntax, safeguards, generated provenance and deterministic preflight logic. Live public-collaboration behavior and the independently staged strict quality mode each require exact production deployment/readback, real source and target documents, and observed writer/reviewer behavior. The approved public-editing path does not require editor or reviewer credentials.

# Workbench security, questions, and quality activation

Status: **code prepared; production enforcement must be verified separately**. This is a project-specific deployment/runbook, not a substitute for Operator profiles or the approved translation workflow. Follow the zero-additional-cost/Cloudflare-only policy. Never commit, paste into chat, log, or print real secrets.

## Security — current risk and safe activation

The shared public Workbench historically used a collaborator-name header (`x-workbench-actor`) without authentication. That header is **display attribution**, not proof of identity. An unlisted URL is not access control. Public English Docs shared `Anyone with the link → Editor` also remain editable outside the Workbench entirely, so a Workbench API key cannot protect the Google Doc.

A new Cloudflare Pages Functions middleware guards every API mutation when a strong `WORKBENCH_EDITOR_KEY` is configured as a **Cloudflare secret/environment binding** (at least 32 unpredictable characters); the app asks for the key only after a 401 and keeps it in **tab-scoped sessionStorage**, not the repository. The client does not need a login account. The Questions and QA mutation endpoints independently **fail closed** if that secret is absent. Invalid, undersized, or missing credentials cannot write once the binding exists. `Origin` mismatch checks help mitigate browser CSRF but do not authenticate a request.

**Do not claim protection is live solely because code was committed.** Until the Cloudflare secret is bound to the production deployment and a real unauthenticated PATCH returns 401, the existing legacy APIs remain writable. A repository-level middleware alone cannot assert Cloudflare Access or DNS/routing security. Enable the secret through the Cloudflare Pages dashboard or authorized deployment setup, redeploy, verify one valid edit from each collaborator, one unauthenticated denial, one wrong-key denial and a project read. Confirm `/api/health` says `write_protection: enforced`. The frontend must not ask for or save a key through source-control, chat transcripts, activity logs or query parameters. If a key leaks, rotate it in Cloudflare; shared keys do not prove which collaborator personally made an edit.

For stronger individual accountability or restricted Google Doc access, use a separate Google identity/Drive permission model and independently verified reviewer identities. This is not provided by the current shared-key setup. Decide whether to replace public-anyone Editor access with explicit editors when the user authorizes changing the established collaboration contract.

## Questions — per-book ledger

- `GET /api/projects/:id/questions` lists the structured ledger and the separate Questions Doc URL.
- `POST /api/projects/:id/questions` captures an exact Arabic passage, physical PDF page, stable question key, rationale and proposed English; a repeat is idempotent and cannot silently rewrite a reviewer answer.
- `PATCH /api/projects/:id/questions` links an accessible Google Doc or records answered/applied state with an immutable history event.
- The project/board card offers a Questions Doc open/link action; linking still requires a provisioned editor key. Public Google Doc reachability is checked before link, but **Editor permissions must still be verified independently through Drive metadata**.
- This release does not create Google Docs automatically. The future authenticated document writer must create exactly one Questions Doc per book, then link it and synchronize entries, avoiding duplicate questions on resume.

## Source/target revision-bound quality evidence

- `POST /api/projects/:id/quality` accepts a compact report for each physical source-page batch, exact source SHA-256, exact Google Doc revision, identified source units for **every page**, an independent-critic result, terminology/ambiguity checks and formatting evidence references; full-book reports also require all-page visual, TOC, release and regression checks.
- The endpoint stores an immutable receipt and logs activity. **A passing receipt is only evidence-presence / consistency preflight**, not proof that the claimed Arabic comparison or rendered QA actually happened. Humans or independent tooling must check the underlying evidence.
- To enforce on subsequent progress and workflow transitions, configure `WORKBENCH_REQUIRE_QA_EVIDENCE=1` in the Cloudflare environment. **Do not enable it until the real translator writer submits receipts before every new page checkpoint and a final whole-book receipt**. The legacy public WBPROGRESS-only path cannot satisfy strict QA and will be rejected. `/api/health` reports the active mode; `quality_gate: enforced` means the code checks submitted receipts, not human verification.
- A source-damaged page cannot be counted VERIFIED merely by adding a marker. Corrections require coherent source-version reconciliation. Questions/doc decisions must survive restart and an edit must be applied to a specified target revision before it is considered applied.
- In strict mode, a book cannot reach Publish Ready from Needs Review until a separately verified human-review attestation is implemented; the present transition deliberately blocks instead of impersonating the human reviewer.

## Human review — explicit, distinct authority

- Configure **both** `WORKBENCH_EDITOR_KEY` and a different, equally strong `WORKBENCH_REVIEWER_KEY` as Cloudflare secrets. The reviewer key must never be available to the autonomous translation runner. The keys are separate capabilities, **not proof of a person's real-world identity**; a truly identity-verified workflow would require trustworthy individual authentication.
- While a book is **Needs Review**, a collaborator selects **Confirm human review**, personally reviews the entire final manuscript, and submits the reviewer-only credential. The request carries `reviewer_name`, `source_pdf_sha256`, and `google_doc_revision` taken from a full-book QA receipt; the server rejects a missing/mismatched receipt or any blocking translation question not yet applied.
- `POST /api/projects/:id/human-review` records a distinct, revision-bound declaration. `GET` lists attestation metadata; no reviewer secret is logged or stored. The strict Publish Ready transition requires a matching attestation on the latest whole-book QA candidate. An AI cannot legitimately assert that a human read a book, regardless of whether the system records a credential-backed declaration.
- A later revision of the final manuscript requires new source-aligned QA and another review attestation. This is enforced by comparing manuscript revisions rather than accepting a historical `Needs Review` status.

## Next integration work

1. Provision the production write secret without exposing it. Confirm protected mutation and stable collaborator access.
2. Grant the authorized document writer permission to create one Google Doc per book and sync the question ledger; no unattended Google Doc creation is claimed yet.
3. Have the translation runner emit real, independently checked Arabic source-unit maps and QA receipts at each checkpoint; only then activate strict QA for all affected books.
4. Provision and independently verify the separate human-reviewer credential, then exercise real stage transitions, source hash/revision changes, conflicting questions, concurrent edits and revoked document access. For stronger identity assurance, add verified individual authentication rather than treating shared-key possession as personal identity.
5. Use actual reviewer-validated Arabic passages and independent model outputs to establish translation-quality calibration, not only illustrative short examples.

**Verification boundary:** CI tests module syntax, safeguards, generated provenance and deterministic preflight logic. Live protection/quality mode requires separate production deployment/readback, credentials, real documents and observed runner behavior.

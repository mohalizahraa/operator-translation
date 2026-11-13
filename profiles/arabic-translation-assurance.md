# Arabic Book Translation — Verification, Release and Review

All material quality, semantic and publication checks remain mandatory. Numbered cross-references resolve across the routed Arabic book profile family.

## 7. Use a hard zero-Arabic gate for English-only editions

When the requested output is English-only—especially when the user says **all Arabic removed**, **English readers**, or **publication-ready**—zero readable Arabic script is a hard acceptance criterion, not a stylistic preference.

Before claiming text completion, scan every editable/extractable text-bearing region for Arabic-script Unicode, including at minimum the major Arabic blocks:

- `U+0600–U+06FF` — Arabic;
- `U+0750–U+077F` — Arabic Supplement;
- `U+0870–U+089F` — Arabic Extended-B;
- `U+08A0–U+08FF` — Arabic Extended-A;
- `U+FB50–U+FDFF` — Arabic Presentation Forms-A;
- `U+FE70–U+FEFF` — Arabic Presentation Forms-B.

Include any newer/host-relevant Arabic ranges supported by the runtime's Unicode implementation. The scan should include Arabic-Indic digits and Arabic punctuation because they fall inside these blocks.

Every hit must be adjudicated. For an English-only edition the expected editable-text result is **zero unapproved hits**. If the edition explicitly authorizes sacred glyphs, whitelist only those exact code points/forms (for example `﵊`, `﵋`, `ﷺ`, or `ﷻ`) and continue treating every other Arabic-script hit as unresolved until adjudicated.

Then separately inspect images/figures/artwork for readable Arabic that a Unicode scan cannot see. If Arabic remains in image pixels and the user required all Arabic removed, edit/replace that image text where authorized and feasible; otherwise the publication-ready gate remains blocked.

Do not infer completeness from visual spot-checking alone, and do not infer visual completeness from a zero-Unicode text scan alone.


## 8. Run publication QA before calling the edition ready

A publication-ready claim requires evidence at the edition level, not merely successful translation calls.

As applicable, verify:

1. **Source safety** — the authoritative Arabic source still exists unchanged unless in-place editing was explicitly authorized.
2. **Coverage** — front matter, body, notes, tables, captions, headers/footers, references, appendices, and other in-scope target surfaces were processed; verify that any source TOC was inspected as structural evidence and that the required target-native English TOC exists, reflects the verified heading hierarchy, and is current for the exact candidate.
3. **Zero-Arabic text** — exhaustive Arabic-script scan across editable/extractable text returns zero unapproved hits.
4. **Image text** — no readable Arabic remains in images/figures when the English-only contract includes them.
5. **Structural parity** — expected chapters/sections/tables/notes/captions/reference blocks still exist and remain correctly associated.
6. **Translation fidelity** — no material passage was skipped, duplicated, truncated, softened, invented, or silently corrected.
7. **Terminology consistency** — recurring names, honorifics, technical vocabulary, dates, numerals, and citation forms are internally consistent.
8. **Formatting integrity** — emphasis, layout hierarchy, note linkage, tables, page/section breaks, and image placement remain usable.
9. **Visual inspection** — inspect the rendered final edition broadly enough to catch clipping, directionality, spacing, orphaned notes, malformed punctuation, broken tables, residual right-to-left artifacts, or visually embedded Arabic. For a strong publication-ready claim, inspect the whole rendered edition when the toolchain permits it rather than relying on a sample.

10. **PDF searchable/copyable text-layer integrity** — independently test the exact final PDF's selectable/copyable/searchable text on representative body passages, TOC headings/page numbers, Qurʾānic brackets, native footnote references, punctuation, and mixed Latin/sacred-glyph strings. Compare extracted/copy-pasted reading order and Unicode identity to the native target **separately from the visual render**. Flag misplaced bidirectional fragments, scrambled honorifics, lost glyphs, reordered citations, and broken search results. A single extractor's odd order is a **diagnostic signal**, not proof that the rendered PDF is defective; corroborate with another extraction or actual selection/copy/search before declaring an artifact defect. If a real text-layer failure exists, repair the responsible font/embedding/direction or export route without sacrificing correct on-page appearance, and rerun the final PDF check. Record PDF accessibility/usability as its own PASS/OPEN/BLOCKED gate; a visually correct page does not establish a correct text layer.

If any applicable gate is open, failed, untested, or blocked, do not call the edition publication-ready.

**Post-book formatting improvement report (book-specific projection of KNOWLEDGE's approved improvement inbox):** At the close of **every** whole-book formatting pass, without waiting for a separate user reminder, compare encountered defects and fixes against the currently routed canonical rules. Briefly report which failure classes were already covered versus which genuinely new preventive checks or rule clarifications are warranted. Present all **new** candidates in **one concise numbered approval batch**, grounded in the observed defect/false alarm, intended owner, expected prevention, and pending approval; if no new candidates survive reconciliation, state that **no new rules are warranted**. Do not repeat existing rules as inventions, turn tentative PDF-extraction artifacts into confirmed defects, or automatically mutate Operator from the report without approval. Keep manuscript editing, human/source review, and repo-rule updates as separately authorized operations.

**Per-batch independent critique (2026-10-09):** A separate Arabic-visible comparison pass must challenge omissions, doctrinal shifts, negation, numbers, pronouns, source questions and notes; record its source-unit coverage, findings and exact target revision. Watchdog anomalies prompt investigation, not automatic error claims. Source maps, scoped terminology decisions, questions, formatting proof and regression outcomes must remain attributable to the tested manuscript revision. These gates supplement rather than replace the edition-wide rules below.


### 8.3 Calibrate uncertainty detection independently of question volume

Maintain a representative, source-verified **challenge set** for the active scholarly Arabic-to-English profile: polysemous technical terms across legal/theological contexts, source/OCR damage, hard pronoun/negation/number dependencies, quotations/footnotes and ordinary passages with no true ambiguity. Each case records the exact source passage, context, expected issue category and reviewer-vetted disposition; include negative controls so indiscriminate questioning fails as well as silent omission.

For each material translator prompt/model/profile change, have the candidate translator analyze these cases *without seeing the answers*. Compare its **issue identification recall and precision, fidelity/source coverage, correct abstention on illegible text, and useful question quality** against a frozen earlier baseline. Track misses and false positives by category and passage, not only aggregate totals or number of questions raised. A deterministic scoring harness and sample fixtures establish evaluation plumbing only; **they do not establish real translator quality** until the actual engine's outputs have been scored against reviewer-validated Arabic source cases. Prevent the same model's self-graded output from being mistaken for independent human calibration.

## 9. Use exact work-state language

Distinguish at least:

- **translation in progress / partially translated** — some in-scope content remains untranslated or unverified;
- **text-complete** — every editable/extractable text surface in the declared scope has been translated and the zero-Arabic text gate passes;
- **publication-QA verified** — text completion plus structural, image, formatting, and rendered-edition checks pass for the declared publication scope.

Do not collapse a successful batch edit, translated chapter, inserted TOC, or mostly-English document into `complete`. The mandatory final TOC refresh must also have been performed on the exact final layout.

## 10. Recover from residual Arabic as a process failure, not an exception

If readable Arabic survives in an English-only target:

- locate the exact surface and why it escaped the active method;
- repair the highest shared cause when possible (for example, unhandled footnote segments or image text) rather than patching only the one visible instance;
- rescan the whole declared denominator after the repair;
- preserve already-correct English work;
- update any coverage/checkpoint state so the same class of omission does not recur later in the document.

The governing invariant is:

> **For an English-only Arabic-book translation, every in-scope readable source-language element must either be rendered into publication-quality English/Latin-script bibliographic form or remain an explicit, named blocker. No residual Arabic may be silently treated as finished output.**

## 11. Source-aligned editorial and production release control

The earlier rules establish the necessary gates. For book-length scholarly translations, apply these additional operational distinctions when material. The reusable incident/reconciliation rationale is consolidated in `evidence/ARABIC-BOOK-TRANSLATION-STANDING-NOTES-DMSC-RECONCILIATION-2026-09-25.md`; project-specific BOOK2 working trails are retired from Operator's active tree after their surviving lessons are captured there.

- **Edition-matched source recovery:** when the Arabic contains a broken phrase, OCR artifact, incomplete quotation or detached continuation, verify it against the authoritative native file and seek a print/page-image or other independently identified **same-edition** witness. Edition listings, alternative page counts and fluent contextual guesses do not establish the missing wording. Mark the unit `SOURCE-DAMAGED / UNRESOLVED`; preserve recoverable content and use a transparent editorial note where required. Do not pass that unit as source-verified or invisibly supply grammatical connecting claims.
- **Actual bilingual semantic ledger:** count and address source paragraphs, note paragraphs, quotations, front matter and every additional relevant text surface as source→target units. Track `UNREAD / PARTIAL / VERIFIED / SOURCE-DAMAGED` per unit with its source quotation/context, target, source revision, correction, reviewer/evidence, and dependent references. Run contextual checks for technical homonyms and false friends (e.g. Hajj *tamattuʿ* versus temporary marriage, hadith *mawḍūʿāt* versus generic topics), agency/pronouns, negation, numbers, terminology, and bibliographies **inside notes as well as body text**. A polished machine draft or nonempty-paragraph parity is not editorial verification.
- **Keep mechanical proof separate:** zero-Arabic checks, number of source/target paragraph slots, note-anchor/definition parity, hyperlink/bookmark resolution, file validity, term searches, and PDF exports are independent gates. Record the exact candidate hash and scope of each result. Neither 369 linked footnotes nor 940 valid internal hyperlinks, for example, says those notes were faithfully translated or their page placement is good.
- **Regenerate the required target-native English TOC from English pagination:** a bookmark that resolves may still display a stale page number. Update/refresh all entries only after the final English layout is otherwise complete and verify them against the rendered pages. Any later content, heading, note, font, spacing, pagination, or other layout-affecting edit invalidates TOC evidence and requires another terminal refresh.
- **Stress the layout denominator:** include the longest note and continuation cases in the pilot, but treat a sample as a sample. Render the **entire exact final book** and inspect every page where the publishing claim requires full-page QA. If full rendering times out, diagnose notes/engine or safely segmented alternatives with documented page continuity; a failed render never becomes an implicit layout pass.
- **Treat Google Docs conversion as a separate migration:** test the exact finalized DOCX by importing a *new* target and reading back headings, body, note count/content, links, direction, styles, and pagination where observable. A connector argument-binding failure proves only that attempted route failed. Success on an older DOCX, or an import request accepted without post-import comparison, cannot certify the current edition.
- **Release gate is conjunctive and version-bound:** source fidelity including notes, source-damage disposition, term consistency, structural correctness, **presence + terminal refresh of the required target-native English TOC**, all-page rendering/visual review and requested destination-format readback must each be PASS for the same released artifact. OPEN/BLOCKED is not publication-ready; preserve the working draft and name the unresolved gate rather than implying background completion.


## 12. Reuse prior review when source authority changes

A later discovery that the working Arabic witness was incomplete, damaged, mis-segmented, or lower-authority than another same-edition witness does **not** automatically invalidate every earlier translation review. Treat this as a source-reconciliation problem.

When substantial prior review exists:

1. **Freeze identities first** — hash/version the authoritative source, current English candidate, and the prior review ledger or evidence package.
2. **Establish the historical denominator** — record what the earlier review actually covered and against which source witness. Preserve its original status semantics.
3. **Crosswalk old reviewed units into the current manuscript** — use stable IDs, hashes, exact/position-aware matching, note ownership, and version lineage as appropriate.
4. **Classify dispositions instead of making one giant error queue** — distinguish at least:
   - unchanged / still traceable;
   - expected structural movement such as note re-homing or TOC reflow;
   - actual semantic/source-backed edits;
   - identity-ambiguous matches;
   - source-damaged or source-contradictory units;
   - units whose old evidence no longer reaches the stronger source.
5. **Carry forward only the warrant that still survives** — prior semantic review may remain valid evidence where the relevant source/target meaning is unchanged, but unchanged text alone does not become newly certified against a stronger printed source.
6. **Target the weakened units** — inspect changed, ambiguous, source-damaged, or insufficiently witnessed units against the strongest authoritative source. Do not restart the whole book merely because a bounded subset lost warrant.
7. **Permit a no-edit result** — if the stronger witness shows that the current English is already correct, record the resolution and leave the manuscript untouched. Review work can increase confidence without changing text.
8. **Preserve source anomalies as source anomalies** — contradictions, malformed wording, unclear referents, impossible dates as printed, or damaged spans become explicit editor/source queries unless authoritative evidence supports a correction. Do not silently harmonize the author.

A triage queue is not an error count. A historical PARTIAL state is not proof the current translation is wrong. A changed unit is not automatically a defect.


### 12.1 Report stronger-source reconciliation without erasing completed review

Source-qualified status is part of correctness. If a whole-book review was completed against one working witness and a later stronger witness changes the source hierarchy, communicate **both** facts:

- what prior review actually completed, including its denominator and source witness;
- what the stronger source invalidated, weakened, or left open;
- what bounded reconciliation/certification work remains now.

Do not summarize this state as “the full translation audit is still left” or “nothing is certified” when that wording would erase substantial completed review. “Fully reviewed against the earlier Arabic DOCX” and “not yet fully certified against the authoritative printed source” can both be true; when material, state both.

Every remaining count must name its category and denominator. A `changed`, `unmapped`, `PARTIAL`, `query`, or `needs print witness` count is not an error count unless the evidence actually establishes errors. Prefer language such as “37 targeted source uncertainties remain” over “37 passages are wrong.”

This rule exists to prevent unnecessary blanket re-review and to keep status summaries aligned with the actual evidence history.

## 13. Separate manuscript versions, evidence checkpoints, and human-review state

Use distinct version semantics:

- **manuscript version** — changes only when the English manuscript itself materially changes;
- **evidence / reconciliation checkpoint** — changes when lineage, source witnesses, dispositions, confidence, or reviewer instructions change without changing the manuscript;
- **release candidate** — the exact post-review artifact on which all release gates are rerun.

Do not relabel an unchanged manuscript as a newer book version merely because another audit pass occurred. Bind every mechanical, semantic, visual, and reviewer claim to the exact artifact hash/version it tested. Filenames and workspace paths are not sufficient identity when byte drift or regenerated exports are possible.

### 13.1 Human content review is a bounded milestone, not certification

A manuscript may be ready for independent human content review when:

- the assistant's known source/reconciliation queue is bounded enough to hand off coherently;
- every still-open item is classified as a concrete translation question, source anomaly, bibliographic issue, or editorial judgment rather than an undifferentiated "needs review" bucket;
- the reviewer can identify the authoritative source and exact English candidate;
- earlier good review is preserved so the reviewer need not be falsely told the whole book has never been examined.

The reviewer handoff should include the immutable source identity, exact candidate identity, unresolved query ledger, relevant provenance/lineage, and explicit non-harmonization warnings for source anomalies.

This does **not** establish that a reviewer has been engaged, reviewed the manuscript, or approved it. Independent approval must be genuine and tied to the exact final artifact.

After human decisions are integrated, create a new frozen candidate and rerun every affected semantic, structural, **target-TOC gate**, note, destination-format, and all-page visual gate. The TOC refresh remains the terminal production step after all resulting layout changes. Human content review and publication production may proceed in parallel only where their changes cannot invalidate one another's evidence.



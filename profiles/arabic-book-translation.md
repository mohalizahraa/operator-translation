# Arabic Book Translation Profile

Use with Core + THINK + ACT + KNOWLEDGE + ASSURANCE for Arabic→English books, manuscripts, long-form scholarly/religious works, or other publication-oriented document translation where fidelity, complete text-surface coverage, formatting preservation, and a clean English or explicitly bilingual edition matter. Add other Operator owners/profiles whenever their concern is materially relevant.

This profile is additive, not a separate operating system: apply the rest of Operator by dependency, while keeping project truth cleanly separated. Do not import unrelated project-specific context, decisions, or machinery (for example Nexus) into translation work merely because both use Operator; load only the active translation project's own authorities when relevant.

This profile specializes translation procedure. It does not weaken source authority, execution, documentation, or verification rules owned by the parent protocol.

## Haydari Translation Workbench integration

For Sayyid Kamal al-Haydari translation/publication work, the canonical shared Workbench is:

> **https://haydari-translation-workbench.pages.dev**

Treat that Workbench as the live operational surface for project assignment, linked English Book targets, canonical Arabic-PDF access, source-page translation progress, workflow status, and publication-tracking state. When those fields are material to the active task, retrieve current Workbench state rather than relying on remembered chat/repository status, and keep the Workbench synchronized with verified progress and lifecycle changes produced by the work.

The Workbench's own project contract remains authoritative for its field semantics, status transitions, access invariants, progress/checkpoint rules, and deployment behavior. Do not duplicate those mechanics into this profile; use the current Workbench/project authority and preserve the URL above as the stable discovery point.

### Fast-start / resume path for Haydari translations

For a Haydari request to **start, continue, resume, or finish translating a book**, classify the request before retrieval and use the Workbench's machine-readable translation/project contract directly. Do **not** begin by browsing the Workbench frontend, running ordinary web search, reconstructing from chat history, or rediscovering already-known source/target URLs.

- **Known project/book:** retrieve its composite translation context directly from `/api/projects/{id}/translation-context`.
- **Continue / resume with a known collaborator:** retrieve `/api/translations/current?assignee=<name>`. This route intentionally resolves only an eligible `in_progress` project. A successful response with `current_translation: null` means **there is no active translation for that collaborator**; it is not a retrieval failure and should not trigger repeated retries or frontend discovery.
- **Start the next/new assigned book:** do **not** use the current-translation endpoint as the discovery route. Retrieve `/api/projects` directly, preserve the Workbench API's returned priority/order, filter to projects whose status is `not_started` and whose assignee is the collaborator or `Both`, and select the first eligible project unless stronger explicit project/user priority overrides that order. Do not silently substitute an `Unassigned`, review, completed, or published project when no eligible assigned project exists.
- After resolving a next/new project, retrieve `/api/projects/{id}/translation-context` for that exact project. Establish the English target before content work; if the Workbench has no linked English Book yet, create/link the persistent translation document through the available authorized document capability. Move the selected project through the Workbench project contract into the Translating/`in_progress` state before advancing translation progress so future `continue` requests can resolve it deterministically.
- Use a **direct HTTP/JavaScript-capable fetch or connector path that can read JSON API responses**. If one generic page/web retriever cannot expose a known API route, switch immediately to an API-capable retrieval path rather than spending attempts on frontend browsing, search-engine discovery, or repeated access through the wrong transport.
- Treat the resolved context as an **operational projection over existing owners**, not as a new semantic source. The canonical Arabic PDF remains the semantic and physical-page authority; the linked English Book remains the mutation target; verified checkpoints/markers govern resumable progress; stored transcript, mirror, OCR, or other recovery routes are access witnesses whose recovered wording must still be aligned back to the canonical PDF before source-page progress advances.
- Once the context is available, open the linked target and the indicated canonical/recovery source route directly and continue from the verified source-page boundary. Do **not** re-discover the PDF or English Doc from the frontend/search when the context already supplies them.
- **Live Workbench synchronization is part of translation execution, not an end-of-book cleanup step.** After each verified source-page batch is written to the linked English Book and read back successfully, immediately publish the matching source-page checkpoint through the Workbench's dedicated progress/checkpoint contract (or its verified progress-marker sync path when that is the project-authorized mechanism), then read the Workbench state back and confirm the correct project/count before beginning the next batch. Never advance the live counter from extraction alone, unreadable pages, unverified draft text, or a write that has not been read back. If checkpoint publication fails, preserve the verified manuscript work but repair/reconcile the Workbench checkpoint before continuing far enough that resume state could become materially stale.
- Fall back to the normal source-access/reconciliation ladder only when the direct Workbench contract is unavailable, internally stale/conflicted, points to an inaccessible route, lacks a witness needed for the current source defect, or disagrees with stronger live source↔target evidence.
- When work discovers a reusable source-access fact that would otherwise need to be rediscovered later—such as a clean same-work transcript series, mirror, page-alignment rule, or recurring extraction defect—persist it through the Workbench's source-pack owner after verification instead of leaving it only in chat memory.
- If Workbench context, the English Doc, and source evidence disagree about the resume boundary, reconcile that conflict first. Speed never authorizes duplicate translation, skipped source units, guessed damaged text, or an unverified progress advance.


## 0. Interpret translation and formatting shorthand as full-profile work

For any Arabic→English book or manuscript governed by this profile, user wording such as `translate this book`, `format it`, `do a formatting pass`, `finish formatting`, or `do another formatting pass` automatically inherits this profile. The user does not need to restate its individual rules.

A **formatting pass** is not a cosmetic spot-fix. It means apply and verify the **entire currently applicable translation-profile formatting and production contract across the whole edition**, including the active edition-formatting profile/overlay and every applicable requirement for semantic document roles, notes, the native TOC, major openings, page boundaries, typography, indentation/spacing, sacred-glyph rendering, image/text presentation surfaces, pagination properties, and final rendered checks. Reuse already-valid evidence and already-correct work rather than redoing it for activity's sake; a formatting pass does not by itself require retranslation or reopening source-fidelity review that is still valid. But any known unmet requirement in this profile that affects the edition's claimed formatting or publication state must be repaired or remain an explicit blocker.

When translation and formatting are requested together, completion is conjunctive:

> **translation/text gates pass + the full applicable formatting/production profile is applied + invalidated downstream evidence is rerun + the terminal native-TOC fixed-point/render verification passes.**

Do not call a formatting pass `done`, `complete`, or equivalent after only fixing the examples the user named, after a sampled/structural check, or while a known applicable profile requirement remains unmet. Whole-book denominators and outlier-driven class scans still apply. If an applicable profile requirement cannot be satisfied with the available tooling or authority, state the exact blocker and do not report the formatting pass complete.

## 1. Treat the target as an English edition, not a summary

When the user requests an English translation of an Arabic book/document, preserve the source's meaning and structure while producing natural English suitable for the intended readership.

Unless the user explicitly asks for adaptation, abridgment, modernization, commentary, fact-checking, harmonization, or rewriting:

- translate rather than summarize;
- preserve the author's argumentative, polemical, theological, historical, rhetorical, and evidential stance rather than softening or correcting it;
- preserve meaningful ambiguity instead of resolving it by invention;
- preserve quotations, citations, references, dates, numbers, names, source attributions, cross-references, and logical relationships;
- render the result in natural, publication-quality English rather than literal machine-English when a faithful idiomatic rendering is available.

For an **English-only edition**, readable Arabic script is not a harmless remainder. It is an untranslated defect unless the edition explicitly authorizes a named exception such as a sacred honorific glyph. A bilingual edition follows the separate pairing/completeness gate in §7.1.

### 1.1 Revise against the Arabic source, not against the prior English

When an authoritative Arabic source and an existing English draft both exist, the governing Arabic source/witness hierarchy is the **semantic authority**. The English draft is a scaffold and prior work product: preserve it where it is already faithful, but never let its wording, omission, or fluency overrule the source.

For editorial review or retranslation:

- review **line by line at the logical source-unit level**, checking every sentence, clause, quotation, Qurʾanic/hadith reference, note, and other meaning-bearing element against the Arabic;
- account for every material proposition, qualifier, negation, contrast, example, attribution, pronoun/agent relationship, evidential relationship, and logical connection; do not silently omit, summarize, compress, merge away, soften, intensify, or invent content;
- natural English restructuring is allowed when it improves readability **without losing reconstructable source→target meaning**; line-by-line review does not require wooden word-for-word English;
- preserve already-correct English instead of rewriting for activity's sake. Repair a bounded span when a local correction fully restores meaning and fluency; rewrite the whole logical unit when patching would leave broken logic, terminology, grammar, or style;
- give later, denser, or more technical sections the same scrutiny as earlier sections. Strong earlier draft quality is not evidence that later material may be sampled or trusted without review;
- if Arabic is missing, truncated, garbled, internally contradictory, or unmatched to the English, identify the exact source gap/location and route it through the source-witness rules in §11 rather than guessing.

The readability target is **accuracy + easy comprehension**: prefer clear syntax, reasonably short sentences, and simple vocabulary where they preserve the author's precision, rhetorical force, technical distinctions, and argument structure.

## 2. Preserve the original source by default

Default source-safety rule:

> **The original Arabic source remains untouched unless the user explicitly authorizes in-place replacement.**

For translation work:

- identify the authoritative Arabic source and its version/revision when available;
- create or use a separate translation target;
- preserve source provenance so the translation can be checked against the exact Arabic edition used;
- do not use a failed, partial, machine-corrupted, or already-translated derivative as the semantic source when the authoritative Arabic original is available;
- never erase the original merely because a duplicate/editing route is more convenient.

Before destructive replacement, re-confirm that the intended target—not the source—is being mutated.

### 2.1 Create a separate live translation document for supplied PDF/book sources

When a user supplies a PDF or other book/manuscript file for translation under this profile, create a **new translation document** as the working target when the active environment provides an authorized document-creation capability. Do not edit or replace the supplied source merely because it is the easiest surface to mutate, and do not leave a book-length translation only in chat when a persistent document target is available.

- preserve the supplied source unchanged as the semantic/source witness;
- give the translation target a clear edition/work title and use that **same document** as the live target throughout the job unless the user requests a different artifact strategy;
- write verified translation into the target sequentially as source units are completed, preserving structure, notes, and the active edition/formatting overlays;
- if the user supplies a separate reference document/PDF for formatting, treat it as a presentation witness and apply its relevant formatting to the new translation target without overwriting the reference;
- when the user wants to follow progress, surface the working document link after creation and keep progress reporting tied to what has actually been written there;
- always present the translation-document link again when the requested translation is complete;
- if document creation or writing is unavailable, unauthorized, or fails, name that blocker explicitly and do not imply that a document artifact exists.

For small ad hoc passage translations where the user clearly requests only an inline answer, a new document is not required. This rule governs document/book translation workflows, not every isolated translation request.

## 3. Translate every human-readable text surface in scope

A whole-book translation is not complete when only the main body is translated. Inventory and process all text-bearing surfaces that belong to the edition, including as applicable:

- cover/title/front matter;
- title pages, author/editor lines, dedications, prefaces, introductions, acknowledgments;
- a **target-edition English table of contents is required for every book under this profile unless the user explicitly opts out**; it is generated from the English edition's actual heading hierarchy rather than treated as a literal translation of a source TOC. Any source TOC remains a required structural witness even when its exact layout/order is not reproduced;
- chapter/section/subsection headings;
- body paragraphs, lists, block quotations, poetry, captions, labels, callouts, sidebars, text boxes, and annotations;
- tables, cells, column/row headings, figure labels, diagrams, and chart text;
- footnotes, endnotes, marginal notes, note markers where textual;
- headers, footers, running heads, section labels, and other repeated page furniture;
- hyperlinks or cross-reference labels when the visible label is Arabic;
- appendices, glossaries, indexes, bibliographies, source lists, publication data, and references;
- readable Arabic embedded in images, scans, screenshots, diagrams, seals, or other raster/vector artwork when the requested deliverable is an English-only publication.

Do not silently omit a surface because the host represents it in a separate segment, object, note store, header/footer collection, drawing layer, image, or other non-body structure.

If a text-bearing surface cannot be edited with the available tooling, that is a completion blocker for a publication-ready English-only claim unless the user explicitly excludes it.

### 3.1 Treat footnotes/endnotes as first-class translation content

Notes are not peripheral cleanup. Translate and review author/source notes to the **same semantic standard as body text**, including long notes and notes containing quotations, chains, bibliographies, argument, or technical terminology.

- preserve note order, native numbering/anchors, note ownership, and continuation structure;
- preserve **note placement semantics**: when the source uses footnotes, implement them as native footnotes attached to the corresponding callout so the host lays them out in the page footnote area; do not simulate footnotes as ordinary body paragraphs, parenthetical inline notes, or a manually collected endnote block unless the source edition itself uses that structure or the user explicitly requests it;
- **legacy-footnote migration is mandatory, not optional cleanup:** if an existing translation contains body-flow paragraphs such as `Footnote: …`, superscript-number-plus-body-text substitutes, manually typed note blocks, or any other simulated footnote, treat that structure as defective. For each such note, identify its exact source-corresponding anchor, create a native footnote at that anchor, move the complete note text into the native footnote container, preserve note order/ownership, and delete the simulated body paragraph only after the native note is populated and verified. Never leave both copies in the deliverable;
- **legacy-note detection must be exhaustive before migration:** scan the entire editable body for every simulated-note form used by the inherited draft, including unnumbered and numbered labels (for example, \`Footnote:\`, \`Footnote 1:\`, \`Note:\`, \`Note 2:\`, \`Endnote:\`), superscript-number-plus-body-text substitutes, and manually typed note blocks. Do not declare the document clean from a search that recognizes only one literal prefix. Record the pre-migration count by form and require all defective body-flow forms to reach zero after migration.
- **never infer a callout merely as “the end of the previous paragraph” when the source gives a more precise location:** resolve the source-corresponding anchor from the source page, inherited marker, or unambiguous local context. When several notes belong to one passage, preserve their source callout order exactly; do not create them in an order that can yield joined/reversed markers or swapped page-bottom notes.
- **native-container population must be verified before body deletion:** after creating each native footnote, read back the native footnote segment and prove that the complete intended note text is present there. A native marker with an empty or wrong note container is a failed migration even if the body also contains the note text.
- **rendered verification is mandatory for footnote migration:** connector/API structure is not sufficient proof. After a migration batch, create a fresh rendered export (preferably PDF) and inspect representative migrated pages plus every anomaly class found during the batch. Verify that (1) the ordinary body contains no simulated note prose, (2) each callout is visible at the intended textual anchor, (3) the corresponding note text appears below the host footnote separator/page-bottom area, (4) multiple notes render in the correct order, and (5) long notes continue only through the host's legitimate footnote continuation behavior. Do not report the migration complete from note counts, nonempty segments, or style checks alone.
- **numbering fidelity is source-relative, not label-relative:** compare the rendered native numbering/order against the authoritative source and the source-corresponding callouts. Do not treat stale inherited labels as authoritative numbering, and do not “fix” continuous native numbering merely because a legacy body label restarted at 1. If the host cannot reproduce a source numbering scheme natively, surface the limitation before substituting a simulated scheme.
- **page-bottom placement is an acceptance condition:** a source footnote must render in the host's native footnote area at the bottom of the page containing its callout (subject only to the host's legitimate continuation behavior for a long note). It must not consume ordinary body-flow space between surrounding prose paragraphs. If a screenshot/render shows `Footnote:` prose between body paragraphs, the note migration is incomplete even if its wording is correct;
- place each footnote callout at the source-corresponding textual anchor, keep the note text in the native footnote container, and verify after editing that the callout↔note linkage, numbering/order, and rendered page-bottom placement remain intact; a visually smaller body-text paragraph is not a valid substitute for a footnote;
- translate the full note without silent compression, skipped clauses, or bibliographic loss;
- review note prose line by line against its source just as body prose is reviewed;
- keep author/source notes distinct from translator/editor additions;
- add a clarifying translator/editor note only when it materially helps comprehension or scope, label it so it cannot be mistaken for the author's note, and include transliteration/scope only where useful.

## 3.2 Require a target-native English table of contents

Every book produced under this profile must contain an **English table of contents** unless the user explicitly opts out for a particular edition. This is a target-edition production requirement, not a requirement to reproduce the source TOC literally.

- **Default placement:** put the TOC in the opening front matter, after the title page and any mandatory copyright/imprint page, and before the preface/introduction or first substantive chapter. **The TOC begins at the top of a fresh page by default; do not vertically center the TOC page with a large spacer.** If an authoritative edition/template or explicit user direction requires a different front-matter order or deliberate placement, preserve that stronger authority.
- **TOC font-family lock — Amiri everywhere:** every table of contents produced under this profile uses **Amiri** for all editable TOC text and page numbers. Do not inherit Arial, Google Docs host defaults, source-template TOC fonts, or mixed fallback fonts. This is a global user-owned publication rule and overrides ordinary edition/template typography unless the user later explicitly changes the TOC font rule. Normalize the complete native TOC to Amiri and the edition's approved TOC size/weight, and render it as plain black text. Preserve native navigation/link semantics without allowing host-default blue text, blue page numbers, underlines, or mixed default fonts to surface in the published TOC. Sacred/honorific glyphs may retain their approved glyph font only where required for glyph coverage while matching the TOC's black presentation.
- **Generate from the target hierarchy:** build the TOC from the verified English heading structure. Use the source TOC as corroborating structural evidence, but do not copy stale Arabic-edition page numbers or mechanically reproduce source-only ordering/labels when the English edition's actual hierarchy differs.
- **Native TOC means the destination's actual TOC object, not a hand-built contents list.** In a native Google Doc, `TOC` / `table of contents` means Google Docs' built-in dynamic **Table of contents** element generated from the document's native heading styles. A typed list of headings, a generated static contents block, manually maintained links, or hand-entered page numbers does **not** satisfy the TOC requirement, even if it visually resembles one. Treat the heading hierarchy as the semantic source that feeds the native TOC; do not simulate the TOC itself with ordinary paragraphs. If the active authorized toolchain cannot create or refresh the required native TOC, exhaust materially viable native routes and then report the exact production blocker rather than silently substituting a static TOC. A static/generated fallback is permitted only when the user explicitly authorizes that fallback for the edition.
- **Google Docs native-TOC execution route:** when the target Google Doc is already link-editable under the edition workflow, use the zero-paid self-hosted UI adapter at `.github/workflows/google-docs-native-toc.yml` + `scripts/google-docs-native-toc.mjs` to perform native `insert` or `refresh` through the real Google Docs editor. Do not change sharing solely to enable this adapter. After the UI action, verify through the Docs connector that an actual `tableOfContents` structural element exists; after terminal refresh, verify the displayed entries and page numbers against the final PDF render. A browser-run success alone is not completion evidence.
- **Terminal-refresh invariant:** the **very last structural pagination action** is to update/refresh the TOC after every other content, heading, footnote, typography, spacing, pagination, front-matter, and layout change is complete. No later manuscript/layout edit may occur without invalidating the TOC and requiring another terminal refresh.
- **Native-refresh presentation normalization:** a Google Docs native TOC refresh may restore host-default typography, hyperlink blue, or underlining. After every native refresh, reapply **Amiri** across all editable TOC text/page numbers plus the active edition's TOC size/weight and black presentation rules **without removing the native TOC structure or its links**. This post-refresh normalization is part of the terminal TOC operation, not an unrelated later manuscript edit.
- **TOC fixed-point / stabilization loop:** refresh the native TOC → normalize its presentation → export/render → verify TOC entries and page numbers against the actual rendered destinations. If the presentation normalization changes wrapping, TOC length, downstream pagination, or any displayed page number, repeat the refresh + normalization + render cycle until the **styled** native TOC and the final rendered pagination agree without further change. Do not certify a TOC from the pre-style refresh state.
- **Final verification:** after the stabilized terminal refresh, confirm that the TOC is present near the beginning on its intended fresh page, contains the intended headings in the correct hierarchy/order, uses **Amiri** consistently across all editable TOC text/page numbers, renders in plain black without host-default blue/underline styling, and that displayed page numbers/links match the final rendered edition.

> **Final-step rule:** finish translation and formatting → freeze the final layout → refresh/update the TOC → normalize TOC presentation → render and verify → repeat refresh/normalization if styling changed pagination. The terminal state is the first stable rendered fixed point.

## 4. Preserve scholarly/religious terminology faithfully

Choose consistent English forms for recurring technical terms and names. Maintain a terminology decision ledger when the work is long enough that drift is plausible.

As applicable:

- preserve recognized Shia/Islamic technical distinctions rather than flattening them into generic English;
- preserve Qur'anic and hadith references, surah/verse identifiers, isnad/source relationships, volume/page notation, and bibliographic identity;
- render honorifics according to the active edition/project specification; when no special convention exists, use clear English rather than leaving unexplained source-language honorifics;
- preserve Hijri dates and identify them clearly in English notation, e.g. `1435 AH` where appropriate;
- convert Arabic-Indic digits and Arabic punctuation into the English edition's normal typographic forms unless the edition specification requires otherwise;
- transliterate proper names and work titles into Latin script when identity requires it, optionally adding a concise English gloss where useful;
- do not leave Arabic script merely because a proper noun, quotation, title, source citation, or technical term is difficult to render.

A bilingual presentation is a separate edition mode. Do not infer bilingual retention from the fact that the source is Arabic; when it is requested, use the pairing/completeness rules in §7.1.

Machine translation or another bulk translation engine may be used as a drafting aid only when the resulting text remains traceable to the correct source unit and receives the same terminology, fidelity, and publication-QA review as any other draft. It is not semantic authority and does not relax the English-edition acceptance gates.

## Translation/editorial overlays — versioned and scope-bound

Recurring user/project conventions should be preserved as **named, versioned overlays** instead of being silently promoted into universal Arabic-translation law. An overlay may specialize terminology, honorifics, quotation characters, transliteration density, explanatory-note policy, or prose style; it may not weaken source fidelity, completeness, provenance, or release evidence.

When an activated overlay conflicts with a generic stylistic default in this profile, apply Core's scoped authority rules. Keep translation semantics separate from presentation: a semantic review should not manufacture visual emphasis merely because a formatting profile later uses bold, color, spacing, or other styling.

### Translation Overlay v1 — al-Haydari scholarly works

**Status:** user-established project overlay; not a universal default for every Arabic book.

- The Arabic source controls semantic correctness; an older English draft is a scaffold to verify and reuse where correct.
- Preserve full clause-level meaning with no silent compression. Footnotes and long notes are reviewed in full and remain in their source order.
- Prefer accurate, easy-to-understand English with short, natural sentences and simple vocabulary where technical precision is preserved.
- Transliterate **core technical terms only** when transliteration carries identity or a distinction that useful English alone would lose; do not transliterate merely to sound scholarly.
- **When Arabic names, titles, work titles, or technical terms are rendered in scholarly Latin-script transliteration, preserve the edition’s transliteration diacritics consistently rather than silently stripping them.** This includes the materially identity-bearing marks used by the active house system (for example `ā`, `ī`, `ū`, `ḥ`, `ṣ`, `ḍ`, `ṭ`, `ẓ`, `ʿ`, and `ʾ`). A conventional fully Anglicized form may remain only when the project glossary deliberately chooses it; do not mix an undiacriticized form with a scholarly form for the same identity merely because one occurrence is front matter, a heading, a sign-off, or a citation.
- Maintain a project terminology/glossary ledger and keep fixed terms stable across body text, notes, headings, and later revisions. Offer alternatives only when a real ambiguity or editorial decision makes them useful.
- **Source/target TOC policy for this overlay:** inspect any source TOC in full as structural evidence, but do not mechanically translate or reproduce an end-of-book Arabic TOC as the English edition's navigation. Every al-Haydari book receives a target-native English TOC near the beginning of the book, generated from the verified English heading hierarchy and refreshed from the final English layout.
- External/cited book titles are italicized. Translator-added clarification is used only when it materially helps and remains distinct from authorial notes.
- During semantic translation/review, do not invent bold emphasis. A separately selected formatting profile may apply its own role-based bold/italic/color system afterward.

Established terminology for this overlay includes:

- `سنة واقعية` → **actual Sunnah**;
- `سنة محكية` → **reported Sunnah**;
- preserve the established distinction **primary derived Sunnah / secondary derived Sunnah** where those categories occur;
- `العرض الموضوعي` → **subject-centered evaluation**;
- `آلية الرصد` → **Completing the process of mapping**;
- `آلية العرض` → **Completing the process of evaluation**;
- `آلية النقد` → **Completing the process of critical evaluation**;
- `آلية البوح` → **Completing the process of disclosure**;
- `التابعي` → **Follower** when the technical generation/classification is intended;
- prefer **theology** over **doctrine** when the Arabic denotes theological inquiry/discipline or the established project concept; do not mechanically replace *doctrine* when the source genuinely means a doctrinal proposition.

### Sacred notation / Qurʾan-hadith overlay v1

**Status:** scope-bound convention for projects that activate these forms; not a universal requirement for every English edition.

- Arabic Qurʾanic source text uses `﴿ … ﴾`; English Qurʾanic translation uses the flipped form `﴾ … ﴿`.
- Hadith/narration matn uses guillemets `« … »`; nested ordinary speech may use English curly quotation marks.
- When the project specifies it, an English Basmalah is presented without Qurʾanic verse brackets.
- When the project specifies it, use `﵊` for the Imams and other revered figures/companions covered by that project, and `﵋` for later Shia scholars. Do not broaden either symbol to people the project has not assigned it to.
- When the project specifies it, append `ﷻ` after “Allah” and after pronouns explicitly referring to Allah, consistently with the project's house style.
- For hadith-chain prose where the project has selected the house form, preserve the pattern `X from Y ﵊, who said: «…»` while still following the source's actual chain and attribution.
- In an English-only edition, authorized standalone sacred glyphs such as `﵊`, `﵋`, `ﷺ`, or `ﷻ` are **named Unicode exceptions**, not untranslated source text. Whitelist only the exact approved glyphs; never exempt an entire Arabic Unicode block.

### Standing dialogue, honorific, quotation-emphasis, and register cleanup standard

**Status:** standing user-established default for future Arabic→English scholarly/religious book projects under this profile unless a stronger project-local authority explicitly overrides it.

- **Honorifics are semantic notation, not name-only decoration.** Where the referent is unambiguous, apply the active sacred glyph after the explicit name/title **and after pronouns or possessives that refer to that sacred/revered person**. Examples include `Allah ﷻ`, `He ﷻ`, `Him ﷻ`, `His ﷻ Book`; `the Prophet ﷺ`, `his ﷺ mission`, `his ﷺ teaching`; and the corresponding project-approved `﵊` / `﵋` usages for Imams and later Shia scholars. Do not attach a glyph when the referent is genuinely ambiguous.
- Prefer the approved compact glyph over verbose prose honorifics such as “exalted is He” when the edition has adopted the glyph convention. A cleanup pass should normalize old prose honorifics into the active glyph form without damaging syntax or punctuation.
- The standing Shia-book convention is `ﷻ` for Allah and unambiguous divine pronoun references, `ﷺ` for the Prophet Muḥammad and unambiguous references to him, `﵊` for the Imams and other project-approved revered figures, and `﵋` for Sayyid Kamāl al-Ḥaydarī and other later Shia scholars covered by the project. **Names embedded in institutions, presses, place names, or unrelated people are not honorific targets merely because the same string occurs.**
- After inserting or replacing a sacred glyph, reapply the project’s sacred-glyph font/size exception. **In an editable publication target, keep the glyph in its own style run where the host permits so its approved glyph font is explicit rather than inherited from adjacent Latin text.** Do not let an inserted glyph inherit ordinary Latin body styling by accident; a correct Unicode character that renders blank, as tofu, or in the wrong fallback font is still a glyph defect.
- **Dialogue speaker labels:** in interview/dialogue works, bold only the speaker label/name plus its colon at the start of each turn (for example, **Kassār:** or **al-Ḥaydarī ﵋:**), leaving the speech itself in the normal body style unless separately emphasized.
- **Dialogue opener cleanup:** when a dialogue number/ordinal and its title form one semantic opener, prefer the compact single-line form `Dialogue X: Title` rather than a label on one line, an empty gap, and the title on another line, unless a source- or project-specific design explicitly requires the split form. Remove accidental blank paragraphs/gaps around these openers.
- **Cited quotation emphasis:** when prose introduces a directly quoted statement from a scholar, source, hadith, report, or other cited authority, bold the **quoted passage itself** when the active edition uses this readability convention. This does **not** mean mechanically bolding ordinary bibliographic metadata or every source reference. Preserve Qurʾanic color/bracket rules and nested-quotation structure.
- **Register-aware translation is mandatory.** A dictionary-possible rendering is still defective if it sounds calqued, childish, casual, or unnatural in an academic theological context. Review headings, body, and notes for awkward literalism and choose the English term that fits the concept and register while preserving the Arabic distinction. In particular, do not mechanically render `شخصية` as “person” or “personality”: depending on context use **identity**, **character**, **personhood**, or another source-faithful academic equivalent. The same principle applies to other Arabic abstractions whose literal English cognate reads unnaturally.
- Run this cleanup across **all text-bearing surfaces**, including native footnotes and end matter, not only the body. A whole-document completion claim requires the same convention to be checked in notes, quoted source passages, headings, and dialogue labels.

## 5. Preserve structure and formatting without sacrificing correctness

Preserve the source edition's semantic organization as closely as the target format permits:

- heading hierarchy and order;
- section/chapter sequence;
- paragraph/list boundaries when they carry meaning;
- tables and note relationships;
- numbering and cross-references;
- bold/italic/emphasis distinctions;
- captions and figure placement;
- images and other non-text content;
- section/page breaks where they are structurally meaningful.

Exact pagination need not remain identical when English expansion changes line flow unless exact pagination is itself required. Structural fidelity matters more than cosmetic page-number matching.

Do not use a bulk replacement technique that destroys notes, links, formatting, tables, objects, or layout merely because it is faster.

## Edition formatting profiles — versioned experiments

Formatting can vary between English editions without changing the translation method itself. Preserve each user-selected edition format as a **named, versioned profile** rather than silently rewriting one standing style contract whenever a new experiment is tried.

- A formatting profile governs presentation only; it does not change semantic translation status, source authority, or publication certification.
- Once a profile has been recorded, keep it reconstructable. Correct factual transcription errors in that profile if discovered, but record a materially different visual experiment as a new version instead of overwriting the old one.
- Applying one profile to one book does not make it the universal default for every translation unless the user explicitly promotes it.
- When a target book uses a different native heading-level assignment from the profile's reference document, map by **semantic hierarchy** (chapter → major section → subsection → lower-level heading) rather than mechanically assuming that the same Google Docs named-style number means the same role.
- **Use the destination’s native named paragraph styles for semantic document roles, not font-size imitation.** In Google Docs, a real title/subtitle/heading must use the appropriate native `TITLE`, `SUBTITLE`, `HEADING_1`, `HEADING_2`, etc. paragraph style when that role is intended. Making ordinary `NORMAL_TEXT` larger or bold does not satisfy a semantic-heading requirement. Conversely, a heading style must cover only the semantic heading paragraph/span: do not sweep explanatory prose, quotations, examples, or an entire body block into H1/H2/H3/H4 merely to achieve its appearance. Audit named-style containment against source/context and hierarchy; length alone is not a demotion rule, because a genuinely long source heading may still be a heading.
- **Reconstruct heading hierarchy before styling it.** Establish each heading's semantic level from the strongest combined source evidence: its actual occurrence and context in the source body; typography and placement; numbering/list structure; surrounding argument structure; chapter-opening outline/teaser material; and the source table of contents when present. Treat the TOC as strong corroborating evidence, not an automatic override: if it abbreviates, omits, flattens, or conflicts with stronger direct source evidence, reconcile the discrepancy before assigning H1/H2/H3/H4. Only after the semantic role is established should a formatting profile map it to visual style and pagination behavior.
- Preserve target-native structures that the reference profile does not define—such as a TOC, running heads, page numbers, or book-specific front matter—unless the user explicitly asks that the profile replace them.
- **Native page-number rule for Google Docs:** when the edition uses page numbers, insert Google Docs’ built-in dynamic **Page number** element rather than typing, generating, or maintaining numeral text manually. The standing book default is the **upper-right header** unless a stronger edition/template decision specifies another placement. Use the zero-paid self-hosted UI adapter at `.github/workflows/google-docs-native-page-numbers.yml` + `scripts/google-docs-native-page-numbers.mjs` when the API cannot create the native element. Verify the resulting page-number furniture in the live document and fresh final render; do not infer success from an automation click alone.

### Formatting Profile v1 — REAL SCALE

**Status:** user-selected experimental format, recorded 2026-09-23.

**Reference artifact:** Google Doc `REAL SCALE` (`15cKfEQlL0eMT3BM9BzW4qUpqDwZf8F6IVxzfAKecUn0`), native formatting inspected from the document structure. The reference was last observed modified at `2026-09-23T04:45:13.488Z`.

**Authority rule:** reproduce the reference's **effective/direct visible formatting**, not merely its Google Docs named-style definitions. The reference contains named-style defaults that disagree with direct formatting on actual headings; direct formatting on representative live paragraphs is the source of truth for this profile.

**Indentation composition rule:** source-edition paragraph indentation remains authoritative where the translation is meant to preserve it. REAL SCALE supplies the visual style around that structure; it does not override source-preserved paragraph indents.

#### Page and body

- Page mode: pages; US Letter, `612 × 792 pt`.
- Margins: `72 pt` top, bottom, left, and right.
- Header/footer margins: `36 pt`.
- Text direction: left-to-right.
- Primary Latin/transliteration typeface: **Amiri**.
- Normal body: **14 pt Amiri**, normal weight, black/default foreground, **115% line spacing**, **12 pt above + 12 pt below**.
- Normal non-list body paragraphs: **0 pt start indent, 18 pt first-line indent, 0 pt end indent**. This preserves the Arabic/source-edition body indentation for this experiment; do not flatten it merely because the REAL SCALE visual reference itself has unindented body paragraphs.

#### Heading hierarchy

Use the following effective hierarchy unless a book-specific semantic role requires mapping to a different native heading number:

- **Chapter / H1:** 24 pt Amiri, bold, centered; representative chapter paragraphs use 12 pt above and 12 pt below.
- **Major section / H2:** 20 pt Amiri, bold, centered; **18 pt above / 6 pt below**; **always begin on a new page** (`pageBreakBefore` or the native equivalent). Map this by semantic hierarchy, not by whatever named-style number a target inherited.
- **Subsection / H3:** 18 pt Amiri, bold, centered; **16 pt above / 4 pt below**.
- **Lower-level heading / H4:** 16 pt Amiri, bold, start/left aligned; **14 pt above / 4 pt below**.
- Headings carry **0 pt start, first-line, and end indents** and should stay with the following paragraph / keep their lines together where the host supports it.
- The opening title/front-page block is a deliberate exception in the reference: approximately **24 pt Amiri, centered, not bold**, arranged with manual line breaks.
- Do **not** promote isolated 15 pt or 19 pt heading-size drift from the reference into the profile. Treat those as local anomalies unless a later profile explicitly adopts them.
- H5/H6 definitions exist in the reference document but were not materially used; do not invent a lower hierarchy from unused named-style defaults.

#### Page-break and dedicated display-page layout

- **Every semantic H2 / major-section heading starts a new page.** A heading such as **Introduction** must be pushed to the next page rather than appearing after leftover text from the preceding section. **Own the break at the opening of the semantic block** (the heading itself or one immediately preceding minimal carrier paragraph), never by putting the forced break on the first body paragraph after the heading; otherwise the heading/basmalah can be stranded on the preceding page while the prose alone advances.
- **Never leave a fully blank page between substantive headings/sections.** A forced H2 break, chapter-opening break, inherited break, or centering spacer may advance content only to the immediately following page; collapse redundant page breaks/spacers that would create an extra empty page. After changing any break ownership, render the transition page and the destination page together: a structurally correct break that produces an empty interstitial page still fails. A dedicated display page is valid because it contains intentional non-body content; an empty interstitial page is not.
- **Dedicated non-body display pages are centered pages.** This includes title/frontispiece pages, foundation/imprint display pages, basmalah/epigraph or standalone-quotation pages, dedication-like display pages, chapter-opening/title pages, and chapter contents/teaser pages when they occupy a page as presentation rather than body prose.
- Treat all content that belongs to one such dedicated page as **one centered visual composition**. Center display-line paragraphs such as the title, subtitle, epigraph, or dedication text horizontally, clear accidental body-text first-line/start indents, and keep the page internally coherent rather than leaving individual lines staggered by inherited paragraph/list formatting.
- **Chapter-opening pages are dedicated chapter-title pages.** The chapter label/title plus any chapter subtitle and chapter contents/teaser lines that belong to that opening page form one visual composition. Keep the chapter label/title itself centered. When the opener contains a multi-item contents/teaser list, **center the list as a block/column beneath the title but left-align the item text to one shared edge rather than centering every unequal-length item independently**. Use consistent wrapping/hanging geometry so long items align cleanly with short ones. Preserve bullets/list markers only when the source or edition semantics support them; if bullets are merely inherited formatting drift, remove them without changing item order or wording.
- When a dedicated display page is intended to stand alone, center that composition vertically as well as horizontally unless the governing source/reference clearly uses a different deliberate placement. For a chapter opener with a left-aligned teaser column, “horizontally centered” refers to the **column as a whole**, not to centering each line inside it. Preserve the dedicated-page effect by ensuring the next substantive body section begins on the appropriate following page.
- Centering is a layout rule, not a semantic rewrite. Preserve wording, order, and genuine source structure; however, **remove accidental bullet/list formatting or hanging indents introduced by the target/editor when the source did not use a list**. Preserve bullets/list markers only when they are semantically/source-supported rather than artifacts of formatting drift.
- When the host lacks a true page-level vertical-alignment control, reproduce vertical centering with a **single calibrated spacer paragraph at the start of the dedicated page** (or another equally stable native layout primitive) and verify it in rendered/PDF output. In Google Docs, top-of-page `spaceAbove` can be suppressed, so do not rely on title `spaceAbove` alone. Put the page break on the spacer when that is the stable route, reduce the spacer line itself to a minimal size (about **1 pt**), use its controlled `spaceBelow` as the centering offset, and remove a redundant page break from the first content paragraph. Do not simulate centering with a long run of blank paragraphs.
- **Rendered verification is mandatory for this rule.** Connector metadata showing `CENTER` is insufficient if the page still looks visually off-center, carries stray bullets, or has uneven inherited indents in the PDF/export. For every dedicated chapter-opening page—not merely a sample—measure the rendered composition after excluding header/footer/page-number furniture. Unless the governing reference intentionally offsets it, the composition's vertical midpoint should be within **12 pt** of the usable page midpoint (equivalently, top and bottom whitespace should be near-balanced within the same tolerance). Recalibrate the single spacer and rerender until the page passes; horizontal paragraph centering does not prove whole-page centering.


#### Semantic text styling

Formatting follows **semantic role**, not punctuation alone. Quotation marks, guillemets, parentheses, or transliteration do not by themselves determine emphasis. Preserve the observed role-specific formatting and compose compatible styles when roles overlap.

**Semantic quotation characters:**
- **Qurʾanic verse text:** in the English target, enclose the exact verse translation in flipped Qurʾanic brackets **`﴾ … ﴿`**. In an explicitly bilingual edition, retained Arabic source verses use **`﴿ … ﴾`**. The brackets belong to the verse span and receive the same Qurʾanic styling as the verse itself.
- **Hadith / narration direct quotation:** enclose the actual transmitted saying/matn in guillemets **`« … »`**. The attribution or isnād may sit outside the guillemets, e.g. `X narrated that the Messenger said: «…»`; do not pull ordinary attribution prose inside them merely to make the whole sentence look uniform.
- **Speech inside a narration or source quotation:** use English curly double quotation marks **`“ … ”`** for the internally quoted speech/dialogue when the edition distinguishes it from the surrounding narration. This can appear between or inside guillemet-delimited hadith material.
- **Ordinary prose quotation / quoted phrase:** use **`“ … ”`** unless the passage is functioning as a formally quoted hadith/source passage governed by the guillemet rule above.
- Preserve nesting semantically rather than mechanically: `﴾ … ﴿` identifies Qurʾanic revelation, `« … »` identifies the direct hadith/source quotation, and `“ … ”` identifies ordinary or nested speech. Do not substitute straight ASCII quotes or collapse these delimiters into one generic quotation-mark style.

- **Normal prose:** 14 pt Amiri, regular weight, default black foreground. In this experiment, ordinary source-derived body paragraphs retain the source-edition 18 pt first-line indent described above.
- **Qurʾanic quotations:** color the exact Qurʾanic quotation span **`#38761D`** in Amiri, including the enclosing Qurʾanic brackets when present. The surrounding attribution/citation remains in its ordinary role. Green is a semantic layer, not a forced reset: when a Qurʾanic span occurs inside an already-bold source quotation, preserve both **green + bold**; an italicized transliterated term inside that span may remain **green + bold + italic**. Do not color the surrounding prose or bibliographic citation green.
- **Hadith / narration text:** quoted narration text is **bold**. In a standalone narration block, the transmitted introduction/isnād wording may be bold together with the matn; when a narration is quoted inside ordinary prose, keep the prose/attribution regular unless it is itself part of the quoted source, and bold the quoted narration. Preserve the edition's quotation marks/guillemets; do not infer bold merely from punctuation.
- **Scholarly/source quotations:** the quoted source passage is **bold**, while an ordinary attribution such as “X said:” remains regular unless the quotation block itself includes that wording. Long quotations may therefore have entire quoted paragraphs in bold. Ordinary scare quotes, nicknames, or quoted terms used as prose—e.g. a phrase like “red line”—remain normal unless another semantic role justifies emphasis.
- **Technical/transliterated terms:** italicize transliterated technical terms where the edition marks them as terms, e.g. *sunnah wāqiʿiyyah*, *sunnah maḥkiyyah*, *muḥaddith*, *riwāyah*, *dirāyah*. Italic can compose with bold/green when the surrounding semantic role also requires those styles.
- **External/cited work titles:** italicize titles of cited books and scholarly works in ordinary body prose and in bibliographic notes, e.g. *al-Kāfī*, *Ṣaḥīḥ al-Bukhārī*, *Ṣiyānat al-Qurʾān min al-Taḥrīf*. Parenthetical English translations of those cited titles are likewise italic when the reference does so.
- **Current-project/internal titles:** titles used as part of the present edition's own project/series/book/chapter cross-reference system are **bold** when the reference directly marks them that way, e.g. **Islam: The Centrality of the Qurʾān**, **The Hadith Heritage: Its Origins and Influence**, or a referenced chapter title. Do not generalize this into “all book titles are bold”; external bibliographic works remain italic.
- **Honorific/sacred glyphs:** glyphs such as `﵋` and `﵊` use **Scheherazade New**, normally **`#333333`**, with optical/context-sensitive sizing; body instances are commonly about 8 pt while title/front-matter instances can be larger. When such a glyph falls inside a green Qurʾanic quotation, it may inherit the Qurʾanic green. Other forms such as `ﷺ` or `ﷻ` should preserve their local observed styling rather than being forced into the `﵋`/`﵊` rule.
- **Bold:** use for headings, hadith/narration content, scholarly/source quotations, and internal/current-project title references where directly established by the edition. Do not manufacture emphasis merely for visual variety.
- **Italics:** use for technical/transliterated terms and external/cited work titles where established by the edition.
- No standing underline or strikethrough system belongs to this profile.

#### Footnotes

- Preserve native footnote linkage and numbering.
- **No body-flow footnote labels in the finished edition.** Literal prefixes such as `Footnote:` are migration cues in an inherited draft, not publication formatting. After migration, the body contains only the native callout marker at its exact anchor; the note text exists only in the native footnote segment and is laid out by the host in the page-bottom footnote area.
- When repairing an inherited document, migrate simulated notes **one verified note or safe batch at a time**: resolve the body-note text and intended anchor from source/context → create native footnote(s) → populate and format native segment(s) → verify linkage/text/page-bottom behavior → delete the old body paragraph(s). Re-read indexes/revision after index-shifting operations; never delete the legacy copy first.
- Main note text: **10 pt Amiri**, **115% line spacing**, **0 pt above + 0 pt below**. Use the same proportional line rhythm as normal body text, without extra paragraph spacing between notes.
- **Footnote spacing invariant:** separate native footnotes and continuation paragraphs by ordinary line leading only; never insert the v1 body-text 12 pt above/below paragraph gap, blank spacer paragraphs, or any other extra vertical gap between footnotes.
- **Project footnote indentation invariant:** every native-footnote paragraph uses **0 pt start indent, 18 pt first-line indent, 0 pt end indent**. Remove inherited hanging indents and tabs, but preserve this first-line paragraph indentation.
- On the **first paragraph of each native footnote**, place **exactly one ordinary space** between the native footnote number/marker and the first visible character of note text so the text does not touch the number. Do not use a tab and do not add multiple spaces.
- Continuation paragraphs inside the same footnote use the same **0 pt start / 18 pt first-line / 0 pt end** geometry; do not flatten them to flush-left.
- Bibliographic/source titles inside notes are **italic**; surrounding citation prose remains regular unless another semantic role applies.
- Preserve source-established bold emphasis rather than flattening it.
- Honorific glyphs remain Scheherazade New and are typically optically reduced beside 10 pt note text.
- In Google Docs, if note/body pagination splits or jumps unexpectedly, inspect inherited `keepWithNext` / `keepLinesTogether` behavior and adjacent page/section breaks before adding manual spacer content. Ordinary note paragraphs should not inherit heading-like keep-with-next behavior unless the edition deliberately requires it.

#### Lists

**User correction recorded 2026-09-24:** lists in this formatting profile are **not indented**.

- Native bullet/numbered list paragraphs: **0 pt start indent / 0 pt first-line indent / 0 pt end indent**.
- Plain-text list-like paragraphs that retain literal numbering/markers use the same **0 / 0 / 0 pt** paragraph geometry.
- Preserve the list's bullets, numbering, ordering, and semantic nesting; do **not** apply the 18 pt body first-line indent to list items and do **not** recreate the earlier hanging-indent ladder.
- Do not copy anomalous indentation from empty/blank paragraphs into substantive text.
- If a future experiment intentionally reintroduces visual list nesting, record it as a new formatting-profile version rather than silently changing this one.

#### Known reference anomalies — do not normalize into the profile

The inspected reference contains isolated formatting drift that is **not** part of v1: two `#202122` text runs, one `#EEEEEE` glyph background, several intermediate 15/19 pt heading runs, and named-style definitions that conflict with representative direct formatting. Preserve these only if they are independently meaningful in a target; otherwise the rules above govern.

### Formatting Profile v2 — REAL SCALE tightened book rhythm

**Status:** user-selected refinement and current preferred REAL SCALE format, recorded 2026-09-26.

**Inheritance rule:** v2 inherits **Formatting Profile v1 — REAL SCALE** in full except for the explicit overrides below. Preserve v1 as the reconstructable earlier experiment rather than rewriting its recorded measurements and rules.

#### v2 overrides

- **Native TOC presentation:** the TOC starts at the top of its own fresh page. Its visible Latin/transliteration text uses **Amiri** and its visible foreground is **plain black throughout, including page numbers**. Native heading links may remain functionally linked, but the finished publication must not show Google Docs' default blue link color or underline. Sacred glyphs retain their proper glyph font while remaining black unless a stronger explicit edition rule says otherwise. Reapply this presentation after every native TOC refresh, then run the fixed-point verification in §3.2.

- **Normal body paragraph rhythm:** keep **14 pt Amiri**, normal weight, black/default foreground, **115% line spacing**, and the v1 **18 pt first-line indent**, but use **0 pt above + 4 pt below** for ordinary non-list body paragraphs. Do not combine the first-line indent with the v1 12 pt above + 12 pt below spacing in v2. The goal is a tighter continuous-book reading rhythm while retaining a small amount of paragraph breathing room.
- **Footnote paragraph geometry:** every native footnote paragraph is **0 pt start / 18 pt first-line / 0 pt end**. On the first paragraph of each footnote, the native footnote number/marker is followed by **exactly one literal ordinary space** before the first visible character of note text. Continuation paragraphs retain the same 18 pt first-line indentation. Preserve **10 pt Amiri / 115% line spacing / 0 pt above / 0 pt below** note rhythm. Marker spacing and paragraph indentation are independent requirements.
- **Heading pagination hierarchy:** semantic **H1 chapter openings and H2 major sections start on a new page**. For a multi-paragraph H1 chapter-opening block (for example a chapter label followed by its title/subtitle), place the forced break on the opening of the block; do **not** force another page between paragraphs that belong to the same H1 opening block. Semantic **H3 subsections and H4 lower-level headings remain in continuous document flow** and never receive a forced page break merely because of their level.
- **H3/H4 anti-stranding:** preserve the v1 spacing for H3/H4 and keep each heading with the following text where the host supports it. If insufficient room remains at the bottom of a page, let the renderer move the heading with following text naturally; do not manufacture a manual blank page or spacer.
- **Body alignment:** ordinary English body text is **left-aligned / ragged-right**, not fully justified. Do not introduce full justification unless a later book-specific profile explicitly adopts and verifies it.

### REAL SCALE integrity gates

- **No empty interstitial pages:** H2/chapter breaks go only to the next physical page. If the prior section ends with one line, keep it there and start the next H2/chapter on the next page—never add a blank page. Verify the final render; any accidental blank page blocks publication-ready status.
- **No broken emphasis:** bold complete semantic spans, never Google Docs/DOCX storage runs. No accidental half-bold words, quotes, sentences, or punctuation. Mixed styles compose across run boundaries. Render-check transitions and fix the shared range/run cause.

## 6. Choose the editing substrate before scaling

For long structured translations, **translation quality** and **document-mutation reliability** are separate problems. Before substantial mutation, compare the viable execution architectures rather than defaulting to the first editing primitive that happens to work on a heading or paragraph.

Evaluate materially live approaches—such as direct native API editing versus a stable structured interchange format such as DOCX—on at least:

- **structure preservation** — can it retain notes, tables, links, styles, objects, headers/footers, and semantic hierarchy?
- **deterministic targeting** — can the intended source unit be mapped to exactly one target unit without fragile string matching?
- **reversibility / rollback** — can failed transformation be discarded or reverted without harming the authoritative source?
- **scalability** — does the method remain tractable for the whole book rather than only a few clean paragraphs?
- **verifiability** — can coverage, mutations, residual Arabic, and structural integrity be audited end to end?

Prefer the simplest architecture that passes these criteria. Do not keep patching a weak architecture merely because work has already been invested in it.

### 6.1 Run a hostile-case pilot before whole-book execution

Before scaling a method across a long work, prove it on a small representative set that includes the difficult structures actually present in the book. As applicable, test:

- an ordinary body paragraph;
- a paragraph containing mixed formatting and an inline footnote/note anchor;
- a footnote/endnote;
- a chapter heading and/or TOC entry;
- a table cell;
- a header/footer or running head;
- a hyperlink/cross-reference/caption or another nontrivial inline object.

Verify both semantic output and structure after the pilot. Confirm that the Arabic source remains untouched.

If the pilot or later execution produces **partial replacements, zero-match edits, fragmented English, accumulating manual patches, unclear source→target mapping, or repeated structural damage**, stop scaling that route. Diagnose the shared cause and re-select the editing substrate. Do not layer another helper/workaround on top of a structurally unreliable process merely to preserve momentum.

### 6.2 Preferred Google Docs / DOCX strategy

For Google Docs, direct Docs API editing is appropriate when exact document indexes, segment identifiers, and structural reads provide deterministic targeting across the relevant body, notes, tables, headers/footers, and other segments, and each mutation can be verified reliably.

For book-length work where Google Docs' internal segmentation makes paragraph-level translation brittle, prefer this pipeline:

1. export the untouched authoritative Arabic source as **DOCX**;
2. translate the DOCX **structurally**, preserving the OOXML package relationships and formatting-bearing structure;
3. process body text, tables, footnotes/endnotes, headers/footers, captions, and other text-bearing parts in place;
4. run automated coverage, structure, and zero-Arabic QA on the resulting DOCX;
5. import the verified English DOCX as a **new Google Doc**;
6. use the Google Docs API only for final host-specific cleanup such as LTR direction, fonts, alignment, indentation, spacing, or other rendering normalization that is safer to perform natively.

When processing DOCX, treat the **logical paragraph/note/cell** as the translation unit while preserving its internal runs, bookmarks, links, note references, inline objects, and style relationships. Do not independently translate every run merely because the format stores a sentence across multiple runs; that produces fragmented English and can corrupt inline structure.

A temporary Sheet, `GOOGLETRANSLATE()` helper, or other bulk bridge is **not** the core translation substrate when it weakens source-unit mapping, terminology control, or structural verification. Such a helper is acceptable only when mapping back to the structured target is deterministic and independently verified. Otherwise, retire it rather than turning it into another layer of patchwork.

### 6.3 Guard direct live-native mutation

For Google Docs, DOCX, or other structured formats, the rendered/extracted text may not be byte-identical to the editable native representation. Footnote anchors, inline objects, smart punctuation, hidden runs, and segmented document structures can make a visually identical string fail an exact replacement.

Therefore, when using direct live-native edits:

1. inspect the live target structure before mutation;
2. use exact current target text/indices/segment identifiers when available rather than assuming an exported extraction is the mutation key;
3. treat body, tables, notes, headers/footers, and other segmented text regions independently when the host does;
4. use batch replacement only when the key is actually present and the operation preserves the relevant structure;
5. inspect returned occurrence/change counts;
6. treat a zero-match replacement as **no translation performed**, not as successful progress;
7. after a batch, re-read the mutated target and confirm the expected text changed before advancing.

For long works, translate in coherent sections/chunks and checkpoint coverage so a skipped surface or failed mutation cannot disappear inside a large completion claim.

### 6.4 Serialize multi-book translation; synchronize verified page progress live

When one translation program contains multiple books, **do the actual translation work one book at a time unless the user explicitly authorizes interleaving**. The default is:

> **finish the current book's source→target translation/formatting/QA sequence before beginning translation content from the next book.**

This is a contamination-control rule, not a ban on efficient setup.

- **Mechanical preparation may span the corpus** when mapping is deterministic: create target Docs, resolve source PDFs, establish permissions, attach exact source↔target identifiers, configure progress fields, and prepare tracking infrastructure.
- **Do not interleave translation content across books by default.** Do not alternate source-page batches between different books merely to increase apparent concurrency. This reduces cross-book passage mixing, footnote/citation contamination, terminology leakage, wrong-document writes, and page-counter drift.
- Within the active book, work in coherent source-page batches sized for reliable source reading, mutation, and QA. A batch boundary is a checkpoint, not a reason to switch books.
- Preserve an explicit active-book identity at every mutation: source artifact/book ID, target document ID, source-page range, and current verified source-page denominator. If any one of those is ambiguous, stop before writing.
- A book may move to the next book only after its required translation-text scope is complete and the applicable formatting/structural QA state has been recorded. Publication-ready review may remain a distinct later gate where the project separates translation completion from publication review.

When the translation project designates a **live website/dashboard/status surface** as its progress tracker, treat that surface as an active translation-project artifact, not a passive afterthought. Keep its translation-relevant project records, links, assignments, status/progress fields, and presentation behavior synchronized with verified project truth as those facts change. When the tracker implementation lives in a translator-accessible project repository (for example the Haydari Translation Workbench under `operator-translation/workbench/`), ordinary authorized translation work includes maintaining that implementation/data surface when needed for the workflow; do not require separate hosting-provider access for repository-level website tweaks when repository commits are the deployment path. Hosting/account administration remains a separate authorization boundary.

Treat progress publication as part of the batch commit:

1. translate the source-page batch into the correct target;
2. read back the target mutation and run the batch's required structural/rendered checks;
3. compute progress from **physical pages of the authoritative source PDF** (for example `5/131 source pages`), not target-document pages or unverified extracted units;
4. only after those source pages are genuinely translated and verified, update the project's live tracker to the new exact `X/Y` state;
5. verify the live surface readback shows the same book and same count before treating the checkpoint as externally synchronized.

Do **not** advance the live page counter merely because pages were opened, OCR/transcription was attempted, source text was extracted, or a draft batch was written but not verified. Never count unreadable/uncertain pages as translated.

If the live-progress update fails after a verified batch, preserve the exact unsynchronized checkpoint as pending state and repair the tracker before beginning another translation batch where practical. Do not let the public progress surface silently drift behind the actual translation state. A temporary tracker outage is an explicit synchronization blocker/status, not permission to invent or skip progress events.

The live progress surface should make the whole assigned workload legible without visual clutter: untouched assigned books remain visible at `0/Y`, active work shows `X/Y`, and recent verified checkpoints may form a restrained activity feed. Visual presentation is project-owned; the translation invariant is that the displayed count is exact, source-relative, and synchronized with verified work.

### 6.5 Founder public-access lock for book deliverables and Workbench links

For this founder's book-translation workflow, **public access is part of delivery correctness, not an optional sharing step**.

- **Editable English translation Docs:** every Google Doc created/imported for an English book and every Google Doc linked to the Haydari Workbench must be shared as **Anyone with the link → Editor** before the link is attached or the artifact is reported delivered. Specific-user sharing, organization/domain-only sharing, or a link that opens a Request access screen does not qualify.
- **Generated/Drive-hosted book PDFs:** every book PDF created for user-facing delivery/publication must be shared at least as **Anyone with the link → Viewer/Reader** so it opens without sign-in or access approval. If the PDF is accompanied by an editable source Doc, the source Doc still follows the Editor rule above.
- **Verify the permission, do not infer it from the URL.** After create/copy/import/export/upload, read current Drive permission metadata and require an `anyone` permission at the required role before linking or claiming delivery. Copy/import operations can reset sharing and therefore reopen this gate.
- **Workbench linking is conjunctive:** before Operator links an English Book to the Workbench, first verify Drive metadata shows `anyone + writer`; then verify the Workbench/public-recipient path opens without authentication. The Workbench's anonymous reachability probe is a secondary Request-access guard and does **not** substitute for Drive role metadata when Editor permission is required.
- **Existing links encountered during relevant maintenance are in scope:** when auditing or repairing Workbench English-book links, check every currently linked Drive artifact's sharing state and repair any restricted/under-permissioned file when authorized.
- If the available connector/account cannot change or verify the required sharing state, leave the link/delivery blocked and name the permission gap. Do not silently publish a restricted file or call it complete.

This is a standing founder workflow invariant for book translation/delivery and Workbench linking until the founder explicitly changes it.

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

### 7.1 Use a pairing gate for bilingual Arabic-above-English editions

When the edition is explicitly bilingual, retained Arabic is expected source content rather than a zero-Arabic failure. Replace the global zero-Arabic completion gate with a **source→target pairing gate**:

- preserve the authoritative Arabic source text unchanged except for explicitly authorized normalization;
- pair each logical Arabic source unit with its corresponding English target, using **Arabic above English** when that is the selected edition layout;
- apply the pairing rule to every in-scope text-bearing surface, including headings, body text, quotations, notes, tables/cells, captions, and other edition content rather than only the main body;
- require every Arabic source unit to have an accounted-for English counterpart and every English target unit to trace to the correct source; no orphan source units, duplicated targets, or silently skipped notes;
- keep source and target quotation semantics distinct: Arabic Qurʾanic source `﴿ … ﴾`, English Qurʾanic translation `﴾ … ﴿`, and hadith/narration matn `« … »` when the active overlay uses those forms;
- scan English spans for accidental untranslated Arabic while allowing only the intentional paired Arabic source and exact approved sacred-glyph exceptions;
- verify visual pairing in the rendered edition so page/column breaks, notes, tables, or directionality do not detach an English translation from the wrong Arabic source unit.

A bilingual edition can therefore be **text-complete** only when the declared source denominator is fully paired and semantically reviewed; the mere presence of both languages on every page is not evidence of alignment or completeness.

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

If any applicable gate is open, failed, untested, or blocked, do not call the edition publication-ready.

### 8.1 Enforce semantic typography and pagination consistency across the whole edition

Publication formatting QA must be **semantic-type aware and whole-document**, not a collection of spot fixes or a blind global normalization. Before release, inventory the actual formatting properties of every relevant paragraph/run class and compare each instance against the active edition's approved style for that semantic class.

- **Body typography:** ordinary body prose must use the edition's approved body font family, size, weight, line spacing, alignment, and paragraph geometry consistently. Detect run-level and paragraph-level outliers across the entire manuscript, including inherited/direct formatting that can make visually identical style names render differently. A few representative pages are not a sufficient denominator.
- **Inherited/unset font regression:** inherited or unset body/list runs are not presumed safe merely because surrounding prose is correct. Resolve every ordinary text-bearing run to the approved body typography (while preserving explicit semantic exceptions such as sacred-glyph runs), and verify the rendered result. Numbered overview lists and chapter-opening summaries belong to this audit denominator.
- **Body indentation:** apply the approved first-line indentation to ordinary body paragraphs wherever the edition calls for it. Do not infer that missing indentation is intentional merely because a paragraph inherited a different style or was touched by an earlier repair.
- **Footnote geometry is a distinct semantic class:** verify native footnotes against the active edition/formatting profile rather than inheriting body-paragraph geometry. Check marker-to-text separation, first/continuation-paragraph indentation, line/paragraph spacing, and wrapping independently. For **REAL SCALE v2**, the canonical values live in that profile above. Where the active edition specifies paragraph-style footnotes, every footnote paragraph uses the approved first-line indentation (currently 18 pt in this project), including continuation paragraphs; the native marker remains host-managed and must not be simulated with body text. Do not flatten multi-paragraph notes to flush 0 / 0 / 0 geometry.
- **Do not blanket-normalize semantic classes:** a global formatting rewrite is forbidden when it would erase legitimate distinctions among body text, headings, quotations, lists, Qurʾanic translations, footnotes, bibliographic matter, captions, or other semantic surfaces. Normalize within a proven class and preserve intentional exceptions.
- **Honorific/sacred glyph completeness:** verify not only that approved glyph code points are present where required by the active terminology/person-name rules, but also that they render correctly in the final output. Search for names/classes that require an honorific and detect missing marks, wrong marks, replacement boxes, tofu, question-mark boxes, fallback-font corruption, detached glyphs, or glyphs displaced by bidirectional behavior. Presence in source/API text is not proof of renderability.
- **Pagination-property audit:** ordinary body text must not acquire unexplained large vertical gaps, premature page breaks, or stranded continuations from accidental `keepWithNext`, `keepLinesTogether`, `pageBreakBefore`, paragraph spacing, empty break paragraphs, or inherited pagination properties. Apply keep/break behavior only to the semantic classes that require it.
- **Whitespace anomaly gate:** rendered pages must be checked for unusually large blank regions inside otherwise continuous body flow. Every anomaly must be explained by intentional structure (for example a chapter opening, figure, table, or source-preserved break) or repaired. A page that is nonblank can still fail this gate.
- **Cross-render consistency:** structural/API checks and text extraction are necessary but insufficient. Generate a fresh final render after layout-changing edits and inspect the rendered edition for font switches, indentation drift, missing/broken glyphs, excessive whitespace, clipped text, and pagination artifacts. User-visible rendering defects override a structural “pass.”\n- **Whole-edition font-family gate:** audit font family across every text-bearing class, including headings, subheadings, numbered/list-like headings, ordinary body text, notes, and run tails. An inherited/unset run is not presumed safe merely because its paragraph style is correct. After export, inspect the PDF/render font map for visible fallback-font spans and trace each non-host-generated occurrence back to the editable source. Native footnote-number glyphs, list bullets, and other host-generated markers may use the host font when they are not editable manuscript prose.
- **Outlier-driven whole-book QA:** when a user or reviewer finds one instance of a formatting defect, treat it as evidence of a possible defect class. Search the entire declared denominator for the shared cause and all sibling instances, repair at the highest safe semantic owner, then rerun the whole relevant gate. Do not repair only the photographed/reported page.
- **Layout-changing edits invalidate downstream evidence:** changes to fonts, indentation, paragraph spacing, glyph font/fallback, keep/break properties, notes, headings, or other pagination-sensitive formatting invalidate affected page-number/TOC and rendered-layout evidence. Re-export and reverify before release.

The governing production invariant is:

> **A structurally valid document is not publication-ready if its rendered edition contains inconsistent typography, missing semantic indentation, malformed or absent required honorific glyphs, defective footnote starts, or unexplained whitespace/pagination artifacts.**


### 8.2 Treat major chapter/opening pages as a distinct publication surface

When the active edition uses dedicated chapter or major-part opener pages, treat the **entire opener page** as one semantic layout class rather than formatting only its heading paragraphs.

- **Dedicated-page isolation:** the chapter/part label and title must occupy the opener page by themselves unless the edition explicitly specifies additional opener-page matter. When an edition intentionally places a chapter summary/teaser list on the opener, that list is part of the opener composition rather than leaked body text: keep it on the opener, center the list **as a column**, left-align its unequal-length items to a shared edge with stable wrap/hanging geometry, and preserve bullets only when source/edition-supported. Otherwise a chapter summary, numbered key-point list, epigraph, or first body paragraph must not leak onto the opener merely because space remains; begin ordinary chapter content on the following page.
- **Opener typography:** normalize every run of the complete opener label/title block to the approved opener font family, size, weight, direction, and alignment. Audit run tails and inherited/direct formatting; one fallback character or trailing run in body styling is an opener defect even when the named heading style is correct.
- **Major-opening page boundary:** introductions, prefaces, chapters, parts, and other sections designated by the edition as major openings start on a fresh page. Attach the break to the opening heading or another renderer-stable structural boundary; do not rely on a following body paragraph or fragile empty helper paragraph that can strand the heading or create an unintended blank page.
- **Centered composition is rendered geometry:** where the edition specifies a centered opening page, verify both horizontal centering and the intended vertical composition in the rendered artifact. Do not infer visual centering from paragraph alignment, symmetric paragraph settings, or `spaceAbove`: font metrics and renderer behavior can make a technically centered block look visibly off-center, and some renderers suppress top-of-page spacing after forced page breaks. Compare the rendered title block against the physical page center, apply an optical/frame correction when needed, and re-render every sibling opener using that layout class.
- **Opener/body boundary gate:** for every major opener, inspect the first content-bearing paragraph after the title block and prove that its page placement matches the edition rule. This is a whole-book denominator, not a spot check of Chapter One.
- **Template-level regression rule:** one reported opener defect reopens the opener-page class across the entire edition. Inventory all sibling openers, repair the shared cause, and rerender every opener plus the immediately following page before release.

A publication-QA pass must therefore distinguish **heading-style correctness** from **opener-page correctness**. A centered H1/H2 in the document model does not pass if the rendered chapter page is top-heavy, contains ordinary chapter content, or contains mixed/fallback typography.


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


### 13.2 Multi-project translation continuity and handoff

When several books/manuscripts/editions are active at once, preserve a **translation portfolio work graph** above the individual project handoffs so a chat/session switch cannot make quieter projects disappear.

For each active or intentionally paused project, preserve only the fields needed to resume correctly, such as:

- stable project/book/edition identity and current authoritative source witness;
- exact current manuscript/release-candidate identity and evidence checkpoint;
- edition mode and active translation/formatting/terminology overlays;
- current phase and evidence-backed progress denominator;
- open source anomalies, translation/editorial questions, reviewer gates, formatting/production gates, and other blockers;
- next admissible action and what it depends on;
- intentionally deferred later work that must remain visible;
- cross-project dependencies or shared decisions (for example a terminology convention, formatting profile, reviewer availability, or reusable source-recovery result) that can affect more than one book.

Keep shared rules at their real shared owner and record project-specific exceptions at the project. Do not copy one book's exception into every other book merely because they are processed together.

A Kanban/board is useful as a **portfolio projection** when many translation projects are active. Its cards should derive from the project queue and retain stable identities/dependencies; columns may show phases such as source recovery, translating, semantic review, production QA, human review, blocked, or release-ready as useful to the actual workflow. Board movement is not proof that a gate passed and does not supersede the source/evidence state.

A translation handoff must distinguish **manuscript version**, **evidence/reconciliation checkpoint**, and **release candidate**. For every project that remains live, a fresh chat should be able to answer: *what is this edition trying to become, what source/candidate is authoritative, what has actually been verified, what is still open, what decision or evidence gates the next step, and what exact work comes next?*

Do not omit a project merely because another book currently has higher priority. Mark it intentionally paused/deferred with its preserved next step instead of letting it fall out of the continuation model.

### 13.3 Consolidate active artifacts only after truth is preserved

Version cleanup and storage cleanup are separate from semantic deletion.

When the user authorizes cleanup of superseded working artifacts:

- never delete or overwrite the authoritative source;
- retain the exact current candidate(s) the user still needs;
- preserve durable chronology, hashes, unresolved decisions, and reconstructive evidence in their proper knowledge/project owners before removing active duplicates;
- do not assume an older handoff's file-availability statement remains true after cleanup;
- do not keep hundreds of stale active proofs merely because they once contributed evidence.
- when the user says **latest**, **current**, or **final** during cleanup, resolve the artifact role before deletion: the highest-numbered evidence checkpoint may not be the latest manuscript, and a reviewer package is not automatically the book edition;
- enumerate the full in-scope storage surface, including pagination/duplicate variants where applicable, before bulk deletion; then re-list or otherwise verify the post-cleanup active set so preservation claims are evidence-backed rather than assumed.

The goal is a small active working set without loss of the knowledge needed to reconstruct why the current translation and release state are what they are.

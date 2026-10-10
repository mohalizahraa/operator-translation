# Arabic Book Translation — Source Fidelity and Editorial Quality

These sections preserve their original numbering and meaning; cross-references resolve across the routed Arabic book profile family. Quality and completeness are mandatory for all collaborators.

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

The readability target is **accuracy + easy comprehension** at the highest achievable publication-grade quality: prefer clear syntax, reasonably short sentences, and simple vocabulary where they preserve the author's precision, rhetorical force, technical distinctions, and argument structure.

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

### 4.1 Translation decisions as accumulating evidence, not automatic glossary canon

Each source-verified correction, reviewer-resolved Arabic ambiguity, rejected rendering, context-specific interpretation and terminology decision may sharpen later translation work. Preserve a **book-scoped, source-anchored decision** with exact Arabic, competing English renderings, semantic scope, rationale/evidence, reviewer attribution, target manuscript revision, and applicability limits. Compare it with earlier decisions before reuse. Promote a term or rule to the shared house glossary only when its broader generality is warranted; retain context-dependent alternatives where distinct Arabic senses or disciplines legitimately diverge.

When later books provide stronger evidence, reconcile old rule vs new evidence vs scoped synthesis; retest only affected target passages and representative historical examples. Preserve meaningful decision history rather than silently rewriting older editions or applying every past choice universally. A growing archive of questions or preferred phrases is **not by itself** a quality improvement. A sequence of zero captured ambiguities is a challenge-review trigger, not proof either of perfection or of neglect.

For each processed source-page batch, perform a genuine ambiguity-discovery pass; record open questions with stable IDs, exact quotations/anchors and proposed provisional wording for the per-book Questions Google Doc and durable Workbench ledger. Do not interrupt for nonblocking questions, invent ambiguity to meet a quota, or mark source-damaged passages verified. Questions and answered decisions remain distinct from machine-authored suggestions and actual human judgment.

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
- After inserting or replacing a sacred glyph, apply its approved **glyph-capable font family without changing the surrounding semantic text's point size** (founder correction, 2026-10-10). **Honorifics must be exactly the same point size as the text they attach to**: for example, 14 pt in 14 pt body prose, 10 pt in 10 pt native footnotes, and the actual size of accompanying title or heading text. The exception is **font-family only, not font-size**; preserve its required local color and inline semantics. In an editable publication target, keep the glyph in its own style run where the host permits so its approved font is explicit rather than inherited from adjacent Latin text. Do not let an inserted glyph inherit an unsupported font by accident; a correct Unicode character that renders blank, as tofu, or in the wrong fallback font is still a glyph defect. Audit every glyph run against adjacent semantic text and check actual rendering, not merely character presence.

- **Adjacent-honorific consistency review (diagnostic; style decision not presumed):** Flag closely adjacent sacred-glyph combinations in one phrase (for example, `Messenger of Allah ﷻ ﷺ`) and distinguish which referent each glyph qualifies, whether grammar/spacing is intact, and whether analogous phrases in the edition are handled consistently. Multiple glyphs for two distinct referents are **not automatically wrong**. Preserve the currently approved glyph conventions and require a user/editor preference before imposing a different house style; never automatically delete or merge either glyph solely because they occur close together.
- **Dialogue speaker labels:** in interview/dialogue works, bold only the speaker label/name plus its colon at the start of each turn (for example, **Kassār:** or **al-Ḥaydarī ﵋:**), leaving the speech itself in the normal body style unless separately emphasized.
- **Dialogue opener cleanup:** when a dialogue number/ordinal and its title form one semantic opener, prefer the compact single-line form `Dialogue X: Title` rather than a label on one line, an empty gap, and the title on another line, unless a source- or project-specific design explicitly requires the split form. Remove accidental blank paragraphs/gaps around these openers.
- **Cited quotation emphasis:** when prose introduces a directly quoted statement from a scholar, source, hadith, report, or other cited authority, bold the **quoted passage itself** when the active edition uses this readability convention. This does **not** mean mechanically bolding ordinary bibliographic metadata or every source reference. Preserve Qurʾanic color/bracket rules and nested-quotation structure.
- **Register-aware translation is mandatory.** A dictionary-possible rendering is still defective if it sounds calqued, childish, casual, or unnatural in an academic theological context. Review headings, body, and notes for awkward literalism and choose the English term that fits the concept and register while preserving the Arabic distinction. In particular, do not mechanically render `شخصية` as “person” or “personality”: depending on context use **identity**, **character**, **personhood**, or another source-faithful academic equivalent. The same principle applies to other Arabic abstractions whose literal English cognate reads unnaturally.
- Run this cleanup across **all text-bearing surfaces**, including native footnotes and end matter, not only the body. A whole-document completion claim requires the same convention to be checked in notes, quoted source passages, headings, and dialogue labels.


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


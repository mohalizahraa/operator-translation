# Arabic Book Translation — Complete Edition Formatting

These sections preserve their original numbering and meaning; cross-references resolve across the routed Arabic book profile family. Every applicable rule remains mandatory in the **first** formatting pass for every collaborator.

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

## Edition formatting profiles — inherited shared default

**Active standard:** REAL SCALE v2 inherits every applicable v1 formatting rule except explicit v2 overrides. It applies to every Haydari Workbench book, regardless of collaborator assignment.

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
- **All Haydari Workbench editions — Qurʾanic verse quotations must be native footnotes (shared requirement).** Every quoted Qurʾanic āyah, verse passage, or excerpt appearing in the main document flow is relocated **in full** into a **real, host-native page-bottom footnote** anchored at the original quotation's semantic position. Leave the surrounding authorial prose/attribution and a native callout marker in the body, but **not the quoted verse text**. Include the verified sūrah/āyah reference within the footnote; **a reference-only footnote while the verse remains in the body does not satisfy this rule**. Preserve the complete exact English verse translation and the flipped Qurʾanic brackets `﴾ … ﴿`; apply the required **green `#38761D` Amiri** styling to the verse span (including brackets) **inside the native footnote**, while the attribution and citation retain their ordinary semantic formatting and the footnote retains its native note geometry. Preserve sequence and correct anchor ownership when multiple verse passages occur; do not duplicate verses or create a second note where an existing native footnote already correctly contains the verse. Scan the **whole book**, including dedicated display/epigraph pages, tables, and other text-bearing surfaces; a verse already entirely inside a correct native footnote needs no move. This requirement applies identically to Zahraa-, Mohammed-, and Both-assigned editions; genuinely nonquoted references or prose mentions of Qurʾanic verses remain in their semantic prose roles unless an explicit project requirement says otherwise.
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



### Shared standalone Qurʾānic reference convention

Every Haydari Workbench English book uses standalone Qurʾānic citations in the form **Sūrah name: verse number**, e.g. `Al-Ḥujurāt: 10`, `Āl ʿImrān: 103`, `Al-Insān: 8–9`. Do not prefix standalone citations with `Qurʾān`, `Sūrat`, or `verse`, or append the parenthesized numerical sūrah identifier. Preserve substantive textual or reading qualifications. This shared rule reconciles the previous book-specific *Brotherhood & Unity* note; it does not replace the obligation to place **the entire quoted Qurʾānic passage** in a host-native footnote, with green Amiri lettering and correct quotation brackets.

# Zahraa formatting first-pass portfolio — 2026-10-08

## Parent outcome and authority
User-directed work: perform **complete first formatting passes** on every eligible English manuscript assigned to Zahraa in the Haydari Translation Workbench, not isolated cosmetic fixes. The current canonical rule owner is `mohalizahraa/operator-protocol/profiles/arabic-book-translation.md` at commit `3e5a2dc75d81448798b4f2a64623c56aec016fa7` (subject to fresh main reload). Every applicable rule has equal acceptance weight, must be addressed on the **first** pass, and must be recorded PASS / BLOCKED / NOT APPLICABLE with evidence; anything unmet keeps formatting OPEN. For **Zahraa-assigned** books, the **entire quoted Qurʾanic verse text** and verified sūrah/āyah source reference belong inside a real native footnote, with green `#38761D` Amiri verse styling and proper brackets, not just a reference-only footnote.

Live Workbench roster source: https://haydari-translation-workbench.pages.dev/api/projects — read 2026-10-08 (176 total records). The Workbench owns assignment/status, the linked original English Google Docs are mutation targets, and the authoritative Arabic PDFs own source wording/page alignment. Do not change site workflow status merely because a formatting batch succeeded. A prior broader structural QA handoff remains relevant: `workbench/handoffs/HANDOFF-2026-10-08-ALL-COMPLETED-BOOKS-FORMATTING-QA.md`; preserve its still-open TOC, chapter-opener, header, semantic review, and rendering issues.

## Live scope — all 12 Zahraa assignments
| ID | English book / Google Doc ID | Workbench state | Pass admission |
| --- | --- | --- | --- |
| 1 | The Infallibility of the Prophets — `1KJBqjZ41Zasg_LqrKNr4wJXZCkpOcJ77PXQal2KU1qM` | review; 209/209 source pages counter | formatting OPEN |
| 2 | Prophetic Measures — `1C8ZOE14w9mUF27hBowwnk42d_fG2cl32R2T5GAeepS8` | review; 584/584 | formatting ACTIVE/OPEN |
| 3 | Repentance — `1xBIpS5TXEQT42_JuoKlu5CgW95_B2wenYSk8LN_wcRg` | completed; 132/132 | formatting OPEN; completed workflow status is not QA certification |
| 4 | Supplication — `15MMgcj6TPtdCotBecPUJW9xX59-Py_ODsHqRqh_dDLc` | completed; 280/280 | formatting OPEN |
| 5 | Seeking Intercession — `1H4wfN_tAi4seppBApq2KoDgYrzrK2GZQOW2CllvDeSg` | review; 375/375 | formatting ACTIVE/OPEN |
| 6 | Attributes of the Servants of the All-Merciful — `1DmCHtfaYsWwWKavXipTrWZo9oq0E4tq2FZVySoSa18A` | review; 487/487 | formatting OPEN; prior TOC/opener issues |
| 7 | Features of Jurisprudential Renewal — `1fOo0Y8M1UcaKHR-odP87jGRRlCAT3x9i6AVX7qi6lB0` | completed; 219/219 | formatting OPEN |
| 8 | Jurisprudence of Fasting — `1AWIyWa5nGXmmGXfM9YqxnggeaKInLt0z9D2hD6mmz9k` | review; 258/258 | formatting ACTIVE/OPEN; no native page-number header |
| 9 | ʿAllāmah al-Ṭabāṭabāʾī — `1OKZtuUcgsqYxjKMBtQCtwuwSWJyeVHrW098EIgCs3xA` | review; 207/207 | formatting OPEN; no native TOC/header |
| 10 | Religious Marjaʿ Sayyid Kamāl al-Ḥaydarī — `1iiiuDLR_NV8mUjg4RMTxZRgt94l5w3masRqPQJZtsog` | review; 296/296 | formatting ACTIVE/OPEN; simulated notes & no native TOC/header |
| 11 | Rites of Ḥajj — `175AdOpqDeN1ul2PStNR_-QWLgjOM4VxesOukEBobjSI` | in_progress; 30/298 source pages source-verified | partial-formatting work only; source-to-target collation still OPEN |
| 90 | Hadith Legacy: Between Formation and Influence | not_started; 0/324; no linked English Doc | no formatting target yet, do not manufacture one in lieu of source translation |

A 100%-filled Workbench page counter is **not** full source-semantic or publication-formatting certification. Neither `completed` nor `review` is proof of formatting completion.

## Proven manuscript writes THIS session
On the **existing** original linked Docs (no copies), moved **17 previously inline Qurʾanic quotations** to **host-native page-bottom footnotes**, preserving the exact quoted English verse, the citation, `﴾ … ﴿` delimiters, `#38761D` verse styling and Amiri 10pt native-note typography, 115% leading, 0pt paragraph gaps, 0pt start/end indentation, 18pt first-line indentation and exactly one space after note number. The original inline quotation/citation was deleted **only after native segment creation, population and readback**; body anchors were preserved. Final Google Docs structural readback confirmed all 17 note definitions and corresponding body references.

| Workbench | New notes | Current native-note total | Final verified Google Docs revision |
| --- | ---: | ---: | --- |
| #5 Seeking Intercession | 6 | 378 | `ANLCKQmINqTqWaBJufyIOjiXtjYZGTfCE3ImhUCPOmSwA8iWXLgp8o2jxvoe5yESR_R5aSHoBiwErartU5RTjgctqaQHjVSGJC8uUr_QPSI` |
| #8 Jurisprudence of Fasting | 7 | 21 | `ANLCKQlgsxw5fNkoPN-WTaVyvrKJnNgyNX92rZGPT7UJEVwyFAatSO76CjPbAOQjPk5F_2bdZtdvgPWgV4mb-KPHt_841qvIzL1O9xX9i08` |
| #2 Prophetic Measures | 2 | 700 | `AHj4eMR0A20b9cRC5nPoV6ARn1_nClED1NJ7VNnveqEb1YezQUlPmoTemWJp0L86CXpC49LGAmSPFGZozPVYmw-LAd8NAUOkxcQVvJz3jvo` |
| #10 Religious Marjaʿ | 2 | 190 | `AHj4eMS-YGGSdUHCy8VitIYLJBJGqUAKquqIZK-wDFM0ntY-r_Sli31Q4IB-Ka0-oQ9I4iQiBZro3pGSvnpjbceRDPu0oOUyqRMUYl7oW1E` |

Evidence-identified new footnote IDs:
- #5: `kix.qyoaplnqp1ji`, `kix.e0fsm7n2v6gg`, `kix.29wptxdx57n9`, `kix.skdt07gi4ne6`, `kix.ki0lp7eecith`, `kix.fp2nrcjb2jgh`.
- #8: `kix.2oqpa7y6tjg`, `kix.9hpgli6ffw4e`, `kix.p5f1asw58ijz`, `kix.u5t897lham1s`, `kix.gwapyap5ahk7`, `kix.ram1h0etfzg3`, `kix.3h4fw9rs67c9`.
- #2: `kix.d17xjzbyxvh3`, `kix.615olxspsovf`.
- #10: `kix.4lbprbit2e1`, `kix.8itx2xqceqc0`.

**No final rendered PDF proof, complete profile criterion ledger, terminal TOC refresh or whole-edition source/visual QA was performed for these edits.** All four passes remain OPEN. Layout edits invalidate former TOC/render evidence; rerender and refresh TOCs at fixed point before release. No Workbench status was changed.

## Preliminary remaining-work observations — not exhaustive denominators
A rough regex scan of editable *body* paragraphs for `﴾...﴿` after the edits yielded #5 **102** candidate spans, #8 **4**, #2 **220**, #10 **61**. These are **heuristic discovery counts, not certified complete Qurʾanic-verse counts**; scan other verse notations, epigraphs, tables, note segments and uncited passages. Earlier structural readbacks also found many body quotations in #1, #3, #4, #6, #7, and #9. Across all books, do not move mere Qurʾanic *mentions* or bare references; quoted verse text is the scope. Footnotes native in target Google Docs only; plain prose `Footnote:` paragraphs are not sufficient.

#8's four still-inline bracketed quotations include one where the source reportedly cites Maryam verse 24 although the quoted wording appears to be 19:26; verify the Arabic/actual verse and preserve source anomaly transparently, not by silent normalization. Another quotation is an embedded fragment inside an em-dash construction. Review local prose and source before re-homing, so neither grammar nor semantic argument is damaged. #10 has around 189 earlier simulated note paragraphs and 103 editorial placeholders according to its prior handoff; **these have not been migrated** during this session. #5's prior chapter Four/Seven opener/page-layout defects are not yet fixed; #6 native TOC/self-entry and opener issues remain.

## Next admissible actions (all books stay in the parent task)
1. Fresh-load the current Operator router/profile and latest Workbench roster, re-read target Google Doc revision and canonical source. Complete #8's remaining verse migrations source-aware, then address its missing native header, semantic major headings/page breaks, TOC fixed point, all other Translator Profile roles, notes and rendered checks **within the same first formatting pass**.
2. Continue source-aware verse→native footnote migrations through #5, #2 and #10; verify individual note text/style/anchor before deleting body text. Use ascending source editorial order if needed but apply body-index changes safely. Do not automatically regex-rewrite complicated prose, existing note ownership, quotations containing honorific glyphs, or source-reference contradictions.
3. Begin/continue complete first formatting passes for the other linked target Docs #1, #3, #4, #6, #7 and #9. For each, inventory every profile rule as PASS / BLOCKED / NOT APPLICABLE with actual whole-edition evidence; preserve existing good layout and native notes. Preserve the broader 21-book structural audit's relevant recorded issues rather than restarting it.
4. #11 can have safe draft-level formatting concurrently, but no book-wide publication completion before its Arabic↔English source verification and missing passages/notes. #90 has no manuscript to format until translation creates its linked target.
5. After every layout-changing edit, regenerate render, fix missing native TOC/headers via authorized zero-paid route, refresh TOC *last*, normalize it, re-render and check every publication surface. Confirm native notes render in the page-bottom area and not as body-flow paragraphs. Change Workbench workflow status only when its distinct acceptance contract is actually satisfied.

This is a restart capsule, **not** a new canonical formatting owner and **not** a formatting-completion claim. Never quote earlier revision IDs as live; reread before new mutations. Preserve no unnecessary transcripts/copies on the user's Mac, no paid browser/computing fallback.

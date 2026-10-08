# Completed-book formatting QA — 2026-10-08

## Authority and scope
- Project reference: https://haydari-translation-workbench.pages.dev/api/projects (live read on 2026-10-08).
- 176 projects in inventory; 21 records have statuses review (15), completed (3), or published (3). These are translation/workflow statuses, **not** full formatting certifications.
- Formatting rules: current operator-protocol `profiles/arabic-book-translation.md`, REAL SCALE v2 where applicable, preserving book-specific styles. Must check source context, native semantic heading hierarchy, exact quotation styling, sacred-glyph fonts, native footnotes, native TOC and final refresh, page-number header, complete rendered-page review. No pass may be declared from metadata alone.
- No website statuses were changed. Arabic source PDFs were untouched.

## Source-linked per-book QA ledger
| Workbench project | Title | English Doc | Structural/visual QA evidence and current blockers |
|---|---|---|---|
| 1 | The Infallibility of the Prophets | `1KJBqjZ41Zasg_LqrKNr4wJXZCkpOcJ77PXQal2KU1qM` | 184-page PDF, no blank pages; 295 native notes, native TOC, dynamic page-number header. **Edited** Part One opener carrier spacing 273→299pt; rendered midpoint now ~396pt. Terminal native TOC refresh and comprehensive editorial proof not certified. |
| 5 | Seeking Intercession through the Possessor of the Means | `1H4wfN_tAi4seppBApq2KoDgYrzrK2GZQOW2CllvDeSg` | 349-page PDF, no blanks; 372 note anchors match 372 native notes, native TOC. **Edited** nine chapter-opening spacers: ten of twelve chapter openings meet ≤12pt midpoint tolerance. Chapter Four merges teaser/body; Chapter Seven teaser spills / center +17pt. Remaining structural and editorial verification open. |
| 2 | Prophetic Measures for Preserving the Divine Message | `1C8ZOE14w9mUF27hBowwnk42d_fG2cl32R2T5GAeepS8` | 749-page PDF, no blanks, native TOC, 698 native notes, header. **Edited** Chapter Seven opener spacer 226→113pt; all ten chapter openers now centered to tolerance. Full footnote/style/source and terminal TOC refresh still open. |
| 6 | Attributes of the Servants of the All-Merciful | `1DmCHtfaYsWwWKavXipTrWZo9oq0E4tq2FZVySoSa18A` | 921-page PDF and no blanks, native TOC, 67 native notes. TOC unexpectedly includes Contents self-entry; several chapter display layouts fail centering. **Trial correction to Twelfth Attribute forced break was rolled back** after rendered QA revealed extra blank pages; restored verified original 921-page no-blank layout. No completion claim. |
| 8 | Jurisprudence of Fasting | `1AWIyWa5nGXmmGXfM9YqxnggeaKInLt0z9D2hD6mmz9k` | Native TOC, 14 native notes, **no native header** and nine H1 without explicit chapter page break. Two body paragraphs labeled “Note:” require source semantic check; do not assume these are fake footnotes. |
| 9 | ʿAllāmah al-Ṭabāṭabāʾī | `1OKZtuUcgsqYxjKMBtQCtwuwSWJyeVHrW098EIgCs3xA` | 103 native notes, **no native TOC or header**; five H1 without explicit page breaks. |
| 10 | Religious Marjaʿ Sayyid Kamāl al-Ḥaydarī | `1iiiuDLR_NV8mUjg4RMTxZRgt94l5w3masRqPQJZtsog` | 188 native notes, **no native TOC or header**. |
| 47 | From Hadith-Centered Islam to Quran-Centered Islam | `1gMRPpYgbadRoG2fRHzH0Dzky079OUJZ5MUQBNNdY0Xg` | Native TOC, 133 native notes; H1/H2 page-break conventions require book-specific source audit. Workbench 0/124 counter conflicts with reported completion. |
| 95 | Jurisprudence of Creed | **NO LINKED ENGLISH DOC** | Review 408/408 in Workbench, but no manuscript linked; cannot verify formatting. |
| 118 | Introduction to Imamate | `1QvbubcPPkemed3YbYVbXGN7ujwSldqzaxx_wDQfiibY` | 189 native notes, **no native TOC or header**; ten H1 and all 16 H2 have no pageBreakBefore; semantic roles need checking. |
| 119 | Methods of Researching Imamate | `1VPKi6sV0slJxJotaT-xIgT6O6Jncj59_rtOJB_Y0YV0` | 129 native notes, header, **no native TOC**; H1/H2 break semantics unresolved. |
| 133 | Methodological Priorities | `11lfy3M2woPFmqDsNzGJjAIgg1ecXmL1LrWnZWP1y27c` | 60 native notes, header, **no native TOC**; **69 body paragraphs with Arabic spans**, several entire source quotations. Must reconcile source/target before claiming English-only edition. |
| 134 | Protection of Qurʾān from Distortion | `11WFlV9h1np16f6XfQYxqj6Y1hizaTHX33KSpjk8EYEg` | 195 native notes, header, **no native TOC**. **Edited** Arabic opening Basmalah into English, preserved centered Amiri styling; removed 41 trailing blank paragraphs. Fresh 153-page PDF **no blank pages**. Full formatting review still open. |
| 156 | Introduction to Science of Ethics | `17SNFEC4B7hfa9Q6Cbvn39F9HtBFrtKkztLLN_4ppPNo` | 249 native notes, header, **no native TOC**; one body paragraph contains untranslated Arabic word `آثار`. |
| 169 | Philosophy of Religion | `1Wlcb3MouTjqXT4RKyC_njYbWf6SF4pSaLznFum8m7iU` | 468 native notes, header, **no native TOC**; Arabic mixed into a body paragraph; several H1/H2 without explicit breaks. |
| 3 | Repentance | `1xBIpS5TXEQT42_JuoKlu5CgW95_B2wenYSk8LN_wcRg` | Native TOC, 170 notes, header; five H1 lack explicit page breaks. Marked completed, **not newly certified**. |
| 4 | Supplication | `15MMgcj6TPtdCotBecPUJW9xX59-Py_ODsHqRqh_dDLc` | Native TOC, 436 notes, header; eight H1 and two H2 lack explicit page breaks. Marked completed, **not newly certified**. |
| 7 | Features of Jurisprudential Renewal | `1fOo0Y8M1UcaKHR-odP87jGRRlCAT3x9i6AVX7qi6lB0` | Native TOC, 171 notes, header; four H1 lack explicit page breaks. Marked completed, **not newly certified**. |
| 43 | Junctures in Reform of Shia Thought | `1nYRI3o-Iy1uWOCNgrSYptJI1zF-ejnozJkOkoPqYAk8` | 318 native notes, header, **no native TOC**; H1 break standards pending. Two “Note:” prose paragraphs need semantic review, not automatic migration. Published status retained. |
| 78 | Criterion for Correcting Hadith Legacy | `1bPTPCFBvnbpnH3SZMD1-F-q4fNLzELFDpOaGwzxMvIY` | Doc title remains `REAL SCALE 2`; 293 native notes, header, **no native TOC**; seven H1 lack explicit page breaks. Published status retained. |
| 125 | A Study on Imamate | `1-uFLmhiFV_G4lFsYhiEA9iAFpoeKMirptUloqinWN9M` | 384 native notes, **no native TOC or header**; 20 H1 and 22 H2 lack explicit breaks. Published status retained. |

## Key gates and remaining work
1. **Only a structural inventory/spot-render audit of all 20 linked manuscripts is done.** Full publication QA of 21 books is **NOT complete**. Site statuses are not certification.
2. Eleven linked English Docs have **no native TOC**; at least five lack native header furniture. Google Docs native TOC/page-number creation/refresher requires a user-interface adapter, not merely raw Docs API styled text. Use preexisting self-hosted zero-cost adapters from Operator Translation where accessible; do **not** invent static TOCs or paid tooling.
3. Prioritize unfinished Chapter Four/Seven opener layouts of book #5, and Chapter Opening/TOC in #6. For native TOC self-entry ensure terminal refresh and fixed-point page-number proof after any layout change.
4. Do not mechanically add `pageBreakBefore:true`: tested #6 Twelfth Attribute; added two extra pages, so rolled back. Every semantic-page-break edit needs full rendered no-blank-page proof.
5. Source/translation completeness and manuscript formatting are separate. Mohammed's reported-complete records with translated_pages 0, and #95 without Doc, need independent reconciliation.
6. Proven Google Doc changes this turn are in books #1, #5, #2, #134. No retained change to #6. Temporary exploratory Google Doc was deleted.
7. Reopen original authoritative Google Docs, reread live revisions, do one book at a time, preserve paragraph/footnote structures, re-render and compare. Never claim `perfect` until all profile's terminal checks pass.

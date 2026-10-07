# Handoff — Translation Fast-Start DMSC + Intercession Continuation

**Local date:** 2026-10-06  
**Primary production repo:** `mohalizahraa/operator-translation`  
**Production branch:** `main`  
**Production head at handoff:** `167ebe1e5b75a8f25446b2a7a727ed61b66400b7`  
**Handoff branch:** `operator/translation-fast-start-acceptance-fix-2026-10-06`  
**Workbench:** https://haydari-translation-workbench.pages.dev

This handoff preserves two connected live workstreams:

1. the founder-requested **DMSC-to-the-floor fast-start architecture** for Haydari translation continuation; and
2. the suspended parent task to **finish translating the Intercession/Tawassul book**.

A fresh chat should not reconstruct either from old conversation history.

---

## 1. Goal

The repeated failure was translation cold-start overhead: every new chat spent time rediscovering the Workbench, active book, canonical PDF, English Doc, resume point, source-access defects, and recovery source before translating.

Approved architecture:

> **Operator owns generic fast-start behavior. Workbench owns live/book-specific translation context.**

Target path:

> **load Operator → resolve one Workbench translation context → open source + target at the exact resume point → translate**

Source-access discoveries should persist so a solved access problem is not rediscovered every session.

The canonical Arabic PDF remains semantic + physical-page authority. Transcript/mirror/OCR material is only a recovery witness and must be aligned to the PDF before page progress advances.

---

## 2. Correct production topology

An initial implementation was mistakenly applied to:

- `mohalizahraa/Website-Source`
- branch `workbench`
- current head there: `921c126503f587527b70e0730ff769bcb663d276`

That is **not** the live production Workbench owner.

The real production Workbench is:

- repo: `mohalizahraa/operator-translation`
- branch: `main`
- Cloudflare Pages root: `workbench`
- Functions: `workbench/functions`
- D1 binding: `DB`

Do not treat `Website-Source/workbench` as runtime authority. It now contains a parallel fast-start implementation from the mistaken path and needs ownership cleanup later.

---

## 3. Fast-start runtime now live

Production implementation landed via:

- PR #5 — **Workbench: one-hop translation fast start**
  - merged as `62cefc01b7d7d71f7d00c84c041aae08a224788e`
- PR #6 — **Workbench: align acceptance with shared marker owner**
  - merged as current production head `167ebe1e5b75a8f25446b2a7a727ed61b66400b7`

New D1 owners:

- `translation_focus`
  - explicit current Translating project per collaborator
  - Zahraa / Mohammed / Brother
  - bootstrap only when no explicit focus exists
  - lifecycle/progress updates maintain focus
- `translation_source_packs`
  - project-specific clean-text route
  - recovery routes
  - page-alignment guidance
  - known source defects
  - resume note
  - does not duplicate progress/PDF/Doc truth

New shared runtime owner:

- `workbench/functions/_translation.js`
  - verified public Google Doc marker parsing
  - physical-page verification gate
  - source-PDF checkpoint identity gate
  - focus resolution/synchronization
  - source-pack normalization
  - composite `translation-fast-start-v1` context

New APIs:

- `GET /api/translations/current?assignee=Zahraa`
- `PATCH /api/translations/current`
- `GET /api/projects/<id>/translation-context`
- `GET /api/projects/<id>/source-pack`
- `PATCH /api/projects/<id>/source-pack`

Existing `progress-sync` now delegates marker parsing to the shared translation owner while preserving production actor attribution and the canonical guarded progress endpoint.

Invariants preserved:

- physical PDF denominator must be verified;
- live marker is trusted only with existing checkpointed source-PDF SHA-256 identity;
- progress remains optimistic-concurrency guarded;
- generic project PATCH cannot write `translated_pages`;
- progress sync never overwrites freeform project notes;
- source-pack/focus mutations write Activity and participate in live revision;
- no second progress counter;
- no second source authority.

---

## 4. Runtime verification

PR #5's first post-merge Workbench Acceptance run:

- run `37561293126`
- **failed**
- failure was a stale test-owner assertion: old tests expected marker parsing / physical-page guard text to remain in `progress-sync.js` even after those responsibilities were intentionally consolidated into `_translation.js`
- not a discovered runtime logic regression

PR #6 updated those tests to follow the new canonical owner.

Current production proof:

- production head: `167ebe1e5b75a8f25446b2a7a727ed61b66400b7`
- Workbench Acceptance run: **37561459834**
- self-hosted `verify`: **SUCCESS**
- Cloudflare Pages check: **SUCCESS**

The production fast-start endpoints now return JSON rather than SPA fallback.

Current live call:

`GET /api/translations/current?assignee=Zahraa`

returns:

- `focus_source: explicit`
- project `5`
- catalog `book-2`
- status `in_progress`
- stored progress `205/375`
- live marker `205/375`
- effective fast-start progress `205/375`
- formal `next_source_page: 206`
- marker `⟦WBPROGRESS:5:205:375⟧`
- sentinel `[[NEXT_BATCH]]`
- source pack present
- `focused_for: ["Zahraa"]`

This is the desired cold-start behavior.

---

## 5. Operator Protocol half is staged, not closed

Repo:

- `mohalizahraa/operator-protocol`

Staged branch:

- `operator/translation-fast-start-2026-10-06`

Compared with current Operator `main`:

- **2 commits ahead**
- **0 behind**
- changed:
  - `profiles/arabic-book-translation.md`
  - `plugins/operator-protocol/profiles/arabic-book-translation.md`

Operator main at handoff:

- `dd26c9d0aeb9cf56b9675858168a23bf0b849052`

Staged behavioral rule, in substance:

1. Haydari start/continue/resume/finish requests use Workbench fast-start first.
2. Known project → retrieve project translation context.
3. “Continue translating” + known collaborator → resolve current translation.
4. Do not first browse the Workbench UI, rediscover the PDF, search for the English Doc, or reconstruct chat state when fast-start context is healthy.
5. Canonical PDF remains authority.
6. Recovery witnesses are aligned back to the PDF before progress moves.
7. Reusable source-access discoveries go into the Workbench source-pack owner.
8. Fall back to ordinary discovery/reconciliation only when fast-start context is missing, stale, inaccessible, conflicted, or insufficient.

Do **not** call the Operator mutation done just by merging it.

Operator's standing rule requires after every Operator mutation:

- canonical-owner reconciliation;
- plugin projection sync/check via the normal generator;
- mandatory whole-repository DMSC-to-the-floor revalidation;
- ASSURANCE + reconciliation/assurance profiles;
- repair and recursive rerun until the floor closes;
- exact final evidence report.

That is still open because the handoff interrupted it.

---

## 6. Accidental Website-Source duplicate is an open cleanup item

Repo/branch:

- `mohalizahraa/Website-Source`
- `workbench`
- head `921c126503f587527b70e0730ff769bcb663d276`

It contains a parallel fast-start implementation.

Required disposition after the Operator half closes:

- preserve `operator-translation/main` as the sole live production Workbench owner;
- reconcile/revert/retire the accidental Website-Source fast-start copy or leave an explicit non-production historical breadcrumb if needed;
- do not overwrite newer production behavior with the older Website-Source version.

The production tree has newer workflow-transition, live-sync, actor-attribution, Activity, and DMSC-floor safeguards.

---

# Intercession / Tawassul translation

## 7. Book identity

Active book:

- project ID: **5**
- catalog ID: `book-2`
- Arabic: **التوسّل بصاحب الوسيلة**
- English: **Seeking Intercession through the Possessor of the Means**
- author: **Shaykh Ḥaydar al-Yaʿqūbī**
- assignee: **Zahraa**
- status: `in_progress`
- verified physical pages: **375**
- page-count basis: `physical_pdf`

Official source page:

https://alhaydari.com/ar/2022/09/69342/

Stable Workbench PDF route:

https://haydari-translation-workbench.pages.dev/api/pdf/5

Underlying canonical PDF:

https://archive.alhaydari.com/ebook/ar/%D9%83%D8%AA%D8%A8-%D8%A7%D9%84%D8%A3%D8%AE%D9%84%D8%A7%D9%82/%D8%A7%D9%84%D8%AA%D9%88%D8%B3%D9%84-%D8%A8%D8%B5%D8%A7%D8%AD%D8%A8-%D8%A7%D9%84%D9%88%D8%B3%DB%8C%D9%84%D8%A9.pdf

Canonical PDF SHA-256 from latest checkpoint:

`48d338363f4443d291c4e53365efef6eb36deb87ddfe788bb1e8559cd1c58cbf`

English Doc:

https://docs.google.com/document/d/1H4wfN_tAi4seppBApq2KoDgYrzrK2GZQOW2CllvDeSg/edit

Doc ID:

`1H4wfN_tAi4seppBApq2KoDgYrzrK2GZQOW2CllvDeSg`

Do not confuse this with catalog `book-108`, the separate Kamal al-Haydari book **Intercession: Studies in Its Reality, Divisions, and Implications**.

---

## 8. Durable source-recovery pack for project 5

The canonical PDF text layer becomes badly garbled later. Do not translate corrupted glyph extraction by guess.

Production D1 now stores a source pack.

Primary official transcript-series discovery route:

https://alhaydari.com/ar/category/articles/mtarhat-articles/%D9%85%D8%AE%D8%AA%D8%A7%D8%B1%D8%A7%D8%AA-%D9%85%D9%86-%D9%85%D9%82%D8%A7%D9%85%D8%A7%D8%AA-%D8%A7%D9%84%D9%85%D8%B5%D8%B7%D9%81%D9%89-%D9%80-%D9%85%D9%82%D8%A7%D9%84%D8%A7%D8%AA/

Stored official fast paths:

- episode 5 — https://alhaydari.com/ar/2013/04/46909/
- episode 6 — https://alhaydari.com/ar/2013/04/46986/
- episode 7 — https://alhaydari.com/ar/2013/04/46994/
- episode 8 — https://alhaydari.com/ar/2013/04/47081/
- episode 9 — https://alhaydari.com/ar/2013/04/47258/
- episode 11 — https://alhaydari.com/ar/2013/05/47568/
- episode 12 — https://alhaydari.com/ar/2013/05/47818/

Rule:

> These are clean Arabic recovery witnesses, not replacement source authority. Align them to the canonical physical PDF before advancing source-page progress.

---

## 9. Verified checkpoint vs manuscript-ahead state — critical

### Verified checkpoint projection

At handoff:

- Workbench stored progress: **205/375**
- live `WBPROGRESS`: **205/375**
- fast-start effective progress: **205/375**
- formal next page from checkpoint projection: **206**
- latest Workbench checkpoint target identity:
  `public-export-sha256:6b121acf058b785d489072d0c72e14986ebe948cb7d442bc8fc5693c32982ba9`
- current live-marker export SHA:
  `17539ef24a61f2d18931b4c1df342f9e4720a86cc18db723177e6017bc6f3f79`

### Current native Google Doc

Native Doc revision at handoff:

`ANLCKQllZ2ssqbWUpBy9FV2zlN9yGXHNuvgKASYPHa15zo4r9KSvrm3Sk92Gn90F3Dm8Atjz5fH0XrN_JcHO6mhoGzLCHr2_7UqdVTb-5gg`

Markers still present:

- `⟦WBPROGRESS:5:156:375⟧`
- `⟦WBPROGRESS:5:162:375⟧`
- `⟦WBPROGRESS:5:205:375⟧`

205 marker location:

- start ~`244251`
- end ~`244273`
- tab `t.0`

Current `[[NEXT_BATCH]]` location:

- start ~`344180`
- end ~`344194`
- tab `t.0`

### Do not blindly resume at page 206

There is substantial English manuscript content **after** the 205 marker and before the current sentinel.

Latest tail discusses:

- ʿAṭiyyah al-ʿAwfī;
- practice of major hadith compilers toward ʿAṭiyyah;
- Ibn Taymiyyah's own use of the ʿAwfī tafsīr route;
- why a claim of weakness “by consensus” does not survive the cited evidence;
- al-Albānī's acknowledgment that, if established, the report bears on the disputed tawassul form.

Last sentence before `[[NEXT_BATCH]]`:

> Since even al-Albānī acknowledges that the report, if established, indicates the disputed form of tawassul, the authentication discussion is decisive: the report cannot be dismissed by invoking a nonexistent consensus.

This means the manuscript is **ahead of the verified 205 checkpoint**.

The exact physical-page coverage of this extra material has not been re-mapped in this handoff.

Therefore:

> **The next translation action must first reconcile the existing post-205 manuscript tail against the canonical PDF / official transcript witnesses. Do not append a fresh page-206 translation until that reconciliation establishes what is already present.**

Find the highest fully covered physical page, repair any unsupported/incorrect span, then advance `WBPROGRESS` only to that verified boundary.

---

## 10. Last manual verified translation boundary

This chat explicitly translated/read-backed through physical page **205**, including:

- Ibn Taymiyyah's position against tawassul through the Prophet's person/station;
- first / second / third cited instances;
- al-Albānī and later-following formulations;
- Ibn Taymiyyah's three claims;
- opening of the blind-man hadith evidence.

The marker was updated from 202 to:

`⟦WBPROGRESS:5:205:375⟧`

Workbench auto-synced to 205.

Then the founder's cold-start-speed question displaced the translation work into the fast-start DMSC workstream.

---

## 11. Concurrency / prior workflow evidence

Relevant prior workflow:

- **One-shot Intercession Codex 171-375**
  - run `37542093614`
  - conclusion: **failure**

Readonly pilot:

- run `37541593956`
- conclusion: **success**

Do not infer complete/correct page coverage from those workflows.

Concurrent edits have occurred across chats/agents. Before every Google Doc write:

1. re-read current native Doc revision;
2. locate `[[NEXT_BATCH]]`;
3. inspect latest `WBPROGRESS`;
4. compare with production fast-start context;
5. write with `requiredRevisionId`;
6. read back;
7. only then advance verified progress.

On revision conflict, re-read and reconcile instead of overwriting.

---

## 12. Exact continuation queue

### A. Close the remaining fast-start DMSC work

1. Load fresh Operator.
2. Resume `mohalizahraa/operator-protocol` branch:
   `operator/translation-fast-start-2026-10-06`.
3. Reconcile the staged rule against current Operator main.
4. Preserve root profile as canonical; use the normal plugin projection generator/check rather than maintaining an independent mirror.
5. Merge via normal PR if still clean.
6. Perform the mandatory whole-Operator DMSC-to-the-floor revalidation.
7. Repair anything found; recurse until floor closure.
8. Reconcile/retire the accidental `Website-Source/workbench` parallel implementation.
9. Reconfirm production `operator-translation/main` APIs + Workbench acceptance remain healthy.

### B. Return edge — resume the suspended translation

After A closes, resume this automatically unless the founder changes priority.

1. Call:
   `GET https://haydari-translation-workbench.pages.dev/api/translations/current?assignee=Zahraa`
2. Re-read the live English Doc.
3. Map all existing manuscript text after the 205 marker to physical page 206 onward.
4. Establish the highest fully translated/verified physical page already represented.
5. Advance the marker only to that boundary.
6. Verify Workbench D1 sync.
7. Continue from the next physical page.
8. Preserve headings, quotations, Qurʾanic verses, hadith material, citations, and footnotes/provenance.
9. Use stored recovery witnesses for damaged PDF text; never guess.
10. Continue to **375/375**, not another arbitrary batch boundary.
11. Translation completion does not equal formatting/publication completion.

Lifecycle remains:

- Translating
- Needs Formatting
- Needs Review
- Publish Ready
- Published

At 375/375, proceed into the applicable full Translator Profile formatting/production process rather than calling the whole book publication-ready.

---

## 13. Stale project note warning

Project 5's freeform notes still say:

> Verified physical source-page checkpoint: 156/375 ... Continue sequentially from physical source page 157.

That note is stale.

Do not use it as progress authority.

Current verified projection is 205/375, plus an unresolved manuscript-ahead tail that must be source-mapped before the next checkpoint.

The architecture intentionally prevents progress-sync from overwriting freeform notes.

---

## 14. Founder constraints that remain binding

- **DMSC means to the floor.**
- **Cloudflare only.**
- **Vercel banned.**
- **$0 paid-service boundary.**
- Prefer existing self-hosted runners over paid GitHub compute.
- Do not use Chrome.
- Do not use ChatGPT Work unless strictly necessary.
- Do not save transcripts to the user's MacBook.
- Fast-start improvements remove redundant rediscovery; they do not weaken translation/source verification.

---

## 15. Restart test

A fresh competent agent should be able to:

1. load Operator;
2. read this handoff;
3. close the staged Operator fast-start mutation + whole-repo floor pass;
4. clean up the duplicate Website-Source ownership;
5. call the one-hop Zahraa translation endpoint;
6. reconcile the manuscript-ahead tail before writing new source pages;
7. update verified progress;
8. continue the Intercession translation toward 375/375.

This handoff is a continuation projection, not semantic authority. If live state has advanced, preserve the stronger newer evidence and reconcile this projection forward rather than forcing state back to 205.

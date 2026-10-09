# Engine-first translation slice

Status: **working local batch staging with deterministic tests; NOT an automatic book translator, Google Docs writer, or verified Workbench checkpoint writer**.

The translation engine belongs to the translation project, not the Workbench interface. `batch.mjs` has no browser, Cloudflare, model-provider, GPU, or paid-API dependency. It accepts separately supplied translation and critique adapters. An interface (CLI/native/browser/service) is **not selected** by this implementation.

## Implemented contract

`stageTranslationBatch({manifest,pdfPath,outputDir,translateUnit,critiqueUnit})`:

1. Validates source book/project identity, canonical PDF SHA-256, verified physical denominator, target Doc identity and expected revision, contiguous source-page batch, named source units and explicit blank-page witnesses. Actual file bytes are hashed before any model call.
2. Invokes an independently supplied translator and critic for each text unit. Source notes, headings, quotations, other text surfaces remain distinct source units rather than disappearing in a flat text string. The critic can record PASS / REVIEW / BLOCK findings; its recorded opinion is **not proof of independent quality**.
3. Rejects empty English or unadjudicated Arabic-script residue in the draft. Preserves unit-level source/English associations without claiming source/PDF alignment or stylistic correctness has been independently established.
4. Writes a content-addressed JSON artifact into an **explicit absolute, owner-only private directory outside this repository**, checks exact readback, and refuses to overwrite a divergent or interrupted existing artifact. Repeating the same candidate reuses it. Multiple differing candidates remain separate and are never silently chosen as the canonical manuscript.
5. Returns `STAGED_NEEDS_SOURCE_AND_FORMAT_REVIEW` or `STAGED_WITH_OPEN_CRITIC_FINDINGS`. Both are deliberately **pre-verification**. The function has no Cloudflare, Google Docs, D1 or progress-write call; `verifiedProgressAdvanced` and `manuscriptMutated` remain false.

A JSON source unit must carry a precise PDF witness locator. Text extraction/OCR is **not** yet implemented: the input's sourceText and blank claims need comparison with the authoritative PDF before any progress can be certified. In particular, a hash match establishes *file identity*, not *correct source transcription*.

### Example adapter call (illustrative, not quality evidence)

```js
const staged = await stageTranslationBatch({
  manifest, // includes source, target, batch, and source units
  pdfPath: '/private/sources/canonical.pdf',
  outputDir: '/private/haydari-staged', // chmod 0700; never a repo path
  translateUnit: async (unit, context) => ({english: await translator(unit.sourceText, context)}),
  critiqueUnit: async ({unit, english, context}) => await independentArabicCritic(unit, english, context)
});
```

The adapter functions above are integration placeholders; neither is bundled and no model invocation is claimed. Do **not** send book text or credentials through public CI, console logs, repository commits or arbitrary external services.

## Next independently admitted work

- **Source adapter**: verify page/unit text against the PDF image/extraction, including footnotes, front matter and damaged-source escalation; use the approved Mac/Windows host division and GPU lock for any real Windows GPU work.
- **Local zero-cost model adapters**: establish authorized translation and independently executed Arabic-visible critique, then calibrate on reviewer-validated source passages. Do not confuse a synthetic test double with a capable scholarly translator.
- **Document writer and formatting**: construct the exact English target with native notes/structure and REAL SCALE formatting; inspect rendered output and exact target revision. One designated writer, no concurrent final manuscript edits.
- **Review/QA and checkpoint**: independent evidence verification and human-owned questions, revision-bound QA receipts, Workbench writes and live D1 readback. Do not enable strict QA or advance book counters until these are proven. Workbench production protection, real D1 backups and Cloudflare state remain separate open loops.

Run `cd workbench && node --test engine/batch.test.mjs` for this slice. Workbench's regular `npm run check` also runs these tests. The synthetic PDF-like bytes used by unit tests prove *hash checking and workflow guards only*, not PDF rendering, OCR fidelity, or any real-book translation.

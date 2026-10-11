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

## Native PDF source witness (second engine slice)

`source.mjs` is a read-only source adapter. It verifies the **actual file hash** against the manifest, opens the PDF using macOS PDFKit (`swift pdfkit-source.swift`) or an installed Poppler `pdfinfo`/`pdftotext`, checks the physical page count and extracts **one candidate witness per physical PDF page**. Every page carries its original text, a SHA-256 hash of that extracted text and a distinct warning when native text is missing, non-Arabic, or needs visual alignment. Native extraction is **not OCR** and cannot prove scanned-page content or detect all missing footnotes.

`compareNativeSourceUnits(manifest, witness)` compares explicit source units to the corresponding page's normalized native text, distinguishing unique matches, repeated ambiguous text, missing text and blank pages. It never says that the complete page or its layout was verified. A unique substring match proves **text-location plausibility only**, not full surface coverage, reading order, image contents, authorship or faithful translation.

`stageNativeSourceAlignedBatch(...)` is the connected path: check real PDF → extract pages → check each unit against the correct physical page → call separate translation/critic adapters → privately stage the result. It **fails closed before translating** if any unit is missing, ambiguous, duplicated across source-unit labels, or if a page lacks readable Arabic/needs independently resolved OCR/visual evidence. As with the original staging path, it cannot mutate Google Docs, D1, status, review or verified progress. For scanned/source-damaged passages the future OCR/source-review owner must supply separately checked evidence; bypassing the guard by using the older raw staging API would not upgrade that data's truth state.

The read-only adapter requires no browser and no paid API. On macOS it reuses the project's existing PDFKit route; on other systems it needs installed Poppler. Input PDF byte streams and extracted book text are **not saved in the Git repository or printed to logs**. Any real book or export remains private and must follow project permissions.

Synthetic unit tests exercise hash mismatch, page holes/delimiters, source alignment, unreadable and duplicate witnesses, error redaction and connected staging. The native integration test creates an actual tiny two-page synthetic PDF, then exercises PDFKit on macOS (or Poppler when installed elsewhere), including page isolation. It is **not** a real Arabic OCR/translation-quality benchmark.

## Optional zero-cost local model adapter

`local-ollama.mjs` provides `createLocalOllamaPair({translatorModel, criticModel, ...})`. It connects to **loopback HTTP only** (`127.0.0.1`, `localhost` or `::1`) using Ollama's non-streaming `/api/generate` route. Model names are explicit and distinct; `/api/tags` must prove both are **already installed**. No pull/download, external API fallback, prompts in logs, automatic model choice, workflow-status mutation or paid inference is allowed. The transport rejects redirects, invalid/oversized responses, wrong-model responses, refusals and unstructured critic results.

```js
const models = createLocalOllamaPair({
  translatorModel:'installed-translator:tag',
  criticModel:'separate-installed-critic:tag'
});
await models.verifyModels();
const staged = await stageNativeSourceAlignedBatch({
  manifest, pdfPath, outputDir,
  translateUnit:models.translateUnit,
  critiqueUnit:models.critiqueUnit
});
```

The selected models above are **illustrative names only**, not assertions of installation. A second model's distinct ID does **not** itself prove independent critical quality, Arabic proficiency or scholarly correctness. The critic's PASS is **candidate feedback**, not the Workbench's independent source inspection/human review gate. Do not promote a model from test doubles to production until reviewer-validated real Arabic calibration (including footnotes, ambiguity and negative controls) passes. The 2026-10-05 Mac inventory found one pre-existing `zahraa-brain:latest` Ollama model, and an earlier local book pilot produced a refusal rather than usable translation; therefore no usable real translator+critic pair is presently established. Installation/licensing/storage and quality remain explicit decisions/evidence gates.

## Next independently admitted work

- **Source QA/OCR**: add page-image comparison, complete page/surface segmentation, footnote and scan OCR recovery, printed-page labels and damaged-source escalation. Unique native-text matches are insufficient. Follow the approved host division and Windows GPU lock whenever relevant.
- **Real calibrated models**: benchmark locally available models and independently executed Arabic-visible critique against reviewer-validated source passages. The localhost adapter exists, but available suitable model pair, Arabic fidelity and model licensing are not yet proven.
- **Document writer and formatting**: construct the exact English target with native notes/structure and REAL SCALE formatting; inspect rendered output and exact target revision. One designated writer, no concurrent final manuscript edits.
- **Review/QA and checkpoint**: independent evidence verification and human-owned questions, revision-bound QA receipts, Workbench writes and live D1 readback. Do not enable strict QA or advance book counters until these are proven. Workbench production protection, real D1 backups and Cloudflare state remain separate open loops.

Run `cd workbench && node --test engine/batch.test.mjs` for this slice. Workbench's regular `npm run check` also runs these tests. The synthetic PDF-like bytes used by unit tests prove *hash checking and workflow guards only*, not PDF rendering, OCR fidelity, or any real-book translation.

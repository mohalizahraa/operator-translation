# Assurance Profile

Use with canonical ASSURANCE when the task materially benefits from independent review, exhaustive coverage, multiple complementary verification methods, high-risk completion assurance, or behavioral-evaluation design.

This profile adds **advanced assurance procedure**; `protocol/04-VERIFICATION-AND-HONESTY.md` remains the evidence/claim authority.

## 1. Freeze the assurance claim and denominator

Before high-assurance review, identify the exact claim, approved specification/criteria, exclusions/authority, artifact/source baseline, relevant environments/states, and material resource limits.

For exhaustive claims, use the smallest useful denominator, for example **inspection unit × criterion/check × environment/state**. Passing samples support only the sampled/distributional claim.

For a comprehensive **audit**, distinguish three material denominators:

- **target** — what must be found/inspected;
- **failure** — what could materially be wrong;
- **detection** — which methods can expose those failures.

Bound open-ended failure/detection spaces as explicitly as open-ended target spaces.

### 1.1 General audit contract — `audit` means comprehensive

Use **audit** only for work comprehensive within an explicit, inspectable contract. Partial/representative/exploratory/convenience-bounded work is a review, scan, assessment, comparison, gap check, or another accurate label.

Comprehensive means exhaustive accounting over the declared audit question and material target/failure/detection contract—not every imaginable criterion or irrelevant byte. A repository over-engineering audit can be comprehensive for over-engineering without pretending to be a general security/correctness/accessibility/product audit.

Before starting, define enough to make omission visible:

1. **Objective** — exact failure/truth/quality/risk/comparison question.
2. **Target denominator** — in-scope artifacts, refs, sources, components, states, time/configuration ranges; exclusions and inaccessible classes. Freeze the baseline. If discovery changes scope, version the change/reason rather than moving the goalposts silently.
3. **Failure / criterion model** — material failure classes and criterion provenance: requirement, law/standard, user outcome, invariant, threat/failure model, historical defect, etc. Surface material assumptions; use an open-form blindspot probe when a missing class could overturn the conclusion.
4. **Discovery protocol** — when omission matters, go beyond seed names with aliases/synonyms/spelling/branding variants, descriptive/SEO/search terms, source vocabulary/topics, dependencies/references, related/alternative projects, ecosystem lists, citations/backlinks, and snowballing. Distinguish initial from learned query families; use materially different channels/indexes when blind spots differ; rerun with strongest learned vocabulary before closure.
5. **Inspection matrix** — extend `unit × criterion/check × environment/state` with **transition, configuration, path, scale/regime, or time** only where outcome can change. Inspect behavior-defining surfaces, not README proxies. Where relevant test intended, alternate/bypass/adversarial, and weird-plausible paths; distinguish exists → reachable → triggerable → consequential and control design → wiring → execution → operating effectiveness.
6. **Coverage ledger** — every discovered in-scope unit is unread / partial / complete / inaccessible / excluded-with-reason, with exact partial scope. Do not silently drop weak, redundant, failed, obsolete-looking, inconvenient, or boundary cases. Potentially material inaccessible surfaces remain visible as **unknown exposure**.
7. **Detector / oracle model** — map material failure classes to methods capable of exposing them. When warranted, challenge sensitivity with known-positive/negative/reference cases or alternate routes. Preserve null-result status such as **TESTED-CLEAN, NO-EVIDENCE-FOUND, INSUFFICIENT-SENSITIVITY, INACCESSIBLE, NOT-APPLICABLE,** or **NOT-TESTED**; do not silently translate `nothing found` into `pass`.
8. **Evidence / dependence model** — primary vs derivative evidence, shared upstreams, correlated sources/tests/reviewers/detectors, baseline/version, material assumptions/transitive trust, and uncertainty. Popularity, repetition, SEO rank, stars, recency, agreement, and finding count are not independent corroboration or audit quality.
9. **Finding accounting** — trace material findings and disposition. Keep observation separate from cause, existence from prevalence/systemic scope, and impact/materiality from evidential confidence. “Compressed away” is not a disposition.
10. **Contradiction / composition pass** — seek reversal/narrowing evidence; also test whether findings share one upstream cause, compose into a worse path, interact/mask through controls, or reveal latent risk through near misses.
11. **Reverse / omission / audit-model test** — ask what a fresh adversarial auditor would search/inspect/measure to find what this process missed. Challenge the denominator, taxonomy, criteria, source classes, detectors, environments, and exclusions—not only target coverage. For open ecosystems use an alternate discovery route + learned query family; when unknown-unknown risk matters, include an open-form probe beyond the known checklist.
12. **Closure accounting** — report the bounded target/failure/detection contract, discovery routes, coverage, criteria/methods, unresolved findings/unknown exposure, and evidence-backed stopping reason. Bind closure to artifact + audit-model revision/observation date and state material revalidation triggers.

For an **open-ended public ecosystem**, comprehensiveness attaches to the discovery contract and observation date: exhaust declared query/source/channel/snowball routes, inspect discovered in-scope results to required depth, rerun with learned terminology, account for duplicates/exclusions/inaccessibility, and track whether materially different passes still yield new units/classes/conclusions. Stop when that **novelty yield** is sufficiently saturated for the claim. Say **comprehensive within the declared discovery denominator**, not “everything everywhere.”

Sampling may support statistical inference when allowed, but record frame/selection/exclusions and do not project beyond what it supports. Conversely, exhaustive accounting does not require byte-reading irrelevant material: justify relevance boundaries and exhaust the behavior-/claim-defining surface. Inspection depth may be risk-adaptive while coverage accounting remains exhaustive.

A specialized profile may deepen procedure; this contract still owns the meaning of **audit** unless higher authority explicitly requires more.

### 1.2 Audit the audit mechanism

An audit is itself a system under test:

> **target → failure model → observation/detection → inference → remediation → time/change**

A complete target inventory can still mislead through missing failure classes, shared detector blind spots, contaminated observation, overextended inference, wrong-layer remediation, or stale conclusions. As consequence warrants:

- test **discovery sensitivity** by rediscovering known obscure/boundary positives when practical; failure is evidence of poor recall;
- use **channel diversity** when another index/mechanism has materially different blind spots; many queries through one index are not automatically diverse;
- treat missing logs/hidden state/irreproducible configuration or consequential unobservable transitions as a possible **auditability defect** in the target;
- separate pre-audit baseline, audit-induced state, and post-remediation evidence when testing can mutate behavior or targets can stage/adapt; prefer equally decisive non-destructive evidence;
- run **audit escape analysis**: what material defect could still exist and escape every detector used? Multiple correlated methods do not close a shared blind spot;
- test conclusion **robustness** to plausible changes in key assumptions, inaccessible surfaces, dependence, thresholds, environment, or detector interpretation; label fragile conclusions conditional;
- evidence material **transitive assumptions** proportionally without recursively auditing irrelevant upstreams;
- after minimum coverage is protected, spend extra assurance where another observation can change the conclusion, remediation, confidence, or closure state.

## 2. Trace criteria to decisive evidence in both directions

For consequential assurance, connect each applicable criterion to the output/behavior that should satisfy it, prerequisites/assumptions, relevant inspection unit/environment, verification method, and oracle/evidence.

Reverse-check that material verification work serves a real approved requirement, risk control, failure class, or evidence need. This catches omitted criteria and assurance ceremony. A strong detector for the wrong criterion cannot repair a bad failure/specification model.

## 3. Count verification methods by distinct failure target

A meaningful method identifies its **failure target, procedure, scope/environment, oracle/comparison, and evidence**. Reworded checklists, superficial lint variants, or several agents repeating the same leading review do not create independent methods. Different methods may share one authoritative oracle when their failure mechanisms differ. Use the smallest complementary set the consequence earns.

### 3.1 Match control variety to material failure variety

A verifier/control loop needs enough **requisite variety** to distinguish and safely answer the materially different failure states still possible after legitimate constraints.

If different failures collapse to the same observation or ineffective response, repeating/copying that check adds little. Add a discriminator/response that separates the relevant states, or reduce the real state space upstream with valid constraints, schemas, invariants, permissions, or enforcement.

This is not “one checker per imaginable failure.” One shared control can cover many states when it truly distinguishes/handles them; extra tools/checks can add failure modes too. Use the smallest sufficient repertoire.

For rationale/counterexamples see `evidence/CROSS-TRADITION-PHILOSOPHER-OPERATOR-AUDIT-WAVE-3-2026-09-13.md`.

## 4. Use independent review as a real role/information boundary

Use independent review when requested or when bias reduction, consequence, irreversibility, uncertainty, or material disagreement justifies it. Keep one accountable execution owner; a reviewer inspects rather than silently becoming a second implementer.

Where genuine fresh-context review is possible:

- freeze the artifact/candidate;
- provide the request/spec, decisions, criteria, scope, relevant evidence, constraints/hazards;
- withhold owner advocacy, self-rating, predicted verdict, and preferred conclusion until the reviewer selects an approach;
- never withhold evidence needed to judge correctly merely to increase blindness.

Fresh context can reduce shared-history/anchoring; it does not prove statistical independence. Same-model/tool/training and shared upstream evidence can remain correlated, and runtime isolation/read-only/privacy need real host controls.

When bias reduction matters, test for anchor/order effects, user/owner sycophancy, source dependence, consensus inflation, and irrelevant age/version labels. Vary information order, blind irrelevant identity/version, or use a genuinely different method/evidence source only when that improves the target detector.

When competent reviews disagree, diagnose whether evidence, scope, criterion meaning, environment, detector sensitivity, inference, or authority differs before voting. Disagreement can expose a weak oracle or underspecified criterion.

If required independent review is unavailable, keep the affected claim blocked or explicitly reduce scope with proper authority; do not relabel self-review.

## 5. Bind review evidence to frozen candidates

Identify consequential candidates with stable identity where practical: content hash, commit + relevant state, package digest, or equivalent.

Bind reusable evidence to candidate/spec/criterion/**audit-model** revision, relevant environment/input/baseline, inspected units, method, observation, and invalidating dependencies. Preserve enough pre-remediation baseline to reconstruct what was found before edits change the target.

Version material scope/criterion/method changes rather than rewriting history. After target or audit-model changes, recheck affected coverage; reuse unaffected evidence only after applicability is established and label it reuse. If the impact cone cannot be bounded safely, broaden re-audit.

## 6. Adjudicate findings before repairing

Reviewer findings are evidence, not commands. Useful adjudication states: **CONFIRMED, REFUTED-WITH-EVIDENCE, UNRESOLVED, DUPLICATE, OUT-OF-SCOPE**.

For a material finding preserve: **criterion → observation → evidence → affected scope → confidence/status → consequence/materiality → causal interpretation if established → recommendation**. Do not infer prevalence from one existence proof, root cause from co-occurrence, or confidence from severity. When reproducibility matters, bind artifact/environment/steps; an unreproduced observation may remain evidence without silently gaining stronger status.

Then synthesize across findings: cluster duplicate symptoms around shared upstream causes, inspect composed/chained paths and control interactions, and treat recurring supposedly-fixed defects as evidence the repair/control process itself may be failing. Finding count is not severity or audit quality.

Confirmed findings repair the highest correct owner. Refuted findings preserve correct behavior with decisive counterevidence. Material unresolved findings block affected claims. Duplicate inherits canonical disposition. Out-of-scope must point to the approved boundary; it cannot erase an applicable criterion retroactively. Votes/headcount are not truth; resolve material disputes through stronger/meaningfully independent evidence or proper authority.

### 6.1 Carry remediation through effectiveness and residual risk

When useful classify the response as **root-cause removal, preventive control, detective control, mitigation, containment, or workaround**. Do not present mitigation/workaround as cause removal.

Useful lifecycle:

> **CONFIRMED → REMEDIATION-PLANNED → IMPLEMENTED → RETESTED → CLOSED**

with alternate dispositions such as **ACCEPTED-RISK, UNRESOLVED, BLOCKED, SUPERSEDED, DUPLICATE, OUT-OF-SCOPE,** or **REFUTED-WITH-EVIDENCE**.

`IMPLEMENTED` is not `CLOSED`. Retest original failure conditions and affected alternate/bypass paths. Ask whether recurrence would actually be prevented, detected, or safely contained. Check material overcorrection/collateral damage. Record residual risk and the authority accepting it.

## 7. Bound review loops without laundering retries

A **review round** is a completed evaluation against a frozen candidate. Replies, retries, renames/version changes, session restarts, or context compaction do not create a new independent round or reset cost.

Use a task-proportional bound and stop earlier when adequately supported. If the bound/capability is exhausted or a material issue remains unresolved, report qualified non-completion rather than cosmetically restarting. ACT owns general liveness.

Audit closure needs an evidence-backed stopping reason: coverage accounted for; material detector/criterion gaps bounded; contradiction/composition and omission/audit-model passes completed; open findings/unknown exposure dispositioned; discovery novelty sufficiently saturated. Reverse-test the report so ledger detail does not reveal a materially different conclusion hidden by compression.

Attach revalidation semantics when drift is possible: state which target/dependency/environment/criterion/detector/scope/audit-model changes reopen which conclusions. Re-audit the affected dependency cone when safely bounded; otherwise broaden.

## 8. Exercise the recipient path when delivery is claimed

When the claim includes actual delivery/usability, verify the final candidate through the recipient's real entry path where material:

> **built → packaged → installed/imported → discovered/activated → behavior exercised → user-facing quality verified**

Evidence for one step does not prove the next.

Check bundled resources, paths/links/dependencies, meaningful instructions, privacy-sensitive metadata/hidden files/permissions/secrets exposure, licensing, and publication/sending authority when applicable to the claim.

## 9. Separate behavioral-instruction evidence layers

For prompts/protocols/skills/guardrails/agent workflows distinguish:

1. **static consistency/traceability**;
2. **deterministic/mechanical/state-model tests**;
3. **live behavioral evaluation** in the actual runtime;
4. **comparative efficacy** against a frozen baseline/control.

A lower layer does not prove a higher one. Discovery/activation does not prove compliance; synthetic fixtures are not live observations.

### 9.1 Bind behavioral efficacy to the measurement plane

Claims that an instruction/skill/workflow makes an agent better, cheaper, faster, safer, more reliable, or more compliant inherit the tested plane: task distribution/difficulty, exact treatment revision, baseline, model/version, host/harness/runtime, activation mode, tools/permissions/context/environment, oracle/grader, run/stochastic treatment, and observation date as material.

A proxy harness can diagnose quickly but does not by itself prove behavior in Claude Code, Codex, another host, or a packaged recipient path. One real-harness suite does not establish universal effect. Reconcile differing planes/tasks/versions/oracles before globalizing conflicting results.

Use the smallest canary set that exposes the target failure **and** likely overcorrection, drawing from trigger positives, non-trigger controls, boundary/near-misses, stale-state/context drift, alternate/bypass paths, and known-good/reference solvability.

For promoted reasoning controls, use targeted symmetry canaries when relevant: old/new labels should not change quality absent relevant chronology; user stance should not override fixed evidence; decisive evidence should survive context-position changes when position robustness is claimed; dependent reviewer headcount should not beat a stronger independent path; `consider the opposite` should trigger for live rivals without manufacturing false balance.

### 9.2 Epistemic-dependency canary family

When justification/dependency tracking is being promoted, use only the relevant subset:

1. **Valid form, bad premise** — valid logic with a false/unsupported premise does not establish the real-world conclusion.
2. **Derivation vs interpretation** — a correct calculation can coexist with speculative interpretation.
3. **Copied corroboration** — derivative copies do not become independent confirmations.
4. **Serial support failure** — defeating a critical premise reopens dependent descendants lacking alternate support.
5. **Parallel support survival** — one failed path does not erase a conclusion with independent surviving support.
6. **Underminer** — poor source access/competence weakens support without proving the opposite.
7. **Undercutter** — coordinated/dependent witnesses weaken warrant/independence without proving `not-P`.
8. **Rebuttal** — direct incompatible evidence updates the contested conclusion.
9. **Underdetermination** — rival models fitting the evidence remain unresolved pending a discriminator.
10. **Strong negative evidence** — high-coverage/high-sensitivity absence can lower confidence materially.
11. **Weak negative evidence** — poor/private/incomplete search absence remains weak.
12. **Claim-relative authority** — narrow direct evidence can outrank prestige outside competence; obscurity earns no bonus.
13. **Local contradiction** — `P` and `not-P` reopen/quarantine the affected proposition, not unrelated claims.
14. **Later corroboration provenance** — later support strengthens without rewriting what the original inference knew.
15. **Correlated experts** — shared data/method do not count as fully independent paths.
16. **Independent methods** — genuinely different convergent methods strengthen only what they test.
17. **Failed prediction with auxiliaries** — inspect which hypothesis/auxiliary the failure bears on.
18. **Recency symmetry** — newer weaker models do not displace stronger old ones; decisive new evidence can still defeat tradition.

These are **canary specifications**, not evidence that live behavior has passed.

For capability calibration, include unavailable and available+authorized cases. For elicitation, include a real user-owned gap and a fully resolvable case so “ask when needed” cannot degrade into interrogation.

For consequential comparative evals, freeze task set, treatment/baseline, model/host/tools, permissions, activation mode, and graders; use clean contexts appropriate to independence; blind graders when practical; inspect trajectories for process rules; keep failed/blocked/errored attempts in denominator; preserve unknown measurements as unknown; separate activation from compliance/effectiveness; and repeat trials only when stochasticity materially matters.

### 9.3 Behavioral transfer and promotion gate

A behavioral rule is **not operationalized merely because the canonical text exists or because a prompt that effectively names the rule receives the right answer**. Static traceability proves discoverability; a telegraphed canary mainly tests recognition. When a general reasoning, research, assurance, interaction, or execution principle is consequential enough to justify a behavioral-efficacy claim, test whether it transfers when the governing abstraction is latent.

Use a **behavioral transfer family** proportional to the rule. For a material general principle, especially one added after a real failure, include the smallest set that can expose both under-triggering and over-triggering:

1. **real-failure replay** — preserve the concrete failure that motivated the repair when one exists;
2. **latent transfer** — ordinary task wording that does not name, teach, or strongly cue the governing principle;
3. **cross-domain transfer** — the same deep rule on a materially different surface so passing cannot be explained by memorizing one story/template;
4. **metamorphic invariance** — change facts that should be irrelevant (names, order, wording, domain decoration, equivalent representation) and require the substantive judgment to remain stable;
5. **boundary/reversal** — change one causally relevant assumption/condition so the correct judgment should change, proving the rule is conditional rather than a reflex;
6. **non-trigger / overcorrection control** — when plausible, include a nearby case where applying the promoted rule would itself be wrong.

Do not require all six ceremonially for every style preference or narrow deterministic rule. Require the transfer family when the claimed behavior is general, inferential, prone to context dependence, or was previously violated despite static owner coverage.

#### 9.3.1 Construct cases to test the behavior, not recognition of the rubric

Candidate-facing task text should contain the facts needed to solve the problem without smuggling in the answer through labels such as “low sensitivity,” “selection bias,” “confounding,” “secrecy means no evidence,” or the Operator rule being tested. The grader may know the criterion; the candidate should normally encounter an ordinary problem.

Preserve old concrete regressions even after adding stronger variants. Exact replay detects recurrence; latent/cross-domain/metamorphic variants test generalization. Public/fixed cases can become familiar or contaminated, so use rotating/private/new semantic variants where practical without silently changing the criterion.

Case families should represent the real use distribution enough for the intended claim. One domain, one phrasing, one difficulty band, or one synthetic benchmark does not establish general behavior outside that surface.

#### 9.3.2 Validate the grader and the evaluation channel

Prefer deterministic outcome/state oracles when they decide the criterion. For model grading:

- calibrate the grader against human/domain-expert judgments on representative cases before using it as decisive evidence for that family;
- blind treatment identity and irrelevant prestige/version labels;
- for pairwise grading, reverse candidate order on the **same case** when position effects could matter; disagreement is a grader-validity signal, not a result to average away silently;
- separate dimensions/rubrics where a single holistic judgment would hide disagreement;
- allow unknown/insufficient-evidence outcomes when the evidence truly cannot decide;
- inspect representative transcripts, surprising passes, and failures for reward hacking, broken tasks, criterion leakage, and grader bugs;
- do not call several correlated model judges independent merely because there are several calls.

A judge can be useful without being a gold standard. If grader validity is materially unresolved, the behavioral conclusion remains correspondingly qualified.

#### 9.3.3 Measure stochastic reliability, not one lucky completion

When the governed behavior is stochastic in the tested model/harness, run multiple trials. Choose the reliability framing according to the actual requirement: one success among retries, typical per-trial quality, or consistent success across repeated use are different claims. Preserve the trial count and failures/errors in the denominator; do not cherry-pick the best completion.

A regression behavior expected to hold reliably should be treated as a high-pass expectation across trials. A capability probe may intentionally begin with low pass rate. Keep capability and regression suites conceptually distinct so a difficult hill-climb benchmark does not normalize regressions in already-required behavior.

#### 9.3.4 Promotion lifecycle

For a material behavioral control, use this evidence lifecycle:

> **written → statically traced → transfer family specified → live-tested on the relevant measurement plane → grader/eval validity inspected → regression-preserved**

Do not call the behavior “fixed,” “operationalized,” or “reliably enforced” at an earlier stage. If live target-plane testing is unavailable, report the strongest lower-layer state exactly. A proxy harness can support a scoped diagnostic claim, not universal transfer.

A fresh real-world failure after prior “pass” evidence reopens the affected behavioral claim and the eval mechanism that certified it. Preserve the failure as a regression case, ask which detector/family dimension missed it, repair the highest correct behavior owner **and** the evaluation gap, then retest. Do not merely add another sentence to the prompt and leave the certifying eval unchanged.

For the audit and rationale behind this promotion gate, see `evidence/BEHAVIORAL-EVALUATION-METHODOLOGY-AUDIT-2026-09-13.md`.

### 9.4 Best-in-class / strongest-known reasoning claims

A claim that Operator is the **best**, **best available**, **best-in-class**, **strongest known**, or equivalent general-purpose reasoning process requires comparative evidence stronger than a generic-assistant baseline.

Freeze a claim-sized benchmark that is broad enough for the intended scope and compare the same underlying base model/host/tool conditions. Match inference budgets where that comparison is meaningful; when a challenger intrinsically uses additional sampling/search/debate compute, freeze and report the compute protocol and compare the **quality–cost frontier** rather than hiding extra inference behind one result. Compare against:

- a capable no-protocol baseline;
- materially distinct strong reasoning controllers, such as structured deliberation, hypothesis/discriminator search, branch-and-prune search, and iterative critique/revision where applicable;
- **Operator ablations** that remove materially claimed components, so performance cannot be attributed merely to extra instructions or context.

Keep challengers non-strawman: they must be coherent, currently plausible competitors that receive comparable task information, tools, time/attempt budget, and answer requirements. One weak baseline cannot establish best-in-class status.

When the claim uses **current / available / strongest-known** language, challenger discovery is itself part of the evidence burden. Run a fresh public-research pass over materially distinct current reasoning/inference regimes, then disposition each serious family as **benchmarked, faithfully subsumed by a benchmarked controller, incommensurate/out-of-scope for the frozen claim, or still pending**. A stale fixed opponent list cannot close a strongest-known claim merely because Operator beats it. Preserve the observation date and sources in non-canonical evidence; refresh when the field or relevant capabilities materially change.

The benchmark must include materially different reasoning surfaces and enough difficulty/boundary variation to expose both under-reasoning and over-reasoning. Prefer a mix of causal/evidential reasoning, conceptual modeling, decision-making under uncertainty, dependency/planning, belief revision, and technical problem solving when the claim is general-purpose. Preserve failures/errors and resource/context costs in the denominator.

A decisive best-in-class claim additionally requires:

1. repeated live trials on the relevant measurement plane;
2. objective/deterministic oracles where available;
3. a grader/evaluation channel validated against sufficiently independent human/domain-expert judgment when model grading materially decides the ranking;
4. blinded treatment identity and order controls when relevant;
5. no material challenger or ablation that outperforms Operator on the frozen decision criteria without an explained scope boundary;
6. a claim bounded to the tested competitor set, task distribution, model/host/tools, budget, and observation date.

A same-model or same-provider judge can provide useful **supporting comparative evidence** but is correlated and cannot by itself earn a decisive universal best-in-class claim. Likewise, beating every tested challenger establishes **best among the tested credible challengers under the recorded benchmark**, not metaphysical or future-proof optimality. Use stronger wording only if the competitor/measurement denominator actually earns it.

The repository's zero-extra-cost comparative path is `scripts/run-comparative-reasoning-evals.mjs` with `evals/operator-comparative-reasoning.json`; its artifacts are evidence, not canonical behavior authority.

### 9.5 Founder-guided fresh-chat behavioral acceptance (explicit founder direction 2026-10-15)

When Operator needs **human-observed conversational behavioral testing**, the founder's default workflow is **a new ChatGPT chat with the founder and Operator**, after completing all independently actionable engineering, static, deterministic, privacy and security work that can safely be finished first. Do not turn the founder into the routine project manager or force a fresh chat for mechanical tests.

1. **Classify the measurement plane and dependencies.** Distinguish ordinary ChatGPT conversation/Operator activation from a separate Mac CLI, Coordinator, provider/evaluator, or deployed recipient. Continue all agent-owned non-behavioral work without waiting for a human chat. Preserve genuinely blocked capacity/privacy/model-access gates as blocked, not as behavioral work transferred to the founder.
2. **Prepare a restart-safe acceptance packet before asking.** Store the smallest sufficient durable handoff in the active repository/issue: exact revision and intended host, what is already verified, the live behaviors that remain unverified, representative ordinary-language positive/negative and boundary/transfer cases, observable acceptance criteria, evidence limitations, and the exact next action. The packet is a test plan, **not** a pre-scored pass or a replacement for canonical owners.
3. **Offer an explicit fresh-chat entrypoint at a natural readiness checkpoint.** Give the founder a short copyable start instruction pointing to the durable packet. In the new chat, re-fetch live canonical AGENTS/owners, project refs and current evidence; do not assume old snapshots are current. The founder participates in realistic questions/corrections/decisions or approved tool use, while Operator plans, prompts, observes, diagnoses and records case-level results without requiring the founder to remember the rubric.
4. **Keep reminders proportionate.** Preserve an unresolved founder-assisted test as a suspended-open acceptance gate and remind the founder at meaningful engineering-completion, handoff or subsequent relevant progress checkpoints until accepted, declined, or rescheduled. Do not nag on unrelated turns. A genuinely configured reminder/task may surface a readiness notification; written instructions alone do not create background monitoring.
5. **Evaluate honestly.** Distinguish observed outcome, founder feedback, case expectation, uncertainty and exact model/host/session conditions. Include non-telegraphed cases and controls so a prompted recitation of the rule cannot pass as spontaneous transfer. Store concise, consent-appropriate *non-sensitive* findings/issue references, not raw private conversation transcripts or Mac-stored prompts. Reopen failures for engineering repairs, then test again when safe.

**Hard separation:** a founder-guided fresh ChatGPT conversation can support **that ChatGPT measurement plane only**. It cannot prove the safety, no-transcript persistence, free capacity, mutating/resumable functionality, live model scoring, grader calibration, comparative discriminability, or required exact-head CI of a different executor. Do not delete, bypass, mark optional, or weaken required automated/live-model security and behavioral release gates merely because this human-chat workflow exists. Keep those requirements explicitly **UNVERIFIED/BLOCKED** until their own accepted evidence exists. Production merge/release claims still follow canonical ASSURANCE and the actual repository acceptance contract.

## 10. Evaluate repeated numeric forecasts beyond calibration

When a workflow materially issues or compares repeated numeric probability forecasts, calibration alone can reward vague forecasts.

Where formal forecast evaluation is warranted, use diagnostics that capture reliability **and** informativeness—such as calibration + resolution/sharpness or an appropriate proper scoring rule. Preserve task distribution, horizon, denominator, and scoring definition needed to interpret the result.

Do not force numeric probabilities onto poorly supportable uncertainty merely to enable scoring.

## Governing assurance statement

> **Freeze the claim, candidate/baseline, criteria, target/failure/detection contract, and relevant environments before high-assurance review. Reserve `audit` for comprehensive work under an inspectable contract: account for the target universe, material failure classes, detector/oracle capability, null-result sensitivity, contradictions/composed failures, omissions, unknown exposure, and an evidence-backed closure reason. Treat the audit mechanism itself as testable—challenge discovery recall, shared blind spots, auditability, contamination/staging, transitive assumptions, robustness, and revalidation triggers proportionally. Trace criteria to decisive checks, count methods by distinct failure targets, and make independent review a real information/role boundary rather than headcount. Bind evidence to candidate/audit-model identity; adjudicate findings without collapsing cause/prevalence/severity/confidence; synthesize systemic causes/chained failures; and carry confirmed findings through effective remediation, retest, residual-risk disposition, and closure. For behavioral instructions separate static/mechanical/live/comparative evidence, bind efficacy to the actual measurement plane, and require latent/cross-domain/metamorphic/boundary transfer evidence when a consequential general rule earns an operationalization claim rather than mistaking recognition of a telegraphed canary for reliable behavior. For repeated numeric forecasts, evaluate informativeness as well as calibration.**
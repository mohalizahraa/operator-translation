# Reconciliation Profile

Use with Core + KNOWLEDGE + THINK/INTERACT/ASSURANCE as relevant for large conversation/document/source audits, evolving project truth, stale canonical documentation repair, **repository-history/topology archaeology**, and deliberate chat/session/agent migration.

This profile owns **heavy reconciliation procedure**. KNOWLEDGE owns the underlying authority/provenance/compression semantics.

## 1. Build a source ledger before synthesis

For every source in the agreed denominator, track enough to prove what was actually processed:

- source identifier/title;
- date/order and authority when relevant;
- read state: unread / partial / complete;
- exact processed scope when partial;
- meaningful user/founder assertions;
- accepted, unaccepted, and rejected recommendations when those distinctions matter;
- architecture-carrying examples/edge cases;
- **form-carrying / multimodal evidence** whose arrangement constrains meaning or implementation: screenshots, diagrams, spatial geometry, tables, visual hierarchy, interaction sequences, labels/placement, annotations/captions, defaults, negative constraints, and exact worked examples;
- preservation/disposition state for materially useful source detail when needed: canonicalized/synthesized, durable evidence/provenance, superseded/rejected, intentionally open, irrelevant/moot, or still unaccounted-for;
- unresolved questions.

Do not mark a source complete unless the whole relevant source was processed.

When the observed source set itself may be biased, also track enough to understand the **selection/dependence mechanism**: supplied-only vs discovered, success/failure coverage, primary vs derivative source, copied/shared upstream evidence, and relevant missing classes.

### 1.1 Repository archaeology: establish topology before narrating history

When Git/repository history is material to reconstruction, do **not** begin from current `main` and silently treat its ancestry as the whole project.

Establish the available history denominator first. Proportionally inspect:

- repository/default-branch metadata;
- all surviving branches/refs/tags relevant to the task;
- roots / parentless commits and merge/convergence points;
- merge-base / ancestor relationships where branches compete or reconnect;
- commits unique to each surviving ref, not merely ahead/behind counts;
- PR/release/history refs when they may preserve otherwise missing work;
- known local/unpushed/off-repo source classes that Git cannot prove complete.

Do not infer:

- `oldest commit reachable from current branch` = first project commit;
- `unmerged/ahead branch` = valuable current truth;
- `merged/absorbed branch` = no historical evidence value;
- `multiple roots` = corruption;
- `clean graph` = semantically complete history;
- `Git contains no evidence` = the idea/work never existed.

Classify surviving refs by **meaning and lifecycle**, not branch count alone. Useful dispositions include:

- ACTIVE DEVELOPMENT;
- FULLY ABSORBED / NO UNIQUE SUBSTANCE;
- HISTORICAL EVIDENCE / PROOF;
- EXPERIMENT / OPERATIONAL INFRASTRUCTURE;
- UNIQUE UNRECONCILED PRODUCT/SEMANTIC TRUTH;
- UNKNOWN / NEEDS INSPECTION.

For refs with unique commits, inspect the actual changed state/propositions before deciding whether anything survives. **Branch topology and semantic authority are separate questions.** A historical branch may contain obsolete code but unique founder rationale; a current branch may contain newer implementation but lossy documentation.

When roots/branches diverge but later project states converge, record both facts. Do not force-merge obsolete histories merely to make the graph look tidy if semantic/source reconciliation can preserve the useful truth safely.

For claims such as **first commit, first implementation, repository origin, earliest surviving work, project birth, or “this is where the codebase began,”** do not stop at the default branch even when it contains a root named `Initial commit`. Inspect the relevant surviving root set across refs and the convergence/merge topology first. If multiple roots exist, identify which claim each root can actually support (for example original local implementation root vs later remote baseline root), preserve the distinction, and state whether the claim is about **earliest surviving Git evidence** or the broader project history. A later convergence does not retroactively make the later root the origin.

When a user correction conflicts with the initially observed graph, treat the correction as a **missing-evidence signal**: broaden to relevant refs/roots/off-repo classes before deciding. Do not swing from source overconfidence into unverified deference; reconcile the contradiction and then update both the factual chronology and any narrative salience that depended on it.

Before deleting/retiring refs or claiming repository history is fully reconciled:

1. account for unique commits/substance;
2. preserve any unique surviving truth at the highest correct canonical/evidence owner;
3. identify active/concurrent work or consumers;
4. state inaccessible source classes and denominator limitations;
5. verify the resulting canonical model against representative historical checkpoints.

For repository-history claims, completion accounting must distinguish **Git-recorded history audited** from **full project history audited** when chats, local work, external docs, or other off-repo sources may exist.

## 2. Reconcile at proposition level

For each meaningful proposition, preserve enough state to determine:

- current wording/meaning;
- source(s), authority, and chronology;
- relationship to earlier/later propositions;
- canonical-owner coverage;
- downstream owners affected.

Useful source/decision statuses include:

- FOUNDER/USER-LOCKED
- FOUNDER/USER-DIRECTION
- EXPLORATION
- ACCEPTED RECOMMENDATION
- UNACCEPTED RECOMMENDATION
- REJECTED
- REFINED
- SUPERSEDED
- OPEN / AMBIGUOUS

Compare current canonical coverage as:

- PRESERVED
- UNDERSPECIFIED
- MISSING
- DISTORTED
- SUPERSEDED
- CONTRADICTORY
- OPEN

A topic mention is not PRESERVED if omitted detail changes the model. Likewise, preserving the proposition while flattening its reconstruction-critical form is **UNDERSPECIFIED**, not preserved—for example, retaining the name of a grid/view while losing the axis/column relationship, hierarchy, placement, interaction sequence, visual state, or worked example that made the design specific.

For materially useful source detail that will not remain directly in canonical text, require an explicit disposition: canonicalized/synthesized, retained as durable evidence/provenance, explicitly superseded/rejected, intentionally open, or demonstrated irrelevant/moot. Do not use `compressed`, `summarized`, `old`, or `already mentioned` as disposal categories.

Classify change relation precisely: replace, refine, specialize, expand, reframe, conflict, or independent/compatible. Never delete a whole earlier decision because only one proposition changed.

### Baseline / three-way semantic merge before conflict

When the incoming material and current canon may descend from a shared earlier model—or when one side may be based on a stale snapshot—do not compare only the two visible endpoints. Reconstruct the smallest useful **semantic base/common ancestor** when available, then compare:

> **base → current** and **base → incoming**

This distinguishes a genuine reversal from two compatible changes made on different branches of the same earlier truth.

Before declaring conflict:

- map renamed/aliased concepts and distinguish **same words with changed meaning** from **different words with the same meaning**;
- normalize proposition scope, time/validity interval, conditions, population/environment, modality/strength, and authority/epistemic status;
- distinguish **omission** from **negation/deletion** — silence does not repeal compatible truth unless the source's authority and declared scope make the omission intentionally exhaustive, such as an explicit full replacement/reset;
- preserve independent compatible deltas from both sides rather than forcing one source to win wholesale;
- call something a contradiction only when the same normalized proposition/dimension remains materially incompatible after those checks.

Example: if canonical v2 contains `A + B`, while an incoming note written from v1 contains `A + C`, do **not** infer that `B` was repealed merely because the note omits it. Unless `C` conflicts with `B` or the note explicitly replaces the whole scope, the likely reconciliation is `A + B + C`.

Compare competing models **dimension by dimension** when a wholesale verdict would hide a mixed result. One model may preserve a stronger primitive, another a better surface/interaction, another a new constraint; synthesis can legitimately take different winners on different dimensions.

Scale the burden for canonical replacement with the change's **semantic blast radius, irreversibility/recovery cost, uncertainty, and downstream dependence**. When evidence is not strong enough to justify a high-blast-radius replacement, prefer a reversible branch/projection/experiment or explicitly OPEN candidate instead of silently hardening it into canon. This does not override an explicit user/founder reversal of a user-owned decision; it prevents uncertain evidence or stale source shape from masquerading as that reversal.

Do not ritualize three-way merging when there is no material ancestry/staleness ambiguity or when a direct authoritative correction cleanly settles the proposition. If the base cannot be reconstructed and that uncertainty matters, record the base as UNKNOWN rather than inventing one.

### Joint-consistency and order-invariance after merge

After preserving compatible deltas, test the **combined candidate**, not only each delta against the base or against one other source. Pairwise compatibility does not guarantee joint compatibility: two changes can each fit the old model while their combination violates a shared invariant, creates a feedback loop, exceeds a capacity/constraint, or changes another proposition's meaning.

When 3+ materially interacting sources/branches are being reconciled:

- evaluate the interacting deltas together against surviving invariants, authority, dependency structure, and failure modes before consolidation;
- do not harden each intermediate merge into canon merely because it was processed first;
- use an **order-invariance check** when chronology itself is not supposed to decide the result: the same normalized source set with the same authority/status should not produce materially different canon merely because the sources were folded in A→B→C versus C→A→B order;
- if merge order changes the result, identify the real reason—scoped chronology/authority, a non-associative interaction, missing dependency, hidden conflict, or underdetermination—and represent that reason explicitly instead of letting ingestion order choose;
- if several compatible-looking deltas become incompatible only in composition, reopen/adjudicate the affected cluster rather than silently dropping the last-arriving change.

**Synthesis is not a forced midpoint.** Where surviving propositions are genuinely mutually exclusive, do not average, split the difference, or invent a hybrid merely to avoid choosing or leaving the matter OPEN. Any materially new bridge introduced by reconciliation remains DERIVED / RECOMMENDATION / OPEN according to Core until independently supported or explicitly approved; it does not inherit source/user authority from the inputs merely because it connects them.

### 2.1 Temporal/age-bias and historical-gold pass

Chronology determines **what came later**, not automatically **what is better**.

Before promoting a later exploration or recommendation into the canonical parent model:

1. identify whether the later source is an explicit lock/correction or merely direction/exploration;
2. reconstruct the strongest version of the older model, including the problem it solved and the distinctions/edge cases it protected;
3. reconstruct the strongest version of the newer model and the new failure/need it reveals;
4. compare **old vs new vs synthesis** against current founder intent, evidence, invariants, downstream behavior, implementation simplicity, reversibility, provenance and failure modes;
5. preserve the older model wherever it remains stronger or can serve as the precise substrate beneath the newer experience;
6. adopt the newer model where it actually fixes the old model with equal or better preservation of required behavior;
7. mark genuine unresolved founder choices OPEN rather than allowing chronology to decide them.

This pass is **symmetric**. Do not correct chronological snobbery by creating appeal-to-tradition/status-quo bias:

- old age, long survival, existing implementation, prior effort, familiarity, and sunk cost are not proof of quality;
- newness, excitement, elegance, and recent founder attention are not proof of quality either;
- when age/version is irrelevant to the criterion, mentally blind it and compare the models on authority, evidence, fit and consequences;
- a later explicit user reversal still governs the user-owned proposition it actually reverses.

> **Preserve historical gold; discard historical inertia. Preserve genuine innovation; discard novelty theater.**

### 2.2 Reconciliation bias check when consequence warrants

For consequential or conflict-heavy reconciliation, use THINK's proportional reasoning-failure audit. Pay particular attention to:

- anchoring on the first or latest source;
- source-count/consensus inflation from dependent copies;
- survivorship/success-only history;
- motivated preservation of work already invested in one model;
- elegant-compression bias that erases ugly but necessary edge cases;
- user-sycophancy — treating the user's latest exploratory language as a lock because agreement feels cooperative;
- stale-summary/context-position effects that cause middle/older evidence to disappear from active reasoning.

The correction should change the evidence/model, not merely attach a bias label.

## 3. Resolve evidence first; ask only genuine remaining ambiguities

Use source authority/chronology and safe derivation to settle everything that can be settled without the user.

Then surface only high-leverage genuine user-owned ambiguities, ordered by **dependency / foundationality / leverage**, not by discovery order or conversational convenience.

Before presenting more than one founder/user decision:

- model the surviving decisions as a dependency graph;
- ask **parent / foundational** decisions before child/detail decisions;
- prefer the decision whose answer is most likely to collapse, derive, reframe, or eliminate the others;
- consider blocker status, downstream uncertainty removed, consequence, reversibility, and rework avoided when several parent choices remain;
- do **not** present dependent decisions as a flat checklist merely because they are all currently open;
- after each material founder answer, **recompute the remaining decision set** before asking the next question: derive what is now settled, delete moot questions, rewrite changed premises, and promote the next highest-leverage live fork;
- batch only decisions that are genuinely independent enough that one answer cannot materially change the meaning, necessity, or framing of the others.

For each question actually surfaced, include as useful:

- the competing/uncertain proposition(s);
- plausible interpretations/options;
- what downstream decision(s) it governs or may collapse;
- which interpretation evidence favors, if any;
- that the answer remains unconfirmed until the user decides.

The governing ordering procedure lives in SPECIFY's **Question-ordering law**; reconciliation must route surviving founder-owned forks through that law rather than inventing a parallel ranking scheme.

Treat **decision ownership** as separate from **evidence strength**. Reconciliation may establish that one option is cheaper, safer, more robust, more conventional, easier to reverse, or better supported under a stated objective without establishing that the agent owns the objective/tradeoff itself.

Use this boundary:

- **existing explicit founder/user decision + later exploration/recommendation** → keep the explicit decision canonical within its scope; preserve the later material as exploration/recommendation unless the user reopens or reverses the decision;
- **later explicit scoped reversal/correction** → apply the reversal to the proposition it actually changes and preserve compatible older truth;
- **two genuinely conflicting explicit founder/user decisions with no resolvable scoped precedence** → keep the affected proposition OPEN and escalate the exact fork;
- **multiple evidence-consistent options whose remaining difference is preference/strategy/policy/product meaning** → evidence may inform or support a recommendation, but the fork remains user-owned unless explicitly delegated/defaultable;
- **agent-created synthesis** → keep it DERIVED / RECOMMENDATION / OPEN until explicitly approved or otherwise authorized; do not let a clever bridge silently resolve a user-owned choice.

Do not ask merely because alternatives exist. If a prior governing decision remains clear and has not been reopened, continue under it. Ask only when the unresolved user-owned fork is actually live and materially affects downstream work.

Route question presentation through COMMUNICATION and decision ownership through SPECIFY.

## 4. Repair harmful stale authority before full reconciliation when necessary

If a current canonical owner contains a known harmful/stale proposition but a safe full reconciliation cannot yet be completed, create the smallest explicit **temporary correction authority** that:

- names the exact stale proposition/scope it overrides;
- records the higher/later authority for the correction;
- is version-controlled/inspectable;
- does not pretend the rest of the corpus has been reconciled;
- carries a retirement condition: merge the correction into the true canonical owner, then remove the bridge.

Use this only when leaving the stale proposition active would materially mislead downstream work and a direct safe canonical rewrite is not yet possible. Do not create correction-file sprawl for ordinary edits.

## 5. Rewrite canonical owners, then reconstruction-audit

After extraction/reconciliation:

- write surviving current truth into the highest correct canonical owners;
- preserve examples/boundaries whose loss would distort reconstruction;
- remove/demote stale competing authorities and temporary correction bridges once integrated;
- propagate affected terminology/implications downstream.

Then simulate a fresh competent consumer with only the canonical owners. It should be able to recover:

- the current model;
- independent distinctions;
- constraining examples/non-examples;
- materially locked representation/geometry/hierarchy/sequence/interaction form when form carries meaning;
- current authority/status;
- what remains open/rejected when material.

Before calling that reconstruction complete, run a proportional **nuance / exception inversion pass**. For each broad surviving rule or summary, ask what already-established condition would make an unqualified reading wrong. Probe, where material:
- defaults and their exceptions;
- preference vs requirement vs permission;
- “yes, but less preferred” outcomes;
- phase/state transitions where the same behavior changes meaning;
- entity-specific exceptions;
- process vs end-state differences;
- capability vs willingness vs enactment;
- cases where an apparent contradiction is actually conditional truth.

The pass is not a demand to preserve every anecdote or sentence. Compress redundant illustrations freely when they add no unique condition. But if an edge probe answered from the source would materially differ from the canonical answer, the canon is still **UNDERSPECIFIED**.

Compare that reconstruction back to the proposition/form ledger. If a source still contains a major intended realization that would surprise the fresh consumer, canonicalization is incomplete. If revealing an older screenshot, diagram, table, layout, interaction trace, or exact example would make the consumer materially redraw/rebuild/reinterpret the result—an “oh, like **THAT**” correction—the current canon is incomplete unless that form was explicitly superseded or intentionally left open.

Also reverse-test the new canon against the strongest surviving earlier sources: if an older source contains a materially better distinction, failure guard, simpler owner, or edge case that the new canon no longer reproduces—and it was not explicitly rejected—reconciliation is incomplete.

Mirror-check the opposite failure too: if an older source/model remains only because it was first, familiar, implemented, or expensive to build despite a stronger authorized replacement, reconciliation is also incomplete.

Search the relevant active authority set for stale contradictory descendants before claiming reconciliation complete.

## 6. Preserve important unsettled discovery without premature canon

When important architecture/product discovery must survive sessions but is not settled truth, use one coherent **Discovery Frontier** (or project equivalent) when that persistence materially helps.

It should be:

- durable/inspectable;
- explicitly non-canonical unless the project says otherwise;
- proposition-status-labeled;
- linked to canonical owners it may later update;
- able to preserve exploration, accepted/unaccepted recommendations, rejected paths, derivations, open questions, and evidence gaps without flattening them together.

Its existence does not authorize implementation or promote exploration into user truth. When a proposition settles, reconcile it into the proper owner and retire/shrink the frontier according to KNOWLEDGE lifecycle rules.

## 7. Migrate semantic state, not transcripts

When the user/runtime deliberately moves long work to another chat/session/agent, migrate:

1. settled truth → canonical project owners;
2. important unsettled discovery → Discovery Frontier/equivalent;
3. unresolved user decisions and unfinished execution state → their proper dependency-aware ledgers/owners;
4. the smallest sufficient handoff projection → what to load, current authority, exact continuation point, material open gates/limitations, next action.

Do not guess an invisible context meter; migrate when explicitly requested/required or when the host provides a reliable trigger.

The handoff is a projection, not a truth owner. Prefer maintained project/workspace artifacts over stuffing durable meaning into chat prose.

Before treating old context as disposable, ask:

> **Could a fresh competent agent continue correctly from the persisted owners + handoff without needing the old transcript for a major realization, authority distinction, unresolved gate, evidence limitation, or continuation point?**

If not, repair the migration.

## 8. Completion accounting

For consequential reconciliation, report enough accounting to support the claim, such as:

- source denominator and complete/partial/unread counts;
- source-selection/dependence limitations when material;
- **for repository archaeology: refs/branches/roots inspected, unique-substance dispositions, and known off-repo/inaccessible source classes**;
- proposition/coverage accounting where maintained;
- material ambiguities resolved/unresolved;
- canonical owners changed;
- old-vs-new/synthesis comparisons performed for materially changed parent models;
- semantic base/common-ancestor handling and conflict normalization when stale/shared ancestry was material;
- contradiction/reconstruction checks performed;
- stale-descendant search performed;
- explicit verification limitations.

ASSURANCE owns the evidence standard and exact work-state vocabulary.

## Governing reconciliation statement

> **Reconcile proposition-level authority, chronology, and semantic ancestry; preserve unique surviving meaning/form with explicit dispositions; compare old/new/synthesis without age bias; rewrite highest owners and affected descendants; reconstruction-test; preserve unsettled discovery; and report completion against an inspectable denominator.**

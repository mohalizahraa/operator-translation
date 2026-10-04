# Handoff / Continuation Profile

Use when writing or replacing a substantial handoff, restart document, continuation brief, or cross-session/cross-agent state transfer.

Canonical project truth remains in its real owners. A handoff is a **temporary continuation projection** whose job is to preserve enough live structure that a fresh competent agent can continue correctly without reconstructing the project from old chats.

## 1. Reconcile before projecting

Build the handoff from:

> **current canonical owners + prior handoff(s) + active queue/workstreams + unresolved decision/discovery state + current execution/evidence state**

Do not treat the newest handoff as authoritative merely because it is newest.

For each materially live item from an earlier handoff, disposition it as one of:

- resolved/canonicalized;
- explicitly superseded;
- still open/unaddressed;
- active continuation state;
- intentionally deferred/parked;
- moot/stale because a resolved parent or current evidence actually made it moot.

Only the first, second, and genuinely moot categories may disappear without being represented elsewhere.

### 1.1 Bind handoffs to the exact state/ref they describe

A handoff for in-progress branch/PR work should normally live **with that state**, not be forced onto the default branch merely to make it globally visible. The default branch is primarily for merged/current canonical project state unless the project explicitly defines a central handoff registry.

When locating or resuming from a handoff, do **not** assume `main` / the default branch:

1. use an explicitly supplied handoff commit/ref when available;
2. otherwise use the active branch or PR head/base relationship that the continuation state identifies;
3. use the default branch only when the handoff is known to have landed there, the scoped work itself is on that branch, or no more specific recoverable ref exists.

A not-found result on the default branch proves only that the handoff is not present on that ref. Before calling the artifact missing, recover materially plausible scoped refs/PR heads/commits from the continuation evidence and try the exact state that should contain it.

A substantial handoff should preserve enough locator identity—repository, branch/PR when material, handoff commit/ref, relevant implementation head/base—to let a fresh agent retrieve the correct projection without guessing.

When branch-local work lands or is abandoned, reconcile the handoff's surviving live truth into the proper durable owners. Keep the handoff on the merged/default history only when it still earns provenance/reconstruction value; otherwise retire it after unique continuation state has been dispositioned.

## 2. Preserve the work graph, not only the last event

For substantial work, include only the depth the next agent needs, but preserve these dimensions when material:

- **grand direction / outcome** — what the larger effort is trying to accomplish and what completion means;
- **authoritative baseline** — current owners, relevant revisions/hashes/artifacts, and which source wins if projections disagree;
- **live queue / workstreams** — every materially active item, including **suspended-open loops displaced by tangents**, not merely the immediate next task, with a truthful status such as in-progress, suspended-open, ready, blocked/gated, intentionally deferred, or completed where that completion constrains later work;
- **task dependencies** — prerequisite/child relationships that determine safe ordering;
- **decision dependencies** — unresolved founder/user decisions, intentionally open choices, blockers, and which downstream branches each controls;
- **current state and evidence** — what is actually complete/proved versus planned, implemented, partial, awaiting review, or unverified;
- **exact continuation** — the next admissible action(s), their ordering/rationale, and the exact branch/file/run/source/restart point only where needed to resume safely;
- **later live work** — important queue items and larger direction that must remain visible even though they are not next;
- **return edges** — when one branch/tangent displaced another unfinished loop, preserve what should resume after what so nested detours do not erase the path back.

A handoff is incomplete when it lets the next agent finish the immediate next task but lose why that task exists, what follows, or which unresolved parent decision controls later work.

## 3. Keep queue order dependency-aware

Recompute the continuation queue from current dependencies before writing the handoff.

Do not mechanically copy an old backlog order when:

- a parent decision now blocks or releases a branch;
- completed work made a child task moot;
- new evidence changed prerequisites;
- one answer collapsed several downstream questions;
- parallel independent work can proceed while another branch is gated.

Distinguish **priority** from **admissibility**. A high-priority item that depends on an unresolved parent remains blocked; a lower-priority independent item may be the correct next action.

## 4. Kanban is a projection, not authority

A Kanban board, table, graph, outline, or similar view can be useful for maintaining the live queue.

If used:

- cards/items retain stable task/workstream/decision identities;
- status derives from the canonical work/decision state;
- dependency and decision-gate relations remain inspectable rather than being flattened into column position;
- moving a card does not itself authorize work, prove completion, or override a blocker;
- the view is refreshed or invalidated when source state changes;
- completed cards may leave the active board once their surviving truth/evidence is safely owned elsewhere.

Use the visualization that makes the current dependency structure easiest to understand. Do not introduce a board merely because handoffs exist.

## 5. Preserve multi-workstream and portfolio continuity

When several projects or workstreams are active, include a portfolio-level projection only when it helps coordination.

For each live or intentionally paused workstream, preserve at least its:

- current phase/state;
- next admissible action;
- blocker/gate;
- material dependency on another workstream, shared decision, shared resource, or common artifact;
- intentionally deferred continuation point.

Do not flatten independent work into one artificial serial queue, and do not let lower-priority work disappear merely because another stream is currently active.

## 6. Keep status and evidence exact

Use state language that matches actual evidence. Distinguish, where relevant:

- decided vs proposed;
- implemented vs verified;
- complete vs partial;
- ready vs blocked;
- paused intentionally vs forgotten;
- current authoritative artifact vs stale projection;
- known failure vs untested possibility.

Carry only the evidence identifiers and limitations needed for continuation; do not turn the handoff into an evidence archive.

## 7. Reverse-test before completion

Before calling the handoff sufficient, ask:

> **Could a fresh competent agent use current canonical owners + this handoff to know the larger direction, all materially live work, dependency/gate structure, evidence-backed current state, and exact next admissible action without needing the prior transcript for a major realization?**

Also ask:

> **After completing the immediate next item, would the agent still know what comes next and why?**

If either answer is no, the handoff is too local.

Retire or replace old handoffs only after unique live state is reconciled forward or moved to the proper durable owner. Do not preserve a graveyard of obsolete handoffs merely for chronology.

## Governing handoff statement

> **Preserve the continuation graph: direction, authority, live queue, dependencies, decision gates, evidence state, exact resume point, and the exact ref/state that contains the projection. Retrieve branch/PR-local handoffs from the state they describe rather than assuming the default branch. A handoff projects current truth; it does not replace it.**

# Arabic Book Translation — Handoffs

### 13.2 Multi-project translation continuity and handoff

When several books/manuscripts/editions are active at once, preserve a **translation portfolio work graph** above the individual project handoffs so a chat/session switch cannot make quieter projects disappear.

For each active or intentionally paused project, preserve only the fields needed to resume correctly, such as:

- stable project/book/edition identity and current authoritative source witness;
- exact current manuscript/release-candidate identity and evidence checkpoint;
- edition mode and active translation/formatting/terminology overlays;
- current phase and evidence-backed progress denominator;
- open source anomalies, translation/editorial questions, reviewer gates, formatting/production gates, and other blockers;
- next admissible action and what it depends on;
- intentionally deferred later work that must remain visible;
- cross-project dependencies or shared decisions (for example a terminology convention, formatting profile, reviewer availability, or reusable source-recovery result) that can affect more than one book.

Keep shared rules at their real shared owner and record project-specific exceptions at the project. Do not copy one book's exception into every other book merely because they are processed together.

A Kanban/board is useful as a **portfolio projection** when many translation projects are active. Its cards should derive from the project queue and retain stable identities/dependencies; columns may show phases such as source recovery, translating, semantic review, production QA, human review, blocked, or release-ready as useful to the actual workflow. Board movement is not proof that a gate passed and does not supersede the source/evidence state.

A translation handoff must distinguish **manuscript version**, **evidence/reconciliation checkpoint**, and **release candidate**. For every project that remains live, a fresh chat should be able to answer: *what is this edition trying to become, what source/candidate is authoritative, what has actually been verified, what is still open, what decision or evidence gates the next step, and what exact work comes next?*

Do not omit a project merely because another book currently has higher priority. Mark it intentionally paused/deferred with its preserved next step instead of letting it fall out of the continuation model.

### 13.3 Consolidate active artifacts only after truth is preserved

Version cleanup and storage cleanup are separate from semantic deletion.

When the user authorizes cleanup of superseded working artifacts:

- never delete or overwrite the authoritative source;
- retain the exact current candidate(s) the user still needs;
- preserve durable chronology, hashes, unresolved decisions, and reconstructive evidence in their proper knowledge/project owners before removing active duplicates;
- do not assume an older handoff's file-availability statement remains true after cleanup;
- do not keep hundreds of stale active proofs merely because they once contributed evidence.
- when the user says **latest**, **current**, or **final** during cleanup, resolve the artifact role before deletion: the highest-numbered evidence checkpoint may not be the latest manuscript, and a reviewer package is not automatically the book edition;
- enumerate the full in-scope storage surface, including pagination/duplicate variants where applicable, before bulk deletion; then re-list or otherwise verify the post-cleanup active set so preservation claims are evidence-backed rather than assumed.

The goal is a small active working set without loss of the knowledge needed to reconstruct why the current translation and release state are what they are.

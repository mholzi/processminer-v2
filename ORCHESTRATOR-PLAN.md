# Orchestrator — Design Plan

Status: **design only**, written 2026-05-28 after [v0.3.0](https://github.com/mholzi/processminer-v2/releases/tag/v0.3.0).
No code in this doc — the plan decides shape, location and interface so the
build is a separate, smaller commit.

## Hard principle — never contaminate Karpathy wiki logic

The orchestrator is a **read-only consumer** of the wiki. It MUST NOT:

- Write to `wiki/processes/<slug>/` or any of its sidecars
  (`ingest.json`, `lint.json`, `notes.json`, `review-state.json`,
  `sections.json`, `provenance.json`, `transitions.json`, `raci.json`).
- Add a new sidecar of its own that lives in the wiki tree.
- Stamp anything onto element frontmatter or bodies.
- Change the meaning of any existing wiki field by reinterpreting it
  outside the schema.

The Karpathy LLM-Wiki layers stay sacred: `raw-sources/` (immutable),
`wiki/` (Markdown source-of-truth with provenance), `schema/` (the typed
contract). The orchestrator lives **above** these layers, as a runtime
view, and its output is transient — same lifecycle as `ProcessView`.

If the orchestrator ever needs to *persist* something (e.g. dismissals,
prioritisation overrides), those persist outside the wiki — in
`.claude/`, `~/.processminer/`, or a new top-level state directory —
never inside `wiki/processes/<slug>/`. Today no such persistence is
needed.

This principle is **non-negotiable**. Every other decision below
respects it.

## What the diagram calls the orchestrator

Miso's ProcessMiner Architecture diagram (Confluence, 2026-05-27) shows the
orchestrator as a top-of-architecture component that "uses the Process JSON
to drive the discovery workflow." In the diagram it sits above the Navigation
UI and feeds it.

This design doc names what that means in practice for this codebase.

## The honest baseline — the orchestrator already exists, scattered

A real audit of the current code shows the orchestration responsibility is
already in the system, just not in one place:

- [`src/components/WelcomeScreen.tsx`](src/components/WelcomeScreen.tsx) —
  `pmAttentionForDoc(d)` (line 48) computes attention items from
  `doc.ingest.conflicts`, `doc.lint.findings` and `doc.notes`. Returns a
  weighted urgency score (`conflicts * 100 + lint * 5 + openComments`) used
  to sort the dashboard's ATTENTION column.
- [`src/components/TriagePanel.tsx`](src/components/TriagePanel.tsx) —
  per-process equivalent: lints, conflicts, comments surfaced for triage.
- [`src/lib/coverage.ts`](src/lib/coverage.ts) — `getCoverage()` computes
  the target-state coverage delta (resolved vs open problems).
- [`src/lib/process-view.ts`](src/lib/process-view.ts) — Piece 2 of the
  v0.2 rollout deliberately preserved `ProcessView.state` as the seam
  (sections + lint + coverage) but left `state` out of the initial ship.
- [`src/app/api/session/route.ts`](src/app/api/session/route.ts) — the
  chat pipeline. Today it's pure transport: routes the user's message to
  a warm `claude` worker. No orchestration logic.

The diagram makes "orchestrator" sound like a missing component. The
reality is closer to: it's been growing as ad-hoc widget logic, and
needs to be consolidated into one named module that the UI widgets and
the chat pipeline both consult.

## The decision points

### 1. Shape — state machine, LLM-driven, or hybrid

**Decision: state machine.** The orchestrator's job is to decide *what
deserves attention next*, not to author content. Authoring is what skills
do (and what we just spent v0.2 / v0.3 making efficient). Mixing the two
costs tokens and adds non-determinism to routing.

Concretely: the orchestrator is a pure function from `ProcessView.state`
to a ranked list of `ActionSpec`. No LLM call in the hot path.

The LLM still lives one layer up — the user chats, the chat pipeline picks
a skill, the skill calls the orchestrator if it wants to know "what's
broken?" or "where should I work?". Routing decisions stay deterministic;
content decisions stay LLM-driven.

### 2. Location — where does the module live

**Decision: `src/lib/orchestrator.ts`** — a TS module alongside
`process-view.ts`. Reasons:

- Both UI widgets (WelcomeScreen, TriagePanel) need it and they're TS.
- It reads `ProcessView`, which is TS.
- The chat pipeline (`route.ts`) is TS; it can call into the same module
  when a skill asks "what's the next action."
- Skills can still reach this surface via a thin Python wrapper later
  (`scripts/wiki/get_state.py`?) if they need it — not in this phase.

The function is **pure** (input: `ProcessView`, output: `OrchestratorState`).
Server-side, request-scoped, no caching needed — `getProcess()` rebuilds
the view per request anyway.

### 3. What it routes between — the action vocabulary

**Decision: name the actions, don't invent more.** The system today already
recognises four action *kinds*. The orchestrator surfaces them as a typed
union:

```ts
type ActionSpec =
  | { kind: "resolve-ingest-conflict"; slug: string; count: number; weight: number }
  | { kind: "resolve-lint-finding";    slug: string; id: string;    weight: number }
  | { kind: "address-comment";         slug: string; elementId: string; commentId: string; weight: number }
  | { kind: "resume-foundational-run"; slug: string; cursor: number; total: number; weight: number };
```

Each carries `weight` (higher = more urgent) so callers can sort. Weights
follow the existing convention in `pmAttentionForDoc`: conflicts beat lint
beats comments; resume-run sits between conflicts and lint.

Notably **not** in v1:
- "Next-element suggestion" (the foundational run already owns cursor
  walking — don't duplicate it).
- "Suggest a skill to invoke" (skills self-route from chat input; the
  orchestrator shouldn't second-guess the LLM's skill-matching).
- "Author next thing" (authoring is the skill's job, never the
  orchestrator's).

### 4. The interface

```ts
// src/lib/orchestrator.ts (new)

export interface OrchestratorState {
  /** Actions for one process, ranked. */
  actions: ActionSpec[];
  /** Convenience: highest-weighted action, or null if the process is clean. */
  topAction: ActionSpec | null;
  /** Coarse health summary the dashboard can render without re-walking. */
  health: {
    clean: boolean;
    conflicts: number;
    openLintFindings: number;
    openComments: number;
    runResumable: boolean;
  };
}

export function buildOrchestratorState(view: ProcessView, doc: ProcessDoc): OrchestratorState;

/** Cross-process aggregation for the WelcomeScreen ATTENTION column. */
export function buildAttentionFeed(docs: ProcessDoc[]): {
  attentionRows: AttentionRow[];   // one row per process that needs anything
  cleanProcesses: ProcessDoc[];    // surfaced as RESUME / OPEN PROCESS instead
};
```

`buildOrchestratorState` takes both the view and the doc because some inputs
(ingest conflicts, comments, the foundational-run cursor) live on the doc's
sidecars, not on the view. v0.2 intentionally kept `ProcessView.state`
deferred precisely so this decision could be made later — and "later" is now.

### 5. Migration — what the consolidation actually touches

| Today | After |
|---|---|
| `pmAttentionForDoc(d)` lives in `WelcomeScreen.tsx` | Moves to `orchestrator.ts`; `WelcomeScreen` reads `buildAttentionFeed(docs)`. |
| `TriagePanel` does post-ingest specific work | **Unchanged.** See revision note below. |
| `/api/session/route.ts` knows nothing about state | Unchanged (chat input → skill is still self-routing). The orchestrator's job is to *display* state, not to route chat turns. |
| `ProcessView.state` field reserved in the type but not populated | Now optional — callers needing it call `buildOrchestratorState(view, doc).health` directly. The view stays a pure-data join layer; the orchestrator is the next layer up. |

**Revision note (2026-05-28, during build):** Closer inspection of `TriagePanel`
showed its work is post-ingest specific (ingest receipt rows, confidence-spread
bar, untouched-sections list) — *not* the same "what needs attention?" question
the dashboard answers. Only one row (the conflicts count) overlaps with the
orchestrator's vocabulary. Migrating `TriagePanel` would force the orchestrator's
action vocabulary to grow to accommodate UI-specific shapes
(`low-confidence-draft`, `empty-section`, etc.) and undo the scope discipline
named at the top of this plan. Decision: `TriagePanel` stays as-is; the
orchestrator still exposes `buildOrchestratorState` so future consumers can use
it, but `TriagePanel` is not a target of this consolidation.

No on-disk format changes. No new sidecar files. No writer changes. Pure
read-side consolidation.

## What's explicitly out of scope

- **LLM-driven dispatch.** Don't ask the LLM to decide "what to do next" —
  the inputs (lint findings, conflicts, cursor) are deterministic data;
  burning tokens to read them and re-emit a ranked list is waste. Stay
  state-machine.
- **A user-facing "next action" panel as a new widget.** The data already
  flows into WelcomeScreen's ATTENTION column and TriagePanel. Don't add
  surface area; consolidate what exists.
- **Server-side persistence.** The orchestrator is rebuilt per request,
  same as `ProcessView`. If perf bites, memoise by `(slug, mtime)` — but
  measure first.
- **Cross-module orchestration** (Processminer ↔ ArchitectMiner). v0.4
  scope is single-module. Handoff orchestration is a follow-up doc.

## Acceptance criteria

- [ ] `src/lib/orchestrator.ts` exports `buildOrchestratorState(view, doc)`
      and `buildAttentionFeed(docs)`.
- [ ] `pmAttentionForDoc` is removed from `WelcomeScreen.tsx`; the widget
      reads from `buildAttentionFeed`.
- [ ] `TriagePanel` reads from `buildOrchestratorState`; no derived counts
      computed in the component.
- [ ] Behaviour parity against the current dashboard — same rows in the
      same order on `sepa-payments` + the bank-guarantee dogfood processes.
- [ ] Tests in `src/lib/orchestrator.test.ts` covering weighting, top-action
      selection, and the clean-process case.

## Open questions to resolve before building

1. **Where does the foundational-run cursor live in the state?**
   `review-state.json` is read by `getProcess()` already. The orchestrator
   reads `doc.reviewState` directly — no API change. Locked.
2. **Does the chat pipeline call the orchestrator?** Not in v0.4. A skill
   that wants state can read it via the same module if/when needed. Locked.
3. **Should attention items be cross-module (PM + AM)?** No for v0.4 —
   ArchitectMiner's attention shape isn't stable yet. Revisit.

## What this unlocks

Once `OrchestratorState` exists as a typed object:

- A future "Next action" CLI for skills (`scripts/wiki/get_state.py`) can
  emit the same JSON shape so `/foundational-run` or a future
  meta-orchestrator skill can read it deterministically.
- A future cache benchmark (the other v0.4 open item) can use the
  orchestrator's `health` summary as a stable test fixture — "is this
  process in a known state?".
- The diagram's "orchestrator uses the Process JSON" claim becomes
  literally true at the code level.

## Cross-references

- [TARGET-ARCH-PLAN.md](TARGET-ARCH-PLAN.md) — the v0.2 / v0.3 rollout
  this builds on
- [src/lib/process-view.ts](src/lib/process-view.ts) — the seam
- [src/components/WelcomeScreen.tsx](src/components/WelcomeScreen.tsx) —
  the de facto orchestrator widget today

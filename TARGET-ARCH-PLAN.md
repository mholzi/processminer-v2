# Target Architecture — Implementation Plan

> **Status (2026-05-28): SHIPPED.** All three pieces delivered and the skill
> rollout completed across [v0.2.0-alpha](https://github.com/mholzi/processminer-v2/releases/tag/v0.2.0-alpha) →
> [v0.2.0-beta](https://github.com/mholzi/processminer-v2/releases/tag/v0.2.0-beta) →
> [v0.2.0](https://github.com/mholzi/processminer-v2/releases/tag/v0.2.0) →
> [v0.3.0](https://github.com/mholzi/processminer-v2/releases/tag/v0.3.0). See
> "What's still open" at the bottom.

Three structural pieces that move the codebase toward the target architecture
sketched by Miso in the ProcessMiner Architecture diagram (Confluence, 2026-05-27),
with LLM efficiency as the primary lens.

The target diagram posits: one Process Schema, one consolidated Process JSON per
process, an orchestrator that drives discovery from it, dynamic navigation +
generic/custom renderers fed from it, deterministic validation, and minimal
LLM context (artifact content + LLM-output schema only).

This plan does **not** consolidate the on-disk wiki into one Process JSON. It
introduces the three abstractions that make that consolidation safe, efficient
and reversible — and that deliver standalone wins (token efficiency, renderer
cleanup, skill simplification) even if the consolidation never happens.

## Goals

- Make LLM calls predictable in token cost and cacheable across turns.
- Give every consumer (skills, renderers, future orchestrator) one place to
  ask for "the slice of process state I need."
- Make the Process Schema the single source for both validation *and* the
  rules the LLM is asked to follow — no duplication in skill prose.

## Non-goals (v0.2 scope)

- Collapsing per-process state into one JSON file. The current scattered
  layout (Markdown elements + sidecars) stays.
- Replacing or rewriting any skill. Skills migrate one at a time, opt-in.
- Changing the wiki writer contracts (`write_element.py` et al.). The plan
  *consumes* the schema; it does not change how the schema is enforced.

## Build order

1. **Piece 3 — Derived per-type schemas.** Lowest risk, zero runtime impact,
   immediate token saving when consumed by `show_template.py`. Foundation for
   pieces 1 and 2.
2. **Piece 2 — ProcessView.** Extends `getProcess()`; migrates two renderers.
   No skill changes.
3. **Piece 1 — Context channels.** Composes pieces 2 + 3. Migrates one skill
   at a time, starting with `/process-specialist`.

Each piece ships independently and is useful on its own.

---

## Piece 3 — Derived per-type schemas

**Problem.** Today the LLM sees rules in two places: `schema/process-schema.json`
(2,781 lines, the source) and skill prose (templates pasted, format rules
re-stated, examples implicit). The LLM either gets the whole schema (token-
expensive) or a paraphrase (drift-prone). There is no per-type compact artifact.

**Proposal.** A build step that emits one compact JSON per element type, used
by `show_template.py`, the future context builder (piece 1), and any new
validator that wants per-type rules without loading 2,800 lines.

### Shape

```
schema/.derived/<element-type>.llm.json
```

Per file:

```jsonc
{
  "elementType": "process-step",
  "section": "process-steps",
  "idPrefix": "step",
  "frontmatter": {
    "fields": [ /* name, type, enum, required, description */ ],
    "required": [ "id", "title", "status" ]
  },
  "template": [
    { "heading": "Description",  "format": "prose",  "wordRange": [40, 120] },
    { "heading": "Trigger",      "format": "prose",  "wordRange": [10, 50] }
    // ...
  ],
  "relations": [
    { "name": "owned_by",   "targetType": "role",         "cardinality": "one" },
    { "name": "depends_on", "targetType": "process-step", "cardinality": "many" }
  ],
  "outputSpec": {
    /* the JSON shape write_element.py accepts for this type */
  },
  "examples": [
    { "ref": "wiki/processes/sepa-payments/process-steps/step-validate-iban.md" }
  ]
}
```

### Build script

- New: `scripts/wiki/build_derived_schemas.py`
- Reads `schema/process-schema.json`, iterates `elementTypes`, emits one file
  per type into `schema/.derived/`.
- **Examples — hybrid auto + curation override.** For each element type:
  1. If `schema/.curated-examples.json` has an entry for the type, use those
     paths (curation wins).
  2. Otherwise auto-pick from `wiki/processes/sepa-payments/` by heuristic:
     conforms to schema AND hits word-range targets. Prefer 1–2 examples per
     type. (Note: approval status is *not* a requirement —
     `sepa-payments` is a seeded reference process with 0 approved elements
     but well-curated content. Heuristic adjusted from the original spec
     during piece-3 implementation, 2026-05-28.)
  3. If auto-pick finds zero candidates, emit `"examples": []` and warn —
     do not fail the build (a type with no in-wiki examples is a real state,
     not an error).
- Determinism: stable key ordering, no timestamps, byte-identical re-runs.

### Sync / consistency

- **Decision: commit `schema/.derived/`.** Skills run via Bash in a warm
  Claude CLI worker that won't invoke a build step before reading; PR diffs
  on derived files become the audit trail for what the LLM actually sees.
- CI gate: a check that re-runs the builder and fails the build if
  `schema/.derived/` is out of sync with `schema/process-schema.json` or
  with the source wiki's example state. (Mirror the pattern in
  `scripts/check_skill_blocks.py`.)
- Pre-commit hook (optional, local): same check.

### Consumer migration

| Consumer | Change | When |
|---|---|---|
| `show_template.py` | Thin wrapper that prints the derived file for the given type | Piece 3 ships |
| Skills referencing templates | No change — still call `show_template.py` | Piece 3 ships |
| Future context builder (piece 1) | Read derived file directly | Piece 1 |
| `check_conformance.py` | Optionally read derived file for per-type rules (perf only) | Optional |

### Testing

- `tests/test_derived_schemas.py`: builder is idempotent; every element type
  in the source schema has a derived file; every required frontmatter key
  appears in the derived file.
- Parity test: every `## ` heading in the source schema's templates appears in
  the derived `template` array with matching format/word-range.

### Acceptance criteria

- [ ] `python3 scripts/wiki/build_derived_schemas.py` produces 32+ files
      in `schema/.derived/`.
- [ ] `show_template.py process-step` returns ≤ ~80 lines (vs. today's spread
      across the 2,781-line file).
- [ ] CI fails if `schema/.derived/` drifts from source.
- [ ] At least one type has a curated `examples` entry referenced from
      `wiki/processes/sepa-payments/`.

### Risks

- **Examples rot.** If a curated example element is renamed or deleted, builds
  break. Mitigation: builder validates curation paths exist; if a curated
  path is invalid, the build fails loudly so the override can be re-picked.
  Auto-picked examples self-heal — the heuristic just re-runs against the
  current wiki state.
- **Auto-picked examples may be mediocre.** Heuristic-picked examples teach
  the LLM whatever pattern they exhibit. Mitigation: the curation override
  exists precisely so a human can replace any auto-pick that's suboptimal
  without affecting the build for other types.
- **Schema surface area.** Some types may have idiosyncratic rules (e.g. RACI)
  that don't fit the generic shape. Mitigation: allow `extras: {}` per type;
  audit during build.

---

## Piece 2 — ProcessView

**Problem.** Today `getProcess(slug)` in [src/lib/wiki.ts:376](src/lib/wiki.ts)
returns a `ProcessDoc` with elements + lifted sidecar bundles attached. Renderers
then do their own joins:
- [RaciMatrix.tsx:28-43](src/components/RaciMatrix.tsx) loops roles, builds a
  `grid[stepId][roleId]` pivot.
- [ProcessFlow.tsx:33-78](src/components/ProcessFlow.tsx) reads steps + roles,
  derives lane assignments from each role's `raci` entries.

When the future context builder needs "the related role + control + dependency
summaries for this step," it will reinvent the same joins again. There is no
*one place* that owns the joined shape.

**Proposal.** Extend `getProcess()` to also return a `ProcessView` — a set of
pre-joined views and a `contextFor(elementId, opts)` helper. Migrate the two
custom renderers to consume it. No skill changes.

### Shape

```ts
// src/lib/process-view.ts (new)

export interface ProcessView {
  // pre-joined renderer views
  raciGrid: Map<StepId, Map<RoleId, RaciLevel>>;
  flow: {
    nodes: StepNode[];
    edges: TransitionEdge[];
    lanes: LaneAssignment[];
  };

  // typed lookups
  byType: Map<ElementType, WikiPage[]>;
  byId: Map<ElementId, WikiPage>;

  // deterministic orchestrator state — deferred from v0.2.0-beta (the
  // initial Piece-2 ship); will land when the orchestrator design lands.
  state: {
    sections: SectionStatus[];     // from sections.json
    lintFindings: Finding[];       // from lint.json
    coverage: CoverageReport;      // from src/lib/coverage.ts
  };
}

// Context slicing for the LLM and future orchestrator is a *free function*
// over the view, NOT a method on it. Discovered during piece-2
// implementation (2026-05-28): ProcessDoc.view crosses the React Server
// Components boundary into client components, and Next.js refuses to
// serialise functions across that boundary. The original sketch put
// contextFor as a method; it broke every process page until refactored.
export function contextFor(
  view: ProcessView, elementId: string, opts?: ContextOpts,
): ElementContext | null;

interface ContextOpts {
  depth?: 1;                       // 1 = direct relations only; default 1
  includeProvenance?: boolean;     // default false — critical
  includeBody?: boolean;           // default true; false returns summary only
}

interface ElementContext {
  element: WikiPage;               // the focal element
  related: {                       // direct forward + reverse links
    [relationName: string]: { id: string; title: string; summary: string }[];
  };
  meta: {                          // process meta-data
    slug: string;
    title: string;
    sections: { id: string; status: SectionStatus }[];
  };
}
```

### Key design constraints

- **`contextFor()` returns summaries**, not full bodies, for related elements.
  Single biggest token lever. The summary is the element's title + first prose
  block trimmed to N words (configurable; default ~30).
- **Provenance is opt-in, default off.** Authoring calls never load it;
  validation/audit calls explicitly request it.
- **One build per request.** `getProcess()` builds the view once, caches it
  in a per-request scope (Next's `dynamic = "force-dynamic"` already re-builds
  per request).

### Consumer migration

| Consumer | Change |
|---|---|
| [RaciMatrix.tsx](src/components/RaciMatrix.tsx) | Replace grid-building loop with `view.raciGrid` |
| [ProcessFlow.tsx](src/components/ProcessFlow.tsx) | Replace lane derivation with `view.flow.lanes` |
| `src/app/ProcessDocScreen.tsx` | Pass `view` alongside `doc` to children |
| Skills (later, via piece 1) | Call `contextFor()` indirectly through `get_context.py` |

### Testing

- `tests/test_process-view.ts`: golden tests against `sepa-payments` —
  `raciGrid` matches the on-screen matrix; `flow.lanes` match the on-screen
  swimlane assignment.
- Snapshot test for `contextFor(step-id, default opts)` — verifies summaries
  are trimmed, provenance is absent, related elements are present.

### Acceptance criteria

- [ ] `getProcess(slug)` returns `{ doc, view }` where `view` implements
      the `ProcessView` interface.
- [ ] `RaciMatrix` and `ProcessFlow` contain no join logic — purely render
      from `view`.
- [ ] `contextFor()` returns a typed object with provenance absent by default.
- [ ] `contextFor("some-step", { depth: 1 })` returns the step + its owning
      role + its dependencies, all with summaries not bodies.

### Risks

- **API breakage.** `getProcess()` callers need the new return shape. Mitigation:
  return `{ doc, view }`; existing callers keep using `doc` until they migrate.
- **Performance.** Building `raciGrid` and `flow.lanes` on every request may
  cost milliseconds. Mitigation: profile with `sepa-payments`; if hot, memoize
  by `(slug, mtime)`.

---

## Piece 1 — Context channels

**Problem.** Today every skill assembles LLM context ad-hoc in prose: "run
`show_template.py`, then read these files, then read related elements."
`process-specialist/SKILL.md:42-68` is the canonical pattern; the other 5
specialists reinvent it slightly differently. No shared structure means:

- LLM prompt cache thrashes across turns (no stable prefix discipline).
- Skills can't share improvements (a token-saving trick in one specialist
  doesn't propagate).
- Adding a new skill means copying context-assembly prose.

**Proposal.** A typed context builder, callable from skills via a thin Python
CLI (`get_context.py`), that returns two strings: `stable` (cacheable prefix)
and `volatile` (per-turn tail).

### Shape

```ts
// src/lib/llm-context.ts (new — consumed by get_context.py via subprocess
// or via a small Node CLI; decide during piece 1)

type ContextChannel =
  | { kind: "artifact";           elementId: string; mode: "full" | "body-only" }
  | { kind: "type-schema";        elementType: string }   // from piece 3
  | { kind: "related";            elementId: string; depth: 1 }
  | { kind: "process-meta";       slug: string }
  | { kind: "skill-instructions"; skill: string }
  | { kind: "conversation";       turns: number };

export function buildElementContext(
  slug: string,
  channels: ContextChannel[],
): { stable: string; volatile: string };
```

### The two buckets (cache-prefix discipline)

| Bucket | Channels | Why |
|---|---|---|
| **stable** | `type-schema`, `skill-instructions`, `process-meta` (titles + section list, no element bodies) | These change rarely; ideal for Anthropic's 5-min prompt cache |
| **volatile** | `artifact`, `related`, `conversation` | These change every turn; cheap to re-send |

The builder is responsible for the *ordering* (stable first, then volatile)
so the cache prefix is well-defined.

### CLI wrapper for skills

**Language: Python**, built on top of `scripts/wiki/wiki_lib.py`. Matches the
existing pattern of every other wiki tool (`write_element.py`, `patch_element.py`,
`show_template.py`, `set_approval.py`) so skills have one idiom for wiki ops.
The TS twin in `src/lib/llm-context.ts` (if/when needed for the web app) is a
separate concern and can converge later.

```
python3 scripts/wiki/get_context.py \
  --slug sepa-payments \
  --element step-validate-iban \
  --channels type-schema,related,process-meta \
  --format prompt
```

Emits stdout: a fenced markdown block ready to paste into a skill's prompt.
This is the only thing skills need to learn — same interface pattern as
`show_template.py`.

### Skill migration

Migrate one skill at a time. Order:

1. `/process-specialist` — canonical pattern; biggest readability win.
2. `/control-compliance-specialist` — similar structure to process specialist.
3. `/document-ingest` — different pattern (extraction); good stress test.
4. Remaining specialists — `client-journey`, `innovation-analyst`,
   `it-architect`, `transformation-agent`.
5. `/foundational-run` — last; complex turn-by-turn state.

For each migration:
- Replace the "context assembly" section of the SKILL.md with a
  `get_context.py` call.
- Keep the verbatim cross-skill blocks (provenance, read-back) unchanged.
- Re-run `scripts/check_skill_blocks.py` to verify byte-identical blocks.
- Run `dogfood-run` against `sepa-payments` to verify behaviour parity.

### Testing

- `tests/test_llm-context.ts`: snapshot tests for each channel kind against
  `sepa-payments`.
- Determinism: same inputs → byte-identical output.
- Token budget: an assertion that a "process-step authoring context" comes in
  under N tokens (set N from current ad-hoc measurement, then tighten).

### Acceptance criteria

- [ ] `get_context.py` produces a deterministic prompt for a given
      (slug, element, channels) triple.
- [ ] Output is split into clearly delimited `stable` / `volatile` sections
      so callers can drop them into a cached-prefix prompt structure.
- [ ] At least one skill (`/process-specialist`) is migrated and dogfooded
      against `sepa-payments` with no behavioural regression.
- [ ] Token usage for a process-step authoring turn drops measurably vs.
      pre-migration baseline.

### Risks

- **Behavioural drift.** A skill that worked with ad-hoc context may behave
  differently with structured context. Mitigation: dogfood every migration;
  keep the old SKILL.md prose in git history for rollback.
- **Subprocess overhead.** Calling `get_context.py` for every turn adds
  ~tens of milliseconds. Mitigation: acceptable for v0.2; optimise later
  by making it a Node CLI in-process.

---

## Cross-cutting concerns

### Schema-vs-derived sync

A schema change must update derived files atomically. Enforced by:
- CI gate that fails on drift.
- `build_derived_schemas.py` runs in pre-commit (optional, local).
- Code-review convention: schema PRs include the derived diff.

### Provenance is sacred, but invisible to authoring LLMs

The whole plan rests on one invariant: **per-heading provenance lives in
sidecars, never in element frontmatter, and is loaded only when explicitly
requested.** This is already true today (see [HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md));
piece 2's `includeProvenance: false` default makes it the default-off behaviour
in code too.

### Backward compatibility with writers

None of these pieces changes how `write_element.py`, `patch_element.py`, or
`set_approval.py` work. The schema stays the source; the writers stay the
only mutation path; the wiki layout stays as it is. We are adding *read-side*
abstractions on top.

### Orchestrator (deferred to v0.3 — design doc to follow)

The diagram's "Orchestrator" component is not built here. Decision: defer
until piece 2 ships and `view.state` is in real use; then write a follow-up
design doc.

The seam to preserve in piece 2: `view.state` (sections + lint findings +
coverage) must be **deterministic** — readable without an LLM call. A future
orchestrator that decides "next, work on section X" or "resolve this lint
finding" can then be a pure state machine over that object. LLM calls are
reserved for content authoring, not for routing.

Candidate shapes to evaluate later (do not choose now):

- **Embedded in `/api/session`** — simplest; route handler reads `view.state`
  and dispatches to a specialist skill. Likely starting point.
- **Separate Python CLI** — matches the wiki toolkit but adds a subprocess
  hop on every turn.
- **Standalone Node service** — only worth it if orchestration becomes complex
  enough to warrant.

---

## Rollout

| Milestone | Pieces | Visible to users |
|---|---|---|
| v0.2.0-alpha | Piece 3 ships; `show_template.py` migrated | No visible change |
| v0.2.0-beta  | Piece 2 ships; renderers migrated         | No visible change (parity tested) |
| v0.2.0       | Piece 1 ships; `/process-specialist` migrated | Faster, cheaper specialist turns |
| v0.3.x       | Remaining skills migrated                  | Cumulative token savings |

Tagged releases at each milestone. Each milestone is independently revertable.

## Resolved decisions

Locked in during planning, 2026-05-28:

1. **Commit `schema/.derived/`.** Skills run via Bash in a warm Claude CLI
   worker and can't depend on a build step; PR diffs on derived files become
   the audit trail for what the LLM is shown. CI gate enforces freshness.
2. **Examples: hybrid auto + curation override.** Builder auto-picks from
   `sepa-payments` by heuristic (approved + conforms + word-range), with
   `schema/.curated-examples.json` available to override any type's pick.
3. **`get_context.py` in Python**, built on `scripts/wiki/wiki_lib.py`.
   Matches the existing wiki-tool idiom. TS-side context builder is a separate
   concern if/when the web app needs one.
4. **Orchestrator deferred to v0.3.** Piece 2 must expose a deterministic
   `view.state` as the seam. Design doc to follow once piece 2 ships and the
   state object is in real use.

## What's still open

The original three pieces shipped. These are the items that surfaced during
or after execution and are *not yet* delivered:

### 1. Orchestrator (deferred from Piece 2)

The diagram's "Orchestrator" component still does not exist as a discrete
module. Today, routing lives implicitly inside each skill and inside
`/api/session/route.ts`. Piece 2 preserved the seam:
`ProcessView.state` (sections + lint findings + coverage) is reachable as
pure data on the server side — a future orchestrator can read it and dispatch
without burning LLM calls on routing decisions.

What's needed before any code:
- A short design doc deciding shape (state machine over `view.state` /
  LLM-driven dispatcher / hybrid).
- A concrete answer to "where does it live" (route handler, separate Python
  CLI, separate Node service).
- A concrete answer to "what does it route between" (skill invocation,
  next-element suggestion, lint-finding triage).

### 2. Cache benchmark

The v0.2 / v0.3 work claims cache and consistency wins. The actual cache-hit
rate against Anthropic's prompt cache is unmeasured. A short benchmark
comparing pre-v0.2 vs post-v0.3 skill turns on `sepa-payments` would either
validate the claim with numbers or surface gaps in how the STABLE bucket is
being assembled.

What's needed:
- A repeatable benchmark harness (probably in `eval/`).
- Baseline measurements: `/process-specialist` and `/foundational-run` turn
  shapes pre-v0.2 (reconstructable from git).
- Post-v0.3 measurements: same turns with the new infrastructure.
- A short write-up to publish alongside.

### 3. View-side context builder (TS-side counterpart to `get_context.py`)

The Python `get_context.py` covers the skill side. The web app has
`contextFor(view, id, opts)` in `src/lib/process-view.ts` but no consumer
yet — the app reads relations via `buildRelations()` directly. If the app
ever surfaces "the LLM context for X" as a UI panel (useful for debugging
why an element was authored a certain way), the TS side becomes the natural
home. Not urgent.

### 4. Skills genuinely not migrated

Five skills were considered and intentionally left untouched (see
[v0.3.0 release notes](https://github.com/mholzi/processminer-v2/releases/tag/v0.3.0)):
`/conflict-resolution`, `/run-lint`, `/qer-session`, `/new-process`,
`/dogfood-*`. These don't have context-gathering patterns the new
infrastructure targets; revisit only if their shape changes.

## Cross-references

- [ARCHITECTURE.md](ARCHITECTURE.md) — cold-start reading guide
- [SKILLS.md](SKILLS.md) — agent/skill architecture
- [CONTENT-MODEL-PLAN.md](CONTENT-MODEL-PLAN.md) — schema decisions D1–D6
- [HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md) — per-heading provenance contract
- Confluence: ProcessMiner Architecture diagram (Miso Pach, 2026-05-27)

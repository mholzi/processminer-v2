# Feature Roadmap

**Version:** 2026-05-28 · **Status:** Candidate pipeline, not a commitment
· **Horizon:** 2026 H1 → 2028+ · **Updated after** the v0.4.0 architecture
rollout, the 2026-05-28 dogfood run, and the Sparx/Adonis/EPM landscape
discussion.

---

## Executive summary

Processminer started as an LLM-Wiki for documenting a single banking
process end-to-end with SME interviews. The v0.4.0 rollout (TARGET-ARCH-PLAN
+ ORCHESTRATOR-PLAN) finished the foundational engine: derived per-type
schemas, a pure-data `ProcessView` join layer, and an orchestrator state
machine that picks the next best action from the wiki's own state. The
**Processminer component** is now a usable elicitation tool for one process
at a time, and **ArchitectMiner** can develop seven target-architecture
sections from a documented As-Is process.

This roadmap is the bridge from "usable for a single dogfood SME" to
"institutional bank-wide tool that integrates into the existing landscape
and supports the recurring deliverables a process / architecture / change
team actually produces". Seven phases, ≈80 candidate ideas, structured by
the questions they answer:

| Phase | Question | Candidates |
|---|---|---|
| **0.** Foundations & tech debt | "Is the JSON-native baseline's remaining engineering debt cleared?" | 2 |
| **1.** Processminer component | "Does the elicitation tool feel complete to an SME?" | 13 |
| **2.** ArchitectMiner | "Can an architect develop the target state without leaving the tool?" | 20 |
| **3.** General usability | "Does the whole app feel like a finished product?" | 11 |
| **4.** Process analysis fundamentals | "Do we cover the basics a pro process analyst expects?" | 4 |
| **5.** Top-architect expectations | "Would a senior enterprise architect ship out of this tool?" | 20 |
| **6.** Tool connectors | "Does it talk to Confluence and Jira (the bank's product/tech home)?" | 4 |
| **7.** Domain modules | "Does it serve Change/Transformation, Training, and Policy cross-check?" | 3 |
| **Deferred pool** | Promising ideas excluded from the active list this round | 23 |

Read the **Bank landscape** section next — every Phase 1 / 6 / 7 idea is
shaped by it. Then the **Positioning principles** section, which is what
keeps the scope honest.

---

## ⏱️ Status reconciliation (2026-06-04)

> **This roadmap predates the JSON-native (v3) rewrite and the entire R1–R22 +
> ArchitectMiner run.** Candidates that **fully shipped** as a side effect of
> that work have been **removed** from the phases below; ones that only partly
> landed keep an inline **🟡 PARTIAL** tag.

**Removed because already shipped since 2026-05-28:**
- Phase 1 — #4 Live progress in chat (`useAgentChat`), #5 Inline element block edit (`ElementCard`).
- Phase 3 — #1 Guided tour, #6 Command palette, #10 Browser notifications, #14 Dark mode (`data-theme` toggle).

**Partially landed (kept below, with the remaining work):**
- Phase 1 **#6** Skill log per element — 🟡 (R5 attribution + `ContributorsView`; per-element skill-touch popover not yet).
- Phase 3 **#12** Activity feed — 🟡 (contributors view).
- Phase 2 **#20** Target traceability — 🟡 (R3 Traceability view; full transitive As-Is→…→ADR matrix not yet).
- Phase 1 **#11** Stuck-element detector — orchestrator `ActionKind` seam ready (R10); the action isn't built yet.

---

## Bank landscape — the tools we live next to

Processminer does not enter an empty room. The bank already runs four
adjacent systems and one shared taxonomy. The roadmap has to acknowledge
each.

### Sparx Enterprise Architect — the L2/L3 architecture repository
- **What it holds:** L2 (Process Area) and L3 (Process) architectural
  models. Capability map, application portfolio, integration architecture
  at strategic abstraction. The view senior management and Enterprise
  Architecture consume.
- **What it does NOT hold:** L4 detail. No process-step bodies, no role
  RACI grids, no per-step controls, no exception paths, no Why-it-matters
  blocks.
- **Roadmap consequence:** Processminer aggregates **upward** into Sparx
  (Phase 1 #3 — XML export). Sparx stays the system of record at L2/L3;
  Processminer fills the L4 gap that Sparx structurally cannot hold.

### Adonis NP — the partial L4 process repository
- **What it holds (where it's adopted):** process step lists and owner
  role assignments per process step. Patchy adoption — some areas use it
  intensively, many ignore it. Content often years old. CSV export
  available; format varies per export.
- **What it does NOT hold:** Why-it-matters narratives, Controls, Systems,
  Pain Points, Exception paths, Transitions. Adonis is a flowcharting
  tool, not an elicitation engine.
- **Roadmap consequence:** Processminer takes Adonis CSV as **warm-start
  input** (Phase 1 #2). Where Adonis has content, the foundational run
  starts at ≈40–60% pre-populated rather than empty. Adonis is not the
  system of record for new processes — Processminer is.

### EPM — Enterprise Process Model (the bank-wide taxonomy)
- **What it is:** 3–4 level hierarchy (Process Group → Process Area →
  Process → Sub-Process), the bank's shared vocabulary for what a process
  IS. Referenced by Sparx, Adonis, and GRC tooling.
- **Roadmap consequence:** EPM is the **navigation rückgrat** of
  Processminer (Phase 1 #1). Every Processminer process is anchored to
  exactly one EPM leaf; cross-process aggregation views (maturity, gap,
  coverage) compose by EPM node. Without this anchor, Processminer is
  structurally disconnected from Sparx and Adonis.

### Confluence — product and tech documentation
- **What it holds:** product specs, tech designs, runbooks, team pages,
  decision logs, meeting notes. The narrative knowledge base of the bank's
  product and engineering teams.
- **Roadmap consequence:** Processminer's process documentation must
  **flow in both directions** with Confluence (Phase 6 #1). A documented
  process step that references a system needs to surface the system's
  Confluence page; a Confluence design that depends on a process needs to
  surface the process. Without this link, the bank ends up with two
  parallel knowledge bases.

### Jira — work tracking
- **What it holds:** epics, stories, bugs, change requests, project
  portfolio. The system of record for "what work is happening".
- **Roadmap consequence:** Processminer's Pain Points, Innovation Ideas,
  Gap Resolutions, ADRs and Transformation Decisions are the **upstream**
  of Jira work (Phase 6 #2, Phase 7 #1). Every gap or pain point should
  trace forward to the Jira epic that addresses it; every Jira change
  request affecting a documented process should trace back to the process
  it touches.

---

## Positioning principles — what Processminer is NOT

This is the durable framing the roadmap inherits. Every candidate is
sanity-checked against these four rules.

1. **Processminer is the L4 elicitation engine.** It does what Sparx,
   Adonis and the GRC tools structurally cannot: pull tacit per-step
   detail out of the SME's head into a structured wiki via AI-led
   interviews. That is the wedge.

2. **Processminer is NOT the system of record for governance.** Adonis
   handles process versioning + workflow approval for L4; Sparx handles
   L2/L3 governance; the GRC tool handles compliance attestation.
   Processminer's `set_approval.py` covers **elicitation-phase sign-off**
   (is this draft good enough to publish?), not the bank's governance
   gates. Phase 1 #8 (versioning) and #9 (approval chains) are
   **deprioritised** for this reason — kept on the list as fallback for
   processes that live only in Processminer, but not Phase-1 priorities.

3. **Processminer aggregates upward and is aggregated into.** Adonis CSV
   flows IN (warm start). Sparx XML flows OUT (architectural aggregation).
   Confluence ↔ Jira flow BOTH WAYS (Phase 6). The architecture is a
   participant in the bank's tool landscape, not a replacement.

4. **The Karpathy wiki is sacred.** Per HALLUCINATION-PLAN and
   ORCHESTRATOR-PLAN: every wiki mutation goes through a schema-validated
   writer (`write_element.py` / `patch_element.py` / `set_approval.py`);
   new orchestration state lives in **sidecars outside the wiki tree**.
   No candidate in this roadmap may bypass the writer or invent
   wiki-internal sidecars.

---

## Prioritisation framework

Every candidate gets one of four tags. The tags are an honest commitment
signal, not a wishlist.

- **P0 — do now.** Committed to the current quarter. Gets a `*-PLAN.md`
  design doc next.
- **P1 — strong yes, sequence later.** Committed in principle, queued for
  a later quarter.
- **P2 — maybe.** Revisit at the next quarterly planning round.
- **drop.** Clearly not the right move; kept in the doc with reasoning so
  the rationale stays visible.

**A typical quarter lands 4–6 P0 ideas** (≈1 month of focused work each).
Anything above 6 P0 is overcommitment. Phase 1 of this roadmap will
nominate the first 4–6 P0s once the user has prioritised.

### Effort sizing
- **XS** — 1–2 days
- **S** — ~1 week
- **M** — 2–3 weeks
- **L** — ~1 month
- **XL** — multi-month

---

## Phase 0 — Foundations & technical debt (2 open items)

> **Carried in 2026-06-04 from [REQUIREMENTS-ROADMAP.md](REQUIREMENTS-ROADMAP.md).**
> After the JSON-native (v3) rewrite, the post-migration requirements backlog
> (R1–R22, A1–A4, both product decisions) is **fully delivered** — see that
> doc's *Delivered (PR #)* line. Exactly **two engineering items remain open**.
> They're foundational: small, decision-free, and they **de-risk every later
> phase that adds element types** (Phase 2's `vendor`, Phase 4's `decision`,
> Phase 5's `data-payload` / `arb-session`, Phase 7's `programme` / `wave` all
> introduce new types). Listed here so the product roadmap and the migration
> backlog share one view.
>
> ⚠️ **Currency note.** This roadmap predates the JSON-native rewrite and the
> later phases still reference the deleted `scripts/wiki/*.py` toolkit
> (`write_element.py`, `get_context.py`, derived `.json` schemas, …). Those are
> historical; the current write path is the TypeScript/MCP layer
> (`wiki-write.ts` + the `createElement`/`updateElement`/`expandElement` tools)
> over a single strongly-typed `wiki/processes/<slug>.json`. The Phase 0 items
> below are written against that **current** codebase.

### Schema integrity

#### 1. Schema generator — derive the Draft-07 JSON Schema from the custom schema
- **What:** the element-type model lives in **two hand-edited files** —
  `schema/process-schema.json` (the custom app schema, source of truth:
  `elementTypes`, `frontmatter`, `template`, `fieldValues`) and
  `src/lib/schema/process-schema.json` (the Draft-07 JSON Schema the AJV
  validator + the LLM output schema consume). A generator
  (`scripts/gen-llm-schema.mjs`) would **emit the second from the first**, so
  only one is ever hand-edited.
- **Why:** today every element type added or changed must be edited in **both**
  files, and the only guard (`schema-consistency.test.ts`) checks just the
  type-*name* sets — per-field drift (enums, relations, required, constraints)
  is completely unguarded. The generator makes a new element type a **single
  edit** and makes field-level drift **impossible** (the guard regenerates and
  compares the whole file). This directly de-risks every later phase that adds
  element types.
- **Effort:** M
- **Touches:** new `scripts/gen-llm-schema.mjs`; `src/lib/schema/process-schema.json`
  becomes a generated artifact; replace the name-set drift test with a
  "generated schema is up to date" assertion; `package.json` `gen:schema`
  script. (Custom-schema-only meta like `process-step.sequence` either moves
  into the custom schema or stays a small generator override.) See
  REQUIREMENTS-ROADMAP **Open items → Schema generator (option A)**.

### Token & context optimization

#### 2. Slim per-type schema slices (R19)
- **What:** stop injecting / reading the full (~23k-token) schema into every
  skill turn; serve only the type(s) a skill actually needs, via a runtime
  `describeType(type)` slice (progressive disclosure) — **not** the old static
  `.derived` files the pre-rewrite design used.
- **Why:** most skills touch 1–3 element types but pay for the whole schema on
  every turn. Slicing cuts token cost and latency on every session. Not
  blocking, but compounding. Overlaps with item 1 (both derive from the custom
  schema, so build the generator first).
- **Effort:** M (full slicer) · S (Gemini-path dedup quick win)
- **Touches:** a `describeType()` slice over the custom schema; the MCP / Gemini
  tool-schema injection path. See REQUIREMENTS-ROADMAP **R19** (assessed — still
  relevant, deferred).

---

## Phase 1 — Processminer component (13 candidates)

> **Refined 2026-05-28 with bank-landscape context.** Three foundational
> ideas added at the top reflect the actual setup: the bank uses **Sparx**
> as the L2/L3 architecture repository, **Adonis** (patchy adoption,
> legacy content, CSV export) as a partial process source, and a bank-wide
> **Enterprise Process Model (EPM)** as the shared taxonomy. Processminer
> is repositioned as the L4 detail authority that aggregates upward to
> Sparx and pulls warm-start content from Adonis where it exists. Phase 1
> ideas #8 (process versioning / baselines) and #9 (approval chains) are
> deprioritised given Adonis/Sparx already cover governance at their
> respective levels — kept in the doc with notes rather than deleted, so
> the rationale stays visible.

### Bank-landscape integration (foundational)

#### 1. EPM-Knoten als Navigationsrückgrat
- **What:** the left spine becomes the bank's Enterprise Process Model
  tree (3–4 levels: Process Group → Process Area → Process →
  Sub-Process). Every Processminer process is anchored to exactly one EPM
  leaf. Cross-process aggregation views (coverage, maturity, gaps)
  compose by EPM node.
- **Why:** without an EPM anchor, Processminer is structurally
  disconnected from how the bank organises work. EPM is the single shared
  taxonomy across Adonis, Sparx, and Processminer; the only way the three
  tools stay aligned is if they all reference the same nodes.
- **Effort:** M
- **Touches:** new `epm.json` taxonomy fixture (sourced from the bank's
  EPM); new `EPMTree.tsx` for the spine; process `index.md` frontmatter
  gets an `epmNode` field; cross-process aggregation views per EPM area.

#### 2. Adonis CSV importer
- **What:** read Adonis CSV exports — content varies but the core is
  **process steps + owner role assignments**. Create a Processminer
  process scaffold with stub `process-step` and `role` elements. The
  foundational run then picks up from this warm start and fills the rest
  (Why-it-matters blocks, Controls, Systems, Pain Points, Transitions).
- **Why:** Adonis adoption is patchy and content is often old, but where
  it exists it's free warm-start material — process-step titles + owner
  assignments save the SME from naming everything from scratch. Turns
  Processminer's "empty wiki" startup into "≈40–60% pre-populated".
- **Effort:** M
- **Touches:** new `scripts/wiki/import_adonis_csv.py` with configurable
  field mapping (no two Adonis exports look the same); new upload modal
  flow on `/new-process` (CSV alongside text/PDF); `document-ingest` skill
  picks up the scaffold and runs verification.

#### 3. Sparx XML-Export für L2/L3-Aggregation
- **What:** aggregate Processminer's L4 detail (process-step + role +
  control + system elements) into Sparx-compatible XML at the L2/L3
  level — typically one Processminer process → one Sparx L3 process node;
  multiple Processminer processes in the same EPM area → one Sparx L2
  process area. XML flavour to be confirmed (XMI for UML-style Sparx use;
  ArchiMate Open Exchange XML for capability-/application-layer use);
  both are supported by Sparx, the choice depends on how Sparx is
  configured at the bank.
- **Why:** Sparx is the L2/L3 architecture repository; without an export,
  Processminer's detail never reaches the strategic view that EA and
  senior management consume. This closes the loop from elicitation to
  enterprise.
- **Effort:** M (XMI) to L (ArchiMate + multi-layer mapping)
- **Touches:** new `scripts/wiki/export_sparx.py` with the chosen XML
  flavour; aggregation logic over `ProcessView`; export action per EPM
  area in the UI.

### Inline editing & SME UX

#### 6. Skill execution log per element · 🟡 PARTIAL (R5 attribution + ContributorsView)
- **What:** for each element, surface its full skill-touch history:
  "Drafted by `/document-ingest` 2026-05-26 · refined by
  `/process-specialist` 2026-05-27 · 3 lint findings on this element".
  A small popover or sidebar on `ElementCard`.
- **Why:** `updatedBy` / `updatedAt` stamps exist, the run manifest at
  `/tmp/wiki-run-<slug>.jsonl` exists, the lint findings exist — but
  they're not surfaced per element in the UI. Closes the "who did what
  to this element" question without git archaeology.
- **Effort:** S
- **Touches:** consolidate into a per-element history sidecar built at
  render time, surface in `ElementCard`.

#### 7. New-process slug + abbreviation collision warnings
- **What:** when the SME proposes a process name in `/new-process`, flag
  both kinds of collision: slug already exists, *and* abbreviation
  already in use across sibling processes.
- **Why:** the dogfood run caught the first but not the second — `BGID`
  is now reused across multiple `bank-guarantee-issuance-dogfood-*`
  siblings. Element IDs stay namespaced per process so the collision is
  benign today, but cross-process references become ambiguous (and
  reading the dashboard with three `BGID` chips is confusing).
- **Effort:** XS
- **Touches:** `scripts/wiki/derive_process_meta.py` +
  `.claude/skills/new-process/SKILL.md`.

### Cross-process workflow

#### 8. Process versioning / baselines · **deprioritised**
- **Status:** Adonis NP already handles process versioning + lifecycle
  governance for the L4 process layer; Sparx covers the L2/L3
  architectural versioning. Keep this idea on the list as a fallback for
  processes that live *only* in Processminer (e.g. brand-new processes
  not yet promoted to Adonis), but it is no longer a Phase-1 priority.
- **What:** snapshot a wiki at a point in time ("v1 baseline 2026-Q1 for
  regulator submission"); show as an immutable read-only copy; diff
  against current.
- **Why:** auditors and regulators ask "what did the process look like
  when you certified it on date X?" Today the answer requires
  `git checkout <sha>` and a screenshot. A first-class baseline concept
  makes the audit answer one click.
- **Effort:** L
- **Touches:** new sidecar `baselines.json` (lives outside the wiki tree
  to respect the Karpathy principle), new
  `src/app/baselines/[slug]/[id]/page.tsx`, scripts to capture / diff
  baselines.

#### 9. Approval chains · **deprioritised**
- **Status:** Adonis handles approval workflow for processes that live
  there; bank-wide approval-chain authority sits in the GRC tooling, not
  in Processminer. The Processminer-side approval gate
  (`set_approval.py`) remains for elicitation-phase sign-off and is
  sufficient for the L4 detail flow.
- **What:** configurable per element type — `control` requires sign-off
  from process owner *and* control owner; `regulation` requires legal
  sign-off; etc.
- **Why:** today every approval is a flat `[Y]` from whoever's at the
  console. Real banking approvals need multi-party. The
  `set_approval.py` writer already exists; the missing piece is the chain
  definition and a UI for "approve as $role".
- **Effort:** M
- **Touches:** `schema/process-schema.json` (per-type `approvalChain`),
  `scripts/wiki/set_approval.py`, `src/components/ElementCard.tsx`.

### Quality & consistency

#### 10. Element staleness signal
- **What:** flag elements not touched in N days, *or* with `source`
  provenance from a document that has since been superseded by a
  re-ingest. Surface in a sidebar or as a per-element chip.
- **Why:** banking processes drift. Documentation that was true 6 months
  ago is often the most dangerous thing in the wiki (looks current;
  isn't). Today there's no signal at all.
- **Effort:** S
- **Touches:** new derived view in `src/lib/process-view.ts`
  (`stalenessFor(id)`), surface in `ElementCard`.

#### 11. Stuck-element detector · 🟡 SEAM READY (orchestrator ActionKind; action not built)
- **What:** alert on elements that have been `provenance: proposed` or
  `status: in-progress` for more than N days — the natural backlog signal
  in the wiki.
- **Why:** the approval gate blocks approval while any heading is
  `proposed`. So drafts that sit unconfirmed are silently invisible in
  the approval workflow. A "stuck for 14d" chip catches them.
- **Effort:** XS (orchestrator already has the seam — add a new
  `ActionKind`)
- **Touches:** `src/lib/orchestrator.ts` (new `address-stuck-element`
  action), surfaces in WelcomeScreen / TriagePanel automatically.

#### 12. Cross-element consistency widget
- **What:** real-time subset of the lint pass, always running: e.g.
  "role mentioned in step body but not in roles section", "control owner
  is not a documented role", "step references a system that doesn't
  exist". Surfaced inline as a small dot per element.
- **Why:** today these checks only run when the user explicitly clicks
  "Run quality check" (which spins up the full `/run-lint` pass —
  minutes). The cheap structural checks should be always-on. Lint stays
  for the deep cross-section sweep.
- **Effort:** M
- **Touches:** new `src/lib/consistency.ts` (pure functions over
  `ProcessView`), surface in `ElementCard`.

#### 13. Re-source freshness signal
- **What:** show "last sourced N days ago" on every sourced element
  (competitor, regulation, market-trend). Suggest re-sourcing after a
  configurable interval per element type.
- **Why:** regulatory landscapes and competitor moves change. Sourced
  content goes stale fast and silently. A 14-day chip on regulations and
  a 90-day chip on competitor CX nudges the SME to refresh.
- **Effort:** XS
- **Touches:** element frontmatter already has `asOf`; surface it in
  `ElementCard` with a freshness chip.

### Audit & provenance

#### 14. Inline citation links: element body → source quote panel
- **What:** hover or click a paragraph in an element body, see the exact
  source-document quote that grounds it (already in `provenance.json` as
  `evidence`). Stays in-page; no context switch.
- **Why:** speeds up the SME's "is this true?" check. Today the evidence
  quote is in a sidecar JSON nobody reads.
- **Effort:** S
- **Touches:** `src/components/ElementCard.tsx` (annotate `## ` block
  render with provenance), new `CitationPanel.tsx` slide-out.

### Interop & ecosystem

#### 15. Custom element type plugin API
- **What:** banks define their own element types (e.g.
  `regulatory-comment`, `audit-action`, `executive-summary`) via a
  `schema/extensions/<bank>/*.json` directory. The core schema stays
  untouched; the extension overlays.
- **Why:** the schema covers a generic banking process well, but every
  bank has institution-specific element types they'd want to document.
  Today extending requires forking the core schema — too much friction.
  The extension pattern keeps customisation contained and the upstream
  schema upgradeable.
- **Effort:** L
- **Touches:** `schema/process-schema.json` loader changes, derived-
  schemas build, conformance check in both languages.

---

## Phase 2 — ArchitectMiner (20 candidates)

ArchitectMiner takes a documented As-Is process (from Processminer) and
develops the seven target-architecture sections: `capability`,
`target-application`, `adr`, `target-integration`, `component`, `nfr`,
`migration-phase`. The two specialist skills (`/domain-architect`,
`/solution-architect`) elaborate these via SME chat. Phase 2 sharpens the
architect's tooling around them.

### Visualization

#### 1. Capability map
- **What:** radial or matrix view of capabilities + the target
  applications that host them. Heat-coded by maturity / coverage /
  strategic priority.
- **Why:** capability inventory exists as a list today; the spatial view
  exposes redundancy and gaps at a glance.
- **Effort:** M
- **Touches:** new `src/components/CapabilityMap.tsx`, reuse
  `ProcessView.byType` + relation lookups.

#### 2. Target application landscape diagram
- **What:** apps as nodes, integrations as edges, NFR criticality as node
  size. Extends the `ProcessFlow` swimlane pattern to architecture.
- **Why:** the integration list is a tabular blob today; the picture
  answers "what depends on what" in seconds.
- **Effort:** M
- **Touches:** new `src/components/AppLandscape.tsx`, SVG diagram engine
  similar to `ProcessFlow`.

#### 3. As-Is → Target system mapping diagram
- **What:** for each documented `SYS-*` (As-Is), show which target
  application replaces / consolidates / wraps it.
- **Why:** the migration story IS this mapping — "what legacy gets
  retired vs extended vs replaced". ADRs reference it constantly but it
  lives only in prose.
- **Effort:** M
- **Touches:** new `src/components/SystemMigrationMap.tsx`, may require a
  new relation `target-application.replaces: SYS-*`.

#### 4. ADR decision graph
- **What:** ADRs as nodes; "supersedes" + "depends on" as edges. Find
  orphaned ADRs and contradictions.
- **Why:** ADRs accumulate over years; their relationships are invisible
  in a flat list. Architects can't see what's load-bearing vs deprecated.
- **Effort:** S
- **Touches:** new `src/components/ADRGraph.tsx`, schema additions for
  `adr.supersedes` / `adr.dependsOn`.

### Modelling & analysis

#### 5. Capability coverage gap analyzer
- **What:** for documented capabilities, flag which aren't yet mapped to
  a target application; flag those duplicated across multiple target apps.
- **Why:** the obvious "what's missing" check that's currently a manual
  eyeball exercise.
- **Effort:** S
- **Touches:** new derived view in `src/lib/architecture-view.ts` (AM
  equivalent of `ProcessView`).

#### 6. NFR compliance pass
- **What:** for each NFR (latency, availability, RTO/RPO, regulatory),
  validate that the proposed target architecture actually meets it (e.g.,
  NFR "P99 ≤ 200ms" against an integration chain with 5 sync hops →
  flag).
- **Why:** highest-value architect feedback loop. NFRs are written
  aspirationally today; nothing checks whether the architecture lands
  them.
- **Effort:** L (needs a real modelling layer over integrations +
  components)
- **Touches:** new `scripts/wiki/check_nfr.py`, surface in a dedicated
  NFR review panel.

#### 7. Integration complexity score
- **What:** per target app, count fan-in/fan-out integrations; flag apps
  with high coupling (> N integrations) as architectural risk.
- **Why:** the architecture's biggest failure mode is the central
  super-app. A score makes it visible.
- **Effort:** XS
- **Touches:** derived field on `target-application` view; small chip on
  the app card.

#### 8. Cross-process capability alignment
- **What:** when multiple processes target the same target application,
  surface the overlap and conflict (different processes wanting different
  capabilities from the same app).
- **Why:** enterprise architecture is multi-process by nature; today each
  process plans its target in isolation.
- **Effort:** M
- **Touches:** cross-process aggregation in `architecture-view.ts`; new
  top-level "Shared target apps" page.

### Decision capture (ADRs)

#### 9. ADR template library + status workflow
- **What:** `proposed → accepted → superseded / rejected`, with
  auto-suggested template per decision kind (build vs buy, consolidate vs
  separate, etc.).
- **Why:** ADRs today are free-text. A template enforces the
  Consequences / Alternatives sections that auditors expect.
- **Effort:** S
- **Touches:** `schema/process-schema.json` (ADR types + status field),
  `.claude/skills/domain-architect/SKILL.md`.

#### 10. ADR ↔ capability ↔ target app linkage
- **What:** every ADR explicitly traces to the capabilities and target
  apps it affects (not just text mentions).
- **Why:** when an ADR is questioned, the architect needs to see what it
  touches. Forward + reverse links make the impact obvious.
- **Effort:** S
- **Touches:** new relations `adr.affectsCapability` and
  `adr.affectsTargetApp`; surface on ADR card.

#### 11. Decision conflict detector
- **What:** when ADR A says "consolidate X+Y" and ADR B says "extend X to
  handle Y", surface the contradiction.
- **Why:** ADRs drift over years; nobody re-reads them all before
  authoring a new one. The conflict check is the natural lint pass.
- **Effort:** M
- **Touches:** new `scripts/wiki/check_adr_conflicts.py`, surface in lint
  output.

### Migration planning

#### 12. Migration phase sequencer
- **What:** drag-and-drop reorder of phases with automatic dependency
  validation (can't do phase N before N−1 if it depends on it).
- **Why:** today's phase list is a fixed sequence. Architects want to
  model "what if we did phase 3 before 2?"
- **Effort:** L
- **Touches:** new interactive `MigrationSequencer.tsx`; depends on
  explicit phase-dependency relations.

#### 13. Phase risk heatmap
- **What:** each phase scored on dependencies (blocks others), business
  disruption (peak season?), and tech risk (vendor / integration).
- **Why:** migration plans get reduced to "phases 1–5"; the risk shape is
  invisible. A heatmap turns the question into a picture.
- **Effort:** M
- **Touches:** new derived field per phase; visualisation component.

#### 14. Quick-win identifier
- **What:** flag phases that deliver high NFR improvement (e.g., RTO drop
  from 4h → 30min) for low effort (small number of integrations changed).
- **Why:** every migration plan needs the executive "and here's what we
  deliver in the first 90 days" story. Today it's manually constructed.
- **Effort:** M
- **Touches:** depends on NFR compliance pass (#6) being in place to
  score the delta.

### PM ↔ AM handoff

#### 15. Handoff readiness check
- **What:** when a process is sent from PM to AM, validate it has the
  As-Is content AM needs (every process-step has an owner role, every
  role has RACI, every system has classification). Block the handoff if
  not.
- **Why:** half-documented PM content becomes guesswork in AM. The check
  catches it at the boundary.
- **Effort:** S
- **Touches:** new `scripts/wiki/check_handoff_readiness.py`, surfaces in
  the handoff inbox.

#### 16. "Send back to PM"
- **What:** when AM detects a gap mid-architecture work (e.g., a target
  application can't host a capability because the capability's owning
  role wasn't documented), bounce back to PM with the specific finding.
- **Why:** today's only recourse is manual cross-team coordination.
  Built-in bounce-back makes the loop short and traceable.
- **Effort:** S
- **Touches:** new "Send back" action in the AM UI; new finding kind in
  PM's lint output.

### Inline editing & SME UX

#### 17. Inline ADR edit
- **What:** click an ADR section (Context, Decision, Consequences), edit
  in place, save via `updateElement`.
- **Why:** editing through chat is heavyweight for ADR refinements — same
  rationale as the (already-shipped) Processminer inline element edit.
- **Effort:** S (the inline-edit infrastructure already exists on `ElementCard`)
- **Touches:** reuse the shipped `ElementCard` inline-edit path; apply it to the
  ADR card.

#### 18. Drag-to-link
- **What:** drag a capability node onto a target application to set the
  `hostedBy` relation; drag a target app onto an ADR to set the
  `affectedBy` relation.
- **Why:** today setting relations requires editing frontmatter via chat.
  Drag-to-link is the natural gesture and matches how architects work.
- **Effort:** M
- **Touches:** `CapabilityMap.tsx`, `AppLandscape.tsx`, `ADRGraph.tsx` —
  pairs with the visualisation ideas.

### Quality & consistency

#### 19. Target architecture lint
- **What:** always-on cheap checks: every capability has at least one
  target app; every target app has at least one component; every ADR has
  Consequences populated; NFRs reference at least one target app.
- **Why:** like Processminer's cross-element consistency widget —
  structural completeness checks should be always-on, not run-on-demand.
- **Effort:** S
- **Touches:** new rules in `scripts/wiki/check_conformance.py` (or a
  sibling `check_architecture.py`).

#### 20. Target traceability matrix · 🟡 PARTIAL (R3 Traceability view; full transitive matrix not yet)
- **What:** visualise: As-Is process step → As-Is system → target
  application → target component → NFR → ADR. A single view of the full
  chain.
- **Why:** regulators and execs want "if I change this NFR, what target
  apps are affected?" The traceability matrix is the answer; today it
  requires walking JSON.
- **Effort:** M
- **Touches:** new `src/components/TraceabilityMatrix.tsx`, full
  transitive-closure walk over relations.

---

## Phase 3 — General usability (11 candidates)

App-wide polish that isn't tied to a specific module. The cut on
2026-05-28 removed bigger architectural lifts (mobile/tablet responsive
layout, multi-user presence, undo/history, element-level revision
history, saved views/filters) — all valuable, all best done once the
smaller usability items are in. What remains here is **low-effort quick
wins** that the app already needs to feel like a finished product.

### Onboarding & first-run

#### 2. Sample / demo process pre-loaded
- **What:** a curated `sepa-payments`-style read-only fixture every fresh
  install ships with — explore the app's actual content density before
  uploading anything.
- **Why:** lets a prospect (or a new SME) see what good documentation
  looks like, with no setup. `sepa-payments` already serves this
  internally; just expose it.
- **Effort:** XS
- **Touches:** ship a sealed sample under `wiki/processes/sample-process/`,
  marked read-only in `process-access.json` or the UI.

### Performance & responsiveness

#### 3. Lazy-load element cards
- **What:** virtualize the element list — don't render all 100+ cards at
  once.
- **Why:** a process with 80 process-steps + 30 controls renders ~150
  ElementCards on section entry. Each card has hovercards, citations,
  RACI. Scroll perf degrades.
- **Effort:** S
- **Touches:** wrap the section element list with a virtualizer (e.g.
  `react-virtuoso` or a small in-house one matching the existing styling).

#### 4. Skeleton screens during load
- **What:** placeholder layout while the wiki re-reads, instead of a
  blank flash then content pop.
- **Why:** `dynamic = "force-dynamic"` means every navigation re-reads
  the wiki; 100–500ms blanks are common. Skeletons make it feel instant.
- **Effort:** XS
- **Touches:** add skeleton variants to `ProcessDocScreen.tsx`,
  `WelcomeScreen.tsx`, the section canvas.

### Keyboard navigation

#### 5. Comprehensive keyboard shortcuts
- **What:** j/k between elements, e to edit, c to comment, / to search,
  ? for cheat sheet overlay.
- **Why:** power analysts spend hours in the app. Mouse-only navigation
  is friction tax.
- **Effort:** S
- **Touches:** a small `KeyboardShortcuts.tsx` provider; cheat sheet
  overlay; per-section keymap.

### Search & navigation

#### 7. Global search across all content
- **What:** one search box that hits elements, comments, ADRs, lint
  findings, raw-sources. Filterable.
- **Why:** related to Phase 1's filtered ⌘K but broader — everything is
  one index.
- **Effort:** M
- **Touches:** a per-request search index (or cached) over the entire
  wiki + sidecars; new search surface.

#### 8. Recently viewed stack
- **What:** persistent across sessions; visible in the switcher and in a
  small "where was I" widget.
- **Why:** localStorage already remembers recents per process; extend to
  per-element. "Pick up where I left off" matters when you're
  context-switching across processes.
- **Effort:** XS
- **Touches:** extend the existing `pm.procsw.recent` localStorage to
  track elements; surface in switcher.

#### 9. Breadcrumb navigation
- **What:** Module → Area → Section → Element, with click-back.
- **Why:** today's spine + section nav assumes you remember where you
  are. Breadcrumbs make the location explicit.
- **Effort:** XS
- **Touches:** small `Breadcrumbs.tsx`; hook into `ProcessDocScreen.tsx`'s
  section state.

### Notifications

#### 11. In-app notification center
- **What:** bell icon with recent events — completed skills, comments on
  my elements, lint findings on my elements.
- **Why:** the dashboard's ATTENTION column is the only event surface
  today. A dedicated centre lets a user catch up in 30 seconds rather
  than re-walking sections.
- **Effort:** M
- **Touches:** new `src/components/NotificationCenter.tsx`; event sources
  from session worker, comments, lint.

### Collaboration

#### 12. Activity feed per process · 🟡 PARTIAL (ContributorsView)
- **What:** running log per process — "Markus approved CP-BGID-001 2 min
  ago", "Jane commented on PS-BGID-003".
- **Why:** the data exists (`updatedBy` / `updatedAt` stamps + run
  manifest); the running view is missing. Doubles as the basic audit
  trail surface.
- **Effort:** S
- **Touches:** new `src/components/ActivityFeed.tsx`; aggregate from
  existing stamps and manifests.

### Bulk operations

#### 13. Multi-select + bulk operations
- **What:** checkbox column on element lists; approve-all-high-confidence;
  re-open all elements implicated by a finding; bulk-dismiss lint
  findings.
- **Why:** reviewing 30 sourced competitor entries one-by-one is
  busywork; "select all 'relevant', mark approved" is the natural flow.
- **Effort:** M
- **Touches:** selection state in `ProcessDocScreen.tsx`; bulk-action
  sidebar; writers already support batched calls.

### Error handling & resilience

#### 15. Better error messages with explicit retry path
- **What:** when something fails, say what failed, what the user can do,
  link to relevant doc / log. No more silent `.catch(...)` swallowing.
- **Why:** the `runSourcing` bug fixed today (commit 641078f) was a
  symptom of this — errors silently vanished into a catch block. Apply
  across all skill-invocation surfaces.
- **Effort:** S
- **Touches:** convention pass over `runLint`, `runSourcing`,
  `runAreaSpecialist`, etc.; small `ErrorBanner.tsx`.

---

## Phase 4 — Process analysis fundamentals (4 candidates)

The first layer of professional process-analysis tooling. The full
pro-tool brainstorm produced 20 candidates spanning BPMN export, process
mining (event log ingest, variant analysis, conformance), simulation,
activity-based costing, capacity planning, risk register, traceability
matrices, root-cause templates, automation candidate scoring, change
impact, and SOP generation. The cut on 2026-05-28 dropped all of those
and kept only the four that **derive a new analytical view from data the
wiki already holds** — no new engines, no new ingestion pipelines, no new
artifact generation. The bigger pro features (process mining, simulation,
costing) stay in the brainstorm pool for a later phase once the lighter
views prove their value.

### Standard methodology support

#### 1. DMN decision tables
- **What:** extract decisions from process-step bodies — "if amount >
  EUR 5m then route to Head of Trade Finance for sign-off" — into proper
  Decision Model and Notation tables (condition → outcome rows; complete
  + consistent decision logic).
- **Why:** banking is rules-heavy; today the rules are buried in step
  narratives where they can't be audited, tested or exported. DMN tables
  make the rules first-class — auditors can review them, regression
  tests can run them, rules engines can execute them.
- **Effort:** M
- **Touches:** new `decision` element type in `schema/process-schema.json`;
  extraction skill (`/extract-decisions` or extend `/process-specialist`);
  render component for tables.

#### 2. SIPOC auto-view
- **What:** derive Suppliers / Inputs / Process / Outputs / Customers
  from the existing wiki — process-step inputs/outputs blocks, role
  assignments, system relations. One-page summary; printable for project
  kickoff.
- **Why:** stakeholders expect a SIPOC at the start of any process
  review. The data is already in the wiki — process-step `Inputs` and
  `Outputs` blocks, role + system relations. Just compose the view.
- **Effort:** S
- **Touches:** new `src/components/SipocView.tsx`, derived from
  `ProcessView`; export route under `src/app/print/sipoc/`.

#### 3. Process maturity assessment
- **What:** CMMI-style scoring (0–5) across documentation completeness,
  control coverage, KPI presence, automation level, governance — per
  process and per area. Persisted history so quarterly trends are
  visible.
- **Why:** pros run maturity assessments quarterly. The Stage-9 dogfood
  subagent already produces this ad-hoc; institutionalize it as a
  first-class score with history. Drives the "are we improving?"
  question.
- **Effort:** M
- **Touches:** new sidecar `maturity.json` (lives **outside** the wiki
  tree to respect the Karpathy principle — see
  [ORCHESTRATOR-PLAN.md](ORCHESTRATOR-PLAN.md) for the precedent);
  scoring rules in `scripts/wiki/check_maturity.py`; new dashboard view.

### Operational excellence

#### 4. Process governance dashboard
- **What:** per process — owner, escalation chain, last reviewed, next
  review due, audit cycle, change frequency over the last 90 days,
  automation %. The process owner's daily view.
- **Why:** the data exists across the wiki + sidecars (provenance,
  ingest history, sections.json, manifest); it's just never been
  consolidated into one place. Rolls up into a single dashboard tile the
  owner can scan in 30 seconds.
- **Effort:** S
- **Touches:** new `src/components/GovernanceDashboard.tsx`; aggregator
  over existing data; small additions to the process `index.md`
  frontmatter for owner / escalation / review cadence.

---

## Phase 5 — Top-architect expectations (20 candidates)

Phase 2 covers the ArchitectMiner *module* (capabilities, target apps,
ADRs, integrations, components, NFRs, migration phases). Phase 5 covers
what a **senior enterprise architect** expects from an architecture tool
in the first place — beyond the seven sections. These ideas were
brainstormed against the practice of EA at scale (TOGAF, ArchiMate,
Wardley mapping, capability heatmaps, vendor management, run-cost
modelling). They are **not yet trimmed** — the user has not yet
prioritised this phase.

### Strategic framing

#### 1. Wardley map view per process
- **What:** plot capabilities on the Wardley value-chain axis (visible to
  customer → invisible) ×evolution axis (genesis → commodity). Highlight
  capabilities ripe for outsourcing vs those needing differentiation
  investment.
- **Why:** Wardley mapping is the strategic framing top architects use
  when arguing build-vs-buy in the C-suite. Today this exercise happens
  in Miro outside the tool.
- **Effort:** L
- **Touches:** new `src/components/WardleyMap.tsx`; capability
  frontmatter additions for `valueChainPosition` + `evolutionStage`.

#### 2. Capability heatmap by business unit
- **What:** matrix of capabilities × business units, colour-coded by
  ownership / maturity / strategic priority. Reveals duplication and
  orphans.
- **Why:** enterprise architects spend significant time hunting down
  who-owns-what. The matrix view is the standard EA artifact for the
  conversation.
- **Effort:** M
- **Touches:** new `src/components/CapabilityHeatmap.tsx`; needs
  business-unit dimension on capability (new frontmatter field).

#### 3. ArchiMate-compatible export
- **What:** export the target architecture as ArchiMate Open Exchange
  XML — the OMG-standard format that most EA tools (Sparx, BiZZdesign,
  Archi) consume.
- **Why:** enterprise architects work in ArchiMate-aware tools.
  Processminer should speak the standard, not require a translation
  layer.
- **Effort:** L
- **Touches:** new `scripts/wiki/export_archimate.py`; ArchiMate
  element-type mapping spec; export action in AM UI.

### Vendor & supplier modelling

#### 4. Vendor portfolio
- **What:** every target application has a vendor (or `internal`); vendor
  has contract expiry, SLAs, support tier, cost band. Aggregate into a
  vendor portfolio view.
- **Why:** vendor management is half the EA job. Today the tool has no
  vendor concept — vendor is buried in narrative.
- **Effort:** M
- **Touches:** new `vendor` element type; relation
  `target-application.vendor: V-*`; new vendor portfolio page.

#### 5. Vendor risk score
- **What:** per vendor — financial health, concentration (how many
  target apps depend on them), strategic alignment, geographical /
  regulatory risk. Roll up to a portfolio risk view.
- **Why:** DORA explicitly requires the bank to assess ICT third-party
  risk. The architect needs the data structure to answer the regulator
  with one click.
- **Effort:** M
- **Touches:** depends on #4; new `scripts/wiki/check_vendor_risk.py`.

#### 6. Contract renewal calendar
- **What:** timeline of vendor contracts and target-application licence
  renewals. 90 / 60 / 30-day chips on the architect's dashboard.
- **Why:** today these dates live in procurement's spreadsheet; the
  architect finds out too late to influence renewal terms.
- **Effort:** S
- **Touches:** depends on #4; new contract date fields on `vendor`; chip
  on dashboard.

### Cost modelling

#### 7. Application run-cost modelling
- **What:** per target application — annual licence, infra, support, and
  internal FTE cost; show cost over time as migration phases land.
- **Why:** every target architecture decision is also a cost decision.
  The build-vs-buy ADR is undermined if the cost data lives in finance's
  spreadsheet.
- **Effort:** L
- **Touches:** new frontmatter on `target-application` (cost bands /
  exact figures); new `RunCostView.tsx`; aggregate by capability /
  vendor / business unit.

#### 8. TCO comparison per ADR
- **What:** for build-vs-buy and consolidate-vs-separate ADRs, render a
  5-year TCO comparison table. Pulls from #7.
- **Why:** the ADR's Decision section deserves a numerical anchor, not
  just narrative. Removes the "I forgot to include integration costs"
  failure mode.
- **Effort:** M
- **Touches:** depends on #7; small TCO widget on ADR card.

### Lifecycle & roadmap

#### 9. Technology lifecycle stage per system
- **What:** every `system` (As-Is) and `target-application` has a
  lifecycle stage: `pilot → ramp → mature → sunset → decommissioned`.
  Aggregate into a portfolio lifecycle view.
- **Why:** the EA's bread-and-butter view. Tells the exec "we have N
  apps in sunset that haven't been replaced yet".
- **Effort:** S
- **Touches:** lifecycle frontmatter on `system` and
  `target-application`; new `LifecycleView.tsx`.

#### 10. Roadmap Gantt with capability lanes
- **What:** time-axis Gantt of migration phases, swimlanes by business
  capability, milestones marked. The classic 18-month transformation
  roadmap view.
- **Why:** the deliverable every transformation programme needs at every
  steering committee. Today it's manually rebuilt in PowerPoint each
  month.
- **Effort:** M
- **Touches:** new `src/components/RoadmapGantt.tsx`; needs phase →
  capability relation.

### Risk & resilience

#### 11. Single-point-of-failure detector
- **What:** scan the integration graph for nodes whose removal
  disconnects the architecture. Flag as resilience risk.
- **Why:** the architect's most-asked question on resilience. Today it's
  a manual whiteboard exercise.
- **Effort:** M
- **Touches:** graph algorithm over `architecture-view.ts`; flag on the
  app landscape.

#### 12. DR / BCP scenario modelling
- **What:** "what if SYS-X is down for 4 hours?" — propagate impact
  through integrations to processes; show RTO / RPO breaches against
  documented NFRs.
- **Why:** the BCP team runs this exercise quarterly; today it's a
  workshop. Built-in lets the architect rehearse independently.
- **Effort:** L
- **Touches:** propagation engine over integration graph; depends on
  Phase 2 #6 (NFR compliance).

#### 13. Cyber-attack-surface view
- **What:** for each target application — exposure level (internet-
  facing? internal? air-gapped?), data classification, regulatory
  scope. Heat-map across the application portfolio.
- **Why:** security-by-design is the regulator's expectation. The
  architect needs the view at design time, not after pen-test.
- **Effort:** M
- **Touches:** new frontmatter on `target-application`; security view
  component.

### Decision authority & governance

#### 14. ADR scope + authority labels
- **What:** every ADR is tagged with its scope (team / domain /
  enterprise) and the authority that ratified it (chief architect,
  CIO, architecture board). Filter ADRs by scope at review time.
- **Why:** mixing tactical-team and enterprise-board ADRs in one list is
  the most common ADR-governance failure. The labels keep the scopes
  separate.
- **Effort:** XS
- **Touches:** ADR frontmatter additions; filter on ADR list.

#### 15. Architecture review board (ARB) workflow
- **What:** queue of ADRs scheduled for board review; agenda generator;
  decision capture flowing back into the ADR's status.
- **Why:** the ARB meeting is where the bank's architecture decisions
  are actually made. The tool currently has no concept of it.
- **Effort:** L
- **Touches:** new `arb-session` element type; agenda view;
  `set_approval` extension for board-level sign-off.

### Standards & frameworks

#### 16. TOGAF ADM phase tagging
- **What:** every architecture artifact is taggable to TOGAF Architecture
  Development Method phases (A: vision, B: business, C: data &
  application, D: technology, E: opportunities, F: migration). Filter
  the view by phase.
- **Why:** TOGAF is the lingua franca of enterprise architecture
  governance at large banks. The tool needs to speak it.
- **Effort:** S
- **Touches:** phase frontmatter additions; filter component.

#### 17. Reference architecture library
- **What:** curated set of pre-built architectures (open banking,
  payments, trade finance) the architect can clone as a starting point.
- **Why:** every architecture engagement re-invents 60% of the structure.
  A reference library accelerates the start.
- **Effort:** M
- **Touches:** new `wiki/references/` directory; clone workflow; the
  Karpathy principle still holds (references are immutable read-only
  templates, not editable wikis).

### Cross-domain modelling

#### 18. Data flow modelling
- **What:** every integration carries a payload (customer data, account
  balance, KYC outcome); model the payload at field level; aggregate
  into a data flow view per data domain.
- **Why:** data architects need this view; today it's split across
  integration descriptions in narrative.
- **Effort:** L
- **Touches:** new `data-payload` element type; relation
  `integration.carries: DP-*`; data flow view.

#### 19. Capability investment scoring
- **What:** per capability, score on strategic importance × current
  maturity × competitive differentiation × cost-to-improve. Visualise as
  a 2×2 invest / divest / sustain / monitor matrix.
- **Why:** the McKinsey 2×2 is the standard exec deliverable when
  defending the IT budget. The data needed already lives in the
  capability + maturity + cost views.
- **Effort:** M
- **Touches:** new derived view; depends on Phase 4 #3 (maturity) and
  Phase 5 #7 (run cost).

### Cross-architecture transparency

#### 20. Architecture diff between two timepoints
- **What:** "what changed in the target architecture between Q1 and Q3?"
  — diff capabilities, target apps, ADRs, NFRs across baselines.
- **Why:** transformation governance asks this at every steering
  committee. Today it's a manual reconstruction.
- **Effort:** M
- **Touches:** depends on Phase 1 #8 (baselines) being in; diff
  algorithm over architecture-view; visualisation.

---

## Phase 6 — Tool connectors (4 candidates)

These ideas connect Processminer to the bank's existing product / tech /
process tools. They are NEW in this round (the user added them as the
key gap after Phase 5). They are **not optional** — without them
Processminer is an island. Adonis and Sparx connectors are duplicated
from Phase 1 #2 / #3 here as cross-references; the new ideas in this
phase are Confluence and Jira.

### Productivity-suite connectors (NEW)

#### 1. Confluence bidirectional connector
- **What:** two-way link between Processminer elements and Confluence
  pages.
  - **Inbound:** when a documented `system` or `process-step` references
    a Confluence page (`docs.bank.intern/...`), render a preview / link
    inline.
  - **Outbound:** publish a Processminer process summary (overview,
    SIPOC, key controls, owner) as a Confluence page that updates
    whenever the underlying wiki changes. The published page is
    read-only and badged "rendered from Processminer".
- **Why:** Confluence is where product and tech teams already live. If
  Processminer's process knowledge doesn't show up there, it doesn't
  exist for half the bank. Two-way connection prevents parallel
  divergence.
- **Effort:** L
- **Touches:** new `scripts/wiki/publish_confluence.py` (Atlassian REST
  API); new frontmatter on `system` / `process-step` for
  `confluencePageId`; new published-pages registry sidecar (outside the
  wiki tree).

#### 2. Jira bidirectional connector
- **What:** link Processminer Pain Points, Innovation Ideas, Gap
  Resolutions, ADRs, and Transformation Decisions to Jira issues.
  - **Inbound:** show Jira status (open / in-progress / done / blocked)
    inline on the Processminer element.
  - **Outbound:** create a new Jira epic from a Pain Point or
    Transformation Decision; the Jira epic's description is generated
    from the Processminer element and stays linked.
  - **Search:** "what Jira work is happening on this process?" — query
    by process slug.
- **Why:** Jira is the system of record for "what is being done about
  it". The bank's process documentation must answer "and what work is
  happening to address this?" — the answer lives in Jira.
- **Effort:** L
- **Touches:** new `scripts/wiki/jira_sync.py` (Atlassian REST API);
  frontmatter additions on pain-point / innovation-idea / gap-resolution
  / adr / transformation-decision for `jiraEpicKey`; new Jira-status
  sidecar.

### Bank-landscape connectors (cross-references from Phase 1)

#### 3. Adonis CSV importer — see Phase 1 #2
- Pulls process step + owner role assignments from Adonis NP as warm
  start. Already covered as Phase 1 #2 because it's foundational to the
  PM onboarding flow.

#### 4. Sparx XML exporter — see Phase 1 #3
- Aggregates Processminer L4 detail upward to Sparx L2/L3 as
  XMI / ArchiMate. Already covered as Phase 1 #3 because it's the
  primary "make it visible to senior management" loop.

---

## Phase 7 — Domain modules (3 candidates)

The bank's adjacent use cases that **reuse** Processminer's wiki
infrastructure but address a different audience and problem. These are
NEW in this round (the user picked them from a list of 10). Each is
substantial enough to be a sub-product; this section sketches the wedge
in each.

### Change & Transformation Portfolio

#### 1. Change / Transformation Portfolio module
- **What:** transformation programmes are the bank's biggest investment
  vehicle. A new top-level module aggregates: pain-points + innovation
  ideas + transformation decisions + migration phases + Jira epics
  (Phase 6 #2) across processes. Visualises as a programme portfolio
  (Wave 1 / Wave 2 / Wave 3) with phase Gantt, budget overlay, RAID
  log, and Jira drill-down.
- **Why:** today the transformation team rebuilds the portfolio view in
  PowerPoint each month from a dozen sources. Processminer already
  holds the structured upstream (pain → decision → migration phase);
  the missing piece is the portfolio aggregation + Jira link.
- **Effort:** XL (full new module: schema, UI, skill set, Jira sync)
- **Touches:** new `wiki/programmes/<slug>/` parallel to
  `wiki/processes/<slug>/` (still Karpathy-compliant — separate file
  hierarchy with its own schema); new element types (`programme`,
  `wave`, `raid-entry`, `programme-milestone`); new module spine in the
  UI; depends on Phase 6 #2 for Jira link.

### Training & enablement

#### 2. Training & enablement module
- **What:** generate role-specific training materials from a documented
  process. Inputs: the wiki + role definitions. Outputs: per-role
  training pack (process narrative, key controls, exception handling,
  systems used). Publish to the bank's LMS via SCORM / xAPI or
  publish to Confluence (Phase 6 #1) as a curated learning page set.
  Optional quiz generation from process content.
- **Why:** onboarding a new SME / analyst / operations colleague to a
  process today means handing them PDFs and saying "read these". A
  generated training pack with role context turns the wiki into
  enablement material with zero extra authoring.
- **Effort:** L
- **Touches:** new `/generate-training` skill; new
  `src/components/TrainingPack.tsx` preview; LMS connector
  (SCORM / xAPI export); Confluence connector reuse (Phase 6 #1).

### Document cross-check

#### 3. Document cross-check module (Policies / DTPs / KOPs)
- **What:** the bank maintains **Policies**, **DTPs (Detaillierte
  Tätigkeitsbeschreibungen)**, and **KOPs (Konzern-Operativ-Prozesse)**
  as institutional documents. Cross-check them against the documented
  Processminer process: does the DTP cover every documented step? Are
  there KOP-mandated controls missing from the wiki? Are there wiki
  steps that contradict a Policy?
  - **Forward:** the wiki flags a Policy / DTP / KOP gap as a finding
    (becomes an `audit-finding` element).
  - **Backward:** the wiki suggests Policy / DTP / KOP amendments based
    on what was elicited from the SME.
- **Why:** today the bank maintains the wiki AND the policy set AND the
  DTP / KOP set as parallel knowledge bases that drift apart. Audit
  findings then materialise as "documentation gap" — which is exactly
  the gap this module closes. High auditor-visibility win.
- **Effort:** L
- **Touches:** new `/cross-check-policies` skill; new ingestion path for
  Policies / DTPs / KOPs as raw-sources; new finding kind
  (`policy-mismatch`); new finding-resolution workflow.

---

## Deferred pool — promising ideas excluded this round (23 items)

These ideas were considered and excluded from the active phases on
2026-05-28. They are kept here so the rationale stays visible and so
they can be revisited in future planning rounds.

### Phase 1 — original 8 cut
Live context preview · context provenance log · filtered ⌘K · near-
duplicate finder · cross-process comparison · BPMN export · auto-
suggested controls · two LLM-transparency-themed items.
**Reason:** Phase 1 already had 12 ideas; LLM-transparency features and
search/discovery items are valuable but they sit downstream of more
foundational gaps. Revisit after Phase 1 lands.

### Phase 3 — original 5 cut
Mobile / tablet responsive layout · multi-user presence · undo / history ·
element-level revision history · saved views / filters.
**Reason:** all valuable, all bigger architectural lifts that block the
quick wins. Revisit as a "Phase 3.5" once the 15 smaller items land.

### Phase 4 — original 16 cut
BPMN 2.0 export · process mining (event log ingest) · variant analysis ·
conformance check · process simulation · activity-based costing ·
capacity planning · KPI framework · risk register integration ·
traceability matrix (process scope) · compliance evidence requirements ·
root-cause analysis templates · automation candidate flagger · change
impact analysis · SOP generation · APQC PCF tagging.
**Reason:** these are the "heavy" process-analysis features (new
engines, new ingestion pipelines, new ML). Phase 4 deliberately kept
only derivative views from existing wiki data. Revisit once Phase 4's
SIPOC + maturity + governance views have demonstrated their value with
real SMEs.

### Phase 7 — original 7 module candidates cut
Audit & evidence management · Risk & control library · KPI / OKR
catalogue · Vendor / third-party risk module · Data governance &
lineage · Regulatory horizon scanning · Customer journey portfolio.
**Reason:** the user picked Change/Transformation, Training, and
Document Cross-Check from the 10 candidates this round. The remaining
7 modules are valid future plays; Audit & Evidence and Risk & Control
Library are the strongest second-wave candidates.

---

## Strategic sequencing — proposed timeline

This is a **proposal**, not a commitment. The exact P0 / P1 assignment
happens once the user has prioritised individual candidates.

### 2026 H1 — "anchor it + make it trustworthy" · **revised 2026-06-04**
**Focus:** the structural anchor + trust signals + first adoption lever.

> **Why revised:** the original H1 set listed Phase 1 #4 and #5 — both **already
> shipped** (removed; see the status reconciliation). So H1 keeps the foundation
> + anchor and pulls the trust quick wins forward (for a banking-documentation
> tool, "is this current and consistent?" *is* the product).

**Foundations (quick, decision-free):**
- Phase 0 #1 — Schema generator (do before any phase that adds element types).

**Candidate P0 set (~4 items, ~3 months):**
- Phase 1 #1 — EPM tree as navigation rückgrat *(the structural anchor)*
- Phase 1 #10 — Element staleness signal *(trust)*
- Phase 1 #12 — Cross-element consistency widget *(trust, always-on)*
- Phase 6 #1 — Confluence **outbound** publish *(adoption: make the knowledge visible to the rest of the bank — pulled forward from 2027)*

**Rationale:** EPM is the anchor that ties Processminer to Sparx/Adonis. The two
trust signals are S/XS and address the core "can I trust this documentation?"
question. Confluence outbound is the cheapest adoption lever and contradicts the
original plan's own "connectors are not optional" framing by sitting 18 months
out — so it moves up.

**Deferred from the original H1:**
- Phase 1 #4 / #5 — **already shipped** (removed from the doc).
- Phase 1 #2 (Adonis import) — an accelerant on patchy, years-old data, not a
  wedge-definer; slips behind Sparx export / the trust wins.
- Phase 0 #2 (R19 token slicing) — invisible optimization; keep only as a cheap
  rider on the schema generator, else defer out of H1.

### 2026 H2 — "aggregate upward + warm-start"
**Focus:** Sparx export + Adonis warm-start + Phase 3 quick wins.
**Candidate P0 set (~4 items, ~3 months):**
- Phase 1 #3 — Sparx XML export
- Phase 1 #2 — Adonis CSV importer *(deferred from H1)*
- Phase 3 #2 — Sample / demo process pre-loaded
- Phase 3 #15 — Better error messages with retry path

*(Phase 1 #10 staleness + #12 consistency widget moved up to H1.)*

### 2027 H1 — "ArchitectMiner makes the architect productive"
**Focus:** Phase 2 visualisations + quality.
**Candidate P0 set (~5 items, ~3 months):**
- Phase 2 #1 — Capability map
- Phase 2 #2 — Target application landscape diagram
- Phase 2 #5 — Capability coverage gap analyzer
- Phase 2 #15 — Handoff readiness check
- Phase 2 #19 — Target architecture lint

### 2027 H2 — "Phase 4 + Confluence connector"
**Focus:** Process analysis fundamentals + Confluence flow.
**Candidate P0 set (~5 items, ~3 months):**
- Phase 4 #2 — SIPOC auto-view
- Phase 4 #3 — Process maturity assessment
- Phase 4 #4 — Governance dashboard
- Phase 6 #1 — Confluence bidirectional connector

### 2028 H1+ — Phase 5 selective + Phase 6 #2 + Phase 7 start
**Focus:** Senior architect expectations (Wardley, vendor portfolio,
roadmap Gantt) + Jira connector + first Phase 7 module.
**Open:** which Phase 7 module ships first. Document cross-check is the
strongest auditor-facing wedge; Change/Transformation is the strongest
budget-defence wedge.

---

## Open strategic questions

These are the unresolved decisions that affect sequencing. Best resolved
before the first P0 set goes into design docs.

1. **Sparx XML flavour.** XMI (UML profile) vs ArchiMate Open Exchange.
   Affects Phase 1 #3 effort sizing (M vs L). Depends on how the bank's
   Sparx is configured — Enterprise Architecture team should confirm.
2. **Adonis CSV variants.** No two Adonis exports look the same. Does
   Phase 1 #2 ship with N field-mapping profiles, or one configurable
   importer with profile-as-YAML? Configurable is more durable.
3. **Confluence space strategy.** Phase 6 #1 — does Processminer publish
   to a single bank-wide space, one space per business unit, or one
   space per process? Affects access control + URL stability.
4. **Jira project mapping.** Phase 6 #2 — when Processminer creates an
   epic, which Jira project does it land in? Per-process default? Per
   business unit? User-selected each time?
5. **Phase 7 module sequencing.** Change / Transformation vs Training vs
   Document Cross-Check — which ships first? Document Cross-Check is
   the highest auditor visibility; Change / Transformation is the
   highest budget visibility; Training is the lowest effort.
6. **Phase 5 trim.** The 20 top-architect candidates have not yet been
   trimmed by the user. A "best 6 to invest in" cut would clarify the
   2028 outlook.

---

## Cross-references

- [TARGET-ARCH-PLAN.md](TARGET-ARCH-PLAN.md) — completed v0.2 / v0.3
  rollout this builds on (derived schemas, ProcessView, get_context.py)
- [ORCHESTRATOR-PLAN.md](ORCHESTRATOR-PLAN.md) — v0.4 orchestrator design
  (the seam several Phase 1 ideas reuse); contains the **Karpathy wiki is
  sacred** principle
- [HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md) — per-heading
  provenance contract (Phase 1 #14 builds on this)
- [SKILLS.md](SKILLS.md) — agent/skill architecture (Phase 1 #6 touches
  skill behaviour)
- [docs/architecture-comparison.html](docs/architecture-comparison.html)
  — target-vs-current snapshot (the "post-v0.4.0" view this roadmap is
  starting from)
- [CONTENT-MODEL-PLAN.md](CONTENT-MODEL-PLAN.md) — schema decisions
  D1–D6 (every Phase 2 / 5 schema addition needs a new D-decision here)

---

*Last updated 2026-05-28; **enriched + reprioritised 2026-06-04**: added Phase 0
foundations (open items from [REQUIREMENTS-ROADMAP.md](REQUIREMENTS-ROADMAP.md)),
**removed the candidates that already shipped** during the R1–R22 + ArchitectMiner
run (listed in the status reconciliation), and revised 2026 H1 (anchor + trust
signals; Confluence outbound pulled forward). Next review: after the first P0
set is prioritised and the first `*-PLAN.md` design doc is in flight.*

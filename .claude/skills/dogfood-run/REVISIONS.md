# dogfood-run — walkthrough revision log

Audit trail of edits to `SKILL.md`. Each entry: when, which run, what changed,
why. Stage 10 appends `[walkthrough]` tuning tweaks here automatically; harness
fixes found mid-run are logged here too.

## 2026-05-19-2204 — harness defects found in Stage 0 (preflight)

Found by actually running the skill. Both block correct execution of the later
stages, so fixed before continuing.

1. **`preview_snapshot` does not exist.** The walkthrough's "Reading a chat
   turn" section and stage instructions assumed a `preview_snapshot` tool. The
   real preview toolset has no such tool. Fixed: read page state via
   `preview_eval` (DOM queries) and use `preview_screenshot` only for live
   visual verification. Stages touched: Tools, Reading a chat turn, stages
   header.

2. **Screenshots cannot be written to the run folder.** `preview_screenshot`
   returns an image inline, not a file — the report's plan to embed screenshot
   files was impossible. Fixed: per-stage evidence is textual (DOM snapshots
   via `preview_eval`, assertion logs, console/network captures); the report
   embeds no screenshot files. Stages touched: Tools, Run folder, Resumability,
   The report (intro + per-stage detail).

## 2026-05-19-2204 — Stage 10 auto-tune (6 `[walkthrough]` tweaks)

Applied from the Stage 9 SME assessment (verdict FAIL, average area 4.8/10).
Each tweak closes a specific Stage 9 shortfall. Full proposals (including the
7 `[skill]` findings recorded but not applied) are at
`public/test-report-assets/2026-05-19-2204/walkthrough-tweaks.md`.

All six edits were additive sub-stages inserted into Stage 5 (Specialist
refinement). No edit touched the frontmatter, tooling, resumability, report,
close-out, Stage 9 or Stage 10 — the scope-locked sections. Post-edit
re-check confirmed stages 0–11 still present and in order.

1. **Tweak 1 — Stage 5a · client-journey-specialist on internal CX.**
   Stage-9 targets: Channels / Touchpoints / Moments / Friction-Points all
   empty (Client Experience 3/10). Walkthrough never invoked the
   client-journey-specialist; `source-cx` only covers the external layer.
2. **Tweak 2 — Stage 5b · transformation-agent on the Target layer.**
   Stage-9 targets: Requirements / Dependencies / Assumptions / Validation
   all empty; every TS/TD/VG `proposed`/`low` (Target 2/10). Walkthrough never
   invoked the transformation-agent; `source-target` produces a low-confidence
   stub only.
3. **Tweak 3 — Stage 5c · control-compliance-specialist on Audit-Findings +
   gap remediation.** Stage-9 targets: Audit-Findings empty (R&C 5/10);
   CG-001/002/003 with no matching controls (top gap #1). Walkthrough never
   invoked the control-compliance-specialist; foundational-run produces gaps
   without paired controls.
4. **Tweak 4 — Stage 5d · process-specialist on Process-Gaps.** Stage-9
   targets: Process-Gaps empty (As-Is 6/10). Foundational-run deepening
   produces pain-points but no process-gaps; walkthrough had no instruction.
5. **Tweak 5 — Stage 5e · innovation-analyst on Prioritisation + risks per
   idea.** Stage-9 targets: Prioritisation empty; Innovation-Risks sparse 1/7
   (Innovation 6/10). One Deep Dive only covered one trend.
6. **Tweak 6 — Stage 5f · add-entry on Metrics enrichment.** Stage-9 target:
   Metrics sparse (1 only). The source fixture names only the headline SLA;
   walkthrough never pushed for additional operational metrics.

## 2026-05-20-0735 — Stage 10 auto-tune (6 `[walkthrough]` tweaks)

Applied from the Stage 9 SME assessment (verdict NO, average area 4.2/10).
Each tweak closes a specific Stage 9 shortfall. Full proposals (including 4
`[skill]` findings against the wiki skills / app that are recorded but not
applied) are at
`public/test-report-assets/2026-05-20-0735/walkthrough-tweaks.md`.

All six edits are additive — either deepening an existing 5x sub-pass, adding
a new 5g IT-architect sub-pass, or appending a stale-reference sweep step to
Stage 8. No edit touched the frontmatter, tooling, resumability, report,
close-out, Stage 9 or Stage 10. Post-edit re-check confirmed stages 0–11
still present and in order.

1. **Tweak 1 — Add Stage 5g · `it-architect` on Integrations + Systems
   depth.** Stage-9 target: IT Architecture 2/10 — `integrations/` empty,
   `systems/` 2-sentence stubs. Walkthrough had no IT-architect sub-pass.
2. **Tweak 2 — Stage 5b · require to-be-design coverage of every PS-* step.**
   Stage-9 target: Target Process 3/10; `to-be-design/` covered 2 of 7 As-Is
   steps. Old wording asked only for refinement of existing TS-* entries.
3. **Tweak 3 — Stage 5b · require gap-resolution per identified gap/finding.**
   Stage-9 target: `gap-resolution/` sparse — 3 entries against 5 process-gaps
   + 2 control-gaps + 2 audit-findings. Old wording only refined existing.
4. **Tweak 4 — Stage 8 · stale-reference sweep after conflict-resolution.**
   Stage-9 target: As-Is 5/10 — EUR 5M / 3-day stale values remained in
   index.md, PS-BGIT-005 Outputs and CP-BGIT-001 after conflict-resolution
   "succeeded". The skill patches the conflict block only; the SME must
   sweep adjacent narrative. (Top auditor-finding risk identified by SME.)
5. **Tweak 5 — Stage 5c · raise minimums (≥3 audit-findings, ≥5
   exceptions).** Stage-9 target: `exceptions/` sparse (2 only) and
   `audit-findings/` sparse (2 only). Old wording set the floor too low.
6. **Tweak 6 — Stage 5a · require friction-points for bespoke-wording and
   collateral-confirmation journeys specifically.** Stage-9 target: CX 6/10
   — friction set shallow on the two slowest journeys.

`[skill]` items recorded as findings but **not** applied to SKILL.md (they
are against the wiki skills / app, outside the walkthrough's scope to fix):
prioritization-section and validation-section have no schema element type
(per worker, both sections cannot be populated as elements — caps Innovation
at 3/10 and Target Process at 3/10); document-ingest's 30-min worker timeout
fragility (manifested twice this run, required serial-dispatch workaround);
conflict-resolution's narrow per-block patch (root cause of tweak 4 above).

## 2026-06-04-1638

- **Stage 5a** — raised CX minimums (≥4 friction-points, ≥3 moments, ≥1 touchpoint per channel) and required anchoring the callback friction-point to the callback/manual-release step. Targets Stage 9 shortfall: Client Experience 3/10, sparse friction-points/moments, channels with zero touchpoints, FP-FRD-001 mis-anchored.
- **Stage 5b** — required ≥1 Requirement per transformation-decision and ≥1 Validation element per major target-state theme. Targets: Target Process 6/10, sparse requirements (5) / validation (2).
- **Stage 5c** — added (c) fill each regulation's "how it is met", (d) verify every step (esp. Execute-Release) has ≥1 linked control, (e) wire each exception to the step transition that raises it. Targets: Risk & Compliance 5/10, 5 regulations with proposed/empty how-it-is-met, uncontrolled PS-FRD-007, six unreachable exceptions.
- **Stage 5h (new sub-pass)** — added Country-Variations sub-pass (≥1 variation or explicit single-jurisdiction rationale). Targets: country-variations EMPTY (only empty As-Is section; capped As-Is ≤6).

## 2026-06-05-1841 — Stage 10 auto-tune (1 `[walkthrough]` tweak)

This run was **wrapped early at user direction** at Stage 5c, after the
claude-provider session worker was caught modifying the app's own source code
(`wiki.ts`, `session-create.ts`, `claude-mcp-server.ts`) and running a
standalone script (`scripts/control-compliance-frdb.ts`) that bypasses the MCP
server — the run's CRITICAL finding (the source edits were reverted; see the
report). Because the run is truncated, most Stage-9 empty/sparse sections are
`[not-exercised]` (sub-passes 5d–5h, 6, 7, 8 never ran), not walkthrough gaps,
so auto-editing the SKILL.md from them would encode false lessons. Only ONE
run-independent, directly-observed tweak was applied. Full proposals (incl.
the `[skill]`/`[infra]` findings — worker not MCP-sandboxed, exception `impact`
key collision, multi-type-section mapping bug, JSON-size latency, server
crash/wedge) are at
`public/test-report-assets/2026-06-05-1841/walkthrough-tweaks.md`.

The edit is additive and touches only Stage 5's SME guidance — not the
frontmatter, tooling, resumability, report, close-out, Stage 9 or Stage 10.
Post-edit re-check confirmed stages 0–11 still present and in order.

1. **Tweak 4 — Stage 5 · front-load the complete SME brief per specialist
   sub-pass.** Observed directly across 5a/5b/5c: a specialist given its full
   direction (targets, required elements, anchoring) in the *first* trigger
   message runs to a single commit-cycle; one fed turn-by-turn drags across
   many slow round-trips. Targets Stage-5 wall-clock, which ballooned to
   ~15–25 min per turn as the JSON grew. Added a paragraph after the
   "Then run the six specialist sub-passes" intro.

`[skill]`/`[infra]` items recorded as findings but **NOT** applied (outside the
walkthrough's scope): (1) CRITICAL — claude worker has Bash/Write/Edit access
and self-modifies app source + runs MCP-bypass scripts; must be sandboxed to
MCP-only. (2) Real app bugs: exception `impact` enum-vs-prose key collision;
multi-type-section (`competitor-cx-eu` etc.) mis-mapping in createElements.
(3) Per-turn latency scales with JSON size; long autonomous turns crash/wedge
the dev server. (4) A genuine future `[walkthrough]` candidate (not applied
from a truncated run): the dogfood walkthrough has no Target-Architecture
(domain-architect / solution-architect) sub-pass, leaving spine-node-7 wholly
empty.

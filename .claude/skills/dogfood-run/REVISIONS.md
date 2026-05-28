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

## 2026-05-28-1502 — Stage 4 fail-safe for silent source-* failures *(later reverted — see below)*

Partial run — user direction stopped after Stage 4 surfaced a silent
`source-cx` failure (0 elements written to all five CX folders after 25+ min
of file-watching; UI showed "Sourcing…" indefinitely with no POST to
`/api/session` in the server logs). Stages 5–8 skipped by user choice;
Stage 9 ran over the partial wiki (verdict "Not yet; not fit for an
auditor", average area 2.1/10). Full tweak proposals at
`public/test-report-assets/2026-05-28-1502/walkthrough-tweaks.md`.

One `[walkthrough]` tweak applied; three `[skill]` findings recorded; one
`[walkthrough]` deferred as too structural to safely auto-apply.

1. **Tweak 1 — Stage 4 fail-safe for silent source-* failures.** Stage-9
   targets: five empty schema areas (Client Experience, Innovation, Target
   Process, Target Architecture, plus half of Risk & Compliance and IT
   Architecture). Added an additive paragraph to Stage 4: after triggering
   each `source-*` CTA, watch the target section folder(s) for the first
   file write within **5 minutes**. If none appears, record the failure as
   a `[skill]` finding for the stage, mark the sub-assertion FAIL, and move
   on to the next source-* skill — one silent failure doesn't necessarily
   mean all four will fail. The original Stage 4 wording said "these do live
   web research and take time" with no upper bound, which let this run sit
   for 25+ min on a skill that was never going to produce.

## 2026-05-28 (post-run) — REVERT of tweak 1; replaced with chat-routed note

Reverted the 5-minute fail-safe paragraph applied above. The reasoning was
wrong: while writing the dogfood QA report I checked the wiki one more time
and found that `source-cx` **had** produced — 8 elements in `competitor-cx/`
and 4 in `cx-benchmarks/` — with mtimes 16:53–16:55, *after* my 16:49 report
write-up. The real symptom was that the run took 15.4 minutes (per the
`POST /api/session ... 200 in 15.4min` line in the server log), but the
`runSourcing` function in `src/app/ProcessDocScreen.tsx` was making the
POST via raw `fetch(...)` with `sessionId: null` — bypassing
`useAgentChat`'s transcript, active-skill chip, watchdog and error
surfacing. So the harness saw nothing happening for ~15 min, declared the
skill broken, and stopped. The real bug was in the code, not in the
walkthrough.

The code-level fix landed in a separate commit: `runSourcing` now routes
through `handleSend` like every other skill invocation
(`runLint`, `runAreaSpecialist`, `runCouncilReview`). The chat shows the
turn live; errors surface inline; session continuity is preserved. With
that fix in place, the 5-minute fail-safe paragraph would have made
legitimate slow runs (the normal case for source-* is 15–60 minutes) fail
prematurely — i.e. the tweak would have hidden the real problem rather
than detecting it.

Replacement paragraph kept in Stage 4: an expectation note that source-*
takes 15–60 minutes, plus a reminder that progress now appears in the chat
(no need to watch the file system). One sentence; no fail-safe condition.

**How to revert this revert (i.e. restore the 5-minute fail-safe):** the
fail-safe paragraph wording is preserved verbatim in
`public/test-report-assets/2026-05-28-1502/walkthrough-tweaks.md` under
section 2 ("[walkthrough] Stage 4 needs a fail-safe to detect silent
source-* failures"). The replacement note in the current Stage 4 begins
"expect 15–60 minutes per skill" — that line replaced the original
fail-safe block.

`[skill]` items recorded as findings but **not** applied to SKILL.md:
- `source-cx` (and presumably the other three `source-*` skills) silently
  produced no output in this dev environment — likely the worker lacks
  WebSearch / WebFetch tool access, or its writer silently failed without
  surfacing in the chat. The CTA fired and the UI showed "Sourcing…" but no
  POST to `/api/session` after the click. Worth investigating in the
  source-* skills or the worker config; fix lives there, not here.
- Top-bar "Sourcing…" chip does not clear on silent failure — there's no
  timeout / error state, masking the failure mode for ~25 min before the
  harness's file-watch detected it. Frontend finding.

`[walkthrough]` deferred (not auto-applied — too structural, would need
manual review per "additive and conservative" rule):
- Stage 4 should restructure to an explicit per-skill loop with a documented
  "skip-on-fail" branch — i.e. each source-* CTA is its own sub-stage with
  its own assertion, and failure of one does not block the others. Current
  text reads as a single paragraph that lumps all four together. Filed as a
  finding for a deliberate future revision rather than auto-applying.

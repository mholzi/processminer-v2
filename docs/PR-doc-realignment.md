# Post-migration PR log — JSON-native baseline

A running record of the PRs that follow the JSON-native (v3) `main` replacement
(`b6f7b64`). Each entry documents one PR in the same structure: why it exists,
what it changes, behaviour/scope, and how it was verified.

| PR | Title | Branch → base | Type | Status |
|---|---|---|---|---|
| **#1** | Architecture documentation realignment | `docs/architecture-doc-realignment` → `main` | Docs only | **Merged** (`d331e3a`) |
| **#2** | Enforce the provenance approval gate (A1) | `fix/approval-gate-a1` → `main` | Code + tests + docs | **Merged** (`f93e878`) |
| **#3** | Decouple metadata-only writes (A3) — *first attempt* | `fix/metadata-conformance-decouple` → `fix/approval-gate-a1` | Code + tests + docs | **Closed** — auto-closed when #2's branch was deleted; superseded by #4 |
| **#4** | Decouple metadata-only writes from content conformance (A3) | `fix/metadata-conformance-decouple` → `main` | Code + tests + docs | **Merged** (`b487d3d`) |
| **#5** | Server-derived write authorship (R6a) | `fix/stable-user-ids-r6` → `main` | Code + docs | **Merged** (`8353927`) |
| **#6** | Store stable usernames, resolve display names at read (R6b) | `fix/stable-user-ids-r6b` → `main` | Code + tests + docs | **Merged** (`e3f27ac`) |
| **#7** | Schema drift-guard (consolidation, option C) | `chore/consolidate-schema` → `main` | Code + tests + docs | **Merged** (`498c762`) |
| **#8** | Typed transitions + RACI (R7 + R8, scope A) | `feat/typed-transitions-raci-r7-r8` → `main` | Code + tests + docs | **Merged** (`f41ea00`) |
| **#9** | Runtime state above the wiki (R9) | `refactor/runtime-state-above-wiki-r9` → `main` | Code + tests + docs | **Merged** (`94b92bf`) |
| **#10** | Delete a process, in-app (R11) | `feat/delete-process-r11` → `main` | Code + docs | **Merged** (`7d1035c`) |
| **#11** | Quick wins — applyLint bug + chat overlay + clickable chat refs (R14 a/b) | `fix/quick-wins-r13-r14` → `main` | Code + docs | **Merged** (`7df0b5f`) |
| **#12** | Editable Overview (R12a) | `feat/overview-edit-summaries-r12` → `main` | Code + docs | **Merged** (`b742eb1`) |
| **#13** | Contributors + per-edit attribution (R5) | `feat/contributors-activity-r5` → `main` | Code + docs | **Merged** (`51abb5c`) |
| **#14** | Cleanup — asList dedup (R13) + runSourcing via handleSend (R14c) | `fix/dedup-runsourcing-r13-r14c` → `main` | Code + docs | **Merged** (`abce8fe`) |
| **#15** | Section summary strips (R12b) | `feat/section-summaries-r12b` → `main` | Code + docs | **Merged** (`d30c67b`) |
| **#16** | Country-variations element type (R15) | `feat/country-variations-r15` → `main` | Schema + code + docs | **Merged** (`e7361e9`) |
| **#17** | Per-process access control (R16) | `feat/process-access-r16` → `main` | Code + docs | **Merged** (`bd30d67`) |
| **#18** | Read-only orchestrator layer (R10) | `feat/orchestrator-read-layer-r10` → `main` | Code + tests + docs | **Merged** (`1e3ad18`) |
| **#19** | Live architect chat via shared `useAgentChat` (R1) | `feat/architect-chat-r1` → `main` | Code + docs | **Merged** (`de1eb98`) |
| **#20** | Domain + solution architect specialists (R2) | `feat/architect-specialists-r2` → `main` | Skills + docs | **Merged** (`ced2bc6`) |
| **#21** | Flag dangling relation targets in the element card (R17) | `fix/dangling-relation-chips-r17` → `main` | Code + docs | **Merged** (`be7fe91`) |
| **#22** | Recover docs & standalone artifacts (R20–R22) | `feat/docs-artifacts-r20-r22` → `main` | Docs / artifacts only | **Merged** (`ea052d5`) |
| **#23** | Refresh roadmap status header | `docs/roadmap-status-refresh` → `main` | Docs only | **Merged** (`8377486`) |
| **#24** | Diagram + Traceability real-data wiring (R3) | `feat/architect-diagram-traceability-r3` → `main` | Code + tests + docs | **Merged** (`9e82c4c`) |
| **#25** | Extract RACI-pivot + flow-lane joins into process-view (R18) | `feat/process-view-r18` → `main` | Code + tests | **Merged** (`ebdf9fa`) — parallel track |
| **#26** | Personal + Library tiers from real data (R4) | `feat/architect-personal-library-r4` → `main` | Code + tests + docs | **Merged** (`bf77fe3`) |
| **#27** | Record R3/R4/R18 delivered + R19 relevance assessment | `docs/roadmap-r18-r19` → `main` | Docs only — parallel track | **Merged** (`1009038`) |
| **#28** | Reconcile per-requirement status against all merged PRs | `docs/roadmap-reconcile` → `main` | Docs only — parallel track | **Merged** (`6046216`) |
| **#29** | Add an Open items section near the top of the roadmap | `docs/roadmap-open-items` → `main` | Docs only — parallel track | **Merged** (`bff5c81`) |
| **#30** | Architect section detail views from real elements | `feat/architect-section-detail-views` → `main` | Code | **Merged** (`cbd4390`) |
| **#31** | Reference all of today's PRs in the PR log + roadmap | `docs/pr-log-reference-all-today` → `main` | Docs only | **Merged** (`3d00316`) |
| **#32** | Enrich the product ROADMAP with the open backlog items (Phase 0) | `docs/roadmap-enrich-open-items` → `main` | Docs only | **Merged** (`5dfe2dc`) |
| **#33** | Reconcile + reprioritise the product ROADMAP (remove shipped items; trust-first H1) | `docs/roadmap-reprioritise` → `main` | Docs only | **Merged** (`6b375d7`) |
| **#34** | Sync the working tree to main (skill edits, doc/data, dogfood content) | `chore/sync-working-tree-to-main` → `main` | Skills + docs + data | **Merged** (`6b1732d`) |
| **#35** | Purge stale references to the pre-rewrite Markdown-wiki model | `chore/purge-md-wiki-references` → `main` | Code + docs | **Merged** (`35f758d`) |
| **#36** | Register the `writeTargetReview` + `writeSummary` AI tools (fix council-review + area-summary) | `feat/council-summary-tools` → `main` | Code + tests + skills | **Merged** (`f12dd62`) |
| **#37** | Purge dead script / legacy-doc pointers from 6 skills | `chore/purge-skill-stale-pointers` → `main` | Skills only | **Merged** (`162a853`) |
| **#38** | Reference `CORE_SYSTEM_PROMPT.md` from the 6 perspective specialists | `chore/specialists-reference-core` → `main` | Skills only | **Merged** (`082b92b`) |
| **#39** | `scaffoldProcess` tool — make `new-process` functional | `feat/scaffold-process-tool` → `main` | Code + docs | **Merged** (`91114d3`) |
| **#40** | `createElements` batch tool — kill the source/ingest run-manifest | `feat/create-elements-batch` → `main` | Code + 5 skills + docs | **Merged** (`969d7bc`) |
| **#41** | Phantom-tool rewrites onto existing tools (overview / id / template / evidence) | `feat/skill-tool-rewrites` → `main` | 5 skills + docs | **Merged** (`e9a8d18`) |
| **#42** | Root-field tools — `writeIngestReport` + `clearConflicts`; drop `addSource` | `feat/ingest-report-tools` → `main` | Code + 1 skill + docs | **Merged** (`2921b19`) |
| **#43** | Notes tools — `createNote` + `resolveNotes` | `feat/notes-tools` → `main` | Code + 1 skill + docs | **Merged** (`b93f4d0`) |
| **#44** | Session-cursor + `setApproval` — closes the phantom-tool program | `feat/session-cursor` → `main` | Code + 1 skill + docs | **Merged** (`7d47bcd`) |
| **#45** | dogfood-run tuning + FRD-001 artifact (parallel session) | `feat/dogfood-run-frd001` → `main` | Skill + process data + docs | **Merged** (`ffbad3b`) |
| **#46** | QER-resume dashboard tile (deferred #44 follow-up) | `feat/qer-resume-tile` → `main` | Code + UI + docs | **Merged** (`3109aeb`) |
| **#47** | BRIDGES doc cleanup — mark resolved sections against real code | `chore/bridges-cleanup` → `main` | Docs only | **Open** (`pending`) |
| **#53** | DTP Enhancer (compare + triage) + Advisory Board (WIP) | `feat/dtp-enhancer-and-advisory-wip` → `main` | Code + skills + docs | **Merged** |
| **#54** | Advisor chat: full progress UI parity + read-only sub-agent fan-out | `feat/advisor-chat-progress-parity` → `main` | Code + skills | **Merged** (`bf5b81d`) |
| **#55** | Advisor chat: clickable citations + capture-as-note + richer markdown | `feat/advisor-chat-citations-notes` → `main` | Code | **Open** (`pending`) |
| **#56** | DTP Enhancer review tools — rollup, coverage, evidence, triage, export, summary | `feat/dtp-review-tools` → `main` | Code + skills | **Merged** |
| **#58** | Live-testing feedback toolkit — floating widget, auto-context, screenshots, element pins, admin toggles | `feat/live-feedback-toolkit` → `main` | Code + UI | **Merged** (`3ccfcf6`) |
| **#61** | `new-process` determinism — `deriveProcessMeta` tool + templatized copy; skill deep-dive HTML | `feat/new-process-determinism` → `main` | Code + tests + skill + docs | **Merged** |
| **#65** | `qer-session` determinism — perspective-aware cursor (skillBuilt/documented/next-built), counted cross-review gate, close-out renderer, SME actor on cursor | `feat/qer-determinism` → `main` | Code + tests + skill + docs | **Merged** |
| **#67** | `foundational-run` determinism — control-coverage flag, close-out counts + still-to-document, one-call [Y] reconcile, opt-in [E] frontmatter-sync, gap-tail batch | `feat/foundational-determinism` → `main` | Code + tests + skill + docs | **Merged** |
| **#70** | Specialists determinism — shared `getProcessRelations` tool + prose pass across all 8 perspective/architect specialists | `feat/specialists-determinism` → `main` | Code + tests + 8 skills + docs | **Merged** |
| **#74** | Source-* determinism — shared `getConsolidationInputs` tool + prose pass across the 4 sourcing skills | `feat/source-determinism` → `main` | Code + tests + 4 skills + docs | **Merged** |
| **#77** | add-entry determinism — shared `getSectionContext` tool (one-call skeleton + existing + overview) | `feat/add-entry-determinism` → `main` | Code + tests + skill + docs | **Open** (`pending`) |
| **#59** | Design-review wave 1 — colour overload, AM green theming, primary button, table scan-ability + 7 more | `fix/design-review-wave-1` → `main` | Code + UI | **Merged** |
| **#64** | Design-review wave 3 — login first-impression, guided-tour escape, DTP relabel, Help/⌘K focus-trap (also carried wave 2's `<Modal>` primitive, PR #60) | `fix/design-review-wave-3` → `main` | Code + UI | **Merged** |
| **#68** | Design-review wave 5 — SettingsPanel access confirm + error surface (also carried wave 4's export-PDF provenance, PR #66) | `fix/design-review-wave-5-access` → `main` | Code + UI | **Merged** |
| **#72** | Design-review wave 6 — DTP colour overload (kind neutral, severity the only colour axis) | `fix/design-review-wave-6-dtp-color` → `main` | Code (CSS) | **Merged** |
| **#75** | Admin token-usage tab, toggleable chat receipt, drop cost column | `feat/admin-token-usage` → `main` | Code + UI | **Merged** |
| **#78** | What's New feed signal — unseen badge on Help button, admin CRUD panel, live badge count fix | `feat/whatsnew-admin-badge` → `main` | Code + UI | **Merged** |
| **#79** | HelpCenter two-tab split — Release Notes vs Roadmap | `feat/helpcenter-two-tabs` → `main` | Code + UI | **Merged** |
| **#80** | Token usage — avg per turn dual-bar layout (avg tokens + avg run-time per skill) | `feat/token-usage-avg-per-turn` → `main` | Code + UI | **Merged** |
| **#81** | Lock down data routes — upload path-traversal fix + auth/access gates on upload/sources/notes/findings/dtp; shared `route-guards` (audit API-1/2/3/4/6/8/16) | `feat/lock-down-data-routes` → `main` | Code + tests | **Merged** |
| **#82** | R9 guardrail hardening — central `stripRuntimeState` on every process-doc write, backfill `funds-release.json`, fix stale migration/sidecar docs (audit DOC-1/2/4) | `fix/r9-guardrail-hardening` → `main` | Code + tests + data + docs | **Merged** |
| **#83** | Dispatcher integrity — enforce the A1 approval gate at element-create time (shared `buildElement`), centralize `applyLint` on `stripRuntimeState`, document the LIB-2 reload invariant (audit LIB-1/2) | `fix/create-approval-gate-lib1` → `main` | Code + tests | **Merged** |
| **#84** | UsagePanel palette fix — replace off-palette purples/indigo with theme tokens (`--accent`/`--bright`); run-time bars single accent (width encodes magnitude); dark-mode-safe (audit UI-3) | `fix/usage-panel-palette` → `main` | Code (UI) | **Merged** |
| **#85** | Combobox fix — drop broken inline tokens (`--bg-card`/`--border` → CSS `--surface`/`--line`, fixes dark mode), add keyboard nav + ARIA listbox roles (audit UI-1/2) | `fix/combobox-tokens-a11y` → `main` | Code (UI) | **Merged** |
| **#86** | AdvisorChat "Save as note" — surface save failures inline (was a silent no-op on error) + Retry affordance (audit UI-9) | `fix/advisor-note-error` → `main` | Code (UI) | **Merged** |
| **#87** | HandoffInbox — de-emphasize the forthcoming "Solution architecture" column: single muted header `soon` tag + quiet per-row em-dash w/ tooltip (was "Locked · coming soon" on every row) (audit UI-8) | `fix/handoff-solution-column` → `main` | Code (UI) | **Merged** |
| **#88** | Roadmap voting made real — per-user server-side votes (`votedBy` + `toggleVote`), `POST /api/whatsnew/vote`, derived `voteCount`/`youVoted` (no voter-list leak); HelpCenter off localStorage with optimistic + rollback (audit UI-7) | `feat/real-roadmap-votes` → `main` | Code + API (UI) | **Merged** |
| **#89** | Modal a11y (1/2) — focus-trap + dialog semantics on 3 hand-rolled overlays (SkillsDashboard drawer, FeedbackScreen, SourcesPanel) via the shared `useFocusTrap` (audit UI-4/5/6a) | `fix/modal-a11y-batch-1` → `main` | Code (UI) | **Merged** |
| **#90** | Modal a11y (2/2) — ProcessSwitcher: focus-trap both dialogs (⌘K palette + confirm), gated so only the topmost traps; preserves layered Esc + arrow nav (audit UI-6b) | `fix/processswitcher-a11y` → `main` | Code (UI) | **Merged** |
| **#91** | `listProcesses` resilience — guard the per-file `JSON.parse` so one corrupt process file skips instead of breaking the whole portfolio; pure `parseProcessListing` helper + tests (audit LIB-6) | `fix/list-processes-resilience` → `main` | Code + tests | **Merged** |
| **#92** | Atomic writes for the auth/access/feedback/session stores — swap plain `writeFileSync` → `atomicWriteFileSync` (closes the torn-read that could zero out `users.json` or `process-access.json`) (audit LIB-4) | `feat/atomic-auth-stores` → `main` | Code | **Merged** |
| **#93** | Repo-root cleanup — gitignore the dogfood/test process artifacts, the generated audit HTML, and the `tmp-*.ts` scratch scripts so they stop cluttering the tree and can't be committed (audit DOC-5) | `chore/gitignore-stray-artifacts` → `main` | Config | **Merged** |
| **#94** | Conformance test coverage — 10 tests for the gate's foundation: `parseProvenance` (malformed-safe), `checkProvenance`, `checkFrontmatter`, `checkFieldValues` (audit LIB-8) | `test/conformance-coverage` → `main` | Tests | **Merged** |
| **#95** | Auth-boundary test coverage — extract pure `decodeSession` + `canAccessWith`; cover the authn/authz gate (13 tests) (audit LIB-9) | `test/auth-access-coverage` → `main` | Code + tests | **Merged** |
| **#96** | Login rate-limit — in-memory fixed-window limiter on `/api/auth/login` per IP (20/min) + username (10/min) → 429 (audit API-11) | `feat/login-rate-limit` → `main` | Code + tests | **Merged** |
| **#97** | CSRF protection — session cookie `sameSite=strict` + `middleware.ts` blocks cross-origin `/api/*` mutations via pure `isForbiddenCrossOrigin` (audit API-10) | `feat/csrf-protection` → `main` | Code + tests | **Merged** |
| **#98** | API error-handling hygiene — stop leaking `node:fs` paths in error responses (generic message + server log); 400 not 500 on malformed JSON bodies (audit API-12/14) | `fix/api-error-hygiene` → `main` | Code | **Merged** |
| **#99** | `resolveWriter` fails closed — only a genuine "no request context" error (ModuleNotFound / E251) grants the trusted "SME" author; anything else rethrows (audit LIB-10) | `fix/resolvewriter-failclosed` → `main` | Code + tests | **Merged** |
| **#100** | AgentChat a11y — `aria-label` on the icon-only ✦/↻/⟩ buttons; resize handle becomes a keyboard-operable `role="separator"` (←/→ resize) (audit UI-10/11) | `fix/agentchat-a11y` → `main` | Code (UI) | **Merged** |
| **#101** | HelpCenter cleanup + DTP deps + table-width hygiene — drop dead `schema` prop; empty live feed no longer masked by the seed; remove benign exhaustive-deps suppress; move hardcoded `<th>` widths to CSS classes (audit UI-12/13/14/15) | `fix/ui-cleanup-12-15` → `main` | Code (UI) | **Merged** (`8cf595d`) |
| **#102** | Dogfood-driven skill + write-layer hardening — (1) skill specs: `foundational-run` no longer auto-approves on `[E]`/`[N]` (waits for explicit `[Y]`), `add-entry` writes only on `[Y]`, `run-lint` sweeps in-session + always calls `applyLint`, `document-ingest` forbids sub-agents reading `.ts`/`src/` (cut a 13-min runaway to ~8 min); (2) MCP `applyLint` writes a full `LintReport` (not a bare array) so the Review panel stops crashing; (3) `updateElement` guards `meta.approval` against the canonical set so a non-canonical value (e.g. `"in-review"`) can no longer be persisted via the MCP `setApproval`/`updateElement` path | `fix/dogfood-skill-write-hardening` → `main` | Code + 5 skills | **Merged** (`b64dfb5`) |
| **#104** | Dogfood harness family — extend `dogfood-run` with a `qer-session` stage (the interactive authoring path, separate `kind:"qer"` cursor, own fresh process; Report → Stage 11); add `dogfood-target` (Target/Transformation: transformation-agent Y/E/R, council-review Accept/Reject/Reopen, area-summary; needs an existing As-Is); add `dogfood-dtp` (DTP Enhancer: dtp-regenerate / dtp-compare + finding disposition / dtp-summary; needs an As-Is + original ingested DTP). All three are CLI-only, auto-discovered test harnesses | `feat/dogfood-harness-family` → `main` | Skills only | **Merged** (`9a5af53`) |
| **#106** | DTP Enhancer + Target UX fixes (dogfood-target/-dtp findings) — (1) retire the dead-end DTP **regenerate** UI: drop the run-view Regenerate button + `onRegenerate` prop chain + `runDtpRegenerate`, compare-only (skill left chat-routable); (2) mode-neutral DTP run ids (`DTP-NNN`, parses legacy `DTP-REGEN-NNN`); (3) discoverable area-summary: `✦` affordance on the area-title button; (4) Validation nav badge counts `targetReview.items` + triage state (was always `0`). Plus dogfood-target/-dtp spec corrections (R/D/A phase coverage, dtp-summary memo shape, SME-preamble note) | `fix/dtp-target-ux` → `main` | Code + UI + skills | **Merged** (`c1067b7`) |
| **#108** | Splash process-pick no longer clobbered by a stale `?p=` URL — the mount effect that restores the process from the URL now skips the restore when the user made an explicit splash pick (`initialSlug`), and syncs the URL to the pick instead. Without this, picking any process from the workspace landed on whatever `?p=` the previous session left (e.g. always Dogfood Test Run 2) | `fix/splash-pick-url-clobber` → `main` | Code | **Merged** (`19d866d`) |
| **#110** | Chat seed reflects the open process — the resume seed, Triage landing and chat-open default were all driven by `openingRunDoc`, computed as the most-recent in-flight run across *all* processes, so opening one process (e.g. COB-003) showed another's resume prompt (Funds Release Dogfood). Now `openingRunDoc` is tied to the actually-opened slug (`openingSlug = splashPick ?? globalRunDoc ?? docs[0]`); the global run is only the fallback when nothing was picked | `fix/chat-seed-wrong-process` → `main` | Code | **Merged** (`114df04`) |

> **Design-review stack note.** The six design-review waves were developed as a
> stack (#59 → #60 → #64 → #66 → #68 → #71) on top of #58. When merged bottom-up
> into a `main` that had moved on, the cumulative branches meant each merged PR
> carried the waves below it: **#60** (wave 2, `<Modal>`) landed inside **#64**,
> **#66** (wave 4, export PDF) inside **#68**, and **#71** (wave 6) was re-opened
> as **#72** after its base branch was deleted. So #60/#66/#71 show *closed* but
> their content is fully on `main`. The only merge conflict throughout was this
> log itself; all code auto-merged.

> **Numbering note.** The "Recover docs & standalone artifacts (R20–R22)" work
> was pre-logged here as #19 but the real #19 went to the ArchitectMiner R1 PR;
> the docs/artifacts PR was opened later as **#22**. **#20** is the R2
> architect-specialists PR (opened separately by the ArchitectMiner track).
> #21 + #22 were developed concurrently with R2 in isolated git worktrees off
> `main`, so the PR numbers are not in requirement order.

> **What happened with #3 → #4 (the stacking lesson):** #3 was opened *stacked*
> on #2's branch (the A3 change is only safe with the A1 gate present). When #2
> merged into `main` and its branch was deleted, GitHub **auto-closed** #3 — it
> closes a stacked PR whose base branch disappears rather than retargeting it.
> The same commits (`478ac3b`, `a1e6f1d`) were re-opened as **#4 → `main`** and
> merged cleanly (A1 was by then on `main`). Lesson applied since: later PRs
> target `main` directly.

---

# PR #1 — Architecture documentation realignment (JSON-native)

**Branch:** `docs/architecture-doc-realignment` → `main` · **Date:** 2026-06-04
· **Type:** Documentation only — **no application code changes.**

## Why this PR exists

`main` was replaced with the **JSON-native (v3) rewrite** (`b6f7b64`): the
per-Markdown-file wiki and the `scripts/wiki/*.py` toolkit were removed in
favour of a single strongly-typed JSON document per process
(`wiki/processes/<slug>.json`), a TypeScript/MCP write path, and a dual-track
(Gemini / Claude) LLM backend.

The migration **moved the project's guidance docs to `legacy-docs/` but never
replaced them.** As a result the repo had:

- **no `CLAUDE.md` at all** (the auto-loaded project-instruction file) — a new
  Claude Code session got zero guidance, and the archived copy actively
  described the deleted Markdown/Python world;
- a **stale `SKILLS.md`** at the root still documenting the deleted Python
  toolkit and the verbatim cross-skill block enforcement;
- **no current `DESIGN.md`** (only the German legacy consultation doc).

This PR restores an accurate, current documentation baseline and captures the
triage of work that the migration dropped, so future work is grounded in what
the code actually does today.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `CLAUDE.md` | **new** | Project-instruction file rewritten for the JSON-native model: single-JSON data model, the "never hand-edit the JSON — go through the schema-validated writer" rule restated for `wiki-write.ts` + the MCP tools, dual-track backend, skill routing, schema/provenance contract, verification commands. |
| `SKILLS.md` | **rewritten** | Agent/skill architecture updated for the tool layer. Kept the still-valid concepts (6 perspective specialists, Brainstorm/Author/Verify, the QER step sequence, the lint council, the approval model, the button→skill map); replaced the Python-toolkit section (§6) with the `expandElement`/`createElement`/`updateElement`/`checkConformance`/`checkTransitions`/`applyLint` tools + `wiki-write.ts` server actions. |
| `DESIGN.md` | **new** | Design system refreshed and verified against `src/app/globals.css` `:root` (tokens unchanged by the migration). Adds the one new token family — `--ws-accent` workspace theming (blue = Processminer, green = ArchitectMiner) — plus dark mode and the decisions log. |
| `REQUIREMENTS-ROADMAP.md` | **new** | Triage of all 41 superseded commits into 22 candidate requirements (R1–R22) grouped into themes, with a proposed phasing. The basis for prioritizing what to re-port onto the new baseline. |
| `SUPERSEDED-MAIN-COMMITS.md` | **new** | Audit of the 41 code-touching commits that the old `main` carried but the JSON-native baseline dropped (wiki-only commits excluded), each with its commit body and non-wiki diffstat. |
| `legacy-docs/LEGACY-SKILLS.md` | **new** | The pre-rewrite `SKILLS.md`, archived to preserve its prompt-engineering research (mirrors how `LEGACY-CLAUDE.md`, `LEGACY-DESIGN.md` etc. were handled). |
| `docs/PR-doc-realignment.md` | **new** | This document (subsequently expanded into the PR log above). |

> **Not included:** `.claude/launch.json` (personal local dev config) is left
> out of this PR.

## Known issues documented (not fixed in this PR)

While realigning the docs, two architectural problems in the JSON-native
baseline were confirmed and recorded prominently in `CLAUDE.md`, `SKILLS.md`,
and `REQUIREMENTS-ROADMAP.md`. **PR #1 documented them; PR #2 fixes the first.**

- **A1 — the approval gate is dead code.** The provenance contract states that
  an element with any `proposed`/`web` heading cannot be approved, but
  `UNCONFIRMED_SOURCES` in `src/lib/conformance.ts` is defined and referenced
  nowhere, so `setApproval` does not enforce the gate. → **Fixed in PR #2.**
- **R9 — runtime state lives inside the wiki.** `reviewState` and `lint` are
  top-level keys inside `wiki/processes/cob-003.json`, contradicting the
  project's guardrail that runtime/orchestration state lives *above* the wiki
  layer. → still open.

Also recorded: **only `cob-003` was migrated** (roadmap A2), and **the JSON
schema exists in two copies** (`schema/process-schema.json` and
`src/lib/schema/process-schema.json`) that must be kept in sync.

## Verification

- No code changed; the running app is unaffected.
- All file paths, tool names, schema locations, server-action names, and design
  tokens referenced in the new docs were checked against the actual baseline
  source (not the legacy docs) before writing.

---

# PR #2 — Enforce the provenance approval gate (A1)

**Branch:** `fix/approval-gate-a1` → `main` · **Date:** 2026-06-04 · **Type:**
Code fix + tests + docs.

## Why this PR exists

Restores the **approval gate** the JSON-native rewrite silently dropped (roadmap
**A1**, documented in PR #1). The anti-hallucination contract requires that an
element with any heading still `proposed`/`web` — AI-drafted and **not yet
confirmed by the SME** — cannot be marked `approved`. That gate was dead code:
`UNCONFIRMED_SOURCES` in `conformance.ts` was defined but referenced nowhere, so
`setApproval` would stamp `approved` on unconfirmed content.

In an audit tool, "approved" = ground truth — so the missing gate let
AI-proposed text enter the official record wearing an approval stamp. This is
the single worst silent failure mode for the product.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/conformance.ts` | **edit** | New pure helper `unconfirmedHeadings(provenance)` returning the headings whose source is `proposed`/`web`. |
| `src/lib/wiki-write.ts` | **edit** | `updateElement` (both the process-overview and element branches) refuses to set `approval: "approved"` while any heading is unconfirmed, naming the blocking headings. Runs **before** the generic conformance check so the message is specific; `setApproval` surfaces it. |
| `src/lib/conformance.test.ts` | **new** | Unit tests for `unconfirmedHeadings`; `npm test` now runs it alongside the lint tests. |
| `package.json` | **edit** | `test` script includes the new test file. |
| `CLAUDE.md`, `SKILLS.md`, `REQUIREMENTS-ROADMAP.md` | **edit** | A1 marked **fixed** so the docs stay truthful. |

## Behaviour & scope

- A **hard block**, specifically for unconfirmed provenance — distinct from the
  warn-and-allow model for conformance/lint findings.
- `legacy-approved` is exempt (the grandfather source).
- **Not retroactive** — it only gates new approval actions; existing data is not
  re-validated.
- Editing a heading already resets it to `proposed`, so re-approval requires
  re-confirmation (unchanged behaviour).

## Verification

- **Integration (real data):** on `cob-003` — which carries **63 `proposed` +
  42 `web` headings across 36 elements** — approving `PS-COB-006` is blocked
  with `Cannot approve PS-COB-006 — these headings are not yet confirmed by the
  SME (still proposed/web): inputs, outputs, description.` and **no write
  occurs**.
- App boots clean (`GET /` → 200, no server errors).
- `npm run typecheck` clean; `npm test` green.

## Issue surfaced (led to PR #3)

While integration-testing, a pre-existing bug was found: `updateElement` ran the
full content-conformance check on **every** write, so a metadata-only state
change (approve / **reject** / relevance / status) was blocked whenever the
element's existing content wasn't conformant. Recorded as roadmap **A3** and
fixed in PR #3.

---

# PR #3 → #4 — Decouple metadata-only writes from content conformance (A3)

**Branch:** `fix/metadata-conformance-decouple` · **Date:** 2026-06-04 ·
**Type:** Code fix + tests + docs. **Merged as PR #4 → `main`** (`b487d3d`).

> Opened first as **PR #3**, stacked on PR #2's branch. GitHub auto-closed #3
> when #2's branch was deleted on merge; the identical commits were re-opened as
> **PR #4 → `main`** and merged. See the stacking note at the top of this log.

## Why this PR exists

Fixes the bug surfaced by PR #2 (roadmap **A3**): `updateElement` validated
content conformance on **every** write, so a **metadata-only** state change —
approve, **reject**, relevance triage, status — was blocked whenever the
element's *existing content* wasn't fully conformant. On the largely
non-conformant migrated data this left the approval/relevance controls
effectively dead (you couldn't even *reject* an element), contradicting the
documented warn-and-allow model (`SKILLS.md §10`).

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/wiki-write.ts` | **edit** | The conformance hard-block now runs only when the patch actually changes content (`isContentEdit`). Metadata-only writes proceed without it. |
| `src/lib/wiki-write.test.ts` | **new** | Covers: metadata-only reject succeeds on a non-conformant element, metadata-only relevance triage succeeds, and the A1 gate still blocks approval of unconfirmed content. Uses a throwaway fixture and cleans up. |
| `package.json` | **edit** | `test` script includes the new test file. |
| `CLAUDE.md`, `SKILLS.md` | **edit** | Clarified: content edits block on conformance; metadata-only state changes do not. |
| `REQUIREMENTS-ROADMAP.md` | **edit** | A3 recorded **fixed** in the appendix. |

## Safety preserved

- The **A1 approval gate is unaffected** — it runs *before* the conformance
  block, so approving content with any `proposed`/`web` heading is still
  hard-blocked.
- **Content edits are unchanged** — still validated and blocked on conformance
  failure (the schema-validated-writer guard).

## Verification

- `npm run typecheck` clean; `npm test` → **17/17 pass** (3 new in
  `wiki-write.test.ts`); no leftover fixture.
- App boots clean (`GET /` → 200, no server errors).

---

# PR #5 — Server-derived write authorship (R6a)

**Branch:** `fix/stable-user-ids-r6` → `main` · **Date:** 2026-06-04 ·
**Type:** Code fix + docs.

## Why this PR exists

Closes the impersonation hole from roadmap **R6** (security half, **R6a**). The
in-app write paths trusted a **client-supplied** author, so any client could
attribute an action to anyone: `setApproval`/`setRelevance` took the author from
the caller, and the `notes`, `findings`, `upload` and `feedback` routes read it
from the request body/form.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/wiki-write.ts` | **edit** | `setApproval`/`setRelevance` resolve the author from the session cookie via a server-only `sessionAuthor()` helper (dynamic imports keep the module unit-test-importable); the client `by` argument is ignored. |
| `src/app/api/notes/route.ts` | **edit** | POST author + PATCH `resolvedBy` from `verifySession`. |
| `src/app/api/findings/route.ts` | **edit** | PATCH `by` from `verifySession`. |
| `src/app/api/upload/route.ts` | **edit** | `uploadedBy` from `verifySession`. |
| `src/app/api/feedback/route.ts` | **edit** | author + role from `verifySession`. |
| `REQUIREMENTS-ROADMAP.md` | **edit** | R6 split: **R6a fixed**, **R6b** deferred. |

## Scope

This is the **security** half (R6a). **R6b** — storing the stable `username` and
resolving display names at render so renames propagate — is deferred; authorship
is currently stored as the server-derived display name.

## Verification

- **End-to-end:** `POST /api/notes` with a forged `author: "Hacker McEvil"`
  stored the authenticated session user ("Markus Holzhäuser") instead.
- No client-trusted `author`/`by`/`uploadedBy` left in any `src/app/api` route.
- `npm run typecheck` clean; `npm test` → 17/17; app boots clean.

---

# PR #6 — Store stable usernames, resolve display names at read (R6b)

**Branch:** `fix/stable-user-ids-r6b` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + tests + docs.

## Why this PR exists

Completes **R6**. After R6a (PR #5) closed impersonation, the wiki still stored
author **display names**, so a rename never propagated to existing approvals/
notes. R6b stores the stable `username` and resolves it to the current display
name at read time.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/wiki.ts` | **edit** | `resolveAuthor(handle, roster)` (pure, exported) + `nameResolver()` bound to the `getUsers()` roster. `getProcess` resolves element/overview `approvalBy`/`relevanceBy`, note `author`/`resolvedBy` (notes cloned so `rawJson` keeps the username), source `uploadedBy`, lint `resolvedBy`/`dismissedBy`. Falls back to the stored value for legacy display-name records. |
| `src/lib/wiki-write.ts`, `api/notes`, `api/findings`, `api/upload` | **edit** | Write paths store `username` instead of `name`. |
| `src/lib/wiki.test.ts` | **new** | Unit tests for `resolveAuthor`. |
| `REQUIREMENTS-ROADMAP.md` | **edit** | R6b marked fixed (R6 complete). |

## Scope

Feedback authorship is intentionally left as a display name — separate non-wiki
store with its own render path.

## Verification

- **End-to-end:** a note POST stored `admin` (username) on disk; `getProcess`
  resolved it to "Markus Holzhäuser"; `rawJson` kept `admin`.
- `npm run typecheck` clean; `npm test` → **20/20** (3 new); app boots clean.

---

# PR #7 — Schema drift-guard (consolidation, option C)

**Branch:** `chore/consolidate-schema` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + tests + docs.

## Why this PR exists

Investigating "schema consolidation" revealed the premise was inaccurate: the
two schema files are **not** duplicate copies, so they can't be merged into one.

- `schema/process-schema.json` — the **custom app schema** (`elementTypes`,
  templates, `fieldValues`). The **source of truth** (UI, conformance, and the
  MCP/Gemini tool schemas all derive from it).
- `src/lib/schema/process-schema.json` — the Draft-07 **JSON Schema** ("LLM
  output schema") used by AJV validation (`process-validator.ts`, ElementCard's
  inline edit validation) and `scripts/verify_llm_schema.mjs`.

They are two purposeful representations of the same 39 element types. The real
risk is **silent drift** — add/rename a type in one and forget the other. This
PR ships **option C** (the low-risk unblock): guard against drift rather than
force a merge.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/schema/schema-consistency.test.ts` | **new** | Drift-guard: fails if the two files' element-type sets diverge (kebab↔Pascal mapping; excludes `BaseMeta`/`BaseContent`). Does not check per-field parity. |
| `src/lib/schema/process-schema.legacy.json` | **deleted** | Empty (0-byte), unreferenced migration leftover. |
| `package.json` | **edit** | `test` runs the drift-guard. |
| `CLAUDE.md`, `docs/BRIDGES_AND_TODOS.md` | **edit** | Corrected the "duplicate copies" framing to "two representations + drift-guard"; noted a generator (option A) as the optional future step. |

## Verification

- Type-set parity is exact today (39 = 39); the guard passes.
- **Negative check:** adding a fake type to the custom schema makes the guard
  report it missing from the JSON Schema — drift is caught.
- `npm run typecheck` clean; `npm test` → **21/21** (1 new).

---

# PR #8 — Typed transitions + RACI (R7 + R8, scope A)

**Branch:** `feat/typed-transitions-raci-r7-r8` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + tests + docs.

## Why this PR exists

Transitions and RACI were a stringly-typed DSL (`"to|kind|when"`, `"step:level"`)
with no validation — and the area was **half-migrated**: the edit UI and the AJV
schema already used structured transitions, but storage was strings, RACI was
string everywhere, and **MCP/Gemini `checkTransitions` silently skipped
object-form transitions** (`if (typeof t !== "string") continue`), so
reconciliation quietly stopped working on edited/migrated data.

## Scope A (chosen)

Make storage canonical structured objects + AJV-validate; keep the read-DTO
bridge emitting the string forms so display/flow/RACI-matrix stay unchanged.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/wiki.ts` | **edit** | `transitionToString` / `transitionTarget` / `raciToString` (form-agnostic); the bridge stringifies transitions **and** RACI for the read-DTO. |
| `src/lib/claude-mcp-server.ts`, `src/lib/gemini-worker.ts` | **edit** | `checkTransitions` reads either form via `transitionTarget` (fixes the silent-skip bug). |
| `src/lib/schema/process-schema.json` (AJV) | **edit** | `Role.content.raci`: `string[]` → `{ step, level: R\|A\|C\|I }[]`. |
| `schema/process-schema.json` (custom) | **edit** | transitions + RACI notes describe the object shape (guides the LLM). |
| `wiki/processes/cob-003.json` | **edit** | data migrated strings → objects (2 steps, 6 roles). |
| `src/lib/wiki.test.ts` | **edit** | tests for the three helpers. |

## Verification

- `npm run typecheck` clean; `npm test` → **24/24** (3 new).
- Read layer: `getProcess` returns structured `rawJson` and bridged display
  strings.
- App: transitions render (14 labels), flow diagram has 16 edges, **RACI matrix
  renders 44 badges** (R/A/C/I) across 5 roles × 8 steps; no errors.

## Scope note

Display-side `split("|")`/`split(":")` is intentionally retained — it parses the
bridge's generated, schema-valid strings (safe). Removing it everywhere (scope
B) is a low-value, higher-risk follow-up.

---

# PR #9 — Runtime state above the wiki (R9)

**Branch:** `refactor/runtime-state-above-wiki-r9` → `main` · **Date:**
2026-06-04 · **Type:** Code + tests + docs.

## Why this PR exists

The Karpathy guardrail: the wiki holds only durable process knowledge. But
runtime/derived state — the foundational-run cursor (`reviewState`), the `lint`
report, `findingDismissals` — lived **inside** `wiki/processes/cob-003.json`,
co-mingled with the documented process. This is the project's sacred guardrail,
and it was violated.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/runtime-store.ts` | **new** | The runtime layer above the wiki: `getRuntime`/`writeRuntime` over `data/runtime/<slug>.json` (gitignored — transient, per-environment). |
| `src/lib/wiki.ts` | **edit** | `getProcess` reads `reviewState`/`lint`/`findingDismissals` from the runtime store, not the process JSON. |
| `src/lib/claude-mcp-server.ts`, `src/lib/gemini-worker.ts` | **edit** | `applyLint` writes the report to the runtime store + `delete doc.lint` (guardrail); the element re-opens still mutate the wiki JSON. |
| `src/app/api/findings/route.ts` | **edit** | dismissals read/written via the runtime store. |
| `wiki/processes/cob-003.json` | **edit** | `reviewState` + `lint` removed (moved to `data/runtime/cob-003.json`, local/gitignored). |
| `src/lib/runtime-store.test.ts` | **new** | round-trip + merge tests. |

## Verification

- `npm run typecheck` clean; `npm test` → **26/26** (2 new).
- Guardrail: `cob-003.json` now has **zero** runtime keys; the runtime store holds them.
- App: the welcome screen still shows **Resume Foundational Run** (reviewState) and lint findings — now sourced from the runtime store; no errors.

## Note

There's no active `reviewState` *writer* in the current tools (it's seeded/read
state); a future foundational-run cursor writer would write to the runtime
store. The `ORCHESTRATOR-PLAN.md` doc + the read-only orchestrator that consumes
this state remain **R10** (optional).

---

# PR #10 — Delete a process, in-app (R11)

**Branch:** `feat/delete-process-r11` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs.

## Why this PR exists

There was no in-app way to delete a process — orphaned `<slug>.json` +
`raw-sources/` had to be removed by hand.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/app/api/processes/[slug]/route.ts` | **new** | `DELETE` (admin-only) — removes the wiki JSON, `raw-sources/<slug>/`, the runtime store, and `.sessions.json` entries for the slug. |
| `src/components/SettingsPanel.tsx` | **new** | Per-process Settings: process facts + a Danger Zone with a slug-typed confirm. |
| `src/app/ProcessDocScreen.tsx` | **edit** | Admin-only ⚙ top-bar button → `__settings` view; on delete, return to the welcome screen + refresh. |
| `src/app/globals.css` | **edit** | Settings / Danger-Zone styles (design tokens; `--lo` for danger). |

## Verification

- `npm run typecheck` clean; `npm test` → 26/26 (unchanged).
- **API (throwaway process):** admin `DELETE` returned 200 and removed the wiki JSON, `raw-sources/`, runtime file, and the `.sessions.json` entry; 404 for a missing slug; admin-gated (401/403).
- **UI:** the ⚙ button shows the Settings panel with facts + Danger Zone; the Delete button arms **only** when the exact slug is typed, and disarms on reset. No real process deleted; no errors.

---

# PR #11 — Quick wins: applyLint bug + chat overlay + clickable chat refs

**Branch:** `fix/quick-wins-r13-r14` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs.

## What this PR adds / changes

A bundle of three small, high-confidence fixes:

| Item | File | Summary |
|---|---|---|
| **applyLint bug (A4)** | `src/lib/claude-mcp-server.ts` | The MCP `applyLint` re-opened implicated elements via `meta.status === "approved"`, but approval lives in `meta.approval` — so it **never fired**. Now mirrors the Gemini path (`meta.approval` → `in-progress` + `run-lint` stamp). |
| **Chat overlay (R14a)** | `src/app/globals.css` | The expanded chat panel now **floats** over the canvas (`position:absolute`; the grid keeps the 56px rail column) instead of taking a column and narrowing the document. |
| **Clickable chat refs (R14b)** | `src/components/AgentChat.tsx`, `src/app/ProcessDocScreen.tsx`, `globals.css` | Element-id refs in chat are clickable → `goToElement` (threaded `onRefClick` through the linkify chain; `cursor:pointer`). |

## Deferred (not in this bundle)

- **R13** (shared-helper dedup) — a broad multi-file refactor; better as its own PR.
- **R14c** (`runSourcing` via `handleSend`) — verify-then-decide; the progress banner works today.

## Verification

- `npm run typecheck` clean; `npm test` → 26/26 (unchanged).
- App: opening the chat no longer reflows the canvas (canvas width identical open vs closed; panel `position:absolute`); the **Danger Zone is fully visible** (was obscured before). No server/console errors. (`applyLint` fix verified by mirroring the correct Gemini path; chat-ref click wired + `cursor:pointer`.)

---

# PR #12 — Editable Overview (R12a)

**Branch:** `feat/overview-edit-summaries-r12` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs.

## Why this PR exists

The process **Overview** was read-only — facts like trigger / scope / I-O and
the Purpose couldn't be edited in-app. (R12 also bundles 8 section-summary
widgets; those are deferred — see below.)

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/components/OverviewPanel.tsx` | **edit** | An **Edit** mode: a Purpose textarea + inputs for the 7 fact fields (processOwner, trigger, frequency, scopeIn/Out, processInput/Output), saved via `updateElement(slug, processId, { content })`; Save / Cancel. |
| `src/lib/wiki-write.ts` | **edit** | `updateElement`'s root (overview) branch re-opens approval on a content edit (`approved → in-progress`), consistent with elements. |
| `src/app/globals.css` | **edit** | Edit-form styles (design tokens). |

## Deferred

- **R12b** — the 8 bespoke section-summary widgets (matrix/heatmap/severity). A sizeable presentational build; its own PR.

## Verification

- `npm run typecheck` clean; `npm test` → 26/26 (unchanged).
- **Save (throwaway):** `updateElement` content edit persisted the fields **and** reset approval `approved → in-progress`.
- **UI:** the Edit button opens the form (Purpose textarea + 7 fact inputs); Save / Cancel present; Cancel reverts to the read view. No real process edited; no errors.

---

# PR #13 — Contributors + per-edit attribution (R5)

**Branch:** `feat/contributors-activity-r5` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs.

## Why this PR exists

There was no per-edit attribution (`updatedBy`/`updatedAt`) and no way to see who
did what on a process.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/wiki-write.ts` | **edit** | `updateElement` stamps `updatedBy`/`updatedAt` (stable username) on every content edit. |
| `src/lib/wiki.ts` | **edit** | `getProcess` resolves `updatedBy` → display name. |
| `src/components/ContributorsView.tsx` | **new** | Per-process roster + activity feed built off the loaded `ProcessDoc`: approvals (approved / rejected / **re-opened**), edits, comments + resolutions, uploads. Per-person filter, clickable element targets, "show more" paging. |
| `src/app/ProcessDocScreen.tsx` | **edit** | People top-bar icon → `__contributors` view. |
| `src/app/globals.css` | **edit** | Contributors / roster / feed styles. |

## Scope

Per-process (uses the loaded doc). Deferred: lint resolved/dismissed events and a global cross-process feed.

## Verification

- `npm run typecheck` clean; `npm test` → 26/26 (unchanged).
- App: on `cob-003` the view shows **2 contributors** (run-lint, M. Berger) and a **6-event feed** with correct verbs (caught + fixed a labelling bug — a lint-re-opened element was showing "approved"; now reads the *current* approval state → "re-opened"). Per-person filter + clickable targets work; no errors.

---

# PR #14 — Cleanup: asList dedup (R13) + runSourcing via handleSend (R14c)

**Branch:** `fix/dedup-runsourcing-r13-r14c` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs.

## What this PR adds / changes

| Item | Files | Summary |
|---|---|---|
| **R13** | `src/lib/meta.ts` (new) + 8 consumers | Extracted `asList` (copy-pasted **identically into 8 files**) and `str` into a shared, dependency-free `meta.ts`; repointed all 8 `asList` consumers (ElementCard, ProcessFlow, RaciMatrix, TargetSynthesis, ControlsInTarget, print/PrintElement, lib/coverage, lib/relations). |
| **R14c** | `src/app/ProcessDocScreen.tsx` | `runSourcing` routes through `handleSend` (the chat pipeline) instead of a raw `fetch` + manual SSE — the run shows in the transcript with the active-skill chip + watchdog, opens the chat, keeps the section "running" indicator (cleared by `handleSend`'s `onComplete`), and refreshes the doc on completion. Deletes ~70 lines of duplicated SSE handling. |

## Scope

`linkify` / `SectionSummary` (the other R13 candidates) are component-specific and left as-is — low value to share.

## Verification

- `npm run typecheck` clean; `npm test` → 26/26 (unchanged).
- **R13:** the shared `asList`'s consumers render — RaciMatrix (21 badges), ProcessFlow (17 paths), 6 element cards; no errors. No local `asList` defs remain.
- **R14c:** typecheck-clean swap to the proven `handleSend` pipeline (`onComplete` fires in a `finally`, so the indicator clears on done **and** error). Not triggered live to avoid an LLM run.

---

# PR #15 — Section summary strips (R12b)

**Branch:** `feat/section-summaries-r12b` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs.

## Why this PR exists

Finishes R12: sections showed raw cards with no at-a-glance roll-up.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/components/SectionSummary.tsx` | **new** | One **config-driven** summary strip above a section's cards: item count + a breakdown by the section's key enum field (exceptions→impact, pain-points/audit-findings/control-gaps→severity, controls→controlType, process-gaps→gapStatus, …), with severity-toned chips. |
| `src/app/ProcessDocScreen.tsx` | **edit** | Renders `SectionSummary` alongside the existing bespoke widgets (it returns null for roles/process-steps/to-be-design and for empty breakdowns). |
| `src/app/globals.css` | **edit** | Summary-strip + chip styles (design tokens; severity tones). |

## Design note

A single unified component rather than 8 hand-crafted matrix/heatmap widgets — consistent, maintainable, and it's the `SectionSummary` the R13 dedup referenced.

## Verification

- `npm run typecheck` clean; `npm test` → 26/26 (unchanged).
- App: **Controls** "5 items · Type · PREVENTIVE 5"; **Process Gaps** "3 items · Status · open 3". Exceptions gracefully shows nothing (its migrated `impact` field holds prose, not the enum — a data-quality matter). No errors.

---

# PR #16 — Country-variations element type (R15)

**Branch:** `feat/country-variations-r15` → `main` · **Date:** 2026-06-04 ·
**Type:** Schema + code + docs.

## Why this PR exists

Product decision **R15 = yes**: jurisdictional differences should be captured as
first-class elements, not buried in prose.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `schema/process-schema.json` (custom) | **edit** | New `country-variation` element type (idPrefix `CV`; field `country`; `affects → process-step`; template **What differs / Why it differs / Impact**) + a **Country Variations** section in the As-Is area. |
| `src/lib/schema/process-schema.json` (AJV) | **edit** | `CountryVariation` definition + the `country-variations` collection. |
| `src/components/SectionSummary.tsx` | **edit** | Per-country breakdown for the new section. |

The UI is otherwise free — the section nav, ElementCard, and add-entry flow are all schema-driven.

## Verification

- Both schema files valid JSON; **drift-guard parity holds** (`country-variation` ↔ `CountryVariation`). `npm run typecheck` clean; `npm test` → 26/26 (drift-guard green).
- App: **Country Variations** appears in the As-Is nav (count 0) and renders its header + description + **Add entry** CTA. No errors.

---

# PR #17 — Per-process access control (R16)

**Branch:** `feat/process-access-r16` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs.

## Why this PR exists

Product decision **R16 = yes**: every authenticated user saw every process;
sensitive processes need per-user need-to-know access.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/process-access.ts` | **new** | The access store (`data/process-access.json`, gitignored — authz config, never in the wiki). `canAccess`, `setOwner`/`grant`/`revoke`/`ungovern`. A process is **ungoverned** (open to all) until an admin sets an **owner**; then only owner + grantees + admins see it. |
| `src/app/page.tsx` | **edit** | Filters the process list by `canAccess(sessionUser, slug)` **server-side** — inaccessible processes never reach the browser. |
| `src/app/AuthGate.tsx` | **edit** | `router.refresh()` on login/logout so the list re-filters for the new identity. |
| `src/app/api/processes/[slug]/access/route.ts` | **new** | GET state + POST `set-owner`/`ungovern` (admin) / `grant`/`revoke` (owner-or-admin). |
| `src/app/api/users/roster/route.ts` | **new** | username+name roster for the grant picker. |
| `src/components/SettingsPanel.tsx` | **edit** | An **Access** section: restrict to an owner, share/revoke users, make-open. |
| delete route | **edit** | cleans the access record on delete. |

## Where it lives / guardrail

Authz config sits in `data/` (gitignored, per-deployment) alongside `users.json` — **never in the wiki**, consistent with R9.

## Verification

- `canAccess` correct across owner / granted / other / admin × governed / ungoverned (unit-checked).
- App (admin): the Settings **Access** section renders; the full **restrict → share → make-open** round-trip works; the roster loads. No errors. `npm run typecheck` clean; `npm test` → 26/26.

---

# PR #18 — Read-only orchestrator layer (R10)

**Branch:** `feat/orchestrator-read-layer-r10` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + tests + docs.

## Why this PR exists

Roadmap **R10**. The migration dropped `src/lib/orchestrator.ts`
(`buildOrchestratorState` + `buildAttentionFeed`, source commit `947ee0d`) and
its 13 tests. The attention-weight formula (`conflicts*100 + lint*5 + comments`)
survived only **inlined and untyped** inside `WelcomeScreen.tsx`, with no test
guarding it and no shared home for the routing logic any future consumer (chat
router, an ArchitectMiner attention surface) could reuse.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/orchestrator.ts` | **new** | The canonical read layer over `ProcessDoc`. `buildOrchestratorState(doc)` → ranked typed `ActionSpec[]` (four kinds: resolve-ingest-conflict / resume-foundational-run / resolve-lint-finding / address-comment) + `OrchestratorHealth`. `buildAttentionFeed(docs)` → `{ attentionRows, cleanProcesses }` for the dashboard. Pure data — no LLM, no writes, no wiki sidecars. Weight constants locked in one place. |
| `src/lib/orchestrator.test.ts` | **new** | 13 tests — weight ordering, dismissed/resolved exclusion, done-run not resumable, **byte-identical legacy reasons phrasing + formula** so the dashboard order can't silently drift. |
| `src/components/WelcomeScreen.tsx` | **edit** | Deleted the inline `pmAttentionForDoc`; `pmAttention` now maps `buildAttentionFeed(docs).attentionRows`. Dropped the now-unused `isOpen` import. |
| `package.json` | **edit** | Wired `orchestrator.test.ts` into the `test` script. |

## Design notes / scope

- The original took a `ProcessView` second arg (it was unused — `_view`) tied to
  `process-view.ts` (R18), which doesn't exist on this baseline. Scoped the new
  `buildOrchestratorState` to read straight off `ProcessDoc`; R18 was **not**
  pulled in.
- Runtime inputs (open lint findings, the run cursor) are read off the
  **hydrated** `ProcessDoc` — `getProcess` stitches them from the runtime store
  (R9), so this layer never touches `data/runtime/` and never reads runtime
  state back out of the wiki JSON. Pairs cleanly with R9 as its consumer.

## Verification

- `npm run typecheck` clean. `npm test` → **39/39** (26 prior + 13 new).
- App (admin): the welcome dashboard renders an identical attention row —
  `COB-003 · 89 quality findings` — sourced live through the new
  `buildAttentionFeed` path off the R9 runtime store. No console errors.

---

# PR #19 — Live architect chat via shared `useAgentChat` (R1)

**Branch:** `feat/architect-chat-r1` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs. First PR of **Theme A — ArchitectMiner (R1–R4)**.

## Why this PR exists

Roadmap **R1**. ArchitectMiner had **no agent interaction**: the canvas chat
was `onSend={() => {}}` and every "+ Add X" / "Elicit with architect" button
was an inert `<button>`. The working SME chat pipeline was inlined in
`ProcessDocScreen.tsx` and never extracted, so the architect side couldn't
reuse it — the functional heart of the workspace was dead.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/agent-chat.ts` | **new** | Provider-agnostic core, no React: the `runSession` fetch+SSE driver, per-skill ETA history, the long-turn browser notification, and the sessionStorage transcript codec (namespaced per canvas via a `prefix`). |
| `src/components/useAgentChat.ts` | **new** | The React hook composing that core — `messages`, the live turn (pending / activity / sub-agent tasks / active skill), the claude session id, the stuck-turn watchdog, per-process persistence, and `send` / `stop` / `restart`. |
| `src/components/ArchitectureCanvas.tsx` | **edit** | Chat wired to the hook under its own `"am"` storage namespace + an architect scope preamble. All 7 view pairs of **Add / Elicit** buttons seed a scoped turn with the right specialist (`domain-architect` for ADRs / capabilities / applications; `solution-architect` for integrations / components / NFRs / migration). "Cross-check traces" sends a traceability sweep. A real `getRef` resolves element-id hovercards. |
| `src/app/ProcessDocScreen.tsx` | **edit** | `handleSend` delegates to the shared `runSession`; the ETA / notify / storage helpers are imported, not duplicated. **State shape and all 13 call sites unchanged** — pure dedup. |

## Scope / risk

- The SME canvas is the working core product, so its **stateful shell was left
  intact** — only `handleSend`'s internals (the SSE loop) and the helper
  definitions changed. The 87 chat references across the screen are untouched.
- No real chat turn was fired against `cob-003` in verification (it would
  invoke the CLI against real process data). The wiring is verified by render +
  typecheck + tests.

## Dependency

Unblocks **R2** (the `domain-architect` / `solution-architect` specialists the
Elicit buttons invoke) and the rest of Theme A.

## Verification

- `npm run typecheck` clean. `npm test` → **39/39**.
- SME canvas (`?p=cob-003`) renders and its chat is intact after the refactor.
- ArchitectMiner canvas chat is **live** — "Message the architect…" textarea,
  wired Add/Elicit buttons, "Cross-check traces across all views" — with **zero
  console errors** on both canvases.

---

# PR #20 — Domain + solution architect specialists (R2)

**Branch:** `feat/architect-specialists-r2` → `main` · **Date:** 2026-06-04 ·
**Type:** Skills + docs. Second PR of **Theme A — ArchitectMiner (R1–R4)**.

## Why this PR exists

Roadmap **R2**. R1 made the architect canvas chat live and wired the "Elicit
with domain / solution architect" buttons — but the specialists they invoke
didn't exist. There was no architect authoring intelligence.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `.claude/skills/domain-architect/SKILL.md` | **new** | The business-architecture specialist — owns **capability**, **target-application**, **adr**. Derives capabilities from the target process + requirements, decides the application landscape (build / buy / configure / keep), records ADRs with alternatives + consequences, and wires the relations (`hostedIn`, `realisesStep`, `resolvesGap`, `decision`, `satisfiesControl`, `drivenByADR`). |
| `.claude/skills/solution-architect/SKILL.md` | **new** | The technical-architecture specialist — owns **target-integration**, **component**, **nfr**, **migration-phase**. Connects applications, decomposes them, sets measurable NFRs, and sequences the migration; wires `from`/`to`, `inApp`, `appliesTo`, `delivers`, etc. |
| `SKILLS.md` | **edit** | Adds both to the specialist list + table; rewrites the "not yet present" ArchitectMiner note to describe the shipped specialists. |
| `CLAUDE.md` | **edit** | Two new rows in the skills routing table. |
| `src/app/ProcessDocScreen.tsx` | **edit** | Adds `domain-architect` / `solution-architect` to `SKILL_LABEL` (friendly active-skill chip). |

## Design notes

- **No schema work.** All 7 target-architecture element types already exist in
  both schema representations (`capability`, `target-application`, `adr`,
  `target-integration`, `component`, `nfr`, `migration-phase`) with their
  sections, id prefixes, required frontmatter and relations — and the schema
  already names `domain-architect` / `solution-architect` as their specialists.
  The drift-guard is untouched.
- **JSON-native style.** Authored against `CORE_SYSTEM_PROMPT.md` —
  `createElement` / `updateElement` / `expandElement`, Y/E/R, per-heading
  provenance, the approval gate. No Python / `verbatim.py` references (the
  legacy specialists still carry those; the new ones don't).
- Both are framed as **downstream synthesis**: they read the documented target
  process, requirements, gaps, controls, regulation and systems as inputs and
  never author upstream elements ("stay in your lane").

## Verification

- Both skills are auto-discovered (appear in the available-skills list) with
  valid frontmatter (`name` matches dir).
- `npm run typecheck` clean. `npm test` → **39/39**.
- The R1 "Elicit with domain / solution architect" buttons now resolve to real
  specialists. (No live CLI turn fired against real process data.)

---

# PR (planned, not yet opened) — Recover docs & standalone artifacts (R20–R22)

> Pre-logged as #19 but never opened on GitHub; the ArchitectMiner R1 PR took
> the real #19. Its work is still staged locally on `feat/docs-artifacts-r20-r22`
> and will take a later number when opened. Writeup kept below as-is.

**Branch:** `feat/docs-artifacts-r20-r22` → `main` · **Date:** 2026-06-04
· **Type:** Docs / standalone artifacts only — **no application code changes.**

## Why this PR exists

Roadmap **Theme H (R20–R22)** — three clusters of standalone artifacts dropped
in the JSON-native migration. None is imported by `src/`; all were fully
recoverable from their source commits. Restored together because R22's
screenshot helpers exist to feed R20's deck, and R21 is the matching planning-doc
set authored in the same era.

## What this PR adds / changes

| Req | Files | Source | Summary |
|---|---|---|---|
| **R20** | `pm-pdf.mjs`, `pm-shot-competitor.mjs`, `public/onepager.html`, `public/onepager-deck.html`, `public/onepager-deck.pdf`, `public/onepager-slide{,-2,-3,-4}.html`, `public/onepager-assets/*.png` (5 screenshots + 5 slide renders) | `b858dff` | The finished 4-slide product deck, its print-ready PDF, and the CDP PDF-export helper, restored verbatim. |
| **R21** | `ROADMAP.md`, `AI-GOVERNANCE-ROADMAP.md`, `AI-GOVERNANCE-CHANGESET.md` + byte-identical `public/` copies + `public/{roadmap,ai-governance-roadmap,ai-governance-changeset}.html` renders | `1e347a6` | Phase-2 product roadmap + AI-governance roadmap & changeset. Changeset included as-is with a banner noting it targets the pre-rewrite codebase. |
| **R22** | `pm-shot.mjs`, `pm-shot-architect.mjs` | `7899697` | CDP screenshot helpers that mint a local signed `pm_session` cookie to drive headless Chrome through the authenticated app. |

## Design notes / scope

- **Restore-as-is, by decision.** Screenshots, the v0.x deck framing, and the
  pm-shot/-architect UI selectors all predate the JSON-native rewrite.
  Regenerating them (re-pointing the helpers at the current UI, rebuilding the
  PDF) is left as a follow-up — noted on the R20/R22 roadmap entries.
- **Changeset banner.** `AI-GOVERNANCE-CHANGESET.md` (root + `public/` copy)
  gets a one-block note that its diffs target the old codebase and are reference
  only — it must not be applied literally against the current tree.
- **No app impact.** Everything lands under `public/` or as root `.mjs` dev
  tooling; nothing in `src/` references these files, so typecheck/test surface
  is unchanged.

## Verification

- File-level: all 30 artifacts restored from their source commits; `git status`
  shows them as additions only.
- No `src/` imports touch the restored files (standalone `public/` assets + root
  scripts), so `npm run typecheck` / `npm test` are unaffected.

---

# PR #21 — Flag dangling relation targets in the element card (R17)

**Branch:** `fix/dangling-relation-chips-r17` → `main` · **Date:** 2026-06-04
· **Type:** Code + docs.

## Why this PR exists

Roadmap **R17** ("broken-relation visibility"). Verified the gap was real
first: `buildRelations` (`src/lib/relations.ts`) renders forward/reverse
relation chips straight from each element's schema relations but never checks
the target id resolves. The only deterministic dangling-ref check
(`src/lib/coverage.ts`) covers **only** `transformation-decision.resolves` /
`.realises`, so every other relation (control→step, regulation→control,
country-variation→affects, role→systems/controls, system integrations, …)
rendered a chip that silently no-op'd on click. `lint.ts` is just data shapes —
the real lint pass is the LLM `run-lint` skill (non-deterministic).

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/components/ElementCard.tsx` | **edit** | A dangling branch in the relation-chip render: when `getRef` resolves no element, emit a non-navigable `<span class="link-chip link-chip-dangling">⟨id⟩ not found</span>` instead of a clickable chip. Auto-covers all generic relations (the chip list comes from `buildRelations`). |
| `src/app/globals.css` | **edit** | `.link-chip-dangling` styling — `--lo`/`--lo-bg` error palette, `cursor: help`. |
| `REQUIREMENTS-ROADMAP.md` | **edit** | R17 marked ✅ FIXED. |

## Verification

- `npm run typecheck` clean (against current `main`, incl. R1).
- Live on `cob-003`: **297 valid relation chips unchanged + navigable** (no
  regression); the dangling markup computes to the `--lo`/`--lo-bg` error tokens
  and renders as a non-button `<span>`. *(Transitions + RACI step refs share the
  same `getRef` pattern and have their own write-time validators — left as a
  possible extension.)*

---

# PR #22 — Recover docs & standalone artifacts (R20–R22)

**Branch:** `feat/docs-artifacts-r20-r22` → `main` · **Date:** 2026-06-04
· **Type:** Docs / standalone artifacts only — **no application code changes.**

## Why this PR exists

Roadmap **Theme H (R20–R22)** — three clusters of standalone artifacts dropped
in the JSON-native migration. None is imported by `src/`; all were fully
recoverable from their source commits.

## What this PR adds / changes

| Req | Files | Source |
|---|---|---|
| **R20** | `pm-pdf.mjs`, `pm-shot-competitor.mjs`, the full `public/onepager*` set (4 HTML slides, `onepager-deck.html`/`.pdf`, 5 screenshots) | `b858dff` |
| **R21** | `ROADMAP.md`, `AI-GOVERNANCE-ROADMAP.md`, `AI-GOVERNANCE-CHANGESET.md` + byte-identical `public/` copies + HTML renders | `1e347a6` |
| **R22** | `pm-shot.mjs`, `pm-shot-architect.mjs` | `7899697` |

## Design notes / scope

- **Restore-as-is, by decision.** Pre-rewrite screenshots, v0.x deck framing,
  and old-UI `pm-shot` selectors are left intact; refreshing them is a follow-up.
- `AI-GOVERNANCE-CHANGESET.md` (root + `public/` copy) carries a banner flagging
  it targets the pre-rewrite codebase — reference only.
- No `src/` imports touch the restored files, so typecheck/test are unaffected.
- Built in an isolated git worktree off `main`, concurrent with the R1/R2
  ArchitectMiner work, to avoid colliding in the shared working tree.

---

# PR #23 — Refresh roadmap status header

**Branch:** `docs/roadmap-status-refresh` → `main` · **Date:** 2026-06-04 ·
**Type:** Docs only. Parallel track (roadmap bookkeeping).

## Why this PR exists

`REQUIREMENTS-ROADMAP.md`'s top-of-file status header had gone stale as PRs
landed. This refreshes it to record R10, R1, R2, R17 and R20–R22 as delivered.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `REQUIREMENTS-ROADMAP.md` | **edit** | Status header updated to mark the then-delivered set (R10 / R1 / R2 / R17 / R20–R22). No app code. |

## Verification

- Docs only — `npm run typecheck` / `npm test` unaffected.

---

# PR #24 — Diagram + Traceability real-data wiring (R3)

**Branch:** `feat/architect-diagram-traceability-r3` → `main` · **Date:**
2026-06-04 · **Type:** Code + tests + docs. Third PR of **Theme A (R1–R4)**.
(Cut before #21–#23 landed; merged `main` in — the previously-staged docs/
artifacts pile is now on `main` via #22.)

## Why this PR exists

Roadmap **R3**. The ArchitectMiner Diagram was a hardcoded SVG (channels, named
systems, fixed edges) and Traceability showed a hardcoded "63 elements · 87% ·
illustrative" stat — neither derived from `doc.elements`. The two headline
architect analysis views were decorative mockups.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/architecture-view.ts` | **new** | Pure derivations: `relIds` (normalises a relation field to an id list), `buildDiagramModel` (positions capabilities + applications in two lanes, draws `hostedIn` capability→app edges and `from`/`to` app→app integration edges styled by pattern), `buildTraceability` (classifies every architecture element **traced / partial / orphan** by whether its relations connect it). No React, no I/O. |
| `src/lib/architecture-view.test.ts` | **new** | 9 tests — relation normalisation, diagram edges (incl. dropping a `hostedIn` to an unknown app), and the traceability classifier across all 7 element types. |
| `src/components/ArchitectureCanvas.tsx` | **edit** | Diagram + Traceability render from the model (with empty states); the left-nav section counts and the Traceability % are real. The mock SVG, mock capability detail aside, "63 / illustrative" stat and fabricated trace rows are gone (net −332 lines). |
| `package.json` | **edit** | Wires `architecture-view.test.ts` into `npm test`. |

## Scope notes

- cob-003 has **zero** authored architecture elements, so both views correctly
  read **empty** — the honest state. They populate as the architect authors via
  R1 + R2; the derivation logic is proven by the unit tests.
- **Out of scope (flagged):** the seven section *detail* views (Capabilities,
  Target Applications, ADRs, Integrations, Components, NFRs, Migration) are still
  illustrative mock. Wiring them is a follow-up beyond R3's scope.

## Verification

- `npm run typecheck` clean. `npm test` → **48/48** (39 prior + 9 new).
- AM canvas: left-nav counts real (all 0 for cob-003); Diagram shows "derived
  from 0 capabilities · 0 applications · 0 integrations" + empty state (mock SVG
  gone); Traceability shows "derived from 0 architecture elements" + empty state
  (mock rows gone). Zero console errors; screenshot verified.

---

# PR #25 — Extract RACI-pivot + flow-lane joins into process-view (R18)

**Branch:** `feat/process-view-r18` → `main` · **Date:** 2026-06-04 · **Type:**
Code + tests. Parallel track (developed concurrently with the ArchitectMiner R3/R4 work).

## Why this PR exists

Roadmap **R18** — the "verify-then-decide" view-layer item. The RACI pivot and
flow-lane joins were computed inline in components; this extracts them into a
dedicated `process-view` join layer (`src/lib/process-view.ts`) so the shape is
computed once, tested, and reusable.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/process-view.ts` | **new** | The RACI-pivot + flow-lane join layer over a `ProcessDoc`. |
| `src/lib/process-view.test.ts` | **new** | Unit tests for the joins. |
| consumers | **edit** | Components read the precomputed view instead of joining inline. |

## Verification

- `npm run typecheck` clean; `npm test` green (added `process-view.test.ts`).
- Opened in an isolated git worktree off `main` concurrent with R3/R4, which is
  why its PR number (#25) interleaves the ArchitectMiner sequence.

---

# PR #26 — Personal + Library tiers from real data (R4)

**Branch:** `feat/architect-personal-library-r4` → `main` · **Date:**
2026-06-04 · **Type:** Code + tests + docs. **Final PR of Theme A (R1–R4).**

## Why this PR exists

Roadmap **R4**. `PersonalViews.tsx` and `LibraryViews.tsx` were **entirely
mock** — a fabricated 9-process portfolio, a 23-ADR queue, a Gantt of invented
migration phases, a 47-capability catalog with fake reuse, a 28-app register,
22 NFR "templates" and 14 patterns. The cross-process-intelligence pitch
rendered fiction.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/architect-portfolio.ts` | **new** | Pure cross-process aggregation over every `ProcessDoc`: `collectArchitecture` (flatten + tag every architecture element with its process), `processPortfolio` (per-process counts + derived stage), `capabilityCatalog` (grouped by name, **cross-process reuse** = distinct processes sharing a capability), `applicationRegister`, `nfrCatalog`, `adrQueue`, `migrationPlan`. |
| `src/lib/architect-portfolio.test.ts` | **new** | 6 tests — flatten/tag, per-process stage, cross-process reuse counting, verdict/category normalisation, empty portfolio. |
| `src/components/PersonalViews.tsx` | **rewrite** | `AllProcesses` / `MyAdrs` (→ "Architecture decisions") / `MigrationPlans` now take `docs` and render real aggregates with empty states. The fabricated Gantt SVG and resource-alert are gone. |
| `src/components/LibraryViews.tsx` | **rewrite** | `CapabilityCatalog` (real reuse), `ApplicationRegister`, `NfrTemplates` (→ "NFR catalog") take `docs`. `PatternLibrary` shows an honest empty state — patterns aren't a tracked element type, so there's nothing to aggregate. |
| `src/components/HandoffInbox.tsx` | **edit** | Passes `docs` to all six data views; the Library / Personal **sidebar badge counts** are real (`archCounts`), not hardcoded. |
| `package.json` | **edit** | Wires `architect-portfolio.test.ts` into `npm test`. |

## Scope notes

- Like R3, the portfolio reads **thin/empty** today — only 3 processes exist and
  none has architecture authored — so every tier shows honest counts (0 / "none
  yet") and empty states. The aggregation (incl. cross-process reuse) is proven
  by the unit tests. It populates as processes are architected via R1 + R2.
- `PatternLibrary` has no schema backing; rather than fabricate, it states so.

## Verification

- `npm run typecheck` clean. `npm test` → **54/54** (48 prior + 6 new).
- AM Handoff inbox: sidebar counts real (All processes **3**, everything else
  **0**, Pattern library **—**); "All processes" lists the 3 real processes
  (all UPSTREAM, "none yet"); Capability catalog / ADRs / etc. show real empty
  states. The mock portfolios are gone. Zero console errors; screenshot verified.

---

# PR #27 — Record R3/R4/R18 delivered + R19 relevance assessment

**Branch:** `docs/roadmap-r18-r19` → `main` · **Date:** 2026-06-04 · **Type:**
Docs only. Parallel track (roadmap bookkeeping).

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `REQUIREMENTS-ROADMAP.md` | **edit** | Marks R3, R4 and R18 delivered, and adds a relevance assessment for R19 (slim per-type schema slices). |

## Verification

- Docs only — typecheck / test unaffected.

---

# PR #28 — Reconcile per-requirement status against all merged PRs

**Branch:** `docs/roadmap-reconcile` → `main` · **Date:** 2026-06-04 · **Type:**
Docs only. Parallel track.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `REQUIREMENTS-ROADMAP.md` | **edit** | Sweeps every requirement (R1–R22) and reconciles its status line against what actually merged, so the roadmap matches the PR log. |

## Verification

- Docs only — typecheck / test unaffected.

---

# PR #29 — Add an Open items section near the top of the roadmap

**Branch:** `docs/roadmap-open-items` → `main` · **Date:** 2026-06-04 · **Type:**
Docs only. Parallel track.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `REQUIREMENTS-ROADMAP.md` | **edit** | Adds an at-a-glance "Open items" section near the top so the remaining optional follow-ups are visible without reading the whole doc. |

## Verification

- Docs only — typecheck / test unaffected.

---

# PR #30 — Architect section detail views from real elements

**Branch:** `feat/architect-section-detail-views` → `main` · **Date:**
2026-06-04 · **Type:** Code. Follow-up to Theme A (beyond R1–R4).

## Why this PR exists

After R3 (Diagram + Traceability) and R4 (Personal + Library), the **seven
ArchitectMiner section *detail* views** — Capabilities, Target Applications,
ADRs, Integrations, Components, NFRs, Migration — were still the only
illustrative mock left: hardcoded `CAP-{pid}-002` cards, a 5-row mock ADR list,
an invented integration table, etc. This was the last fabricated surface in the
module.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/components/ArchitectureCanvas.tsx` | **edit** | One shared renderer (`archSectionMain` + a module-level `ArchElementCard`) replaces all seven bespoke mock blocks. Each view now renders the real `doc.elements` for its section as Processminer-style cards (id, status, type, key frontmatter as pills, the template blocks via `Markdown`), with the real element count, the Add / Elicit buttons (seeding the right specialist), and an empty state. The top-bar breadcrumbs drop their fabricated element ids. All the dead mock data + helper components (`adrs`/`openAdr`, `IntegrationRow`, `ComponentCard`, `NfrRow`, `CapCard`, `pid`) are removed. |

Net **−1,185 lines** in the canvas — the file shrank from ~2,100 to ~1,000 lines.

## Scope notes

- cob-003 has no authored architecture elements, so every section reads
  **empty** — the honest state — and populates as the architect authors via the
  R1/R2 chat. The rendering reuses the proven `inputs`-view element-card pattern.
- The R3 Diagram + Traceability and the `inputs` views are untouched.

## Verification

- `npm run typecheck` clean. `npm test` → **64/64** (unchanged — pure UI).
- AM canvas: Capabilities / ADRs / Migration (spot-checked) each render the real
  header ("0 elements · authored here"), the right Add/Elicit buttons, and the
  empty state; every mock id (`CAP-COB-003-002`, `Case capture & validation`,
  `MIG-…`, the Quantexa rows) is gone. Zero console errors; screenshot verified.

---

# PR #31 — Reference all of today's PRs in the PR log + roadmap

**Branch:** `docs/pr-log-reference-all-today` → `main` · **Date:** 2026-06-04 ·
**Type:** Docs only.

Made the PR index complete + accurate for the whole #1–#30 run: fixed branch
names (#23, #25), split the collapsed #27–#29 row into three accurate rows with
their merge SHAs, marked #30 merged, added the missing per-PR sections for #23,
#25, #27, #28, #29, and added #30 + the docs-bookkeeping PRs to the roadmap's
*Delivered (PR #)* line.

---

# PR #32 — Enrich the product ROADMAP with the open backlog items (Phase 0)

**Branch:** `docs/roadmap-enrich-open-items` → `main` · **Date:** 2026-06-04 ·
**Type:** Docs only.

## Why this PR exists

Two roadmap docs coexist: `REQUIREMENTS-ROADMAP.md` (the post-migration backlog,
R1–R22, with its two remaining **Open items**) and `ROADMAP.md` (the
forward-looking product roadmap, ~80 candidates across 7 phases, recovered in
#22). The product roadmap didn't carry the still-open engineering items, so the
two views diverged.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `ROADMAP.md` | **edit** | New **Phase 0 — Foundations & technical debt** section carrying the two open items from `REQUIREMENTS-ROADMAP.md`: (1) the **schema generator** (derive the Draft-07 schema from the custom schema, kill the dual-edit + per-field drift), (2) **R19** slim per-type schema slices. Adds a Phase 0 row to the overview table, a "foundations first" note in the 2026 H1 sequencing, a currency note that the doc predates the JSON-native rewrite (stale `scripts/wiki/*.py` references in later phases), and an enriched footer date. |
| `public/ROADMAP.md` | **edit** | Kept byte-identical to the root copy. |

*(The `public/roadmap.html` render is a separate generated artifact — left for the "refresh the recovered artifacts" follow-up.)*

## Verification

- Docs only — typecheck / test unaffected. Root and `public/ROADMAP.md` verified identical.

---

# PR #33 — Reconcile + reprioritise the product ROADMAP

**Branch:** `docs/roadmap-reprioritise` → `main` · **Date:** 2026-06-04 ·
**Type:** Docs only.

## Why this PR exists

`ROADMAP.md` is dated 2026-05-28 and predates the whole R1–R22 + ArchitectMiner
run, so several of its candidate features had already shipped, and its proposed
2026 H1 P0 set was partly stale. A priority review (verified against the code).

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `ROADMAP.md` | **edit** | (1) A **Status reconciliation (2026-06-04)** banner. (2) **Removed the candidates that fully shipped** during the R1–R22 + ArchitectMiner run — Phase 1 #4 (live progress), #5 (inline edit); Phase 3 #1 (tour), #6 (palette), #10 (notifications), #14 (dark mode) — plus the two subsection headers they orphaned. The **partially**-landed ones stay with a 🟡 tag (Phase 1 #6, #11; Phase 3 #12; Phase 2 #20). Each call verified against the code. (3) A **revised 2026 H1** ("anchor it + make it trustworthy"): schema generator → EPM anchor → two trust quick wins (staleness + consistency widget) → Confluence outbound pulled forward; defers Adonis import + R19. (4) Per-phase + overview candidate counts updated (Phase 1 15→13, Phase 3 15→11), dangling cross-refs fixed. *(An earlier draft added a Phase 0 "content coverage" item; removed on request.)* |
| `public/ROADMAP.md` | **edit** | Kept byte-identical. |

## Verification

- Docs only — typecheck / test unaffected. Each removed/tagged item was checked
  against the codebase (`useAgentChat`, `ElementCard` inline edit, `GuidedTour`,
  `CommandPalette`, `notifyTurnComplete`, `data-theme` toggle, `buildTraceability`,
  orchestrator `ActionKind`). Counts re-derived from the doc; root and
  `public/ROADMAP.md` verified identical.

---

# PR #35 — Purge stale references to the pre-rewrite Markdown-wiki model

**Branch:** `chore/purge-md-wiki-references` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs.

## Why this PR exists

A deep-dive sweep found the data path was fully JSON-native but stale references
to the old per-`.md`-file wiki + `scripts/wiki/*.py` toolkit + separate
sidecars lingered — including one genuine bug.

## What this PR changes

| Tier | Change |
|---|---|
| **Functional bug** | `ProcessDocScreen.tsx` finding-resolution directive told the assistant to run `python3 scripts/wiki/resolve_finding.py` — a **deleted** script (`scripts/wiki/` doesn't exist). Replaced with JSON-native guidance (edit via `updateElement`; the finding clears on the next run-lint / can be dismissed in the Review panel). |
| **Functional bug** | `api/session/route.ts` — the live-progress **element counter** keyed on the deleted `write_element.py` Bash command (never fired for the MCP write path); re-pointed at `createElement`. Removed the six dead Python command matchers in `describeTool`. |
| **Dead code** | `wiki.ts` — removed `parseFrontmatter` / `parseBlocks` / `toPage` (the Markdown-page parsers) and the unused `readJson` subfolder-sidecar helper. All had zero callers (confirmed; typecheck + tests still green). |
| **Deleted file** | `scripts/seed-cob-003.mjs` — wrote the old Markdown/subfolder model (`index.md`, `---frontmatter---`); broken against JSON-native. Only `legacy-docs/` referenced it. |
| **Stale comments / strings** | Refreshed ~20 comments across `wiki.ts`, `lint.ts`, `conformance.ts`, `target-review.ts`, `ElementCard.tsx`, `FindingDismiss.tsx`, `globals.css`, `api/{notes,sources,upload,findings}/route.ts`, and the schema's `_provenanceComment` / `_fieldValuesComment` — the consolidated `<slug>.json` + the R9 runtime store, not separate sidecar files or Python scripts. |

## Scope notes

- `src/legacy/*` (the archived pre-rewrite copies) and the historical
  `scripts/migrate_*` migration scripts are **left as-is** — they're intentional
  history, not imported by the app.

## Verification

- `npm run typecheck` clean. `npm test` → **64/64** (the removed functions were
  truly dead). A final grep sweep confirms **zero** MD-wiki / `scripts/wiki` /
  separate-sidecar references remain in active code.

---

# PR #36 — Register the `writeTargetReview` + `writeSummary` AI tools

**Branch:** `feat/council-summary-tools` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + tests + skills.

## Why this PR exists

A per-skill architecture review found that **two skills called AI tools that
didn't exist** in the JSON-native tool registry (only 6 tools were registered:
`createElement` / `updateElement` / `expandElement` / `checkConformance` /
`checkTransitions` / `applyLint`):
- **`council-review`** called `writeTargetReview({ slug, reviewData })` — absent.
- **`area-summary`** called `writeSummary({ slug, area, summary })` — absent.

`targetReview` and `summaries` are root fields of the process JSON (not element
types), so there was no `createElement`/`updateElement` fallback either — both
features were effectively non-functional when run as an AI session. (The
in-app `saveSummaryPart` / `triageTargetReview` server actions only edit one
existing part/item from the UI; they can't create the object and aren't
AI-callable.)

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/session-writes.ts` | **new** | Pure builders, no I/O / no Next deps: `buildTargetReview(slug, reviewData)` (id-stamps items `R-001…`, marks each `triage: pending`) and `parseSummaryParts(summary)` (splits the memo into its four `## ` headings, errors otherwise). |
| `src/lib/session-writes.test.ts` | **new** | 6 tests (id-stamping, empty/garbage payloads, heading split + the two error cases). |
| `src/lib/claude-mcp-server.ts` | **edit** | Registered + handled both tools (write the root field to `<slug>.json`), mirroring `applyLint`. |
| `src/lib/gemini-worker.ts` | **edit** | Same two tool declarations + handlers in the in-process Gemini path. |
| `.claude/skills/{council-review,area-summary}/SKILL.md` | **edit** | Dropped the vestigial "save it to a temp file first" step — the tools take the data inline. |
| `package.json` | **edit** | Wired `session-writes.test.ts` into `npm test`. |

## Scope notes

- Both providers register all tools with no per-skill allowlist (`claude.json`
  registers only the MCP server; the Gemini worker uses all declarations), so
  the two skills now see the tools.
- The handlers are faithful 3-line wrappers around the unit-tested builders.
  No live AI session was fired against real process data to verify.

## Verification

- `npm run typecheck` clean. `npm test` → **70/70** (64 + 6 new). Both tools
  confirmed registered (definition + handler) in `claude-mcp-server.ts` **and**
  `gemini-worker.ts`.

---


# PR #37 — Purge dead script / legacy-doc pointers from 6 skills

**Branch:** `chore/purge-skill-stale-pointers` → `main` · **Date:** 2026-06-04 ·
**Type:** Skills only. Part 2 of the skill-architecture cleanup.

## Why this PR exists

The per-skill review found six skills still pointing at deleted artifacts — the
content was fine, the pointers were dead.

## What this PR changes

| Skill(s) | Stale pointer | Fix |
|---|---|---|
| `it-architect`, `client-journey-specialist` | "`verbatim.py` is the single source of truth" for the close-out | The close-out block is in the skill itself → "the close-out block above is the single source of truth; never write it from memory." |
| `foundational-run` | "resolve the owning lens with `assumption_owner()` in `wiki_lib.py`" | "the owning lens is the `specialist` the schema assigns to that element's section; do not guess it." |
| `source-cx`, `source-innovation`, `source-regulation` | "identical … (HALLUCINATION-PLAN.md). Do not edit one copy — a drift check fails CI." (the plan doc is archived in `legacy-docs/`; the `check_skill_blocks.py` drift check is deleted) | "keep them in sync by hand … the provenance contract is in `CORE_SYSTEM_PROMPT.md`." |

## Verification

- Skills only — typecheck / test unaffected. A grep sweep confirms **zero**
  `*.py` / `scripts/wiki` / legacy-plan-doc / "drift check fails CI" references
  remain in any skill.

---


# PR #38 — Reference CORE_SYSTEM_PROMPT.md from the 6 perspective specialists

**Branch:** `chore/specialists-reference-core` → `main` · **Date:** 2026-06-04 ·
**Type:** Skills only.

## Why this PR exists

The skill-architecture review's one remaining (non-bug) consistency note: only
the two architect specialists (`domain-architect` / `solution-architect`)
explicitly pointed at the shared contract `CORE_SYSTEM_PROMPT.md`; the six
perspective specialists re-inlined the same generic **Y / E / R** + provenance
boilerplate — double maintenance.

## What this PR changes

| File | Change |
|---|---|
| `process-specialist`, `control-compliance-specialist`, `client-journey-specialist`, `innovation-analyst`, `transformation-agent`, `it-architect` | Replaced the inline `### Y / E / R — the capture loop` boilerplate with one consistent paragraph pointing at `CORE_SYSTEM_PROMPT.md` (the shared per-skill contract), matching the architect skills. The specialist-specific patterns (narrative-/brainstorm-first capture, the `[A]/[E]/[N]` entry idiom, phases, close-out, stay-in-your-lane) are untouched. |

Now **all 8** interactive specialists reference the shared contract exactly once.

## Verification

- Skills only — typecheck / test unaffected. Confirmed: all 8 specialists carry
  one `CORE_SYSTEM_PROMPT` reference; no orphaned `### Y / E / R` headers remain;
  the Interaction-patterns sections read cleanly.

---


# PR #39 — `scaffoldProcess` tool (make `new-process` functional)

**Branch:** `feat/scaffold-process-tool` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + docs. (Parallel-session work, landed on request.)

## Why this PR exists

The `new-process` skill calls a `scaffoldProcess({ slug, PROC, title, description })`
tool to create a brand-new empty process document — but that tool didn't exist
in the AI registry (the MCP server threw `Process document not found` for any
absent slug). So **new-process was non-functional end-to-end** (and `/dogfood-run`
Stage 1 failed). This is the same phantom-tool class as #36, found by the
parallel `BRIDGES_AND_TODOS` audit.

## What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `src/lib/gemini-worker.ts` | **edit** | New exported `buildProcessDoc(PROC, title, description)` (root meta + empty overview, id `${PROC}-001`) + the `scaffoldProcess` tool declaration + handler (scopes the session to the new slug). |
| `src/lib/claude-mcp-server.ts` | **edit** | Imports `buildProcessDoc`; adds the `scaffoldProcess` tool def + a handler that runs **before** the "process must already exist" guard, validates the slug/PROC, refuses to overwrite, and writes the file. |
| `docs/BRIDGES_AND_TODOS.md` | **edit** | Corrects the documented AI tool surface (now 9: the 6 + `writeTargetReview` + `writeSummary` + `scaffoldProcess`); marks process-creation **done**; lists the *remaining* phantom tools (`addSource`/`createElements`/`writeIngestReport`/`clearConflicts`/… still called by document-ingest, source-\*, conflict-resolution). |

## Verification

- `npm run typecheck` clean. `npm test` → **70/70**. The scaffolded doc
  round-trips through `listProcesses` / `getProcess`.
- The transient `.claude/scheduled_tasks.lock` and runtime `funds-release-dogfood.json`
  churn were left out of this PR.

> **Note (deeper gap surfaced):** `BRIDGES_AND_TODOS` documents that
> `document-ingest`, the `source-*` skills and `conflict-resolution` still call
> several **non-existent** tools (`addSource`, `createElements`,
> `writeIngestReport`, `clearConflicts`, …). My earlier skill review (#36–#38)
> caught `writeTargetReview`/`writeSummary` but not this batch — they're the next
> real bug to fix.

---

# PR #40 — `createElements` batch tool (kill the source/ingest run-manifest)

**Branch:** `feat/create-elements-batch` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + 5 skills + docs. **First slice of the phantom-tool program**
(the #39 BRIDGES audit's "next real bug"). Scope chosen with the user:
*batch authoring + kill the manifest*.

## Why

The 4 `source-*` skills and `document-ingest` instructed the AI to call
`createElements` / `writeElements` plus a family of "run manifest" tools
(`resetManifest`, `mergeManifests`, `getSourceReport`, `generateSourceReport`)
to batch-write elements and tally their report — **none of which existed**. So
their write+report path was non-functional under the real backend (the
`/tmp`-scratch improvisation seen in the dogfood run).

## What this PR does

| File | Change |
|---|---|
| `src/lib/session-create.ts` **(new)** | Shared, pure, unit-tested authoring core: `buildElement` (resolve `@tempKey` → validate → assign id, no I/O), `applyElement`, `createElementsBatch` (loops, shared tempKeyMap, returns `created` + per-type `counts` + isolated `errors`). The `replaceTempKeys` / `generateNextId` helpers moved here (re-exported from `gemini-worker` for existing importers). |
| `src/lib/session-create.test.ts` **(new)** | 8 tests — id sequencing, intra-batch `@tempKey` cross-refs, per-type counts, error isolation. |
| `src/lib/gemini-worker.ts`, `src/lib/claude-mcp-server.ts` | `createElements` tool **declared + handled in both providers**; the single `createElement` handler migrated onto the shared `buildElement`/`applyElement` (DRY — both paths now share tested code). |
| `.claude/skills/{source-cx,source-innovation,source-regulation,source-target,document-ingest}/SKILL.md` | Rewritten to call `createElements` and read report counts from its `counts` return. **All manifest tooling removed** (`resetManifest`/`mergeManifests`/`getSourceReport`/`generateSourceReport`/`writeElements`) — the manifest was runtime state, so killing it honours the Karpathy "no runtime state in the wiki" guardrail. Incidental rewrites: `getElementTemplate`→schema template (source-cx). |
| `docs/BRIDGES_AND_TODOS.md` | Tool surface now **10**; batch authoring marked DONE; remaining phantom-tool groups regrouped by fix (rewrite-onto-existing vs. new root-field tools vs. the session-cursor API). |
| `package.json` | `session-create.test.ts` added to the test script. |

## Reconciliation note

A concurrent session had independently begun the same feature directly in
`gemini-worker.ts` (a duplicate `createElements`/`writeElements` handler + a
`writeIngestReport` handler + their declarations — gemini-only, **undeclared
where it counted / non-invokable**, untested, not on `main`). Per the user's
call ("ship my clean PR only"), those were stripped so this PR carries a single
tested, declared, dual-provider `createElements`. `writeIngestReport` and the
other groups land later, done properly.

## Verification

`npm run typecheck` clean · `npm test` **78/78** (was 70; +8). Both providers'
tool registries match (drift-free). The transient `.claude/scheduled_tasks.lock`,
the parallel `scripts/cc-specialist-frd001.mjs`, and the runtime
`funds-release-dogfood.json` churn were left out.

---

# PR #41 — Phantom-tool rewrites onto existing tools

**Branch:** `feat/skill-tool-rewrites` → `main` · **Date:** 2026-06-04 ·
**Type:** 5 skills + docs. **Second slice of the phantom-tool program** — the
"rewrite onto existing tools" group (no new tool surface, **no provider files
touched**, so zero collision with the active concurrent session).

## What

Four phantom tools the skills called did not need to exist — the capability was
already there. Rewritten:

| Phantom | Now | Skills |
|---|---|---|
| `writeOverview` / `updateProcessOverview` | `updateElement` on the overview's **root id** (it already patches root `meta`/`content` when `doc.meta.id === id`) | document-ingest, qer-session |
| `getNextId` / `generateNextId` | **dropped** — `createElement` assigns the id and returns it; the skill refers to the element by description until write time | add-entry, foundational-run |
| `getElementTemplate` / `getTemplate` | refer to the **schema template** (Document Map / output schema) | add-entry, comment-review |
| `checkEvidence` | `checkConformance` — its provenance check already verifies every `document` heading carries a traceable `evidence` quote | document-ingest |

## Verification

No code changed (skill prompts only); `npm test` still **78/78**. Confirmed zero
references to the four phantoms remain in any skill.

## Remaining phantom-tool groups (need real backend work)

- **Root-field tools:** `writeIngestReport` / `clearConflicts` / `addSource` (document-ingest, conflict-resolution).
- **Notes subsystem:** `createNote` / `resolveNotes` (comment-review).
- **Session-cursor API** (biggest): `getSessionStatus` / `startSession` / `advanceSession` / `buildQueue` (qer-session, foundational-run).

---

# PR #42 — Root-field tools (`writeIngestReport` + `clearConflicts`; drop `addSource`)

**Branch:** `feat/ingest-report-tools` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + 1 skill + docs. **Third slice of the phantom-tool program** —
the "root-field writes" group. *(Touches the providers — the concurrent session
had started `writeIngestReport` itself; user said continue.)*

## What

- **`src/lib/session-writes.ts`** — two shared, pure, unit-tested helpers:
  `buildIngestReport(slug, report)` (normalises every array, stamps
  `slug`/`generatedAt`, returns the `IngestReport` the triage screen reads) and
  `clearIngestConflicts(doc)` (empties `doc.ingest.conflicts`, returns the
  count cleared; no-op without an ingest report). **+4 tests.**
- **`writeIngestReport` + `clearConflicts`** — declared + handled in **both**
  providers (gemini-worker + claude-mcp-server). 12 tools each now, drift-free.
- **`addSource` dropped** — sources are derived from `raw-sources/<slug>/` +
  `uploads.json` by `listSources` (written by `/api/upload`), **not** the
  process JSON. The skill's claim ("records in the overview") contradicted the
  model, so there was no valid write. `document-ingest` Step 1 rewritten: the
  file is already uploaded by the app; just identify it.

## Verification

`npm run typecheck` clean · `npm test` **82/82** (+4). Both registries match.
Transient `.lock` + runtime JSON churn left out.

## Remaining (last two groups)

- **Notes subsystem:** `createNote` / `resolveNotes` (comment-review) — `/api/notes` exists in-app.
- **Session-cursor API:** `getSessionStatus` / `startSession` / `advanceSession` / `buildQueue` (qer-session, foundational-run) — the biggest/riskiest.

---

# PR #43 — Notes tools (`createNote` + `resolveNotes`)

**Branch:** `feat/notes-tools` → `main` · **Date:** 2026-06-04 ·
**Type:** Code + 1 skill + docs. **Fourth slice of the phantom-tool program** —
the "notes subsystem" group. Only the session-cursor group remains after this.

## What

- **`src/lib/session-notes.ts` (new)** — pure, unit-tested helpers: `buildNote`
  (assembles a `Note` from the skill input + a backend id/ts, rejects empty
  text), `appendNote` (pushes onto `doc.notes[elementId]`), `resolveNotesInDoc`
  (marks ids resolved across every thread, returns `resolved` / `notFound`).
  **+7 tests.** Mirrors the in-app `/api/notes` (POST/PATCH) so a skill-written
  note is indistinguishable from one written in the app.
- **`createNote` + `resolveNotes`** — declared + handled in **both** providers
  (14 tools each, drift-free). The id + timestamp are backend-assigned.
- **`Note` interface** gains an optional `type?` (the comment-review close-out
  posts its summary as `type: "summary"`) — additive, no UI change.
- **comment-review** Step 4: `resolveNotes` now passes `resolvedBy`; the summary
  note is composed and posted directly (the dead "write to a temp file" step is
  gone).

## Verification

`npm run typecheck` clean · `npm test` **89/89** (+7). Both registries match.

## Remaining (last group)

**Session-cursor API:** `getSessionStatus` / `startSession` / `advanceSession` /
`buildQueue` (qer-session, foundational-run) — a real cursor over `reviewState`.
The biggest and riskiest; touches orchestration, not just a root field.

---

# PR #44 — Session-cursor + `setApproval` (closes the phantom-tool program)

**Branch:** `feat/session-cursor` → `main` · **Date:** 2026-06-05 ·
**Type:** Code + 1 skill + docs. **Final slice** — the biggest group, built whole
per the user's call. After this **the skills' tool-call set exactly matches the
registered tools: zero phantoms remain** (19 tools, both providers).

## What

- **`src/lib/session-cursor.ts` (new)** — pure, unit-tested cursor core:
  `buildFoundationalQueue` (overview first, current-state sections in order,
  process-gaps last; forward-looking/target excluded), `newReviewState`,
  `advance`, `foundationalStatus` / `qerStatus`, the `QER_STEPS` sequence, and
  the canonical `FOUNDATIONAL_OUTCOMES_LINE` + `FOUNDATIONAL_CLOSEOUT_TEMPLATE`
  (single source of truth so the skill can't drift them). **+8 tests.**
- **`buildApprovalPatch`** in `session-writes.ts` (+3 tests) — the AI `setApproval`
  builds an approval `meta` patch and calls the existing `updateElement`, which
  **already enforces the approval gate** (refuses `approved` while a heading is
  `proposed`/`web`). No new gate logic.
- **5 tools in both providers** (now **19 each, drift-free**): `setApproval`,
  `buildQueue`, `startSession`, `getSessionStatus`, `advanceSession`.
  `getSessionStatus`/`advanceSession` route by `kind` ('foundational' default |
  'qer').
- **`qerState`** added to the runtime store (`ProcessRuntime`) — a separate
  cursor from `reviewState`, so the orchestrator's foundational-resume read is
  never confused by a QER session. Runtime state stays out of the wiki (Karpathy).
- **qer-session** skill: a blanket rule + the Step-1 examples now pass
  `kind: "qer"` on every `getSessionStatus`/`advanceSession`. foundational-run
  needed no edit (it uses the default kind, and already called `setApproval`/the
  cursor tools in the right shape).

## Deliberately deferred (one piece)

A dashboard **"resume QER session" tile**. `orchestrator.ts` surfaces
`resume-foundational-run` from `reviewState`; the analogous `resume-qer-session`
from `qerState` is a new `ActionSpec` kind rendered across ~8 UI components — a
**browser-verifiable** feature best done on its own, not bundled into the tool
layer. The cursor tools work without it (the skill's `getSessionStatus` handles
resume).

## Verification

`npm run typecheck` clean · `npm test` **100/100** (+11). Both registries match.
**Caveat (cannot live-verify):** the queue order, the QER step granularity, and
the canonical `outcomes_line`/`closeout_template` text are read from the skill
prose — firing real foundational/qer turns against process data is off-limits.
They are plain constants in `session-cursor.ts`, trivial to adjust if the author
finds a mismatch.

---

# Open follow-ups (as of PR #30)

**The entire ArchitectMiner module is now free of fabricated content** — every
view reads from `doc.elements`. With Theme A (R1–R4) + this follow-up done, and
R10 / R15–R18 / R20–R22 delivered, the triaged roadmap and its main cosmetic
gap are closed. Remaining, all optional:

1. **A first-class pattern catalog** — a `pattern` element type + the Pattern Library view (currently an honest empty state).
2. **Schema generator** — derive the Draft-07 JSON Schema from the custom schema, retiring the dual-edit + drift-guard.
3. **Refresh the recovered artifacts (R20/R22):** re-point `pm-shot*.mjs` at the current UI, regenerate the onepager screenshots + PDF, update the v0.x deck framing.
4. **R19** — slim per-type schema slices (token optimization).

---

# PR #53 — DTP Enhancer (compare + triage) + Advisory Board (WIP)

`feat/dtp-enhancer-and-advisory-wip` → `main` · Code + skills + docs · **Open**.

Bundles all working-tree changes per request. Two distinct bodies of work; the
shared files (`globals.css`, `wiki.ts`, `claude-mcp-server.ts`,
`gemini-worker.ts`) carry changes for both, so they could not be split into
separate commits.

## DTP Enhancer (complete, dogfooded)

The As-Is "DTP" section is reworked into a **DTP Enhancer** review tool.

- **Rename** "DTP" → "DTP Enhancer" (canvas header + bottom-rail nav button).
- **Entry launcher**: *Select a source DTP* / *Upload an old DTP* / *Past
  comparisons*, plus a past-comparison history table.
- **Comparison flow**: choosing a source DTP runs the new **`dtp-compare`** skill
  via the new **`writeDtpComparison`** tool — reviews the chosen DTP against the
  corrected As-Is, findings only, **no regenerated `.md`**. The legacy
  regenerate path (with full-text diff) still works.
- **History**: `DtpReport` gains `runId` + `mode`; kept as an array in the
  runtime store (R9), newest first, with legacy single-report migration.
- **Finding cards** as a scannable list + expand: headline, approved/draft
  evidence provenance (derived from element approval state), element type+title
  chips, severity.
- **Disposition workflow** Open / Accept / Dismiss, persisted via
  **`/api/dtp-disposition`**. An **Accepted** overview filter lists the
  manual-DTP-change worklist. **Dismiss** opens the chat with the finding in
  context to reconcile the wiki (edits nothing until the SME confirms).

## Advisory Board (work in progress)

See `docs/ADVISORY-BOARD-PLAN.md`. Advisor definitions under `.claude/advisors/`,
`advisor.ts` / `advisor-server.ts`, `AdvisorChat` / `AdvisorOverviewCard` /
`AdvisorPortfolioCard`, WelcomeScreen surfacing, and shared chat-infra tweaks
(session route, `useAgentChat`, `agent-chat`). **Not finished** — bundled here
because it shares files with the DTP work.

## Verification

`npm run typecheck` clean · `npm test` **108/108**. DTP flows verified in the
running app (compare → findings list, disposition persist + Accepted filter,
Dismiss → chat). Advisory Board compiles but is incomplete.

## PR #54 — Advisor chat: progress UI parity + read-only sub-agent fan-out

Follow-up to #53's Advisory Board (WIP). The advisor slide-over reused
`useAgentChat` but rendered only a minimal "Thinking…" line. This brings it to
**full parity with the per-process module chat** (`AgentChat`), since the same
hook already exposes all the state.

- **`AdvisorChat`**: renders the running/ETA chip (advisor drives the chip +
  per-advisor ETA history), the **sub-agent fan-out chips** (`chat-task-strip`),
  the live activity line, and the long-wait "perspective" footer — reusing the
  same `chat-*` classes + `pickPerspective`, so it looks identical.
- **`CORE_ADVISOR_PROMPT.md`**: advisors may **fan out read-only sub-agents** for
  broad cross-process questions (they read + report, never write).
- **Session route**: friendly activity labels for the advisor read tools
  (`Reading <slug> overview …`, `Searching for "…" across processes …`).

**Verification**: live turn confirmed running chip, activity line, a real
spawned sub-agent fan-out chip ("Search sanctions-screening controls across all
processes"), and a streamed cross-process answer. `npm run typecheck` clean for
the changed files.

## PR #55 — Advisor chat: clickable citations + capture-as-note + richer markdown

Three Advisory-Board UX wins (picked from a 20-idea list).

- **Clickable element-id citations (#6)** — extracted the linkify/hovercard
  helpers out of `AgentChat` into a shared `chat-linkify.tsx` (module chat now
  imports it; no behaviour change, no drift). `AdvisorChat` builds a
  **cross-process** `getRef` over all accessible processes, so a cited id like
  `CP-COB-001` becomes a hover-previewable link that opens its process. The
  advisor prompt now cites the **full** element id so the linkifier catches it.
- **Capture as note (#11)** — a "💬 Save as note" affordance under an advisor
  answer that cites an element: resolves the cited id(s) (picker when several),
  POSTs to the existing `/api/notes`, with the text prefixed by the advisor name
  for attribution. Read-only contract intact — it's a user action through the
  existing notes writer, not an advisor write.
- **Richer markdown (#15)** — table + code-block CSS for advisor answers
  (`remark-gfm` already parsed them).

**Verification**: live in the running app — table rendered, `CP-COB-001`
linkified, "Save as note" wrote a note to `cob-003.json` authored by the user
with the `**Lead Banking SME** (advisory):` prefix (test note reverted).
`npm run typecheck` clean for all changed files, including the `AgentChat`
extraction (module chat unchanged).

---

# PR #56 — DTP Enhancer review tools (rollup, coverage, evidence, triage, export, summary)

`feat/dtp-review-tools` → `main` · Code + skills · **Open**.

Builds on the DTP Enhancer (#53). The tool stays **read-only review/diagnostic** —
it compares an existing DTP against the corrected As-Is and never drafts or amends
the DTP. DTP-only PR; deliberately excludes the parallel Advisory Board track.

## Finding analysis
- **Run rollup** — counts by kind + severity, control/high-risk flag.
- **Coverage map** — DTP sections reviewed (new report `coverage` block) + As-Is
  elements no finding references (blind-spot list).
- **Evidence drill-down** — expand the cited As-Is element bodies inline.
- **Severity rationale + suggested disposition** — skill-emitted hints.

## Triage + reporting
- Scannable findings list with expand-to-detail; **Open/Accept/Dismiss**
  disposition via `/api/dtp-disposition`; **Accepted** overview filter.
- **Dismiss** opens the chat with the finding to reconcile the wiki.
- **Export Accepted worklist** as Markdown checklist or CSV (client-side).
- **Executive-summary memo** per run: `dtp-summary` skill + `writeDtpSummary`
  tool, rendered as Markdown.

## Data
`DtpFinding` gains headline / rationale / suggestedDisposition / disposition;
`DtpReport` gains runId / mode / coverage / summary — additive + optional, with
legacy migration. `dtp-compare` / `dtp-regenerate` skills + both worker tool
schemas updated. WelcomeScreen drops the top-bar name·role text (kept in the
avatar tooltip).

## Verification
`npm run typecheck` clean · `npm test` **108/108** · each flow dogfooded in-app.

---

# PR #57 — Per-process access enforcement: session endpoint, write path, tool layer

`feat/per-process-access` → `main` · Security · **Open**.

Closes the R16 gap where per-process access (`canAccess`) was enforced on the
page read path but not on the surfaces that can mutate or read process data.
Authentication and the write-path resolver were already done; this adds the
session endpoint and the worker tool layer. Deliberately excludes the parallel
admin feature-flags / feature-toggles track.

## Session endpoint (`/api/session`)
- The POST body now carries a structured `slug`; the in-app callers send it
  (`ProcessDocScreen` chat + area-summary, `useAgentChat` / `agent-chat`).
  Advisor turns send none — they're cross-process by design.
- When a slug is present (non-advisor), the route enforces `canAccess` → **403**
  otherwise, before any worker spawns. Resume turns re-confirm against the slug
  recorded in `.sessions.json`, so a spoofed body slug can't ride a session
  bound to a process the caller can't see.

## Worker tool layer (the real reach)
- The signed-in identity is plumbed into the worker pool and down to the tools:
  `SessionWorker` passes `PM_SESSION_USER` / `PM_SESSION_IS_ADMIN` to the
  `claude` CLI (inherited by the stdio MCP server); `GeminiWorker` takes the
  user inline.
- `claude-mcp-server` + `gemini-worker` now gate every slug-bearing tool by
  `canAccess`: `listAccessibleProcesses` / `searchProcesses` filter to
  accessible slugs; `getProcessSummary` / `getProcessElements` and the general
  slug path (reads, writes, expands) assert access. The Advisory Board's
  read-only fan-out is no longer prompt-level only.
- Fail-open only when no identity is present (the HTTP route is the trust
  boundary; every real session carries identity).

## Write path
- `wiki-write.resolveWriter` requires a valid session **and** `canAccess(slug)`
  for browser-originated server actions; the in-process AI worker (no request
  context) proceeds as the system author "SME".

## Also
- `listProcesses` skips dotfiles, so the `.sessions.json` runtime map no longer
  surfaces as a bogus `.sessions` "process" in the cross-process tools.

## Verification
Session route driven end-to-end with signed cookies: non-owner of a governed
process → **403**, owner/admin → **200**, advisor turn exempt → **200**. MCP
server driven directly over stdio JSON-RPC: non-owner **denied** on
`getProcessElements` / `getProcessSummary`, admin allowed,
`listAccessibleProcesses` excludes the governed process for the non-owner.
`npm run typecheck` clean · `npm test` **108/108**.

## PR #58 — Live-testing feedback toolkit (floating widget, auto-context, screenshots, element pins, admin toggles)

## Why
The app is going into user testing and needs the simplest possible way for
testers to give feedback live, in-app. This adds the first tranche of a
feedback toolkit, each capability gated by an admin toggle so it can be lit up
per environment.

## What
- **Feature-flag framework.** A client-safe catalog (`src/lib/feature-flags.ts`),
  a server store at `data/feature-flags.json` (gitignored, overrides-only so new
  flags inherit defaults), a React provider/hook
  (`src/lib/feature-flags-context.tsx`), an admin-gated API
  (`src/app/api/admin/features/route.ts`), and a **Feature toggles** tab in
  `AdminScreen`. Flipping a toggle calls `router.refresh()` so it takes effect
  live, not on next reload.
- **#1 Floating feedback button** (`FloatingFeedback.tsx`, design-shotgun
  variant B): an accent pill (flips by `--ws-accent`) opening a slide-up sheet
  that posts to the existing `/api/feedback`. Mounted app-wide in `AuthGate`,
  self-gating on `feedback.floating_button`.
- **#2 Auto-capture page context**: a live-context store
  (`feedback-live-context.ts`) that `ProcessDocScreen` publishes the active
  process/section into, merged with path/viewport/user-agent/timestamp at submit.
- **#4 One-click screenshot**: `html-to-image` DOM capture (excludes the widget),
  stored beside the item as `feedback/<id>.png`, served by
  `/api/feedback/screenshot` (signed-in, strict id validation).
- **#3 Point-and-click element feedback** (design-shotgun variant B): a
  "Feedback mode" that makes element cards targetable (via `data-feedback-*` on
  `ElementCard`) and pins the feedback to the clicked element, pre-filling the
  sheet with the element ref. Stored as first-class `element` frontmatter.
- The feedback model (`feedback.ts` / `feedback-store.ts`) gains `context`,
  `screenshot`, and `element`; `FeedbackScreen` renders all three on each card.
- **Profile-modal fix**: the welcome-screen avatar now opens a shared
  `UserProfileModal` instead of signing out (sign-out is a deliberate button
  inside), matching the dialog `ProcessDocScreen` already used.

## Scope
All four feedback features ship **off by default**; the admin lights them up in
**Admin → Feature toggles**. The element-feedback affordance lives in the
floating widget, so it follows `feedback.floating_button`. Profile edits remain
in-session (no self-profile PATCH endpoint — pre-existing behaviour). Runtime
flag state lives in `data/` (gitignored), keeping the Karpathy wiki guardrail.

## Verification
`npm run typecheck` clean · `npm test` **108/108**. Driven end-to-end in the
running app: toggles persist + apply live; floating widget files items;
auto-context stores live process/section (`area: "Triage"` etc.); screenshot
captured + served (`200 image/png`, `400` on traversal, `404` missing);
element pin stores `element: PS-COB-001` with title/process; avatar opens the
profile (session intact). Test feedback items created during verification were
removed.

---

## PR #61 — `new-process` determinism + skill deep-dive HTML

## Why
A deep-dive review of all 26 skills (delivered as the `docs/skill-analysis/`
HTML site) flagged `new-process` as carrying avoidable run-to-run variance: the
model derived the slug and `<PROC>` abbreviation in its head (the `FRD2`-style
malformed abbreviation was a guaranteed reject-and-retry), reproduced the
confirm bullets / closing message verbatim from the prompt (drift-prone), and
re-prompted on slug collisions. The mechanics belong in the deterministic tool
layer; only the one-line description is genuine judgement.

## What
- **New `deriveProcessMeta({ name })` tool** (`src/lib/process-scaffold.ts`),
  wired into both backends (`claude-mcp-server.ts`, `gemini-worker.ts`).
  Returns a deterministic `slug`, a guaranteed-valid `PROC` (2–6 uppercase
  letters — the model never forms it), `slugTaken` + up to three non-colliding
  `suggestedSlugs`, and a fixed `confirmTemplate` (with a `{{description}}`
  slot, so the bullet structure can't drift).
- **Templatized copy** — `confirmBulletsTemplate` + `scaffoldClosing` are now
  the single source of truth; `scaffoldProcess` returns the canonical `closing`
  for verbatim relay.
- **SKILL.md** updated to call the tool, take a one-shot confirm path when the
  opening message already carries a description, and relay the tool-provided
  copy verbatim.
- **`docs/skill-analysis/`** — a per-skill HTML deep-dive (what it does, the
  sequence, determinism/speed enhancement ideas) for all 26 skills, with the
  `new-process` outcomes marked.

## Scope
`new-process` only. No change to any other skill's behaviour. Description text
stays model-authored (the templated-description idea was deliberately skipped).

## Verification
`npm run typecheck` clean · `npm test` **108/108** · new
`src/lib/process-scaffold.test.ts` **8/8** (slug/abbreviation validity,
collision suggestions, deterministic output). Derivation smoke-tested across
edge cases (`FRD2`→`FRD`, single-word `Onboarding`→`ONBO`, digit/symbol names).

---

# fix(triage): guard against a malformed ingest report crashing the workspace

## Why
`TriagePanel` read `ingest?.created.length` / `ingest?.updated.length`. The
optional chain only guards a null `ingest`; once `ingest` exists, an undefined
`ingest.created` throws `TypeError: Cannot read properties of undefined (reading
'length')`, which the error boundary turns into a full-screen *"This page
couldn't load"* — the whole process workspace is dead.

This fires whenever a `document-ingest` run writes an `ingest` object without
the `created`/`updated` arrays the `IngestReport` contract (`src/lib/wiki.ts`)
declares required — i.e. on a real first ingest, the very first thing an SME
does. Surfaced by the `/dogfood-run` harness (finding F-003; the malformed
report itself is F-002).

## What
Two-character change in `src/components/TriagePanel.tsx`: `ingest?.created.length`
→ `ingest?.created?.length` (and the same for `updated`). The existing
`?? doc.elements.length` / `?? 0` fallbacks were clearly intended to handle a
missing count — they were simply unreachable because the throw happened first.

## Scope
Defensive UI hardening only; no behaviour change when the ingest report is
well-formed. Does **not** fix the upstream cause (F-002, `document-ingest`
emitting a report missing `created`/`updated`) — that is a separate skill/writer
fix, ideally with a validator on the ingest write so a malformed report is
rejected at the source.

## Verification
`npm run typecheck` clean. The dogfood run reproduced the crash and confirmed
the guarded version renders the triage screen normally (import record + element
counts).

---

## PR #65 — `qer-session` determinism: perspective-aware cursor

## Why
The skill deep-dive (`docs/skill-analysis/qer-session.html`) found qer-session's
SKILL.md describing a cursor that did not fully exist: Step 3 assumed
`getSessionStatus()` reported six per-perspective positions with a `skillBuilt`
flag, but the real QER cursor had five steps and PERSPECTIVE PASSES was a single
stop — the model improvised the six-specialist loop and judged "is it
reviewable / done" by eye. This PR aligns the cursor with the prose and turns
those judgements into deterministic, counted facts.

## What
- **`session-cursor.ts`** — `QER_PERSPECTIVES` registry (perspective → owning
  collections); `qerPerspectiveStatus` / `documentedPerspectiveCount` /
  `nextBuiltPerspective` (deterministic `skillBuilt` injected as an fs fact +
  `documented` from the doc; next = first built and not-yet-documented, so
  writing elements advances the loop); `crossReviewEligible` (≥2 documented) as
  a counted gate; `QER_CLOSEOUT_TEMPLATE` + `renderQerCloseout`;
  `ReviewState.actor` carried on the cursor; `qerStatusWithPerspectives` merges
  all of it into the status.
- **Both backends** — `getSessionStatus` / `advanceSession` / `startSession`
  return the perspective map + filled close-out; `skillBuilt` computed from
  installed specialist skill dirs; `startSession` accepts `actor`.
- **SKILL.md** — snapshot once via `getProcessSummary` at SELECT; pre-flight
  skill-built map; Step 3 driven by `nextBuiltPerspective`; cross-review gated on
  `crossReviewEligible` and run as concurrent read-only sub-agents; batched
  validation; verbatim rendered close-out; structured overview checklist.

## Scope
qer-session + the shared session-cursor core. The foundational cursor is
unchanged (`ReviewState.actor` is optional/additive). No other skill changes.

## Verification
`npm run typecheck` clean · `npm test` **115/115** — 7 new `session-cursor.test.ts`
cases (perspective map, next-built loop, eligibility gate, close-out render,
actor carry).

---

# fix(ingest): normalise the ingest report on read (F-002, upstream of F-003)

## Why
The `#62` triage guard stopped a malformed `ingest` report from *crashing* the
UI; this addresses the upstream cause. The write path already normalises
(`buildIngestReport` in `session-writes.ts` defaults every array and stamps
`generatedAt`/`slug`), but the **read** path passed `data.ingest` through raw
(`wiki.ts` `getProcess`). So any `ingest` object on disk that didn't go through
that writer — a legacy report, or one written before the normaliser existed —
reached every consumer with `created`/`updated` possibly `undefined`. The
`/dogfood-run` harness produced exactly such a report (`{file, conflicts,
corrections}`, no `created`/`updated`/`generatedAt`/`slug`), which is what blew
up `TriagePanel` (F-003).

## What
- New exported `normalizeIngestReport(raw, slug)` in `src/lib/wiki.ts`: coerces
  every array to `[]`, preserves scalars (defaulting `slug` from the arg,
  `file`/`generatedAt` to `""`), returns `undefined` when there is no report.
- `getProcess` now maps `ingest: normalizeIngestReport(data.ingest, slug)` so no
  consumer can ever read a count off `undefined`, regardless of how the report
  got onto disk.

## Scope
Read-boundary hardening only; no change for a well-formed report (round-trips
unchanged, verified by a test). The writer (`buildIngestReport`) is already the
normaliser for the write path and is left as-is; this closes the gap for reports
that bypass it.

## Verification
`npm run typecheck` clean · `npm test` **111/111** (3 new `normalizeIngestReport`
cases in `wiki.test.ts`: malformed→coerced, well-formed→preserved,
null/non-object→undefined).

---

## PR #67 — `foundational-run` determinism: doc-derived facts

## Why
The skill deep-dive found the walk's most fragile spots were judgement the model
re-derived each run: whether a step has a control, the close-out counts +
"still to document" list, the rewrite-then-approve provenance dance on [Y], and
prose/frontmatter drift on [E]. This PR turns each into a counted fact or a
one-call write, leaving the sharp lens-specific challenge to the model.

## What
- **`foundational.ts`** (new, pure) — `buildControlCoverage` / `uncoveredSteps`
  (per-step "has a control?" from `control.content.step`); `stillToDocument` +
  `FOUNDATIONAL_FILL_MAP` (empty section → filling skill/✦, Target Process
  excluded); `closeoutCounts`; `enrichFoundationalStatus` (layers
  `currentHasControl`, `uncoveredSteps`, `gapTail`, and the close-out counts +
  still-to-document onto the base cursor view).
- **`session-writes.ts`** — `buildReconciledApprovalPatch` (reconcile + approve
  in one gated write) and `syncRelationsFromProse` (conservative, opt-in
  frontmatter sync — only adds ids that exist and match the list's type).
- **Both backends** — foundational `getSessionStatus`/`buildQueue`/`advanceSession`
  return the enriched status; `setApproval` gains `reconcile`; `updateElement`
  gains opt-in `syncRelations`.
- **SKILL.md** — snapshot once + reuse bodies; control probe off
  `currentHasControl`; one-message per-step template; [Y] one-call reconcile;
  [E] `syncRelations`; gap-tail batch; close-out from the counted facts.
- **Test wiring** — added `foundational.test.ts` AND the #61
  `process-scaffold.test.ts` to `npm test` (both existed but weren't run).

## Scope
foundational-run + the shared cursor/write cores. `setApproval.reconcile` and
`updateElement.syncRelations` are optional/opt-in, so other skills and the
in-app write paths are unaffected. Skipped by request: atomic cursor (#3).
Partial: per-element body cache (#9) — Step-1 read-once reuse done, stateful
worker cache deferred (staleness risk).

## Verification
`npm run typecheck` clean · `npm test` **138/138** — 12 new `foundational.test.ts`
cases (control coverage, gap-tail, close-out, reconcile, conservative relation
sync).

---

## PR #70 — Specialists determinism: shared `getProcessRelations` + prose pass

## Why
The deep-dive surfaced ~66 enhancement ideas across the 8 specialists that
collapse into a few recurring moves (the specialists are pure-prompt skills over
one shared tool layer). Worked as a consolidated-by-theme pass: implement the
shared wins once + each specialist's high-value deterministic derivation.

## What
- **`process-relations.ts`** (new, pure) + a read-only **`getProcessRelations`**
  tool in both backends — per-step systems/controls/touchpoints with
  hasControl/hasSystem, orphan systems/controls/regulations, candidate
  integrations (system pairs co-occurring on a step with no integration), and
  steps without a control/system. Replaces by-hand coverage derivation for the
  Process, Control & Compliance, Client Journey and IT Architect specialists.
- **All 8 SKILL.md** (surgical prose, contract unchanged) — one
  `getProcessSummary` snapshot up front; derive coverage/orphans/candidates from
  `getProcessRelations`; batch reference-grade lists; skip read-back for
  objective/sourced facts; parallel-draft independent elements; fixed
  question-bank order; set relations at write time. Transformation / Domain /
  Solution derive gaps / capabilities / ADR stubs / integration & migration
  coverage from the snapshot.
- Structured-output / enum gating marked **partial** (already enforced by
  `createElement` + `checkConformance`); banking libraries/catalogs **skipped**
  (content work). HTML deep-dives updated with per-idea outcomes.

## Scope
8 specialist skills + the new read-only tool. `getProcessRelations` is additive
and read-only; no change to other skills or write paths.

## Verification
`npm run typecheck` clean · `npm test` **143/143** — 5 new
`process-relations.test.ts` cases (coverage, orphans, integration candidates,
uncovered), wired into the runner.

---

# feat(session): per-skill token usage — capture, tally, receipt

## Why
There was no way to see how many tokens a skill run costs. Both backends already
*surface* usage on the turn's `result` event — the claude CLI
(`--output-format stream-json`) on `usage` + `total_cost_usd`, the Gemini SDK on
`usageMetadata` — but the session route read neither and threw it away. Asked for
by the `/dogfood-run` review ("show tokens per skill run").

## What
- **`token-usage.ts`** (new) — `extractUsage(evt)` normalises either provider's
  shape into a `TokenUsage` (input/output/cache tokens + cost; returns null when
  absent or all-zero); `recordSkillUsage(slug, skill, usage)` folds a turn into
  the runtime store under that skill **and** a process total.
- **`runtime-store.ts`** — `TokenUsage` / `SkillUsageEntry` / `SkillUsage` types
  and a `skillUsage?` field on `ProcessRuntime`. Derived state → runtime store,
  not the wiki (Karpathy guardrail). Keyed by the skill the chat passed; free
  chat is `"free-chat"`.
- **`/api/session`** — on the `result` event, record usage (best-effort,
  wrapped so accounting can't break a turn) and add `usage` to the `done` SSE
  payload.
- **`gemini-worker.ts`** — sum `usageMetadata` across the turn's
  generateContent round-trips and attach it to the `result` event (parity with
  the claude path).
- **UI** — `done.usage` → `onDone(…, usage)` → attached to the agent
  `ChatMessage`; `AgentChat` renders a dim per-turn receipt
  (`1.2k in · 340 out · 50 cached · $0.01`).

## Scope / notes
Read-only accounting; no change to a turn's behaviour, and a thrown error in the
tally is swallowed. `turns` counts worker turns, so a multi-turn skill (a
foundational run is dozens of turns) sums across them — the per-skill total is
right; there's no per-invocation id yet. Gemini reports no cost, so `costUsd` is
0 there.

## Verification
`npm run typecheck` clean · `npm test` **148/148** (after rebase onto #70) — 5
new `token-usage.test.ts` cases (claude shape, Gemini shape + cache-netting,
empty→null, per-skill+total fold, null no-op).

---

## PR #74 — Source-* determinism: shared `getConsolidationInputs` + prose pass

## Why
The 4 source-* skills' ideas converge on a few moves; the standout is that
source-target and source-innovation both re-walked the document by hand to
enumerate open problems and tally inputs. Worked as a consolidated-by-theme
pass: build that once + apply the uniform prose wins.

## What
- **`consolidation-inputs.ts`** (new, pure) + a read-only **`getConsolidationInputs`**
  tool in both backends — the open As-Is problem inventory (pain-points,
  process-gaps, control-gaps, friction-points, audit-findings + a union `all`),
  the innovation-idea/system/integration id lists, the existing Target Process
  ids (extend-not-duplicate), the "consolidated from" tallies, and which
  perspectives are empty.
- **source-regulation** — per-domain sub-agent fan-out, authored query
  templates, diff-before-search, dedup+cap, per-domain batched writes,
  reg→control links from existing controls.
- **source-cx** — benchmark scan as a 4th concurrent sub-agent, per-tier query
  templates, dedup+cap, existing-element pre-load, relevance pre-scoring.
- **source-innovation** — trend scan fanned out, query templates, dedup+cap,
  batched citation resolution, problem→idea coverage from
  `getConsolidationInputs.openProblems.all`.
- **source-target** — one-call read (`getProcessSummary` +
  `getConsolidationInputs`), deterministic gap-per-uncovered-delta,
  problem→decision coverage, mechanical section seeds, and the report tallies
  from the tool.
- Structured-output marked **partial** (already enforced by createElement/
  createElements); curated seed lists + page-fetch caches **skipped**
  (content/infra). HTML deep-dives updated with per-idea outcomes.

## Scope
4 source skills + one read-only additive tool. No change to other skills or
write paths.

## Verification
`npm run typecheck` clean · `npm test` **153/153** — 5 new
`consolidation-inputs.test.ts` cases (open-problem inventory, tallies,
existing-target, empty-perspective flags), wired into the runner.

---

# feat(admin): Token-usage tab, toggleable chat receipt, drop cost

Follow-up to #69 (which captured per-skill token usage but only surfaced a
per-turn chat line). Three asks: surface the totals in admin, let the admin turn
the chat receipt on/off, and stop showing dollars.

## What
- **Admin → Token usage (new tab)** — `UsagePanel` fetches `/api/admin/usage`
  (new admin-only route) and shows a grand total, a **by-skill** table (the
  "tokens per skill" headline, summed across processes) and a **by-process**
  table. `aggregateUsage()` (new, pure, in `token-usage.ts`) does the roll-up
  over `listProcesses()` + `getRuntime().skillUsage`.
- **Toggleable chat receipt** — new feature flag `session.token_receipt`
  (group "Session", **default on**). `AgentChat` gates the per-turn receipt on
  `useFeatureFlag("session.token_receipt")`, so an admin flips it from
  Admin → Feature toggles. The per-skill recording + the admin tab are
  unaffected by the toggle (it only hides the in-chat line).
- **Dropped cost** — removed the `$…` from the chat receipt; the admin tables
  are tokens-only. `costUsd` is still captured in the store (harmless, unshown).

## Scope
Read-only admin reporting + one flag + a display gate. No change to capture
(#69) or turn behaviour. The flag defaults **on** to preserve #69's just-shipped
visible receipt; flip the catalog `default` to ship it dark instead.

## Verification
`npm run typecheck` clean · `npm test` **155/155** (after rebase onto #74) — 2
new `aggregateUsage` cases (cross-process per-skill + grand-total sum, skips
empty; empty list → zeros). Admin route mirrors the `/api/admin/users`
admin-only auth.

---

## PR #77 — add-entry determinism: one-call `getSectionContext`

## Why
add-entry's Step 1 was 3+ sequential reads (schema template + existing-elements
list + overview) and the model then re-recalled the element shape at draft time
— slow, and the top source of dropped-required-field conformance flags.

## What
- **`section-context.ts`** (new, pure) + a read-only **`getSectionContext`**
  tool in both backends — for a section, each element type as a fill-in-the-
  blanks skeleton (block headings, frontmatter fields, relation targets,
  required keys), the existing elements (id+title), and the overview, in one
  payload.
- **SKILL.md** — Step 1 makes one `getSectionContext` call and drafts against
  the skeleton; Step 3 adds a duplicate check (existing titles + searchProcesses
  before drafting), concurrent read-only sub-agent web research, and relation
  id-list pre-fill from the skeleton's targets.
- Subsumes the template pre-fill (1) and per-session schema cache (8); enables
  the structured draft (3, partial) and relation pre-fill (6, partial). Type
  disambiguation up front (7) skipped by request.

## Scope
add-entry + one read-only additive tool. No change to other skills or write
paths.

## Verification
`npm run typecheck` clean · `npm test` **160/160** — 5 new
`section-context.test.ts` cases (skeleton shape, relation-target normalization,
existing list, overview, empty section).

---

# feat(session): per-skill run-time alongside token usage

Extends the token tally (#69/#75) with **wall-clock run-time per skill**.

## What
- **Measured in the route** — `turnStart` is reset just before the `runTurn`
  loop; on the `result` event the elapsed ms is computed (provider-agnostic, so
  it works for claude and Gemini alike) and folded into the per-skill tally.
- **`SkillUsageEntry.durationMs`** — summed server-side processing time per
  turn (excludes idle time between turns). `recordSkillUsage` now takes a
  `durationMs`, records when there is usage **or** a duration (so a turn with no
  token data still counts toward run-time), and `aggregateUsage` sums it.
- **Admin → Token usage** — a "Run-time" stat in the totals and a Run-time
  column in both the by-skill and by-process tables (`4.2s` / `3m 12s` /
  `1h 4m`).
- **Chat receipt** — the per-turn line now appends the turn's run-time
  (`… · 4.2s`), still behind the `session.token_receipt` flag, and now renders
  even for a usage-less turn that has a duration.

## Scope
Read-only measurement; no change to turn behaviour. Run-time is the summed
per-turn processing time, so a multi-turn skill (a foundational run) is the sum
of its turns' run-times — the compute time, not the wall-clock including SME
think-time.

## Verification
`npm run typecheck` clean · `npm test` **155/155** — `token-usage.test.ts`
extended (per-turn duration fold + sum, duration-only no-token turn still
records, cross-process duration sum).

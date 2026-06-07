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
| **#58** | Live-testing feedback toolkit — floating widget, auto-context, screenshots, element pins, admin toggles | `feat/live-feedback-toolkit` → `main` | Code + UI | **Open** (`pending`) |
| **#59** | Design-review wave 1 — colour overload, AM green theming, primary button, table scan-ability + 7 more | `fix/design-review-wave-1` → `feat/live-feedback-toolkit` | Code + UI | **Open** (`pending`) — stacked on #58 |
| **#60** | Design-review wave 2 — shared `<Modal>` primitive; migrate every dialog onto it; de-dupe the profile modal | `fix/design-review-wave-2` → `fix/design-review-wave-1` | Code + UI | **Open** (`pending`) — stacked on #59 |
| **#64** | Design-review wave 3 (round-2 fixes) — login first-impression, guided-tour escape, DTP relabel, Help/⌘K focus-trap | `fix/design-review-wave-3` → `fix/design-review-wave-2` | Code + UI | **Open** (`pending`) — stacked on #60 |
| **#66** | Design-review wave 4 — the export PDF: provenance tags + legend, page footer, print-color-adjust, tokens | `fix/design-review-wave-4-print` → `fix/design-review-wave-3` | Code + UI | **Open** (`pending`) — stacked on #64 |
| **#68** | Design-review wave 5 — confirm access-widening + surface failures in SettingsPanel | `fix/design-review-wave-5-access` → `fix/design-review-wave-4-print` | Code + UI | **Open** (`pending`) — stacked on #66 |
| **#71** | Design-review wave 6 — DTP colour overload: kind goes neutral, severity is the only colour axis | `fix/design-review-wave-6-dtp-color` → `fix/design-review-wave-5-access` | Code (CSS) | **Open** (`pending`) — stacked on #68 |

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

## PR #59 — Design-review wave 1 (11 findings)

## Why
A six-agent design + UX review (`public/_mockups/design-review.html`) surfaced
44 findings, most laddering up to four systemic roots. This PR resolves 11 of
the 12 highest-impact before/after items (all except #3, the toolbar grouping).
Stacked on #58 because several fixes build on files #58 touched.

## What
- **#1 / #12 colour overload** — provenance chips become neutral mono; colour is
  reserved for the *unconfirmed* states (`proposed` amber, `web` info-blue). The
  semantic triad (`--hi/--mid/--lo`) stops meaning confidence + provenance +
  approval at once.
- **#2 ArchitectMiner green** — remap the accent tokens on the `.am` shell root
  so the whole `.am-*` surface themes green from one place (it was rendering in
  Processminer blue).
- **#4 / #5 dashboard** — one resume hero + compact rows for the rest; stable
  "Your workspace" h1 with the count demoted to a subline.
- **#6 primary button** — `.act.ai` is now solid accent everywhere.
- **#7 bug** — `.conf-med` → `.conf-medium`; medium-confidence dots were invisible.
- **#8 lineage** — approved cards keep "AI-drafted · approved by X".
- **#9 pill misuse** — interactive controls (buttons, filter/category chips)
  de-pilled to `--r-sm`; status/confidence chips, badges, switch track, FAB kept.
- **#10 tables** — `useCapped` hook caps the cross-process portfolio + handoff
  tables with a "show more"; zebra rows + tabular-nums across AM tables.
- **#11 empty states** — real action buttons (Run quality check / Upload) instead
  of references to unlabeled toolbar glyphs.

## Scope
`#3` (toolbar grouping/labels) and the long tail (12px-floor sweep, shared
`<Modal>` primitive, chat-rail reflow, virtual-view wayfinding) are deferred to
later waves. `#9` is intentionally partial — only clear interactive controls
were de-pilled; the full token sweep is its own pass.

## Verification
`npm run typecheck` clean · `npm test` **108/108**. Computed-style checks in the
running app: provenance elicited neutral, web `#2563eb`; `.am` `--accent`→`#3f7d5c`
(green) with green-soft nav; `.act.ai` solid `#1e40af`; conf-medium dot `#9a7b32`;
welcome h1 stable + single hero. The review report (`public/_mockups/`) is a
throwaway artifact and is intentionally not committed.

## PR #60 — Design-review wave 2: shared `<Modal>` primitive

## Why
Systemic root #4 from the review: every dialog hand-rolled its own overlay —
none bound Esc, trapped focus, or set `aria-modal`, overlay-dismiss was
inconsistent, and the "Signed-in user" dialog existed twice (already drifted).

## What
- New `src/components/Modal.tsx` — one dialog shell: overlay, **Esc to close**,
  **focus trap** + initial focus, `aria-modal`, click-outside (opt-out via
  `closeOnOverlay`), restore-focus-on-close. Reuses the `.modal-*` classes so the
  look is unchanged. Supports forms (dialog renders its `<form>` as children).
- Migrated every hand-rolled dialog onto it: `UserProfileModal`, `UploadModal`,
  `ExportModal`, `AdminScreen` (create-user + reset-password), and the
  ProcessDocScreen web-sourcing-result modal.
- **De-duped** the profile dialog: ProcessDocScreen's inline "Signed-in user"
  modal is gone — it now renders the shared `UserProfileModal` (with dark-mode as
  an optional prop). Removed the dead `userEdit` state + `initials` import.
- Standardised the Export dialog's bespoke buttons onto `.act` / `.act.ai`.

## Scope
Stacked on #59. The remaining tail (virtual-view wayfinding, chat-rail reflow,
12px-floor sweep, toolbar grouping #3) is still open for later waves.

## Verification
`npm run typecheck` clean · `npm test` **108/108**. In the running app: the
welcome profile dialog and the admin "New user" form dialog both open with
`aria-modal="true"`, move focus inside (first field), and **close on Esc**
(previously Esc did nothing); form submit semantics preserved. No hand-rolled
`modal-overlay` remains outside the primitive.

## PR #64 — Design-review wave 3 (round-2 findings)

## Why
A second review pass (3 more agents) covered surfaces the first pass missed:
the print/export PDF, the entry/onboarding screens, and the specialist panels.
This wave lands the contained, high-value fixes from that pass.

## What
- **LoginGate** (first impression): wordmark drops the stale "v2" → "Processminer"
  + a one-line tagline; the footnote hint gets a token-bound `.login-hint` rule
  (was inheriting 14px and out-competing the labels); the error gets `role="alert"`.
- **GuidedTour**: "Skip tour" / "Close" now shows on **every** step (it was hidden
  on the last), so a user is never trapped mid-tour.
- **DTPReviewPanel**: relabel the triage to name its real effect — "Accept" →
  **Fix in DTP**, "Dismiss" → **Reconcile wiki…** (the latter opens a chat; the
  old label read as the opposite), with explanatory tooltips.
- **Help / ⌘K accessibility**: extracted Modal's focus-trap into a shared
  `useFocusTrap(ref, onEscape, active)` hook; `Modal`, `HelpCenter` and
  `CommandPalette` all use it now — so the two overlays gain `aria-modal`, a Tab
  focus trap, Esc, and focus-restore, instead of rolling their own. Continues
  root #4 (shared primitives).

## Scope
The larger round-2 items (print/export provenance + page numbers, SettingsPanel
access confirmation, DTP colour overload, a unified triage control) remain for
later waves. The review report (`public/_mockups/design-review.html`, round 2)
is a throwaway artifact, not committed.

## Verification
`npm run typecheck` clean · `npm test` **108/108**. In-app: HelpCenter opens with
`aria-modal="true"`, moves focus inside, and closes on Esc (it didn't before);
CommandPalette uses the identical hook.

## PR #66 — Design-review wave 4: the export PDF

## Why
The `/print/<slug>` document — the PDF shared with clients/auditors — was never
reviewed, and it dropped the product's defining signal: **provenance**. A reader
could not tell SME-confirmed fact from AI-proposed guess on paper.

## What
- **Provenance survives into the export.** Each heading now prints its source as
  a quiet mono tag (`SME` / `DOC` / `PROPOSED` / `WEB` / `LEGACY`) — neutral for
  confirmed sources, amber for `proposed`, info-blue for `web` (mirrors the
  in-app treatment). Applied to both elements and the overview.
- **A "How to read this document" legend** on the cover defines every tag +
  DRAFT, so the PDF is self-contained.
- **`print-color-adjust: exact`** so the accent + tier colours actually render
  (browsers were stripping them, collapsing to flat black).
- **A running footer** (`{process} · {id} · {docId}`) repeats on every printed
  page for traceability, plus an `@page` page-counter for engines that support it.
- **Token + legibility cleanup**: the invented orange (`#b4540a`/`#fdeee2`) → the
  `--mid` tier; greys/sizes → tokens; sub-12px heading labels + DRAFT chip raised
  to the 12px floor; long URLs now print their href and wrap.

## Scope
Deferred (heavier / browser-limited): exhibit (flow/RACI) print pagination,
true per-page numbers in Chrome (the @page counter covers capable engines; the
fixed footer gives traceability everywhere), and ToC page references.

## Verification
`npm run typecheck` clean · `npm test` **115/115**. Rendered `/print/cob-003`:
16 provenance tags on headings, the 5-row legend on the cover, the running
footer present, `print-color-adjust: exact`, DRAFT chip on the `--mid` token.

## PR #68 — Design-review wave 5: SettingsPanel access safety

## Why
Access changes in the per-process Settings applied on one click with no
confirmation and no error surface — "Make open to everyone" un-governs a process
(every signed-in user can then see it), and `accessAction` had no `catch`, so a
failed write vanished silently. In a regulated-banking tool this was the riskiest
spot in the app (review R4).

## What
- **`accessAction` now handles failures** — checks `res.ok`, catches network
  errors, and surfaces them in a new `.settings-error` (`role="alert"`) block.
- **Access-widening + revoke now confirm.** "Make open to everyone" (ungovern)
  and per-person "remove" (revoke) open a `<Modal>` confirm that names the impact
  ("Every signed-in user will be able to view …") before acting. Additive actions
  (Share / Restrict-to-owner) stay one-click.

## Scope
Reuses the wave-2 `<Modal>` primitive (Esc / focus-trap / aria-modal). Stacked on
#66.

## Verification
`npm run typecheck` clean · `npm test` **140/140**. Driven end-to-end in the app:
governed a process → "Make open to everyone" → the confirm dialog appears
(`aria-modal`, impact spelled out) → confirming un-governs and the panel returns
to "open" (state restored); no silent failures.

## PR #71 — Design-review wave 6: DTP colour overload

## Why
DTP findings coloured the *kind* word (outdated/missing/contradiction/added) AND
the severity dot, so the semantic triad (`--hi/--mid/--lo`) meant two things at
once and "added" rendered green (= good/high-confidence). The element-card
colour-overload root (#1) recurring in the DTP Enhancer.

## What
Severity is now the only colour axis on a finding (the dot / left-rule / severity
word). The kind tags go neutral across all three render sites — the row
(`.dtpf-kind`), the rollup chips (`.dtpr-kind`), and the detail header
(`.dtp-finding-kind`, now a neutral outline chip). CSS-only; the kind class names
still render, just without semantic colour.

## Verification
`npm run typecheck` clean · `npm test` **140/140**. Computed-style checks:
`kind.missing` blue→`--muted`, `dtp-finding-kind.contradiction` red→neutral
outline, `dtpr-kind.added` green→neutral; the `sev-high` dot keeps `--lo` red.

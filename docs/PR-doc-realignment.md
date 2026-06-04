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
| **#18** | Read-only orchestrator layer (R10) | `feat/orchestrator-read-layer-r10` → `main` | Code + tests + docs | **Open** (`pending`) |

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

# Open follow-ups (as of PR #18)

Both product decisions (R15, R16) are **closed**, R10 is **done**, and the
**entire Processminer roadmap is delivered**. Remaining:

1. **Parked: ArchitectMiner (Theme A — R1–R4)** — the whole module is still view-only (chat is a no-op, Diagram/Traceability/Library are mock, no architect specialists). The largest remaining *functional* gap in the app. R10 (this PR) is the shared read layer its dashboard attention rows would consume.
2. **Optional:** the schema generator (derive the Draft-07 JSON Schema from the custom schema, retiring the dual-edit + drift-guard).

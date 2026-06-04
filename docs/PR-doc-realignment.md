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
| **#5** | Server-derived write authorship (R6a) | `fix/stable-user-ids-r6` → `main` | Code + docs | **Open** (`563c8ca`) |

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

# Open follow-ups (as of PR #5)

Fixed so far: **A1** (PR #2), **A3** (PR #4), **R6a** (PR #5). Still open, from
`REQUIREMENTS-ROADMAP.md`:

1. **R6b** — store the stable `username` + resolve display names at render so
   renames propagate (the integrity half of R6).
2. **R9** — lift runtime state (`reviewState`/`lint`) out of the process JSON.
3. **Schema consolidation** — merge the two `process-schema.json` copies into one
   source of truth.
4. **Product decisions** — R15 (country-variations element type) and R16
   (per-process access control).
5. Cross-read `REQUIREMENTS-ROADMAP.md` and prioritize the remaining R1–R22.

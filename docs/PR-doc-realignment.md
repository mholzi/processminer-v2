# PR — Architecture documentation realignment (JSON-native)

**Branch:** `docs/architecture-doc-realignment` → `main`
**Date:** 2026-06-04
**Type:** Documentation only — **no application code changes.**

---

## 1. Why this PR exists

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

## 2. What this PR adds / changes

| File | Change | Summary |
|---|---|---|
| `CLAUDE.md` | **new** | Project-instruction file rewritten for the JSON-native model: single-JSON data model, the "never hand-edit the JSON — go through the schema-validated writer" rule restated for `wiki-write.ts` + the MCP tools, dual-track backend, skill routing, schema/provenance contract, verification commands. |
| `SKILLS.md` | **rewritten** | Agent/skill architecture updated for the tool layer. Kept the still-valid concepts (6 perspective specialists, Brainstorm/Author/Verify, the QER step sequence, the lint council, the approval model, the button→skill map); replaced the Python-toolkit section (§6) with the `expandElement`/`createElement`/`updateElement`/`checkConformance`/`checkTransitions`/`applyLint` tools + `wiki-write.ts` server actions. |
| `DESIGN.md` | **new** | Design system refreshed and verified against `src/app/globals.css` `:root` (tokens unchanged by the migration). Adds the one new token family — `--ws-accent` workspace theming (blue = Processminer, green = ArchitectMiner) — plus dark mode and the decisions log. |
| `REQUIREMENTS-ROADMAP.md` | **new** | Triage of all 41 superseded commits into 22 candidate requirements (R1–R22) grouped into themes, with a proposed phasing. The basis for prioritizing what to re-port onto the new baseline. |
| `SUPERSEDED-MAIN-COMMITS.md` | **new** | Audit of the 41 code-touching commits that the old `main` carried but the JSON-native baseline dropped (wiki-only commits excluded), each with its commit body and non-wiki diffstat. |
| `legacy-docs/LEGACY-SKILLS.md` | **new** | The pre-rewrite `SKILLS.md`, archived to preserve its prompt-engineering research (mirrors how `LEGACY-CLAUDE.md`, `LEGACY-DESIGN.md` etc. were handled). |
| `docs/PR-doc-realignment.md` | **new** | This document. |

> **Not included:** `.claude/launch.json` (personal local dev config) is left
> out of this PR.

## 3. Known issues documented (not fixed here)

While realigning the docs, two architectural problems in the JSON-native
baseline were confirmed and are now recorded prominently in `CLAUDE.md`,
`SKILLS.md`, and `REQUIREMENTS-ROADMAP.md` so they are not forgotten. **This PR
does not fix them — it documents them.**

- **A1 — the approval gate is dead code.** The provenance contract states that
  an element with any `proposed`/`web` heading cannot be approved, but
  `UNCONFIRMED_SOURCES` in `src/lib/conformance.ts` is defined and referenced
  nowhere, so `setApproval` does not enforce the gate. Unconfirmed,
  AI-proposed content can currently be marked `approved`.
- **R9 — runtime state lives inside the wiki.** `reviewState` and `lint` are
  top-level keys inside `wiki/processes/cob-003.json`, contradicting the
  project's guardrail that runtime/orchestration state lives *above* the wiki
  layer.

Also recorded: **only `cob-003` was migrated** — every other process's content
was dropped (roadmap A2), and **the JSON schema currently exists in two copies**
(`schema/process-schema.json` and `src/lib/schema/process-schema.json`) that
must be kept in sync.

## 4. Cross-doc consistency

`CLAUDE.md` is the hub and now links the corrected set: `TARGET-ARCHITECTURE.md`
(authoritative architecture), `SKILLS.md`, `DESIGN.md`,
`.claude/skills/CORE_SYSTEM_PROMPT.md` (the shared per-skill contract),
`docs/BRIDGES_AND_TODOS.md`, and `REQUIREMENTS-ROADMAP.md`. Stale references to
the deleted Python toolkit were removed from the active docs; the historical
versions remain under `legacy-docs/` and are explicitly marked "do not follow."

## 5. Verification

- No code changed; the running app is unaffected.
- All file paths, tool names, schema locations, server-action names, and design
  tokens referenced in the new docs were checked against the actual baseline
  source (not the legacy docs) before writing.

## 6. Follow-ups (separate work, not in this PR)

1. Cross-read `REQUIREMENTS-ROADMAP.md` and prioritize R1–R22.
2. Fix A1 (wire `UNCONFIRMED_SOURCES` into `setApproval`).
3. Address R9 (lift `reviewState`/`lint` out of the process JSON).
4. Consolidate the two schema files.
5. Decide on the product-decision items (R15 country-variations, R16 per-process
   access control).

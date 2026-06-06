# Data Bridges and Remaining Refactoring TODOs

This document tracks the in-memory translation layers ("bridges") created during the transition to a JSON-Native architecture and the migration debt around them.

**Status (2026-06-06):** most of the debt is cleared. The broken write bridge (§2A), the split element-save paths (§2B), and the skill ↔ tool-surface drift (§2D) are all **resolved**. What genuinely remains: the read-side `WikiPage` DTO bridge (§1, by design), the two schema representations (§2C, drift-guarded), the optional schema generator (TODO 3), and an open `[infra]` finding — session latency/robustness scaling with document size (TODO 5). ✅ entries are kept for history; verify any claim against the code before trusting it.

---

## 1. What is the `WikiPage` Structure?

The `WikiPage` interface (defined in [wiki.ts](file:///Users/markusholzhauser/Development/Processminer2/src/lib/wiki.ts)) is a legacy-aligned **In-Memory Data Transfer Object (DTO)**.

```typescript
export interface WikiPage {
  id: string;
  type: string;
  section: string;
  title: string;
  status: ElementStatus;
  confidence?: string;
  source?: string;
  meta: Record<string, string | string[]>; // Frontmatter equivalent
  body: string;                             // Markdown body equivalent
  blocks: ProseBlock[];                     // Parsed ## Heading markdown blocks
}
```

### Purpose and History
Originally, the application stored each process element (steps, roles, exceptions, etc.) as a separate Markdown file with YAML frontmatter. The frontend UI, relations mapper, and conformance engine were designed to parse and consume these Markdown-based `WikiPage` objects.

In Sprint 3, the storage layer was unified into a single process JSON file per process (`wiki/processes/[slug].json`). However, to avoid a complete and risky rewrite of all downstream consumers, an **in-memory translation bridge** was introduced:
1. **Reads:** The application reads `[slug].json` from disk, and `getProcess` (in [wiki.ts](file:///Users/markusholzhauser/Development/Processminer2/src/lib/wiki.ts)) or `jsonElementToWikiPage` (in [gemini-worker.ts](file:///Users/markusholzhauser/Development/Processminer2/src/lib/gemini-worker.ts)) dynamically maps the JSON element attributes into the `WikiPage` structure.
2. **Benefits:** The frontend components (Flow Chart, RACI Matrix, Element Cards) and the conformance checkers can continue to operate on `WikiPage` objects without knowing that the files are now JSON on disk.

---

## 2. Other Active Bridges & Complications

The **read** path works through the `WikiPage` DTO bridge (§1). The schema layer
still carries one structural bridge (§2C). The write-path and skill-surface bugs
this section once tracked are **now resolved** — kept below as ✅ entries so the
history is legible.

### A. The Write Bridge (`wiki-write.ts`) — ✅ resolved
* **Location:** [wiki-write.ts](file:///Users/markusholzhauser/Development/Processminer2/src/lib/wiki-write.ts)
* **Was:** the server actions searched for legacy `.md` files (`findElementFile`),
  wrote markdown, then `syncMdToJson`'d the JSON — so after the `.md`
  subdirectories were deleted, any in-app SME edit/approve/relevance write
  crashed with "Element not found".
* **Now:** the actions are **fully JSON-native**. `updateElement` reads
  `wiki/processes/<slug>.json`, deep-merges the patch (handling the overview's
  root id and the approval gate) and writes it back; `setApproval` /
  `setRelevance` / `triageTargetReview` build their `meta` patch and route
  through `updateElement`. `saveElement` / `findElementFile` / `syncMdToJson` no
  longer exist (verified: zero references in `wiki-write.ts`).

### B. Element Save Paths (`ElementCard.tsx`) — ✅ resolved
* **Location:** [ElementCard.tsx](file:///Users/markusholzhauser/Development/Processminer2/src/components/ElementCard.tsx)
* **Was:** `process-step` saved via `POST /api/process/save` while `role` /
  `system` / `exception` called the broken `saveElement` — so only step edits
  succeeded.
* **Now:** **every** element type saves through the one `updateElement` server
  action (`ElementCard.save()`); approval/relevance go through
  `setApproval` / `setRelevance`; SME notes post to `/api/notes`. There is a
  single, unified JSON-native write path.

### C. Two schema representations  — *drift-guarded*
* **Location:** `schema/process-schema.json` (custom app schema — source of truth) vs. `src/lib/schema/process-schema.json` (Draft-07 JSON Schema, the "LLM output schema").
* **Corrected understanding:** these are **not** duplicate copies (the earlier `process-schema.legacy.json` was an empty leftover, now removed). They are two *different* representations of the same element-type model — a custom schema (templates/fields, drives the UI + conformance + tool schemas) and a JSON Schema (AJV validation + LLM output contract). They can't be merged into one file.
* **The Symptom:** Double maintenance — add/rename an element type and you must update both, in two formats.
* **Mitigation (shipped):** a drift-guard test (`src/lib/schema/schema-consistency.test.ts`, run by `npm test`) fails if the two files' element-type sets diverge, so the dangerous case (silent drift) is caught. It does **not** check per-field parity.
* **Possible future step:** generate the JSON Schema from the custom schema (removing the dual edit entirely) — see TODO 3.

### D. Skill ↔ tool-surface drift — ✅ resolved (the phantom-tool program, PRs #39–#46)
* **Location:** `.claude/skills/*/SKILL.md` vs. the real tool surface in [`claude-mcp-server.ts`](file:///Users/markusholzhauser/Development/Processminer2/src/lib/claude-mcp-server.ts) and [`gemini-worker.ts`](file:///Users/markusholzhauser/Development/Processminer2/src/lib/gemini-worker.ts).
* **Was:** the skills instructed the AI to call ~14 tools that had **no definition in `src/`**, so the affected skills could not complete their writes against the real backend (and `/dogfood-run` failed).
* **The real surface (now):** **19 tools**, registered identically in **both** providers — `expandElement`, `createElement`, `createElements`, `updateElement`, `checkConformance`, `checkTransitions`, `applyLint`, `writeTargetReview`, `writeSummary`, `scaffoldProcess`, `writeIngestReport`, `clearConflicts`, `createNote`, `resolveNotes`, `setApproval`, `buildQueue`, `getSessionStatus`, `advanceSession`, `startSession`. (`setRelevance` / `saveSummaryPart` / `triageTargetReview` remain in-app server actions only.) **The skills' tool-call set now exactly matches the registered tools — zero phantoms remain.** Write logic lives in pure, unit-tested helper modules (`session-create.ts`, `session-notes.ts`, `session-cursor.ts`, `session-writes.ts`); runtime/orchestration state stays in the runtime store, never the wiki.
* **How it was closed**, group by group:
  * ✅ **Rewrite onto existing tools [DONE]:** `writeOverview` / `updateProcessOverview` → `updateElement` on the overview's root id (it already patches root `meta`/`content` when `doc.meta.id === id`); `getNextId` / `generateNextId` → dropped (createElement assigns the id and returns it); `getElementTemplate` / `getTemplate` → refer to the schema template; `checkEvidence` → `checkConformance` (covers provenance). Rewritten across document-ingest, qer-session, add-entry, comment-review, foundational-run (source-cx done in the createElements PR). **No new tool surface.**
  * ✅ **Root-field tools [DONE]:** `writeIngestReport` / `clearConflicts` now write `doc.ingest` in both providers; `addSource` dropped (sources are filesystem-derived, not in the process JSON).
  * ✅ **Notes [DONE]:** `createNote` / `resolveNotes` now write `doc.notes` in both providers (shared, unit-tested `session-notes.ts`), mirroring `/api/notes`. comment-review's close-out is functional.
  * ✅ **Session-cursor API + `setApproval` [DONE]:** `buildQueue` / `getSessionStatus` / `advanceSession` (foundational, over `reviewState`) + `startSession` + a new `qerState` runtime field (qer, over the fixed step sequence) + `setApproval` now exist in both providers, backed by the pure unit-tested `session-cursor.ts`. `getSessionStatus`/`advanceSession` route by `kind` ('foundational' default | 'qer'). **The skills' tool-call set now exactly matches the registered tools — zero phantoms remain.**
* **Net:** the original root cause — the tool surface was element-scoped, with no expressible path for root-level writes (new process, overview, `ingest`, notes, the session cursors, approval) — is gone. Those paths now exist as real, schema-enforced tools in both providers, so every button skill (area-summary, council-review, source-\*, comment-review, document-ingest, qer-session, foundational-run, …) can complete its writes against the real backend.

---

## 3. Actionable TODO List

Most of the original debt is now cleared. The one genuinely-open item is the
schema generator (TODO 3); the rest are kept as ✅ records.

### 1. Refactor `wiki-write.ts` Server Actions — ✅ done
The server actions are fully JSON-native (see §2A): `updateElement` deep-merges
patches into `wiki/processes/<slug>.json` (handling the overview root id + the
approval gate); `setApproval` / `setRelevance` / `triageTargetReview` route
through it. `syncMdToJson` / `findElementFile` / `findApprovableFile` /
`saveElement` were removed.

### 2. Standardize Saving in `ElementCard.tsx` — ✅ done
[ElementCard.tsx](file:///Users/markusholzhauser/Development/Processminer2/src/components/ElementCard.tsx) saves **all** element types through the single `updateElement` server action (`ElementCard.save()`); approval/relevance go through `setApproval` / `setRelevance`; notes post to `/api/notes`. No per-type split remains.

### 4. Close the skill ↔ tool-surface gap (see §2D) — ✅ done (PRs #39–#46)
The tool surface now covers every write the skills need. Delivered group by group:
* ✅ **Process creation [DONE]** — `scaffoldProcess({slug, PROC, title, description})` + shared `buildProcessDoc` now write a fresh `wiki/processes/<slug>.json` (root meta + empty overview) in both providers. Unblocks **new-process** and `/dogfood-run` Stage 1. (An optional `POST /api/processes` route was not added — the tool path suffices since the frontend polls for the file.)
* ✅ **Batch element authoring [DONE]** — `createElements({ elements })` (shared, unit-tested `session-create.ts`, both providers) replaced the `/tmp`-scratch + run-manifest improvisation. Per-type `counts` come back in the tool result, so the source/ingest skills no longer need a manifest. Unblocks the write+report path of **source-cx / -innovation / -regulation / -target** and **document-ingest**'s element batch.
* ✅ **Root-level writes [DONE]** — the overview collapsed onto `updateElement` (#41). `writeIngestReport` + `clearConflicts` now exist in both providers (shared, unit-tested `buildIngestReport` / `clearIngestConflicts` in `session-writes.ts`), writing the `ingest` field the triage screen reads. `addSource` was **dropped** — sources are derived from `raw-sources/<slug>/` + `uploads.json` by `listSources` (written by `/api/upload`), not the process JSON, so there was no valid write; the skill now just identifies the already-uploaded file. `summaries` / `targetReview` already have `writeSummary` / `writeTargetReview`.
* ✅ **Session-cursor API + `setApproval` [DONE]** — `buildQueue` / `getSessionStatus` / `advanceSession` / `startSession` + `setApproval` in both providers; foundational cursor over `reviewState`, qer cursor over a new `qerState` runtime field; pure unit-tested `session-cursor.ts`. **This closes the skill↔tool drift entirely — every tool the skills call now exists.**
* ✅ **QER-resume dashboard tile [DONE, #46]** — `orchestrator.ts` now surfaces `resume-qer-session` from `qerState` (alongside `resume-foundational-run`), `ProcessDoc`/`getProcess` carry `qerState`, and `WelcomeScreen` renders a "Resume QER session" hero tile. Browser-verified via a synthetic runtime `qerState`.
* **Verification caveat (cursor layer):** the cursor behaviour is fully unit-tested, but the queue **order**, the QER step **granularity**, and the canonical `outcomes_line`/`closeout_template` text are read from the skill prose and **cannot be checked against a live run** here — they are plain constants in `session-cursor.ts`, trivial to adjust.

### 3. Schemas — drift-guarded (done); generator (optional, not done)
* ✅ **Done:** removed the empty `src/lib/schema/process-schema.legacy.json`; added a drift-guard test that fails if the custom schema and the JSON Schema disagree on their element-type sets (see §2C).
* ⏳ **Optional next:** the two are different representations and can't simply be merged. To remove the dual edit entirely, derive the JSON Schema (`src/lib/schema/process-schema.json`) from the custom schema (`schema/process-schema.json`) via a build-time generator + a freshness check. Only worth it if the dual maintenance proves painful.

### 5. Session latency & robustness — ⏳ open (`[infra]`)
Per-turn cost in an AI session scales with the size of the process document, so
long runs slow down monotonically as the JSON grows, and long autonomous turns
can crash/wedge the dev server. Recorded from the 2026-06-05-1841 dogfood run.
* **Symptom:** Stage-5 turns ballooned from ~3–4 min to ~15–25 min as the JSON
  reached ~140 elements; the dev server crashed mid `source-cx`; a worker
  idle-timeout left a "lost contact" wedge.
* **Root cause (read/write):** the MCP server re-reads the *whole* document
  (`JSON.parse(fs.readFileSync(...))`) on **every tool call**
  ([`claude-mcp-server.ts:470`](file:///Users/markusholzhauser/Development/Processminer2/src/lib/claude-mcp-server.ts))
  and writes the *whole* document on every mutation — so per-call cost is
  O(document size) and a multi-call turn pays it repeatedly. A targeted getter
  exists (`expandElement`) but there is no section-scoped/summary getter, so the
  worker tends to pull the full doc into context.
* **Root cause (robustness):** `TURN_TIMEOUT_MS` / `IDLE_TTL_MS` default to
  30 min ([`session-worker.ts:23-24`](file:///Users/markusholzhauser/Development/Processminer2/src/lib/session-worker.ts)),
  right at the boundary of a legitimate long turn.
* **Already mitigated (partly):** `ca5ae9f` added an SSE heartbeat (fixes the
  false "lost contact", dogfood #1) and atomic process-JSON writes (dogfood #7).
* **Recommended first slice:** a read-once-per-turn in-memory `doc` cache in the
  MCP request handler (flush on write, re-read if file mtime changed to avoid
  clobbering concurrent in-app edits).
* **Full write-up:** [SESSION-LATENCY-AND-ROBUSTNESS.md](file:///Users/markusholzhauser/Development/Processminer2/docs/SESSION-LATENCY-AND-ROBUSTNESS.md).

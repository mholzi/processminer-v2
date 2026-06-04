# Data Bridges and Remaining Refactoring TODOs

This document outlines the in-memory translation layers ("bridges") created during the transition to a JSON-Native architecture (Sprint 3) and documents outstanding technical debt and TODOs to simplify the codebase.

---

## 1. What is the `WikiPage` Structure?

The `WikiPage` interface (defined in [wiki.ts](file:///Users/devuser/processminer-v2/src/lib/wiki.ts)) is a legacy-aligned **In-Memory Data Transfer Object (DTO)**.

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
1. **Reads:** The application reads `[slug].json` from disk, and `getProcess` (in [wiki.ts](file:///Users/devuser/processminer-v2/src/lib/wiki.ts)) or `jsonElementToWikiPage` (in [gemini-worker.ts](file:///Users/devuser/processminer-v2/src/lib/gemini-worker.ts)) dynamically maps the JSON element attributes into the `WikiPage` structure.
2. **Benefits:** The frontend components (Flow Chart, RACI Matrix, Element Cards) and the conformance checkers can continue to operate on `WikiPage` objects without knowing that the files are now JSON on disk.

---

## 2. Other Active Bridges & Complications

While the read path works cleanly, several half-migrated writing and schema paths complicate the codebase and create bugs:

### A. The Broken Write Bridge (`wiki-write.ts`)
* **Location:** [wiki-write.ts](file:///Users/devuser/processminer-v2/src/lib/wiki-write.ts)
* **The Problem:** The server actions `saveElement`, `setApproval`, `setRelevance`, and `triageTargetReview` were not fully migrated to the new JSON-Native model. They still search for legacy `.md` files on disk (via `findElementFile`), attempt to write markdown content to those paths, and then call `syncMdToJson` to update the JSON file.
* **The Symptom:** Since Sprint 3 deleted the subdirectories containing `.md` files, any manual SME action in the UI (editing a role/system/exception, approving/rejecting an element, or triaging relevance) throws an **"Element not found" error** and crashes the write request.

### B. Mismatched Element Save Paths (`ElementCard.tsx`)
* **Location:** [ElementCard.tsx](file:///Users/devuser/processminer-v2/src/components/ElementCard.tsx)
* **The Problem:** For `process-step` elements, saving is done via a client POST to `/api/process/save` (which natively parses and updates the `[slug].json` file). But for `role`, `system`, and `exception` elements, saving is done by calling `saveElement` directly from `wiki-write.ts` (which triggers the broken `.md` file check).
* **The Symptom:** Only process step edits succeed; other element edits fail.

### C. Two schema representations  — *drift-guarded*
* **Location:** `schema/process-schema.json` (custom app schema — source of truth) vs. `src/lib/schema/process-schema.json` (Draft-07 JSON Schema, the "LLM output schema").
* **Corrected understanding:** these are **not** duplicate copies (the earlier `process-schema.legacy.json` was an empty leftover, now removed). They are two *different* representations of the same element-type model — a custom schema (templates/fields, drives the UI + conformance + tool schemas) and a JSON Schema (AJV validation + LLM output contract). They can't be merged into one file.
* **The Symptom:** Double maintenance — add/rename an element type and you must update both, in two formats.
* **Mitigation (shipped):** a drift-guard test (`src/lib/schema/schema-consistency.test.ts`, run by `npm test`) fails if the two files' element-type sets diverge, so the dangerous case (silent drift) is caught. It does **not** check per-field parity.
* **Possible future step:** generate the JSON Schema from the custom schema (removing the dual edit entirely) — see TODO 3.

### D. Skill ↔ tool-surface drift (the skills assume tools the backend never exposes)
* **Location:** `.claude/skills/*/SKILL.md` vs. the real tool surface in [`claude-mcp-server.ts`](file:///Users/markusholzhauser/Development/Processminer2/src/lib/claude-mcp-server.ts) and [`gemini-worker.ts`](file:///Users/markusholzhauser/Development/Processminer2/src/lib/gemini-worker.ts).
* **The real surface:** the AI session is given **exactly six** tools — `expandElement`, `createElement`, `updateElement`, `checkConformance`, `checkTransitions`, `applyLint`. (`setApproval` / `setRelevance` / `saveSummaryPart` / `triageTargetReview` exist only as in-app server actions in `wiki-write.ts`, not as session tools.) The data-model references in the skills (old folder/`index.md`/sidecar paths) **were migrated to JSON-native** in the skill-migration pass; this entry is the *remaining* drift.
* **The Problem:** the skill prompts instruct the worker to call a much richer orchestration surface that **does not exist anywhere in `src/`** (0 definitions). Confirmed phantom tools and their callers:
  * `scaffoldProcess` — **new-process**. No tool (and no API route) creates a new process document, and the MCP server throws `Process document not found for slug` for any slug whose `wiki/processes/<slug>.json` is absent. **New-process is non-functional end-to-end**, and the `/dogfood-run` harness fails at Stage 1 for this reason.
  * `getSessionStatus` / `startSession` / `advanceSession` / `updateProcessOverview` — **qer-session** (the resumable QER cursor + overview write).
  * `addSource` / `getSourceReport` / `generateSourceReport` / `createElements` / `writeElements` / `resetManifest` / `mergeManifests` — **document-ingest**, **source-\*** (batch element authoring + the ingest/source manifest).
  * `writeOverview` / `writeSummary` / `writeIngestReport` / `writeTargetReview` / `clearConflicts` / `getElementTemplate` / `checkEvidence` — **area-summary**, **council-review**, **conflict-resolution**, **document-ingest**.
* **Root cause:** the JSON-native backend migration is incomplete (cf. CLAUDE.md: "only `cob-003.json` has been migrated"). Crucially, the six tools are **element-scoped**, so root-level writes the skills need — creating a new process, writing the overview, `summaries`, `targetReview`, the `ingest` report, batch element creation — have **no expressible path** with the current surface; closing this gap requires backend work, not just skill edits.
* **Symptom:** every skill that depends on a phantom tool cannot complete its write step under the real backend; non-interactive button skills (area-summary, council-review, source-\*) and the create/ingest flows are the most exposed.

---

## 3. Actionable TODO List

To fully transition to a JSON-Native architecture and eliminate these brittle bridges, the following tasks must be completed:

### 1. Refactor `wiki-write.ts` Server Actions [CRITICAL]
Convert the following actions to be completely JSON-native:
* `saveElement`: Instead of reading/writing `.md` files, update the fields and blocks directly in the process JSON (`wiki/processes/[slug].json`).
* `setApproval`: Read the process JSON, find the element by ID, update its `meta.approval` fields directly in the JSON, and write it back.
* `setRelevance`: Read the process JSON, find the element by ID, update its `meta.relevance` fields directly in the JSON, and write it back.
* `triageTargetReview`: Update target approvals directly in the process JSON instead of searching for `.md` files.
* Remove `syncMdToJson`, `findElementFile`, and `findApprovableFile` once no longer needed.

### 2. Standardize Saving in `ElementCard.tsx`
* Update [ElementCard.tsx](file:///Users/devuser/processminer-v2/src/components/ElementCard.tsx) to save all element types (`process-step`, `role`, `system`, `exception`) through the same unified pathway (either a unified JSON-native API route or a unified `saveElement` server action).

### 4. Close the skill ↔ tool-surface gap (see §2D) [CRITICAL for new-process / dogfood]
The skills' data-model references are migrated, but they still call tools the backend does not expose. Decide and implement a tool surface that covers the writes the skills need (none are expressible with the current six element-scoped tools):
* **Process creation** — a `scaffoldProcess`-style tool (+ API route) that writes a fresh `wiki/processes/<slug>.json` with `meta` + empty `content`. Unblocks **new-process** and `/dogfood-run` Stage 1.
* **Root-level writes** — tools for the overview, `summaries`, `targetReview`, the `ingest` report (used by qer-session, area-summary, council-review, conflict-resolution, document-ingest). These write process-JSON fields outside the element arrays.
* **Batch element authoring + source manifest** — `createElements` / source-manifest tools used by document-ingest and the `source-*` skills.
* Until then, treat new-process, qer-session, document-ingest, conflict-resolution, area-summary, council-review and source-* as **not runnable end-to-end** against the real backend, and keep `/dogfood-run` out of CI.

### 3. Schemas — drift-guarded (done); generator (optional, not done)
* ✅ **Done:** removed the empty `src/lib/schema/process-schema.legacy.json`; added a drift-guard test that fails if the custom schema and the JSON Schema disagree on their element-type sets (see §2C).
* ⏳ **Optional next:** the two are different representations and can't simply be merged. To remove the dual edit entirely, derive the JSON Schema (`src/lib/schema/process-schema.json`) from the custom schema (`schema/process-schema.json`) via a build-time generator + a freshness check. Only worth it if the dual maintenance proves painful.

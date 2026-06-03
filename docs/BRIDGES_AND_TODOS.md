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

### C. Duplicated Process Schemas
* **Location:** `schema/process-schema.json` vs. `schema/process-schema.legacy.json`
* **The Problem:** The system maintains two separate schemas. `wiki.ts` still loads `process-schema.legacy.json` to drive templates and fields, while newer modules load the standard `process-schema.json`.
* **The Symptom:** Double maintenance. Changes to the schema fields or templates must be mirrored across both JSON files.

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

### 3. Consolidate Schemas
* Merge the definitions of `schema/process-schema.legacy.json` into `schema/process-schema.json` (or vice-versa).
* Point all schema loaders (e.g. `getSchema` in `wiki.ts`) to use a single source of truth file: `schema/process-schema.json`.

# Processminer v3 Refactoring Plan & Road Map

This document serves as the persistent single source of truth for the **Processminer v3 Refactoring Plan**. It outlines our transition from the legacy CLI/Markdown architecture to the new strongly-typed, JSON-Native target architecture.

---

## 1. Core Engineering Philosophy: The "Tracer Bullet"
Following Agile best practices, we reject waterfall engineering. We build **vertical slices** across all layers of the stack (Data Layer ↔ UI Views ↔ LLM Integration) on a reduced-complexity domain before scaling up complexity. This ensures we prove our architectural assumptions (Next.js App Router, Pure JSON Schema, and GenAI SDK) early and avoid late, high-risk surprises.

### Established Architecture Agreement (Pure JSON Schema):
Per our ADR (Architecture Decision Record) in `target_architecture_spec.md`, **we standardize on standard JSON Schema (using AJV validation)** as our golden source of truth. We explicitly **do not use Zod** for target validation to avoid schema drift, ensure strict OpenAPI compatibility for the Gemini API (`response_schema`), and maintain portable, JSON-standard rules.

---

## 2. Sprint Roadmap

### Sprint 1: The "Tracer Bullet" (Process Steps Only) — *Completed*
* **Goal:** Prove the end-to-end JSON architecture (Data, Read UI, Edit UI, Linting, and LLM) on a deliberately simplified domain. We ONLY support `Process Steps` in this sprint and ignore all other elements (roles, pain points, exceptions).
* **Showcase:** You can view, manually edit, and use AI to generate process steps for a migrated process (e.g. `COB-003`) in a fully functioning Next.js environment without legacy Python scripts.
* **Key Tasks:**
  - **Schema:** Define a minimal standard JSON Schema (`schema/process-schema.json`) containing only the `ProcessStep` definition and root metadata.
  - **Data Migration:** Manually migrate the process steps from `COB-003` into a single `COB-003.json` file.
  - **Read UI:** Strip back `ProcessDocScreen.tsx` to read natively from the JSON file and render the list of steps.
  - **Edit UI & Linting:** Implement standard form inputs to edit a process step. Wire up the synchronous JSON Schema (AJV) linter and a Next.js API route to save changes.
  - **LLM Authoring:** Wire up the GenAI SDK in `src/app/api/session/route.ts` to output compliant `ProcessStep` JSON using the new JSON Schema natively, completely bypassing the Claude CLI.

### Sprint 2: Expanding the Domain Model — *Completed*
* **Goal:** Port the remaining existing functionality into the JSON data format and unify the UI. (Note: We exceeded the original goal by introducing a unified, schema-driven premium editor for all artifact types).
* **Showcase:** The application now supports all existing legacy element types natively in JSON. The UI features a single unified component (`ElementCard.tsx`) with premium functionality, including searchable comboboxes with `[ID] - [Name]` mapping, dynamic full-width layouts, and integrated schema validation.
* **Key Tasks:**
  - **Schema Expansion:** Expanded the JSON Schema definition to comprehensively cover all 20+ structural elements.
  - **Data Migration:** Ported all existing markdown files into the central `[slug].json`. The app no longer depends on legacy MD files.
  - **UI Consolidation & Premium Features:** Refactored `ElementCard.tsx` to dynamically handle all artifact types based on the JSON schema, deprecating redundant components like `ProcessStepForm.tsx`.
  - **Python Bridge Extension:** Extended temporary Python bridging to support legacy operations until decommissioning in Sprint 4.

### Sprint 3: The Native AI Authoring Slice — *Up Next*
* **Goal:** Port the legacy "specialist skills" directly to Next.js prompts.
* **Showcase:** Brainstorm, draft, and modify process steps natively inside the master JSON file (`wiki/processes/[slug].json`) without touching or generating legacy markdown files.
* **Key Tasks:**
  - **Prompt Translation:** Convert the legacy Claude Code specialist markdown skills (`.claude/skills/`) to native system prompt templates.
  - **Worker Pool:** Connect the warm-worker pool to execute prompt templates natively via the GenAI SDK using Structured Outputs validated against our JSON Schema.

### Sprint 4: Full Migration & Legacy Cleanup — *Pending*
* **Goal:** Complete the migration of all remaining processes and safely decommission legacy pipelines, resolving any loose ends from the "Two-World" transition phase.
* **Showcase:** Deletion of all legacy scripts and folders; the entire test suite runs pure TypeScript/Vitest in Next.js.
* **Key Tasks:**
  - **Process Migration:** Execute migration utility to migrate any remaining markdown-based processes to JSON.
  - **Bridge Decommissioning:** Remove `# DEPRECATED-V2-BRIDGE` code in Python scripts and transition purely to the JSON native system.
  - **Decommissioning:** Delete legacy folders and script files (e.g. `scripts/wiki/`, `.claude/skills/`).

---

## 3. Sprint 1 Learnings (For Re-incorporation into Future Sprints)

During the execution of **Sprint 1 Task 5**, we resolved several key architectural and technical challenges. These learnings are locked here to streamline the execution of Sprints 2–4:

### A. The "Two-World" Format Translation
* **Problem:** Legacies of the Python pipeline expect frontmatter markdown (`PS-COB-001.md`), while our target architecture expects a single JSON file.
* **Solution:** We implemented a bidirectional `VirtualPath` bridge in Python (`wiki_lib.py`) intercepting standard I/O calls.
* **Future Learnings:**
  - **Array Handling:** Lists like `inputs` and `outputs` are parsed as strings in markdown lists (`- text`) but stored as arrays of strings in JSON (`["text"]`). The parser/bridge must strip leading bullets (`-` or `*`) and trim whitespace.
  - **Searchable Tagging:** Keep all transitional logic clearly flagged with `# DEPRECATED-V2-BRIDGE` to facilitate a flawless grep search and delete phase in Sprint 4.

### B. Keep-Alive Overview Synchronization
* **Problem:** Standard overview updates made by scripts like `write_overview.py` and `add_source.py` write directly to `index.md` on disk, leaving `[slug].json`'s metadata out of sync.
* **Solution:** We introduced a synchronization runner `sync_index_md_to_json(slug)` that parses `index.md` changes and syncs the process overview metadata/content directly into `[slug].json`.
* **Future Learning:** Always run downstream sync actions immediately when modifying human-facing structural files during the bridging phases.

### C. Test Suite Isolation
* **Problem:** Python unit tests (`test_wiki_scripts.py`) verify the writing and formatting of files directly on disk, which breaks our JSON-native isolated target.
* **Solution:** Injecting `VirtualPath` dynamically in the test harness intercepts file mutations on disk, keeping the python test suite 100% green while writing strictly to JSON.
* **Future Learning:** Maintain a strict separation between mock virtual paths and host filesystem paths during the transition sprints to prevent polluting the codebase.

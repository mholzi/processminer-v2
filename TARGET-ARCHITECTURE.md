# Processminer v3: JSON-Native Target Architecture

## 1. Executive Summary & Drivers for Change

The current Processminer architecture was designed around the constraints of a CLI-based LLM runner (Claude Code), resulting in a fragmented data model (one Markdown file per node) and a heavy reliance on Python scripts for deterministic validation and formatting. 

The **Processminer v3 Architecture** simplifies the stack by standardizing on a **JSON-Native** design. By leveraging the GenAI SDK's native Structured Outputs and the local Claude Model Context Protocol (MCP) Server, the architecture collapses the complexity of text-parsing and script-based validation into a clean, strongly-typed, state-driven application.

### Key Drivers for Simplification:
- **Elimination of Scripts:** All deterministic formatting, ID generation, and validation scripts are replaced by standard programmatic functions and schema validators (e.g., Zod or JSON Schema).
- **Single Source of Truth:** A single JSON document stores the entire state of a process, eliminating filesystem fragmentation and making cross-referencing and linting instantaneous.
- **Native Structured Outputs & MCP Tooling:** The LLM focuses purely on business logic and extraction, relying on backend tooling to enforce structural compliance natively.
- **Dynamic UI Rendering:** Read/write interfaces, navigation, and progress tracking are dynamically driven by the JSON schema and the process document.

---

## 2. Data Model & Schema Architecture

The architecture is driven by a clear separation between the **Process Schema** (the blueprint) and the **Process JSON** (the data instance). There is a one-to-many relationship: one schema will support many process instances (e.g. COB003, Sapa, Funds Release).

### 2.1 Process Schema (The Blueprint)
The Process Schema is a heavily documented configuration file that dictates the structure of any process. It is composed of two layers for each element type:
1. **Process Meta-Data Schema:** Defines the application-managed fields required for state management (e.g., `id`, `status`, progress index).
2. **LLM Output Schema:** Defines the exact payload the LLM is expected to generate for a specific node (e.g., `stepName`, `stepDescription`, `RACI`, `controls`, `systems`). 

*Example:* A `Role` schema combines the Meta-Data (`id`, `status`) and the LLM Output Schema (`RACI`, `controls`, `systems`).

### 2.2 Process JSON (The Instance)
A single JSON file (e.g., `COB-003.json`) represents a specific process. It is the instantiated version of the Process Schema.
- It contains the overall **Process Meta-Data** (e.g., `progressIndex`).
- It contains hierarchical arrays of all nodes (`roles`, `steps`, `painPoints`), where each node contains both its `Meta Data` and its `Content`.
- It serves as the complete, portable state of the process, making it trivial to serialize, track in Git, and load into the application UI.

---

## 3. Architecture Layers

### 3.1 The Discovery Orchestrator
The Orchestrator is a deterministic engine that uses the Process JSON to drive the discovery workflow.
- **State Management:** It creates the initial JSON instance from the Process Schema and manages the state of the JSON file deterministically.
- **Workflow Control:** It tracks overall progress, indicating how far the whole discovery process has gone.
- **Node Lifecycle:** When a new element is added to the Process JSON, the Orchestrator assigns IDs, sets default statuses (e.g., `draft`), and ensures the node complies with the schema.

### 3.2 Navigation & UI Rendering Layer
The entire frontend is a reflection of the Process JSON. All detail views are dynamically rendered from the JSON (filtered down to the specific section or artifact).
- **Navigation UI:** The progress menu and navigation are dynamically rendered from the process file, surfacing progress and error counts.
- **View / Render / Edit UI:** 
  - **Generic Renderers:** Automate formatting and data entry rendering in a standard way based on the schema. When a record is manually edited, references and dependencies are driven via dropdowns pulled by running JSON queries on the document.
  - **Custom Renderers:** Used for complex visualizations like the RACI matrix or process flow diagrams.

### 3.3 Deterministic Validation (Linting)
Deterministic validation is done against two dimensions, replacing the legacy `check_conformance.py` script:
1. **Process Schema Validation:** Ensures mandatory fields and correct types are present based on the overarching schema.
2. **Process JSON Validation (Integrity):** Cross-node dependencies (e.g., ensuring a transition points to a valid step ID) are validated deterministically by querying the Process JSON.
- **Error State Management:** The linting process resets the status for nodes that have errors. Nodes with problems will carry an error element containing the details, which is instantly reflected in the Navigation UI.

### 3.4 LLM Interactions
The LLM interaction is highly optimized to be clean, focused, and cheap.
- **Targeted Output Schemas:** Only specific artifact content + the LLM output schema content is fed to the LLM. 
- **Fragmented Context:** Because the AI chat authors one node at a time, it is only given the JSON fragment for that given node (extracted from the full JSON). This keeps the context window small and relevant.
- **Document Review:** If the AI needs to review the whole document, the application creates a filtered version of the entire JSON—stripping heavy metadata via simple JSON filters.
- **Cross-LLM Compatibility (Dual-Track):** The backend supports dual-track execution. For `SESSION_PROVIDER=gemini`, the application uses the `@google/genai` SDK in-process. For `SESSION_PROVIDER=claude`, it utilizes a lightweight local MCP server (`src/lib/claude-mcp-server.ts`) ensuring the local Claude CLI has native access to the exact same schema-enforced tools (`expandElement`, `createElement`, `updateElement`, etc.).

### 3.5 Transformation of Skills
In the legacy architecture, "skills" were standalone Markdown files (`.claude/skills/SKILL.md`) designed to be executed by the Claude Code CLI. They contained a mix of domain knowledge, explicit instructions for formatting elements, and exact bash commands to shell out to Python scripts (e.g., `write_element.py`).

In the new JSON-Native architecture, skills are transformed and dramatically simplified:
- **From CLI Agents to System Prompts:** Skills are no longer CLI agent wrappers. They become pure **Reasoning System Prompt Templates** stored natively in the application codebase (`CORE_SYSTEM_PROMPT.md` + specialist domain logic).
- **Separation of Concerns:** 
  - The **Domain Expertise** (e.g., "You are a Process Specialist") remains strictly in the prompt.
  - The **Structural Rules:** Macro formatting is guaranteed natively by the JSON schema structure. If "inputs" are modeled as a JSON array (`string[]`), the schema natively enforces bounds.
  - The **Stylistic Rules:** For free-form Markdown fields, stylistic guidance can be embedded cleanly into the JSON schema's `description` properties, leaving the main system prompt focused on domain expertise.
  - The **File Writing & Command Execution** is removed, as the Discovery Orchestrator handles all state updates and file I/O deterministically via Tool Calls.
- **Orchestration:** The legacy `qer-session` skill is completely replaced by the programmatic **Discovery Orchestrator**, which deterministically controls the flow of the session, selects the appropriate skill prompt, and merges the LLM's structured JSON output into the master Process JSON document.

---

## 4. Automated Domain Migration & Schema Inference

To transition seamlessly from legacy Markdown repositories to standard, strongly-typed JSON schemas without data loss, the architecture includes a specialized migration and schema-inference utility:
- **Migration & Schema-Inference Script:** `scripts/migrate-and-infer-schema.js` is the golden-source script that recursively reads legacy Markdown files, dynamically infers their schemas, compiles a Draft-07 JSON Schema in `src/lib/schema/process-schema.json`, and merges all 22+ elements cleanly into `wiki/processes/[slug].json`.
- **Smart List Extraction:** The script parses block descriptions (e.g. `Inputs` or `Outputs` sections) dynamically, translating plain prose paragraphs or bulleted lists into validated JSON arrays while ignoring commas inside parentheses to prevent incorrect element splits.

---

## 5. Native AI Authoring Architecture

This section details the unified AI authoring pipeline that replaces the legacy Claude CLI skills and provides the rationale behind the Progressive Disclosure model.

### 5.1 Core Engineering Strategy

We are moving away from bash-script driven AI interaction toward a highly efficient, strongly-typed JSON architecture.

- **Skill Continuity:** We retain the legacy `SKILL.md` files to preserve prompt-engineering research, but heavily **refactor** them. We strip out all instructions detailing how to interact with the filesystem. They become pure **Reasoning Skills**.
- **Dual-Track Execution:** To ensure backward compatibility, the backend dynamically constructs the System Prompt. For Gemini, it passes it to the `@google/genai` SDK. For Claude, the CLI connects to a custom local MCP server (`src/lib/claude-mcp-server.ts`), utilizing the exact same backend tooling and JSON schemas.
- **Sidecar Consolidation:** All legacy sidecar files (`qer-state.json`, `notes.json`, `lint.json`, `sections.json`, `glossary.json`, `ingest.json`, `review-state.json`) are migrated into the root `[slug].json` file under a `meta` block. The system only reads/writes a single JSON file per process.

### 5.2 The Context Model: Progressive Disclosure

To make the LLMs highly effective while minimizing token bloat and round-trip delays, we split context into two distinct tiers: **Document Map** (injected instantly on load) and **Dynamic Tools** (callable API methods).

#### A. Document Map (Injected on Load)
Rather than forcing the model to run `grep` or read a 15,000-token file to orient itself, we inject a "Progressive Disclosure" payload directly into the system prompt:

1. **Root Preservation:** Preserves the root `meta` and `content` (the Global Process Overview) fully intact.
2. **Active Element Expansion:** Fully expands the specific artifact currently being edited.
3. **Dynamic Reference Lists:** Uses the JSON schema to automatically identify arrays referenced by the active element (e.g., `roles`, `systems`) and provides a single-line list of their IDs and Titles.
4. **Aggressive Abridgment:** Collapses all other unrelated arrays and sibling elements into single-line lists or integer counts marked with `/*...*/` to indicate they are expandable.
5. **Schema Purity:** Never uses bespoke wrappers. It uses the exact standard schema structure at all times, guaranteeing zero cognitive friction.

#### B. Dynamic Tools (Callable mid-conversation)
When the default collapsed view is not enough, the model can natively navigate the context using specific expansion tools.

| Dynamic Tool | Backend Implementation | Purpose |
|---|---|---|
| `expandElement({ type, id })` | Natively reads `[slug].json` | Universal expander. If only `type` is provided, expands an integer count into a list of IDs/Titles. If `id` is also provided, expands a specific abridged element to reveal its full rich-text content. |
| `createElement({ type, element })` | Appends object to `[slug].json` | Creates a new element. The backend automatically generates and returns the new unique ID (e.g., PS-COB-008), hiding ID management from the model. |
| `updateElement({ id, patch: {} })` | Deep merges patch into existing element | Edits an existing element. |
| `updateSessionState()` | Updates `meta.qerState` or `meta.reviewState` | Moves the orchestration cursor forward. |

### 5.3 The 21-Skill Inventory & Context Mapping

This matrix defines the context and tools available for every skill. Under the Progressive Disclosure architecture, the "Document Map" is universally driven by the active element, and all skills rely on the `expand*` tools for navigation.

#### Core Elicitation Specialists
*Interactive sessions with the SME to draft elements.*

| Skill | Document Map Generation | Dynamic Tools |
|---|---|---|
| `process-specialist` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `updateElement` |
| `it-architect` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `updateElement` |
| `control-compliance` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `updateElement` |
| `client-journey` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `updateElement` |
| `innovation-analyst` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `updateElement` |
| `transformation-agent` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `updateElement` |

#### Orchestrators & Workflows
*Manage session state and orchestrate hand-offs. Do not loop elements; they loop perspectives.*

| Skill | Document Map Generation | Dynamic Tools |
|---|---|---|
| `qer-session` | `generateDocumentMap(null)` | `expandElement`, `updateSessionState` |
| `foundational-run` | `generateDocumentMap(null)` | `expandElement`, `updateSessionState` |
| `document-ingest` | `generateDocumentMap(null)` | `createElement`, `updateElement` |
| `run-lint` | The complete `[slug].json` structure | `updateElement` |
| `new-process` | List of existing process slugs | `scaffoldProcess` |

#### Autonomous Sourcing Agents
*Web-search enabled skills that scrape data autonomously.*

| Skill | Document Map Generation | Dynamic Tools |
|---|---|---|
| `source-cx` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `webSearch` |
| `source-innovation` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `webSearch` |
| `source-regulation` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement`, `webSearch` |
| `source-target` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement` |

#### Utilities & Review
*Targeted helpers for specific edge cases.*

| Skill | Document Map Generation | Dynamic Tools |
|---|---|---|
| `add-entry` | `generateDocumentMap(null)` | `createElement` |
| `area-summary` | `generateDocumentMap(activeCollection, activeId)` | `expandElement`, `createElement` |
| `comment-review` | `generateDocumentMap('notes', activeId)` | `expandElement`, `updateElement` |
| `conflict-resolution`| `generateDocumentMap('ingestState', activeId)` | `expandElement`, `updateElement` |
| `council-review` | `generateDocumentMap(null)` | `createElement` |
| `dogfood-run` | Entire application schema structure | `simulateQA` |

### 5.4 Document Map Example (Editing a Process Step)

To strictly enforce the rule of using **no new elements** and **zero bespoke schemas**, while maximizing token efficiency, the context injected into the LLM is simply a Progressive Disclosure projection of the exact `[slug].json` standard schema.

**System Instructions & Dynamic Tools**:
All AI skills will include a system instruction explaining this structure: *"You are presented with the full context of the document. Elements or arrays that are collapsed for brevity are marked with the `/*...*/` comment. If you need more details to perform your task, you can expand them using the universal `expandElement({ type, id })` tool."*

Executing this dynamically produces the following highly compressed JSON5 payload. Notice how there are no bespoke schema wrappers, and lists are formatted onto single lines to aggressively save tokens while maintaining perfect IDE-like readability!

```json5
{
  "meta": {
    "id": "COB-003",
    "type": "process",
    "section": "overview",
    "status": "confirmed",
    "confidence": "high",
    "source": "DTP-BB-ONB-001 v2.3",
    "docStatus": "As-Is validated"
  },
  "content": {
    "title": "Client Onboarding (BizBanking)",
    "processOwner": "ROLE-COB-005",
    "trigger": "Online portal · RM paper application · Branch referral · Partner channel",
    "frequency": "Continuous during business hours, real-time processing",
    "scopeIn": "KYC identity verification, regulatory screening (AML/PEP/Sanctions), risk assessment, optional credit facility, account setup, activation",
    "scopeOut": "Ongoing account servicing, product cross-selling, existing-client changes, offboarding",
    "processInput": "Client application + required business documents",
    "processOutput": "Fully operational business account (optionally incl. overdraft facility)",
    "description": "The Client Onboarding process establishes a new banking relationship with a business client (annual turnover up to €10M)."
  },
  "process-steps": [
    { "meta": { "id": "PS-COB-001" /*...*/ }, "content": { "title": "Application Receipt & Initial Triage" /*...*/ } },
    { "meta": { "id": "PS-COB-002" /*...*/ }, "content": { "title": "KYC & Identity Verification" /*...*/ } },
    {
      "meta": {
        "id": "PS-COB-003",
        "type": "process-step",
        "section": "process-steps",
        "status": "confirmed",
        "confidence": "high",
        "source": "DTP-BB-ONB-001 v2.3",
        "approval": "rejected",
        "sequence": 3
      },
      "content": {
        "title": "Credit Assessment",
        "inputs": [
          "The cleared KYC file",
          "The client's requested facility amount"
        ],
        "outputs": [
          "An approved credit limit",
          "A decline"
        ],
        "owner": "Credit Analyst",
        "sla": "3 business days",
        "systems": [
          "SYS-COB-006"
        ],
        "condition": "If overdraft requested",
        "description": "When the client has requested an overdraft facility, the Credit Analyst assesses creditworthiness using the credit decisioning system and external bureau data, applies the scorecard, and reaches a decision within their approval authority."
      }
    },
    { "meta": { "id": "PS-COB-004" /*...*/ }, "content": { "title": "Account Setup & Configuration" /*...*/ } }
  ],
  "roles": [
    { "meta": { "id": "ROLE-COB-001" /*...*/ }, "content": { "title": "Operations Officer" /*...*/ } },
    { "meta": { "id": "ROLE-COB-002" /*...*/ }, "content": { "title": "KYC Analyst" /*...*/ } }
  ],
  "systems": [
    { "meta": { "id": "SYS-COB-001" /*...*/ }, "content": { "title": "CRM (Salesforce)" /*...*/ } },
    { "meta": { "id": "SYS-COB-002" /*...*/ }, "content": { "title": "OWS (Onboarding Workflow System)" /*...*/ } }
  ],
  "exceptions": 5 /*...*/,
  "audit-findings": 1 /*...*/,
  "channels": 4 /*...*/
}
```

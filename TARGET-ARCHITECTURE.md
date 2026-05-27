# Processminer v3: JSON-Native Target Architecture

## 1. Executive Summary & Drivers for Change

The current Processminer architecture was designed around the constraints of a CLI-based LLM runner (Claude Code), resulting in a fragmented data model (one Markdown file per node) and a heavy reliance on Python scripts for deterministic validation and formatting. 

The **Processminer v3 Architecture** simplifies the stack by standardizing on a **JSON-Native** design. By leveraging the GenAI SDK's native Structured Outputs (and Claude's Tool Use equivalent), the architecture collapses the complexity of text-parsing and script-based validation into a clean, strongly-typed, state-driven application.

### Key Drivers for Simplification:
- **Elimination of Scripts:** All deterministic formatting, ID generation, and validation scripts are replaced by standard programmatic functions and schema validators (e.g., Zod or JSON Schema).
- **Single Source of Truth:** A single JSON document stores the entire state of a process, eliminating filesystem fragmentation and making cross-referencing and linting instantaneous.
- **Native Structured Outputs:** The LLM focuses purely on business logic and extraction, relying on the GenAI SDK to enforce structural compliance natively.
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
- **Document Review:** If the AI needs to review the whole document, the application creates a filtered version of the entire JSON—stripping heavy metadata via simple JSON filters—to provide exactly what is relevant.
- **Cross-LLM Compatibility:** The architecture utilizes GenAI SDKs to implement Native Structured Outputs (Gemini `response_schema`) or equivalent Tool Use/Function Calling (Claude SDK `input_schema`), making it seamlessly configurable across environments.

### 3.5 Transformation of Skills
In the legacy architecture, "skills" were standalone Markdown files (`.claude/skills/SKILL.md`) designed to be executed by the Claude Code CLI. They contained a mix of domain knowledge, explicit instructions for formatting elements, and exact bash commands to shell out to Python scripts (e.g., `write_element.py`).

In the new JSON-Native architecture, skills are transformed and dramatically simplified:
- **From CLI Agents to System Prompts:** Skills are no longer CLI agent wrappers. They become pure **System Prompt Templates** stored natively in the application codebase.
- **Separation of Concerns:** 
  - The **Domain Expertise** (e.g., "You are a Process Specialist, ask questions about exceptions") remains strictly in the prompt.
  - The **Structural Rules:** Macro formatting (e.g., ensuring a step has distinct inputs and outputs) is guaranteed natively by the JSON schema structure. If "inputs" are modeled as a JSON array (`string[]`), the schema can natively enforce bounds like `minItems: 2, maxItems: 6`.
  - The **Stylistic Rules:** For free-form Markdown fields (e.g., a "description" text block), the model retains freedom of expression. Stylistic guidance ("keep it under 60 words") can be embedded cleanly into the JSON schema's `description` properties, leaving the main system prompt focused on domain expertise.
  - The **File Writing & Command Execution** is removed, as the Discovery Orchestrator handles all state updates and file I/O deterministically.
- **Orchestration:** The legacy `qer-session` skill (which acted as an orchestrator by dispatching other skills via a CLI loop) is completely replaced by the programmatic **Discovery Orchestrator**, which deterministically controls the flow of the session, selects the appropriate skill prompt, and merges the LLM's structured JSON output into the master Process JSON document.

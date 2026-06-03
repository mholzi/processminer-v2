# Changelog

All notable changes to the Processminer project architecture and refactoring will be documented in this file.
For complete architectural details, refer to the [TARGET-ARCHITECTURE.md](file:///Users/devuser/processminer-v2/TARGET-ARCHITECTURE.md) document.

## [v3.0.0] - Refactoring to JSON-Native Architecture

### Added
- **JSON-Native Data Model**: Replaced fragmented markdown structure with a unified, strongly-typed JSON file per process (`[slug].json`), acting as the single source of truth.
- **Dynamic Schema-Driven UI**: Introduced generic renderers (`ElementCard.tsx`) to automate data entry and formatting across all 20+ element types based on JSON schema validation.
- **Claude MCP Server**: Implemented an MCP server (`src/lib/claude-mcp-server.ts`) for real Claude CLI integration, exposing shared schema-enforced tools natively.
- **Progressive Disclosure Context Model**: Reduced LLM token bloat by dynamically injecting a collapsed view of the process document while providing `expandElement` and `createElement` tools for targeted navigation.
- **Compositional System Prompts**: Consolidated duplicate AI instruction boilerplate into a central `CORE_SYSTEM_PROMPT.md`, letting individual `SKILL.md` files focus purely on domain expertise.

### Changed
- **Validation (Linting)**: Replaced python-based `check_conformance.py` with deterministic JSON Schema (AJV) validation and synchronous data integrity checks.
- **AI Dual-Track Backend**: Configured `SESSION_PROVIDER` to support both GenAI (in-process `@google/genai`) and Claude (via local MCP server) utilizing the exact same JSON schemas and tools.
- **Documentation**: Consolidated legacy architecture and planning documents into `legacy-docs/` and merged `AI-ARCHITECTURE.md` into the comprehensive `TARGET-ARCHITECTURE.md`.

### Removed
- Deprecated and removed legacy Python validation and formatting scripts.
- Removed legacy "Two-World" Python bridges after completing the data migration into JSON format.

# Processminer (v3 — JSON-Native)

AI-native process documentation. Claude Code / Gemini skills elicit a
subject-matter expert's process knowledge through interactive brainstorming,
write it into a strongly-typed JSON document, and develop it into a target
state. Applies Karpathy's LLM-Wiki pattern with per-heading provenance and
approval gating — now on a JSON-native data model.

> **Architecture status.** This baseline is the "JSON-Native" rewrite
> ([`TARGET-ARCHITECTURE.md`](TARGET-ARCHITECTURE.md)). It replaced the older
> per-Markdown-file wiki and the `scripts/wiki/*.py` toolkit. The pre-rewrite
> docs are archived under [`legacy-docs/`](legacy-docs/) and describe a model
> that **no longer exists** — do not follow them. Open work and the migration
> backlog live in [`REQUIREMENTS-ROADMAP.md`](REQUIREMENTS-ROADMAP.md) and
> [`docs/BRIDGES_AND_TODOS.md`](docs/BRIDGES_AND_TODOS.md).

## The data model

Each process is **one strongly-typed JSON document**:
`wiki/processes/<slug>.json`. It is the single source of truth — process
`meta` + `content` (the overview) at the root, then typed arrays of elements
(`process-steps`, `roles`, `systems`, `exceptions`, `controls`, `regulation`,
`to-be-design`, `transformation-decisions`, …). Each element is
`{ meta: {...}, ...content }`. All former sidecars (lint, review-state, notes,
sections, summaries, ingest) are consolidated into this one file.

> Only `cob-003.json` has been migrated so far. Other processes' content was
> dropped in the migration (see roadmap item A2).

Three conceptual layers (Karpathy LLM-Wiki):

- `raw-sources/<slug>/` — immutable uploaded source documents (layer 1, intact)
- `wiki/processes/<slug>.json` — the typed JSON document (layer 2)
- the **process schema** — single source of truth for element types,
  frontmatter, relations and the provenance contract (layer 3)

**Non-negotiable rule — never hand-edit the process JSON.** Every mutation goes
through a schema-validated TypeScript writer, never `Write`/`Edit` on the
`.json` file. This is what keeps the provenance + approval + conformance
contract intact.

- In-app SME actions → server actions in
  [`src/lib/wiki-write.ts`](src/lib/wiki-write.ts): `updateElement`,
  `setApproval`, `setRelevance`, `saveSummaryPart`, `triageTargetReview`. A
  **content edit** is validated against `checkElement` / `checkFrontmatter` /
  `checkFieldValues` / `checkProvenance`
  ([`src/lib/conformance.ts`](src/lib/conformance.ts)) and blocked on any
  failure. A **metadata-only** state change (approval / relevance / status) is
  *not* blocked by an element's pre-existing non-conformance — only the approval
  gate (below) hard-blocks it.
- AI session authoring → schema-enforced tools, not file writes:
  `createElement`, `updateElement`, `expandElement`, `checkConformance`,
  `checkTransitions`, `applyLint`. The backend generates element IDs — never
  format an ID yourself.

### The schema

The schema exists as **two different representations** of the same element-type
model — not duplicate copies, so they can't be merged into one file:

- [`schema/process-schema.json`](schema/process-schema.json) — the **custom app
  schema** (`elementTypes`, templates, `fieldValues`). **The source of truth:**
  `src/lib/wiki.ts`, `conformance.ts`, and the MCP/Gemini tool schemas all
  derive from it.
- [`src/lib/schema/process-schema.json`](src/lib/schema/process-schema.json) —
  the Draft-07 **JSON Schema** ("LLM output schema"), used by the AJV validator
  ([`process-validator.ts`](src/lib/schema/process-validator.ts), ElementCard's
  inline edit validation) and `scripts/verify_llm_schema.mjs`.

⚠️ The two can **drift** (add/rename a type in one, forget the other). A
drift-guard test ([`schema-consistency.test.ts`](src/lib/schema/schema-consistency.test.ts),
run by `npm test`) fails if their element-type sets diverge. When you add or
rename an element type, update **both**. (A generator that derives the JSON
Schema from the custom schema — removing the dual edit entirely — is a possible
future step; see `docs/BRIDGES_AND_TODOS.md`.)

`src/lib/wiki.ts` reads the JSON and maps each element into an in-memory
`WikiPage` DTO so the UI, relations mapper and conformance engine can keep
operating as before (see BRIDGES_AND_TODOS §1).

### Provenance & approval contract

Per-heading provenance is mandatory. Each template-bearing element carries a
`meta.provenance` map keyed by heading title, each entry
`{ source, evidence }` with `source ∈ elicited | document | proposed | web |
legacy-approved`. The full contract — read-back, the Y/E/R loop, "editing
resets provenance to `proposed`" — is in
[`.claude/skills/CORE_SYSTEM_PROMPT.md`](.claude/skills/CORE_SYSTEM_PROMPT.md)
and enforced by `checkProvenance`.

The **approval gate is enforced**: `updateElement`/`setApproval`
(`src/lib/wiki-write.ts`) refuse to set `approved` while any heading's source is
`proposed`/`web`, returning which headings are blocking
(`unconfirmedHeadings()` in `conformance.ts`). Editing a heading resets it to
`proposed`, so re-approval requires re-confirmation. *(This was the roadmap A1
regression — fixed.)*

**Runtime state lives above the wiki (roadmap R9 — fixed).** The Karpathy
guardrail: `wiki/processes/<slug>.json` holds only durable process knowledge.
Runtime / orchestration / derived state — the foundational-run cursor
(`reviewState`), the latest `lint` report, and `findingDismissals` — lives in a
sibling **runtime store**, [`src/lib/runtime-store.ts`](src/lib/runtime-store.ts)
→ `data/runtime/<slug>.json` (gitignored; transient, per-environment). `getProcess`
reads it; `applyLint` and `/api/findings` write it. **Never** put runtime state
back into the process JSON.

## Dual-track AI backend

Sessions run through one of two providers, selected by `SESSION_PROVIDER`
(configured in `.env.local`; see [`README.md`](README.md)):

- `SESSION_PROVIDER=gemini` → in-process Google GenAI SDK
  ([`src/lib/gemini-worker.ts`](src/lib/gemini-worker.ts)).
- `SESSION_PROVIDER=claude` → local Claude CLI connects to the custom MCP
  server ([`src/lib/claude-mcp-server.ts`](src/lib/claude-mcp-server.ts), 
  registered via [`claude.json`](claude.json)).

Both expose the **same** schema-enforced tools and the same JSON document, so
behaviour is provider-agnostic. The HTTP entry point is `/api/session`
([`src/lib/session-worker.ts`](src/lib/session-worker.ts),
[`src/lib/worker-interface.ts`](src/lib/worker-interface.ts)).

## Skills

Skills live under `.claude/skills/` and are auto-discovered. In the JSON-native
model they are **pure reasoning prompts** — domain expertise only. They do
**not** shell out, run Python, or write files; all I/O is the schema-enforced
tools above, regulated by the shared
[`CORE_SYSTEM_PROMPT.md`](.claude/skills/CORE_SYSTEM_PROMPT.md). When the user's
request matches a skill, invoke it via the Skill tool.

| When the user wants to … | Invoke |
|---|---|
| Start a new process from scratch | `/new-process` |
| Document a process end-to-end with SME interviews | `/qer-session` |
| Extract a freshly uploaded document into the wiki | `/document-ingest` |
| Walk an ingested process and challenge each element | `/foundational-run` |
| Add a single element to one section | `/add-entry` |
| Work the open comments on an element | `/comment-review` |
| Resolve conflicts from a re-ingest | `/conflict-resolution` |
| Run the consistency / lint pass | `/run-lint` |
| Write an executive memo for one area | `/area-summary` |
| Refine As-Is steps / roles / exceptions | `/process-specialist` |
| Refine controls / regulations / audit findings | `/control-compliance-specialist` |
| Refine the client journey / touchpoints | `/client-journey-specialist` |
| Refine market trends / innovation ideas | `/innovation-analyst` |
| Develop the target state | `/transformation-agent` |
| Council-review the target state | `/council-review` |
| Refine the systems landscape | `/it-architect` |
| Web-source competitor CX / CX benchmarks | `/source-cx` |
| Web-source market trends / competitor moves | `/source-innovation` |
| Web-source the regulatory landscape | `/source-regulation` |
| Auto-draft a target process | `/source-target` |

Read [`SKILLS.md`](SKILLS.md) before changing any skill — it defines the six
perspective specialists, the Brainstorm/Author/Verify pattern, the QER step
sequence, the lint council, and the approval model, all updated for the
JSON-native tool layer. The shared per-skill contract is
[`CORE_SYSTEM_PROMPT.md`](.claude/skills/CORE_SYSTEM_PROMPT.md).

## Design system

Read [`DESIGN.md`](DESIGN.md) before any visual or UI change — font, colour,
spacing, motion and the workspace-theming tokens are defined there and mirrored
in [`src/app/globals.css`](src/app/globals.css) `:root`. Defer to `globals.css`
for exact current values, and get explicit user approval before deviating.

## Verification

- Types: `npm run typecheck`
- Tests (lint engine): `npm test` (`node --test src/lib/lint.test.ts`)
- Run the app: `npm run dev` → http://localhost:3000 (log in with the
  `PM_BOOTSTRAP_ADMIN_PASS` from `.env.local`)
- Schema sanity: `node scripts/verify_llm_schema.mjs`

## Reference docs

- [TARGET-ARCHITECTURE.md](TARGET-ARCHITECTURE.md) — the JSON-native architecture (authoritative)
- [SKILLS.md](SKILLS.md) — agent / skill architecture (specialists, flows, approval model)
- [DESIGN.md](DESIGN.md) — design system (tokens, aesthetic, workspace theming)
- [.claude/skills/CORE_SYSTEM_PROMPT.md](.claude/skills/CORE_SYSTEM_PROMPT.md) — shared skill prompt: context model, CRUD tools, provenance contract
- [docs/BRIDGES_AND_TODOS.md](docs/BRIDGES_AND_TODOS.md) — in-memory bridges + migration debt (partly stale; verify against code)
- [REQUIREMENTS-ROADMAP.md](REQUIREMENTS-ROADMAP.md) — triaged backlog of work dropped in the migration (R1–R22)
- [docs/api.md](docs/api.md) — HTTP endpoint reference
- [README.md](README.md) — local setup, env vars, provider config
- [CHANGELOG.md](CHANGELOG.md) — the v3 refactor changelog
- [legacy-docs/](legacy-docs/) — pre-rewrite architecture (historical only; do not follow)

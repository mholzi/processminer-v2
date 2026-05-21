# Processminer

AI-native process documentation. Claude Code skills elicit a subject-matter
expert's process knowledge through interactive brainstorming, write it into a
file-backed wiki, and develop it into a target state. Applies Karpathy's LLM
Wiki pattern with per-heading provenance and approval gating.

## The wiki

This project is built around a file-backed wiki under `wiki/processes/<slug>/`,
following [Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
Three layers:

- `raw-sources/<slug>/` — immutable uploaded source documents (layer 1)
- `wiki/processes/<slug>/` — typed Markdown elements, one folder per section,
  with JSON sidecars (`sections.json`, `ingest.json`, `lint.json`, etc.) (layer 2)
- `schema/process-schema.json` — the schema, single source of truth for
  element types, frontmatter, relations and the provenance contract (layer 3)

**Non-negotiable rule — never edit wiki Markdown directly.** Every wiki
mutation goes through a schema-validated Python writer:

- Write a new element → `python3 scripts/wiki/write_element.py <spec.json>`
- Patch one heading or field → `python3 scripts/wiki/patch_element.py <args>`
- Set approval → `python3 scripts/wiki/set_approval.py <args>`
- Set section status → `python3 scripts/wiki/set_section_status.py <args>`
- Batch-write multiple elements → `python3 scripts/wiki/write_elements.py <manifest.json>`

This is what makes the provenance + approval gate work. Editing frontmatter
or body blocks directly via Write/Edit silently bypasses the schema check
and breaks the integrity contract. The full toolkit is documented in
[SKILLS.md §6](SKILLS.md).

Before writing an element, print its conformant skeleton with
`python3 scripts/wiki/show_template.py <type>`. Read
[`schema/process-schema.json`](schema/process-schema.json) for the type's
required frontmatter and template headings.

Per-heading provenance is mandatory — see [HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md)
for the contract. The verbatim cross-skill blocks (provenance block, element-
writing procedure) are enforced byte-identical by
[`scripts/check_skill_blocks.py`](scripts/check_skill_blocks.py).

## Skill routing

When the user's request matches one of this project's skills, invoke it via
the Skill tool. The skills live under `.claude/skills/` and are auto-discovered.

| When the user wants to … | Invoke |
|---|---|
| Start a new process from scratch | `/new-process` |
| Document a process end-to-end with SME interviews | `/qer-session` |
| Extract a freshly uploaded document into the wiki | `/document-ingest` |
| Walk an ingested process and challenge each element with the SME | `/foundational-run` |
| Add a single element to one section | `/add-entry` |
| Work the open comments on an element | `/comment-review` |
| Resolve conflicts from a re-ingest | `/conflict-resolution` |
| Run a five-lens consistency sweep / lint pass | `/run-lint` |
| Write an executive memo for one area | `/area-summary` |
| Refine As-Is steps / roles / exceptions | `/process-specialist` |
| Refine controls / regulations / audit findings | `/control-compliance-specialist` |
| Refine the client journey / touchpoints | `/client-journey-specialist` |
| Refine market trends / innovation ideas | `/innovation-analyst` |
| Develop the target state | `/transformation-agent` |
| Refine the systems landscape | `/it-architect` |
| Web-source competitor CX / CX benchmarks | `/source-cx` |
| Web-source market trends / competitor moves | `/source-innovation` |
| Web-source the regulatory landscape | `/source-regulation` |
| Auto-draft a target process from documented perspectives | `/source-target` |

The web app drives most skills via chat (free-text → description match) and
via buttons that post a fixed prompt to `/api/session`. See
[SKILLS.md §11](SKILLS.md) for the full button → skill map.

## Design system

Read [DESIGN.md](DESIGN.md) before any visual or UI change. Font, colour,
spacing and motion tokens are defined there and mirrored in
[`src/app/globals.css`](src/app/globals.css). Do not deviate without explicit
user approval. In QA mode, flag any code that doesn't match DESIGN.md.

## Agent architecture

Read [SKILLS.md](SKILLS.md) before changing any skill. It defines the six
perspective specialists, the shared functional pattern (Brainstorm / Author /
Verify), the QER step sequence, the approval model, and the verbatim cross-
skill blocks. Do not deviate without explicit user approval.

## Reference docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — cold-start reading guide (2hr/2day/2wk tracks)
- [SKILLS.md](SKILLS.md) — agent / skill architecture
- [DESIGN.md](DESIGN.md) — design system
- [CONTENT-MODEL-PLAN.md](CONTENT-MODEL-PLAN.md) — schema decisions D1–D6
- [HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md) — per-heading provenance contract
- [docs/api.md](docs/api.md) — HTTP endpoint reference
- [TODOS.md](TODOS.md) — open work items

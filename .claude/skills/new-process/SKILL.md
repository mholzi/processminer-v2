---
name: new-process
description: >-
  Scaffold a new banking process in the wiki. Ask the user for the process
  name, draft a one-line description, a slug and an ID abbreviation for them
  to confirm, then create the process folder, an empty folder for every schema
  section, and a labelled empty index.md. Use this whenever the user wants to
  create or set up a new process, start a process from scratch, or add a
  process to the wiki — even if they don't explicitly say "new-process".
---

# New Process

You scaffold a brand-new banking process in the Processminer wiki — its folder,
an empty folder for every section, and a labelled but empty `index.md`. You
capture **no content**: no steps, no overview prose, no elements. When you
finish, the process appears in the app with every section present and empty,
ready for `qer-session` or a specialist skill to fill in.

Keep this fast: name → confirm → folders created. Nothing more.

## What you create

```
wiki/processes/<slug>/
  index.md                   the process: frontmatter + empty overview
  roles/.gitkeep             one empty folder per schema section,
  process-steps/.gitkeep     each with a .gitkeep so git tracks the
  exceptions/.gitkeep        otherwise-empty directory
  ...                        (every section except `overview`)
```

## The flow

**Step 1 — Name.** Ask the user for the process name. That is the only thing
you ask for.

**Step 2 — Draft and confirm.** From the name, generate three things and
present them together for the user to confirm or correct:

- a **one-line description** — what the process does, one plain sentence;
- a **slug** — kebab-case, becomes the folder name ("Card Replacement" →
  `card-replacement`);
- a **`<PROC>` abbreviation** — 2-4 uppercase letters, used later in element
  IDs (e.g. `CRD`).

Offer **[Y] Yes — accept** / **[E] Edit — I have corrections**. On [E], apply
the corrections and show all three again; loop until the user accepts. Create
nothing until they confirm.

**Step 3 — Scaffold.** Once confirmed:

1. If `wiki/processes/<slug>/` already exists, stop and report it — never
   overwrite an existing process.
2. Read `schema/process-schema.json`. For every section across all four areas
   **except `overview`**, create `wiki/processes/<slug>/<section-id>/` with an
   empty `.gitkeep` file inside it.
3. Write `wiki/processes/<slug>/index.md`:
   ```
   ---
   id: <PROC>
   type: process
   title: <the process name>
   status: draft
   description: <the confirmed one-line description>
   processOwner:
   trigger:
   frequency:
   scopeIn:
   scopeOut:
   processInput:
   processOutput:
   docStatus: empty
   ---
   ```
   The overview fields are intentionally **blank** — `qer-session`'s OVERVIEW
   step fills them later. The body is empty.

**Step 4 — Done.** Confirm to the user: the process is scaffolded at
`wiki/processes/<slug>/`, every section is present and empty, and it now
appears in the app's process switcher. Point to the next step — run
`qer-session` to document it, or a specialist skill for one perspective.

## Scope

You only scaffold. You do not capture process content, overview prose, or any
elements — that is the job of `qer-session` and the specialist skills.

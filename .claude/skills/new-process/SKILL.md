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

**Step 2 — Derive, draft, confirm.**

1. Run `python3 scripts/wiki/derive_process_meta.py "<name>"`. It returns JSON
   with a deterministic **slug** (kebab-case folder name) and **`<PROC>`**
   abbreviation (uppercase, for element IDs). Use exactly what it returns — do
   not invent your own.
2. Draft a **one-line description** — one plain sentence on what the process
   does. This is the one judgement item; the slug and abbreviation are not.
3. Present all three to the user as a **bulleted list — never a table** — each
   label in bold:

   ```
   - **Description:** <the one-line description>
   - **Slug:** `<slug>`
   - **Abbreviation:** `<PROC>`
   ```

   Then offer **[Y] Yes — accept** / **[E] Edit — I have corrections**. On [E],
   apply the corrections and show the bullets again; loop until the user
   accepts. Create nothing until they confirm.

**Step 3 — Scaffold.** Once the user confirms, run the scaffolder. It is a
Python script that does the file creation deterministically — do **not** create
these files by hand:

```
python3 scripts/wiki/scaffold_process.py <slug> <PROC> "<title>" "<description>"
```

The script creates `wiki/processes/<slug>/`, a `.gitkeep`'d folder for every
schema section, and a labelled `index.md` with the overview fields left blank
(`qer-session`'s OVERVIEW step fills them later). It validates the slug and
abbreviation and refuses to overwrite an existing process. **Do not relay the
script's printed output** — it is a technical record, not for the user. If it
exits with an error, relay that error to the user and stop.

**Step 4 — Done.** On success, say nothing about section folders or paths —
close with **only** this **exact template**, substituting `{process}`:

> **{process}** has been successfully created, and the app has switched to it.
>
> The process is empty — every section is ready to be filled. The fastest way
> to start is to **upload a process document**: click **⬆ Upload document** in
> the top bar and drag in a PDF, Word or Markdown file. I'll review it,
> summarise it, and extract its content into the wiki.
>
> Prefer a guided interview? Just ask me to run a documentation session instead.

Use this wording verbatim — do not improvise the closing.

## Scope

You only scaffold. You do not capture process content, overview prose, or any
elements — that is the job of `qer-session` and the specialist skills.

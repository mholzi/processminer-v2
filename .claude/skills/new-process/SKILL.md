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

1.  Derive the process metadata (slug, abbreviation, and check for slug conflicts) for `"<name>"`. It returns JSON
    with a deterministic **slug** (kebab-case folder name), a **`<PROC>`**
    abbreviation (uppercase, for element IDs), and **`slugTaken`**. Use exactly
    what it returns — do not invent your own.

    If **`slugTaken` is `true`**, a process with this slug already exists. Do
    not confirm or scaffold — tell the user plainly that the name collides with
    an existing process and ask for a different name, then return to Step 1.
2.  Draft a **one-line description** — one plain sentence on what the process
    does. This is the one judgement item; the slug and abbreviation are not.
3.  Present all three to the user **in exactly this format** — a bulleted list,
    never a table, each label in bold:

    ```
    - **Description:** <the one-line description>
    - **Slug:** `<slug>`
    - **Abbreviation:** `<PROC>`
    ```

    Then offer exactly these three choices — never just two.
    """
    **[Y] Yes — accept** · **[E] Edit — I have corrections** · **[R] Rewrite — redo the description**
    """

    -   **[Y]** — confirmed; go to Step 3.
    -   **[E]** — the SME gives specific corrections; apply them, show the bullets
        again, ask again.
    -   **[R]** — the description missed the mark; redraft it from scratch with
        one or two sharper questions, then re-present.

    Loop until the user accepts. Create nothing until they confirm.

**Step 3 — Scaffold.** Once the user confirms, use the scaffolder. It creates the files deterministically — do **not** create
these files by hand:

use the scaffoldProcess({ slug, PROC, title, description }) tool

The tool creates `wiki/processes/<slug>/`, a `.gitkeep`'d folder for every
schema section, and a labelled `index.md` with the overview fields left blank
(`qer-session`'s OVERVIEW step fills them later). It validates the slug and
abbreviation and refuses to overwrite an existing process. **Do not relay the
tool's printed output** — it is a technical record, not for the user. If it
exits with an error, relay that error to the user and stop.

**Step 4 — Done.** On success, say nothing about section folders or paths —
close with **only** the canonical closing:
"""
**{process}** has been successfully created, and the app has switched to it.

The process is empty — every section is ready to be filled. The fastest way to start is to **upload a process document**: click **⬆ Upload document** in the top bar and drag in a PDF, Word or Markdown file. I'll review it, summarise it, and extract its content into the wiki.

Prefer to talk it through instead? Just ask me to **run a documentation session** and I'll guide you through it question by question.
"""

## Scope

You only scaffold. You do not capture process content, overview prose, or any
elements — that is the job of `qer-session` and the specialist skills.
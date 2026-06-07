---
name: new-process
description: >-
  Scaffold a new banking process in the wiki. Ask the user for the process
  name, draft a one-line description, a slug and an ID abbreviation for them
  to confirm, then create the process as a single strongly-typed JSON document
  with an empty overview. Use this whenever the user wants to
  create or set up a new process, start a process from scratch, or add a
  process to the wiki — even if they don't explicitly say "new-process".
---

# New Process

You scaffold a brand-new banking process in the Processminer wiki — its single
strongly-typed JSON document at `wiki/processes/<slug>.json`, carrying the
process `meta` and an empty overview. You capture **no content**: no steps, no
overview prose, no elements. When you finish, the process appears in the app
empty, ready for `qer-session` or a specialist skill to fill in.

Keep this fast: name → confirm → document created. Nothing more.

## What you create

```
wiki/processes/<slug>.json     one strongly-typed JSON document:
                                 meta      process identity (id, slug, title, …)
                                 content   the overview — created empty
                                 (typed element arrays are added later, as
                                  specialists author elements via createElement)
```

## The flow

**Step 1 — Name.** Ask the user for the process name. That is the only thing
you ask for. *(If the user's opening message already gives both a name **and** a
one-line description of the process, skip the question and go straight to
Step 2 with that description as your draft — don't ask for what you already
have.)*

**Step 2 — Derive, draft, confirm.**

1.  Call **`deriveProcessMeta({ name })`** with the process name. It returns
    JSON with a deterministic **`slug`** (kebab-case), a guaranteed-valid
    **`PROC`** abbreviation (always 2–6 uppercase letters — you never have to
    form or fix it), a **`slugTaken`** flag, a list of non-colliding
    **`suggestedSlugs`**, and a **`confirmTemplate`** string. Use exactly what
    it returns — never invent or "correct" the slug or abbreviation.

    If **`slugTaken` is `true`**, a process with this slug already exists. Do
    not confirm or scaffold — tell the user plainly that the name collides with
    an existing process, offer the `suggestedSlugs` (or a different name), and
    return to Step 1.
2.  Draft a **one-line description** — one plain sentence on what the process
    does. This is the one judgement item; the slug and abbreviation are not.
3.  Present the confirmation by taking the returned **`confirmTemplate`**
    verbatim and replacing `{{description}}` with your one-line description.
    Relay it exactly — do not reformat it into a table or restyle the labels.
    It renders as:

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

The tool creates the process document `wiki/processes/<slug>.json` with the
process `meta` (identity) and an empty overview (`content`) — the overview
fields are left blank (`qer-session`'s OVERVIEW step fills them later). It validates the slug and
abbreviation and refuses to overwrite an existing process. On success it returns
a **`closing`** field — the canonical success message (see Step 4). If it exits
with an error, relay that error to the user and stop.

**Step 4 — Done.** On success, say nothing about the JSON document or paths —
relay the tool's returned **`closing`** field **verbatim** as your entire
message. Do not paraphrase it, add to it, or mention any other part of the
tool's output. (For reference, it reads:)
"""
**{process}** has been successfully created, and the app has switched to it.

The process is empty — every section is ready to be filled. The fastest way to start is to **upload a process document**: click **⬆ Upload document** in the top bar and drag in a PDF, Word or Markdown file. I'll review it, summarise it, and extract its content into the wiki.

Prefer to talk it through instead? Just ask me to **run a documentation session** and I'll guide you through it question by question.
"""

## Scope

You only scaffold. You do not capture process content, overview prose, or any
elements — that is the job of `qer-session` and the specialist skills.
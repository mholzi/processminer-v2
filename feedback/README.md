# App Feedback

Feedback on the **Processminer tool itself** — bugs, ideas and improvements —
kept here, deliberately apart from the process documentation under `wiki/`.

Each item is one Markdown file, `FB-NNN.md`, with a frontmatter block:

```
---
id: FB-001
title: Short summary of the feedback
category: bug | idea | improvement | question
status: open | planned | done | declined
author: Person who filed it
role: Their role
page: App page/area the feedback is about (optional)
created: YYYY-MM-DD
---

The feedback prose.
```

Items are filed and triaged from the **App Feedback** page in the app
(Processes menu → App feedback), which reads and writes this folder through the
`/api/feedback` route. Files can also be added or edited here by hand — the app
re-reads the tree on every load.

This `README.md` is not a feedback item; only `FB-NNN.md` files are.

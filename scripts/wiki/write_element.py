#!/usr/bin/env python3
"""Write a wiki element file from a JSON spec — deterministic serialisation.

The skill drafts the *content* (judgement); this script guarantees the
frontmatter order, list syntax, block format and file path are correct, so an
element can never be written malformed or in the wrong place. To write several
elements at once, use write_elements.py — it shares this same serialisation.

Usage:
  write_element.py <spec.json> [--by "<actor name>"]

`--by` stamps `updatedBy` on the element. Omit to fall back to "the assistant"
— the contributors feed reads `updatedBy` / `updatedAt` to surface edit events.

Spec shape:
  {
    "slug": "card-replacement",
    "type": "process-step",
    "id": "PS-CRD-001",
    "title": "Report the lost card",
    "status": "draft",                              (optional, default draft)
    "confidence": "high",                           (optional)
    "source": "SME interview - M. Berger",          (optional)
    "fields": { "owner": "...", "sla": "..." },     scalar frontmatter fields
    "relations": { "systems": ["SYS-CRD-001"] },    id-list frontmatter fields
    "provenance": {                                 (optional) per-heading
      "What happens": { "source": "elicited",       source + evidence quote;
                        "evidence": "<SME quote>" } a heading omitted here
    },                                              defaults to `proposed`
    "blocks": [ { "heading": "What happens", "text": "..." }, ... ]
  }

The `section` is derived from the element type via the schema — do not pass it.

Rewriting an existing id is non-lossy: any frontmatter key the spec omits
(`relevance` stamps, `transitions`, hand-added keys) is carried forward from
the file on disk. The spec wins for every key it names. One exception — a
rewrite re-opens review: an element that was `approved` (or `rejected`) is
reset to `in-progress` and its approver dropped, because the rewrite supersedes
the content the SME signed off on.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import ROOT, write_element_spec  # noqa: E402


def main(argv: list[str]) -> None:
    by: str | None = None
    rest: list[str] = []
    i = 0
    while i < len(argv):
        if argv[i] == "--by" and i + 1 < len(argv):
            by = argv[i + 1]
            i += 2
        else:
            rest.append(argv[i])
            i += 1
    if len(rest) != 1:
        sys.exit("usage: write_element.py <spec.json> [--by <actor>]")
    try:
        spec = json.loads(Path(rest[0]).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"error: could not read spec — {e}")

    try:
        path, action = write_element_spec(spec, by=by)
    except ValueError as e:
        sys.exit(f"error: {e}")

    print(f"wrote {path.relative_to(ROOT)} ({action})")


if __name__ == "__main__":
    main(sys.argv[1:])

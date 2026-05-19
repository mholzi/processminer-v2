#!/usr/bin/env python3
"""Write a process overview (index.md) from a JSON spec — deterministic.

The skill (qer-session OVERVIEW, process-specialist Phase 1) drafts the
overview content — purpose, trigger, scope — as judgement; this script owns
the frontmatter keys, their order and the file format, so index.md can never
be written malformed. The process must already be scaffolded (new-process).

Usage:
  write_overview.py <spec.json>

Spec shape:
  {
    "slug": "client-onboarding",
    "processOwner": "ROLE-COB-005",       overview fields — all optional,
    "trigger": "...",                     written blank if omitted
    "frequency": "...",
    "scopeIn": "...",
    "scopeOut": "...",
    "processInput": "...",
    "processOutput": "...",
    "docStatus": "As-Is draft",           optional, default "As-Is draft"
    "confidence": "high",                 optional
    "source": "DTP-... v2.3",             optional
    "description": "<one-line summary>",  optional — see below
    "purpose": "<two-paragraph Purpose body>"
  }

`id`, `type`, `title` and `status` are preserved from the scaffolded index.md —
they are the process identity, not the skill's to change. `description` is
preserved too *unless* the spec supplies one: a skill working from an
authoritative source (e.g. document-ingest) may pass a corrected `description`
to overwrite a scaffolded one the source contradicts. `sources` (owned by
add_source.py) is always preserved.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import ROOT, WIKI_DIR, parse_frontmatter  # noqa: E402
from scaffold_process import OVERVIEW_FIELDS  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 1:
        sys.exit("usage: write_overview.py <spec.json>")
    try:
        spec = json.loads(Path(argv[0]).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"error: could not read spec — {e}")

    slug = spec.get("slug")
    if not slug:
        sys.exit("error: spec is missing required key 'slug'")

    index = WIKI_DIR / slug / "index.md"
    if not index.is_file():
        sys.exit(
            f"error: no process at wiki/processes/{slug}/ — scaffold it first"
        )

    # Identity is preserved from the scaffolded file; the skill never changes it.
    existing, _ = parse_frontmatter(index.read_text(encoding="utf-8"))

    frontmatter: dict = {
        "id": existing.get("id", ""),
        "type": existing.get("type", "process"),
        "section": "overview",
        "title": existing.get("title", ""),
        "status": existing.get("status", "draft"),
    }
    # `description` is process identity — preserved, unless the spec supplies a
    # corrected one (document-ingest, working from an authoritative source).
    description = spec.get("description") or existing.get("description")
    if description:
        frontmatter["description"] = description
    # `sources` is owned by add_source.py — preserve it, never drop it.
    if existing.get("sources"):
        frontmatter["sources"] = existing["sources"]
    if spec.get("confidence"):
        frontmatter["confidence"] = spec["confidence"]
    if spec.get("source"):
        frontmatter["source"] = spec["source"]
    for field in OVERVIEW_FIELDS:
        frontmatter[field] = spec.get(field, "") or ""
    frontmatter["docStatus"] = spec.get("docStatus") or "As-Is draft"

    lines = []
    for key, val in frontmatter.items():
        if isinstance(val, list):
            lines.append(f"{key}: [{', '.join(str(v) for v in val)}]")
        elif val is None or val == "":
            lines.append(f"{key}:")
        else:
            lines.append(f"{key}: {val}")
    body = (spec.get("purpose") or "").strip()
    text = "---\n" + "\n".join(lines) + "\n---\n"
    if body:
        text += body + "\n"
    index.write_text(text, encoding="utf-8")

    print(f"wrote {index.relative_to(ROOT)} (overview filled)")


if __name__ == "__main__":
    main(sys.argv[1:])

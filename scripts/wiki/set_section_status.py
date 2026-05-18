#!/usr/bin/env python3
"""Record a section's completeness — the per-section status marker.

CONTENT-MODEL-PLAN.md D5. An empty section folder is ambiguous: did the SME
confirm the process has none of that element, or was the section never worked?
This script records the answer in `sections.json`, so a handoff baseline can
tell `confirmed-empty` from `not-visited`.

The specialists' `[A]/[E]/[N]` idiom calls this: `[N] None` records
`confirmed-empty`; finishing a section with elements records `worked`.

Status is one of:
  worked          — the section was worked; `count` elements were written
  confirmed-empty — the SME was asked and confirmed the process has none
  not-visited     — the section has not been worked yet

`count` is derived from the section folder on every write, never accumulated,
so a re-run is idempotent.

Usage:
  set_section_status.py <slug> <section-id> <status> [by]
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, find_section, load_schema  # noqa: E402

STATUSES = ("worked", "confirmed-empty", "not-visited")


def main(argv: list[str]) -> None:
    if len(argv) not in (3, 4):
        sys.exit("usage: set_section_status.py <slug> <section-id> <status> [by]")
    slug, section_id, status = argv[0], argv[1], argv[2]
    by = argv[3] if len(argv) == 4 else ""

    if status not in STATUSES:
        sys.exit(f"error: status must be one of {', '.join(STATUSES)}")

    proc = WIKI_DIR / slug
    if not proc.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")
    if not find_section(section_id, load_schema()):
        sys.exit(f"error: '{section_id}' is not a schema section")

    path = proc / "sections.json"
    data: dict = {}
    if path.is_file():
        try:
            loaded = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                data = loaded
        except json.JSONDecodeError:
            data = {}

    # Count is the truth on disk, not a running tally — keeps a re-run idempotent.
    sec_dir = proc / section_id
    count = len(list(sec_dir.glob("*.md"))) if sec_dir.is_dir() else 0

    entry: dict = {
        "status": status,
        "count": count,
        "date": datetime.date.today().isoformat(),
    }
    if by:
        entry["by"] = by
    data[section_id] = entry

    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"{slug}/{section_id}: {status} ({count} element(s))")


if __name__ == "__main__":
    main(sys.argv[1:])

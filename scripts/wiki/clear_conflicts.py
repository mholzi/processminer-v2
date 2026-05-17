#!/usr/bin/env python3
"""Clear the resolved conflicts from a process's ingest.json — deterministic.

After conflict-resolution has walked every flagged conflict with the SME, this
empties the `conflicts` array in ingest.json, so the triage screen no longer
shows conflicts that have been decided.

Usage:
  clear_conflicts.py <slug>
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 1:
        sys.exit("usage: clear_conflicts.py <slug>")
    slug = argv[0]

    path = WIKI_DIR / slug / "ingest.json"
    if not path.is_file():
        sys.exit(f"error: no ingest.json for {slug}")

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"error: ingest.json is malformed: {e}")

    n = len(data.get("conflicts", []) or [])
    data["conflicts"] = []
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"cleared {n} resolved conflict(s) from {slug}/ingest.json")


if __name__ == "__main__":
    main(sys.argv[1:])

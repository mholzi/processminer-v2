#!/usr/bin/env python3
"""Count the elements a sourcing run wrote, per type — from the run manifest.

The source-innovation / source-cx skills write many elements in one
non-interactive run, then report how many of each. This script reads the run
manifest (write_element.py logs every write) and prints the count per element
type, so the report counts are mechanical, never tallied from the model's
memory. The manifest is consumed (deleted) once read.

Counts are distinct element ids — an id written more than once counts once.

Usage:
  source_report.py <slug>
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import read_manifest, reset_manifest  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 1:
        sys.exit("usage: source_report.py <slug>")
    slug = argv[0]

    counts: dict[str, int] = {}
    seen: set[str] = set()
    for rec in read_manifest(slug):
        eid = str(rec.get("id", "")).strip()
        etype = str(rec.get("type", "")).strip()
        if not eid or eid in seen:
            continue
        seen.add(eid)
        counts[etype] = counts.get(etype, 0) + 1
    reset_manifest(slug)

    if not counts:
        print(f"no elements recorded in the run manifest for {slug}")
        return

    print(f"Elements written for {slug} (from the run manifest):")
    for etype in sorted(counts):
        print(f"  {etype}: {counts[etype]}")
    print(f"  - total: {sum(counts.values())}")


if __name__ == "__main__":
    main(sys.argv[1:])

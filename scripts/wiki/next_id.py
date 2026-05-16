#!/usr/bin/env python3
"""Compute the next element id for a type within a process — deterministic.

Element ids are `<idPrefix>-<PROC>-<NNN>` (e.g. PS-COB-001). This scans the
process for existing elements of the type, takes the highest sequence number,
and prints the next id. The skill should never count ids by hand.

Usage:
  next_id.py <slug> <element-type>      e.g. next_id.py cob-003 process-step
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, element_types, iter_elements, parse_frontmatter  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        sys.exit("usage: next_id.py <slug> <element-type>")
    slug, etype = argv

    types = element_types()
    if etype not in types:
        sys.exit(f"error: unknown element type '{etype}'")
    prefix = types[etype]["idPrefix"]

    index = WIKI_DIR / slug / "index.md"
    if not index.is_file():
        sys.exit(f"error: no process at wiki/processes/{slug}/")
    index_meta, _ = parse_frontmatter(index.read_text(encoding="utf-8"))

    proc = None
    max_n = 0
    for _path, meta, _body in iter_elements(slug):
        parts = str(meta.get("id", "")).split("-")
        if len(parts) != 3:
            continue
        # The process abbreviation is the middle segment of any element id.
        if proc is None:
            proc = parts[1]
        if meta.get("type") == etype and parts[2].isdigit():
            max_n = max(max_n, int(parts[2]))

    # No elements yet — fall back to the process index id (new processes use
    # the abbreviation as the index id).
    if proc is None:
        proc = str(index_meta.get("id", "")).strip()
    if not proc:
        sys.exit(f"error: cannot determine the process abbreviation for {slug}")

    print(f"{prefix}-{proc}-{max_n + 1:03d}")


if __name__ == "__main__":
    main(sys.argv[1:])

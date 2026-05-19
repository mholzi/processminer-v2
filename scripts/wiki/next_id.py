#!/usr/bin/env python3
"""Compute the next element id for a type within a process — deterministic.

Element ids are `<idPrefix>-<PROC>-<NNN>` (e.g. PS-COB-001). This takes the
highest sequence number already used for the type and prints the next id. The
skill should never count ids by hand. To create several elements at once, use
write_elements.py — it assigns the whole run's ids in one pass.

Usage:
  next_id.py <slug> <element-type>      e.g. next_id.py cob-003 process-step
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import element_types, id_state  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        sys.exit("usage: next_id.py <slug> <element-type>")
    slug, etype = argv

    types = element_types()
    if etype not in types:
        sys.exit(f"error: unknown element type '{etype}'")
    prefix = types[etype]["idPrefix"]

    try:
        proc, state = id_state(slug)
    except (FileNotFoundError, ValueError) as e:
        sys.exit(f"error: {e}")

    print(f"{prefix}-{proc}-{state.get(etype, 0) + 1:03d}")


if __name__ == "__main__":
    main(sys.argv[1:])

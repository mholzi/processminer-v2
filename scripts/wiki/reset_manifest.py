#!/usr/bin/env python3
"""Clear the run manifest for a process — deterministic.

write_element.py appends a created/updated record per write to a per-process
run manifest. A skill that will tally those writes (document-ingest) clears
the manifest before it starts, so a manifest left behind by an earlier or
crashed run cannot inflate the counts.

Usage:
  reset_manifest.py <slug>
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import reset_manifest  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 1:
        sys.exit("usage: reset_manifest.py <slug>")
    reset_manifest(argv[0])
    print(f"run manifest cleared for {argv[0]}")


if __name__ == "__main__":
    main(sys.argv[1:])

#!/usr/bin/env python3
"""Store an area's executive summary — deterministic.

The area-summary skill writes the summary as four `## ` blocks; this script
splits it into those parts and stores them, keyed by area, in
wiki/processes/<slug>/summaries.json — the file the app reads to render an
area's executive summary as four individually-editable parts.

Usage:
  write_summary.py <slug> <area> <summary.md>
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, parse_blocks  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 3:
        sys.exit("usage: write_summary.py <slug> <area> <summary.md>")
    slug, area, summary_path = argv

    proc_dir = WIKI_DIR / slug
    if not proc_dir.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    try:
        text = Path(summary_path).read_text(encoding="utf-8").strip()
    except OSError as e:
        sys.exit(f"error: cannot read summary file: {e}")
    if not text:
        sys.exit("error: summary file is empty")

    path = proc_dir / "summaries.json"
    data: dict = {}
    if path.is_file():
        try:
            loaded = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                data = loaded
        except json.JSONDecodeError:
            data = {}

    # Split the memo into its `## ` parts — each is individually editable in
    # the app. A summary with no headings is kept as one part.
    parts = parse_blocks(text)
    if not parts:
        parts = [{"heading": "Summary", "text": text}]

    data[area] = {
        "parts": parts,
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"executive summary stored for {slug}/{area}: {len(parts)} part(s)")


if __name__ == "__main__":
    main(sys.argv[1:])

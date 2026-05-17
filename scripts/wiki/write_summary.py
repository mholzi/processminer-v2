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
from wiki_lib import WIKI_DIR, load_schema, parse_blocks  # noqa: E402

# The app renders an area summary as four editable cards — so the memo must
# have exactly these four `## ` headings, in this order. Enforced here, at the
# deterministic layer, rather than trusted of the model.
MEMO_HEADINGS = ["Introduction", "Current state", "What stands out", "Recommendation"]


def main(argv: list[str]) -> None:
    if len(argv) != 3:
        sys.exit("usage: write_summary.py <slug> <area> <summary.md>")
    slug, area, summary_path = argv

    proc_dir = WIKI_DIR / slug
    if not proc_dir.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    area_ids = {a["id"] for a in load_schema()["areas"]}
    if area not in area_ids:
        sys.exit(f"error: unknown area '{area}' — one of {sorted(area_ids)}")

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
    # the app — and verify it is exactly the four expected headings, in order.
    parts = parse_blocks(text)
    got = [p["heading"] for p in parts]
    if got != MEMO_HEADINGS:
        sys.exit(
            "error: the summary must have exactly these four ## headings, "
            "in order:\n"
            f"  expected: {MEMO_HEADINGS}\n"
            f"  got:      {got or '(no ## headings found)'}\n"
            "re-write the memo with the exact headings and run this again."
        )

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

#!/usr/bin/env python3
"""Write the document-ingest result report — deterministic.

document-ingest does the extraction judgement; this script writes the outcome
to wiki/processes/<slug>/ingest.json — the file the app's triage screen reads
to show what an ingest produced.

The report JSON handed in is an object:
  { "file": "<source filename>",
    "created":  ["<element id>", ...],
    "updated":  ["<element id>", ...],
    "conflicts":   [ {"element","field","documentSays","wikiSays"}, ... ],
    "corrections": [ {"element","field","removed"}, ... ] }

Usage:
  write_ingest_report.py <slug> <report.json>
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        sys.exit("usage: write_ingest_report.py <slug> <report.json>")
    slug, report_path = argv

    proc_dir = WIKI_DIR / slug
    if not proc_dir.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    try:
        raw = json.loads(Path(report_path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"error: cannot read report JSON: {e}")
    if not isinstance(raw, dict):
        sys.exit("error: report JSON must be an object")

    def id_list(key: str) -> list[str]:
        v = raw.get(key, [])
        if not isinstance(v, list):
            sys.exit(f"error: {key} must be a list")
        return [str(x).strip() for x in v if str(x).strip()]

    def obj_list(key: str) -> list[dict]:
        v = raw.get(key, [])
        if not isinstance(v, list):
            sys.exit(f"error: {key} must be a list")
        return [x for x in v if isinstance(x, dict)]

    report = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "slug": slug,
        "file": str(raw.get("file", "")),
        "created": id_list("created"),
        "updated": id_list("updated"),
        "conflicts": obj_list("conflicts"),
        "corrections": obj_list("corrections"),
    }
    (proc_dir / "ingest.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(
        f"ingest.json written for {slug}: {len(report['created'])} created, "
        f"{len(report['updated'])} updated, {len(report['conflicts'])} conflict(s), "
        f"{len(report['corrections'])} correction(s)"
    )


if __name__ == "__main__":
    main(sys.argv[1:])

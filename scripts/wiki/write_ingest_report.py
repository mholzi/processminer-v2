#!/usr/bin/env python3
"""Write the document-ingest result report — deterministic.

document-ingest does the extraction judgement; this script writes the outcome
to wiki/processes/<slug>/ingest.json — the file the app's triage screen reads
to show what an ingest produced.

`created` and `updated` are NOT taken from the report JSON — they are derived
from the run manifest (write_element.py logs every write as created/updated),
so the counts are mechanical, never tallied from the model's memory. The
report JSON only carries the judgement parts:
  { "file": "<source filename>",
    "conflicts":   [ {"element","field","documentSays","wikiSays"}, ... ],
    "corrections": [ {"element","field","removed"}, ... ] }

The manifest is consumed (deleted) once read.

Usage:
  write_ingest_report.py <slug> <report.json>
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, read_manifest, reset_manifest  # noqa: E402


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

    def obj_list(key: str) -> list[dict]:
        v = raw.get(key, [])
        if not isinstance(v, list):
            sys.exit(f"error: {key} must be a list")
        return [x for x in v if isinstance(x, dict)]

    # created / updated come from the run manifest, not the report JSON —
    # first record per id wins (an id created then re-written stays created).
    created: list[str] = []
    updated: list[str] = []
    seen: set[str] = set()
    for rec in read_manifest(slug):
        eid = str(rec.get("id", "")).strip()
        if not eid or eid in seen:
            continue
        seen.add(eid)
        (created if rec.get("action") == "created" else updated).append(eid)

    report = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "slug": slug,
        "file": str(raw.get("file", "")),
        "created": created,
        "updated": updated,
        "conflicts": obj_list("conflicts"),
        "corrections": obj_list("corrections"),
    }
    reset_manifest(slug)
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

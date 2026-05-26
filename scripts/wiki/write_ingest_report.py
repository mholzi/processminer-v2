#!/usr/bin/env python3
"""Write the document-ingest result report — deterministic.

document-ingest does the extraction judgement; this script writes the outcome
to wiki/processes/<slug>/ingest.json — the file the app's triage screen reads
to show what an ingest produced.

`created` and `updated` are NOT taken from the report JSON — they are derived
from the run manifest (write_element.py logs every write as created/updated),
so the counts are mechanical, never tallied from the model's memory.

`conflicts` and `corrections` are also derived mechanically — by default they
are read from `/tmp/<slug>-conflicts.json` and `/tmp/<slug>-corrections.json`,
which `merge_manifests.py` writes from every drafter / verifier sub-agent.
That used to be an LLM-mediated copy step ("read the two files, build a small
report JSON, pass it to this script"); dropping that step is what makes the
counts trustworthy — the writer reads the merge output itself, so corrections
the verifiers genuinely produced can't be silently lost to the model's memory.

The optional report.json arg only has to carry `file` (the source filename)
plus any **overview-level** conflict/correction the model wants to append —
the overview is a manual write so its corrections aren't picked up by the
merge files. Pass `{ "file": "...", "conflicts": [...], "corrections": [...] }`
and those entries are concatenated on top of the merge files.

The run manifest is consumed (deleted) once read.

Usage:
  write_ingest_report.py <slug> [<report.json>]
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, read_manifest, reset_manifest  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) not in (1, 2):
        sys.exit("usage: write_ingest_report.py <slug> [<report.json>]")
    slug = argv[0]
    report_path = argv[1] if len(argv) == 2 else None

    proc_dir = WIKI_DIR / slug
    if not proc_dir.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    raw: dict = {}
    if report_path:
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

    # The drafter+verifier fan-out writes /tmp/<slug>-conflicts.json (drafter
    # conflicts) and /tmp/<slug>-corrections.json (verifier corrections). Read
    # them directly so the LLM doesn't have a chance to silently drop entries
    # while copying them into a hand-built report JSON — that's the failure
    # mode that produced "ingest.json shows 0 corrections" on a run where the
    # per-group verifier files held 49 of them.
    def load_merge(name: str) -> list[dict]:
        path = Path("/tmp") / f"{slug}-{name}.json"
        if not path.exists():
            return []
        try:
            v = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return []
        return [x for x in v if isinstance(x, dict)] if isinstance(v, list) else []

    merge_conflicts = load_merge("conflicts")
    merge_corrections = load_merge("corrections")

    # The overview is written by hand (not via merge) so any
    # overview-level entry the model wants to include comes from the
    # optional report.json. Concatenate, dedupe on (element, field).
    def dedupe(*sources: list[dict]) -> list[dict]:
        out: list[dict] = []
        seen: set[tuple[str, str]] = set()
        for s in sources:
            for entry in s:
                key = (str(entry.get("element", "")), str(entry.get("field", "")))
                if key in seen:
                    continue
                seen.add(key)
                out.append(entry)
        return out

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
        # Merge-file entries are the floor; any extras the model passed in the
        # optional report.json (typically overview-level) are appended.
        "conflicts": dedupe(merge_conflicts, obj_list("conflicts")),
        "corrections": dedupe(merge_corrections, obj_list("corrections")),
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

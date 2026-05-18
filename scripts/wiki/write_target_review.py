#!/usr/bin/env python3
"""Write a council-review pass result — deterministic.

The council-review skill does the judgement (the five perspective specialists
challenge the proposed target) and hands the result to this script as a JSON
file:

  { "ran": ["process-specialist", "control-compliance-specialist",
            "client-journey-specialist", "innovation-analyst",
            "it-architect"],
    "items": [ { "specialist": "control-compliance-specialist",
                 "title": "<one-line headline>",
                 "detail": "<the specialist's feedback>",
                 "targets": ["TD-FR-002", "TS-FR-002"] }, ... ] }

The script does the mechanics:

  1. Validates `ran` and every item; id-stamps the items (R-001, R-002, …).
  2. Stamps every item `triage: pending` — the SME rules accept/reject later.
  3. Writes wiki/processes/<slug>/target-review.json — what the app's Council
     Review panel (Validation section) reads.

Re-opening an implicated transformation-decision happens later, in the app,
when the SME *accepts* an item (the triageTargetReview server action) — never
here. This script only records the council's feedback.

Usage:
  write_target_review.py <slug> <result.json>
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, iter_elements  # noqa: E402

SPECIALISTS = (
    "process-specialist",
    "control-compliance-specialist",
    "client-journey-specialist",
    "innovation-analyst",
    "it-architect",
)


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        sys.exit("usage: write_target_review.py <slug> <result.json>")
    slug, result_path = argv

    proc_dir = WIKI_DIR / slug
    if not proc_dir.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    try:
        raw = json.loads(Path(result_path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"error: cannot read result JSON: {e}")
    if not isinstance(raw, dict):
        sys.exit("error: result JSON must be an object with `ran` and `items`")

    ran = raw.get("ran", [])
    if not isinstance(ran, list) or not ran:
        sys.exit("error: `ran` must be a non-empty list of specialists")
    for s in ran:
        if s not in SPECIALISTS:
            sys.exit(f"error: unknown specialist in `ran`: {s!r}")

    raw_items = raw.get("items", [])
    if not isinstance(raw_items, list):
        sys.exit("error: `items` must be a list")

    # Every element id in the process — to warn on a feedback item that
    # implicates an id that does not exist.
    known: set[str] = set()
    for _path, meta, _body in iter_elements(slug):
        eid = str(meta.get("id", ""))
        if eid:
            known.add(eid)

    items = []
    for n, it in enumerate(raw_items, start=1):
        if not isinstance(it, dict):
            sys.exit(f"error: item #{n} is not an object")
        spec = it.get("specialist")
        if spec not in SPECIALISTS:
            sys.exit(f"error: item #{n} has invalid specialist {spec!r}")
        if spec not in ran:
            sys.exit(f"error: item #{n} specialist {spec!r} is not in `ran`")
        title = str(it.get("title", "")).strip()
        detail = str(it.get("detail", "")).strip()
        if not title or not detail:
            sys.exit(f"error: item #{n} is missing title or detail")
        targets = it.get("targets", [])
        if not isinstance(targets, list):
            sys.exit(f"error: item #{n} targets must be a list")
        targets = [str(t).strip() for t in targets if str(t).strip()]
        for t in targets:
            if t not in known:
                print(f"warning: item #{n} references unknown element {t}")
        items.append(
            {
                "id": f"R-{n:03d}",
                "specialist": spec,
                "title": title,
                "detail": detail,
                "targets": targets,
                "triage": "pending",
            }
        )

    review = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "slug": slug,
        "ran": ran,
        "items": items,
    }
    (proc_dir / "target-review.json").write_text(
        json.dumps(review, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(
        f"wrote target-review.json — {len(items)} item(s) from "
        f"{len(ran)} specialist(s)"
    )


if __name__ == "__main__":
    main(sys.argv[1:])

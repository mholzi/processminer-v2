#!/usr/bin/env python3
"""Check every documented problem has an innovation idea against it — deterministic.

source-innovation derives `innovation-idea` elements from the documented
problems, and must leave none behind. The completeness rule lives in the schema:
`innovation-idea.addresses` declares exactly which element types are "a
documented problem" — pain-point, friction-point, process-gap and compliance-gap
(the control gap, in the `control-gaps` section). This script reads that list,
enumerates every such element, and checks each one is named by some
`innovation-idea`'s `addresses` frontmatter — so the cross-check is set
arithmetic, never the model's recollection.

Id matching is case-insensitive: `id:` frontmatter is canonical upper-case, but
an `addresses` entry typed in lower case still counts as coverage.

  idea_coverage.py <slug>   prints the coverage report as a JSON object

Output:
  { slug, problemTypes, total, complete, coveredCount, uncoveredCount,
    covered:[ids], uncovered:{ <type>:[ids] } }

`complete` is true when every problem is addressed — the signal the skill reads
before it closes out. Exit status is 0 whether or not problems are uncovered;
this reports, it does not gate.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, element_types, iter_elements  # noqa: E402


def problem_types() -> list[str]:
    """The element types `innovation-idea` can address, straight from the schema."""
    relations = element_types()["innovation-idea"]["frontmatter"]["relations"]
    for rel in relations:
        if rel["key"] == "addresses":
            target = rel["target"]
            return list(target) if isinstance(target, list) else [target]
    return []


def as_list(v) -> list[str]:
    if not v:
        return []
    return [str(x).strip() for x in (v if isinstance(v, list) else [v]) if str(x).strip()]


def main(argv: list[str]) -> None:
    if len(argv) != 1:
        sys.exit("usage: idea_coverage.py <slug>")
    slug = argv[0]

    if not (WIKI_DIR / slug).is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    types = problem_types()

    # Every documented-problem element, by type. Keyed by upper-cased id for
    # matching; the value keeps the id as written for the report.
    problems: dict[str, dict[str, str]] = {t: {} for t in types}
    # Every problem id named by some innovation-idea's `addresses`, upper-cased.
    covered_keys: set[str] = set()

    for _path, meta, _body in iter_elements(slug):
        etype = str(meta.get("type", ""))
        eid = str(meta.get("id", "")).strip()
        if etype in problems and eid:
            problems[etype][eid.upper()] = eid
        if etype == "innovation-idea":
            for ref in as_list(meta.get("addresses")):
                covered_keys.add(ref.upper())

    covered: list[str] = []
    uncovered: dict[str, list[str]] = {t: [] for t in types}
    for etype in types:
        for key, eid in problems[etype].items():
            if key in covered_keys:
                covered.append(eid)
            else:
                uncovered[etype].append(eid)

    covered.sort()
    for etype in types:
        uncovered[etype].sort()
    total = sum(len(problems[t]) for t in types)
    uncovered_count = sum(len(uncovered[t]) for t in types)

    print(json.dumps({
        "slug": slug,
        "problemTypes": types,
        "total": total,
        "complete": uncovered_count == 0,
        "coveredCount": len(covered),
        "uncoveredCount": uncovered_count,
        "covered": covered,
        "uncovered": uncovered,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1:])

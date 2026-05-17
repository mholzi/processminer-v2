#!/usr/bin/env python3
"""Reconcile exception `affects` against process-step `transitions` — deterministic.

An exception's `affects` (the process-steps it deviates from) is authored on
the exception. A process-step's `transitions` independently record where its
flow exits — including out to an exception. The two are separate authored
sources and must agree. This check flags every exception where the stored
`affects` and the set of steps whose `transitions` flow into it disagree.

run-lint folds the findings into the lint pass — they are deterministic
`discrepancy` findings, computed by set arithmetic, not judgement.

Usage:
  check_transitions.py <slug>          human-readable
  check_transitions.py <slug> --json   discrepancy findings as a JSON array
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import iter_elements  # noqa: E402


def as_list(v) -> list[str]:
    if not v:
        return []
    return [str(x).strip() for x in (v if isinstance(v, list) else [v]) if str(x).strip()]


def main(argv: list[str]) -> None:
    as_json = "--json" in argv
    argv = [a for a in argv if a != "--json"]
    if len(argv) != 1:
        sys.exit("usage: check_transitions.py <slug> [--json]")
    slug = argv[0]

    steps: dict[str, dict] = {}
    exceptions: dict[str, dict] = {}
    for _path, meta, _body in iter_elements(slug):
        eid = str(meta.get("id", ""))
        if not eid:
            continue
        if meta.get("type") == "process-step":
            steps[eid] = meta
        elif meta.get("type") == "exception":
            exceptions[eid] = meta

    # transitions-implied affects: step ids whose `transitions` flow into an
    # exception id (the transition target — `to` of `to|kind|when`).
    implied: dict[str, set[str]] = {eid: set() for eid in exceptions}
    for sid, meta in steps.items():
        for entry in as_list(meta.get("transitions")):
            to = entry.split("|")[0].strip()
            if to in exceptions:
                implied[to].add(sid)

    findings: list[dict] = []
    for eid, meta in sorted(exceptions.items()):
        stored = {s for s in as_list(meta.get("affects")) if s in steps}
        imp = implied[eid]
        only_affects = stored - imp        # affects names it, no transition flows in
        only_transition = imp - stored     # a transition flows in, affects omits it
        if not (only_affects or only_transition):
            continue
        parts = []
        if only_transition:
            parts.append(
                f"process-step(s) {', '.join(sorted(only_transition))} "
                f"transition into it, but its `affects` omits them"
            )
        if only_affects:
            parts.append(
                f"its `affects` lists {', '.join(sorted(only_affects))}, "
                f"but no process-step transitions into it"
            )
        findings.append({
            "kind": "discrepancy",
            "title": f"Flow mismatch: {eid} `affects` vs process-step transitions",
            "detail": "; ".join(parts) + ".",
            "elements": sorted({eid} | only_affects | only_transition),
        })

    if as_json:
        print(json.dumps(findings, indent=2, ensure_ascii=False))
        return
    if not findings:
        print(f"{slug}: exception `affects` and process-step transitions agree.")
        return
    for f in findings:
        print(f"✗ {f['title']}")
        print(f"    {f['detail']}")
    print(f"\n{len(findings)} flow mismatch(es)")


if __name__ == "__main__":
    main(sys.argv[1:])

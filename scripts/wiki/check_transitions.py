#!/usr/bin/env python3
"""Check exception wiring against process-step `transitions` — deterministic.

The single source of truth for what a process-step deviates to is that step's
own `transitions` (each entry `to|kind|when`). An exception is reached only
through a step's `transitions` — it stores no back-link of its own. This check
flags two defects:

  * orphan exception — no process-step `transitions` flow into it;
  * a process-step `exception`-kind transition whose target id is not a real
    exception element in the process.

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
from wiki_lib import iter_elements, load_transitions  # noqa: E402


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

    transitions_bundle = load_transitions(slug)

    # Step ids whose `transitions` flow into each exception id.
    into: dict[str, set[str]] = {eid: set() for eid in exceptions}
    # `exception`-kind transitions whose target is not a real exception.
    broken: list[tuple[str, str]] = []  # (step id, bad target)
    for sid in steps:
        for entry in transitions_bundle.get(sid, []):
            to = str(entry.get("to", "")).strip()
            kind = str(entry.get("kind", "normal")).strip()
            if not to:
                continue
            if to in exceptions:
                into[to].add(sid)
            elif kind == "exception" and to not in steps:
                broken.append((sid, to))

    findings: list[dict] = []
    for eid in sorted(exceptions):
        if not into[eid]:
            findings.append({
                "kind": "discrepancy",
                "title": f"Orphan exception: {eid}",
                "detail": (
                    f"No process-step `transitions` flow into {eid} — nothing "
                    f"in the documented flow reaches this exception."
                ),
                "elements": [eid],
            })
    for sid, to in sorted(broken):
        findings.append({
            "kind": "discrepancy",
            "title": f"Broken exception transition: {sid} → {to}",
            "detail": (
                f"Process-step {sid} has an `exception` transition to {to}, "
                f"which is not an exception element in this process."
            ),
            "elements": sorted({sid, to}),
        })

    if as_json:
        print(json.dumps(findings, indent=2, ensure_ascii=False))
        return
    if not findings:
        print(f"{slug}: every exception is reached by a process-step transition.")
        return
    for f in findings:
        print(f"✗ {f['title']}")
        print(f"    {f['detail']}")
    print(f"\n{len(findings)} exception-wiring issue(s)")


if __name__ == "__main__":
    main(sys.argv[1:])

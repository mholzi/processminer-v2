#!/usr/bin/env python3
"""Resolve a single lint finding — deterministic.

The full `run-lint` pass rewrites lint.json wholesale. This script does the
opposite: it closes *one* finding in place, the moment a chat deep-dive has
fixed the discrepancy and the SME has approved the change — so the Review
panel updates immediately, without waiting for the next re-lint.

It only ever flips `status` to `resolved` and stamps `resolvedBy`,
`resolvedAt` and an optional `resolutionNote`. It never deletes the finding:
the next `run-lint` rewrites lint.json from scratch, so a resolved finding
either disappears (the fix held) or re-surfaces as open (it did not) — the
deterministic re-lint stays the source of truth.

Idempotent — resolving an already-resolved finding just refreshes the stamp.

Usage:
  resolve_finding.py <slug> <finding-id> [--by <name>] [--note <text>]
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR  # noqa: E402


def main(argv: list[str]) -> None:
    # Parse: two positionals, then optional --by / --note flags.
    pos: list[str] = []
    by = "deep-dive"
    note = ""
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--by" and i + 1 < len(argv):
            by = argv[i + 1].strip() or by
            i += 2
        elif a == "--note" and i + 1 < len(argv):
            note = argv[i + 1].strip()
            i += 2
        else:
            pos.append(a)
            i += 1

    if len(pos) != 2:
        sys.exit(
            "usage: resolve_finding.py <slug> <finding-id> [--by <name>] "
            "[--note <text>]"
        )
    slug, finding_id = pos[0], pos[1].strip()

    lint_path = WIKI_DIR / slug / "lint.json"
    if not lint_path.is_file():
        sys.exit(f"error: no lint pass for {slug} — wiki/processes/{slug}/lint.json missing")

    try:
        report = json.loads(lint_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"error: cannot read lint.json: {e}")

    findings = report.get("findings")
    if not isinstance(findings, list):
        sys.exit("error: lint.json has no findings list")

    target = next((f for f in findings if f.get("id") == finding_id), None)
    if target is None:
        ids = ", ".join(f.get("id", "?") for f in findings) or "(none)"
        sys.exit(f"error: no finding {finding_id} in {slug} — have: {ids}")

    already = target.get("status") == "resolved"
    target["status"] = "resolved"
    target["resolvedBy"] = by
    target["resolvedAt"] = datetime.date.today().isoformat()
    if note:
        target["resolutionNote"] = note
    elif "resolutionNote" in target and not already:
        del target["resolutionNote"]

    lint_path.write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    open_count = sum(1 for f in findings if f.get("status") != "resolved")
    verb = "re-stamped (already resolved)" if already else "resolved"
    print(
        f"{finding_id} {verb} in {slug}: {target.get('title', '')} "
        f"— {open_count} finding(s) still open"
    )


if __name__ == "__main__":
    main(sys.argv[1:])

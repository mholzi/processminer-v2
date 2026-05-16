#!/usr/bin/env python3
"""Apply a lint pass result — deterministic.

The run-lint skill does the judgement (the cross-perspective sweep) and hands
the findings to this script as a JSON file. The script does the mechanics:

  1. Validates and id-stamps the findings (F-001, F-002, …).
  2. Writes wiki/processes/<slug>/lint.json — what the app's Review panel reads.
  3. Re-opens approvals: every element a finding implicates that is currently
     `approval: approved` is set back to `approval: in-progress`, stamped
     `approvalBy: run-lint` and today's date. Idempotent — a non-approved
     element is left untouched.

The findings JSON is a list of objects, each:
  { "kind": "conformance" | "discrepancy" | "question",
    "title": "<one-line headline>",
    "detail": "<the explanation or clarifying question>",
    "elements": ["<element-id>", …] }

Usage:
  apply_lint.py <slug> <findings.json>
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, iter_elements  # noqa: E402

KINDS = ("conformance", "discrepancy", "question")


def reopen(path: Path, today: str) -> None:
    """Patch an element's frontmatter back to in-progress, preserving order."""
    raw = path.read_text(encoding="utf-8")
    m = raw.split("\n---\n", 1)
    if not raw.startswith("---\n") or len(m) != 2:
        return
    fm_lines = m[0][4:].split("\n")
    body = m[1]

    def upsert(key: str, value: str) -> None:
        for i, line in enumerate(fm_lines):
            idx = line.find(":")
            if idx != -1 and line[:idx].strip() == key:
                fm_lines[i] = f"{key}: {value}"
                return
        fm_lines.append(f"{key}: {value}")

    upsert("approval", "in-progress")
    upsert("approvalBy", "run-lint")
    upsert("approvalDate", today)
    path.write_text("---\n" + "\n".join(fm_lines) + "\n---\n" + body, encoding="utf-8")


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        sys.exit("usage: apply_lint.py <slug> <findings.json>")
    slug, findings_path = argv

    proc_dir = WIKI_DIR / slug
    if not proc_dir.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    try:
        raw = json.loads(Path(findings_path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"error: cannot read findings JSON: {e}")
    if not isinstance(raw, list):
        sys.exit("error: findings JSON must be a list of finding objects")

    # Index the process's elements by id, and note which are approved.
    elements: dict[str, Path] = {}
    approved: set[str] = set()
    for path, meta, _body in iter_elements(slug):
        eid = str(meta.get("id", ""))
        if not eid:
            continue
        elements[eid] = path
        if str(meta.get("approval", "")) == "approved":
            approved.add(eid)

    # Validate and id-stamp the findings.
    findings = []
    for n, f in enumerate(raw, start=1):
        if not isinstance(f, dict):
            sys.exit(f"error: finding #{n} is not an object")
        kind = f.get("kind")
        if kind not in KINDS:
            sys.exit(f"error: finding #{n} has invalid kind {kind!r}")
        title = str(f.get("title", "")).strip()
        detail = str(f.get("detail", "")).strip()
        els = f.get("elements", [])
        if not title or not detail:
            sys.exit(f"error: finding #{n} is missing title or detail")
        if not isinstance(els, list):
            sys.exit(f"error: finding #{n} elements must be a list")
        els = [str(e).strip() for e in els if str(e).strip()]
        for e in els:
            if e not in elements:
                print(f"warning: finding #{n} references unknown element {e}")
        findings.append(
            {
                "id": f"F-{n:03d}",
                "kind": kind,
                "title": title,
                "detail": detail,
                "elements": els,
            }
        )

    summary = {k: sum(1 for f in findings if f["kind"] == k) for k in KINDS}

    report = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "slug": slug,
        "summary": summary,
        "findings": findings,
    }
    (proc_dir / "lint.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    # Re-open every implicated element that is currently approved.
    today = datetime.date.today().isoformat()
    implicated = {e for f in findings for e in f["elements"]}
    reopened = sorted(implicated & approved)
    for eid in reopened:
        reopen(elements[eid], today)

    print(
        f"lint.json written for {slug}: {len(findings)} finding(s) "
        f"({summary['discrepancy']} discrepancy, {summary['conformance']} "
        f"conformance, {summary['question']} question)"
    )
    if reopened:
        print(f"re-opened {len(reopened)} approved element(s): {', '.join(reopened)}")
    else:
        print("no approved elements implicated — no approvals re-opened")


if __name__ == "__main__":
    main(sys.argv[1:])

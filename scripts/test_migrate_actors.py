#!/usr/bin/env python3
"""Regression test for scripts/migrate_actors_to_userids.py.

The migration is destructive (overwrites frontmatter and JSON sidecars in
place), so it earns a hermetic test that exercises the core resolver
behaviours against a temp fixture:

  - exact-name match  → username
  - ASCII-fold match  (umlaut tolerance)
  - already-a-username  → idempotent
  - sentinel → untouched
  - unknown → reported as unresolved, not overwritten

Stdlib only. Run after touching the migration script:

  python3 scripts/test_migrate_actors.py
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

# Import the migration module under test.
import importlib.util

spec = importlib.util.spec_from_file_location(
    "migrate_actors_to_userids",
    ROOT / "scripts" / "migrate_actors_to_userids.py",
)
mig = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
spec.loader.exec_module(mig)  # type: ignore[union-attr]

_passed = _failed = 0


def chk(name: str, cond: bool, detail: str = "") -> None:
    global _passed, _failed
    if cond:
        _passed += 1
        print(f"  PASS  {name}")
    else:
        _failed += 1
        print(f"  FAIL  {name}" + (f"  --  {detail}" if detail else ""))


def run() -> None:
    # The resolver works off a `name → username` map; build the same shape
    # `load_user_map()` would build from users.json:
    name_map = {
        # ascii-fold of the display name → username
        "markus holzhauser": "admin",  # umlaut-stripped match
        "m. berger": "m.berger",
        # usernames pass through (the script also installs these)
        "admin": "admin",
        "m.berger": "m.berger",
    }

    print("\n— resolver semantics —")
    chk("exact-name match", mig.resolve("M. Berger", name_map) == "m.berger")
    chk(
        "umlaut tolerance via ASCII-fold",
        mig.resolve("Markus Holzhäuser", name_map) == "admin",
        repr(mig.resolve("Markus Holzhäuser", name_map)),
    )
    chk(
        "already-a-username is idempotent",
        mig.resolve("admin", name_map) == "admin",
    )
    chk(
        "sentinel 'the assistant' passes through unchanged",
        mig.resolve("the assistant", name_map) == "the assistant",
    )
    chk(
        "sentinel 'run-lint' passes through unchanged",
        mig.resolve("run-lint", name_map) == "run-lint",
    )
    chk(
        "unknown name returns None (caller reports unresolved)",
        mig.resolve("M. Vogel", name_map) is None,
    )
    chk(
        "empty string returns None",
        mig.resolve("", name_map) is None,
    )

    print("\n— end-to-end on a temp .md file —")
    with tempfile.TemporaryDirectory() as tmp:
        # Build a minimal fixture with a single .md file
        proc_dir = Path(tmp) / "wiki" / "processes" / "smoke"
        proc_dir.mkdir(parents=True)
        sample = proc_dir / "page.md"
        sample.write_text(
            "---\n"
            "id: SMK-001\n"
            "type: process-step\n"
            "title: Smoke\n"
            "approvalBy: M. Berger\n"
            "updatedBy: Markus Holzhäuser\n"
            "relevanceBy: Unknown Person\n"
            "---\nbody\n",
            encoding="utf-8",
        )
        report: list[dict] = []
        changed = mig.migrate_md_file(sample, name_map, apply=True, report=report)
        text = sample.read_text(encoding="utf-8")
        chk("end-to-end: file changed", changed)
        chk("end-to-end: M. Berger → m.berger", "approvalBy: m.berger" in text, text)
        chk("end-to-end: umlaut display → admin", "updatedBy: admin" in text, text)
        chk(
            "end-to-end: unresolved value preserved verbatim",
            "relevanceBy: Unknown Person" in text,
            text,
        )
        chk(
            "end-to-end: unresolved reported",
            any(r["kind"] == "unresolved" and r["value"] == "Unknown Person" for r in report),
        )
        chk(
            "end-to-end: migrated reported",
            sum(1 for r in report if r["kind"] == "migrated") == 2,
        )

    print(f"\n=========  {_passed} passed, {_failed} failed  =========")
    if _failed:
        sys.exit(1)


if __name__ == "__main__":
    run()

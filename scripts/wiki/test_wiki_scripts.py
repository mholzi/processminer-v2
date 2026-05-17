#!/usr/bin/env python3
"""Regression test for the deterministic wiki scripts.

The skills depend on scripts/wiki/*.py being exact and repeatable. This drives
the full script lifecycle on a throwaway process — scaffold, overview, element
writes, conformance, lint, the foundational-run cursor, patches, the ingest
manifest, sourcing counts, summaries, conflicts — and asserts the outcome.

Stdlib only, like the scripts themselves. Run it after touching any wiki
script or the schema:

  python3 scripts/wiki/test_wiki_scripts.py      (or: npm run test:scripts)

Exits non-zero on any failure. Uses a throwaway process; cleans up on exit.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG, PROC = "selftest-tmp", "SELF"
PROC_DIR = ROOT / "wiki" / "processes" / SLUG

_passed = 0
_failed = 0


def chk(name: str, cond: bool, detail: str = "") -> None:
    global _passed, _failed
    if cond:
        _passed += 1
        print(f"  PASS  {name}")
    else:
        _failed += 1
        print(f"  FAIL  {name}" + (f"  --  {detail}" if detail else ""))


def script(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["python3", str(ROOT / "scripts/wiki" / args[0]), *args[1:]],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )


def spec_file(obj: dict) -> str:
    f = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
    json.dump(obj, f)
    f.close()
    return f.name


STEP_BLOCKS = [
    {"heading": "What happens", "text": "The officer receives the incoming client request, logs it into the intake system, reviews it for completeness against the documentation checklist, and routes it onward or returns it to the client."},
    {"heading": "Inputs", "text": "- The client request\n- The documentation checklist"},
    {"heading": "Outputs", "text": "- A logged intake record\n- A routing decision"},
    {"heading": "Why it matters", "text": "It stops incomplete requests from entering the workflow, where they would stall and consume avoidable rework later on."},
]
EXC_BLOCKS = [
    {"heading": "Description", "text": "The documents the client submitted are incomplete and the request cannot be processed as it stands."},
    {"heading": "Handling", "text": "The officer returns the request to the client with a written list of exactly what is missing."},
    {"heading": "Impact", "text": "Adds a delay to the onboarding cycle and frustrates the client."},
]


def run() -> None:
    print("\n— new-process —")
    r = script("derive_process_meta.py", "A Brand New Unseen Process")
    chk("derive_process_meta: fresh slug not taken",
        json.loads(r.stdout).get("slugTaken") is False, r.stdout)
    r = script("derive_process_meta.py", "Cob 003")
    chk("derive_process_meta: existing slug flagged",
        json.loads(r.stdout).get("slugTaken") is True, r.stdout)
    r = script("scaffold_process.py", SLUG, PROC, "Self Test", "throwaway")
    chk("scaffold_process", r.returncode == 0 and (PROC_DIR / "index.md").is_file(), r.stderr)

    print("\n— write_overview —")
    r = script("write_overview.py", spec_file(
        {"slug": SLUG, "trigger": "A request arrives", "purpose": "Para one.\n\nPara two."}))
    chk("write_overview", r.returncode == 0
        and "trigger: A request arrives" in (PROC_DIR / "index.md").read_text(), r.stderr)

    print("\n— show_template / next_id / write_element / check_conformance —")
    r = script("show_template.py", "process-step")
    chk("show_template prints blocks", "What happens" in r.stdout, r.stderr)
    r = script("next_id.py", SLUG, "process-step")
    chk("next_id first id", r.stdout.strip() == "PS-SELF-001", r.stdout)
    r = script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-001", "title": "Triage",
         "confidence": "high", "source": "SME", "fields": {"owner": "Officer"},
         "relations": {"transitions": ["PS-SELF-002|normal|complete",
                                       "EX-SELF-001|exception|docs missing"]},
         "blocks": STEP_BLOCKS}))
    chk("write_element process-step", r.returncode == 0, r.stderr)
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-002", "title": "Process",
         "confidence": "high", "source": "SME", "fields": {"owner": "Officer"},
         "blocks": STEP_BLOCKS}))
    r = script("check_conformance.py", SLUG, "PS-SELF-001")
    chk("check_conformance: a conformant element passes", "conforms" in r.stdout, r.stdout)
    # an exception missing the required `affects` relation
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "exception", "id": "EX-SELF-001", "title": "Incomplete Docs",
         "confidence": "high", "source": "SME", "fields": {"category": "Data", "impact": "MEDIUM"},
         "blocks": EXC_BLOCKS}))
    r = script("check_conformance.py", SLUG, "EX-SELF-001")
    chk("check_conformance: flags missing required frontmatter",
        "required frontmatter" in r.stdout and "affects" in r.stdout, r.stdout)

    print("\n— write_element preserves unspecced frontmatter (S1) —")
    script("set_approval.py", SLUG, "PS-SELF-002", "approved", "M. Berger")
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-002", "title": "Process v2",
         "confidence": "medium", "source": "doc.pdf", "fields": {"owner": "Officer"},
         "blocks": STEP_BLOCKS}))
    after = (PROC_DIR / "process-steps" / "PS-SELF-002.md").read_text()
    chk("rewrite preserves approval stamp", "approval: approved" in after, after.split("---")[1])
    chk("rewrite applies the spec", "title: Process v2" in after)

    print("\n— check_conformance --json —")
    r = script("check_conformance.py", SLUG, "--json")
    try:
        findings = json.loads(r.stdout)
        chk("check_conformance --json is a valid array", isinstance(findings, list))
    except json.JSONDecodeError:
        chk("check_conformance --json is a valid array", False, r.stdout[:120])
        findings = []

    print("\n— check_transitions (affects ↔ transitions, S3) —")
    # PS-SELF-001 transitions into EX-SELF-001; EX-SELF-001 has no `affects` → mismatch
    r = script("check_transitions.py", SLUG, "--json")
    tfind = json.loads(r.stdout)
    chk("check_transitions flags the affects/transition mismatch",
        any("EX-SELF-001" in f["elements"] for f in tfind), r.stdout)
    script("patch_element.py", SLUG, "EX-SELF-001", "--list", "affects", "PS-SELF-001")
    r = script("check_transitions.py", SLUG, "--json")
    chk("check_transitions reconciles once affects matches", json.loads(r.stdout) == [])

    print("\n— apply_lint —")
    r = script("apply_lint.py", SLUG, spec_file(findings))
    chk("apply_lint writes lint.json", r.returncode == 0 and (PROC_DIR / "lint.json").is_file(), r.stderr)

    print("\n— review_cursor / set_approval —")
    r = script("review_cursor.py", "build", SLUG)
    chk("review_cursor build", json.loads(r.stdout).get("total", 0) > 0, r.stdout)
    r = script("review_cursor.py", "advance", SLUG)
    chk("review_cursor advance", json.loads(r.stdout).get("position", 0) >= 1, r.stdout)
    r = script("set_approval.py", SLUG, "PS-SELF-001", "approved", "SME")
    chk("set_approval rejects a placeholder name", r.returncode != 0)

    print("\n— patch_element —")
    tf = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False)
    tf.write("Replaced why-it-matters prose for the regression test.")
    tf.close()
    r = script("patch_element.py", SLUG, "PS-SELF-001", "--block", "Why it matters", tf.name)
    body = (PROC_DIR / "process-steps" / "PS-SELF-001.md").read_text()
    chk("patch_element --block", r.returncode == 0 and "Replaced why-it-matters" in body, r.stderr)
    chk("patch_element leaves other blocks intact", "A logged intake record" in body)

    print("\n— run manifest: reset / write / write_ingest_report —")
    script("reset_manifest.py", SLUG)
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-003", "title": "New",
         "confidence": "medium", "source": "doc.pdf", "fields": {"owner": "Officer"},
         "blocks": STEP_BLOCKS}))
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-001", "title": "Triage",
         "confidence": "medium", "source": "doc.pdf", "fields": {"owner": "Officer"},
         "relations": {"transitions": ["PS-SELF-002|normal|complete"]}, "blocks": STEP_BLOCKS}))
    script("write_ingest_report.py", SLUG, spec_file({"file": "doc.pdf", "conflicts": [], "corrections": []}))
    ing = json.loads((PROC_DIR / "ingest.json").read_text())
    chk("ingest report: created from manifest", ing["created"] == ["PS-SELF-003"], ing)
    chk("ingest report: updated from manifest", ing["updated"] == ["PS-SELF-001"], ing)

    print("\n— source: asOf auto-stamp / source_report —")
    script("reset_manifest.py", SLUG)
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "market-trend", "id": "TR-SELF-001", "title": "A Trend",
         "confidence": "medium", "source": "Study", "fields": {"horizon": "near-term", "sourceUrl": "https://e.com"},
         "blocks": [{"heading": "The trend", "text": "Digital onboarding adoption is accelerating across the market."},
                    {"heading": "Relevance", "text": "It bears on how this process must evolve to stay competitive."},
                    {"heading": "Evidence", "text": "Adoption rose forty percent year on year per the study."}]}))
    mt = (PROC_DIR / "market-trends" / "TR-SELF-001.md").read_text()
    chk("asOf auto-stamped on a sourced element", "asOf: 20" in mt, mt.split("---")[1])
    r = script("source_report.py", SLUG)
    chk("source_report counts per type", "market-trend: 1" in r.stdout, r.stdout)

    print("\n— area-summary: write_summary heading validation —")
    good = tempfile.NamedTemporaryFile("w", suffix=".md", delete=False)
    good.write("## Introduction\nA.\n\n## Current state\nB.\n\n## What stands out\nC.\n\n## Recommendation\nD.\n")
    good.close()
    r = script("write_summary.py", SLUG, "as-is", good.name)
    chk("write_summary accepts the four valid headings", r.returncode == 0, r.stderr)
    bad = tempfile.NamedTemporaryFile("w", suffix=".md", delete=False)
    bad.write("## Intro\nA.\n\n## Outro\nB.\n")
    bad.close()
    r = script("write_summary.py", SLUG, "as-is", bad.name)
    chk("write_summary rejects wrong headings", r.returncode != 0)

    print("\n— conflict-resolution: clear_conflicts —")
    r = script("clear_conflicts.py", SLUG)
    chk("clear_conflicts", r.returncode == 0
        and json.loads((PROC_DIR / "ingest.json").read_text())["conflicts"] == [], r.stderr)


def main() -> None:
    shutil.rmtree(PROC_DIR, ignore_errors=True)
    try:
        run()
    finally:
        shutil.rmtree(PROC_DIR, ignore_errors=True)
    print(f"\n=========  {_passed} passed, {_failed} failed  =========")
    sys.exit(1 if _failed else 0)


if __name__ == "__main__":
    main()

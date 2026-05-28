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

sys.path.insert(0, str(ROOT / "scripts" / "wiki"))
from wiki_lib import (  # noqa: E402
    assumption_owner,
    owner_of,
    parse_frontmatter,
)

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
REQ_BLOCKS = [
    {"heading": "Requirement", "text": "The target system must auto-release every clean straight-through item below the configured limit with no manual intervention."},
    {"heading": "Rationale", "text": "This operationalises the transformation decision to move clean items onto a straight-through path."},
    {"heading": "Acceptance criteria", "text": "- A clean item below the limit posts with no human touch\n- Every auto-release is written to the audit log"},
]
DEP_BLOCKS = [
    {"heading": "The dependency", "text": "The credit facility origination process, which approves the facility this process draws against."},
    {"heading": "What crosses the boundary", "text": "An approved facility record flows downstream into this process as the precondition for any release."},
    {"heading": "Why it matters", "text": "Without an approved facility there is nothing to release against and the process cannot start."},
]
ASM_BLOCKS = [
    {"heading": "The assumption", "text": "The sanctions screening list is refreshed daily before the business day opens."},
    {"heading": "Why it is unconfirmed", "text": "The refresh cadence was stated by the business SME but not verified against the feed."},
    {"heading": "Impact if wrong", "text": "A stale list would let a sanctioned counterparty pass screening undetected."},
]


def prov_elicited(blocks: list[dict]) -> dict:
    """A provenance map marking every block `elicited` with a stub SME quote —
    so the element can be approved through the gate."""
    return {
        b["heading"]: {
            "source": "elicited",
            "evidence": f"The SME described {b['heading'].lower()} in the session.",
        }
        for b in blocks
    }


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
         "provenance": prov_elicited(STEP_BLOCKS), "blocks": STEP_BLOCKS}))
    r = script("check_conformance.py", SLUG, "PS-SELF-001")
    chk("check_conformance: a conformant element passes", "conforms" in r.stdout, r.stdout)
    # an exception missing a required frontmatter field (impact)
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "exception", "id": "EX-SELF-001", "title": "Incomplete Docs",
         "confidence": "high", "source": "SME", "fields": {"category": "Data"},
         "blocks": EXC_BLOCKS}))
    r = script("check_conformance.py", SLUG, "EX-SELF-001")
    chk("check_conformance: flags missing required frontmatter",
        "required frontmatter" in r.stdout and "impact" in r.stdout, r.stdout)

    print("\n— write_element: rewrite carries unspecced keys, re-opens approval (S1) —")
    script("set_approval.py", SLUG, "PS-SELF-002", "approved", "M. Berger")
    # a hand-added frontmatter key the rewrite spec will not mention
    script("patch_element.py", SLUG, "PS-SELF-002", "--field", "reviewNote", "keepme")
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-002", "title": "Process v2",
         "confidence": "medium", "source": "doc.pdf", "fields": {"owner": "Officer"},
         "provenance": prov_elicited(STEP_BLOCKS), "blocks": STEP_BLOCKS}))
    after_meta, _ = parse_frontmatter(
        (PROC_DIR / "process-steps" / "PS-SELF-002.md").read_text())
    chk("rewrite carries forward an unspecced frontmatter key",
        after_meta.get("reviewNote") == "keepme", after_meta)
    chk("rewrite applies the spec", after_meta.get("title") == "Process v2", after_meta)
    chk("rewrite re-opens an approved element to in-progress",
        after_meta.get("approval") == "in-progress", after_meta)
    chk("rewrite drops the stale approver",
        "approvalBy" not in after_meta and "approvalDate" not in after_meta, after_meta)

    print("\n— check_conformance --json —")
    r = script("check_conformance.py", SLUG, "--json")
    try:
        findings = json.loads(r.stdout)
        chk("check_conformance --json is a valid array", isinstance(findings, list))
    except json.JSONDecodeError:
        chk("check_conformance --json is a valid array", False, r.stdout[:120])
        findings = []

    print("\n— check_transitions (orphan exception / broken transition, S3) —")
    # EX-SELF-001 is reached by PS-SELF-001's transitions → not orphan.
    # EX-SELF-002 has no process-step transition into it → orphan.
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "exception", "id": "EX-SELF-002", "title": "Stranded",
         "confidence": "high", "source": "SME", "fields": {"category": "Data", "impact": "LOW"},
         "blocks": EXC_BLOCKS}))
    r = script("check_transitions.py", SLUG, "--json")
    tfind = json.loads(r.stdout)
    chk("check_transitions flags an orphan exception",
        any("EX-SELF-002" in f["elements"] for f in tfind), r.stdout)
    script("patch_element.py", SLUG, "PS-SELF-002", "--list", "transitions",
           "EX-SELF-002|exception|stranded case")
    r = script("check_transitions.py", SLUG, "--json")
    chk("check_transitions clears once a step transitions into it",
        json.loads(r.stdout) == [])

    print("\n— apply_lint —")
    r = script("apply_lint.py", SLUG, spec_file(findings))
    chk("apply_lint writes lint.json", r.returncode == 0 and (PROC_DIR / "lint.json").is_file(), r.stderr)

    print("\n— resolve_finding —")
    known = [
        {"kind": "question", "title": "Resolve-test question",
         "detail": "A clarifying question for the resolve test.",
         "elements": ["PS-SELF-001"]},
        {"kind": "discrepancy", "title": "Resolve-test discrepancy",
         "detail": "A discrepancy for the resolve test.",
         "elements": ["PS-SELF-001"]},
    ]
    script("apply_lint.py", SLUG, spec_file(known))
    r = script("resolve_finding.py", SLUG, "F-001", "--note", "Fixed in deep-dive.")
    lint = json.loads((PROC_DIR / "lint.json").read_text())
    f1 = next(f for f in lint["findings"] if f["id"] == "F-001")
    f2 = next(f for f in lint["findings"] if f["id"] == "F-002")
    chk("resolve_finding marks the finding resolved",
        r.returncode == 0 and f1.get("status") == "resolved", r.stderr)
    chk("resolve_finding stamps resolvedBy / resolvedAt / note",
        bool(f1.get("resolvedBy")) and bool(f1.get("resolvedAt"))
        and f1.get("resolutionNote") == "Fixed in deep-dive.")
    chk("resolve_finding leaves other findings open", f2.get("status") != "resolved")
    chk("resolve_finding is idempotent",
        script("resolve_finding.py", SLUG, "F-001").returncode == 0)
    chk("resolve_finding rejects an unknown finding id",
        script("resolve_finding.py", SLUG, "F-999").returncode != 0)

    print("\n— review_cursor / set_approval —")
    r = script("review_cursor.py", "build", SLUG)
    chk("review_cursor build", json.loads(r.stdout).get("total", 0) > 0, r.stdout)
    # advance now requires --outcome and enforces approval state on Y/E.
    r = script("review_cursor.py", "advance", SLUG)
    chk("review_cursor advance requires --outcome", r.returncode != 0)
    r = script("review_cursor.py", "advance", SLUG, "--outcome", "E")
    chk("advance --outcome E refuses on un-approved element",
        r.returncode != 0 and "approval" in (r.stdout + r.stderr).lower())
    r = script("review_cursor.py", "advance", SLUG, "--outcome", "M")
    chk("review_cursor advance --outcome M moves the cursor",
        json.loads(r.stdout).get("position", 0) >= 1, r.stdout)
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

    print("\n— provenance: write / conformance / approval gate —")
    # The provenance map lives in wiki/processes/<slug>/provenance.json,
    # keyed by element id. Each test reads the bundle to verify the writer's
    # output rather than scraping the element's frontmatter.
    prov_bundle_path = PROC_DIR / "provenance.json"

    def load_prov_for(eid: str) -> dict:
        if not prov_bundle_path.is_file():
            return {}
        return json.loads(prov_bundle_path.read_text()).get(eid, {})

    def save_prov_for(eid: str, prov: dict) -> None:
        all_prov = json.loads(prov_bundle_path.read_text()) if prov_bundle_path.is_file() else {}
        all_prov[eid] = prov
        prov_bundle_path.write_text(json.dumps(all_prov, ensure_ascii=False, indent=2) + "\n")

    # A heading the spec gives no provenance for defaults to `proposed`.
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-010", "title": "Proposed",
         "fields": {"owner": "Officer"}, "blocks": STEP_BLOCKS}))
    p10_prov = load_prov_for("PS-SELF-010")
    chk("write_element builds a provenance map", bool(p10_prov), p10_prov)
    chk("provenance lives in the per-process bundle, not frontmatter",
        "provenance:" not in (PROC_DIR / "process-steps" / "PS-SELF-010.md").read_text())
    chk("unspecced headings default to proposed",
        all(e.get("source") == "proposed" for e in p10_prov.values()), p10_prov)
    r = script("check_conformance.py", SLUG, "PS-SELF-010")
    chk("conformance: an all-proposed element conforms", "conforms" in r.stdout, r.stdout)
    r = script("set_approval.py", SLUG, "PS-SELF-010", "approved", "M. Berger")
    chk("approval blocked while a heading is proposed", r.returncode != 0, r.stdout + r.stderr)
    # An elicited element carrying evidence passes the gate.
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-011", "title": "Elicited",
         "fields": {"owner": "Officer"}, "provenance": prov_elicited(STEP_BLOCKS),
         "blocks": STEP_BLOCKS}))
    r = script("set_approval.py", SLUG, "PS-SELF-011", "approved", "M. Berger")
    chk("approval allowed when every heading is elicited", r.returncode == 0, r.stdout + r.stderr)
    # Elicited but no evidence quote → conformance flags it.
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-012", "title": "No Evidence",
         "fields": {"owner": "Officer"},
         "provenance": {b["heading"]: {"source": "elicited", "evidence": ""}
                        for b in STEP_BLOCKS},
         "blocks": STEP_BLOCKS}))
    r = script("check_conformance.py", SLUG, "PS-SELF-012")
    chk("conformance flags an elicited heading with no evidence",
        "no evidence" in r.stdout, r.stdout)
    # A provenance key that names no template heading — the rename-drift the
    # review flagged as the accepted risk of keying the map by heading title.
    drifted = load_prov_for("PS-SELF-012")
    drifted["What it does NOW"] = {"source": "elicited", "evidence": "stray."}
    save_prov_for("PS-SELF-012", drifted)
    r = script("check_conformance.py", SLUG, "PS-SELF-012")
    chk("conformance flags a provenance key that drifted from the template",
        "names no template heading" in r.stdout, r.stdout)

    print("\n— provenance: patch_element resets the edited heading —")
    tf2 = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False)
    tf2.write("Reworked why-it-matters prose for the provenance-reset regression "
              "test, long enough to clear the template word floor for the block.")
    tf2.close()
    script("patch_element.py", SLUG, "PS-SELF-011", "--block", "Why it matters", tf2.name)
    prov11 = load_prov_for("PS-SELF-011")
    chk("patch flips the edited heading to proposed",
        prov11.get("Why it matters", {}).get("source") == "proposed", prov11)
    chk("patch leaves other headings elicited",
        prov11.get("What happens", {}).get("source") == "elicited", prov11)
    r = script("set_approval.py", SLUG, "PS-SELF-011", "approved", "M. Berger")
    chk("an edited heading re-blocks approval", r.returncode != 0, r.stdout + r.stderr)

    print("\n— migrate_grandfather: grandfather approved elements —")
    # Simulate two pre-rule elements (no provenance entry): one approved, one
    # draft. With the bundle storage the "pre-rule" state is the absence of an
    # entry for the element in provenance.json — strip them out instead of
    # editing a frontmatter line.
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-020", "title": "Legacy Approved",
         "fields": {"owner": "Officer"}, "provenance": prov_elicited(STEP_BLOCKS),
         "blocks": STEP_BLOCKS}))
    script("set_approval.py", SLUG, "PS-SELF-020", "approved", "M. Berger")
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-021", "title": "Legacy Draft",
         "fields": {"owner": "Officer"}, "blocks": STEP_BLOCKS}))
    all_prov = json.loads(prov_bundle_path.read_text())
    all_prov.pop("PS-SELF-020", None)
    all_prov.pop("PS-SELF-021", None)
    prov_bundle_path.write_text(json.dumps(all_prov, ensure_ascii=False, indent=2) + "\n")
    r = script("check_conformance.py", SLUG, "PS-SELF-020")
    chk("a pre-rule element fails conformance (no provenance)",
        "provenance map is missing" in r.stdout, r.stdout)
    r = script("migrate_grandfather.py", SLUG)
    chk("migrate_grandfather runs", r.returncode == 0, r.stderr)
    mig20 = load_prov_for("PS-SELF-020")
    chk("migrate tags the approved element legacy-approved",
        bool(mig20) and all(e["source"] == "legacy-approved" for e in mig20.values()),
        mig20)
    mig20_meta, _ = parse_frontmatter(
        (PROC_DIR / "process-steps" / "PS-SELF-020.md").read_text())
    chk("migrate keeps the element approved", mig20_meta.get("approval") == "approved", mig20_meta)
    chk("migrate leaves the draft element untouched", not load_prov_for("PS-SELF-021"))
    r = script("check_conformance.py", SLUG, "PS-SELF-020")
    chk("REGRESSION: a migrated approved element conforms again",
        "conforms" in r.stdout, r.stdout)

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

    print("\n— source-innovation: idea_coverage completeness check —")
    for pid, ptype in (("PP-SELF-001", "pain-point"), ("FP-SELF-001", "friction-point")):
        script("write_element.py", spec_file(
            {"slug": SLUG, "type": ptype, "id": pid, "title": f"A {ptype}",
             "blocks": [{"heading": "Description", "text": "A documented problem."}]}))
    cov = json.loads(script("idea_coverage.py", SLUG).stdout)
    chk("idea_coverage flags every problem uncovered before any idea",
        cov["total"] == 2 and cov["complete"] is False
        and cov["uncoveredCount"] == 2, cov)
    chk("idea_coverage derives problemTypes from the schema",
        set(cov["problemTypes"]) == {"pain-point", "friction-point",
                                     "process-gap", "compliance-gap"}, cov)
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "innovation-idea", "id": "II-SELF-001", "title": "An idea",
         "relations": {"addresses": ["pp-self-001"]},
         "blocks": [{"heading": "The idea", "text": "A proposed change."}]}))
    cov = json.loads(script("idea_coverage.py", SLUG).stdout)
    chk("idea_coverage matches an addresses id case-insensitively",
        cov["covered"] == ["PP-SELF-001"] and cov["complete"] is False, cov)
    chk("idea_coverage still flags the unaddressed problem",
        cov["uncovered"]["friction-point"] == ["FP-SELF-001"]
        and cov["uncoveredCount"] == 1, cov)

    print("\n— comment-review: notes.py resolve / summary —")
    notes_path = PROC_DIR / "notes.json"
    notes_path.write_text(json.dumps({
        "PS-SELF-001": [
            {"id": "n-1", "author": "SME", "text": "Is the SLA right?",
             "ts": "2026-05-19T10:00:00.000Z"},
            {"id": "n-2", "author": "SME", "text": "Add a step.",
             "ts": "2026-05-19T10:01:00.000Z"},
        ],
    }))
    r = script("notes.py", "resolve", SLUG, "PS-SELF-001", "n-1")
    nt = json.loads(notes_path.read_text())
    chk("notes.py resolve marks only the named comment",
        r.returncode == 0 and nt["PS-SELF-001"][0].get("resolved") is True
        and "resolved" not in nt["PS-SELF-001"][1], (r.returncode, nt))
    r = script("notes.py", "resolve", SLUG, "PS-SELF-001", "n-missing")
    chk("notes.py resolve rejects an unknown note id", r.returncode != 0)
    sf = tempfile.NamedTemporaryFile("w", suffix=".md", delete=False)
    sf.write("Reviewed both comments — SLA confirmed, a new step was added.")
    sf.close()
    r = script("notes.py", "summary", SLUG, "PS-SELF-001", "Process Specialist", sf.name)
    nt = json.loads(notes_path.read_text())
    summ = nt["PS-SELF-001"][-1]
    chk("notes.py summary appends a resolved analyst note",
        summ["author"] == "Process Specialist" and summ["resolved"] is True
        and summ["id"] == r.stdout.strip() and len(nt["PS-SELF-001"]) == 3,
        (r.stdout, summ))

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

    print("\n— content-model: new element types (requirement/dependency/assumption) —")
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "requirement", "id": "REQ-SELF-001",
         "title": "Auto-release clean items",
         "fields": {"reqType": "FUNCTIONAL", "moscow": "MUST"},
         "relations": {"derivedFrom": ["TD-SELF-001"]}, "blocks": REQ_BLOCKS}))
    r = script("check_conformance.py", SLUG, "REQ-SELF-001")
    chk("requirement element conforms", "conforms" in r.stdout, r.stdout)
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-dependency", "id": "DEP-SELF-001",
         "title": "Facility origination", "fields": {"direction": "UPSTREAM"},
         "relations": {"atStep": ["PS-SELF-001"]}, "blocks": DEP_BLOCKS}))
    r = script("check_conformance.py", SLUG, "DEP-SELF-001")
    chk("process-dependency element conforms", "conforms" in r.stdout, r.stdout)
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "assumption", "id": "ASM-SELF-001",
         "title": "Sanctions list refreshed daily",
         "fields": {"assumptionStatus": "OPEN"},
         "relations": {"bearsOn": ["PS-SELF-001"]}, "blocks": ASM_BLOCKS}))
    r = script("check_conformance.py", SLUG, "ASM-SELF-001")
    chk("assumption element conforms", "conforms" in r.stdout, r.stdout)
    # The required traceability relation is enforced.
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "requirement", "id": "REQ-SELF-002", "title": "No source",
         "fields": {"reqType": "FUNCTIONAL", "moscow": "SHOULD"}, "blocks": REQ_BLOCKS}))
    r = script("check_conformance.py", SLUG, "REQ-SELF-002")
    chk("a requirement with no derivedFrom is flagged", "derivedFrom" in r.stdout, r.stdout)

    print("\n— content-model: owner resolution (D2) —")
    chk("owner_of resolves an element to its section's specialist",
        owner_of(SLUG, "PS-SELF-001") == "process-specialist",
        owner_of(SLUG, "PS-SELF-001"))
    asm_meta, _ = parse_frontmatter(
        (PROC_DIR / "assumptions" / "ASM-SELF-001.md").read_text())
    owner, tgt = assumption_owner(SLUG, asm_meta)
    chk("assumption_owner resolves via bearsOn",
        owner == "process-specialist" and tgt == "PS-SELF-001", (owner, tgt))
    owner2, tgt2 = assumption_owner(SLUG, {"bearsOn": ["NOPE-SELF-999"]})
    chk("assumption_owner flags a dangling bearsOn",
        owner2 is None and tgt2 == "NOPE-SELF-999", (owner2, tgt2))

    print("\n— content-model: section status + glossary sidecars —")
    r = script("set_section_status.py", SLUG, "dependencies", "worked", "M. Berger")
    chk("set_section_status: worked", r.returncode == 0, r.stderr)
    script("set_section_status.py", SLUG, "pain-points", "confirmed-empty", "M. Berger")
    secs = json.loads((PROC_DIR / "sections.json").read_text())
    chk("section status records confirmed-empty",
        secs.get("pain-points", {}).get("status") == "confirmed-empty", secs)
    chk("section status counts elements on disk",
        secs.get("dependencies", {}).get("count") == 1, secs)
    script("set_section_status.py", SLUG, "dependencies", "worked")
    secs2 = json.loads((PROC_DIR / "sections.json").read_text())
    chk("set_section_status is idempotent (count from disk, not accumulated)",
        secs2.get("dependencies", {}).get("count") == 1, secs2)
    r = script("set_section_status.py", SLUG, "not-a-section", "worked")
    chk("set_section_status rejects an unknown section", r.returncode != 0)
    r = script("write_glossary.py", SLUG, "STP", "ACRONYM", "Straight-through processing.")
    chk("write_glossary writes a term",
        r.returncode == 0 and (PROC_DIR / "glossary.json").is_file(), r.stderr)
    script("write_glossary.py", SLUG, "FMS", "SYSTEM", "Facility Management System.")
    script("write_glossary.py", SLUG, "stp", "ACRONYM",
           "Straight-through processing — clean items, no manual touch.")
    gloss = json.loads((PROC_DIR / "glossary.json").read_text())
    chk("write_glossary upserts a term case-insensitively", len(gloss) == 2, gloss)

    print("\n— qer_cursor (qer-session state cursor) —")
    r = script("qer_cursor.py", "status", SLUG)
    chk("qer_cursor status before start reports not-exists",
        json.loads(r.stdout) == {"exists": False}, r.stdout)
    st = json.loads(script("qer_cursor.py", "start", SLUG).stdout)
    chk("qer_cursor start puts the cursor at SELECT",
        st["currentKey"] == "select" and st["position"] == 1, st)
    script("qer_cursor.py", "advance", SLUG)
    st = json.loads(script("qer_cursor.py", "advance", SLUG).stdout)
    chk("qer_cursor advances to the first perspective with built-skill info",
        st["currentKey"] == "process" and st.get("skillBuilt") is True, st)
    for _ in range(20):
        st = json.loads(script("qer_cursor.py", "advance", SLUG).stdout)
        if st.get("done"):
            break
    chk("qer_cursor advance terminates at done", st.get("done") is True, st)

    print("\n— write_elements (batch writer) —")
    ROLE_BLOCKS = [
        {"heading": "Responsibility", "text": "Owns the triage of every incoming client request, from intake through to the routing decision."},
        {"heading": "In this process", "text": "Performs the triage step and hands clean requests onward to processing."},
    ]
    r = script("write_elements.py", spec_file({
        "slug": SLUG, "source": "batch-source.pdf",
        "elements": [
            {"tempKey": "s", "type": "process-step", "title": "Batched Step",
             "confidence": "high", "blocks": STEP_BLOCKS},
            {"tempKey": "r", "type": "role", "title": "Batched Role",
             "confidence": "high", "relations": {"raci": ["@s:R"]},
             "blocks": ROLE_BLOCKS},
        ],
    }))
    chk("write_elements writes a batch", r.returncode == 0, r.stderr)
    ids = [ln.split()[1] for ln in r.stdout.splitlines() if ln.startswith("wrote ")]
    chk("write_elements wrote both elements", len(ids) == 2, r.stdout)
    step_id, role_id = (ids + ["", ""])[:2]
    chk("write_elements assigns ids across types",
        step_id.startswith("PS-SELF-") and role_id.startswith("ROLE-SELF-")
        and (PROC_DIR / "process-steps" / f"{step_id}.md").is_file()
        and (PROC_DIR / "roles" / f"{role_id}.md").is_file(), r.stdout)
    raci_bundle = json.loads((PROC_DIR / "raci.json").read_text())
    chk("write_elements resolves an @tempKey cross-reference",
        raci_bundle.get(role_id) == [{"step": step_id, "level": "R"}],
        raci_bundle)
    step_meta, _ = parse_frontmatter(
        (PROC_DIR / "process-steps" / f"{step_id}.md").read_text())
    chk("write_elements applies the manifest default source",
        step_meta.get("source") == "batch-source.pdf", step_meta)
    r = script("write_elements.py", spec_file({
        "slug": SLUG, "elements": [
            {"type": "role", "title": "Dangling", "blocks": ROLE_BLOCKS,
             "relations": {"raci": ["@ghost:R"]}},
        ],
    }))
    chk("write_elements rejects a dangling @tempKey reference",
        r.returncode != 0 and "@ghost" in (r.stdout + r.stderr), r.stdout + r.stderr)
    r = script("write_elements.py", spec_file({
        "slug": SLUG, "elements": [
            {"tempKey": "dup", "type": "process-step", "title": "A", "blocks": STEP_BLOCKS},
            {"tempKey": "dup", "type": "process-step", "title": "B", "blocks": STEP_BLOCKS},
        ],
    }))
    chk("write_elements rejects a duplicate tempKey",
        r.returncode != 0 and "dup" in (r.stdout + r.stderr), r.stdout + r.stderr)

    print("\n— write_element: --by stamps a stable user ID (not a display name) —")
    # `--by` writes the value verbatim. Callers pass a username (the stable
    # user ID), and renderers resolve username → display name at read time
    # via src/lib/contributors.ts. A rename in data/users.json then
    # propagates without rewriting any wiki file. The legacy display-name
    # migration is scripts/migrate_actors_to_userids.py.
    script("write_element.py", spec_file(
        {"slug": SLUG, "type": "process-step", "id": "PS-SELF-099",
         "title": "Username Stamp Probe", "confidence": "high", "source": "SME",
         "fields": {"owner": "Officer"}, "provenance": prov_elicited(STEP_BLOCKS),
         "blocks": STEP_BLOCKS}),
        "--by", "admin")
    probe = (PROC_DIR / "process-steps" / "PS-SELF-099.md").read_text()
    probe_fm = probe.split("---", 2)[1]
    chk("write_element --by stamps the user ID verbatim, never a display name",
        "updatedBy: admin" in probe and "Markus" not in probe_fm,
        probe_fm)

    print("\n— skills: shared SKILL.md block drift check —")
    r = subprocess.run(
        ["python3", str(ROOT / "scripts" / "check_skill_blocks.py")],
        capture_output=True, text=True, cwd=ROOT)
    chk("shared SKILL.md blocks are byte-identical across skills",
        r.returncode == 0, r.stdout + r.stderr)

    print("\n— schema: derived per-type files in sync with source —")
    r = subprocess.run(
        ["python3", str(ROOT / "scripts" / "wiki" / "build_derived_schemas.py"), "--check"],
        capture_output=True, text=True, cwd=ROOT)
    chk("schema/.derived/ matches build_derived_schemas.py output",
        r.returncode == 0, r.stdout + r.stderr)

    # Structural parity between the source schema and the derived per-type
    # files. The --check above catches any drift in the *bytes*; these checks
    # protect against a builder bug that emits drift-free but structurally
    # wrong output (e.g. dropping a required key or reordering headings).
    print("\n— schema: derived structure matches source —")
    full_schema = json.loads((ROOT / "schema" / "process-schema.json").read_text(encoding="utf-8"))
    source_types = set(full_schema["elementTypes"])
    derived_dir = ROOT / "schema" / ".derived"
    derived_types = {p.stem.removesuffix(".llm") for p in derived_dir.glob("*.llm.json")}
    chk("every source elementType has a derived file",
        source_types == derived_types,
        f"only in source: {sorted(source_types - derived_types)}; "
        f"only in derived: {sorted(derived_types - source_types)}")

    bad_required = []
    bad_headings = []
    for etype, t in full_schema["elementTypes"].items():
        derived = json.loads((derived_dir / f"{etype}.llm.json").read_text(encoding="utf-8"))
        src_req = list((t.get("frontmatter", {}) or {}).get("required") or [])
        if src_req != derived["frontmatter"]["required"]:
            bad_required.append(etype)
        src_headings = [b["heading"] for b in (t.get("template") or [])]
        drv_headings = [b["heading"] for b in derived["template"]]
        if src_headings != drv_headings:
            bad_headings.append(etype)
    chk("required frontmatter keys preserved in derived",
        not bad_required, f"mismatched: {bad_required}")
    chk("template heading order preserved in derived",
        not bad_headings, f"mismatched: {bad_headings}")

    # Curation override: a curated example path should win over auto-pick.
    # Synthesizes a curation file in a temp location so the real one (if any
    # is ever added) isn't touched. Picks a real wiki path that we know
    # exists, and asserts the builder emits exactly that.
    print("\n— schema: curated-examples override —")
    curated_target = "wiki/processes/sepa-payments/process-steps/PS-SP-001.md"
    if (ROOT / curated_target).is_file():
        with tempfile.TemporaryDirectory() as tmp_out:
            with tempfile.NamedTemporaryFile(
                "w", suffix=".json", delete=False, encoding="utf-8"
            ) as cf:
                json.dump({"role": [curated_target]}, cf)
                cf_path = cf.name
            try:
                r = subprocess.run(
                    ["python3", str(ROOT / "scripts" / "wiki" / "build_derived_schemas.py"),
                     "--out", tmp_out, "--curation", cf_path],
                    capture_output=True, text=True, cwd=ROOT,
                )
                chk("builder accepts --curation override",
                    r.returncode == 0, r.stdout + r.stderr)
                if r.returncode == 0:
                    role_derived = json.loads(
                        (Path(tmp_out) / "role.llm.json").read_text(encoding="utf-8")
                    )
                    paths = [ex["path"] for ex in role_derived["examples"]]
                    chk("curated path wins over auto-pick for 'role'",
                        paths == [curated_target],
                        f"got {paths}")
            finally:
                Path(cf_path).unlink(missing_ok=True)
    else:
        chk("curated-examples test fixture exists", False,
            f"missing reference element {curated_target}")


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

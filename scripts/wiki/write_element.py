#!/usr/bin/env python3
"""Write a wiki element file from a JSON spec — deterministic serialisation.

The skill drafts the *content* (judgement); this script guarantees the
frontmatter order, list syntax, block format and file path are correct, so an
element can never be written malformed or in the wrong place.

Usage:
  write_element.py <spec.json>

Spec shape:
  {
    "slug": "card-replacement",
    "type": "process-step",
    "id": "PS-CRD-001",
    "title": "Report the lost card",
    "status": "draft",                              (optional, default draft)
    "confidence": "high",                           (optional)
    "source": "SME interview - M. Berger",          (optional)
    "fields": { "owner": "...", "sla": "..." },     scalar frontmatter fields
    "relations": { "systems": ["SYS-CRD-001"] },    id-list frontmatter fields
    "provenance": {                                 (optional) per-heading
      "What happens": { "source": "elicited",       source + evidence quote;
                        "evidence": "<SME quote>" } a heading omitted here
    },                                              defaults to `proposed`
    "blocks": [ { "heading": "What happens", "text": "..." }, ... ]
  }

The `section` is derived from the element type via the schema — do not pass it.

Rewriting an existing id is non-lossy: any frontmatter key the spec omits
(`relevance` stamps, `transitions`, hand-added keys) is carried forward from
the file on disk. The spec wins for every key it names. One exception — a
rewrite re-opens review: an element that was `approved` (or `rejected`) is
reset to `in-progress` and its approver dropped, because the rewrite supersedes
the content the SME signed off on.
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    ROOT,
    WIKI_DIR,
    dump_provenance,
    element_types,
    log_write,
    parse_frontmatter,
    serialize_element,
)

REQUIRED = ("slug", "type", "id", "title", "blocks")


def main(argv: list[str]) -> None:
    if len(argv) != 1:
        sys.exit("usage: write_element.py <spec.json>")
    try:
        spec = json.loads(Path(argv[0]).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"error: could not read spec — {e}")

    for key in REQUIRED:
        if key not in spec:
            sys.exit(f"error: spec is missing required key '{key}'")

    types = element_types()
    etype = spec["type"]
    if etype not in types:
        sys.exit(f"error: unknown element type '{etype}'")
    section = types[etype]["section"]

    proc_dir = WIKI_DIR / spec["slug"]
    if not (proc_dir / "index.md").is_file():
        sys.exit(f"error: no process at wiki/processes/{spec['slug']}/")

    # Frontmatter, in a fixed, readable order.
    frontmatter: dict = {
        "id": spec["id"],
        "type": etype,
        "section": section,
        "title": spec["title"],
        "status": spec.get("status", "draft"),
    }
    if spec.get("confidence"):
        frontmatter["confidence"] = spec["confidence"]
    if spec.get("source"):
        frontmatter["source"] = spec["source"]
    for key, val in (spec.get("fields") or {}).items():
        frontmatter[key] = val
    # A relation key must be one the schema declares for this element type.
    # The reverse view of a relation (e.g. a system's "Steps", derived from
    # each process-step's `systems`) is computed by the app, never stored —
    # writing it creates the one-sided links lint then has to chase. Drop any
    # relation key the type does not declare, and say so.
    rel_keys = {
        r["key"]
        for r in ((types[etype].get("frontmatter") or {}).get("relations") or [])
    }
    # `transitions` / `raci` are id-lists carrying per-edge metadata — not
    # schema relations, but legitimate frontmatter (see relations.ts).
    rel_keys |= {"transitions", "raci"}
    for key, val in (spec.get("relations") or {}).items():
        if key not in rel_keys:
            print(
                f"warning: dropped relation '{key}' — not a schema relation "
                f"for type '{etype}'; its reverse view is derived, not stored",
                file=sys.stderr,
            )
            continue
        frontmatter[key] = list(val)

    # Provenance map (HALLUCINATION-PLAN.md): one entry per block heading,
    # recording where the content came from. A heading the spec did not
    # supply provenance for defaults to `proposed` — AI-added, unconfirmed.
    # Built fresh from the current blocks every write: prior provenance is
    # never carried forward, so a rewrite can never silently keep a stale
    # `elicited` mark on content that just changed.
    spec_prov = spec.get("provenance") or {}
    prov: dict = {}
    for block in spec["blocks"]:
        heading = block["heading"]
        entry = spec_prov.get(heading)
        if isinstance(entry, dict) and entry.get("source"):
            prov[heading] = {
                "source": entry["source"],
                "evidence": entry.get("evidence", ""),
            }
        else:
            prov[heading] = {"source": "proposed", "evidence": ""}
    frontmatter["provenance"] = dump_provenance(prov)

    # Auto-stamp `asOf` — the date a web-sourced element was sourced — when the
    # type declares the field and the spec did not supply it. Guarantees a
    # consistent ISO date and takes the burden off the skill. The schema's
    # frontmatter.fields entries are {key, label, …} objects.
    fm = types[etype].get("frontmatter", {}) or {}
    declared = {
        (f["key"] if isinstance(f, dict) else f) for f in fm.get("fields", [])
    } | set(fm.get("required", []))
    if "asOf" in declared and not frontmatter.get("asOf"):
        frontmatter["asOf"] = datetime.date.today().isoformat()

    section_dir = proc_dir / section
    section_dir.mkdir(parents=True, exist_ok=True)
    path = section_dir / f"{spec['id']}.md"
    existed = path.is_file()

    # Rewriting an existing element: carry forward every frontmatter key the
    # spec did not re-supply — relevance stamps, `transitions`, any hand-added
    # key — so a rewrite is never lossy. The spec wins for every key it names;
    # only untouched keys are preserved.
    if existed:
        prior, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
        for key, val in prior.items():
            frontmatter.setdefault(key, val)

        # ...but a rewrite supersedes the content the SME approved. A carried-
        # forward `approval: approved` stamp would then describe text no longer
        # on disk — and would let unconfirmed rewritten content sit inside an
        # "approved" element (HALLUCINATION-PLAN.md). Re-open the element so it
        # goes back through review; the provenance gate decides if it can be
        # re-approved. patch_element does the same per heading; this is the
        # whole-element rewrite path.
        if str(frontmatter.get("approval", "")).strip() in ("approved", "rejected"):
            frontmatter["approval"] = "in-progress"
            frontmatter.pop("approvalBy", None)
            frontmatter.pop("approvalDate", None)

    # Record created vs updated for the run manifest before the write lands.
    action = "updated" if existed else "created"
    path.write_text(serialize_element(frontmatter, spec["blocks"]), encoding="utf-8")
    log_write(spec["slug"], spec["id"], etype, action)

    print(f"wrote {path.relative_to(ROOT)} ({action})")


if __name__ == "__main__":
    main(sys.argv[1:])

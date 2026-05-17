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
    "blocks": [ { "heading": "What happens", "text": "..." }, ... ]
  }

The `section` is derived from the element type via the schema — do not pass it.

Rewriting an existing id is non-lossy: any frontmatter key the spec omits
(approval/relevance stamps, `transitions`, hand-added keys) is carried forward
from the file on disk. The spec wins for every key it names.
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
    for key, val in (spec.get("relations") or {}).items():
        frontmatter[key] = list(val)

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
    # spec did not re-supply — approval/relevance stamps, `transitions`, any
    # hand-added key — so a rewrite is never lossy. The spec wins for every
    # key it names; only untouched keys are preserved.
    if existed:
        prior, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
        for key, val in prior.items():
            frontmatter.setdefault(key, val)

    # Record created vs updated for the run manifest before the write lands.
    action = "updated" if existed else "created"
    path.write_text(serialize_element(frontmatter, spec["blocks"]), encoding="utf-8")
    log_write(spec["slug"], spec["id"], etype, action)

    print(f"wrote {path.relative_to(ROOT)} ({action})")


if __name__ == "__main__":
    main(sys.argv[1:])

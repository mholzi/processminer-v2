#!/usr/bin/env python3
"""Write a batch of wiki elements from one manifest — deterministic.

A skill creating many elements at once (document-ingest, the source-* skills)
would otherwise run next_id.py + write_element.py per element — dozens of
separate tool round-trips. This writes the whole run from a single manifest in
one pass: it assigns every new id, resolves cross-references between elements
created in the same batch, and writes every file with the same serialisation
write_element.py uses.

Usage:
  write_elements.py <manifest.json> [--by "<actor name>"]

`--by` stamps `updatedBy` on every element in the batch. Omit to fall back to
"the assistant" — the contributors feed reads `updatedBy` / `updatedAt`.

Manifest shape:
  {
    "slug": "debit-card-replacement",
    "source": "card-replacement-spec.pdf",     (optional default `source`)
    "elements": [
      {
        "tempKey": "step-1",        (optional) a handle to reference this
                                    element from another in the same batch
        "type": "process-step",
        "id": "PS-DCR-003",         (optional) present = update an existing
                                    element; omit = the script assigns the id
        "title": "Report the lost card",
        "status": "draft",          (optional, default draft)
        "confidence": "high",       (optional)
        "source": "...",            (optional, overrides the manifest source)
        "fields": { ... },          (optional) scalar frontmatter
        "relations": { ... },       (optional) id-lists; an entry may use
                                    "@<tempKey>" to point at another element
                                    in this batch — e.g. "raci": ["@step-1:R"]
        "provenance": { ... },      (optional) per-heading source + evidence
        "blocks": [ { "heading": "...", "text": "..." }, ... ]
      },
      ...
    ]
  }

Each element is the same spec write_element.py takes (minus `slug`, which is
taken from the manifest). Every "@<tempKey>" anywhere in a relation value is
replaced with the real id assigned to that element. A reference to an unknown
tempKey, a duplicate tempKey, or an unknown type fails the whole batch — so
the manifest is written, or nothing is.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import element_types, id_state, write_element_spec  # noqa: E402

REF_RE = re.compile(r"@([A-Za-z0-9_-]+)")


def fail(msg: str) -> None:
    sys.exit(f"error: {msg}")


def main(argv: list[str]) -> None:
    by: str | None = None
    rest: list[str] = []
    i = 0
    while i < len(argv):
        if argv[i] == "--by" and i + 1 < len(argv):
            by = argv[i + 1]
            i += 2
        else:
            rest.append(argv[i])
            i += 1
    if len(rest) != 1:
        sys.exit("usage: write_elements.py <manifest.json> [--by <actor>]")
    try:
        manifest = json.loads(Path(rest[0]).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        fail(f"could not read manifest — {e}")

    slug = manifest.get("slug")
    if not slug or not isinstance(slug, str):
        fail("manifest is missing a 'slug'")
    default_source = manifest.get("source")
    elements = manifest.get("elements")
    if not isinstance(elements, list) or not elements:
        fail("manifest has no 'elements'")

    types = element_types()

    # ---- validate every element up front -------------------------------
    for i, el in enumerate(elements):
        if not isinstance(el, dict):
            fail(f"element {i} is not an object")
        where = el.get("id") or el.get("tempKey") or f"#{i}"
        if el.get("type") not in types:
            fail(f"element {where} has unknown or missing type {el.get('type')!r}")
        if not el.get("title") or not isinstance(el["title"], str):
            fail(f"element {where} is missing a 'title'")
        blocks = el.get("blocks")
        if not isinstance(blocks, list) or not blocks:
            fail(f"element {where} has no 'blocks'")
        for b in blocks:
            if not isinstance(b, dict) or not b.get("heading"):
                fail(f"element {where} has a block with no 'heading'")
        rels = el.get("relations")
        if rels is not None:
            if not isinstance(rels, dict):
                fail(f"element {where} 'relations' must be an object")
            for key, val in rels.items():
                if not isinstance(val, list):
                    fail(f"element {where} relation '{key}' must be a list")

    # ---- pass 1: assign ids, build the tempKey map ---------------------
    try:
        proc, state = id_state(slug)
    except (FileNotFoundError, ValueError) as e:
        fail(str(e))

    tempmap: dict[str, str] = {}
    for i, el in enumerate(elements):
        etype = el["type"]
        if el.get("id"):
            eid = str(el["id"])  # an update — keep the existing id
        else:
            prefix = types[etype]["idPrefix"]
            n = state.get(etype, 0) + 1
            state[etype] = n
            eid = f"{prefix}-{proc}-{n:03d}"
            el["id"] = eid
        tk = el.get("tempKey")
        if tk:
            if tk in tempmap:
                fail(f"duplicate tempKey '{tk}'")
            tempmap[tk] = eid

    # ---- pass 2: resolve @tempKey references in relations --------------
    missing: set[str] = set()
    for el in elements:
        for vals in (el.get("relations") or {}).values():
            for v in vals:
                for m in REF_RE.finditer(str(v)):
                    if m.group(1) not in tempmap:
                        missing.add(m.group(1))
    if missing:
        fail(
            "relation reference(s) match no tempKey in this batch: "
            + ", ".join(f"@{k}" for k in sorted(missing))
        )
    for el in elements:
        rels = el.get("relations")
        if not rels:
            continue
        for key in list(rels):
            rels[key] = [
                REF_RE.sub(lambda m: tempmap[m.group(1)], str(v)) for v in rels[key]
            ]

    # ---- pass 3: write every element -----------------------------------
    written: list[tuple[str, str]] = []
    for el in elements:
        spec = {
            "slug": slug,
            "type": el["type"],
            "id": el["id"],
            "title": el["title"],
            "status": el.get("status"),
            "confidence": el.get("confidence"),
            "source": el.get("source") or default_source,
            "fields": el.get("fields"),
            "relations": el.get("relations"),
            "provenance": el.get("provenance"),
            "blocks": el["blocks"],
        }
        try:
            _path, action = write_element_spec(spec, by=by)
        except ValueError as e:
            fail(f"element {el['id']} — {e}")
        written.append((el["id"], action))

    created = sum(1 for _, a in written if a == "created")
    updated = sum(1 for _, a in written if a == "updated")
    for eid, action in written:
        print(f"wrote {eid} ({action})")
    print(f"— {len(written)} elements: {created} created, {updated} updated")


if __name__ == "__main__":
    main(sys.argv[1:])

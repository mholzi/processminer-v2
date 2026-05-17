#!/usr/bin/env python3
"""Print the conformant skeleton for an element type — straight from the schema.

A skill drafting an element needs to know its exact shape: the section it
lives in, the id prefix, and the `## ` blocks it must have with their format
and length. That used to mean reading a seeded example under
`wiki/processes/cob-003/`; this script prints it from
`schema/process-schema.json` instead, so there is no dependency on any
particular process existing.

Usage:
  show_template.py <type>          one element type, e.g. process-step
  show_template.py --list          list every element type
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import load_schema  # noqa: E402


def block_range(block: dict) -> str:
    """Human-readable size constraint for one template block."""
    if block.get("format") == "bullets":
        items = block.get("items")
        return f"bullets, {items} items" if items else "bullets"
    parts = ["paragraph"]
    if block.get("paragraphs"):
        parts.append(f"{block['paragraphs']} paragraph(s)")
    if block.get("words"):
        parts.append(f"{block['words']} words")
    return ", ".join(parts)


def main(argv: list[str]) -> None:
    if len(argv) != 1:
        sys.exit("usage: show_template.py <type> | --list")

    schema = load_schema()
    types = schema["elementTypes"]
    field_values = schema.get("fieldValues", {})

    if argv[0] == "--list":
        for key in sorted(types):
            print(f"{key:28} {types[key].get('label', '')}")
        return

    etype = argv[0]
    if etype not in types:
        sys.exit(
            f"error: unknown element type '{etype}' — "
            f"run show_template.py --list to see them all"
        )

    t = types[etype]
    print(f"{t.get('label', etype)}  (type: {etype})")
    print(f"  section:  {t['section']}")
    print(f"  idPrefix: {t['idPrefix']}   →  id format {t['idPrefix']}-<PROC>-<NNN>")

    fm = t.get("frontmatter", {})
    fields = fm.get("fields", [])
    relations = fm.get("relations", [])
    print()
    print("  Frontmatter — type-specific keys, beyond the universal")
    print("  id / type / section / title / status / confidence / source:")
    if fields:
        print("    fields:")
        for f in fields:
            # frontmatter.fields is a list of {key, label, ...} objects.
            key = f["key"] if isinstance(f, dict) else f
            vals = field_values.get(key)
            print(f"      {key}   — one of: {' | '.join(vals)}" if vals else f"      {key}")
    else:
        print("    fields:    (none)")
    if relations:
        print("    relations (id lists, written [a, b]):")
        for r in relations:
            # frontmatter.relations is a list of {key, label, ...} objects.
            print(f"      {r['key'] if isinstance(r, dict) else r}")
    else:
        print("    relations: (none)")

    tr = fm.get("transitions")
    if tr:
        print(
            f"    transitions: a list `transitions: [...]`, each entry "
            f"`{tr.get('format', '')}`"
        )
        if tr.get("kinds"):
            print(f"      kinds: {' | '.join(tr['kinds'])}")
        if tr.get("note"):
            print(f"      {tr['note']}")

    print()
    print("  Blocks — exactly these ## headings, in this order:")
    for block in t.get("template", []):
        print(f"  ## {block['heading']}   [{block_range(block)}]")
        if block.get("purpose"):
            print(f"      {block['purpose']}")


if __name__ == "__main__":
    main(sys.argv[1:])

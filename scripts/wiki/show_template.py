#!/usr/bin/env python3
"""Print the conformant skeleton for an element type — straight from the schema.

A skill drafting an element needs to know its exact shape: the section it
lives in, the id prefix, the frontmatter (fields, their allowed values, which
are required, the relations) and the `## ` blocks it must have with their
format and length. This prints all of that from `schema/process-schema.json`,
so a skill can pull just the types it owns instead of reading the whole schema
file into its context.

Usage:
  show_template.py <type> [<type> ...]   one or more element types
  show_template.py --list                list every element type
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


def print_type(etype: str, t: dict, field_values: dict) -> None:
    """Print one element type's full conformant contract."""
    print(f"{t.get('label', etype)}  (type: {etype})")
    print(f"  section:  {t['section']}")
    print(f"  idPrefix: {t['idPrefix']}   →  id format {t['idPrefix']}-<PROC>-<NNN>")

    fm = t.get("frontmatter", {})
    fields = fm.get("fields", [])
    relations = fm.get("relations", [])
    required = fm.get("required", [])
    print()
    print("  Frontmatter — type-specific keys, beyond the universal")
    print("  id / type / section / title / status / confidence / source:")
    if fields:
        print("    fields:")
        for f in fields:
            # frontmatter.fields is a list of {key, label, ...} objects.
            key = f["key"] if isinstance(f, dict) else f
            hint = f.get("hint") if isinstance(f, dict) else None
            suffix = f.get("suffix") if isinstance(f, dict) else None
            vals = field_values.get(key)
            # Print the key with its schema `hint` — the hint is what
            # disambiguates a field's expected format (a name vs an id, a
            # number vs a label), so a skill told this is the full contract
            # must see it, not just the bare key.
            print(f"      {key}   — {hint}" if hint else f"      {key}")
            if vals:
                print(f"        one of: {' | '.join(vals)}")
            # A `suffix` means the value is shown with that unit appended —
            # it signals the field is e.g. a number, not a free-text label.
            if suffix:
                print(f'        value carries the suffix "{suffix}" (e.g. "5{suffix}")')
            # A field may carry a paired URL companion stored under `urlKey`
            # (e.g. `source` + `sourceUrl`) — itself a real, sometimes
            # `required`, frontmatter key.
            if isinstance(f, dict) and f.get("urlKey"):
                uk = f["urlKey"]
                tag = " (required)" if uk in required else ""
                print(f"      {uk}   — URL for `{key}`{tag}")
    else:
        print("    fields:    (none)")
    if relations:
        print("    relations (id lists, written [a, b]):")
        for r in relations:
            # frontmatter.relations is a list of {key, label, ...} objects.
            print(f"      {r['key'] if isinstance(r, dict) else r}")
    else:
        print("    relations: (none)")
    print(f"    required:  {', '.join(required) if required else '(none)'}")

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

    raci = fm.get("raci")
    if raci:
        print(
            "    raci: lives in wiki/processes/<slug>/raci.json — pass under "
            "`relations.raci` on the spec as either `<stepId>:<level>` "
            "strings or `{step, level}` dicts (the writer normalises)."
        )
        if raci.get("levels"):
            print(f"      levels: {' | '.join(raci['levels'])}")
        if raci.get("note"):
            print(f"      {raci['note']}")

    print()
    print("  Blocks — exactly these ## headings, in this order:")
    for block in t.get("template", []):
        print(f"  ## {block['heading']}   [{block_range(block)}]")
        if block.get("purpose"):
            print(f"      {block['purpose']}")


def main(argv: list[str]) -> None:
    if not argv:
        sys.exit("usage: show_template.py <type> [<type> ...] | --list")

    schema = load_schema()
    types = schema["elementTypes"]
    field_values = schema.get("fieldValues", {})

    if argv == ["--list"]:
        for key in sorted(types):
            print(f"{key:28} {types[key].get('label', '')}")
        return

    unknown = [a for a in argv if a not in types]
    if unknown:
        sys.exit(
            f"error: unknown element type(s) {', '.join(unknown)} — "
            f"run show_template.py --list to see them all"
        )

    for i, etype in enumerate(argv):
        if i:
            print()
        print_type(etype, types[etype], field_values)


if __name__ == "__main__":
    main(sys.argv[1:])

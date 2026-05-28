#!/usr/bin/env python3
"""Print the conformant skeleton for an element type — from the derived schema.

A skill drafting an element needs to know its exact shape: the section it
lives in, the id prefix, the frontmatter (fields, their allowed values, which
are required, the relations) and the `## ` blocks it must have with their
format and length. This prints all of that from
`schema/.derived/<type>.llm.json`, the per-type slice of the full schema
emitted by `build_derived_schemas.py`. A skill loads one ~50–80 line file
instead of the 2,800-line source schema.

The stdout shape is preserved verbatim from the pre-derived implementation —
skills paste this output into LLM context and we don't want them to break.
The only addition is a final "Examples" section listing in-wiki paths the
skill can also read.

Usage:
  show_template.py <type> [<type> ...]   one or more element types
  show_template.py --list                list every element type
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import ROOT  # noqa: E402

DERIVED_DIR = ROOT / "schema" / ".derived"


def load_derived(etype: str) -> dict:
    """The derived spec for one type. Exits with a clear error if absent —
    that means `build_derived_schemas.py` hasn't been re-run after a schema
    change, and the user needs to rebuild rather than have us silently fall
    back to the source schema."""
    path = DERIVED_DIR / f"{etype}.llm.json"
    if not path.is_file():
        sys.exit(
            f"error: no derived schema for type '{etype}' at "
            f"{path.relative_to(ROOT)} — run "
            f"`python3 scripts/wiki/build_derived_schemas.py`"
        )
    return json.loads(path.read_text(encoding="utf-8"))


def known_types() -> list[str]:
    """Every element type with a derived file. Sorted, deterministic."""
    if not DERIVED_DIR.is_dir():
        sys.exit(
            f"error: {DERIVED_DIR.relative_to(ROOT)} does not exist — run "
            f"`python3 scripts/wiki/build_derived_schemas.py`"
        )
    return sorted(p.stem.removesuffix(".llm") for p in DERIVED_DIR.glob("*.llm.json"))


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


def print_type(d: dict) -> None:
    """Print one element type's full conformant contract from its derived spec.

    The stdout shape is locked: skills paste this into LLM context. The only
    addition compared to the pre-derived implementation is the trailing
    Examples block.
    """
    etype = d["elementType"]
    print(f"{d.get('label', etype)}  (type: {etype})")
    print(f"  section:  {d['section']}")
    print(f"  idPrefix: {d['idPrefix']}   →  id format {d['idPrefix']}-<PROC>-<NNN>")

    fm = d.get("frontmatter", {}) or {}
    fields = fm.get("fields") or []
    relations = fm.get("relations") or []
    required = fm.get("required") or []
    print()
    print("  Frontmatter — type-specific keys, beyond the universal")
    print("  id / type / section / title / status / confidence / source:")
    if fields:
        print("    fields:")
        for f in fields:
            key = f["key"]
            hint = f.get("hint")
            # Print the key with its schema `hint` — the hint is what
            # disambiguates a field's expected format (a name vs an id, a
            # number vs a label), so a skill told this is the full contract
            # must see it, not just the bare key.
            print(f"      {key}   — {hint}" if hint else f"      {key}")
            if f.get("enum"):
                print(f"        one of: {' | '.join(f['enum'])}")
            # A `suffix` means the value is shown with that unit appended —
            # it signals the field is e.g. a number, not a free-text label.
            if f.get("suffix"):
                print(f'        value carries the suffix "{f["suffix"]}" (e.g. "5{f["suffix"]}")')
            # A field may carry a paired URL companion stored under `urlKey`
            # (e.g. `source` + `sourceUrl`) — itself a real, sometimes
            # `required`, frontmatter key.
            if f.get("urlKey"):
                uk = f["urlKey"]
                tag = " (required)" if uk in required else ""
                print(f"      {uk}   — URL for `{key}`{tag}")
    else:
        print("    fields:    (none)")
    if relations:
        print("    relations (id lists, written [a, b]):")
        for r in relations:
            print(f"      {r['key']}")
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
    for block in d.get("template", []) or []:
        print(f"  ## {block['heading']}   [{block_range(block)}]")
        if block.get("purpose"):
            print(f"      {block['purpose']}")

    # Examples — new in the derived-file version. Paths point at conforming
    # elements the skill can read for a worked example of this type. Empty
    # when no in-wiki conforming element of this type exists yet.
    examples = d.get("examples") or []
    if examples:
        print()
        print("  Examples — in-wiki elements of this type to read for reference:")
        for ex in examples:
            print(f"    {ex['path']}")


def main(argv: list[str]) -> None:
    if not argv:
        sys.exit("usage: show_template.py <type> [<type> ...] | --list")

    if argv == ["--list"]:
        for etype in known_types():
            d = load_derived(etype)
            print(f"{etype:28} {d.get('label', '')}")
        return

    types = known_types()
    unknown = [a for a in argv if a not in types]
    if unknown:
        sys.exit(
            f"error: unknown element type(s) {', '.join(unknown)} — "
            f"run show_template.py --list to see them all"
        )

    for i, etype in enumerate(argv):
        if i:
            print()
        print_type(load_derived(etype))


if __name__ == "__main__":
    main(sys.argv[1:])

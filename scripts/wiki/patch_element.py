#!/usr/bin/env python3
"""Patch one block or one frontmatter field of an existing element — in place.

When a skill needs to change just one part of an element — a reworked block,
a corrected field, a resolved conflict — it should not re-emit the whole
element. Re-typing every untouched block risks silently dropping one. This
script reads the element, changes exactly the one block or field given, and
re-writes it; everything else stays as it was.

Usage:
  patch_element.py <slug> <id> --block "<heading>" <textfile>
  patch_element.py <slug> <id> --field "<key>" "<value>"
  patch_element.py <slug> <id> --list  "<key>" "<id1,id2,...>"

  --block   replace the prose under an existing `## <heading>`
  --field   set a scalar frontmatter field (created if absent)
  --list    set an id-list frontmatter field, e.g. relations
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    ROOT,
    dump_provenance,
    iter_elements,
    parse_blocks,
    parse_provenance,
    serialize_element,
)


def main(argv: list[str]) -> None:
    if len(argv) != 5 or argv[2] not in ("--block", "--field", "--list"):
        sys.exit(
            "usage: patch_element.py <slug> <id> "
            "(--block <heading> <textfile> | --field <key> <value> | "
            "--list <key> <id1,id2,...>)"
        )
    slug, eid, mode, key, value = argv

    found = None
    for path, meta, body in iter_elements(slug):
        if meta.get("id") == eid:
            found = (path, meta, body)
            break
    if not found:
        sys.exit(f"error: no element '{eid}' in process '{slug}'")
    path, meta, body = found
    blocks = parse_blocks(body)

    if mode == "--block":
        try:
            text = Path(value).read_text(encoding="utf-8").strip()
        except OSError as e:
            sys.exit(f"error: could not read block textfile — {e}")
        target = next((b for b in blocks if b["heading"] == key), None)
        if target is None:
            have = ", ".join(b["heading"] for b in blocks) or "(none)"
            sys.exit(
                f"error: element '{eid}' has no block '## {key}' — "
                f"blocks are: {have}"
            )
        target["text"] = text
        # Editing a block's prose invalidates its provenance: the new text is
        # AI-authored and unconfirmed until the SME re-approves it. Flip the
        # heading back to `proposed` (HALLUCINATION-PLAN.md — the critical gap:
        # without this, a hallucination re-enters an approved element silently).
        prov = parse_provenance(meta)
        prov[key] = {"source": "proposed", "evidence": ""}
        meta["provenance"] = dump_provenance(prov)
        what = f"block '## {key}' (provenance reset to proposed)"
    elif mode == "--list":
        items = [x.strip() for x in value.split(",") if x.strip()]
        meta[key] = items
        what = f"field '{key}' (list)"
    else:  # --field
        meta[key] = value
        what = f"field '{key}'"

    path.write_text(serialize_element(meta, blocks), encoding="utf-8")
    print(f"patched {what} of {eid} — {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main(sys.argv[1:])

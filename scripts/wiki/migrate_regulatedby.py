#!/usr/bin/env python3
"""One-off migration — make `control.regulatedBy` the single source of truth
for the control↔regulation link, and drop the denormalised reverse fields.

Background
----------
The data model derives every reverse relation view from the one canonical
forward field (see src/lib/relations.ts). Two fields broke that rule:

  * `regulation.controls` — a second, hand-maintained copy of the
    control↔regulation link. `control.regulatedBy` is now the single source;
    the regulation's "Controls" view is derived from it (schema reverseLabel).
  * `system.steps` — a denormalised copy of `process-step.systems`. The app
    never read it; when it drifted it produced phantom one-sided-link findings.

This migration, per process:
  1. unions `regulation.controls` into each control's `regulatedBy` (so no
     link is lost if it currently lives only on the regulation side),
  2. strips the `controls` field from every regulation,
  3. strips the `steps` field from every system.

It edits frontmatter in place — approval stamps and everything else are
preserved. It is idempotent: a second run finds nothing to do.

  migrate_regulatedby.py [<slug> ...]   default: every process
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    WIKI_DIR,
    parse_blocks,
    parse_frontmatter,
    serialize_element,
)


def as_list(v) -> list[str]:
    if not v:
        return []
    return [v] if isinstance(v, str) else list(v)


def migrate_process(slug: str) -> dict:
    proc = WIKI_DIR / slug
    stats = {"regulatedBy added": 0, "regulation.controls stripped": 0,
             "system.steps stripped": 0}

    # Load every element file once.
    files: list[tuple[Path, dict, str]] = []
    for path in sorted(proc.rglob("*.md")):
        if path.name == "index.md":
            continue
        meta, body = parse_frontmatter(path.read_text(encoding="utf-8"))
        if meta.get("id"):
            files.append((path, meta, body))

    # 1. Union regulation.controls -> control.regulatedBy.
    extra: dict[str, set[str]] = {}  # control id -> regulation ids to add
    for _p, meta, _b in files:
        if meta.get("type") == "regulation":
            for cid in as_list(meta.get("controls")):
                extra.setdefault(cid, set()).add(str(meta["id"]))

    dirty: set[Path] = set()
    for path, meta, _b in files:
        t = meta.get("type")
        if t == "control":
            want = extra.get(str(meta.get("id")), set())
            if want:
                cur = as_list(meta.get("regulatedBy"))
                merged = cur + [r for r in sorted(want) if r not in cur]
                if merged != cur:
                    meta["regulatedBy"] = merged
                    stats["regulatedBy added"] += len(merged) - len(cur)
                    dirty.add(path)
        elif t == "regulation":
            if "controls" in meta:
                del meta["controls"]
                stats["regulation.controls stripped"] += 1
                dirty.add(path)
        elif t == "system":
            if "steps" in meta:
                del meta["steps"]
                stats["system.steps stripped"] += 1
                dirty.add(path)

    for path, meta, body in files:
        if path in dirty:
            blocks = parse_blocks(body)
            path.write_text(
                serialize_element(meta, blocks), encoding="utf-8"
            )

    return stats


def main(argv: list[str]) -> None:
    slugs = argv or [
        p.name for p in sorted(WIKI_DIR.iterdir())
        if p.is_dir() and (p / "index.md").is_file()
    ]
    grand: dict[str, int] = {}
    for slug in slugs:
        if not (WIKI_DIR / slug / "index.md").is_file():
            print(f"skip: no process '{slug}'", file=sys.stderr)
            continue
        s = migrate_process(slug)
        print(f"{slug}: " + ", ".join(f"{k} {v}" for k, v in s.items()))
        for k, v in s.items():
            grand[k] = grand.get(k, 0) + v
    print("TOTAL: " + ", ".join(f"{k} {v}" for k, v in grand.items()))


if __name__ == "__main__":
    main(sys.argv[1:])

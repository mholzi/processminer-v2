#!/usr/bin/env python3
"""One-shot: lift `provenance` (JSON-in-YAML) and `transitions` (pipe-DSL)
out of element frontmatter and into per-process sidecar JSON bundles.

Before:
  ---
  id: PS-BGI-001
  ...
  transitions: [PS-BGI-002|normal|complete, EX-BGI-004|exception|incomplete]
  provenance: {"Inputs": {"evidence": "...", "source": "elicited"}, ...}
  ---

After:
  ---
  id: PS-BGI-001
  ...
  ---
  + wiki/processes/<slug>/provenance.json keyed by element id
  + wiki/processes/<slug>/transitions.json keyed by element id

Idempotent: an element with neither key in frontmatter is skipped quietly,
so the script is safe to re-run after partial success.

Usage:
  migrate_to_bundles.py              every process under wiki/processes/
  migrate_to_bundles.py <slug>       just one process
  migrate_to_bundles.py --dry-run    report what would change, write nothing
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    ROOT,
    WIKI_DIR,
    iter_elements,
    parse_blocks,
    parse_frontmatter,
    parse_transition_dsl,
    serialize_element,
    set_provenance,
    set_transitions,
)


def migrate_process(slug: str, dry_run: bool) -> tuple[int, int, int]:
    """Lift provenance + transitions out of every element under one process.
    Returns (provenance_lifted, transitions_lifted, elements_rewritten)."""
    proc_dir = WIKI_DIR / slug
    if not (proc_dir / "index.md").is_file():
        print(f"  skip {slug}: no index.md")
        return (0, 0, 0)

    provenance_lifted = 0
    transitions_lifted = 0
    rewritten = 0

    # Build the bundles in memory first, then write each one once at the end —
    # avoids re-reading provenance.json once per element.
    prov_bundle: dict[str, dict] = {}
    trans_bundle: dict[str, list[dict]] = {}
    rewrites: list[tuple[Path, dict, list[dict]]] = []

    for path, meta, body in iter_elements(slug):
        eid = str(meta.get("id", "")).strip()
        if not eid:
            continue

        changed = False

        # --- provenance: was an inline JSON string -----------------------
        raw_prov = meta.pop("provenance", None)
        if raw_prov:
            if isinstance(raw_prov, str):
                try:
                    prov_map = json.loads(raw_prov)
                except json.JSONDecodeError:
                    prov_map = None
            elif isinstance(raw_prov, dict):
                prov_map = raw_prov
            else:
                prov_map = None

            if isinstance(prov_map, dict) and prov_map:
                normalised = {
                    h: {
                        "source": e.get("source", "") if isinstance(e, dict) else "",
                        "evidence": e.get("evidence", "") if isinstance(e, dict) else "",
                    }
                    for h, e in prov_map.items()
                }
                prov_bundle[eid] = normalised
                provenance_lifted += 1
            changed = True

        # --- transitions: was a list of pipe-delimited strings -----------
        raw_trans = meta.pop("transitions", None)
        if raw_trans:
            entries = raw_trans if isinstance(raw_trans, list) else [raw_trans]
            parsed = [
                t for t in (parse_transition_dsl(entry) for entry in entries)
                if t is not None
            ]
            if parsed:
                trans_bundle[eid] = parsed
                transitions_lifted += 1
            changed = True

        if changed:
            rewrites.append((path, meta, parse_blocks(body)))

    if dry_run:
        print(
            f"  {slug}: would lift {provenance_lifted} provenance + "
            f"{transitions_lifted} transitions, rewrite {len(rewrites)} files"
        )
        return (provenance_lifted, transitions_lifted, len(rewrites))

    # Write bundles first. set_provenance / set_transitions merge with what is
    # already on disk (some processes may have been partially migrated), so a
    # re-run never wipes entries the previous run already wrote.
    for eid, prov in prov_bundle.items():
        set_provenance(slug, eid, prov)
    for eid, trans in trans_bundle.items():
        set_transitions(slug, eid, trans)

    for path, meta, blocks in rewrites:
        path.write_text(serialize_element(meta, blocks), encoding="utf-8")
        rewritten += 1

    print(
        f"  {slug}: lifted {provenance_lifted} provenance + "
        f"{transitions_lifted} transitions, rewrote {rewritten} files"
    )
    return (provenance_lifted, transitions_lifted, rewritten)


def main(argv: list[str]) -> None:
    dry_run = "--dry-run" in argv
    argv = [a for a in argv if a != "--dry-run"]

    if not WIKI_DIR.is_dir():
        sys.exit(f"error: no wiki at {WIKI_DIR.relative_to(ROOT)}")

    if len(argv) == 0:
        slugs = sorted(
            d.name for d in WIKI_DIR.iterdir()
            if d.is_dir() and (d / "index.md").is_file()
        )
    elif len(argv) == 1:
        slugs = [argv[0]]
    else:
        sys.exit("usage: migrate_to_bundles.py [<slug>] [--dry-run]")

    label = "DRY RUN" if dry_run else "MIGRATING"
    print(f"{label} {len(slugs)} process(es)\n")

    totals = (0, 0, 0)
    for slug in slugs:
        prov_n, trans_n, rewrites_n = migrate_process(slug, dry_run)
        totals = (totals[0] + prov_n, totals[1] + trans_n, totals[2] + rewrites_n)

    verb = "would lift" if dry_run else "lifted"
    rewrite_verb = "would rewrite" if dry_run else "rewrote"
    print(
        f"\n{verb} {totals[0]} provenance + {totals[1]} transitions; "
        f"{rewrite_verb} {totals[2]} element file(s) across {len(slugs)} process(es)."
    )


if __name__ == "__main__":
    main(sys.argv[1:])

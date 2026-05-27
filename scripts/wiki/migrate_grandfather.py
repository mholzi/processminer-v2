#!/usr/bin/env python3
"""Grandfather already-approved elements into the provenance model — one-time.

The hallucination countermeasure (HALLUCINATION-PLAN.md D5) makes a per-heading
`provenance` map mandatory and gates approval on it. Elements approved before
that rule have no provenance data and would all fail conformance.

This pass tags every element whose `approval` is `approved` with a provenance
map where each template heading is `legacy-approved` — exempt from the evidence
requirement, visibly distinct from `elicited` in the app. New, edited and
lint-reopened elements get the full treatment; the corpus self-heals as
elements are touched.

Draft / unapproved elements are left untouched — they will get real provenance
when next written. Idempotent: an element that already carries a `provenance`
map is skipped, so a re-run is safe.

Usage:
  migrate_grandfather.py <slug>            migrate the process
  migrate_grandfather.py <slug> --dry-run  report what would change, write nothing
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    WIKI_DIR,
    element_types,
    iter_elements,
    load_provenance,
    set_provenance,
    template_headings,
)


def main(argv: list[str]) -> None:
    dry_run = "--dry-run" in argv
    argv = [a for a in argv if a != "--dry-run"]
    if len(argv) != 1:
        sys.exit("usage: migrate_grandfather.py <slug> [--dry-run]")
    slug = argv[0]

    if not (WIKI_DIR / slug).is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    types = element_types()
    provenance_bundle = load_provenance(slug)
    migrated: list[str] = []
    skipped_unapproved = 0
    skipped_have_provenance = 0

    for _path, meta, _body in iter_elements(slug):
        info = types.get(str(meta.get("type", "")))
        if not info or not info.get("template"):
            continue
        eid = str(meta.get("id"))
        if str(meta.get("approval", "")).strip() != "approved":
            skipped_unapproved += 1
            continue
        if provenance_bundle.get(eid):
            skipped_have_provenance += 1
            continue

        legacy = {
            heading: {"source": "legacy-approved", "evidence": ""}
            for heading in template_headings(info)
        }
        migrated.append(eid)
        if dry_run:
            continue

        set_provenance(slug, eid, legacy)

    verb = "would tag" if dry_run else "tagged"
    print(f"{verb} {len(migrated)} approved element(s) as legacy-approved")
    for eid in migrated:
        print(f"  {eid}")
    print(
        f"skipped: {skipped_unapproved} not approved, "
        f"{skipped_have_provenance} already have provenance"
    )
    if not dry_run and migrated:
        print(f"\nrun: python3 scripts/wiki/check_conformance.py {slug}")


if __name__ == "__main__":
    main(sys.argv[1:])

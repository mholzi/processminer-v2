#!/usr/bin/env python3
"""Scaffold a new Processminer process — deterministic.

Creates wiki/processes/<slug>/ with a folder (+ .gitkeep) for every schema
section and a labelled, empty index.md. The new-process skill elicits and
confirms the inputs; this script does the mechanical file creation so it is
exact and repeatable.

Usage:
  scaffold_process.py <slug> <PROC> <title> <description>

  slug         kebab-case folder name        e.g. card-replacement
  PROC         2-4 uppercase letters (IDs)   e.g. CRD
  title        the process name              e.g. "Card Replacement"
  description  one-line description
"""

from __future__ import annotations

import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, section_ids, serialize_element  # noqa: E402

# Process-level overview fields, written blank — qer-session's OVERVIEW step
# fills them later.
OVERVIEW_FIELDS = [
    "processOwner",
    "trigger",
    "frequency",
    "scopeIn",
    "scopeOut",
    "processInput",
    "processOutput",
]


def main(argv: list[str]) -> None:
    if len(argv) != 4:
        sys.exit(
            "usage: scaffold_process.py <slug> <PROC> <title> <description>"
        )
    slug, proc, title, description = argv

    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        sys.exit(f"error: slug must be kebab-case — got '{slug}'")
    if not re.fullmatch(r"[A-Z]{2,4}", proc):
        sys.exit(f"error: PROC must be 2-4 uppercase letters — got '{proc}'")
    if not title.strip():
        sys.exit("error: title is empty")

    proc_dir = WIKI_DIR / slug
    if proc_dir.exists():
        sys.exit(
            f"error: a process already exists at wiki/processes/{slug}/ — "
            "not overwriting"
        )

    proc_dir.mkdir(parents=True)

    created = []
    for sid in section_ids():
        if sid == "overview":
            continue
        folder = proc_dir / sid
        folder.mkdir()
        # git does not track empty directories — .gitkeep makes the section
        # folder real and committable.
        (folder / ".gitkeep").write_text("", encoding="utf-8")
        created.append(sid)

    frontmatter: dict = {
        "id": proc,
        "type": "process",
        "title": title,
        "status": "draft",
        "description": description,
    }
    # Stamp the creator when the chat session has exported their identity.
    # The web app sets PROCESSMINER_USER on the `claude` worker; standalone
    # CLI runs leave it unset and the fields are simply omitted.
    created_by = os.environ.get("PROCESSMINER_USER", "").strip()
    if created_by:
        frontmatter["createdBy"] = created_by
        frontmatter["createdAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for field in OVERVIEW_FIELDS:
        frontmatter[field] = ""
    frontmatter["docStatus"] = "empty"

    (proc_dir / "index.md").write_text(
        serialize_element(frontmatter, []), encoding="utf-8"
    )

    print(f"Scaffolded process '{title}' at wiki/processes/{slug}/")
    print(f"  index.md written (id {proc}, overview blank)")
    print(f"  {len(created)} section folders: {', '.join(created)}")


if __name__ == "__main__":
    main(sys.argv[1:])

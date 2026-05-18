#!/usr/bin/env python3
"""Write or update a glossary term — the process glossary sidecar.

CONTENT-MODEL-PLAN.md D1. A glossary is dozens of one-line term definitions —
reference data, not multi-block documented elements. It lives in a per-process
`glossary.json` sidecar (the `lint.json` / `ingest.json` pattern), outside the
element / provenance / approval machinery.

Each entry is `{term, termType, definition}`. `termType` is one of
TERM | ACRONYM | SYSTEM. A term is upserted case-insensitively, so re-writing
a term updates it rather than duplicating it. Entries are kept sorted by term.

Usage:
  write_glossary.py <slug> <term> <termType> <definition>
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR  # noqa: E402

TERM_TYPES = ("TERM", "ACRONYM", "SYSTEM")


def main(argv: list[str]) -> None:
    if len(argv) != 4:
        sys.exit("usage: write_glossary.py <slug> <term> <termType> <definition>")
    slug, term, term_type, definition = argv

    if term_type not in TERM_TYPES:
        sys.exit(f"error: termType must be one of {', '.join(TERM_TYPES)}")
    if not term.strip() or not definition.strip():
        sys.exit("error: term and definition must both be non-empty")

    proc = WIKI_DIR / slug
    if not proc.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    path = proc / "glossary.json"
    terms: list = []
    if path.is_file():
        try:
            loaded = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(loaded, list):
                terms = loaded
        except json.JSONDecodeError:
            terms = []

    # Upsert by term, case-insensitive — never duplicate a term.
    terms = [
        t
        for t in terms
        if not (
            isinstance(t, dict)
            and str(t.get("term", "")).lower() == term.lower()
        )
    ]
    terms.append({"term": term, "termType": term_type, "definition": definition})
    terms.sort(key=lambda t: str(t.get("term", "")).lower())

    path.write_text(
        json.dumps(terms, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"{slug}: glossary now holds {len(terms)} term(s)")


if __name__ == "__main__":
    main(sys.argv[1:])

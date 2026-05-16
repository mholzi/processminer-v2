#!/usr/bin/env python3
"""Derive a deterministic slug and PROC abbreviation from a process name.

The new-process skill runs this so the slug and the element-ID abbreviation
are predictable — the same name always yields the same values — instead of
being improvised by the model. The user still confirms (and may edit) them.

Usage:
  derive_process_meta.py "<process name>"

Prints one line of JSON:
  {"slug": "funds-release", "proc": "FR"}
"""

from __future__ import annotations

import json
import re
import sys

STOPWORDS = {
    "of", "the", "a", "an", "and", "for", "to", "in", "on", "at", "by",
}


def slugify(name: str) -> str:
    """Lowercase kebab-case: 'Funds Release' -> 'funds-release'."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def abbreviate(name: str) -> str:
    """2-4 uppercase letters, deterministic.

    Initials of the significant words; a single-word name uses its first
    three letters. Same name in always gives the same abbreviation out.
    """
    words = re.findall(r"[A-Za-z]+", name)
    significant = [w for w in words if w.lower() not in STOPWORDS] or words
    if len(significant) >= 2:
        proc = "".join(w[0] for w in significant).upper()[:4]
    elif len(significant) == 1:
        proc = significant[0][:3].upper()
    else:
        proc = ""
    # Guarantee at least two letters.
    if len(proc) < 2 and significant:
        proc = significant[0][:3].upper()
    return proc


def main(argv: list[str]) -> None:
    if len(argv) != 1 or not argv[0].strip():
        sys.exit('usage: derive_process_meta.py "<process name>"')
    name = argv[0].strip()

    slug = slugify(name)
    proc = abbreviate(name)
    if not slug:
        sys.exit(f"error: could not derive a slug from '{name}'")
    if not 2 <= len(proc) <= 4:
        sys.exit(f"error: could not derive an abbreviation from '{name}'")

    print(json.dumps({"slug": slug, "proc": proc}))


if __name__ == "__main__":
    main(sys.argv[1:])

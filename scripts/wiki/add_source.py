#!/usr/bin/env python3
"""Record an uploaded source document in a process's index.md — deterministic.

Adds the filename to the `sources:` list in the process index frontmatter,
preserving everything else. Idempotent: a filename already listed is left as is.

Usage:
  add_source.py <slug> <filename>
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR  # noqa: E402


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        sys.exit("usage: add_source.py <slug> <filename>")
    slug, filename = argv

    index = WIKI_DIR / slug / "index.md"
    if not index.is_file():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    raw = index.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", raw, re.DOTALL)
    if not m:
        sys.exit(f"error: {slug}/index.md is malformed")
    fm_lines = m.group(1).split("\n")
    body = m.group(2)

    # Find the existing `sources:` line, if any.
    sources: list[str] = []
    sources_idx = None
    for i, line in enumerate(fm_lines):
        if line.split(":", 1)[0].strip() == "sources":
            sources_idx = i
            val = line.split(":", 1)[1].strip()
            if val.startswith("[") and val.endswith("]"):
                inner = val[1:-1].strip()
                sources = [x.strip() for x in inner.split(",")] if inner else []
            elif val:
                sources = [val]
            break

    if filename in sources:
        print(f"{filename} is already a recorded source of {slug}")
        return

    sources.append(filename)
    new_line = f"sources: [{', '.join(sources)}]"
    if sources_idx is not None:
        fm_lines[sources_idx] = new_line
    else:
        fm_lines.append(new_line)

    index.write_text(
        "---\n" + "\n".join(fm_lines) + f"\n---\n{body}", encoding="utf-8"
    )
    print(f"recorded {filename} as a source of {slug} ({len(sources)} total)")


if __name__ == "__main__":
    main(sys.argv[1:])

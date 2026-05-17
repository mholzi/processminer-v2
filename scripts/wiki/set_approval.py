#!/usr/bin/env python3
"""Set an element's (or the process overview's) review approval — deterministic.

Patches `approval`, `approvalBy` and `approvalDate` in the frontmatter,
preserving key order and the body. The overview is `index.md`; pass the
process id (the id in index.md) to target it.

The Python twin of setApproval() in src/lib/wiki-write.ts — used by the
foundational-run skill when the SME approves an element in the chat.

Usage:
  set_approval.py <slug> <id> <status> <by>
    status: in-progress | approved | rejected
"""

from __future__ import annotations

import datetime
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, iter_elements, parse_frontmatter  # noqa: E402

STATUSES = ("in-progress", "approved", "rejected")

# An approval must be stamped with a real SME name. These are the values a
# skill produces when it was never told one — reject them so a guess never
# lands in the wiki as an approval author.
PLACEHOLDER_NAMES = {"", "sme", "the sme", "<sme name>", "sme name", "unknown"}


def patch(path: Path, status: str, by: str, today: str) -> None:
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", raw, re.DOTALL)
    if not m:
        sys.exit(f"error: {path} is malformed")
    fm = m.group(1).split("\n")
    body = m.group(2)

    def upsert(key: str, value: str) -> None:
        for i, line in enumerate(fm):
            idx = line.find(":")
            if idx != -1 and line[:idx].strip() == key:
                fm[i] = f"{key}: {value}"
                return
        fm.append(f"{key}: {value}")

    upsert("approval", status)
    upsert("approvalBy", by)
    upsert("approvalDate", today)
    path.write_text("---\n" + "\n".join(fm) + "\n---\n" + body, encoding="utf-8")


def main(argv: list[str]) -> None:
    if len(argv) != 4:
        sys.exit("usage: set_approval.py <slug> <id> <status> <by>")
    slug, eid, status, by = argv
    if status not in STATUSES:
        sys.exit(f"error: status must be one of {', '.join(STATUSES)}")
    if by.strip().lower() in PLACEHOLDER_NAMES:
        sys.exit(
            f"error: '{by}' is not a real SME name — pass the name of the "
            "SME present in the session, not a placeholder"
        )

    proc_dir = WIKI_DIR / slug
    if not proc_dir.is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    today = datetime.date.today().isoformat()

    # An element?
    for path, meta, _body in iter_elements(slug):
        if str(meta.get("id")) == eid:
            patch(path, status, by, today)
            print(f"{eid}: approval set to {status} by {by}")
            return

    # The process overview (index.md)?
    index = proc_dir / "index.md"
    if index.is_file():
        meta, _ = parse_frontmatter(index.read_text(encoding="utf-8"))
        if str(meta.get("id")) == eid:
            patch(index, status, by, today)
            print(f"{eid} (overview): approval set to {status} by {by}")
            return

    sys.exit(f"error: no element or overview with id {eid} in {slug}")


if __name__ == "__main__":
    main(sys.argv[1:])

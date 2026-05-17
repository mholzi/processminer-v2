#!/usr/bin/env python3
"""Manage the foundational-run cursor — deterministic.

The foundational-run skill walks a process's As-Is elements one at a time,
challenging each. This script owns wiki/processes/<slug>/review-state.json —
the resumable record of the ordered queue and the current position, so a run
can be stopped and picked up later.

  review_cursor.py build   <slug>   build the As-Is queue, cursor at 0
  review_cursor.py status  <slug>   report the current item / position
  review_cursor.py advance <slug>   move the cursor forward one

review-state.json:
  { slug, queue:[ids], cursor, total, done, startedAt, updatedAt }

The queue is the overview first, then As-Is elements in foundational-
dependency order: process steps, roles, then the As-Is detail. Forward-looking
elements (innovation, target state) are excluded. Within a type, lower
confidence comes first.
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, iter_elements, parse_frontmatter  # noqa: E402

# As-Is element types, in foundational-dependency order. Forward-looking types
# (market-trend, innovation-idea, innovation-risk, target-state,
# transformation-decision, gap) are deliberately excluded.
TIER: list[str] = [
    "process-step",
    "role",
    "exception",
    "control",
    "regulation",
    "compliance-gap",
    "audit-finding",
    "pain-point",
    "friction-point",
    "cx-channel",
    "cx-touchpoint",
    "moment",
    "system",
    "integration",
    "metric",
    "process-gap",
]
CONFIDENCE_RANK = {"low": 0, "medium": 1, "high": 2}


def state_path(slug: str) -> Path:
    return WIKI_DIR / slug / "review-state.json"


def now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def build_queue(slug: str) -> list[str]:
    index = WIKI_DIR / slug / "index.md"
    queue: list[str] = []
    if index.is_file():
        meta, _ = parse_frontmatter(index.read_text(encoding="utf-8"))
        if meta.get("id"):
            queue.append(str(meta["id"]))  # the overview, first

    by_type: dict[str, list[tuple[int, str]]] = {t: [] for t in TIER}
    for _path, meta, _body in iter_elements(slug):
        etype = str(meta.get("type", ""))
        if etype in by_type:
            rank = CONFIDENCE_RANK.get(str(meta.get("confidence", "")), 1)
            by_type[etype].append((rank, str(meta.get("id", ""))))
    for etype in TIER:
        for _rank, eid in sorted(by_type[etype]):
            if eid:
                queue.append(eid)
    return queue


def load(slug: str) -> dict | None:
    path = state_path(slug)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def save(slug: str, state: dict) -> None:
    state["updatedAt"] = now()
    state_path(slug).write_text(
        json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def report(state: dict) -> None:
    cursor, queue = state["cursor"], state["queue"]
    done = cursor >= len(queue)
    out = {
        "position": min(cursor + 1, len(queue)),
        "total": len(queue),
        "done": done,
        "current": None if done else queue[cursor],
    }
    print(json.dumps(out, ensure_ascii=False))


def main(argv: list[str]) -> None:
    if len(argv) != 2 or argv[0] not in ("build", "status", "advance"):
        sys.exit("usage: review_cursor.py <build|status|advance> <slug>")
    cmd, slug = argv

    if not (WIKI_DIR / slug).is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    if cmd == "build":
        queue = build_queue(slug)
        if not queue:
            sys.exit(f"error: nothing to review in {slug}")
        state = {
            "slug": slug,
            "queue": queue,
            "cursor": 0,
            "total": len(queue),
            "done": False,
            "startedAt": now(),
            "updatedAt": now(),
        }
        save(slug, state)
        report(state)
        return

    state = load(slug)
    if state is None:
        sys.exit(f"error: no review-state.json for {slug} — run 'build' first")

    if cmd == "advance":
        if state["cursor"] < len(state["queue"]):
            state["cursor"] += 1
        state["done"] = state["cursor"] >= len(state["queue"])
        save(slug, state)

    report(state)


if __name__ == "__main__":
    main(sys.argv[1:])

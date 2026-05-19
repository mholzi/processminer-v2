#!/usr/bin/env python3
"""Manage the qer-session cursor — deterministic.

A QER session runs a fixed sequence: SELECT, OVERVIEW, one pass per perspective
specialist, CROSS-PERSPECTIVE REVIEW, VALIDATION, DONE. The session is long and
interruptible. This script owns wiki/processes/<slug>/qer-state.json — the
resumable record of which step the session is on — so a stopped session is
picked up at the right step instead of re-derived by eye.

  qer_cursor.py start   <slug>   begin a session, cursor at the first step
  qer_cursor.py status  <slug>   report the current step
  qer_cursor.py advance <slug>   move the cursor forward one step

qer-state.json:
  { slug, cursor, total, done, startedAt, updatedAt }

The step list is fixed — that is what makes the session auditable. Perspective
steps name their specialist skill; `status` reports whether that skill is built
(its SKILL.md exists on disk), so the session can skip a not-built specialist
without a hardcoded registry status that drifts.
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR  # noqa: E402

SKILLS_DIR = Path(__file__).resolve().parent.parent.parent / ".claude" / "skills"

# The fixed QER session sequence. Perspective steps carry their specialist
# skill; the rest are frame steps qer-session owns directly. Target Process
# runs last — it synthesises the documented perspectives.
STEPS: list[dict] = [
    {"key": "select", "label": "SELECT"},
    {"key": "overview", "label": "OVERVIEW"},
    {"key": "process", "label": "PERSPECTIVE — Process",
     "skill": "process-specialist"},
    {"key": "control-compliance", "label": "PERSPECTIVE — Control & Compliance",
     "skill": "control-compliance-specialist"},
    {"key": "client-journey", "label": "PERSPECTIVE — Client Journey",
     "skill": "client-journey-specialist"},
    {"key": "innovation", "label": "PERSPECTIVE — Innovation",
     "skill": "innovation-analyst"},
    {"key": "it-architecture", "label": "PERSPECTIVE — IT Architecture",
     "skill": "it-architect"},
    {"key": "target", "label": "PERSPECTIVE — Target Process",
     "skill": "transformation-agent"},
    {"key": "cross-review", "label": "CROSS-PERSPECTIVE REVIEW"},
    {"key": "validation", "label": "VALIDATION"},
    {"key": "done", "label": "DONE"},
]
TOTAL = len(STEPS)


def state_path(slug: str) -> Path:
    return WIKI_DIR / slug / "qer-state.json"


def now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


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
    cursor = state["cursor"]
    done = cursor >= TOTAL
    out: dict = {
        "exists": True,
        "position": min(cursor + 1, TOTAL),
        "total": TOTAL,
        "done": done,
    }
    if not done:
        step = STEPS[cursor]
        out["currentKey"] = step["key"]
        out["current"] = step["label"]
        skill = step.get("skill")
        out["skill"] = skill
        if skill is not None:
            out["skillBuilt"] = (SKILLS_DIR / skill / "SKILL.md").is_file()
    print(json.dumps(out, ensure_ascii=False))


def main(argv: list[str]) -> None:
    if len(argv) != 2 or argv[0] not in ("start", "status", "advance"):
        sys.exit("usage: qer_cursor.py <start|status|advance> <slug>")
    cmd, slug = argv

    if not (WIKI_DIR / slug).is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    if cmd == "start":
        state = {
            "slug": slug,
            "cursor": 0,
            "total": TOTAL,
            "done": False,
            "startedAt": now(),
            "updatedAt": now(),
        }
        save(slug, state)
        report(state)
        return

    state = load(slug)
    if state is None:
        if cmd == "status":
            print(json.dumps({"exists": False}, ensure_ascii=False))
            return
        sys.exit(f"error: no qer-state.json for {slug} — run 'start' first")

    if cmd == "advance":
        if state["cursor"] < TOTAL:
            state["cursor"] += 1
        state["done"] = state["cursor"] >= TOTAL
        save(slug, state)

    report(state)


if __name__ == "__main__":
    main(sys.argv[1:])

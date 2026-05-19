#!/usr/bin/env python3
"""Drift check for the shared provenance blocks across the skills.

The hallucination countermeasure's instructions are inline-repeated, verbatim,
across the skills (HALLUCINATION-PLAN.md D8 — keeps SKILLS.md §5's "each
SKILL.md stands alone" principle). Inline repetition drifts: this check fails
if the copies of a marked region are not byte-identical.

Four blocks are checked:
  PROVENANCE-BLOCK         — read-back instructions, in the 6 specialist
                             skills and `foundational-run` (7 copies)
  WRITING-PROCEDURE-BLOCK  — the element-writing procedure, in the 6 specialists
  BATCHING-BLOCK           — the Y/E/R batching rule, in the 6 specialists
  WEB-PROVENANCE-BLOCK     — web-sourced provenance, in the 3 web-sourcing skills

Usage:
  check_skill_blocks.py            verify; exit non-zero on drift or a missing block
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SPECIALISTS = [
    "process-specialist",
    "control-compliance-specialist",
    "client-journey-specialist",
    "innovation-analyst",
    "transformation-agent",
    "it-architect",
]

# (marker name, skills that must carry a byte-identical copy)
SHARED_BLOCKS = [
    ("PROVENANCE-BLOCK", SPECIALISTS + ["foundational-run"]),
    ("WRITING-PROCEDURE-BLOCK", SPECIALISTS),
    ("BATCHING-BLOCK", SPECIALISTS),
    (
        "WEB-PROVENANCE-BLOCK",
        ["source-innovation", "source-cx", "source-regulation"],
    ),
]


def extract(path: Path, marker: str) -> str | None:
    """The marked region (markers included), or None if absent."""
    start = f"<!-- {marker}:start -->"
    end = f"<!-- {marker}:end -->"
    text = path.read_text(encoding="utf-8")
    i = text.find(start)
    j = text.find(end)
    if i == -1 or j == -1 or j < i:
        return None
    return text[i : j + len(end)]


def check_block(marker: str, skills: list[str]) -> None:
    blocks: dict[str, str | None] = {}
    for name in skills:
        path = ROOT / ".claude" / "skills" / name / "SKILL.md"
        if not path.is_file():
            sys.exit(f"error: missing skill file {path}")
        blocks[name] = extract(path, marker)

    missing = [n for n, b in blocks.items() if b is None]
    if missing:
        sys.exit(f"error: {marker} markers not found in: " + ", ".join(missing))

    reference = blocks[skills[0]]
    drifted = [n for n in skills[1:] if blocks[n] != reference]
    if drifted:
        sys.exit(
            f"error: {marker} has drifted from {skills[0]} in: "
            f"{', '.join(drifted)}. The copies must be byte-identical."
        )
    print(f"{marker}: byte-identical across {len(skills)} skills ✓")


def main() -> None:
    for marker, skills in SHARED_BLOCKS:
        check_block(marker, skills)


if __name__ == "__main__":
    main()

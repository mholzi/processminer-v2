#!/usr/bin/env python3
"""Check elements against their schema templates — deterministic conformance.

The Python twin of src/lib/conformance.ts. A skill runs this on what it wrote
to verify each element matches its type's template (the named blocks, their
format and length) before moving on — instead of eyeballing it.

Usage:
  check_conformance.py <slug>               check every element in the process
  check_conformance.py <slug> <element-id>  check one element
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import element_types, iter_elements, parse_blocks, word_count  # noqa: E402


def parse_range(spec: str) -> tuple[int, int]:
    """'40-90' / '40–90' / '1' → (lo, hi). Handles hyphen and en/em dashes."""
    nums = [int(x) for x in re.split(r"[-–—]", spec) if x.strip().isdigit()]
    if not nums:
        return (0, 10**9)
    return (nums[0], nums[0]) if len(nums) == 1 else (nums[0], nums[1])


def detect_format(text: str) -> str:
    return "bullets" if re.search(r"^\s*[-*]\s+", text, re.MULTILINE) else "paragraph"


def bullet_count(text: str) -> int:
    return sum(1 for ln in text.split("\n") if re.match(r"^\s*[-*]\s+", ln))


def check_element(body: str, template: list[dict]) -> list[str]:
    issues: list[str] = []
    blocks = {b["heading"]: b for b in parse_blocks(body)}
    tpl_headings = {s["heading"] for s in template}

    for spec in template:
        heading = spec["heading"]
        block = blocks.get(heading)
        if block is None:
            issues.append(f"“{heading}” block is missing")
            continue
        actual = detect_format(block["text"])
        if actual != spec["format"]:
            issues.append(
                f"“{heading}” should be {spec['format']}, "
                f"written as {actual}"
            )
            continue
        if spec["format"] == "paragraph" and spec.get("words"):
            lo, hi = parse_range(spec["words"])
            w = word_count(block["text"])
            if w < lo:
                issues.append(
                    f"“{heading}” short at {w} words "
                    f"(template {spec['words']})"
                )
            elif w > hi:
                issues.append(
                    f"“{heading}” long at {w} words "
                    f"(template {spec['words']})"
                )
        elif spec["format"] == "bullets" and spec.get("items"):
            lo, hi = parse_range(spec["items"])
            c = bullet_count(block["text"])
            if c < lo or c > hi:
                issues.append(
                    f"“{heading}” has {c} bullets "
                    f"(template {spec['items']})"
                )

    for heading in blocks:
        if heading not in tpl_headings:
            issues.append(f"“{heading}” block is not in the template")
    return issues


def main(argv: list[str]) -> None:
    if len(argv) not in (1, 2):
        sys.exit("usage: check_conformance.py <slug> [element-id]")
    slug = argv[0]
    only = argv[1] if len(argv) == 2 else None

    types = element_types()
    checked = 0
    flagged = 0
    for _path, meta, body in iter_elements(slug):
        if only and meta.get("id") != only:
            continue
        info = types.get(str(meta.get("type", "")))
        if not info or not info.get("template"):
            continue
        checked += 1
        issues = check_element(body, info["template"])
        if issues:
            flagged += 1
            print(f"✗ {meta.get('id')} ({meta.get('type')})")
            for issue in issues:
                print(f"    - {issue}")
        else:
            print(f"✓ {meta.get('id')} ({meta.get('type')}) conforms")

    if checked == 0:
        print("no elements to check" + (f" for id {only}" if only else ""))
    else:
        print(f"\n{checked} checked · {flagged} with issues")


if __name__ == "__main__":
    main(sys.argv[1:])

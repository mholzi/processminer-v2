#!/usr/bin/env python3
"""Check elements against their schema templates — deterministic conformance.

The Python twin of src/lib/conformance.ts. A skill runs this on what it wrote
to verify each element matches its type's template (the named blocks, their
format and length) and carries the required frontmatter — before moving on,
instead of eyeballing it.

Usage:
  check_conformance.py <slug>               check every element in the process
  check_conformance.py <slug> <element-id>  check one element
  check_conformance.py <slug> --json        emit conformance findings as JSON

With --json the script prints a JSON array of finding objects — one per
non-conforming element, already shaped {kind, title, detail, elements} — so
run-lint can use them directly without re-typing the ✓/✗ text into findings.
A conforming process prints [].
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    PROVENANCE_SOURCES,
    iter_elements,
    load_provenance,
    load_schema,
    parse_blocks,
    template_headings,
    word_count,
)

# Sources whose claim must be backed by a verbatim quote / snippet. `proposed`
# is AI-added and unconfirmed (evidence may be empty); `legacy-approved`
# predates the rule (HALLUCINATION-PLAN.md D5).
EVIDENCE_REQUIRED = {"elicited", "document", "web"}


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


def check_frontmatter(meta: dict, info: dict) -> list[str]:
    """Required frontmatter the element type declares but the element lacks."""
    issues: list[str] = []
    required = (info.get("frontmatter") or {}).get("required") or []
    for key in required:
        val = meta.get(key)
        if val is None or val == "" or val == []:
            issues.append(f"required frontmatter “{key}” is missing")
    return issues


def check_field_values(meta: dict, info: dict, field_values: dict) -> list[str]:
    """A frontmatter field with a fixed value set (schema `fieldValues`) must
    carry one of those values exactly — catches typos and casing drift
    (e.g. `gapStatus: OPEN` where the schema declares `open`)."""
    issues: list[str] = []
    fields = (info.get("frontmatter") or {}).get("fields") or []
    for f in fields:
        key = f["key"] if isinstance(f, dict) else f
        allowed = field_values.get(key)
        if not allowed:
            continue
        val = meta.get(key)
        if val is None or val == "" or val == []:
            continue  # an absent required field is check_frontmatter's concern
        for item in val if isinstance(val, list) else [val]:
            if str(item) not in allowed:
                issues.append(
                    f"frontmatter “{key}” is “{item}” — not one of "
                    f"{', '.join(allowed)}"
                )
    return issues


def check_provenance(prov: dict, info: dict) -> list[str]:
    """Every template heading needs a provenance entry; the map keys must not
    drift from the template; evidence must back an elicited/document/web claim.
    The hallucination countermeasure (HALLUCINATION-PLAN.md)."""
    issues: list[str] = []
    tpl = template_headings(info)
    if not tpl:
        return issues
    if not prov:
        issues.append(
            "provenance map is missing — every heading must record where its "
            "content came from"
        )
        return issues

    for heading in tpl:
        if heading not in prov:
            issues.append(f"“{heading}” has no provenance entry")

    # Keys that name no template heading — catches a renamed/stray heading
    # whose evidence would otherwise silently orphan.
    for key in prov:
        if key not in tpl:
            issues.append(
                f"provenance entry “{key}” names no template heading "
                "(renamed or stray)"
            )

    for heading, entry in prov.items():
        if heading not in tpl:
            continue
        if not isinstance(entry, dict):
            issues.append(f"“{heading}” provenance entry is malformed")
            continue
        source = entry.get("source")
        if source not in PROVENANCE_SOURCES:
            issues.append(
                f"“{heading}” provenance source “{source}” is not one of "
                f"{', '.join(sorted(PROVENANCE_SOURCES))}"
            )
            continue
        if source in EVIDENCE_REQUIRED and not str(entry.get("evidence", "")).strip():
            issues.append(
                f"“{heading}” is {source} but carries no evidence quote"
            )
    return issues


def check_element(meta: dict, body: str, info: dict, field_values: dict, prov: dict) -> list[str]:
    issues: list[str] = []
    template = info.get("template") or []
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

    issues.extend(check_frontmatter(meta, info))
    issues.extend(check_field_values(meta, info, field_values))
    issues.extend(check_provenance(prov, info))
    return issues


def main(argv: list[str]) -> None:
    as_json = "--json" in argv
    argv = [a for a in argv if a != "--json"]
    if len(argv) not in (1, 2):
        sys.exit("usage: check_conformance.py <slug> [element-id] [--json]")
    slug = argv[0]
    only = argv[1] if len(argv) == 2 else None

    schema = load_schema()
    types = schema["elementTypes"]
    field_values = schema.get("fieldValues", {})
    # The provenance bundle is loaded once and looked up per element — one disk
    # read replaces a parse_provenance call inside the per-element loop.
    provenance_bundle = load_provenance(slug)
    checked = 0
    flagged = 0
    findings: list[dict] = []
    for _path, meta, body in iter_elements(slug):
        if only and meta.get("id") != only:
            continue
        info = types.get(str(meta.get("type", "")))
        if not info or not info.get("template"):
            continue
        checked += 1
        eid_str = str(meta.get("id", ""))
        prov = provenance_bundle.get(eid_str, {})
        issues = check_element(meta, body, info, field_values, prov)
        eid = meta.get("id")
        etype = meta.get("type")
        if issues:
            flagged += 1
            if as_json:
                findings.append({
                    "kind": "conformance",
                    "title": f"Structure: {eid} deviates from its {etype} template",
                    "detail": "; ".join(issues),
                    "elements": [eid],
                })
            else:
                print(f"✗ {eid} ({etype})")
                for issue in issues:
                    print(f"    - {issue}")
        elif not as_json:
            print(f"✓ {eid} ({etype}) conforms")

    if as_json:
        print(json.dumps(findings, indent=2, ensure_ascii=False))
    elif checked == 0:
        print("no elements to check" + (f" for id {only}" if only else ""))
    else:
        print(f"\n{checked} checked · {flagged} with issues")


if __name__ == "__main__":
    main(sys.argv[1:])

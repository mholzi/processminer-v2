#!/usr/bin/env python3
"""Check every documented problem has an innovation idea against it — deterministic.

source-innovation derives `innovation-idea` elements from the documented
problems, and must leave none behind. The completeness rule lives in the schema:
`innovation-idea.addresses` declares exactly which element types are "a
documented problem" — pain-point, friction-point, process-gap and compliance-gap
(the control gap, in the `control-gaps` section). This script reads that list,
enumerates every such element, and checks each one is named by some
`innovation-idea`'s `addresses` frontmatter — so the cross-check is set
arithmetic, never the model's recollection.

In addition to set coverage, this script runs a **weak-alignment** check —
for each (idea, addressed problem) pair, it tokenises both the problem's
title and the idea's title + body and reports the pair as weakly-aligned
when there is **zero content-word overlap**. That catches the failure mode
where an `addresses:` link points at a real problem id but the idea's body
is about something else entirely (e.g. body about ERP intake while
`addresses` a friction-point about MT760 delivery). It is a heuristic
warning, not a coverage failure: set-coverage may report `complete: true`
while `weakAlignment` is non-empty.

Id matching is case-insensitive: `id:` frontmatter is canonical upper-case, but
an `addresses` entry typed in lower case still counts as coverage.

  idea_coverage.py <slug>   prints the coverage report as a JSON object

Output:
  { slug, problemTypes, total, complete, coveredCount, uncoveredCount,
    covered:[ids], uncovered:{ <type>:[ids] },
    weakAlignment:[ { "idea":id, "problem":id, "overlap":int } ] }

`complete` is true when every problem is addressed — the signal the skill reads
before it closes out. Exit status is 0 whether or not problems are uncovered
or weakly aligned; this reports, it does not gate.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR, element_types, iter_elements  # noqa: E402

# Tiny stopword set — only the very-generic English connective tokens that
# would inflate fake overlap. Keep it conservative: domain words like
# "process", "system", "control", "client" are *content* in banking, not
# noise; filtering them would hide real mismatches.
_STOP = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
    "has", "have", "in", "is", "it", "its", "of", "on", "or", "out", "such",
    "that", "the", "this", "to", "was", "were", "will", "with", "without",
    "into", "onto", "via", "than", "then", "when", "where", "which", "who",
    "whose", "what", "any", "all", "some", "no", "not", "do", "does", "did",
    "if", "so", "because", "after", "before", "during", "while", "between",
    "across", "over", "under", "their", "they", "them", "our", "we", "you",
    "your", "his", "her", "him", "she", "he", "i", "my", "me",
}


def _tokens(text: str) -> set[str]:
    """Lower-case content tokens ≥4 chars, stop-words removed, punctuation stripped."""
    return {
        w for w in re.findall(r"[a-zA-Z][a-zA-Z\-']{3,}", (text or "").lower())
        if w not in _STOP
    }


def problem_types() -> list[str]:
    """The element types `innovation-idea` can address, straight from the schema."""
    relations = element_types()["innovation-idea"]["frontmatter"]["relations"]
    for rel in relations:
        if rel["key"] == "addresses":
            target = rel["target"]
            return list(target) if isinstance(target, list) else [target]
    return []


def as_list(v) -> list[str]:
    if not v:
        return []
    return [str(x).strip() for x in (v if isinstance(v, list) else [v]) if str(x).strip()]


def main(argv: list[str]) -> None:
    if len(argv) != 1:
        sys.exit("usage: idea_coverage.py <slug>")
    slug = argv[0]

    if not (WIKI_DIR / slug).is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    types = problem_types()

    # Every documented-problem element, by type. Keyed by upper-cased id for
    # matching; the value keeps the id as written and its title tokens for
    # the alignment check.
    problems: dict[str, dict[str, str]] = {t: {} for t in types}
    problem_titles: dict[str, set[str]] = {}  # upper-cased id → title tokens
    # Every problem id named by some innovation-idea's `addresses`, upper-cased.
    covered_keys: set[str] = set()
    # Each innovation-idea's text (title + body) + its addresses list, for the
    # alignment check.
    ideas: list[tuple[str, set[str], list[str]]] = []  # (id, tokens, addresses)

    for _path, meta, body in iter_elements(slug):
        etype = str(meta.get("type", ""))
        eid = str(meta.get("id", "")).strip()
        if etype in problems and eid:
            problems[etype][eid.upper()] = eid
            problem_titles[eid.upper()] = _tokens(str(meta.get("title", "")))
        if etype == "innovation-idea":
            addresses = as_list(meta.get("addresses"))
            for ref in addresses:
                covered_keys.add(ref.upper())
            if eid:
                ideas.append((
                    eid,
                    _tokens(str(meta.get("title", "")) + " " + (body or "")),
                    addresses,
                ))

    covered: list[str] = []
    uncovered: dict[str, list[str]] = {t: [] for t in types}
    for etype in types:
        for key, eid in problems[etype].items():
            if key in covered_keys:
                covered.append(eid)
            else:
                uncovered[etype].append(eid)

    covered.sort()
    for etype in types:
        uncovered[etype].sort()
    total = sum(len(problems[t]) for t in types)
    uncovered_count = sum(len(uncovered[t]) for t in types)

    # Weak-alignment check: for each (idea, addressed problem) pair, zero
    # content-word overlap between the problem's title tokens and the idea's
    # title+body tokens is the signal of a relation/content mismatch. Skip
    # pairs where the problem's title is too short (≤1 content word) — no
    # signal there to compare against.
    weak_alignment: list[dict] = []
    for idea_id, idea_tokens, addresses in ideas:
        for ref in addresses:
            key = ref.upper()
            problem_tokens = problem_titles.get(key)
            if not problem_tokens or len(problem_tokens) < 2:
                continue  # unknown or too-thin target — can't assess
            overlap = len(idea_tokens & problem_tokens)
            if overlap == 0:
                weak_alignment.append({
                    "idea": idea_id,
                    "problem": problems_lookup(problems, key) or ref,
                    "overlap": 0,
                })
    weak_alignment.sort(key=lambda w: (w["idea"], w["problem"]))

    print(json.dumps({
        "slug": slug,
        "problemTypes": types,
        "total": total,
        "complete": uncovered_count == 0,
        "coveredCount": len(covered),
        "uncoveredCount": uncovered_count,
        "covered": covered,
        "uncovered": uncovered,
        "weakAlignment": weak_alignment,
    }, indent=2, ensure_ascii=False))


def problems_lookup(problems: dict, key: str) -> str | None:
    """Return the as-written id for an upper-cased key, across all problem types."""
    for type_map in problems.values():
        if key in type_map:
            return type_map[key]
    return None


if __name__ == "__main__":
    main(sys.argv[1:])

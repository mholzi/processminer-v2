#!/usr/bin/env python3
"""Check that `document` provenance evidence is traceable to the source.

The hallucination countermeasure (HALLUCINATION-PLAN.md) rests on each
`document` heading's `evidence` being a verbatim quote from an uploaded source.
`check_conformance.py` verifies the evidence is *present*; this script verifies
it is *real* — that the quote actually occurs in a file under
`raw-sources/<slug>/`. Without it a drifted, paraphrased or wrong-document
quote passes silently (feedback FB-011): the `document` half of the
countermeasure is enforceable instead of trust-only.

It flags, per template-bearing element:

  * a `document` heading whose evidence cannot be traced to any raw-source
    file of the process — no run of four consecutive words of the quote
    occurs in the source, so the quote is wrong, paraphrased or from another
    document;
  * a `proposed` heading carrying a non-empty evidence string — `proposed` is
    AI-added and unconfirmed; its evidence must be empty.

`elicited` (an SME quote — the SME is not a file) and `web` (a URL + snippet)
evidence cannot be checked against a local source and is skipped. Empty
`document` evidence is left to `check_conformance.py`, which already flags it.

Usage:
  check_evidence.py <slug>               check every element in the process
  check_evidence.py <slug> <element-id>  check one element
  check_evidence.py <slug> --json        emit findings as JSON
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import ROOT, iter_elements, load_provenance  # noqa: E402

# Four consecutive words of a genuine quote will survive formatting drift and
# still occur in the source; a wrong-document quote shares no such run.
NGRAM = 4


def tokens(text: str) -> list[str]:
    """Lowercase word tokens — punctuation and whitespace collapsed away."""
    return re.findall(r"\w+", text.lower())


def build_haystack(slug: str) -> str | None:
    """All raw-source text for a process, tokenised and space-joined. None when
    the process has no readable raw source."""
    src_dir = ROOT / "raw-sources" / slug
    if not src_dir.is_dir():
        return None
    parts: list[str] = []
    for path in sorted(src_dir.rglob("*")):
        if not path.is_file():
            continue
        try:
            parts.append(path.read_text(encoding="utf-8"))
        except (UnicodeDecodeError, OSError):
            continue  # a binary (e.g. PDF) source — cannot text-match it
    if not parts:
        return None
    return " " + " ".join(tokens("\n".join(parts))) + " "


def traceable(evidence: str, haystack: str) -> bool:
    """True when a run of NGRAM consecutive evidence words occurs in the
    source — or, for a quote shorter than NGRAM words, the whole of it."""
    ev = tokens(evidence)
    if not ev:
        return True  # empty evidence is check_conformance.py's concern
    n = min(NGRAM, len(ev))
    for i in range(len(ev) - n + 1):
        if " " + " ".join(ev[i : i + n]) + " " in haystack:
            return True
    return False


def check_element(meta: dict, prov: dict, haystack: str | None) -> list[str]:
    issues: list[str] = []
    for heading, entry in prov.items():
        if not isinstance(entry, dict):
            continue
        source = entry.get("source")
        evidence = str(entry.get("evidence", "")).strip()
        if source == "proposed" and evidence:
            issues.append(
                f"“{heading}” is proposed but carries an evidence quote — "
                "proposed evidence must be empty"
            )
        elif source == "document" and evidence and haystack is not None:
            if not traceable(evidence, haystack):
                issues.append(
                    f"“{heading}” is document but its evidence quote is not "
                    f"traceable to any raw source: “{evidence[:80]}”"
                )
    return issues


def main(argv: list[str]) -> None:
    as_json = "--json" in argv
    argv = [a for a in argv if a != "--json"]
    if len(argv) not in (1, 2):
        sys.exit("usage: check_evidence.py <slug> [element-id] [--json]")
    slug = argv[0]
    only = argv[1] if len(argv) == 2 else None

    haystack = build_haystack(slug)
    provenance_bundle = load_provenance(slug)
    checked = 0
    flagged = 0
    findings: list[dict] = []
    for _path, meta, _body in iter_elements(slug):
        if only and meta.get("id") != only:
            continue
        checked += 1
        eid_str = str(meta.get("id", ""))
        prov = provenance_bundle.get(eid_str, {})
        issues = check_element(meta, prov, haystack)
        eid = meta.get("id")
        if issues:
            flagged += 1
            if as_json:
                findings.append({
                    "kind": "evidence",
                    "title": f"Evidence: {eid} has untraceable provenance evidence",
                    "detail": "; ".join(issues),
                    "elements": [eid],
                })
            elif not as_json:
                print(f"✗ {eid} ({meta.get('type')})")
                for issue in issues:
                    print(f"    - {issue}")

    if as_json:
        print(json.dumps(findings, indent=2, ensure_ascii=False))
    elif checked == 0:
        print("no elements to check" + (f" for id {only}" if only else ""))
    elif haystack is None:
        print(
            f"no readable raw source under raw-sources/{slug}/ — "
            "document evidence cannot be verified"
        )
    else:
        print(f"\n{checked} checked · {flagged} with untraceable evidence")


if __name__ == "__main__":
    main(sys.argv[1:])

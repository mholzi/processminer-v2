#!/usr/bin/env python3
"""Merge per-group drafter + verifier manifests into one write batch.

The document-ingest skill fans drafting out to one sub-agent per element-type
group (each writes /tmp/<slug>-drafts-<group_id>.json), then fans verification
out the same way (each writes /tmp/<slug>-verified-<group_id>.json). This
script merges those per-group files into the inputs the rest of the skill
expects:

  /tmp/<slug>-elements.json     — the write batch for write_elements.py
  /tmp/<slug>-conflicts.json    — concatenated conflicts from drafter outputs
  /tmp/<slug>-corrections.json  — concatenated corrections from verifier outputs

Usage:
  merge_manifests.py <slug> [--source <file>]

The optional --source applies to the elements manifest's top-level `source`
field (the source filename that applies to every element). If omitted, the
script reads it from the first verified manifest it finds.

Inputs are read from /tmp/. Missing groups are silently skipped — the skill
prints what was found. The script fails (exit non-zero) only if it finds no
verified manifests at all, or if any file is malformed.
"""

from __future__ import annotations

import argparse
import glob
import json
import sys
from pathlib import Path


TMP = Path("/tmp")


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"error: could not read {path} — {e}")


def main(argv: list[str]) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("slug")
    parser.add_argument("--source", default=None)
    args = parser.parse_args(argv)

    slug = args.slug
    verified_paths = sorted(TMP.glob(f"{slug}-verified-*.json"))
    draft_paths = sorted(TMP.glob(f"{slug}-drafts-*.json"))

    if not verified_paths:
        sys.exit(
            f"error: no verified manifests found at /tmp/{slug}-verified-*.json"
        )

    elements: list[dict] = []
    corrections: list[dict] = []
    source = args.source
    for p in verified_paths:
        m = read_json(p)
        if not source:
            source = m.get("source")
        for el in m.get("elements") or []:
            if not isinstance(el, dict):
                sys.exit(f"error: {p} has a non-object element")
            elements.append(el)
        for c in m.get("corrections") or []:
            corrections.append(c)

    conflicts: list[dict] = []
    for p in draft_paths:
        m = read_json(p)
        for c in m.get("conflicts") or []:
            conflicts.append(c)

    elements_manifest: dict = {"slug": slug, "elements": elements}
    if source:
        elements_manifest["source"] = source

    elements_out = TMP / f"{slug}-elements.json"
    conflicts_out = TMP / f"{slug}-conflicts.json"
    corrections_out = TMP / f"{slug}-corrections.json"

    elements_out.write_text(
        json.dumps(elements_manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    conflicts_out.write_text(
        json.dumps(conflicts, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    corrections_out.write_text(
        json.dumps(corrections, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(
        f"merged {len(verified_paths)} verified group(s) and "
        f"{len(draft_paths)} draft group(s):"
    )
    print(f"  {elements_out} — {len(elements)} element(s)")
    print(f"  {conflicts_out} — {len(conflicts)} conflict(s)")
    print(f"  {corrections_out} — {len(corrections)} correction(s)")


if __name__ == "__main__":
    main(sys.argv[1:])

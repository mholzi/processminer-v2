#!/usr/bin/env python3
"""Emit one compact per-type schema file from schema/process-schema.json.

The full schema is ~2.8k lines and contains every element type's rules. A skill
or context builder that wants the contract for *one* type — e.g. process-step —
should not have to load the whole thing. This script materialises one
`schema/.derived/<type>.llm.json` per element type: section, idPrefix, the
frontmatter contract (fields with resolved enums + hints, relations, raci /
transitions sub-structures), the template (each `## ` block with format and
length constraints) and references to 1–2 in-wiki examples.

Examples are sourced in two ways:
  1. `schema/.curated-examples.json` overrides per type (when present)
  2. Otherwise auto-picked from wiki/processes/sepa-payments/ by a
     conforms-to-schema + word-range heuristic. Approval status is *not*
     required — sepa-payments is a seeded reference process whose content is
     curated by construction.

The derived files are *committed*. Skills run via a warm Claude CLI worker that
can't invoke a build step before reading; checking the files in means skills
work from a clean checkout, and PR diffs become the audit trail for what the
LLM is shown when this content is written.

Determinism: stable key ordering, no timestamps, byte-identical re-runs from
the same inputs. The `--check` mode (run from `test_wiki_scripts.py`) builds
into a temp dir and fails on drift — the CI gate that enforces freshness.

Usage:
  build_derived_schemas.py                   write to schema/.derived/
  build_derived_schemas.py --out <dir>       write to <dir> (used by CI gate)
  build_derived_schemas.py --check           build into a temp dir, compare to
                                             schema/.derived/, exit non-zero on
                                             drift (the CI gate uses this)
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    ROOT,
    iter_elements,
    load_schema,
    parse_blocks,
    template_headings,
    word_count,
)

DERIVED_DIR = ROOT / "schema" / ".derived"
CURATION_PATH = ROOT / "schema" / ".curated-examples.json"
REFERENCE_SLUG = "sepa-payments"


# ---- Word range parsing --------------------------------------------------
# Templates write ranges as "8–45" (en-dash), "40-120" (hyphen), "N+" (at least
# N) or "N" (exactly N). The conformance pick uses this; the derived file
# echoes the raw string so the LLM sees the same form the schema uses.

_RANGE_RE = re.compile(r"^\s*(\d+)\s*[-–]\s*(\d+)\s*$")


def parse_range(spec: str | None) -> tuple[int | None, int | None]:
    """`(min, max)` for a range spec. `None, None` if absent or unparseable."""
    if not spec:
        return None, None
    s = str(spec).strip()
    if s.endswith("+"):
        try:
            return int(s[:-1]), None
        except ValueError:
            return None, None
    m = _RANGE_RE.match(s)
    if m:
        return int(m.group(1)), int(m.group(2))
    try:
        n = int(s)
        return n, n
    except ValueError:
        return None, None


def in_range(value: int, lo: int | None, hi: int | None) -> bool:
    if lo is not None and value < lo:
        return False
    if hi is not None and value > hi:
        return False
    return True


# ---- Frontmatter resolution ----------------------------------------------
# A field key may carry `hint`, `suffix`, `urlKey`, or an enum sourced from
# `schema.fieldValues[<key>]`. The derived file inlines all of these so the
# LLM sees one self-contained object per field.


def resolve_field(field: dict | str, field_values: dict) -> dict:
    """Flatten a frontmatter field spec into the form the LLM consumes."""
    if isinstance(field, str):
        return {"key": field}
    out: dict = {"key": field["key"]}
    for k in ("label", "hint", "suffix", "urlKey", "type"):
        if field.get(k):
            out[k] = field[k]
    vals = field_values.get(field["key"])
    if vals:
        out["enum"] = list(vals)
    return out


def resolve_relation(rel: dict | str) -> dict:
    """Flatten a relation spec — key + label + target type."""
    if isinstance(rel, str):
        return {"key": rel}
    out: dict = {"key": rel["key"]}
    for k in ("label", "target"):
        if rel.get(k):
            out[k] = rel[k]
    return out


def build_frontmatter(t: dict, field_values: dict) -> dict:
    """The frontmatter section of the derived file."""
    fm = t.get("frontmatter", {}) or {}
    out: dict = {
        "fields": [resolve_field(f, field_values) for f in (fm.get("fields") or [])],
        "relations": [resolve_relation(r) for r in (fm.get("relations") or [])],
        "required": list(fm.get("required") or []),
    }
    if fm.get("raci"):
        out["raci"] = fm["raci"]
    if fm.get("transitions"):
        out["transitions"] = fm["transitions"]
    return out


def build_template(t: dict) -> list[dict]:
    """The template (## headings + constraints), one entry per block."""
    blocks = []
    for b in t.get("template", []) or []:
        entry: dict = {"heading": b["heading"], "format": b.get("format", "paragraph")}
        for k in ("paragraphs", "words", "items", "purpose"):
            if b.get(k):
                entry[k] = b[k]
        blocks.append(entry)
    return blocks


# ---- Example sourcing ----------------------------------------------------
# Curation overrides per type; otherwise the heuristic walks the reference
# process. The heuristic is intentionally lenient — required keys + matching
# template headings + word counts in range — because approval is not yet a
# reliable signal across the wiki.


def load_curation(path: Path | None = None) -> dict[str, list[str]]:
    """Curation override keyed by type, or `{}` when absent.

    Defaults to the repo's `schema/.curated-examples.json`; tests pass a temp
    path so they can exercise the override without touching the real file.
    """
    path = path or CURATION_PATH
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return {}
        return {
            k: [str(p) for p in v if isinstance(p, str)]
            for k, v in data.items()
            if isinstance(v, list)
        }
    except json.JSONDecodeError:
        return {}


def element_conforms(meta: dict, body: str, t: dict) -> bool:
    """Lenient conformance check used by the example heuristic.

    Returns True when the element has every required frontmatter key, its
    `## ` block headings match the template in order, and every block's word
    count (or bullet-item count) falls inside the template's range.
    """
    required = (t.get("frontmatter", {}) or {}).get("required") or []
    for k in required:
        if k not in meta:
            return False
    expected_headings = template_headings(t)
    blocks = parse_blocks(body)
    if [b["heading"] for b in blocks] != expected_headings:
        return False
    for actual, spec in zip(blocks, t.get("template", []) or []):
        fmt = spec.get("format", "paragraph")
        if fmt == "bullets":
            items = [ln for ln in actual["text"].splitlines() if ln.strip().startswith(("-", "*"))]
            lo, hi = parse_range(spec.get("items"))
            if lo is not None and not in_range(len(items), lo, hi):
                return False
        else:
            lo, hi = parse_range(spec.get("words"))
            if lo is not None and not in_range(word_count(actual["text"]), lo, hi):
                return False
    return True


def auto_pick_examples(etype: str, t: dict, max_examples: int = 2) -> list[str]:
    """Walk the reference process for conforming elements of `etype`.

    Returns a stable list of relative paths from the repo root. Sorted by
    element id so the result is deterministic across runs.
    """
    candidates: list[tuple[str, Path]] = []
    for path, meta, body in iter_elements(REFERENCE_SLUG):
        if meta.get("type") != etype:
            continue
        if not element_conforms(meta, body, t):
            continue
        eid = str(meta.get("id") or path.stem)
        candidates.append((eid, path))
    candidates.sort(key=lambda pair: pair[0])
    return [str(p.relative_to(ROOT)) for _eid, p in candidates[:max_examples]]


def resolve_examples(etype: str, t: dict, curation: dict[str, list[str]]) -> list[dict]:
    """Curated paths win; auto-pick fills in when none are curated. Each entry
    is `{path: <relative-to-repo>}` so the consumer can read the file as-is."""
    if etype in curation:
        # Curated paths must exist — fail loudly if a manual override has
        # rotted, because silent fallback would teach the LLM whatever
        # auto-pick happens to find instead of what the human chose.
        missing = [p for p in curation[etype] if not (ROOT / p).is_file()]
        if missing:
            sys.exit(
                f"error: curated example(s) for type '{etype}' do not exist: "
                f"{', '.join(missing)}. Update schema/.curated-examples.json."
            )
        return [{"path": p} for p in curation[etype]]
    return [{"path": p} for p in auto_pick_examples(etype, t)]


# ---- Top-level build -----------------------------------------------------


def build_one(etype: str, t: dict, field_values: dict, curation: dict[str, list[str]]) -> dict:
    """The full derived object for one element type."""
    out: dict = {
        "elementType": etype,
        "label": t.get("label", etype),
        "section": t.get("section"),
        "idPrefix": t.get("idPrefix"),
        "frontmatter": build_frontmatter(t, field_values),
        "template": build_template(t),
        "examples": resolve_examples(etype, t, curation),
    }
    return out


def write_derived(out_dir: Path, curation_path: Path | None = None) -> list[Path]:
    """Build every type's derived file into `out_dir`. Returns paths written."""
    schema = load_schema()
    types = schema["elementTypes"]
    field_values = schema.get("fieldValues", {}) or {}
    curation = load_curation(curation_path)

    out_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    for etype in sorted(types):
        obj = build_one(etype, types[etype], field_values, curation)
        path = out_dir / f"{etype}.llm.json"
        # `sort_keys=False` because the build emits a deliberately stable order
        # (elementType → label → section → ... → examples) that reads top-down.
        # Determinism comes from the build, not from json's alpha sort.
        text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
        path.write_text(text, encoding="utf-8")
        written.append(path)
    return written


def cmd_check() -> int:
    """Build into a temp dir and diff against the committed derived files."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        write_derived(tmp_dir)
        return _diff_dirs(tmp_dir, DERIVED_DIR)


def _diff_dirs(built: Path, committed: Path) -> int:
    """Compare two derived directories. Prints differences, returns 0/1."""
    if not committed.is_dir():
        print(f"error: {committed} does not exist — run build_derived_schemas.py")
        return 1
    built_files = {p.name: p.read_text(encoding="utf-8") for p in built.iterdir()}
    committed_files = {
        p.name: p.read_text(encoding="utf-8") for p in committed.iterdir() if p.suffix == ".json"
    }
    only_built = set(built_files) - set(committed_files)
    only_committed = set(committed_files) - set(built_files)
    drift = [
        name
        for name in sorted(set(built_files) & set(committed_files))
        if built_files[name] != committed_files[name]
    ]
    if only_built or only_committed or drift:
        if only_built:
            print(f"error: missing in committed: {', '.join(sorted(only_built))}")
        if only_committed:
            print(f"error: stale in committed: {', '.join(sorted(only_committed))}")
        if drift:
            print(f"error: content drift: {', '.join(drift)}")
        print("run: python3 scripts/wiki/build_derived_schemas.py")
        return 1
    print(f"derived schemas: in sync ✓ ({len(built_files)} files)")
    return 0


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    ap.add_argument("--out", type=Path, default=DERIVED_DIR, help="output directory")
    ap.add_argument("--check", action="store_true", help="diff against committed; CI gate")
    ap.add_argument("--clean", action="store_true", help="remove out dir first")
    ap.add_argument(
        "--curation",
        type=Path,
        default=None,
        help="path to a curation override file; defaults to schema/.curated-examples.json",
    )
    args = ap.parse_args(argv)

    if args.check:
        return cmd_check()
    if args.clean and args.out.is_dir():
        shutil.rmtree(args.out)
    paths = write_derived(args.out, args.curation)
    # An out dir outside the repo (e.g. /tmp in CI) can't be made relative.
    try:
        out_label = str(args.out.relative_to(ROOT))
    except ValueError:
        out_label = str(args.out)
    print(f"wrote {len(paths)} files to {out_label}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

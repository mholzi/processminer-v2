"""Shared helpers for the Processminer wiki scripts.

The skills (new-process, process-specialist, ...) call these scripts for the
deterministic work — file layout, IDs, frontmatter serialisation, conformance —
so the model only does judgement (eliciting the SME, drafting content).

Stdlib only. Resolves paths from the repo root, so the scripts work whatever
the current working directory is.
"""

from __future__ import annotations

import json
import re
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "schema" / "process-schema.json"
WIKI_DIR = ROOT / "wiki" / "processes"


def load_schema() -> dict:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def section_ids(schema: dict | None = None) -> list[str]:
    schema = schema or load_schema()
    return [s["id"] for area in schema["areas"] for s in area["sections"]]


def element_types(schema: dict | None = None) -> dict:
    schema = schema or load_schema()
    return schema["elementTypes"]


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """`---\\n<frontmatter>\\n---\\n<body>` → (meta, body). `[a, b]` → list."""
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.DOTALL)
    if not m:
        return {}, text.strip()
    meta: dict = {}
    for line in m.group(1).split("\n"):
        idx = line.find(":")
        if idx == -1:
            continue
        key = line[:idx].strip()
        val = line[idx + 1 :].strip()
        if val.startswith("[") and val.endswith("]"):
            inner = val[1:-1].strip()
            meta[key] = [x.strip() for x in inner.split(",")] if inner else []
        else:
            meta[key] = val
    return meta, m.group(2).strip()


def parse_blocks(body: str) -> list[dict]:
    """Body split into `## Heading` prose blocks. Empty if there are none."""
    if not re.search(r"^## ", body, re.MULTILINE):
        return []
    blocks = []
    for part in re.split(r"^## ", body, flags=re.MULTILINE):
        part = part.strip()
        if not part:
            continue
        nl = part.find("\n")
        if nl == -1:
            blocks.append({"heading": part.strip(), "text": ""})
        else:
            blocks.append(
                {"heading": part[:nl].strip(), "text": part[nl + 1 :].strip()}
            )
    return blocks


def serialize_element(frontmatter: dict, blocks: list[dict]) -> str:
    """frontmatter (ordered) + `## Heading` blocks → element markdown.

    A value that is a list is written as `key: [a, b]`. Empty values are kept
    (e.g. a blank overview field) as `key:`.
    """
    lines = []
    for key, val in frontmatter.items():
        if isinstance(val, list):
            lines.append(f"{key}: [{', '.join(str(v) for v in val)}]")
        elif val is None or val == "":
            lines.append(f"{key}:")
        else:
            lines.append(f"{key}: {val}")
    body = "\n\n".join(
        f"## {b['heading']}\n{b['text'].strip()}" for b in blocks
    )
    return f"---\n{chr(10).join(lines)}\n---\n{body}\n" if body else (
        f"---\n{chr(10).join(lines)}\n---\n"
    )


def iter_elements(slug: str):
    """Yield (path, meta, body) for every element .md in a process (not index)."""
    proc_dir = WIKI_DIR / slug
    if not proc_dir.is_dir():
        return
    for path in sorted(proc_dir.rglob("*.md")):
        if path.name == "index.md":
            continue
        meta, body = parse_frontmatter(path.read_text(encoding="utf-8"))
        yield path, meta, body


def word_count(text: str) -> int:
    text = text.strip()
    return len(text.split()) if text else 0


# ---- Provenance ---------------------------------------------------------
# Hallucination countermeasure (HALLUCINATION-PLAN.md). Every template-bearing
# element carries a `provenance` frontmatter key whose value is a JSON object
# keyed by template heading title — {heading: {source, evidence}}. It is stored
# JSON-encoded on one line so the flat frontmatter parser keeps it as an opaque
# string; only the scripts that care decode it.

PROVENANCE_SOURCES = {"elicited", "document", "proposed", "web", "legacy-approved"}
# Sources that mean "not yet confirmed by the SME" — these block approval.
UNCONFIRMED_SOURCES = {"proposed", "web"}


def template_headings(info: dict) -> list[str]:
    """The ordered template heading titles for an element type."""
    return [s["heading"] for s in (info.get("template") or [])]


def parse_provenance(meta: dict) -> dict:
    """The element's provenance map, decoded. {} if absent or malformed."""
    raw = meta.get("provenance")
    if not raw:
        return {}
    if isinstance(raw, dict):
        return raw
    try:
        val = json.loads(raw)
        return val if isinstance(val, dict) else {}
    except (json.JSONDecodeError, TypeError):
        return {}


def dump_provenance(prov: dict) -> str:
    """Serialise a provenance map to the one-line JSON string stored in
    frontmatter. Sorted keys so a rewrite is byte-stable."""
    return json.dumps(prov, ensure_ascii=False, sort_keys=True)


# ---- Section + ownership resolution -------------------------------------
# CONTENT-MODEL-PLAN.md D2/D6. The `assumptions` section has no fixed owning
# specialist; an assumption is challenged through whichever specialist owns
# the element its `bearsOn` points at. These helpers do that resolution
# deterministically, so no skill repeats the rule as prose.


def find_section(section_id: str, schema: dict | None = None) -> dict | None:
    """The section object for an id, searched across every area. None if absent."""
    schema = schema or load_schema()
    for area in schema["areas"]:
        for sec in area["sections"]:
            if sec["id"] == section_id:
                return sec
    return None


def section_specialist(section_id: str, schema: dict | None = None) -> str | None:
    """The specialist that owns a section, or None when the section declares
    none (e.g. `assumptions`, `competitor-cx`)."""
    sec = find_section(section_id, schema)
    return (sec or {}).get("specialist")


def owner_of(slug: str, element_id: str, schema: dict | None = None) -> str | None:
    """The specialist that owns an element — via its type's section. None when
    the element is not found or its section declares no specialist."""
    schema = schema or load_schema()
    types = element_types(schema)
    for _path, meta, _body in iter_elements(slug):
        if str(meta.get("id")) == str(element_id):
            info = types.get(str(meta.get("type", "")))
            if not info:
                return None
            return section_specialist(info.get("section"), schema)
    return None


def assumption_owner(
    slug: str, meta: dict, schema: dict | None = None
) -> tuple[str | None, str | None]:
    """The specialist that should challenge an `assumption`, resolved from its
    `bearsOn` target. Returns (owner, target_id):
      (specialist, id) — resolved
      (None, id)       — bearsOn points at a missing element (unresolvable)
      (None, None)     — bearsOn is empty
    """
    bears = meta.get("bearsOn")
    target = (bears[0] if bears else None) if isinstance(bears, list) else (bears or None)
    if not target:
        return None, None
    return owner_of(slug, target, schema), target


# ---- Run manifest -------------------------------------------------------
# write_element.py appends one line per write here, recording whether the
# element was created or updated. A reporting script (write_ingest_report.py)
# reads it so created/updated counts are derived mechanically, never tallied
# from the model's memory. One manifest per process slug.


def manifest_path(slug: str) -> Path:
    return Path(tempfile.gettempdir()) / f"wiki-run-{slug}.jsonl"


def log_write(slug: str, eid: str, etype: str, action: str) -> None:
    """Append one element-write record (action: 'created' | 'updated')."""
    rec = json.dumps({"id": eid, "type": etype, "action": action})
    with manifest_path(slug).open("a", encoding="utf-8") as fh:
        fh.write(rec + "\n")


def read_manifest(slug: str) -> list[dict]:
    """Every write record for a process, in order; [] if no manifest."""
    path = manifest_path(slug)
    if not path.is_file():
        return []
    out = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            out.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return out


def reset_manifest(slug: str) -> None:
    manifest_path(slug).unlink(missing_ok=True)

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

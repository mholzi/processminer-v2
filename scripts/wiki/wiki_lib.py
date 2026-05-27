"""Shared helpers for the Processminer wiki scripts.

The skills (new-process, process-specialist, ...) call these scripts for the
deterministic work — file layout, IDs, frontmatter serialisation, conformance —
so the model only does judgement (eliciting the SME, drafting content).

Stdlib only. Resolves paths from the repo root, so the scripts work whatever
the current working directory is.
"""

from __future__ import annotations

import datetime
import json
import re
import sys
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


# ---- Provenance + transitions bundles ------------------------------------
# Hallucination countermeasure (HALLUCINATION-PLAN.md). Every template-bearing
# element has a provenance map keyed by template heading title —
# {heading: {source, evidence}}. Process-step / exception elements also carry a
# transitions list — [{to, kind, when}, ...] — the outgoing flow from the step.
#
# Both used to live in the element frontmatter (provenance as inline JSON, the
# worst-of-both-worlds JSON-in-YAML; transitions as a pipe-delimited
# `to|kind|when` mini-DSL). They are now per-process sidecar JSON, matching the
# pattern of sections.json / lint.json / notes.json — the frontmatter stays
# flat and human-diffable, and the structured data lives where it can be
# validated as JSON.

PROVENANCE_SOURCES = {"elicited", "document", "proposed", "web", "legacy-approved"}
# Sources that mean "not yet confirmed by the SME" — these block approval.
UNCONFIRMED_SOURCES = {"proposed", "web"}

TRANSITION_KINDS = ("normal", "branch", "loopback", "exception")


def template_headings(info: dict) -> list[str]:
    """The ordered template heading titles for an element type."""
    return [s["heading"] for s in (info.get("template") or [])]


def _bundle_path(slug: str, name: str) -> Path:
    return WIKI_DIR / slug / name


def _load_bundle(slug: str, name: str) -> dict:
    path = _bundle_path(slug, name)
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}


def _save_bundle(slug: str, name: str, data: dict) -> None:
    """Write a bundle, sorted by element id for byte-stable diffs. Removes the
    file when the bundle is empty so an empty process doesn't carry stale
    sidecars."""
    path = _bundle_path(slug, name)
    if not data:
        path.unlink(missing_ok=True)
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    ordered = {eid: data[eid] for eid in sorted(data)}
    path.write_text(
        json.dumps(ordered, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
        encoding="utf-8",
    )


def load_provenance(slug: str) -> dict[str, dict]:
    """The whole provenance bundle for a process — {eid: {heading: {source, evidence}}}."""
    return _load_bundle(slug, "provenance.json")


def get_provenance(slug: str, eid: str) -> dict:
    """The provenance map for one element. {} if absent."""
    entry = load_provenance(slug).get(eid)
    return entry if isinstance(entry, dict) else {}


def set_provenance(slug: str, eid: str, prov: dict) -> None:
    """Replace one element's provenance entry. Removes the key when prov is empty."""
    bundle = load_provenance(slug)
    if prov:
        bundle[eid] = {
            h: {"source": e.get("source", ""), "evidence": e.get("evidence", "")}
            for h, e in prov.items()
            if isinstance(e, dict)
        }
    else:
        bundle.pop(eid, None)
    _save_bundle(slug, "provenance.json", bundle)


def load_transitions(slug: str) -> dict[str, list[dict]]:
    """The whole transitions bundle for a process — {eid: [{to, kind, when}, ...]}."""
    bundle = _load_bundle(slug, "transitions.json")
    return {
        eid: [t for t in entries if isinstance(t, dict)]
        for eid, entries in bundle.items()
        if isinstance(entries, list)
    }


def get_transitions(slug: str, eid: str) -> list[dict]:
    """The transitions list for one element. [] if absent."""
    return load_transitions(slug).get(eid, [])


def set_transitions(slug: str, eid: str, transitions: list[dict]) -> None:
    """Replace one element's transitions entry. Removes the key when empty."""
    bundle = load_transitions(slug)
    cleaned: list[dict] = []
    for entry in transitions:
        if not isinstance(entry, dict):
            continue
        to = str(entry.get("to", "")).strip()
        if not to:
            continue
        kind = str(entry.get("kind", "normal")).strip()
        if kind not in TRANSITION_KINDS:
            kind = "normal"
        when = str(entry.get("when", "")).strip()
        cleaned.append({"to": to, "kind": kind, "when": when})
    if cleaned:
        bundle[eid] = cleaned
    else:
        bundle.pop(eid, None)
    _save_bundle(slug, "transitions.json", bundle)


def parse_transition_dsl(entry: str | dict) -> dict | None:
    """Accept either a structured {to, kind, when} dict or a legacy
    `to|kind|when` string and return the dict form. None when the entry has no
    `to` target. Skills and CLI callers can pass either form."""
    if isinstance(entry, dict):
        to = str(entry.get("to", "")).strip()
        if not to:
            return None
        kind = str(entry.get("kind", "normal")).strip()
        when = str(entry.get("when", "")).strip()
    else:
        parts = str(entry).split("|")
        to = parts[0].strip() if parts else ""
        if not to:
            return None
        kind = parts[1].strip() if len(parts) > 1 else "normal"
        when = "|".join(parts[2:]).strip()
    if kind not in TRANSITION_KINDS:
        kind = "normal"
    return {"to": to, "kind": kind, "when": when}


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


# ---- Element ids + writing ----------------------------------------------
# Shared by next_id.py (one id) and write_elements.py (a batch). One scan of
# the process yields the abbreviation and the highest sequence per type, so a
# batch can assign ids in memory without re-scanning the disk per element.


def id_state(slug: str) -> tuple[str, dict[str, int]]:
    """`(proc_abbrev, {type: highest-used-sequence})` from one scan. The next
    id for a type is `f"{prefix}-{proc}-{state.get(type, 0) + 1:03d}"`.
    Raises FileNotFoundError if the process is missing, ValueError if its
    abbreviation cannot be determined."""
    index = WIKI_DIR / slug / "index.md"
    if not index.is_file():
        raise FileNotFoundError(f"no process at wiki/processes/{slug}/")
    index_meta, _ = parse_frontmatter(index.read_text(encoding="utf-8"))

    proc: str | None = None
    max_n: dict[str, int] = {}
    for _path, meta, _body in iter_elements(slug):
        parts = str(meta.get("id", "")).split("-")
        if len(parts) != 3:
            continue
        # The process abbreviation is the middle segment of any element id.
        if proc is None:
            proc = parts[1]
        etype = str(meta.get("type", ""))
        if etype and parts[2].isdigit():
            max_n[etype] = max(max_n.get(etype, 0), int(parts[2]))

    # No elements yet — fall back to the process index id (new processes use
    # the abbreviation as the index id).
    if proc is None:
        proc = str(index_meta.get("id", "")).strip()
    if not proc:
        raise ValueError(f"cannot determine the process abbreviation for {slug}")
    return proc, max_n


WRITE_REQUIRED = ("slug", "type", "id", "title", "blocks")

# Default actor stamped on `updatedBy` when a caller doesn't pass one. Mirrors
# the fallback we use for ingest events in src/lib/contributors.ts — AI-driven
# writes that aren't yet attributed to a specific SME show up as the assistant.
DEFAULT_ACTOR = "the assistant"


def stamp_edit(frontmatter: dict, by: str | None) -> None:
    """Stamp `updatedBy` + `updatedAt` on the frontmatter — every write that
    changes content or fields runs through here so the contributors feed gets
    a real edit event. `by` falls back to `DEFAULT_ACTOR` when callers don't
    have a real name to pass (older skills, scripts run by hand)."""
    frontmatter["updatedBy"] = (by or "").strip() or DEFAULT_ACTOR
    frontmatter["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )


def write_element_spec(spec: dict, by: str | None = None) -> tuple[Path, str]:
    """Write one element file from a JSON spec (see write_element.py for the
    spec shape). Returns `(path, action)` where action is 'created' or
    'updated'. Raises ValueError on a malformed spec.

    Shared by write_element.py (one element) and write_elements.py (a batch),
    so the frontmatter order, relation rules, provenance map and non-lossy
    rewrite behave identically whichever path wrote the element."""
    for key in WRITE_REQUIRED:
        if key not in spec:
            raise ValueError(f"spec is missing required key '{key}'")

    types = element_types()
    etype = spec["type"]
    if etype not in types:
        raise ValueError(f"unknown element type '{etype}'")
    section = types[etype]["section"]

    proc_dir = WIKI_DIR / spec["slug"]
    if not (proc_dir / "index.md").is_file():
        raise ValueError(f"no process at wiki/processes/{spec['slug']}/")

    # Frontmatter, in a fixed, readable order.
    frontmatter: dict = {
        "id": spec["id"],
        "type": etype,
        "section": section,
        "title": spec["title"],
        "status": spec.get("status") or "draft",
    }
    if spec.get("confidence"):
        frontmatter["confidence"] = spec["confidence"]
    if spec.get("source"):
        frontmatter["source"] = spec["source"]
    for key, val in (spec.get("fields") or {}).items():
        frontmatter[key] = val

    # A relation key must be one the schema declares for this element type.
    # The reverse view of a relation is computed by the app, never stored.
    rel_keys = {
        r["key"]
        for r in ((types[etype].get("frontmatter") or {}).get("relations") or [])
    }
    # `raci` is an id-list carrying per-edge metadata; it stays on the
    # frontmatter. `transitions` also carries per-edge metadata, but its
    # structured shape ({to, kind, when}) lives in the per-process
    # transitions.json bundle — pulled out of the spec separately, below.
    rel_keys |= {"raci"}
    transitions_spec = None
    for key, val in (spec.get("relations") or {}).items():
        if key == "transitions":
            transitions_spec = val
            continue
        if key not in rel_keys:
            print(
                f"warning: dropped relation '{key}' — not a schema relation "
                f"for type '{etype}'; its reverse view is derived, not stored",
                file=sys.stderr,
            )
            continue
        frontmatter[key] = list(val)

    # Provenance map (HALLUCINATION-PLAN.md): one entry per block heading. A
    # heading the spec did not supply provenance for defaults to `proposed`.
    # The map lives in wiki/processes/<slug>/provenance.json — written below
    # after the element file is in place so a failed write doesn't leave a
    # stale bundle entry pointing at nothing.
    spec_prov = spec.get("provenance") or {}
    prov_for_bundle: dict = {}
    for block in spec["blocks"]:
        heading = block["heading"]
        entry = spec_prov.get(heading)
        if isinstance(entry, dict) and entry.get("source"):
            prov_for_bundle[heading] = {
                "source": entry["source"],
                "evidence": entry.get("evidence", ""),
            }
        else:
            prov_for_bundle[heading] = {"source": "proposed", "evidence": ""}

    # Auto-stamp `asOf` when the type declares it and the spec did not supply it.
    fm = types[etype].get("frontmatter", {}) or {}
    declared = {
        (f["key"] if isinstance(f, dict) else f) for f in fm.get("fields", [])
    } | set(fm.get("required", []))
    if "asOf" in declared and not frontmatter.get("asOf"):
        frontmatter["asOf"] = datetime.date.today().isoformat()

    section_dir = proc_dir / section
    section_dir.mkdir(parents=True, exist_ok=True)
    path = section_dir / f"{spec['id']}.md"
    existed = path.is_file()

    # Rewriting an existing element: carry forward every frontmatter key the
    # spec did not re-supply, so a rewrite is never lossy. `provenance` and
    # `transitions` are skipped — they used to live in frontmatter but now
    # live in per-process bundles; a stale frontmatter line from before the
    # migration must not be resurrected.
    if existed:
        prior, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
        for key, val in prior.items():
            if key in ("provenance", "transitions"):
                continue
            frontmatter.setdefault(key, val)
        # ...but a rewrite supersedes the content the SME approved — re-open it.
        if str(frontmatter.get("approval", "")).strip() in ("approved", "rejected"):
            frontmatter["approval"] = "in-progress"
            frontmatter.pop("approvalBy", None)
            frontmatter.pop("approvalDate", None)

    # Stamp updatedBy / updatedAt — every write counts as an edit event for
    # the contributors feed, even a non-content rewrite that only changes
    # frontmatter or relations.
    stamp_edit(frontmatter, by)

    action = "updated" if existed else "created"
    path.write_text(serialize_element(frontmatter, spec["blocks"]), encoding="utf-8")

    # Sidecar bundles: provenance for any template-bearing element; transitions
    # for elements that declared one. Write after the element file is in place
    # so a failed element write doesn't leave a dangling bundle entry.
    set_provenance(spec["slug"], spec["id"], prov_for_bundle)
    if transitions_spec is not None:
        parsed_transitions = [
            t
            for t in (parse_transition_dsl(entry) for entry in transitions_spec)
            if t is not None
        ]
        set_transitions(spec["slug"], spec["id"], parsed_transitions)

    log_write(spec["slug"], spec["id"], etype, action)
    return path, action

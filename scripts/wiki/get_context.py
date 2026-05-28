#!/usr/bin/env python3
"""Assemble the LLM's view of an element — schema + element + related — in one call.

A skill drafting or patching an element today gathers context ad-hoc: run
`show_template.py`, read the element file, then maybe walk the relations by
hand. That is prose-driven, drifts between skills, and burns tokens. This
script gives every skill the same context object via one CLI invocation.

Output is split into two clearly delimited buckets so callers can drop them
into a cached-prefix prompt structure (the stable bucket is what the
Anthropic prompt cache pays off across turns):

  • STABLE (cacheable across turns)   — type schema, process meta
  • VOLATILE (per-element / per-turn) — the artifact, related summaries

Channels:
  type-schema    The per-type contract from schema/.derived/<type>.llm.json
                 (Piece 3). Frontmatter contract, template headings + ranges,
                 relations, examples.
  artifact       The focal element — frontmatter + body.
  related        Direct relations resolved to ~30-word summaries: forward
                 relations declared by the schema, reverse relations (elements
                 pointing at this one), RACI (for steps and roles), and
                 outgoing transitions (for steps).
  process-meta   The process overview (title + Purpose block) and the section
                 status counts from sections.json.

Usage:
  get_context.py --slug <slug> --element <id> [--channels ...]
                                    Existing element. Default channels:
                                    type-schema,artifact,related,process-meta
  get_context.py --slug <slug> --type <type> [--channels ...]
                                    New element (no id yet). Default channels:
                                    type-schema,process-meta
  get_context.py ... --summary-words N     Cap related-element summaries (def 30)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    ROOT,
    WIKI_DIR,
    element_types,
    iter_elements,
    load_raci,
    load_schema,
    load_transitions,
    parse_frontmatter,
)

DERIVED_DIR = ROOT / "schema" / ".derived"

# Channels supported by --channels. Order here is the order they appear in
# output (stable channels first, volatile last).
STABLE_CHANNELS = ("type-schema", "process-meta")
VOLATILE_CHANNELS = ("artifact", "related")
ALL_CHANNELS = STABLE_CHANNELS + VOLATILE_CHANNELS

DEFAULT_CHANNELS_EXISTING = ("type-schema", "process-meta", "artifact", "related")
DEFAULT_CHANNELS_NEW = ("type-schema", "process-meta")


# ---- Channel: type-schema -----------------------------------------------


def render_type_schema(etype: str) -> str:
    """The derived per-type contract, rendered as readable markdown.

    Pulls from schema/.derived/<type>.llm.json (Piece 3). Skills get the
    same per-type contract `show_template.py` prints, formatted as a
    proper LLM-prompt section.
    """
    path = DERIVED_DIR / f"{etype}.llm.json"
    if not path.is_file():
        raise SystemExit(
            f"error: no derived schema for type '{etype}' at "
            f"{path.relative_to(ROOT)} — run "
            f"`python3 scripts/wiki/build_derived_schemas.py`"
        )
    d = json.loads(path.read_text(encoding="utf-8"))

    lines: list[str] = []
    lines.append(f"## Element type: {d['label']}  (`{d['elementType']}`)")
    lines.append("")
    lines.append(f"- **Section:** `{d['section']}`")
    lines.append(f"- **ID format:** `{d['idPrefix']}-<PROC>-<NNN>`")
    lines.append("")
    fm = d.get("frontmatter", {}) or {}
    fields = fm.get("fields") or []
    relations = fm.get("relations") or []
    required = fm.get("required") or []
    lines.append("### Frontmatter (beyond universal keys)")
    if fields:
        for f in fields:
            hint = f.get("hint") or ""
            line = f"- `{f['key']}`"
            if hint:
                line += f" — {hint}"
            lines.append(line)
            if f.get("enum"):
                lines.append(f"  - one of: {' | '.join(f['enum'])}")
            if f.get("suffix"):
                lines.append(f"  - value carries suffix `\"{f['suffix']}\"`")
            if f.get("urlKey"):
                tag = " (required)" if f["urlKey"] in required else ""
                lines.append(f"- `{f['urlKey']}` — URL for `{f['key']}`{tag}")
    else:
        lines.append("- (none)")
    if relations:
        lines.append("")
        lines.append("### Relations (id lists, written `[a, b]`)")
        for r in relations:
            target = r.get("target") or "?"
            lines.append(f"- `{r['key']}` → `{target}`")
    if required:
        lines.append("")
        lines.append(f"**Required keys:** {', '.join(required)}")
    raci = fm.get("raci")
    if raci:
        lines.append("")
        lines.append("### RACI")
        if raci.get("levels"):
            lines.append(f"- levels: {' | '.join(raci['levels'])}")
        if raci.get("note"):
            lines.append(f"- {raci['note']}")
    transitions = fm.get("transitions")
    if transitions:
        lines.append("")
        lines.append("### Transitions")
        if transitions.get("kinds"):
            lines.append(f"- kinds: {' | '.join(transitions['kinds'])}")
        if transitions.get("note"):
            lines.append(f"- {transitions['note']}")
    template = d.get("template") or []
    if template:
        lines.append("")
        lines.append("### Prose blocks — exactly these `##` headings, in this order")
        for b in template:
            ranges = []
            if b.get("paragraphs"):
                ranges.append(f"{b['paragraphs']} paragraph(s)")
            if b.get("words"):
                ranges.append(f"{b['words']} words")
            if b.get("items"):
                ranges.append(f"{b['items']} items")
            tag = f"  [{b.get('format', 'paragraph')}, {', '.join(ranges)}]" if ranges else f"  [{b.get('format', 'paragraph')}]"
            lines.append(f"- `## {b['heading']}`{tag}")
            if b.get("purpose"):
                lines.append(f"  - {b['purpose']}")
    examples = d.get("examples") or []
    if examples:
        lines.append("")
        lines.append("### In-wiki examples to read for reference")
        for ex in examples:
            lines.append(f"- `{ex['path']}`")
    return "\n".join(lines)


# ---- Channel: process-meta -----------------------------------------------


def render_process_meta(slug: str) -> str:
    """Process overview (title + Purpose) + section status counts."""
    proc_dir = WIKI_DIR / slug
    index = proc_dir / "index.md"
    if not index.is_file():
        raise SystemExit(f"error: no process at wiki/processes/{slug}/")
    meta, body = parse_frontmatter(index.read_text(encoding="utf-8"))
    title = meta.get("title") or slug

    lines: list[str] = [f"## Process: {title}  (`{slug}`)"]
    if body:
        # Strip "## Purpose" heading if present; output the first prose block.
        first = re.split(r"^## ", body, maxsplit=2, flags=re.MULTILINE)[-1].strip()
        # If we matched after the split, the heading is the first line.
        if "\n" in first and not first.startswith("##"):
            heading_line, _, rest = first.partition("\n")
            if re.match(r"^[A-Z][A-Za-z ]+$", heading_line.strip()):
                first = rest.strip()
        if first:
            lines.append("")
            lines.append(first)
    # Section completeness from sections.json — what's been worked vs not.
    sections_path = proc_dir / "sections.json"
    if sections_path.is_file():
        try:
            data = json.loads(sections_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = {}
        worked = [k for k, v in data.items() if isinstance(v, dict) and v.get("status") == "worked"]
        confirmed_empty = [k for k, v in data.items() if isinstance(v, dict) and v.get("status") == "confirmed-empty"]
        total = len(load_schema_sections())
        lines.append("")
        lines.append(f"**Section progress:** {len(worked)} worked, {len(confirmed_empty)} confirmed-empty, of {total} total")
        if worked:
            lines.append(f"- worked: {', '.join(sorted(worked))}")
    return "\n".join(lines)


def load_schema_sections() -> list[str]:
    """Every section id across every area, ordered. Used for total count."""
    schema = load_schema()
    return [s["id"] for area in schema["areas"] for s in area["sections"]]


# ---- Channel: artifact (focal element) ----------------------------------


def render_artifact(slug: str, element_id: str) -> str:
    """The focal element — frontmatter + body, verbatim."""
    for path, meta, body in iter_elements(slug):
        if str(meta.get("id")) == element_id:
            lines: list[str] = [f"## Element: {element_id} — {meta.get('title', '')}"]
            lines.append("")
            lines.append("**Frontmatter:**")
            lines.append("```yaml")
            for k, v in meta.items():
                if isinstance(v, list):
                    lines.append(f"{k}: [{', '.join(str(x) for x in v)}]")
                else:
                    lines.append(f"{k}: {v}")
            lines.append("```")
            if body:
                lines.append("")
                lines.append(body)
            lines.append("")
            lines.append(f"*Source file: `{path.relative_to(ROOT)}`*")
            return "\n".join(lines)
    raise SystemExit(f"error: no element with id '{element_id}' in process '{slug}'")


# ---- Channel: related ----------------------------------------------------


def summarise(body: str, word_cap: int) -> str:
    """Trim a body to ~N words. Mirrors process-view.ts:summarise."""
    if not body:
        return ""
    flat = re.sub(r"^##\s+.+$", "", body, flags=re.MULTILINE)
    flat = re.sub(r"^[\s\-*•]+", "", flat, flags=re.MULTILINE)
    flat = re.sub(r"\s+", " ", flat).strip()
    if not flat:
        return ""
    words = flat.split(" ")
    if len(words) <= word_cap:
        return flat
    return " ".join(words[:word_cap]) + "…"


def render_related(slug: str, element_id: str, word_cap: int) -> str:
    """Forward + reverse + RACI + transitions, each as ~30-word summaries.

    Mirrors contextFor() in src/lib/process-view.ts so the LLM sees the same
    related-context shape on both the skill side (this CLI) and the TS side
    (when surfaced in the UI).
    """
    schema = load_schema()
    types = element_types(schema)
    by_id: dict[str, dict] = {}
    by_id_body: dict[str, str] = {}
    focal_meta: dict | None = None
    focal_type: str | None = None
    for _path, meta, body in iter_elements(slug):
        eid = str(meta.get("id", ""))
        by_id[eid] = meta
        by_id_body[eid] = body
        if eid == element_id:
            focal_meta = meta
            focal_type = str(meta.get("type", ""))
    if focal_meta is None:
        raise SystemExit(f"error: no element with id '{element_id}' in process '{slug}'")

    # Forward relations declared by the schema for this type.
    related: dict[str, list[tuple[str, str]]] = {}

    def add(label: str, target_id: str) -> None:
        target = by_id.get(target_id)
        if not target:
            # Broken reference — surface it explicitly. Skills make worse
            # decisions when broken targets silently disappear (e.g. they
            # think a role has no RACI when really its RACI points at ids
            # that don't exist).
            related.setdefault(label, []).append(
                (target_id, "(target not found in this process)"),
            )
            return
        title = target.get("title", "")
        body = by_id_body.get(target_id, "")
        # Prefer the first prose block if present.
        first_block = re.split(r"^##\s+.+$", body, maxsplit=2, flags=re.MULTILINE)
        source = first_block[1] if len(first_block) > 1 else body
        summary = summarise(source, word_cap)
        related.setdefault(label, []).append((target_id, f"{title} — {summary}" if summary else title))

    rels = (types.get(focal_type, {}).get("frontmatter") or {}).get("relations") or []
    for rel in rels:
        key = rel["key"] if isinstance(rel, dict) else rel
        label = rel.get("label", key) if isinstance(rel, dict) else key
        val = focal_meta.get(key)
        if isinstance(val, list):
            ids = [str(v) for v in val]
        elif val:
            ids = [str(val)]
        else:
            ids = []
        for tid in ids:
            add(label, tid)

    # Reverse: elements pointing at this one via a reverseLabel relation.
    for eid, meta in by_id.items():
        etype = str(meta.get("type", ""))
        for rel in (types.get(etype, {}).get("frontmatter") or {}).get("relations") or []:
            reverse_label = rel.get("reverseLabel") if isinstance(rel, dict) else None
            if not reverse_label:
                continue
            key = rel["key"] if isinstance(rel, dict) else rel
            val = meta.get(key)
            if isinstance(val, list):
                points_at = [str(v) for v in val]
            elif val:
                points_at = [str(val)]
            else:
                points_at = []
            if element_id in points_at:
                add(reverse_label, eid)

    # RACI: for process-steps, surface the assigned roles per level. For
    # roles, surface the steps they participate in.
    if focal_type == "process-step":
        raci_bundle = load_raci(slug)
        for role_id, entries in raci_bundle.items():
            for entry in entries:
                if str(entry.get("step")) == element_id:
                    add(f"RACI · {entry.get('level', '')}", role_id)
    elif focal_type == "role":
        raci_bundle = load_raci(slug)
        for entry in raci_bundle.get(element_id, []):
            level = entry.get("level", "")
            step_id = str(entry.get("step", ""))
            add(f"RACI · {level}", step_id)

    # Outgoing transitions for process-steps.
    if focal_type == "process-step":
        trans = load_transitions(slug).get(element_id, [])
        for t in trans:
            kind = t.get("kind", "normal")
            add(f"Transitions · {kind}", str(t.get("to", "")))

    if not related:
        return "## Related to this element\n\n_(no related elements found)_"

    lines: list[str] = ["## Related to this element"]
    for label in sorted(related.keys()):
        lines.append("")
        lines.append(f"### {label}")
        for eid, line in related[label]:
            lines.append(f"- `{eid}` · {line}")
    return "\n".join(lines)


# ---- Top-level rendering -------------------------------------------------


SEPARATOR_STABLE = "=== STABLE (cacheable across this skill's turns) ==="
SEPARATOR_VOLATILE = "=== VOLATILE (per-element / per-turn) ==="


def render(
    slug: str,
    element_id: str | None,
    etype: str | None,
    channels: tuple[str, ...],
    word_cap: int,
) -> str:
    """Assemble the prompt markdown for the given channels, bucketed."""
    rendered: dict[str, str] = {}
    for ch in channels:
        if ch == "type-schema":
            t = etype
            if t is None and element_id is not None:
                # Resolve type from the element.
                for _p, meta, _b in iter_elements(slug):
                    if str(meta.get("id")) == element_id:
                        t = str(meta.get("type", ""))
                        break
            if not t:
                raise SystemExit(
                    "error: type-schema channel requires --type, "
                    "or --element pointing at an existing element"
                )
            rendered[ch] = render_type_schema(t)
        elif ch == "process-meta":
            rendered[ch] = render_process_meta(slug)
        elif ch == "artifact":
            if not element_id:
                raise SystemExit("error: artifact channel requires --element")
            rendered[ch] = render_artifact(slug, element_id)
        elif ch == "related":
            if not element_id:
                raise SystemExit("error: related channel requires --element")
            rendered[ch] = render_related(slug, element_id, word_cap)
        else:
            raise SystemExit(
                f"error: unknown channel '{ch}'. "
                f"Known: {', '.join(ALL_CHANNELS)}"
            )

    out: list[str] = []
    stable_parts = [rendered[c] for c in STABLE_CHANNELS if c in rendered]
    volatile_parts = [rendered[c] for c in VOLATILE_CHANNELS if c in rendered]
    if stable_parts:
        out.append(SEPARATOR_STABLE)
        out.append("")
        out.append("\n\n".join(stable_parts))
    if volatile_parts:
        if out:
            out.append("")
        out.append(SEPARATOR_VOLATILE)
        out.append("")
        out.append("\n\n".join(volatile_parts))
    return "\n".join(out) + "\n"


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    ap.add_argument("--slug", required=True, help="process slug")
    ap.add_argument("--element", default=None, help="existing element id (e.g. PS-SP-001)")
    ap.add_argument("--type", dest="etype", default=None, help="element type, for new elements")
    ap.add_argument(
        "--channels",
        default=None,
        help=(
            "comma-separated channels. "
            f"Known: {','.join(ALL_CHANNELS)}. "
            "Defaults: type-schema,process-meta,artifact,related "
            "with --element; type-schema,process-meta with --type."
        ),
    )
    ap.add_argument(
        "--summary-words",
        type=int,
        default=30,
        help="word cap on related-element summaries (default 30)",
    )
    args = ap.parse_args(argv)

    if not args.element and not args.etype:
        raise SystemExit("error: must supply --element (existing) or --type (new)")
    if args.channels:
        channels = tuple(c.strip() for c in args.channels.split(",") if c.strip())
        unknown = [c for c in channels if c not in ALL_CHANNELS]
        if unknown:
            raise SystemExit(
                f"error: unknown channel(s): {', '.join(unknown)}. "
                f"Known: {', '.join(ALL_CHANNELS)}"
            )
    else:
        channels = DEFAULT_CHANNELS_EXISTING if args.element else DEFAULT_CHANNELS_NEW

    print(render(args.slug, args.element, args.etype, channels, args.summary_words), end="")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

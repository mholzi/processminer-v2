#!/usr/bin/env python3
"""Migrate stored actor names → stable user IDs (usernames).

Until now, `updatedBy`, `approvalBy`, `relevanceBy`, comment authors and
sidecar `by` fields stored the **display name** verbatim (e.g.
"Markus Holzhauser"). That breaks name + role propagation: a rename in
`data/users.json` doesn't reach the wiki.

This one-shot script walks every wiki and raw-sources artefact and
replaces display names with the corresponding `username` from
`data/users.json`. Renderers resolve username → display name at read
time (see `src/lib/contributors.ts` and `src/lib/user-roster-client.ts`),
so future renames propagate automatically.

  python3 scripts/migrate_actors_to_userids.py          # dry-run; reports
  python3 scripts/migrate_actors_to_userids.py --apply  # writes changes

Dry-run is the default — re-read the report carefully before committing.
Matching is ASCII-fold + case-insensitive on display name (so `Markus
Holzhäuser` in users.json matches `Markus Holzhauser` in the wiki).
Ambiguous matches (two users with the same name) and unknown names are
reported, never overwritten. The sentinel `"the assistant"` is never
touched.

Scoped writes:
  - wiki/processes/<slug>/**/*.md           frontmatter: createdBy,
                                              updatedBy, approvalBy,
                                              approvedBy, relevanceBy
  - wiki/processes/<slug>/notes.json        n.author, n.resolvedBy
  - wiki/processes/<slug>/sections.json     meta.by
  - wiki/processes/<slug>/ingest.json       ingest.by
  - wiki/processes/<slug>/lint.json         lint.by
  - wiki/processes/<slug>/finding-dismissals.json  entry.by
  - raw-sources/<slug>/uploads.json         meta.by
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WIKI_DIR = ROOT / "wiki" / "processes"
SOURCES_DIR = ROOT / "raw-sources"
USERS_PATH = ROOT / "data" / "users.json"

SENTINELS = {
    "the assistant",
    "bootstrap",
    "scaffold",
    "unknown",
    "SME",
    # Skill names sometimes stored as `by` for non-human-attributed events.
    "run-lint",
    "document-ingest",
    "foundational-run",
    # Role names that have been (mis)used as actor values historically.
    "Process Specialist",
    "Control / Compliance Specialist",
    "Client Journey Specialist",
    "Innovation Analyst",
    "IT Architect",
    "Domain Architect",
    "Solution Architect",
    "Transformation Agent",
}

# Frontmatter keys whose value is a display name to migrate.
FM_KEYS = ("createdBy", "updatedBy", "approvalBy", "approvedBy", "relevanceBy")


def asciify(s: str) -> str:
    """Lowercase, strip diacritics, collapse whitespace."""
    nfkd = unicodedata.normalize("NFKD", s)
    no_marks = "".join(c for c in nfkd if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", no_marks).strip().lower()


def load_user_map() -> tuple[dict[str, str], dict[str, list[str]]]:
    """Build `asciified-name → username`. Also returns ambiguity map for
    diagnostic reporting (asciified-name → list of competing usernames)."""
    if not USERS_PATH.is_file():
        return {}, {}
    raw = json.loads(USERS_PATH.read_text(encoding="utf-8"))
    name_to_users: dict[str, list[str]] = {}
    username_set: set[str] = set()
    for u in raw:
        username = u.get("username", "").strip()
        name = u.get("name", "").strip()
        if not username:
            continue
        username_set.add(username)
        if not name:
            continue
        key = asciify(name)
        name_to_users.setdefault(key, []).append(username)
    # The unambiguous map drives replacements.
    unambig = {k: vs[0] for k, vs in name_to_users.items() if len(vs) == 1}
    ambig = {k: vs for k, vs in name_to_users.items() if len(vs) > 1}
    # Usernames stored verbatim are already correct — pass them through.
    for username in username_set:
        unambig.setdefault(asciify(username), username)
    return unambig, ambig


def resolve(value: str, name_map: dict[str, str]) -> str | None:
    """Returns the username for `value`, or None if no unambiguous match.

    A value already equal to its target username (e.g. `admin`) resolves
    to itself. Sentinels and empty strings resolve to themselves too.
    """
    if not value or not isinstance(value, str):
        return None
    if value in SENTINELS:
        return value  # never touch sentinels
    return name_map.get(asciify(value))


# --- Markdown frontmatter walk ------------------------------------------------

FM_LINE_RE = re.compile(r"^([A-Za-z_][\w-]*):\s*(.*?)\s*$")


def _rel(path: Path) -> str:
    """Path relative to ROOT, or absolute if outside (e.g. test fixtures)."""
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def migrate_md_file(
    path: Path,
    name_map: dict[str, str],
    apply: bool,
    report: list[dict],
) -> bool:
    """Return True if the file changed (or would change in dry-run)."""
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n([\s\S]*?)\n---\n?([\s\S]*)$", text)
    if not m:
        return False
    fm_lines = m.group(1).split("\n")
    body = m.group(2)
    changed = False
    rel = _rel(path)
    for i, line in enumerate(fm_lines):
        lm = FM_LINE_RE.match(line)
        if not lm:
            continue
        key, value = lm.group(1), lm.group(2)
        if key not in FM_KEYS:
            continue
        unquoted = value.strip().strip('"').strip("'")
        resolved = resolve(unquoted, name_map)
        if resolved is None:
            report.append(
                {"kind": "unresolved", "path": rel, "field": key, "value": unquoted}
            )
            continue
        if resolved == unquoted:
            continue
        fm_lines[i] = f"{key}: {resolved}"
        changed = True
        report.append(
            {"kind": "migrated", "path": rel, "field": key, "from": unquoted, "to": resolved}
        )
    if changed and apply:
        path.write_text(
            f"---\n{chr(10).join(fm_lines)}\n---\n{body}",
            encoding="utf-8",
        )
    return changed


# --- JSON sidecar walks -------------------------------------------------------

def migrate_json(
    path: Path,
    name_map: dict[str, str],
    transform,
    apply: bool,
    report: list[dict],
) -> bool:
    """Run `transform(data, ctx)` over a JSON file. `transform` returns
    True if it mutated `data`. `ctx` is a list captured into `report`."""
    if not path.is_file():
        return False
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return False
    rel = _rel(path)
    ctx: list[dict] = []
    changed = transform(data, name_map, ctx, rel)
    report.extend(ctx)
    if changed and apply:
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    return changed


def _migrate_by_field(
    container: dict,
    field: str,
    name_map: dict[str, str],
    ctx: list[dict],
    rel: str,
    location: str,
) -> bool:
    value = container.get(field)
    if not isinstance(value, str):
        return False
    resolved = resolve(value, name_map)
    if resolved is None:
        ctx.append({"kind": "unresolved", "path": rel, "field": location, "value": value})
        return False
    if resolved == value:
        return False
    container[field] = resolved
    ctx.append({"kind": "migrated", "path": rel, "field": location, "from": value, "to": resolved})
    return True


def transform_notes(data: dict, name_map: dict[str, str], ctx: list[dict], rel: str) -> bool:
    changed = False
    for element_id, arr in data.items():
        if not isinstance(arr, list):
            continue
        for n in arr:
            if not isinstance(n, dict):
                continue
            if _migrate_by_field(n, "author", name_map, ctx, rel, f"{element_id}.author"):
                changed = True
            if _migrate_by_field(n, "resolvedBy", name_map, ctx, rel, f"{element_id}.resolvedBy"):
                changed = True
    return changed


def transform_sections(data: dict, name_map: dict[str, str], ctx: list[dict], rel: str) -> bool:
    changed = False
    for section_id, meta in data.items():
        if isinstance(meta, dict) and _migrate_by_field(
            meta, "by", name_map, ctx, rel, f"{section_id}.by"
        ):
            changed = True
    return changed


def transform_top_by(data: dict, name_map: dict[str, str], ctx: list[dict], rel: str) -> bool:
    return _migrate_by_field(data, "by", name_map, ctx, rel, "by")


def transform_dismissals(data: dict, name_map: dict[str, str], ctx: list[dict], rel: str) -> bool:
    changed = False
    for sig, entry in data.items():
        if isinstance(entry, dict) and _migrate_by_field(
            entry, "by", name_map, ctx, rel, f"{sig[:12]}…by"
        ):
            changed = True
    return changed


def transform_uploads(data: dict, name_map: dict[str, str], ctx: list[dict], rel: str) -> bool:
    changed = False
    for filename, meta in data.items():
        if isinstance(meta, dict) and _migrate_by_field(
            meta, "by", name_map, ctx, rel, f"{filename}.by"
        ):
            changed = True
    return changed


def main(argv: list[str]) -> int:
    apply = "--apply" in argv
    name_map, ambig = load_user_map()
    if not name_map:
        print("error: data/users.json is empty or missing — nothing to migrate.", file=sys.stderr)
        return 1
    if ambig:
        print("note: ambiguous display names (skipped, please resolve manually):")
        for k, users in ambig.items():
            print(f"  {k} → {users}")
        print()

    report: list[dict] = []

    # Markdown frontmatter — every .md under wiki/processes/
    if WIKI_DIR.is_dir():
        for path in sorted(WIKI_DIR.glob("**/*.md")):
            migrate_md_file(path, name_map, apply, report)

    # Sidecar JSONs — per process slug + raw-sources uploads
    if WIKI_DIR.is_dir():
        for proc_dir in sorted(WIKI_DIR.iterdir()):
            if not proc_dir.is_dir():
                continue
            migrate_json(proc_dir / "notes.json", name_map, transform_notes, apply, report)
            migrate_json(proc_dir / "sections.json", name_map, transform_sections, apply, report)
            migrate_json(proc_dir / "ingest.json", name_map, transform_top_by, apply, report)
            migrate_json(proc_dir / "lint.json", name_map, transform_top_by, apply, report)
            migrate_json(
                proc_dir / "finding-dismissals.json",
                name_map,
                transform_dismissals,
                apply,
                report,
            )
    if SOURCES_DIR.is_dir():
        for src_dir in sorted(SOURCES_DIR.iterdir()):
            if not src_dir.is_dir():
                continue
            migrate_json(src_dir / "uploads.json", name_map, transform_uploads, apply, report)

    migrated = [r for r in report if r["kind"] == "migrated"]
    unresolved = [r for r in report if r["kind"] == "unresolved"]
    print(f"migrated:   {len(migrated)}  {'(applied)' if apply else '(dry-run)'}")
    print(f"unresolved: {len(unresolved)}")
    if migrated:
        sample = migrated[:5]
        print("  e.g.")
        for r in sample:
            print(f"    {r['path']} :: {r['field']} :: {r['from']} → {r['to']}")
        if len(migrated) > 5:
            print(f"    … and {len(migrated) - 5} more")
    if unresolved:
        # Group by value to keep the report short
        by_value: dict[str, list[dict]] = {}
        for r in unresolved:
            by_value.setdefault(r["value"], []).append(r)
        print("  unresolved values (no match in data/users.json):")
        for value, rows in sorted(by_value.items()):
            print(f"    '{value}' — {len(rows)} occurrence(s)")
    if not apply and migrated:
        print()
        print("Dry-run complete. Re-run with --apply to write the changes.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

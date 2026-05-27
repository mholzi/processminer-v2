#!/usr/bin/env python3
"""Patch one block or one frontmatter field of an existing element — in place.

When a skill needs to change just one part of an element — a reworked block,
a corrected field, a resolved conflict — it should not re-emit the whole
element. Re-typing every untouched block risks silently dropping one. This
script reads the element, changes exactly the one block or field given, and
re-writes it; everything else stays as it was.

Usage:
  patch_element.py <slug> <id> --block "<heading>" <textfile> [--by <actor>]
  patch_element.py <slug> <id> --field "<key>" "<value>"       [--by <actor>]
  patch_element.py <slug> <id> --list  "<key>" "<id1,id2,...>" [--by <actor>]

  --block   replace the prose under an existing `## <heading>`
  --field   set a scalar frontmatter field (created if absent)
  --list    set an id-list frontmatter field, e.g. relations
  --by      stamp `updatedBy` on the element (default: "the assistant")
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import (  # noqa: E402
    ROOT,
    element_types,
    get_provenance,
    iter_elements,
    parse_blocks,
    parse_transition_dsl,
    serialize_element,
    set_provenance,
    set_transitions,
    stamp_edit,
)

# List frontmatter keys that are not schema relations but are legitimately
# id-lists with per-edge metadata. `raci` lives on the frontmatter; transitions
# live in the per-process transitions.json bundle but are exposed through the
# same `--list transitions` CLI for the skills' continuity.
NON_RELATION_LISTS = {"raci"}


def main(argv: list[str]) -> None:
    by: str | None = None
    rest: list[str] = []
    i = 0
    while i < len(argv):
        if argv[i] == "--by" and i + 1 < len(argv):
            by = argv[i + 1]
            i += 2
        else:
            rest.append(argv[i])
            i += 1
    if len(rest) != 5 or rest[2] not in ("--block", "--field", "--list"):
        sys.exit(
            "usage: patch_element.py <slug> <id> "
            "(--block <heading> <textfile> | --field <key> <value> | "
            "--list <key> <id1,id2,...>) [--by <actor>]"
        )
    slug, eid, mode, key, value = rest

    found = None
    for path, meta, body in iter_elements(slug):
        if meta.get("id") == eid:
            found = (path, meta, body)
            break
    if not found:
        sys.exit(f"error: no element '{eid}' in process '{slug}'")
    path, meta, body = found
    blocks = parse_blocks(body)

    # The transitions bundle write happens after the body+frontmatter is
    # rewritten, so a failed file write doesn't leave a stale bundle entry.
    pending_transitions: list[dict] | None = None

    if mode == "--block":
        try:
            text = Path(value).read_text(encoding="utf-8").strip()
        except OSError as e:
            sys.exit(f"error: could not read block textfile — {e}")
        target = next((b for b in blocks if b["heading"] == key), None)
        if target is None:
            have = ", ".join(b["heading"] for b in blocks) or "(none)"
            sys.exit(
                f"error: element '{eid}' has no block '## {key}' — "
                f"blocks are: {have}"
            )
        target["text"] = text
        # Editing a block's prose invalidates its provenance: the new text is
        # AI-authored and unconfirmed until the SME re-approves it. Flip the
        # heading back to `proposed` (HALLUCINATION-PLAN.md — the critical gap:
        # without this, a hallucination re-enters an approved element silently).
        prov = get_provenance(slug, eid)
        prov[key] = {"source": "proposed", "evidence": ""}
        set_provenance(slug, eid, prov)
        what = f"block '## {key}' (provenance reset to proposed)"
    elif mode == "--list":
        # `transitions` is the per-edge list that lives in the per-process
        # transitions.json bundle, exposed through `--list` for skill continuity.
        # Other id-lists must be schema-declared relations for this element's
        # type. A relation's reverse view (e.g. a system's steps) is derived
        # from the canonical side, never stored — patching it creates the
        # one-sided links lint then has to chase. Fail loudly on the misuse.
        if key == "transitions":
            items = [x.strip() for x in value.split(",") if x.strip()]
            pending_transitions = [
                t
                for t in (parse_transition_dsl(entry) for entry in items)
                if t is not None
            ]
            what = "field 'transitions' (bundle)"
        else:
            if key not in NON_RELATION_LISTS:
                etype = str(meta.get("type", ""))
                info = element_types().get(etype, {})
                rel_keys = {
                    r["key"]
                    for r in ((info.get("frontmatter") or {}).get("relations") or [])
                }
                if key not in rel_keys:
                    sys.exit(
                        f"error: '{key}' is not a schema relation for type "
                        f"'{etype}'. Its reverse view is derived from the "
                        f"canonical side — patch that side instead."
                    )
            items = [x.strip() for x in value.split(",") if x.strip()]
            meta[key] = items
            what = f"field '{key}' (list)"
    else:  # --field
        if key in ("provenance", "transitions"):
            sys.exit(
                f"error: '{key}' lives in wiki/processes/{slug}/{key}.json — "
                f"use `--list transitions ...` for transitions, or "
                f"patch_element.py --block to update provenance via a block edit."
            )
        meta[key] = value
        what = f"field '{key}'"

    # An edit invalidates any prior approval — the sign-off certified the *old*
    # content. Re-open the element so the SME re-reviews, and clear the now-
    # stale by/date stamp. SKILLS.md §10: an edit (SME *or* skill) reverts
    # approval at save; mirrors saveElement() in wiki-write.ts and run-lint's
    # reopen. Skipped only when the patch is itself an approval field — then
    # the caller (e.g. set_approval) owns the approval state deliberately.
    is_approval_patch = key in ("approval", "approvalBy", "approvalDate")
    if not is_approval_patch:
        if str(meta.get("approval", "")) == "approved":
            meta["approval"] = "in-progress"
            # Drop the stale by/date stamp entirely — they certified the old
            # content. set_approval re-adds them on the next sign-off. Mirrors
            # write_element.py's rewrite re-open.
            meta.pop("approvalBy", None)
            meta.pop("approvalDate", None)
            what += " — approval re-opened (was approved)"

    # Stamp edit attribution — every content patch counts as an edit event.
    # An approval-field patch goes through set_approval (which owns its own
    # approvalBy/approvalDate stamp), so skip the edit stamp there to avoid
    # masking the approval row in the contributors feed.
    if not is_approval_patch:
        stamp_edit(meta, by)

    path.write_text(serialize_element(meta, blocks), encoding="utf-8")
    if pending_transitions is not None:
        set_transitions(slug, eid, pending_transitions)
    print(f"patched {what} of {eid} — {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main(sys.argv[1:])

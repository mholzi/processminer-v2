#!/usr/bin/env python3
"""Maintain the discussion-thread sidecar — deterministic.

notes.json (`wiki/processes/<slug>/notes.json`) is the per-element comment
thread — `{ elementId: [ {id, author, text, ts, replyTo?, resolved?}, ... ] }`.
The app appends SME comments to it through `/api/notes`; the `comment-review`
skill uses this script for the two writes it owns:

  notes.py resolve <slug> <elementId> <noteId> [<noteId> ...]
      Mark the named comments resolved — once the skill has triaged them with
      the SME (incorporated, declined or otherwise handled).

  notes.py summary <slug> <elementId> <author> <textfile>
      Append the analyst's closing summary note to the thread, authored by the
      owning specialist. Written resolved — it is a response, not a comment to
      triage on the next run. <textfile> holds the note text. Prints the new id.

The skill does the judgement; this script owns the file format, so the thread
can never be written malformed.
"""

from __future__ import annotations

import json
import random
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from wiki_lib import WIKI_DIR  # noqa: E402

_ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"


def notes_path(slug: str) -> Path:
    return WIKI_DIR / slug / "notes.json"


def load_notes(slug: str) -> dict[str, list[dict]]:
    path = notes_path(slug)
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        sys.exit(f"error: notes.json for {slug} is not valid JSON")
    return data if isinstance(data, dict) else {}


def save_notes(slug: str, notes: dict[str, list[dict]]) -> None:
    notes_path(slug).write_text(
        json.dumps(notes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def new_note_id() -> str:
    return f"n-{int(time.time() * 1000)}-{''.join(random.choices(_ID_CHARS, k=5))}"


def cmd_resolve(slug: str, element_id: str, note_ids: list[str]) -> None:
    notes = load_notes(slug)
    thread = notes.get(element_id)
    if not thread:
        sys.exit(f"error: no discussion thread for {element_id} in {slug}")

    by_id = {str(n.get("id")): n for n in thread}
    missing = [nid for nid in note_ids if nid not in by_id]
    if missing:
        sys.exit(f"error: no such note(s) on {element_id}: {', '.join(missing)}")

    for nid in note_ids:
        by_id[nid]["resolved"] = True
    save_notes(slug, notes)
    print(f"resolved {len(note_ids)} comment(s) on {element_id}")


def cmd_summary(slug: str, element_id: str, author: str, textfile: str) -> None:
    try:
        text = Path(textfile).read_text(encoding="utf-8").strip()
    except OSError as e:
        sys.exit(f"error: could not read summary text — {e}")
    if not text:
        sys.exit("error: the summary note is empty")

    notes = load_notes(slug)
    note = {
        "id": new_note_id(),
        "author": author,
        "text": text,
        "ts": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
        "resolved": True,
    }
    notes.setdefault(element_id, []).append(note)
    save_notes(slug, notes)
    print(note["id"])


def main(argv: list[str]) -> None:
    if len(argv) < 4 or argv[0] not in ("resolve", "summary"):
        sys.exit(
            "usage: notes.py resolve  <slug> <elementId> <noteId> [<noteId> ...]\n"
            "       notes.py summary  <slug> <elementId> <author> <textfile>"
        )
    cmd, slug, element_id = argv[0], argv[1], argv[2]

    if not (WIKI_DIR / slug).is_dir():
        sys.exit(f"error: no process at wiki/processes/{slug}/")

    if cmd == "resolve":
        cmd_resolve(slug, element_id, argv[3:])
    else:
        if len(argv) != 5:
            sys.exit("usage: notes.py summary <slug> <elementId> <author> <textfile>")
        cmd_summary(slug, element_id, argv[3], argv[4])


if __name__ == "__main__":
    main(sys.argv[1:])

// Pure helpers for the two note operations an AI session performs (the
// comment-review skill): posting a closing analyst note and marking comments
// resolved. No I/O — the providers (claude-mcp-server.ts / gemini-worker.ts)
// read the process JSON, call these, and writeFileSync it back, mirroring how
// session-writes.ts handles the other root fields. The in-app equivalents live
// in src/app/api/notes/route.ts (POST appends, PATCH toggles `resolved`); these
// keep the same shape so a note written by the skill is indistinguishable from
// one written in the app.

import type { Note } from "./wiki.ts";

export interface NoteInput {
  author: string;
  text: string;
  type?: string;
  replyTo?: string;
}

/**
 * Assemble a Note from the skill's input plus a backend-generated `id` and `ts`
 * (kept as a parameter so this stays pure and unit-testable). Empty `text`
 * throws — an empty note is never written.
 */
export function buildNote(input: NoteInput, stamp: { id: string; ts: string }): Note {
  const text = (input.text ?? "").trim();
  if (!text) throw new Error("The note is empty.");
  const note: Note = {
    id: stamp.id,
    author: input.author?.trim() || "SME",
    text,
    ts: stamp.ts,
  };
  if (input.replyTo) note.replyTo = input.replyTo;
  if (input.type) note.type = input.type;
  return note;
}

/** Append a built note to its element's thread (mutates `doc.notes`). */
export function appendNote(doc: any, elementId: string, note: Note): void {
  if (!elementId) throw new Error("createNote requires an elementId.");
  doc.notes ??= {};
  (doc.notes[elementId] ??= []).push(note);
}

/**
 * Mark the given note ids resolved across every element thread (the
 * comment-review close-out). Sets `resolved` / `resolvedBy` / `resolvedAt` on
 * each found note (mutates `doc.notes`). `resolvedAt` is passed in (a date
 * string) to keep this pure. Returns which ids were resolved and which were not
 * found, so the handler can report honestly.
 */
export function resolveNotesInDoc(
  doc: any,
  noteIds: string[],
  resolvedBy: string,
  resolvedAt: string,
): { resolved: string[]; notFound: string[] } {
  const want = new Set(noteIds);
  const resolved: string[] = [];
  const threads = doc?.notes ?? {};
  for (const eid of Object.keys(threads)) {
    for (const note of threads[eid] ?? []) {
      if (want.has(note.id)) {
        note.resolved = true;
        note.resolvedBy = resolvedBy || "SME";
        note.resolvedAt = resolvedAt;
        resolved.push(note.id);
      }
    }
  }
  const found = new Set(resolved);
  const notFound = noteIds.filter((id) => !found.has(id));
  return { resolved, notFound };
}

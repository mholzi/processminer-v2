import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { NextRequest } from "next/server";

// Appends an SME note to wiki/processes/<slug>/notes.json — the note-thread
// sidecar (#19). Notes are collaboration data, not process documentation:
// the app owns the SME-comment writes here. The thread is co-owned — the
// comment-review skill also writes notes.json (via scripts/wiki/notes.py) to
// mark comments resolved and post its closing analyst summary.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const slug = body.slug;
  const elementId = body.elementId;
  const text = body.text;
  const author = body.author;
  const replyTo = body.replyTo;

  if (typeof slug !== "string" || !/^[A-Za-z0-9._-]+$/.test(slug)) {
    return Response.json({ error: "Bad or missing slug." }, { status: 400 });
  }
  if (typeof elementId !== "string" || !elementId) {
    return Response.json({ error: "Bad or missing element." }, { status: 400 });
  }
  if (typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "The note is empty." }, { status: 400 });
  }

  const note = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: typeof author === "string" && author ? author : "SME",
    text: text.trim(),
    ts: new Date().toISOString(),
    ...(typeof replyTo === "string" && replyTo ? { replyTo } : {}),
  };

  const path = join(process.cwd(), "wiki", "processes", slug, "notes.json");
  let notes: Record<string, unknown[]> = {};
  try {
    notes = JSON.parse(await readFile(path, "utf8"));
  } catch {
    // No notes.json yet — start fresh.
  }
  (notes[elementId] ??= []).push(note);

  try {
    await writeFile(path, `${JSON.stringify(notes, null, 2)}\n`);
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
  return Response.json({ ok: true, note });
}

// Toggle a comment's `resolved` flag — the SME marking a thread item handled
// (or reopening it). The comment-review skill sets the same flag via
// scripts/wiki/notes.py; this is the manual, in-app equivalent.
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const slug = body.slug;
  const elementId = body.elementId;
  const noteId = body.noteId;
  const resolved = body.resolved === true;

  if (typeof slug !== "string" || !/^[A-Za-z0-9._-]+$/.test(slug)) {
    return Response.json({ error: "Bad or missing slug." }, { status: 400 });
  }
  if (typeof elementId !== "string" || !elementId) {
    return Response.json({ error: "Bad or missing element." }, { status: 400 });
  }
  if (typeof noteId !== "string" || !noteId) {
    return Response.json({ error: "Bad or missing note." }, { status: 400 });
  }

  const path = join(process.cwd(), "wiki", "processes", slug, "notes.json");
  let notes: Record<string, Record<string, unknown>[]>;
  try {
    notes = JSON.parse(await readFile(path, "utf8"));
  } catch {
    return Response.json({ error: "No discussion thread." }, { status: 404 });
  }

  const note = (notes[elementId] ?? []).find((n) => n.id === noteId);
  if (!note) {
    return Response.json({ error: "No such note." }, { status: 404 });
  }
  if (resolved) note.resolved = true;
  else delete note.resolved;

  try {
    await writeFile(path, `${JSON.stringify(notes, null, 2)}\n`);
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}

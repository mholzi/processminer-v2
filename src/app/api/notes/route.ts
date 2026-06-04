import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";

// R6: the author of a write is the signed-in user, resolved from the session
// cookie — never a client-supplied value (which could forge authorship). Stores
// the stable username (R6b); display names are resolved at read time.
function sessionAuthor(req: NextRequest): string {
  return verifySession(req.cookies.get(COOKIE_NAME)?.value)?.username || "SME";
}

// Appends an SME note to the process JSON's `notes` map (wiki/processes/<slug>.json,
// keyed by element id). Notes are collaboration data, not process documentation:
// the app owns the SME-comment writes here. The thread is co-owned — the
// comment-review skill also writes notes (via the schema-enforced tools) to
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
    author: sessionAuthor(req),
    text: text.trim(),
    ts: new Date().toISOString(),
    ...(typeof replyTo === "string" && replyTo ? { replyTo } : {}),
  };

  const path = join(process.cwd(), "wiki", "processes", `${slug}.json`);
  let processData: any = {};
  try {
    processData = JSON.parse(await readFile(path, "utf8"));
  } catch (e) {
    return Response.json({ error: `Process not found: ${slug}` }, { status: 404 });
  }
  
  processData.notes ??= {};
  (processData.notes[elementId] ??= []).push(note);

  try {
    await writeFile(path, `${JSON.stringify(processData, null, 2)}\n`);
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
  return Response.json({ ok: true, note });
}

// Toggle a comment's `resolved` flag — the SME marking a thread item handled
// (or reopening it). The comment-review skill sets the same flag via the
// schema-enforced tools; this is the manual, in-app equivalent.
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

  const path = join(process.cwd(), "wiki", "processes", `${slug}.json`);
  let processData: any = {};
  try {
    processData = JSON.parse(await readFile(path, "utf8"));
  } catch (e) {
    return Response.json({ error: `Process not found: ${slug}` }, { status: 404 });
  }

  const notes = processData.notes;
  if (!notes || !notes[elementId]) {
    return Response.json({ error: "No discussion thread." }, { status: 404 });
  }

  const note = (notes[elementId] ?? []).find((n: any) => n.id === noteId);
  if (!note) {
    return Response.json({ error: "No such note." }, { status: 404 });
  }
  if (resolved) {
    note.resolved = true;
    note.resolvedBy = sessionAuthor(req);
    note.resolvedAt = new Date().toISOString().slice(0, 10);
  } else {
    delete note.resolved;
    delete note.resolvedBy;
    delete note.resolvedAt;
  }

  try {
    await writeFile(path, `${JSON.stringify(processData, null, 2)}\n`);
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}

import type { NextRequest } from "next/server";
import { isFeedbackCategory, isFeedbackStatus } from "@/lib/feedback";
import { updateFeedbackStatus, writeFeedback } from "@/lib/feedback-store";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";

// Read/write API for the app-feedback tree (feedback/ at the repo root). POST
// files a new feedback item as feedback/FB-NNN.md; PATCH changes an item's
// status. Plain filesystem writes — no skill, no AI. The tree is intentionally
// separate from wiki/: this is feedback on the tool itself. See
// src/lib/feedback-store.ts.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TITLE = 200;
const MAX_BODY = 8000;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const page = typeof body.page === "string" ? body.page.trim() : "";
  // R6: the feedback author/role come from the signed-in user (session cookie),
  // never the client-supplied body fields.
  const sessionUser = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  const author = sessionUser?.name ?? "";
  const role = sessionUser?.role ?? "";
  const category = body.category;

  if (!title) {
    return Response.json({ error: "A title is required." }, { status: 400 });
  }
  if (!text) {
    return Response.json({ error: "The feedback is empty." }, { status: 400 });
  }
  if (!isFeedbackCategory(category)) {
    return Response.json({ error: "Unknown category." }, { status: 400 });
  }
  if (title.length > MAX_TITLE || text.length > MAX_BODY) {
    return Response.json({ error: "Feedback is too long." }, { status: 400 });
  }

  try {
    const item = writeFeedback({
      title,
      category,
      body: text,
      page,
      author: author || "Anonymous",
      role,
    });
    return Response.json({ ok: true, item });
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status;

  if (!/^FB-\d+$/.test(id)) {
    return Response.json({ error: "Bad or missing id." }, { status: 400 });
  }
  if (!isFeedbackStatus(status)) {
    return Response.json({ error: "Unknown status." }, { status: 400 });
  }

  try {
    const item = updateFeedbackStatus(id, status);
    if (!item) {
      return Response.json({ error: "No such feedback." }, { status: 404 });
    }
    return Response.json({ ok: true, item });
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
}

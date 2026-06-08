import type { NextRequest } from "next/server";
import {
  type FeedbackContext,
  type FeedbackElementRef,
  FEEDBACK_CONTEXT_KEYS,
  isFeedbackCategory,
  isFeedbackStatus,
} from "@/lib/feedback";
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
const MAX_CONTEXT_FIELD = 600;
// A DOM-rendered PNG of a desktop viewport is typically 1–3MB as a base64 data
// URL; cap generously and reject anything larger.
const MAX_SCREENSHOT = 8_000_000;

// Keep only whitelisted FeedbackContext keys, coerced to capped strings. The
// context is client-supplied, so never trust its shape.
function sanitizeContext(raw: unknown): FeedbackContext | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const src = raw as Record<string, unknown>;
  const ctx: FeedbackContext = {};
  for (const k of FEEDBACK_CONTEXT_KEYS) {
    const v = src[k];
    if (typeof v === "string" && v.trim()) {
      ctx[k] = v.trim().slice(0, MAX_CONTEXT_FIELD);
    }
  }
  return Object.keys(ctx).length ? ctx : undefined;
}

// Validate a client-supplied element ref. The id must look like an element id
// (PREFIX-NNN); title/slug are capped strings.
function sanitizeElement(raw: unknown): FeedbackElementRef | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const src = raw as Record<string, unknown>;
  const id = typeof src.id === "string" ? src.id.trim() : "";
  // Element ids look like PS-004, PS-COB-001, ROLE-COB-002 — a letter, then
  // letters/digits/hyphens. Strict enough to keep out paths and junk.
  if (!/^[A-Za-z][A-Za-z0-9-]{1,40}$/.test(id)) return undefined;
  const title = typeof src.title === "string" ? src.title.trim().slice(0, 200) : undefined;
  const processSlug =
    typeof src.processSlug === "string" ? src.processSlug.trim().slice(0, 120) : undefined;
  return { id, title: title || undefined, processSlug: processSlug || undefined };
}

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
  const context = sanitizeContext(body.context);
  const element = sanitizeElement(body.element);
  const screenshot =
    typeof body.screenshot === "string" &&
    body.screenshot.startsWith("data:image/png;base64,")
      ? body.screenshot
      : undefined;

  if (screenshot && screenshot.length > MAX_SCREENSHOT) {
    return Response.json({ error: "Screenshot is too large." }, { status: 400 });
  }

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
      context,
      screenshotDataUrl: screenshot,
      element,
    });
    return Response.json({ ok: true, item });
  } catch (e) {
    console.error("[feedback] request failed:", e);
    return Response.json({ error: "Could not save." }, { status: 500 });
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
    console.error("[feedback] request failed:", e);
    return Response.json({ error: "Could not save." }, { status: 500 });
  }
}

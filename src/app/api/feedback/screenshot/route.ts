import { existsSync, readFileSync } from "node:fs";
import type { NextRequest } from "next/server";
import { feedbackScreenshotPath } from "@/lib/feedback-store";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";

// GET /api/feedback/screenshot?id=FB-NNN — stream a feedback item's attached
// screenshot (feedback/<id>.png). Signed-in only; feedback is internal to the
// team. The id is strictly validated so it can't escape the feedback/ dir.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifySession(req.cookies.get(COOKIE_NAME)?.value)) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^FB-\d+$/.test(id)) {
    return Response.json({ error: "Bad or missing id." }, { status: 400 });
  }
  const path = feedbackScreenshotPath(id);
  if (!existsSync(path)) {
    return Response.json({ error: "No screenshot." }, { status: 404 });
  }
  const bytes = readFileSync(path);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=300",
    },
  });
}

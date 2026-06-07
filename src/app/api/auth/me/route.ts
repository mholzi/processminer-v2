import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, redact, updateUser, verifySession } from "@/lib/auth-server";

// GET /api/auth/me — returns the current user (redacted) or 401.
// PATCH /api/auth/me — allows the signed-in user to update their own
//   non-admin preferences (currently only whatsNewSeen).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ user: redact(user) });
}

export async function PATCH(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = (await req.json()) as { whatsNewSeen?: string };
  if (typeof body.whatsNewSeen !== "string") {
    return NextResponse.json({ error: "Invalid patch." }, { status: 400 });
  }
  const updated = updateUser(user.username, { whatsNewSeen: body.whatsNewSeen });
  return NextResponse.json({ user: redact(updated) });
}

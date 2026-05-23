import { NextResponse, type NextRequest } from "next/server";
import {
  AuthError,
  COOKIE_NAME,
  redact,
  updateUser,
  verifySession,
} from "@/lib/auth-server";

// PATCH /api/auth/profile { name?, role?, streamReplies? }
// Self-service profile update for the currently-signed-in user. Cannot
// touch isAdmin, entitlements, or username — those are admin-only.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const patch: Parameters<typeof updateUser>[1] = {};
  if (typeof b.name === "string") {
    const n = b.name.trim();
    if (!n) {
      return NextResponse.json({ error: "Display name cannot be empty." }, { status: 400 });
    }
    patch.name = n;
  }
  if (typeof b.role === "string") {
    const r = b.role.trim();
    if (!r) {
      return NextResponse.json({ error: "Role cannot be empty." }, { status: 400 });
    }
    patch.role = r;
  }
  if (typeof b.streamReplies === "boolean") {
    patch.streamReplies = b.streamReplies;
  }
  try {
    const updated = updateUser(user.username, patch);
    return NextResponse.json({ user: redact(updated) });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

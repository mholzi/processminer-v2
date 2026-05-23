import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import {
  AuthError,
  COOKIE_NAME,
  setPassword,
  verifySession,
} from "@/lib/auth-server";

// POST /api/auth/password { currentPassword, newPassword }
// Self-service password change. Requires a valid session AND a matching
// current password — distinct from the admin reset, which needs no current.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
  const b = body as { currentPassword?: unknown; newPassword?: unknown };
  const current = typeof b.currentPassword === "string" ? b.currentPassword : "";
  const next = typeof b.newPassword === "string" ? b.newPassword : "";
  if (!current || !next) {
    return NextResponse.json(
      { error: "Current and new password are required." },
      { status: 400 },
    );
  }
  if (!bcrypt.compareSync(current, user.passwordHash)) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 },
    );
  }
  try {
    setPassword(user.username, next);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

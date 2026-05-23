import { NextResponse, type NextRequest } from "next/server";
import {
  AuthError,
  COOKIE_NAME,
  redact,
  signSession,
  touchLastLogin,
  verifyPassword,
} from "@/lib/auth-server";
import { ownedSlugs } from "@/lib/process-access";

// POST /api/auth/login { username, password } → sets the session cookie
// and returns the redacted user object. Verifies the password with bcrypt;
// constant-time-ish thanks to the dummy compare on a missing username.

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const username =
    typeof body === "object" && body && "username" in body
      ? String((body as { username?: unknown }).username ?? "").trim()
      : "";
  const password =
    typeof body === "object" && body && "password" in body
      ? String((body as { password?: unknown }).password ?? "")
      : "";
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }
  try {
    const user = verifyPassword(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }
    touchLastLogin(user.username);
    const cookie = signSession(user.username);
    const res = NextResponse.json({
      user: { ...redact(user), ownsAnyProcess: ownedSlugs(user).length > 0 },
    });
    res.cookies.set(COOKIE_NAME, cookie, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      // Secure cookie when served over HTTPS — Next sets this implicitly in
      // production. Allowed insecure on localhost for dev.
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

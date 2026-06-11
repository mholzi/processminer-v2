import { NextResponse, type NextRequest } from "next/server";
import {
  AuthError,
  COOKIE_NAME,
  redact,
  signSession,
  touchLastLogin,
  verifyPassword,
} from "@/lib/auth-server";
import { rateLimit } from "@/lib/rate-limit";

// POST /api/auth/login { username, password } → sets the session cookie
// and returns the redacted user object. Verifies the password with bcrypt;
// constant-time-ish thanks to the dummy compare on a missing username.
//
// Brute-force defense (API-11): cap login attempts per client IP and per
// target username. The dummy bcrypt compare only addresses enumeration timing;
// without a rate limit, password guessing is unbounded.

export const runtime = "nodejs";

// Generous for a human mistyping; restrictive for an automated guesser.
const IP_LIMIT = 20;
const USER_LIMIT = 10;
const WINDOW_MS = 60_000;

/** Best-effort client IP. Behind a proxy this is the forwarded address; on bare
 *  localhost there's no header, so all dev traffic shares one bucket. */
function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

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

  // Rate-limit per IP and per target username. Either tripping → 429.
  const ip = clientIp(req);
  const byIp = rateLimit(`login:ip:${ip}`, IP_LIMIT, WINDOW_MS);
  const byUser = rateLimit(`login:user:${username.toLowerCase()}`, USER_LIMIT, WINDOW_MS);
  if (!byIp.allowed || !byUser.allowed) {
    const retry = Math.max(byIp.retryAfterSec, byUser.retryAfterSec);
    return NextResponse.json(
      { error: "Too many login attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(retry) } },
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
    const res = NextResponse.json({ user: redact(user) });
    const isSecure = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
    res.cookies.set(COOKIE_NAME, cookie, {
      httpOnly: true,
      // lax: allow cookie to be sent on top-level cross-site GET navigations
      // (like clicking the app from Coder dashboard), so the server component
      // can fetch user-specific documents on initial load.
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      // Secure cookie when served over HTTPS — Next sets this implicitly in
      // production. Allowed insecure on localhost for dev.
      secure: isSecure,
    });
    return res;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

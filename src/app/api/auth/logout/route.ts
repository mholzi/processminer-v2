import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth-server";

// POST /api/auth/logout — clears the session cookie. Safe to call when
// already logged out.

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}

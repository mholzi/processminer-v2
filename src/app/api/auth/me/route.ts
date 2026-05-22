import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, redact, verifySession } from "@/lib/auth-server";

// GET /api/auth/me — returns the current user (redacted) or 401. The client
// calls this on mount to hydrate the AuthGate.

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

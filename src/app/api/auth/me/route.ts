import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, redact, verifySession } from "@/lib/auth-server";
import { ownedSlugs } from "@/lib/process-access";

// GET /api/auth/me — returns the current user (redacted, augmented with
// ownsAnyProcess) or 401. The client calls this on mount to hydrate
// AuthGate; ownsAnyProcess drives whether the avatar menu offers the
// access-management link for non-admins.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({
    user: { ...redact(user), ownsAnyProcess: ownedSlugs(user).length > 0 },
  });
}

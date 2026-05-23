import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import {
  AccessError,
  canManageAccess,
  removeGrantee,
} from "@/lib/process-access";

// DELETE /api/processes/[slug]/grant/[username]
// Admin or the current owner: revoke a user's access to this process.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; username: string }> },
) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { slug, username } = await params;
  if (!canManageAccess(user, slug)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  try {
    const updated = removeGrantee(slug, username, user.username);
    return NextResponse.json({ process: updated });
  } catch (e) {
    if (e instanceof AccessError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import {
  AccessError,
  addGrantee,
  canManageAccess,
} from "@/lib/process-access";

// POST /api/processes/[slug]/grant { username }
// Admin or the current owner: grant a user access to this process.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { slug } = await params;
  if (!canManageAccess(user, slug)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
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
  if (!username) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }
  try {
    const updated = addGrantee(slug, username, user.username);
    return NextResponse.json({ process: updated });
  } catch (e) {
    if (e instanceof AccessError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

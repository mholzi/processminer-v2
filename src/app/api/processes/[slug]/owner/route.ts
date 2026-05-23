import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { AccessError, setOwner } from "@/lib/process-access";

// POST /api/processes/[slug]/owner { username }
// Admin-only: reassign the owner of a process.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { slug } = await params;
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
    const updated = setOwner(slug, username, user.username);
    return NextResponse.json({ process: updated });
  } catch (e) {
    if (e instanceof AccessError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

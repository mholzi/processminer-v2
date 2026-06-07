import { NextResponse, type NextRequest } from "next/server";
import {
  AuthError,
  findByUsername,
  setPassword,
} from "@/lib/auth-server";
import { requireAdmin } from "@/lib/route-guards";

// POST /api/admin/users/[username]/password { password }
// Admin-only password reset. There is no self-service reset flow (no email
// in scope) — admins are the only path back in for a locked-out user.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const r = requireAdmin(req);
  if (r instanceof Response) return r;
  const { username } = await params;
  if (!findByUsername(username)) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const password =
    typeof body === "object" && body && "password" in body
      ? String((body as { password?: unknown }).password ?? "")
      : "";
  try {
    setPassword(username, password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

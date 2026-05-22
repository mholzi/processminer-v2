import { NextResponse, type NextRequest } from "next/server";
import {
  AuthError,
  COOKIE_NAME,
  deleteUser,
  findByUsername,
  redact,
  updateUser,
  verifySession,
  type StoredUser,
} from "@/lib/auth-server";
import type { Entitlement } from "@/lib/user";

// /api/admin/users/[username]
//   PATCH  — update name / role / isAdmin / entitlements
//   DELETE — remove the user (guarded against the last admin)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAdmin(req: NextRequest): StoredUser | NextResponse {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const r = requireAdmin(req);
  if (r instanceof NextResponse) return r;
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
  const b = body as Record<string, unknown>;
  // Guardrail: an admin can't demote themselves to non-admin via PATCH
  // (would risk locking out the system if they're the last admin). If
  // they really want to step down, they can promote someone else then
  // ask that admin to demote them.
  if (
    r.username.toLowerCase() === username.toLowerCase() &&
    b.isAdmin === false
  ) {
    return NextResponse.json(
      { error: "Admins cannot demote themselves. Ask another admin." },
      { status: 400 },
    );
  }
  try {
    const ents = Array.isArray(b.entitlements)
      ? (b.entitlements.filter(
          (e): e is Entitlement => e === "pm" || e === "am",
        ) as Entitlement[])
      : undefined;
    const patch: Parameters<typeof updateUser>[1] = {};
    if (typeof b.name === "string") patch.name = b.name.trim();
    if (typeof b.role === "string") patch.role = b.role.trim();
    if (typeof b.isAdmin === "boolean") patch.isAdmin = b.isAdmin;
    if (ents !== undefined) patch.entitlements = ents;
    const updated = updateUser(username, patch);
    return NextResponse.json({ user: redact(updated) });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const r = requireAdmin(req);
  if (r instanceof NextResponse) return r;
  const { username } = await params;
  if (r.username.toLowerCase() === username.toLowerCase()) {
    return NextResponse.json(
      { error: "Admins cannot delete themselves." },
      { status: 400 },
    );
  }
  try {
    deleteUser(username);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import {
  AuthError,
  COOKIE_NAME,
  createUser,
  getUsers,
  redact,
  verifySession,
  type StoredUser,
} from "@/lib/auth-server";
import type { Entitlement } from "@/lib/user";

// /api/admin/users
//   GET  — list all users (admin only)
//   POST — create a new user (admin only)
// Auth: caller must be a logged-in admin. Non-admins get 403.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAdmin(req: NextRequest): StoredUser | NextResponse {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return user;
}

export async function GET(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof NextResponse) return r;
  return NextResponse.json({ users: getUsers().map(redact) });
}

export async function POST(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof NextResponse) return r;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  try {
    const ents = Array.isArray(b.entitlements)
      ? (b.entitlements.filter(
          (e): e is Entitlement => e === "pm" || e === "am",
        ) as Entitlement[])
      : undefined;
    const u = createUser(
      {
        username: String(b.username ?? ""),
        name: String(b.name ?? ""),
        role: String(b.role ?? ""),
        password: String(b.password ?? ""),
        isAdmin: b.isAdmin === true,
        entitlements: ents,
      },
      r.username,
    );
    return NextResponse.json({ user: redact(u) }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

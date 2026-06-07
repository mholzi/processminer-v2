import { NextResponse, type NextRequest } from "next/server";
import {
  AuthError,
  createUser,
  getUsers,
  redact,
} from "@/lib/auth-server";
import { requireAdmin } from "@/lib/route-guards";
import type { Entitlement } from "@/lib/user";

// /api/admin/users
//   GET  — list all users (admin only)
//   POST — create a new user (admin only)
// Auth: caller must be a logged-in admin. Non-admins get 403.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof Response) return r;
  return NextResponse.json({ users: getUsers().map(redact) });
}

export async function POST(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof Response) return r;
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

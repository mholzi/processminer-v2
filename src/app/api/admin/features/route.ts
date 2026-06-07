import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAME,
  verifySession,
  type StoredUser,
} from "@/lib/auth-server";
import { FEATURE_FLAGS, isFeatureFlagId } from "@/lib/feature-flags";
import { getResolvedFlags, setFeatureFlag } from "@/lib/feature-flags-store";

// /api/admin/features
//   GET   — the flag catalog + current resolved values (admin only)
//   PATCH — set one flag { id, enabled } (admin only)
// Auth: caller must be a logged-in admin. Non-admins get 403. The flags drive
// what the whole app renders, so writing them is an admin-only operation.

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
  return NextResponse.json({ defs: FEATURE_FLAGS, values: getResolvedFlags() });
}

export async function PATCH(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof NextResponse) return r;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  if (!isFeatureFlagId(b.id)) {
    return NextResponse.json({ error: "Unknown feature." }, { status: 400 });
  }
  if (typeof b.enabled !== "boolean") {
    return NextResponse.json(
      { error: "`enabled` must be true or false." },
      { status: 400 },
    );
  }
  const values = setFeatureFlag(b.id, b.enabled, r.username);
  return NextResponse.json({ values });
}

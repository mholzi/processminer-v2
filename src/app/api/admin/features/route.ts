import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/route-guards";
import { FEATURE_FLAGS, isFeatureFlagId } from "@/lib/feature-flags";
import { getResolvedFlags, setFeatureFlag } from "@/lib/feature-flags-store";

// /api/admin/features
//   GET   — the flag catalog + current resolved values (admin only)
//   PATCH — set one flag { id, enabled } (admin only)
// Auth: caller must be a logged-in admin. Non-admins get 403. The flags drive
// what the whole app renders, so writing them is an admin-only operation.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof Response) return r;
  return NextResponse.json({ defs: FEATURE_FLAGS, values: getResolvedFlags() });
}

export async function PATCH(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof Response) return r;
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

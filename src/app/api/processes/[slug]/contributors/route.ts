import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { canAccess } from "@/lib/process-access";
import { getContributorsReport } from "@/lib/contributors";
import { getProcess } from "@/lib/wiki";

// GET /api/processes/[slug]/contributors
// Returns the activity timeline + per-person rollups for one process.
// Access-gated: must be admin OR owner OR grantee.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { slug } = await params;
  if (!canAccess(user, slug)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const doc = getProcess(slug);
  if (!doc) {
    return NextResponse.json({ error: "Process not found." }, { status: 404 });
  }
  const report = getContributorsReport(doc);
  return NextResponse.json(report);
}

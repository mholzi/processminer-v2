import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { getAllAccess } from "@/lib/process-access";
import { listProcesses } from "@/lib/wiki";

// GET /api/processes — list every tracked process with its access record.
// Admins see all rows. Non-admins see only processes they own (so the
// owner-side UI in AdminScreen renders only their subset). Grantees see
// nothing here — they can open the process but not manage access.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  // Title + ID come from the wiki side, joined in for the UI.
  const meta = new Map(listProcesses().map((p) => [p.slug, p.title]));
  const rows = getAllAccess()
    .filter((r) => user.isAdmin || r.owner === user.username)
    .map((r) => ({ ...r, title: meta.get(r.slug) ?? r.slug }));
  return NextResponse.json({ processes: rows });
}

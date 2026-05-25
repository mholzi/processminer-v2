import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, getUsers, verifySession } from "@/lib/auth-server";

// GET /api/users/roster — returns { roster: { username: name } } for every
// user in data/users.json. Client components use this to resolve stored
// usernames (the stable user ID written into wiki frontmatter and JSON
// sidecars) back to display names at render time, so a rename in
// data/users.json propagates automatically without any wiki rewrite.
//
// Authenticated callers only. Returns username → name; no roles, no emails,
// no metadata. Internal tool — every signed-in user can see every other
// user's display name (already true via the existing collaboration UI).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const roster: Record<string, string> = {};
  for (const u of getUsers()) {
    roster[u.username] = u.name || u.username;
  }
  return NextResponse.json({ roster });
}

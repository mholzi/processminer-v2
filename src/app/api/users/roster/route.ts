import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession, getUsers } from "@/lib/auth-server";

// GET /api/users/roster — username + display name for every user. Any signed-in
// user may read it (it powers the access grant picker + display-name resolution).
// No sensitive fields are returned.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  const users = getUsers().map((u) => ({ username: u.username, name: u.name }));
  return Response.json({ users });
}

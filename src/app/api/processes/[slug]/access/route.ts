import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, verifySession, getUsers } from "@/lib/auth-server";
import {
  getAccess,
  setOwner,
  grant,
  revoke,
  ungovern,
} from "@/lib/process-access";

// Per-process access (R16).
//   GET   — the access state (owner + grants, with display names).
//   POST  — { action: "set-owner" | "ungovern" | "grant" | "revoke", username? }
//           set-owner / ungovern: admin only.
//           grant / revoke:       admin or the current owner.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const names = () => new Map(getUsers().map((u) => [u.username, u.name]));
const person = (username: string, m: Map<string, string>) => ({
  username,
  name: m.get(username) ?? username,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const user = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!user) return Response.json({ error: "Not signed in." }, { status: 401 });

  const a = getAccess(slug);
  const m = names();
  return Response.json({
    governed: !!a,
    owner: a ? person(a.owner, m) : null,
    grants: a ? a.grants.map((g) => person(g, m)) : [],
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const user = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!user) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = body.action;
  const username = typeof body.username === "string" ? body.username : "";
  const isAdmin = !!user.isAdmin;
  const isOwner = getAccess(slug)?.owner === user.username;

  switch (action) {
    case "set-owner":
      if (!isAdmin)
        return Response.json({ error: "Admins only." }, { status: 403 });
      if (!username)
        return Response.json({ error: "No user given." }, { status: 400 });
      setOwner(slug, username);
      break;
    case "ungovern":
      if (!isAdmin)
        return Response.json({ error: "Admins only." }, { status: 403 });
      ungovern(slug);
      break;
    case "grant":
      if (!isAdmin && !isOwner)
        return Response.json({ error: "Owner or admin only." }, { status: 403 });
      if (!username)
        return Response.json({ error: "No user given." }, { status: 400 });
      grant(slug, username);
      break;
    case "revoke":
      if (!isAdmin && !isOwner)
        return Response.json({ error: "Owner or admin only." }, { status: 403 });
      revoke(slug, username);
      break;
    default:
      return Response.json({ error: "Unknown action." }, { status: 400 });
  }

  revalidatePath("/");
  return Response.json({ ok: true });
}

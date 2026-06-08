import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/route-guards";
import { toggleVote, voteCountOf } from "@/lib/whatsnew-store";

// POST /api/whatsnew/vote { id }
// Toggle the signed-in user's vote on a roadmap (What's New) entry. Any
// authenticated user may vote; the per-user dedup lives in the store
// (`votedBy`). Returns the derived count + whether the caller now votes for it
// — never the raw voter list.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = requireUser(req);
  if (user instanceof Response) return user;

  let body: { id?: unknown };
  try {
    body = (await req.json()) as { id?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.id !== "string" || !body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const entry = toggleVote(body.id, user.username);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }
  return NextResponse.json({
    id: entry.id,
    voteCount: voteCountOf(entry),
    youVoted: (entry.votedBy ?? []).includes(user.username),
  });
}

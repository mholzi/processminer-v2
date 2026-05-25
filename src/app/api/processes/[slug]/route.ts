import { NextResponse, type NextRequest } from "next/server";
import { rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import {
  canAccess,
  canManageAccess,
  getAccess,
  removeAccess,
} from "@/lib/process-access";

// DELETE /api/processes/[slug] — permanently removes a process.
//
// Wipes the wiki layer (wiki/processes/<slug>/), the source-document layer
// (raw-sources/<slug>/), and the access record (data/process-access.json
// entry). This is the destructive action the per-process Settings panel's
// "Danger zone" wires up. No soft-delete: once it's gone, it's gone — `git`
// is the only recovery path.
//
// Auth: signed in + admin OR current owner (canManageAccess). The Settings
// panel itself is owner-/admin-only on the client; this is the server-side
// enforcement.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

// GET /api/processes/[slug] — return the access record (owner, grantees,
// can-manage flag) for the per-process Settings panel. Access-gated to
// users who can already open the process; the can-manage flag tells the
// client whether to expose the Danger Zone.
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
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Bad slug." }, { status: 400 });
  }
  if (!canAccess(user, slug)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const record = getAccess(slug);
  return NextResponse.json({
    slug,
    owner: record?.owner ?? "",
    grantees: record?.grantees ?? [],
    canManage: canManageAccess(user, slug),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Bad slug." }, { status: 400 });
  }
  if (!canManageAccess(user, slug)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const wikiPath = join(process.cwd(), "wiki", "processes", slug);
  const sourcesPath = join(process.cwd(), "raw-sources", slug);

  if (!existsSync(wikiPath) && !existsSync(sourcesPath)) {
    // Idempotent: nothing left to delete on disk, but still clear the
    // access record in case a stale entry survived an earlier partial run.
    removeAccess(slug);
    return NextResponse.json({ ok: true, alreadyGone: true });
  }

  try {
    await rm(wikiPath, { recursive: true, force: true });
    await rm(sourcesPath, { recursive: true, force: true });
    removeAccess(slug);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: `Could not delete: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
}

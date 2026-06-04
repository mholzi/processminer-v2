import { existsSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { ungovern } from "@/lib/process-access";

// DELETE /api/processes/<slug> — permanently remove a process. Admin-only.
// Removes everything the process owns: the wiki JSON, its immutable source
// documents, its runtime state, and any chat sessions pointing at it.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!/^[A-Za-z0-9._-]+$/.test(slug)) {
    return Response.json({ error: "Bad slug." }, { status: 400 });
  }

  const user = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!user.isAdmin) {
    return Response.json(
      { error: "Only an admin can delete a process." },
      { status: 403 },
    );
  }

  const root = process.cwd();
  const wikiFile = join(root, "wiki", "processes", `${slug}.json`);
  if (!existsSync(wikiFile)) {
    return Response.json({ error: `Process not found: ${slug}` }, { status: 404 });
  }

  try {
    rmSync(wikiFile, { force: true }); // the process document (wiki layer 2)
    rmSync(join(root, "raw-sources", slug), { recursive: true, force: true }); // sources (layer 1)
    rmSync(join(root, "data", "runtime", `${slug}.json`), { force: true }); // runtime state (R9)
    ungovern(slug); // access record (R16)

    // Drop any chat sessions that point at the deleted slug. Entries are either
    // a bare slug string (legacy) or { slug, activeSkill }.
    const sessionsPath = join(root, "wiki", "processes", ".sessions.json");
    if (existsSync(sessionsPath)) {
      const map = JSON.parse(readFileSync(sessionsPath, "utf8")) as Record<string, unknown>;
      let changed = false;
      for (const [sid, v] of Object.entries(map)) {
        const s = typeof v === "string" ? v : (v as { slug?: string })?.slug;
        if (s === slug) {
          delete map[sid];
          changed = true;
        }
      }
      if (changed) {
        writeFileSync(sessionsPath, JSON.stringify(map, null, 2) + "\n", "utf8");
      }
    }
  } catch (e) {
    return Response.json(
      { error: `Could not delete: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }

  revalidatePath("/");
  return Response.json({ ok: true });
}

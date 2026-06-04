import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { getRuntime, writeRuntime } from "@/lib/runtime-store";

// R6: the author of a dismissal is the signed-in user, resolved from the
// session cookie — never a client-supplied value. Stores the stable username
// (R6b); display names are resolved at read time.
function sessionAuthor(req: NextRequest): string {
  return verifySession(req.cookies.get(COOKIE_NAME)?.value)?.username || "SME";
}

// Records a lint-finding dismissal in the runtime store
// (data/runtime/<slug>.json, R9) — app-owned, keyed by a content signature.
// The lint report itself is skill-owned and rewritten from scratch each
// run-lint pass (finding ids re-number), so a durable dismissal cannot live
// there. The app re-applies these dismissals whenever it loads a lint report
// (see wiki.ts / runtime-store.ts), so a dismissal — or a snooze — survives a
// re-lint.
//
//   action "dismiss"  — set aside, with a reason; optional `days` snoozes it
//   action "restore"  — drop the dismissal, the finding returns to the list

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isoDate(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const slug = body.slug;
  const signature = body.signature;
  const action = body.action === "restore" ? "restore" : "dismiss";

  if (typeof slug !== "string" || !/^[A-Za-z0-9._-]+$/.test(slug)) {
    return Response.json({ error: "Bad or missing slug." }, { status: 400 });
  }
  if (typeof signature !== "string" || !signature) {
    return Response.json({ error: "Bad or missing finding." }, { status: 400 });
  }

  let reason = "";
  if (action === "dismiss") {
    if (typeof body.reason !== "string" || !body.reason.trim()) {
      return Response.json(
        { error: "A dismissal reason is required." },
        { status: 400 },
      );
    }
    reason = body.reason.trim();
  }

  const wikiPath = join(process.cwd(), "wiki", "processes", `${slug}.json`);
  if (!existsSync(wikiPath)) {
    return Response.json({ error: `Process not found: ${slug}` }, { status: 404 });
  }

  // R9: dismissals are runtime state — stored above the wiki, not in the
  // process JSON.
  const dismissals = getRuntime(slug).findingDismissals ?? {};

  if (action === "restore") {
    delete dismissals[signature];
  } else {
    const days =
      typeof body.days === "number" && body.days > 0
        ? Math.round(body.days)
        : 0;
    dismissals[signature] = {
      reason,
      by: sessionAuthor(req),
      at: isoDate(),
      ...(days > 0 ? { until: isoDate(days) } : {}),
    };
  }

  try {
    writeRuntime(slug, { findingDismissals: dismissals });
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}

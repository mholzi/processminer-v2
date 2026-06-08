import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { setDtpDisposition } from "@/lib/runtime-store";
import type { DtpDisposition } from "@/lib/runtime-store";
import { isValidSlug, requireAccess } from "@/lib/route-guards";

// Sets a reviewer's disposition on one DTP-review finding (the DTP Enhancer's
// review workflow). The dispositions are app-owned runtime state — they live
// with the findings in data/runtime/<slug>.json (R9), never the wiki JSON.
//
// Disposition is the reviewer's call on a finding, not an authored claim, so it
// goes through this small route rather than a schema-enforced session tool.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISPOSITIONS = new Set<DtpDisposition>(["open", "accepted", "dismissed"]);

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { slug, runId, findingId, disposition } = body;

  if (!isValidSlug(slug)) {
    return Response.json({ error: "Bad or missing slug." }, { status: 400 });
  }
  if (typeof runId !== "string" || !runId) {
    return Response.json({ error: "Bad or missing runId." }, { status: 400 });
  }
  if (typeof findingId !== "string" || !findingId) {
    return Response.json({ error: "Bad or missing findingId." }, { status: 400 });
  }
  if (
    typeof disposition !== "string" ||
    !DISPOSITIONS.has(disposition as DtpDisposition)
  ) {
    return Response.json({ error: "Bad or missing disposition." }, { status: 400 });
  }

  // R16: a disposition is a per-process review action — require access.
  const guard = requireAccess(req, slug);
  if (guard instanceof Response) return guard;

  const wikiPath = join(process.cwd(), "wiki", "processes", `${slug}.json`);
  if (!existsSync(wikiPath)) {
    return Response.json({ error: `Process not found: ${slug}` }, { status: 404 });
  }

  try {
    const ok = setDtpDisposition(
      slug,
      runId,
      findingId,
      disposition as DtpDisposition,
    );
    if (!ok) {
      return Response.json(
        { error: "Run or finding not found." },
        { status: 404 },
      );
    }
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}

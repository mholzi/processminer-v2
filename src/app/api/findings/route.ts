import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { NextRequest } from "next/server";

// Marks a lint finding dismissed in wiki/processes/<slug>/lint.json — the app
// lets an SME set aside a finding judged not worth acting on, with a recorded
// reason. lint.json is otherwise written by the run-lint skill; a re-lint pass
// rewrites it from scratch, so a dismissal holds only until the next run.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const slug = body.slug;
  const findingId = body.findingId;
  const reason = body.reason;
  const by = body.by;

  if (typeof slug !== "string" || !/^[A-Za-z0-9._-]+$/.test(slug)) {
    return Response.json({ error: "Bad or missing slug." }, { status: 400 });
  }
  if (typeof findingId !== "string" || !findingId) {
    return Response.json({ error: "Bad or missing finding." }, { status: 400 });
  }
  if (typeof reason !== "string" || !reason.trim()) {
    return Response.json(
      { error: "A dismissal reason is required." },
      { status: 400 },
    );
  }

  const path = join(process.cwd(), "wiki", "processes", slug, "lint.json");
  let report: { findings?: Record<string, unknown>[] };
  try {
    report = JSON.parse(await readFile(path, "utf8"));
  } catch {
    return Response.json({ error: "No lint report for this process." }, {
      status: 404,
    });
  }

  const finding = (report.findings ?? []).find((f) => f.id === findingId);
  if (!finding) {
    return Response.json({ error: "No such finding." }, { status: 404 });
  }

  finding.status = "dismissed";
  finding.dismissedBy =
    typeof by === "string" && by ? by : "SME";
  finding.dismissedAt = new Date().toISOString().slice(0, 10);
  finding.dismissReason = reason.trim();

  try {
    await writeFile(path, `${JSON.stringify(report, null, 2)}\n`);
  } catch (e) {
    return Response.json(
      { error: `Could not save: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}

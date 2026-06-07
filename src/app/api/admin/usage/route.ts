import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/route-guards";
import { listProcesses } from "@/lib/wiki";
import { getRuntime } from "@/lib/runtime-store";
import { aggregateUsage } from "@/lib/token-usage";

// /api/admin/usage
//   GET — LLM token usage across every process, rolled up per skill + a grand
//   total, plus a per-process breakdown. Admin only.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard instanceof Response) return guard;

  const overview = aggregateUsage(
    listProcesses().map((p) => ({
      slug: p.slug,
      title: p.title,
      usage: getRuntime(p.slug).skillUsage ?? null,
    })),
  );
  return NextResponse.json(overview);
}

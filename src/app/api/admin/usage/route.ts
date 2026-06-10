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

  const list = listProcesses().map((p) => ({
    slug: p.slug,
    title: p.title,
    usage: getRuntime(p.slug).skillUsage ?? null,
  }));

  const advisoryUsage = getRuntime("_advisory_").skillUsage;
  if (advisoryUsage) {
    list.push({
      slug: "_advisory_",
      title: "Advisory Board / Cross-Process",
      usage: advisoryUsage,
    });
  }

  const newProcessUsage = getRuntime("_new_").skillUsage;
  if (newProcessUsage) {
    list.push({
      slug: "_new_",
      title: "New Process Creation (Unscoped)",
      usage: newProcessUsage,
    });
  }

  const overview = aggregateUsage(list);
  return NextResponse.json(overview);
}

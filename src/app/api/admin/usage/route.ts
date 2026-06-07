import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { listProcesses } from "@/lib/wiki";
import { getRuntime } from "@/lib/runtime-store";
import { aggregateUsage } from "@/lib/token-usage";

// /api/admin/usage
//   GET — LLM token usage across every process, rolled up per skill + a grand
//   total, plus a per-process breakdown. Admin only.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const overview = aggregateUsage(
    listProcesses().map((p) => ({
      slug: p.slug,
      title: p.title,
      usage: getRuntime(p.slug).skillUsage ?? null,
    })),
  );
  return NextResponse.json(overview);
}

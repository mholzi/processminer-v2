import { notFound } from "next/navigation";
import { getProcess, getSchema } from "@/lib/wiki";
import PrintDocument, { type PrintScope } from "./PrintDocument";

// The export route reads the live wiki on every request, like the main app.
export const dynamic = "force-dynamic";

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const doc = getProcess(slug);
  if (!doc) notFound();
  const schema = getSchema();

  // Resolve the scope from the URL — defaults: every area, all elements,
  // executive summaries on, glossary off.
  const allAreaIds = schema.areas.map((a) => a.id);
  const areasParam = one(sp.areas);
  const requested = areasParam
    ? areasParam.split(",").map((s) => s.trim())
    : allAreaIds;
  const areaIds = allAreaIds.filter((id) => requested.includes(id));

  const statusParam = one(sp.status);
  const status: PrintScope["status"] =
    statusParam === "approved" || statusParam === "draft"
      ? statusParam
      : "all";

  const scope: PrintScope = {
    areaIds: areaIds.length > 0 ? areaIds : allAreaIds,
    status,
    summaries: one(sp.summaries) !== "0",
    glossary: one(sp.glossary) === "1",
    flow: one(sp.flow) === "1",
    raci: one(sp.raci) === "1",
    by: one(sp.by) ?? "",
  };

  return <PrintDocument doc={doc} schema={schema} scope={scope} />;
}

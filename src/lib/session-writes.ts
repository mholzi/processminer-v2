// Pure builders for the two non-element root fields an AI session writes:
// the council-review result (`targetReview`) and an area's executive memo
// (`summaries[area]`). No I/O and no Next deps, so both the MCP server
// (claude-mcp-server.ts) and the in-process Gemini worker (gemini-worker.ts)
// can call them and then writeFileSync the process JSON themselves — mirroring
// how applyLint is implemented in both.

import type { TargetReview } from "./target-review.ts";
import type { IngestReport } from "./wiki.ts";

/** The four headings an area-summary memo must carry, in order. */
export const SUMMARY_HEADINGS = [
  "Introduction",
  "Current state",
  "What stands out",
  "Recommendation",
] as const;

/**
 * Build the full council-review object from the skill's payload: id-stamp each
 * item (R-001…) and mark every item `triage: pending`. The tool owns the format;
 * the skill owns the judgement.
 */
export function buildTargetReview(
  slug: string,
  reviewData: { ran?: string[]; items?: unknown[] } | null | undefined,
): TargetReview {
  const ran = Array.isArray(reviewData?.ran) ? (reviewData!.ran as string[]) : [];
  const rawItems = Array.isArray(reviewData?.items) ? reviewData!.items : [];
  const items = (rawItems as Array<Record<string, unknown>>).map((it, i) => ({
    id: `R-${String(i + 1).padStart(3, "0")}`,
    specialist: it.specialist as TargetReview["items"][number]["specialist"],
    title: String(it.title ?? ""),
    detail: String(it.detail ?? ""),
    targets: Array.isArray(it.targets) ? (it.targets as string[]) : [],
    triage: "pending" as const,
  }));
  return {
    generatedAt: new Date().toISOString(),
    slug,
    ran: ran as TargetReview["ran"],
    items,
  };
}

/**
 * Split an area-summary memo into its `## Heading` parts. The memo must carry
 * exactly the four headings (Introduction / Current state / What stands out /
 * Recommendation); throws a corrective message otherwise so the skill can retry.
 */
export function parseSummaryParts(
  summary: string,
): { heading: string; text: string }[] {
  if (!/^## /m.test(summary || "")) {
    throw new Error(
      `The summary must use \`## Heading\` sections: ${SUMMARY_HEADINGS.join(", ")}.`,
    );
  }
  const parts = summary
    .split(/^## /m)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const nl = p.indexOf("\n");
      return nl === -1
        ? { heading: p.trim(), text: "" }
        : { heading: p.slice(0, nl).trim(), text: p.slice(nl + 1).trim() };
    });
  if (parts.length !== SUMMARY_HEADINGS.length) {
    throw new Error(
      `Expected exactly ${SUMMARY_HEADINGS.length} headings (${SUMMARY_HEADINGS.join(
        ", ",
      )}); found ${parts.length}.`,
    );
  }
  return parts;
}

/**
 * Build the document-ingest result (`doc.ingest`) from the skill's payload —
 * the file ingested, the created/updated element ids, and the `conflicts` /
 * `corrections` the SME triages in the app. Normalises every array (a missing
 * one becomes `[]`) and stamps `generatedAt` + `slug` so the report can't come
 * out malformed. The triage screen (`TriagePanel`) reads this field.
 */
export function buildIngestReport(
  slug: string,
  report: Record<string, unknown> | null | undefined,
): IngestReport {
  const r = report ?? {};
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  return {
    generatedAt: new Date().toISOString(),
    slug,
    file: typeof r.file === "string" ? r.file : "",
    created: arr(r.created) as string[],
    updated: arr(r.updated) as string[],
    conflicts: arr(r.conflicts) as IngestReport["conflicts"],
    corrections: arr(r.corrections) as IngestReport["corrections"],
  };
}

/**
 * Empty the `conflicts` array on an ingest report once the SME has resolved
 * every conflict (the conflict-resolution skill's close-out), so the triage
 * screen stops flagging them. Returns whether there was anything to clear.
 * Mutates `doc.ingest` in place; a no-op when no ingest report exists.
 */
export function clearIngestConflicts(doc: any): { cleared: number } {
  const before = Array.isArray(doc?.ingest?.conflicts)
    ? doc.ingest.conflicts.length
    : 0;
  if (doc?.ingest && Array.isArray(doc.ingest.conflicts)) {
    doc.ingest.conflicts = [];
  }
  return { cleared: before };
}

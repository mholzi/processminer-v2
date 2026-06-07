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

/** The approval states an element can be in (mirrors wiki-write's APPROVAL_VALUES). */
export const APPROVAL_VALUES = ["in-progress", "approved", "rejected"] as const;

/**
 * Build the `meta` patch that sets an element's approval — the AI-session
 * equivalent of the in-app `setApproval` server action. The provider passes the
 * result to `updateElement`, which **enforces the approval gate** (refuses
 * `approved` while any heading is `proposed`/`web`). The approver is the SME
 * name from the session context (the in-app action derives it from the cookie;
 * a headless session has none, so the skill supplies it). Throws on an invalid
 * approval value so the skill gets a corrective message.
 */
export function buildApprovalPatch(
  approval: string,
  approver: string | undefined,
  date: string,
): { meta: { approval: string; approvalBy: string; approvalDate: string } } {
  if (!(APPROVAL_VALUES as readonly string[]).includes(approval)) {
    throw new Error(
      `Invalid approval value: ${approval} (expected one of ${APPROVAL_VALUES.join(", ")}).`,
    );
  }
  return {
    meta: { approval, approvalBy: approver?.trim() || "SME", approvalDate: date },
  };
}

/**
 * Build an approval patch that ALSO reconciles confirmed provenance in the same
 * write (foundational-run [Y]). `reconcile` maps a heading title to the SME's
 * confirming quote; each named heading flips to `source: "elicited"` with that
 * evidence, deep-merged over the element's existing provenance (so the
 * `document` headings are preserved). This collapses the rewrite-then-approve
 * pair into one call and removes the most common [Y] failure — approving before
 * reconciling, which the approval gate rejects. Pass the element so the merge
 * starts from its real provenance map.
 */
export function buildReconciledApprovalPatch(
  element: { meta?: { provenance?: Record<string, { source: string; evidence: string }> } } | null | undefined,
  approval: string,
  approver: string | undefined,
  date: string,
  reconcile: Record<string, string> | null | undefined,
): { meta: Record<string, unknown> } {
  const base = buildApprovalPatch(approval, approver, date);
  if (!reconcile || Object.keys(reconcile).length === 0) return base;
  const existing = element?.meta?.provenance ?? {};
  const merged: Record<string, { source: string; evidence: string }> = { ...existing };
  for (const [heading, evidence] of Object.entries(reconcile)) {
    merged[heading] = { source: "elicited", evidence: String(evidence ?? "") };
  }
  return { meta: { ...base.meta, provenance: merged } };
}

/**
 * Relation-list field name → the collection (section) whose ids belong in it.
 * Used by `syncRelationsFromProse` to add only ids of the correct type.
 */
const RELATION_FIELD_SECTIONS: Record<string, string> = {
  systems: "systems",
  roles: "roles",
  controls: "controls",
  integrations: "integrations",
  exceptions: "exceptions",
  regulatedBy: "regulation",
  regulations: "regulation",
};

const ELEMENT_ID_RE = /\b[A-Z]{1,5}-[A-Z0-9]+-\d+\b/g;

/**
 * Frontmatter-sync on an [E] edit (opt-in): when reworked prose names an element
 * id (e.g. a `SYS-*`) that isn't already in the matching relation list, add it —
 * deriving the relation list from the prose instead of letting prose/frontmatter
 * drift (which lint later flags). Conservative by design: only adds an id that
 * (1) appears in the element's prose, (2) actually exists in the doc, (3) belongs
 * to the section the relation-list field maps to, and (4) isn't already listed.
 * Returns a `content` patch of the *full* updated arrays (empty when nothing to
 * add), plus the additions for an echo line.
 */
export function syncRelationsFromProse(
  element: { content?: Record<string, unknown> } | null | undefined,
  doc: any,
): { content: Record<string, string[]>; added: Record<string, string[]> } {
  const content = element?.content ?? {};
  // The element's prose: every string field that isn't itself a relation list.
  const proseText = Object.entries(content)
    .filter(([k, v]) => typeof v === "string" && !(k in RELATION_FIELD_SECTIONS))
    .map(([, v]) => v as string)
    .join("\n");
  const namedIds = new Set(proseText.match(ELEMENT_ID_RE) ?? []);
  if (namedIds.size === 0) return { content: {}, added: {} };

  // Index doc ids by section so we only add ids of the right type that exist.
  const idsBySection: Record<string, Set<string>> = {};
  for (const [section, list] of Object.entries(doc ?? {})) {
    if (!Array.isArray(list)) continue;
    const set = new Set<string>();
    for (const el of list) {
      const id = el?.meta?.id;
      if (typeof id === "string" && id) set.add(id);
    }
    idsBySection[section] = set;
  }

  const contentPatch: Record<string, string[]> = {};
  const added: Record<string, string[]> = {};
  for (const [field, section] of Object.entries(RELATION_FIELD_SECTIONS)) {
    if (!Array.isArray(content[field])) continue; // element doesn't carry this list
    const existing = content[field] as string[];
    const existingSet = new Set(existing);
    const valid = idsBySection[section] ?? new Set<string>();
    const toAdd: string[] = [];
    for (const id of namedIds) {
      if (valid.has(id) && !existingSet.has(id)) toAdd.push(id);
    }
    if (toAdd.length) {
      contentPatch[field] = [...existing, ...toAdd];
      added[field] = toAdd;
    }
  }
  return { content: contentPatch, added };
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

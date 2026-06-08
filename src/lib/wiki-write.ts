"use server";

import { readFileSync, existsSync } from "node:fs";
import { atomicWriteFileSync } from "./atomic-write.ts";
import { join } from "node:path";
import { getSchema, jsonElementToWikiPage, toCamelCase } from "./wiki.ts";
import { checkElement, checkFrontmatter, checkFieldValues, checkProvenance, unconfirmedHeadings } from "./conformance.ts";
import { stripRuntimeState } from "./process-doc-hygiene.ts";

/** A1 approval gate — an element may not be set to `approved` while any heading
 *  is still `proposed`/`web` (unconfirmed by the SME). HALLUCINATION-PLAN.md. */
function approvalGateError(id: string, provenance: any): string | null {
  const unconfirmed = unconfirmedHeadings(provenance);
  if (unconfirmed.length === 0) return null;
  return `Cannot approve ${id} — these headings are not yet confirmed by the SME (still proposed/web): ${unconfirmed.join(", ")}. Confirm them in the read-back first.`;
}

/** Thrown when an in-app (browser-originated) write is not authenticated or the
 *  signed-in user lacks access to the target process. `updateElement` converts
 *  it to an `{ ok: false, error }` result; the other actions let it propagate
 *  (they already throw on failure). The message is safe to surface. */
class WriteDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WriteDeniedError";
  }
}

/** R6 / R16 — resolve and authorize the author of a write.
 *
 *  Two callers reach this module, distinguished by request context:
 *
 *  - **In-app SME writes** are React server actions invoked over HTTP from the
 *    browser. They always run inside a Next request context, so `cookies()`
 *    resolves (even when the cookie itself is absent). For these we REQUIRE a
 *    valid session and that the user may access `slug` — otherwise the write is
 *    denied. This closes the gap where a forged server-action call (or a
 *    logged-in user reaching a process they can't see) could mutate the wiki.
 *
 *  - **AI authoring** calls `updateElement` in-process from the headless worker
 *    (claude-mcp-server / gemini-worker), which has no request context, so
 *    `cookies()` throws. The worker's trust boundary is `/api/session` (now
 *    authenticated); here it proceeds as the system author "SME".
 *
 *  Never trust a client-supplied author string — the stable `username` is
 *  resolved from the signed session cookie server-side (display names are
 *  resolved at read time, R6b, so renames propagate). The reliance on
 *  `cookies()` throwing outside a request context is the same assumption the
 *  rest of this module already makes for its dynamic imports. */
async function resolveWriter(slug: string): Promise<string> {
  let store: Awaited<ReturnType<typeof import("next/headers")["cookies"]>>;
  try {
    const { cookies } = await import("next/headers");
    store = await cookies();
  } catch (err) {
    // ONLY a genuine "no request context" error means this is the in-process/
    // headless AI worker (trusted via /api/session) → system author. Any other
    // failure must NOT silently grant trusted access — fail closed so a browser
    // write can never bypass the auth/ACL check below (LIB-10).
    const { isNoRequestContextError } = await import("./request-scope.ts");
    if (isNoRequestContextError(err)) return "SME";
    throw err;
  }
  // Browser-originated server action: authentication + authorization required.
  const { COOKIE_NAME, verifySession } = await import("./auth-server.ts");
  const user = verifySession(store.get(COOKIE_NAME)?.value);
  if (!user) throw new WriteDeniedError("Not signed in.");
  const { canAccess } = await import("./process-access.ts");
  if (!canAccess(user, slug)) {
    throw new WriteDeniedError("You don't have access to this process.");
  }
  return user.username;
}

// Best-effort cache invalidation. Defaults to a no-op, then swaps in the real
// `next/cache` helper once it loads. The swapped-in version swallows the
// "static generation store missing" invariant that `revalidatePath` throws when
// called outside a request context (the in-process AI worker and unit tests) —
// there is no router cache to revalidate there, so it is safe to skip.
let revalidatePath = (path: string) => {};
import("next/cache")
  .then((m) => {
    revalidatePath = (p: string) => {
      try {
        m.revalidatePath(p);
      } catch {
        /* outside request scope (worker / tests) — nothing to revalidate */
      }
    };
  })
  .catch(() => {});

const WIKI_DIR = join(process.cwd(), "wiki", "processes");

export async function updateElement(
  slug: string,
  id: string,
  patch: { meta?: any; content?: any }
): Promise<{ ok: boolean; element?: any; error?: string }> {
  const schema = getSchema();
  const filePath = join(WIKI_DIR, `${slug}.json`);
  if (!existsSync(filePath)) {
    return { ok: false, error: `Process not found: ${slug}` };
  }

  // Authenticate + authorize the writer. In-app calls must be a signed-in user
  // with access to this process; the in-process AI worker resolves to "SME".
  let author: string;
  try {
    author = await resolveWriter(slug);
  } catch (e) {
    if (e instanceof WriteDeniedError) return { ok: false, error: e.message };
    throw e;
  }

  const doc = JSON.parse(readFileSync(filePath, "utf8"));
  
  if (doc.meta?.id === id) {
    if (patch.meta?.approval === "approved") {
      const gate = approvalGateError(id, doc.meta?.provenance);
      if (gate) return { ok: false, error: gate };
    }
    if (patch.meta) doc.meta = { ...doc.meta, ...patch.meta };
    if (patch.content) doc.content = { ...doc.content, ...patch.content };
    for (const [k, v] of Object.entries(patch)) {
      if (k !== "meta" && k !== "content") {
        doc[k] = v;
      }
    }
    // Editing the overview's content re-opens its approval (like an element).
    if (
      patch.content &&
      Object.keys(patch.content).length > 0 &&
      doc.meta?.approval === "approved"
    ) {
      doc.meta.approval = "in-progress";
      doc.meta.approvalBy = "";
      doc.meta.approvalDate = "";
    }
    atomicWriteFileSync(filePath, JSON.stringify(stripRuntimeState(doc), null, 2) + "\n");
    revalidatePath("/");
    return { ok: true, element: { meta: doc.meta, content: doc.content } };
  }

  let foundCollection = "";
  let foundIndex = -1;
  for (const [key, val] of Object.entries(doc)) {
    if (!Array.isArray(val)) continue;
    const idx = val.findIndex((el: any) => el.meta?.id === id);
    if (idx !== -1) {
      foundCollection = key;
      foundIndex = idx;
      break;
    }
  }
  if (foundIndex === -1) {
    return { ok: false, error: `Element ${id} not found in process document.` };
  }

  const existingElement = doc[foundCollection][foundIndex];
  const singularType = existingElement.meta?.type;

  const newMeta = {
    ...(existingElement.meta || {}),
    ...(patch.meta || {}),
    id,
    type: singularType,
    section: foundCollection
  };
  const newContent = {
    ...(existingElement.content || {}),
    ...(patch.content || {})
  };

  // Reset provenance for edited fields
  if (patch.content && existingElement.meta?.provenance) {
    const newProv = { ...(newMeta.provenance || {}) };
    const info = schema.elementTypes[singularType];
    if (info && info.template) {
      for (const t of info.template) {
        let camelKey = toCamelCase(t.heading);
        if (singularType === "process-step") {
          if (t.heading === "What happens") camelKey = "description";
          if (t.heading === "Why it matters") camelKey = "businessValue";
        }
        if (patch.content[camelKey] !== undefined && JSON.stringify(patch.content[camelKey]) !== JSON.stringify(existingElement.content?.[camelKey])) {
          newProv[t.heading] = { source: "proposed", evidence: "" };
        }
      }
    }
    newMeta.provenance = newProv;
  }

  // A1 approval gate: block approval while any heading is still proposed/web.
  // Runs before the generic conformance check so the reason is specific.
  if (patch.meta?.approval === "approved") {
    const gate = approvalGateError(id, newMeta.provenance);
    if (gate) return { ok: false, error: gate };
  }

  const fullElement = { meta: newMeta, content: newContent };

  // Only hard-block on content conformance when the patch actually changes
  // content. Metadata-only writes (approval / relevance / status transitions)
  // must not be blocked by an element's pre-existing non-conformance — the
  // approval gate above is the only hard block on a state change, and
  // conformance is surfaced as a warning badge elsewhere (warn-and-allow,
  // SKILLS.md §10).
  const isContentEdit =
    !!patch.content && Object.keys(patch.content).length > 0;
  if (isContentEdit) {
    const info = schema.elementTypes[singularType];
    const pageRepresentation = jsonElementToWikiPage(fullElement, info);
    const validationIssues = [
      ...checkElement(pageRepresentation, info.template || []).filter(c => !c.ok).map(c => `“${c.heading}” ${c.issue}`),
      ...checkFrontmatter(pageRepresentation, info),
      ...checkFieldValues(pageRepresentation, info, schema),
      ...checkProvenance(pageRepresentation, info)
    ];
    if (validationIssues.length > 0) {
      return { ok: false, error: `Validation failed:\n- ${validationIssues.join("\n- ")}` };
    }
  }

  // A content/meta edit by human confirms the element and invalidates prior review verdicts
  const isSmeAction = patch.meta?.status === "confirmed" || isContentEdit;
  if (isSmeAction) {
    newMeta.status = "confirmed";
    if (newMeta.approval === "approved") {
      newMeta.approval = "in-progress";
      newMeta.approvalBy = "";
      newMeta.approvalDate = "";
    }
    if (["relevant", "disregarded"].includes(newMeta.relevance)) {
      newMeta.relevance = "";
      newMeta.relevanceBy = "";
      newMeta.relevanceDate = "";
    }
  }
  // R5 — stamp per-edit attribution on a content change (stable username; the
  // display name is resolved at read time).
  if (isContentEdit) {
    newMeta.updatedBy = author;
    newMeta.updatedAt = new Date().toISOString().slice(0, 10);
  }

  doc[foundCollection][foundIndex] = fullElement;
  if (singularType === "process-step") {
    doc[foundCollection].sort((a: any, b: any) => (a.meta?.sequence || 999) - (b.meta?.sequence || 999));
  } else {
    doc[foundCollection].sort((a: any, b: any) => (a.meta?.id || "").localeCompare(b.meta?.id || ""));
  }

  atomicWriteFileSync(filePath, JSON.stringify(stripRuntimeState(doc), null, 2) + "\n");
  revalidatePath("/");
  return { ok: true, element: fullElement };
}

const APPROVAL_VALUES = ["in-progress", "approved", "rejected"];

export async function setApproval(
  slug: string,
  id: string,
  approval: string,
  _by?: string, // R6: ignored — the author is derived from the session server-side
): Promise<{ ok: true }> {
  if (!APPROVAL_VALUES.includes(approval)) {
    throw new Error(`Invalid approval value: ${approval}`);
  }
  const author = await resolveWriter(slug);
  const date = new Date().toISOString().slice(0, 10);
  const patch = {
    meta: {
      approval,
      approvalBy: author,
      approvalDate: date
    }
  };
  const res = await updateElement(slug, id, patch);
  if (!res.ok) {
    throw new Error(res.error || "Failed to set approval");
  }
  return { ok: true };
}

export async function saveSummaryPart(
  slug: string,
  area: string,
  index: number,
  text: string,
): Promise<{ ok: true }> {
  const path = join(WIKI_DIR, `${slug}.json`);
  if (!existsSync(path)) throw new Error("No process file found.");
  await resolveWriter(slug); // authenticate + authorize the writer
  const data = JSON.parse(readFileSync(path, "utf8"));
  const summaries = data.summaries;
  if (!summaries) throw new Error("No summaries found for this process.");
  const entry = summaries[area];
  if (!entry || !Array.isArray(entry.parts) || !entry.parts[index]) {
    throw new Error(`Summary part not found: ${area}[${index}]`);
  }
  entry.parts[index].text = text.trim();
  atomicWriteFileSync(path, JSON.stringify(stripRuntimeState(data), null, 2) + "\n");
  revalidatePath("/");
  return { ok: true };
}

const RELEVANCE_VALUES = ["", "relevant", "disregarded"];

export async function setRelevance(
  slug: string,
  id: string,
  relevance: string,
  _by?: string, // R6: ignored — the author is derived from the session server-side
): Promise<{ ok: true }> {
  if (!RELEVANCE_VALUES.includes(relevance)) {
    throw new Error(`Invalid relevance value: ${relevance}`);
  }
  const author = await resolveWriter(slug);
  const date = new Date().toISOString().slice(0, 10);
  const patch = {
    meta: {
      relevance,
      relevanceBy: author,
      relevanceDate: date
    }
  };
  const res = await updateElement(slug, id, patch);
  if (!res.ok) {
    throw new Error(res.error || "Failed to set relevance");
  }
  return { ok: true };
}

const TRIAGE_VALUES = ["pending", "accepted", "rejected"];

export async function triageTargetReview(
  slug: string,
  itemId: string,
  triage: string,
): Promise<{ ok: true }> {
  if (!TRIAGE_VALUES.includes(triage)) {
    throw new Error(`Invalid triage value: ${triage}`);
  }
  const path = join(WIKI_DIR, `${slug}.json`);
  if (!existsSync(path)) throw new Error("No process file found.");
  await resolveWriter(slug); // authenticate + authorize the writer

  const doc = JSON.parse(readFileSync(path, "utf8"));
  const review = doc.targetReview;
  if (!review) throw new Error("No council review for this process.");
  const item = review.items.find((i: any) => i.id === itemId);
  if (!item) throw new Error(`Review item not found: ${itemId}`);
  item.triage = triage;

  if (triage === "accepted") {
    const date = new Date().toISOString().slice(0, 10);
    for (const targetId of item.targets) {
      let foundCollection = "";
      let foundIndex = -1;
      for (const [key, val] of Object.entries(doc)) {
        if (!Array.isArray(val)) continue;
        const idx = val.findIndex((el: any) => el.meta?.id === targetId);
        if (idx !== -1) {
          foundCollection = key;
          foundIndex = idx;
          break;
        }
      }
      if (foundIndex !== -1) {
        const el = doc[foundCollection][foundIndex];
        if (el.meta?.approval === "approved") {
          el.meta.approval = "in-progress";
          el.meta.approvalBy = "council-review";
          el.meta.approvalDate = date;
        }
      }
    }
  }

  atomicWriteFileSync(path, JSON.stringify(stripRuntimeState(doc), null, 2) + "\n");
  revalidatePath("/");
  return { ok: true };
}

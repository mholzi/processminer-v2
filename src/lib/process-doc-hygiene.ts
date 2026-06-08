// R9 guardrail, enforced at the write layer.
//
// `wiki/processes/<slug>.json` holds only durable, curated process knowledge.
// Runtime / orchestration / derived state lives in the sibling runtime store
// (`data/runtime/<slug>.json`) and is injected by `getProcess` at read time —
// it must never be persisted back into the wiki JSON. Historically the only
// guardrail was a `delete doc.lint` in the two AI dispatchers, which (a) missed
// `reviewState`/`sources` and (b) didn't run on the in-app write path, so
// pre-R9 documents (e.g. funds-release.json) still carried these keys.
//
// `stripRuntimeState` is the single place that lists the runtime-owned keys and
// removes them. Call it immediately before persisting any process document.

/** Top-level keys that `getProcess` sources from the runtime store or the
 *  filesystem — never from the on-disk document. None is an element collection,
 *  `meta`, `content`, `ingest`, or `notes` (those are durable). */
export const RUNTIME_DOC_KEYS = [
  "reviewState", // foundational-run cursor (runtime store)
  "lint", // latest lint report (runtime store, regenerated each pass)
  "findingDismissals", // per-finding dismissals (runtime store)
  "skillUsage", // per-skill token/time accounting (runtime store)
  "dtpReports", // DTP Enhancer run history (runtime store)
  "dtpReport", // legacy single DTP report (runtime store)
  "sources", // imported documents — derived from raw-sources/ at read time
] as const;

/** Remove any runtime-owned top-level keys from a process document, in place,
 *  and return it. Idempotent — a clean document passes through untouched. */
export function stripRuntimeState<T extends Record<string, unknown>>(doc: T): T {
  if (!doc || typeof doc !== "object") return doc;
  for (const key of RUNTIME_DOC_KEYS) {
    if (key in doc) delete (doc as Record<string, unknown>)[key];
  }
  return doc;
}

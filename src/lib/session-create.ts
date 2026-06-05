/**
 * Shared element-authoring core for the session tools.
 *
 * Both providers (`gemini-worker.ts` and `claude-mcp-server.ts`) used to carry
 * an identical inline copy of the `createElement` build/validate/id-assign
 * logic. That logic now lives here once, as pure functions, so:
 *
 *   - the single-element `createElement` tool and the batch `createElements`
 *     tool share exactly the same validation and id assignment, and
 *   - it is unit-testable without a live session (`session-create.test.ts`).
 *
 * Nothing here touches disk or the network — callers read the doc, call these,
 * and write the mutated doc back. That keeps the schema-validated-writer
 * contract intact (no hand-edited JSON) while the I/O stays in the providers.
 */

import { jsonElementToWikiPage } from "./wiki.ts";
import {
  checkElement,
  checkProvenance,
  checkFrontmatter,
  checkFieldValues,
} from "./conformance.ts";

/**
 * Recursively resolve `"@tempKey"` string references against a tempKey→id map.
 * Within a turn (single tool call sequence, or one `createElements` batch) an
 * element can reference another element that has not been written yet by its
 * `tempKey`; once that element is created and its real id is known, every
 * `"@tempKey"` is rewritten to the id.
 */
export function replaceTempKeys(obj: any, tempKeyMap: Map<string, string>): any {
  if (typeof obj === "string") {
    if (obj.startsWith("@")) {
      const key = obj.slice(1);
      if (tempKeyMap.has(key)) {
        return tempKeyMap.get(key);
      }
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceTempKeys(item, tempKeyMap));
  }
  if (typeof obj === "object" && obj !== null) {
    const res: any = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = replaceTempKeys(v, tempKeyMap);
    }
    return res;
  }
  return obj;
}

/**
 * Derive the next sequential id for an element type: `<idPrefix>-<PROC>-<NNN>`.
 * The PROC abbreviation is read from existing element ids (or the root meta id),
 * so callers never format an id themselves.
 */
export function generateNextId(
  data: any,
  elementType: string,
  idPrefix: string
): string {
  let procAbbrev = "";
  let maxSeq = 0;

  for (const [, val] of Object.entries(data)) {
    if (!Array.isArray(val)) continue;
    for (const el of val) {
      const elId = el.meta?.id;
      if (typeof elId === "string") {
        const parts = elId.split("-");
        if (parts.length === 3) {
          if (!procAbbrev) {
            procAbbrev = parts[1];
          }
          if (el.meta?.type === elementType && /^\d+$/.test(parts[2])) {
            const seq = parseInt(parts[2], 10);
            if (seq > maxSeq) {
              maxSeq = seq;
            }
          }
        }
      }
    }
  }

  if (!procAbbrev) {
    const procId = data.meta?.id || "";
    procAbbrev = procId.split("-")[0] || "PROC";
  }

  const nextSeq = maxSeq + 1;
  const nextSeqStr = String(nextSeq).padStart(3, "0");
  return `${idPrefix}-${procAbbrev}-${nextSeqStr}`;
}

/** Map a collection name (`section`, e.g. "process-steps") to its singular element type.
 * Also accepts the element type key directly (e.g. "competitor-cx-eu") so callers can
 * target a specific subtype within a shared section. */
export function singularTypeFor(schema: any, section: string): string | null {
  if (schema.elementTypes[section]) return section;
  for (const [t, def] of Object.entries(schema.elementTypes)) {
    if ((def as any).section === section) return t;
  }
  return null;
}

export interface BuildElementResult {
  ok: boolean;
  /** the assigned id, on success */
  id?: string;
  /** the fully-assembled `{ meta, content }` element, on success */
  fullElement?: any;
  /** the singular element type the section maps to, on success */
  singularType?: string;
  /** validation/lookup issues, on failure */
  issues?: string[];
}

/**
 * Build and validate one element WITHOUT writing it. Resolves `@tempKey`
 * references in the payload, finds the element type for the collection,
 * assigns the next id, and runs the four conformance checks. The caller is
 * responsible for pushing the returned `fullElement` into the doc (see
 * `applyElement`) and for recording the new id in the tempKeyMap.
 */
export function buildElement(
  doc: any,
  schema: any,
  type: string,
  element: any,
  tempKeyMap: Map<string, string>
): BuildElementResult {
  const resolved = replaceTempKeys(element, tempKeyMap);

  const singularType = singularTypeFor(schema, type);
  if (!singularType) {
    return { ok: false, issues: [`Unknown collection type: ${type}`] };
  }

  const info = schema.elementTypes[singularType];
  const newId = generateNextId(doc, singularType, info.idPrefix);
  // Use the canonical section from the schema (handles the case where `type` is an
  // element type key rather than a section name, e.g. "competitor-cx-eu" → "competitor-cx").
  const canonicalSection = info.section ?? type;

  const fullElement = {
    meta: {
      ...(resolved.meta || {}),
      id: newId,
      type: singularType,
      section: canonicalSection,
      status: resolved.meta?.status || "draft",
    },
    content: { ...(resolved.content || {}) },
  };

  const page = jsonElementToWikiPage(fullElement, info);
  const issues = [
    ...checkElement(page, info.template || [])
      .filter((c: any) => !c.ok)
      .map((c: any) => `“${c.heading}” ${c.issue}`),
    ...checkFrontmatter(page, info),
    ...checkFieldValues(page, info, schema),
    ...checkProvenance(page, info),
  ];

  if (issues.length > 0) return { ok: false, issues, singularType };
  return { ok: true, id: newId, fullElement, singularType };
}

/** Push a built element into its collection (mutates `doc`), keeping steps ordered by sequence. */
export function applyElement(
  doc: any,
  type: string,
  fullElement: any,
  singularType: string
): void {
  // Use the canonical section stored in the element meta (may differ from `type` when
  // the caller passed an element type key such as "competitor-cx-eu" rather than the
  // section name "competitor-cx").
  const collectionKey = fullElement.meta?.section ?? type;
  if (!doc[collectionKey]) doc[collectionKey] = [];
  doc[collectionKey].push(fullElement);
  if (singularType === "process-step") {
    doc[collectionKey].sort(
      (a: any, b: any) => (a.meta?.sequence || 999) - (b.meta?.sequence || 999)
    );
  }
}

export interface BatchSpec {
  type: string;
  element: any;
  tempKey?: string;
}

export interface BatchResult {
  ok: boolean;
  created: { tempKey?: string; id: string; type: string }[];
  /** count of created elements per collection type — the source of the report counts */
  counts: Record<string, number>;
  errors: { index: number; tempKey?: string; type?: string; issues: string[] }[];
}

/**
 * Author a whole run of elements in one call. Every element is resolved,
 * validated, id-assigned and pushed into `doc` (mutated in place), sharing one
 * tempKeyMap so intra-batch `@tempKey` cross-references resolve. The return
 * value carries the per-type `counts` — which replaces the old "run manifest"
 * the source skills used to tally their report from. A failing element is
 * recorded in `errors` and skipped; the rest still write.
 *
 * The caller writes the mutated `doc` to disk once, after this returns.
 */
export function createElementsBatch(
  doc: any,
  schema: any,
  elements: BatchSpec[]
): BatchResult {
  const tempKeyMap = new Map<string, string>();
  const created: BatchResult["created"] = [];
  const counts: Record<string, number> = {};
  const errors: BatchResult["errors"] = [];

  elements.forEach((spec, index) => {
    if (!spec || typeof spec.type !== "string" || !spec.element) {
      errors.push({ index, issues: ["each element needs a `type` and an `element`"] });
      return;
    }
    const built = buildElement(doc, schema, spec.type, spec.element, tempKeyMap);
    if (!built.ok || !built.fullElement) {
      errors.push({
        index,
        tempKey: spec.tempKey,
        type: spec.type,
        issues: built.issues || ["unknown error"],
      });
      return;
    }
    applyElement(doc, spec.type, built.fullElement, built.singularType!);
    counts[spec.type] = (counts[spec.type] || 0) + 1;
    created.push({ tempKey: spec.tempKey, id: built.id!, type: spec.type });
    if (spec.tempKey) {
      const cleanKey = spec.tempKey.startsWith("@") ? spec.tempKey.slice(1) : spec.tempKey;
      tempKeyMap.set(cleanKey, built.id!);
    }
  });

  return { ok: errors.length === 0, created, counts, errors };
}

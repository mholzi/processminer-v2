// Client-safe navigation helpers (no node:fs — importable by client components).
import type { Schema } from "./wiki";

/**
 * Which section does an element id belong to? Matches the id prefix
 * (e.g. "PS-COB-002" → "PS" → process-step → "process-steps") against the
 * schema's element types. Returns null for ids that don't resolve
 * (e.g. the process id itself).
 */
export function sectionForId(schema: Schema, id: string): string | null {
  for (const et of Object.values(schema.elementTypes)) {
    if (id.startsWith(et.idPrefix + "-")) return et.section;
  }
  return null;
}

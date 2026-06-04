import type { Schema, WikiPage } from "./wiki";

/** A labelled group of related-element ids, ready to render as link chips. */
export interface LinkGroup {
  label: string;
  ids: string[];
}

import { asList } from "./meta.ts";

/**
 * Build the forward + reverse relation index for one process.
 *
 *   forward — straight from each element's own `frontmatter.relations`
 *             fields (e.g. a control's `step`).
 *   reverse — a relation that declares a `reverseLabel` produces, on every
 *             element it points at, a reverse group under that label
 *             (e.g. `control.step` with reverseLabel "Controls" gives each
 *             step a "Controls" group — no per-relation index needed).
 *
 * Plain `key -> id list` relations only. `transitions` and `raci` carry
 * per-edge metadata (kind / condition / level) and are handled separately —
 * see ProcessFlow and RaciMatrix. `affects` on an exception is derived from
 * step `transitions`, so it is not produced here either.
 *
 *   ┌────────────┐  control.step = [PS-FR-002]   ┌────────────┐
 *   │  control   │ ────────────────────────────▶ │   step     │
 *   │ CP-FR-001  │   forward "Step"              │ PS-FR-002  │
 *   └────────────┘   reverse "Controls" ◀────────┘────────────┘
 */
export function buildRelations(schema: Schema, elements: WikiPage[]) {
  const relsOf = (type: string) =>
    schema.elementTypes[type]?.frontmatter?.relations ?? [];

  // reverseGroups[targetId][label] = ids of elements pointing at targetId
  const reverseGroups: Record<string, Record<string, string[]>> = {};
  for (const el of elements) {
    for (const rel of relsOf(el.type)) {
      if (!rel.reverseLabel) continue;
      for (const targetId of asList(el.meta[rel.key])) {
        ((reverseGroups[targetId] ??= {})[rel.reverseLabel] ??= []).push(el.id);
      }
    }
  }

  return {
    /** Forward link groups for an element — from its own relation fields. */
    forward(el: WikiPage): LinkGroup[] {
      const out: LinkGroup[] = [];
      for (const rel of relsOf(el.type)) {
        const ids = asList(el.meta[rel.key]);
        if (ids.length) out.push({ label: rel.label, ids });
      }
      return out;
    },
    /** Reverse link groups — elements that point at this id. */
    reverse(id: string): LinkGroup[] {
      const g = reverseGroups[id];
      return g ? Object.entries(g).map(([label, ids]) => ({ label, ids })) : [];
    },
  };
}

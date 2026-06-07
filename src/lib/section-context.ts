// One-call context for the add-entry skill. Step 1 of add-entry used to be 3+
// sequential reads (schema template + existing-elements list + overview) and the
// model then re-recalled the element shape from the schema at draft time —
// slow and a frequent source of dropped-required-field conformance flags. This
// returns, in one payload: the section's element type(s) each as a fill-in-the-
// blanks SKELETON (block headings + frontmatter fields + relation targets +
// required keys), the existing elements (id+title) so the draft fits and does
// not duplicate, and the overview for domain context.
//
// Pure / I/O-free: callers pass the parsed doc + the schema.

import type { Schema } from "./wiki.ts";

export interface TypeSkeleton {
  type: string;
  label: string;
  idPrefix: string;
  /** The `##` block headings the element must carry (fill each one). */
  blocks: string[];
  /** Type-specific scalar frontmatter fields. */
  fields: { key: string; label: string; hint?: string }[];
  /** Relation id-lists and the element type(s) each may point at. */
  relations: { key: string; label: string; target: string[] }[];
  /** Frontmatter keys that must be present (the dropped-field guard). */
  required: string[];
}

export interface SectionContext {
  section: string;
  /** The element type(s) this section holds — usually one, sometimes several. */
  types: TypeSkeleton[];
  /** Existing elements in the section, so the new one fits and isn't a duplicate. */
  existing: { id: string; title: string }[];
  /** The process overview, for domain context. */
  overview: { id: string; title: string; description: string } | null;
}

function asTargetArray(t: string | string[] | undefined): string[] {
  if (Array.isArray(t)) return t;
  if (typeof t === "string" && t) return [t];
  return [];
}

export function buildSectionContext(doc: any, schema: Schema, section: string): SectionContext {
  const types: TypeSkeleton[] = [];
  for (const [type, def] of Object.entries(schema.elementTypes)) {
    if (def.section !== section) continue;
    types.push({
      type,
      label: def.label,
      idPrefix: def.idPrefix,
      blocks: (def.template ?? []).map((b) => b.heading),
      fields: (def.frontmatter?.fields ?? []).map((f) => ({ key: f.key, label: f.label, hint: f.hint })),
      relations: (def.frontmatter?.relations ?? []).map((r) => ({
        key: r.key,
        label: r.label,
        target: asTargetArray(r.target),
      })),
      required: def.frontmatter?.required ?? [],
    });
  }

  const list = Array.isArray(doc?.[section]) ? doc[section] : [];
  const existing = list
    .map((el: any) => ({ id: el?.meta?.id, title: el?.content?.title }))
    .filter((e: any) => typeof e.id === "string" && e.id);

  const overview = doc?.meta?.id
    ? {
        id: doc.meta.id,
        title: doc?.content?.title ?? "",
        description:
          typeof doc?.content?.description === "string" ? doc.content.description : "",
      }
    : null;

  return { section, types, existing, overview };
}

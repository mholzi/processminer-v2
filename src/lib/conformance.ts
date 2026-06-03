// Template-conformance check — the deterministic half of the lint pass.
// Every element is compared against its element type's schema template
// (schema/process-schema.json, layer 3): missing or extra blocks, wrong
// format (paragraph vs bullets), length out of the specified range, and
// any required frontmatter the element does not carry.
//
// Unlike the cross-section discrepancy pass, this check is exact, not an
// agent guess — it is pure structure arithmetic over the wiki.
//
// The twin of scripts/wiki/check_conformance.py — keep the two in step.
import type { BlockSpec, ElementType, Schema, WikiPage } from "./wiki.ts";
import type { LintFinding } from "./lint.ts";

function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function bulletCount(text: string): number {
  return text.split("\n").filter((l) => /^\s*[-*]\s+/.test(l)).length;
}

/** A block reads as bullets if any line is a Markdown list item. */
function detectFormat(text: string): "paragraph" | "bullets" {
  return /^\s*[-*]\s+/m.test(text) ? "bullets" : "paragraph";
}

/** "40–90" / "40-90" / "1" → [lo, hi]. Handles hyphen and en/em dashes. */
function parseRange(r: string): [number, number] {
  const parts = r
    .split(/[–—-]/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  if (parts.length === 0) return [0, Infinity];
  if (parts.length === 1) return [parts[0], parts[0]];
  return [parts[0], parts[1]];
}

/** Per-block conformance result for one element. */
export interface BlockCheck {
  heading: string;
  /** false when the block deviates from (or is missing against) the template. */
  ok: boolean;
  /** true when the element carries a block the template does not define. */
  extra?: boolean;
  /** short description of the deviation, present when !ok. */
  issue?: string;
}

/** Check one element's blocks against its type template. */
export function checkElement(
  page: WikiPage,
  template: BlockSpec[],
): BlockCheck[] {
  const checks: BlockCheck[] = [];
  const byHeading = new Map(page.blocks.map((b) => [b.heading, b]));
  const tplHeadings = new Set(template.map((b) => b.heading));

  for (const spec of template) {
    const block = byHeading.get(spec.heading);
    if (!block) {
      checks.push({ heading: spec.heading, ok: false, issue: "the block is missing" });
      continue;
    }
    const actual = detectFormat(block.text);
    if (actual !== spec.format) {
      checks.push({
        heading: spec.heading,
        ok: false,
        issue:
          spec.format === "bullets"
            ? `should be a bulleted list${spec.items ? ` (${spec.items} items)` : ""} but is written as a paragraph`
            : "should be a paragraph but is written as a bulleted list",
      });
      continue;
    }
    if (spec.format === "paragraph" && spec.words) {
      const [lo, hi] = parseRange(spec.words);
      const w = wordCount(block.text);
      if (w < lo) {
        checks.push({
          heading: spec.heading,
          ok: false,
          issue: `is short at ${w} words — the template asks for ${spec.words}`,
        });
        continue;
      }
      if (w > hi) {
        checks.push({
          heading: spec.heading,
          ok: false,
          issue: `is long at ${w} words — the template asks for ${spec.words}`,
        });
        continue;
      }
    }
    if (spec.format === "bullets" && spec.items) {
      const [lo, hi] = parseRange(spec.items);
      const c = bulletCount(block.text);
      if (c < lo || c > hi) {
        checks.push({
          heading: spec.heading,
          ok: false,
          issue: `has ${c} bullet${c === 1 ? "" : "s"} — the template asks for ${spec.items}`,
        });
        continue;
      }
    }
    checks.push({ heading: spec.heading, ok: true });
  }

  for (const b of page.blocks) {
    if (!tplHeadings.has(b.heading)) {
      checks.push({
        heading: b.heading,
        ok: false,
        extra: true,
        issue: "is not part of the template",
      });
    }
  }

  return checks;
}

// Provenance sources — the hallucination countermeasure (HALLUCINATION-PLAN.md).
// Mirrors PROVENANCE_SOURCES / UNCONFIRMED_SOURCES / EVIDENCE_REQUIRED in
// scripts/wiki/wiki_lib.py and check_conformance.py — keep the two in step.
const PROVENANCE_SOURCES = new Set([
  "elicited",
  "document",
  "proposed",
  "web",
  "legacy-approved",
]);
/** Sources that mean "not yet confirmed by the SME" — these block approval. */
export const UNCONFIRMED_SOURCES = new Set(["proposed", "web"]);
/** Sources whose claim must be backed by a verbatim quote / snippet. */
const EVIDENCE_REQUIRED = new Set(["elicited", "document", "web"]);

/** The element's provenance map, decoded. {} if absent or malformed.
 *  The value is stored JSON-encoded on one frontmatter line. */
export function parseProvenance(
  page: WikiPage,
): Record<string, { source?: string; evidence?: string }> {
  const raw = page.meta["provenance"];
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, { source?: string; evidence?: string }>)
      : {};
  } catch {
    return {};
  }
}

/** Every template heading needs a provenance entry; the map keys must not
 *  drift from the template; evidence must back an elicited/document/web claim.
 *  The Python twin is check_provenance() in check_conformance.py. */
export function checkProvenance(page: WikiPage, type: ElementType): string[] {
  const issues: string[] = [];
  const template = type.template ?? [];
  if (template.length === 0) return issues;
  const tpl = template.map((b) => b.heading);
  const prov = parseProvenance(page);

  if (Object.keys(prov).length === 0) {
    issues.push(
      "provenance map is missing — every heading must record where its content came from",
    );
    return issues;
  }

  for (const heading of tpl) {
    if (!(heading in prov)) issues.push(`“${heading}” has no provenance entry`);
  }
  // Keys that name no template heading — the rename / stray-heading drift.
  for (const key of Object.keys(prov)) {
    if (!tpl.includes(key)) {
      issues.push(
        `provenance entry “${key}” names no template heading (renamed or stray)`,
      );
    }
  }
  for (const heading of tpl) {
    const entry = prov[heading];
    if (entry === undefined) continue;
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      issues.push(`“${heading}” provenance entry is malformed`);
      continue;
    }
    const source = typeof entry.source === "string" ? entry.source : undefined;
    if (!source || !PROVENANCE_SOURCES.has(source)) {
      issues.push(
        `“${heading}” provenance source “${source}” is not one of ${[
          ...PROVENANCE_SOURCES,
        ]
          .sort()
          .join(", ")}`,
      );
      continue;
    }
    if (EVIDENCE_REQUIRED.has(source) && !String(entry.evidence ?? "").trim()) {
      issues.push(`“${heading}” is ${source} but carries no evidence quote`);
    }
  }
  return issues;
}

/** Required frontmatter the element type declares but the element lacks. */
export function checkFrontmatter(page: WikiPage, type: ElementType): string[] {
  const required = type.frontmatter?.required ?? [];
  const issues: string[] = [];
  for (const key of required) {
    const v = page.meta[key];
    const empty =
      v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
    if (empty) issues.push(`required frontmatter “${key}” is missing`);
  }
  return issues;
}

/** A frontmatter field with a fixed value set (schema `fieldValues`) must
 *  carry one of those values exactly — catches typos and casing drift
 *  (e.g. `gapStatus: OPEN` where the schema declares `open`).
 *  The Python twin is check_field_values() in check_conformance.py. */
export function checkFieldValues(
  page: WikiPage,
  type: ElementType,
  schema: Schema,
): string[] {
  const issues: string[] = [];
  const fields = type.frontmatter?.fields ?? [];
  const fieldValues = schema.fieldValues ?? {};
  for (const f of fields) {
    const allowed = fieldValues[f.key];
    if (!allowed) continue;
    const val = page.meta[f.key];
    if (
      val === undefined ||
      val === "" ||
      (Array.isArray(val) && val.length === 0)
    )
      continue;
    for (const item of Array.isArray(val) ? val : [val]) {
      if (!allowed.includes(String(item))) {
        issues.push(
          `frontmatter “${f.key}” is “${item}” — not one of ${allowed.join(", ")}`,
        );
      }
    }
  }
  return issues;
}

/** Whole-wiki conformance pass — one finding per non-conforming element.
 *  Covers both block-template deviations and missing required frontmatter. */
export function checkConformance(
  elements: WikiPage[],
  schema: Schema,
): LintFinding[] {
  const findings: LintFinding[] = [];
  let n = 0;

  for (const el of elements) {
    const type = schema.elementTypes[el.type];
    if (!type) continue;

    const template = type.template;
    const blockIssues =
      template && template.length
        ? checkElement(el, template)
            .filter((c) => !c.ok)
            .map((c) => `“${c.heading}” ${c.issue}`)
        : [];
    const fmIssues = checkFrontmatter(el, type);
    const fvIssues = checkFieldValues(el, type, schema);
    const provIssues =
      template && template.length ? checkProvenance(el, type) : [];
    if (
      blockIssues.length === 0 &&
      fmIssues.length === 0 &&
      fvIssues.length === 0 &&
      provIssues.length === 0
    )
      continue;

    n += 1;
    findings.push({
      id: `C-${n}`,
      kind: "conformance",
      title: `${el.title} (${el.id})`,
      detail: `Does not match the ${type.label} schema — ${[
        ...blockIssues,
        ...fmIssues,
        ...fvIssues,
        ...provIssues,
      ].join("; ")}.`,
      elements: [el.id],
    });
  }

  return findings;
}

// Karpathy LLM-Wiki reader (server-side, file-backed).
//
//   raw-sources/   layer 1 — immutable imported documents
//   wiki/          layer 2 — markdown pages, the source of truth   ← read here
//   schema/        layer 3 — element types + doc-type sections
//
// Each wiki page is `---\n<frontmatter>\n---\n<body>`. Frontmatter is minimal:
// `key: value`, where a value wrapped in [ ] is a comma-separated list.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { applyFindingDismissals, type FindingDismissals, type LintReport } from "./lint.ts";
import type { TargetReview } from "./target-review.ts";
import { getUsers } from "./auth-server.ts";
import { getRuntime } from "./runtime-store.ts";

const ROOT = process.cwd();
const WIKI_DIR = join(ROOT, "wiki", "processes");
const SOURCES_DIR = join(ROOT, "raw-sources");
const SCHEMA_PATH = join(ROOT, "schema", "process-schema.json");

export interface Section {
  id: string;
  label: string;
  /** One line on what this section's content actually is — shown as the
   *  canvas subtitle. */
  description?: string;
  /** The elicitation specialist skill that owns this section, if any. */
  specialist?: string;
}
export interface Area {
  id: string;
  label: string;
  sections: Section[];
}
/** One named prose block in an element type's template (the schema layer). */
export interface BlockSpec {
  heading: string;
  format: "paragraph" | "bullets";
  /** paragraph format — e.g. "1" or "1–2". */
  paragraphs?: string;
  /** paragraph format — word range, e.g. "40–90". */
  words?: string;
  /** bullets format — item-count range, e.g. "3–6". */
  items?: string;
  purpose: string;
}
/** A type-specific scalar frontmatter field, with its display metadata. */
export interface FieldSpec {
  key: string;
  label: string;
  /** Appended to the value on display, e.g. "%". */
  suffix?: string;
  /** When set, the value links to the URL held in this other meta key. */
  urlKey?: string;
  /** One-line guidance shown under the input in edit mode. */
  hint?: string;
}
/** A relation field — an id list pointing at other elements. */
export interface RelationSpec {
  key: string;
  label: string;
  /** The element type(s) this relation may point at — one type, or several. */
  target?: string | string[];
  /** When set, the target element shows a reverse-link group with this label. */
  reverseLabel?: string;
}
/** Type-specific frontmatter — keys beyond the universal id/type/section/
 *  title/status/confidence/source. `required` are flagged when absent. */
export interface FrontmatterSpec {
  fields: FieldSpec[];
  relations: RelationSpec[];
  required?: string[];
}
export interface ElementType {
  label: string;
  section: string;
  idPrefix: string;
  /** The type-specific frontmatter keys and which of them are required. */
  frontmatter?: FrontmatterSpec;
  /** The named prose blocks every element of this type must carry. */
  template?: BlockSpec[];
}
export interface Schema {
  version: string;
  areas: Area[];
  elementTypes: Record<string, ElementType>;
  /** Allowed values for the enumerated frontmatter fields. */
  fieldValues?: Record<string, string[]>;
}

/** Flat list of every section across all areas. */
export function allSections(schema: Schema): Section[] {
  return schema.areas.flatMap((a) => a.sections);
}

export type ElementStatus = "confirmed" | "draft" | "empty";

/** A named prose block — `## Heading` + the prose under it. */
export interface ProseBlock {
  heading: string;
  text: string;
}

export interface WikiPage {
  id: string;
  type: string;
  section: string;
  title: string;
  status: ElementStatus;
  confidence?: string;
  source?: string;
  /** Full parsed frontmatter (scalars + string lists). */
  meta: Record<string, string | string[]>;
  /** Markdown body (the raw text after the frontmatter). */
  body: string;
  /** Body split into named prose blocks; empty when the body has no `## ` headings. */
  blocks: ProseBlock[];
}

/** A conflict document-ingest flagged — doc vs wiki, left for the SME. */
export interface IngestConflict {
  element: string;
  field: string;
  documentSays: string;
  wikiSays: string;
}
/** A claim verification removed from a draft before it was written. */
export interface IngestCorrection {
  element: string;
  field: string;
  removed: string;
}
/** Result of the last document-ingest — written to ingest.json. */
export interface IngestReport {
  generatedAt: string;
  slug: string;
  file: string;
  created: string[];
  updated: string[];
  conflicts: IngestConflict[];
  corrections: IngestCorrection[];
}
/** Executive summaries per area — written to summaries.json. Each is an
 *  Amazon-style memo broken into four individually-editable parts. */
export type SectionSummaries = Record<
  string,
  { parts: { heading: string; text: string }[]; generatedAt: string }
>;
/** The foundational-run cursor — written to review-state.json. */
export interface ReviewState {
  slug: string;
  /** Ordered element ids (the overview id first). */
  queue: string[];
  cursor: number;
  total: number;
  done: boolean;
  startedAt: string;
  updatedAt: string;
}

/** An imported source document — a file under raw-sources/<slug>/. */
export interface SourceFile {
  name: string;
  /** Size in bytes. */
  size: number;
  /** Last-modified time, ISO-8601 — the upload time in practice. */
  uploadedAt: string;
  /** Display name of the SME who uploaded the file, read from the sidecar
   *  raw-sources/<slug>/uploads.json. Optional — pre-manifest uploads have
   *  no recorded actor. */
  uploadedBy?: string;
}

/** An SME note left on an element — a question or comment for a colleague. */
export interface Note {
  id: string;
  author: string;
  text: string;
  /** ISO-8601 timestamp. */
  ts: string;
  /** Set when this note replies to another note (that note's id). */
  replyTo?: string;
  /** Set true once the comment-review skill has triaged this comment with
   *  the SME — incorporated, declined or otherwise handled — or once it is
   *  resolved by hand in the app. */
  resolved?: boolean;
  /** Resolved only — who marked it resolved (set on a manual in-app resolve). */
  resolvedBy?: string;
  /** Resolved only — ISO date it was resolved. */
  resolvedAt?: string;
}

/** One glossary term — an entry in glossary.json (CONTENT-MODEL-PLAN.md D1).
 *  The glossary is a sidecar, not an element: reference data, no provenance. */
export interface GlossaryTerm {
  term: string;
  /** TERM | ACRONYM | SYSTEM */
  termType: string;
  definition: string;
}

/** A section's completeness marker — a value in sections.json, keyed by
 *  section id (CONTENT-MODEL-PLAN.md D5). Tells `confirmed-empty` (the SME
 *  said the process has none) apart from `not-visited` (never worked). */
export interface SectionStatus {
  /** worked | confirmed-empty | not-visited */
  status: string;
  count: number;
  date: string;
  by?: string;
}

export interface ProcessDoc {
  slug: string;
  process: WikiPage;
  elements: WikiPage[];
  /** ISO timestamp of the most recent file mtime under wiki/processes/<slug>/.
      Drives the "last activity" column in the process switcher. */
  lastModified?: string;
  /** Imported source documents — raw-sources/<slug>/, newest first. */
  sources: SourceFile[];
  /** Result of the last `run-lint` pass, if one has been run. */
  lint?: LintReport;
  /** Result of the last `council-review` pass, if one has been run. */
  targetReview?: TargetReview;
  /** Result of the last document-ingest, if one has been run. */
  ingest?: IngestReport;
  /** The foundational-run cursor, if a run has been started. */
  reviewState?: ReviewState;
  /** Per-section executive summaries, if any have been generated. */
  summaries?: SectionSummaries;
  /** SME note threads, keyed by element id — notes.json. */
  notes?: Record<string, Note[]>;
  /** Process glossary — glossary.json. */
  glossary?: GlossaryTerm[];
  /** Per-section completeness markers — sections.json, keyed by section id. */
  sectionStatus?: Record<string, SectionStatus>;
  rawJson?: any;
}

/** Parse `key: value` frontmatter. `[a, b]` becomes a string array. */
export function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw.trim() };
  const meta: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      const inner = val.slice(1, -1).trim();
      meta[key] = inner ? inner.split(",").map((s) => s.trim()) : [];
    } else {
      meta[key] = val;
    }
  }
  return { meta, body: match[2].trim() };
}

function str(v: string | string[] | undefined, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/** Split a body into `## Heading` prose blocks. Empty if there are none. */
export function parseBlocks(body: string): ProseBlock[] {
  if (!/^## /m.test(body)) return [];
  return body
    .split(/^## /m)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const nl = p.indexOf("\n");
      return nl === -1
        ? { heading: p.trim(), text: "" }
        : { heading: p.slice(0, nl).trim(), text: p.slice(nl + 1).trim() };
    });
}

function toPage(raw: string): WikiPage {
  const { meta, body } = parseFrontmatter(raw);
  const status = str(meta.status, "draft");
  return {
    id: str(meta.id),
    type: str(meta.type),
    section: str(meta.section),
    title: str(meta.title, "Ohne Titel"),
    status: (["confirmed", "draft", "empty"].includes(status) ? status : "draft") as ElementStatus,
    confidence: meta.confidence ? str(meta.confidence) : undefined,
    source: meta.source ? str(meta.source) : undefined,
    meta,
    body,
    blocks: parseBlocks(body),
  };
}

export function getSchema(): Schema {
  return JSON.parse(readFileSync(SCHEMA_PATH, "utf8")) as Schema;
}

/** List documented processes (one wiki/processes/<slug>/index.md each). */
export function listProcesses(): { slug: string; title: string }[] {
  if (!existsSync(WIKI_DIR)) return [];
  return readdirSync(WIKI_DIR, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".json"))
    .map((f) => {
      const slug = f.name.replace(".json", "");
      const data = JSON.parse(readFileSync(join(WIKI_DIR, f.name), "utf8"));
      return { slug, title: data.content?.title || slug };
    });
}

/** List the imported source documents for a process — raw-sources/<slug>/.
 *  Merges the uploads.json sidecar (written by /api/upload) so each row
 *  carries the SME's name and authoritative upload timestamp when known. */
export function listSources(slug: string): SourceFile[] {
  const dir = join(SOURCES_DIR, slug);
  if (!existsSync(dir)) return [];
  let manifest: Record<string, { by?: string; at?: string }> = {};
  const manifestPath = join(dir, "uploads.json");
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      manifest = {};
    }
  }
  return readdirSync(dir, { withFileTypes: true })
    .filter(
      (d) =>
        d.isFile() && !d.name.startsWith(".") && d.name !== "uploads.json",
    )
    .map((d) => {
      const s = statSync(join(dir, d.name));
      const meta = manifest[d.name];
      return {
        name: d.name,
        size: s.size,
        uploadedAt: meta?.at ?? s.mtime.toISOString(),
        uploadedBy: meta?.by,
      };
    })
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function toCamelCase(str: string): string {
  const cleaned = str.replace(/[^a-zA-Z0-9 ]/g, "");
  return cleaned
    .split(" ")
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

// R7/R8 — transitions and RACI are stored as structured objects
// (`{ to, kind, when }` and `{ step, level }`). Older data and the read-DTO use
// the string forms "to|kind|when" and "step:level". These helpers accept either
// form so every consumer is form-agnostic.
export function transitionToString(t: any): string {
  if (t && typeof t === "object")
    return `${t.to ?? ""}|${t.kind ?? "normal"}|${t.when ?? ""}`;
  return String(t ?? "");
}
export function transitionTarget(t: any): string {
  if (t && typeof t === "object") return String(t.to ?? "");
  return String(t ?? "").split("|")[0] ?? "";
}
export function raciToString(r: any): string {
  if (r && typeof r === "object") return `${r.step ?? ""}:${r.level ?? ""}`;
  return String(r ?? "");
}

export function jsonElementToWikiPage(item: any, info: ElementType): WikiPage {
  const meta: Record<string, any> = { ...(item.meta || {}) };
  if (meta.provenance && typeof meta.provenance === "object") {
    meta.provenance = JSON.stringify(meta.provenance);
  }
  
  if (item.content) {
    for (const [k, v] of Object.entries(item.content)) {
      meta[k] = v;
    }
  }

  // Bridge structured transitions/RACI to the string forms the frontend parses
  // ("to|kind|when", "step:level"). The helpers accept the legacy string form
  // too, so display works regardless of how the element was stored.
  if (meta.transitions && Array.isArray(meta.transitions)) {
    meta.transitions = meta.transitions.map(transitionToString);
  }
  if (meta.raci && Array.isArray(meta.raci)) {
    meta.raci = meta.raci.map(raciToString);
  }

  const blocks: { heading: string; text: string }[] = [];
  if (info.template) {
    for (const t of info.template) {
      const heading = t.heading;
      let camelKey = toCamelCase(heading);
      if (item.meta?.type === "process-step") {
        if (heading === "What happens") camelKey = "description";
        if (heading === "Why it matters") camelKey = "businessValue";
      }
      const rawVal = item.content?.[camelKey];
      let blockText = "";
      if (Array.isArray(rawVal)) {
        blockText = rawVal.map((i: string) => `- ${i}`).join("\n");
      } else {
        blockText = String(rawVal || "");
      }
      blocks.push({ heading, text: blockText });
    }
  }

  let bodyText = item.content?.description || "";
  if (item.meta?.type !== "process-step" && blocks.length > 0) {
    bodyText = blocks[0].text;
  }

  return {
    id: item.meta?.id || "",
    type: item.meta?.type || "",
    section: item.meta?.section || info.section || "",
    title: item.content?.title || "",
    status: (item.meta?.status || "draft") as ElementStatus,
    confidence: item.meta?.confidence,
    source: item.meta?.source,
    meta,
    body: bodyText,
    blocks: blocks,
  };
}

/** R6b — author fields are stored as the stable `username`. Resolve one to the
 *  current display name using a username→name roster, so a rename propagates
 *  everywhere it is shown. Falls back to the stored value, which transparently
 *  covers legacy records that stored a display name rather than a username. */
export function resolveAuthor(
  handle: unknown,
  roster: Map<string, string>,
): unknown {
  return typeof handle === "string" && roster.has(handle)
    ? roster.get(handle)
    : handle;
}

/** Build a resolver bound to the current user roster (cheap — `getUsers()` is
 *  memoised). Returns an identity passthrough if the roster can't be read. */
function nameResolver(): (v: any) => any {
  let roster: Map<string, string>;
  try {
    roster = new Map(getUsers().map((u) => [u.username, u.name]));
  } catch {
    roster = new Map();
  }
  return (v) => resolveAuthor(v, roster);
}

/** Read a full process: the index page plus every element page. */
export function getProcess(slug: string): ProcessDoc | null {
  const path = join(WIKI_DIR, `${slug}.json`);
  if (!existsSync(path)) return null;
  const data = JSON.parse(readFileSync(path, "utf8"));
  let mostRecent = statSync(path).mtimeMs;

  const readJson = <T>(name: string): T | undefined => {
    const p = join(WIKI_DIR, slug, name);
    if (!existsSync(p)) return undefined;
    try {
      return JSON.parse(readFileSync(p, "utf8")) as T;
    } catch {
      return undefined;
    }
  };

  const process: WikiPage = {
    id: data.meta?.id || "",
    type: data.meta?.type || "",
    section: "overview",
    title: data.content?.title || "",
    status: "draft",
    meta: { ...data.meta, ...data.content },
    body: data.content?.description || "",
    blocks: [],
  };

  const elements: WikiPage[] = [];
  const schema = getSchema();

  for (const [key, val] of Object.entries(data)) {
    if (key === "meta" || key === "content" || !Array.isArray(val)) continue;
    
    for (const item of val as any[]) {
      const type = item.meta?.type;
      if (!type) continue;
      
      const info = schema.elementTypes[type];
      if (!info) continue;
      
      const page = jsonElementToWikiPage(item, info);
      elements.push(page);
    }
  }

  // R6b — resolve stored author handles (usernames) to current display names.
  const resolveName = nameResolver();
  process.meta.approvalBy = resolveName(process.meta.approvalBy);
  for (const page of elements) {
    page.meta.approvalBy = resolveName(page.meta.approvalBy);
    page.meta.relevanceBy = resolveName(page.meta.relevanceBy);
    page.meta.updatedBy = resolveName(page.meta.updatedBy);
  }

  const sources = listSources(slug);
  for (const s of sources) s.uploadedBy = resolveName(s.uploadedBy);

  // R9 — runtime state (review cursor, lint, dismissals) lives above the wiki,
  // in the runtime store, not in the process JSON.
  const runtime = getRuntime(slug);
  const lint = runtime.lint;
  if (lint) {
    const dismissals = runtime.findingDismissals;
    if (dismissals) {
      applyFindingDismissals(
        lint.findings,
        dismissals,
        new Date().toISOString().slice(0, 10),
      );
    }
    if (Array.isArray(lint.findings)) {
      for (const f of lint.findings) {
        if (f.resolvedBy) f.resolvedBy = resolveName(f.resolvedBy);
        if (f.dismissedBy) f.dismissedBy = resolveName(f.dismissedBy);
      }
    }
  }

  // Notes are cloned so the resolved names don't leak into rawJson.
  let notes = data.notes as Record<string, Note[]> | undefined;
  if (notes) {
    notes = Object.fromEntries(
      Object.entries(notes).map(([eid, arr]) => [
        eid,
        arr.map((n) => ({
          ...n,
          author: resolveName(n.author),
          ...(n.resolvedBy ? { resolvedBy: resolveName(n.resolvedBy) } : {}),
        })),
      ]),
    );
  }

  return {
    slug,
    process,
    elements,
    lastModified: new Date(mostRecent).toISOString(),
    sources,
    lint,
    targetReview: data.targetReview,
    ingest: data.ingest,
    reviewState: runtime.reviewState,
    summaries: data.summaries,
    notes,
    glossary: data.glossary,
    sectionStatus: data.sectionStatus,
    rawJson: data,
  };
}

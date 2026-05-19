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
import type { LintReport } from "./lint";
import type { TargetReview } from "./target-review";

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
   *  the SME — incorporated, declined or otherwise handled. */
  resolved?: boolean;
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
}

/** Parse `key: value` frontmatter. `[a, b]` becomes a string array. */
function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
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
function parseBlocks(body: string): ProseBlock[] {
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
    .filter((d) => d.isDirectory() && existsSync(join(WIKI_DIR, d.name, "index.md")))
    .map((d) => {
      const page = toPage(readFileSync(join(WIKI_DIR, d.name, "index.md"), "utf8"));
      return { slug: d.name, title: page.title };
    });
}

/** List the imported source documents for a process — raw-sources/<slug>/. */
export function listSources(slug: string): SourceFile[] {
  const dir = join(SOURCES_DIR, slug);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith("."))
    .map((d) => {
      const s = statSync(join(dir, d.name));
      return { name: d.name, size: s.size, uploadedAt: s.mtime.toISOString() };
    })
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

/** Read a full process: the index page plus every element page. */
export function getProcess(slug: string): ProcessDoc | null {
  const dir = join(WIKI_DIR, slug);
  if (!existsSync(join(dir, "index.md"))) return null;
  const process = toPage(readFileSync(join(dir, "index.md"), "utf8"));
  const elements: WikiPage[] = [];
  for (const sub of readdirSync(dir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    for (const file of readdirSync(join(dir, sub.name))) {
      if (file.endsWith(".md")) {
        elements.push(toPage(readFileSync(join(dir, sub.name, file), "utf8")));
      }
    }
  }
  // Sidecar JSON artifacts the skills write — lint pass, ingest result,
  // foundational-run cursor. Each is optional and read defensively.
  const readJson = <T>(name: string): T | undefined => {
    const path = join(dir, name);
    if (!existsSync(path)) return undefined;
    try {
      return JSON.parse(readFileSync(path, "utf8")) as T;
    } catch {
      return undefined;
    }
  };
  return {
    slug,
    process,
    elements,
    sources: listSources(slug),
    lint: readJson<LintReport>("lint.json"),
    targetReview: readJson<TargetReview>("target-review.json"),
    ingest: readJson<IngestReport>("ingest.json"),
    reviewState: readJson<ReviewState>("review-state.json"),
    summaries: readJson<SectionSummaries>("summaries.json"),
    notes: readJson<Record<string, Note[]>>("notes.json"),
    glossary: readJson<GlossaryTerm[]>("glossary.json"),
    sectionStatus: readJson<Record<string, SectionStatus>>("sections.json"),
  };
}

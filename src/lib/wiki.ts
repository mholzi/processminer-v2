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
import { applyFindingDismissals, type FindingDismissals, type LintReport } from "./lint";
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

/** Per-heading provenance entry (HALLUCINATION-PLAN.md): which source the
 *  content came from + the verbatim quote that backs it. */
export interface ProvenanceEntry {
  source?: string;
  evidence?: string;
}

/** A process-step's outgoing edge (schema: process-step.transitions). The
 *  `kind` tells the flow whether this is the next step, a branch, a loop-back
 *  or an exception exit; `when` is the condition the SME described. */
export interface Transition {
  to: string;
  kind: "normal" | "branch" | "loopback" | "exception";
  when: string;
}

/** One RACI assignment on a role: how the role participates in a step.
 *  R = Responsible, A = Accountable, C = Consulted, I = Informed. */
export interface RaciEntry {
  step: string;
  level: "R" | "A" | "C" | "I";
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
  /** Per-heading provenance — read from wiki/processes/<slug>/provenance.json
   *  at load time, keyed by element id. Undefined when the element type has
   *  no template (provenance only applies to template-bearing elements). */
  provenance?: Record<string, ProvenanceEntry>;
  /** Outgoing transitions — read from wiki/processes/<slug>/transitions.json
   *  at load time, keyed by element id. Empty / undefined for elements that
   *  do not declare a flow (anything other than process-step). */
  transitions?: Transition[];
  /** RACI assignments — read from wiki/processes/<slug>/raci.json at load
   *  time, keyed by element id. Only role elements declare RACI. */
  raci?: RaciEntry[];
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

/** Read a full process: the index page plus every element page. */
export function getProcess(slug: string): ProcessDoc | null {
  const dir = join(WIKI_DIR, slug);
  if (!existsSync(join(dir, "index.md"))) return null;
  const process = toPage(readFileSync(join(dir, "index.md"), "utf8"));
  let mostRecent = statSync(join(dir, "index.md")).mtimeMs;
  const elements: WikiPage[] = [];
  for (const sub of readdirSync(dir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    for (const file of readdirSync(join(dir, sub.name))) {
      if (file.endsWith(".md")) {
        const p = join(dir, sub.name, file);
        elements.push(toPage(readFileSync(p, "utf8")));
        const m = statSync(p).mtimeMs;
        if (m > mostRecent) mostRecent = m;
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

  // Lift provenance + transitions + raci out of the per-process bundles and
  // attach them to each element by id, so consumers see one WikiPage with
  // everything already joined. Bundles live next to the element folders — see
  // scripts/wiki/migrate_to_bundles.py for the on-disk shape.
  const provenanceBundle =
    readJson<Record<string, Record<string, ProvenanceEntry>>>("provenance.json") ?? {};
  const transitionsBundle =
    readJson<Record<string, Transition[]>>("transitions.json") ?? {};
  const raciBundle =
    readJson<Record<string, RaciEntry[]>>("raci.json") ?? {};
  for (const el of elements) {
    const prov = provenanceBundle[el.id];
    if (prov) el.provenance = prov;
    const trans = transitionsBundle[el.id];
    if (trans && trans.length) el.transitions = trans;
    const raci = raciBundle[el.id];
    if (raci && raci.length) el.raci = raci;
  }
  // The lint report, with the dismissal sidecar re-applied — so a finding the
  // SME set aside stays dismissed even after run-lint rewrites lint.json.
  const lint = readJson<LintReport>("lint.json");
  if (lint) {
    const dismissals = readJson<FindingDismissals>("finding-dismissals.json");
    if (dismissals) {
      applyFindingDismissals(
        lint.findings,
        dismissals,
        new Date().toISOString().slice(0, 10),
      );
    }
  }
  return {
    slug,
    process,
    elements,
    lastModified: new Date(mostRecent).toISOString(),
    sources: listSources(slug),
    lint,
    targetReview: readJson<TargetReview>("target-review.json"),
    ingest: readJson<IngestReport>("ingest.json"),
    reviewState: readJson<ReviewState>("review-state.json"),
    summaries: readJson<SectionSummaries>("summaries.json"),
    notes: readJson<Record<string, Note[]>>("notes.json"),
    glossary: readJson<GlossaryTerm[]>("glossary.json"),
    sectionStatus: readJson<Record<string, SectionStatus>>("sections.json"),
  };
}

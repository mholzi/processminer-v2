// Karpathy LLM-Wiki reader (server-side, file-backed).
//
//   raw-sources/   layer 1 — immutable imported documents
//   wiki/          layer 2 — markdown pages, the source of truth   ← read here
//   schema/        layer 3 — element types + doc-type sections
//
// Each wiki page is `---\n<frontmatter>\n---\n<body>`. Frontmatter is minimal:
// `key: value`, where a value wrapped in [ ] is a comma-separated list.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { LintReport } from "./lint";

const ROOT = process.cwd();
const WIKI_DIR = join(ROOT, "wiki", "processes");
const SCHEMA_PATH = join(ROOT, "schema", "process-schema.json");

export interface Section {
  id: string;
  label: string;
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
export interface ElementType {
  label: string;
  section: string;
  idPrefix: string;
  /** The named prose blocks every element of this type must carry. */
  template?: BlockSpec[];
}
export interface Schema {
  version: string;
  areas: Area[];
  elementTypes: Record<string, ElementType>;
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

export interface ProcessDoc {
  slug: string;
  process: WikiPage;
  elements: WikiPage[];
  /** Result of the last `run-lint` pass, if one has been run. */
  lint?: LintReport;
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
  // The last lint pass, if `run-lint` has written one.
  let lint: LintReport | undefined;
  const lintPath = join(dir, "lint.json");
  if (existsSync(lintPath)) {
    try {
      lint = JSON.parse(readFileSync(lintPath, "utf8")) as LintReport;
    } catch {
      lint = undefined;
    }
  }
  return { slug, process, elements, lint };
}

// Derive a contributors activity feed for a single process from the data
// that already exists on disk:
//
//   - wiki/<slug>/notes.json           — comments (author + ts + element id)
//   - wiki/<slug>/ingest.json          — last import (file, created/updated)
//   - raw-sources/<slug>/uploads.json  — uploader for each source file
//   - element frontmatter              — approvalBy / approvalDate stamped by
//                                        set_approval.py, and updatedBy /
//                                        updatedAt once the write scripts
//                                        start recording them
//
// Edit attribution (updatedBy / updatedAt) isn't stamped on elements yet,
// so we don't fabricate it — those events will appear once write_element /
// patch_element start recording them.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getUsers } from "./auth-server";
import type { ProcessDoc } from "./wiki";

/** Username → display name. `by` fields in this feed are user-facing, so
 *  resolve any stored username (e.g. `admin`) back to its display name
 *  (`Markus Holzhauser`). Falls through unchanged when no match. */
function displayName(by: string): string {
  if (!by) return by;
  const u = getUsers().find(
    (x) => x.username.toLowerCase() === by.toLowerCase(),
  );
  return u?.name || by;
}

const WIKI_DIR = join(process.cwd(), "wiki", "processes");
const SOURCES_DIR = join(process.cwd(), "raw-sources");

export type EventKind =
  | "comment"
  | "upload"
  | "ingest"
  | "approval"
  | "draft"
  | "lint"
  | "section-status";

export type ContributorEvent = {
  id: string;
  kind: EventKind;
  /** Username or display name of the actor. "unknown" when no attribution. */
  by: string;
  /** ISO timestamp. */
  ts: string;
  /** Short prose line that fills the row body. */
  title: string;
  sub?: string;
  /** Optional element ids referenced. */
  elementIds?: string[];
};

export type ContributorRollup = {
  by: string;
  total: number;
  approvals: number;
  comments: number;
  uploads: number;
  drafts: number;
  lastActiveAt: string;
};

export type ContributorsReport = {
  slug: string;
  events: ContributorEvent[];
  rollups: ContributorRollup[];
  totals: {
    events: number;
    approvals: number;
    comments: number;
    uploads: number;
  };
};

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function scalar(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

// Frontmatter dates are stamped as `YYYY-MM-DD` (calendar date, no time).
// The feed sorts on ISO timestamps and groups by day bucket, so widen the
// date to noon UTC — gives it a stable position within the day without
// pretending we know the wall-clock minute.
function toIsoTs(s: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T12:00:00Z`;
  return s;
}

type NotesByElement = Record<
  string,
  {
    id: string;
    author: string;
    text: string;
    ts: string;
    resolved?: boolean;
  }[]
>;

type IngestReport = {
  generatedAt: string;
  file: string;
  created?: string[];
  updated?: string[];
  by?: string;
};

type UploadsManifest = Record<string, { by?: string; at?: string }>;

type LintReport = {
  generatedAt: string;
  summary?: { conformance?: number; discrepancy?: number; question?: number };
  findings?: { id: string }[];
  by?: string;
};

type SectionsManifest = Record<
  string,
  { status: string; count: number; date: string; by?: string }
>;

export function getContributorsReport(doc: ProcessDoc): ContributorsReport {
  const events: ContributorEvent[] = [];

  // ----- comments from notes.json -----
  const notesPath = join(WIKI_DIR, doc.slug, "notes.json");
  const notes = readJson<NotesByElement>(notesPath);
  if (notes) {
    for (const [elementId, arr] of Object.entries(notes)) {
      for (const n of arr) {
        const snippet =
          n.text.length > 100 ? n.text.slice(0, 100).trim() + "…" : n.text;
        events.push({
          id: `c-${n.id}`,
          kind: "comment",
          by: displayName(n.author || "unknown"),
          ts: n.ts,
          title: `commented on ${elementId}`,
          sub: snippet,
          elementIds: [elementId],
        });
      }
    }
  }

  // ----- uploads from raw-sources/<slug>/uploads.json -----
  const uploadsPath = join(SOURCES_DIR, doc.slug, "uploads.json");
  const uploads = readJson<UploadsManifest>(uploadsPath);
  if (uploads) {
    for (const [filename, meta] of Object.entries(uploads)) {
      if (!meta.at) continue;
      events.push({
        id: `u-${filename}`,
        kind: "upload",
        by: displayName(meta.by || "unknown"),
        ts: meta.at,
        title: `uploaded ${filename}`,
      });
    }
  }

  // ----- process creation from index.md frontmatter -----
  // scaffold_process.py stamps `createdBy` + `createdAt` when the web chat
  // exports PROCESSMINER_USER. Surface that as the first contributor event
  // so the creator shows up immediately, before they've taken any other
  // tangible action.
  const createdBy = scalar(doc.process.meta.createdBy);
  const createdAt = scalar(doc.process.meta.createdAt);
  if (createdBy && createdAt) {
    events.push({
      id: `n-${doc.slug}`,
      kind: "draft",
      by: displayName(createdBy),
      ts: toIsoTs(createdAt),
      title: `created the process`,
      sub: doc.process.title,
      elementIds: [doc.process.id],
    });
  }

  // ----- approvals + edits from element frontmatter -----
  // set_approval.py stamps `approvalBy` + `approvalDate` on every signed-off
  // element. patch_element / write_element will stamp `updatedBy` +
  // `updatedAt` once that's wired (deferred); we read both keys here so the
  // feed lights up automatically when stamping starts.
  const allPages = [doc.process, ...doc.elements];
  for (const page of allPages) {
    const approvalBy = scalar(page.meta.approvalBy);
    const approvalDate = scalar(page.meta.approvalDate);
    const approval = scalar(page.meta.approval);
    if (approvalBy && approvalDate && approval === "approved") {
      events.push({
        id: `a-${page.id}-${approvalDate}`,
        kind: "approval",
        by: displayName(approvalBy),
        ts: toIsoTs(approvalDate),
        title: `approved ${page.id}`,
        sub: page.title,
        elementIds: [page.id],
      });
    }
    const updatedBy = scalar(page.meta.updatedBy);
    const updatedAt = scalar(page.meta.updatedAt);
    if (updatedBy && updatedAt) {
      events.push({
        id: `e-${page.id}-${updatedAt}`,
        kind: "draft",
        by: displayName(updatedBy),
        ts: toIsoTs(updatedAt),
        title: `edited ${page.id}`,
        sub: page.title,
        elementIds: [page.id],
      });
    }
  }

  // ----- lint runs from wiki/<slug>/lint.json -----
  // run-lint writes a single report per process (overwrites on each pass).
  // No `by` field is stamped yet, so attribute to "the assistant" — the
  // skill that drove the run.
  const lintPath = join(WIKI_DIR, doc.slug, "lint.json");
  const lint = readJson<LintReport>(lintPath);
  if (lint?.generatedAt) {
    const total = lint.findings?.length ?? 0;
    const s = lint.summary ?? {};
    const breakdown = [
      s.conformance ? `${s.conformance} conformance` : "",
      s.discrepancy ? `${s.discrepancy} discrepancy` : "",
      s.question ? `${s.question} question` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    events.push({
      id: `l-${lint.generatedAt}`,
      kind: "lint",
      by: displayName(lint.by || "the assistant"),
      ts: lint.generatedAt,
      title: `ran a quality check — ${total} finding${total === 1 ? "" : "s"}`,
      sub: breakdown || undefined,
    });
  }

  // ----- section status from wiki/<slug>/sections.json -----
  // set_section_status.py stamps `by` + `date` per section. A status mark
  // (worked / confirmed-empty) is the SME's "I've thought about this slice"
  // signal — credit the person who said so.
  const sectionsPath = join(WIKI_DIR, doc.slug, "sections.json");
  const sections = readJson<SectionsManifest>(sectionsPath);
  if (sections) {
    for (const [sectionId, meta] of Object.entries(sections)) {
      if (!meta.by || !meta.date) continue;
      events.push({
        id: `s-${sectionId}-${meta.date}`,
        kind: "section-status",
        by: displayName(meta.by),
        ts: toIsoTs(meta.date),
        title: `marked ${sectionId} as ${meta.status}`,
        sub: meta.count ? `${meta.count} element${meta.count === 1 ? "" : "s"} on disk` : undefined,
      });
    }
  }

  // ----- ingest from wiki/<slug>/ingest.json (last extraction run) -----
  const ingestPath = join(WIKI_DIR, doc.slug, "ingest.json");
  const ingest = readJson<IngestReport>(ingestPath);
  if (ingest) {
    const created = ingest.created?.length ?? 0;
    const updated = ingest.updated?.length ?? 0;
    events.push({
      id: `i-${ingest.generatedAt}`,
      kind: "ingest",
      by: displayName(ingest.by || "the assistant"),
      ts: ingest.generatedAt,
      title: `extracted ${created} element${
        created === 1 ? "" : "s"
      } from ${ingest.file}`,
      sub:
        updated > 0
          ? `${updated} element${updated === 1 ? "" : "s"} updated · ingest run`
          : "first-time ingest",
    });
  }

  // Fallback so processes with no notes/ingest/uploads still show *something*.
  if (events.length === 0 && doc.lastModified) {
    events.push({
      id: `m-${doc.slug}`,
      kind: "draft",
      by: "the assistant",
      ts: doc.lastModified,
      title: `last touched the wiki`,
      sub: `${doc.elements.length} element${
        doc.elements.length === 1 ? "" : "s"
      } total — per-element edit attribution ships next`,
    });
  }

  events.sort((a, b) => b.ts.localeCompare(a.ts));

  const by: Record<string, ContributorRollup> = {};
  for (const e of events) {
    const key = e.by;
    if (!by[key]) {
      by[key] = {
        by: key,
        total: 0,
        approvals: 0,
        comments: 0,
        uploads: 0,
        drafts: 0,
        lastActiveAt: e.ts,
      };
    }
    const r = by[key];
    r.total++;
    if (e.kind === "comment") r.comments++;
    else if (e.kind === "upload") r.uploads++;
    else if (e.kind === "approval") r.approvals++;
    else if (e.kind === "draft") r.drafts++;
    else if (e.kind === "ingest") r.uploads++;
    // lint + section-status don't get their own rollup column yet — they're
    // just totals on the event list. Keep them out of the four buckets so
    // the rail numbers stay readable.
    if (e.ts > r.lastActiveAt) r.lastActiveAt = e.ts;
  }
  const rollups = Object.values(by).sort((a, b) => b.total - a.total);

  return {
    slug: doc.slug,
    events,
    rollups,
    totals: {
      events: events.length,
      approvals: events.filter((e) => e.kind === "approval").length,
      comments: events.filter((e) => e.kind === "comment").length,
      uploads: events.filter((e) => e.kind === "upload" || e.kind === "ingest")
        .length,
    },
  };
}

export function dayBucket(iso: string, now: Date = new Date()): string {
  const t = new Date(iso);
  const sameDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
  if (sameDay(t, now)) return "Today";
  const y = new Date(now);
  y.setUTCDate(y.getUTCDate() - 1);
  if (sameDay(t, y)) return "Yesterday";
  const days = Math.floor((now.getTime() - t.getTime()) / 86400000);
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
}

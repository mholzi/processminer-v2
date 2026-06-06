// The dtp-regenerate writer — shared by both session backends (claude-mcp-server
// and gemini-worker), the way buildIngestReport / applyLint are shared.
//
// It does the mechanical work the skill must not: derive a versioned filename,
// write the regenerated DTP markdown into raw-sources/<slug>/ (flagged
// `generated` in uploads.json so it stays distinct from immutable layer-1
// uploads), stamp finding ids, and persist the report to the runtime store
// (R9 — derived/transient state lives above the wiki, never inside the JSON).
//
// The only durable output is the .md artifact; the findings + pointer are
// runtime state. The process JSON is never touched.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { getRuntime, writeRuntime } from "./runtime-store.ts";
import type { DtpFinding, DtpReport } from "./runtime-store.ts";

/** The payload the skill hands the writeDtpReport tool. */
export interface DtpReportInput {
  basis?: string;
  /** Original DTP filename the regeneration is based on (doc.ingest.file). */
  sourceFile?: string;
  /** The full regenerated DTP, as Markdown. */
  markdown?: string;
  findings?: unknown[];
  /** The DTP sections the run reviewed (coverage map). */
  coverage?: unknown;
}

const KINDS = new Set(["outdated", "missing", "contradiction", "added"]);
const SEVERITIES = new Set(["high", "medium", "low"]);
const SUGGESTED = new Set(["accepted", "dismissed"]);

/** Normalise the coverage block a run emits (the DTP sections it reviewed). */
function stampCoverage(raw: unknown): { dtpSections: string[] } | undefined {
  const secs = (raw as { dtpSections?: unknown })?.dtpSections;
  if (!Array.isArray(secs)) return undefined;
  const dtpSections = secs.map(String).map((s) => s.trim()).filter(Boolean);
  return dtpSections.length ? { dtpSections } : undefined;
}

/** Normalise + id-stamp the skill's raw findings (DTPF-001…). The tool owns the
 *  format; the skill owns the judgement — mirrors buildTargetReview's R-001 pass. */
export function stampDtpFindings(raw: unknown): DtpFinding[] {
  const arr = Array.isArray(raw) ? raw : [];
  return (arr as Array<Record<string, unknown>>).map((it, i) => ({
    id: `DTPF-${String(i + 1).padStart(3, "0")}`,
    kind: (KINDS.has(it?.kind as string) ? it.kind : "contradiction") as DtpFinding["kind"],
    ...(typeof it?.headline === "string" && it.headline.trim()
      ? { headline: it.headline.trim() }
      : {}),
    dtpSays: String(it?.dtpSays ?? "—"),
    wikiSays: String(it?.wikiSays ?? ""),
    elements: Array.isArray(it?.elements) ? (it.elements as unknown[]).map(String) : [],
    severity: (SEVERITIES.has(it?.severity as string)
      ? it.severity
      : "medium") as DtpFinding["severity"],
    ...(typeof it?.rationale === "string" && it.rationale.trim()
      ? { rationale: it.rationale.trim() }
      : {}),
    ...(SUGGESTED.has(it?.suggestedDisposition as string)
      ? { suggestedDisposition: it.suggestedDisposition as "accepted" | "dismissed" }
      : {}),
    disposition: "open" as const,
  }));
}

/** Sanitise an original DTP filename into a safe basename (no extension), the
 *  same character rules the upload route applies. */
function sanitiseBase(name: string): string {
  return (
    (name || "dtp")
      .split(/[\\/]/)
      .pop()!
      .replace(/\.[^.]+$/, "")
      .replace(/[^A-Za-z0-9._-]+/g, "_")
      .replace(/^[._]+/, "") || "dtp"
  );
}

/** Gather the existing DTP run history, migrating the legacy single-report
 *  field into the array on first read. Newest first. */
function existingReports(slug: string): DtpReport[] {
  const rt = getRuntime(slug);
  if (Array.isArray(rt.dtpReports)) return rt.dtpReports;
  if (rt.dtpReport) {
    return [
      {
        ...rt.dtpReport,
        runId: rt.dtpReport.runId ?? "DTP-REGEN-001",
        mode: rt.dtpReport.mode ?? "regenerate",
      },
    ];
  }
  return [];
}

/** Next "DTP-REGEN-NNN" run id, one past the highest existing. (One id space for
 *  both compare and regenerate runs, so the history reads as one timeline.) */
function nextRunId(reports: DtpReport[]): string {
  let max = 0;
  for (const r of reports) {
    const m = /^DTP-REGEN-(\d+)$/.exec(r.runId ?? "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `DTP-REGEN-${String(max + 1).padStart(3, "0")}`;
}

/** Stamp a run id and prepend the report to the past-comparison history. */
function appendReport(
  slug: string,
  report: Omit<DtpReport, "runId">,
): DtpReport {
  const history = existingReports(slug);
  const full: DtpReport = { runId: nextRunId(history), ...report };
  writeRuntime(slug, { dtpReports: [full, ...history], dtpReport: undefined });
  return full;
}

/** The payload the writeDtpComparison tool hands in — a review-only run. */
export interface DtpComparisonInput {
  /** The DTP filename the comparison reviewed (under raw-sources/<slug>/). */
  sourceFile?: string;
  findings?: unknown[];
  /** The DTP sections the comparison reviewed (coverage map). */
  coverage?: unknown;
}

/**
 * Record a comparison-only run: the chosen DTP critically reviewed against the
 * corrected As-Is wiki. No markdown is generated and no artifact is written —
 * only the findings + pointer land in the runtime history (R9).
 */
export function writeDtpComparison(
  slug: string,
  input: DtpComparisonInput,
  _by?: string,
): { runId: string; findingCount: number } {
  const findings = stampDtpFindings(input.findings);
  const coverage = stampCoverage(input.coverage);
  const { runId } = appendReport(slug, {
    mode: "compare",
    generatedAt: new Date().toISOString(),
    basis: "as-is",
    sourceFile: input.sourceFile || "",
    findings,
    ...(coverage ? { coverage } : {}),
  });
  return { runId, findingCount: findings.length };
}

/**
 * Write a regenerated DTP + its critical-review report. Returns the artifact
 * filename, run id and finding count for the skill's closing summary. Atomic-ish:
 * the .md is written, then uploads.json, then the runtime report appended to the
 * past-comparison history (newest first).
 */
export function writeDtpReport(
  slug: string,
  input: DtpReportInput,
  by?: string,
): { generatedFile: string; runId: string; findingCount: number } {
  const dir = join(process.cwd(), "raw-sources", slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  // Versioned filename — <base>-regenerated-v<n>.md, n past the highest existing.
  const base = sanitiseBase(input.sourceFile || `${slug}-dtp`);
  const rx = new RegExp(
    `^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-regenerated-v(\\d+)\\.md$`,
  );
  let maxV = 0;
  for (const f of readdirSync(dir)) {
    const m = f.match(rx);
    if (m) maxV = Math.max(maxV, parseInt(m[1], 10));
  }
  const generatedFile = `${base}-regenerated-v${maxV + 1}.md`;
  writeFileSync(join(dir, generatedFile), input.markdown ?? "", "utf8");

  // uploads.json — record it, flagged `generated`, so listSources marks it
  // apart from a genuine upload.
  const manifestPath = join(dir, "uploads.json");
  let manifest: Record<string, unknown> = {};
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      manifest = {};
    }
  }
  manifest[generatedFile] = {
    by: by || undefined,
    at: new Date().toISOString(),
    generated: true,
    from: input.sourceFile || undefined,
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const findings = stampDtpFindings(input.findings);
  const coverage = stampCoverage(input.coverage);
  const { runId } = appendReport(slug, {
    mode: "regenerate",
    generatedAt: new Date().toISOString(),
    basis: "as-is",
    sourceFile: input.sourceFile || "",
    generatedFile,
    findings,
    ...(coverage ? { coverage } : {}),
  });

  return { generatedFile, runId, findingCount: findings.length };
}

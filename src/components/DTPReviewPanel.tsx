"use client";

import { useEffect, useMemo, useState } from "react";
import { diffLines } from "diff";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DtpReport, DtpFinding, DtpDisposition } from "@/lib/runtime-store";
import type { SourceFile } from "@/lib/wiki";

/** Resolve an element id to its element + type label, for chips, the
 *  evidence-provenance badge and the evidence drill-down. Shape matches
 *  ProcessDocScreen's getRef. */
type GetRef = (
  id: string,
) =>
  | {
      page: {
        id: string;
        type: string;
        title: string;
        meta: Record<string, string | string[]>;
        body?: string;
      };
      typeLabel: string;
    }
  | undefined;

/** An As-Is element in the inventory, for the coverage map. */
type AsIsElement = { id: string; typeLabel: string; title: string };

const COMPLIANCE_TYPES = new Set([
  "control",
  "regulation",
  "audit-finding",
  "compliance-gap",
]);

/** Does any implicated element carry compliance weight (control / regulation)? */
function touchesCompliance(f: DtpFinding, getRef: GetRef): boolean {
  return f.elements.some((id) => COMPLIANCE_TYPES.has(getRef(id)?.page.type ?? ""));
}

// The two actions name their real effect (review R3 — "Accept/Dismiss" read as
// the opposite of what they do): "Fix in DTP" = a correction to make manually in
// the procedure document; "Reconcile wiki…" = not a DTP change, opens a chat to
// update the wiki instead (the trailing … signals it starts a flow).
const DISPOSITIONS: { key: DtpDisposition; label: string; hint: string }[] = [
  { key: "open", label: "Open", hint: "Not yet decided" },
  {
    key: "accepted",
    label: "Fix in DTP",
    hint: "A correction to make manually in the procedure document",
  },
  {
    key: "dismissed",
    label: "Reconcile wiki…",
    hint: "Not a DTP change — opens a chat to update the wiki instead",
  },
];

/** A one-line summary for scanning — the emitted headline, or a sensible
 *  fallback derived from the two sides. */
function findingHeadline(f: DtpFinding): string {
  if (f.headline) return f.headline;
  if (f.kind === "missing") return f.wikiSays;
  return f.dtpSays && f.dtpSays !== "—" ? f.dtpSays : f.wikiSays;
}

/** "approved" when every resolvable implicated element is approved; "draft"
 *  when at least one isn't; null when none resolve (no badge). */
function evidenceProvenance(f: DtpFinding, getRef: GetRef): "approved" | "draft" | null {
  const resolved = f.elements.map((id) => getRef(id)).filter(Boolean) as NonNullable<
    ReturnType<GetRef>
  >[];
  if (resolved.length === 0) return null;
  return resolved.every((r) => r.page.meta.approval === "approved") ? "approved" : "draft";
}

// The DTP Enhancer module — shown after the As-Is is worked.
//
// It has two screens:
//   1. Home — the entry-point launcher: three actions (regenerate from an
//      uploaded source DTP, upload an old DTP, browse past comparisons) plus a
//      table of the past-comparison history.
//   2. Run — for one chosen comparison: a full-text diff of the regenerated DTP
//      against its original (jsdiff, fetched on demand from /api/sources) and
//      the critical-review findings that run produced.
//
// Each regenerated .md is a real artifact under raw-sources/<slug>/; the report
// pointers + findings live in the runtime store as a history (R9). Generation
// runs through the chat (onRegenerate), mirroring council-review / area-summary.

type FileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; original: string; generated: string };

async function fetchSource(slug: string, file: string): Promise<string> {
  const res = await fetch(
    `/api/sources?slug=${encodeURIComponent(slug)}&file=${encodeURIComponent(file)}`,
  );
  if (!res.ok) throw new Error(`Could not load ${file}`);
  const json = (await res.json()) as { content?: string; error?: string };
  if (typeof json.content !== "string") throw new Error(json.error || `Could not load ${file}`);
  return json.content;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function DTPReviewPanel({
  slug,
  reports,
  sources,
  status,
  onCompare,
  onRegenerate,
  onUpload,
  onGoToElement,
  getRef,
  asIsElements,
  onSetDisposition,
  onDiscussFinding,
  onGenerateSummary,
}: {
  slug: string;
  reports: DtpReport[];
  sources: SourceFile[];
  status: "idle" | "generating" | "error";
  /** Review the chosen DTP against the As-Is (findings only, no regeneration). */
  onCompare: (file: string) => void;
  /** Rebuild the DTP from the As-Is (legacy regenerate path, with diff). */
  onRegenerate: (file?: string) => void;
  onUpload: () => void;
  onGoToElement: (id: string) => void;
  getRef: GetRef;
  /** The As-Is element inventory, for the coverage map. */
  asIsElements: AsIsElement[];
  onSetDisposition: (
    runId: string,
    findingId: string,
    disposition: DtpDisposition,
  ) => Promise<boolean>;
  /** Dismissing a finding hands it to the chat to reconcile the wiki. */
  onDiscussFinding: (finding: DtpFinding) => void;
  /** Generate the executive-summary memo for a run (runs the dtp-summary skill). */
  onGenerateSummary: (report: DtpReport) => void;
}) {
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const activeReport = reports.find((r) => r.runId === activeRunId) ?? null;

  if (status === "generating") {
    return (
      <div className="section-summary">
        <div className="section-summary-status">
          <span className="section-summary-spinner" /> Reviewing the DTP against
          the corrected As-Is… this takes a moment.
        </div>
      </div>
    );
  }

  if (activeReport) {
    return (
      <RunView
        slug={slug}
        report={activeReport}
        onBack={() => setActiveRunId(null)}
        onCompare={onCompare}
        onRegenerate={onRegenerate}
        onGoToElement={onGoToElement}
        getRef={getRef}
        asIsElements={asIsElements}
        onSetDisposition={onSetDisposition}
        onDiscussFinding={onDiscussFinding}
        onGenerateSummary={onGenerateSummary}
      />
    );
  }

  return (
    <Home
      reports={reports}
      sources={sources}
      status={status}
      onCompare={onCompare}
      onUpload={onUpload}
      onOpenRun={setActiveRunId}
    />
  );
}

/* ---- Home: the three-card launcher + past-comparison history ---- */

function Home({
  reports,
  sources,
  status,
  onCompare,
  onUpload,
  onOpenRun,
}: {
  reports: DtpReport[];
  sources: SourceFile[];
  status: "idle" | "generating" | "error";
  onCompare: (file: string) => void;
  onUpload: () => void;
  onOpenRun: (runId: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  // Only genuine uploads are valid sources to regenerate from — never our own
  // generated artifacts.
  const picks = useMemo(() => sources.filter((s) => !s.generated), [sources]);

  return (
    <div className="dtpx">
      {status === "error" && (
        <p className="section-summary-err">The last comparison failed — try again.</p>
      )}

      <div className="dtpx-cards">
        {/* 1 — regenerate from an uploaded source DTP */}
        <div className="dtpx-card">
          <span className="dtpx-cico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
            </svg>
          </span>
          <h3>Select a source DTP</h3>
          <p>Compare a procedure document already uploaded to this process against the corrected As-Is.</p>
          {pickerOpen ? (
            <div className="dtpx-picker">
              {picks.length === 0 ? (
                <p className="dtpx-picker-empty">No uploaded documents yet.</p>
              ) : (
                picks.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    className="dtpx-picker-row"
                    onClick={() => {
                      setPickerOpen(false);
                      onCompare(s.name);
                    }}
                    title={`Compare ${s.name} against the As-Is`}
                  >
                    <span className="dtpx-picker-ico">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                        <path d="M14 3v5h5" />
                      </svg>
                    </span>
                    <span className="dtpx-picker-name">{s.name}</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <button className="dtpx-btn primary" onClick={() => setPickerOpen(true)}>
              Choose document
            </button>
          )}
        </div>

        {/* 2 — upload an old DTP from outside */}
        <div className="dtpx-card">
          <span className="dtpx-cico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4" />
              <path d="m6 10 6-6 6 6" />
              <path d="M4 20h16" />
            </svg>
          </span>
          <h3>Upload an old DTP</h3>
          <p>Bring in a procedure doc from outside to compare against the wiki.</p>
          <button className="dtpx-btn" onClick={onUpload}>
            Upload file
          </button>
        </div>

        {/* 3 — browse the past-comparison history */}
        <div className="dtpx-card">
          <span className="dtpx-cico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v5h5" />
              <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <h3>Past comparisons</h3>
          <p>Revisit previous regeneration runs and their findings.</p>
          <button
            className="dtpx-btn"
            disabled={reports.length === 0}
            onClick={() => onOpenRun(reports[0].runId)}
          >
            Open latest
          </button>
        </div>
      </div>

      <div className="dtpx-recent">
        <div className="dtpx-recent-head">
          <h2>Past comparisons</h2>
          <span className="dtpx-recent-n">
            {reports.length} run{reports.length === 1 ? "" : "s"}
          </span>
        </div>
        {reports.length === 0 ? (
          <p className="dtpx-empty">
            No comparisons yet — pick a source DTP above to run the first one.
          </p>
        ) : (
          <div className="dtpx-tbl">
            <div className="dtpx-tr colh">
              <span>Run</span>
              <span>Source document</span>
              <span>Findings</span>
              <span>Date</span>
              <span />
            </div>
            {reports.map((r) => (
              <button
                type="button"
                key={r.runId}
                className="dtpx-tr"
                onClick={() => onOpenRun(r.runId)}
                title={`Open ${r.runId}`}
              >
                <span className="dtpx-run">
                  <span className="dtpx-mono">{r.runId}</span>
                  <span className="dtpx-mode">
                    {r.mode === "regenerate" ? "Regenerated" : "Comparison"}
                  </span>
                </span>
                <span className="dtpx-fn">
                  <span className="dtpx-fn-ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                      <path d="M14 3v5h5" />
                    </svg>
                  </span>
                  <span>{r.sourceFile || "—"}</span>
                </span>
                <span className="dtpx-badge">
                  {r.findings.length} finding{r.findings.length === 1 ? "" : "s"}
                </span>
                <span className="dtpx-mono">{fmtDate(r.generatedAt)}</span>
                <span className="dtpx-chev">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Run: one comparison's diff + critical review ---- */

function RunView({
  slug,
  report,
  onBack,
  onCompare,
  onRegenerate,
  onGoToElement,
  getRef,
  asIsElements,
  onSetDisposition,
  onDiscussFinding,
  onGenerateSummary,
}: {
  slug: string;
  report: DtpReport;
  onBack: () => void;
  onCompare: (file: string) => void;
  onRegenerate: (file?: string) => void;
  onGoToElement: (id: string) => void;
  getRef: GetRef;
  asIsElements: AsIsElement[];
  onSetDisposition: (
    runId: string,
    findingId: string,
    disposition: DtpDisposition,
  ) => Promise<boolean>;
  onDiscussFinding: (finding: DtpFinding) => void;
  onGenerateSummary: (report: DtpReport) => void;
}) {
  // Only regenerate runs carry a regenerated artifact + full-text diff. A
  // comparison run is findings-only.
  const isRegen = report.mode === "regenerate" && !!report.generatedFile;
  const [files, setFiles] = useState<FileState>({ status: "loading" });
  const [changesOnly, setChangesOnly] = useState(true);

  useEffect(() => {
    if (!isRegen || !report.generatedFile) return;
    let live = true;
    setFiles({ status: "loading" });
    const generatedFile = report.generatedFile;
    Promise.all([
      fetchSource(slug, report.sourceFile),
      fetchSource(slug, generatedFile),
    ])
      .then(([original, generated]) => {
        if (live) setFiles({ status: "ready", original, generated });
      })
      .catch((e: unknown) => {
        if (live)
          setFiles({
            status: "error",
            message: e instanceof Error ? e.message : "Could not load the documents.",
          });
      });
    return () => {
      live = false;
    };
  }, [isRegen, slug, report.sourceFile, report.generatedFile]);

  function download() {
    if (files.status !== "ready" || !report.generatedFile) return;
    const blob = new Blob([files.generated], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = report.generatedFile;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dtp">
      <div className="dtp-head">
        <div className="dtp-head-meta">
          <button type="button" className="dtp-back" onClick={onBack}>
            ‹ Past comparisons
          </button>
          <span className="dtp-head-dot">·</span>
          <span className="dtpx-mono">{report.runId}</span>
          <span className="dtp-head-dot">·</span>
          <span>
            {isRegen ? "Regenerated from" : "Compared"} <b>{report.sourceFile}</b>
            {isRegen ? "" : " against the As-Is"}
          </span>
          <span className="dtp-head-dot">·</span>
          <span>
            {new Date(report.generatedAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
        <div className="dtp-head-actions">
          {isRegen && (
            <button
              className="section-summary-btn"
              onClick={download}
              disabled={files.status !== "ready"}
            >
              ↓ Download .md
            </button>
          )}
          {isRegen ? (
            <button
              className="section-summary-btn"
              onClick={() => onRegenerate(report.sourceFile || undefined)}
            >
              Regenerate
            </button>
          ) : (
            <button
              className="section-summary-btn"
              onClick={() => report.sourceFile && onCompare(report.sourceFile)}
              disabled={!report.sourceFile}
            >
              Re-run comparison
            </button>
          )}
        </div>
      </div>

      <SummaryBlock report={report} onGenerate={() => onGenerateSummary(report)} />

      {isRegen && (
        <section className="dtp-block">
          <div className="dtp-block-head">
            <h2>Document diff</h2>
            <label className="dtp-toggle">
              <input
                type="checkbox"
                checked={changesOnly}
                onChange={(e) => setChangesOnly(e.target.checked)}
              />
              Changes only
            </label>
          </div>
          {files.status === "loading" && (
            <div className="section-summary-status">
              <span className="section-summary-spinner" /> Loading documents…
            </div>
          )}
          {files.status === "error" && (
            <div className="section-summary-err">{files.message}</div>
          )}
          {files.status === "ready" && (
            <Diff
              original={files.original}
              generated={files.generated}
              changesOnly={changesOnly}
            />
          )}
        </section>
      )}

      <RunRollup findings={report.findings} getRef={getRef} />

      <CoverageMap
        findings={report.findings}
        coverage={report.coverage}
        asIsElements={asIsElements}
        onGoToElement={onGoToElement}
      />

      <FindingsList
        runId={report.runId}
        findings={report.findings}
        sourceFile={report.sourceFile}
        generatedAt={report.generatedAt}
        onGoToElement={onGoToElement}
        getRef={getRef}
        onSetDisposition={onSetDisposition}
        onDiscussFinding={onDiscussFinding}
      />
    </div>
  );
}

/* ---- Executive summary memo (generated by the dtp-summary skill) ---- */

function SummaryBlock({
  report,
  onGenerate,
}: {
  report: DtpReport;
  onGenerate: () => void;
}) {
  if (!report.summary) {
    return (
      <div className="dtp-summary dtp-summary-empty">
        <div>
          <span className="dtp-summary-h">Executive summary</span>
          <span className="dtp-summary-sub">
            A leadership memo on how far this DTP has drifted from the As-Is.
          </span>
        </div>
        <button className="section-summary-btn primary" onClick={onGenerate}>
          ✦ Generate executive summary
        </button>
      </div>
    );
  }
  return (
    <div className="dtp-summary">
      <div className="dtp-summary-head">
        <span className="dtp-summary-h">Executive summary</span>
        <button className="dtp-summary-regen" onClick={onGenerate}>
          Regenerate
        </button>
      </div>
      <div className="dtp-summary-body md">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.summary}</ReactMarkdown>
      </div>
    </div>
  );
}

/* ---- Run rollup: counts by kind + severity, compliance gaps called out ---- */

const KIND_LABEL: Record<DtpFinding["kind"], string> = {
  outdated: "Outdated",
  missing: "Missing",
  contradiction: "Contradiction",
  added: "Added",
};

function RunRollup({ findings, getRef }: { findings: DtpFinding[]; getRef: GetRef }) {
  const total = findings.length;
  const sev = { high: 0, medium: 0, low: 0 };
  const kind = { outdated: 0, missing: 0, contradiction: 0, added: 0 };
  let compliance = 0;
  for (const f of findings) {
    sev[f.severity]++;
    kind[f.kind]++;
    if (f.severity === "high" || touchesCompliance(f, getRef)) compliance++;
  }
  if (total === 0) return null;

  return (
    <div className="dtpr">
      <div className="dtpr-sevs">
        <span className="dtpr-total">{total}</span>
        <span className="dtpr-total-lbl">finding{total === 1 ? "" : "s"}</span>
        {(["high", "medium", "low"] as const).map((s) =>
          sev[s] ? (
            <span key={s} className={`dtpr-sev sev-${s}`}>
              <i /> {sev[s]} {s}
            </span>
          ) : null,
        )}
        {compliance > 0 && (
          <span className="dtpr-flag" title="High-severity or control/regulatory findings">
            ⚠ {compliance} control / high-risk
          </span>
        )}
      </div>
      <div className="dtpr-kinds">
        {(["outdated", "missing", "contradiction", "added"] as const).map((k) =>
          kind[k] ? (
            <span key={k} className={`dtpr-kind ${k}`}>
              {KIND_LABEL[k]} <b>{kind[k]}</b>
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

/* ---- Coverage map: DTP sections reviewed + As-Is elements not referenced ---- */

function CoverageMap({
  findings,
  coverage,
  asIsElements,
  onGoToElement,
}: {
  findings: DtpFinding[];
  coverage?: { dtpSections: string[] };
  asIsElements: AsIsElement[];
  onGoToElement: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const referenced = useMemo(() => {
    const s = new Set<string>();
    for (const f of findings) for (const id of f.elements) s.add(id);
    return s;
  }, [findings]);
  const untouched = asIsElements.filter((e) => !referenced.has(e.id));
  const touchedCount = asIsElements.length - untouched.length;
  const sections = coverage?.dtpSections ?? [];

  if (asIsElements.length === 0 && sections.length === 0) return null;

  return (
    <section className="dtp-block dtpc">
      <div className="dtp-block-head">
        <h2>Coverage</h2>
        <button type="button" className="dtpc-toggle" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide detail" : "Show detail"}
        </button>
      </div>

      <div className="dtpc-rows">
        <div className="dtpc-row">
          <span className="dtpc-lbl">DTP sections reviewed</span>
          <span className="dtpc-val">
            {sections.length ? `${sections.length}` : <em>not recorded for this run</em>}
          </span>
        </div>
        <div className="dtpc-row">
          <span className="dtpc-lbl">As-Is elements referenced</span>
          <span className="dtpc-val">
            {touchedCount} / {asIsElements.length}
            {untouched.length > 0 && (
              <span className="dtpc-gap"> · {untouched.length} with no recorded discrepancy</span>
            )}
          </span>
        </div>
      </div>

      {open && (
        <div className="dtpc-detail">
          {sections.length > 0 && (
            <div className="dtpc-chips">
              {sections.map((s, i) => (
                <span key={i} className="dtpc-sec">{s}</span>
              ))}
            </div>
          )}
          {untouched.length > 0 && (
            <>
              <p className="dtpc-note">
                As-Is elements no finding touched — either consistent with the DTP, or a blind spot:
              </p>
              <div className="dtpc-chips">
                {untouched.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className="dtpf-chip"
                    onClick={() => onGoToElement(e.id)}
                    title={`Go to ${e.id}`}
                  >
                    <span className="ty">{e.typeLabel}</span>
                    <span className="ti">{e.title || e.id}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

/* ---- Critical review: scannable list with expand-to-detail (variant C) ---- */

type FilterKey = "all" | "high" | "open" | "accepted";

// Export the Accepted findings — the worklist of manual DTP changes. The tool
// never edits the DTP, so this hands the editor a clean offline checklist.
const SEV_ORDER = { high: 0, medium: 1, low: 2 } as const;

function elementRefLabel(id: string, getRef: GetRef): string {
  const r = getRef(id);
  return r ? `${id} (${r.page.title})` : id;
}

function buildWorklistMarkdown(
  accepted: DtpFinding[],
  getRef: GetRef,
  meta: { sourceFile: string; runId: string; generatedAt: string },
): string {
  const head = [
    `# DTP change worklist — ${meta.sourceFile || "DTP"}`,
    "",
    `_${accepted.length} accepted item${accepted.length === 1 ? "" : "s"} · ${meta.runId} · ${fmtDate(meta.generatedAt)}_`,
    "",
    "Manual changes to make in the procedure document. Each item traces to the corrected As-Is wiki.",
    "",
  ];
  const body = accepted.map((f) => {
    const refs = f.elements.length
      ? f.elements.map((id) => elementRefLabel(id, getRef)).join(", ")
      : "—";
    return [
      `## [ ] ${f.id} · ${KIND_LABEL[f.kind]} · ${f.severity}`,
      `**${findingHeadline(f)}**`,
      "",
      `- DTP says: ${f.dtpSays || "—"}`,
      `- As-Is holds: ${f.wikiSays}`,
      ...(f.rationale ? [`- Why: ${f.rationale}`] : []),
      `- Wiki: ${refs}`,
      "",
    ].join("\n");
  });
  return head.concat(body).join("\n");
}

function csvCell(v: string): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function buildWorklistCsv(accepted: DtpFinding[]): string {
  const header = [
    "id",
    "kind",
    "severity",
    "headline",
    "dtpSays",
    "wikiSays",
    "rationale",
    "elements",
  ].join(",");
  const rows = accepted.map((f) =>
    [
      f.id,
      f.kind,
      f.severity,
      findingHeadline(f),
      f.dtpSays,
      f.wikiSays,
      f.rationale ?? "",
      f.elements.join("; "),
    ]
      .map(csvCell)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function downloadFile(name: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function FindingsList({
  runId,
  findings,
  sourceFile,
  generatedAt,
  onGoToElement,
  getRef,
  onSetDisposition,
  onDiscussFinding,
}: {
  runId: string;
  findings: DtpFinding[];
  sourceFile: string;
  generatedAt: string;
  onGoToElement: (id: string) => void;
  getRef: GetRef;
  onSetDisposition: (
    runId: string,
    findingId: string,
    disposition: DtpDisposition,
  ) => Promise<boolean>;
  onDiscussFinding: (finding: DtpFinding) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(findings[0]?.id ?? null);
  const [filter, setFilter] = useState<FilterKey>("all");
  // Optimistic disposition overrides, keyed by finding id.
  const [dispo, setDispo] = useState<Record<string, DtpDisposition>>({});
  const dispoOf = (f: DtpFinding): DtpDisposition =>
    dispo[f.id] ?? f.disposition ?? "open";

  const shown = useMemo(
    () =>
      findings.filter((f) => {
        if (filter === "high") return f.severity === "high";
        if (filter === "open") return dispoOf(f) === "open";
        if (filter === "accepted") return dispoOf(f) === "accepted";
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [findings, filter, dispo],
  );

  function setDisposition(f: DtpFinding, d: DtpDisposition) {
    setDispo((m) => ({ ...m, [f.id]: d }));
    void onSetDisposition(runId, f.id, d);
    // Dismissing isn't a DTP change — hand the finding to the chat to work out
    // what (if anything) needs to change in the wiki instead.
    if (d === "dismissed") onDiscussFinding(f);
  }

  const openCount = findings.filter((f) => dispoOf(f) === "open").length;
  const accepted = findings.filter((f) => dispoOf(f) === "accepted");
  const acceptedCount = accepted.length;

  function exportAccepted(fmt: "md" | "csv") {
    const sorted = [...accepted].sort(
      (a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity],
    );
    const base = (sourceFile || "dtp").replace(/\.[^.]+$/, "");
    if (fmt === "md") {
      downloadFile(
        `${base}-dtp-worklist.md`,
        buildWorklistMarkdown(sorted, getRef, { sourceFile, runId, generatedAt }),
        "text/markdown",
      );
    } else {
      downloadFile(`${base}-dtp-worklist.csv`, buildWorklistCsv(sorted), "text/csv");
    }
  }

  return (
    <section className="dtp-block">
      <div className="dtp-block-head">
        <h2>Critical review</h2>
        <div className="dtpf-filters">
          {(
            [
              { k: "all", label: `All ${findings.length}` },
              { k: "high", label: "High" },
              { k: "open", label: `Open ${openCount}` },
              { k: "accepted", label: `Accepted ${acceptedCount}` },
            ] as { k: FilterKey; label: string }[]
          ).map(({ k, label }) => (
            <button
              key={k}
              type="button"
              className={`dtpf-fl${filter === k ? " on" : ""}`}
              onClick={() => setFilter(k)}
            >
              {label}
            </button>
          ))}
          {acceptedCount > 0 && (
            <>
              <span className="dtpf-sep" />
              <span className="dtpf-export-lbl">Export accepted</span>
              <button
                type="button"
                className="dtpf-export-btn"
                onClick={() => exportAccepted("md")}
                title="Download the accepted worklist as Markdown"
              >
                ↓ .md
              </button>
              <button
                type="button"
                className="dtpf-export-btn"
                onClick={() => exportAccepted("csv")}
                title="Download the accepted worklist as CSV"
              >
                ↓ .csv
              </button>
            </>
          )}
        </div>
      </div>

      {findings.length === 0 ? (
        <p className="dtp-empty-findings">
          No material discrepancies — the DTP matches the analysed As-Is.
        </p>
      ) : shown.length === 0 ? (
        <p className="dtp-empty-findings">No findings match this filter.</p>
      ) : (
        <div className="dtpf-list">
          {shown.map((f) => (
            <FindingRow
              key={f.id}
              finding={f}
              disposition={dispoOf(f)}
              expanded={expanded === f.id}
              onToggle={() => setExpanded(expanded === f.id ? null : f.id)}
              onGoToElement={onGoToElement}
              getRef={getRef}
              onSetDisposition={(d) => setDisposition(f, d)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

const KIND_CLASS: Record<DtpFinding["kind"], string> = {
  outdated: "outdated",
  missing: "missing",
  contradiction: "contradiction",
  added: "added",
};

function FindingRow({
  finding: f,
  disposition,
  expanded,
  onToggle,
  onGoToElement,
  getRef,
  onSetDisposition,
}: {
  finding: DtpFinding;
  disposition: DtpDisposition;
  expanded: boolean;
  onToggle: () => void;
  onGoToElement: (id: string) => void;
  getRef: GetRef;
  onSetDisposition: (d: DtpDisposition) => void;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const prov = evidenceProvenance(f, getRef);
  const refs = f.elements.map((id) => {
    const ref = getRef(id);
    return {
      id,
      typeLabel: ref?.typeLabel,
      title: ref?.page.title,
      body: ref?.page.body,
    };
  });
  const evidence = refs.filter((r) => r.body && r.body.trim());
  const done = disposition !== "open";
  // Suggested-disposition hint, shown only while still open.
  const suggested = !done ? f.suggestedDisposition : undefined;
  const suggestLabel =
    suggested === "accepted" ? "Accept" : suggested === "dismissed" ? "Dismiss" : null;

  return (
    <div className={`dtpf-item${expanded ? " open" : ""}${done ? " done" : ""}`}>
      <button type="button" className="dtpf-row" onClick={onToggle}>
        <span className={`dtpf-dot sev-${f.severity}`} />
        <span className={`dtpf-kind ${KIND_CLASS[f.kind]}`}>{f.kind}</span>
        <span className="dtpf-hl">{findingHeadline(f)}</span>
        <span className="dtpf-row-right">
          {refs[0] && (
            <span className="dtpf-chip-mini">{refs[0].title ?? refs[0].id}</span>
          )}
          {refs.length > 1 && <span className="dtpf-chip-mini">+{refs.length - 1}</span>}
          {done && <span className={`dtpf-state ${disposition}`}>{disposition}</span>}
          <span className="dtpf-id">{f.id}</span>
        </span>
        <span className="dtpf-chev">›</span>
      </button>

      {expanded && (
        <div className="dtpf-detail">
          <div className="dtpf-detail-in">
            {(f.rationale || suggestLabel) && (
              <div className="dtpf-meta">
                {f.rationale && (
                  <span className={`dtpf-why sev-${f.severity}`}>
                    Why {f.severity}: {f.rationale}
                  </span>
                )}
                {suggestLabel && (
                  <span className="dtpf-suggest">Suggested: {suggestLabel}</span>
                )}
              </div>
            )}

            <div className="dtpf-cmp">
              <div className="dtpf-side old">
                <div className="dtpf-side-lab">In the DTP</div>
                <p>{f.dtpSays && f.dtpSays !== "—" ? f.dtpSays : <em>Not mentioned.</em>}</p>
              </div>
              <div className="dtpf-arrow">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </div>
              <div className="dtpf-side new">
                <div className="dtpf-side-lab">
                  Per the As-Is
                  {prov && <span className={`dtpf-prov ${prov}`}>{prov === "approved" ? "Approved" : "Draft"}</span>}
                </div>
                <p>{f.wikiSays}</p>
              </div>
            </div>

            {evidence.length > 0 && (
              <div className="dtpf-evidence">
                <button
                  type="button"
                  className="dtpf-evidence-toggle"
                  onClick={() => setShowEvidence((v) => !v)}
                >
                  {showEvidence ? "▾" : "▸"} Wiki evidence ({evidence.length})
                </button>
                {showEvidence && (
                  <div className="dtpf-evidence-body">
                    {evidence.map((e) => (
                      <div key={e.id} className="dtpf-ev-item">
                        <button
                          type="button"
                          className="dtpf-ev-head"
                          onClick={() => onGoToElement(e.id)}
                          title={`Go to ${e.id}`}
                        >
                          <span className="ty">{e.typeLabel}</span>
                          <span className="ti">{e.title ?? e.id}</span>
                          <span className="dtpf-id">{e.id}</span>
                        </button>
                        <p className="dtpf-ev-text">{e.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="dtpf-detail-foot">
              {refs.length > 0 && (
                <>
                  <span className="dtpf-lbl">Involves</span>
                  {refs.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className="dtpf-chip"
                      onClick={() => onGoToElement(c.id)}
                      title={`Go to ${c.id}`}
                    >
                      {c.typeLabel && <span className="ty">{c.typeLabel}</span>}
                      <span className="ti">{c.title ?? c.id}</span>
                    </button>
                  ))}
                </>
              )}
              <div className="dtpf-seg">
                {DISPOSITIONS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`${disposition === d.key ? "on" : ""}${
                      suggested === d.key ? " suggested" : ""
                    }`}
                    onClick={() => onSetDisposition(d.key)}
                    title={
                      suggested === d.key
                        ? `${d.hint} · suggested by the analysis`
                        : d.hint
                    }
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Diff({
  original,
  generated,
  changesOnly,
}: {
  original: string;
  generated: string;
  changesOnly: boolean;
}) {
  const parts = useMemo(() => diffLines(original, generated), [original, generated]);
  // Flatten into per-line rows so unchanged context can be hidden on demand.
  const rows: { kind: "add" | "del" | "ctx"; text: string }[] = [];
  for (const part of parts) {
    const kind = part.added ? "add" : part.removed ? "del" : "ctx";
    const lines = part.value.replace(/\n$/, "").split("\n");
    for (const line of lines) rows.push({ kind, text: line });
  }
  const shown = changesOnly ? rows.filter((r) => r.kind !== "ctx") : rows;

  if (shown.length === 0) {
    return <p className="dtp-empty-findings">The documents are identical.</p>;
  }

  return (
    <pre className="dtp-diff">
      {shown.map((r, i) => (
        <div key={i} className={`dtp-diff-line ${r.kind}`}>
          <span className="dtp-diff-gutter">
            {r.kind === "add" ? "+" : r.kind === "del" ? "−" : " "}
          </span>
          <span className="dtp-diff-text">{r.text || " "}</span>
        </div>
      ))}
    </pre>
  );
}


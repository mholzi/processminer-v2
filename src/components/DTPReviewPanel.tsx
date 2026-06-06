"use client";

import { useEffect, useMemo, useState } from "react";
import { diffLines } from "diff";
import type { DtpReport, DtpFinding, DtpDisposition } from "@/lib/runtime-store";
import type { SourceFile } from "@/lib/wiki";

/** Resolve an element id to its title + type label + approval, for chips and
 *  the evidence-provenance badge. Shape matches ProcessDocScreen's getRef. */
type GetRef = (
  id: string,
) =>
  | { page: { title: string; meta: Record<string, string | string[]> }; typeLabel: string }
  | undefined;

// "Accept" = a DTP correction to make manually; "Dismiss" = not a DTP change —
// opens a chat to reconcile the wiki instead.
const DISPOSITIONS: { key: DtpDisposition; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "accepted", label: "Accept" },
  { key: "dismissed", label: "Dismiss" },
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
  onSetDisposition,
  onDiscussFinding,
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
  onSetDisposition: (
    runId: string,
    findingId: string,
    disposition: DtpDisposition,
  ) => Promise<boolean>;
  /** Dismissing a finding hands it to the chat to reconcile the wiki. */
  onDiscussFinding: (finding: DtpFinding) => void;
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
        onSetDisposition={onSetDisposition}
        onDiscussFinding={onDiscussFinding}
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
  onSetDisposition,
  onDiscussFinding,
}: {
  slug: string;
  report: DtpReport;
  onBack: () => void;
  onCompare: (file: string) => void;
  onRegenerate: (file?: string) => void;
  onGoToElement: (id: string) => void;
  getRef: GetRef;
  onSetDisposition: (
    runId: string,
    findingId: string,
    disposition: DtpDisposition,
  ) => Promise<boolean>;
  onDiscussFinding: (finding: DtpFinding) => void;
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

      <FindingsList
        runId={report.runId}
        findings={report.findings}
        onGoToElement={onGoToElement}
        getRef={getRef}
        onSetDisposition={onSetDisposition}
        onDiscussFinding={onDiscussFinding}
      />
    </div>
  );
}

/* ---- Critical review: scannable list with expand-to-detail (variant C) ---- */

type FilterKey = "all" | "high" | "open" | "accepted";

function FindingsList({
  runId,
  findings,
  onGoToElement,
  getRef,
  onSetDisposition,
  onDiscussFinding,
}: {
  runId: string;
  findings: DtpFinding[];
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
  const acceptedCount = findings.filter((f) => dispoOf(f) === "accepted").length;

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
  const prov = evidenceProvenance(f, getRef);
  const resolvedChips = f.elements.map((id) => {
    const ref = getRef(id);
    return { id, typeLabel: ref?.typeLabel, title: ref?.page.title };
  });
  const done = disposition !== "open";

  return (
    <div className={`dtpf-item${expanded ? " open" : ""}${done ? " done" : ""}`}>
      <button type="button" className="dtpf-row" onClick={onToggle}>
        <span className={`dtpf-dot sev-${f.severity}`} />
        <span className={`dtpf-kind ${KIND_CLASS[f.kind]}`}>{f.kind}</span>
        <span className="dtpf-hl">{findingHeadline(f)}</span>
        <span className="dtpf-row-right">
          {resolvedChips[0] && (
            <span className="dtpf-chip-mini">
              {resolvedChips[0].title ?? resolvedChips[0].id}
            </span>
          )}
          {resolvedChips.length > 1 && (
            <span className="dtpf-chip-mini">+{resolvedChips.length - 1}</span>
          )}
          {done && <span className={`dtpf-state ${disposition}`}>{disposition}</span>}
          <span className="dtpf-id">{f.id}</span>
        </span>
        <span className="dtpf-chev">›</span>
      </button>

      {expanded && (
        <div className="dtpf-detail">
          <div className="dtpf-detail-in">
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

            <div className="dtpf-detail-foot">
              {resolvedChips.length > 0 && (
                <>
                  <span className="dtpf-lbl">Involves</span>
                  {resolvedChips.map((c) => (
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
                    className={disposition === d.key ? "on" : ""}
                    onClick={() => onSetDisposition(d.key)}
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


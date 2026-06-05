"use client";

import { useEffect, useMemo, useState } from "react";
import { diffLines } from "diff";
import type { DtpReport, DtpFinding } from "@/lib/runtime-store";

// The DTP module — shown after the As-Is is worked. Two halves:
//   1. a full-text diff of the regenerated DTP against the original ingested
//      one (jsdiff, fetched on demand from /api/sources), and
//   2. the critical-review findings the dtp-regenerate skill produced.
// The regenerated .md is a real artifact under raw-sources/<slug>/; the report
// pointer + findings live in the runtime store (R9). Generation runs through
// the chat (onRegenerate), mirroring council-review / area-summary.

type FileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; original: string; generated: string };

const KIND_LABEL: Record<DtpFinding["kind"], string> = {
  outdated: "Outdated",
  missing: "Missing",
  contradiction: "Contradiction",
  added: "Added",
};

async function fetchSource(slug: string, file: string): Promise<string> {
  const res = await fetch(
    `/api/sources?slug=${encodeURIComponent(slug)}&file=${encodeURIComponent(file)}`,
  );
  if (!res.ok) throw new Error(`Could not load ${file}`);
  const json = (await res.json()) as { content?: string; error?: string };
  if (typeof json.content !== "string") throw new Error(json.error || `Could not load ${file}`);
  return json.content;
}

export default function DTPReviewPanel({
  slug,
  dtpReport,
  status,
  onRegenerate,
  onGoToElement,
}: {
  slug: string;
  dtpReport?: DtpReport;
  status: "idle" | "generating" | "error";
  onRegenerate: () => void;
  onGoToElement: (id: string) => void;
}) {
  if (status === "generating") {
    return (
      <div className="section-summary">
        <div className="section-summary-status">
          <span className="section-summary-spinner" /> Regenerating the DTP from
          the corrected As-Is and reviewing the original… this takes a moment.
        </div>
      </div>
    );
  }

  if (!dtpReport) {
    return (
      <div className="section-summary">
        <div className="section-summary-empty">
          <p>No regenerated DTP yet.</p>
          <p className="section-summary-sub">
            Once the As-Is is worked, regenerate the DTP from the wiki and
            critically review the original document against it.
          </p>
          {status === "error" && (
            <p className="section-summary-err">
              The last regeneration failed — try again.
            </p>
          )}
          <button className="section-summary-btn primary" onClick={onRegenerate}>
            ✦ Regenerate DTP
          </button>
        </div>
      </div>
    );
  }

  return (
    <Ready
      slug={slug}
      dtpReport={dtpReport}
      onRegenerate={onRegenerate}
      onGoToElement={onGoToElement}
    />
  );
}

function Ready({
  slug,
  dtpReport,
  onRegenerate,
  onGoToElement,
}: {
  slug: string;
  dtpReport: DtpReport;
  onRegenerate: () => void;
  onGoToElement: (id: string) => void;
}) {
  const [files, setFiles] = useState<FileState>({ status: "loading" });
  const [changesOnly, setChangesOnly] = useState(true);

  useEffect(() => {
    let live = true;
    setFiles({ status: "loading" });
    Promise.all([
      fetchSource(slug, dtpReport.sourceFile),
      fetchSource(slug, dtpReport.generatedFile),
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
  }, [slug, dtpReport.sourceFile, dtpReport.generatedFile]);

  function download() {
    if (files.status !== "ready") return;
    const blob = new Blob([files.generated], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = dtpReport.generatedFile;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dtp">
      <div className="dtp-head">
        <div className="dtp-head-meta">
          <span>
            Regenerated from <b>{dtpReport.sourceFile}</b>
          </span>
          <span className="dtp-head-dot">·</span>
          <span>
            {new Date(dtpReport.generatedAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
        <div className="dtp-head-actions">
          <button
            className="section-summary-btn"
            onClick={download}
            disabled={files.status !== "ready"}
          >
            ↓ Download .md
          </button>
          <button className="section-summary-btn" onClick={onRegenerate}>
            Regenerate
          </button>
        </div>
      </div>

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

      <section className="dtp-block">
        <div className="dtp-block-head">
          <h2>Critical review</h2>
          <span className="dtp-count">
            {dtpReport.findings.length} finding
            {dtpReport.findings.length === 1 ? "" : "s"}
          </span>
        </div>
        {dtpReport.findings.length === 0 ? (
          <p className="dtp-empty-findings">
            No material discrepancies — the original DTP matches the analysed
            As-Is.
          </p>
        ) : (
          <div className="dtp-findings">
            {dtpReport.findings.map((f) => (
              <DtpFindingCard key={f.id} finding={f} onGoToElement={onGoToElement} />
            ))}
          </div>
        )}
      </section>
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
          <span className="dtp-diff-text">{r.text || " "}</span>
        </div>
      ))}
    </pre>
  );
}

function DtpFindingCard({
  finding: f,
  onGoToElement,
}: {
  finding: DtpFinding;
  onGoToElement: (id: string) => void;
}) {
  return (
    <article className={`dtp-finding sev-${f.severity}`}>
      <div className="dtp-finding-top">
        <span className={`dtp-finding-kind ${f.kind}`}>{KIND_LABEL[f.kind]}</span>
        <span className="dtp-finding-id">{f.id}</span>
        <span className={`dtp-finding-sev sev-${f.severity}`}>{f.severity}</span>
      </div>
      <div className="dtp-finding-body">
        <div className="dtp-finding-side">
          <span className="dtp-finding-label">DTP says</span>
          <p>{f.dtpSays}</p>
        </div>
        <div className="dtp-finding-arrow">→</div>
        <div className="dtp-finding-side">
          <span className="dtp-finding-label">Wiki / analysis</span>
          <p>{f.wikiSays}</p>
        </div>
      </div>
      {f.elements.length > 0 && (
        <div className="finding-els">
          <span className="finding-els-label">Involves:</span>
          {f.elements.map((id) => (
            <button
              type="button"
              className="link-chip link-chip-nav"
              key={id}
              onClick={() => onGoToElement(id)}
              title={`Go to ${id}`}
            >
              {id}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

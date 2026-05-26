"use client";

import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// Coverage matrix for Control Gaps (compliance-gap elements) — severity ×
// status. Rows are HIGH / MEDIUM / LOW; columns are OPEN / IN-PROGRESS /
// CLOSED, bucketed from the schema's gapStatus enum (open / in-remediation
// / closed / resolved / addressed / addressed-in-target / remediated /
// mitigated / done). Worst cell to land on is HIGH × OPEN — flagged red.

type Severity = "HIGH" | "MEDIUM" | "LOW";
type Bucket = "OPEN" | "IN-PROGRESS" | "CLOSED";

const SEVS: Severity[] = ["HIGH", "MEDIUM", "LOW"];
const BUCKETS: Bucket[] = ["OPEN", "IN-PROGRESS", "CLOSED"];

function upper(v: unknown): string {
  return typeof v === "string" ? v.trim().toUpperCase() : "";
}
function lower(v: unknown): string {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function parseSeverity(raw: string): Severity | null {
  return SEVS.includes(raw as Severity) ? (raw as Severity) : null;
}

function bucketStatus(raw: string): Bucket | null {
  const v = lower(raw);
  if (v === "open") return "OPEN";
  if (
    v === "in-remediation" ||
    v === "addressed" ||
    v === "addressed-in-target" ||
    v === "mitigated"
  )
    return "IN-PROGRESS";
  if (v === "closed" || v === "resolved" || v === "remediated" || v === "done")
    return "CLOSED";
  return null;
}

export default function ControlGapsSummary({
  gaps,
  onPickElement,
  getRef,
}: {
  gaps: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  if (gaps.length === 0) return null;

  const grid: Record<Severity, Record<Bucket, WikiPage[]>> = {
    HIGH: { OPEN: [], "IN-PROGRESS": [], CLOSED: [] },
    MEDIUM: { OPEN: [], "IN-PROGRESS": [], CLOSED: [] },
    LOW: { OPEN: [], "IN-PROGRESS": [], CLOSED: [] },
  };
  const unclassified: WikiPage[] = [];
  for (const g of gaps) {
    const s = parseSeverity(upper(g.meta.severity));
    const b = bucketStatus(String(g.meta.gapStatus ?? ""));
    if (s && b) grid[s][b].push(g);
    else unclassified.push(g);
  }

  const highOpen = grid.HIGH.OPEN;
  const hasHighOpen = highOpen.length > 0;

  return (
    <section className="rcs-wrap">
      <div className="rcs-head">
        <span className="rcs-eyebrow">Open gaps</span>
        <span className="rcs-sub">
          {gaps.length} control gap{gaps.length === 1 ? "" : "s"} plotted on
          severity × status · HIGH × OPEN is the cell auditors land on first
        </span>
      </div>
      <div className="rcs-matrix rcs-matrix-3x3">
        <div className="rcs-mh" />
        {BUCKETS.map((b) => (
          <div className="rcs-mh" key={b}>
            {b}
          </div>
        ))}
        {SEVS.map((s) => (
          <RowFragment
            key={s}
            sev={s}
            grid={grid[s]}
            highlightOpen={s === "HIGH"}
            onPickElement={onPickElement}
            getRef={getRef}
          />
        ))}
      </div>
      {hasHighOpen && (
        <div className="rcs-gap-banner">
          <b>{highOpen.length} HIGH × OPEN gap{highOpen.length === 1 ? "" : "s"}:</b>{" "}
          {highOpen.map((g, i) => (
            <button
              type="button"
              key={g.id}
              className="rcs-unclassified-link"
              onClick={() => onPickElement?.(g.id)}
            >
              {g.id}
              {i < highOpen.length - 1 ? ", " : ""}
            </button>
          ))}
          . Every one is a finding an auditor will pull first.
        </div>
      )}
      {unclassified.length > 0 && (
        <div className="rcs-unclassified-banner">
          {unclassified.length} gap{unclassified.length === 1 ? " is" : "s are"}{" "}
          missing severity or status and {unclassified.length === 1 ? "is" : "are"}{" "}
          not shown:{" "}
          {unclassified.map((g, i) => (
            <button
              type="button"
              key={g.id}
              className="rcs-unclassified-link"
              onClick={() => onPickElement?.(g.id)}
            >
              {g.id}
              {i < unclassified.length - 1 ? ", " : ""}
            </button>
          ))}
          .
        </div>
      )}
    </section>
  );
}

function RowFragment({
  sev,
  grid,
  highlightOpen,
  onPickElement,
  getRef,
}: {
  sev: Severity;
  grid: Record<Bucket, WikiPage[]>;
  highlightOpen: boolean;
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  return (
    <>
      <div className="rcs-rh">{sev}</div>
      {BUCKETS.map((b) => {
        const cells = grid[b];
        const empty = cells.length === 0;
        const warn = highlightOpen && b === "OPEN" && !empty;
        const cls = `rcs-cell${empty ? " rcs-cell-empty" : ""}${warn ? " rcs-cell-warn" : ""}`;
        if (empty) return <div className={cls} key={`${sev}-${b}`}>0</div>;
        return (
          <div className={cls} key={`${sev}-${b}`}>
            <div className="rcs-cnt">{cells.length}</div>
            <div className="rcs-ids">
              {cells.map((c) => {
                const ref = getRef?.(c.id);
                const btn = (
                  <button
                    type="button"
                    key={c.id}
                    className="rcs-cid"
                    onClick={() => onPickElement?.(c.id)}
                    title={c.title}
                  >
                    {c.id}
                  </button>
                );
                return ref ? (
                  <ElementHovercard
                    key={c.id}
                    element={ref.page}
                    typeLabel={ref.typeLabel}
                  >
                    {btn}
                  </ElementHovercard>
                ) : (
                  btn
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

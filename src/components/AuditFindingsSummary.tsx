"use client";

import type { WikiPage } from "@/lib/wiki";
import type { GetRef } from "@/lib/linkify";
import ElementHovercard from "./ElementHovercard";

// Coverage matrix for Audit Findings — severity × findingStatus. Same shape
// as ControlGapsSummary; findingStatus has a different vocabulary so the
// buckets are derived independently. HIGH × OPEN is the cell that comes
// up first in a regulator review.

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

function bucketFindingStatus(raw: string): Bucket | null {
  const v = lower(raw);
  if (v === "open" || v === "raised" || v === "new") return "OPEN";
  if (v === "in-remediation" || v === "in-progress" || v === "accepted") return "IN-PROGRESS";
  if (v === "closed" || v === "resolved" || v === "remediated" || v === "done")
    return "CLOSED";
  return null;
}

export default function AuditFindingsSummary({
  findings,
  onPickElement,
  getRef,
}: {
  findings: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: GetRef;
}) {
  if (findings.length === 0) return null;

  const grid: Record<Severity, Record<Bucket, WikiPage[]>> = {
    HIGH: { OPEN: [], "IN-PROGRESS": [], CLOSED: [] },
    MEDIUM: { OPEN: [], "IN-PROGRESS": [], CLOSED: [] },
    LOW: { OPEN: [], "IN-PROGRESS": [], CLOSED: [] },
  };
  const unclassified: WikiPage[] = [];
  for (const f of findings) {
    const s = parseSeverity(upper(f.meta.severity));
    const b = bucketFindingStatus(String(f.meta.findingStatus ?? ""));
    if (s && b) grid[s][b].push(f);
    else unclassified.push(f);
  }

  const highOpen = grid.HIGH.OPEN;

  return (
    <section className="rcs-wrap">
      <div className="rcs-head">
        <span className="rcs-eyebrow">Open findings</span>
        <span className="rcs-sub">
          {findings.length} audit finding{findings.length === 1 ? "" : "s"}{" "}
          plotted on severity × status · HIGH × OPEN comes up first in a
          regulator review
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
      {highOpen.length > 0 && (
        <div className="rcs-gap-banner">
          <b>
            {highOpen.length} HIGH × OPEN finding
            {highOpen.length === 1 ? "" : "s"}:
          </b>{" "}
          {highOpen.map((f, i) => (
            <button
              type="button"
              key={f.id}
              className="rcs-unclassified-link"
              onClick={() => onPickElement?.(f.id)}
            >
              {f.id}
              {i < highOpen.length - 1 ? ", " : ""}
            </button>
          ))}
          . Remediate before the next review.
        </div>
      )}
      {unclassified.length > 0 && (
        <div className="rcs-unclassified-banner">
          {unclassified.length} finding
          {unclassified.length === 1 ? " is" : "s are"} missing severity or
          status and {unclassified.length === 1 ? "is" : "are"} not shown:{" "}
          {unclassified.map((f, i) => (
            <button
              type="button"
              key={f.id}
              className="rcs-unclassified-link"
              onClick={() => onPickElement?.(f.id)}
            >
              {f.id}
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
  getRef?: GetRef;
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

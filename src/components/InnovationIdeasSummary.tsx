"use client";

import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// 3×3 coverage matrix of strategicFit × complexity — the standard
// portfolio bubble. HIGH-fit / LOW-complexity is the "quick wins" cell
// (do these first); LOW-fit / HIGH-complexity is the deprioritise
// corner. Unclassified ideas (no fit or no complexity) surface in a
// banner so they don't pollute the matrix. Symmetric with the
// Controls / Regulation / etc. coverage summaries.

type Band = "HIGH" | "MEDIUM" | "LOW";

const FITS: Band[] = ["HIGH", "MEDIUM", "LOW"];
const COMPLEX: Band[] = ["LOW", "MEDIUM", "HIGH"];

function upper(v: unknown): string {
  return typeof v === "string" ? v.trim().toUpperCase() : "";
}

function parseBand(raw: string): Band | null {
  return FITS.includes(raw as Band) ? (raw as Band) : null;
}

export default function InnovationIdeasSummary({
  ideas,
  onPickElement,
  getRef,
}: {
  ideas: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  if (ideas.length === 0) return null;

  const grid: Record<Band, Record<Band, WikiPage[]>> = {
    HIGH: { LOW: [], MEDIUM: [], HIGH: [] },
    MEDIUM: { LOW: [], MEDIUM: [], HIGH: [] },
    LOW: { LOW: [], MEDIUM: [], HIGH: [] },
  };
  const unclassified: WikiPage[] = [];
  for (const i of ideas) {
    const f = parseBand(upper(i.meta.strategicFit));
    const c = parseBand(upper(i.meta.complexity));
    if (f && c) grid[f][c].push(i);
    else unclassified.push(i);
  }

  const quickWins = grid.HIGH.LOW.length;

  return (
    <section className="rcs-wrap">
      <div className="rcs-head">
        <span className="rcs-eyebrow">Portfolio at a glance</span>
        <span className="rcs-sub">
          {ideas.length} innovation idea{ideas.length === 1 ? "" : "s"} plotted
          on strategic-fit × complexity · top-left = quick wins
        </span>
      </div>
      <div className="rcs-matrix rcs-matrix-3x3">
        <div className="rcs-mh" />
        {COMPLEX.map((c) => (
          <div className="rcs-mh" key={c}>
            {c} complexity
          </div>
        ))}
        {FITS.map((f) => (
          <RowFragment
            key={f}
            fit={f}
            grid={grid[f]}
            onPickElement={onPickElement}
            getRef={getRef}
          />
        ))}
      </div>
      {quickWins > 0 && (
        <div className="rcs-gap-banner rcs-quickwin-banner">
          <b>Quick wins:</b> {quickWins} idea{quickWins === 1 ? "" : "s"} with
          HIGH strategic fit and LOW complexity — top of the backlog.
        </div>
      )}
      {unclassified.length > 0 && (
        <div className="rcs-unclassified-banner">
          {unclassified.length} idea{unclassified.length === 1 ? " is" : "s are"}{" "}
          missing a strategicFit or complexity value and{" "}
          {unclassified.length === 1 ? "is" : "are"} not shown in the matrix:{" "}
          {unclassified.map((i, idx) => (
            <button
              type="button"
              key={i.id}
              className="rcs-unclassified-link"
              onClick={() => onPickElement?.(i.id)}
            >
              {i.id}
              {idx < unclassified.length - 1 ? ", " : ""}
            </button>
          ))}
          .
        </div>
      )}
    </section>
  );
}

function RowFragment({
  fit,
  grid,
  onPickElement,
  getRef,
}: {
  fit: Band;
  grid: Record<Band, WikiPage[]>;
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  return (
    <>
      <div className="rcs-rh">{fit} fit</div>
      {COMPLEX.map((c) => {
        const cells = grid[c];
        const empty = cells.length === 0;
        const quickWin = fit === "HIGH" && c === "LOW" && !empty;
        const cls = `rcs-cell${empty ? " rcs-cell-empty" : ""}${quickWin ? " rcs-cell-quickwin" : ""}`;
        if (empty) {
          return (
            <div className={cls} key={`${fit}-${c}`}>
              0
            </div>
          );
        }
        return (
          <div className={cls} key={`${fit}-${c}`}>
            <div className="rcs-cnt">{cells.length}</div>
            <div className="rcs-ids">
              {cells.map((i) => {
                const ref = getRef?.(i.id);
                const btn = (
                  <button
                    type="button"
                    key={i.id}
                    className="rcs-cid"
                    onClick={() => onPickElement?.(i.id)}
                    title={i.title}
                  >
                    {i.id}
                  </button>
                );
                return ref ? (
                  <ElementHovercard
                    key={i.id}
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

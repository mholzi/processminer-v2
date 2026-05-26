"use client";

import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// Approved Variant B (controls-summary-20260526/approved.json) — 3×3 coverage
// matrix of controlType × execution. Each cell shows count + element ids;
// empty cells are dim; a GAP cell flags any controlType row that has zero
// controls across every execution mode (e.g. a desk with no CORRECTIVE
// controls is an audit finding waiting to happen). The banner below names
// the gap explicitly so an SME doesn't have to scan and infer.

type ControlType = "PREVENTIVE" | "DETECTIVE" | "CORRECTIVE";
type Execution = "MANUAL" | "AUTOMATED" | "HYBRID";

const TYPES: ControlType[] = ["PREVENTIVE", "DETECTIVE", "CORRECTIVE"];
const EXECS: Execution[] = ["MANUAL", "AUTOMATED", "HYBRID"];

function upper(v: unknown): string {
  return typeof v === "string" ? v.trim().toUpperCase() : "";
}

function parseType(raw: string): ControlType | null {
  return TYPES.includes(raw as ControlType) ? (raw as ControlType) : null;
}
function parseExec(raw: string): Execution | null {
  return EXECS.includes(raw as Execution) ? (raw as Execution) : null;
}

export default function ControlsSummary({
  controls,
  onPickElement,
  getRef,
}: {
  controls: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  if (controls.length === 0) return null;

  // Bin into a 3×3 grid keyed by [controlType][execution]. Anything that
  // doesn't classify cleanly goes into a separate "unclassified" bucket
  // surfaced in the banner so the SME can see it without it polluting the
  // matrix itself.
  const grid: Record<ControlType, Record<Execution, WikiPage[]>> = {
    PREVENTIVE: { MANUAL: [], AUTOMATED: [], HYBRID: [] },
    DETECTIVE: { MANUAL: [], AUTOMATED: [], HYBRID: [] },
    CORRECTIVE: { MANUAL: [], AUTOMATED: [], HYBRID: [] },
  };
  const unclassified: WikiPage[] = [];
  for (const c of controls) {
    const t = parseType(upper(c.meta.controlType));
    const e = parseExec(upper(c.meta.execution));
    if (t && e) grid[t][e].push(c);
    else unclassified.push(c);
  }

  const rowCount = (t: ControlType) =>
    EXECS.reduce((n, e) => n + grid[t][e].length, 0);
  const isGapRow = (t: ControlType) => rowCount(t) === 0;
  const gapRows = TYPES.filter(isGapRow);

  return (
    <section className="rcs-wrap">
      <div className="rcs-head">
        <span className="rcs-eyebrow">Coverage at a glance</span>
        <span className="rcs-sub">
          {controls.length} control{controls.length === 1 ? "" : "s"} plotted
          on type × execution · empty cells = coverage gaps
        </span>
      </div>
      <div className="rcs-matrix rcs-matrix-3x3">
        <div className="rcs-mh" />
        {EXECS.map((e) => (
          <div className="rcs-mh" key={e}>
            {e}
          </div>
        ))}
        {TYPES.map((t) => (
          <RowFragment
            key={t}
            type={t}
            isGap={isGapRow(t)}
            grid={grid[t]}
            onPickElement={onPickElement}
            getRef={getRef}
          />
        ))}
      </div>
      {gapRows.length > 0 && (
        <div className="rcs-gap-banner">
          <b>Coverage gap:</b>{" "}
          {gapRows.map((g) => g).join(" / ")} controls — none documented across
          any execution mode. A guarantee desk needs at least one control in
          each row; flag for the Control & Compliance Specialist.
        </div>
      )}
      {unclassified.length > 0 && (
        <div className="rcs-unclassified-banner">
          {unclassified.length} control{unclassified.length === 1 ? " is" : "s are"}{" "}
          missing a controlType or execution value and {unclassified.length === 1 ? "is" : "are"}{" "}
          not shown in the matrix:{" "}
          {unclassified.map((c, i) => (
            <button
              type="button"
              key={c.id}
              className="rcs-unclassified-link"
              onClick={() => onPickElement?.(c.id)}
            >
              {c.id}
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
  type,
  isGap,
  grid,
  onPickElement,
  getRef,
}: {
  type: ControlType;
  isGap: boolean;
  grid: Record<Execution, WikiPage[]>;
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  return (
    <>
      <div className="rcs-rh">{type}</div>
      {EXECS.map((e) => {
        const cells = grid[e];
        const empty = cells.length === 0;
        const cls = `rcs-cell${empty ? " rcs-cell-empty" : ""}${isGap && empty ? " rcs-cell-warn" : ""}`;
        if (empty) {
          return (
            <div className={cls} key={`${type}-${e}`}>
              {isGap ? <b className="rcs-gap-label">GAP</b> : "0"}
            </div>
          );
        }
        return (
          <div className={cls} key={`${type}-${e}`}>
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

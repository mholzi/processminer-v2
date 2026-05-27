"use client";

import type { WikiPage } from "@/lib/wiki";
import type { GetRef } from "@/lib/linkify";
import ElementHovercard from "./ElementHovercard";
import { str } from "@/lib/meta";

// Coverage matrix for Regulation — approved Variant B pattern adapted to the
// regulation element shape. Rows are the regulatory domains found in the
// data (derived, not fixed); columns are "has control" / "no control yet".
// A regulation is "covered" when at least one `control` element lists it in
// `regulatedBy`. The right-hand column with a non-zero count is the gap that
// matters — those are obligations with no mapped control, exactly the case
// Fix #6 (source-regulation auto-note) is meant to surface.

function upper(v: unknown): string {
  return typeof v === "string" ? v.trim().toUpperCase() : "";
}
function regulatedBys(meta: Record<string, unknown>): string[] {
  const r = meta.regulatedBy;
  if (Array.isArray(r)) return r.map(String).filter(Boolean);
  if (typeof r === "string" && r.trim()) return [r.trim()];
  return [];
}

export default function RegulationSummary({
  regulations,
  allElements,
  onPickElement,
  getRef,
}: {
  regulations: WikiPage[];
  /** All elements in the process — used to find controls that reference
   *  regulations via `regulatedBy`. */
  allElements: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: GetRef;
}) {
  if (regulations.length === 0) return null;

  // Build the reverse map: regulation id → controls that reference it.
  const refsByReg = new Map<string, WikiPage[]>();
  for (const el of allElements) {
    if (el.type !== "control") continue;
    for (const regId of regulatedBys(el.meta)) {
      const list = refsByReg.get(regId.toUpperCase()) ?? [];
      list.push(el);
      refsByReg.set(regId.toUpperCase(), list);
    }
  }

  // Derive the row labels from the data, alphabetically. An empty domain
  // becomes "(no domain)" so it stays visible.
  const domainOf = (r: WikiPage) => str(r.meta.domain).trim() || "(no domain)";
  const domains = Array.from(new Set(regulations.map(domainOf))).sort();

  // Bin every regulation into one of two columns.
  const grid = new Map<string, { covered: WikiPage[]; unmapped: WikiPage[] }>();
  for (const d of domains) grid.set(d, { covered: [], unmapped: [] });
  for (const r of regulations) {
    const d = domainOf(r);
    const refs = refsByReg.get(r.id.toUpperCase()) ?? [];
    if (refs.length > 0) grid.get(d)!.covered.push(r);
    else grid.get(d)!.unmapped.push(r);
  }

  const unmappedRegs = regulations.filter(
    (r) => (refsByReg.get(r.id.toUpperCase()) ?? []).length === 0,
  );

  return (
    <section className="rcs-wrap">
      <div className="rcs-head">
        <span className="rcs-eyebrow">Coverage at a glance</span>
        <span className="rcs-sub">
          {regulations.length} regulation{regulations.length === 1 ? "" : "s"}{" "}
          plotted on domain × control coverage · right column = obligation
          with no mapped control
        </span>
      </div>
      <div
        className="rcs-matrix"
        style={{ gridTemplateColumns: "200px 1fr 1fr" }}
      >
        <div className="rcs-mh" />
        <div className="rcs-mh">HAS CONTROL</div>
        <div className="rcs-mh">NO CONTROL YET</div>
        {domains.map((d) => {
          const cells = grid.get(d)!;
          const covEmpty = cells.covered.length === 0;
          const unEmpty = cells.unmapped.length === 0;
          const unmapWarn = !unEmpty;
          return (
            <div key={d} style={{ display: "contents" }}>
              <div className="rcs-rh">{d}</div>
              <Cell
                items={cells.covered}
                empty={covEmpty}
                warn={false}
                onPickElement={onPickElement}
                getRef={getRef}
              />
              <Cell
                items={cells.unmapped}
                empty={unEmpty}
                warn={unmapWarn}
                onPickElement={onPickElement}
                getRef={getRef}
              />
            </div>
          );
        })}
      </div>
      {unmappedRegs.length > 0 && (
        <div className="rcs-gap-banner">
          <b>Coverage gap:</b> {unmappedRegs.length} regulation
          {unmappedRegs.length === 1 ? "" : "s"} with no control referencing
          {unmappedRegs.length === 1 ? " it" : " them"} via{" "}
          <code>regulatedBy</code>:{" "}
          {unmappedRegs.map((r, i) => (
            <button
              type="button"
              key={r.id}
              className="rcs-unclassified-link"
              onClick={() => onPickElement?.(r.id)}
            >
              {r.id}
              {i < unmappedRegs.length - 1 ? ", " : ""}
            </button>
          ))}
          . Each is an unmapped obligation; the Control & Compliance
          Specialist should either link a control or document an accepted
          risk.
        </div>
      )}
    </section>
  );
}

function Cell({
  items,
  empty,
  warn,
  onPickElement,
  getRef,
}: {
  items: WikiPage[];
  empty: boolean;
  warn: boolean;
  onPickElement?: (id: string) => void;
  getRef?: GetRef;
}) {
  const cls = `rcs-cell${empty ? " rcs-cell-empty" : ""}${warn && !empty ? " rcs-cell-warn" : ""}`;
  if (empty) {
    return <div className={cls}>0</div>;
  }
  return (
    <div className={cls}>
      <div className="rcs-cnt">{items.length}</div>
      <div className="rcs-ids">
        {items.map((item) => {
          const ref = getRef?.(item.id);
          const btn = (
            <button
              type="button"
              key={item.id}
              className="rcs-cid"
              onClick={() => onPickElement?.(item.id)}
              title={item.title}
            >
              {item.id}
            </button>
          );
          return ref ? (
            <ElementHovercard
              key={item.id}
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
}

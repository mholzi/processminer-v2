"use client";

import { Fragment } from "react";
import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// Country × process-step matrix above the country-variation cards. Approved
// variant B from the 2026-05-26 design-shotgun. Rows are the countries that
// appear in any variation's `countries` field; columns are the process steps
// any variation `affects`. Cells show the CV-ID chip(s) that vary that step
// in that country. Cell tint = the highest-severity variation type that lives
// in the cell (regulatory > cultural > operational > market).

type VariationType = "REGULATORY" | "OPERATIONAL" | "CULTURAL" | "MARKET";

// Lower index = "hotter" — wins the cell tint when multiple chips stack.
const TYPE_RANK: Record<VariationType, number> = {
  REGULATORY: 0,
  CULTURAL: 1,
  OPERATIONAL: 2,
  MARKET: 3,
};

const TYPE_TINT: Record<VariationType, string> = {
  REGULATORY: "regulatory",
  CULTURAL: "cultural",
  OPERATIONAL: "operational",
  MARKET: "market",
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function parseCountries(meta: Record<string, unknown>): string[] {
  const raw = meta.countries;
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === "string") {
    return raw
      .split(/[,;]/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
  }
  return [];
}

function parseAffects(meta: Record<string, unknown>): string[] {
  const raw = meta.affects;
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) return [raw.trim()];
  return [];
}

function parseType(raw: string): VariationType | null {
  const v = raw.trim().toUpperCase();
  if (v === "REGULATORY" || v === "OPERATIONAL" || v === "CULTURAL" || v === "MARKET") return v;
  return null;
}

// Natural-sort key for process-step ids ("PS-BGID-002" → "ps-bgid-000002")
// so PS-10 sorts after PS-9.
function stepKey(id: string): string {
  return id.replace(/\d+/g, (n) => n.padStart(6, "0")).toLowerCase();
}

// 🇩🇪 etc. — emoji regional-indicator pair for a 2-letter ISO code.
function flagFor(code: string): string {
  if (code.length !== 2) return "";
  const a = code.toUpperCase().charCodeAt(0);
  const b = code.toUpperCase().charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return "";
  return String.fromCodePoint(0x1f1e6 + (a - 65)) + String.fromCodePoint(0x1f1e6 + (b - 65));
}

interface CellEntry {
  variation: WikiPage;
  type: VariationType | null;
}

export default function CountryVariationsSummary({
  variations,
  onPickElement,
  getRef,
}: {
  variations: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  if (variations.length === 0) return null;

  // Collect axes — countries across all variations, steps across all `affects`.
  const countrySet = new Set<string>();
  const stepSet = new Set<string>();
  for (const v of variations) {
    parseCountries(v.meta).forEach((c) => countrySet.add(c));
    parseAffects(v.meta).forEach((s) => stepSet.add(s));
  }
  const countries = Array.from(countrySet).sort();
  const steps = Array.from(stepSet).sort((a, b) => stepKey(a).localeCompare(stepKey(b)));

  // No `affects` recorded anywhere — render an unplotted list so the user
  // still gets value. Without a column axis, the matrix can't form.
  if (steps.length === 0) {
    return (
      <section className="cvs-wrap">
        <div className="cvs-head">
          <span className="cvs-eyebrow">Country variations</span>
          <span className="cvs-sub">
            {variations.length} variation{variations.length === 1 ? "" : "s"} ·
            no process-step affects recorded yet — fill `affects:` on each
            variation to see the matrix
          </span>
        </div>
      </section>
    );
  }

  // Build the cell index: `${country}|${step}` → list of variations that live there.
  const cellMap = new Map<string, CellEntry[]>();
  for (const v of variations) {
    const cs = parseCountries(v.meta);
    const ss = parseAffects(v.meta);
    if (ss.length === 0) continue; // Unplotted — skipped for now.
    const type = parseType(str(v.meta.variationType));
    for (const country of cs) {
      for (const step of ss) {
        const key = `${country}|${step}`;
        const entry: CellEntry = { variation: v, type };
        const existing = cellMap.get(key);
        if (existing) existing.push(entry);
        else cellMap.set(key, [entry]);
      }
    }
  }

  function cellTintClass(entries: CellEntry[]): string {
    let best: VariationType | null = null;
    for (const e of entries) {
      if (!e.type) continue;
      if (!best || TYPE_RANK[e.type] < TYPE_RANK[best]) best = e.type;
    }
    return best ? `cvs-cell-${TYPE_TINT[best]}` : "";
  }

  return (
    <section className="cvs-wrap">
      <div className="cvs-head">
        <span className="cvs-eyebrow">Country × Step</span>
        <span className="cvs-sub">
          {variations.length} variation{variations.length === 1 ? "" : "s"} ·
          {" "}{countries.length} countr{countries.length === 1 ? "y" : "ies"} ·
          {" "}{steps.length} step{steps.length === 1 ? "" : "s"} affected
        </span>
      </div>
      <div className="cvs-legend">
        <span><i className="cvs-swatch cvs-regulatory" />Regulatory</span>
        <span><i className="cvs-swatch cvs-operational" />Operational</span>
        <span><i className="cvs-swatch cvs-cultural" />Cultural</span>
        <span><i className="cvs-swatch cvs-market" />Market</span>
      </div>
      <div className="cvs-matrix-card">
        <div
          className="cvs-grid"
          style={{
            gridTemplateColumns: `96px repeat(${steps.length}, minmax(72px, 1fr))`,
          }}
        >
          <div className="cvs-cell cvs-cell-corner" />
          {steps.map((step) => (
            <div className="cvs-cell cvs-cell-col-head" key={step}>
              {step.replace(/^[A-Z]+-[A-Z]+-/, "")}
            </div>
          ))}
          {countries.map((country) => (
            <Fragment key={country}>
              <div className="cvs-cell cvs-cell-row-head">
                <span className="cvs-flag" aria-hidden="true">
                  {flagFor(country)}
                </span>
                {country}
              </div>
              {steps.map((step) => {
                const entries = cellMap.get(`${country}|${step}`) ?? [];
                const tint = entries.length > 0 ? cellTintClass(entries) : "";
                return (
                  <div
                    className={`cvs-cell cvs-cell-data ${tint}`}
                    key={`${country}-${step}`}
                  >
                    {entries.map(({ variation, type }) => {
                      const ref = getRef?.(variation.id);
                      const chip = (
                        <button
                          key={variation.id}
                          type="button"
                          className={`cvs-chip ${type ? `cvs-chip-${TYPE_TINT[type]}` : ""}`}
                          onClick={() => onPickElement?.(variation.id)}
                          title={variation.title}
                        >
                          {variation.id.replace(/^[A-Z]+-[A-Z]+-/, "")}
                        </button>
                      );
                      return ref ? (
                        <ElementHovercard
                          key={variation.id}
                          element={ref.page}
                          typeLabel={ref.typeLabel}
                        >
                          {chip}
                        </ElementHovercard>
                      ) : (
                        chip
                      );
                    })}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

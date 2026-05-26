"use client";

import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// At-a-glance risk-matrix heatmap above the exception cards. 3 × 3 grid:
// frequency (rare/sometimes/often) × impact (high/med/low). Each cell lists
// the exception IDs that fall in its bucket as clickable chips. Exceptions
// without a frequency or impact slot into an "Unplotted" list under the
// matrix — they are the most useful signal: documented but not yet
// quantified.

type Impact = "HIGH" | "MEDIUM" | "LOW";
type FreqBucket = "rare" | "sometimes" | "often";

const IMPACTS: Impact[] = ["HIGH", "MEDIUM", "LOW"];
const FREQS: FreqBucket[] = ["rare", "sometimes", "often"];
const FREQ_LABEL: Record<FreqBucket, string> = {
  rare: "Rare (<3%)",
  sometimes: "Sometimes (3–10%)",
  often: "Often (>10%)",
};
const IMPACT_LABEL: Record<Impact, string> = {
  HIGH: "High",
  MEDIUM: "Med",
  LOW: "Low",
};

// Pick the cell background tier — the diagonal grades from green (low risk)
// up to red (top-right is the classic banking "burning quadrant").
function cellTier(imp: Impact, freq: FreqBucket): 1 | 2 | 3 {
  const score =
    (imp === "HIGH" ? 3 : imp === "MEDIUM" ? 2 : 1) +
    (freq === "often" ? 3 : freq === "sometimes" ? 2 : 1);
  if (score >= 6) return 3;
  if (score >= 4) return 2;
  return 1;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function parseImpact(raw: string): Impact | null {
  const v = raw.trim().toUpperCase();
  if (v === "HIGH" || v === "MEDIUM" || v === "LOW") return v;
  return null;
}

function parseFrequencyPct(raw: string): number | null {
  const m = raw.match(/(-?\d+(?:\.\d+)?)\s*%?/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function freqBucket(pct: number): FreqBucket {
  if (pct < 3) return "rare";
  if (pct <= 10) return "sometimes";
  return "often";
}

export default function ExceptionsSummary({
  exceptions,
  onPickElement,
  getRef,
}: {
  exceptions: WikiPage[];
  onPickElement?: (id: string) => void;
  /** Resolver for the shared hovercard preview. */
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  if (exceptions.length === 0) return null;

  // Bucket each exception into a cell, or "Unplotted" when impact or
  // frequency is missing / unparseable.
  const cells = new Map<string, WikiPage[]>(); // key: `${imp}-${freq}`
  const unplotted: WikiPage[] = [];
  for (const ex of exceptions) {
    const imp = parseImpact(str(ex.meta.impact));
    const pct = parseFrequencyPct(str(ex.meta.frequencyPct));
    if (!imp || pct === null) {
      unplotted.push(ex);
      continue;
    }
    const fb = freqBucket(pct);
    const key = `${imp}-${fb}`;
    const list = cells.get(key);
    if (list) list.push(ex);
    else cells.set(key, [ex]);
  }

  const total = exceptions.length;
  const plotted = total - unplotted.length;

  return (
    <section className="es-wrap">
      <div className="es-head">
        <span className="es-eyebrow">Risk matrix</span>
        <span className="es-sub">
          frequency × impact · {plotted} plotted · {unplotted.length} unplotted
        </span>
      </div>
      <div className="es-matrix-card">
        <div className="es-axis-title">↑ Impact &nbsp;·&nbsp; Frequency →</div>
        <div className="es-matrix-row">
          <div className="es-y-axis">
            {IMPACTS.map((imp) => (
              <span key={imp} className="es-y-lbl">
                {IMPACT_LABEL[imp]}
              </span>
            ))}
          </div>
          <div className="es-grid">
            {IMPACTS.map((imp) =>
              FREQS.map((fb) => {
                const list = cells.get(`${imp}-${fb}`) ?? [];
                const tier = cellTier(imp, fb);
                return (
                  <div className={`es-cell es-tier-${tier}`} key={`${imp}-${fb}`}>
                    <span className="es-cell-tag">
                      {IMPACT_LABEL[imp]} · {fb}
                    </span>
                    <div className="es-cell-chips">
                      {list.map((ex) => {
                        const ref = getRef?.(ex.id);
                        const chip = (
                          <button
                            key={ex.id}
                            type="button"
                            className="es-chip"
                            onClick={() => onPickElement?.(ex.id)}
                            title={ex.title}
                          >
                            {ex.id}
                          </button>
                        );
                        return ref ? (
                          <ElementHovercard
                            key={ex.id}
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
                  </div>
                );
              }),
            )}
          </div>
        </div>
        <div className="es-x-axis">
          {FREQS.map((fb) => (
            <span key={fb} className="es-x-lbl">
              {FREQ_LABEL[fb]}
            </span>
          ))}
        </div>
      </div>

      {unplotted.length > 0 && (
        <div className="es-unplotted">
          <div className="es-unplotted-title">
            Unplotted · missing frequency or impact
          </div>
          {unplotted.map((ex) => {
            const imp = parseImpact(str(ex.meta.impact));
            const missing: string[] = [];
            if (!imp) missing.push("impact");
            if (parseFrequencyPct(str(ex.meta.frequencyPct)) === null)
              missing.push("frequency");
            const ref = getRef?.(ex.id);
            const row = (
              <button
                key={ex.id}
                type="button"
                className="es-unplotted-row"
                onClick={() => onPickElement?.(ex.id)}
              >
                <span className="es-unplotted-id">{ex.id}</span>
                <span className="es-unplotted-name">{ex.title}</span>
                {imp && (
                  <span className={`es-pill es-pill-${imp.toLowerCase()}`}>
                    {imp}
                  </span>
                )}
                <span className="es-unplotted-missing">
                  no {missing.join(" / ")}
                </span>
              </button>
            );
            return ref ? (
              <ElementHovercard
                key={ex.id}
                element={ref.page}
                typeLabel={ref.typeLabel}
              >
                {row}
              </ElementHovercard>
            ) : (
              row
            );
          })}
        </div>
      )}
    </section>
  );
}

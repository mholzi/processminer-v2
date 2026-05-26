"use client";

import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// Approved Variant A (cx-structures-20260526/approved.json) — step-cards.
// One card per As-Is process-step, journey reads left-to-right. Each card
// contains the touchpoints, moments and friction-points landing at that
// step. Left-edge stripe encodes the worst thing happening there:
//   red    — at least one HIGH-severity friction-point
//   amber  — at least one MEDIUM-severity friction-point (but no HIGH)
//   green  — at least one positive moment-of-truth and no friction
//   none   — neutral / no data
// "No touchpoint" steps stay visible as muted cards so coverage gaps don't
// disappear. Cross-section: takes process-steps + touchpoints + moments +
// friction-points as separate props because each comes from a different
// wiki section.

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function lower(v: unknown): string {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}
function upper(v: unknown): string {
  return typeof v === "string" ? v.trim().toUpperCase() : "";
}
function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

type StripeKind = "fric-h" | "fric-m" | "has-pos" | null;

function stripeFor(fps: WikiPage[], mts: WikiPage[]): StripeKind {
  if (fps.some((f) => upper(f.meta.severity) === "HIGH")) return "fric-h";
  if (fps.some((f) => upper(f.meta.severity) === "MEDIUM")) return "fric-m";
  if (mts.some((m) => lower(m.meta.sentiment) === "positive")) return "has-pos";
  return null;
}

function tonecls(s: StripeKind): string {
  return s ? ` cjs-${s}` : "";
}

export default function ClientJourneyStrip({
  steps,
  touchpoints,
  moments,
  frictionPoints,
  onPickElement,
  getRef,
}: {
  steps: WikiPage[];
  touchpoints: WikiPage[];
  moments: WikiPage[];
  frictionPoints: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  if (steps.length === 0 || touchpoints.length === 0) return null;

  // Touchpoints + friction-points carry `occursAt: [PS-…]`. Moments link
  // through their touchpoint (no direct step pointer), so we resolve moments
  // step-by-step via the touchpoint's `occursAt`.
  const tpsByStep = new Map<string, WikiPage[]>();
  for (const tp of touchpoints) {
    for (const ps of asList(tp.meta.occursAt)) {
      const k = ps.toUpperCase();
      const list = tpsByStep.get(k) ?? [];
      list.push(tp);
      tpsByStep.set(k, list);
    }
  }
  const fpsByStep = new Map<string, WikiPage[]>();
  for (const fp of frictionPoints) {
    for (const ps of asList(fp.meta.occursAt)) {
      const k = ps.toUpperCase();
      const list = fpsByStep.get(k) ?? [];
      list.push(fp);
      fpsByStep.set(k, list);
    }
  }
  // Moments → touchpoint(s) → step(s). A moment with no touchpoint link
  // falls into "unscoped" and is hidden from the strip (it shouldn't lint
  // clean if it has no anchor, but we don't crash on it).
  const momByStep = new Map<string, WikiPage[]>();
  const tpById = new Map(touchpoints.map((tp) => [tp.id.toUpperCase(), tp]));
  for (const m of moments) {
    const linkedTps = asList(m.meta.touchpoint);
    if (linkedTps.length === 0) continue;
    const stepIds = new Set<string>();
    for (const tpid of linkedTps) {
      const tp = tpById.get(tpid.toUpperCase());
      if (!tp) continue;
      for (const ps of asList(tp.meta.occursAt)) stepIds.add(ps.toUpperCase());
    }
    for (const sid of stepIds) {
      const list = momByStep.get(sid) ?? [];
      list.push(m);
      momByStep.set(sid, list);
    }
  }

  // Sort steps by `order` if present, falling back to id alphabetically —
  // ProcessFlow uses the same convention.
  const sorted = [...steps].sort((a, b) => {
    const oa = Number(a.meta.order);
    const ob = Number(b.meta.order);
    if (Number.isFinite(oa) && Number.isFinite(ob)) return oa - ob;
    return a.id.localeCompare(b.id);
  });

  return (
    <section className="cjs-wrap">
      <div className="cjs-head">
        <span className="cjs-eyebrow">Client journey</span>
        <span className="cjs-sub">
          {touchpoints.length} touchpoint{touchpoints.length === 1 ? "" : "s"}{" "}
          · {moments.length} moment{moments.length === 1 ? "" : "s"} ·{" "}
          {frictionPoints.length} friction-point
          {frictionPoints.length === 1 ? "" : "s"} · left-to-right by step ·
          card stripe = worst thing happening there
        </span>
      </div>
      <div className="cjs-strip">
        {sorted.map((step) => {
          const k = step.id.toUpperCase();
          const tps = tpsByStep.get(k) ?? [];
          const fps = fpsByStep.get(k) ?? [];
          const mts = momByStep.get(k) ?? [];
          const stripe = stripeFor(fps, mts);
          return (
            <article
              key={step.id}
              className={`cjs-card${tonecls(stripe)}`}
            >
              <header className="cjs-card-h">
                <button
                  type="button"
                  className="cjs-step-id"
                  onClick={() => onPickElement?.(step.id)}
                  title={`Jump to ${step.id}`}
                >
                  {step.id}
                </button>
                <span className="cjs-step-name">{step.title}</span>
              </header>
              <div className="cjs-card-body">
                {tps.length === 0 ? (
                  <div className="cjs-empty">— no touchpoint —</div>
                ) : (
                  tps.map((tp) => {
                    const ref = getRef?.(tp.id);
                    const inner = (
                      <button
                        type="button"
                        className="cjs-tp"
                        onClick={() => onPickElement?.(tp.id)}
                        title={`Jump to ${tp.id}`}
                      >
                        <span className="cjs-tp-id">{tp.id}</span>
                        <span className="cjs-tp-title">{tp.title}</span>
                        {tp.meta.channel && (
                          <span className="cjs-tp-channel">
                            via {String(tp.meta.channel)}
                          </span>
                        )}
                      </button>
                    );
                    return ref ? (
                      <ElementHovercard
                        key={tp.id}
                        element={ref.page}
                        typeLabel={ref.typeLabel}
                      >
                        {inner}
                      </ElementHovercard>
                    ) : (
                      <span key={tp.id}>{inner}</span>
                    );
                  })
                )}
                {mts.length > 0 && (
                  <div className="cjs-mt-row">
                    {mts.map((m) => {
                      const s = lower(m.meta.sentiment);
                      const cls =
                        s === "positive"
                          ? "cjs-mt cjs-mt-pos"
                          : s === "critical"
                            ? "cjs-mt cjs-mt-crit"
                            : "cjs-mt cjs-mt-neg";
                      const glyph =
                        s === "positive" ? "▲" : s === "critical" ? "◆" : "▼";
                      return (
                        <button
                          type="button"
                          key={m.id}
                          className={cls}
                          onClick={() => onPickElement?.(m.id)}
                          title={`${m.id} — ${m.title}`}
                        >
                          {glyph} {m.id}
                        </button>
                      );
                    })}
                  </div>
                )}
                {fps.length > 0 && (
                  <div className="cjs-fp-row">
                    {fps.map((f) => {
                      const sev = upper(f.meta.severity);
                      const cls =
                        sev === "HIGH"
                          ? "cjs-fp"
                          : sev === "MEDIUM"
                            ? "cjs-fp cjs-fp-med"
                            : "cjs-fp cjs-fp-low";
                      return (
                        <button
                          type="button"
                          key={f.id}
                          className={cls}
                          onClick={() => onPickElement?.(f.id)}
                          title={`${f.id} — ${f.title}`}
                        >
                          {f.id} {sev || "—"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

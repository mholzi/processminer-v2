"use client";

import { useMemo } from "react";
import type { ProcessDoc } from "@/lib/wiki";
import { buildAttentionFeed } from "@/lib/orchestrator";

// Deterministic portfolio-overview card — the approved "variant B" (stat header
// + grouped), made scale-safe for many processes. The four header stats are O(1)
// in process count; the only list is "needs attention", capped to the top few by
// the orchestrator weight, with the rest shown as counts + a link to the
// dashboard. Never renders an unbounded process list in the 452px panel.
// Computed synchronously from the docs the dashboard already holds — no model
// turn, no fetch.

// Mirrors WelcomeScreen's handoff-ready test (every target-area element confirmed).
const TARGET_SECTIONS = new Set([
  "to-be-design",
  "transformation-decisions",
  "requirements",
  "dependencies",
  "assumptions",
  "gap-resolution",
  "validation",
]);

const ATTN_CAP = 5;

function handoffReady(d: ProcessDoc): boolean {
  let total = 0;
  let confirmed = 0;
  for (const e of d.elements) {
    if (!TARGET_SECTIONS.has(e.section)) continue;
    total += 1;
    if (e.status === "confirmed") confirmed += 1;
  }
  return total > 0 && confirmed === total;
}

export default function AdvisorPortfolioCard({
  docs,
  onOpenProcess,
  onOpenDashboard,
}: {
  docs: ProcessDoc[];
  onOpenProcess?: (slug: string) => void;
  /** Reveal the full dashboard (the slide-over sits over it). */
  onOpenDashboard?: () => void;
}) {
  const vm = useMemo(() => {
    const procs = docs.filter((d) => d.process.id || d.process.title);
    const rows = [...buildAttentionFeed(docs).attentionRows].sort(
      (a, b) => b.weight - a.weight,
    );
    const attnSlugs = new Set(rows.map((r) => r.slug));

    const per = procs.map((d) => {
      const total = d.elements.length;
      const confirmed = d.elements.filter((e) => e.status === "confirmed").length;
      return {
        slug: d.slug,
        pct: total ? Math.round((confirmed / total) * 100) : 0,
        handoff: handoffReady(d),
      };
    });
    const avgPct = per.length
      ? Math.round(per.reduce((s, p) => s + p.pct, 0) / per.length)
      : 0;
    const handoffCount = per.filter((p) => p.handoff).length;
    const inProgress = per.filter(
      (p) => !attnSlugs.has(p.slug) && !p.handoff,
    ).length;

    return {
      count: per.length,
      avgPct,
      needAttn: attnSlugs.size,
      handoffCount,
      inProgress,
      rows,
    };
  }, [docs]);

  const shown = vm.rows.slice(0, ATTN_CAP);
  const moreAttn = vm.rows.length - shown.length;

  return (
    <div className="ab-pf">
      <div className="ab-pf-stats">
        <div className="ab-pf-stat">
          <div className="v">{vm.count}</div>
          <div className="l">processes</div>
        </div>
        <div className="ab-pf-stat">
          <div className="v">{vm.avgPct}%</div>
          <div className="l">ø confirmed</div>
        </div>
        <div className="ab-pf-stat">
          <div className={`v${vm.needAttn ? " attn" : ""}`}>{vm.needAttn}</div>
          <div className="l">need attn</div>
        </div>
        <div className="ab-pf-stat">
          <div className={`v${vm.handoffCount ? " ok" : ""}`}>{vm.handoffCount}</div>
          <div className="l">handoff</div>
        </div>
      </div>

      <div className="ab-pf-grp">
        <div className="ab-pf-grp-h">Needs attention</div>
        {shown.length === 0 ? (
          <div className="ab-pf-clean">Nothing needs your attention right now.</div>
        ) : (
          shown.map((r) => (
            <button
              key={r.slug}
              type="button"
              className="ab-pf-row"
              onClick={() => onOpenProcess?.(r.slug)}
            >
              <span className="ab-pf-id">{r.id}</span>
              <span className="ab-pf-rsn">{r.reasons.join(" · ")}</span>
            </button>
          ))
        )}
        {moreAttn > 0 && (
          <button type="button" className="ab-pf-more" onClick={onOpenDashboard}>
            +{moreAttn} more →
          </button>
        )}
      </div>

      <div className="ab-pf-foot">
        <span className="ab-pf-count">In progress {vm.inProgress}</span>
        <span className="ab-pf-count">Handoff-ready {vm.handoffCount}</span>
        <button type="button" className="ab-pf-open" onClick={onOpenDashboard}>
          Open dashboard →
        </button>
      </div>
    </div>
  );
}

"use client";

import type { WikiPage } from "@/lib/wiki";
import type { GetRef } from "@/lib/linkify";
import ElementHovercard from "./ElementHovercard";
import { str } from "@/lib/meta";

// At-a-glance summary table above the metric cards. Same column shape as the
// approved variant-A mockup: ID · Name · Target · Actual · Trend · Status.
// The source metric type only stores `target`, `value`, `trend` as free text
// (see schema/process-schema.json "metric"), so this is point-in-time, not
// historical — no sparkline, no computed delta. Status is derived from the
// presence of a measured value (a blank or "not measured" value is itself
// the most useful signal).

const UNMEASURED = /^\s*(—|-|n\/?a|tbd|unknown|not\s+measured|none)\s*$/i;

function isUnmeasured(value: string): boolean {
  if (!value.trim()) return true;
  return UNMEASURED.test(value);
}

type TrendKind = "up" | "down" | "flat" | "none";

function trendKind(raw: string): TrendKind {
  const t = raw.trim().toLowerCase();
  if (!t) return "none";
  if (/improv|up|better|rising|growing/.test(t)) return "up";
  if (/worsen|down|declin|falling|deterior/.test(t)) return "down";
  if (/flat|stable|unchanged|steady|sideways/.test(t)) return "flat";
  return "none";
}

const TREND_GLYPH: Record<TrendKind, string> = {
  up: "▲",
  down: "▼",
  flat: "–",
  none: "",
};

export default function MetricsSummary({
  metrics,
  onPickElement,
  getRef,
}: {
  metrics: WikiPage[];
  /** Click a row to focus the matching metric card below. */
  onPickElement?: (id: string) => void;
  /** Resolver for the shared hovercard preview. */
  getRef?: GetRef;
}) {
  if (metrics.length === 0) return null;
  const measured = metrics.filter((m) => !isUnmeasured(str(m.meta.value))).length;
  const unmeasured = metrics.length - measured;

  return (
    <section className="ms-wrap">
      <div className="ms-head">
        <span className="ms-eyebrow">Summary</span>
        <span className="ms-sub">
          {metrics.length} metric{metrics.length === 1 ? "" : "s"}
          {" · "}
          {measured} measured · {unmeasured} unmeasured
        </span>
      </div>
      <table className="ms-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th className="num">Target</th>
            <th className="num">Actual</th>
            <th className="trend-th">Trend</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => {
            const target = str(m.meta.target);
            const value = str(m.meta.value);
            const trend = str(m.meta.trend);
            const unmeasuredRow = isUnmeasured(value);
            const tk = trendKind(trend);
            const ref = getRef?.(m.id);
            const idCell = ref ? (
              <ElementHovercard element={ref.page} typeLabel={ref.typeLabel}>
                <span>{m.id}</span>
              </ElementHovercard>
            ) : (
              m.id
            );
            return (
              <tr
                key={m.id}
                onClick={() => onPickElement?.(m.id)}
                className={onPickElement ? "ms-clickable" : undefined}
                title={onPickElement ? "Jump to this metric" : undefined}
              >
                <td className="id">{idCell}</td>
                <td className="name">{m.title}</td>
                <td className="num target">{target || "—"}</td>
                <td className={`num${unmeasuredRow ? " target" : ""}`}>
                  {unmeasuredRow ? "—" : value}
                </td>
                <td className={`trend trend-${tk}`}>{TREND_GLYPH[tk] || ""}</td>
                <td>
                  {unmeasuredRow ? (
                    <span className="ms-pill unmeasured">Unmeasured</span>
                  ) : (
                    <span className="ms-pill recorded">Recorded</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

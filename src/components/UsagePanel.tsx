"use client";

import { useEffect, useState } from "react";
import type { UsageOverview } from "@/lib/token-usage";
import type { SkillUsageEntry } from "@/lib/runtime-store";

// Admin → Token usage. Dual-bar layout: avg tokens/turn per skill (left) and
// avg run-time/turn per skill (right). Fleet-average strip at the top.
// No cost shown — tokens only.

/** "12.3k" / "1.20k" / "950" / "8.5" — compact token count. */
function fmt(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(2)}k`;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

/** "4.2s" / "3m 12s" / "1h 4m" — compact run-time. */
function dur(ms: number): string {
  if (!ms) return "—";
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) {
    const m = Math.floor(ms / 60_000);
    return `${m}m ${Math.round((ms % 60_000) / 1000)}s`;
  }
  const h = Math.floor(ms / 3_600_000);
  return `${h}h ${Math.round((ms % 3_600_000) / 60_000)}m`;
}

function when(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

type SkillRow = {
  skill: string;
  turns: number;
  avgTokens: number;
  avgInput: number;
  avgOutput: number;
  avgDurationMs: number;
};

function buildRows(bySkill: Record<string, SkillUsageEntry>): SkillRow[] {
  return Object.entries(bySkill)
    .map(([skill, e]) => {
      const turns = Math.max(e.turns, 1);
      return {
        skill,
        turns: e.turns,
        avgTokens: (e.inputTokens + e.outputTokens) / turns,
        avgInput: e.inputTokens / turns,
        avgOutput: e.outputTokens / turns,
        avgDurationMs: e.durationMs / turns,
      };
    })
    .sort((a, b) => b.avgTokens - a.avgTokens);
}

/** Bar width as a percentage relative to the max value in the set. */
function pct(value: number, max: number): number {
  if (!max) return 0;
  return Math.round((value / max) * 100);
}

/** Pick a bar colour from a 5-stop purple ramp based on relative position. */
function rtColor(ratio: number): string {
  if (ratio > 0.8) return "var(--accent)";
  if (ratio > 0.6) return "#7c3aed";
  if (ratio > 0.4) return "#a78bfa";
  if (ratio > 0.2) return "#c4b5fd";
  return "#ddd6fe";
}

export default function UsagePanel() {
  const [data, setData] = useState<UsageOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const r = await fetch("/api/admin/usage", { credentials: "same-origin" });
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error || `HTTP ${r.status}`);
      }
      setData((await r.json()) as UsageOverview);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load usage.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  if (loading) return <p className="admin-muted">Loading token usage…</p>;
  if (error) return <p className="admin-error">{error}</p>;
  if (!data) return null;

  const t = data.grandTotal;
  const hasAny = t.turns > 0;

  if (!hasAny) {
    return (
      <div className="usage-panel">
        <div className="usage-head-row">
          <h2 className="usage-h">Token usage</h2>
          <button type="button" className="admin-btn-secondary" onClick={refresh}>
            Refresh
          </button>
        </div>
        <div className="empty-state">
          <p>No usage recorded yet.</p>
          <p className="empty-hint">
            Token usage is captured per turn from this point on — run a skill and
            it will appear here.
          </p>
        </div>
      </div>
    );
  }

  const skillRows = buildRows(data.bySkill);
  const fleetTurns = t.turns;
  const fleetAvgTokens = (t.inputTokens + t.outputTokens) / fleetTurns;
  const fleetAvgInput = t.inputTokens / fleetTurns;
  const fleetAvgOutput = t.outputTokens / fleetTurns;
  const fleetAvgDuration = t.durationMs / fleetTurns;

  const maxAvgTokens = skillRows[0]?.avgTokens ?? 1;
  const maxAvgDuration = Math.max(...skillRows.map((r) => r.avgDurationMs), 1);

  return (
    <div className="usage-panel">
      <div className="usage-head-row">
        <div>
          <h2 className="usage-h">Token usage</h2>
          <p className="admin-muted" style={{ marginTop: 2 }}>
            Average tokens and run-time per turn, by skill — across all processes.
          </p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={refresh}>
          Refresh
        </button>
      </div>

      {/* Fleet averages strip */}
      <div className="usage-totals">
        <div className="usage-stat usage-stat--accent">
          <span className="usage-stat-k">Avg tokens / turn</span>
          <span className="usage-stat-v">{fmt(fleetAvgTokens)}</span>
        </div>
        <div className="usage-stat">
          <span className="usage-stat-k">Avg input / turn</span>
          <span className="usage-stat-v">{fmt(fleetAvgInput)}</span>
        </div>
        <div className="usage-stat">
          <span className="usage-stat-k">Avg output / turn</span>
          <span className="usage-stat-v">{fmt(fleetAvgOutput)}</span>
        </div>
        <div className="usage-stat usage-stat--accent">
          <span className="usage-stat-k">Avg run-time / turn</span>
          <span className="usage-stat-v">{dur(fleetAvgDuration)}</span>
        </div>
        <div className="usage-stat">
          <span className="usage-stat-k">Total turns</span>
          <span className="usage-stat-v">{fleetTurns}</span>
        </div>
        <div className="usage-stat">
          <span className="usage-stat-k">Processes</span>
          <span className="usage-stat-v">{data.processes.length}</span>
        </div>
      </div>

      {/* Dual-bar chart card */}
      <div className="usage-chart-card">
        <div className="usage-chart-head">
          <span className="usage-chart-title">By skill — averages per turn</span>
          <div className="usage-legend">
            <span className="usage-legend-item">
              <span className="usage-legend-swatch" style={{ background: "var(--accent)" }} />
              Avg input
            </span>
            <span className="usage-legend-item">
              <span className="usage-legend-swatch" style={{ background: "#6366f1" }} />
              Avg output
            </span>
          </div>
        </div>

        <div className="usage-dual">
          {/* Left: avg tokens/turn */}
          <div className="usage-col">
            <div className="usage-col-head">Avg tokens / turn</div>
            {skillRows.map((row) => {
              const inputW = pct(row.avgInput, maxAvgTokens);
              const outputW = pct(row.avgOutput, maxAvgTokens);
              return (
                <div key={row.skill} className="usage-bar-row">
                  <span className="usage-bar-label" title={row.skill}>
                    {row.skill}
                    <span className="usage-turns-badge">{row.turns}</span>
                  </span>
                  <div className="usage-bar-track">
                    <div
                      className="usage-bar-seg usage-bar-input"
                      style={{ width: `${inputW}%` }}
                    />
                    <div
                      className="usage-bar-seg usage-bar-output"
                      style={{ width: `${outputW}%` }}
                    />
                  </div>
                  <span className="usage-bar-val">{fmt(row.avgTokens)}</span>
                </div>
              );
            })}
          </div>

          {/* Right: avg run-time/turn */}
          <div className="usage-col usage-col--rt">
            <div className="usage-col-head">Avg run-time / turn</div>
            {skillRows.map((row) => {
              const ratio = row.avgDurationMs / maxAvgDuration;
              const w = pct(row.avgDurationMs, maxAvgDuration);
              return (
                <div key={row.skill} className="usage-bar-row">
                  <span className="usage-bar-label" title={row.skill}>
                    {row.skill}
                  </span>
                  <div className="usage-bar-track">
                    <div
                      className="usage-bar-seg"
                      style={{ width: `${w}%`, background: rtColor(ratio) }}
                    />
                  </div>
                  <span className="usage-bar-val">{dur(row.avgDurationMs)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="usage-chart-footer">
          Token bars sorted by avg cost per turn. Run-time uses the same row order for easy cross-comparison.
        </div>
      </div>

      {/* By-process table — compact, secondary */}
      <h3 className="usage-sub">By process</h3>
      <table className="admin-table usage-table">
        <thead>
          <tr>
            <th>Process</th>
            <th className="num">Turns</th>
            <th className="num">Run-time</th>
            <th className="num">Input</th>
            <th className="num">Output</th>
            <th className="num">Cached</th>
            <th>Last activity</th>
          </tr>
        </thead>
        <tbody>
          {data.processes.map((p) => (
            <tr key={p.slug}>
              <td title={p.slug}>{p.title}</td>
              <td className="num">{p.total.turns}</td>
              <td className="num">{dur(p.total.durationMs)}</td>
              <td className="num">{fmt(p.total.inputTokens)}</td>
              <td className="num">{fmt(p.total.outputTokens)}</td>
              <td className="num">{fmt(p.total.cacheReadTokens)}</td>
              <td>{when(p.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

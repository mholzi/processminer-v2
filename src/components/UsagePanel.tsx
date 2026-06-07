"use client";

import { useEffect, useState } from "react";
import type { UsageOverview } from "@/lib/token-usage";
import type { SkillUsageEntry } from "@/lib/runtime-store";

// Admin → Token usage. Read-only roll-up of LLM token usage across every
// process: a grand total, a per-skill sum (the "tokens per skill" headline),
// and a per-process breakdown. No cost is shown — tokens only.

/** "12.3k" / "1.20k" / "950" — compact token count. */
function fmt(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(2)}k`;
  return String(n);
}

function when(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

/** Rows of a usage table, sorted by total tokens descending. */
function rows(bySkill: Record<string, SkillUsageEntry>) {
  return Object.entries(bySkill).sort(
    (a, b) =>
      b[1].inputTokens + b[1].outputTokens - (a[1].inputTokens + a[1].outputTokens),
  );
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
  const skillRows = rows(data.bySkill);
  const hasAny = t.turns > 0;

  return (
    <div className="usage-panel">
      <div className="usage-head-row">
        <h2 className="usage-h">Token usage</h2>
        <button type="button" className="admin-btn-secondary" onClick={refresh}>
          Refresh
        </button>
      </div>
      <p className="admin-muted">
        LLM tokens recorded across every process, summed per skill. Tokens only —
        no cost. A multi-turn skill (a foundational run) sums all its turns.
      </p>

      {!hasAny ? (
        <div className="empty-state">
          <p>No usage recorded yet.</p>
          <p className="empty-hint">
            Token usage is captured per turn from this point on — run a skill and
            it will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="usage-totals">
            <div className="usage-stat">
              <span className="usage-stat-k">Input</span>
              <span className="usage-stat-v">{fmt(t.inputTokens)}</span>
            </div>
            <div className="usage-stat">
              <span className="usage-stat-k">Output</span>
              <span className="usage-stat-v">{fmt(t.outputTokens)}</span>
            </div>
            <div className="usage-stat">
              <span className="usage-stat-k">Cached</span>
              <span className="usage-stat-v">{fmt(t.cacheReadTokens)}</span>
            </div>
            <div className="usage-stat">
              <span className="usage-stat-k">Turns</span>
              <span className="usage-stat-v">{t.turns}</span>
            </div>
            <div className="usage-stat">
              <span className="usage-stat-k">Processes</span>
              <span className="usage-stat-v">{data.processes.length}</span>
            </div>
          </div>

          <h3 className="usage-sub">By skill</h3>
          <table className="admin-table usage-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th className="num">Turns</th>
                <th className="num">Input</th>
                <th className="num">Output</th>
                <th className="num">Cached</th>
              </tr>
            </thead>
            <tbody>
              {skillRows.map(([skill, e]) => (
                <tr key={skill}>
                  <td>{skill}</td>
                  <td className="num">{e.turns}</td>
                  <td className="num">{fmt(e.inputTokens)}</td>
                  <td className="num">{fmt(e.outputTokens)}</td>
                  <td className="num">{fmt(e.cacheReadTokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="usage-sub">By process</h3>
          <table className="admin-table usage-table">
            <thead>
              <tr>
                <th>Process</th>
                <th className="num">Turns</th>
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
                  <td className="num">{fmt(p.total.inputTokens)}</td>
                  <td className="num">{fmt(p.total.outputTokens)}</td>
                  <td className="num">{fmt(p.total.cacheReadTokens)}</td>
                  <td>{when(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

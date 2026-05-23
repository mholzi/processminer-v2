"use client";

import { useEffect, useMemo, useState } from "react";
import { initials } from "@/lib/user";

// Contributors view — variant C from the contributors shotgun.
// Reverse-chronological activity feed for one process, with a left-rail
// people filter. Data comes from /api/processes/<slug>/contributors and
// degrades gracefully on processes that lack notes/ingest/uploads.

type EventKind = "comment" | "upload" | "ingest" | "approval" | "draft";

type ContributorEvent = {
  id: string;
  kind: EventKind;
  by: string;
  ts: string;
  title: string;
  sub?: string;
  elementIds?: string[];
};

type ContributorRollup = {
  by: string;
  total: number;
  approvals: number;
  comments: number;
  uploads: number;
  drafts: number;
  lastActiveAt: string;
};

type ContributorsReport = {
  slug: string;
  events: ContributorEvent[];
  rollups: ContributorRollup[];
  totals: { events: number; approvals: number; comments: number; uploads: number };
};

const KIND_LABEL: Record<EventKind, string> = {
  comment: "commented",
  upload: "uploaded",
  ingest: "extracted",
  approval: "approved",
  draft: "drafted",
};

function avatarTone(by: string): string {
  // Stable color tone based on the name so different people get different
  // accent colors without needing per-user fields.
  let h = 0;
  for (let i = 0; i < by.length; i++) h = (h * 31 + by.charCodeAt(i)) >>> 0;
  const tones = ["", "tone-green", "tone-warn", "tone-gray"];
  return tones[h % tones.length];
}

function bucketLabel(iso: string, now: Date): string {
  const t = new Date(iso);
  const sameDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
  if (sameDay(t, now)) return "Today";
  const y = new Date(now);
  y.setUTCDate(y.getUTCDate() - 1);
  if (sameDay(t, y)) return "Yesterday";
  const days = Math.floor((now.getTime() - t.getTime()) / 86400000);
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
}

function relative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d ago`;
  const w = Math.round(d / 7);
  if (w < 8) return `${w}w ago`;
  const mo = Math.round(d / 30);
  return `${mo}mo ago`;
}

export default function ContributorsView({
  slug,
  processTitle,
}: {
  slug: string;
  processTitle: string;
}) {
  const [report, setReport] = useState<ContributorsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    fetch(`/api/processes/${encodeURIComponent(slug)}/contributors`, {
      credentials: "same-origin",
    })
      .then(async (r) => {
        const data = await r.json();
        if (!live) return;
        if (!r.ok) {
          setError(data.error || `HTTP ${r.status}`);
        } else {
          setReport(data);
        }
      })
      .catch((e) => {
        if (live) setError(e instanceof Error ? e.message : "Failed to load.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [slug]);

  const filtered = useMemo(() => {
    if (!report) return [];
    if (!filter) return report.events;
    return report.events.filter((e) => e.by === filter);
  }, [report, filter]);

  const grouped = useMemo(() => {
    const now = new Date();
    const out: { bucket: string; items: ContributorEvent[] }[] = [];
    for (const e of filtered) {
      const b = bucketLabel(e.ts, now);
      const last = out[out.length - 1];
      if (last && last.bucket === b) last.items.push(e);
      else out.push({ bucket: b, items: [e] });
    }
    return out;
  }, [filtered]);

  if (loading) {
    return (
      <div className="contrib-status">Loading contributors…</div>
    );
  }
  if (error) {
    return <div className="contrib-status">⚠ {error}</div>;
  }
  if (!report) return null;

  return (
    <div className="contrib-root">
      <header className="contrib-head">
        <h1>Contributors</h1>
        <p className="contrib-lede">
          Every contribution to <b>{processTitle}</b>, latest first. Click a
          person in the rail to scope the feed.
        </p>
      </header>

      <div className="contrib-layout">
        <aside className="contrib-side">
          <h3>Filter by person</h3>
          <button
            type="button"
            className={`contrib-side-all${filter === null ? " on" : ""}`}
            onClick={() => setFilter(null)}
          >
            ▾ Everyone <span className="n">{report.totals.events}</span>
          </button>
          <ul className="contrib-people">
            {report.rollups.map((r) => (
              <li
                key={r.by}
                className={filter === r.by ? "on" : ""}
                onClick={() =>
                  setFilter((prev) => (prev === r.by ? null : r.by))
                }
              >
                <span className={`contrib-av-mini ${avatarTone(r.by)}`}>
                  {initials(r.by) || "·"}
                </span>
                <span className="contrib-person-name">{r.by}</span>
                <span className="n">{r.total}</span>
              </li>
            ))}
          </ul>

          <div className="contrib-totals">
            <div><b>{report.totals.events}</b> total events</div>
            <div><b>{report.totals.comments}</b> comments</div>
            <div><b>{report.totals.uploads}</b> uploads / ingests</div>
            {report.totals.approvals > 0 && (
              <div><b>{report.totals.approvals}</b> approvals</div>
            )}
          </div>
        </aside>

        <div className="contrib-main">
          {grouped.length === 0 ? (
            <div className="contrib-empty">
              No activity recorded yet for this process. Comments, uploads
              and the next ingest run will appear here.
            </div>
          ) : (
            grouped.map((g) => (
              <section key={g.bucket} className="contrib-group">
                <div className="contrib-day">{g.bucket}</div>
                {g.items.map((e) => (
                  <article key={e.id} className="contrib-event">
                    <span className={`contrib-av ${avatarTone(e.by)}`}>
                      {initials(e.by) || "·"}
                    </span>
                    <div className="contrib-event-body">
                      <div className="contrib-event-line">
                        <span className={`contrib-kind kind-${e.kind}`}>
                          {KIND_LABEL[e.kind]}
                        </span>
                        <span className="contrib-who">{e.by}</span> {e.title}
                      </div>
                      {e.sub && <div className="contrib-event-sub">{e.sub}</div>}
                    </div>
                    <span className="contrib-event-when">
                      {relative(e.ts)}
                    </span>
                  </article>
                ))}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

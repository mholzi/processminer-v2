"use client";

import { useEffect, useMemo, useState } from "react";
import { initials } from "@/lib/user";
import { useDisplayName } from "@/lib/user-roster-client";

// Contributors view — BA-remix from the contributors-page-20260526 shotgun.
// Top: compact people roster (one card per contributor, rollup stats).
// Bottom: activity feed in A-style (day buckets, kind pills, event rows),
// click-filtered by the selected person. Default state: the
// most-recently-active person is pre-selected, so the user lands on
// "who was last active, and what did they do" without a click.
//
// Data: /api/processes/<slug>/contributors. Degrades gracefully when a
// process has no notes / uploads / ingest yet.
//
// Identity model: rollup.by and event.by store the stable `username`
// (post-userid migration). useDisplayName resolves username → current
// display name at render time via /api/users/roster. Actors that don't
// match the roster (historical SMEs, skill sentinels) fall through with
// their stored value and earn a pill so the UI flags them.

type EventKind =
  | "comment"
  | "upload"
  | "ingest"
  | "approval"
  | "draft"
  | "lint"
  | "section-status";

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

type KindFilter = "all" | "approval" | "comment" | "draft" | "upload";

const KIND_LABEL: Record<EventKind, string> = {
  comment: "commented",
  upload: "uploaded",
  ingest: "extracted",
  approval: "approved",
  draft: "drafted",
  lint: "audited",
  "section-status": "marked",
};

// `by` values stamped by skills and bootstrap code, not real users. Treated
// as a distinct actor type ("skill"); they get their own pill in the roster.
const SKILL_ACTORS = new Set([
  "the assistant",
  "bootstrap",
  "scaffold",
  "unknown",
  "run-lint",
  "document-ingest",
  "foundational-run",
]);

function avatarTone(by: string): string {
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

function mostRecentActor(rollups: ContributorRollup[]): string | null {
  const human = rollups.filter((r) => !SKILL_ACTORS.has(r.by));
  const pool = human.length > 0 ? human : rollups;
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) =>
    b.lastActiveAt.localeCompare(a.lastActiveAt),
  )[0].by;
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
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  // The default-selected person is computed from the rollups on load. After
  // that the user owns the filter — flipping `filter` to null is an
  // explicit "show all", not an implicit "go back to the default".
  const [defaultApplied, setDefaultApplied] = useState(false);
  // The feed is capped to a window so a mature process with hundreds of
  // events doesn't bury the screen on first load. Click "Show N more" to
  // grow the window; each click adds another PAGE_SIZE rows.
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Reset the window when the filter or kind tab changes — otherwise the
  // cap from a previous view carries over and hides events the user just
  // narrowed to.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, kindFilter]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    setDefaultApplied(false);
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

  // Pre-select the most-recently-active person on first load. Only fires
  // once per fetch — once the user has interacted, their choice sticks.
  useEffect(() => {
    if (!report || defaultApplied) return;
    setFilter(mostRecentActor(report.rollups));
    setDefaultApplied(true);
  }, [report, defaultApplied]);

  const filtered = useMemo(() => {
    if (!report) return [];
    return report.events.filter((e) => {
      if (filter && e.by !== filter) return false;
      if (kindFilter === "all") return true;
      if (kindFilter === "approval") return e.kind === "approval";
      if (kindFilter === "comment") return e.kind === "comment";
      if (kindFilter === "draft") return e.kind === "draft";
      if (kindFilter === "upload")
        return e.kind === "upload" || e.kind === "ingest";
      return true;
    });
  }, [report, filter, kindFilter]);

  // Cap the visible slice — the feed grows in PAGE_SIZE chunks via the
  // "Show more" button below. `filtered` is the source of truth for the
  // total; `visible` is what we actually render.
  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const remaining = Math.max(0, filtered.length - visible.length);

  const grouped = useMemo(() => {
    const now = new Date();
    const out: { bucket: string; items: ContributorEvent[] }[] = [];
    for (const e of visible) {
      const b = bucketLabel(e.ts, now);
      const last = out[out.length - 1];
      if (last && last.bucket === b) last.items.push(e);
      else out.push({ bucket: b, items: [e] });
    }
    return out;
  }, [visible]);

  if (loading) {
    return <div className="contrib-status">Loading contributors…</div>;
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
          {report.rollups.length} {report.rollups.length === 1 ? "person" : "people"}
          {" · "}
          {report.totals.events} {report.totals.events === 1 ? "event" : "events"} on{" "}
          <b>{processTitle}</b>. Click a card to scope the feed.
        </p>
      </header>

      <section className="contrib-roster">
        {report.rollups.map((r) => (
          <PersonCard
            key={r.by}
            rollup={r}
            selected={filter === r.by}
            onSelect={() =>
              setFilter((prev) => (prev === r.by ? null : r.by))
            }
          />
        ))}
      </section>

      <FilterBanner
        filter={filter}
        rollups={report.rollups}
        totalEvents={report.totals.events}
        onClear={() => setFilter(null)}
      />

      <div className="contrib-feed-head">
        <span className="contrib-feed-title">Activity feed</span>
        <div className="contrib-feed-tabs">
          {(["all", "approval", "comment", "draft", "upload"] as KindFilter[]).map(
            (k) => (
              <button
                key={k}
                type="button"
                className={`contrib-feed-tab${kindFilter === k ? " on" : ""}`}
                onClick={() => setKindFilter(k)}
              >
                {k === "all"
                  ? "All"
                  : k === "approval"
                    ? "Approvals"
                    : k === "comment"
                      ? "Comments"
                      : k === "draft"
                        ? "Drafts"
                        : "Uploads"}
              </button>
            ),
          )}
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="contrib-empty">
          {filter
            ? `No ${kindFilter === "all" ? "" : kindFilter + " "}activity from this person yet.`
            : "No activity recorded yet for this process. Comments, uploads and the next ingest run will appear here."}
        </div>
      ) : (
        <>
          {grouped.map((g) => (
            <section key={g.bucket} className="contrib-group">
              <div className="contrib-day">{g.bucket}</div>
              {g.items.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </section>
          ))}
          {remaining > 0 && (
            <div className="contrib-more">
              <button
                type="button"
                className="contrib-more-btn"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Show {Math.min(remaining, PAGE_SIZE)} more
                <span className="contrib-more-rest">
                  · {remaining} hidden
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PersonCard({
  rollup,
  selected,
  onSelect,
}: {
  rollup: ContributorRollup;
  selected: boolean;
  onSelect: () => void;
}) {
  const displayName = useDisplayName(rollup.by);
  const isSkill = SKILL_ACTORS.has(rollup.by);
  // "Historical" = not in the live roster: the resolver fell through and
  // returned the raw `by` string. Skill sentinels are not historical — they
  // resolve to their own bucket above.
  const isHistorical = !isSkill && displayName === rollup.by && rollup.by.includes(" ");
  const av = isSkill ? "⚙" : initials(displayName) || "·";

  return (
    <button
      type="button"
      className={`contrib-pcard${selected ? " on" : ""}${isHistorical ? " historical" : ""}${isSkill ? " skill" : ""}`}
      onClick={onSelect}
    >
      <div className="contrib-pcard-top">
        <span className={`contrib-pcard-av ${avatarTone(rollup.by)}`}>{av}</span>
        <div className="contrib-pcard-meta">
          <span className="contrib-pcard-name">{displayName}</span>
          <span className="contrib-pcard-handle">
            @{rollup.by}
            {isHistorical && <span className="contrib-pill historical">historical</span>}
            {isSkill && <span className="contrib-pill skill">skill</span>}
          </span>
        </div>
      </div>
      <div className="contrib-pcard-stats">
        <span className="contrib-stat">
          <span className="contrib-stat-num">{rollup.approvals}</span>
          <span className="contrib-stat-lbl">apr</span>
        </span>
        <span className="contrib-stat">
          <span className="contrib-stat-num">{rollup.comments}</span>
          <span className="contrib-stat-lbl">com</span>
        </span>
        <span className="contrib-stat">
          <span className="contrib-stat-num">{rollup.uploads}</span>
          <span className="contrib-stat-lbl">up</span>
        </span>
        <span className="contrib-stat">
          <span className="contrib-stat-num">{rollup.drafts}</span>
          <span className="contrib-stat-lbl">dr</span>
        </span>
      </div>
      <div className="contrib-pcard-last">
        Last active {relative(rollup.lastActiveAt)}
      </div>
    </button>
  );
}

function FilterBanner({
  filter,
  rollups,
  totalEvents,
  onClear,
}: {
  filter: string | null;
  rollups: ContributorRollup[];
  totalEvents: number;
  onClear: () => void;
}) {
  // Hooks must run unconditionally — resolve the display name even when no
  // filter is active. The empty `filter ?? ""` lookup falls through cheaply.
  const resolved = useDisplayName(filter ?? "");
  if (!filter) {
    return (
      <div className="contrib-banner all">
        <span>
          Showing activity from <b>everyone</b> — {totalEvents}{" "}
          {totalEvents === 1 ? "event" : "events"}
        </span>
      </div>
    );
  }
  const r = rollups.find((x) => x.by === filter);
  const count = r?.total ?? 0;
  return (
    <div className="contrib-banner">
      <span>
        Showing activity by <code>{resolved}</code> — {count}{" "}
        {count === 1 ? "event" : "events"}
      </span>
      <button type="button" className="contrib-banner-clear" onClick={onClear}>
        Show all people ×
      </button>
    </div>
  );
}

function EventRow({ event }: { event: ContributorEvent }) {
  const displayName = useDisplayName(event.by);
  const isSkill = SKILL_ACTORS.has(event.by);
  const av = isSkill ? "⚙" : initials(displayName) || "·";
  return (
    <article className="contrib-event">
      <span className={`contrib-av ${avatarTone(event.by)}`}>{av}</span>
      <div className="contrib-event-body">
        <div className="contrib-event-line">
          <span className={`contrib-kind kind-${event.kind}`}>
            {KIND_LABEL[event.kind]}
          </span>
          <span className="contrib-who">{displayName}</span> {event.title}
        </div>
        {event.sub && <div className="contrib-event-sub">{event.sub}</div>}
      </div>
      <span className="contrib-event-when">{relative(event.ts)}</span>
    </article>
  );
}

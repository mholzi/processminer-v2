"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProcessDoc } from "@/lib/wiki";
import { hasEntitlement, initials, type User } from "@/lib/user";
import { isOpen } from "@/lib/lint";
import RelativeTime from "./RelativeTime";

// The welcome screen — replaces SplashScreen. One component, three faces:
// Processminer only, ArchitectMiner only, or both. The same shape across
// all entitlement scenarios: greeting + one resume hero + an attention
// queue + a recent strip. The accent flips between blue (PM) and green
// (AM) based on the active view.
//
// Today only PM has real data (in-flight foundational runs, conflicts,
// lint findings, comments, processes ready for handoff). AM-side queue
// rows render as soon as that data exists; the structure is here.

type View = "both" | "pm" | "am";

// The seven sections of a process that together make up the Target Process
// area. A process is "ready for architecture handoff" when every element
// in those sections is confirmed (mirrors HandoffInbox + the old splash).
const TARGET_SECTIONS = new Set([
  "to-be-design",
  "transformation-decisions",
  "requirements",
  "dependencies",
  "assumptions",
  "gap-resolution",
  "validation",
]);

const RECENT_KEY = "pm.procsw.recent";

type PMItem = {
  kind: "pm-attention" | "handoff";
  slug: string;
  id: string;
  title: string;
  /** Sub-bullets that compose the row's summary. */
  reasons: string[];
  /** For sorting — higher = more urgent. */
  weight: number;
};

function pmAttentionForDoc(d: ProcessDoc): PMItem | null {
  const conflicts = d.ingest?.conflicts?.length ?? 0;
  const lint = d.lint?.findings?.filter(isOpen).length ?? 0;
  let openComments = 0;
  if (d.notes) {
    for (const arr of Object.values(d.notes)) {
      for (const n of arr) if (!n.resolved) openComments++;
    }
  }
  const reasons: string[] = [];
  if (conflicts) reasons.push(`${conflicts} ingest conflict${conflicts === 1 ? "" : "s"}`);
  if (lint) reasons.push(`${lint} quality finding${lint === 1 ? "" : "s"}`);
  if (openComments) reasons.push(`${openComments} comment${openComments === 1 ? "" : "s"}`);
  if (reasons.length === 0) return null;
  return {
    kind: "pm-attention",
    slug: d.slug,
    id: d.process.id,
    title: d.process.title,
    reasons,
    // Conflicts beat lint beats comments — urgency-weighted.
    weight: conflicts * 100 + lint * 5 + openComments,
  };
}

function handoffReady(d: ProcessDoc): boolean {
  let total = 0;
  let confirmed = 0;
  for (const e of d.elements) {
    if (!TARGET_SECTIONS.has(e.section)) continue;
    total++;
    if (e.status === "confirmed") confirmed++;
  }
  return total > 0 && confirmed === total;
}

export default function WelcomeScreen({
  docs,
  user,
  onEnterProcessminer,
  onEnterArchitectminer,
  onEnterAdmin,
  onSignOut,
}: {
  docs: ProcessDoc[];
  user: User;
  onEnterProcessminer: (slug?: string) => void;
  onEnterArchitectminer: (slug?: string) => void;
  /** Set only for admin users — opens the admin screen. */
  onEnterAdmin?: () => void;
  onSignOut: () => void;
}) {
  const hasPM = hasEntitlement(user, "pm");
  const hasAM = hasEntitlement(user, "am");
  const scenario: "pm" | "am" | "both" =
    hasPM && hasAM ? "both" : hasAM ? "am" : "pm";

  const [view, setView] = useState<View>(scenario === "both" ? "both" : scenario);
  useEffect(() => {
    // If the user's entitlements change between renders, fix the view to
    // something legal.
    if (scenario !== "both" && view !== scenario) setView(scenario);
  }, [scenario, view]);

  // ----- derive the in-flight foundational run (the PM resume hero) -----
  const inflightPM = useMemo(() => {
    if (!hasPM) return null;
    return (
      docs
        .filter((d) => d.reviewState && !d.reviewState.done)
        .sort((a, b) =>
          b.reviewState!.updatedAt.localeCompare(a.reviewState!.updatedAt),
        )[0] ?? null
    );
  }, [docs, hasPM]);

  // ----- derive the queue items (real data, per-process aggregated) -----
  const pmAttention = useMemo(() => {
    if (!hasPM) return [];
    const items: PMItem[] = [];
    for (const d of docs) {
      const it = pmAttentionForDoc(d);
      if (it) items.push(it);
    }
    return items.sort((a, b) => b.weight - a.weight);
  }, [docs, hasPM]);

  const handoffDocs = useMemo(
    () => (hasPM || hasAM ? docs.filter(handoffReady) : []),
    [docs, hasPM, hasAM],
  );

  // ----- recents (shared with the process switcher palette) -----
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setRecentSlugs(parsed.filter((s) => typeof s === "string"));
        }
      }
    } catch {
      // localStorage may be unavailable — recents quietly stay empty.
    }
  }, []);

  // Build the visible recents — only entitled processes that still exist.
  const recents = useMemo(() => {
    const slugSet = new Set(docs.map((d) => d.slug));
    const fromStore = recentSlugs.filter((s) => slugSet.has(s));
    // Pad with most-recently-touched docs if recents are thin.
    const padding = [...docs]
      .sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""))
      .map((d) => d.slug)
      .filter((s) => !fromStore.includes(s));
    return [...fromStore, ...padding].slice(0, 6).map((slug) => {
      const d = docs.find((x) => x.slug === slug)!;
      return { slug, id: d.process.id, title: d.process.title, lastModified: d.lastModified };
    });
  }, [recentSlugs, docs]);

  // ----- visible queue rows for current view -----
  const visibleAttention = pmAttention.filter(
    () => view === "both" || view === "pm",
  );
  const visibleHandoffs = handoffDocs;
  const queueLength = visibleAttention.length + visibleHandoffs.length;

  // ----- counts in the module tabs (only matters in Both scenario) -----
  const pmCount = pmAttention.length;
  // AM real-data items don't exist yet; the tab still shows the handoff
  // count as a useful placeholder so the AM tab isn't visually empty.
  const amCount = handoffDocs.length;

  const greetCount =
    scenario === "both"
      ? view === "both"
        ? `${queueLength} ${queueLength === 1 ? "thing" : "things"} across both modules`
        : view === "pm"
          ? `${queueLength} in Processminer`
          : `${queueLength} in ArchitectMiner`
      : scenario === "pm"
        ? `${queueLength} ${queueLength === 1 ? "thing" : "things"} need you${
            handoffDocs.length ? ` · ${handoffDocs.length} handoff${handoffDocs.length === 1 ? "" : "s"} outbound` : ""
          }`
        : `${handoffDocs.length} ${handoffDocs.length === 1 ? "handoff" : "handoffs"} received`;

  const bodyMod: "pm" | "am" = view === "am" ? "am" : "pm";

  // localStorage write — bump a slug to the front of the recents list.
  // Shared with the process switcher palette, so the welcome screen and the
  // ⌘K palette stay in sync.
  function bumpRecent(slug: string) {
    setRecentSlugs((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 6);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }

  const openProcess = (slug: string) => {
    bumpRecent(slug);
    // The module tab acts as a routing toggle: when ArchitectMiner is
    // active, every "open process" action routes to the architect canvas
    // (read-only inputs + draft architect elements). Otherwise the SME
    // canvas opens. The gate that used to require a handoff-ready process
    // is intentionally loose — architects browse all processes, not just
    // the locked ones.
    if (view === "am" && hasAM) {
      onEnterArchitectminer(slug);
    } else {
      onEnterProcessminer(slug);
    }
  };

  const openHandoff = (slug: string) => {
    if (hasAM) {
      onEnterArchitectminer(slug);
    } else {
      // PM-only outbound: just open the process so they can see the locked
      // target state. No real "view handoff status" page yet.
      onEnterProcessminer(slug);
    }
  };

  return (
    <div className="ws-root" data-mod={bodyMod} data-scenario={scenario}>
      <header className="ws-topbar">
        <span className="ws-wordmark">PROCESSMINER</span>
        <span className="ws-sub">platform</span>

        {scenario === "both" && (
          <div className="ws-mod-tabs" role="tablist" aria-label="Module">
            {(["both", "pm", "am"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                className={`ws-mod-tab${view === v ? " on" : ""}`}
                onClick={() => setView(v)}
              >
                <span className={`ws-mod-dot ws-${v}`} />
                {v === "both" ? "Both" : v === "pm" ? "Processminer" : "ArchitectMiner"}
                {v !== "both" && (
                  <span className="ws-mod-num">{v === "pm" ? pmCount : amCount}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {scenario !== "both" && (
          <span className="ws-you-are">
            <span className="ws-mod-dot" />
            {scenario === "pm" ? "Processminer" : "ArchitectMiner"}
          </span>
        )}

        <span className="ws-spacer" />
        {onEnterAdmin && (
          <button
            type="button"
            className="ws-admin-link"
            onClick={onEnterAdmin}
            title="User administration"
          >
            ⚙ Admin
          </button>
        )}
        <span className="ws-user-mini">
          {user.name} · {user.role}
        </span>
        <button
          type="button"
          className="ws-avatar"
          onClick={onSignOut}
          title="Sign out"
          aria-label="Sign out"
        >
          {initials(user.name)}
        </button>
      </header>

      <main className="ws-page">
        <div className="ws-greet-eyebrow">
          {todayLabel()} · welcome back, {user.name.split(/\s+/)[0]}
        </div>
        <h1 className="ws-greet-h">{greetCount}</h1>

        {/* Resume hero — primary in-flight thing. PM only for now. */}
        {inflightPM && (view === "both" || view === "pm") && (
          <button
            type="button"
            className="ws-resume"
            onClick={() => openProcess(inflightPM.slug)}
          >
            <span className="ws-resume-ico">▶</span>
            <span className="ws-resume-body">
              <span className="ws-resume-eyebrow">Resume foundational run</span>
              <span className="ws-resume-title">
                {inflightPM.process.id} · {inflightPM.process.title}
              </span>
              <span className="ws-resume-sub">
                Paused at item{" "}
                <b>
                  {inflightPM.reviewState!.cursor + 1} of {inflightPM.reviewState!.total}
                </b>
              </span>
            </span>
            <span className="ws-resume-cta">Resume →</span>
          </button>
        )}

        {/* The queue */}
        <section className="ws-sec">
          <div className="ws-sec-h">
            <h2>Needs your attention</h2>
            <span className="ws-sec-num">{queueLength} items</span>
          </div>

          {queueLength === 0 ? (
            <div className="ws-empty">
              Nothing in your queue. Pick up a process from <b>recent</b> or
              create a new one.
            </div>
          ) : (
            <div className="ws-attn-list">
              {/* Handoffs first — cross-module rows surface above per-process attention */}
              {visibleHandoffs.map((d) => (
                <button
                  key={`h-${d.slug}`}
                  type="button"
                  className={`ws-attn-item ws-handoff ${
                    scenario === "pm"
                      ? "outbound"
                      : scenario === "am"
                        ? "inbound"
                        : "cross"
                  }`}
                  onClick={() => openHandoff(d.slug)}
                >
                  <span className="ws-attn-body">
                    <span className="ws-badges">
                      <span className="ws-badge handoff">
                        {scenario === "pm"
                          ? "Outbound"
                          : scenario === "am"
                            ? "PM → AM · Inbox"
                            : "PM → AM"}
                      </span>
                    </span>
                    <span className="ws-attn-title">
                      <span className="ws-pm-id">{d.process.id}</span> ·{" "}
                      <b>{d.process.title}</b>{" "}
                      {scenario === "pm"
                        ? "is locked — awaiting architect pickup"
                        : scenario === "am"
                          ? "just landed in your inbox"
                          : "ready for architecture handoff"}
                    </span>
                    <span className="ws-attn-sub">
                      Target Process complete · transformation team signed off
                    </span>
                  </span>
                  <span className="ws-attn-cta">
                    {scenario === "pm"
                      ? "View status →"
                      : scenario === "am"
                        ? "Open handoff →"
                        : "Hand off →"}
                  </span>
                </button>
              ))}

              {/* PM attention rows */}
              {visibleAttention.map((it) => (
                <button
                  key={`pm-${it.slug}`}
                  type="button"
                  className="ws-attn-item"
                  onClick={() => openProcess(it.slug)}
                >
                  <span className="ws-attn-body">
                    {scenario === "both" && (
                      <span className="ws-badges">
                        <span className="ws-badge pm">PM</span>
                      </span>
                    )}
                    <span className="ws-attn-title">
                      <span className="ws-pm-id">{it.id}</span> · {it.reasons.join(" · ")}
                    </span>
                    <span className="ws-attn-sub">{it.title}</span>
                  </span>
                  <span className="ws-attn-cta">Open →</span>
                </button>
              ))}

              {/* AM attention rows would go here — no real AM data yet. */}
            </div>
          )}
        </section>

        {/* Footer: recents strip + new process */}
        <footer className="ws-foot">
          <div className="ws-foot-label">Recent</div>
          <div className="ws-recents">
            {recents.map((r, i) => (
              <button
                key={r.slug}
                type="button"
                className={`ws-recent-chip${i === 0 ? " current" : ""}`}
                onClick={() => openProcess(r.slug)}
              >
                <span className="ws-recent-id">{r.id}</span>
                <span className="ws-recent-name">{r.title}</span>
                {r.lastModified && (
                  <RelativeTime ts={r.lastModified} className="ws-recent-when" />
                )}
              </button>
            ))}
            <button
              type="button"
              className="ws-recent-chip add"
              onClick={() => onEnterProcessminer()}
            >
              + New process
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

// A stable "today" label — same on server + client.
function todayLabel(): string {
  const d = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

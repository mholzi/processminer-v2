"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProcessDoc } from "@/lib/wiki";
import { hasEntitlement, type User } from "@/lib/user";
import { buildAttentionFeed } from "@/lib/orchestrator";
import UserMenu from "./UserMenu";
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

// The PM "attention" list is now built by src/lib/orchestrator.ts —
// buildAttentionFeed(docs) returns the same shape this component used to
// derive inline (the reasons + weight formula are preserved byte-identical so
// the dashboard's row order doesn't change). The handoff queue stays here
// because it's a different concept (every-element-confirmed in the target
// sections), with no overlap with the orchestrator's action vocabulary.

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
  onCreateProcess,
  onEnterAdmin,
  onUserUpdated,
  onSignOut,
}: {
  docs: ProcessDoc[];
  user: User;
  onEnterProcessminer: (slug?: string) => void;
  onEnterArchitectminer: (slug?: string) => void;
  /** Opens the processminer workspace straight into the new-process flow.
   *  Without this, the splash's "+ New process" chip would just enter with
   *  no slug and ProcessDocScreen would fall back to whichever process owns
   *  the most recent foundational run. */
  onCreateProcess: () => void;
  /** Set only for admin users — opens the admin screen. */
  onEnterAdmin?: () => void;
  /** Called when the user updates their own profile from the avatar menu. */
  onUserUpdated: (u: User) => void;
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
  // Cross-process attention feed comes from the orchestrator now (v0.4).
  // Already sorted by weight, highest first.
  const pmAttention = useMemo(
    () => (hasPM ? buildAttentionFeed(docs).attentionRows : []),
    [docs, hasPM],
  );

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

  // Build the visible recents — most-recently-touched first, regardless of
  // browser visit order. The localStorage list still drives the ⌘K palette,
  // but on the splash the user expects chronological order to match the
  // "X ago" labels on each chip.
  const recents = useMemo(() => {
    return [...docs]
      .sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""))
      .slice(0, 6)
      .map((d) => ({
        slug: d.slug,
        id: d.process.id,
        title: d.process.title,
        lastModified: d.lastModified,
      }));
  }, [docs]);

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
        <span className="ws-user-mini">
          {user.name} · {user.role}
        </span>
        <UserMenu
          user={user}
          onUserUpdated={onUserUpdated}
          onEnterAdmin={onEnterAdmin}
          onSignOut={onSignOut}
        />
      </header>

      <main className="ws-page">
        <div className="ws-greet-eyebrow">
          {todayLabel()} · welcome back, {user.name.split(/\s+/)[0]}
        </div>
        <h1 className="ws-greet-h">{greetCount}</h1>

        {/* Three-column dashboard (approved variant B, 2026-05-26):
            Resume / Inbox · Attention · Open process. Every action one click
            away. The left column adapts by view: a foundational-run resume
            hero in PM/Both, an Architect inbox entry in AM. */}
        <div className="ws-cols">
          {/* ---- Resume / Inbox column ----
              PM/Both view → Resume foundational run hero (when one is paused).
              AM view → Architect inbox card (opens HandoffInbox via the
              no-slug onEnterArchitectminer call). */}
          {view === "am" || scenario === "am" ? (
            <section className="ws-col ws-col-resume">
              <div className="ws-col-head">
                <h2>Architect inbox</h2>
                <span className="ws-col-count">
                  {handoffDocs.length} ready
                </span>
              </div>
              <button
                type="button"
                className="ws-resume"
                onClick={() => onEnterArchitectminer()}
              >
                <span className="ws-resume-ico">⌖</span>
                <span className="ws-resume-body">
                  <span className="ws-resume-eyebrow">Open architect inbox</span>
                  <span className="ws-resume-title">
                    {handoffDocs.length > 0
                      ? `${handoffDocs.length} process${handoffDocs.length === 1 ? "" : "es"} ready for architecture handoff`
                      : "No handoffs ready yet"}
                  </span>
                  <span className="ws-resume-sub">
                    {handoffDocs.length > 0
                      ? "Every Target Process element confirmed by the SME team."
                      : "Browse all processes the architect side has access to."}
                  </span>
                </span>
                <span className="ws-resume-cta">Open inbox →</span>
              </button>
            </section>
          ) : (
            <section className="ws-col ws-col-resume">
              <div className="ws-col-head">
                <h2>Resume</h2>
                <span className="ws-col-count">
                  {inflightPM ? "1 in-flight" : "nothing paused"}
                </span>
              </div>
              {inflightPM ? (
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
              ) : (
                <div className="ws-col-empty">
                  Nothing paused right now. Pick a process from{" "}
                  <b>Open process</b> to start a run.
                </div>
              )}
            </section>
          )}

          {/* ---- Attention column ---- */}
          <section className="ws-col ws-col-attn">
            <div className="ws-col-head">
              <h2>Attention</h2>
              <span className="ws-col-count">
                {queueLength} item{queueLength === 1 ? "" : "s"}
              </span>
            </div>
            {queueLength === 0 ? (
              <div className="ws-col-empty">
                Your queue is clear. No conflicts, no open lint findings, no
                handoffs waiting.
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
                        <span className="ws-pm-id">{it.id}</span> ·{" "}
                        {it.reasons.join(" · ")}
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

          {/* ---- Open process column ---- */}
          <section className="ws-col ws-col-open">
            <div className="ws-col-head">
              <h2>Open process</h2>
              <span className="ws-col-count">
                {recents.length} process{recents.length === 1 ? "" : "es"}
              </span>
            </div>
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
            </div>
            <button
              type="button"
              className="ws-new-process"
              onClick={onCreateProcess}
            >
              + New process
            </button>
          </section>
        </div>
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

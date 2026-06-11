"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProcessDoc } from "@/lib/wiki";
import { hasEntitlement, initials, type User } from "@/lib/user";
import { buildAttentionFeed } from "@/lib/orchestrator";
import RelativeTime from "./RelativeTime";
import AdvisorChat from "./AdvisorChat";
import UserProfileModal from "./UserProfileModal";
import { ADVISORS } from "@/lib/advisor";

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

function GuestWelcomeScreen({
  onSignIn,
}: {
  onSignIn?: () => void;
}) {
  const [advisorOpen, setAdvisorOpen] = useState<string | null>(null);

  return (
    <div className="ws-root" data-mod="pm" data-scenario="pm">
      <header className="ws-topbar">
        <span className="ws-wordmark">PROCESSMINER</span>
        <span className="ws-sub">platform</span>
        <span className="ws-spacer" />
        <button
          type="button"
          className="ws-signin-btn"
          onClick={onSignIn}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Sign In
        </button>
      </header>

      <main className="ws-page" style={{ maxWidth: "800px", margin: "4rem auto 0 auto", padding: "0 2rem" }}>
        <h1 className="ws-greet-h" style={{ fontSize: "2.25rem", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Chat to an Agent</h1>
        <p className="ws-greet-sub" style={{ fontSize: "1rem", color: "var(--text-muted)", marginBottom: "3rem" }}>
          Get expert feedback and guidance on your documents and designs.
        </p>

        <section className="ws-sec ws-advisory">
          <div className="ws-ab-roster">
            {ADVISORS.filter(a => a.id === "solution-architect" || a.id === "domain-architect").map((a) => (
              <button
                key={a.id}
                type="button"
                className="ws-ab-card"
                onClick={() => setAdvisorOpen(a.id)}
              >
                <span className="ws-ab-av">{a.monogram}</span>
                <span className="ws-ab-name">{a.name}</span>
                <span className="ws-ab-ask">Ask →</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {advisorOpen && (
        <AdvisorChat
          key={advisorOpen}
          advisorId={advisorOpen}
          onSwitch={setAdvisorOpen}
          onClose={() => setAdvisorOpen(null)}
          docs={[]}
          user={null}
        />
      )}
    </div>
  );
}

export default function WelcomeScreen(props: {
  docs: ProcessDoc[];
  user: User | null;
  onEnterProcessminer: (slug?: string) => void;
  onEnterArchitectminer: (slug?: string) => void;
  /** Set only for admin users — opens the admin screen. */
  onEnterAdmin?: () => void;
  onSignOut: () => void;
  onUpdateUser: (user: User) => void;
  onSignIn?: () => void;
}) {
  if (!props.user) {
    return <GuestWelcomeScreen onSignIn={props.onSignIn} />;
  }
  return <AuthenticatedWelcomeScreen {...props} user={props.user} />;
}

function AuthenticatedWelcomeScreen({
  docs,
  user,
  onEnterProcessminer,
  onEnterArchitectminer,
  onEnterAdmin,
  onSignOut,
  onUpdateUser,
}: {
  docs: ProcessDoc[];
  user: User;
  onEnterProcessminer: (slug?: string) => void;
  onEnterArchitectminer: (slug?: string) => void;
  onEnterAdmin?: () => void;
  onSignOut: () => void;
  onUpdateUser: (user: User) => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState<string | null>(null);

  const hasPM = hasEntitlement(user, "pm");
  const hasAM = hasEntitlement(user, "am");
  const scenario: "pm" | "am" | "both" =
    hasPM && hasAM ? "both" : hasAM ? "am" : "pm";

  const [view, setView] = useState<View>(scenario === "both" ? "both" : scenario);
  // Advisory Board — which advisor's slide-over is open (id), or null.
  const showAdvisory = hasPM && (view === "both" || view === "pm");
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

  // ----- derive the in-flight QER session (the second resume hero) -----
  const inflightQER = useMemo(() => {
    if (!hasPM) return null;
    return (
      docs
        .filter((d) => d.qerState && !d.qerState.done)
        .sort((a, b) =>
          b.qerState!.updatedAt.localeCompare(a.qerState!.updatedAt),
        )[0] ?? null
    );
  }, [docs, hasPM]);

  // ----- derive a regenerated DTP awaiting review (the third resume hero) -----
  const dtpReady = useMemo(() => {
    if (!hasPM) return null;
    return (
      docs
        .filter((d) => d.dtpReport)
        .sort((a, b) =>
          b.dtpReport!.generatedAt.localeCompare(a.dtpReport!.generatedAt),
        )[0] ?? null
    );
  }, [docs, hasPM]);

  // ----- derive the queue items (real data, per-process aggregated) -----
  // The weight formula + reasons phrasing live in the orchestrator read layer
  // (buildAttentionFeed), the canonical home shared with any future consumer;
  // this screen just renders the ranked rows.
  const pmAttention = useMemo<PMItem[]>(() => {
    if (!hasPM) return [];
    return buildAttentionFeed(docs).attentionRows.map((r) => ({
      kind: "pm-attention",
      slug: r.slug,
      id: r.id,
      title: r.title,
      reasons: r.reasons,
      weight: r.weight,
    }));
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
        <button
          type="button"
          className="ws-avatar"
          onClick={() => setProfileOpen(true)}
          title={`${user.name} · ${user.role} — profile`}
          aria-label={`${user.name}, ${user.role} — open profile`}
        >
          {initials(user.name)}
        </button>
      </header>

      {profileOpen && (
        <UserProfileModal
          user={user}
          onUpdateUser={onUpdateUser}
          onSignOut={onSignOut}
          onClose={() => setProfileOpen(false)}
        />
      )}

      <main className="ws-page">

        {/* In-flight work — the single highest-priority item is the hero; any
            others collapse into compact rows so there's one obvious next step
            (review #4). */}
        {(() => {
          const showPM = view === "both" || view === "pm";
          const items = [
            inflightPM && showPM
              ? {
                  key: "pm",
                  ico: "▶",
                  eyebrow: "Resume foundational run",
                  title: `${inflightPM.process.id} · ${inflightPM.process.title}`,
                  sub: (
                    <>
                      Paused at item{" "}
                      <b>
                        {inflightPM.reviewState!.cursor + 1} of{" "}
                        {inflightPM.reviewState!.total}
                      </b>
                    </>
                  ),
                  cta: "Resume →",
                  onClick: () => openProcess(inflightPM.slug),
                }
              : null,
            inflightQER && showPM
              ? {
                  key: "qer",
                  ico: "▶",
                  eyebrow: "Resume QER session",
                  title: `${inflightQER.process.id} · ${inflightQER.process.title}`,
                  sub: (
                    <>
                      Paused at step{" "}
                      <b>
                        {inflightQER.qerState!.queue[inflightQER.qerState!.cursor] ??
                          "—"}
                      </b>{" "}
                      ({inflightQER.qerState!.cursor + 1} of{" "}
                      {inflightQER.qerState!.total})
                    </>
                  ),
                  cta: "Resume →",
                  onClick: () => openProcess(inflightQER.slug),
                }
              : null,
            dtpReady && showPM
              ? {
                  key: "dtp",
                  ico: "♻",
                  eyebrow: "Review regenerated DTP",
                  title: `${dtpReady.process.id} · ${dtpReady.process.title}`,
                  sub: (
                    <>
                      <b>
                        {dtpReady.dtpReport!.findings.length} review finding
                        {dtpReady.dtpReport!.findings.length === 1 ? "" : "s"}
                      </b>{" "}
                      · diff vs {dtpReady.dtpReport!.sourceFile}
                    </>
                  ),
                  cta: "Review →",
                  onClick: () => openProcess(dtpReady.slug),
                }
              : null,
          ].filter((x): x is NonNullable<typeof x> => x !== null);
          if (items.length === 0) return null;
          const [hero, ...rest] = items;
          return (
            <>
              <button
                type="button"
                className={`ws-resume${rest.length ? " ws-resume--has-more" : ""}`}
                onClick={hero.onClick}
              >
                <span className="ws-resume-ico">{hero.ico}</span>
                <span className="ws-resume-body">
                  <span className="ws-resume-eyebrow">{hero.eyebrow}</span>
                  <span className="ws-resume-title">{hero.title}</span>
                  <span className="ws-resume-sub">{hero.sub}</span>
                </span>
                <span className="ws-resume-cta">{hero.cta}</span>
              </button>
              {rest.length > 0 && (
                <div className="ws-resume-more">
                  {rest.map((it) => (
                    <button
                      type="button"
                      key={it.key}
                      className="ws-resume-mini"
                      onClick={it.onClick}
                    >
                      <span className="ws-resume-mini-ico">{it.ico}</span>
                      <span className="ws-resume-mini-eyebrow">{it.eyebrow}</span>
                      <span className="ws-resume-mini-title">{it.title}</span>
                      <span className="ws-resume-mini-cta">{it.cta}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        {/* Open process */}
        <section className="ws-sec">
          <div className="ws-sec-h">
            <h2>Open process</h2>
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
            <button
              type="button"
              className="ws-recent-chip add"
              onClick={() => onEnterProcessminer("_new_")}
            >
              + New process
            </button>
          </div>
        </section>

        {/* The queue */}
        <section className="ws-sec">
          <div className="ws-sec-h">
            <h2>Review your actions</h2>
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
                  <div className="ws-attn-col-badge">
                    <span className="ws-badge handoff">
                      {scenario === "pm"
                        ? "Outbound"
                        : scenario === "am"
                          ? "PM → AM"
                          : "PM → AM"}
                    </span>
                  </div>
                  <div className="ws-attn-col-id">
                    <span className="ws-pm-id">{d.process.id}</span>
                  </div>
                  <div className="ws-attn-col-title">
                    {d.process.title}
                  </div>
                  <div className="ws-attn-col-reason">
                    {scenario === "pm"
                      ? "locked — awaiting architect pickup"
                      : scenario === "am"
                        ? "just landed in your inbox"
                        : "ready for architecture handoff"}
                  </div>
                  <div className="ws-attn-col-cta">
                    <span className="ws-attn-cta">
                      {scenario === "pm"
                        ? "View status →"
                        : scenario === "am"
                          ? "Open handoff →"
                          : "Hand off →"}
                    </span>
                  </div>
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
                  <div className="ws-attn-col-badge">
                    <span className="ws-badge pm">PM</span>
                  </div>
                  <div className="ws-attn-col-id">
                    <span className="ws-pm-id">{it.id}</span>
                  </div>
                  <div className="ws-attn-col-title">
                    {it.title}
                  </div>
                  <div className="ws-attn-col-reason">
                    {it.reasons.join(" · ")}
                  </div>
                  <div className="ws-attn-col-cta">
                    <span className="ws-attn-cta">Open →</span>
                  </div>
                </button>
              ))}

              {/* AM attention rows would go here — no real AM data yet. */}
            </div>
          )}
        </section>

        {/* Advisory Board — sits below the queue; chat with the senior team. */}
        {showAdvisory && (
          <section className="ws-sec ws-advisory">
            <div className="ws-sec-h">
              <h2>Chat to an Agent</h2>
              <span className="ws-sec-num">
                Chat with your senior team across all your processes. <span className="ws-ab-tag">read-only</span>
              </span>
            </div>
            <div className="ws-ab-roster">
              {ADVISORS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="ws-ab-card"
                  onClick={() => setAdvisorOpen(a.id)}
                >
                  <span className="ws-ab-av">{a.monogram}</span>
                  <span className="ws-ab-name">{a.name}</span>
                  <span className="ws-ab-ask">Ask →</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {advisorOpen && (
        // key on the advisor id: switching advisors remounts the chat so it
        // loads that advisor's own transcript instead of keeping the previous
        // one's (useAgentChat state is per-instance, keyed by slug = advisor id).
        <AdvisorChat
          key={advisorOpen}
          advisorId={advisorOpen}
          onSwitch={setAdvisorOpen}
          onClose={() => setAdvisorOpen(null)}
          docs={docs}
          user={user}
          onOpenProcess={(slug) => {
            setAdvisorOpen(null);
            openProcess(slug);
          }}
        />
      )}
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

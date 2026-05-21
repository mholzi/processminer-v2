"use client";

import { useMemo } from "react";
import type { ProcessDoc } from "@/lib/wiki";
import type { User } from "@/lib/user";
import RelativeTime from "./RelativeTime";

// Workspace chooser shown after sign-in, before the process-doc canvas.
// Two modules live on the platform: Processminer (this app, in use today)
// and ArchitectMiner (architect workspace, coming next). The architect card
// is intentionally rendered but its primary action is disabled — the
// two-module story is the point even while we ship the first half.

type ProcessSummary = {
  slug: string;
  title: string;
  lastModified?: string;
  confirmed: number;
  total: number;
};

function summarise(doc: ProcessDoc): ProcessSummary {
  let confirmed = 0;
  for (const el of doc.elements) {
    if (el.status === "confirmed") confirmed++;
  }
  return {
    slug: doc.slug,
    title: doc.process.title || doc.slug,
    lastModified: doc.lastModified,
    confirmed,
    total: doc.elements.length,
  };
}

function statePill(s: ProcessSummary): { label: string; tone: "hi" | "mid" | "neu" } {
  if (s.total === 0) return { label: "Not started", tone: "neu" };
  if (s.confirmed === s.total) return { label: `Complete · ${s.total}/${s.total}`, tone: "hi" };
  if (s.confirmed === 0) return { label: `Draft · 0/${s.total}`, tone: "neu" };
  return { label: `${s.confirmed}/${s.total} confirmed`, tone: "mid" };
}

export default function SplashScreen({
  docs,
  user,
  onEnterProcessminer,
  onEnterArchitectminer,
  onSignOut,
}: {
  docs: ProcessDoc[];
  user: User;
  onEnterProcessminer: (slug?: string) => void;
  onEnterArchitectminer: () => void;
  onSignOut: () => void;
}) {
  const { processCount, inProgress, targetLocked, recent, architectReady } = useMemo(() => {
    const all = docs.map(summarise);
    const sorted = [...all].sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""));
    // Mirror HandoffInbox's "ready for architecture" rule — every element in
    // the Target Process area is confirmed.
    const TARGET = new Set([
      "to-be-design",
      "transformation-decisions",
      "requirements",
      "dependencies",
      "assumptions",
      "gap-resolution",
      "validation",
    ]);
    let ready = 0;
    for (const doc of docs) {
      let total = 0;
      let confirmed = 0;
      for (const el of doc.elements) {
        if (!TARGET.has(el.section)) continue;
        total++;
        if (el.status === "confirmed") confirmed++;
      }
      if (total > 0 && confirmed === total) ready++;
    }
    return {
      processCount: all.length,
      inProgress: all.filter((s) => s.total > 0 && s.confirmed > 0 && s.confirmed < s.total).length,
      targetLocked: all.filter((s) => s.total > 0 && s.confirmed === s.total).length,
      recent: sorted.slice(0, 3),
      architectReady: ready,
    };
  }, [docs]);

  const initials = user.name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="splash">
      <div className="topbar splash-topbar">
        <span className="splash-wordmark">PROCESSMINER</span>
        <span className="splash-platform-sub">· workspace platform</span>
        <span style={{ flex: 1 }} />
        <span className="splash-ws-info">
          <b>{user.name}</b> · {user.role}
        </span>
        <button
          type="button"
          className="splash-signout"
          onClick={onSignOut}
          title="Sign out"
        >
          Sign out
        </button>
        <div className="splash-avatar" aria-hidden>
          {initials || "·"}
        </div>
      </div>

      <div className="splash-body">
        <header className="splash-hero">
          <p className="splash-eyebrow">Welcome back, {user.name.split(" ")[0]}</p>
          <h1>Choose your workspace</h1>
          <p className="splash-lede">
            Two modules, one source of truth. Process knowledge flows left to
            right — once a Target Process is approved in Processminer, it
            lands in the ArchitectMiner inbox with every transformation
            decision, gap and control already linked.
          </p>
        </header>

        <div className="splash-modules">
          {/* Processminer — live module */}
          <article
            className="splash-card"
            tabIndex={0}
            onClick={() => onEnterProcessminer()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEnterProcessminer();
              }
            }}
          >
            <header className="splash-card-head">
              <div className="splash-mod-icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path d="M3 12h4l3-7 4 14 3-7h4" />
                </svg>
              </div>
              <div>
                <h2>Processminer</h2>
                <p className="splash-mod-aud">SMEs · Process analysts · Transformation team</p>
              </div>
              <span className="splash-pill splash-pill-acc">
                <span className="splash-dot" />
                In use
              </span>
            </header>

            <p className="splash-blurb">
              Elicit, document and develop the target state of a banking
              process. Six perspectives — As-Is, Risk &amp; Compliance, Client
              Experience, Innovation, Target Process, IT Architecture — each
              element provenance-tracked, schema-validated and approval-gated.
            </p>

            <dl className="splash-stats">
              <div>
                <dt>{processCount}</dt>
                <dd>processes</dd>
              </div>
              <div>
                <dt>{inProgress}</dt>
                <dd>in progress</dd>
              </div>
              <div>
                <dt>{targetLocked}</dt>
                <dd>fully confirmed</dd>
              </div>
            </dl>

            {recent.length > 0 && (
              <>
                <h3 className="splash-subh">Continue where you left off</h3>
                <ul className="splash-continue">
                  {recent.map((r) => {
                    const pill = statePill(r);
                    return (
                      <li
                        key={r.slug}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnterProcessminer(r.slug);
                        }}
                      >
                        <span className="splash-p-name">{r.title}</span>
                        {r.lastModified && (
                          <RelativeTime ts={r.lastModified} className="splash-p-time" />
                        )}
                        <span className="splash-p-state">
                          <span className={`splash-pill splash-pill-${pill.tone}`}>
                            <span className="splash-dot" />
                            {pill.label}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <footer className="splash-card-foot">
              <button
                type="button"
                className="splash-btn splash-btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnterProcessminer();
                }}
              >
                Open Processminer →
              </button>
            </footer>
          </article>

          {/* Handoff visual */}
          <div className="splash-handoff" aria-hidden>
            <div className="splash-handoff-line" />
            <div className="splash-handoff-bubble">
              <span className="splash-handoff-title">Handoff</span>
              <span className="splash-handoff-detail">Target Process approved</span>
              <span className="splash-handoff-arrow">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </span>
            </div>
            <div className="splash-handoff-line" />
          </div>

          {/* ArchitectMiner — handoff inbox live, deeper module coming next */}
          <article
            className="splash-card"
            tabIndex={0}
            onClick={() => onEnterArchitectminer()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEnterArchitectminer();
              }
            }}
          >
            <header className="splash-card-head">
              <div className="splash-mod-icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <path d="M10 6.5h4M10 17.5h4M6.5 10v4M17.5 10v4" />
                </svg>
              </div>
              <div>
                <h2>ArchitectMiner</h2>
                <p className="splash-mod-aud">Domain architects · Solution architects</p>
              </div>
              <span
                className={`splash-pill ${architectReady > 0 ? "splash-pill-hi" : "splash-pill-neu"}`}
              >
                <span className="splash-dot" />
                {architectReady > 0 ? `${architectReady} ready` : "Inbox open"}
              </span>
            </header>

            <p className="splash-blurb">
              Pick up an approved Target Process. Develop capabilities, target
              applications, ADRs, integrations, NFRs and a migration plan —
              with traceability back to every transformation decision, gap,
              control and regulation in the upstream wiki.
            </p>

            <dl className="splash-stats">
              <div>
                <dt>{processCount}</dt>
                <dd>in pipeline</dd>
              </div>
              <div>
                <dt>{architectReady}</dt>
                <dd>ready</dd>
              </div>
              <div>
                <dt>{processCount - architectReady}</dt>
                <dd>upstream</dd>
              </div>
            </dl>

            <h3 className="splash-subh">What lands here</h3>
            <ul className="splash-feature-list">
              <li>
                <b>Handoff inbox</b> — Target Processes ready for architecture
              </li>
              <li>Capabilities, Target Applications, ADRs (coming next)</li>
              <li>Solution diagrams + NFR &amp; migration tracking</li>
              <li>Traceability back to Processminer artifacts</li>
            </ul>

            <footer className="splash-card-foot">
              <button
                type="button"
                className="splash-btn splash-btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnterArchitectminer();
                }}
              >
                Open ArchitectMiner →
              </button>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}

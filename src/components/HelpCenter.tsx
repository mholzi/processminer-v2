"use client";

import { useEffect, useMemo, useState } from "react";
import type { Schema } from "@/lib/wiki";

// Help center — a What's New + Roadmap feed opened from the top-bar "?"
// button. One chronological list: shipped → in-flight → planned. No tabs,
// no glossary, no concept explainers — for those the SME asks the assistant.
// Edit ENTRIES below to update the feed.

type EntryTag = "shipped" | "in-flight" | "planned";
type Entry = {
  id: string;
  title: string;
  tag: EntryTag;
  when: string;
  bucket: string;
  summary: string;
  bullets?: string[];
  votes?: number;
};

const ENTRIES: Entry[] = [
  {
    id: "palette",
    title: "Command palette for processes & sources",
    tag: "shipped",
    when: "21 May",
    bucket: "Today",
    summary:
      "⌘K opens a search-first picker for every documented process — with attention chips, last-activity, pin / recent groups. The Source Documents widget got the same treatment.",
  },
  {
    id: "uploader-pdf",
    title: "Uploader tracking + inline PDF viewer",
    tag: "shipped",
    when: "21 May",
    bucket: "Today",
    summary:
      "Every upload now records who uploaded and when. PDFs render straight in the canvas — no more raw bytes.",
  },
  {
    id: "triage-receipt",
    title: "Triage receipt + worklist",
    tag: "shipped",
    when: "19 May",
    bucket: "This week",
    summary:
      "The after-import screen reads like a banking statement: ingest record on the left, work-to-do grouped on the right.",
  },
  {
    id: "nav-spine",
    title: "Numbered area spine",
    tag: "shipped",
    when: "17 May",
    bucket: "This week",
    summary:
      "The six areas (As-Is, Risk, CX, Innovation, Target, Systems) are always visible on the left rail. Click a number to jump.",
  },
  {
    id: "area-phase-owner",
    title: "Per-process area, phase & owner",
    tag: "in-flight",
    when: "~Jun",
    bucket: "Soon",
    summary:
      "Each process will carry a banking-domain area (Corporate / Retail / Payments / Compliance / KYC), a refinement phase, and a process owner — so the picker can filter and group by them.",
    votes: 12,
  },
  {
    id: "portfolio",
    title: "Process portfolio dashboard",
    tag: "planned",
    when: "~Q3",
    bucket: "Next",
    summary:
      "An all-processes overview with progress per perspective, attention chips, last activity — strategic lens beside the working canvas.",
    votes: 7,
  },
  {
    id: "sortable-picker",
    title: "Sortable picker columns",
    tag: "planned",
    when: "~Q3",
    bucket: "Next",
    summary:
      "Click a column header in the process or source picker to sort. Pin your preferred sort.",
    votes: 4,
  },
  {
    id: "multi-sme",
    title: "Multi-SME concurrency",
    tag: "planned",
    when: "~2027",
    bucket: "Horizon",
    summary:
      "Two SMEs in the same process at once, with safe write merges and per-element locks.",
    votes: 3,
  },
  {
    id: "auto-diagrams",
    title: "Auto-rendered process diagrams",
    tag: "planned",
    when: "~2027",
    bucket: "Horizon",
    summary:
      "Render the As-Is process as a live flowchart from the documented steps and roles.",
    votes: 2,
  },
];

type FilterKind = "all" | EntryTag;

const TAG_LABEL: Record<EntryTag, string> = {
  shipped: "Shipped",
  "in-flight": "In flight",
  planned: "Planned",
};

const VOTE_KEY = "pm.help.votes";

function readVotes(): Record<string, true> {
  try {
    const raw = localStorage.getItem(VOTE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, true>) : {};
  } catch {
    return {};
  }
}

function writeVotes(v: Record<string, true>) {
  try {
    localStorage.setItem(VOTE_KEY, JSON.stringify(v));
  } catch {
    // localStorage may be unavailable; votes silently become session-only.
  }
}

export default function HelpCenter({
  open,
  onClose,
  onReplayTour,
  onOpenFeedback,
}: {
  open: boolean;
  onClose: () => void;
  // The schema prop is kept on the signature for callers; the feed doesn't
  // read it but removing it would force a churn-y call-site edit.
  schema: Schema;
  onReplayTour: () => void;
  onOpenFeedback: () => void;
}) {
  const [filter, setFilter] = useState<FilterKind>("all");
  const [votes, setVotes] = useState<Record<string, true>>({});

  useEffect(() => {
    if (!open) return;
    setVotes(readVotes());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Buckets, preserving the order entries appear in (Today → … → Horizon).
  const buckets = useMemo(() => {
    const visible = ENTRIES.filter(
      (e) => filter === "all" || e.tag === filter,
    );
    const order: string[] = [];
    const byBucket = new Map<string, Entry[]>();
    for (const e of visible) {
      if (!byBucket.has(e.bucket)) {
        byBucket.set(e.bucket, []);
        order.push(e.bucket);
      }
      byBucket.get(e.bucket)!.push(e);
    }
    return order.map((b) => ({ name: b, items: byBucket.get(b)! }));
  }, [filter]);

  const counts = useMemo(() => {
    const c: Record<FilterKind, number> = {
      all: ENTRIES.length,
      shipped: 0,
      "in-flight": 0,
      planned: 0,
    };
    for (const e of ENTRIES) c[e.tag]++;
    return c;
  }, []);

  const toggleVote = (id: string) => {
    setVotes((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      writeVotes(next);
      return next;
    });
  };

  if (!open) return null;

  return (
    <div className="help-overlay" onClick={onClose}>
      <div
        className="help-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="What's new in ProcessMiner"
      >
        <div className="help-head">
          <span className="help-title">What&rsquo;s new in ProcessMiner</span>
          <div className="help-filter" role="tablist" aria-label="Filter">
            {(["all", "shipped", "in-flight", "planned"] as const).map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`help-filter-btn${filter === f ? " on" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : TAG_LABEL[f]}
                <span className="help-filter-num">{counts[f]}</span>
              </button>
            ))}
          </div>
          <button className="help-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="help-feed">
          {buckets.length === 0 ? (
            <div className="help-feed-empty">
              Nothing in that bucket yet.
            </div>
          ) : (
            buckets.map((b) => (
              <section key={b.name} className="help-feed-bucket">
                <div className="help-feed-bucket-h">{b.name}</div>
                {b.items.map((e) => {
                  const voted = !!votes[e.id];
                  const liveVotes = (e.votes ?? 0) + (voted ? 1 : 0);
                  return (
                    <article key={e.id} className="help-entry">
                      <div className="help-entry-when">{e.when}</div>
                      <div className="help-entry-body">
                        <header className="help-entry-h">
                          <h3>{e.title}</h3>
                          <span className={`help-entry-tag tag-${e.tag}`}>
                            {TAG_LABEL[e.tag]}
                          </span>
                        </header>
                        <p className="help-entry-summary">{e.summary}</p>
                        {e.bullets ? (
                          <ul className="help-entry-bullets">
                            {e.bullets.map((bx, i) => (
                              <li key={i}>{bx}</li>
                            ))}
                          </ul>
                        ) : null}
                        {e.tag !== "shipped" && (
                          <div className="help-entry-actions">
                            <button
                              className={`help-vote${voted ? " on" : ""}`}
                              onClick={() => toggleVote(e.id)}
                              aria-pressed={voted}
                            >
                              <span className="arrow">▲</span>
                              {liveVotes}
                              <span className="help-vote-label">
                                {voted ? " you voted" : " vote"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>
            ))
          )}
        </div>

        <div className="help-foot">
          <button className="help-foot-link" onClick={onReplayTour}>
            ✦ Replay guided tour
          </button>
          <span className="help-foot-sep">·</span>
          <span className="help-foot-shortcuts">
            <span className="help-kbd">⌘K</span> search
            <span className="help-foot-sep">·</span>
            <span className="help-kbd">esc</span> close
            <span className="help-foot-sep">·</span>
            <span className="help-kbd">↵</span> send
          </span>
          <span className="help-foot-grow" />
          <button
            className="help-foot-link"
            onClick={() => {
              onClose();
              onOpenFeedback();
            }}
          >
            Suggest a feature →
          </button>
        </div>
      </div>
    </div>
  );
}

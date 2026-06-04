"use client";

import { useMemo, useState } from "react";
import type { Note, SourceFile, WikiPage } from "@/lib/wiki";

// R5 — Contributors & activity. A read-only roll-up of who did what on this
// process, derived from the already-loaded document: element approvals + edits,
// note comments + resolutions, and source uploads. Author handles are already
// resolved to display names by getProcess.

type Kind = "approved" | "rejected" | "reopened" | "edited" | "commented" | "resolved" | "uploaded";

interface Activity {
  who: string;
  kind: Kind;
  targetId?: string; // an element id → clickable
  targetLabel: string;
  when: string; // YYYY-MM-DD
}

const KIND_VERB: Record<Kind, string> = {
  approved: "approved",
  rejected: "rejected",
  reopened: "re-opened",
  edited: "edited",
  commented: "commented on",
  resolved: "resolved a comment on",
  uploaded: "uploaded",
};

const day = (s: string | undefined): string => (s ? String(s).slice(0, 10) : "");

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

const PAGE = 25;

export default function ContributorsView({
  elements,
  notes,
  sources,
  onGoToElement,
}: {
  elements: WikiPage[];
  notes?: Record<string, Note[]>;
  sources: SourceFile[];
  onGoToElement: (id: string) => void;
}) {
  const activity = useMemo<Activity[]>(() => {
    const out: Activity[] = [];
    for (const e of elements) {
      const m = e.meta;
      const by = (k: string) => (typeof m[k] === "string" ? (m[k] as string) : "");
      const approvalBy = by("approvalBy");
      if (approvalBy && by("approvalDate")) {
        // The kind reflects the *current* approval state: a finding/edit can
        // have re-opened a once-approved element (approval back to in-progress).
        const kind: Kind =
          m.approval === "approved"
            ? "approved"
            : m.approval === "rejected"
              ? "rejected"
              : "reopened";
        out.push({
          who: approvalBy,
          kind,
          targetId: e.id,
          targetLabel: e.title || e.id,
          when: day(by("approvalDate")),
        });
      }
      const updatedBy = by("updatedBy");
      if (updatedBy && by("updatedAt")) {
        out.push({
          who: updatedBy,
          kind: "edited",
          targetId: e.id,
          targetLabel: e.title || e.id,
          when: day(by("updatedAt")),
        });
      }
    }
    for (const [elId, arr] of Object.entries(notes ?? {})) {
      for (const n of arr) {
        if (n.author)
          out.push({ who: n.author, kind: "commented", targetId: elId, targetLabel: elId, when: day(n.ts) });
        if (n.resolved && n.resolvedBy)
          out.push({ who: n.resolvedBy, kind: "resolved", targetId: elId, targetLabel: elId, when: day(n.resolvedAt) });
      }
    }
    for (const s of sources) {
      if (s.uploadedBy)
        out.push({ who: s.uploadedBy, kind: "uploaded", targetLabel: s.name, when: day(s.uploadedAt) });
    }
    return out.sort((a, b) => b.when.localeCompare(a.when));
  }, [elements, notes, sources]);

  const roster = useMemo(() => {
    const map = new Map<string, { name: string; total: number; lastActive: string }>();
    for (const a of activity) {
      const r = map.get(a.who) ?? { name: a.who, total: 0, lastActive: "" };
      r.total += 1;
      if (a.when > r.lastActive) r.lastActive = a.when;
      map.set(a.who, r);
    }
    return [...map.values()].sort((a, b) => b.lastActive.localeCompare(a.lastActive) || b.total - a.total);
  }, [activity]);

  const [selected, setSelected] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const filtered = selected ? activity.filter((a) => a.who === selected) : activity;
  const shown = filtered.slice(0, limit);

  return (
    <div className="contrib">
      <div className="canvas-head">
        <h1>Contributors</h1>
      </div>

      {roster.length === 0 ? (
        <p className="contrib-empty">No recorded activity on this process yet.</p>
      ) : (
        <>
          <div className="contrib-roster">
            {roster.map((r) => (
              <button
                type="button"
                key={r.name}
                className={`contrib-card${selected === r.name ? " is-active" : ""}`}
                onClick={() => {
                  setSelected((s) => (s === r.name ? null : r.name));
                  setLimit(PAGE);
                }}
              >
                <span className="contrib-avatar">{initials(r.name)}</span>
                <span className="contrib-meta">
                  <span className="contrib-name">{r.name}</span>
                  <span className="contrib-sub">
                    {r.total} action{r.total === 1 ? "" : "s"} · last {r.lastActive || "—"}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="contrib-feed-head">
            <h2 className="type-group-head">
              Activity{selected ? ` · ${selected}` : ""}
            </h2>
            {selected && (
              <button type="button" className="contrib-clear" onClick={() => setSelected(null)}>
                Clear filter
              </button>
            )}
          </div>

          <ul className="contrib-feed">
            {shown.map((a, i) => (
              <li key={i} className="contrib-event">
                <span className="contrib-who">{a.who}</span>{" "}
                <span className="contrib-verb">{KIND_VERB[a.kind]}</span>{" "}
                {a.targetId ? (
                  <button
                    type="button"
                    className="contrib-target link-chip-nav"
                    onClick={() => onGoToElement(a.targetId!)}
                  >
                    {a.targetLabel}
                  </button>
                ) : (
                  <span className="contrib-target-plain">{a.targetLabel}</span>
                )}
                <span className="contrib-when">{a.when}</span>
              </li>
            ))}
          </ul>
          {filtered.length > limit && (
            <button type="button" className="contrib-more" onClick={() => setLimit((l) => l + PAGE)}>
              Show {Math.min(PAGE, filtered.length - limit)} more
            </button>
          )}
        </>
      )}
    </div>
  );
}

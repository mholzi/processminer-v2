"use client";

import { useState } from "react";

// Topbar process picker — switch between documented processes, or kick off
// the new-process chat skill. Each process carries an attention count
// (unreviewed elements, ingest conflicts, lint findings); the switcher shows
// a single dot when any process needs the SME, with the breakdown per row.

interface ProcStatus {
  review: number;
  conflicts: number;
  lint: number;
}

const needsAttention = (s: ProcStatus) =>
  s.review + s.conflicts + s.lint > 0;

function statusLine(s: ProcStatus): string {
  const parts: string[] = [];
  if (s.review) parts.push(`${s.review} to review`);
  if (s.conflicts)
    parts.push(`${s.conflicts} conflict${s.conflicts === 1 ? "" : "s"}`);
  if (s.lint)
    parts.push(`${s.lint} lint finding${s.lint === 1 ? "" : "s"}`);
  return parts.length ? parts.join(" · ") : "all reviewed";
}

export default function ProcessSwitcher({
  processes,
  currentSlug,
  onSelect,
  onCreate,
}: {
  processes: { slug: string; id: string; title: string; status: ProcStatus }[];
  currentSlug: string;
  onSelect: (slug: string) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const current = processes.find((p) => p.slug === currentSlug);
  const anyAttention = processes.some((p) => needsAttention(p.status));

  return (
    <div className="procsw">
      <button
        className="procsw-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="crumb">PROCESSES ▸</span>
        <span className="pname">
          {current ? `${current.id} · ${current.title}` : "—"}
        </span>
        <span className="procsw-caret">▾</span>
        {anyAttention && (
          <span
            className="procsw-attn"
            title="A process needs your attention"
          />
        )}
      </button>

      {open && (
        <>
          <div className="procsw-scrim" onClick={() => setOpen(false)} />
          <div className="procsw-menu" role="menu">
            {processes.map((p) => (
              <button
                key={p.slug}
                className={`procsw-item${p.slug === currentSlug ? " active" : ""}`}
                onClick={() => {
                  onSelect(p.slug);
                  setOpen(false);
                }}
              >
                <span
                  className={`procsw-dot ${
                    needsAttention(p.status) ? "warn" : "clear"
                  }`}
                />
                <span className="procsw-item-body">
                  <span className="procsw-item-top">
                    <span className="procsw-item-id">{p.id}</span>
                    <span className="procsw-item-title">{p.title}</span>
                  </span>
                  <span className="procsw-item-sub">
                    {statusLine(p.status)}
                  </span>
                </span>
              </button>
            ))}
            <button
              className="procsw-new"
              onClick={() => {
                onCreate();
                setOpen(false);
              }}
            >
              + New process
            </button>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

// Topbar process picker — switch between documented processes, or kick off
// the (stubbed) new-process chat skill.
export default function ProcessSwitcher({
  processes,
  currentSlug,
  onSelect,
  onCreate,
}: {
  processes: { slug: string; id: string; title: string }[];
  currentSlug: string;
  onSelect: (slug: string) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const current = processes.find((p) => p.slug === currentSlug);

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
                <span className="procsw-item-id">{p.id}</span>
                <span className="procsw-item-title">{p.title}</span>
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

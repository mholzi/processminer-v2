"use client";

import { useState } from "react";
import type { SourceFile, IngestReport } from "@/lib/wiki";

// The Source Documents widget — pinned to the bottom of the left rail. Lists
// the imported documents under raw-sources/<slug>/; clicking one opens it in
// the canvas. Uploads still go through the top-bar Upload button.

// A fixed, locale-independent date — server and client must render the same
// string, so toLocaleDateString (which follows the runtime locale) is out.
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function shortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

const DocIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export default function SourcesPanel({
  sources,
  ingest,
  activeFile,
  onOpen,
  onUpload,
}: {
  sources: SourceFile[];
  ingest?: IngestReport;
  activeFile: string | null;
  onOpen: (file: string) => void;
  onUpload: () => void;
}) {
  // Collapsed on load — the SME opens it when they want the document list.
  const [open, setOpen] = useState(false);

  return (
    <div className="sources">
      <button
        className="src-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="src-ico">
          <DocIcon size={14} />
        </span>
        <span className="src-title">Source Documents</span>
        <span className="src-count">{sources.length}</span>
        <span className={`src-chevron${open ? "" : " collapsed"}`}>▾</span>
      </button>

      {open && (
        <div className="src-list">
          {sources.length === 0 ? (
            <button className="src-empty" onClick={onUpload}>
              No documents yet — upload a source
            </button>
          ) : (
            <>
              {sources.map((s) => {
                // The last ingest names exactly one file; mark it ingested
                // and surface how many elements it produced.
                const ingested = ingest?.file === s.name;
                return (
                  <button
                    key={s.name}
                    className={`src-item${
                      activeFile === s.name ? " active" : ""
                    }`}
                    onClick={() => onOpen(s.name)}
                    title={`Open ${s.name}`}
                  >
                    <span className="src-item-ico">
                      <DocIcon size={20} />
                    </span>
                    <span className="src-item-text">
                      <span className="src-name">{s.name}</span>
                      <span className="src-sub">
                        {shortDate(s.uploadedAt)}
                        {ingested
                          ? ` · ${ingest!.created.length} elements`
                          : ""}
                      </span>
                      <span
                        className={`src-badge${ingested ? " ok" : " pending"}`}
                      >
                        {ingested ? "Imported" : "Not imported"}
                      </span>
                    </span>
                  </button>
                );
              })}
              <button className="src-add" onClick={onUpload}>
                + Upload another source
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

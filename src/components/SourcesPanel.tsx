"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SourceFile, IngestReport } from "@/lib/wiki";
import { useFocusTrap } from "./useFocusTrap";

// The Source Documents picker — a Cmd-K-style palette. The trigger lives at
// the bottom of the left rail (a compact button showing the doc count);
// clicking it opens a centered modal palette that mirrors the process
// switcher's IA: search, status filter chips, dense rows, footer upload.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// A fixed, locale-independent date — server and client must render the same
// string, so toLocaleDateString (which follows the runtime locale) is out.
function shortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

function fileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "imported" | "pending">("all");
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  // Trap Tab focus inside the open palette and close on Esc (a11y — the dialog
  // had role="dialog" but Tab could escape to the page behind it).
  useFocusTrap(paletteRef, () => setOpen(false), open);

  // A document is "imported" when the most recent ingest names its filename.
  // (The ingest report only records the last run; older imports lose this
  // mark, which is good enough for the badge.)
  const isImported = useCallback(
    (name: string) => ingest?.file === name,
    [ingest],
  );

  // Focus the search box when the palette opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setFocusIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Esc is handled by useFocusTrap (above), which also restores focus to the
  // trigger on close.

  const submit = useCallback(
    (name: string) => {
      onOpen(name);
      setOpen(false);
    },
    [onOpen],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (filter === "imported" && !isImported(s.name)) return false;
      if (filter === "pending" && isImported(s.name)) return false;
      return true;
    });
  }, [sources, query, filter, isImported]);

  useEffect(() => {
    if (focusIdx >= visible.length) {
      setFocusIdx(Math.max(0, visible.length - 1));
    }
  }, [visible.length, focusIdx]);

  // Keyboard nav — window-level so it works regardless of focus target.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(visible.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusIdx(Math.max(0, visible.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = visible[focusIdx];
        if (row) submit(row.name);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, visible, focusIdx, submit]);

  const importedCount = sources.filter((s) => isImported(s.name)).length;
  const pendingCount = sources.length - importedCount;

  return (
    <div className="sources">
      <button
        className="src-head"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Open source documents"
      >
        <span className="src-ico">
          <DocIcon size={14} />
        </span>
        <span className="src-title">Source Documents</span>
        <span className="src-count">{sources.length}</span>
        <span className="src-chevron">›</span>
      </button>

      {open && (
        <>
          <div
            className="procsw-scrim cmd-pal-scrim"
            onClick={() => setOpen(false)}
          />
          <div
            ref={paletteRef}
            className="cmd-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Open source document"
          >
            <div className="pal-search">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <circle cx="7" cy="7" r="5" />
                <path d="M14 14l-3-3" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setFocusIdx(0);
                }}
                placeholder="Search source documents…"
                aria-label="Search source documents"
              />
              <span className="procsw-kbd">esc</span>
            </div>

            <div className="pal-chips">
              <button
                type="button"
                className={`pal-chip${filter === "imported" ? " on" : ""}`}
                onClick={() =>
                  setFilter(filter === "imported" ? "all" : "imported")
                }
              >
                Imported <span className="num">{importedCount}</span>
              </button>
              <button
                type="button"
                className={`pal-chip${filter === "pending" ? " on" : ""}`}
                onClick={() =>
                  setFilter(filter === "pending" ? "all" : "pending")
                }
              >
                Not imported <span className="num">{pendingCount}</span>
              </button>
            </div>

            <div className="pal-col-h src-col-h">
              <span>Document</span>
              <span>Status</span>
              <span style={{ textAlign: "right" }}>Elements</span>
              <span style={{ textAlign: "right" }}>Size</span>
              <span>Uploaded by</span>
              <span style={{ textAlign: "right" }}>Uploaded</span>
            </div>

            <div className="pal-list">
              {visible.length === 0 ? (
                <div className="pal-empty">
                  {sources.length === 0
                    ? "No documents yet — upload the first source."
                    : query
                      ? <>No documents match <code>{query}</code>.</>
                      : "No documents match this filter."}
                </div>
              ) : (
                visible.map((s, i) => {
                  const imported = isImported(s.name);
                  const elements = imported && ingest ? ingest.created.length : 0;
                  return (
                    <div
                      key={s.name}
                      role="option"
                      aria-selected={i === focusIdx}
                      tabIndex={-1}
                      data-flat-idx={i}
                      className={`pal-row src-row${
                        i === focusIdx ? " focus" : ""
                      }${activeFile === s.name ? " current" : ""}`}
                      onMouseEnter={() => setFocusIdx(i)}
                      onClick={() => submit(s.name)}
                    >
                      <span className="src-row-doc">
                        <span className="src-row-doc-ico">
                          <DocIcon size={14} />
                        </span>
                        <span className="src-row-name" title={s.name}>
                          {s.name}
                          {activeFile === s.name ? (
                            <span className="pal-row-tag"> · open</span>
                          ) : null}
                        </span>
                      </span>
                      <span
                        className={`src-row-badge${
                          imported ? " ok" : " pending"
                        }`}
                      >
                        {imported ? "Imported" : "Not imported"}
                      </span>
                      <span className="src-row-num">
                        {imported ? elements : "—"}
                      </span>
                      <span className="src-row-num">{fileSize(s.size)}</span>
                      <span
                        className="src-row-actor"
                        title={s.uploadedBy ?? "unknown"}
                      >
                        {s.uploadedBy ?? <span className="src-row-dim">—</span>}
                      </span>
                      <span className="src-row-num">
                        {shortDate(s.uploadedAt)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pal-foot">
              <span>
                <span className="procsw-kbd">↑↓</span> nav
              </span>
              <span>
                <span className="procsw-kbd">↵</span> open
              </span>
              <span className="pal-foot-right">
                <button
                  type="button"
                  className="pal-foot-btn"
                  onClick={() => {
                    setOpen(false);
                    onUpload();
                  }}
                >
                  + Upload another source
                </button>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

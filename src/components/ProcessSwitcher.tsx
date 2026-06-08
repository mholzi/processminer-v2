"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusTrap } from "./useFocusTrap";

// Topbar process picker — a Cmd-K command palette. Topbar shows a compact
// chip with the current process + attention dot + ⌘K hint. Click or ⌘K
// opens a modal palette with fuzzy search, filter chips, grouped rows
// (Pinned / Recent / All) and keyboard nav. Pin and recent state persist in
// localStorage so a returning SME lands on their daily-driver processes.

interface ProcStatus {
  review: number;
  conflicts: number;
  lint: number;
}

interface Proc {
  slug: string;
  id: string;
  title: string;
  lastModified?: string;
  progress: number[];
  status: ProcStatus;
}

const PIN_KEY = "pm.procsw.pinned";
const RECENT_KEY = "pm.procsw.recent";
const RECENT_MAX = 6;

const needsAttention = (s: ProcStatus) =>
  s.review + s.conflicts + s.lint > 0;

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "now";
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d`;
  const w = Math.round(d / 7);
  if (w < 8) return `${w}w`;
  const mo = Math.round(d / 30);
  return `${mo}mo`;
}

function progressTier(v: number): 0 | 1 | 2 | 3 | 4 {
  if (v <= 0) return 0;
  if (v < 0.25) return 1;
  if (v < 0.5) return 2;
  if (v < 0.85) return 3;
  return 4;
}

function readSet(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeSet(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable (private mode, quota); the palette
    // degrades gracefully — pins and recents become session-only.
  }
}

export default function ProcessSwitcher({
  processes,
  currentSlug,
  onSelect,
  onCreate,
  onOpenFeedback,
  draftingNewProcess,
}: {
  processes: Proc[];
  currentSlug: string;
  onSelect: (slug: string) => void;
  onCreate: () => void;
  onOpenFeedback: () => void;
  draftingNewProcess?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "attn" | "pinned" | "mine">("all");
  const [focusIdx, setFocusIdx] = useState(0);
  const [pinned, setPinned] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [confirmingNew, setConfirmingNew] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  // Trap focus + Esc in whichever dialog is topmost. Gating the palette on
  // !confirmingNew keeps the layered Esc (Esc closes the confirm modal first,
  // then a second Esc closes the palette) and avoids two active traps fighting.
  useFocusTrap(confirmRef, () => setConfirmingNew(false), confirmingNew);
  useFocusTrap(paletteRef, () => setOpen(false), open && !confirmingNew);

  const current = processes.find((p) => p.slug === currentSlug);
  const anyAttention = processes.some((p) => needsAttention(p.status));

  // Hydrate pin + recent from localStorage on mount.
  useEffect(() => {
    setPinned(readSet(PIN_KEY));
    setRecent(readSet(RECENT_KEY));
  }, []);

  // Record the current process in the recents list (most-recent first).
  useEffect(() => {
    if (!currentSlug) return;
    setRecent((prev) => {
      const next = [currentSlug, ...prev.filter((s) => s !== currentSlug)].slice(
        0,
        RECENT_MAX,
      );
      if (next.length === prev.length && next.every((s, i) => s === prev[i])) {
        return prev;
      }
      writeSet(RECENT_KEY, next);
      return next;
    });
  }, [currentSlug]);

  // Global ⌘K / Ctrl+K opens the palette from anywhere in the app. Esc is
  // handled by useFocusTrap on the open dialog (layered: confirm then palette).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus the primary action when the confirm modal opens, so Enter
  // immediately commits.
  useEffect(() => {
    if (confirmingNew) {
      requestAnimationFrame(() => confirmBtnRef.current?.focus());
    }
  }, [confirmingNew]);

  // Focus the search box when the palette opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setFocusIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const togglePin = useCallback((slug: string) => {
    setPinned((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      writeSet(PIN_KEY, next);
      return next;
    });
  }, []);

  // Filter + group. Order: matching pinned, recent, then the rest A→Z.
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (p: Proc) =>
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q);

    const pass = (p: Proc) => {
      if (!matches(p)) return false;
      if (filter === "attn") return needsAttention(p.status);
      if (filter === "pinned") return pinned.includes(p.slug);
      return true;
    };

    const visible = processes.filter(pass);
    const pinnedSlugs = new Set(pinned);
    const recentOrder = new Map(recent.map((s, i) => [s, i]));

    const pinnedRows = visible
      .filter((p) => pinnedSlugs.has(p.slug))
      .sort((a, b) => a.title.localeCompare(b.title));
    const recentRows = visible
      .filter(
        (p) => !pinnedSlugs.has(p.slug) && recentOrder.has(p.slug),
      )
      .sort(
        (a, b) =>
          (recentOrder.get(a.slug) ?? 99) - (recentOrder.get(b.slug) ?? 99),
      );
    const restRows = visible
      .filter(
        (p) => !pinnedSlugs.has(p.slug) && !recentOrder.has(p.slug),
      )
      .sort((a, b) => a.title.localeCompare(b.title));

    return [
      { label: "Pinned", rows: pinnedRows },
      { label: "Recent", rows: recentRows },
      { label: "All processes", rows: restRows },
    ].filter((g) => g.rows.length > 0);
  }, [processes, query, filter, pinned, recent]);

  // Flat list for keyboard nav (skips section labels).
  const flat = useMemo(() => sections.flatMap((s) => s.rows), [sections]);

  useEffect(() => {
    if (focusIdx >= flat.length) setFocusIdx(Math.max(0, flat.length - 1));
  }, [flat.length, focusIdx]);

  const submit = useCallback(
    (slug: string) => {
      onSelect(slug);
      setOpen(false);
    },
    [onSelect],
  );

  // Keyboard nav inside the palette — bound at window level so it works
  // regardless of which element holds focus (search input vs. row). The
  // closure captures the current `flat` and `focusIdx` via the dependency
  // array so each render re-binds with fresh state.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(flat.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusIdx(Math.max(0, flat.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = flat[focusIdx];
        if (row) submit(row.slug);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        const row = flat[focusIdx];
        if (row) togglePin(row.slug);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, focusIdx, submit, togglePin]);

  // Scroll the focused row into view as the user navigates.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-flat-idx="${focusIdx}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [focusIdx, open]);

  return (
    <div className="procsw">
      <button
        className="procsw-trigger procsw-chip"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Switch process (⌘K)"
      >
        {draftingNewProcess ? (
          <span className="pname">New Process</span>
        ) : current ? (
          <>
            <span className="procsw-chip-id">{current.id}</span>
            <span className="procsw-chip-name">{current.title}</span>
          </>
        ) : (
          <span className="pname">—</span>
        )}
        {anyAttention && (
          <span
            className="procsw-attn"
            title="A process needs your attention"
          />
        )}
        <span className="procsw-kbd">⌘K</span>
      </button>

      <button
        type="button"
        className="procsw-new-icon"
        onClick={() => setConfirmingNew(true)}
        aria-label="New process"
        title="New process"
      >
        +
      </button>

      {confirmingNew && (
        <>
          <div
            className="procsw-scrim cmd-pal-scrim"
            onClick={() => setConfirmingNew(false)}
          />
          <div
            ref={confirmRef}
            className="procsw-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="procsw-confirm-title"
          >
            <h3 id="procsw-confirm-title" className="procsw-confirm-title">
              Start a new process?
            </h3>
            <p className="procsw-confirm-body">
              We&rsquo;ll open the chat with the <code>/new-process</code> skill
              so you can name the process, set its ID, and start documenting it.
              Your current process stays where you left it.
            </p>
            <div className="procsw-confirm-actions">
              <button
                type="button"
                className="procsw-confirm-btn"
                onClick={() => setConfirmingNew(false)}
              >
                Cancel
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                className="procsw-confirm-btn primary"
                onClick={() => {
                  setConfirmingNew(false);
                  setOpen(false);
                  onCreate();
                }}
              >
                Start new process
              </button>
            </div>
          </div>
        </>
      )}

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
            aria-label="Switch process"
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
                placeholder="Search processes…"
                aria-label="Search processes"
              />
              <span className="procsw-kbd">esc</span>
            </div>

            <div className="pal-chips">
              <button
                type="button"
                className={`pal-chip${filter === "attn" ? " on" : ""}`}
                onClick={() => setFilter(filter === "attn" ? "all" : "attn")}
              >
                Attention{" "}
                <span className="num">
                  {processes.filter((p) => needsAttention(p.status)).length}
                </span>
              </button>
              <button
                type="button"
                className={`pal-chip${filter === "pinned" ? " on" : ""}`}
                onClick={() =>
                  setFilter(filter === "pinned" ? "all" : "pinned")
                }
              >
                Pinned <span className="num">{pinned.length}</span>
              </button>
            </div>

            <div className="pal-col-h">
              <span>ID</span>
              <span>Process</span>
              <span>Progress</span>
              <span style={{ textAlign: "right" }}>Attn</span>
              <span style={{ textAlign: "right" }}>Last</span>
            </div>

            <div className="pal-list" ref={listRef}>
              {flat.length === 0 ? (
                <div className="pal-empty">
                  No processes match <code>{query}</code>.
                </div>
              ) : (
                sections.map((g) => (
                  <div key={g.label}>
                    <div className="pal-group-h">{g.label}</div>
                    {g.rows.map((p) => {
                      const flatIdx = flat.indexOf(p);
                      const focused = flatIdx === focusIdx;
                      const isPinned = pinned.includes(p.slug);
                      const isCurrent = p.slug === currentSlug;
                      return (
                        <div
                          key={p.slug}
                          role="option"
                          aria-selected={focused}
                          tabIndex={-1}
                          data-flat-idx={flatIdx}
                          className={`pal-row${focused ? " focus" : ""}${
                            isCurrent ? " current" : ""
                          }`}
                          onMouseEnter={() => setFocusIdx(flatIdx)}
                          onClick={() => submit(p.slug)}
                        >
                          <span className="pal-row-id">{p.id}</span>
                          <span className="pal-row-name">
                            {p.title}
                            {isCurrent ? (
                              <span className="pal-row-tag"> · current</span>
                            ) : null}
                          </span>
                          <span
                            className="pal-dots6"
                            title="As-Is · Risk · CX · Innov · Target · Sys"
                          >
                            {p.progress.map((v, i) => (
                              <span
                                key={i}
                                className={`pal-dot q${progressTier(v)}`}
                              />
                            ))}
                          </span>
                          <span className="pal-row-attn">
                            {p.status.review ? (
                              <span className="pal-attn-w">{p.status.review}</span>
                            ) : null}
                            {p.status.lint ? (
                              <span className="pal-attn-e">
                                {p.status.review ? "·" : ""}
                                {p.status.lint}
                              </span>
                            ) : null}
                            {!p.status.review &&
                            !p.status.lint &&
                            !p.status.conflicts ? (
                              <span className="pal-attn-ok">0</span>
                            ) : null}
                          </span>
                          <span className="pal-row-when">
                            {relativeTime(p.lastModified)}
                          </span>
                          <button
                            type="button"
                            className={`pal-pin${isPinned ? " on" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(p.slug);
                            }}
                            aria-label={isPinned ? "Unpin" : "Pin"}
                            title={isPinned ? "Unpin (⌘P)" : "Pin (⌘P)"}
                          >
                            ★
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="pal-foot">
              <span>
                <span className="procsw-kbd">↑↓</span> nav
              </span>
              <span>
                <span className="procsw-kbd">↵</span> open
              </span>
              <span>
                <span className="procsw-kbd">⌘P</span> pin
              </span>
              <span className="pal-foot-right">
                <button
                  type="button"
                  className="pal-foot-btn"
                  onClick={() => setConfirmingNew(true)}
                >
                  + New process
                </button>
                <button
                  type="button"
                  className="pal-foot-btn"
                  onClick={() => {
                    onOpenFeedback();
                    setOpen(false);
                  }}
                >
                  ★ Feedback
                </button>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

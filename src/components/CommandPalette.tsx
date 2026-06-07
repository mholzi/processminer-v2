"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WikiPage } from "@/lib/wiki";
import { useFocusTrap } from "./useFocusTrap";

type Result =
  | { kind: "section"; id: string; label: string }
  | { kind: "element"; id: string; label: string; sub: string };

// ⌘K search — jump to any element (by id or title) or section.
export default function CommandPalette({
  open,
  onClose,
  elements,
  sections,
  onPickElement,
  onPickSection,
}: {
  open: boolean;
  onClose: () => void;
  elements: WikiPage[];
  sections: { id: string; label: string }[];
  onPickElement: (id: string) => void;
  onPickSection: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, onClose, open); // Esc + focus trap + restore

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      inputRef.current?.focus();
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const sec: Result[] = sections
      .filter((s) => s.label.toLowerCase().includes(query))
      .map((s) => ({ kind: "section", id: s.id, label: s.label }));
    const els: Result[] = elements
      .filter(
        (e) =>
          e.id.toLowerCase().includes(query) ||
          e.title.toLowerCase().includes(query),
      )
      .slice(0, 40)
      .map((e) => ({ kind: "element", id: e.id, label: e.title, sub: e.id }));
    return [...sec, ...els];
  }, [q, elements, sections]);

  if (!open) return null;

  function choose(i: number) {
    const r = results[i];
    if (!r) return;
    if (r.kind === "section") onPickSection(r.id);
    else onPickElement(r.id);
    onClose();
  }

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="cmdk"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <input
          ref={inputRef}
          className="cmdk-input"
          placeholder={`Search ${elements.length} elements and every section…`}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(active);
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
        />
        <div className="cmdk-list">
          {!q.trim() && (
            <div className="cmdk-hint">
              Type an element ID, a title or a section name. ↑↓ to move, ↵ to
              open, Esc to close.
            </div>
          )}
          {q.trim() && results.length === 0 && (
            <div className="cmdk-hint">No matches.</div>
          )}
          {results.map((r, i) => (
            <button
              key={r.kind + r.id}
              className={`cmdk-row${i === active ? " active" : ""}`}
              onMouseMove={() => setActive(i)}
              onClick={() => choose(i)}
            >
              <span className="cmdk-row-label">{r.label}</span>
              <span className="cmdk-row-meta">
                {r.kind === "section" ? "Section" : r.sub}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

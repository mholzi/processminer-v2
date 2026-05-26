"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { WikiPage } from "@/lib/wiki";

// A hovercard preview for an element reference. Wrap any trigger — an ID chip
// or a title — and hovering pops a compact card (id, type, title, status,
// confidence, first line of prose). Wayfinding in a dense wiki: you read the
// reference without leaving the page. Unresolved references render plain.

function previewText(page: WikiPage): string {
  const raw = page.blocks[0]?.text ?? page.body ?? "";
  const flat = raw.replace(/[#*_>`-]/g, "").replace(/\s+/g, " ").trim();
  return flat.length > 150 ? `${flat.slice(0, 150)}…` : flat;
}

export default function ElementHovercard({
  element,
  typeLabel,
  children,
  onSelect,
}: {
  element?: WikiPage;
  typeLabel?: string;
  children: ReactNode;
  /** When set, the trigger becomes clickable — invoked with the element id. */
  onSelect?: (id: string) => void;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  // No data for this reference — render the trigger untouched.
  if (!element) return <>{children}</>;

  function show() {
    timer.current = setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) setPos({ x: r.left + r.width / 2, y: r.top - 8 });
    }, 160);
  }
  function hide() {
    if (timer.current) clearTimeout(timer.current);
    setPos(null);
  }

  const draft = element.status === "draft";
  const review = String(element.meta.approval ?? element.meta.relevance ?? "");
  const clickable = typeof onSelect === "function";
  const activate = () => {
    if (!onSelect) return;
    hide();
    onSelect(element.id);
  };

  return (
    <span
      ref={ref}
      className={`hcard-wrap${clickable ? " hcard-wrap-clickable" : ""}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      {...(clickable && {
        role: "button",
        tabIndex: 0,
        onClick: activate,
        onKeyDown: (e: KeyboardEvent<HTMLSpanElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        },
      })}
    >
      {children}
      {pos && (
        <span
          role="tooltip"
          className="hcard"
          style={{ left: pos.x, top: pos.y }}
        >
          <span className="hcard-head">
            <span className="hcard-id">{element.id}</span>
            {typeLabel && <span className="hcard-type">{typeLabel}</span>}
          </span>
          <span className="hcard-title">{element.title}</span>
          <span className="hcard-tags">
            {draft ? (
              <span className="hcard-tag draft">AI draft</span>
            ) : (
              <span className="hcard-tag">Confirmed</span>
            )}
            {review === "approved" && (
              <span className="hcard-tag ok">Approved</span>
            )}
            {review === "relevant" && (
              <span className="hcard-tag ok">Relevant</span>
            )}
            {element.confidence && (
              <span className={`hcard-tag conf-${element.confidence}`}>
                {element.confidence} confidence
              </span>
            )}
          </span>
          {previewText(element) && (
            <span className="hcard-preview">{previewText(element)}</span>
          )}
        </span>
      )}
    </span>
  );
}

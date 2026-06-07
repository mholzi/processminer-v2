"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export interface TourStep {
  /** CSS selector for the element to spotlight. */
  target: string;
  title: string;
  body: string;
  /** Tooltip placement relative to the target. */
  placement: "bottom" | "top" | "left" | "right";
}

// The first-run tour. Each target is a stable class on the app shell; a step
// whose target is absent (e.g. no element card on an empty process) is
// auto-skipped so the tour never dead-ends.
export const TOUR_STEPS: TourStep[] = [
  {
    target: ".procsw",
    title: "Your processes",
    body: "Switch between processes here, or create a new one. Each process is documented independently.",
    placement: "bottom",
  },
  {
    target: ".canvas",
    title: "The document canvas",
    body: "Each process is a living set of elements, organised into six areas — from the As-Is process through to the target state.",
    placement: "right",
  },
  {
    target: ".tb-icons",
    title: "Main actions",
    body: "Search, upload a document, run the foundational walkthrough, and run a quality check — the core actions all live here.",
    placement: "bottom",
  },
  {
    target: ".rail-r",
    title: "The process assistant",
    body: "This is the process assistant. Ask it to document a process, source the market view, or challenge any element.",
    placement: "left",
  },
  {
    target: ".el",
    title: "Approve as you go",
    body: "Every element is AI-drafted until you approve it. Use the status control on each card to sign off, correct or reject.",
    placement: "left",
  },
];

const CARD_W = 320;
const CARD_H = 200;
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export default function GuidedTour({
  steps,
  onClose,
}: {
  steps: TourStep[];
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = steps[idx];

  // Resolve the current step's target. A missing target auto-advances; if the
  // last step is missing too, the tour ends.
  const measure = useCallback(() => {
    if (!step) {
      onClose();
      return;
    }
    const el = document.querySelector(step.target);
    if (!el) {
      if (idx >= steps.length - 1) onClose();
      else setIdx((i) => i + 1);
      return;
    }
    setRect(el.getBoundingClientRect());
  }, [step, idx, steps.length, onClose]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    function onChange() {
      measure();
    }
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [measure]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!step || !rect) return null;

  const last = idx >= steps.length - 1;

  // Tooltip position — anchored to the target rect, clamped into the viewport.
  let x: number;
  let y: number;
  if (step.placement === "bottom") {
    x = rect.left;
    y = rect.bottom + 12;
  } else if (step.placement === "top") {
    x = rect.left;
    y = rect.top - CARD_H - 12;
  } else if (step.placement === "right") {
    x = rect.right + 12;
    y = rect.top;
  } else {
    x = rect.left - CARD_W - 12;
    y = rect.top;
  }
  x = clamp(x, 12, window.innerWidth - CARD_W - 12);
  y = clamp(y, 12, window.innerHeight - CARD_H - 12);

  const pad = 6;

  return (
    <div className="tour-root">
      {/* Click-blocker — keeps the tour modal while it runs. */}
      <div className="tour-scrim" />
      {/* Spotlight — the box-shadow dims everything outside the cut-out. */}
      <div
        className="tour-spotlight"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
      />
      <div
        className="tour-card"
        style={{ top: y, left: x, width: CARD_W }}
        role="dialog"
        aria-label="Guided tour"
      >
        <div className="tour-card-title">{step.title}</div>
        <div className="tour-card-body">{step.body}</div>
        <div className="tour-card-foot">
          <span className="tour-step-count">
            {idx + 1} / {steps.length}
          </span>
          <div className="tour-card-actions">
            <button className="tour-btn tour-skip" onClick={onClose}>
              {last ? "Close" : "Skip tour"}
            </button>
            {idx > 0 && (
              <button
                className="tour-btn"
                onClick={() => setIdx((i) => i - 1)}
              >
                Back
              </button>
            )}
            <button
              className="tour-btn tour-next"
              autoFocus
              onClick={() => (last ? onClose() : setIdx((i) => i + 1))}
            >
              {last ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

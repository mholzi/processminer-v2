"use client";

import { useRef, useState, type ReactNode } from "react";

// A hover/focus tooltip — replaces native `title=""`, which is slow (~1s),
// unstyled, and never shows on disabled buttons. ~150ms delay, fixed-position
// so it never clips inside a scroll container, and can carry rich content.

type Placement = "top" | "bottom" | "left" | "right";

export default function Tooltip({
  label,
  placement = "bottom",
  children,
}: {
  label: ReactNode;
  placement?: Placement;
  children: ReactNode;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  function show() {
    timer.current = setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const gap = 8;
      if (placement === "top") setPos({ x: r.left + r.width / 2, y: r.top - gap });
      else if (placement === "right") setPos({ x: r.right + gap, y: r.top + r.height / 2 });
      else if (placement === "left") setPos({ x: r.left - gap, y: r.top + r.height / 2 });
      else setPos({ x: r.left + r.width / 2, y: r.bottom + gap });
    }, 150);
  }
  function hide() {
    if (timer.current) clearTimeout(timer.current);
    setPos(null);
  }

  if (label === null || label === undefined || label === "") {
    return <>{children}</>;
  }

  return (
    <span
      ref={ref}
      className="tip-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {children}
      {pos && (
        <span
          role="tooltip"
          className={`tip tip-${placement}`}
          style={{ left: pos.x, top: pos.y }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

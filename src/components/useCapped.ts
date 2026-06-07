"use client";

import { useState } from "react";

// Cap a long list to a sane number of rows with a "show all" escape hatch, so
// cross-process portfolio tables don't dump every row at scale (review #10 /
// the portfolio-scales-to-many guardrail). Mirrors ContributorsView's pattern,
// made reusable.
export function useCapped<T>(items: T[], cap = 25) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, cap);
  return {
    shown,
    hasMore: items.length > cap && !expanded,
    remaining: Math.max(0, items.length - cap),
    showAll: () => setExpanded(true),
  };
}

"use client";

import { useEffect, useState } from "react";

// A timestamp that reads as "2h ago" but carries the precise time on hover.
// Relative text depends on the current clock, so it cannot be rendered on the
// server without a hydration mismatch — the first render (server + client)
// shows the stable absolute date, and an effect swaps in the relative form
// once mounted. The full UTC timestamp is always the `title`.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function absolute(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

function relative(d: Date, now: number): string {
  const secs = Math.round((now - d.getTime()) / 1000);
  if (secs < 0) return absolute(d);
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return absolute(d);
}

function fullTimestamp(d: Date): string {
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export default function RelativeTime({
  ts,
  className,
}: {
  ts: string;
  className?: string;
}) {
  const initial = new Date(ts);
  const valid = !Number.isNaN(initial.getTime());
  const [label, setLabel] = useState(valid ? absolute(initial) : "");

  useEffect(() => {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return;
    const tick = () => setLabel(relative(d, Date.now()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [ts]);

  if (!valid) return <span className={className} />;
  return (
    <span className={className} title={fullTimestamp(initial)}>
      {label}
    </span>
  );
}

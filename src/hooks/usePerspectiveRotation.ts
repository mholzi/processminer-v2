import { useEffect, useState } from "react";
import { pickPerspective } from "@/lib/wait-perspective";

// Long-wait perspective footer — a dry one-liner shown once the turn has
// been running for >2 min. Ticks elapsed every 5s (minute-precision is
// enough; saves a re-render every second). Each whole-minute crossing
// rotates to a new line so a waiter who stares at the chat gets fresh
// copy instead of the same sentence frozen on screen — pickPerspective()
// is told the previous line so consecutive minutes never repeat.

const PERSPECTIVE_THRESHOLD_MS = 2 * 60 * 1000;

export function usePerspectiveRotation(pending: boolean): {
  elapsedMs: number;
  perspective: string | null;
} {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [perspective, setPerspective] = useState<string | null>(null);

  useEffect(() => {
    if (!pending) {
      setElapsedMs(0);
      setPerspective(null);
      return;
    }
    const start = Date.now();
    const t = setInterval(() => setElapsedMs(Date.now() - start), 5000);
    return () => clearInterval(t);
  }, [pending]);

  const elapsedMinute = Math.floor(elapsedMs / 60_000);
  useEffect(() => {
    if (!pending || elapsedMs < PERSPECTIVE_THRESHOLD_MS) return;
    setPerspective((prev) => pickPerspective(prev));
    // Only re-pick when the whole-minute counter advances — the 5s ticks
    // between minutes must not churn the line.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, elapsedMinute]);

  return { elapsedMs, perspective };
}

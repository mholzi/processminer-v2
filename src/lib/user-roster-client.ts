"use client";

// Client-side resolver: username → display name. The roster is the same
// data the server-side displayName() in contributors.ts uses — fetched
// once per session from /api/users/roster and cached in a module-level
// promise so all consumers share one network round-trip.
//
// Use `resolveDisplayName(username)` for one-off resolution where the
// roster is already loaded, or the `useDisplayName(by)` hook in a
// React component when you want to render a resolved name reactively.

import { useEffect, useState } from "react";

type Roster = Record<string, string>;

let rosterPromise: Promise<Roster> | null = null;
let rosterCache: Roster | null = null;

async function fetchRoster(): Promise<Roster> {
  if (rosterCache) return rosterCache;
  if (!rosterPromise) {
    rosterPromise = fetch("/api/users/roster", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((j: { roster?: Roster }) => {
        rosterCache = j.roster ?? {};
        return rosterCache;
      })
      .catch(() => {
        rosterCache = {};
        rosterPromise = null;
        return rosterCache;
      });
  }
  return rosterPromise;
}

/** Resolve a stored `by` value to a display name. Falls through unchanged
 *  when no match (e.g. the "the assistant" sentinel, or a legacy display
 *  name that pre-dates the username migration). */
export function resolveDisplayName(by: string, roster: Roster | null): string {
  if (!by || !roster) return by;
  const key = Object.keys(roster).find(
    (k) => k.toLowerCase() === by.toLowerCase(),
  );
  return key ? roster[key] : by;
}

/** React hook: resolves `by` reactively. Returns the raw value until the
 *  roster lands, then re-renders with the display name. Designed to feel
 *  identical to rendering `by` directly. */
export function useDisplayName(by: string): string {
  const [roster, setRoster] = useState<Roster | null>(rosterCache);
  useEffect(() => {
    if (!rosterCache) {
      fetchRoster().then(setRoster);
    }
  }, []);
  return resolveDisplayName(by, roster);
}

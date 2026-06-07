"use client";

// Client-side access to the resolved feature flags. The server reads them once
// (page.tsx → AuthGate) and seeds this provider; any component can then check a
// flag with useFeatureFlag("feedback.<feature>") to render its UI dark or live.
// No fetching here — flags change rarely and a router.refresh() (which already
// runs after login) re-reads them.

import { createContext, useContext, type ReactNode } from "react";
import {
  defaultFlags,
  type FeatureFlagId,
  type FeatureFlags,
} from "@/lib/feature-flags";

const FeatureFlagsContext = createContext<FeatureFlags>(defaultFlags());

export function FeatureFlagsProvider({
  flags,
  children,
}: {
  flags: FeatureFlags;
  children: ReactNode;
}) {
  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/** The whole resolved flag set. */
export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext);
}

/** One flag's value. Returns false for any flag not in the provided set. */
export function useFeatureFlag(id: FeatureFlagId): boolean {
  return useContext(FeatureFlagsContext)[id] ?? false;
}

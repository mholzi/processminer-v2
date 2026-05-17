// Web-sourced and ideated element types. Their review is a binary triage —
// "relevant / disregard" — not the in-progress/approved/rejected approval the
// documentation elements use. The SME judges whether the signal matters, not
// whether it accurately documents the process.
//
// Kept in its own module (no server-only imports) so client components can
// use it — wiki.ts pulls in node:fs and cannot be imported for values client-
// side.

export const SOURCED_TYPES = [
  "market-trend",
  "competitor-eu",
  "competitor-global",
  "competitor-fintech",
  "innovation-idea",
  "competitor-cx-eu",
  "competitor-cx-global",
  "competitor-cx-fintech",
  "cx-benchmark",
];

export function isSourcedType(type: string): boolean {
  return SOURCED_TYPES.includes(type);
}

// Shared parsing helpers for wiki-element frontmatter. Both functions used to
// live duplicated across ElementCard, ProcessFlow, the section-specific
// *Summary components, RaciMatrix, ClientJourneyStrip, ControlsInTarget and
// PrintElement — they were copy-paste identical, so they live here now.

/** Coerce a frontmatter value to a string. Returns `""` for non-strings so
 *  callers don't have to guard. */
export function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Normalise a frontmatter value to a string array. Arrays pass through
 *  (coerced to strings, empties filtered); a single non-empty string becomes
 *  `[s]`; everything else is `[]`. */
export function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

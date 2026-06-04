// Shared frontmatter helpers (R13). Pure and dependency-free, so any module —
// client component or server lib — can import them. Previously this `asList`
// was copy-pasted identically into 8 files.

/** Normalise a frontmatter value that may be a single string or a list into an
 *  array (empty when absent). */
export function asList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/** A frontmatter value coerced to a string (the `fallback` when it is a list or
 *  absent). */
export function str(v: string | string[] | undefined, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

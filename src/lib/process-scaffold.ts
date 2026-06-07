// Deterministic process-scaffold helpers + canonical copy for the new-process
// skill. The model used to derive the slug and abbreviation in its head and
// reproduce the confirm bullets / closing message verbatim from the prompt —
// both sources of run-to-run variance. These helpers make the mechanics
// deterministic: `deriveProcessMeta` returns a guaranteed-valid slug and
// abbreviation (no FRD2-style reject-retry), flags / suggests around slug
// collisions, and hands back the exact confirm-bullet template. `scaffoldClosing`
// is the single source of the success message. The model's only judgement item
// is the one-line description.

// Filler words that should not contribute an initial to the abbreviation.
const STOPWORDS = new Set([
  "of", "the", "and", "for", "to", "a", "an", "in", "on", "at", "by", "with",
  "or", "per", "via", "de", "la", "process", "processes",
]);

/** Kebab-case folder slug for a process name. Always non-empty. */
export function slugifyProcessName(name: string): string {
  const slug = String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "process";
}

/**
 * A guaranteed-valid `<PROC>` abbreviation: 2–6 uppercase letters, no digits or
 * symbols (the scaffolder rejects anything else). Built from the initials of the
 * significant words; padded from the first word when there are too few, and
 * truncated to six.
 */
export function abbreviateProcessName(name: string): string {
  const words = String(name || "")
    .split(/[^A-Za-z]+/)
    .filter(Boolean)
    .filter((w) => !STOPWORDS.has(w.toLowerCase()));

  let letters = words
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  if (letters.length < 2) {
    // Too few initials (e.g. a single significant word like "Onboarding") —
    // take the leading letters of the first significant word instead, so we get
    // ONBO rather than O-padded noise.
    const firstWord = (words[0] || String(name || "").match(/[A-Za-z]+/)?.[0] || "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
    letters = firstWord.slice(0, 4);
  }
  if (letters.length < 2) letters = (letters + "PROC").slice(0, 4);
  return letters.slice(0, 6);
}

/**
 * Up to three alternative slugs that do not collide, for when the derived slug
 * is taken — so a collision is resolved in one turn instead of re-prompting.
 */
export function suggestAlternativeSlugs(base: string, slugExists: (s: string) => boolean): string[] {
  const out: string[] = [];
  for (let i = 2; out.length < 3 && i <= 12; i++) {
    const candidate = `${base}-${i}`;
    if (!slugExists(candidate)) out.push(candidate);
  }
  return out;
}

/** The exact confirm-bullet block, with a `{{description}}` placeholder. */
export function confirmBulletsTemplate(slug: string, PROC: string): string {
  return [
    "- **Description:** {{description}}",
    "- **Slug:** `" + slug + "`",
    "- **Abbreviation:** `" + PROC + "`",
  ].join("\n");
}

export interface DerivedProcessMeta {
  slug: string;
  PROC: string;
  slugTaken: boolean;
  suggestedSlugs: string[];
  /** The verbatim confirm bullets the skill relays (substitute {{description}}). */
  confirmTemplate: string;
}

/**
 * Deterministically derive everything new-process needs from a raw process name.
 * `slugExists` is injected so this stays pure (callers supply an fs-backed check).
 */
export function deriveProcessMeta(name: string, slugExists: (s: string) => boolean): DerivedProcessMeta {
  const slug = slugifyProcessName(name);
  const PROC = abbreviateProcessName(name);
  const slugTaken = slugExists(slug);
  const suggestedSlugs = slugTaken ? suggestAlternativeSlugs(slug, slugExists) : [];
  return {
    slug,
    PROC,
    slugTaken,
    suggestedSlugs,
    confirmTemplate: confirmBulletsTemplate(slug, PROC),
  };
}

/** The single source of truth for the new-process success message. */
export function scaffoldClosing(title: string): string {
  return (
    `**${title}** has been successfully created, and the app has switched to it.\n\n` +
    `The process is empty — every section is ready to be filled. The fastest way to start is to **upload a process document**: click **⬆ Upload document** in the top bar and drag in a PDF, Word or Markdown file. I'll review it, summarise it, and extract its content into the wiki.\n\n` +
    `Prefer to talk it through instead? Just ask me to **run a documentation session** and I'll guide you through it question by question.`
  );
}

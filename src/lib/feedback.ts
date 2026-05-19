// App-feedback data model — feedback on the Processminer tool itself, kept in
// a separate top-level feedback/ tree (one Markdown file per item), apart from
// the process wikis under wiki/. This is the client-safe half of the module:
// types, the controlled vocabularies and label lookups, with NO filesystem
// imports, so UI components can import it freely. The disk read/write lives in
// feedback-store.ts.

export const FEEDBACK_CATEGORIES = [
  { id: "bug", label: "Bug" },
  { id: "idea", label: "Idea" },
  { id: "improvement", label: "Improvement" },
  { id: "question", label: "Question" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["id"];

export const FEEDBACK_STATUSES = [
  { id: "open", label: "Open" },
  { id: "planned", label: "Planned" },
  { id: "done", label: "Done" },
  { id: "declined", label: "Declined" },
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]["id"];

export interface FeedbackItem {
  /** Sequential id, e.g. FB-001. */
  id: string;
  title: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  /** Name of the person who filed it. */
  author: string;
  /** Their role, as captured at the login gate. */
  role: string;
  /** Free-text pointer to the app page/area the feedback is about; may be "". */
  page: string;
  /** ISO date (YYYY-MM-DD) the item was filed. */
  created: string;
  /** The feedback prose — the Markdown body of the file. */
  body: string;
}

export const isFeedbackCategory = (v: unknown): v is FeedbackCategory =>
  FEEDBACK_CATEGORIES.some((c) => c.id === v);

export const isFeedbackStatus = (v: unknown): v is FeedbackStatus =>
  FEEDBACK_STATUSES.some((s) => s.id === v);

export const categoryLabel = (id: string): string =>
  FEEDBACK_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const statusLabel = (id: string): string =>
  FEEDBACK_STATUSES.find((s) => s.id === id)?.label ?? id;

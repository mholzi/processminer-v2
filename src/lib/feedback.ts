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

/** Auto-captured context about where the tester was when they filed — the
 *  live-feedback "auto-capture page context" feature (idea #2). Every field is
 *  optional; the widget fills what it can. Client-supplied, so the API
 *  whitelists keys and caps lengths before persisting. */
export interface FeedbackContext {
  /** The browser path the tester was on (pathname + search). */
  path?: string;
  /** The active process slug, when inside a process. */
  processSlug?: string;
  /** The active process display name. */
  processName?: string;
  /** The section / area within the app the tester was viewing. */
  area?: string;
  /** Viewport size, e.g. "1440×900". */
  viewport?: string;
  /** Browser user-agent string. */
  userAgent?: string;
  /** ISO timestamp the context was captured. */
  capturedAt?: string;
}

/** A reference to the wiki element a piece of feedback is pinned to — the
 *  point-and-click "feedback on this element" feature (idea #3). Distinct from
 *  the SME wiki discussion threads: this is app/tool feedback that happens to
 *  name an element. */
export interface FeedbackElementRef {
  /** The element id, e.g. "PS-004". */
  id: string;
  /** The element's title at pin time, for display. */
  title?: string;
  /** The process the element belongs to. */
  processSlug?: string;
}

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
  /** Auto-captured page context, when the tester filed via a widget with the
   *  auto-context feature on. */
  context?: FeedbackContext;
  /** Filename of an attached screenshot (e.g. "FB-001.png"), stored beside the
   *  item in feedback/. Served via /api/feedback/screenshot. */
  screenshot?: string;
  /** The wiki element this feedback is pinned to, when filed via point-and-click
   *  element feedback (idea #3). */
  element?: FeedbackElementRef;
}

/** The whitelisted keys of FeedbackContext, used by the API to sanitize the
 *  client-supplied object before persisting. */
export const FEEDBACK_CONTEXT_KEYS: (keyof FeedbackContext)[] = [
  "path",
  "processSlug",
  "processName",
  "area",
  "viewport",
  "userAgent",
  "capturedAt",
];

export const isFeedbackCategory = (v: unknown): v is FeedbackCategory =>
  FEEDBACK_CATEGORIES.some((c) => c.id === v);

export const isFeedbackStatus = (v: unknown): v is FeedbackStatus =>
  FEEDBACK_STATUSES.some((s) => s.id === v);

export const categoryLabel = (id: string): string =>
  FEEDBACK_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const statusLabel = (id: string): string =>
  FEEDBACK_STATUSES.find((s) => s.id === id)?.label ?? id;

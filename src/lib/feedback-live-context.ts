// Live "where is the tester right now" store for the auto-capture feedback
// feature (idea #2). The floating widget is mounted high in the tree (AuthGate)
// and can't see the deep client state of ProcessDocScreen — which process is
// open, which section is showing — because the tester can switch processes
// mid-session, making any prop passed down at mount time stale.
//
// Rather than thread a provider through a large component, screens publish their
// current context into this tiny module-level store, and the widget reads it at
// submit time. It's ephemeral per-tab UI state (not durable data), so a module
// singleton is the right weight — no re-render churn on every section change.

export interface LiveFeedbackContext {
  processSlug?: string;
  processName?: string;
  /** The section / area label the tester is viewing. */
  area?: string;
}

let current: LiveFeedbackContext = {};

/** Publish the tester's current location. Screens call this in an effect when
 *  the active process / section changes. Pass {} to clear. */
export function setLiveFeedbackContext(ctx: LiveFeedbackContext): void {
  current = ctx;
}

/** Read the latest published context. The widget calls this when a tester opens
 *  the sheet or submits. */
export function getLiveFeedbackContext(): LiveFeedbackContext {
  return current;
}

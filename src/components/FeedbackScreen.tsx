"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFocusTrap } from "./useFocusTrap";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  type FeedbackCategory,
  type FeedbackItem,
  type FeedbackStatus,
  categoryLabel,
  statusLabel,
} from "@/lib/feedback";
import type { User } from "@/lib/user";

// The App Feedback screen — a dedicated page for feedback on the Processminer
// tool itself (bugs, ideas, improvements). It is deliberately separate from the
// process wikis: items live in their own feedback/ tree, one Markdown file
// each. Existing items arrive as a prop (read server-side from disk); new items
// and status changes POST/PATCH to /api/feedback, after which router.refresh()
// re-reads the tree.

type StatusFilter = FeedbackStatus | "all";

export default function FeedbackScreen({
  feedback,
  user,
  onClose,
}: {
  feedback: FeedbackItem[];
  user: User;
  onClose: () => void;
}) {
  const router = useRouter();

  // Trap focus + Esc in the feedback overlay (a11y — was a hand-rolled overlay
  // with no dialog semantics).
  const overlayRef = useRef<HTMLDivElement>(null);
  useFocusTrap(overlayRef, onClose);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [page, setPage] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: feedback.length };
    for (const s of FEEDBACK_STATUSES) c[s.id] = 0;
    for (const f of feedback) c[f.status] = (c[f.status] ?? 0) + 1;
    return c;
  }, [feedback]);

  const shown =
    filter === "all" ? feedback : feedback.filter((f) => f.status === filter);
  const canSubmit = title.trim() !== "" && body.trim() !== "" && !submitting;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setFlash(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          page: page.trim(),
          body: body.trim(),
          author: user.name,
          role: user.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not save feedback.");
      setTitle("");
      setPage("");
      setBody("");
      setCategory("idea");
      setFlash(`Thanks — filed as ${data.item.id}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(id: string, status: FeedbackStatus) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not update.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="fb-overlay">
      <div
        ref={overlayRef}
        className="fb-main"
        role="dialog"
        aria-modal="true"
        aria-label="App Feedback"
      >
        <div className="fb-head">
          <button type="button" className="fb-back" onClick={onClose}>
            ‹ Back to process
          </button>
          <h1>App Feedback</h1>
          <p className="fb-sub">
            Bugs, ideas and improvements for Processminer itself — kept
            separate from the process documentation.
          </p>
        </div>

        <form className="fb-form" onSubmit={submit}>
          <div className="fb-form-row">
            <label className="fb-field fb-grow">
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary of the feedback"
                maxLength={200}
              />
            </label>
            <label className="fb-field">
              <span>Category</span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as FeedbackCategory)
                }
              >
                {FEEDBACK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="fb-field">
            <span>
              Page / area <em>(optional)</em>
            </span>
            <input
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="e.g. Process Steps, the quality panel, the assistant chat"
              maxLength={120}
            />
          </label>
          <label className="fb-field">
            <span>Details</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened, or what you'd like to see…"
              rows={5}
            />
          </label>
          <div className="fb-form-foot">
            <span className="fb-asuser">
              Filing as {user.name} · {user.role}
            </span>
            <button type="submit" className="fb-submit" disabled={!canSubmit}>
              {submitting ? "Saving…" : "Submit feedback"}
            </button>
          </div>
          {error && <p className="fb-error">{error}</p>}
          {flash && <p className="fb-flash">{flash}</p>}
        </form>

        <div className="fb-list-head">
          <h2>Submitted feedback</h2>
          <div className="fb-filters">
            {(["all", ...FEEDBACK_STATUSES.map((s) => s.id)] as StatusFilter[]).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  className={`fb-chip${filter === f ? " active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : statusLabel(f)} · {counts[f] ?? 0}
                </button>
              ),
            )}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="fb-empty">
            {feedback.length === 0
              ? "No feedback yet — be the first to file something above."
              : "No feedback with this status."}
          </p>
        ) : (
          <ul className="fb-list">
            {shown.map((f) => (
              <li key={f.id} className="fb-card">
                <div className="fb-card-top">
                  <span className="fb-card-id">{f.id}</span>
                  <span className={`fb-cat fb-cat-${f.category}`}>
                    {categoryLabel(f.category)}
                  </span>
                  <span className="fb-card-title">{f.title}</span>
                  <select
                    className={`fb-status fb-status-${f.status}`}
                    value={f.status}
                    disabled={busyId === f.id}
                    onChange={(e) =>
                      changeStatus(f.id, e.target.value as FeedbackStatus)
                    }
                    aria-label={`Status of ${f.id}`}
                  >
                    {FEEDBACK_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                {f.element && (
                  <div className="fb-card-el">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                    <span className="fb-card-el-id">{f.element.id}</span>
                    {f.element.title && <span>{f.element.title}</span>}
                  </div>
                )}
                {f.body && <p className="fb-card-body">{f.body}</p>}
                {f.context && (
                  <div className="fb-card-ctx">
                    {f.context.processName && (
                      <span>{f.context.processName}</span>
                    )}
                    {f.context.area && <span>· {f.context.area}</span>}
                    {f.context.path && <code>· {f.context.path}</code>}
                    {f.context.viewport && <span>· {f.context.viewport}</span>}
                  </div>
                )}
                {f.screenshot && (
                  <a
                    className="fb-card-shot"
                    href={`/api/feedback/screenshot?id=${encodeURIComponent(f.id)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`/api/feedback/screenshot?id=${encodeURIComponent(f.id)}`}
                      alt={`Screenshot for ${f.id}`}
                    />
                  </a>
                )}
                <div className="fb-card-meta">
                  <span>
                    {f.author}
                    {f.role ? ` · ${f.role}` : ""}
                  </span>
                  {f.page && <span>· {f.page}</span>}
                  {f.created && <span>· {f.created}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

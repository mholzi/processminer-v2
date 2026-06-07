"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
  type FeedbackContext,
} from "@/lib/feedback";
import { getLiveFeedbackContext } from "@/lib/feedback-live-context";
import { useFeatureFlag } from "@/lib/feature-flags-context";
import type { User } from "@/lib/user";

// Live-feedback idea #1 — the always-reachable floating feedback button.
// Design: design-shotgun "feedback-button-20260606", approved variant B
// ("Accent pill + slide-up sheet"). Filled workspace-accent pill, fixed
// bottom-right, opens a slide-up sheet that posts to /api/feedback. Self-gates
// on the `feedback.floating_button` admin flag.
//
// Layered features, each behind its own admin flag:
//   #2 feedback.auto_context — attach where the tester was (live process/section
//      from feedback-live-context, plus path, viewport, user-agent, time).
//   #4 feedback.screenshot — one-click DOM-to-PNG of the app behind the sheet.
//   #3 feedback.element_comments — "Feedback mode": a global toggle that makes
//      every element card targetable; clicking one pins the feedback to that
//      element (edge rail + the sheet pre-filled with the element ref). Design:
//      design-shotgun "element-feedback-20260606", approved variant B. The
//      targeting uses a document-level click capture against cards' data-feedback-*
//      attributes, so no per-card wiring is needed.

const MAX_BODY = 8000;

interface PinnedElement {
  id: string;
  title?: string;
}

/** A one-line title from the body — first line, trimmed, capped. */
function deriveTitle(body: string): string {
  const firstLine = body.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine;
}

/** Build the auto-captured context from the live store + browser. */
function captureContext(): FeedbackContext {
  const live = getLiveFeedbackContext();
  return {
    path: window.location.pathname + window.location.search,
    processSlug: live.processSlug,
    processName: live.processName,
    area: live.area,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    userAgent: navigator.userAgent,
    capturedAt: new Date().toISOString(),
  };
}

export default function FloatingFeedback({
  user,
  contextLabel,
}: {
  user: User;
  contextLabel?: string;
}) {
  const enabled = useFeatureFlag("feedback.floating_button");
  const autoContext = useFeatureFlag("feedback.auto_context");
  const screenshotOn = useFeatureFlag("feedback.screenshot");
  const elementComments = useFeatureFlag("feedback.element_comments");

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  // Element-feedback (#3): whether targeting mode is on, and the pinned element.
  const [targeting, setTargeting] = useState(false);
  const [pinned, setPinned] = useState<PinnedElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // The pinned card's DOM node, so we can toggle its highlight class.
  const pinnedNodeRef = useRef<HTMLElement | null>(null);

  function clearPin() {
    if (pinnedNodeRef.current) {
      pinnedNodeRef.current.classList.remove("ffb-pinned");
      pinnedNodeRef.current = null;
    }
    setPinned(null);
  }

  // Focus the textarea when the sheet opens; clear transient state on reopen.
  useEffect(() => {
    if (open) {
      setSentId(null);
      const t = setTimeout(() => textareaRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Esc: in targeting mode, exit targeting; otherwise close the sheet.
  useEffect(() => {
    if (!open && !targeting) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (targeting) setTargeting(false);
      else setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, targeting]);

  // Targeting mode (#3): mark the body so cards show as targetable, and capture
  // clicks on element cards before their own handlers run.
  useEffect(() => {
    if (!targeting) return;
    document.body.classList.add("ffb-targeting");
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t || t.closest(".ffb-modebar")) return; // let the banner's button work
      const card = t.closest<HTMLElement>("[data-feedback-id]");
      if (!card) return;
      e.preventDefault();
      e.stopPropagation();
      clearPin();
      card.classList.add("ffb-pinned");
      pinnedNodeRef.current = card;
      setPinned({
        id: card.getAttribute("data-feedback-id") || "",
        title: card.getAttribute("data-feedback-title") || undefined,
      });
      setTargeting(false);
      setOpen(true);
    }
    // Capture phase so the card's own onClick doesn't fire.
    document.addEventListener("click", onClick, true);
    return () => {
      document.body.classList.remove("ffb-targeting");
      document.removeEventListener("click", onClick, true);
    };
  }, [targeting]);

  if (!enabled) return null;

  const canSubmit = body.trim() !== "" && !submitting && !capturing;

  const live = autoContext ? getLiveFeedbackContext() : {};
  const liveLabel =
    "processName" in live && live.processName
      ? `${live.processName}${live.area ? ` · ${live.area}` : ""}`
      : undefined;
  const pageLabel = (autoContext ? liveLabel : undefined) ?? contextLabel ?? "";

  function enterPinMode() {
    setOpen(false);
    setError(null);
    setTargeting(true);
  }

  function closeSheet() {
    setOpen(false);
    clearPin();
  }

  async function captureScreenshot() {
    setCapturing(true);
    setError(null);
    try {
      const dataUrl = await toPng(document.body, {
        pixelRatio: 1,
        cacheBust: true,
        filter: (node) =>
          !(node instanceof HTMLElement && node.classList?.contains("ffb-root")),
      });
      setShot(dataUrl);
    } catch {
      setError("Couldn't capture the screen. You can still send without it.");
    } finally {
      setCapturing(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (body.trim() === "" || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: deriveTitle(body),
          category,
          page: pageLabel,
          body: body.trim().slice(0, MAX_BODY),
          context: autoContext ? captureContext() : undefined,
          screenshot: screenshotOn ? shot ?? undefined : undefined,
          element: pinned
            ? {
                id: pinned.id,
                title: pinned.title,
                processSlug: getLiveFeedbackContext().processSlug,
              }
            : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        item?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.item) {
        throw new Error(data.error ?? "Could not send feedback.");
      }
      setSentId(data.item.id);
      setBody("");
      setCategory("idea");
      setShot(null);
      clearPin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  // While targeting, show only the mode banner (the sheet is closed so the
  // tester can see and click the cards behind it).
  if (targeting) {
    return (
      <div className="ffb-modebar" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        <span>
          <b>Feedback mode</b> — click any element to pin feedback to it
        </span>
        <button type="button" className="ffb-modebar-done" onClick={() => setTargeting(false)}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="ffb-root">
      {open && (
        <form className="ffb-sheet" onSubmit={submit}>
          <div className="ffb-sheet-head">
            <span className="ffb-sheet-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Send feedback
            </span>
            <button type="button" className="ffb-x" onClick={closeSheet} aria-label="Close feedback">
              ×
            </button>
          </div>

          {sentId ? (
            <div className="ffb-sent">
              <p className="ffb-sent-msg">
                Thanks — filed as <b>{sentId}</b>. The team can see it now.
              </p>
              <div className="ffb-sheet-foot">
                <span />
                <button type="button" className="ffb-send" onClick={() => setSentId(null)}>
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="ffb-sheet-body">
                {/* element ref banner, or the entry into pin mode */}
                {pinned ? (
                  <div className="ffb-refbar">
                    <span className="ffb-refbar-pin" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                    </span>
                    <span className="ffb-refbar-id">{pinned.id}</span>
                    {pinned.title && <span className="ffb-refbar-nm">{pinned.title}</span>}
                    <button
                      type="button"
                      className="ffb-refbar-x"
                      onClick={clearPin}
                      aria-label="Unpin element"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  elementComments && (
                    <button type="button" className="ffb-pin-entry" onClick={enterPinMode}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                      Pin to a specific element
                    </button>
                  )
                )}

                <div className="ffb-lbl">Type</div>
                <div className="ffb-chips">
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className={`ffb-cat${category === c.id ? " ffb-cat-on" : ""}`}
                      onClick={() => setCategory(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  className="ffb-textarea"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={
                    pinned
                      ? "What's off about this element?"
                      : "What's working, what's not? Be as specific as you can."
                  }
                />

                {screenshotOn && (
                  <div className="ffb-shot">
                    {shot ? (
                      <div className="ffb-shot-have">
                        <img className="ffb-shot-thumb" src={shot} alt="Screenshot preview" />
                        <span className="ffb-shot-label">Screenshot attached</span>
                        <button
                          type="button"
                          className="ffb-shot-remove"
                          onClick={() => setShot(null)}
                          aria-label="Remove screenshot"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="ffb-shot-btn"
                        onClick={captureScreenshot}
                        disabled={capturing}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        {capturing ? "Capturing…" : "Attach screenshot"}
                      </button>
                    )}
                  </div>
                )}

                {(autoContext || pageLabel) && (
                  <div className="ffb-ctx">
                    <span className="ffb-ctx-dot" aria-hidden />
                    Attaching{" "}
                    <code>{[pageLabel, user.name].filter(Boolean).join(" · ")}</code>
                    {autoContext && <span className="ffb-ctx-auto">+ page details</span>}
                  </div>
                )}
                {error && <p className="ffb-error">⚠ {error}</p>}
              </div>
              <div className="ffb-sheet-foot">
                <span className="ffb-foot-note">
                  {pinned ? `Pinned to ${pinned.id} · team only` : "Visible to the team only"}
                </span>
                <button type="submit" className="ffb-send" disabled={!canSubmit}>
                  {submitting ? "Sending…" : "Send feedback"}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      <button
        type="button"
        className={`ffb-pill${open ? " ffb-pill-open" : ""}`}
        onClick={() => (open ? closeSheet() : setOpen(true))}
        aria-expanded={open}
        aria-label="Send feedback"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Feedback
      </button>
    </div>
  );
}

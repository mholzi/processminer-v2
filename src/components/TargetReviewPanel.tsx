"use client";

import { useState, useTransition } from "react";
import type { TargetReview, TriageState } from "@/lib/target-review";
import { specialistLabel } from "@/lib/target-review";
import { triageTargetReview } from "@/lib/wiki-write";
import type { GetRef } from "@/lib/linkify";
import ElementHovercard from "./ElementHovercard";

// The Council Review panel — the five other specialists' feedback on the
// proposed target, with the SME's accept / reject triage per item. An accepted
// item re-opens its implicated transformation-decision (server-side).

function refChip(
  id: string,
  getRef: GetRef,
  onGoToElement: (id: string) => void,
) {
  const ref = getRef(id);
  return (
    <ElementHovercard key={id} element={ref?.page} typeLabel={ref?.typeLabel}>
      <button
        type="button"
        className="link-chip link-chip-nav"
        onClick={() => onGoToElement(id)}
      >
        {id}
      </button>
    </ElementHovercard>
  );
}

export default function TargetReviewPanel({
  review,
  getRef,
  onGoToElement,
}: {
  review: TargetReview;
  getRef: GetRef;
  onGoToElement: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function triage(itemId: string, state: TriageState) {
    setError(null);
    setBusyId(itemId);
    startTransition(async () => {
      try {
        await triageTargetReview(review.slug, itemId, state);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Triage failed.");
      } finally {
        setBusyId(null);
      }
    });
  }

  const counts = {
    pending: review.items.filter((i) => i.triage === "pending").length,
    accepted: review.items.filter((i) => i.triage === "accepted").length,
    rejected: review.items.filter((i) => i.triage === "rejected").length,
  };

  return (
    <div className="trv-panel">
      <div className="trv-head">
        <span className="trv-head-counts">
          {review.items.length} item{review.items.length === 1 ? "" : "s"}
          {" · "}
          {counts.pending} pending · {counts.accepted} accepted ·{" "}
          {counts.rejected} rejected
        </span>
        <span className="trv-head-ran">
          {review.ran.length === 4
            ? "Full council"
            : review.ran.map(specialistLabel).join(", ")}
        </span>
      </div>
      {error && <div className="trv-error">{error}</div>}

      {review.items.length === 0 ? (
        <div className="empty-state">
          <p>The council raised no concerns.</p>
          <p className="empty-hint">
            Every specialist reviewed the proposed target and found nothing to
            flag.
          </p>
        </div>
      ) : (
        <ul className="trv-items">
          {review.items.map((item) => {
            const busy = pending && busyId === item.id;
            return (
              <li
                key={item.id}
                className={`trv-item trv-item-${item.triage}`}
              >
                <div className="trv-item-top">
                  <span className="trv-spec">
                    {specialistLabel(item.specialist)}
                  </span>
                  <span className="trv-item-id">{item.id}</span>
                  <span className={`trv-state trv-state-${item.triage}`}>
                    {item.triage}
                  </span>
                </div>
                <div className="trv-item-title">{item.title}</div>
                <div className="trv-item-detail">{item.detail}</div>
                {item.targets.length > 0 && (
                  <div className="trv-item-targets">
                    {item.targets.map((id) =>
                      refChip(id, getRef, onGoToElement),
                    )}
                  </div>
                )}
                <div className="trv-item-actions">
                  {item.triage !== "accepted" && (
                    <button
                      type="button"
                      className="act ai"
                      disabled={busy}
                      onClick={() => triage(item.id, "accepted")}
                    >
                      Accept
                    </button>
                  )}
                  {item.triage !== "rejected" && (
                    <button
                      type="button"
                      className="act"
                      disabled={busy}
                      onClick={() => triage(item.id, "rejected")}
                    >
                      Reject
                    </button>
                  )}
                  {item.triage !== "pending" && (
                    <button
                      type="button"
                      className="act"
                      disabled={busy}
                      onClick={() => triage(item.id, "pending")}
                    >
                      Reopen
                    </button>
                  )}
                  {item.triage === "accepted" && (
                    <span className="trv-item-note">
                      Accepted — any approved implicated decision is re-opened
                      for re-approval.
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

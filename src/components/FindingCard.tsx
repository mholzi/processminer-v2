"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  findingSignature,
  isDismissed,
  isResolved,
  type LintFinding,
} from "@/lib/lint";
import FindingDismiss from "./FindingDismiss";

// A single finding/discrepancy card — shown in the lint Review panel.
// Kind-coded left border, jump-to chips, deep dive. A finding resolved via a
// chat deep-dive, or dismissed by the SME, renders muted — with a resolved /
// dismissed stamp in place of the deep-dive action. A dismissed finding can be
// restored; an open one can be dismissed.
export default function FindingCard({
  finding: f,
  slug,
  by,
  onGoToElement,
  onDeepDive,
}: {
  finding: LintFinding;
  slug: string;
  by: string;
  onGoToElement: (id: string) => void;
  onDeepDive: (finding: LintFinding) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const resolved = isResolved(f);
  const dismissed = isDismissed(f);

  function restore() {
    if (pending) return;
    setError(null);
    start(async () => {
      let res: Response;
      try {
        res = await fetch("/api/findings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            signature: findingSignature(f),
            action: "restore",
          }),
        });
      } catch {
        setError("Could not reach the server.");
        return;
      }
      if (!res.ok) {
        setError("Could not restore the finding.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <article
      className={`finding ${f.kind}${
        resolved || dismissed ? " resolved" : ""
      }${dismissed ? " dismissed" : ""}`}
    >
      <div className="finding-top">
        <span className={`finding-kind ${f.kind}`}>
          {f.kind === "discrepancy"
            ? "Discrepancy"
            : f.kind === "conformance"
              ? "Structure"
              : "Question"}
        </span>
        <span className="finding-id">{f.id}</span>
        {resolved ? (
          <span className="finding-resolved-tag" title="Resolved in a deep-dive">
            ✓ Resolved
          </span>
        ) : dismissed ? (
          <>
            <span className="finding-resolved-tag" title="Dismissed by the SME">
              ⊘ Dismissed
            </span>
            <button
              type="button"
              className="finding-restore"
              onClick={restore}
              disabled={pending}
              title="Restore this finding to the open list"
            >
              ↺ Restore
            </button>
          </>
        ) : (
          <>
            <button
              className="act ai finding-dd"
              onClick={() => onDeepDive(f)}
              title="Start a Brainstorm deep-dive session on this finding"
            >
              ⌖ Deep dive
            </button>
            <FindingDismiss slug={slug} finding={f} by={by} />
          </>
        )}
      </div>
      <div className="finding-title">{f.title}</div>
      <div className="finding-detail">{f.detail}</div>
      {error && (
        <div className="finding-error" role="alert">
          {error}
        </div>
      )}
      {resolved && (f.resolvedBy || f.resolvedAt || f.resolutionNote) && (
        <div className="finding-resolution">
          <span className="finding-resolution-meta">
            Resolved
            {f.resolvedBy ? ` by ${f.resolvedBy}` : ""}
            {f.resolvedAt ? ` · ${f.resolvedAt}` : ""}
          </span>
          {f.resolutionNote && (
            <span className="finding-resolution-note">{f.resolutionNote}</span>
          )}
        </div>
      )}
      {dismissed && (
        <div className="finding-resolution">
          <span className="finding-resolution-meta">
            Dismissed
            {f.dismissedBy ? ` by ${f.dismissedBy}` : ""}
            {f.dismissedAt ? ` · ${f.dismissedAt}` : ""}
          </span>
          {f.dismissReason && (
            <span className="finding-resolution-note">{f.dismissReason}</span>
          )}
        </div>
      )}
      <div className="finding-els">
        <span className="finding-els-label">Involves:</span>
        {f.elements.map((id) => (
          <button
            type="button"
            className="link-chip link-chip-nav"
            key={id}
            onClick={() => onGoToElement(id)}
            title={`Go to ${id}`}
          >
            {id}
          </button>
        ))}
      </div>
    </article>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { findingSignature, type LintFinding } from "@/lib/lint";

// "Dismiss" control on a lint finding — the SME sets a finding aside with a
// recorded reason (PATCH /api/findings → finding-dismissals.json, an app-owned
// sidecar that survives a re-lint). Collapsed to a button until clicked; then
// an inline reason field, because a dismissal without a reason is not worth
// recording. "Snooze" dismisses for 30 days, then the finding resurfaces.
export default function FindingDismiss({
  slug,
  finding,
  by,
  compact,
}: {
  slug: string;
  finding: LintFinding;
  by: string;
  /** Icon-only trigger — matches the new finding-pill row style. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(days: number) {
    const r = reason.trim();
    if (!r || pending) return;
    setError(null);
    start(async () => {
      let res: Response;
      try {
        res = await fetch("/api/findings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            signature: findingSignature(finding),
            action: "dismiss",
            reason: r,
            by,
            ...(days > 0 ? { days } : {}),
          }),
        });
      } catch {
        setError("Could not reach the server.");
        return;
      }
      if (!res.ok) {
        let msg = "Could not dismiss the finding.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* keep the fallback */
        }
        setError(msg);
        return;
      }
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  function close() {
    setOpen(false);
    setReason("");
    setError(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        className={compact ? "el-finding-icon" : "el-finding-dismiss"}
        onClick={() => setOpen(true)}
        title="Set this finding aside with a reason"
        aria-label="Dismiss"
      >
        {compact ? "⊘" : "⊘ Dismiss"}
      </button>
    );
  }

  return (
    <div className="finding-dismiss-form">
      <input
        value={reason}
        autoFocus
        placeholder="Why dismiss this finding?"
        onChange={(e) => setReason(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit(0);
          if (e.key === "Escape") close();
        }}
      />
      <button
        type="button"
        onClick={() => submit(0)}
        disabled={pending || !reason.trim()}
      >
        {pending ? "…" : "Dismiss"}
      </button>
      <button
        type="button"
        onClick={() => submit(30)}
        disabled={pending || !reason.trim()}
        title="Hide for 30 days, then let it resurface"
      >
        Snooze 30d
      </button>
      <button
        type="button"
        className="finding-dismiss-cancel"
        onClick={close}
      >
        Cancel
      </button>
      {error && (
        <span className="finding-dismiss-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

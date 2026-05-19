"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// "Dismiss" control on a lint finding — the SME sets a finding aside with a
// recorded reason (PATCH /api/findings → lint.json). Collapsed to a button
// until clicked; then an inline reason field, because a dismissal without a
// reason is not worth recording.
export default function FindingDismiss({
  slug,
  findingId,
  by,
}: {
  slug: string;
  findingId: string;
  by: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    const r = reason.trim();
    if (!r || pending) return;
    start(async () => {
      await fetch("/api/findings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, findingId, reason: r, by }),
      });
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        className="el-finding-dismiss"
        onClick={() => setOpen(true)}
        title="Set this finding aside with a reason"
      >
        ⊘ Dismiss
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
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setOpen(false);
            setReason("");
          }
        }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || !reason.trim()}
      >
        {pending ? "…" : "Dismiss"}
      </button>
      <button
        type="button"
        className="finding-dismiss-cancel"
        onClick={() => {
          setOpen(false);
          setReason("");
        }}
      >
        Cancel
      </button>
    </div>
  );
}

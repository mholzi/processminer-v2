"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setApproval } from "@/lib/wiki-write";
import { useDisplayName } from "@/lib/user-roster-client";

// The review-status control — in-progress / approved / rejected — for an
// element or the process overview. Optimistic, server-action backed; the wiki
// frontmatter is the source of truth and stamps who set it and when.
const APPROVAL_OPTIONS = [
  { value: "in-progress", label: "In progress" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];
export default function ApprovalControl({
  slug,
  id,
  approval: serverApproval,
  approvalBy,
  approvalDate,
  onSaved,
}: {
  slug: string;
  id: string;
  approval: string;
  approvalBy?: string | null;
  approvalDate?: string | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [approval, setApprovalLocal] = useState(serverApproval);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApprovalLocal(serverApproval);
  }, [serverApproval]);

  function change(value: string) {
    setApprovalLocal(value);
    setError(null);
    start(async () => {
      try {
        await setApproval(slug, id, value);
        router.refresh();
        onSaved?.();
      } catch (e) {
        setApprovalLocal(serverApproval);
        setError(e instanceof Error ? e.message : "Could not save status");
      }
    });
  }

  return (
    <span className="approval-control">
      <label className={`approval approval-${approval}`}>
        <span className="statusctl-dot" aria-hidden="true" />
        <span className="statusctl-label">
          {APPROVAL_OPTIONS.find((o) => o.value === approval)?.label ?? ""}
        </span>
        <span className="statusctl-caret" aria-hidden="true">
          ▾
        </span>
        <select
          className="statusctl-native"
          value={approval}
          disabled={pending}
          onChange={(e) => change(e.target.value)}
          aria-label="Review status"
        >
          {APPROVAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {approvalBy && approvalDate && (
        <ApprovalMeta by={approvalBy} date={approvalDate} />
      )}
      {error && <span className="el-edit-err">{error}</span>}
    </span>
  );
}

// Renders `<approvalBy> · <approvalDate>` with the username resolved to its
// current display name (so a rename in data/users.json propagates here).
function ApprovalMeta({ by, date }: { by: string; date: string }) {
  return (
    <span className="approval-meta">
      {useDisplayName(by)} · {date}
    </span>
  );
}

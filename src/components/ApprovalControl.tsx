"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setApproval } from "@/lib/wiki-write";

// The review-status control — in-progress / approved / rejected — for an
// element or the process overview. Optimistic, server-action backed; the wiki
// frontmatter is the source of truth and stamps who set it and when.
export default function ApprovalControl({
  slug,
  id,
  approval: serverApproval,
  approvalBy,
  approvalDate,
  userName,
  onSaved,
}: {
  slug: string;
  id: string;
  approval: string;
  approvalBy?: string | null;
  approvalDate?: string | null;
  userName: string;
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
        await setApproval(slug, id, value, userName);
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
        <select
          value={approval}
          disabled={pending}
          onChange={(e) => change(e.target.value)}
          aria-label="Review status"
        >
          <option value="in-progress">In progress</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>
      {approvalBy && approvalDate && (
        <span className="approval-meta">
          {approvalBy} · {approvalDate}
        </span>
      )}
      {error && <span className="el-edit-err">{error}</span>}
    </span>
  );
}

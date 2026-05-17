"use client";

import { useEffect } from "react";

// A bottom-right toast stack — one consistent home for transient outcomes
// (web-sourcing finished, lint pass done, a save error). Replaces the
// scattered inline notices. Info/success toasts auto-dismiss; errors stay
// until the SME dismisses them, so a failure is never missed.

export interface Toast {
  id: string;
  kind: "info" | "success" | "error";
  title: string;
  body?: string;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (toast.kind === "error") return;
    const t = setTimeout(() => onDismiss(toast.id), 6000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div className={`toast toast-${toast.kind}`} role="status">
      <button
        className="toast-x"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        ×
      </button>
      <div className="toast-title">{toast.title}</div>
      {toast.body && <div className="toast-body">{toast.body}</div>}
    </div>
  );
}

export default function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

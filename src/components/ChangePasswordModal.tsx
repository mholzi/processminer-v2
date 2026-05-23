"use client";

import { useState } from "react";

// Self-service password change. Opened from UserMenu. Posts to
// /api/auth/password which requires the current password.

export default function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setErr("New passwords don't match.");
      return;
    }
    if (next.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/password", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setErr(data.error || `HTTP ${r.status}`);
        return;
      }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Password change failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={busy ? undefined : onClose}>
      <form
        className="modal admin-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-title">Change password</div>
        {done ? (
          <>
            <p className="modal-text">
              Password updated. You&rsquo;ll stay signed in on this device.
            </p>
            <div className="modal-actions">
              <span className="modal-actions-gap" />
              <button type="button" className="act ai" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="modal-text">
              Enter your current password and the new one. The new password
              must be at least 8 characters.
            </p>
            <label className="login-field">
              <span>Current password</span>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoFocus
                disabled={busy}
              />
            </label>
            <label className="login-field">
              <span>New password</span>
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                disabled={busy}
              />
            </label>
            <label className="login-field">
              <span>Confirm new</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={busy}
              />
            </label>
            {err && <div className="modal-error">⚠ {err}</div>}
            <div className="modal-actions">
              <button type="button" className="act" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <span className="modal-actions-gap" />
              <button type="submit" className="act ai" disabled={busy}>
                {busy ? "Saving…" : "Update password"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

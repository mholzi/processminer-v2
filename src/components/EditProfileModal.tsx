"use client";

import { useState } from "react";
import type { User } from "@/lib/user";

// Edit-display-name-and-role modal opened from UserMenu. Patches
// /api/auth/profile and returns the updated user.

export default function EditProfileModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: (u: User) => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dirty =
    name.trim() !== user.name || role.trim() !== user.role;
  const ready = dirty && name.trim() && role.trim();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role: role.trim() }),
      });
      const data = (await r.json()) as { user?: User; error?: string };
      if (!r.ok || !data.user) {
        setErr(data.error || `HTTP ${r.status}`);
        return;
      }
      onSaved(data.user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed.");
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
        <div className="modal-title">Edit your profile</div>
        <p className="modal-text">
          Username (<b>@{user.username}</b>) and entitlements are managed by
          your administrator.
        </p>
        <label className="login-field">
          <span>Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={busy}
          />
        </label>
        <label className="login-field">
          <span>Role</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={busy}
          />
        </label>
        {err && <div className="modal-error">⚠ {err}</div>}
        <div className="modal-actions">
          <button type="button" className="act" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <span className="modal-actions-gap" />
          <button type="submit" className="act ai" disabled={!ready || busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

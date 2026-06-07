"use client";

import { useState } from "react";
import { initials, type User } from "@/lib/user";

// The signed-in-user profile dialog. Opened from the avatar chip — clicking the
// avatar shows this, it does NOT sign out. Sign-out is a deliberate button
// inside. Name / role / streaming preference are editable; edits are applied to
// the in-session user via onUpdateUser (the app stamps approvals with this
// name). Mirrors the profile dialog in ProcessDocScreen so the avatar behaves
// the same everywhere.

export default function UserProfileModal({
  user,
  onUpdateUser,
  onSignOut,
  onClose,
}: {
  user: User;
  onUpdateUser: (user: User) => void;
  onSignOut: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [streamReplies, setStreamReplies] = useState(user.streamReplies === true);

  const dirty =
    name.trim() !== "" &&
    role.trim() !== "" &&
    (name.trim() !== user.name ||
      role.trim() !== user.role ||
      streamReplies !== (user.streamReplies === true));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Signed-in user"
      >
        <div className="modal-title">Signed-in user</div>
        <div className="user-card">
          <span className="user-avatar">{initials(name.trim() || user.name)}</span>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
        <p className="modal-text">
          Approvals and edits are stamped with this name. Change it below, or
          sign out to switch user.
        </p>
        <label className="login-field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="login-field">
          <span>Role</span>
          <input value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <label className="pref-field">
          <input
            type="checkbox"
            checked={streamReplies}
            onChange={(e) => setStreamReplies(e.target.checked)}
          />
          <span>
            Stream replies as they are written
            <small>
              Show the assistant&apos;s answer word by word, instead of all at
              once when the turn finishes.
            </small>
          </span>
        </label>
        <div className="modal-actions">
          <button
            type="button"
            className="act act-signout"
            onClick={() => {
              onClose();
              onSignOut();
            }}
          >
            Sign out
          </button>
          <span className="modal-actions-gap" />
          <button type="button" className="act" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="act ai"
            disabled={!dirty}
            onClick={() => {
              onUpdateUser({
                ...user,
                name: name.trim(),
                role: role.trim(),
                streamReplies,
              });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { initials, type User } from "@/lib/user";
import Modal from "./Modal";

// The ONE signed-in-user profile dialog, used by every avatar in the app
// (welcome screen + process workspace). Opened from the avatar chip — it does
// NOT sign out; sign-out is a deliberate button inside. Name / role / streaming
// preference are editable; edits apply to the in-session user via onUpdateUser
// (the app stamps approvals with this name). Optionally renders a dark-mode
// toggle when the host passes `dark` + `onToggleTheme` (the workspace does;
// the welcome screen doesn't), so the two former copies are now one component.

export default function UserProfileModal({
  user,
  onUpdateUser,
  onSignOut,
  onClose,
  dark,
  onToggleTheme,
  themeIcon,
}: {
  user: User;
  onUpdateUser: (user: User) => void;
  onSignOut: () => void;
  onClose: () => void;
  /** When provided, show a dark-mode preference row wired to these. */
  dark?: boolean;
  onToggleTheme?: () => void;
  /** Optional sun/moon glyph for the dark-mode row. */
  themeIcon?: ReactNode;
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
    <Modal
      title="Signed-in user"
      onClose={onClose}
      actions={
        <>
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
        </>
      }
    >
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
        {onToggleTheme && (
          <label className="pref-field">
            <input type="checkbox" checked={dark === true} onChange={onToggleTheme} />
            <span>
              <span className="pref-field-row">
                Dark mode
                {themeIcon && (
                  <span className="pref-field-ico" aria-hidden>
                    {themeIcon}
                  </span>
                )}
              </span>
              <small>
                Switch to a darker palette. Applies immediately; no need to save.
              </small>
            </span>
          </label>
        )}
    </Modal>
  );
}

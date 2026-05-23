"use client";

import { useEffect, useRef, useState } from "react";
import { initials, type User } from "@/lib/user";
import ChangePasswordModal from "./ChangePasswordModal";
import EditProfileModal from "./EditProfileModal";

// The avatar popover — variant P-C from the profile shotgun. One click on
// the avatar, everything's there: identity, entitlement pills, dark mode +
// stream-replies toggles, edit name & role, change password, admin (if
// admin), sign out. Click outside or press Esc to dismiss.

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function setTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
}

export default function UserMenu({
  user,
  onUserUpdated,
  onEnterAdmin,
  onSignOut,
}: {
  user: User;
  /** Called after a self-service profile update succeeds, so callers can
   *  refresh their copy of the user (e.g. update the topbar name). */
  onUserUpdated: (u: User) => void;
  /** Provided only when the user is admin. */
  onEnterAdmin?: () => void;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setLocalTheme] = useState<Theme>("light");
  const [streamReplies, setStreamReplies] = useState<boolean>(
    user.streamReplies === true,
  );
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setLocalTheme(readTheme()), []);

  // Keep the local toggle state in sync with the user prop (e.g. after
  // editing the profile elsewhere).
  useEffect(() => {
    setStreamReplies(user.streamReplies === true);
  }, [user.streamReplies]);

  // Click outside + Esc to close.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setLocalTheme(next);
  }

  async function toggleStreamReplies() {
    const next = !streamReplies;
    setStreamReplies(next);
    try {
      const r = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamReplies: next }),
      });
      const data = (await r.json()) as { user?: User; error?: string };
      if (r.ok && data.user) onUserUpdated(data.user);
    } catch {
      // Revert the optimistic toggle on network failure.
      setStreamReplies(!next);
    }
  }

  return (
    <div className="umenu-root" ref={rootRef}>
      <button
        type="button"
        className="umenu-avatar"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`${user.name} · ${user.role}`}
      >
        {initials(user.name)}
      </button>

      {open && (
        <div className="umenu-pop" role="menu">
          <div className="umenu-id">
            <span className="umenu-big-av">{initials(user.name)}</span>
            <div className="umenu-id-text">
              <span className="umenu-name">{user.name}</span>
              <span className="umenu-role">{user.role}</span>
              <span className="umenu-handle">@{user.username}</span>
            </div>
          </div>

          <div className="umenu-meta">
            {(user.entitlements ?? ["pm", "am"]).includes("pm") && (
              <span className="umenu-badge umenu-pm">PM</span>
            )}
            {(user.entitlements ?? ["pm", "am"]).includes("am") && (
              <span className="umenu-badge umenu-am">AM</span>
            )}
            {user.isAdmin && (
              <span className="umenu-badge umenu-admin">Admin</span>
            )}
          </div>

          <div className="umenu-divider" />

          <div className="umenu-group">
            <button
              type="button"
              className="umenu-row"
              onClick={toggleTheme}
            >
              <span className="umenu-ico">{theme === "dark" ? "☀" : "☾"}</span>
              <span className="umenu-label">
                Dark mode
                <small>Theme across both modules</small>
              </span>
              <span className={`umenu-toggle${theme === "dark" ? " on" : ""}`} />
            </button>
            <button
              type="button"
              className="umenu-row"
              onClick={toggleStreamReplies}
            >
              <span className="umenu-ico">⤳</span>
              <span className="umenu-label">
                Stream assistant replies
                <small>Word by word as they&rsquo;re written</small>
              </span>
              <span className={`umenu-toggle${streamReplies ? " on" : ""}`} />
            </button>
          </div>

          <div className="umenu-divider" />

          <div className="umenu-group">
            <button
              type="button"
              className="umenu-row"
              onClick={() => {
                setOpen(false);
                setEditOpen(true);
              }}
            >
              <span className="umenu-ico">✎</span>
              <span className="umenu-label">Edit name &amp; role</span>
              <span className="umenu-arrow">→</span>
            </button>
            <button
              type="button"
              className="umenu-row"
              onClick={() => {
                setOpen(false);
                setPasswordOpen(true);
              }}
            >
              <span className="umenu-ico">⌘</span>
              <span className="umenu-label">Change password</span>
              <span className="umenu-arrow">→</span>
            </button>
            {onEnterAdmin && (
              <button
                type="button"
                className="umenu-row"
                onClick={() => {
                  setOpen(false);
                  onEnterAdmin();
                }}
              >
                <span className="umenu-ico">⚙</span>
                <span className="umenu-label">
                  {user.isAdmin ? "Users & access" : "Process access"}
                </span>
                <span className="umenu-arrow">→</span>
              </button>
            )}
          </div>

          <div className="umenu-divider" />

          <div className="umenu-group">
            <button
              type="button"
              className="umenu-row danger"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              <span className="umenu-ico danger">↩</span>
              <span className="umenu-label">Sign out</span>
            </button>
          </div>
        </div>
      )}

      {passwordOpen && (
        <ChangePasswordModal onClose={() => setPasswordOpen(false)} />
      )}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSaved={(u) => {
            onUserUpdated(u);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

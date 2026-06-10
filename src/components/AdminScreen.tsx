"use client";

import { useEffect, useState } from "react";
import type { User, Entitlement } from "@/lib/user";
import FeatureTogglesPanel from "@/components/FeatureTogglesPanel";
import UsagePanel from "@/components/UsagePanel";
import WhatsNewPanel from "@/components/WhatsNewPanel";
import FeedbackScreen from "@/components/FeedbackScreen";
import Modal from "@/components/Modal";
import type { FeedbackItem } from "@/lib/feedback";
import SkillsEditorPanel from "@/components/SkillsEditorPanel";

// Admin screen — lists every user and lets an admin create, edit, reset
// password, or delete. Only reachable when user.isAdmin === true; the
// /api/admin/* routes also re-check authorization on the server.

type AdminUser = User & {
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  createdBy?: string;
};

const ALL_ENTS: Entitlement[] = ["pm", "am"];

export default function AdminScreen({
  user,
  feedback,
  onReturnToSplash,
}: {
  user: User;
  feedback: FeedbackItem[];
  onReturnToSplash: () => void;
}) {
  const [tab, setTab] = useState<
    "users" | "features" | "usage" | "whatsnew" | "feedback" | "skills"
  >("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const r = await fetch("/api/admin/users", { credentials: "same-origin" });
      if (!r.ok) {
        const data = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${r.status}`);
      }
      const data = (await r.json()) as { users: AdminUser[] };
      setUsers(data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function patchUser(username: string, patch: Partial<AdminUser>) {
    setError(null);
    try {
      const r = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await r.json()) as { user?: AdminUser; error?: string };
      if (!r.ok) {
        setError(data.error || `HTTP ${r.status}`);
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.username === username && data.user ? data.user : u)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    }
  }

  async function deleteUserAction(username: string) {
    if (!confirm(`Delete user '${username}'? This cannot be undone.`)) return;
    setError(null);
    try {
      const r = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setError(data.error || `HTTP ${r.status}`);
        return;
      }
      setUsers((prev) => prev.filter((u) => u.username !== username));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  return (
    <div className="admin-root">
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-back"
          onClick={onReturnToSplash}
          aria-label="Back to welcome"
        >
          ← Welcome
        </button>
        <span className="admin-wordmark">PROCESSMINER</span>
        <span className="admin-sub">platform · admin</span>
        <span style={{ flex: 1 }} />
        <span className="admin-user-mini">
          Signed in as <b>{user.name}</b>
        </span>
      </header>

      <nav className="admin-tabs">
        <button
          type="button"
          className={`admin-tab${tab === "users" ? " admin-tab-on" : ""}`}
          onClick={() => setTab("users")}
        >
          Users &amp; access
        </button>
        <button
          type="button"
          className={`admin-tab${tab === "features" ? " admin-tab-on" : ""}`}
          onClick={() => setTab("features")}
        >
          Feature toggles
        </button>
        <button
          type="button"
          className={`admin-tab${tab === "usage" ? " admin-tab-on" : ""}`}
          onClick={() => setTab("usage")}
        >
          Token usage
        </button>
        <button
          type="button"
          className={`admin-tab${tab === "whatsnew" ? " admin-tab-on" : ""}`}
          onClick={() => setTab("whatsnew")}
        >
          What&rsquo;s new
        </button>
        <button
          type="button"
          className={`admin-tab${tab === "feedback" ? " admin-tab-on" : ""}`}
          onClick={() => setTab("feedback")}
        >
          Feedback{feedback.length > 0 ? ` (${feedback.length})` : ""}
        </button>
        <button
          type="button"
          className={`admin-tab${tab === "skills" ? " admin-tab-on" : ""}`}
          onClick={() => setTab("skills")}
        >
          Agent Skills
        </button>
      </nav>

      {tab === "features" && <FeatureTogglesPanel />}
      {tab === "whatsnew" && <WhatsNewPanel />}

      {tab === "usage" && <UsagePanel />}

      {tab === "feedback" && (
        <FeedbackScreen embedded feedback={feedback} user={user} />
      )}
      {tab === "skills" && <SkillsEditorPanel />}

      {tab === "users" && (
      <>
      <main className="admin-page">
        <header className="admin-page-head">
          <div>
            <h1>Users &amp; access</h1>
            <p>
              Create accounts, set entitlements, and reset passwords. There is
              no self-service password reset — this page is how locked-out
              users get back in.
            </p>
          </div>
          <button
            type="button"
            className="admin-newbtn"
            onClick={() => setCreating(true)}
          >
            + New user
          </button>
        </header>

        {error && <div className="admin-error">⚠ {error}</div>}

        {loading ? (
          <div className="admin-loading">Loading users…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Entitlements</th>
                <th>Admin</th>
                <th>Last login</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u.username}
                  u={u}
                  self={u.username === user.username}
                  onPatch={patchUser}
                  onDelete={() => deleteUserAction(u.username)}
                  onReset={() => setResetFor(u.username)}
                />
              ))}
            </tbody>
          </table>
        )}
      </main>

      {creating && (
        <CreateUserDialog
          onClose={() => setCreating(false)}
          onCreated={(u) => {
            setUsers((prev) => [...prev, u]);
            setCreating(false);
          }}
        />
      )}

      {resetFor && (
        <ResetPasswordDialog
          username={resetFor}
          onClose={() => setResetFor(null)}
        />
      )}
      </>
      )}
    </div>
  );
}

function UserRow({
  u,
  self,
  onPatch,
  onDelete,
  onReset,
}: {
  u: AdminUser;
  self: boolean;
  onPatch: (username: string, patch: Partial<AdminUser>) => void;
  onDelete: () => void;
  onReset: () => void;
}) {
  const entsLabel = !u.entitlements
    ? "PM + AM"
    : u.entitlements.length === 0
      ? "—"
      : u.entitlements
          .map((e) => (e === "pm" ? "PM" : "AM"))
          .join(" + ");

  function toggleEnt(e: Entitlement) {
    const current = u.entitlements ?? ALL_ENTS;
    const next = current.includes(e)
      ? current.filter((x) => x !== e)
      : [...current, e];
    onPatch(u.username, { entitlements: next });
  }

  return (
    <tr>
      <td className="admin-cell-user">
        <span className="admin-mono">{u.username}</span>
        {self && <span className="admin-self">you</span>}
      </td>
      <td>{u.name}</td>
      <td className="admin-cell-role">{u.role}</td>
      <td>
        <div className="admin-ents">
          <label className="admin-ent">
            <input
              type="checkbox"
              checked={(u.entitlements ?? ALL_ENTS).includes("pm")}
              onChange={() => toggleEnt("pm")}
            />
            PM
          </label>
          <label className="admin-ent">
            <input
              type="checkbox"
              checked={(u.entitlements ?? ALL_ENTS).includes("am")}
              onChange={() => toggleEnt("am")}
            />
            AM
          </label>
          <span className="admin-ent-label">{entsLabel}</span>
        </div>
      </td>
      <td>
        <label className="admin-ent">
          <input
            type="checkbox"
            checked={u.isAdmin === true}
            disabled={self}
            onChange={(e) =>
              onPatch(u.username, { isAdmin: e.target.checked })
            }
            title={self ? "You can't demote yourself" : ""}
          />
        </label>
      </td>
      <td className="admin-cell-when">{relative(u.lastLoginAt) ?? "never"}</td>
      <td className="admin-cell-actions">
        <button type="button" className="admin-link" onClick={onReset}>
          Reset password
        </button>
        {!self && (
          <button
            type="button"
            className="admin-link admin-danger"
            onClick={onDelete}
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}

function CreateUserDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (u: AdminUser) => void;
}) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [ents, setEnts] = useState<Entitlement[]>(["pm"]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username.trim())) {
      setErr("Please enter a valid email address (e.g., user@domain.com).");
      setBusy(false);
      return;
    }
    try {
      const r = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, role, password, isAdmin, entitlements: ents }),
      });
      const data = (await r.json()) as { user?: AdminUser; error?: string };
      if (!r.ok || !data.user) {
        setErr(data.error || "Failed to create user.");
        return;
      }
      onCreated(data.user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create user.");
    } finally {
      setBusy(false);
    }
  }

  function toggleEnt(e: Entitlement) {
    setEnts((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  }

  return (
    <Modal
      title="New user"
      className="admin-modal"
      onClose={onClose}
      closeOnOverlay={!busy}
    >
      <form onSubmit={submit}>
        <label className="login-field">
          <span>Username (Email)</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. sarah.kowalski@bank.com"
            autoFocus
            disabled={busy}
          />
        </label>
        <label className="login-field">
          <span>Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Kowalski"
            disabled={busy}
          />
        </label>
        <label className="login-field">
          <span>Role</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Subject-Matter Expert"
            disabled={busy}
          />
        </label>
        <label className="login-field">
          <span>Initial password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            disabled={busy}
          />
        </label>
        <div className="admin-modal-row">
          <span className="admin-modal-label">Entitlements</span>
          <label className="admin-ent">
            <input
              type="checkbox"
              checked={ents.includes("pm")}
              onChange={() => toggleEnt("pm")}
              disabled={busy}
            />
            Processminer
          </label>
          <label className="admin-ent">
            <input
              type="checkbox"
              checked={ents.includes("am")}
              onChange={() => toggleEnt("am")}
              disabled={busy}
            />
            ArchitectMiner
          </label>
        </div>
        <div className="admin-modal-row">
          <label className="admin-ent">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              disabled={busy}
            />
            Admin (can manage other users)
          </label>
        </div>
        {err && <div className="modal-error">⚠ {err}</div>}
        <div className="modal-actions">
          <button type="button" className="act" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <span className="modal-actions-gap" />
          <button type="submit" className="act ai" disabled={busy}>
            {busy ? "Creating…" : "Create user"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordDialog({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) {
      setErr("Passwords don't match.");
      return;
    }
    if (pw.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(
        `/api/admin/users/${encodeURIComponent(username)}/password`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        },
      );
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setErr(data.error || "Reset failed.");
        return;
      }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Reset failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={`Reset password for ${username}`}
      className="admin-modal"
      onClose={onClose}
      closeOnOverlay={!busy}
    >
      <form onSubmit={submit}>
        {done ? (
          <>
            <p className="modal-text">
              Password reset. Share the new password with {username} through a
              secure channel — it isn&rsquo;t shown again here.
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
              Set a new password for the user. They will be able to sign in
              with it immediately.
            </p>
            <label className="login-field">
              <span>New password</span>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoFocus
                disabled={busy}
              />
            </label>
            <label className="login-field">
              <span>Confirm</span>
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
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
                {busy ? "Resetting…" : "Reset password"}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

function relative(iso: string | undefined): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}

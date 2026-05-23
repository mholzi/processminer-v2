"use client";

import { useEffect, useState } from "react";
import type { User, Entitlement } from "@/lib/user";

// Admin screen — two tabs:
//   Users:     admin-only (manage accounts, reset passwords, set
//              entitlements / admin flag).
//   Processes: admin sees all; owners see only the processes they own.
//              Admins reassign ownership; owners + admins manage grantees.
// Server routes re-check authorization, this UI just keeps things out of
// view for users who can't perform the action.

type AdminUser = User & {
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  createdBy?: string;
};

type AccessRow = {
  slug: string;
  title: string;
  owner: string;
  grantees: string[];
  updatedAt: string;
  updatedBy: string;
};

const ALL_ENTS: Entitlement[] = ["pm", "am"];

type Tab = "users" | "processes";

export default function AdminScreen({
  user,
  onReturnToSplash,
}: {
  user: User;
  onReturnToSplash: () => void;
}) {
  // Non-admins can't see the Users tab at all — drop straight into Processes.
  const [tab, setTab] = useState<Tab>(user.isAdmin ? "users" : "processes");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [processes, setProcesses] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [grantingSlug, setGrantingSlug] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      // Fetch users only when the caller can see them (admin). Owners
      // still need the list for grant pickers, but a non-admin gets 403
      // on /api/admin/users so we use the same /api/processes call
      // — server returns just the row metadata, and grant pickers can
      // use a different lightweight endpoint (or be free-text). For now,
      // admins get full user list, owners get free-text usernames.
      if (user.isAdmin) {
        const r = await fetch("/api/admin/users", { credentials: "same-origin" });
        if (!r.ok) {
          const data = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || `HTTP ${r.status}`);
        }
        const data = (await r.json()) as { users: AdminUser[] };
        setUsers(data.users);
      }
      const rp = await fetch("/api/processes", { credentials: "same-origin" });
      if (!rp.ok) {
        const data = (await rp.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${rp.status}`);
      }
      const dataP = (await rp.json()) as { processes: AccessRow[] };
      setProcesses(dataP.processes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // ----- process-access mutations -----
  async function setProcessOwner(slug: string, username: string) {
    setError(null);
    try {
      const r = await fetch(
        `/api/processes/${encodeURIComponent(slug)}/owner`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        },
      );
      const data = (await r.json()) as { process?: AccessRow; error?: string };
      if (!r.ok || !data.process) {
        setError(data.error || `HTTP ${r.status}`);
        return;
      }
      setProcesses((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, ...data.process!, title: p.title } : p,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to set owner.");
    }
  }

  async function grantAccess(slug: string, username: string) {
    setError(null);
    try {
      const r = await fetch(
        `/api/processes/${encodeURIComponent(slug)}/grant`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        },
      );
      const data = (await r.json()) as { process?: AccessRow; error?: string };
      if (!r.ok || !data.process) {
        setError(data.error || `HTTP ${r.status}`);
        return;
      }
      setProcesses((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, ...data.process!, title: p.title } : p,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to grant access.");
    }
  }

  async function revokeAccess(slug: string, username: string) {
    setError(null);
    try {
      const r = await fetch(
        `/api/processes/${encodeURIComponent(slug)}/grant/${encodeURIComponent(username)}`,
        { method: "DELETE", credentials: "same-origin" },
      );
      const data = (await r.json()) as { process?: AccessRow; error?: string };
      if (!r.ok || !data.process) {
        setError(data.error || `HTTP ${r.status}`);
        return;
      }
      setProcesses((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, ...data.process!, title: p.title } : p,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke.");
    }
  }

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

      <main className="admin-page">
        <header className="admin-page-head">
          <div>
            <h1>{user.isAdmin ? "Users & access" : "Process access"}</h1>
            <p>
              {user.isAdmin
                ? "Create accounts, set entitlements, reset passwords, and decide who owns or can open each process."
                : "Manage who else can open processes you own. Owners + admins grant access; there is no self-service request flow yet."}
            </p>
          </div>
          {tab === "users" && user.isAdmin && (
            <button
              type="button"
              className="admin-newbtn"
              onClick={() => setCreating(true)}
            >
              + New user
            </button>
          )}
        </header>

        {user.isAdmin && (
          <div className="admin-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "users"}
              className={`admin-tab${tab === "users" ? " on" : ""}`}
              onClick={() => setTab("users")}
            >
              Users <span className="admin-tab-num">{users.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={tab === "processes"}
              className={`admin-tab${tab === "processes" ? " on" : ""}`}
              onClick={() => setTab("processes")}
            >
              Processes <span className="admin-tab-num">{processes.length}</span>
            </button>
          </div>
        )}

        {error && <div className="admin-error">⚠ {error}</div>}

        {loading ? (
          <div className="admin-loading">Loading…</div>
        ) : tab === "users" && user.isAdmin ? (
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
        ) : (
          <ProcessesTab
            user={user}
            processes={processes}
            users={users}
            onSetOwner={setProcessOwner}
            onGrant={grantAccess}
            onRevoke={revokeAccess}
            grantingSlug={grantingSlug}
            setGrantingSlug={setGrantingSlug}
          />
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
    </div>
  );
}

function ProcessesTab({
  user,
  processes,
  users,
  onSetOwner,
  onGrant,
  onRevoke,
  grantingSlug,
  setGrantingSlug,
}: {
  user: User;
  processes: AccessRow[];
  users: AdminUser[]; // empty for non-admins
  onSetOwner: (slug: string, username: string) => void;
  onGrant: (slug: string, username: string) => void;
  onRevoke: (slug: string, username: string) => void;
  grantingSlug: string | null;
  setGrantingSlug: (slug: string | null) => void;
}) {
  if (processes.length === 0) {
    return (
      <div className="admin-empty">
        {user.isAdmin
          ? "No processes tracked yet."
          : "You don't own any processes. An admin can assign one to you."}
      </div>
    );
  }
  return (
    <>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Process</th>
            <th>Owner</th>
            <th>Grantees</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <ProcessRow
              key={p.slug}
              p={p}
              isAdmin={user.isAdmin === true}
              users={users}
              onSetOwner={(uname) => onSetOwner(p.slug, uname)}
              onGrant={() => setGrantingSlug(p.slug)}
              onRevoke={(uname) => onRevoke(p.slug, uname)}
            />
          ))}
        </tbody>
      </table>
      {grantingSlug && (
        <GrantDialog
          slug={grantingSlug}
          processTitle={
            processes.find((p) => p.slug === grantingSlug)?.title ?? grantingSlug
          }
          currentGrantees={
            processes.find((p) => p.slug === grantingSlug)?.grantees ?? []
          }
          owner={
            processes.find((p) => p.slug === grantingSlug)?.owner ?? ""
          }
          users={users}
          onClose={() => setGrantingSlug(null)}
          onGrant={(uname) => {
            onGrant(grantingSlug, uname);
            setGrantingSlug(null);
          }}
        />
      )}
    </>
  );
}

function ProcessRow({
  p,
  isAdmin,
  users,
  onSetOwner,
  onGrant,
  onRevoke,
}: {
  p: AccessRow;
  isAdmin: boolean;
  users: AdminUser[];
  onSetOwner: (username: string) => void;
  onRevoke: (username: string) => void;
  onGrant: () => void;
}) {
  return (
    <tr>
      <td>
        <span className="admin-mono">{p.slug}</span>
        <div className="admin-cell-role">{p.title}</div>
      </td>
      <td>
        {isAdmin && users.length > 0 ? (
          <select
            className="admin-select"
            value={p.owner}
            onChange={(e) => onSetOwner(e.target.value)}
          >
            {!p.owner && <option value="">— unassigned —</option>}
            {users.map((u) => (
              <option key={u.username} value={u.username}>
                {u.username} · {u.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="admin-mono">{p.owner || "—"}</span>
        )}
      </td>
      <td>
        {p.grantees.length === 0 ? (
          <span style={{ color: "var(--muted)", fontSize: "var(--text-xs)" }}>
            none
          </span>
        ) : (
          <span className="admin-grantees">
            {p.grantees.map((g) => (
              <span key={g} className="admin-grantee-chip">
                <span className="admin-mono">{g}</span>
                <button
                  type="button"
                  className="admin-grantee-x"
                  onClick={() => onRevoke(g)}
                  aria-label={`Revoke ${g}`}
                  title={`Revoke ${g}'s access`}
                >
                  ✕
                </button>
              </span>
            ))}
          </span>
        )}
      </td>
      <td className="admin-cell-actions">
        <button type="button" className="admin-link" onClick={onGrant}>
          + Grant access
        </button>
      </td>
    </tr>
  );
}

function GrantDialog({
  slug,
  processTitle,
  currentGrantees,
  owner,
  users,
  onClose,
  onGrant,
}: {
  slug: string;
  processTitle: string;
  currentGrantees: string[];
  owner: string;
  users: AdminUser[];
  onClose: () => void;
  onGrant: (username: string) => void;
}) {
  const [picked, setPicked] = useState("");
  const [typed, setTyped] = useState("");
  // For admins we know the user list and offer a picker. For owners we
  // don't (server returns just the access metadata) — they type a username.
  const exclude = new Set([owner, ...currentGrantees]);
  const choices = users.filter((u) => !exclude.has(u.username));
  const value = picked || typed.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal admin-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (value) onGrant(value);
        }}
      >
        <div className="modal-title">Grant access · {processTitle}</div>
        <p className="modal-text">
          Pick or type a username. The user will see this process the next
          time they reload — they need to have the <b>PM</b> module
          entitlement separately.
        </p>
        {choices.length > 0 ? (
          <label className="login-field">
            <span>User</span>
            <select
              className="admin-select"
              value={picked}
              onChange={(e) => {
                setPicked(e.target.value);
                setTyped("");
              }}
            >
              <option value="">— choose —</option>
              {choices.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username} · {u.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="login-field">
            <span>Username</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="e.g. s.kowalski"
              autoFocus
            />
          </label>
        )}
        <div className="modal-actions">
          <button type="button" className="act" onClick={onClose}>
            Cancel
          </button>
          <span className="modal-actions-gap" />
          <button type="submit" className="act ai" disabled={!value}>
            Grant
          </button>
        </div>
      </form>
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
    <div className="modal-overlay" onClick={busy ? undefined : onClose}>
      <form
        className="modal admin-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-title">New user</div>
        <label className="login-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. s.kowalski"
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
    </div>
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
    <div className="modal-overlay" onClick={busy ? undefined : onClose}>
      <form
        className="modal admin-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-title">Reset password for {username}</div>
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
    </div>
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

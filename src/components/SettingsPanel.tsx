"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Person {
  username: string;
  name: string;
}
interface AccessState {
  governed: boolean;
  owner: Person | null;
  grants: Person[];
}

// Per-process Settings — process facts, per-process Access control (R16), and a
// Danger Zone to delete the process. Access set-owner/ungovern is admin-only;
// grant/revoke is owner-or-admin; delete is admin-only (all enforced server-side).
export default function SettingsPanel({
  slug,
  title,
  id,
  elementCount,
  sourceCount,
  currentUser,
  onDeleted,
}: {
  slug: string;
  title: string;
  id: string;
  elementCount: number;
  sourceCount: number;
  currentUser: { username: string; isAdmin?: boolean };
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [access, setAccess] = useState<AccessState | null>(null);
  const [roster, setRoster] = useState<Person[]>([]);
  const [pick, setPick] = useState("");
  const [accessBusy, setAccessBusy] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/processes/${encodeURIComponent(slug)}/access`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((a) => live && setAccess(a))
      .catch(() => {});
    fetch(`/api/users/roster`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => live && setRoster(d.users ?? []))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [slug]);

  const isAdmin = !!currentUser.isAdmin;
  const isOwner = access?.owner?.username === currentUser.username;
  const canGrant = isAdmin || isOwner;

  async function accessAction(action: string, username?: string) {
    setAccessBusy(true);
    try {
      await fetch(`/api/processes/${encodeURIComponent(slug)}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action, username }),
      });
      const fresh = await fetch(`/api/processes/${encodeURIComponent(slug)}/access`, {
        credentials: "same-origin",
      }).then((r) => r.json());
      setAccess(fresh);
      setPick("");
      router.refresh(); // the process list re-filters by access
    } finally {
      setAccessBusy(false);
    }
  }

  // Users not already the owner or a grantee — candidates for sharing / owning.
  const taken = new Set([
    access?.owner?.username,
    ...(access?.grants ?? []).map((g) => g.username),
  ]);
  const candidates = roster.filter((u) => !taken.has(u.username));

  const armed = confirmText.trim() === slug && !busy;

  async function handleDelete() {
    if (!armed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/processes/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not delete the process.");
        setBusy(false);
        return;
      }
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div className="settings-panel">
      <div className="canvas-head">
        <h1>Settings</h1>
      </div>

      <dl className="settings-facts">
        <dt>Process</dt>
        <dd>{title}</dd>
        <dt>ID</dt>
        <dd className="mono">{id}</dd>
        <dt>Slug</dt>
        <dd className="mono">{slug}</dd>
        <dt>Elements</dt>
        <dd>{elementCount}</dd>
        <dt>Source documents</dt>
        <dd>{sourceCount}</dd>
      </dl>

      {/* Access (R16) */}
      <section className="settings-access">
        <h2>Access</h2>
        {!access ? (
          <p className="settings-dim">Loading…</p>
        ) : !access.governed ? (
          <>
            <p className="settings-dim">
              Open — every signed-in user can see this process.
            </p>
            {isAdmin && (
              <div className="access-row">
                <select
                  value={pick}
                  onChange={(e) => setPick(e.target.value)}
                  disabled={accessBusy}
                >
                  <option value="">Restrict to an owner…</option>
                  {roster.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="access-btn"
                  disabled={!pick || accessBusy}
                  onClick={() => accessAction("set-owner", pick)}
                >
                  Restrict
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <p>
              Owner: <b>{access.owner?.name}</b>
            </p>
            <p className="settings-dim">
              Only the owner, the people below, and admins can see this process.
            </p>
            <ul className="access-grants">
              {access.grants.length === 0 && (
                <li className="settings-dim">Not shared with anyone yet.</li>
              )}
              {access.grants.map((g) => (
                <li key={g.username}>
                  {g.name}
                  {canGrant && (
                    <button
                      type="button"
                      className="access-revoke"
                      disabled={accessBusy}
                      onClick={() => accessAction("revoke", g.username)}
                    >
                      remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {canGrant && candidates.length > 0 && (
              <div className="access-row">
                <select
                  value={pick}
                  onChange={(e) => setPick(e.target.value)}
                  disabled={accessBusy}
                >
                  <option value="">Share with…</option>
                  {candidates.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="access-btn"
                  disabled={!pick || accessBusy}
                  onClick={() => accessAction("grant", pick)}
                >
                  Share
                </button>
              </div>
            )}
            {isAdmin && (
              <button
                type="button"
                className="access-open"
                disabled={accessBusy}
                onClick={() => accessAction("ungovern")}
              >
                Make open to everyone
              </button>
            )}
          </>
        )}
      </section>

      <section className="danger-zone">
        <h2>Danger zone</h2>
        <p>
          Permanently delete this process — its document, its{" "}
          {sourceCount} source document{sourceCount === 1 ? "" : "s"}, and its
          runtime state. This cannot be undone.
        </p>
        <label className="danger-confirm">
          Type the slug <code>{slug}</code> to confirm:
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={slug}
            spellCheck={false}
            autoComplete="off"
            disabled={busy}
          />
        </label>
        {error && <p className="danger-error">{error}</p>}
        <button
          type="button"
          className="danger-btn"
          onClick={handleDelete}
          disabled={!armed}
        >
          {busy ? "Deleting…" : "Delete process"}
        </button>
      </section>
    </div>
  );
}

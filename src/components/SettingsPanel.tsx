"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

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
  const [accessError, setAccessError] = useState<string | null>(null);
  // A pending access change awaiting confirmation (widening/removing access is
  // not a one-click action in a regulated tool — review R4).
  const [pendingAccess, setPendingAccess] = useState<{
    action: string;
    username?: string;
    title: string;
    body: ReactNode;
    confirmLabel: string;
  } | null>(null);

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
    setAccessError(null);
    try {
      const res = await fetch(`/api/processes/${encodeURIComponent(slug)}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action, username }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setAccessError(data.error || `Couldn't update access (HTTP ${res.status}).`);
        return;
      }
      const fresh = await fetch(`/api/processes/${encodeURIComponent(slug)}/access`, {
        credentials: "same-origin",
      }).then((r) => r.json());
      setAccess(fresh);
      setPick("");
      router.refresh(); // the process list re-filters by access
    } catch (e) {
      setAccessError(e instanceof Error ? e.message : "Couldn't update access.");
    } finally {
      setAccessBusy(false);
    }
  }

  // Run a confirmed pending action, then close the dialog.
  async function runPending() {
    if (!pendingAccess) return;
    const { action, username } = pendingAccess;
    setPendingAccess(null);
    await accessAction(action, username);
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
                      onClick={() =>
                        setPendingAccess({
                          action: "revoke",
                          username: g.username,
                          title: "Remove access?",
                          body: (
                            <>
                              <b>{g.name}</b> will no longer be able to open this
                              process.
                            </>
                          ),
                          confirmLabel: "Remove",
                        })
                      }
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
                onClick={() =>
                  setPendingAccess({
                    action: "ungovern",
                    title: "Open this process to everyone?",
                    body: (
                      <>
                        Every signed-in user will be able to view{" "}
                        <b>{title}</b>. You can restrict it again afterwards.
                      </>
                    ),
                    confirmLabel: "Open to everyone",
                  })
                }
              >
                Make open to everyone
              </button>
            )}
          </>
        )}
        {accessError && (
          <div className="settings-error" role="alert">
            ⚠ {accessError}
          </div>
        )}
      </section>

      {pendingAccess && (
        <Modal
          title={pendingAccess.title}
          onClose={() => setPendingAccess(null)}
          actions={
            <>
              <button
                type="button"
                className="act"
                onClick={() => setPendingAccess(null)}
              >
                Cancel
              </button>
              <button type="button" className="act ai" onClick={runPending}>
                {pendingAccess.confirmLabel}
              </button>
            </>
          }
        >
          <p className="modal-text">{pendingAccess.body}</p>
        </Modal>
      )}

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

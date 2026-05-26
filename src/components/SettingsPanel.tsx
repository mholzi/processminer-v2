"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDisplayName } from "@/lib/user-roster-client";

// Per-process settings — info, access, danger zone. Lives at the bottom of
// the section-nav under the ⚙ node so destructive ops never sit next to
// authoring flow. The Settings node is app-only (`__settings`), not part of
// the wiki schema, so it never appears as a section in element IDs.
//
// What this panel owns:
//   - read-only display of title / slug / ID prefix / sources
//   - access summary (owner + grantees) for transparency
//   - Danger zone with slug-typed delete confirmation
//
// Rename / Change-owner / Manage-grantees buttons are stubbed for now; the
// space exists because future settings will land here without retrofitting.

type Meta = {
  owner: string;
  grantees: string[];
  canManage: boolean;
};

type Roster = Record<string, string>; // username → display name

export default function SettingsPanel({
  slug,
  title,
  idPrefix,
  sources,
  onDeleted,
}: {
  slug: string;
  title: string;
  idPrefix: string;
  sources: string[];
  /** Called after a successful delete. The caller is responsible for moving
   *  the user off the now-defunct process — without this, the canvas would
   *  fall back to docs[0] and render a confused mix of slugs and titles. */
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roster, setRoster] = useState<Roster>({});
  const [granteeError, setGranteeError] = useState<string | null>(null);
  const [granteeBusy, setGranteeBusy] = useState(false);

  // Pull the access metadata and the user roster in parallel. Roster powers
  // the "Add user" picker (username → display-name lookup); meta drives the
  // grantee chip list and the canManage gate.
  function refreshMeta() {
    return fetch(`/api/processes/${encodeURIComponent(slug)}`, {
      credentials: "same-origin",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { owner?: string; grantees?: string[]; canManage?: boolean } | null) => {
        if (!j) return;
        setMeta({
          owner: j.owner ?? "",
          grantees: j.grantees ?? [],
          canManage: j.canManage === true,
        });
      });
  }

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(`/api/processes/${encodeURIComponent(slug)}`, {
        credentials: "same-origin",
      }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/users/roster", { credentials: "same-origin" }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([m, r]) => {
        if (!alive) return;
        const mJson = m as
          | { owner?: string; grantees?: string[]; canManage?: boolean }
          | null;
        if (mJson) {
          setMeta({
            owner: mJson.owner ?? "",
            grantees: mJson.grantees ?? [],
            canManage: mJson.canManage === true,
          });
        }
        const rJson = r as { roster?: Roster } | null;
        if (rJson?.roster) setRoster(rJson.roster);
      })
      .catch(() => {
        /* swallow — panel still renders without access metadata */
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  async function addGrantee(username: string) {
    const u = username.trim();
    if (!u || granteeBusy) return;
    setGranteeError(null);
    setGranteeBusy(true);
    try {
      const res = await fetch(
        `/api/processes/${encodeURIComponent(slug)}/grant`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u }),
        },
      );
      if (!res.ok) {
        let msg = "Could not add grantee.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* fall back */
        }
        setGranteeError(msg);
        return;
      }
      await refreshMeta();
    } finally {
      setGranteeBusy(false);
    }
  }

  async function removeGrantee(username: string) {
    if (granteeBusy) return;
    setGranteeError(null);
    setGranteeBusy(true);
    try {
      const res = await fetch(
        `/api/processes/${encodeURIComponent(slug)}/grant/${encodeURIComponent(
          username,
        )}`,
        { method: "DELETE", credentials: "same-origin" },
      );
      if (!res.ok) {
        let msg = "Could not revoke access.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* fall back */
        }
        setGranteeError(msg);
        return;
      }
      await refreshMeta();
    } finally {
      setGranteeBusy(false);
    }
  }

  return (
    <>
      <div className="canvas-head">
        <h1>Settings</h1>
        <div className="sub">
          Per-process info, access, and destructive operations.
        </div>
      </div>

      <section className="settings-block">
        <div className="settings-block-head">Process info</div>
        <SettingsRow label="Title" value={title} />
        <SettingsRow label="Slug" value={slug} mono />
        <SettingsRow label="ID prefix" value={idPrefix} mono note="locked" />
        {sources.length > 0 && (
          <SettingsRow
            label="Sources"
            value={sources.join(", ")}
            mono
          />
        )}
      </section>

      <section className="settings-block">
        <div className="settings-block-head">Access</div>
        <SettingsRow
          label="Owner"
          value={meta?.owner ? <DisplayUser username={meta.owner} /> : "—"}
        />
        <SettingsRow
          label="Grantees"
          value={
            !meta || meta.grantees.length === 0 ? (
              <span style={{ color: "var(--ink-muted, #6b7280)" }}>
                — none —
              </span>
            ) : (
              <span className="settings-grantee-list">
                {meta.grantees.map((g) => (
                  <span key={g} className="settings-grantee-chip">
                    <DisplayUser username={g} />
                    {meta?.canManage && (
                      <button
                        type="button"
                        className="settings-grantee-x"
                        onClick={() => removeGrantee(g)}
                        disabled={granteeBusy}
                        title={`Revoke access for ${roster[g] ?? g}`}
                        aria-label={`Revoke access for ${roster[g] ?? g}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </span>
            )
          }
        />
        {meta?.canManage && (
          <div className="settings-grantee-add">
            <AddGranteeRow
              roster={roster}
              owner={meta.owner}
              grantees={meta.grantees}
              busy={granteeBusy}
              onAdd={addGrantee}
            />
            {granteeError && (
              <div className="settings-grantee-err" role="alert">
                {granteeError}
              </div>
            )}
          </div>
        )}
      </section>

      {meta?.canManage && (
        <section className="settings-danger">
          <div className="settings-danger-head">⚠ Danger zone</div>
          <div className="settings-danger-row">
            <div>
              <strong>Delete this process</strong>
              <p>
                Permanently removes the wiki, sources, notes, lint reports,
                and access settings. Cannot be undone — `git` is the only
                recovery path.
              </p>
            </div>
            <button
              type="button"
              className="settings-danger-btn"
              onClick={() => setConfirmOpen(true)}
            >
              Delete…
            </button>
          </div>
        </section>
      )}

      {confirmOpen && (
        <DeleteConfirmModal
          slug={slug}
          title={title}
          onCancel={() => setConfirmOpen(false)}
          onDeleted={() => {
            setConfirmOpen(false);
            if (onDeleted) {
              onDeleted();
            } else {
              router.push("/");
              router.refresh();
            }
          }}
        />
      )}
    </>
  );
}

function AddGranteeRow({
  roster,
  owner,
  grantees,
  busy,
  onAdd,
}: {
  roster: Roster;
  owner: string;
  grantees: string[];
  busy: boolean;
  onAdd: (username: string) => void;
}) {
  const [picked, setPicked] = useState("");
  // Available = every roster user who isn't the owner and isn't already a
  // grantee. Sorted by display name for a stable, scannable picker.
  const taken = new Set([owner, ...grantees]);
  const available = Object.entries(roster)
    .filter(([username]) => !taken.has(username))
    .sort(([, a], [, b]) => a.localeCompare(b));

  function submit() {
    if (!picked || busy) return;
    onAdd(picked);
    setPicked("");
  }

  if (available.length === 0) {
    return (
      <div className="settings-grantee-empty">
        Every user already has access.
      </div>
    );
  }

  return (
    <div className="settings-grantee-form">
      <label htmlFor="settings-grantee-pick">Add user</label>
      <select
        id="settings-grantee-pick"
        value={picked}
        onChange={(e) => setPicked(e.target.value)}
        disabled={busy}
      >
        <option value="">Pick a user…</option>
        {available.map(([username, name]) => (
          <option key={username} value={username}>
            {name} ({username})
          </option>
        ))}
      </select>
      <button
        type="button"
        className="settings-grantee-add-btn"
        onClick={submit}
        disabled={!picked || busy}
      >
        {busy ? "…" : "+ Grant access"}
      </button>
    </div>
  );
}

function SettingsRow({
  label,
  value,
  mono,
  note,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  note?: string;
}) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <span
        className={`settings-row-value${mono ? " mono" : ""}`}
        style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
      >
        {value}
      </span>
      {note ? <span className="settings-row-note">{note}</span> : <span />}
    </div>
  );
}

function DisplayUser({ username }: { username: string }) {
  return <span style={{ fontFamily: "var(--font-mono)" }}>{useDisplayName(username)}</span>;
}

function DeleteConfirmModal({
  slug,
  title,
  onCancel,
  onDeleted,
}: {
  slug: string;
  title: string;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ready = typed.trim() === slug;

  function submit() {
    if (!ready || pending) return;
    setError(null);
    start(async () => {
      const res = await fetch(
        `/api/processes/${encodeURIComponent(slug)}`,
        { method: "DELETE", credentials: "same-origin" },
      );
      if (!res.ok) {
        let msg = "Could not delete.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* fall back to default */
        }
        setError(msg);
        return;
      }
      onDeleted();
    });
  }

  return (
    <div className="settings-modal-backdrop" onClick={onCancel}>
      <div
        className="settings-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <h2 id="settings-modal-title">
          Delete <code>{slug}</code>?
        </h2>
        <div className="settings-modal-warn">
          This is permanent. Wiki, sources, notes, access settings — all gone.
        </div>
        <p>You&rsquo;re about to delete the entire process &ldquo;{title}&rdquo;.</p>
        <label>
          Type <code>{slug}</code> to confirm:
        </label>
        <input
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={slug}
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === "Enter" && ready) submit();
          }}
        />
        {error && <div className="settings-modal-err">{error}</div>}
        <div className="settings-modal-actions">
          <button
            type="button"
            className="settings-modal-btn"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="settings-modal-btn primary"
            onClick={submit}
            disabled={!ready || pending}
          >
            {pending ? "Deleting…" : "Delete forever"}
          </button>
        </div>
      </div>
    </div>
  );
}

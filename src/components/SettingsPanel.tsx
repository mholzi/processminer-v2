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

export default function SettingsPanel({
  slug,
  title,
  idPrefix,
  sources,
}: {
  slug: string;
  title: string;
  idPrefix: string;
  sources: string[];
}) {
  const router = useRouter();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/processes/${encodeURIComponent(slug)}`, {
      credentials: "same-origin",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { owner?: string; grantees?: string[]; canManage?: boolean } | null) => {
        if (!alive || !j) return;
        setMeta({
          owner: j.owner ?? "",
          grantees: j.grantees ?? [],
          canManage: j.canManage === true,
        });
      })
      .catch(() => {
        /* swallow — panel still renders without access metadata */
      });
    return () => {
      alive = false;
    };
  }, [slug]);

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
              <span>
                {meta.grantees.map((g, i) => (
                  <span key={g}>
                    {i > 0 ? ", " : null}
                    <DisplayUser username={g} />
                  </span>
                ))}
              </span>
            )
          }
        />
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
            router.push("/");
            router.refresh();
          }}
        />
      )}
    </>
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

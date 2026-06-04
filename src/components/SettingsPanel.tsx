"use client";

import { useState } from "react";

// Per-process Settings — process facts plus a Danger Zone to delete the whole
// process (admin-only; the API enforces it too). Deletion is gated behind
// typing the slug, since it is irreversible.
export default function SettingsPanel({
  slug,
  title,
  id,
  elementCount,
  sourceCount,
  onDeleted,
}: {
  slug: string;
  title: string;
  id: string;
  elementCount: number;
  sourceCount: number;
  onDeleted: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

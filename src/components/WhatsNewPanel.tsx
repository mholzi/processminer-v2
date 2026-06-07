"use client";

import { useEffect, useState } from "react";
import type { WhatsNewEntry, EntryTag } from "@/lib/whatsnew-store";

// Admin panel for managing What's New entries. Loaded as a tab in AdminScreen.

const TAG_LABEL: Record<EntryTag, string> = {
  shipped: "Shipped",
  "in-flight": "In flight",
  planned: "Planned",
};

const TAG_COLOR: Record<EntryTag, string> = {
  shipped: "var(--hi)",
  "in-flight": "var(--mid)",
  planned: "var(--muted)",
};

const EMPTY_FORM: Omit<WhatsNewEntry, "createdAt" | "updatedAt"> = {
  id: "",
  title: "",
  tag: "shipped",
  when: "",
  bucket: "Today",
  summary: "",
  bullets: [],
  votes: undefined,
};

export default function WhatsNewPanel() {
  const [entries, setEntries] = useState<WhatsNewEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<WhatsNewEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [bulletsRaw, setBulletsRaw] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const r = await fetch("/api/admin/whatsnew", { credentials: "same-origin" });
      const data = (await r.json()) as { entries?: WhatsNewEntry[]; error?: string };
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      setEntries(data.entries ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load entries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setBulletsRaw("");
    setEditing(null);
    setCreating(true);
  }

  function openEdit(e: WhatsNewEntry) {
    setForm({
      id: e.id,
      title: e.title,
      tag: e.tag,
      when: e.when,
      bucket: e.bucket,
      summary: e.summary,
      bullets: e.bullets ?? [],
      votes: e.votes,
    });
    setBulletsRaw((e.bullets ?? []).join("\n"));
    setEditing(e);
    setCreating(false);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const bullets = bulletsRaw.split("\n").map((l) => l.trim()).filter(Boolean);
    const payload = { ...form, bullets: bullets.length ? bullets : undefined };
    try {
      const r = await fetch("/api/admin/whatsnew", {
        method: creating ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await r.json()) as { entry?: WhatsNewEntry; error?: string };
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      if (creating) {
        setEntries((prev) => [data.entry!, ...prev]);
      } else {
        setEntries((prev) => prev.map((e) => (e.id === data.entry!.id ? data.entry! : e)));
      }
      closeForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    setError(null);
    try {
      const r = await fetch("/api/admin/whatsnew", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeleteId(null);
    }
  }

  const isFormOpen = creating || !!editing;

  return (
    <main className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>What&rsquo;s new</h1>
          <p>
            Manage the release feed shown in the Help panel. Entries are stored in{" "}
            <code>data/whatsnew.json</code> and served live — no redeploy needed.
            Newest-first order drives the unseen badge count.
          </p>
        </div>
        {!isFormOpen && (
          <button type="button" className="admin-newbtn" onClick={openCreate}>
            + Add entry
          </button>
        )}
      </header>

      {error && <div className="admin-error">{error}</div>}

      {isFormOpen && (
        <div className="wn-form">
          <h2 className="wn-form-title">{creating ? "New entry" : `Edit — ${editing!.id}`}</h2>

          <div className="wn-form-grid">
            {creating && (
              <label className="wn-field">
                <span>ID</span>
                <input
                  className="wn-input"
                  value={form.id}
                  onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                  placeholder="kebab-case, e.g. new-feature"
                  autoFocus
                />
              </label>
            )}

            <label className="wn-field wn-field-wide">
              <span>Title</span>
              <input
                className="wn-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Feature or fix title"
              />
            </label>

            <label className="wn-field">
              <span>Tag</span>
              <select
                className="wn-input"
                value={form.tag}
                onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value as EntryTag }))}
              >
                {(["shipped", "in-flight", "planned"] as EntryTag[]).map((t) => (
                  <option key={t} value={t}>{TAG_LABEL[t]}</option>
                ))}
              </select>
            </label>

            <label className="wn-field">
              <span>When</span>
              <input
                className="wn-input"
                value={form.when}
                onChange={(e) => setForm((f) => ({ ...f, when: e.target.value }))}
                placeholder="21 May  or  ~Q3"
              />
            </label>

            <label className="wn-field">
              <span>Bucket</span>
              <input
                className="wn-input"
                value={form.bucket}
                onChange={(e) => setForm((f) => ({ ...f, bucket: e.target.value }))}
                placeholder="Today, This week, Soon, Next, Horizon"
              />
            </label>

            {form.tag !== "shipped" && (
              <label className="wn-field">
                <span>Votes</span>
                <input
                  className="wn-input"
                  type="number"
                  min={0}
                  value={form.votes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      votes: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                />
              </label>
            )}

            <label className="wn-field wn-field-wide">
              <span>Summary</span>
              <textarea
                className="wn-input wn-textarea"
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={3}
                placeholder="One-paragraph description of the feature or change."
              />
            </label>

            <label className="wn-field wn-field-wide">
              <span>Bullets <span className="wn-hint">(one per line, optional)</span></span>
              <textarea
                className="wn-input wn-textarea"
                value={bulletsRaw}
                onChange={(e) => setBulletsRaw(e.target.value)}
                rows={3}
                placeholder="Optional detail bullets, one per line."
              />
            </label>
          </div>

          <div className="wn-form-actions">
            <button type="button" className="act" onClick={closeForm} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="act ai" onClick={save} disabled={saving}>
              {saving ? "Saving…" : creating ? "Create" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="admin-loading">Loading entries…</div>}

      {!loading && entries.length === 0 && !isFormOpen && (
        <div className="admin-loading">No entries yet. Add the first one above.</div>
      )}

      {!loading && entries.length > 0 && (
        <div className="wn-list">
          {entries.map((e) => (
            <div
              key={e.id}
              className={`wn-row${editing?.id === e.id ? " wn-row-editing" : ""}`}
            >
              <div className="wn-row-meta">
                <span
                  className="wn-tag"
                  style={{ color: TAG_COLOR[e.tag] }}
                >
                  {TAG_LABEL[e.tag]}
                </span>
                <span className="wn-when">{e.when}</span>
                <span className="wn-bucket">{e.bucket}</span>
              </div>
              <div className="wn-row-title">{e.title}</div>
              <div className="wn-row-summary">{e.summary}</div>
              {e.bullets && e.bullets.length > 0 && (
                <ul className="wn-row-bullets">
                  {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
              <div className="wn-row-actions">
                <span className="wn-id">{e.id}</span>
                <span style={{ flex: 1 }} />
                {deleteId === e.id ? (
                  <>
                    <span className="wn-delete-confirm">Delete this entry?</span>
                    <button
                      type="button"
                      className="wn-btn-danger"
                      onClick={() => confirmDelete(e.id)}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="wn-btn-ghost"
                      onClick={() => setDeleteId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="wn-btn-ghost"
                      onClick={() => openEdit(e)}
                      disabled={isFormOpen}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="wn-btn-danger-ghost"
                      onClick={() => setDeleteId(e.id)}
                      disabled={isFormOpen}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

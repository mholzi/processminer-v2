"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FEATURE_FLAGS, type FeatureFlags } from "@/lib/feature-flags";

// Admin panel for the live-feedback feature flags. Lists the catalog grouped
// by section, each row a toggle that PATCHes /api/admin/features. The values
// are authoritative on the server; the toggle is optimistic and reconciles on
// the response (or reverts via a refresh on error). Lives inside AdminScreen as
// the "Feature toggles" tab. Flag changes take effect for users on their next
// load / router.refresh().

// Stable group order, taken from the catalog's first appearance.
const GROUPS: string[] = [...new Set(FEATURE_FLAGS.map((f) => f.group))];

export default function FeatureTogglesPanel() {
  const router = useRouter();
  const [values, setValues] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const r = await fetch("/api/admin/features", { credentials: "same-origin" });
      if (!r.ok) {
        const data = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${r.status}`);
      }
      const data = (await r.json()) as { values: FeatureFlags };
      setValues(data.values);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feature flags.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggle(id: string, enabled: boolean) {
    setSavingId(id);
    setError(null);
    // Optimistic — flip immediately, reconcile on the response.
    setValues((prev) => (prev ? { ...prev, [id]: enabled } : prev));
    try {
      const r = await fetch("/api/admin/features", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      });
      const data = (await r.json().catch(() => ({}))) as {
        values?: FeatureFlags;
        error?: string;
      };
      if (!r.ok) {
        setError(data.error || `HTTP ${r.status}`);
        await refresh();
        return;
      }
      if (data.values) setValues(data.values);
      // Re-render the server tree so the new flag flows into the live app
      // (the floating button, etc.) immediately — not just on the next reload.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      await refresh();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Feature toggles</h1>
          <p>
            Turn live-feedback features on or off for everyone, per environment.
            Changes apply right away for you and on each other user&rsquo;s next
            page load. Off by default — light them up as testing needs them.
          </p>
        </div>
      </header>

      {error && <div className="admin-error">⚠ {error}</div>}

      {loading || !values ? (
        <div className="admin-loading">Loading feature flags…</div>
      ) : (
        GROUPS.map((group) => (
          <section key={group} className="ff-group">
            <h2 className="ff-group-head">{group}</h2>
            <div className="ff-list">
              {FEATURE_FLAGS.filter((f) => f.group === group).map((f) => (
                <div className="ff-row" key={f.id}>
                  <div className="ff-text">
                    <span className="ff-label">{f.label}</span>
                    <span className="ff-desc">{f.description}</span>
                  </div>
                  <label
                    className="ff-switch"
                    title={values[f.id] ? "On" : "Off"}
                  >
                    <input
                      type="checkbox"
                      checked={values[f.id]}
                      disabled={savingId === f.id}
                      onChange={(e) => toggle(f.id, e.target.checked)}
                    />
                    <span className="ff-track" aria-hidden />
                    <span className="ff-state">
                      {values[f.id] ? "On" : "Off"}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}

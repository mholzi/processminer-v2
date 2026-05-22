"use client";

import { useState } from "react";
import type { User } from "@/lib/user";

// The login gate. Posts username + password to /api/auth/login, which sets
// the signed session cookie and returns the redacted user. AuthGate shows
// this whenever /api/auth/me responds 401.
export default function LoginGate({
  onSignedIn,
}: {
  onSignedIn: (user: User) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = username.trim().length > 0 && password.length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = (await res.json()) as { user?: User; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || "Sign in failed.");
        return;
      }
      onSignedIn(data.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-gate">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">Processminer v2</div>
        <p className="login-intro">
          Sign in with your username and password. Approvals and edits in
          the wiki are stamped with your account.
        </p>
        <label className="login-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. m.berger"
            autoComplete="username"
            autoFocus
            disabled={busy}
          />
        </label>
        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={busy}
          />
        </label>
        {error && <div className="modal-error">⚠ {error}</div>}
        <button className="login-submit" type="submit" disabled={!ready || busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="login-hint">
          No account? Ask your administrator to create one for you.
        </p>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { initials, type User } from "@/lib/user";

// The first-visit identity gate. Processminer stamps every approval and edit
// with the signed-in name, so the workspace does not open until a name and
// role are entered. Shown by AuthGate when no user is saved.
export default function LoginGate({
  onSubmit,
}: {
  onSubmit: (user: User) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const ready = name.trim().length > 0 && role.trim().length > 0;

  return (
    <div className="login-gate">
      <form
        className="login-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSubmit({ name: name.trim(), role: role.trim() });
        }}
      >
        <div className="login-brand">Processminer v2</div>
        <p className="login-intro">
          Enter your name and role to begin. They are stamped on every
          approval and edit you make in the process wiki.
        </p>
        <label className="login-field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. M. Berger"
            autoFocus
          />
        </label>
        <label className="login-field">
          <span>Role</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Subject-Matter Expert"
          />
        </label>
        {ready && (
          <div className="login-preview">
            <span className="user-avatar">{initials(name)}</span>
            <span>
              {name.trim()} · {role.trim()}
            </span>
          </div>
        )}
        <button className="login-submit" type="submit" disabled={!ready}>
          Continue
        </button>
      </form>
    </div>
  );
}

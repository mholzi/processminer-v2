"use client";

import { useEffect, useState } from "react";
import type { Schema, ProcessDoc } from "@/lib/wiki";
import type { FeedbackItem } from "@/lib/feedback";
import { loadUser, saveUser, clearUser, type User } from "@/lib/user";
import LoginGate from "@/components/LoginGate";
import ProcessDocScreen from "./ProcessDocScreen";

// Gates the workspace behind a name + role identity, persisted in
// localStorage. ProcessDocScreen only mounts once a user is set, so it can
// treat the signed-in user as always present. No real auth — Processminer is
// a local internal tool (see src/lib/user.ts).
export default function AuthGate({
  schema,
  docs,
  feedback,
}: {
  schema: Schema;
  docs: ProcessDoc[];
  feedback: FeedbackItem[];
}) {
  const [user, setUser] = useState<User | null>(null);
  // localStorage is only readable on the client — stay null until mounted.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setLoaded(true);
  }, []);

  function handleLogin(next: User) {
    saveUser(next);
    setUser(next);
  }

  function handleSignOut() {
    clearUser();
    setUser(null);
  }

  if (!loaded) return null;
  if (!user) return <LoginGate onSubmit={handleLogin} />;
  return (
    <ProcessDocScreen
      schema={schema}
      docs={docs}
      feedback={feedback}
      user={user}
      onUpdateUser={handleLogin}
      onSignOut={handleSignOut}
    />
  );
}

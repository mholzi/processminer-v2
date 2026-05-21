"use client";

import { useEffect, useState } from "react";
import type { Schema, ProcessDoc } from "@/lib/wiki";
import type { FeedbackItem } from "@/lib/feedback";
import { loadUser, saveUser, clearUser, type User } from "@/lib/user";
import LoginGate from "@/components/LoginGate";
import SplashScreen from "@/components/SplashScreen";
import HandoffInbox from "@/components/HandoffInbox";
import ArchitectureCanvas from "@/components/ArchitectureCanvas";
import ProcessDocScreen from "./ProcessDocScreen";

type Workspace = "splash" | "processminer" | "architectminer";

// Gates the workspace behind a name + role identity, persisted in
// localStorage. After sign-in the user lands on the workspace splash and
// chooses which module to enter — Processminer (the process documentation
// canvas) or ArchitectMiner (architecture handoff). No real auth —
// Processminer is a local internal tool (see src/lib/user.ts).
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
  const [workspace, setWorkspace] = useState<Workspace>("splash");
  const [initialSlug, setInitialSlug] = useState<string | undefined>(undefined);
  // Inner navigation inside the architect workspace. Undefined = inbox view;
  // a slug means the canvas is open for that process.
  const [architectSlug, setArchitectSlug] = useState<string | undefined>(undefined);

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
    setWorkspace("splash");
    setInitialSlug(undefined);
    setArchitectSlug(undefined);
  }

  function enterProcessminer(slug?: string) {
    setInitialSlug(slug);
    setWorkspace("processminer");
  }

  function enterArchitectminer() {
    setArchitectSlug(undefined);
    setWorkspace("architectminer");
  }

  if (!loaded) return null;
  if (!user) return <LoginGate onSubmit={handleLogin} />;
  if (workspace === "splash") {
    return (
      <SplashScreen
        docs={docs}
        user={user}
        onEnterProcessminer={enterProcessminer}
        onEnterArchitectminer={enterArchitectminer}
        onSignOut={handleSignOut}
      />
    );
  }
  if (workspace === "architectminer") {
    const openDoc = architectSlug ? docs.find((d) => d.slug === architectSlug) : undefined;
    if (openDoc) {
      return (
        <ArchitectureCanvas
          doc={openDoc}
          user={user}
          onReturnToInbox={() => setArchitectSlug(undefined)}
        />
      );
    }
    return (
      <HandoffInbox
        docs={docs}
        user={user}
        onReturnToSplash={() => setWorkspace("splash")}
        onOpenProcess={(slug) => setArchitectSlug(slug)}
      />
    );
  }
  return (
    <ProcessDocScreen
      schema={schema}
      docs={docs}
      feedback={feedback}
      user={user}
      onUpdateUser={handleLogin}
      onSignOut={handleSignOut}
      initialSlug={initialSlug}
      onReturnToSplash={() => setWorkspace("splash")}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import type { Schema, ProcessDoc } from "@/lib/wiki";
import type { FeedbackItem } from "@/lib/feedback";
import type { User } from "@/lib/user";

// Centralised gate for the admin route entry point: admins always, plus
// any non-admin user who owns at least one process (so they can manage
// grantees on the same screen).
function canManageAccess(u: User): boolean {
  return u.isAdmin === true || u.ownsAnyProcess === true;
}
import LoginGate from "@/components/LoginGate";
import WelcomeScreen from "@/components/WelcomeScreen";
import AdminScreen from "@/components/AdminScreen";
import HandoffInbox from "@/components/HandoffInbox";
import ArchitectureCanvas from "@/components/ArchitectureCanvas";
import ProcessDocScreen from "./ProcessDocScreen";

type Workspace = "splash" | "processminer" | "architectminer" | "admin";

// Gates the workspace behind a real authenticated session. On mount, asks
// /api/auth/me whether a valid session cookie is present; if not, shows
// LoginGate. Sign-out hits /api/auth/logout to clear the cookie.
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
  const [loaded, setLoaded] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>("splash");
  const [initialSlug, setInitialSlug] = useState<string | undefined>(undefined);
  // Bumped each time the user clicks "+ New process" from the splash. The
  // value itself doesn't matter — ProcessDocScreen watches the prop for a
  // change and fires the new-process flow on mount/update. Using a counter
  // means the same user can do create → bail → create again.
  const [createNewToken, setCreateNewToken] = useState(0);
  // Inner navigation inside the architect workspace. Undefined = inbox view;
  // a slug means the canvas is open for that process.
  const [architectSlug, setArchitectSlug] = useState<string | undefined>(undefined);

  // Hydrate the current user from the session cookie on mount.
  useEffect(() => {
    let live = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (r) => {
        if (!live) return;
        if (r.ok) {
          const data = (await r.json()) as { user: User };
          setUser(data.user);
        }
      })
      .catch(() => {
        /* network error — treat as signed out, the LoginGate will appear */
      })
      .finally(() => {
        if (live) setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, []);

  function handleSignedIn(next: User) {
    setUser(next);
  }

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      /* ignore — cookie probably already gone */
    }
    setUser(null);
    setWorkspace("splash");
    setInitialSlug(undefined);
    setArchitectSlug(undefined);
  }

  function enterProcessminer(slug?: string) {
    setInitialSlug(slug);
    // Clear any pending create intent so opening a recent process doesn't
    // accidentally re-trigger the new-process flow on remount.
    setCreateNewToken(0);
    setWorkspace("processminer");
  }

  function createNewProcess() {
    setInitialSlug(undefined);
    setCreateNewToken((n) => n + 1);
    setWorkspace("processminer");
  }

  function enterArchitectminer(slug?: string) {
    setArchitectSlug(slug);
    setWorkspace("architectminer");
  }

  function enterAdmin() {
    setWorkspace("admin");
  }

  if (!loaded) return null;
  if (!user) return <LoginGate onSignedIn={handleSignedIn} />;
  if (workspace === "splash") {
    return (
      <WelcomeScreen
        docs={docs}
        user={user}
        onEnterProcessminer={enterProcessminer}
        onEnterArchitectminer={enterArchitectminer}
        onCreateProcess={createNewProcess}
        onEnterAdmin={canManageAccess(user) ? enterAdmin : undefined}
        onUserUpdated={setUser}
        onSignOut={handleSignOut}
      />
    );
  }
  if (workspace === "admin") {
    return (
      <AdminScreen
        user={user}
        onReturnToSplash={() => setWorkspace("splash")}
      />
    );
  }
  if (workspace === "architectminer") {
    const openDoc = architectSlug ? docs.find((d) => d.slug === architectSlug) : undefined;
    if (openDoc) {
      return (
        <ArchitectureCanvas
          schema={schema}
          doc={openDoc}
          user={user}
          onUserUpdated={setUser}
          onEnterAdmin={canManageAccess(user) ? enterAdmin : undefined}
          onSignOut={handleSignOut}
          onReturnToInbox={() => setArchitectSlug(undefined)}
        />
      );
    }
    return (
      <HandoffInbox
        docs={docs}
        user={user}
        onUserUpdated={setUser}
        onEnterAdmin={canManageAccess(user) ? enterAdmin : undefined}
        onSignOut={handleSignOut}
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
      onUpdateUser={setUser}
      onEnterAdmin={canManageAccess(user) ? enterAdmin : undefined}
      onSignOut={handleSignOut}
      initialSlug={initialSlug}
      createNewToken={createNewToken}
      onReturnToSplash={() => setWorkspace("splash")}
    />
  );
}

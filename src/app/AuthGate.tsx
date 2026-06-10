"use client";

if (typeof window !== "undefined" && !(window as any).__fetchIntercepted) {
  (window as any).__fetchIntercepted = true;
  const originalFetch = window.fetch;
  let prefix = process.env.NEXT_PUBLIC_BASE_PATH || process.env.NEXT_PUBLIC_ASSET_PREFIX || "";
  if (prefix.endsWith("/")) {
    prefix = prefix.slice(0, -1);
  }
  if (prefix) {
    window.fetch = function (input, init) {
      if (typeof input === "string" && input.startsWith("/api/")) {
        return originalFetch.call(this, prefix + input, init);
      }
      return originalFetch.call(this, input, init);
    };
  }
}

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Schema, ProcessDoc } from "@/lib/wiki";
import type { FeedbackItem } from "@/lib/feedback";
import type { FeatureFlags } from "@/lib/feature-flags";
import { FeatureFlagsProvider } from "@/lib/feature-flags-context";
import type { User } from "@/lib/user";
import LoginGate from "@/components/LoginGate";
import FloatingFeedback from "@/components/FloatingFeedback";
import WelcomeScreen from "@/components/WelcomeScreen";
import AdminScreen from "@/components/AdminScreen";
import HandoffInbox from "@/components/HandoffInbox";
import ArchitectureCanvas from "@/components/ArchitectureCanvas";
import ProcessDocScreen from "./ProcessDocScreen";

type Workspace = "splash" | "processminer" | "architectminer" | "admin" | "login";

// Gates the workspace behind a real authenticated session. On mount, asks
// /api/auth/me whether a valid session cookie is present; if not, shows
// LoginGate. Sign-out hits /api/auth/logout to clear the cookie.
export default function AuthGate({
  schema,
  docs,
  feedback,
  flags,
}: {
  schema: Schema;
  docs: ProcessDoc[];
  feedback: FeedbackItem[];
  flags: FeatureFlags;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>("splash");
  const [initialSlug, setInitialSlug] = useState<string | undefined>(undefined);
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

          // Deep-link direct reload bypass for share link
          const params = new URLSearchParams(window.location.search);
          const p = params.get("p");
          if (p && docs.some((d) => d.slug === p)) {
            setInitialSlug(p);
            setWorkspace("processminer");
          }
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
  }, [docs]);

  function handleSignedIn(next: User) {
    setUser(next);
    setWorkspace("splash");
    router.refresh();
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
    router.refresh();
  }

  function enterProcessminer(slug?: string) {
    setInitialSlug(slug);
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
  if (!user && workspace !== "splash" && workspace !== "login") {
    return <LoginGate onSignedIn={handleSignedIn} onCancel={() => setWorkspace("splash")} />;
  }
  if (workspace === "login") {
    return <LoginGate onSignedIn={handleSignedIn} onCancel={() => setWorkspace("splash")} />;
  }

  // The signed-in workspace is wrapped in the flag provider so any feature can
  // read its toggle with useFeatureFlag(). The login/splash-loading states
  // above don't need it.
  let content: ReactNode;
  if (workspace === "splash") {
    content = (
      <WelcomeScreen
        docs={docs}
        user={user}
        onEnterProcessminer={enterProcessminer}
        onEnterArchitectminer={enterArchitectminer}
        onEnterAdmin={user?.isAdmin ? enterAdmin : undefined}
        onSignOut={handleSignOut}
        onUpdateUser={setUser}
        onSignIn={() => setWorkspace("login")}
      />
    );
  } else if (workspace === "admin") {
    content = (
      <AdminScreen
        user={user!}
        feedback={feedback}
        onReturnToSplash={() => setWorkspace("splash")}
      />
    );
  } else if (workspace === "architectminer") {
    const openDoc = architectSlug ? docs.find((d) => d.slug === architectSlug) : undefined;
    content = openDoc ? (
      <ArchitectureCanvas
        doc={openDoc}
        user={user!}
        onReturnToInbox={() => setArchitectSlug(undefined)}
      />
    ) : (
      <HandoffInbox
        docs={docs}
        user={user!}
        onReturnToSplash={() => setWorkspace("splash")}
        onOpenProcess={(slug) => setArchitectSlug(slug)}
      />
    );
  } else {
    content = (
      <ProcessDocScreen
        schema={schema}
        docs={docs}
        feedback={feedback}
        user={user!}
        onUpdateUser={setUser}
        onSignOut={handleSignOut}
        initialSlug={initialSlug}
        onReturnToSplash={() => setWorkspace("splash")}
      />
    );
  }

  // Best-effort label of where the tester is, attached to feedback they file.
  // A fuller per-process auto-capture is its own feature (live-feedback #2).
  const contextLabel =
    workspace === "admin"
      ? "Admin"
      : workspace === "architectminer"
        ? architectSlug
          ? `ArchitectMiner · ${architectSlug}`
          : "ArchitectMiner"
        : workspace === "processminer"
          ? initialSlug
            ? `Processminer · ${initialSlug}`
            : "Processminer"
          : "Welcome";

  return (
    <FeatureFlagsProvider flags={flags}>
      {content}
      <FloatingFeedback user={user || ({ name: "Guest", role: "Guest", username: "guest", entitlements: ["pm"] } as User)} contextLabel={contextLabel} />
    </FeatureFlagsProvider>
  );
}

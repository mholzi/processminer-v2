import { cookies } from "next/headers";
import { getSchema, listProcesses, getProcess, type ProcessDoc } from "@/lib/wiki";
import { listFeedback } from "@/lib/feedback-store";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { accessibleSlugs } from "@/lib/process-access";
import AuthGate from "./AuthGate";

// The wiki under wiki/ is a live filesystem source of truth: skill Python
// scripts mutate it out-of-band, with no knowledge of Next.js caching. Render
// this route dynamically so every request — including each router.refresh()
// after a chat turn — re-reads the wiki from disk. Without this the route is
// statically prerendered and router.refresh() cannot pick up skill writes.
export const dynamic = "force-dynamic";

// Server component: reads the file-backed Karpathy wiki, filters it by the
// signed-in user's per-process entitlements, and hands the entitled subset
// to the client. AuthGate decides whether to render the welcome screen or
// the login gate. Module entitlements (User.entitlements) gate which
// modules the user sees at all; process-access.json gates which processes.
export default async function Home() {
  const schema = getSchema();
  const allDocs = listProcesses()
    .map((p) => getProcess(p.slug))
    .filter((d): d is ProcessDoc => d !== null);

  // Look up the signed-in user from the session cookie so we can filter
  // the doc list before it leaves the server. If there is no session
  // (login gate will appear), pass an empty doc list — there is nothing
  // a signed-out viewer should be able to enumerate.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  const sessionUser = verifySession(sessionCookie);
  const docs = sessionUser
    ? (() => {
        const allowed = accessibleSlugs(sessionUser);
        return allDocs.filter((d) => allowed.has(d.slug));
      })()
    : [];

  if (allDocs.length === 0) {
    return (
      <main style={{ padding: 40 }}>
        <h1>No process found</h1>
        <p>
          Expected: <code>wiki/processes/&lt;slug&gt;/</code>. Seed with{" "}
          <code>node scripts/seed-cob-003.mjs</code>.
        </p>
      </main>
    );
  }

  return <AuthGate schema={schema} docs={docs} feedback={listFeedback()} />;
}

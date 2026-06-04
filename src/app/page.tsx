import { cookies } from "next/headers";
import { getSchema, listProcesses, getProcess, type ProcessDoc } from "@/lib/wiki";
import { listFeedback } from "@/lib/feedback-store";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { canAccess } from "@/lib/process-access";
import AuthGate from "./AuthGate";

// The wiki under wiki/ is a live filesystem source of truth: skill scripts
// mutate it out-of-band, with no knowledge of Next.js caching. Render this
// route dynamically so every request — including each router.refresh() after a
// chat turn or a login — re-reads the wiki from disk and re-applies access.
export const dynamic = "force-dynamic";

// Server component: reads the file-backed Karpathy wiki and hands the processes
// the signed-in user may see to the client app. R16 — per-process access is
// enforced here, server-side, so the browser never receives a process the user
// can't open. AuthGate then gates the UI behind the identity.
export default async function Home() {
  const schema = getSchema();

  // The signed-in user, from the session cookie (if any). When absent, no
  // process is sent — AuthGate shows the login, and a router.refresh() after
  // sign-in re-runs this with the cookie present.
  const cookie = (await cookies()).get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);

  const docs = user
    ? listProcesses()
        .filter((p) => canAccess(user, p.slug))
        .map((p) => getProcess(p.slug))
        .filter((d): d is ProcessDoc => d !== null)
    : [];

  return <AuthGate schema={schema} docs={docs} feedback={listFeedback()} />;
}

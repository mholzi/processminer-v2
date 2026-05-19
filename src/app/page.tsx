import { getSchema, listProcesses, getProcess, type ProcessDoc } from "@/lib/wiki";
import AuthGate from "./AuthGate";

// The wiki under wiki/ is a live filesystem source of truth: skill Python
// scripts mutate it out-of-band, with no knowledge of Next.js caching. Render
// this route dynamically so every request — including each router.refresh()
// after a chat turn — re-reads the wiki from disk. Without this the route is
// statically prerendered and router.refresh() cannot pick up skill writes.
export const dynamic = "force-dynamic";

// Server component: reads the file-backed Karpathy wiki and hands every
// documented process to the client app. AuthGate gates it behind a
// name + role identity, then renders the process-doc screen.
export default function Home() {
  const schema = getSchema();
  const docs = listProcesses()
    .map((p) => getProcess(p.slug))
    .filter((d): d is ProcessDoc => d !== null);

  if (docs.length === 0) {
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

  return <AuthGate schema={schema} docs={docs} />;
}

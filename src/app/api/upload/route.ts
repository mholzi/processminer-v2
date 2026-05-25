import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";

// Receives a document uploaded from the chat's upload modal and saves it into
// raw-sources/<slug>/ — Karpathy LLM-Wiki layer 1, the immutable imported
// documents. The document-ingest skill then reads it from there. Recording it
// in the process index.md is the skill's job (its first extraction step).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const slug = form.get("slug");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file in the upload." }, { status: 400 });
  }
  if (typeof slug !== "string" || !slug) {
    return Response.json({ error: "No process given." }, { status: 400 });
  }

  // Sanitise the filename — keep it a safe basename.
  const name =
    (file.name || "document")
      .split(/[\\/]/)
      .pop()!
      .replace(/[^A-Za-z0-9._-]+/g, "_")
      .replace(/^[._]+/, "") || "document";

  try {
    const dir = join(process.cwd(), "raw-sources", slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));

    // Sidecar manifest — raw-sources/<slug>/uploads.json. Records who
    // uploaded each file and when, keyed by filename. Filesystem mtimes
    // don't carry an actor; this is the lightest way to bring uploader
    // info into the Source Documents picker.
    const manifestPath = join(dir, "uploads.json");
    let manifest: Record<string, { by?: string; at: string }> = {};
    if (existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      } catch {
        manifest = {};
      }
    }
    manifest[name] = {
      by: user.username,
      at: new Date().toISOString(),
    };
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  } catch (e) {
    return Response.json(
      { error: `Could not save the file: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, file: name, path: `raw-sources/${slug}/${name}` });
}

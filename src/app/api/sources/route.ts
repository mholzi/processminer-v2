import { readFile } from "node:fs/promises";
import { join, basename, sep } from "node:path";
import type { NextRequest } from "next/server";
import { listSources } from "@/lib/wiki";

// Serves the imported source documents under raw-sources/<slug>/ — layer 1 of
// the Karpathy wiki. The left-rail Source Documents widget reads the list from
// ProcessDoc directly; this route backs the in-canvas document viewer, which
// fetches one document's text on demand (bodies are too heavy to ship eagerly).
//
//   GET /api/sources?slug=<slug>              → { files: SourceFile[] }
//   GET /api/sources?slug=<slug>&file=<name>  → { name, content }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  // Process slugs are kebab-case (see derive_process_meta.py /
  // scaffold_process.py). The strict grammar has no dots or slashes, so a
  // slug can never traverse out of raw-sources/ (e.g. `..`).
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return Response.json({ error: "Bad or missing slug." }, { status: 400 });
  }

  const file = searchParams.get("file");
  if (!file) {
    return Response.json({ files: listSources(slug) });
  }

  // basename() drops any directory part of `file`; the resolved path is then
  // asserted to stay inside raw-sources/<slug>/ — defence in depth.
  const dir = join(process.cwd(), "raw-sources", slug);
  const name = basename(file);
  const target = join(dir, name);
  if (!target.startsWith(dir + sep)) {
    return Response.json({ error: "Document not found." }, { status: 404 });
  }
  try {
    const content = await readFile(target, "utf8");
    return Response.json({ name, content });
  } catch {
    return Response.json({ error: "Document not found." }, { status: 404 });
  }
}

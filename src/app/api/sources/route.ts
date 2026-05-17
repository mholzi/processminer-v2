import { readFile } from "node:fs/promises";
import { join, basename } from "node:path";
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
  if (!slug || !/^[A-Za-z0-9._-]+$/.test(slug)) {
    return Response.json({ error: "Bad or missing slug." }, { status: 400 });
  }

  const file = searchParams.get("file");
  if (!file) {
    return Response.json({ files: listSources(slug) });
  }

  // Pin the read to a safe basename inside raw-sources/<slug>/ — never escape.
  const name = basename(file);
  try {
    const content = await readFile(
      join(process.cwd(), "raw-sources", slug, name),
      "utf8",
    );
    return Response.json({ name, content });
  } catch {
    return Response.json({ error: "Document not found." }, { status: 404 });
  }
}

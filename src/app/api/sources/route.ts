import { readFile } from "node:fs/promises";
import { join, basename, sep, extname } from "node:path";
import type { NextRequest } from "next/server";
import { listSources } from "@/lib/wiki";
import { isValidSlug, requireAccess } from "@/lib/route-guards";

// Serves the imported source documents under raw-sources/<slug>/ — layer 1 of
// the Karpathy wiki. The left-rail Source Documents widget reads the list from
// ProcessDoc directly; this route backs the in-canvas document viewer, which
// fetches one document on demand (bodies are too heavy to ship eagerly).
//
//   GET /api/sources?slug=<slug>                    → { files: SourceFile[] }
//   GET /api/sources?slug=<slug>&file=<name>        → { name, content }  (UTF-8 text)
//   GET /api/sources?slug=<slug>&file=<name>&raw=1  → binary body, correct Content-Type

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mime types for the binary path. Markdown is treated as text on both
// branches; PDFs need a real Content-Type so the browser can render them
// inside an iframe rather than offering a download.
const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8",
  ".markdown": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!isValidSlug(slug)) {
    return Response.json({ error: "Bad or missing slug." }, { status: 400 });
  }

  // Source documents are governed per-process (R16) — require a signed-in user
  // with access before listing or serving any document body.
  const guard = requireAccess(req, slug);
  if (guard instanceof Response) return guard;

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

  const raw = searchParams.get("raw") === "1";
  try {
    if (raw) {
      const buf = await readFile(target);
      const ext = extname(name).toLowerCase();
      const type = MIME[ext] ?? "application/octet-stream";
      return new Response(buf, {
        headers: {
          "Content-Type": type,
          "Content-Disposition": `inline; filename="${name}"`,
          "Cache-Control": "private, max-age=60",
        },
      });
    }
    const content = await readFile(target, "utf8");
    return Response.json({ name, content });
  } catch {
    return Response.json({ error: "Document not found." }, { status: 404 });
  }
}

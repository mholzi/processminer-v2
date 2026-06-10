import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Authentication & Authorization gate
  const user = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: { id?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { id, content } = body;
  if (!id || typeof content !== "string") {
    return NextResponse.json({ error: "id and content are required." }, { status: 400 });
  }

  // Prevent directory traversal
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    return NextResponse.json({ error: "Invalid skill ID." }, { status: 400 });
  }

  const skillsDir = join(process.cwd(), ".claude/skills");
  const skillPath = join(skillsDir, id, "SKILL.md");

  if (!existsSync(skillPath)) {
    return NextResponse.json({ error: `Skill '${id}' not found.` }, { status: 404 });
  }

  try {
    // 1. Back up existing SKILL.md
    const oldContent = readFileSync(skillPath, "utf8");
    const timestamp = Date.now();
    const backupPath = join(skillsDir, id, `SKILL.md.${timestamp}.bak`);
    writeFileSync(backupPath, oldContent, "utf8");

    // 2. Write new content
    writeFileSync(skillPath, content, "utf8");

    return NextResponse.json({ ok: true, backup: `SKILL.md.${timestamp}.bak` });
  } catch (error: any) {
    console.error("[admin/skills] Failed to save skill:", error);
    return NextResponse.json({ error: error.message || "Failed to save skill." }, { status: 500 });
  }
}

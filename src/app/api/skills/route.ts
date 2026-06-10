import { NextResponse } from "next/server";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SkillData {
  id: string;
  name: string;
  description: string;
  body: string;
  raw?: string;
}

function parseSkillMd(raw: string, defaultId: string): SkillData {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { id: defaultId, name: defaultId, description: "", body: raw, raw };
  }
  
  const fm = match[1];
  const body = match[2].trim();
  
  let name = defaultId;
  let description = "";
  
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  if (nameMatch) {
    name = nameMatch[1].replace(/['"]/g, "").trim();
  }
  
  // Extract description, handling multiline YAML string indicator >-
  const descMatch = fm.match(/description:\s*(?:>-\s*\n)?([\s\S]*?)(?:^[a-z0-9_-]+:|$)/im);
  if (descMatch) {
    description = descMatch[1]
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(" ");
  }
  
  return { id: defaultId, name, description, body, raw };
}

export async function GET() {
  try {
    const skillsDir = join(process.cwd(), ".claude/skills");
    if (!existsSync(skillsDir)) {
      return NextResponse.json({ error: "Skills directory not found" }, { status: 404 });
    }

    const entries = readdirSync(skillsDir, { withFileTypes: true });
    const skills: SkillData[] = [];
    let coreSystemPrompt = "";

    // Read core prompt if it exists
    const corePromptPath = join(skillsDir, "CORE_SYSTEM_PROMPT.md");
    if (existsSync(corePromptPath)) {
      coreSystemPrompt = readFileSync(corePromptPath, "utf8");
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = join(skillsDir, entry.name, "SKILL.md");
        if (existsSync(skillPath)) {
          const rawContent = readFileSync(skillPath, "utf8");
          const parsed = parseSkillMd(rawContent, entry.name);
          skills.push(parsed);
        }
      }
    }

    return NextResponse.json({ skills, coreSystemPrompt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

"use server";

// Layer-2 wiki writer: the SME's "Edit yourself" action rewrites a single
// element's markdown page in place. Frontmatter key order and list syntax are
// preserved; only the fields the editor exposed are patched.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { revalidatePath } from "next/cache";

const WIKI_DIR = join(process.cwd(), "wiki", "processes");

/** Locate <id>.md anywhere under the process's section folders. */
function findElementFile(slug: string, id: string): string | null {
  const dir = join(WIKI_DIR, slug);
  if (!existsSync(dir)) return null;
  for (const sub of readdirSync(dir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    const candidate = join(dir, sub.name, `${id}.md`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export async function saveElement(
  slug: string,
  id: string,
  edit: {
    title: string;
    fields: Record<string, string>;
    blocks: { heading: string; text: string }[];
    body: string;
  },
): Promise<{ ok: true }> {
  const path = findElementFile(slug, id);
  if (!path) throw new Error(`Element not found: ${id}`);

  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Malformed wiki page: ${id}`);

  // Rebuild frontmatter line-by-line — patch title, the exposed fields, and
  // promote an AI draft to "confirmed": a human edit is a human confirmation
  // (DESIGN.md — provenance-first).
  const frontmatter = match[1]
    .split("\n")
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return line;
      const key = line.slice(0, idx).trim();
      if (key === "title") return `title: ${edit.title}`;
      if (key === "status") return "status: confirmed";
      if (Object.prototype.hasOwnProperty.call(edit.fields, key)) {
        return `${key}: ${edit.fields[key]}`;
      }
      return line;
    })
    .join("\n");

  const body =
    edit.blocks.length > 0
      ? edit.blocks.map((b) => `## ${b.heading}\n${b.text.trim()}`).join("\n\n")
      : edit.body.trim();

  writeFileSync(path, `---\n${frontmatter}\n---\n${body}\n`, "utf8");
  revalidatePath("/");
  return { ok: true };
}

const APPROVAL_VALUES = ["in-progress", "approved", "rejected"];

// Per-element review status. Upserts the approval frontmatter and stamps who
// set it and when — the wiki is the record of who reviewed what.
export async function setApproval(
  slug: string,
  id: string,
  approval: string,
  by: string,
): Promise<{ ok: true }> {
  if (!APPROVAL_VALUES.includes(approval)) {
    throw new Error(`Invalid approval value: ${approval}`);
  }
  const path = findElementFile(slug, id);
  if (!path) throw new Error(`Element not found: ${id}`);

  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Malformed wiki page: ${id}`);

  const date = new Date().toISOString().slice(0, 10);
  const lines = match[1].split("\n");
  const upsert = (key: string, value: string) => {
    const i = lines.findIndex((l) => {
      const c = l.indexOf(":");
      return c !== -1 && l.slice(0, c).trim() === key;
    });
    if (i === -1) lines.push(`${key}: ${value}`);
    else lines[i] = `${key}: ${value}`;
  };
  upsert("approval", approval);
  upsert("approvalBy", by);
  upsert("approvalDate", date);

  writeFileSync(path, `---\n${lines.join("\n")}\n---\n${match[2]}`, "utf8");
  revalidatePath("/");
  return { ok: true };
}

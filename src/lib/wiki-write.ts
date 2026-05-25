"use server";

// Layer-2 wiki writer: the SME's "Edit yourself" action rewrites a single
// element's markdown page in place. Frontmatter key order and list syntax are
// preserved; only the fields the editor exposed are patched.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "./auth-server";

const WIKI_DIR = join(process.cwd(), "wiki", "processes");

// Who is making this server-side write — read off the signed session cookie.
// Returns the stable `username` (user ID), not the display name. Renderers
// resolve username → display name at read time via src/lib/contributors.ts,
// so a rename in data/users.json propagates without touching wiki files.
// Falls back to "the assistant" when there's no session (skill-driven writes
// hit the Python toolkit instead, so this only happens in dev / tests).
async function currentActor(): Promise<string> {
  const jar = await cookies();
  const user = verifySession(jar.get(COOKIE_NAME)?.value);
  return user?.username || "the assistant";
}

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

/** Resolve an id to its wiki file — an element page, or index.md when the id
 *  is the process overview's (the overview is approvable like an element). */
function findApprovableFile(slug: string, id: string): string | null {
  const elementFile = findElementFile(slug, id);
  if (elementFile) return elementFile;
  const index = join(WIKI_DIR, slug, "index.md");
  if (existsSync(index)) {
    const m = readFileSync(index, "utf8").match(/^---\n([\s\S]*?)\n---/);
    for (const line of m ? m[1].split("\n") : []) {
      const idx = line.indexOf(":");
      if (
        idx !== -1 &&
        line.slice(0, idx).trim() === "id" &&
        line.slice(idx + 1).trim() === id
      ) {
        return index;
      }
    }
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

  const fmLines = match[1].split("\n");
  const lineValue = (k: string): string => {
    for (const l of fmLines) {
      const i = l.indexOf(":");
      if (i !== -1 && l.slice(0, i).trim() === k) return l.slice(i + 1).trim();
    }
    return "";
  };

  // A content edit invalidates any prior review verdict — an `approved`
  // approval (or a `relevant`/`disregarded` triage) certified the *old*
  // content. Re-open it so the SME re-reviews, and clear the now-stale
  // by/date stamp. Mirrors how run-lint re-opens an implicated approval.
  const reopenApproval = lineValue("approval") === "approved";
  const reopenRelevance = ["relevant", "disregarded"].includes(
    lineValue("relevance"),
  );

  const actor = await currentActor();
  const nowIso = new Date().toISOString();

  // Rebuild frontmatter line-by-line — patch title, the exposed fields,
  // re-open a stale review verdict, and promote an AI draft to "confirmed":
  // a human edit is a human confirmation (DESIGN.md — provenance-first).
  const patchedFields = new Set<string>();
  const stampedKeys = new Set<string>();
  const fmOut = fmLines.map((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return line;
    const key = line.slice(0, idx).trim();
    if (key === "title") return `title: ${edit.title}`;
    if (key === "status") return "status: confirmed";
    if (reopenApproval && key === "approval") return "approval: in-progress";
    if (reopenApproval && (key === "approvalBy" || key === "approvalDate")) {
      return `${key}:`;
    }
    if (reopenRelevance && key === "relevance") return "relevance:";
    if (reopenRelevance && (key === "relevanceBy" || key === "relevanceDate")) {
      return `${key}:`;
    }
    if (key === "updatedBy") {
      stampedKeys.add(key);
      return `updatedBy: ${actor}`;
    }
    if (key === "updatedAt") {
      stampedKeys.add(key);
      return `updatedAt: ${nowIso}`;
    }
    if (Object.prototype.hasOwnProperty.call(edit.fields, key)) {
      patchedFields.add(key);
      return `${key}: ${edit.fields[key]}`;
    }
    return line;
  });

  // A field the element had no frontmatter line for — append it, so a value
  // the SME typed into a newly-exposed field is not silently dropped. Blank
  // values stay omitted (no point writing an empty `sla:`).
  for (const [key, value] of Object.entries(edit.fields)) {
    if (!patchedFields.has(key) && value.trim() !== "") {
      fmOut.push(`${key}: ${value.trim()}`);
    }
  }
  if (!stampedKeys.has("updatedBy")) fmOut.push(`updatedBy: ${actor}`);
  if (!stampedKeys.has("updatedAt")) fmOut.push(`updatedAt: ${nowIso}`);
  const frontmatter = fmOut.join("\n");

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
// set it and when — the wiki is the record of who reviewed what. The actor
// is read off the session cookie, not from a caller-supplied argument: the
// client cannot impersonate another user.
export async function setApproval(
  slug: string,
  id: string,
  approval: string,
): Promise<{ ok: true }> {
  if (!APPROVAL_VALUES.includes(approval)) {
    throw new Error(`Invalid approval value: ${approval}`);
  }
  const path = findApprovableFile(slug, id);
  if (!path) throw new Error(`Element not found: ${id}`);

  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Malformed wiki page: ${id}`);

  const by = await currentActor();
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

// Edit one part of an area's executive summary. The memo's four parts live in
// summaries.json; this patches a single part's prose in place.
export async function saveSummaryPart(
  slug: string,
  area: string,
  index: number,
  text: string,
): Promise<{ ok: true }> {
  const path = join(WIKI_DIR, slug, "summaries.json");
  if (!existsSync(path)) throw new Error("No summaries file for this process.");
  const data = JSON.parse(readFileSync(path, "utf8")) as Record<
    string,
    { parts: { heading: string; text: string }[]; generatedAt: string }
  >;
  const entry = data[area];
  if (!entry || !Array.isArray(entry.parts) || !entry.parts[index]) {
    throw new Error(`Summary part not found: ${area}[${index}]`);
  }
  entry.parts[index].text = text.trim();
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  revalidatePath("/");
  return { ok: true };
}

const RELEVANCE_VALUES = ["", "relevant", "disregarded"];

// Per-element relevance triage — for web-sourced / ideated elements (market
// trends, competitors, innovation ideas, CX benchmarks). A lighter review
// than approval: the SME marks whether the signal is relevant or to disregard.
export async function setRelevance(
  slug: string,
  id: string,
  relevance: string,
): Promise<{ ok: true }> {
  if (!RELEVANCE_VALUES.includes(relevance)) {
    throw new Error(`Invalid relevance value: ${relevance}`);
  }
  const path = findApprovableFile(slug, id);
  if (!path) throw new Error(`Element not found: ${id}`);

  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Malformed wiki page: ${id}`);

  const by = await currentActor();
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
  upsert("relevance", relevance);
  upsert("relevanceBy", by);
  upsert("relevanceDate", date);

  writeFileSync(path, `---\n${lines.join("\n")}\n---\n${match[2]}`, "utf8");
  revalidatePath("/");
  return { ok: true };
}

const TRIAGE_VALUES = ["pending", "accepted", "rejected"];

// Triage one council-review item — the SME's accept / reject ruling. Writes
// the new triage state to target-review.json; an `accepted` item re-opens
// every implicated transformation-decision that is currently `approval:
// approved` (the accepted feedback invalidates that sign-off — mirrors how
// run-lint re-opens an implicated approval).
export async function triageTargetReview(
  slug: string,
  itemId: string,
  triage: string,
): Promise<{ ok: true }> {
  if (!TRIAGE_VALUES.includes(triage)) {
    throw new Error(`Invalid triage value: ${triage}`);
  }
  const path = join(WIKI_DIR, slug, "target-review.json");
  if (!existsSync(path)) throw new Error("No council review for this process.");
  const review = JSON.parse(readFileSync(path, "utf8")) as {
    items: { id: string; triage: string; targets: string[] }[];
  };
  const item = review.items.find((i) => i.id === itemId);
  if (!item) throw new Error(`Review item not found: ${itemId}`);
  item.triage = triage;
  writeFileSync(path, JSON.stringify(review, null, 2) + "\n", "utf8");

  if (triage === "accepted") {
    const date = new Date().toISOString().slice(0, 10);
    for (const id of item.targets) {
      const file = findElementFile(slug, id);
      if (!file) continue;
      const raw = readFileSync(file, "utf8");
      const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!m) continue;
      const lines = m[1].split("\n");
      const value = (k: string): string => {
        for (const l of lines) {
          const i = l.indexOf(":");
          if (i !== -1 && l.slice(0, i).trim() === k) {
            return l.slice(i + 1).trim();
          }
        }
        return "";
      };
      // A non-approved decision is left untouched — only a live sign-off
      // needs re-opening.
      if (value("approval") !== "approved") continue;
      const upsert = (k: string, v: string) => {
        const i = lines.findIndex((l) => {
          const c = l.indexOf(":");
          return c !== -1 && l.slice(0, c).trim() === k;
        });
        if (i === -1) lines.push(`${k}: ${v}`);
        else lines[i] = `${k}: ${v}`;
      };
      upsert("approval", "in-progress");
      upsert("approvalBy", "council-review");
      upsert("approvalDate", date);
      writeFileSync(file, `---\n${lines.join("\n")}\n---\n${m[2]}`, "utf8");
    }
  }
  revalidatePath("/");
  return { ok: true };
}

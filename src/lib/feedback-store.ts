import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  type FeedbackCategory,
  type FeedbackItem,
  type FeedbackStatus,
  isFeedbackCategory,
  isFeedbackStatus,
} from "@/lib/feedback";

// Filesystem layer for the app-feedback tree at feedback/ (repo root). Each
// item is one Markdown file, feedback/FB-NNN.md — a frontmatter block plus the
// feedback prose. Kept deliberately apart from wiki/: this is feedback on the
// tool, not process documentation. Mirrors the defensive read style of
// lib/wiki.ts. Server-only — imports node:fs.

const FEEDBACK_DIR = join(process.cwd(), "feedback");
const FILE_RE = /^(FB-\d+)\.md$/;

export function feedbackPath(id: string): string {
  return join(FEEDBACK_DIR, `${id}.md`);
}

// Split a feedback file into a frontmatter map + body. Frontmatter is a block
// of `key: value` lines between two `---` fences.
function parseFile(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw.trim() };
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2].trim() };
}

function toItem(id: string, raw: string): FeedbackItem {
  const { meta, body } = parseFile(raw);
  return {
    id: meta.id || id,
    title: meta.title || "(untitled)",
    category: isFeedbackCategory(meta.category) ? meta.category : "idea",
    status: isFeedbackStatus(meta.status) ? meta.status : "open",
    author: meta.author || "Unknown",
    role: meta.role || "",
    page: meta.page || "",
    created: meta.created || "",
    body,
  };
}

// Render an item back to its Markdown file form. Frontmatter values are kept
// on one line each, so newlines are flattened out of the scalar fields.
export function serializeFeedback(item: FeedbackItem): string {
  const oneLine = (s: string) => s.replace(/\r?\n/g, " ").trim();
  const frontmatter = [
    `id: ${item.id}`,
    `title: ${oneLine(item.title)}`,
    `category: ${item.category}`,
    `status: ${item.status}`,
    `author: ${oneLine(item.author)}`,
    `role: ${oneLine(item.role)}`,
    `page: ${oneLine(item.page)}`,
    `created: ${item.created}`,
  ].join("\n");
  return `---\n${frontmatter}\n---\n\n${item.body.trim()}\n`;
}

// Every feedback item, newest id first.
export function listFeedback(): FeedbackItem[] {
  if (!existsSync(FEEDBACK_DIR)) return [];
  const items: FeedbackItem[] = [];
  for (const name of readdirSync(FEEDBACK_DIR)) {
    const m = name.match(FILE_RE);
    if (!m) continue;
    try {
      items.push(toItem(m[1], readFileSync(join(FEEDBACK_DIR, name), "utf8")));
    } catch {
      // Unreadable file — skip it rather than failing the whole list.
    }
  }
  return items.sort((a, b) =>
    b.id.localeCompare(a.id, undefined, { numeric: true }),
  );
}

export function getFeedback(id: string): FeedbackItem | null {
  const path = feedbackPath(id);
  if (!existsSync(path)) return null;
  try {
    return toItem(id, readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

// The next free FB-NNN id, scanning the existing files.
export function nextFeedbackId(): string {
  let max = 0;
  if (existsSync(FEEDBACK_DIR)) {
    for (const name of readdirSync(FEEDBACK_DIR)) {
      const m = name.match(/^FB-(\d+)\.md$/);
      if (m) max = Math.max(max, Number(m[1]));
    }
  }
  return `FB-${String(max + 1).padStart(3, "0")}`;
}

// Create a new feedback file; returns the stored item.
export function writeFeedback(input: {
  title: string;
  category: FeedbackCategory;
  body: string;
  page: string;
  author: string;
  role: string;
}): FeedbackItem {
  mkdirSync(FEEDBACK_DIR, { recursive: true });
  const item: FeedbackItem = {
    id: nextFeedbackId(),
    title: input.title,
    category: input.category,
    status: "open",
    author: input.author,
    role: input.role,
    page: input.page,
    created: new Date().toISOString().slice(0, 10),
    body: input.body,
  };
  writeFileSync(feedbackPath(item.id), serializeFeedback(item));
  return item;
}

// Change an item's status; returns the updated item, or null if unknown.
export function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): FeedbackItem | null {
  const item = getFeedback(id);
  if (!item) return null;
  const next: FeedbackItem = { ...item, status };
  writeFileSync(feedbackPath(id), serializeFeedback(next));
  return next;
}

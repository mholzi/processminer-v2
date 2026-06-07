// File-backed store for What's New entries. Server-only — imports node:fs.
// On first read, seeds data/whatsnew.json from the hardcoded seed entries so
// existing deployments pick up the current feed automatically.
//
// The file stores entries in newest-first order — the same order HelpCenter
// renders them, and the order unseenCount() relies on.

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "@/lib/atomic-write";

export type EntryTag = "shipped" | "in-flight" | "planned";

export type WhatsNewEntry = {
  id: string;
  title: string;
  tag: EntryTag;
  when: string;
  bucket: string;
  summary: string;
  bullets?: string[];
  votes?: number;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = join(process.cwd(), "data");
const PATH = join(DATA_DIR, "whatsnew.json");

// Seed data — mirrors the hardcoded ENTRIES in HelpCenter.tsx. On first boot
// this is written to data/whatsnew.json; after that the file is authoritative.
const SEED: Omit<WhatsNewEntry, "createdAt" | "updatedAt">[] = [
  {
    id: "palette",
    title: "Command palette for processes & sources",
    tag: "shipped",
    when: "21 May",
    bucket: "Today",
    summary:
      "⌘K opens a search-first picker for every documented process — with attention chips, last-activity, pin / recent groups. The Source Documents widget got the same treatment.",
  },
  {
    id: "uploader-pdf",
    title: "Uploader tracking + inline PDF viewer",
    tag: "shipped",
    when: "21 May",
    bucket: "Today",
    summary:
      "Every upload now records who uploaded and when. PDFs render straight in the canvas — no more raw bytes.",
  },
  {
    id: "triage-receipt",
    title: "Triage receipt + worklist",
    tag: "shipped",
    when: "19 May",
    bucket: "This week",
    summary:
      "The after-import screen reads like a banking statement: ingest record on the left, work-to-do grouped on the right.",
  },
  {
    id: "nav-spine",
    title: "Numbered area spine",
    tag: "shipped",
    when: "17 May",
    bucket: "This week",
    summary:
      "The six areas (As-Is, Risk, CX, Innovation, Target, Systems) are always visible on the left rail. Click a number to jump.",
  },
  {
    id: "area-phase-owner",
    title: "Per-process area, phase & owner",
    tag: "in-flight",
    when: "~Jun",
    bucket: "Soon",
    summary:
      "Each process will carry a banking-domain area (Corporate / Retail / Payments / Compliance / KYC), a refinement phase, and a process owner — so the picker can filter and group by them.",
    votes: 12,
  },
  {
    id: "portfolio",
    title: "Process portfolio dashboard",
    tag: "planned",
    when: "~Q3",
    bucket: "Next",
    summary:
      "An all-processes overview with progress per perspective, attention chips, last activity — strategic lens beside the working canvas.",
    votes: 7,
  },
  {
    id: "sortable-picker",
    title: "Sortable picker columns",
    tag: "planned",
    when: "~Q3",
    bucket: "Next",
    summary:
      "Click a column header in the process or source picker to sort. Pin your preferred sort.",
    votes: 4,
  },
  {
    id: "multi-sme",
    title: "Multi-SME concurrency",
    tag: "planned",
    when: "~2027",
    bucket: "Horizon",
    summary:
      "Two SMEs in the same process at once, with safe write merges and per-element locks.",
    votes: 3,
  },
  {
    id: "auto-diagrams",
    title: "Auto-rendered process diagrams",
    tag: "planned",
    when: "~2027",
    bucket: "Horizon",
    summary:
      "Render the As-Is process as a live flowchart from the documented steps and roles.",
    votes: 2,
  },
];

function read(): WhatsNewEntry[] {
  if (!existsSync(PATH)) {
    const now = new Date().toISOString();
    const seeded: WhatsNewEntry[] = SEED.map((e) => ({
      ...e,
      createdAt: now,
      updatedAt: now,
    }));
    mkdirSync(DATA_DIR, { recursive: true });
    atomicWriteFileSync(PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  try {
    return JSON.parse(readFileSync(PATH, "utf8")) as WhatsNewEntry[];
  } catch {
    return [];
  }
}

function write(entries: WhatsNewEntry[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  atomicWriteFileSync(PATH, JSON.stringify(entries, null, 2));
}

export function getEntries(): WhatsNewEntry[] {
  return read();
}

export function createEntry(
  input: Omit<WhatsNewEntry, "createdAt" | "updatedAt">,
): WhatsNewEntry {
  const entries = read();
  if (entries.some((e) => e.id === input.id)) {
    throw new Error(`Duplicate id: ${input.id}`);
  }
  const now = new Date().toISOString();
  const entry: WhatsNewEntry = { ...input, createdAt: now, updatedAt: now };
  // Prepend so newest is first, matching the HelpCenter feed order.
  write([entry, ...entries]);
  return entry;
}

export function updateEntry(
  id: string,
  patch: Partial<Omit<WhatsNewEntry, "id" | "createdAt" | "updatedAt">>,
): WhatsNewEntry {
  const entries = read();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error(`Entry not found: ${id}`);
  const updated: WhatsNewEntry = {
    ...entries[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  entries[idx] = updated;
  write(entries);
  return updated;
}

export function deleteEntry(id: string): void {
  const entries = read();
  const next = entries.filter((e) => e.id !== id);
  if (next.length === entries.length) throw new Error(`Entry not found: ${id}`);
  write(next);
}

import type { WikiPage } from "@/lib/wiki";

// Process-step ordering and transition parsing — shared by ProcessFlow,
// RaciMatrix and TargetSynthesis so the process spine reads in the same order
// everywhere. Order is derived from each step's `transitions` frontmatter; the
// schema has no stored sequence number.

export type Kind = "normal" | "branch" | "loopback" | "exception";

export interface Transition {
  to: string;
  kind: Kind;
  when: string;
}

const KINDS: Kind[] = ["normal", "branch", "loopback", "exception"];

// Parse a step's `transitions` frontmatter — each entry is `to|kind|when`.
export function parseTransitions(
  v: string | string[] | undefined,
): Transition[] {
  const raw = !v ? [] : Array.isArray(v) ? v : [v];
  const out: Transition[] = [];
  for (const entry of raw) {
    const parts = entry.split("|");
    const to = (parts[0] ?? "").trim();
    if (!to) continue;
    const k = (parts[1] ?? "normal").trim() as Kind;
    out.push({
      to,
      kind: KINDS.includes(k) ? k : "normal",
      when: parts.slice(2).join("|").trim(),
    });
  }
  return out;
}

// Order steps by their transition graph: a topological sort over the
// `normal`/`branch` edges between steps. Loop-backs and exception exits are
// excluded — they point backward or out of the chain. Steps left unconstrained
// keep their original (file) order; steps trapped in a cycle are appended in
// original order too. With no transition data this is just the input order.
export function orderSteps(steps: WikiPage[]): WikiPage[] {
  const ids = steps.map((s) => s.id);
  const idSet = new Set(ids);
  const byId = new Map(steps.map((s) => [s.id, s]));
  const indeg = new Map<string, number>(ids.map((id) => [id, 0]));
  const adj = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const s of steps) {
    for (const t of parseTransitions(s.meta.transitions)) {
      if (t.kind !== "normal" && t.kind !== "branch") continue;
      if (t.to === s.id || !idSet.has(t.to)) continue;
      adj.get(s.id)!.push(t.to);
      indeg.set(t.to, (indeg.get(t.to) ?? 0) + 1);
    }
  }
  // Kahn's algorithm; ready nodes are always taken in original order so the
  // result is stable.
  const order: WikiPage[] = [];
  const placed = new Set<string>();
  const ready = ids.filter((id) => indeg.get(id) === 0);
  while (ready.length) {
    const id = ready.shift()!;
    if (placed.has(id)) continue;
    placed.add(id);
    order.push(byId.get(id)!);
    for (const next of adj.get(id) ?? []) {
      indeg.set(next, (indeg.get(next) ?? 0) - 1);
      if (indeg.get(next) === 0) ready.push(next);
    }
  }
  for (const s of steps) if (!placed.has(s.id)) order.push(s);
  return order;
}

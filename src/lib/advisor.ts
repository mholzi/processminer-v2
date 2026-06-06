// The Advisory Board roster — the three senior advisor personas a user can
// consult from the dashboard, above any single process. Pure data + helpers,
// no Node APIs, so this module is safe to import from client components (the
// Welcome-screen panel + the slide-over) as well as the server.
//
// The persona PROMPTS live as Markdown under .claude/advisors/<id>/ADVISOR.md
// (mirroring how skills work) and are assembled into the session preamble
// server-side — see src/lib/advisor-server.ts. This file is only the registry.

export interface Advisor {
  /** Stable id — matches the .claude/advisors/<id>/ directory. */
  id: string;
  /** Display name shown in the panel, switcher and chat header. */
  name: string;
  /** Avatar monogram (2–3 chars). */
  monogram: string;
  /** One-line specialty shown under the name. */
  blurb: string;
  /** Opening message shown (as the advisor) while the chat is still empty —
   *  introduces the persona, what it can do, and an example question. Markdown. */
  greeting: string;
}

export const ADVISORS: Advisor[] = [
  {
    id: "lead-banking-sme",
    name: "Lead Banking SME",
    monogram: "SME",
    blurb: "banking domain across processes",
    greeting:
      "Hi — I'm your **Lead Banking SME**. I look across all your processes as a banking practitioner: where the steps don't match how a bank really runs, the exceptions and manual overrides that are missing, and controls that are weak or inconsistent between processes.\n\nTry something like *“Which of my processes are missing a sanctions re-screen?”* I only read — I cite the process and element behind every point, and never change anything.",
  },
  {
    id: "lead-architect",
    name: "Lead Architect",
    monogram: "LA",
    blurb: "cross-process architecture",
    greeting:
      "Hi — I'm your **Lead Architect**. I look across your processes for systems, integrations and target-state design: what to reuse instead of rebuild, where two processes are quietly diverging, and which point integrations should really be a shared service.\n\nTry something like *“What can funds-release reuse from COB-003?”* I only read — I cite the elements I draw on, and never change anything.",
  },
  {
    id: "lead-project-manager",
    name: "Lead Project Manager",
    monogram: "PM",
    blurb: "delivery, scope & roadmap",
    greeting:
      "Hi — I'm your **Lead Project Manager**. I keep the portfolio view: what's in flight, what's blocked, what's ready to hand off, and where the delivery risk is hiding.\n\nTry something like *“Which process should I work next, and why?”* I only read — I cite what I base a readiness call on, and never change anything.",
  },
];

export function getAdvisor(id: string | null | undefined): Advisor | undefined {
  if (!id) return undefined;
  return ADVISORS.find((a) => a.id === id);
}

/** Friendly labels keyed by advisor id — for the active-skill chip / notifications. */
export const ADVISOR_LABELS: Record<string, string> = Object.fromEntries(
  ADVISORS.map((a) => [a.id, a.name]),
);

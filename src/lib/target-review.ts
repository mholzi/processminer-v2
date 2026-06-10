// The target-state council review — the five other perspective specialists
// challenge the proposed target (the transformation decisions + target-state
// themes) from their own lens, and the SME triages each item accept / reject.
//
// The review itself is the `council-review` skill (.claude/skills/council-review/):
// it runs the specialists and writes the feedback into the process JSON's
// `targetReview`. The app reads it (see wiki.ts), renders it in the Council
// Review panel, and the SME's accept/reject writes back via the
// triageTargetReview server action — an accepted item re-opens the implicated
// transformation-decision.

export type CouncilSpecialist =
  | "process-specialist"
  | "control-compliance-specialist"
  | "client-journey-specialist"
  | "innovation-analyst"
  | "solution-architect";

/** The SME's ruling on one feedback item. */
export type TriageState = "pending" | "accepted" | "rejected";

export interface TargetReviewItem {
  /** R-001, R-002, … — stamped by the council-review skill. */
  id: string;
  /** Which of the five perspective specialists raised this. */
  specialist: CouncilSpecialist;
  /** One-line headline of the concern. */
  title: string;
  /** The specialist's feedback in full. */
  detail: string;
  /** transformation-decision / target-state ids the feedback implicates. */
  targets: string[];
  /** The SME's ruling. Accepted items re-open their implicated decisions. */
  triage: TriageState;
}

/** A whole council-review pass — one per process, in the process JSON's `targetReview`. */
export interface TargetReview {
  /** ISO timestamp the pass was run. */
  generatedAt: string;
  slug: string;
  /** The specialists this pass ran — all five = a full council. */
  ran: CouncilSpecialist[];
  items: TargetReviewItem[];
}

/** The five council specialists, with short display labels. */
export const COUNCIL_SPECIALISTS: {
  id: CouncilSpecialist;
  label: string;
}[] = [
  { id: "process-specialist", label: "Process" },
  { id: "control-compliance-specialist", label: "Control & Compliance" },
  { id: "client-journey-specialist", label: "Client Journey" },
  { id: "innovation-analyst", label: "Innovation" },
  { id: "solution-architect", label: "IT Architecture" },
];

export function specialistLabel(s: CouncilSpecialist): string {
  return COUNCIL_SPECIALISTS.find((c) => c.id === s)?.label ?? s;
}

// The target-state council review — the four other perspective specialists
// challenge the proposed target (the transformation decisions + target-state
// themes) from their own lens, and the SME triages each item accept / reject.
//
// The review itself is the `council-review` skill (.claude/skills/council-review/):
// it runs the specialists and hands the feedback to write_target_review.py,
// which writes wiki/processes/<slug>/target-review.json. The app reads that file
// (see wiki.ts), renders it in the Council Review panel, and the SME's
// accept/reject writes back via the triageTargetReview server action — an
// accepted item re-opens the implicated transformation-decision.

export type CouncilSpecialist =
  | "process-specialist"
  | "control-compliance-specialist"
  | "client-journey-specialist"
  | "it-architect";

/** The SME's ruling on one feedback item. */
export type TriageState = "pending" | "accepted" | "rejected";

export interface TargetReviewItem {
  /** R-001, R-002, … — stamped by write_target_review.py. */
  id: string;
  /** Which of the four perspective specialists raised this. */
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

/** A whole council-review pass — one per process, written to target-review.json. */
export interface TargetReview {
  /** ISO timestamp the pass was run. */
  generatedAt: string;
  slug: string;
  /** The specialists this pass ran — all four = a full council. */
  ran: CouncilSpecialist[];
  items: TargetReviewItem[];
}

/** The four council specialists, with short display labels. */
export const COUNCIL_SPECIALISTS: {
  id: CouncilSpecialist;
  label: string;
}[] = [
  { id: "process-specialist", label: "Process" },
  { id: "control-compliance-specialist", label: "Control & Compliance" },
  { id: "client-journey-specialist", label: "Client Journey" },
  { id: "it-architect", label: "IT Architecture" },
];

export function specialistLabel(s: CouncilSpecialist): string {
  return COUNCIL_SPECIALISTS.find((c) => c.id === s)?.label ?? s;
}

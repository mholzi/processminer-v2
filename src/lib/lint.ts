// The Karpathy wiki "Lint" operation — a consistency pass over the whole
// process wiki that surfaces clarifying questions and cross-section
// discrepancies for the SME to resolve.
//
// Stubbed for this build: a fixed finding set wired to real COB-003 elements.
// Slice 2 replaces STUB_FINDINGS with a real agent pass over the wiki.

export type FindingKind = "question" | "discrepancy" | "conformance";

export interface LintFinding {
  id: string;
  kind: FindingKind;
  /** One-line headline. */
  title: string;
  /** The clarifying question or the discrepancy explanation. */
  detail: string;
  /** Element IDs the finding involves — rendered as jump-to chips. */
  elements: string[];
}

export const STUB_FINDINGS: LintFinding[] = [
  {
    id: "F-1",
    kind: "discrepancy",
    title: "Account configuration step has no control",
    detail:
      "Compliance gap CG-COB-002 flags that account-configuration verification is not in the control set, and process step PS-COB-004 (Account Setup & Configuration) indeed references no control. Confirm whether CP-COB-004 (Strong Customer Authentication) is meant to cover it, or whether a new control is missing.",
    elements: ["CG-COB-002", "PS-COB-004", "CP-COB-004"],
  },
  {
    id: "F-2",
    kind: "discrepancy",
    title: "Friction point and pain point describe the same issue",
    detail:
      "Friction point FP-COB-002 (Repeated Document Chasing) and pain point PP-COB-001 (Manual document chasing) describe the same underlying problem at different layers. FP-COB-002 should link to PP-COB-001 via its painPoint relation so the two views stay consistent.",
    elements: ["FP-COB-002", "PP-COB-001"],
  },
  {
    id: "F-3",
    kind: "discrepancy",
    title: "E-signature idea not linked to its friction point",
    detail:
      "Innovation idea II-COB-003 (E-signature implementation) addresses pain point PP-COB-004 but does not reference friction point FP-COB-003 (Paper Signature Requirement), which is the same root cause. Add the missing link so the innovation traces to both.",
    elements: ["II-COB-003", "PP-COB-004", "FP-COB-003"],
  },
  {
    id: "F-4",
    kind: "discrepancy",
    title: "Activation step has no SLA but sets a client expectation",
    detail:
      "PS-COB-005 (Client Communication & Activation) carries no SLA, yet client touchpoint JT-COB-004 (Receive account activation) sets a client expectation at exactly this step. Document the SLA so the As-Is process and the CX journey agree.",
    elements: ["PS-COB-005", "JT-COB-004"],
  },
  {
    id: "F-5",
    kind: "question",
    title: "How many systems does onboarding really touch?",
    detail:
      "Pain point PP-COB-002 states staff move between '6+ systems', but 8 systems are documented (SYS-COB-001 … SYS-COB-008). Does onboarding actually touch all eight, or is the pain point's figure approximate? Confirm the exact count.",
    elements: ["PP-COB-002"],
  },
  {
    id: "F-6",
    kind: "question",
    title: "System Downtime exception lacks scope and fallback",
    detail:
      "Exception EX-COB-004 (System Downtime) does not state which systems' downtime triggers it, nor the manual fallback procedure. Which systems are in scope, and what is the contingency when they are unavailable?",
    elements: ["EX-COB-004"],
  },
  {
    id: "F-7",
    kind: "question",
    title: "Which metric is the intended SLA measure?",
    detail:
      "Process gaps PG-COB-001 (SLA adherence not measured centrally) and PG-COB-003 (per-step processing time not captured) both concern timing, and metric M-COB-002 already tracks average cycle time. Is M-COB-002 the intended SLA measure, or is a separate per-step SLA metric needed?",
    elements: ["PG-COB-001", "PG-COB-003", "M-COB-002"],
  },
  {
    id: "F-8",
    kind: "question",
    title: "Should the Relationship Manager have a RACI entry on intake?",
    detail:
      "The Relationship Manager contributes branch and partner referrals into the process trigger, but ROLE-COB-004 may carry no RACI entry for PS-COB-001 (Application Receipt & Initial Triage). Should the RM be Responsible or Consulted on intake?",
    elements: ["ROLE-COB-004", "PS-COB-001"],
  },
];

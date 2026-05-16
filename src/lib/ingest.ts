// The Karpathy wiki "Ingest" operation — pull a raw document in, extract its
// content and diff it against the wiki. Stubbed for this build: a real ingest
// would parse the uploaded file and run an agent extraction pass. Here we
// return a fixed, plausible result so the upload → summary → discrepancy flow
// is whole end to end.
import type { LintFinding } from "./lint";

export interface IngestResult {
  summary: string;
  discrepancies: LintFinding[];
}

export function stubIngest(fileName: string): IngestResult {
  return {
    summary: `Extracted from “${fileName}”. The document appears to be an updated Client Onboarding standard operating procedure for the BizBanking segment. It covers application intake, KYC and identity verification, credit assessment for overdraft requests, account setup and client activation — broadly the same shape as the COB-003 wiki. It additionally introduces an Enhanced Due Diligence path for high-risk clients and references a digital signature tool, neither of which is currently documented in the wiki.`,
    discrepancies: [
      {
        id: "D-1",
        kind: "discrepancy",
        title: "KYC turnaround time differs from the wiki",
        detail:
          "The document states KYC & identity verification completes “within 1 business day”. Process step PS-COB-002 records an SLA of 2–5 business days. Confirm which figure is current — the SOP may reflect a recent process change.",
        elements: ["PS-COB-002"],
      },
      {
        id: "D-2",
        kind: "discrepancy",
        title: "Document describes an Enhanced Due Diligence step not in the process",
        detail:
          "The SOP defines a separate Enhanced Due Diligence stage for high-risk and complex-ownership clients. The wiki has no such process step — the closest record is exception EX-COB-005 (Complex Ownership Structure). Decide whether EDD should become its own process step.",
        elements: ["PS-COB-002", "EX-COB-005"],
      },
      {
        id: "D-3",
        kind: "discrepancy",
        title: "Document references a live e-signature tool",
        detail:
          "The document names a digital signature tool as the signature method for account opening. The wiki documents no e-signature system, and innovation idea II-COB-003 still proposes implementing one. Has e-signature already gone live? If so, it belongs in Systems, not Innovation.",
        elements: ["II-COB-003", "SYS-COB-007"],
      },
      {
        id: "D-4",
        kind: "question",
        title: "Screening-hit escalation owner is unclear",
        detail:
          "The document routes KYC screening hits to a “Financial Crime Unit”. Exception EX-COB-002 (KYC Screening Hit) names a different handling owner. Confirm who currently owns screening-hit escalation.",
        elements: ["EX-COB-002"],
      },
    ],
  };
}

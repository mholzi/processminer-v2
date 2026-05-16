"use client";

import type { LintFinding } from "@/lib/lint";
import FindingCard from "./FindingCard";

// Lint review — every finding from the last lint pass, discrepancies first.
export default function ReviewPanel({
  findings,
  onGoToElement,
  onDeepDive,
  onRerun,
  linting,
}: {
  findings: LintFinding[];
  onGoToElement: (id: string) => void;
  onDeepDive: (finding: LintFinding) => void;
  onRerun: () => void;
  linting: boolean;
}) {
  const discrepancies = findings.filter((f) => f.kind === "discrepancy");
  const conformance = findings.filter((f) => f.kind === "conformance");
  const questions = findings.filter((f) => f.kind === "question");
  const ordered = [...discrepancies, ...conformance, ...questions];

  return (
    <div className="review">
      <div className="review-summary">
        <span className="rs-stat">
          <b>{findings.length}</b> findings
        </span>
        <span className="rs-stat">
          <b>{discrepancies.length}</b> discrepancies
        </span>
        <span className="rs-stat">
          <b>{conformance.length}</b> structure issues
        </span>
        <span className="rs-stat">
          <b>{questions.length}</b> clarifying questions
        </span>
        <button className="rs-rerun" onClick={onRerun} disabled={linting}>
          {linting ? "Linting…" : "Re-run lint"}
        </button>
      </div>

      {ordered.map((f) => (
        <FindingCard
          key={f.id}
          finding={f}
          onGoToElement={onGoToElement}
          onDeepDive={onDeepDive}
        />
      ))}
    </div>
  );
}

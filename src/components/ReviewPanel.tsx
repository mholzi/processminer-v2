"use client";

import type { LintFinding, LintReport } from "@/lib/lint";
import FindingCard from "./FindingCard";

// Lint review — the last `run-lint` pass for the process. Discrepancies
// first, then structure issues, then clarifying questions.
export default function ReviewPanel({
  report,
  onGoToElement,
  onDeepDive,
  onRerun,
  linting,
}: {
  report: LintReport;
  onGoToElement: (id: string) => void;
  onDeepDive: (finding: LintFinding) => void;
  onRerun: () => void;
  linting: boolean;
}) {
  const { findings } = report;
  const discrepancies = findings.filter((f) => f.kind === "discrepancy");
  const conformance = findings.filter((f) => f.kind === "conformance");
  const questions = findings.filter((f) => f.kind === "question");
  const ordered = [...discrepancies, ...conformance, ...questions];
  const linted = new Date(report.generatedAt);

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
      <div className="review-linted">
        Last linted{" "}
        {linted.toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </div>

      {findings.length === 0 ? (
        <div className="empty-state">
          <p>No findings — all clear.</p>
          <p className="empty-hint">
            Every element conforms to its template and the wiki is consistent
            across all five perspectives.
          </p>
        </div>
      ) : (
        ordered.map((f) => (
          <FindingCard
            key={f.id}
            finding={f}
            onGoToElement={onGoToElement}
            onDeepDive={onDeepDive}
          />
        ))
      )}
    </div>
  );
}

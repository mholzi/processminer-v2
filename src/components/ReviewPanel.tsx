"use client";

import { isResolved, type LintFinding, type LintReport } from "@/lib/lint";
import FindingCard from "./FindingCard";

// Lint review — the last `run-lint` pass for the process. Open findings
// first (discrepancies, then structure issues, then clarifying questions),
// then a collapsed group of findings already resolved in a deep-dive.
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
  const open = findings.filter((f) => !isResolved(f));
  const resolved = findings.filter(isResolved);
  const byKind = (kind: LintFinding["kind"]) =>
    open.filter((f) => f.kind === kind);
  const discrepancies = byKind("discrepancy");
  const conformance = byKind("conformance");
  const questions = byKind("question");
  const ordered = [...discrepancies, ...conformance, ...questions];
  const linted = new Date(report.generatedAt);

  return (
    <div className="review">
      <div className="review-summary">
        <span className="rs-stat">
          <b>{open.length}</b> open
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
        {resolved.length > 0 && (
          <span className="rs-stat">
            <b>{resolved.length}</b> resolved
          </span>
        )}
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

      {open.length === 0 ? (
        <div className="empty-state">
          <p>No open findings — all clear.</p>
          <p className="empty-hint">
            {resolved.length > 0
              ? "Every finding has been resolved in a deep-dive. Re-run lint to confirm the wiki is consistent across all five perspectives."
              : "Every element conforms to its template and the wiki is consistent across all five perspectives."}
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

      {resolved.length > 0 && (
        <details className="review-resolved">
          <summary>
            {resolved.length} resolved finding{resolved.length === 1 ? "" : "s"}{" "}
            — not yet re-verified by a lint pass
          </summary>
          {resolved.map((f) => (
            <FindingCard
              key={f.id}
              finding={f}
              onGoToElement={onGoToElement}
              onDeepDive={onDeepDive}
            />
          ))}
        </details>
      )}
    </div>
  );
}

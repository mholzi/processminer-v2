"use client";

import type { LintFinding } from "@/lib/lint";

// A single finding/discrepancy card — shared by the lint Review panel and the
// document Ingest panel. Kind-coded left border, jump-to chips, deep dive.
export default function FindingCard({
  finding: f,
  onGoToElement,
  onDeepDive,
}: {
  finding: LintFinding;
  onGoToElement: (id: string) => void;
  onDeepDive: (finding: LintFinding) => void;
}) {
  return (
    <article className={`finding ${f.kind}`}>
      <div className="finding-top">
        <span className={`finding-kind ${f.kind}`}>
          {f.kind === "discrepancy"
            ? "Discrepancy"
            : f.kind === "conformance"
              ? "Structure"
              : "Question"}
        </span>
        <span className="finding-id">{f.id}</span>
        <button
          className="act ai finding-dd"
          onClick={() => onDeepDive(f)}
          title="Start a QER deep-dive session on this finding"
        >
          ⌖ Deep dive
        </button>
      </div>
      <div className="finding-title">{f.title}</div>
      <div className="finding-detail">{f.detail}</div>
      <div className="finding-els">
        <span className="finding-els-label">Involves:</span>
        {f.elements.map((id) => (
          <button
            type="button"
            className="link-chip link-chip-nav"
            key={id}
            onClick={() => onGoToElement(id)}
            title={`Go to ${id}`}
          >
            {id}
          </button>
        ))}
      </div>
    </article>
  );
}

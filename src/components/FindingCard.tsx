"use client";

import { isResolved, type LintFinding } from "@/lib/lint";

// A single finding/discrepancy card — shared by the lint Review panel and the
// document Ingest panel. Kind-coded left border, jump-to chips, deep dive.
// A finding resolved via a chat deep-dive renders muted, with a resolved
// stamp in place of the deep-dive action.
export default function FindingCard({
  finding: f,
  onGoToElement,
  onDeepDive,
}: {
  finding: LintFinding;
  onGoToElement: (id: string) => void;
  onDeepDive: (finding: LintFinding) => void;
}) {
  const resolved = isResolved(f);
  return (
    <article className={`finding ${f.kind}${resolved ? " resolved" : ""}`}>
      <div className="finding-top">
        <span className={`finding-kind ${f.kind}`}>
          {f.kind === "discrepancy"
            ? "Discrepancy"
            : f.kind === "conformance"
              ? "Structure"
              : "Question"}
        </span>
        <span className="finding-id">{f.id}</span>
        {resolved ? (
          <span className="finding-resolved-tag" title="Resolved in a deep-dive">
            ✓ Resolved
          </span>
        ) : (
          <button
            className="act ai finding-dd"
            onClick={() => onDeepDive(f)}
            title="Start a Brainstorm deep-dive session on this finding"
          >
            ⌖ Deep dive
          </button>
        )}
      </div>
      <div className="finding-title">{f.title}</div>
      <div className="finding-detail">{f.detail}</div>
      {resolved && (f.resolvedBy || f.resolvedAt || f.resolutionNote) && (
        <div className="finding-resolution">
          <span className="finding-resolution-meta">
            Resolved
            {f.resolvedBy ? ` by ${f.resolvedBy}` : ""}
            {f.resolvedAt ? ` · ${f.resolvedAt}` : ""}
          </span>
          {f.resolutionNote && (
            <span className="finding-resolution-note">{f.resolutionNote}</span>
          )}
        </div>
      )}
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

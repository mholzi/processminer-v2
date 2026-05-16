"use client";

import type { LintFinding } from "@/lib/lint";
import FindingCard from "./FindingCard";

// Document ingest result — the AI-extracted summary of an uploaded document
// and the discrepancies it raises against the current wiki.
export default function IngestPanel({
  fileName,
  summary,
  discrepancies,
  onGoToElement,
  onDeepDive,
}: {
  fileName: string;
  summary: string;
  discrepancies: LintFinding[];
  onGoToElement: (id: string) => void;
  onDeepDive: (finding: LintFinding) => void;
}) {
  return (
    <div className="ingest">
      <div className="ingest-doc">
        <div className="ingest-doc-head">
          <span className="ingest-file">{fileName}</span>
          <span className="ingest-tag">AI-extracted · stubbed</span>
        </div>
        <div className="ingest-summary">{summary}</div>
      </div>

      <h2 className="type-group-head">
        Discrepancies to clarify ({discrepancies.length})
      </h2>
      {discrepancies.map((f) => (
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

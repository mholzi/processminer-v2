import type { WikiPage } from "@/lib/wiki";

const ORDER = ["approved", "in-progress", "rejected"] as const;
const LABEL: Record<string, string> = {
  approved: "Approved",
  "in-progress": "In progress",
  rejected: "Rejected",
};

// Segmented review-progress bar — approved / in-progress / rejected across a
// set of elements. Used on the Overview (with legend) and per section.
export default function ApprovalBar({
  elements,
  showLegend = false,
}: {
  elements: WikiPage[];
  showLegend?: boolean;
}) {
  const counts: Record<string, number> = {
    approved: 0,
    "in-progress": 0,
    rejected: 0,
  };
  for (const e of elements) {
    const a = String(e.meta.approval ?? "in-progress");
    counts[a === "approved" || a === "rejected" ? a : "in-progress"] += 1;
  }
  const total = elements.length;
  if (total === 0) return null;

  return (
    <div className="apbar-wrap">
      <div
        className="apbar"
        title={ORDER.map((k) => `${counts[k]} ${LABEL[k].toLowerCase()}`).join(
          " · ",
        )}
      >
        {ORDER.map((k) =>
          counts[k] > 0 ? (
            <div
              key={k}
              className={`apbar-seg ap-${k}`}
              style={{ width: `${(counts[k] / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      {showLegend && (
        <div className="apbar-legend">
          {ORDER.map((k) => (
            <span className="apbar-leg" key={k}>
              <span className={`apbar-dot ap-${k}`} />
              {LABEL[k]} <b>{counts[k]}</b>
              <span className="apbar-pct">
                {Math.round((counts[k] / total) * 100)}%
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

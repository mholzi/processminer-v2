import type { WikiPage } from "@/lib/wiki";
import { str } from "@/lib/meta";

// R12b — a compact at-a-glance roll-up shown above a section's cards: the item
// count plus a breakdown by the section's key enum field. One config-driven
// component rather than a bespoke widget per section. Sections that have their
// own widget (roles → RACI, process-steps → flow, to-be-design → synthesis) or
// that have no useful breakdown field render nothing.

const SUMMARY: Record<string, { field: string; label: string }> = {
  exceptions: { field: "impact", label: "Impact" },
  "pain-points": { field: "severity", label: "Severity" },
  "process-gaps": { field: "gapStatus", label: "Status" },
  controls: { field: "controlType", label: "Type" },
  "control-gaps": { field: "severity", label: "Severity" },
  "audit-findings": { field: "severity", label: "Severity" },
  "innovation-ideas": { field: "strategicFit", label: "Strategic fit" },
  "innovation-risks": { field: "severity", label: "Severity" },
  "market-trends": { field: "horizon", label: "Horizon" },
  "country-variations": { field: "country", label: "Country" },
};

// Severity-like values get a tone; everything else is a neutral chip.
const TONE: Record<string, string> = {
  HIGH: "sev-hi", MEDIUM: "sev-mid", LOW: "sev-lo", NONE: "sev-none",
  P1: "sev-hi", P2: "sev-mid", P3: "sev-lo",
  critical: "sev-hi", negative: "sev-mid", positive: "sev-lo",
  open: "sev-hi", "in-remediation": "sev-mid", closed: "sev-lo",
};

export default function SectionSummary({
  section,
  elements,
  fieldValues,
}: {
  section: string;
  elements: WikiPage[];
  fieldValues: Record<string, string[]>;
}) {
  const cfg = SUMMARY[section];
  if (elements.length === 0) return null;

  let chips: { value: string; count: number }[] = [];
  if (cfg) {
    const counts = new Map<string, number>();
    for (const e of elements) {
      const v = str(e.meta[cfg.field]);
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const order = fieldValues[cfg.field] ?? [...counts.keys()];
    chips = order
      .filter((v) => counts.has(v))
      .map((v) => ({ value: v, count: counts.get(v)! }));
  }

  // Nothing useful to show beyond the count → render nothing (the count is
  // already on the section nav).
  if (chips.length === 0) return null;

  return (
    <div className="sec-summary" aria-label={`${section} summary`}>
      <span className="sec-summary-count">
        {elements.length} item{elements.length === 1 ? "" : "s"}
      </span>
      <span className="sec-summary-by">{cfg.label}</span>
      <span className="sec-summary-chips">
        {chips.map((c) => (
          <span key={c.value} className={`sec-chip ${TONE[c.value] ?? ""}`}>
            {c.value} <b>{c.count}</b>
          </span>
        ))}
      </span>
    </div>
  );
}

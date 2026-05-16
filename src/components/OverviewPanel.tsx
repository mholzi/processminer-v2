import type { WikiPage } from "@/lib/wiki";
import Markdown from "./Markdown";
import ApprovalBar from "./ApprovalBar";

// The Overview — a roll-up dashboard, not free text. Three blocks:
// Process Facts · At a Glance (counts from every section) · Purpose.
// (The process-flow strip lives in the Process Steps section.)

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default function OverviewPanel({
  process,
  elements,
  onNavigate,
  resolveSection,
}: {
  process: WikiPage;
  elements: WikiPage[];
  onNavigate: (section: string) => void;
  resolveSection: (id: string) => string | null;
}) {
  const count = (type: string) => elements.filter((e) => e.type === type).length;
  const metricValue = (id: string) =>
    str(elements.find((e) => e.id === id)?.meta.value) || "—";
  const p1 = elements.filter(
    (e) => e.type === "pain-point" && e.meta.priority === "P1",
  ).length;

  const owner = str(process.meta.processOwner);
  const ownerSection = owner ? resolveSection(owner) : null;

  const facts: { label: string; value: string }[] = [
    { label: "Trigger", value: str(process.meta.trigger) },
    { label: "Frequency", value: str(process.meta.frequency) },
    { label: "In Scope", value: str(process.meta.scopeIn) },
    { label: "Out of Scope", value: str(process.meta.scopeOut) },
    { label: "Input", value: str(process.meta.processInput) },
    { label: "Output", value: str(process.meta.processOutput) },
    { label: "Doc Status", value: str(process.meta.docStatus) },
  ];

  const tiles: { label: string; value: string; sub?: string; section: string }[] = [
    { label: "Volume", value: metricValue("M-COB-001"), section: "metrics" },
    { label: "Cycle Time", value: metricValue("M-COB-002"), section: "metrics" },
    { label: "Steps", value: String(count("process-step")), section: "process-steps" },
    { label: "Roles", value: String(count("role")), section: "roles" },
    { label: "Controls", value: String(count("control")), section: "controls" },
    {
      label: "Pain Points",
      value: String(count("pain-point")),
      sub: p1 > 0 ? `${p1} × P1` : undefined,
      section: "pain-points",
    },
    { label: "Friction Points", value: String(count("friction-point")), section: "friction-points" },
    { label: "Systems", value: String(count("system")), section: "systems" },
    { label: "Open Gaps", value: String(count("process-gap")), section: "process-gaps" },
  ];

  return (
    <div className="ovw">
      {/* Process Facts */}
      <section>
        <h2 className="type-group-head">Process Facts</h2>
        <dl className="ovw-facts">
          <div className="ovw-fact">
            <dt>Process Owner</dt>
            <dd>
              {owner ? (
                ownerSection ? (
                  <button
                    type="button"
                    className="link-chip link-chip-nav"
                    onClick={() => onNavigate(ownerSection)}
                  >
                    {owner}
                  </button>
                ) : (
                  owner
                )
              ) : (
                "—"
              )}
            </dd>
          </div>
          {facts.map((f) => (
            <div className="ovw-fact" key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* At a Glance */}
      <section>
        <h2 className="type-group-head">At a Glance</h2>
        <div className="ovw-tiles">
          {tiles.map((t) => (
            <button
              type="button"
              className="ovw-tile"
              key={t.label}
              onClick={() => onNavigate(t.section)}
            >
              <span className="ovw-tile-value">{t.value}</span>
              <span className="ovw-tile-label">{t.label}</span>
              {t.sub && <span className="ovw-tile-sub">{t.sub}</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Review Progress */}
      <section>
        <h2 className="type-group-head">Review Progress</h2>
        <div className="ovw-progress">
          <ApprovalBar elements={elements} showLegend />
        </div>
      </section>

      {/* Purpose */}
      <section>
        <h2 className="type-group-head">Purpose</h2>
        <div className="ovw-purpose">
          <Markdown text={process.body} />
        </div>
      </section>
    </div>
  );
}

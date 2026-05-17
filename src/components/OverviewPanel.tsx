import type { WikiPage } from "@/lib/wiki";
import { isSourcedType } from "@/lib/element-types";
import Markdown from "./Markdown";
import ApprovalBar from "./ApprovalBar";
import ApprovalControl from "./ApprovalControl";

// The Overview — a roll-up dashboard, not free text. Three blocks:
// Process Facts · Review Progress · Purpose.
// (The process-flow strip lives in the Process Steps section.)

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default function OverviewPanel({
  process,
  elements,
  slug,
  userName,
  onNavigate,
  resolveSection,
  onSaved,
}: {
  process: WikiPage;
  elements: WikiPage[];
  slug: string;
  userName: string;
  onNavigate: (section: string) => void;
  resolveSection: (id: string) => string | null;
  onSaved?: () => void;
}) {
  const owner = str(process.meta.processOwner);
  const ownerSection = owner ? resolveSection(owner) : null;

  // Provenance — the document(s) this process was documented from.
  const sourcesText = Array.isArray(process.meta.sources)
    ? process.meta.sources.join(", ")
    : str(process.meta.sources);

  const facts: { label: string; value: string }[] = [
    { label: "Trigger", value: str(process.meta.trigger) },
    { label: "Frequency", value: str(process.meta.frequency) },
    { label: "In Scope", value: str(process.meta.scopeIn) },
    { label: "Out of Scope", value: str(process.meta.scopeOut) },
    { label: "Input", value: str(process.meta.processInput) },
    { label: "Output", value: str(process.meta.processOutput) },
    { label: "Sources", value: sourcesText },
  ];

  return (
    <div className="ovw">
      {/* Overview review status — the overview is approvable like an element */}
      <div className="ovw-review">
        <span className="ovw-review-label">Overview review</span>
        <ApprovalControl
          slug={slug}
          id={process.id}
          approval={String(process.meta.approval ?? "in-progress")}
          approvalBy={
            process.meta.approvalBy ? String(process.meta.approvalBy) : null
          }
          approvalDate={
            process.meta.approvalDate ? String(process.meta.approvalDate) : null
          }
          userName={userName}
          onSaved={onSaved}
        />
      </div>

      {/* Purpose — the orientation: what this process is, read first */}
      <section>
        <h2 className="type-group-head">Purpose</h2>
        <div className="ovw-purpose">
          <Markdown text={process.body} />
        </div>
      </section>

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
          {facts.map((f) => {
            // A value joined with " · " is a multi-value fact — list it.
            const parts = f.value
              .split(" · ")
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <div className="ovw-fact" key={f.label}>
                <dt>{f.label}</dt>
                <dd>
                  {parts.length > 1 ? (
                    <ul className="ovw-fact-list">
                      {parts.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    f.value || "—"
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      {/* Review Progress */}
      <section>
        <h2 className="type-group-head">Review Progress</h2>
        <div className="ovw-progress">
          <ApprovalBar
            elements={[
              process,
              ...elements.filter((e) => !isSourcedType(e.type)),
            ]}
            showLegend
          />
        </div>
      </section>
    </div>
  );
}

import { orderSteps } from "@/lib/stepOrder";
import type { ProcessView } from "@/lib/process-view";
import type { WikiPage } from "@/lib/wiki";

// RACI matrix — rows = process steps, columns = roles, cells = R/A/C/I.
// The RACI grid is pre-built by ProcessView (src/lib/process-view.ts) from the
// per-process raci.json bundle; this component renders it. Step row headers
// link to the Prozessschritte section.

const LEVEL_CLASS: Record<string, string> = {
  R: "raci-r",
  A: "raci-a",
  C: "raci-c",
  I: "raci-i",
};

// RACI rule check for the levels assigned to one step. A valid activity has
// at least one Responsible and exactly one Accountable.
function raciIssues(levels: string[]): string[] {
  if (levels.length === 0) return ["No roles assigned to this step"];
  const n = (l: string) => levels.filter((x) => x === l).length;
  const issues: string[] = [];
  if (n("R") === 0) issues.push("No Responsible (R)");
  if (n("A") === 0) issues.push("No Accountable (A)");
  if (n("A") > 1) issues.push(`${n("A")} Accountable (A) — only one is allowed`);
  return issues;
}

export default function RaciMatrix({
  steps,
  roles,
  raciGrid,
  onGoToElement,
}: {
  steps: WikiPage[];
  roles: WikiPage[];
  /** Pre-built stepId → roleId → level grid from ProcessView. */
  raciGrid: ProcessView["raciGrid"];
  onGoToElement: (id: string) => void;
}) {
  // Rows follow the process spine — the same transition-graph order the
  // ProcessFlow strip uses.
  const sortedSteps = orderSteps(steps);

  // Per-step RACI rule violations — surfaced so the matrix exposes gaps
  // instead of rendering them as silent blank cells.
  const stepIssues: Record<string, string[]> = {};
  for (const step of sortedSteps) {
    const row = raciGrid.get(step.id);
    stepIssues[step.id] = raciIssues(row ? Array.from(row.values()) : []);
  }
  const flagged = sortedSteps.filter((s) => stepIssues[s.id].length > 0).length;

  return (
    <div className="raci">
      <h2 className="type-group-head">
        RACI Matrix · Step × Role
        {flagged > 0 && (
          <span className="raci-warn-count">
            {flagged} step{flagged === 1 ? "" : "s"} with RACI gaps
          </span>
        )}
      </h2>
      <div className="raci-scroll">
        <table className="raci-table">
          <thead>
            <tr>
              <th className="raci-corner">Process Step</th>
              {roles.map((r) => (
                <th key={r.id} className="raci-role">
                  <button
                    type="button"
                    className="raci-role-link"
                    onClick={() => onGoToElement(r.id)}
                    title={`Go to ${r.id}`}
                  >
                    {r.title}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedSteps.map((step) => (
              <tr key={step.id}>
                <th
                  className={`raci-step${
                    stepIssues[step.id].length > 0 ? " is-warn" : ""
                  }`}
                  scope="row"
                >
                  <button
                    className="raci-step-link"
                    onClick={() => onGoToElement(step.id)}
                    title={`Go to ${step.id}`}
                  >
                    <span className="raci-step-top">
                      <span className="raci-step-id">{step.id}</span>
                      {stepIssues[step.id].length > 0 && (
                        <span
                          className="raci-step-warn"
                          title={stepIssues[step.id].join(" · ")}
                        >
                          !
                        </span>
                      )}
                    </span>
                    <span className="raci-step-title">{step.title}</span>
                  </button>
                </th>
                {roles.map((role) => {
                  const lvl = raciGrid.get(step.id)?.get(role.id);
                  return (
                    <td key={role.id} className="raci-cell">
                      {lvl && (
                        <span className={`raci-badge ${LEVEL_CLASS[lvl] ?? ""}`}>
                          {lvl}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="raci-legend">
        <span className="raci-badge raci-r">R</span> Responsible
        <span className="raci-badge raci-a">A</span> Accountable
        <span className="raci-badge raci-c">C</span> Consulted
        <span className="raci-badge raci-i">I</span> Informed
      </div>
    </div>
  );
}

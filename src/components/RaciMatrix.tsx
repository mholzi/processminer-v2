import type { WikiPage } from "@/lib/wiki";

// RACI matrix — rows = process steps, columns = roles, cells = R/A/C/I.
// The raci data lives on each role page (frontmatter `raci: [STEP:LEVEL]`);
// this component pivots it. Step row headers link to the Prozessschritte section.

const LEVEL_CLASS: Record<string, string> = {
  R: "raci-r",
  A: "raci-a",
  C: "raci-c",
  I: "raci-i",
};

function asList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

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
  onGoToElement,
}: {
  steps: WikiPage[];
  roles: WikiPage[];
  onGoToElement: (id: string) => void;
}) {
  // grid[stepId][roleId] = "R" | "A" | "C" | "I"
  const grid: Record<string, Record<string, string>> = {};
  for (const role of roles) {
    for (const entry of asList(role.meta.raci)) {
      const [stepId, level] = entry.split(":");
      if (!stepId || !level) continue;
      (grid[stepId] ??= {})[role.id] = level;
    }
  }

  const sortedSteps = [...steps].sort(
    (a, b) => Number(a.meta.sequence ?? 0) - Number(b.meta.sequence ?? 0),
  );

  // Per-step RACI rule violations — surfaced so the matrix exposes gaps
  // instead of rendering them as silent blank cells.
  const stepIssues: Record<string, string[]> = {};
  for (const step of sortedSteps) {
    stepIssues[step.id] = raciIssues(Object.values(grid[step.id] ?? {}));
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
                  const lvl = grid[step.id]?.[role.id];
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

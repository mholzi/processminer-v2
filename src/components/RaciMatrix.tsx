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

export default function RaciMatrix({
  steps,
  roles,
  onNavigate,
}: {
  steps: WikiPage[];
  roles: WikiPage[];
  onNavigate: (section: string) => void;
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

  return (
    <div className="raci">
      <h2 className="type-group-head">RACI Matrix · Step × Role</h2>
      <div className="raci-scroll">
        <table className="raci-table">
          <thead>
            <tr>
              <th className="raci-corner">Process Step</th>
              {roles.map((r) => (
                <th key={r.id} className="raci-role">
                  {r.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedSteps.map((step) => (
              <tr key={step.id}>
                <th className="raci-step" scope="row">
                  <button
                    className="raci-step-link"
                    onClick={() => onNavigate("process-steps")}
                    title="Go to Process Steps"
                  >
                    <span className="raci-step-id">{step.id}</span>
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

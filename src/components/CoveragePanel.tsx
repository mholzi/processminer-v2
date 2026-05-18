"use client";

import type { CoverageReport, ProblemTypeCoverage } from "@/lib/coverage";
import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// The Target-state coverage views — two renderings of one CoverageReport.
//   CoverageRollup — the headline "N / M covered" figure (Target area overview).
//   CoveragePanel  — the full Validation section: rollup + uncovered list +
//                    consistency findings, with designed empty / all-covered
//                    states (no "No items" blanks).
//
// Uncovered problems render in neutral text — the listing is the signal, no
// warning/error colour (design review D6). Red is reserved for the genuine
// error findings (dangling / wrong-type refs).

type GetRef = (id: string) => { page: WikiPage; typeLabel: string } | undefined;

function pct(report: CoverageReport): number {
  if (report.totalOpen === 0) return 0;
  return Math.round((report.covered.length / report.totalOpen) * 100);
}

/** Headline coverage figure — the centerpiece of the Target area overview. */
export function CoverageRollup({ coverage }: { coverage: CoverageReport }) {
  if (coverage.totalOpen === 0) {
    return (
      <div className="cov-rollup">
        <span className="cov-rollup-fig">—</span>
        <span className="cov-rollup-label">no open problems to cover</span>
      </div>
    );
  }
  return (
    <div className="cov-rollup">
      <span className="cov-rollup-fig">
        {coverage.covered.length}
        <span className="cov-rollup-of"> / {coverage.totalOpen}</span>
      </span>
      <span className="cov-rollup-label">open problems covered by the target</span>
      <span
        className="cov-bar"
        role="img"
        aria-label={`${pct(coverage)} percent covered`}
      >
        <span className="cov-bar-fill" style={{ width: `${pct(coverage)}%` }} />
      </span>
    </div>
  );
}

/** One As-Is problem id as a navigable chip with a hovercard. `state` adds a
 *  leading covered / uncovered marker when the chip sits in a type breakdown. */
function ProblemChip({
  id,
  getRef,
  onGoToElement,
  state,
}: {
  id: string;
  getRef: GetRef;
  onGoToElement: (id: string) => void;
  state?: "covered" | "uncovered";
}) {
  const ref = getRef(id);
  return (
    <ElementHovercard element={ref?.page} typeLabel={ref?.typeLabel}>
      <button
        type="button"
        className={`link-chip link-chip-nav${state ? ` cov-chip-${state}` : ""}`}
        onClick={() => onGoToElement(id)}
      >
        {state && (
          <span className="cov-chip-mark" aria-hidden="true">
            {state === "covered" ? "✓" : "○"}
          </span>
        )}
        {id}
      </button>
    </ElementHovercard>
  );
}

/** One problem-type row — covered / uncovered count and the chips for each. */
function TypeGroup({
  group,
  getRef,
  onGoToElement,
}: {
  group: ProblemTypeCoverage;
  getRef: GetRef;
  onGoToElement: (id: string) => void;
}) {
  const open = group.covered.length + group.uncovered.length;
  return (
    <div className="cov-typegroup">
      <div className="cov-typegroup-head">
        <span className="cov-typegroup-label">{group.label}</span>
        <span className="cov-typegroup-count">
          {open === 0
            ? `${group.closedExcluded.length} closed`
            : `${group.covered.length} / ${open} covered`}
        </span>
      </div>
      {open === 0 ? (
        <p className="cov-note">
          All {group.label.toLowerCase()} are closed — nothing outstanding for
          the target to resolve.
        </p>
      ) : (
        <div className="cov-chips">
          {group.covered.map((id) => (
            <ProblemChip
              key={id}
              id={id}
              getRef={getRef}
              onGoToElement={onGoToElement}
              state="covered"
            />
          ))}
          {group.uncovered.map((id) => (
            <ProblemChip
              key={id}
              id={id}
              getRef={getRef}
              onGoToElement={onGoToElement}
              state="uncovered"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** The full Validation section — rollup, uncovered list, consistency findings. */
export function CoveragePanel({
  coverage,
  getRef,
  onGoToElement,
}: {
  coverage: CoverageReport;
  getRef: GetRef;
  onGoToElement: (id: string) => void;
}) {
  // Empty — no transformation decisions authored yet.
  if (coverage.decisionCount === 0) {
    return (
      <div className="empty-state">
        <p>No transformation decisions yet.</p>
        <p className="empty-hint">
          Coverage appears once decisions are authored. Run the Innovation
          Analyst, or add a transformation decision, to start.
        </p>
      </div>
    );
  }
  // No problems — nothing to cover.
  if (coverage.totalOpen === 0 && coverage.closedExcluded.length === 0) {
    return (
      <div className="empty-state">
        <p>No As-Is problems documented yet.</p>
        <p className="empty-hint">
          There are no pain points, process gaps, control gaps, friction points
          or audit findings to cover — nothing for the target to resolve yet.
        </p>
      </div>
    );
  }

  const errors = coverage.consistency.filter((f) => f.severity === "error");
  const warnings = coverage.consistency.filter((f) => f.severity === "warning");
  const allCovered = coverage.totalOpen > 0 && coverage.uncovered.length === 0;

  // The rollup is the Target-area overview's centerpiece (design D2); the
  // Validation section is the detail — the uncovered list + the findings.
  return (
    <div className="cov-panel">
      {allCovered && (
        <div className="cov-allclear">
          All {coverage.totalOpen} open problems are covered by the target.
        </div>
      )}

      <section className="cov-section">
        <h3 className="cov-section-head">
          Coverage by problem type
          {!allCovered && (
            <>
              {" — "}
              {coverage.uncovered.length} open problem
              {coverage.uncovered.length === 1 ? "" : "s"} no decision resolves
            </>
          )}
        </h3>
        <div className="cov-typegroups">
          {coverage.byType.map((group) => (
            <TypeGroup
              key={group.type}
              group={group}
              getRef={getRef}
              onGoToElement={onGoToElement}
            />
          ))}
        </div>
      </section>

      {coverage.closedExcluded.length > 0 && (
        <p className="cov-note">
          {coverage.closedExcluded.length} closed / resolved problem
          {coverage.closedExcluded.length === 1 ? "" : "s"} excluded from the
          count — already settled, not outstanding transformation work.
        </p>
      )}

      <section className="cov-section">
        <h3 className="cov-section-head">
          Consistency — {coverage.consistency.length} finding
          {coverage.consistency.length === 1 ? "" : "s"}
        </h3>
        {coverage.consistency.length === 0 ? (
          <p className="cov-note">
            No consistency findings — every decision and target state is wired
            cleanly.
          </p>
        ) : (
          <ul className="cov-findings">
            {[...errors, ...warnings].map((f, i) => (
              <li key={i} className={`cov-finding cov-finding-${f.severity}`}>
                <span
                  className={`cov-sev cov-sev-${f.severity}`}
                  title={f.severity}
                />
                <span className="cov-finding-msg">{f.message}</span>
                {f.refs.length > 0 && (
                  <span className="cov-finding-refs">
                    {f.refs.map((id) => (
                      <ProblemChip
                        key={id}
                        id={id}
                        getRef={getRef}
                        onGoToElement={onGoToElement}
                      />
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

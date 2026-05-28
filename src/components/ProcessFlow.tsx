import type { WikiPage } from "@/lib/wiki";
import { type Kind, type Transition, orderSteps, transitionsOf } from "@/lib/stepOrder";
import { UNASSIGNED_ROLE, type FlowAssignment } from "@/lib/process-view";
import ElementHovercard from "./ElementHovercard";

// The process-step flow — a swimlane strip. Steps are ordered left-to-right by
// a topological sort of their `transitions` (see lib/stepOrder) and stacked
// into horizontal lanes by the role that owns them. Lane assignment is
// pre-built by ProcessView (`buildFlowLanes`) and passed in; this component
// renders it. An SVG overlay draws each step's transitions: forward edges,
// conditional branches, loop-backs to an earlier step, and exception exits to
// EX-* elements. Geometry is fixed-size so every coordinate is arithmetic —
// no DOM measurement. The strip scrolls horizontally; the lane label column
// stays pinned.

// A step's review state — drives the per-node status dot.
function stepApproval(s: WikiPage): "approved" | "rejected" | "in-progress" {
  const a = String(s.meta.approval ?? "in-progress");
  return a === "approved" || a === "rejected" ? a : "in-progress";
}

const NODE_W = 158;
const NODE_H = 116;
const GAP_X = 58; // horizontal gap between step columns
const TOP = 16; // top margin above the first lane
const LANE_PAD_TOP = 24; // space above a lane's nodes (hosts same-lane arcs)
const LANE_PAD_BOT = 14; // space below a lane's nodes
const LANE_H = LANE_PAD_TOP + NODE_H + LANE_PAD_BOT;
const LANE_LABEL_W = 132; // pinned role-name column
const EXC_ROW = 40; // height of one stacked exception chip

export default function ProcessFlow({
  steps,
  roles,
  flow,
  onGoToElement,
  onDeepDive,
  knownIds,
  currentId,
  controlsByStep,
  highlight,
}: {
  steps: WikiPage[];
  /** Role elements — used to render lane labels. Lane *assignment* comes from
   *  `flow`; this list is just the lookup table for role titles. */
  roles: WikiPage[];
  /** Pre-built lane assignment for `steps` (from ProcessView.flow, or
   *  `buildFlowLanes(orderSteps(steps), raciGrid)` for a synthesised set). */
  flow: FlowAssignment;
  onGoToElement: (id: string) => void;
  onDeepDive: (id: string, title: string) => void;
  /** Every element id in the process — used to validate transition targets. */
  knownIds: Set<string>;
  /** The step the foundational run's cursor is on, if a run is active. */
  currentId?: string;
  /** Control ids covering each step — uncontrolled steps are flagged. */
  controlsByStep: Record<string, string[]>;
  /** Step ids to highlight — the As-Is steps a selected target theme replaces. */
  highlight?: Set<string>;
}) {
  if (steps.length === 0) return null;
  // Step order comes from the transition graph, not a frontmatter field.
  const sorted = orderSteps(steps);

  const n = sorted.length;
  const indexOf: Record<string, number> = {};
  sorted.forEach((s, i) => (indexOf[s.id] = i));

  // --- Lane layout: read pre-built assignment from `flow`.
  const roleById = new Map(roles.map((r) => [r.id, r]));
  const laneOrder = flow.lanes.map((l) => l.roleId);
  const hasLaneData = laneOrder.some((k) => k !== UNASSIGNED_ROLE);
  const laneOf = (i: number) => flow.stepLane.get(sorted[i].id) ?? 0;

  // --- Geometry: X by step column, Y by lane. ---
  const nodeX = (i: number) => i * (NODE_W + GAP_X);
  const cx = (i: number) => nodeX(i) + NODE_W / 2;
  const nodeTop = (i: number) => TOP + laneOf(i) * LANE_H + LANE_PAD_TOP;
  const nodeBottom = (i: number) => nodeTop(i) + NODE_H;
  const cy = (i: number) => nodeTop(i) + NODE_H / 2;
  const stripW = n * NODE_W + (n - 1) * GAP_X;
  const lanesH = laneOrder.length * LANE_H;

  const parsed = sorted.map(transitionsOf);
  const hasData = parsed.some((t) => t.length > 0);

  // Edges to step targets, and exception exits grouped under their source.
  const stepEdges: { from: number; to: number; t: Transition }[] = [];
  const excByNode: Record<number, Transition[]> = {};
  if (hasData) {
    parsed.forEach((ts, i) => {
      for (const t of ts) {
        const j = indexOf[t.to];
        if (j === undefined) (excByNode[i] ??= []).push(t);
        else stepEdges.push({ from: i, to: j, t });
      }
    });
  } else {
    // No transition data — fall back to a plain linear chain.
    for (let i = 0; i < n - 1; i++)
      stepEdges.push({
        from: i,
        to: i + 1,
        t: { to: sorted[i + 1].id, kind: "normal", when: "" },
      });
  }

  const hasLoops = stepEdges.some((e) => e.to <= e.from);
  const excNodes = Object.keys(excByNode).map(Number);
  const maxExc = excNodes.reduce(
    (m, i) => Math.max(m, excByNode[i].length),
    0,
  );
  const LOOP_BAND = hasLoops ? 78 : 0;
  const EXC_BAND = maxExc > 0 ? 12 + maxExc * EXC_ROW : 0;
  const loopChannelY = TOP + lanesH + LOOP_BAND * 0.55;
  const excTop = TOP + lanesH + LOOP_BAND + 8;
  const totalH = TOP + lanesH + LOOP_BAND + EXC_BAND;

  // A step is conditional when every edge reaching it is a branch — it is
  // never on the normal forward path.
  const incoming: Record<number, Kind[]> = {};
  for (const e of stepEdges) (incoming[e.to] ??= []).push(e.t.kind);
  const isConditional = (i: number) =>
    (incoming[i]?.length ?? 0) > 0 && !incoming[i].includes("normal");

  // Forward edge — a port-to-port curve. Same-lane skips bow up over the
  // intervening node; everything else is a smooth S between lanes.
  const fwdPath = (i: number, j: number) => {
    const x1 = nodeX(i) + NODE_W;
    const y1 = cy(i);
    const x2 = nodeX(j);
    const y2 = cy(j);
    const dx = Math.max(34, Math.min(120, (x2 - x1) * 0.5));
    const bow = laneOf(i) === laneOf(j) && j > i + 1 ? -(NODE_H / 2 + 22) : 0;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1 + bow} ${x2 - dx} ${
      y2 + bow
    } ${x2} ${y2}`;
  };
  // Loop-back — routed under every lane through the bottom channel.
  const loopPath = (i: number, j: number) => {
    const x1 = cx(i);
    const x2 = cx(j);
    return `M ${x1} ${nodeBottom(i)} C ${x1} ${loopChannelY} ${x2} ${loopChannelY} ${x2} ${nodeBottom(j)}`;
  };

  const edges = stepEdges.map((e) => {
    const loop = e.to <= e.from;
    const d = loop ? loopPath(e.from, e.to) : fwdPath(e.from, e.to);
    const lx = (cx(e.from) + cx(e.to)) / 2;
    let ly: number;
    if (loop) ly = loopChannelY;
    else {
      const bow =
        laneOf(e.from) === laneOf(e.to) && e.to > e.from + 1
          ? -(NODE_H / 2 + 22)
          : 0;
      ly = (cy(e.from) + cy(e.to)) / 2 + bow * 0.75;
    }
    return { ...e, loop, d, lx, ly };
  });

  // --- Validation: surface a broken or incomplete graph instead of drawing it
  // silently. Mirrors the RACI matrix's rule warnings. ---
  const hasOutgoing: Record<number, boolean> = {};
  const hasIncoming: Record<number, boolean> = {};
  for (const e of stepEdges) {
    hasOutgoing[e.from] = true;
    hasIncoming[e.to] = true;
  }
  const stepIssues: string[][] = sorted.map((_step, i) => {
    const issues: string[] = [];
    if (!hasOutgoing[i] && i !== n - 1) issues.push("Dead end — no onward step");
    if (i !== 0 && !hasIncoming[i])
      issues.push("Unreachable — no step leads here");
    for (const t of parsed[i]) {
      if (indexOf[t.to] === undefined && !knownIds.has(t.to))
        issues.push(`Unknown target “${t.to}”`);
    }
    return issues;
  });
  const flagged = stepIssues.filter((x) => x.length > 0).length;

  const canvas = (
    <div className="flow-canvas" style={{ width: stripW, height: totalH }}>
      {/* lane stripes */}
      {hasLaneData &&
        laneOrder.map((_k, L) => (
          <div
            key={L}
            className={`flow-lane${L % 2 === 1 ? " is-alt" : ""}`}
            style={{
              left: 0,
              top: TOP + L * LANE_H,
              width: stripW,
              height: LANE_H,
            }}
          />
        ))}
      <svg className="flow-svg" width={stripW} height={totalH}>
        <defs>
          <marker
            id="flow-arrow-a"
            markerWidth="7"
            markerHeight="7"
            refX="5.5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" style={{ fill: "var(--accent)" }} />
          </marker>
          <marker
            id="flow-arrow-m"
            markerWidth="7"
            markerHeight="7"
            refX="5.5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" style={{ fill: "var(--mid)" }} />
          </marker>
        </defs>
        {/* exception connectors — node bottom down to the exception band */}
        {excNodes.map((i) => (
          <path
            key={`exc-${i}`}
            d={`M ${cx(i)} ${nodeBottom(i)} L ${cx(i)} ${excTop}`}
            fill="none"
            style={{ stroke: "var(--lo)" }}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        ))}
        {edges.map((e, idx) => (
          <path
            key={idx}
            d={e.d}
            fill="none"
            style={{ stroke: e.loop ? "var(--mid)" : "var(--accent)" }}
            strokeWidth={1.5}
            strokeDasharray={e.t.kind === "branch" ? "5 3" : undefined}
            markerEnd={`url(#flow-arrow-${e.loop ? "m" : "a"})`}
          />
        ))}
      </svg>

      {/* branch / loop-back condition labels */}
      {edges.map((e, idx) => {
        if (!e.t.when || e.t.kind === "normal") return null;
        return (
          <div
            key={idx}
            className={`flow-elabel flow-elabel-${e.loop ? "loop" : "branch"}`}
            style={{ left: e.lx, top: e.ly }}
          >
            {e.t.when}
          </div>
        );
      })}

      {/* step nodes */}
      {sorted.map((s, i) => {
        const controls = controlsByStep[s.id] ?? [];
        return (
          <div
            key={s.id}
            className={`flow-node${isConditional(i) ? " is-conditional" : ""}${
              stepIssues[i].length > 0 ? " is-warn" : ""
            }${s.id === currentId ? " is-current" : ""}${
              highlight?.has(s.id) ? " is-highlighted" : ""
            }`}
            style={{
              left: nodeX(i),
              top: nodeTop(i),
              width: NODE_W,
              height: NODE_H,
            }}
          >
            <button
              type="button"
              className="flow-node-main"
              onClick={() => onGoToElement(s.id)}
              title={`Go to ${s.id}`}
            >
              <span className="flow-node-top">
                <span className="flow-node-id">{s.id}</span>
                <span
                  className={`flow-node-dot flow-node-dot-${stepApproval(s)}`}
                  title={`Review: ${stepApproval(s)}`}
                />
              </span>
              <ElementHovercard element={s} typeLabel="Process step">
                <span className="flow-node-title">{s.title}</span>
              </ElementHovercard>
              <span
                className={`flow-node-ctl${controls.length ? "" : " none"}`}
                title={
                  controls.length
                    ? `Controls: ${controls.join(", ")}`
                    : "No control covers this step"
                }
              >
                {controls.length
                  ? `⛉ ${controls.length} control${
                      controls.length === 1 ? "" : "s"
                    }`
                  : "no control"}
              </span>
            </button>
            <button
              type="button"
              className="flow-node-dive"
              onClick={() => onDeepDive(s.id, s.title)}
              title={`Deep dive — ${s.id}`}
            >
              ✦ Deep dive
            </button>
            {isConditional(i) && (
              <span className="flow-node-cond">conditional</span>
            )}
            {stepIssues[i].length > 0 && (
              <span
                className="flow-node-warn"
                title={stepIssues[i].join(" · ")}
              >
                !
              </span>
            )}
          </div>
        );
      })}

      {/* exception exits */}
      {excNodes.flatMap((i) =>
        excByNode[i].map((t, ci) => {
          const broken = !knownIds.has(t.to);
          return (
            <button
              key={`${i}-${t.to}`}
              type="button"
              className={`flow-exc${broken ? " is-broken" : ""}`}
              style={{ left: nodeX(i), top: excTop + ci * EXC_ROW, width: NODE_W }}
              onClick={() => onGoToElement(t.to)}
              title={broken ? `Unknown target — ${t.to}` : `Go to ${t.to}`}
            >
              <span className="flow-exc-id">⤷ {t.to}</span>
              {t.when && <span className="flow-exc-when">{t.when}</span>}
            </button>
          );
        }),
      )}
    </div>
  );

  return (
    <div className="flow">
      <h2 className="type-group-head">
        Process Flow
        {flagged > 0 && (
          <span className="flow-warn-count">
            {flagged} step{flagged === 1 ? "" : "s"} with flow issues
          </span>
        )}
      </h2>
      <div className="flow-body">
        {hasLaneData && (
          <div
            className="flow-lane-col"
            style={{ width: LANE_LABEL_W, height: TOP + lanesH }}
          >
            {laneOrder.map((k, L) => {
              const role = roleById.get(k);
              return (
                <div
                  key={k}
                  className={`flow-lane-label${L % 2 === 1 ? " is-alt" : ""}`}
                  style={{ top: TOP + L * LANE_H, height: LANE_H }}
                >
                  {role ? (
                    <button
                      type="button"
                      className="flow-lane-label-btn"
                      onClick={() => onGoToElement(role.id)}
                      title={`Go to ${role.id}`}
                    >
                      {role.title}
                    </button>
                  ) : (
                    <span className="flow-lane-label-none">Unassigned</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="flow-scroll">{canvas}</div>
      </div>
      <div className="flow-legend">
        <span>
          <i className="flow-lg flow-lg-normal" /> Normal path
        </span>
        <span>
          <i className="flow-lg flow-lg-branch" /> Conditional branch
        </span>
        <span>
          <i className="flow-lg flow-lg-loop" /> Loop-back
        </span>
        <span>
          <i className="flow-lg flow-lg-exc" /> Exception exit
        </span>
      </div>
    </div>
  );
}

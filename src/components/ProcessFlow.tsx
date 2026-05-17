import type { WikiPage } from "@/lib/wiki";

// The process-step flow — an enhanced horizontal strip. Steps sit in `sequence`
// order; an SVG overlay draws the real transitions parsed from each step's
// `transitions` frontmatter (`to|kind|when` entries): normal forward edges,
// conditional branches, loop-backs to an earlier step, and exception exits to
// EX-* elements. Geometry is fixed-size so every coordinate is arithmetic —
// no DOM measurement. The strip scrolls horizontally when it overflows.

type Kind = "normal" | "branch" | "loopback" | "exception";
interface Transition {
  to: string;
  kind: Kind;
  when: string;
}

const KINDS: Kind[] = ["normal", "branch", "loopback", "exception"];

function parseTransitions(v: string | string[] | undefined): Transition[] {
  const raw = !v ? [] : Array.isArray(v) ? v : [v];
  const out: Transition[] = [];
  for (const entry of raw) {
    const parts = entry.split("|");
    const to = (parts[0] ?? "").trim();
    if (!to) continue;
    const k = (parts[1] ?? "normal").trim() as Kind;
    out.push({
      to,
      kind: KINDS.includes(k) ? k : "normal",
      when: parts.slice(2).join("|").trim(),
    });
  }
  return out;
}

const NODE_W = 158;
const NODE_H = 96;
const GAP = 58;
const TOP = 58; // band above the nodes for forward-branch arcs
const BOT = 96; // band below for loop-backs and exception chips

export default function ProcessFlow({
  steps,
  onGoToElement,
  onDeepDive,
}: {
  steps: WikiPage[];
  onGoToElement: (id: string) => void;
  onDeepDive: (id: string, title: string) => void;
}) {
  const sorted = [...steps].sort(
    (a, b) => Number(a.meta.sequence ?? 0) - Number(b.meta.sequence ?? 0),
  );
  if (sorted.length === 0) return null;

  const n = sorted.length;
  const indexOf: Record<string, number> = {};
  sorted.forEach((s, i) => (indexOf[s.id] = i));

  const left = (i: number) => i * (NODE_W + GAP);
  const cx = (i: number) => left(i) + NODE_W / 2;
  const stripW = n * NODE_W + (n - 1) * GAP;
  const nodeBottom = TOP + NODE_H;
  const midY = TOP + NODE_H / 2;
  const totalH = TOP + NODE_H + BOT;

  const parsed = sorted.map((s) => parseTransitions(s.meta.transitions));
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

  // A step is conditional when every edge reaching it is a branch — it is
  // never on the normal forward path.
  const incoming: Record<number, Kind[]> = {};
  for (const e of stepEdges) (incoming[e.to] ??= []).push(e.t.kind);
  const isConditional = (i: number) =>
    (incoming[i]?.length ?? 0) > 0 && !incoming[i].includes("normal");

  return (
    <div className="flow">
      <h2 className="type-group-head">Process Flow</h2>
      <div className="flow-scroll">
        <div className="flow-canvas" style={{ width: stripW, height: totalH }}>
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
            {stepEdges.map((e, idx) => {
              const loop = e.to <= e.from;
              const stroke = loop ? "var(--mid)" : "var(--accent)";
              const dash = e.t.kind === "branch" ? "5 3" : undefined;
              let d: string;
              if (e.t.kind === "normal" && e.to === e.from + 1) {
                d = `M ${left(e.from) + NODE_W} ${midY} L ${left(e.to)} ${midY}`;
              } else if (!loop) {
                const ctrlY = e.to === e.from + 1 ? 28 : 4;
                d = `M ${cx(e.from)} ${TOP} Q ${
                  (cx(e.from) + cx(e.to)) / 2
                } ${ctrlY} ${cx(e.to)} ${TOP}`;
              } else {
                d = `M ${cx(e.from)} ${nodeBottom} Q ${
                  (cx(e.from) + cx(e.to)) / 2
                } ${nodeBottom + 72} ${cx(e.to)} ${nodeBottom}`;
              }
              return (
                <path
                  key={idx}
                  d={d}
                  fill="none"
                  style={{ stroke }}
                  strokeWidth={1.5}
                  strokeDasharray={dash}
                  markerEnd={`url(#flow-arrow-${loop ? "m" : "a"})`}
                />
              );
            })}
          </svg>

          {/* branch / loop-back condition labels */}
          {stepEdges.map((e, idx) => {
            if (!e.t.when || e.t.kind === "normal") return null;
            const loop = e.to <= e.from;
            const lx = (cx(e.from) + cx(e.to)) / 2;
            const ly = loop
              ? nodeBottom + 46
              : e.to === e.from + 1
                ? 36
                : 14;
            return (
              <div
                key={idx}
                className={`flow-elabel flow-elabel-${loop ? "loop" : "branch"}`}
                style={{ left: lx, top: ly }}
              >
                {e.t.when}
              </div>
            );
          })}

          {/* step nodes */}
          {sorted.map((s, i) => (
            <div
              key={s.id}
              className={`flow-node${isConditional(i) ? " is-conditional" : ""}`}
              style={{ left: left(i), top: TOP, width: NODE_W, height: NODE_H }}
            >
              <button
                type="button"
                className="flow-node-main"
                onClick={() => onGoToElement(s.id)}
                title={`Go to ${s.id}`}
              >
                <span className="flow-node-id">{s.id}</span>
                <span className="flow-node-title">{s.title}</span>
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
            </div>
          ))}

          {/* exception exits */}
          {Object.entries(excByNode).flatMap(([k, ts]) =>
            ts.map((t, ci) => {
              const i = Number(k);
              return (
                <button
                  key={`${k}-${t.to}`}
                  type="button"
                  className="flow-exc"
                  style={{
                    left: left(i),
                    top: nodeBottom + 12 + ci * 40,
                    width: NODE_W,
                  }}
                  onClick={() => onGoToElement(t.to)}
                  title={`Go to ${t.to}`}
                >
                  <span className="flow-exc-id">⤷ {t.to}</span>
                  {t.when && <span className="flow-exc-when">{t.when}</span>}
                </button>
              );
            }),
          )}
        </div>
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

import type { WikiPage } from "@/lib/wiki";

// The process-step sequence as a flow strip. Lives at the top of the Process
// Steps section; clicking a step scrolls to that step's card.
export default function ProcessFlow({ steps }: { steps: WikiPage[] }) {
  const sorted = [...steps].sort(
    (a, b) => Number(a.meta.sequence ?? 0) - Number(b.meta.sequence ?? 0),
  );
  if (sorted.length === 0) return null;

  return (
    <div className="flow">
      <h2 className="type-group-head">Process Flow</h2>
      <div className="flow-strip">
        {sorted.map((s, i) => (
          <div className="flow-item" key={s.id}>
            <button
              type="button"
              className="flow-step"
              onClick={() =>
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              <span className="flow-id">{s.id}</span>
              <span className="flow-title">{s.title}</span>
            </button>
            {i < sorted.length - 1 && <span className="flow-arrow">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

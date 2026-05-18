"use client";

import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// Target synthesis — the whole future process at a glance, at the top of the
// TO-BE Process Design section. The To-Be is authored as overlapping thematic
// narratives, so on their own they never show the process end to end. This
// maps the As-Is process spine (every step, in order) onto the target themes
// that change it — a derived As-Is → To-Be diff. Steps no theme touches show
// "Unchanged", so the stable part of the process is visible too.

function seq(p: WikiPage): number {
  return Number(p.meta.sequence ?? 0);
}

function asList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default function TargetSynthesis({
  steps,
  themes,
  onGoToElement,
}: {
  /** As-Is process-step elements. */
  steps: WikiPage[];
  /** target-state theme elements. */
  themes: WikiPage[];
  onGoToElement: (id: string) => void;
}) {
  const sorted = [...steps].sort((a, b) => seq(a) - seq(b));
  if (sorted.length === 0) return null;

  // As-Is step id → the target themes whose `replaces` names it.
  const themesByStep: Record<string, WikiPage[]> = {};
  for (const t of themes) {
    for (const stepId of asList(t.meta.replaces)) {
      (themesByStep[stepId] ??= []).push(t);
    }
  }
  const changed = sorted.filter(
    (s) => (themesByStep[s.id]?.length ?? 0) > 0,
  ).length;

  return (
    <section className="tsyn">
      <h2 className="type-group-head">Target synthesis</h2>
      <p className="tsyn-sub">
        The As-Is process, step by step, mapped onto the target themes that
        change it. <strong>{changed}</strong> of {sorted.length} steps change;{" "}
        {sorted.length - changed} stay as-is.
      </p>
      <ul className="tsyn-rows">
        {sorted.map((s) => {
          const ts = themesByStep[s.id] ?? [];
          return (
            <li
              key={s.id}
              className={`tsyn-row${ts.length === 0 ? " tsyn-row-unchanged" : ""}`}
            >
              <span className="tsyn-asis">
                <ElementHovercard element={s} typeLabel="Process step">
                  <button
                    type="button"
                    className="link-chip link-chip-nav"
                    onClick={() => onGoToElement(s.id)}
                  >
                    {s.id}
                  </button>
                </ElementHovercard>
                <span className="tsyn-asis-title">{s.title}</span>
              </span>
              <span className="tsyn-arrow" aria-hidden="true">
                →
              </span>
              <span className="tsyn-target">
                {ts.length === 0 ? (
                  <span className="tsyn-unchanged">Unchanged</span>
                ) : (
                  ts.map((t) => (
                    <ElementHovercard
                      key={t.id}
                      element={t}
                      typeLabel="To-Be theme"
                    >
                      <button
                        type="button"
                        className="link-chip link-chip-nav tsyn-theme"
                        onClick={() => onGoToElement(t.id)}
                      >
                        <span className="tsyn-theme-id">{t.id}</span>
                        <span className="tsyn-theme-title">{t.title}</span>
                      </button>
                    </ElementHovercard>
                  ))
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

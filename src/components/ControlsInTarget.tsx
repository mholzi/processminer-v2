"use client";

import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// Controls in the target — every As-Is control, and what becomes of it in the
// target state. A control is anchored to a process-step (`step`); a target
// theme `replaces` steps. Crossing the two derives each control's disposition:
//   reworked  — its step is replaced by a theme; the control must be
//               re-designed and re-verified inside the new design.
//   carried   — its step is untouched by any theme; the control carries over.
//   unanchored — the control names no step, so its fate can't be derived —
//               it needs a manual call.
// This is a derived diff, like TargetSynthesis — nothing is stored.

import { asList } from "@/lib/meta";

type Disposition = "reworked" | "carried" | "unanchored";

interface ControlRow {
  control: WikiPage;
  steps: string[];
  themes: WikiPage[];
  disposition: Disposition;
}

const GROUPS: { key: Disposition; label: string; blurb: string }[] = [
  {
    key: "reworked",
    label: "Reworked by the target",
    blurb:
      "Their As-Is step is replaced by a target theme — each control must be re-designed and re-verified inside the new design.",
  },
  {
    key: "carried",
    label: "Carried over unchanged",
    blurb:
      "No target theme touches their step — these controls carry over into the target as they are today.",
  },
  {
    key: "unanchored",
    label: "Not yet mapped",
    blurb:
      "These controls name no process step, so their target disposition can't be derived — review each one by hand.",
  },
];

export default function ControlsInTarget({
  controls,
  themes,
  onGoToElement,
}: {
  /** As-Is `control` elements. */
  controls: WikiPage[];
  /** target-state theme elements. */
  themes: WikiPage[];
  onGoToElement: (id: string) => void;
}) {
  if (controls.length === 0) return null;

  // As-Is step id → the target themes whose `replaces` names it.
  const themesByStep: Record<string, WikiPage[]> = {};
  for (const t of themes) {
    for (const stepId of asList(t.meta.replaces)) {
      (themesByStep[stepId] ??= []).push(t);
    }
  }

  const rows: ControlRow[] = [...controls]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((control) => {
      const steps = asList(control.meta.step);
      const seen = new Set<string>();
      const themesFor: WikiPage[] = [];
      for (const s of steps) {
        for (const t of themesByStep[s] ?? []) {
          if (!seen.has(t.id)) {
            seen.add(t.id);
            themesFor.push(t);
          }
        }
      }
      const disposition: Disposition =
        steps.length === 0
          ? "unanchored"
          : themesFor.length > 0
            ? "reworked"
            : "carried";
      return { control, steps, themes: themesFor, disposition };
    });

  const reworked = rows.filter((r) => r.disposition === "reworked").length;

  return (
    <section className="cit">
      <h2 className="type-group-head">Controls in the target</h2>
      <p className="cit-sub">
        Every As-Is control, and what becomes of it in the target.{" "}
        <strong>{reworked}</strong> of {rows.length} control
        {rows.length === 1 ? "" : "s"} {reworked === 1 ? "is" : "are"} reworked
        by a target theme.
      </p>
      {GROUPS.map((group) => {
        const groupRows = rows.filter((r) => r.disposition === group.key);
        if (groupRows.length === 0) return null;
        return (
          <div key={group.key} className="cit-group">
            <div className="cit-group-head">
              <span className="cit-group-label">{group.label}</span>
              <span className="cit-group-count">{groupRows.length}</span>
            </div>
            <p className="cit-group-blurb">{group.blurb}</p>
            <ul className="cit-rows">
              {groupRows.map(({ control, themes: themesFor }) => (
                <li key={control.id} className="cit-row">
                  <span className="cit-control">
                    <ElementHovercard element={control} typeLabel="Control">
                      <button
                        type="button"
                        className="link-chip link-chip-nav"
                        onClick={() => onGoToElement(control.id)}
                      >
                        {control.id}
                      </button>
                    </ElementHovercard>
                    <span className="cit-control-title">{control.title}</span>
                  </span>
                  {themesFor.length > 0 && (
                    <>
                      <span className="cit-arrow" aria-hidden="true">
                        →
                      </span>
                      <span className="cit-themes">
                        {themesFor.map((t) => (
                          <ElementHovercard
                            key={t.id}
                            element={t}
                            typeLabel="To-Be theme"
                          >
                            <button
                              type="button"
                              className="link-chip link-chip-nav cit-theme"
                              onClick={() => onGoToElement(t.id)}
                            >
                              <span className="cit-theme-id">{t.id}</span>
                              <span className="cit-theme-title">{t.title}</span>
                            </button>
                          </ElementHovercard>
                        ))}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

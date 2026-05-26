"use client";

import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// Worst-first bar list above the pain-point cards. Approved variant D:
// 4 px coloured left bar (red/amber/green/grey by severity), ID + title +
// category sub-line, priority pill, affected step IDs as clickable chips.
// Ordered HIGH → MEDIUM → LOW → NONE → missing, tie-broken by priority.

type Severity = "HIGH" | "MEDIUM" | "LOW" | "NONE";
type Priority = "P1" | "P2" | "P3";

const SEV_ORDER: Record<Severity | "MISSING", number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
  NONE: 3,
  MISSING: 4,
};
const PRI_ORDER: Record<Priority | "MISSING", number> = {
  P1: 0,
  P2: 1,
  P3: 2,
  MISSING: 3,
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function parseSeverity(raw: string): Severity | null {
  const v = raw.trim().toUpperCase();
  if (v === "HIGH" || v === "MEDIUM" || v === "LOW" || v === "NONE") return v;
  return null;
}

function parsePriority(raw: string): Priority | null {
  const v = raw.trim().toUpperCase();
  if (v === "P1" || v === "P2" || v === "P3") return v;
  return null;
}

function affectsOf(meta: Record<string, unknown>): string[] {
  const a = meta.affects;
  if (Array.isArray(a)) return a.map(String).filter(Boolean);
  if (typeof a === "string" && a.trim()) return [a.trim()];
  return [];
}

export default function PainPointsSummary({
  painPoints,
  onPickElement,
  getRef,
}: {
  painPoints: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
}) {
  if (painPoints.length === 0) return null;

  // Sort copy — never mutate the prop. Worst (HIGH + P1) first.
  const sorted = [...painPoints].sort((a, b) => {
    const sa = parseSeverity(str(a.meta.severity)) ?? "MISSING";
    const sb = parseSeverity(str(b.meta.severity)) ?? "MISSING";
    if (SEV_ORDER[sa] !== SEV_ORDER[sb]) return SEV_ORDER[sa] - SEV_ORDER[sb];
    const pa = parsePriority(str(a.meta.priority)) ?? "MISSING";
    const pb = parsePriority(str(b.meta.priority)) ?? "MISSING";
    return PRI_ORDER[pa] - PRI_ORDER[pb];
  });

  const highN = sorted.filter((p) => parseSeverity(str(p.meta.severity)) === "HIGH").length;
  const medN = sorted.filter((p) => parseSeverity(str(p.meta.severity)) === "MEDIUM").length;
  const lowN = sorted.filter((p) => parseSeverity(str(p.meta.severity)) === "LOW").length;

  return (
    <section className="pps-wrap">
      <div className="pps-head">
        <span className="pps-eyebrow">Worst first</span>
        <span className="pps-sub">
          {sorted.length} pain point{sorted.length === 1 ? "" : "s"} ·{" "}
          {highN} HIGH · {medN} MEDIUM · {lowN} LOW
        </span>
      </div>
      <div className="pps-bars">
        {sorted.map((p) => {
          const sev = parseSeverity(str(p.meta.severity));
          const pri = parsePriority(str(p.meta.priority));
          const category = str(p.meta.category);
          const affects = affectsOf(p.meta);
          const sevClass = sev ? sev.toLowerCase() : "none";
          const ref = getRef?.(p.id);

          const rowInner = (
            <>
              <div className={`pps-sev-bar pps-sev-${sevClass}`} />
              <div className="pps-id">{p.id}</div>
              <div className="pps-name-cell">
                <div className="pps-name">{p.title}</div>
                {category && <div className="pps-name-sub">{category}</div>}
              </div>
              <div className="pps-pri-cell">
                {pri && (
                  <span className={`pps-pill pps-pill-${pri.toLowerCase()}`}>
                    {pri}
                  </span>
                )}
              </div>
              <div
                className="pps-affects-cell"
                onClick={(e) => e.stopPropagation()}
              >
                {affects.map((stepId) => {
                  const stepRef = getRef?.(stepId);
                  const chip = (
                    <button
                      key={stepId}
                      type="button"
                      className="pps-affect-chip"
                      onClick={() => onPickElement?.(stepId)}
                      title={`Jump to ${stepId}`}
                    >
                      {stepId}
                    </button>
                  );
                  return stepRef ? (
                    <ElementHovercard
                      key={stepId}
                      element={stepRef.page}
                      typeLabel={stepRef.typeLabel}
                    >
                      {chip}
                    </ElementHovercard>
                  ) : (
                    chip
                  );
                })}
              </div>
            </>
          );

          const row = (
            <div
              className="pps-row"
              role="button"
              tabIndex={0}
              onClick={() => onPickElement?.(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPickElement?.(p.id);
                }
              }}
              title={`Jump to ${p.id}`}
            >
              {rowInner}
            </div>
          );

          return ref ? (
            <ElementHovercard
              key={p.id}
              element={ref.page}
              typeLabel={ref.typeLabel}
            >
              {row}
            </ElementHovercard>
          ) : (
            <div key={p.id}>{row}</div>
          );
        })}
      </div>
    </section>
  );
}

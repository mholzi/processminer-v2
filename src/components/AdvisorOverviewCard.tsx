"use client";

import { Fragment, useMemo, useState } from "react";
import type { ProcessDoc } from "@/lib/wiki";

// Deterministic process-overview card — the approved "variant D" layout
// (narrative + deep-link rail), but every word is computed from a ProcessDoc the
// dashboard already holds. No model turn, no fetch, no loading state. Same
// process → identical card, real counts, working links. The advisor never
// produces this; the app does. D's prose judgment is reconstructed from the
// section counts so it keeps its voice without an LLM.

type SectionStat = {
  section: string;
  label: string;
  count: number;
  confirmed: number;
  ratio: number;
};

const VISIBLE_PILLS = 6;

function prettify(section: string): string {
  return section.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function metaStr(v: string | string[] | undefined): string | null {
  if (!v) return null;
  const s = Array.isArray(v) ? v.join(", ") : v;
  const t = s.trim();
  return t ? t : null;
}

const tierOf = (s: SectionStat) =>
  s.count === 0 ? "lo" : s.ratio === 1 ? "hi" : s.ratio >= 0.6 ? "mid" : "lo";

export default function AdvisorOverviewCard({
  doc,
  onOpenProcess,
}: {
  doc: ProcessDoc;
  onOpenProcess?: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const vm = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, { count: number; confirmed: number }>();
    for (const e of doc.elements) {
      const key = e.section || e.type || "other";
      if (!map.has(key)) {
        map.set(key, { count: 0, confirmed: 0 });
        order.push(key);
      }
      const cur = map.get(key)!;
      cur.count += 1;
      if (e.status === "confirmed") cur.confirmed += 1;
    }
    const sections: SectionStat[] = order.map((section) => {
      const { count, confirmed } = map.get(section)!;
      return {
        section,
        label: prettify(section),
        count,
        confirmed,
        ratio: count ? confirmed / count : 0,
      };
    });
    const total = doc.elements.length;
    const confirmed = doc.elements.filter((e) => e.status === "confirmed").length;
    const pct = total ? Math.round((confirmed / total) * 100) : 0;

    const gaps = sections
      .filter((s) => s.count > 0 && s.confirmed < s.count)
      .sort((a, b) => a.ratio - b.ratio);
    const strong = sections
      .filter((s) => s.count > 0 && s.confirmed === s.count)
      .sort((a, b) => b.count - a.count);
    const notStarted = gaps.filter((s) => s.confirmed === 0);
    const partial = gaps.filter((s) => s.confirmed > 0);

    // Rail order: gaps first (where the work is), then confirmed, by size.
    const railOrder = [...gaps, ...strong];

    return { sections, total, confirmed, pct, gaps, strong, notStarted, partial, railOrder };
  }, [doc]);

  const meta = doc.process.meta;
  let owner = metaStr(meta.processOwner) ?? metaStr(meta.owner);
  if (owner && /^[A-Z]{2,}-/.test(owner)) {
    const role = doc.elements.find((e) => e.id === owner);
    if (role?.title) owner = role.title;
  }
  const freq = metaStr(meta.frequency);
  const facts = [
    doc.process.id,
    owner,
    freq,
    doc.lastModified ? `updated ${relTime(doc.lastModified)}` : null,
  ].filter(Boolean);

  // Inline section link (D's `.il` chips) — clickable, opens the process.
  const sec = (s: SectionStat) => (
    <button
      key={s.section}
      type="button"
      className="ab-ovc-il"
      onClick={() => onOpenProcess?.(doc.slug)}
      title={`${s.label} — ${s.confirmed}/${s.count} confirmed`}
    >
      {s.label.toLowerCase()} <span className="c">{s.confirmed}/{s.count}</span>
    </button>
  );
  // Render a list of section links with comma / "and" joining.
  const list = (arr: SectionStat[]) =>
    arr.map((s, i) => (
      <Fragment key={s.section}>
        {i > 0 && (i === arr.length - 1 ? " and " : ", ")}
        {sec(s)}
      </Fragment>
    ));

  const railVisible = expanded ? vm.railOrder : vm.railOrder.slice(0, VISIBLE_PILLS);
  const hidden = vm.railOrder.length - railVisible.length;

  return (
    <div className="ab-ovc">
      <div className="ab-ovc-meta">{facts.join(" · ")}</div>

      <div className="ab-ovc-narr">
        <p>
          <b>{doc.process.title}</b> — {vm.pct}% confirmed ({vm.confirmed} of{" "}
          {vm.total} elements).
          {vm.strong.length > 0 && (
            <> The as-is is solid — {list(vm.strong.slice(0, 2))} confirmed.</>
          )}
        </p>
        {(vm.partial.length > 0 || vm.notStarted.length > 0) && (
          <p>
            {vm.partial.length > 0 && (
              <>The thinnest {vm.partial.length === 1 ? "area is" : "areas are"}{" "}
              {list(vm.partial.slice(0, 3))}.</>
            )}
            {vm.notStarted.length > 0 && (
              <> Not started yet: {list(vm.notStarted.slice(0, 3))}.</>
            )}
          </p>
        )}
      </div>

      <div className="ab-ovc-rail">
        <div className="ab-ovc-rail-l">Jump to</div>
        {railVisible.map((s) => (
          <button
            key={s.section}
            type="button"
            className={`ab-ovc-pill t-${tierOf(s)}`}
            onClick={() => onOpenProcess?.(doc.slug)}
            title={`${s.label} — ${s.confirmed}/${s.count} confirmed`}
          >
            {s.label}
            <span className="c">{s.confirmed}/{s.count}</span>
          </button>
        ))}
        {hidden > 0 && (
          <button type="button" className="ab-ovc-more" onClick={() => setExpanded(true)}>
            +{hidden} more
          </button>
        )}
        {expanded && vm.railOrder.length > VISIBLE_PILLS && (
          <button type="button" className="ab-ovc-more" onClick={() => setExpanded(false)}>
            show less
          </button>
        )}
      </div>

      <button
        type="button"
        className="ab-ovc-open"
        onClick={() => onOpenProcess?.(doc.slug)}
      >
        Open {doc.process.id} →
      </button>
    </div>
  );
}

// Compact relative time, same shape as the rest of the dashboard ("2d ago").
function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, (Date.now() - then) / 1000);
  if (s < 90) return "just now";
  const m = s / 60;
  if (m < 90) return `${Math.round(m)}m ago`;
  const h = m / 60;
  if (h < 36) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

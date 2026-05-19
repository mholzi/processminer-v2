import { Fragment } from "react";
import type { ProcessDoc, Schema, WikiPage } from "@/lib/wiki";
import Markdown from "@/components/Markdown";
import PrintElement from "@/components/print/PrintElement";
import { elementApproved, elementStatus } from "@/lib/element-format";
import PrintExhibits from "@/components/print/PrintExhibits";
import PrintToolbar from "./PrintToolbar";

export interface PrintScope {
  /** Selected area ids, kept in schema order by the caller. */
  areaIds: string[];
  status: "all" | "approved" | "draft";
  summaries: boolean;
  glossary: boolean;
  /** Include the process flow diagram in the As-Is area. */
  flow: boolean;
  /** Include the RACI matrix in the As-Is area. */
  raci: boolean;
  /** Name of the SME who generated the export, for the cover. */
  by: string;
}

const STATUS_LABEL: Record<PrintScope["status"], string> = {
  all: "All elements",
  approved: "Approved elements only",
  draft: "Draft elements only",
};

// The full export document — cover, contents, overview, then each selected
// area with its sections and elements. Pure deterministic render of the
// process wiki; no AI, no interactivity beyond the print toolbar.
export default function PrintDocument({
  doc,
  schema,
  scope,
}: {
  doc: ProcessDoc;
  schema: Schema;
  scope: PrintScope;
}) {
  // id → title, for "ID (Name)" references.
  const titleById = new Map<string, string>();
  titleById.set(doc.process.id, doc.process.title);
  for (const e of doc.elements) titleById.set(e.id, e.title);
  const refOf = (id: string) => {
    const t = titleById.get(id);
    return t ? `${id} (${t})` : id;
  };

  // Areas in schema order, limited to the selected ids.
  const areas = schema.areas.filter((a) => scope.areaIds.includes(a.id));

  const keep = (p: WikiPage) =>
    scope.status === "all"
      ? true
      : scope.status === "approved"
        ? elementApproved(p)
        : !elementApproved(p);

  // Visible elements grouped by section.
  const bySection = new Map<string, WikiPage[]>();
  for (const e of doc.elements) {
    if (!keep(e)) continue;
    const arr = bySection.get(e.section) ?? [];
    arr.push(e);
    bySection.set(e.section, arr);
  }
  const typeOrder = Object.keys(schema.elementTypes);
  const sortEls = (arr: WikiPage[]) =>
    [...arr].sort((a, b) => {
      const ta = typeOrder.indexOf(a.type);
      const tb = typeOrder.indexOf(b.type);
      if (ta !== tb) return ta - tb;
      return a.id.localeCompare(b.id);
    });

  const draftCount = doc.elements.filter(
    (e) => keep(e) && !elementApproved(e),
  ).length;

  // Data for the As-Is visual exhibits (process flow + RACI). The flow shows
  // every step regardless of the status filter — a partial flow would mislead.
  const showExhibits = scope.flow || scope.raci;
  const steps = doc.elements.filter((e) => e.type === "process-step");
  const roles = doc.elements.filter((e) => e.type === "role");
  const controlsByStep: Record<string, string[]> = {};
  for (const el of doc.elements) {
    if (el.type !== "control") continue;
    const raw = el.meta.step;
    const stepIds = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const stepId of stepIds) {
      if (stepId) (controlsByStep[stepId] ??= []).push(el.id);
    }
  }
  const elementIds = doc.elements.map((e) => e.id);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const docId = `${doc.slug}-${now
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 12)}`;

  const overviewStatus = elementStatus(doc.process);

  return (
    <div className="print-page">
      <PrintToolbar />
      <div className="print-doc">
        {/* ---- Cover ---- */}
        <section className="print-cover">
          <div className="print-cover-kicker">Process Documentation</div>
          <h1 className="print-cover-title">{doc.process.title}</h1>
          <div className="print-cover-id">{doc.process.id}</div>
          <dl className="print-cover-meta">
            <div>
              <dt>Scope</dt>
              <dd>
                {areas.map((a) => a.label).join(", ")} ·{" "}
                {STATUS_LABEL[scope.status]}
              </dd>
            </div>
            <div>
              <dt>Generated</dt>
              <dd>
                {dateStr}
                {scope.by ? ` by ${scope.by}` : ""}
              </dd>
            </div>
            <div>
              <dt>Document ID</dt>
              <dd>{docId}</dd>
            </div>
          </dl>
          {draftCount > 0 && (
            <p className="print-cover-draft">
              Contains {draftCount} draft element
              {draftCount === 1 ? "" : "s"} — not yet approved.
            </p>
          )}
          <p className="print-cover-note">
            This document is for review. Please give feedback by section number
            and element ID.
          </p>
        </section>

        {/* ---- Contents ---- */}
        <section className="print-toc">
          <h2>Contents</h2>
          <ul>
            <li className="print-toc-area">Process Overview</li>
            {areas.map((a, ai) => (
              <Fragment key={a.id}>
                <li className="print-toc-area">
                  {ai + 1}  {a.label}
                </li>
                {a.sections.map((s, si) => (
                  <li className="print-toc-section" key={s.id}>
                    {ai + 1}.{si + 1}  {s.label}
                  </li>
                ))}
              </Fragment>
            ))}
            {scope.glossary && doc.glossary && doc.glossary.length > 0 && (
              <li className="print-toc-area">Glossary</li>
            )}
          </ul>
        </section>

        {/* ---- Process overview ---- */}
        <section className="print-section print-overview">
          <h2>Process Overview</h2>
          <div className="print-el-status">{overviewStatus.label}</div>
          {doc.process.blocks.map((b) => (
            <div className="print-el-block" key={b.heading}>
              <h5>{b.heading}</h5>
              <Markdown text={b.text} />
            </div>
          ))}
        </section>

        {/* ---- Areas ---- */}
        {areas.map((a, ai) => {
          const summary = scope.summaries ? doc.summaries?.[a.id] : undefined;
          return (
            <section className="print-area" key={a.id}>
              <h2 className="print-area-head">
                {ai + 1}  {a.label}
              </h2>

              {summary && summary.parts.length > 0 && (
                <div className="print-summary">
                  <h3>Executive Summary</h3>
                  {summary.parts.map((p) => (
                    <div className="print-el-block" key={p.heading}>
                      <h5>{p.heading}</h5>
                      <Markdown text={p.text} />
                    </div>
                  ))}
                </div>
              )}

              {a.id === "as-is" && showExhibits && (
                <PrintExhibits
                  steps={steps}
                  roles={roles}
                  elementIds={elementIds}
                  controlsByStep={controlsByStep}
                  flow={scope.flow}
                  raci={scope.raci}
                />
              )}

              {a.sections.map((s, si) => {
                const els = sortEls(bySection.get(s.id) ?? []);
                const sectionStatus = doc.sectionStatus?.[s.id];
                return (
                  <section className="print-section" key={s.id}>
                    <h3>
                      {ai + 1}.{si + 1}  {s.label}
                    </h3>
                    {s.description && (
                      <p className="print-section-desc">{s.description}</p>
                    )}
                    {els.length === 0 ? (
                      <p className="print-empty">
                        No elements documented in this section.
                        {sectionStatus?.status === "confirmed-empty"
                          ? " Confirmed empty by the SME."
                          : ""}
                      </p>
                    ) : (
                      els.map((e) => (
                        <PrintElement
                          key={e.id}
                          page={e}
                          schema={schema}
                          refOf={refOf}
                        />
                      ))
                    )}
                  </section>
                );
              })}
            </section>
          );
        })}

        {/* ---- Glossary ---- */}
        {scope.glossary && doc.glossary && doc.glossary.length > 0 && (
          <section className="print-area print-glossary">
            <h2 className="print-area-head">Glossary</h2>
            <dl>
              {doc.glossary.map((g) => (
                <div key={g.term}>
                  <dt>{g.term}</dt>
                  <dd>{g.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}

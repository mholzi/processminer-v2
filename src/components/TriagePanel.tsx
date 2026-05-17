"use client";

import type { ProcessDoc, Schema } from "@/lib/wiki";

// The post-ingest triage screen. Shows what the last document-ingest produced,
// the review state of the wiki, and launches (or resumes) the foundational
// run — the guided, AI-challenged walk through the As-Is elements.
export default function TriagePanel({
  doc,
  schema,
  onStartRun,
  onResolveConflicts,
  onGoToElement,
}: {
  doc: ProcessDoc;
  schema: Schema;
  onStartRun: () => void;
  onResolveConflicts: () => void;
  onGoToElement: (id: string) => void;
}) {
  const ingest = doc.ingest;
  const rs = doc.reviewState;

  // Confidence spread across the drafted elements.
  const conf = { high: 0, medium: 0, low: 0 };
  for (const e of doc.elements) {
    const c = String(e.meta.confidence ?? "");
    if (c === "high" || c === "medium" || c === "low") conf[c] += 1;
  }

  // Unreviewed = the overview plus every element not yet approved.
  const pages = [doc.process, ...doc.elements];
  const unreviewed = pages.filter(
    (p) => String(p.meta.approval ?? "in-progress") !== "approved",
  ).length;

  // Sections the ingest left empty.
  const sections = schema.areas
    .flatMap((a) => a.sections)
    .filter((s) => s.id !== "overview");
  const empty = sections.filter(
    (s) => doc.elements.filter((e) => e.section === s.id).length === 0,
  );

  const conflicts = ingest?.conflicts ?? [];
  const corrections = ingest?.corrections ?? [];

  const stats = [
    { label: "Created", value: ingest?.created.length ?? doc.elements.length },
    { label: "Updated", value: ingest?.updated.length ?? 0 },
    { label: "Unreviewed", value: unreviewed },
    { label: "Low confidence", value: conf.low },
    { label: "Conflicts", value: conflicts.length },
    { label: "Empty sections", value: empty.length },
  ];

  const runState = !rs
    ? "not-started"
    : rs.done
      ? "done"
      : "in-progress";

  return (
    <div className="triage">
      {ingest && (
        <p className="triage-lead">
          Ingested from <strong>{ingest.file}</strong> —{" "}
          {ingest.created.length} element(s) created. Verification corrected{" "}
          {corrections.length}. Review them with the foundational run below.
        </p>
      )}

      <div className="triage-stats">
        {stats.map((s) => (
          <div className="triage-stat" key={s.label}>
            <span className="triage-stat-value">{s.value}</span>
            <span className="triage-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Foundational run launch / resume */}
      <div className="triage-run">
        <div className="triage-run-text">
          <strong>Foundational run</strong>
          <span>
            {runState === "not-started" &&
              "A meticulous walk through every As-Is element — the AI challenges each one with you, then you approve it."}
            {runState === "in-progress" &&
              `In progress — item ${rs!.cursor + 1} of ${rs!.total}. Pick up where you left off.`}
            {runState === "done" &&
              `Complete — all ${rs!.total} items walked. Deferred elements are still on the cards.`}
          </span>
        </div>
        {runState !== "done" && (
          <button className="triage-run-btn" onClick={onStartRun}>
            {runState === "in-progress"
              ? `Resume · ${rs!.cursor} / ${rs!.total}`
              : "Start foundational run"}
          </button>
        )}
      </div>

      {conflicts.length > 0 && (
        <section className="triage-block">
          <div className="triage-block-head">
            <h2 className="type-group-head">Conflicts — {conflicts.length}</h2>
            <button className="triage-resolve-btn" onClick={onResolveConflicts}>
              Resolve conflicts
            </button>
          </div>
          <p className="triage-note">
            The document contradicted the wiki here — the assistant walks you
            through each, document version versus wiki version.
          </p>
          {conflicts.map((c, i) => (
            <div className="triage-conflict" key={`${c.element}-${i}`}>
              <button
                className="link-chip"
                onClick={() => onGoToElement(c.element)}
              >
                {c.element}
              </button>
              <span className="triage-conflict-field">{c.field}</span>
              <div className="triage-conflict-versions">
                <div>
                  <span className="triage-tag">document</span> {c.documentSays}
                </div>
                <div>
                  <span className="triage-tag">wiki</span> {c.wikiSays}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {corrections.length > 0 && (
        <section className="triage-block">
          <h2 className="type-group-head">
            Verification corrections — {corrections.length}
          </h2>
          <p className="triage-note">
            Claims the source document did not support — removed before the
            drafts were written.
          </p>
          {corrections.map((c, i) => (
            <div className="triage-correction" key={`${c.element}-${i}`}>
              <button
                className="link-chip"
                onClick={() => onGoToElement(c.element)}
              >
                {c.element}
              </button>
              <span className="triage-conflict-field">{c.field}</span>
              <span className="triage-correction-text">removed: {c.removed}</span>
            </div>
          ))}
        </section>
      )}

      {empty.length > 0 && (
        <section className="triage-block">
          <h2 className="type-group-head">
            Not covered — {empty.length} empty section(s)
          </h2>
          <p className="triage-note">
            The document held nothing for these — fill them with a session
            later.
          </p>
          <div className="triage-empty-list">
            {empty.map((s) => (
              <span className="triage-empty" key={s.id}>
                {s.label}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

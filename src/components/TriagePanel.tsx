"use client";

import type { ProcessDoc, Schema } from "@/lib/wiki";

// The post-ingest triage screen. A provenance-first split: an ingest "receipt"
// on the left records what the last document-ingest produced and launches (or
// resumes) the foundational run; a grouped worklist on the right ranks what
// still needs the SME — conflicts first, then low-confidence drafts, then the
// sections the document never covered.
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
    const c = String(e.confidence ?? e.meta.confidence ?? "");
    if (c === "high" || c === "medium" || c === "low") conf[c] += 1;
  }
  const confTotal = conf.high + conf.medium + conf.low;

  // Sections the ingest left empty.
  const sections = schema.areas
    .flatMap((a) => a.sections)
    .filter((s) => s.id !== "overview");
  const empty = sections.filter(
    (s) => doc.elements.filter((e) => e.section === s.id).length === 0,
  );

  const conflicts = ingest?.conflicts ?? [];
  const corrections = ingest?.corrections ?? [];
  const lowConf = doc.elements.filter(
    (e) => String(e.confidence ?? e.meta.confidence ?? "") === "low",
  );

  const titleOf = (id: string) =>
    doc.elements.find((e) => e.id === id)?.title ??
    (id === doc.process.id ? doc.process.title : id);

  const created = ingest?.created?.length ?? doc.elements.length;
  const updated = ingest?.updated?.length ?? 0;

  const runState = !rs ? "not-started" : rs.done ? "done" : "in-progress";
  const worklistCount = conflicts.length + lowConf.length + empty.length;

  const receiptRows: { label: string; value: number; warn?: boolean }[] = [
    { label: "Elements created", value: created },
    { label: "Elements updated", value: updated },
    { label: "Verification corrections", value: corrections.length },
    { label: "Conflicts flagged", value: conflicts.length, warn: conflicts.length > 0 },
    { label: "Sections untouched", value: empty.length },
  ];

  return (
    <div className="triage">
      {/* ---- Ingest receipt ---- */}
      <aside className="triage-receipt">
        <div className="triage-receipt-head">
          <div className="triage-receipt-lbl">Import record</div>
          <div className="triage-receipt-file">
            {ingest?.file ?? "No document imported"}
          </div>
          {ingest && (
            <div className="triage-receipt-when">
              {new Date(ingest.generatedAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          )}
        </div>

        <div className="triage-rrows">
          {receiptRows.map((r) => (
            <div className="triage-rrow" key={r.label}>
              <span className="triage-rk">{r.label}</span>
              <span className={`triage-rv${r.warn ? " warn" : ""}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {confTotal > 0 && (
          <div className="triage-conf">
            <div className="triage-conf-top">
              <span>Draft confidence</span>
              <span>{confTotal} drafts</span>
            </div>
            <div className="triage-confbar">
              {conf.high > 0 && (
                <i className="hi" style={{ flex: conf.high }} />
              )}
              {conf.medium > 0 && (
                <i className="mid" style={{ flex: conf.medium }} />
              )}
              {conf.low > 0 && <i className="lo" style={{ flex: conf.low }} />}
            </div>
            <div className="triage-conf-leg">
              <span>
                <i style={{ background: "var(--hi)" }} />
                High {conf.high}
              </span>
              <span>
                <i style={{ background: "var(--mid)" }} />
                Medium {conf.medium}
              </span>
              <span>
                <i style={{ background: "var(--lo)" }} />
                Low {conf.low}
              </span>
            </div>
          </div>
        )}

        <div className="triage-receipt-foot">
          {runState !== "done" ? (
            <>
              <button className="triage-run-btn" onClick={onStartRun}>
                {runState === "in-progress"
                  ? `Resume foundational run · ${rs!.cursor} / ${rs!.total}`
                  : `Start foundational run · ${doc.elements.length + 1} items`}
              </button>
              <div className="triage-receipt-note">
                {runState === "in-progress"
                  ? `In progress — pick up at item ${rs!.cursor + 1} of ${rs!.total}.`
                  : "A guided walk — the AI challenges each element, then you approve it."}
              </div>
            </>
          ) : (
            <div className="triage-receipt-note">
              Foundational run complete — all {rs!.total} items walked.
            </div>
          )}
        </div>
      </aside>

      {/* ---- Worklist ---- */}
      <section className="triage-worklist">
        <div className="triage-wl-head">
          <h2>Worklist</h2>
          <span className="triage-wl-ct">{worklistCount} items</span>
        </div>
        <p className="triage-wl-sub">
          Everything the import left for you to decide — handled top to bottom.
        </p>

        {worklistCount === 0 ? (
          <div className="empty-state">
            <p>Nothing outstanding — the import left no open items.</p>
            <p className="empty-hint">
              No conflicts, no low-confidence drafts, every section covered.
            </p>
          </div>
        ) : (
          <>
            {conflicts.length > 0 && (
              <>
                <div className="triage-group">
                  <span className="triage-gdot conflict" />
                  Conflicts — resolve first
                  <button
                    className="triage-group-btn"
                    onClick={onResolveConflicts}
                  >
                    Resolve conflicts
                  </button>
                </div>
                {conflicts.map((c, i) => (
                  <button
                    className="triage-item"
                    key={`${c.element}-${c.field}-${i}`}
                    onClick={() => onGoToElement(c.element)}
                  >
                    <span className="triage-item-id">{c.element}</span>
                    <span className="triage-item-main">
                      <span className="triage-item-nm">
                        {titleOf(c.element)}
                      </span>
                      <span className="triage-item-why">
                        Document says <b>{c.documentSays}</b>; the
                        documentation holds <b>{c.wikiSays}</b> for {c.field}.
                      </span>
                    </span>
                    <span className="triage-item-go">Resolve →</span>
                  </button>
                ))}
              </>
            )}

            {lowConf.length > 0 && (
              <>
                <div className="triage-group">
                  <span className="triage-gdot low" />
                  Low-confidence drafts
                </div>
                {lowConf.map((e) => (
                  <button
                    className="triage-item"
                    key={e.id}
                    onClick={() => onGoToElement(e.id)}
                  >
                    <span className="triage-item-id">{e.id}</span>
                    <span className="triage-item-main">
                      <span className="triage-item-nm">{e.title}</span>
                      <span className="triage-item-why">
                        Drafted with low confidence — verify it against the
                        source before approving.
                      </span>
                    </span>
                    <span className="triage-item-go">Review →</span>
                  </button>
                ))}
              </>
            )}

            {empty.length > 0 && (
              <>
                <div className="triage-group">
                  <span className="triage-gdot empty" />
                  Not covered — fill later
                </div>
                <div className="triage-item triage-item-static">
                  <div className="triage-empty-row">
                    {empty.map((s) => (
                      <span className="triage-empty" key={s.id}>
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

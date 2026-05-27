import type { Schema, WikiPage } from "@/lib/wiki";
import Markdown from "@/components/Markdown";
import { elementStatus } from "@/lib/element-format";

// One element, rendered for the print/export document — read-only, fully
// expanded, every reference shown as "ID (Name)" so it reads on paper.

function asList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default function PrintElement({
  page,
  schema,
  refOf,
}: {
  page: WikiPage;
  schema: Schema;
  /** Resolve an element id to its "ID (Name)" reference label. */
  refOf: (id: string) => string;
}) {
  const type = schema.elementTypes[page.type];
  const typeLabel = type?.label ?? page.type;
  const status = elementStatus(page);
  const fields = type?.frontmatter?.fields ?? [];
  const relations = type?.frontmatter?.relations ?? [];

  const transitions = page.transitions ?? [];

  return (
    <article className="print-element">
      <header className="print-el-head">
        <h4 className="print-el-title">
          {typeLabel} · {page.id} ({page.title})
        </h4>
        {status.draft && <span className="print-draft">DRAFT</span>}
      </header>
      <div className="print-el-status">{status.label}</div>

      {page.blocks.length > 0
        ? page.blocks.map((b) => (
            <div className="print-el-block" key={b.heading}>
              <h5>{b.heading}</h5>
              <Markdown text={b.text} />
            </div>
          ))
        : page.body && <Markdown text={page.body} />}

      {fields.some((f) => page.meta[f.key]) && (
        <div className="print-el-fields">
          {fields.map((f) => {
            const v = page.meta[f.key];
            if (!v) return null;
            return (
              <span className="print-el-field" key={f.key}>
                <b>{f.label}:</b> {String(v)}
                {f.suffix ?? ""}
              </span>
            );
          })}
        </div>
      )}

      {relations.map((r) => {
        const ids = asList(page.meta[r.key]);
        if (ids.length === 0) return null;
        return (
          <div className="print-el-rel" key={r.key}>
            <span className="print-rel-label">{r.label}:</span>{" "}
            {ids.map(refOf).join("  ·  ")}
          </div>
        );
      })}

      {transitions.length > 0 && (
        <div className="print-el-rel">
          <span className="print-rel-label">Transitions:</span>{" "}
          {transitions.map((t, i) => (
            <span key={`${t.to}-${i}`}>
              {i > 0 ? "  ·  " : ""}→ {refOf(t.to)} [{t.kind}
              {t.when ? `: ${t.when}` : ""}]
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

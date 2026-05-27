"use client";

import Markdown from "./Markdown";
import Tooltip from "./Tooltip";
import RelativeTime from "./RelativeTime";
import { parseProvenance } from "@/lib/conformance";
import { useDisplayName } from "@/lib/user-roster-client";
import type { Schema, WikiPage } from "@/lib/wiki";
import type { GetRef } from "@/lib/linkify";

// Read-only renderer for one wiki element. Used by ArchitectMiner's
// "Inputs from Processminer" view so the architect sees the same content
// in the same shape Processminer renders, without the edit / approval /
// notes machinery (those live in Processminer).
//
// What this carries that the old inline render didn't:
//   - per-block provenance pills (SME / DOC / WEB / PROPOSED / LEGACY)
//   - frontmatter fields (e.g. `direction` on a Process Dependency)
//   - frontmatter relations as ID chips (e.g. `atStep: PS-…` / `viaSystem: SYS-…`)
//   - updatedBy + updatedAt stamp
//   - "Open in Processminer ↗" link that hands the slug to the parent
//     workspace switcher
//
// What it does NOT carry (deliberately — those are Processminer's job):
//   - edit / save
//   - approval mutation (it shows the current approval, not the control)
//   - comments / notes thread
//   - inline lint findings

const PROV_LABEL: Record<string, string> = {
  elicited: "SME",
  document: "DOC",
  proposed: "PROPOSED",
  web: "WEB",
  "legacy-approved": "LEGACY",
};
function provTooltip(source: string, evidence?: string): string {
  const ev = (evidence ?? "").trim();
  switch (source) {
    case "elicited":
      return ev ? `Confirmed by the SME: "${ev}"` : "Confirmed by the SME";
    case "document":
      return ev
        ? `From the source document: "${ev}"`
        : "From the source document";
    case "web":
      return ev ? `Web-sourced — ${ev}` : "Web-sourced — not yet SME-confirmed";
    case "proposed":
      return "AI-proposed — not yet confirmed by the SME";
    case "legacy-approved":
      return "Approved before provenance tracking began";
    default:
      return source;
  }
}

export default function ReadOnlyElementCard({
  page,
  schema,
  slug,
  onOpenInProcessminer,
  onGoToElement,
  getRef,
}: {
  page: WikiPage;
  schema: Schema;
  slug: string;
  /** Switch to the Processminer workspace on this slug, opened at this
   *  element. Omit to hide the "Open in Processminer" link. */
  onOpenInProcessminer?: (slug: string, elementId: string) => void;
  /** Optional same-process cross-reference handler — clicking a relation
   *  chip (e.g. atStep PS-FR-002) jumps to that element. */
  onGoToElement?: (id: string) => void;
  /** When set, element-id mentions inside the prose render as hovercard
   *  chips — same treatment as chat refs and capability chips. */
  getRef?: GetRef;
}) {
  const provenance = parseProvenance(page);
  const typeSpec = schema.elementTypes[page.type];
  const fieldSpecs = typeSpec?.frontmatter?.fields ?? [];
  const relationSpecs = typeSpec?.frontmatter?.relations ?? [];
  const typeLabel = typeSpec?.label ?? page.type;

  const confidence =
    typeof page.meta.confidence === "string" ? page.meta.confidence : null;
  const status = page.status; // "confirmed" | "draft" | "empty"

  const updatedBy =
    typeof page.meta.updatedBy === "string" ? page.meta.updatedBy : "";
  const updatedAt =
    typeof page.meta.updatedAt === "string" ? page.meta.updatedAt : "";

  return (
    <article
      className={`el${status === "draft" ? " draft" : ""}`}
      id={page.id}
    >
      <div className="el-top">
        <span className="el-id">{page.id}</span>
        {confidence && (
          <Tooltip label={`${confidence} confidence`}>
            <span className={`el-conf-dot conf-${confidence}`} />
          </Tooltip>
        )}
        <label
          className={`approval approval-${
            status === "confirmed" ? "approved" : "none"
          }`}
          style={{ pointerEvents: "none" }}
          title="Read-only — authored in Processminer"
        >
          <span className="statusctl-dot" aria-hidden="true" />
          <span className="statusctl-label">
            {status === "confirmed" ? "Confirmed" : "Draft"}
          </span>
        </label>
        <span className="el-id" style={{ marginLeft: "auto" }}>
          {typeLabel}
        </span>
        {onOpenInProcessminer && (
          <button
            type="button"
            className="el-pm-link"
            onClick={() => onOpenInProcessminer(slug, page.id)}
            title={`Open ${page.id} in Processminer to edit, comment, or see lint findings`}
          >
            Open in Processminer ↗
          </button>
        )}
      </div>

      <div className="el-title">{page.title}</div>

      <FieldsAndRelations
        page={page}
        fieldSpecs={fieldSpecs}
        relationSpecs={relationSpecs}
        onGoToElement={onGoToElement}
      />

      {page.blocks.length > 0 ? (
        <div className="el-blocks">
          {page.blocks.map((b) => {
            const pv = provenance[b.heading];
            const src =
              pv && typeof pv.source === "string" ? pv.source : undefined;
            return (
              <div
                className={`el-block${src ? ` prov-${src}` : ""}`}
                key={b.heading}
              >
                <div className="el-block-head">
                  <span className="el-block-head-name">{b.heading}</span>
                  {src && PROV_LABEL[src] && (
                    <Tooltip label={provTooltip(src, pv?.evidence)}>
                      <span className={`el-prov-tag prov-${src}`}>
                        {PROV_LABEL[src]}
                      </span>
                    </Tooltip>
                  )}
                </div>
                <div className="el-block-text">
                  <Markdown text={b.text} getRef={getRef} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        page.body && (
          <div className="el-body">
            <Markdown text={page.body} getRef={getRef} />
          </div>
        )
      )}

      {(updatedBy || updatedAt) && (
        <div className="el-ro-meta">
          {updatedBy && <UpdatedBy by={updatedBy} />}
          {updatedAt && (
            <>
              {updatedBy ? " · " : ""}
              <RelativeTime ts={updatedAt} />
            </>
          )}
        </div>
      )}
    </article>
  );
}

function UpdatedBy({ by }: { by: string }) {
  return <span>Updated by {useDisplayName(by)}</span>;
}

function FieldsAndRelations({
  page,
  fieldSpecs,
  relationSpecs,
  onGoToElement,
}: {
  page: WikiPage;
  fieldSpecs: { key: string; label: string; suffix?: string; urlKey?: string }[];
  relationSpecs: { key: string; label: string }[];
  onGoToElement?: (id: string) => void;
}) {
  const fieldsToShow = fieldSpecs.filter((f) => page.meta[f.key]);
  const relationsToShow = relationSpecs
    .map((r) => {
      const raw = page.meta[r.key];
      const ids = Array.isArray(raw)
        ? raw.map(String).filter(Boolean)
        : typeof raw === "string" && raw
          ? [raw]
          : [];
      return { ...r, ids };
    })
    .filter((r) => r.ids.length > 0);

  if (fieldsToShow.length === 0 && relationsToShow.length === 0) return null;

  return (
    <div className="el-fields">
      {fieldsToShow.map((f) => {
        const val = page.meta[f.key];
        const text = `${String(val)}${f.suffix ?? ""}`;
        const url = f.urlKey ? page.meta[f.urlKey] : undefined;
        return (
          <span className="el-field" key={f.key}>
            {f.label}:{" "}
            {typeof url === "string" && url ? (
              <a href={url} target="_blank" rel="noreferrer">
                {text}
              </a>
            ) : (
              <span>{text}</span>
            )}
          </span>
        );
      })}
      {relationsToShow.map((r) => (
        <span className="el-field" key={r.key}>
          {r.label}:{" "}
          {r.ids.map((id, i) => (
            <span key={id}>
              {i > 0 ? ", " : null}
              {onGoToElement ? (
                <button
                  type="button"
                  className="el-relchip"
                  onClick={() => onGoToElement(id)}
                >
                  {id}
                </button>
              ) : (
                <span className="el-relchip">{id}</span>
              )}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

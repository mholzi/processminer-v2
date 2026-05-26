"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { WikiPage } from "@/lib/wiki";
import { isSourcedType } from "@/lib/element-types";
import { saveElement } from "@/lib/wiki-write";
import Markdown from "./Markdown";
import ApprovalBar from "./ApprovalBar";
import ApprovalControl from "./ApprovalControl";
import Tooltip from "./Tooltip";

// The Overview — a roll-up dashboard, not free text. Three blocks:
// Process Facts · Review Progress · Purpose.
// (The process-flow strip lives in the Process Steps section.)

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

const FACT_FIELDS = [
  { key: "trigger", label: "Trigger" },
  { key: "frequency", label: "Frequency" },
  { key: "scopeIn", label: "In Scope" },
  { key: "scopeOut", label: "Out of Scope" },
  { key: "processInput", label: "Input" },
  { key: "processOutput", label: "Output" },
] as const;

export default function OverviewPanel({
  process,
  elements,
  slug,
  onNavigate,
  resolveSection,
  onDeepDive,
  onSaved,
}: {
  process: WikiPage;
  elements: WikiPage[];
  slug: string;
  onNavigate: (section: string) => void;
  resolveSection: (id: string) => string | null;
  /** When set, the ✦ button kicks a Brainstorm deep dive on the Overview. */
  onDeepDive?: (id: string, title: string) => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState(process.body);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const fv: Record<string, string> = {
      processOwner: str(process.meta.processOwner),
    };
    for (const f of FACT_FIELDS) fv[f.key] = str(process.meta[f.key]);
    return fv;
  });

  function startEdit() {
    setError(null);
    setBody(process.body);
    const fv: Record<string, string> = {
      processOwner: str(process.meta.processOwner),
    };
    for (const f of FACT_FIELDS) fv[f.key] = str(process.meta[f.key]);
    setFieldValues(fv);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await saveElement(slug, process.id, {
          title: process.title,
          fields: fieldValues,
          blocks: process.blocks.map((b) => ({
            heading: b.heading,
            text: b.text,
          })),
          body,
        });
        setEditing(false);
        router.refresh();
        onSaved?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  const owner = str(process.meta.processOwner);
  const ownerSection = owner ? resolveSection(owner) : null;

  // Provenance — the document(s) this process was documented from.
  const sourcesText = Array.isArray(process.meta.sources)
    ? process.meta.sources.join(", ")
    : str(process.meta.sources);

  // Per-card footer — Save/Cancel while editing, ✦ Deep dive + ✎ Edit while
  // reading. Rendered identically at the bottom of Purpose and Process Facts
  // so each card carries its own affordance (and any save error surfaces
  // next to the buttons the SME is looking at). The approval control sits
  // on the left; both card footers point at the same single approval state
  // on the process, so changing one updates both after router.refresh.
  const approvalControl = (
    <ApprovalControl
      slug={slug}
      id={process.id}
      approval={String(process.meta.approval ?? "in-progress")}
      approvalBy={
        process.meta.approvalBy ? String(process.meta.approvalBy) : null
      }
      approvalDate={
        process.meta.approvalDate ? String(process.meta.approvalDate) : null
      }
      onSaved={onSaved}
    />
  );
  const actionButtons = (
    <>
      {approvalControl}
      {error && <span className="el-edit-err">{error}</span>}
      <div className="el-actions">
        {editing ? (
          <>
            <button className="act ai" onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button className="act" onClick={cancel} disabled={pending}>
              Cancel
            </button>
          </>
        ) : (
          <>
            {onDeepDive && (
              <Tooltip label="Deep dive — brainstorm the Overview with the assistant">
                <button
                  className="act ai act-icon"
                  onClick={() => onDeepDive(process.id, process.title)}
                  aria-label="Deep dive"
                >
                  ✦
                </button>
              </Tooltip>
            )}
            <Tooltip label="Edit yourself">
              <button
                className="act act-icon"
                onClick={startEdit}
                aria-label="Edit yourself"
              >
                ✎
              </button>
            </Tooltip>
          </>
        )}
      </div>
    </>
  );

  const facts: { label: string; value: string; key?: string }[] = [
    { label: "Trigger", value: str(process.meta.trigger), key: "trigger" },
    { label: "Frequency", value: str(process.meta.frequency), key: "frequency" },
    { label: "In Scope", value: str(process.meta.scopeIn), key: "scopeIn" },
    { label: "Out of Scope", value: str(process.meta.scopeOut), key: "scopeOut" },
    { label: "Input", value: str(process.meta.processInput), key: "processInput" },
    { label: "Output", value: str(process.meta.processOutput), key: "processOutput" },
    { label: "Sources", value: sourcesText },
  ];

  return (
    <div className="ovw">
      {/* Purpose — the orientation: what this process is, read first */}
      <section>
        <h2 className="type-group-head">Purpose</h2>
        <div className="ovw-purpose">
          {editing ? (
            <textarea
              className="el-edit-text el-edit-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              disabled={pending}
            />
          ) : (
            <Markdown text={process.body} />
          )}
          <div className="ovw-card-foot">{actionButtons}</div>
        </div>
      </section>

      {/* Process Facts */}
      <section>
        <h2 className="type-group-head">Process Facts</h2>
        <dl className="ovw-facts">
          <div className="ovw-fact">
            <dt>Process Owner</dt>
            <dd>
              {editing ? (
                <input
                  className="el-edit-text"
                  type="text"
                  value={fieldValues.processOwner ?? ""}
                  onChange={(e) =>
                    setFieldValues((fv) => ({
                      ...fv,
                      processOwner: e.target.value,
                    }))
                  }
                  disabled={pending}
                />
              ) : owner ? (
                ownerSection ? (
                  <button
                    type="button"
                    className="link-chip link-chip-nav"
                    onClick={() => onNavigate(ownerSection)}
                  >
                    {owner}
                  </button>
                ) : (
                  owner
                )
              ) : (
                "—"
              )}
            </dd>
          </div>
          {facts.map((f) => {
            // A value joined with " · " is a multi-value fact — list it.
            const parts = f.value
              .split(" · ")
              .map((s) => s.trim())
              .filter(Boolean);
            const editable = editing && f.key !== undefined;
            return (
              <div className="ovw-fact" key={f.label}>
                <dt>{f.label}</dt>
                <dd>
                  {editable ? (
                    <input
                      className="el-edit-text"
                      type="text"
                      value={fieldValues[f.key!] ?? ""}
                      onChange={(e) =>
                        setFieldValues((fv) => ({
                          ...fv,
                          [f.key!]: e.target.value,
                        }))
                      }
                      disabled={pending}
                    />
                  ) : parts.length > 1 ? (
                    <ul className="ovw-fact-list">
                      {parts.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    f.value || "—"
                  )}
                </dd>
              </div>
            );
          })}
          <div className="ovw-card-foot">{actionButtons}</div>
        </dl>
      </section>

      {/* Review Progress */}
      <section>
        <h2 className="type-group-head">Review Progress</h2>
        <div className="ovw-progress">
          <ApprovalBar
            elements={[
              process,
              ...elements.filter((e) => !isSourcedType(e.type)),
            ]}
            showLegend
          />
        </div>
      </section>

    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { WikiPage } from "@/lib/wiki";
import { isSourcedType } from "@/lib/element-types";
import { updateElement } from "@/lib/wiki-write";
import Markdown from "./Markdown";
import ApprovalBar from "./ApprovalBar";
import ApprovalControl from "./ApprovalControl";

// The Overview — a roll-up dashboard, not free text. Three blocks:
// Process Facts · Review Progress · Purpose. The Purpose + Facts are editable
// (R12); editing re-opens the overview's approval (handled server-side).

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

// The editable overview content fields, in display order. `sources` is omitted —
// it is provenance (the documents this process was drawn from), not user input.
const FACT_FIELDS = [
  { key: "processOwner", label: "Process Owner" },
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
  userName,
  onNavigate,
  resolveSection,
  onSaved,
}: {
  process: WikiPage;
  elements: WikiPage[];
  slug: string;
  userName: string;
  onNavigate: (section: string) => void;
  resolveSection: (id: string) => string | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Draft state, seeded from the current overview content.
  const seed = () => ({
    description: process.body,
    ...Object.fromEntries(
      FACT_FIELDS.map((f) => [f.key, str(process.meta[f.key])]),
    ),
  });
  const [draft, setDraft] = useState<Record<string, string>>(seed);

  function startEdit() {
    setDraft(seed());
    setError(null);
    setEditing(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateElement(slug, process.id, { content: { ...draft } });
      if (!res.ok) {
        setError(res.error || "Could not save the overview.");
        return;
      }
      setEditing(false);
      router.refresh();
      onSaved?.();
    });
  }

  const owner = str(process.meta.processOwner);
  const ownerSection = owner ? resolveSection(owner) : null;

  const sourcesText = Array.isArray(process.meta.sources)
    ? process.meta.sources.join(", ")
    : str(process.meta.sources);

  const facts: { label: string; value: string }[] = [
    { label: "Trigger", value: str(process.meta.trigger) },
    { label: "Frequency", value: str(process.meta.frequency) },
    { label: "In Scope", value: str(process.meta.scopeIn) },
    { label: "Out of Scope", value: str(process.meta.scopeOut) },
    { label: "Input", value: str(process.meta.processInput) },
    { label: "Output", value: str(process.meta.processOutput) },
    { label: "Sources", value: sourcesText },
  ];

  return (
    <div className="ovw">
      {/* Overview review status — the overview is approvable like an element */}
      <div className="ovw-review">
        <span className="ovw-review-label">Overview review</span>
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
          userName={userName}
          onSaved={onSaved}
        />
        {!editing && (
          <button type="button" className="ovw-edit-btn" onClick={startEdit}>
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <section className="ovw-edit">
          <label className="ovw-field">
            <span className="ovw-field-label">Purpose</span>
            <textarea
              rows={5}
              value={draft.description ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              disabled={pending}
            />
          </label>
          {FACT_FIELDS.map((f) => (
            <label className="ovw-field" key={f.key}>
              <span className="ovw-field-label">{f.label}</span>
              <input
                type="text"
                value={draft[f.key] ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                }
                disabled={pending}
              />
            </label>
          ))}
          {error && <p className="ovw-error">{error}</p>}
          <div className="ovw-edit-actions">
            <button
              type="button"
              className="ovw-save-btn"
              onClick={save}
              disabled={pending}
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="ovw-cancel-btn"
              onClick={() => setEditing(false)}
              disabled={pending}
            >
              Cancel
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Purpose — the orientation: what this process is, read first */}
          <section>
            <h2 className="type-group-head">Purpose</h2>
            <div className="ovw-purpose">
              <Markdown text={process.body} />
            </div>
          </section>

          {/* Process Facts */}
          <section>
            <h2 className="type-group-head">Process Facts</h2>
            <dl className="ovw-facts">
              <div className="ovw-fact">
                <dt>Process Owner</dt>
                <dd>
                  {owner ? (
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
                const parts = f.value
                  .split(" · ")
                  .map((s) => s.trim())
                  .filter(Boolean);
                return (
                  <div className="ovw-fact" key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>
                      {parts.length > 1 ? (
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
            </dl>
          </section>
        </>
      )}

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

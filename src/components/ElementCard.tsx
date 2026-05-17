"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BlockSpec, WikiPage } from "@/lib/wiki";
import { isSourcedType } from "@/lib/element-types";
import { checkElement } from "@/lib/conformance";
import { saveElement, setApproval, setRelevance } from "@/lib/wiki-write";
import Markdown from "./Markdown";

/** Human-readable spec line for one template block. */
function specText(b: BlockSpec): string {
  if (b.format === "bullets") {
    return `Bullets · ${b.items ?? "—"} items`;
  }
  const bits: string[] = [];
  if (b.paragraphs)
    bits.push(`${b.paragraphs} paragraph${b.paragraphs === "1" ? "" : "s"}`);
  if (b.words) bits.push(`${b.words} words`);
  return bits.length ? `Paragraph · ${bits.join(" · ")}` : "Paragraph";
}

// Per-type display config: which frontmatter fields to show, and which fields
// hold the n:m relations (rendered as wiki-page link chips).
type Field = {
  label: string;
  key: string;
  suffix?: string;
  /** When set, the field value links to the URL held in this meta key. */
  urlKey?: string;
};
type Link = { label: string; key: string };
const TYPE_CONFIG: Record<string, { fields: Field[]; links: Link[] }> = {
  "process-step": {
    fields: [
      { label: "Owner", key: "owner" },
      { label: "SLA", key: "sla" },
      { label: "Condition", key: "condition" },
    ],
    links: [
      { label: "Systems", key: "systems" },
      // `controls` is not a stored field — supplied via derivedLinks.
      { label: "Controls", key: "controls" },
    ],
  },
  exception: {
    fields: [
      { label: "Category", key: "category" },
      { label: "Frequency", key: "frequencyPct", suffix: "%" },
      { label: "Impact", key: "impact" },
      { label: "Handling", key: "handlingOwner" },
    ],
    links: [{ label: "Affects", key: "affects" }],
  },
  control: {
    fields: [
      { label: "Type", key: "controlType" },
      { label: "Execution", key: "execution" },
      { label: "Effectiveness", key: "effectiveness" },
      { label: "Owner", key: "owner" },
    ],
    links: [
      { label: "Step", key: "step" },
      { label: "Regulated by", key: "regulatedBy" },
    ],
  },
  regulation: {
    fields: [{ label: "Domain", key: "domain" }],
    links: [{ label: "Controls", key: "controls" }],
  },
  "compliance-gap": {
    fields: [
      { label: "Severity", key: "severity" },
      { label: "Status", key: "gapStatus" },
    ],
    links: [{ label: "Control", key: "control" }],
  },
  "audit-finding": {
    fields: [
      { label: "Audit", key: "auditDate" },
      { label: "Status", key: "findingStatus" },
      { label: "Severity", key: "severity" },
    ],
    links: [],
  },
  "pain-point": {
    fields: [
      { label: "Category", key: "category" },
      { label: "Severity", key: "severity" },
      { label: "Priority", key: "priority" },
    ],
    links: [{ label: "Affects", key: "affects" }],
  },
  "friction-point": {
    fields: [{ label: "Severity", key: "severity" }],
    links: [
      { label: "Occurs at", key: "occursAt" },
      { label: "Pain point", key: "painPoint" },
      { label: "Addressed by", key: "addressedBy" },
    ],
  },
  "cx-touchpoint": {
    fields: [
      { label: "Channel", key: "channel" },
      { label: "Client Effort Score", key: "ces", suffix: " / 7" },
    ],
    links: [{ label: "Step", key: "occursAt" }],
  },
  moment: {
    fields: [{ label: "Sentiment", key: "sentiment" }],
    links: [{ label: "Touchpoint", key: "touchpoint" }],
  },
  "cx-channel": {
    fields: [{ label: "Type", key: "channelType" }],
    links: [{ label: "Touchpoints", key: "touchpoints" }],
  },
  role: {
    fields: [],
    links: [
      { label: "Systems", key: "systems" },
      { label: "Controls", key: "controls" },
    ],
  },
  metric: {
    fields: [
      { label: "Value", key: "value" },
      { label: "Trend", key: "trend" },
    ],
    links: [],
  },
  "process-gap": {
    fields: [
      { label: "Area", key: "area" },
      { label: "Status", key: "gapStatus" },
    ],
    links: [],
  },
  "innovation-idea": {
    fields: [
      { label: "Category", key: "category" },
      { label: "Strategic fit", key: "strategicFit" },
      { label: "Complexity", key: "complexity" },
    ],
    links: [
      { label: "Addresses", key: "addresses" },
      { label: "From trend", key: "fromTrend" },
      { label: "From competitor", key: "fromCompetitor" },
    ],
  },
  "market-trend": {
    fields: [
      { label: "Horizon", key: "horizon" },
      { label: "Sourced", key: "asOf" },
      { label: "Source", key: "source", urlKey: "sourceUrl" },
    ],
    links: [{ label: "Bears on", key: "bearsOn" }],
  },
  "competitor-eu": {
    fields: [
      { label: "Competitor", key: "competitor" },
      { label: "Sourced", key: "asOf" },
      { label: "Source", key: "source", urlKey: "sourceUrl" },
    ],
    links: [{ label: "Bears on", key: "bearsOn" }],
  },
  "competitor-global": {
    fields: [
      { label: "Competitor", key: "competitor" },
      { label: "Sourced", key: "asOf" },
      { label: "Source", key: "source", urlKey: "sourceUrl" },
    ],
    links: [{ label: "Bears on", key: "bearsOn" }],
  },
  "competitor-fintech": {
    fields: [
      { label: "Competitor", key: "competitor" },
      { label: "Sourced", key: "asOf" },
      { label: "Source", key: "source", urlKey: "sourceUrl" },
    ],
    links: [{ label: "Bears on", key: "bearsOn" }],
  },
  "competitor-cx-eu": {
    fields: [
      { label: "Competitor", key: "competitor" },
      { label: "Sourced", key: "asOf" },
      { label: "Source", key: "source", urlKey: "sourceUrl" },
    ],
    links: [],
  },
  "competitor-cx-global": {
    fields: [
      { label: "Competitor", key: "competitor" },
      { label: "Sourced", key: "asOf" },
      { label: "Source", key: "source", urlKey: "sourceUrl" },
    ],
    links: [],
  },
  "competitor-cx-fintech": {
    fields: [
      { label: "Competitor", key: "competitor" },
      { label: "Sourced", key: "asOf" },
      { label: "Source", key: "source", urlKey: "sourceUrl" },
    ],
    links: [],
  },
  "cx-benchmark": {
    fields: [
      { label: "Sourced", key: "asOf" },
      { label: "Source", key: "source", urlKey: "sourceUrl" },
    ],
    links: [],
  },
  "innovation-risk": { fields: [{ label: "Severity", key: "severity" }], links: [] },
  "target-state": { fields: [], links: [{ label: "Replaces", key: "replaces" }] },
  "transformation-decision": {
    fields: [
      { label: "Type", key: "decisionType" },
      { label: "Status", key: "decisionStatus" },
    ],
    links: [],
  },
  gap: {
    fields: [
      { label: "Area", key: "validationArea" },
      { label: "Status", key: "gapStatus" },
    ],
    links: [],
  },
  system: {
    fields: [{ label: "Type", key: "systemType" }],
    links: [
      { label: "Steps", key: "steps" },
      { label: "Integrates with", key: "integrates" },
    ],
  },
  integration: {
    fields: [],
    links: [{ label: "Systems", key: "systems" }],
  },
};

function asList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default function ElementCard({
  page,
  slug,
  userName,
  typeLabel,
  template,
  onGoToElement,
  onDeepDive,
  onSaved,
  resolveSection,
  defaultCollapsed,
  isCurrent,
  derivedLinks,
}: {
  page: WikiPage;
  slug: string;
  userName: string;
  typeLabel: string;
  template?: BlockSpec[];
  onGoToElement?: (id: string) => void;
  onDeepDive?: (id: string, title: string) => void;
  onSaved?: () => void;
  resolveSection?: (id: string) => string | null;
  defaultCollapsed?: boolean;
  /** True when the foundational run's cursor is on this element. */
  isCurrent?: boolean;
  /** Relations computed by the parent — override the stored frontmatter. */
  derivedLinks?: Record<string, string[]>;
}) {
  const [showTemplate, setShowTemplate] = useState(false);
  // Collapsed cards show only their header row, so a long section is a
  // scannable list. Long sections open collapsed (see `defaultCollapsed`).
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);

  // Live template-conformance check for this element (deterministic, cheap).
  const checks = template ? checkElement(page, template) : [];
  const issueCount = checks.filter((c) => !c.ok).length;
  const cfg = TYPE_CONFIG[page.type] ?? { fields: [], links: [] };

  // Typed outgoing relations (process-step `transitions`): `to|kind|when`.
  // The flat fields/links models can't carry a kind + a condition, so these
  // render in their own block.
  const TRANSITION_KINDS = ["normal", "branch", "loopback", "exception"];
  const transitions = asList(page.meta.transitions)
    .map((entry) => {
      const parts = entry.split("|");
      const kind = (parts[1] ?? "normal").trim();
      return {
        to: (parts[0] ?? "").trim(),
        kind: TRANSITION_KINDS.includes(kind) ? kind : "normal",
        when: parts.slice(2).join("|").trim(),
      };
    })
    .filter((t) => t.to);

  const isDraft = page.status === "draft";
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Per-element review — controlled by the wiki, updated optimistically.
  // Documentation elements are "approved"; web-sourced / ideated elements
  // (trends, competitors, ideas, benchmarks) are triaged "relevant /
  // disregard". One control, two models.
  const sourced = isSourcedType(page.type);
  const reviewField = sourced ? "relevance" : "approval";
  const reviewOptions = sourced
    ? [
        { value: "", label: "To review" },
        { value: "relevant", label: "Relevant" },
        { value: "disregarded", label: "Disregard" },
      ]
    : [
        { value: "in-progress", label: "In progress" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ];
  const serverReview = String(
    page.meta[reviewField] ?? (sourced ? "" : "in-progress"),
  );
  const reviewBy = page.meta[`${reviewField}By`]
    ? String(page.meta[`${reviewField}By`])
    : null;
  const reviewDate = page.meta[`${reviewField}Date`]
    ? String(page.meta[`${reviewField}Date`])
    : null;
  const [review, setReviewLocal] = useState(serverReview);
  const [reviewPending, startReview] = useTransition();
  const [reviewError, setReviewError] = useState<string | null>(null);
  useEffect(() => {
    setReviewLocal(serverReview);
  }, [serverReview]);

  function changeReview(value: string) {
    setReviewLocal(value);
    setReviewError(null);
    startReview(async () => {
      try {
        if (sourced) await setRelevance(slug, page.id, value, userName);
        else await setApproval(slug, page.id, value, userName);
        router.refresh();
        onSaved?.();
      } catch (e) {
        setReviewLocal(serverReview);
        setReviewError(
          e instanceof Error ? e.message : "Could not save status",
        );
      }
    });
  }

  // Inline edit state — initialised from the page each time editing opens, so
  // a refreshed `page` prop is always the source of truth between edits.
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [blocks, setBlocks] = useState(page.blocks);
  const [body, setBody] = useState(page.body);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Editing — and being the foundational run's current element — force the
  // full card open.
  const isCollapsed = collapsed && !editing && !isCurrent;

  function startEdit() {
    setTitle(page.title);
    setBlocks(page.blocks.map((b) => ({ ...b })));
    setBody(page.body);
    const fv: Record<string, string> = {};
    for (const f of cfg.fields) fv[f.key] = String(page.meta[f.key] ?? "");
    setFields(fv);
    setError(null);
    setEditing(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await saveElement(slug, page.id, {
          title: title.trim(),
          fields,
          blocks: blocks.map((b) => ({ heading: b.heading, text: b.text })),
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

  return (
    <article
      className={`el${isDraft ? " draft" : ""}${editing ? " editing" : ""}${
        isCollapsed ? " collapsed" : ""
      }${isCurrent ? " is-current" : ""}`}
      id={page.id}
    >
      <div className="el-top">
        <button
          type="button"
          className="el-collapse"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? "▸" : "▾"}
        </button>
        <span className="el-id">{page.id}</span>
        {!editing && (
          <label
            className={`${sourced ? "relevance" : "approval"} ${
              sourced ? "relevance" : "approval"
            }-${review || "none"}`}
          >
            <select
              value={review}
              disabled={reviewPending}
              onChange={(e) => changeReview(e.target.value)}
              aria-label="Review status"
            >
              {reviewOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {page.status === "draft" && <span className="tag">AI draft</span>}
        {editing && <span className="tag editing-tag">Editing</span>}
        {isCurrent && !editing && (
          <span className="tag current-tag">Under review</span>
        )}
        {!editing && reviewError && (
          <span className="el-edit-err">{reviewError}</span>
        )}
        {template && template.length > 0 && !isCollapsed && (
          <button
            className={`el-struct-btn${issueCount > 0 ? " has-issues" : ""}`}
            onClick={() => setShowTemplate((v) => !v)}
            aria-expanded={showTemplate}
            title={
              issueCount > 0
                ? `Structure — ${issueCount} issue${issueCount === 1 ? "" : "s"} vs the schema template`
                : "Structure — conforms to the schema template"
            }
          >
            ▤
            {issueCount > 0 && (
              <span className="struct-count">{issueCount}</span>
            )}
          </button>
        )}
        {!editing && reviewBy && reviewDate && (
          <span className="approval-meta">
            {reviewBy} · {reviewDate}
          </span>
        )}
      </div>

      {showTemplate && !isCollapsed && template && template.length > 0 && (
        <div className="el-template">
          <div className="el-tpl-head">Schema template · {typeLabel}</div>
          <div
            className={`el-tpl-status ${issueCount > 0 ? "bad" : "ok"}`}
          >
            {issueCount > 0
              ? `This element does not match the template — ${issueCount} block${issueCount === 1 ? "" : "s"} need work.`
              : "This element conforms to the template."}
          </div>
          {template.map((b) => {
            const chk = checks.find((c) => c.heading === b.heading);
            const ok = chk?.ok ?? true;
            return (
              <div
                className={`el-tpl-row${ok ? "" : " tpl-bad"}`}
                key={b.heading}
              >
                <div className="el-tpl-row-top">
                  <span className={`el-tpl-check ${ok ? "ok" : "bad"}`}>
                    {ok ? "✓" : "✗"}
                  </span>
                  <span className="el-tpl-name">{b.heading}</span>
                  <span className="el-tpl-spec">{specText(b)}</span>
                </div>
                <div className="el-tpl-purpose">{b.purpose}</div>
                {!ok && chk?.issue && (
                  <div className="el-tpl-fix">
                    This element: “{b.heading}” {chk.issue}.
                  </div>
                )}
              </div>
            );
          })}
          {checks
            .filter((c) => c.extra)
            .map((c) => (
              <div className="el-tpl-row tpl-bad" key={`x-${c.heading}`}>
                <div className="el-tpl-row-top">
                  <span className="el-tpl-check bad">✗</span>
                  <span className="el-tpl-name">{c.heading}</span>
                  <span className="el-tpl-spec">not in template</span>
                </div>
                <div className="el-tpl-fix">
                  This element: “{c.heading}” {c.issue}.
                </div>
              </div>
            ))}
          <div className="el-tpl-foot">
            Defined in <code>schema/process-schema.json</code> — Karpathy wiki
            layer 3.
          </div>
        </div>
      )}

      {editing ? (
        <input
          className="el-edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Title"
        />
      ) : (
        <div className="el-title">{page.title}</div>
      )}

      {!isCollapsed && (
        <>
      {editing ? (
        blocks.length > 0 ? (
          <div className="el-blocks">
            {blocks.map((b, i) => (
              <div className="el-block" key={b.heading}>
                <div className="el-block-head">{b.heading}</div>
                <textarea
                  className="el-edit-text"
                  value={b.text}
                  aria-label={b.heading}
                  onChange={(e) => {
                    const next = [...blocks];
                    next[i] = { ...next[i], text: e.target.value };
                    setBlocks(next);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <textarea
            className="el-edit-text el-edit-body"
            value={body}
            aria-label="Body"
            onChange={(e) => setBody(e.target.value)}
          />
        )
      ) : page.blocks.length > 0 ? (
        <div className="el-blocks">
          {page.blocks.map((b) => (
            <div className="el-block" key={b.heading}>
              <div className="el-block-head">{b.heading}</div>
              <div className="el-block-text">
                <Markdown text={b.text} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        page.body && (
          <div className="el-body">
            <Markdown text={page.body} />
          </div>
        )
      )}

      {editing
        ? cfg.fields.length > 0 && (
            <div className="el-edit-fields">
              {cfg.fields.map((f) => (
                <label className="el-edit-field" key={f.key}>
                  <span>{f.label}</span>
                  <input
                    value={fields[f.key] ?? ""}
                    onChange={(e) =>
                      setFields({ ...fields, [f.key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
          )
        : cfg.fields.some((f) => page.meta[f.key]) && (
            <div className="el-fields">
              {cfg.fields.map((f) => {
                const val = page.meta[f.key];
                if (!val) return null;
                const text = `${String(val)}${f.suffix ?? ""}`;
                const url = f.urlKey ? page.meta[f.urlKey] : undefined;
                return (
                  <span className="el-field" key={f.key}>
                    {f.label}:{" "}
                    <b>
                      {url ? (
                        <a
                          className="el-field-link"
                          href={String(url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {text}
                        </a>
                      ) : (
                        text
                      )}
                    </b>
                  </span>
                );
              })}
            </div>
          )}

      {!editing &&
        cfg.links.map((lg) => {
          // A derived relation (computed by the parent from other elements)
          // overrides the stored frontmatter — one source of truth.
          const targets = derivedLinks?.[lg.key] ?? asList(page.meta[lg.key]);
          if (targets.length === 0) return null;
          return (
            <div className="links" key={lg.key}>
              <span className="link-group-label">{lg.label}:</span>
              {targets.map((t) => {
                const sec = resolveSection?.(t) ?? null;
                return sec && onGoToElement ? (
                  <button
                    type="button"
                    className="link-chip link-chip-nav"
                    key={t}
                    onClick={() => onGoToElement(t)}
                    title={`Go to ${t}`}
                  >
                    {t}
                  </button>
                ) : (
                  <span className="link-chip" key={t}>
                    {t}
                  </span>
                );
              })}
            </div>
          );
        })}

      {!editing && transitions.length > 0 && (
        <div className="el-transitions">
          <span className="el-transitions-label">Transitions</span>
          {transitions.map((t) => {
            const sec = resolveSection?.(t.to) ?? null;
            const label =
              t.kind === "normal"
                ? "next"
                : t.kind === "loopback"
                  ? "loop-back"
                  : t.kind;
            return (
              <div
                className={`el-transition el-transition-${t.kind}`}
                key={`${t.to}-${t.when}`}
              >
                {sec && onGoToElement ? (
                  <button
                    type="button"
                    className="link-chip link-chip-nav"
                    onClick={() => onGoToElement(t.to)}
                    title={`Go to ${t.to}`}
                  >
                    {t.to}
                  </button>
                ) : (
                  <span className="link-chip">{t.to}</span>
                )}
                <span className="el-transition-meta">
                  {label}
                  {t.when ? ` · ${t.when}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="el-meta">
        {!editing && isDraft && page.confidence && (
          <span className={`conf ${page.confidence}`}>
            <span className="cd" /> Confidence: {page.confidence}
          </span>
        )}
        {editing && error && <span className="el-edit-err">{error}</span>}
        <div className="el-actions">
          {editing ? (
            <>
              <button
                className="act ai"
                onClick={save}
                disabled={pending}
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                className="act"
                onClick={() => setEditing(false)}
                disabled={pending}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {onDeepDive && (
                <button
                  className="act ai"
                  onClick={() => onDeepDive(page.id, page.title)}
                  title="Start a QER deep-dive session on this element"
                >
                  ⌖ Deep dive
                </button>
              )}
              <button className="act" disabled title="coming in slice 2">
                ⌘ AI edit
              </button>
              <button className="act" onClick={startEdit}>
                ✎ Edit yourself
              </button>
            </>
          )}
        </div>
      </div>
        </>
      )}
    </article>
  );
}

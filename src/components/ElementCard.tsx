"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BlockSpec, FieldSpec, Note, WikiPage } from "@/lib/wiki";
import type { LinkGroup } from "@/lib/relations";
import type { LintFinding } from "@/lib/lint";
import { isSourcedType } from "@/lib/element-types";
import { checkElement, parseProvenance } from "@/lib/conformance";
import { saveElement, setApproval, setRelevance } from "@/lib/wiki-write";
import Markdown from "./Markdown";
import Tooltip from "./Tooltip";
import ElementHovercard from "./ElementHovercard";
import RelativeTime from "./RelativeTime";
import FindingDismiss from "./FindingDismiss";

// Which fields and relations a card shows is no longer hand-kept here — it is
// driven from `schema/process-schema.json` (each type's `frontmatter` block).
// The parent resolves it and passes `fieldSpecs` + `links`; see src/lib/relations.ts.

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

function asList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

const TRANSITION_KINDS = ["normal", "branch", "loopback", "exception"];

// Per-heading provenance (HALLUCINATION-PLAN.md) — the short tag and its
// hover text, by source. `proposed` / `web` are unconfirmed by the SME.
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
      return ev ? `Confirmed by the SME: “${ev}”` : "Confirmed by the SME";
    case "document":
      return ev ? `From the source document: “${ev}”` : "From the source document";
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

// Lint-finding kind → the short label shown on the inline annotation row.
const FINDING_KIND_LABEL: Record<string, string> = {
  discrepancy: "Discrepancy",
  conformance: "Structure",
  question: "Question",
};
// Kind → the leading glyph in the annotation row's marker column.
const FINDING_KIND_GLYPH: Record<string, string> = {
  discrepancy: "▲",
  conformance: "△",
  question: "?",
};

// Note-thread helpers (#19) — deterministic so server + client render alike.
/** A one-line content preview for a collapsed card — the first prose block,
 *  bullets and line breaks flattened, so a long section scans without expanding. */
function previewLine(blocks: { heading: string; text: string }[]): string {
  const text = blocks[0]?.text ?? "";
  return text
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}
function noteInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ElementCard({
  page,
  slug,
  userName,
  typeLabel,
  template,
  fieldSpecs,
  links,
  onGoToElement,
  onDeepDive,
  onShowOnFlow,
  onFindingDeepDive,
  findings,
  onSaved,
  defaultCollapsed,
  isCurrent,
  getRef,
  resolveOwner,
  notes,
  onReviewComments,
}: {
  page: WikiPage;
  slug: string;
  userName: string;
  typeLabel: string;
  template?: BlockSpec[];
  /** Type-specific scalar fields to display — from the schema. */
  fieldSpecs: FieldSpec[];
  /** Forward + reverse relation groups, assembled by the parent. */
  links: LinkGroup[];
  onGoToElement?: (id: string) => void;
  onDeepDive?: (id: string, title: string) => void;
  /** Show this target-state theme on the As-Is process flow. Target-state
   *  cards only — sets the theme selector and navigates to Process Steps. */
  onShowOnFlow?: (themeId: string) => void;
  /** Deep-dive on a lint finding (distinct from an element deep-dive). */
  onFindingDeepDive?: (finding: LintFinding) => void;
  /** Lint findings from the last run-lint pass that involve this element. */
  findings?: LintFinding[];
  onSaved?: () => void;
  defaultCollapsed?: boolean;
  /** True when the foundational run's cursor is on this element. */
  isCurrent?: boolean;
  /** Resolve a referenced element id to its page + type label, for hovercards. */
  getRef?: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
  /** Resolve an `owner` field value (a role title or id) to its role element
   *  id, so the owner links to the role — its RACI entry. */
  resolveOwner?: (name: string) => string | undefined;
  /** SME note thread for this element (#19). */
  notes?: Note[];
  /** Run the comment-review skill on this element's discussion thread. */
  onReviewComments?: (id: string, title: string) => void;
}) {
  const [showTemplate, setShowTemplate] = useState(false);
  // Collapsed cards show only their header row, so a long section is a
  // scannable list. Long sections open collapsed (see `defaultCollapsed`).
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);

  // Live template-conformance check for this element (deterministic, cheap).
  const checks = template ? checkElement(page, template) : [];
  const issueCount = checks.filter((c) => !c.ok).length;

  // Typed outgoing relations (process-step `transitions`): `to|kind|when`.
  // These carry per-edge metadata (kind + condition) a plain relation can't,
  // so they render in their own block, not via `links`.
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
  const reviewLabel =
    reviewOptions.find((o) => o.value === review)?.label ?? "";
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
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Editing — and being the foundational run's current element — force the
  // full card open.
  const isCollapsed = collapsed && !editing && !isCurrent;

  // Live conformance — re-checked against the in-edit blocks so the SME sees
  // template deviations before saving, not only after (#7).
  const liveChecks =
    editing && template
      ? checkElement({ ...page, title, blocks, body }, template)
      : [];

  // Per-heading provenance (HALLUCINATION-PLAN.md) — which headings the SME
  // confirmed vs what the AI proposed. Keyed by heading title.
  const provenance = parseProvenance(page);

  function startEdit() {
    setTitle(page.title);
    setBlocks(page.blocks.map((b) => ({ ...b })));
    setBody(page.body);
    const fv: Record<string, string> = {};
    for (const f of fieldSpecs) fv[f.key] = String(page.meta[f.key] ?? "");
    setFieldValues(fv);
    setError(null);
    setEditing(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await saveElement(slug, page.id, {
          title: title.trim(),
          fields: fieldValues,
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

  // SME note thread (#19) — notes arrive from notes.json via the parent;
  // posting hits /api/notes, then router.refresh() brings the thread back.
  const noteList = notes ?? [];
  const [noteDraft, setNoteDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(true);
  const [notePending, startNote] = useTransition();
  const [noteError, setNoteError] = useState<string | null>(null);

  // Read an error message off a failed API response, falling back gracefully.
  async function errorFrom(res: Response, fallback: string): Promise<string> {
    try {
      const j = (await res.json()) as { error?: string };
      return j.error ?? fallback;
    } catch {
      return fallback;
    }
  }

  function postNote() {
    const text = noteDraft.trim();
    if (!text || notePending) return;
    setNoteError(null);
    startNote(async () => {
      let res: Response;
      try {
        res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            elementId: page.id,
            author: userName,
            text,
            replyTo: replyTo ?? undefined,
          }),
        });
      } catch {
        setNoteError("Could not reach the server — the note was not posted.");
        return;
      }
      if (!res.ok) {
        setNoteError(await errorFrom(res, "Could not post the note."));
        return;
      }
      setNoteDraft("");
      setReplyTo(null);
      router.refresh();
    });
  }

  // Manually mark a comment resolved (or reopen it) — distinct from the
  // comment-review skill, which resolves comments after triaging them.
  function resolveNote(noteId: string, resolved: boolean) {
    if (notePending) return;
    setNoteError(null);
    startNote(async () => {
      let res: Response;
      try {
        res = await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            elementId: page.id,
            noteId,
            resolved,
            by: userName,
          }),
        });
      } catch {
        setNoteError("Could not reach the server — the comment was unchanged.");
        return;
      }
      if (!res.ok) {
        setNoteError(await errorFrom(res, "Could not update the comment."));
        return;
      }
      router.refresh();
    });
  }

  // Provenance — DESIGN.md's signature: machine-drafted vs human-confirmed.
  // The verb tracks the review state: an element re-opened by run-lint is
  // stamped with a By/Date but is *not* confirmed, so "confirmed by" would
  // misread. Only an approved/relevant element is confirmed.
  const reviewVerb =
    review === "approved" || review === "relevant"
      ? "confirmed by"
      : review === "rejected"
        ? "rejected by"
        : review === "disregarded"
          ? "disregarded by"
          : "flagged by";
  // An approved element drops the "AI-drafted" provenance — once the SME has
  // signed off, the only thing that matters is who approved it and when.
  const approved = review === "approved";
  const provenanceText =
    approved && reviewBy && reviewDate
      ? `Approved by ${reviewBy}, ${reviewDate}`
      : reviewBy && reviewDate
        ? `${isDraft ? "AI-drafted" : "Authored"} · ${reviewVerb} ${reviewBy}, ${reviewDate}`
        : isDraft
          ? "AI-drafted · awaiting confirmation"
          : "Authored · not yet confirmed";

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
        {page.confidence && (
          <Tooltip label={`${page.confidence} confidence`}>
            <span className={`el-conf-dot conf-${page.confidence}`} />
          </Tooltip>
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
        {!editing && (
          <label
            className={`${sourced ? "relevance" : "approval"} ${
              sourced ? "relevance" : "approval"
            }-${review || "none"}`}
          >
            <span className="statusctl-dot" aria-hidden="true" />
            <span className="statusctl-label">{reviewLabel}</span>
            <span className="statusctl-caret" aria-hidden="true">
              ▾
            </span>
            <select
              className="statusctl-native"
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
        {editing && <span className="tag editing-tag">Editing</span>}
        {!editing && reviewError && (
          <span className="el-edit-err">{reviewError}</span>
        )}
      </div>

      {showTemplate && !isCollapsed && template && template.length > 0 && (
        <div className="el-template">
          <div className="el-tpl-head">Schema template · {typeLabel}</div>
          <div className={`el-tpl-status ${issueCount > 0 ? "bad" : "ok"}`}>
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

      {isCollapsed && !editing && previewLine(page.blocks) !== "" && (
        <div className="el-collapsed-preview">{previewLine(page.blocks)}</div>
      )}

      {!editing && (
        <div className="el-provenance">
          <span
            className={`pv-dot ${
              approved ? "pv-approved" : isDraft ? "pv-ai" : "pv-human"
            }`}
          />
          {provenanceText}
        </div>
      )}

      {!editing && findings && findings.length > 0 && (
        <div className="el-findings">
          {findings.map((f) => (
            <div className={`el-finding ${f.kind}`} key={f.id}>
              <div className="el-finding-head">
                <span className="el-finding-kind">
                  {FINDING_KIND_LABEL[f.kind] ?? f.kind}
                </span>
                {onFindingDeepDive && (
                  <button
                    type="button"
                    className="el-finding-dd"
                    onClick={() => onFindingDeepDive(f)}
                    title="Start a Brainstorm deep-dive session on this finding"
                  >
                    ⌖ Deep dive
                  </button>
                )}
                <FindingDismiss slug={slug} finding={f} by={userName} />
              </div>
              <div className="el-finding-text">
                <span className="el-finding-glyph" aria-hidden="true">
                  {FINDING_KIND_GLYPH[f.kind] ?? "•"}
                </span>
                <b>{f.title}</b> {f.detail}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isCollapsed && (
        <>
          {editing ? (
            blocks.length > 0 ? (
              <div className="el-blocks">
                {blocks.map((b, i) => {
                  const chk = liveChecks.find((c) => c.heading === b.heading);
                  const bad = chk ? !chk.ok : false;
                  return (
                    <div className="el-block" key={b.heading}>
                      <div className="el-block-head">{b.heading}</div>
                      <textarea
                        className={`el-edit-text${bad ? " has-warn" : ""}`}
                        value={b.text}
                        aria-label={b.heading}
                        onChange={(e) => {
                          const next = [...blocks];
                          next[i] = { ...next[i], text: e.target.value };
                          setBlocks(next);
                        }}
                      />
                      {bad && chk?.issue && (
                        <div className="el-edit-warn">⚠ {chk.issue}</div>
                      )}
                    </div>
                  );
                })}
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
                      <Markdown text={b.text} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            page.body && (
              <div className="el-body">
                <Markdown text={page.body} />
              </div>
            )
          )}

          {editing
            ? fieldSpecs.length > 0 && (
                <div className="el-edit-fields">
                  {fieldSpecs.map((f) => (
                    <label className="el-edit-field" key={f.key}>
                      <span>{f.label}</span>
                      <input
                        value={fieldValues[f.key] ?? ""}
                        onChange={(e) =>
                          setFieldValues({
                            ...fieldValues,
                            [f.key]: e.target.value,
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              )
            : fieldSpecs.some((f) => page.meta[f.key]) && (
                <div className="el-fields">
                  {fieldSpecs.map((f) => {
                    const val = page.meta[f.key];
                    if (!val) return null;
                    const text = `${String(val)}${f.suffix ?? ""}`;
                    const url = f.urlKey ? page.meta[f.urlKey] : undefined;
                    // An `owner` value links to its role element (the RACI
                    // entry) when it resolves to one.
                    const roleId =
                      f.key === "owner" && resolveOwner
                        ? resolveOwner(String(val))
                        : undefined;
                    return (
                      <span className="el-field" key={f.key}>
                        {f.label}:{" "}
                        {roleId ? (
                          <ElementHovercard
                            element={getRef?.(roleId)?.page}
                            typeLabel={getRef?.(roleId)?.typeLabel}
                          >
                            <button
                              type="button"
                              className="link-chip link-chip-nav"
                              onClick={() => onGoToElement?.(roleId)}
                            >
                              {String(val)}
                            </button>
                          </ElementHovercard>
                        ) : url ? (
                          <b>
                            <a
                              className="el-field-link"
                              href={String(url)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {text}
                            </a>
                          </b>
                        ) : (
                          <b>{text}</b>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}

          {!editing &&
            links.map((lg) => (
              <div className="links" key={lg.label}>
                <span className="link-group-label">{lg.label}:</span>
                {lg.ids.map((t) => {
                  const ref = getRef?.(t);
                  return (
                    <ElementHovercard
                      key={t}
                      element={ref?.page}
                      typeLabel={ref?.typeLabel}
                    >
                      <button
                        type="button"
                        className="link-chip link-chip-nav"
                        onClick={() => onGoToElement?.(t)}
                      >
                        {t}
                      </button>
                    </ElementHovercard>
                  );
                })}
              </div>
            ))}

          {!editing && transitions.length > 0 && (
            <div className="el-transitions">
              <span className="el-transitions-label">Transitions</span>
              {transitions.map((t) => {
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
                    <ElementHovercard
                      element={getRef?.(t.to)?.page}
                      typeLabel={getRef?.(t.to)?.typeLabel}
                    >
                      <button
                        type="button"
                        className="link-chip link-chip-nav"
                        onClick={() => onGoToElement?.(t.to)}
                      >
                        {t.to}
                      </button>
                    </ElementHovercard>
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
                  <button className="act ai" onClick={save} disabled={pending}>
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
                    <Tooltip label="Deep dive — start a Brainstorm session on this element">
                      <button
                        className="act ai act-icon"
                        onClick={() => onDeepDive(page.id, page.title)}
                        aria-label="Deep dive"
                      >
                        ✦
                      </button>
                    </Tooltip>
                  )}
                  {onShowOnFlow && page.type === "target-state" && (
                    <Tooltip label="Show on As-Is flow — highlight the steps this theme replaces">
                      <button
                        className="act act-icon"
                        onClick={() => onShowOnFlow(page.id)}
                        aria-label="Show on As-Is flow"
                      >
                        ⇄
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
          </div>

          {!editing && (
            <div className="el-thread">
              <div className="el-thread-head-row">
                <button
                  type="button"
                  className="el-thread-head"
                  onClick={() => setNotesOpen((v) => !v)}
                  aria-expanded={notesOpen}
                >
                  <span className="el-thread-chev">
                    {notesOpen ? "▾" : "▸"}
                  </span>
                  Discussion
                  {noteList.length > 0 && (
                    <span className="el-thread-n">· {noteList.length}</span>
                  )}
                </button>
                {onReviewComments &&
                  noteList.some((n) => !n.replyTo && !n.resolved) && (
                    <Tooltip label="Review the open comments with the section's analyst">
                      <button
                        type="button"
                        className="act ai el-thread-review"
                        onClick={() => onReviewComments(page.id, page.title)}
                      >
                        ✦ Review with analyst
                      </button>
                    </Tooltip>
                  )}
              </div>
              {notesOpen && (
                <>
                  {noteList
                    .filter((n) => !n.replyTo)
                    .map((n) => (
                      <Fragment key={n.id}>
                        <div
                          className={`el-note${n.resolved ? " resolved" : ""}`}
                        >
                          <span className="el-note-av">
                            {noteInitials(n.author)}
                          </span>
                          <div className="el-note-body">
                            <div className="el-note-top">
                              <span className="el-note-who">{n.author}</span>
                              <RelativeTime
                                ts={n.ts}
                                className="el-note-when"
                              />
                              {n.resolved && (
                                <span
                                  className="el-note-resolved"
                                  title={
                                    n.resolvedAt
                                      ? `Resolved ${n.resolvedAt}`
                                      : undefined
                                  }
                                >
                                  ✓ Resolved
                                  {n.resolvedBy ? ` · ${n.resolvedBy}` : ""}
                                </span>
                              )}
                            </div>
                            <div className="el-note-text">{n.text}</div>
                            <div className="el-note-actions">
                              <button
                                type="button"
                                className="el-note-reply"
                                onClick={() => setReplyTo(n.id)}
                              >
                                ↩ Reply
                              </button>
                              <button
                                type="button"
                                className="el-note-reply"
                                onClick={() => resolveNote(n.id, !n.resolved)}
                                disabled={notePending}
                              >
                                {n.resolved ? "↺ Reopen" : "✓ Resolve"}
                              </button>
                            </div>
                          </div>
                        </div>
                        {noteList
                          .filter((r) => r.replyTo === n.id)
                          .map((r) => (
                            <div className="el-note reply" key={r.id}>
                              <span className="el-note-av">
                                {noteInitials(r.author)}
                              </span>
                              <div className="el-note-body">
                                <div className="el-note-top">
                                  <span className="el-note-who">
                                    {r.author}
                                  </span>
                                  <RelativeTime
                                    ts={r.ts}
                                    className="el-note-when"
                                  />
                                </div>
                                <div className="el-note-text">{r.text}</div>
                              </div>
                            </div>
                          ))}
                      </Fragment>
                    ))}
                  <div className="el-note-input">
                    {noteError && (
                      <span className="el-note-error" role="alert">
                        {noteError}
                      </span>
                    )}
                    {replyTo && (
                      <span className="el-note-replying">
                        Replying ·{" "}
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                        >
                          cancel
                        </button>
                      </span>
                    )}
                    <div className="el-note-row">
                      <input
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder={
                          replyTo
                            ? "Write a reply…"
                            : "Add a note for the team…"
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") postNote();
                        }}
                      />
                      <button
                        type="button"
                        onClick={postNote}
                        disabled={notePending || !noteDraft.trim()}
                      >
                        {notePending ? "…" : "Post"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}

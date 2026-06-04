"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BlockSpec, FieldSpec, RelationSpec, Note, WikiPage } from "@/lib/wiki";
import type { LinkGroup } from "@/lib/relations";
import type { LintFinding } from "@/lib/lint";
import { isSourcedType } from "@/lib/element-types";
import { checkElement, parseProvenance } from "@/lib/conformance";
import { updateElement, setApproval, setRelevance } from "@/lib/wiki-write";
import Markdown from "./Markdown";
import Tooltip from "./Tooltip";
import ElementHovercard from "./ElementHovercard";
import RelativeTime from "./RelativeTime";
import FindingDismiss from "./FindingDismiss";
import Combobox from "./Combobox";
import {
  validateProcessStep,
  validateRole,
  validateSystem,
  validateException,
  type ValidationError,
} from "@/lib/schema/process-validator";
import legacySchema from "../../schema/process-schema.json";

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

import { asList } from "@/lib/meta";

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
  requiredFields,
  relationSpecs = [],
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
  allElements,
  showMeta = true,
  asDocument = false,
}: {
  page: WikiPage;
  slug: string;
  userName: string;
  typeLabel: string;
  template?: BlockSpec[];
  /** Type-specific scalar fields to display — from the schema. */
  fieldSpecs: FieldSpec[];
  /** Keys among `fieldSpecs` the schema marks required — flagged when empty. */
  requiredFields?: string[];
  /** Type-specific relation fields to display — from the schema. */
  relationSpecs?: RelationSpec[];
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
  allElements?: WikiPage[];
  showMeta?: boolean;
  asDocument?: boolean;
}) {
  const [showTemplate, setShowTemplate] = useState(false);
  const elements = allElements || [];
  const fieldValuesEnum = legacySchema.fieldValues as Record<string, string[]>;
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

  // Helper functions for schema-driven generic editor
  function toCamelCase(str: string): string {
    const cleaned = str.replace(/[^a-zA-Z0-9 ]/g, "");
    return cleaned
      .split(" ")
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");
  }

  function parseBulletsOrParagraphToList(text: string): string[] {
    const trimmed = text.trim();
    if (!trimmed) return [];
    const lines = trimmed.split('\n').map(line => line.trim()).filter(Boolean);
    const hasBullets = lines.some(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'));
    if (hasBullets) {
      return lines
        .filter(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))
        .map(line => line.slice(1).trim())
        .filter(Boolean);
    }
    return trimmed.split(/[;,\n]/).map(item => item.trim()).filter(Boolean);
  }

  function getWordCount(text: string): number {
    const t = (text || "").trim();
    return t ? t.split(/\s+/).length : 0;
  }

  const parseWordRange = (rangeStr?: string) => {
    if (!rangeStr) return null;
    const parts = rangeStr.split(/[-–]/).map(p => parseInt(p.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { min: parts[0], max: parts[1] };
    }
    return null;
  };

  // Inline edit state — initialised from the page each time editing opens, so
  // a refreshed `page` prop is always the source of truth between edits.
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [blockValues, setBlockValues] = useState<{ heading: string; text: string }[]>([]);
  const [bodyValue, setBodyValue] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [relationValues, setRelationValues] = useState<Record<string, string[]>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [valErrors, setValErrors] = useState<ValidationError[]>([]);

  // Specifically for process step:
  const [inputsList, setInputsList] = useState<string[]>([]);
  const [outputsList, setOutputsList] = useState<string[]>([]);
  const [transitionsList, setTransitionsList] = useState<{ to: string; kind: string; when: string }[]>([]);

  // Editing — and being the foundational run's current element — force the
  // full card open.
  const isCollapsed = collapsed && !editing && !isCurrent;

  // Live conformance — re-checked against the in-edit blocks so the SME sees
  // template deviations before saving, not only after (#7).
  const liveChecks =
    editing && template
      ? checkElement({ ...page, title, blocks: blockValues, body: bodyValue }, template)
      : [];

  // Per-heading provenance (HALLUCINATION-PLAN.md) — which headings the SME
  // confirmed vs what the AI proposed. Keyed by heading title.
  const provenance = parseProvenance(page);

  function startEdit() {
    setTitle(page.title);
    setBlockValues(page.blocks.map((b) => ({ ...b })));
    setBodyValue(page.body);
    setSaveError(null);
    setValErrors([]);

    const fv: Record<string, string> = {};
    for (const f of fieldSpecs) fv[f.key] = String(page.meta[f.key] ?? "");
    setFieldValues(fv);

    const rv: Record<string, string[]> = {};
    for (const r of relationSpecs) {
      const val = page.meta[r.key];
      if (Array.isArray(val)) {
        rv[r.key] = [...val];
      } else if (val) {
        rv[r.key] = [val];
      } else {
        rv[r.key] = [];
      }
    }
    setRelationValues(rv);

    if (page.type === "process-step") {
      setInputsList(Array.isArray(page.meta.inputs) ? [...page.meta.inputs] : []);
      setOutputsList(Array.isArray(page.meta.outputs) ? [...page.meta.outputs] : []);
      
      const trans = asList(page.meta.transitions).map((entry) => {
        const parts = entry.split("|");
        const kind = (parts[1] ?? "normal").trim();
        return {
          to: (parts[0] ?? "").trim(),
          kind: TRANSITION_KINDS.includes(kind) ? kind : "normal",
          when: parts.slice(2).join("|").trim(),
        };
      }).filter(t => t.to);
      setTransitionsList(trans);

      // Map description & businessValue so they are available in fieldValues
      setFieldValues({
        ...fv,
        description: page.body || "",
        businessValue: (page.meta.businessValue as string) || "",
        owner: (page.meta.owner as string) || "",
        sla: (page.meta.sla as string) || "",
        condition: (page.meta.condition as string) || "",
      });

      // Map systems
      setRelationValues({
        ...rv,
        systems: Array.isArray(page.meta.systems) ? [...page.meta.systems] : [],
      });
    }

    setEditing(true);
  }

  function save() {
    setSaveError(null);
    setValErrors([]);

    const formattedElement: any = {
      meta: {
        id: page.id,
        type: page.type,
        section: page.section,
        status: "confirmed",
        ...page.meta,
      },
      content: {
        title: title.trim(),
      }
    };

    // Populate scalar fields
    for (const [k, v] of Object.entries(fieldValues)) {
      formattedElement.content[k] = v.trim();
    }
    // Populate relation fields (array of strings)
    for (const [k, v] of Object.entries(relationValues)) {
      formattedElement.content[k] = v.filter(Boolean);
    }

    // Populate prose blocks
    if (page.type !== "process-step") {
      if (template) {
        for (const t of template) {
          const key = toCamelCase(t.heading);
          const block = blockValues.find(b => b.heading.toLowerCase() === t.heading.toLowerCase());
          if (t.format === "bullets") {
            formattedElement.content[key] = block ? parseBulletsOrParagraphToList(block.text) : [];
          } else {
            formattedElement.content[key] = block ? block.text.trim() : "";
          }
        }
      }
    } else {
      // Process step overrides:
      formattedElement.content = {
        title: title.trim(),
        owner: (fieldValues.owner || "").trim(),
        sla: (fieldValues.sla || "").trim(),
        condition: (fieldValues.condition || "").trim() || undefined,
        description: (fieldValues.description || "").trim(),
        businessValue: (fieldValues.businessValue || "").trim(),
        systems: relationValues.systems || [],
        inputs: inputsList.filter(Boolean),
        outputs: outputsList.filter(Boolean),
        transitions: transitionsList.filter(t => t.to),
      };
    }

    // Parse stringified provenance back into an object for schema validation and database storage
    if (typeof formattedElement.meta.provenance === "string") {
      try {
        formattedElement.meta.provenance = JSON.parse(formattedElement.meta.provenance);
      } catch (e) {
        console.error("Failed to parse provenance from string:", e);
      }
    }

    // Validate
    let validation = { isValid: true, errors: [] as ValidationError[] };
    if (page.type === "process-step") {
      validation = validateProcessStep(formattedElement);
    } else if (page.type === "role") {
      validation = validateRole(formattedElement);
    } else if (page.type === "system") {
      validation = validateSystem(formattedElement);
    } else if (page.type === "exception") {
      validation = validateException(formattedElement);
    }

    if (!validation.isValid) {
      setValErrors(validation.errors);
      return;
    }

    startTransition(async () => {
      try {
        const patch = {
          meta: formattedElement.meta,
          content: formattedElement.content
        };
        const res = await updateElement(slug, page.id, patch);
        if (!res.ok) {
          throw new Error(res.error || "Save failed");
        }

        setEditing(false);
        router.refresh();
        onSaved?.();
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  // SME note thread (#19) — notes arrive from the process JSON's `notes` via
  // the parent; posting hits /api/notes, then router.refresh() brings the
  // thread back.
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
      }${isCurrent ? " is-current" : ""}${asDocument ? " el-document" : ""}${
        asDocument && !showMeta ? " el-hide-meta" : ""
      }`}
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
                ? `Structure — ${issueCount} issue${issueCount === 1 ? "" : "s"} vs the template`
                : "Structure — conforms to the template"
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
          <div className="el-tpl-head">Template · {typeLabel}</div>
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
            The named sections every {typeLabel} should have.
          </div>
        </div>
      )}

      {editing ? (
        page.type === "process-step" ? null : (
          <input
            className="el-edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
          />
        )
      ) : (
        <div className="el-title">{page.title}</div>
      )}

      {isCollapsed && !editing && previewLine(page.blocks) !== "" && (
        <div className="el-collapsed-preview">{previewLine(page.blocks)}</div>
      )}

      {!editing && (showMeta || asDocument) && (
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
            <div className="step-form">
              {saveError && <div className="admin-error">⚠ {saveError}</div>}
              {valErrors.length > 0 && (
                <div className="admin-error" style={{ marginBottom: "16px", padding: "12px", border: "1px solid var(--lo)", borderRadius: "var(--r-sm)", background: "var(--lo-bg)", color: "var(--lo)" }}>
                  <p style={{ margin: 0, fontWeight: "bold" }}>⚠ Please correct the validation errors before saving:</p>
                  <ul style={{ margin: "6px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                    {valErrors.map((err, idx) => (
                      <li key={idx} style={{ fontSize: "var(--text-xs)", marginTop: "2px" }}>
                        <strong>{err.path.replace("content.", "")}:</strong> {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Title Input */}
              {page.type !== "process-step" && (
                <div className="form-field">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                  />
                  {valErrors.find(err => err.path === "content.title") && (
                    <span className="field-error">{valErrors.find(err => err.path === "content.title")?.message}</span>
                  )}
                </div>
              )}

              {page.type === "process-step" ? (
                <>
                  {/* Process Step Fields */}
                  <div className="step-form-grid">
                    <div className="form-field">
                      <label>Owner (Role / System)</label>
                      <Combobox
                        value={fieldValues.owner || ""}
                        onChange={(val) => setFieldValues({ ...fieldValues, owner: val })}
                        options={[
                          ...elements.filter((e) => e.type === "role").map((e) => ({
                            value: e.id,
                            label: `${e.id} - ${e.title}`,
                          })),
                          { value: "System", label: "System" }
                        ]}
                        placeholder="Select or type owner..."
                        className="form-input"
                      />
                      {valErrors.find(err => err.path === "content.owner") && (
                        <span className="field-error">{valErrors.find(err => err.path === "content.owner")?.message}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="sla">SLA Target</label>
                      <input
                        id="sla"
                        className="form-input"
                        value={fieldValues.sla || ""}
                        onChange={(e) => setFieldValues({ ...fieldValues, sla: e.target.value })}
                        placeholder="e.g. 2-5 business days"
                      />
                      {valErrors.find(err => err.path === "content.sla") && (
                        <span className="field-error">{valErrors.find(err => err.path === "content.sla")?.message}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="condition">Entry Condition (Optional)</label>
                      <input
                        id="condition"
                        className="form-input"
                        value={fieldValues.condition || ""}
                        onChange={(e) => setFieldValues({ ...fieldValues, condition: e.target.value })}
                        placeholder="e.g. Triaged application exists"
                      />
                      {valErrors.find(err => err.path === "content.condition") && (
                        <span className="field-error">{valErrors.find(err => err.path === "content.condition")?.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="field-header">
                      <label htmlFor="description">What happens (Description)</label>
                      <span className={`word-counter ${getWordCount(fieldValues.description || "") >= 20 && getWordCount(fieldValues.description || "") <= 95 ? "valid" : "invalid"}`}>
                        {getWordCount(fieldValues.description || "")} words (20-95 required)
                      </span>
                    </div>
                    <textarea
                      id="description"
                      className="form-textarea"
                      value={fieldValues.description || ""}
                      onChange={(e) => setFieldValues({ ...fieldValues, description: e.target.value })}
                      placeholder="Describe concrete actions performed in this step..."
                    />
                    {valErrors.find(err => err.path === "content.description") && (
                      <span className="field-error">{valErrors.find(err => err.path === "content.description")?.message}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <div className="field-header">
                      <label htmlFor="businessValue">Why it matters (Business Value)</label>
                      <span className={`word-counter ${getWordCount(fieldValues.businessValue || "") >= 10 && getWordCount(fieldValues.businessValue || "") <= 60 ? "valid" : "invalid"}`}>
                        {getWordCount(fieldValues.businessValue || "")} words (10-60 required)
                      </span>
                    </div>
                    <textarea
                      id="businessValue"
                      className="form-textarea"
                      value={fieldValues.businessValue || ""}
                      onChange={(e) => setFieldValues({ ...fieldValues, businessValue: e.target.value })}
                      placeholder="State the risk controlled or value added by this step..."
                    />
                    {valErrors.find(err => err.path === "content.businessValue") && (
                      <span className="field-error">{valErrors.find(err => err.path === "content.businessValue")?.message}</span>
                    )}
                  </div>

                  <div className="array-section">
                    <div className="array-header">
                      <span className="array-title">Systems Used</span>
                      <button
                        type="button"
                        className="btn-add"
                        onClick={() => {
                          const current = relationValues.systems || [];
                          setRelationValues({ ...relationValues, systems: [...current, ""] });
                        }}
                      >
                        + Add System
                      </button>
                    </div>
                    <div className="array-list">
                      {(relationValues.systems || []).map((sys, idx) => (
                        <div key={idx} className="array-item">
                          <Combobox
                            value={sys}
                            onChange={(val) => {
                              const current = [...(relationValues.systems || [])];
                              current[idx] = val;
                              setRelationValues({ ...relationValues, systems: current });
                            }}
                            options={elements.filter((e) => e.type === "system").map((e) => ({
                              value: e.id,
                              label: `${e.id} - ${e.title}`,
                            }))}
                            placeholder="SYS-COB-001..."
                            className="form-input"
                          />
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => {
                              const current = [...(relationValues.systems || [])];
                              current.splice(idx, 1);
                              setRelationValues({ ...relationValues, systems: current });
                            }}
                            aria-label="Remove system"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {(relationValues.systems || []).length === 0 && (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          No systems registered yet.
                        </span>
                      )}
                    </div>
                    {valErrors.find(err => err.path === "content.systems") && (
                      <span className="field-error">{valErrors.find(err => err.path === "content.systems")?.message}</span>
                    )}
                  </div>

                  <div className="array-section">
                    <div className="array-header">
                      <span className="array-title">Inputs (Min 2, Max 6)</span>
                      <button
                        type="button"
                        className="btn-add"
                        onClick={() => setInputsList([...inputsList, ""])}
                        disabled={inputsList.length >= 6}
                      >
                        + Add Input
                      </button>
                    </div>
                    <div className="array-list">
                      {inputsList.map((inp, idx) => (
                        <div key={idx} className="array-item">
                          <input
                            className="form-input"
                            value={inp}
                            onChange={(e) => {
                              const current = [...inputsList];
                              current[idx] = e.target.value;
                              setInputsList(current);
                            }}
                            placeholder="Input description..."
                          />
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => {
                              const current = [...inputsList];
                              current.splice(idx, 1);
                              setInputsList(current);
                            }}
                            aria-label="Remove input"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {inputsList.length === 0 && (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          No inputs.
                        </span>
                      )}
                    </div>
                    {valErrors.find(err => err.path === "content.inputs") && (
                      <span className="field-error">{valErrors.find(err => err.path === "content.inputs")?.message}</span>
                    )}
                  </div>

                  <div className="array-section">
                    <div className="array-header">
                      <span className="array-title">Outputs (Min 2, Max 6)</span>
                      <button
                        type="button"
                        className="btn-add"
                        onClick={() => setOutputsList([...outputsList, ""])}
                        disabled={outputsList.length >= 6}
                      >
                        + Add Output
                      </button>
                    </div>
                    <div className="array-list">
                      {outputsList.map((out, idx) => (
                        <div key={idx} className="array-item">
                          <input
                            className="form-input"
                            value={out}
                            onChange={(e) => {
                              const current = [...outputsList];
                              current[idx] = e.target.value;
                              setOutputsList(current);
                            }}
                            placeholder="Output description..."
                          />
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => {
                              const current = [...outputsList];
                              current.splice(idx, 1);
                              setOutputsList(current);
                            }}
                            aria-label="Remove output"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {outputsList.length === 0 && (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          No outputs.
                        </span>
                      )}
                    </div>
                    {valErrors.find(err => err.path === "content.outputs") && (
                      <span className="field-error">{valErrors.find(err => err.path === "content.outputs")?.message}</span>
                    )}
                  </div>

                  <div className="array-section">
                    <div className="array-header">
                      <span className="array-title">Transitions (Outgoing edges)</span>
                      <button
                        type="button"
                        className="btn-add"
                        onClick={() => setTransitionsList([...transitionsList, { to: "", kind: "normal", when: "" }])}
                      >
                        + Add Transition
                      </button>
                    </div>
                    <div className="array-list">
                      {transitionsList.map((trans, idx) => (
                        <div
                          key={idx}
                          className="array-item"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 100px 1.5fr auto",
                            gap: "var(--space-xs)",
                            alignItems: "center",
                          }}
                        >
                          <Combobox
                            value={trans.to}
                            onChange={(val) => {
                              const current = [...transitionsList];
                              current[idx] = { ...current[idx], to: val };
                              setTransitionsList(current);
                            }}
                            options={elements.filter((e) => e.type === "process-step").map((e) => ({
                              value: e.id,
                              label: `${e.id} - ${e.title}`,
                            }))}
                            placeholder="Next step..."
                            className="form-input"
                          />
                          <select
                            className="form-input"
                            value={trans.kind}
                            onChange={(e) => {
                              const current = [...transitionsList];
                              current[idx] = { ...current[idx], kind: e.target.value };
                              setTransitionsList(current);
                            }}
                          >
                            <option value="normal">Normal</option>
                            <option value="branch">Branch</option>
                            <option value="loopback">Loopback</option>
                            <option value="exception">Exception</option>
                          </select>
                          <input
                            className="form-input"
                            value={trans.when}
                            onChange={(e) => {
                              const current = [...transitionsList];
                              current[idx] = { ...current[idx], when: e.target.value };
                              setTransitionsList(current);
                            }}
                            placeholder="Condition (when)..."
                          />
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => {
                              const current = [...transitionsList];
                              current.splice(idx, 1);
                              setTransitionsList(current);
                            }}
                            aria-label="Remove transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {transitionsList.length === 0 && (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          No outgoing transitions.
                        </span>
                      )}
                    </div>
                    {valErrors.find(err => err.path === "content.transitions") && (
                      <span className="field-error">{valErrors.find(err => err.path === "content.transitions")?.message}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Generic Template Blocks (Textareas with Word Counters!) */}
                  {blockValues.length > 0 && (
                    <div className="el-blocks">
                      {blockValues.map((b, i) => {
                        const templateBlock = template?.find(
                          (t) => t.heading.toLowerCase() === b.heading.toLowerCase()
                        );
                        const wordRange = templateBlock?.words;
                        const parsedRange = parseWordRange(wordRange);
                        const currentWords = getWordCount(b.text);
                        const isValid = parsedRange ? (currentWords >= parsedRange.min && currentWords <= parsedRange.max) : true;

                        return (
                          <div className="el-block" key={b.heading}>
                            <div className="field-header">
                              <label className="el-block-head" style={{ marginBottom: "2px" }}>{b.heading}</label>
                              {parsedRange && (
                                <span className={`word-counter ${isValid ? "valid" : "invalid"}`}>
                                  {currentWords} words ({parsedRange.min}–{parsedRange.max} required)
                                </span>
                              )}
                            </div>
                            <textarea
                              className="form-textarea"
                              value={b.text}
                              aria-label={b.heading}
                              onChange={(e) => {
                                const next = [...blockValues];
                                next[i] = { ...next[i], text: e.target.value };
                                setBlockValues(next);
                              }}
                              placeholder={templateBlock?.purpose || "Enter text..."}
                            />
                            {valErrors.find(err => err.path === `content.${toCamelCase(b.heading)}`) && (
                              <span className="field-error">{valErrors.find(err => err.path === `content.${toCamelCase(b.heading)}`)?.message}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {blockValues.length === 0 && (
                    <div className="form-field">
                      <label htmlFor="body">Content</label>
                      <textarea
                        id="body"
                        className="form-textarea"
                        value={bodyValue}
                        onChange={(e) => setBodyValue(e.target.value)}
                        placeholder="Enter markdown body..."
                      />
                    </div>
                  )}

                  {/* Generic Frontmatter Scalar Fields */}
                  {fieldSpecs.length > 0 && (
                    <div className="step-form-grid" style={{ marginTop: "12px" }}>
                      {fieldSpecs.map((f) => {
                        const isRequired = (requiredFields ?? []).includes(f.key);
                        const allowedValues = fieldValuesEnum?.[f.key] || 
                                              fieldValuesEnum?.[f.key.replace("Severity", "")] || 
                                              null;

                        return (
                          <div className="form-field" key={f.key}>
                            <label>
                              {f.label}
                              {isRequired && <span className="el-field-req"> *</span>}
                            </label>
                            {allowedValues ? (
                              <select
                                className="form-input"
                                value={fieldValues[f.key] ?? ""}
                                onChange={(e) => setFieldValues({ ...fieldValues, [f.key]: e.target.value })}
                              >
                                <option value="">Select...</option>
                                {allowedValues.map((v: string) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className="form-input"
                                value={fieldValues[f.key] ?? ""}
                                onChange={(e) => setFieldValues({ ...fieldValues, [f.key]: e.target.value })}
                                placeholder={f.hint || ""}
                              />
                            )}
                            {valErrors.find(err => err.path === `content.${f.key}`) && (
                              <span className="field-error">{valErrors.find(err => err.path === `content.${f.key}`)?.message}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Generic Frontmatter Relation Fields (Combobox arrays!) */}
                  {relationSpecs.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      {relationSpecs.map((r) => {
                        const isRequired = (requiredFields ?? []).includes(r.key);
                        const activeList = relationValues[r.key] || [];
                        const targets = Array.isArray(r.target) ? r.target : r.target ? [r.target] : [];
                        const dropdownOptions = elements
                          .filter((e) => targets.length === 0 || targets.includes(e.type))
                          .map((e) => ({
                            value: e.id,
                            label: `${e.id} - ${e.title}`,
                          }));

                        return (
                          <div className="array-section" key={r.key}>
                            <div className="array-header">
                              <span className="array-title">
                                {r.label}
                                {isRequired && <span className="el-field-req"> *</span>}
                              </span>
                              <button
                                type="button"
                                className="btn-add"
                                onClick={() => {
                                  setRelationValues({
                                    ...relationValues,
                                    [r.key]: [...activeList, ""],
                                  });
                                }}
                              >
                                + Add {r.label.replace("IDs", "").trim()}
                              </button>
                            </div>
                            <div className="array-list">
                              {activeList.map((relVal, idx) => (
                                <div key={idx} className="array-item">
                                  <Combobox
                                    value={relVal}
                                    onChange={(val) => {
                                      const current = [...activeList];
                                      current[idx] = val;
                                      setRelationValues({
                                        ...relationValues,
                                        [r.key]: current,
                                      });
                                    }}
                                    options={dropdownOptions}
                                    placeholder={`Select ${r.label.replace("IDs", "").trim()}...`}
                                    className="form-input"
                                  />
                                  <button
                                    type="button"
                                    className="btn-remove"
                                    onClick={() => {
                                      const current = [...activeList];
                                      current.splice(idx, 1);
                                      setRelationValues({
                                        ...relationValues,
                                        [r.key]: current,
                                      });
                                    }}
                                    aria-label="Remove item"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              {activeList.length === 0 && (
                                <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                                  No {r.label.toLowerCase()} linked yet.
                                </span>
                              )}
                            </div>
                            {valErrors.find(err => err.path === `content.${r.key}`) && (
                              <span className="field-error">{valErrors.find(err => err.path === `content.${r.key}`)?.message}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
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

              {(showMeta || asDocument) && (fieldSpecs.some((f) => page.meta[f.key]) ||
                fieldSpecs.some((f) =>
                  (requiredFields ?? []).includes(f.key),
                )) && (
                <div className="el-fields">
                  {fieldSpecs.map((f) => {
                    const val = page.meta[f.key];
                    if (!val) {
                      if (!(requiredFields ?? []).includes(f.key)) return null;
                      return (
                        <span className="el-field el-field-flag" key={f.key}>
                          {f.label}:{" "}
                          <span className="el-field-flag-txt">
                            — needs a value
                          </span>
                        </span>
                      );
                    }
                    const text = `${String(val)}${f.suffix ?? ""}`;
                    const url = f.urlKey ? page.meta[f.urlKey] : undefined;
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
            </>
          )}

          {!editing && (showMeta || asDocument) &&
            links.map((lg, idx) => (
              <div className="links" key={`${lg.label}-${idx}`}>
                <span className="link-group-label">{lg.label}:</span>
                {lg.ids.map((t) => {
                  const ref = getRef?.(t);
                  // Dangling relation target — the id resolves to no element in
                  // this process. Flag it inline (non-navigable) rather than
                  // render a chip that silently does nothing on click.
                  if (!ref) {
                    return (
                      <span
                        key={t}
                        className="link-chip link-chip-dangling"
                        title="Target not found in this process"
                      >
                        {t} <span className="link-chip-dangling-tag">not found</span>
                      </span>
                    );
                  }
                  return (
                    <ElementHovercard
                      key={t}
                      element={ref.page}
                      typeLabel={ref.typeLabel}
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

          {!editing && (showMeta || asDocument) && transitions.length > 0 && (
            <div className="el-transitions">
              <span className="el-transitions-label">Transitions</span>
              {transitions.map((t, idx) => {
                const label =
                  t.kind === "normal"
                    ? "next"
                    : t.kind === "loopback"
                      ? "loop-back"
                      : t.kind;
                return (
                  <div
                    className={`el-transition el-transition-${t.kind}`}
                    key={`${t.to}-${t.when}-${idx}`}
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
            {editing && saveError && <span className="el-edit-err">{saveError}</span>}
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

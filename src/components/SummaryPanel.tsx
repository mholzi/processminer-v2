"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveSummaryPart } from "@/lib/wiki-write";

type Part = { heading: string; text: string };

// An area's executive summary — an Amazon-style memo broken into its four
// parts (Introduction / Current state / What stands out / Recommendation),
// each individually editable. Generated silently by the area-summary skill.
export default function SummaryPanel({
  summary,
  status,
  slug,
  area,
  onGenerate,
}: {
  summary?: { parts: Part[]; generatedAt: string };
  status: "idle" | "generating" | "error";
  slug: string;
  area: string;
  onGenerate: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === "generating") {
    return (
      <div className="section-summary">
        <div className="section-summary-status">
          <span className="section-summary-spinner" /> Generating executive
          summary… this takes a moment.
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="section-summary">
        <div className="section-summary-empty">
          <p>No executive summary for this area yet.</p>
          {status === "error" && (
            <p className="section-summary-err">
              The last generation failed — try again.
            </p>
          )}
          <button className="section-summary-btn primary" onClick={onGenerate}>
            ✦ Generate executive summary
          </button>
        </div>
      </div>
    );
  }

  function startEdit(i: number) {
    setEditing(i);
    setDraft(summary!.parts[i].text);
    setError(null);
  }
  function save(i: number) {
    setError(null);
    start(async () => {
      try {
        await saveSummaryPart(slug, area, i, draft);
        setEditing(null);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save the edit.");
      }
    });
  }

  return (
    <div className="section-summary">
      {summary.parts.map((part, i) => (
        <div className="summary-part" key={`${part.heading}-${i}`}>
          <div className="summary-part-head">
            <h2>{part.heading}</h2>
            {editing !== i && (
              <button
                className="summary-part-edit"
                onClick={() => startEdit(i)}
              >
                Edit
              </button>
            )}
          </div>
          {editing === i ? (
            <div className="summary-part-editor">
              <textarea
                value={draft}
                rows={9}
                onChange={(e) => setDraft(e.target.value)}
              />
              {error && <span className="el-edit-err">{error}</span>}
              <div className="summary-part-actions">
                <button
                  className="section-summary-btn primary"
                  disabled={pending}
                  onClick={() => save(i)}
                >
                  {pending ? "Saving…" : "Save"}
                </button>
                <button
                  className="section-summary-btn"
                  disabled={pending}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="summary-part-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {part.text}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}
      <div className="section-summary-foot">
        <span>
          Generated{" "}
          {new Date(summary.generatedAt).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
        <button className="section-summary-btn" onClick={onGenerate}>
          Regenerate
        </button>
      </div>
    </div>
  );
}

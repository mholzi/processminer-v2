"use client";

import { useState } from "react";
import type { Schema } from "@/lib/wiki";
import Modal from "./Modal";

type Status = "all" | "approved" | "draft";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "all", label: "All elements" },
  { value: "approved", label: "Approved only" },
  { value: "draft", label: "Drafts only" },
];

// Scope picker for the documentation export. Builds the /print URL and opens
// it in a new tab; the print route does the rendering.
export default function ExportModal({
  open,
  onClose,
  schema,
  slug,
  userName,
}: {
  open: boolean;
  onClose: () => void;
  schema: Schema;
  slug: string;
  userName: string;
}) {
  const allAreaIds = schema.areas.map((a) => a.id);
  const [areaIds, setAreaIds] = useState<string[]>(allAreaIds);
  const [status, setStatus] = useState<Status>("all");
  const [summaries, setSummaries] = useState(true);
  const [glossary, setGlossary] = useState(false);
  const [flow, setFlow] = useState(true);
  const [raci, setRaci] = useState(true);

  if (!open) return null;

  const toggleArea = (id: string) =>
    setAreaIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );

  function generate() {
    const params = new URLSearchParams();
    params.set("areas", areaIds.join(","));
    params.set("status", status);
    params.set("summaries", summaries ? "1" : "0");
    params.set("glossary", glossary ? "1" : "0");
    params.set("flow", flow ? "1" : "0");
    params.set("raci", raci ? "1" : "0");
    if (userName) params.set("by", userName);
    window.open(`/print/${slug}?${params.toString()}`, "_blank");
    onClose();
  }

  return (
    <Modal
      title="Export documentation"
      onClose={onClose}
      actions={
        <>
          <button className="act" onClick={onClose}>
            Cancel
          </button>
          <button
            className="act ai"
            onClick={generate}
            disabled={areaIds.length === 0}
          >
            Generate PDF
          </button>
        </>
      }
    >
        <p className="modal-text">
          Build a printable PDF of this process to share for review. Opens in a
          new tab — use “Print / Save as PDF” there.
        </p>

        <div className="export-group">
          <div className="export-group-label">Areas</div>
          <div className="export-areas">
            {schema.areas.map((a) => (
              <label className="export-check" key={a.id}>
                <input
                  type="checkbox"
                  checked={areaIds.includes(a.id)}
                  onChange={() => toggleArea(a.id)}
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        <div className="export-group">
          <div className="export-group-label">Elements to include</div>
          <div className="export-radios">
            {STATUS_OPTIONS.map((o) => (
              <label className="export-check" key={o.value}>
                <input
                  type="radio"
                  name="export-status"
                  checked={status === o.value}
                  onChange={() => setStatus(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div className="export-group">
          <div className="export-group-label">Also include</div>
          <label className="export-check">
            <input
              type="checkbox"
              checked={summaries}
              onChange={(e) => setSummaries(e.target.checked)}
            />
            Executive summaries
          </label>
          <label className="export-check">
            <input
              type="checkbox"
              checked={glossary}
              onChange={(e) => setGlossary(e.target.checked)}
            />
            Glossary
          </label>
          <label className="export-check">
            <input
              type="checkbox"
              checked={flow}
              onChange={(e) => setFlow(e.target.checked)}
            />
            Process flow diagram
          </label>
          <label className="export-check">
            <input
              type="checkbox"
              checked={raci}
              onChange={(e) => setRaci(e.target.checked)}
            />
            RACI matrix
          </label>
        </div>

    </Modal>
  );
}

"use client";

import { useRef, useState } from "react";

// The document-upload popup. Drag a file (or click to browse); it is sent to
// /api/upload, saved into raw-sources/, and the parent then invokes the
// document-ingest skill on it.
export default function UploadModal({
  open,
  slug,
  onClose,
  onUploaded,
}: {
  open: boolean;
  slug: string;
  onClose: () => void;
  onUploaded: (path: string, fileName: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as {
        path?: string;
        file?: string;
        error?: string;
      };
      if (data.error || !data.path || !data.file) {
        setError(data.error || "Upload failed.");
        return;
      }
      onUploaded(data.path, data.file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={uploading ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-title">Upload a document</div>
        <p className="modal-text">
          Upload a document relevant to this process. The assistant will review
          it, summarise it, and extract its content into the wiki.
        </p>
        <div
          className={`upload-drop${dragging ? " dragging" : ""}${
            uploading ? " busy" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (uploading) return;
            const f = e.dataTransfer.files?.[0];
            if (f) upload(f);
          }}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          {uploading
            ? "Uploading…"
            : "Drag a PDF, Markdown, Word or text file here, or click to browse."}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.md,.markdown,.txt,.doc,.docx,.rtf"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) upload(f);
          }}
        />
        {error && <div className="modal-error">⚠ {error}</div>}
        <div className="modal-actions">
          <button className="act" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

// The document-upload popup. Drag a file (or click to browse), or paste the
// document's text directly. Either way the content is sent to /api/upload,
// saved into raw-sources/, and the parent then invokes the document-ingest
// skill on it. The paste path keeps the upload usable when there is no file
// to hand — and makes the flow scriptable / headless-testable.
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
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [pasteName, setPasteName] = useState("");
  const [pasteText, setPasteText] = useState("");
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

  // Paste mode — turn the pasted text into a Markdown File and upload it the
  // same way a dropped file goes. A name with no extension gets `.md`.
  function uploadPasted() {
    const text = pasteText.trim();
    if (!text || uploading) return;
    let name = (pasteName.trim() || "pasted-document").replace(/[\\/]/g, "-");
    if (!/\.[A-Za-z0-9]+$/.test(name)) name += ".md";
    upload(new File([text], name, { type: "text/markdown" }));
  }

  return (
    <div className="modal-overlay" onClick={uploading ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-title">Upload a document</div>
        <p className="modal-text">
          Add a document relevant to this process. The assistant will review
          it, summarise it, and extract its content into the wiki.
        </p>

        <div className="upload-modes">
          <button
            className={`upload-mode${mode === "file" ? " active" : ""}`}
            onClick={() => setMode("file")}
            disabled={uploading}
          >
            Upload a file
          </button>
          <button
            className={`upload-mode${mode === "paste" ? " active" : ""}`}
            onClick={() => setMode("paste")}
            disabled={uploading}
          >
            Paste text
          </button>
        </div>

        {mode === "file" ? (
          <>
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
          </>
        ) : (
          <div className="upload-paste">
            <input
              className="upload-name"
              type="text"
              placeholder="File name — e.g. process-doc.md"
              value={pasteName}
              disabled={uploading}
              onChange={(e) => setPasteName(e.target.value)}
            />
            <textarea
              className="upload-text"
              placeholder="Paste the document's text here…"
              value={pasteText}
              disabled={uploading}
              onChange={(e) => setPasteText(e.target.value)}
            />
          </div>
        )}

        {error && <div className="modal-error">⚠ {error}</div>}
        <div className="modal-actions">
          <button className="act" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          {mode === "paste" && (
            <button
              className="act ai"
              onClick={uploadPasted}
              disabled={uploading || !pasteText.trim()}
            >
              {uploading ? "Uploading…" : "Add document"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

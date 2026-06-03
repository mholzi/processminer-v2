"use client";

import React, { useState, useMemo } from "react";
import type { ProcessDoc } from "@/lib/wiki";

interface WholeDocRawViewProps {
  doc: ProcessDoc;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function WholeDocRawView({ doc }: WholeDocRawViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Use the actual JSON representation of the document file
  const docData = useMemo(() => {
    return doc.rawJson ?? doc;
  }, [doc]);

  const rawJson = useMemo(() => {
    return JSON.stringify(docData, null, 2);
  }, [docData]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Highlighting search match logic
  const highlightedContent = useMemo(() => {
    if (!searchQuery.trim()) {
      return rawJson;
    }

    try {
      const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, "gi");
      const parts = rawJson.split(regex);
      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="raw-json-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch (e) {
      return rawJson;
    }
  }, [rawJson, searchQuery]);

  return (
    <div className="whole-doc-raw-view">
      <div className="raw-view-toolbar">
        <div className="raw-search-container">
          <input
            type="text"
            className="raw-search-input"
            placeholder="Search JSON..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="raw-search-clear"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button
          className={`btn-copy-raw ${copied ? "copied" : ""}`}
          onClick={copyToClipboard}
          title="Copy full JSON to clipboard"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>

      <div className="raw-json-container">
        <pre className="raw-json-code">
          <code>{highlightedContent}</code>
        </pre>
      </div>
    </div>
  );
}

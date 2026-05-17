"use client";

import { Fragment, useEffect, useState } from "react";

// Renders one imported source document in the canvas. The Source Documents
// widget opens it; the text is fetched on demand from /api/sources. Layer-1
// documents are immutable — this is a read-only view of what was uploaded.

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith("**") && seg.endsWith("**") ? (
      <strong key={i}>{seg.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{seg}</Fragment>
    ),
  );
}

// A small markdown renderer — enough for the headings, bullets, tables,
// quotes and prose a source document carries. Not a full parser; code fences
// fall through to plain prose, which reads fine for these documents.
function renderDoc(text: string) {
  const out: React.ReactNode[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: string[] = [];
  let quote: string[] = [];
  let table: string[] = [];

  const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
  // A `|---|:--:|` divider between a table's header and body.
  const isTableSep = (l: string) => /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(l);

  const flushPara = () => {
    if (para.length) out.push(<p key={out.length}>{inline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (list.length) {
      const items = list;
      out.push(
        <ul key={out.length}>
          {items.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>,
      );
    }
    list = [];
  };
  const flushQuote = () => {
    if (quote.length)
      out.push(
        <blockquote key={out.length}>{inline(quote.join(" "))}</blockquote>,
      );
    quote = [];
  };
  const flushTable = () => {
    if (table.length) {
      const rows = table.map((r) =>
        r
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim()),
      );
      const [head, ...body] = rows;
      out.push(
        <table key={out.length}>
          <thead>
            <tr>
              {head.map((c, i) => (
                <th key={i}>{inline(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci}>{inline(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
    }
    table = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
    flushTable();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const quoted = line.match(/^\s*>\s?(.*)$/);

    if (heading) {
      flushAll();
      const level = heading[1].length;
      const Tag = (["h2", "h2", "h3", "h4"][level - 1] ?? "h4") as "h2";
      out.push(<Tag key={out.length}>{inline(heading[2])}</Tag>);
    } else if (isTableRow(line)) {
      flushPara();
      flushList();
      flushQuote();
      // The header/body divider carries no content — drop it.
      if (!isTableSep(line)) table.push(line);
    } else if (bullet || numbered) {
      flushPara();
      flushQuote();
      flushTable();
      list.push((bullet ?? numbered)![1]);
    } else if (quoted) {
      flushPara();
      flushList();
      flushTable();
      quote.push(quoted[1]);
    } else if (!line.trim()) {
      flushAll();
    } else if (/^[-=*_]{3,}$/.test(line.trim())) {
      flushAll();
      out.push(<hr key={out.length} />);
    } else {
      flushList();
      flushQuote();
      flushTable();
      para.push(line.trim());
    }
  }
  flushAll();
  return out;
}

export default function SourceDocViewer({
  slug,
  file,
}: {
  slug: string;
  file: string;
}) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; content: string }
  >({ status: "loading" });

  useEffect(() => {
    let live = true;
    setState({ status: "loading" });
    fetch(`/api/sources?slug=${encodeURIComponent(slug)}&file=${encodeURIComponent(file)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!live) return;
        if (!r.ok) {
          setState({ status: "error", message: data.error ?? "Could not load." });
        } else {
          setState({ status: "ready", content: data.content });
        }
      })
      .catch(() => {
        if (live) setState({ status: "error", message: "Could not load." });
      });
    return () => {
      live = false;
    };
  }, [slug, file]);

  if (state.status === "loading") {
    return <div className="docview-status">Loading {file}…</div>;
  }
  if (state.status === "error") {
    return <div className="docview-status">{state.message}</div>;
  }
  return <article className="docview">{renderDoc(state.content)}</article>;
}

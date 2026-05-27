import { Fragment, type ReactNode } from "react";
import { linkifyText, type GetRef } from "@/lib/linkify";

// Minimal markdown: paragraphs, `- ` bullet lists, `**bold**`. When `getRef`
// is supplied, element-id mentions inside the prose become hovercard chips
// (same component as chat refs + capability chips). Slice 1 keeps this
// dependency-free; a full renderer can replace it later if needed.

function inline(text: string, getRef?: GetRef): ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      const inner = seg.slice(2, -2);
      return (
        <strong key={i}>
          {getRef ? linkifyText(inner, getRef) : inner}
        </strong>
      );
    }
    return (
      <Fragment key={i}>
        {getRef ? linkifyText(seg, getRef) : seg}
      </Fragment>
    );
  });
}

export default function Markdown({
  text,
  getRef,
}: {
  text: string;
  /** When set, element-id mentions in the prose render as hovercard chips. */
  getRef?: GetRef;
}) {
  const blocks = text.split(/\n\n+/).filter((b) => b.trim());
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*[-•]\s/.test(l));
        if (isList) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>
                  {inline(l.replace(/^\s*[-•]\s*/, ""), getRef)}
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(block, getRef)}</p>;
      })}
    </>
  );
}

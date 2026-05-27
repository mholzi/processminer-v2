"use client";

import { Fragment, cloneElement, isValidElement, type ReactNode } from "react";
import type { WikiPage } from "./wiki";
import ElementHovercard from "@/components/ElementHovercard";

// Shared element-id linkifier. Two entry points:
//   - `linkifyText(text, getRef, onPick?, chipClass?)` — turn raw text runs
//     into a node array, wrapping each resolvable id in an ElementHovercard.
//   - `linkify(node, getRef, onPick?, chipClass?)` — recurse through an
//     already-rendered React tree (e.g. react-markdown output), linkifying
//     every text run while leaving <code>/<pre> blocks untouched.
//
// Used by AgentChat (chat refs, `chat-ref` chip), Markdown (`md-ref` chip),
// and any other surface that should turn `PS-FOO-001`-style mentions into
// rich hover targets. A single regex + single Hovercard wrap = no drift.

export const ELEMENT_ID = /\b[A-Z]{1,4}-[A-Z]{2,4}-\d{3}\b/g;

export type GetRef = (
  id: string,
) => { page: WikiPage; typeLabel: string } | undefined;

/** Linkify a plain text run — every resolvable id becomes a hovercard chip. */
export function linkifyText(
  text: string,
  getRef: GetRef,
  onPick?: (id: string) => void,
  chipClass = "md-ref",
): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  ELEMENT_ID.lastIndex = 0;
  while ((m = ELEMENT_ID.exec(text))) {
    const ref = getRef(m[0]);
    if (!ref) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <ElementHovercard
        key={`${m[0]}-${m.index}`}
        element={ref.page}
        typeLabel={ref.typeLabel}
        onSelect={onPick}
      >
        <span className={chipClass}>{m[0]}</span>
      </ElementHovercard>,
    );
    last = m.index + m[0].length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return (
    <>
      {out.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}

/** Recurse through rendered markdown children, linkifying text runs. `<code>`
 *  and `<pre>` blocks are left untouched — ids inside literal code aren't
 *  intended as references. */
export function linkify(
  node: ReactNode,
  getRef: GetRef,
  onPick?: (id: string) => void,
  chipClass = "chat-ref",
): ReactNode {
  if (typeof node === "string") {
    return linkifyText(node, getRef, onPick, chipClass);
  }
  if (Array.isArray(node)) {
    return node.map((n, i) => (
      <Fragment key={i}>{linkify(n, getRef, onPick, chipClass)}</Fragment>
    ));
  }
  if (isValidElement(node)) {
    if (node.type === "code" || node.type === "pre") return node;
    const children = (node.props as { children?: ReactNode }).children;
    if (children == null) return node;
    return cloneElement(
      node,
      undefined,
      linkify(children, getRef, onPick, chipClass),
    );
  }
  return node;
}

// Shared element-id linkification for the chat surfaces. Turns element ids in
// rendered markdown (e.g. PS-COB-001, CTL-COB-004) into hovercard-previewable,
// clickable refs. Used by both the per-process module chat (AgentChat) and the
// cross-process Advisory Board chat (AdvisorChat) so the behaviour is identical.

import {
  Fragment,
  cloneElement,
  createElement,
  isValidElement,
  type ReactNode,
} from "react";
import { type Components } from "react-markdown";
import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";

// Resolve an element id (e.g. "PS-FR-001") to its page + type label.
export type GetRef = (
  id: string,
) => { page: WikiPage; typeLabel: string } | undefined;

// Element ids look like <PREFIX>-<SLUG>-<NUMBER>, e.g. PS-FR-001, OAF-FR-012.
export const ELEMENT_ID = /\b[A-Z]{1,4}-[A-Z]{2,4}-\d{3}\b/g;

// Split a plain text run, wrapping every resolvable element id in a hovercard
// so it previews on hover. Ids that don't resolve are left as plain text.
function linkifyText(
  text: string,
  getRef: GetRef,
  onRefClick?: (id: string) => void,
): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  ELEMENT_ID.lastIndex = 0;
  while ((m = ELEMENT_ID.exec(text))) {
    const id = m[0];
    const ref = getRef(id);
    if (!ref) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <ElementHovercard
        key={`${id}-${m.index}`}
        element={ref.page}
        typeLabel={ref.typeLabel}
      >
        <span
          className="chat-ref"
          role={onRefClick ? "button" : undefined}
          onClick={onRefClick ? () => onRefClick(id) : undefined}
        >
          {id}
        </span>
      </ElementHovercard>,
    );
    last = m.index + m[0].length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Recurse through rendered markdown children, linkifying text runs. Code and
// pre blocks are left untouched — ids inside literal code aren't references.
function linkify(
  node: ReactNode,
  getRef: GetRef,
  onRefClick?: (id: string) => void,
): ReactNode {
  if (typeof node === "string") return linkifyText(node, getRef, onRefClick);
  if (Array.isArray(node))
    return node.map((n, i) => (
      <Fragment key={i}>{linkify(n, getRef, onRefClick)}</Fragment>
    ));
  if (isValidElement(node)) {
    if (node.type === "code" || node.type === "pre") return node;
    const children = (node.props as { children?: ReactNode }).children;
    if (children == null) return node;
    return cloneElement(node, undefined, linkify(children, getRef, onRefClick));
  }
  return node;
}

// Markdown block tags whose text content may carry element-id references.
const LINKABLE = [
  "p", "li", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
] as const;

export function buildComponents(
  getRef: GetRef,
  onRefClick?: (id: string) => void,
): Components {
  const out: Record<
    string,
    (props: { node?: unknown; children?: ReactNode }) => ReactNode
  > = {};
  for (const tag of LINKABLE) {
    out[tag] = ({ node: _node, children, ...rest }) =>
      createElement(tag, rest, linkify(children, getRef, onRefClick));
  }
  return out as Components;
}

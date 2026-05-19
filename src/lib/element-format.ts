// Pure formatting helpers for an element's review state — shared by the
// print/export renderer (and available to any read-only view). No fs / client
// imports, so it is safe in a server component.
import type { WikiPage } from "@/lib/wiki";
import { isSourcedType } from "@/lib/element-types";

/** True when the element has been signed off — approved (documentation
 *  elements) or marked relevant (web-sourced / ideated elements). */
export function elementApproved(page: WikiPage): boolean {
  if (isSourcedType(page.type)) {
    return String(page.meta.relevance ?? "") === "relevant";
  }
  return String(page.meta.approval ?? "") === "approved";
}

function stamp(verb: string, by: string, date: string): string {
  if (by && date) return `${verb} by ${by}, ${date}`;
  if (by) return `${verb} by ${by}`;
  return verb;
}

/** A one-line review-state label, plus whether the element should carry a
 *  DRAFT marker (anything not yet signed off). */
export function elementStatus(page: WikiPage): { draft: boolean; label: string } {
  const by = (k: string) => (page.meta[k] ? String(page.meta[k]) : "");
  if (isSourcedType(page.type)) {
    const rel = String(page.meta.relevance ?? "");
    if (rel === "relevant") {
      return {
        draft: false,
        label: stamp("Relevant", by("relevanceBy"), by("relevanceDate")),
      };
    }
    if (rel === "disregarded") {
      return {
        draft: true,
        label: stamp("Disregarded", by("relevanceBy"), by("relevanceDate")),
      };
    }
    return { draft: true, label: "To review" };
  }
  const approval = String(page.meta.approval ?? "");
  if (approval === "approved") {
    return {
      draft: false,
      label: stamp("Approved", by("approvalBy"), by("approvalDate")),
    };
  }
  if (approval === "rejected") {
    return {
      draft: true,
      label: stamp("Rejected", by("approvalBy"), by("approvalDate")),
    };
  }
  return { draft: true, label: "Draft — awaiting approval" };
}

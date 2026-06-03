"use server";

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getSchema, jsonElementToWikiPage, toCamelCase } from "./wiki.ts";
import { checkElement, checkFrontmatter, checkFieldValues, checkProvenance } from "./conformance.ts";

let revalidatePath = (path: string) => {};
import("next/cache")
  .then((m) => {
    revalidatePath = m.revalidatePath;
  })
  .catch(() => {});

const WIKI_DIR = join(process.cwd(), "wiki", "processes");

export async function updateElement(
  slug: string,
  id: string,
  patch: { meta?: any; content?: any }
): Promise<{ ok: boolean; element?: any; error?: string }> {
  const schema = getSchema();
  const filePath = join(WIKI_DIR, `${slug}.json`);
  if (!existsSync(filePath)) {
    return { ok: false, error: `Process not found: ${slug}` };
  }

  const doc = JSON.parse(readFileSync(filePath, "utf8"));
  
  if (doc.meta?.id === id) {
    if (patch.meta) doc.meta = { ...doc.meta, ...patch.meta };
    if (patch.content) doc.content = { ...doc.content, ...patch.content };
    for (const [k, v] of Object.entries(patch)) {
      if (k !== "meta" && k !== "content") {
        doc[k] = v;
      }
    }
    writeFileSync(filePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
    revalidatePath("/");
    return { ok: true, element: { meta: doc.meta, content: doc.content } };
  }

  let foundCollection = "";
  let foundIndex = -1;
  for (const [key, val] of Object.entries(doc)) {
    if (!Array.isArray(val)) continue;
    const idx = val.findIndex((el: any) => el.meta?.id === id);
    if (idx !== -1) {
      foundCollection = key;
      foundIndex = idx;
      break;
    }
  }
  if (foundIndex === -1) {
    return { ok: false, error: `Element ${id} not found in process document.` };
  }

  const existingElement = doc[foundCollection][foundIndex];
  const singularType = existingElement.meta?.type;

  const newMeta = {
    ...(existingElement.meta || {}),
    ...(patch.meta || {}),
    id,
    type: singularType,
    section: foundCollection
  };
  const newContent = {
    ...(existingElement.content || {}),
    ...(patch.content || {})
  };

  // Reset provenance for edited fields
  if (patch.content && existingElement.meta?.provenance) {
    const newProv = { ...(newMeta.provenance || {}) };
    const info = schema.elementTypes[singularType];
    if (info && info.template) {
      for (const t of info.template) {
        let camelKey = toCamelCase(t.heading);
        if (singularType === "process-step") {
          if (t.heading === "What happens") camelKey = "description";
          if (t.heading === "Why it matters") camelKey = "businessValue";
        }
        if (patch.content[camelKey] !== undefined && JSON.stringify(patch.content[camelKey]) !== JSON.stringify(existingElement.content?.[camelKey])) {
          newProv[t.heading] = { source: "proposed", evidence: "" };
        }
      }
    }
    newMeta.provenance = newProv;
  }

  const fullElement = { meta: newMeta, content: newContent };
  const info = schema.elementTypes[singularType];
  const pageRepresentation = jsonElementToWikiPage(fullElement, info);
  
  const validationIssues = [
    ...checkElement(pageRepresentation, info.template || []).filter(c => !c.ok).map(c => `“${c.heading}” ${c.issue}`),
    ...checkFrontmatter(pageRepresentation, info),
    ...checkFieldValues(pageRepresentation, info, schema),
    ...checkProvenance(pageRepresentation, info)
  ];

  if (validationIssues.length > 0) {
    return { ok: false, error: `Validation failed:\n- ${validationIssues.join("\n- ")}` };
  }

  // A content/meta edit by human confirms the element and invalidates prior review verdicts
  const isSmeAction = patch.meta?.status === "confirmed" || (patch.content && Object.keys(patch.content).length > 0);
  if (isSmeAction) {
    newMeta.status = "confirmed";
    if (newMeta.approval === "approved") {
      newMeta.approval = "in-progress";
      newMeta.approvalBy = "";
      newMeta.approvalDate = "";
    }
    if (["relevant", "disregarded"].includes(newMeta.relevance)) {
      newMeta.relevance = "";
      newMeta.relevanceBy = "";
      newMeta.relevanceDate = "";
    }
  }

  doc[foundCollection][foundIndex] = fullElement;
  if (singularType === "process-step") {
    doc[foundCollection].sort((a: any, b: any) => (a.meta?.sequence || 999) - (b.meta?.sequence || 999));
  } else {
    doc[foundCollection].sort((a: any, b: any) => (a.meta?.id || "").localeCompare(b.meta?.id || ""));
  }

  writeFileSync(filePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
  revalidatePath("/");
  return { ok: true, element: fullElement };
}

const APPROVAL_VALUES = ["in-progress", "approved", "rejected"];

export async function setApproval(
  slug: string,
  id: string,
  approval: string,
  by: string,
): Promise<{ ok: true }> {
  if (!APPROVAL_VALUES.includes(approval)) {
    throw new Error(`Invalid approval value: ${approval}`);
  }
  const date = new Date().toISOString().slice(0, 10);
  const patch = {
    meta: {
      approval,
      approvalBy: by,
      approvalDate: date
    }
  };
  const res = await updateElement(slug, id, patch);
  if (!res.ok) {
    throw new Error(res.error || "Failed to set approval");
  }
  return { ok: true };
}

export async function saveSummaryPart(
  slug: string,
  area: string,
  index: number,
  text: string,
): Promise<{ ok: true }> {
  const path = join(WIKI_DIR, `${slug}.json`);
  if (!existsSync(path)) throw new Error("No process file found.");
  const data = JSON.parse(readFileSync(path, "utf8"));
  const summaries = data.summaries;
  if (!summaries) throw new Error("No summaries found for this process.");
  const entry = summaries[area];
  if (!entry || !Array.isArray(entry.parts) || !entry.parts[index]) {
    throw new Error(`Summary part not found: ${area}[${index}]`);
  }
  entry.parts[index].text = text.trim();
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  revalidatePath("/");
  return { ok: true };
}

const RELEVANCE_VALUES = ["", "relevant", "disregarded"];

export async function setRelevance(
  slug: string,
  id: string,
  relevance: string,
  by: string,
): Promise<{ ok: true }> {
  if (!RELEVANCE_VALUES.includes(relevance)) {
    throw new Error(`Invalid relevance value: ${relevance}`);
  }
  const date = new Date().toISOString().slice(0, 10);
  const patch = {
    meta: {
      relevance,
      relevanceBy: by,
      relevanceDate: date
    }
  };
  const res = await updateElement(slug, id, patch);
  if (!res.ok) {
    throw new Error(res.error || "Failed to set relevance");
  }
  return { ok: true };
}

const TRIAGE_VALUES = ["pending", "accepted", "rejected"];

export async function triageTargetReview(
  slug: string,
  itemId: string,
  triage: string,
): Promise<{ ok: true }> {
  if (!TRIAGE_VALUES.includes(triage)) {
    throw new Error(`Invalid triage value: ${triage}`);
  }
  const path = join(WIKI_DIR, `${slug}.json`);
  if (!existsSync(path)) throw new Error("No process file found.");
  
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const review = doc.targetReview;
  if (!review) throw new Error("No council review for this process.");
  const item = review.items.find((i: any) => i.id === itemId);
  if (!item) throw new Error(`Review item not found: ${itemId}`);
  item.triage = triage;

  if (triage === "accepted") {
    const date = new Date().toISOString().slice(0, 10);
    for (const targetId of item.targets) {
      let foundCollection = "";
      let foundIndex = -1;
      for (const [key, val] of Object.entries(doc)) {
        if (!Array.isArray(val)) continue;
        const idx = val.findIndex((el: any) => el.meta?.id === targetId);
        if (idx !== -1) {
          foundCollection = key;
          foundIndex = idx;
          break;
        }
      }
      if (foundIndex !== -1) {
        const el = doc[foundCollection][foundIndex];
        if (el.meta?.approval === "approved") {
          el.meta.approval = "in-progress";
          el.meta.approvalBy = "council-review";
          el.meta.approvalDate = date;
        }
      }
    }
  }

  writeFileSync(path, JSON.stringify(doc, null, 2) + "\n", "utf8");
  revalidatePath("/");
  return { ok: true };
}

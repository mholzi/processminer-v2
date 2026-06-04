#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { getSchema, jsonElementToWikiPage, transitionTarget } from "./wiki.ts";
import { writeRuntime } from "./runtime-store.ts";
import { buildTargetReview, parseSummaryParts } from "./session-writes.ts";
import { checkElement, checkProvenance, checkFrontmatter, checkFieldValues, checkConformance } from "./conformance.ts";
import { updateElement } from "./wiki-write.ts";
import { replaceTempKeys, generateNextId, buildProcessDoc } from "./gemini-worker.ts";

/**
 * CLAUDE NATIVE MCP SERVER
 * 
 * This file exists strictly to support the real `claude` CLI integration natively.
 * 
 * By exposing these exact same TypeScript functions (which GenAI calls directly in 
 * `gemini-worker.ts`) via the Model Context Protocol (MCP), your colleague's real 
 * Claude CLI will natively enforce the JSON schemas of these tools BEFORE making 
 * any edits, behaving identically to the GenAI approach without requiring the 
 * legacy python scripts.
 * 
 * If something breaks when testing via the real Claude CLI:
 * 1. Check if the tool schema here drifted from `toolDeclarations` in `gemini-worker.ts`.
 * 2. The core logic calls the shared files (`wiki-write.ts`, `conformance.ts`).
 */

const SESSIONS_MAP_PATH = path.join(process.cwd(), "wiki", "processes", ".sessions.json");

// Global state for temp keys within a single process run, shared across multiple tool calls
// In a robust implementation, this would be scoped to the session or request.
const tempKeyMap = new Map<string, string>();

const server = new Server(
  {
    name: "processminer-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// We define the same schema-enforced tools as in GeminiWorker
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "expandElement",
        description: "Expand an abridged collection list or retrieve the full content of a specific element.",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", description: "The collection name, e.g. 'process-steps', 'exceptions'." },
            id: { type: "string", description: "Optional. The specific element ID to expand. If omitted, returns all." },
            slug: { type: "string", description: "The process slug." }
          },
          required: ["type", "slug"]
        }
      },
      {
        name: "createElement",
        description: "Create a new process element conforming to the JSON schema. The ID is automatically generated.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            type: { type: "string", description: "The collection name, e.g. 'process-steps'." },
            tempKey: { type: "string", description: "Optional. An ephemeral temporary key." },
            element: {
              type: "object",
              description: "The element payload containing metadata (meta) and content fields. Do not include 'id' inside meta.",
              properties: {
                meta: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    confidence: { type: "string" },
                    source: { type: "string" },
                    provenance: { type: "object" }
                  },
                  required: ["source"]
                },
                content: { type: "object" }
              },
              required: ["meta", "content"]
            }
          },
          required: ["slug", "type", "element"]
        }
      },
      {
        name: "updateElement",
        description: "Update an existing process element by applying a deep merge patch.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            id: { type: "string", description: "The unique ID of the element to update." },
            patch: {
              type: "object",
              description: "JSON object containing updated fields.",
              properties: {
                meta: { type: "object" },
                content: { type: "object" }
              }
            }
          },
          required: ["slug", "id", "patch"]
        }
      },
      {
        name: "checkConformance",
        description: "Run deterministic template-conformance checks on all elements.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." }
          },
          required: ["slug"]
        }
      },
      {
        name: "checkTransitions",
        description: "Reconcile process-step transitions against exceptions to find orphans or broken links.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." }
          },
          required: ["slug"]
        }
      },
      {
        name: "applyLint",
        description: "Apply a set of lint findings.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            findings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  kind: { type: "string" },
                  title: { type: "string" },
                  detail: { type: "string" },
                  elements: { type: "array", items: { type: "string" } }
                },
                required: ["kind", "title", "detail", "elements"]
              }
            }
          },
          required: ["slug", "findings"]
        }
      },
      {
        name: "writeTargetReview",
        description: "Write the council-review result (the target-state review feedback) to the process. Id-stamps the items (R-001…) and marks each triage: pending. Used by the council-review skill.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            reviewData: {
              type: "object",
              description: "{ ran: string[], items: [{ specialist, title, detail, targets: string[] }] }",
              properties: {
                ran: { type: "array", items: { type: "string" } },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      specialist: { type: "string" },
                      title: { type: "string" },
                      detail: { type: "string" },
                      targets: { type: "array", items: { type: "string" } }
                    },
                    required: ["specialist", "title", "detail", "targets"]
                  }
                }
              },
              required: ["ran", "items"]
            }
          },
          required: ["slug", "reviewData"]
        }
      },
      {
        name: "writeSummary",
        description: "Write one area's executive summary (an Amazon-style memo with exactly four ## headings: Introduction, Current state, What stands out, Recommendation) into the process's `summaries`, keyed by area. Used by the area-summary skill.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            area: { type: "string", description: "The area id, e.g. 'as-is-process'." },
            summary: { type: "string", description: "The memo markdown with exactly the four headings in order." }
          },
          required: ["slug", "area", "summary"]
        }
      },
      {
        name: "scaffoldProcess",
        description: "Create a brand-new, empty process document (root meta + an empty overview). Used only by the new-process skill before any content exists. Refuses to overwrite an existing process.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Deterministic kebab-case slug — the file name." },
            PROC: { type: "string", description: "Uppercase process abbreviation for element IDs, e.g. 'FRL'." },
            title: { type: "string", description: "The process title." },
            description: { type: "string", description: "One-line process description." }
          },
          required: ["slug", "PROC", "title"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const slug = args?.slug as string;
  
  if (!slug) {
    throw new McpError(ErrorCode.InvalidParams, "slug is required for all tools.");
  }

  const processFilePath = path.join(process.cwd(), "wiki", "processes", `${slug}.json`);

  // scaffoldProcess is the one tool that CREATES the document, so it runs
  // before the "must already exist" guard below.
  if (name === "scaffoldProcess") {
    const PROC = String(args?.PROC || "").toUpperCase().trim();
    const title = String(args?.title || "").trim();
    const description = String(args?.description || "");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      throw new McpError(ErrorCode.InvalidParams, "slug must be kebab-case (lowercase letters, digits and single hyphens).");
    }
    if (!/^[A-Z]{2,6}$/.test(PROC)) {
      throw new McpError(ErrorCode.InvalidParams, "PROC must be 2–6 uppercase letters.");
    }
    if (!title) {
      throw new McpError(ErrorCode.InvalidParams, "title is required.");
    }
    if (fs.existsSync(processFilePath)) {
      throw new McpError(ErrorCode.InvalidParams, `A process already exists for slug: ${slug}`);
    }
    const newDoc = buildProcessDoc(PROC, title, description);
    fs.writeFileSync(processFilePath, JSON.stringify(newDoc, null, 2) + "\n", "utf8");
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, slug, id: newDoc.meta.id, created: true }, null, 2) }] };
  }

  let doc: any = null;
  if (fs.existsSync(processFilePath)) {
    try {
      doc = JSON.parse(fs.readFileSync(processFilePath, "utf8"));
    } catch (e) {
      throw new McpError(ErrorCode.InternalError, "Failed to parse process json.");
    }
  } else {
    throw new McpError(ErrorCode.InvalidParams, `Process document not found for slug: ${slug}`);
  }

  try {
    if (name === "expandElement") {
      const type = args?.type as string;
      const id = args?.id as string;
      if (!id) {
        const list = doc[type] || [];
        const elements = list.map((el: any) => ({
          id: el.meta?.id,
          title: el.content?.title
        }));
        return { content: [{ type: "text", text: JSON.stringify({ type, elements }, null, 2) }] };
      } else {
        const list = doc[type] || [];
        const element = list.find((el: any) => el.meta?.id === id);
        if (!element) throw new McpError(ErrorCode.InvalidParams, `Element ${id} not found.`);
        return { content: [{ type: "text", text: JSON.stringify(element, null, 2) }] };
      }
    } 
    
    else if (name === "createElement") {
      const type = args?.type as string;
      let element = args?.element as any;
      const tempKey = args?.tempKey as string;
      const schema = getSchema();

      element = replaceTempKeys(element, tempKeyMap);

      let singularType = "";
      for (const [t, def] of Object.entries(schema.elementTypes)) {
        if ((def as any).section === type) {
          singularType = t;
          break;
        }
      }
      if (!singularType) throw new McpError(ErrorCode.InvalidParams, `Unknown collection type: ${type}`);
      
      const info = schema.elementTypes[singularType];
      const idPrefix = info.idPrefix;
      const newId = generateNextId(doc, singularType, idPrefix);

      const newMeta = {
        ...(element.meta || {}),
        id: newId,
        type: singularType,
        section: type,
        status: element.meta?.status || "draft",
      };
      const newContent = { ...(element.content || {}) };
      const fullElement = { meta: newMeta, content: newContent };

      const pageRepresentation = jsonElementToWikiPage(fullElement, info);
      const validationIssues = [
        ...checkElement(pageRepresentation, info.template || []).filter(c => !c.ok).map(c => `“${c.heading}” ${c.issue}`),
        ...checkFrontmatter(pageRepresentation, info),
        ...checkFieldValues(pageRepresentation, info, schema),
        ...checkProvenance(pageRepresentation, info)
      ];

      if (validationIssues.length > 0) {
        return { content: [{ type: "text", text: `Error: Element validation failed:\n- ${validationIssues.join("\n- ")}` }] };
      }

      if (!doc[type]) doc[type] = [];
      doc[type].push(fullElement);
      if (singularType === "process-step") {
        doc[type].sort((a: any, b: any) => (a.meta?.sequence || 999) - (b.meta?.sequence || 999));
      }

      fs.writeFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n", "utf8");

      if (tempKey) {
        const cleanKey = tempKey.startsWith("@") ? tempKey.slice(1) : tempKey;
        tempKeyMap.set(cleanKey, newId);
      }

      return { content: [{ type: "text", text: JSON.stringify({ ok: true, id: newId, element: fullElement }, null, 2) }] };
    } 
    
    else if (name === "updateElement") {
      const id = args?.id as string;
      let patch = args?.patch as any;

      patch = replaceTempKeys(patch, tempKeyMap);

      let targetId = id;
      if (targetId.startsWith("@")) {
        const key = targetId.slice(1);
        if (tempKeyMap.has(key)) targetId = tempKeyMap.get(key)!;
      }

      const res = await updateElement(slug, targetId, patch);
      if (!res.ok) {
        return { content: [{ type: "text", text: `Error: Element validation failed:\n- ${res.error}` }] };
      }
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, id: targetId, element: res.element }, null, 2) }] };
    } 
    
    else if (name === "checkConformance") {
      const schema = getSchema();
      const elements: any[] = [];
      for (const [key, val] of Object.entries(doc)) {
        if (!Array.isArray(val)) continue;
        let singularType = "";
        for (const [t, def] of Object.entries(schema.elementTypes)) {
          if ((def as any).section === key) {
            singularType = t;
            break;
          }
        }
        if (!singularType) continue;
        const info = schema.elementTypes[singularType];
        for (const el of val) {
          elements.push(jsonElementToWikiPage(el, info));
        }
      }
      const findings = checkConformance(elements, schema);
      return { content: [{ type: "text", text: JSON.stringify(findings, null, 2) }] };
    } 
    
    else if (name === "checkTransitions") {
      const findings: any[] = [];
      const steps = doc["process-steps"] || [];
      const exceptions = doc["exceptions"] || [];
      const exceptionIds = new Set(exceptions.map((e: any) => e.meta?.id).filter(Boolean));
      const targetedExceptions = new Set<string>();
      
      let n = 0;
      for (const step of steps) {
        const transitions = step.content?.transitions || [];
        for (const t of transitions) {
          const targetId = transitionTarget(t); // R7: accepts object or string form
          if (targetId) {
            if (targetId.startsWith("EX-")) {
              targetedExceptions.add(targetId);
              if (!exceptionIds.has(targetId)) {
                n++;
                findings.push({
                  id: `T-${n}`,
                  kind: "discrepancy",
                  title: `${step.content?.title || step.meta?.id} (${step.meta?.id})`,
                  detail: `Transitions to exception ${targetId} which does not exist in the document.`,
                  elements: [step.meta?.id]
                });
              }
            }
          }
        }
      }
      for (const ex of exceptions) {
        const exId = ex.meta?.id;
        if (exId && !targetedExceptions.has(exId)) {
          n++;
          findings.push({
            id: `T-${n}`,
            kind: "discrepancy",
            title: `${ex.content?.title || exId} (${exId})`,
            detail: `Orphan exception — no process-step transition leads to this exception.`,
            elements: [exId]
          });
        }
      }
      return { content: [{ type: "text", text: JSON.stringify(findings, null, 2) }] };
    } 
    
    else if (name === "applyLint") {
      const findings = args?.findings as any[];
      // R9: the lint report is runtime/derived state — store it above the wiki.
      writeRuntime(slug, { lint: findings as any });
      delete doc.lint; // guardrail: lint never lives in the wiki JSON

      const implicated = new Set<string>();
      for (const f of findings) {
        for (const elId of (f.elements || [])) implicated.add(elId);
      }

      for (const [key, val] of Object.entries(doc)) {
        if (Array.isArray(val)) {
          for (const el of val) {
            // Re-open an approved element a finding implicates. Approval lives
            // in `meta.approval` (not `meta.status`); the old check never fired.
            if (el.meta?.id && implicated.has(el.meta.id) && el.meta?.approval === "approved") {
              el.meta.approval = "in-progress";
              el.meta.approvalBy = "run-lint";
              el.meta.approvalDate = new Date().toISOString().slice(0, 10);
            }
          }
        }
      }
      fs.writeFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, implicatedCount: implicated.size }, null, 2) }] };
    }

    else if (name === "writeTargetReview") {
      // Council-review result — a durable root field of the process JSON.
      doc.targetReview = buildTargetReview(slug, args?.reviewData as any);
      fs.writeFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, items: doc.targetReview.items.length }, null, 2) }] };
    }

    else if (name === "writeSummary") {
      const area = args?.area as string;
      const parts = parseSummaryParts((args?.summary as string) || "");
      if (!doc.summaries || typeof doc.summaries !== "object") doc.summaries = {};
      doc.summaries[area] = { parts, generatedAt: new Date().toISOString() };
      fs.writeFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, area, parts: parts.length }, null, 2) }] };
    }

    else {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Processminer MCP server running on stdio");
}

run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

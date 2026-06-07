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
import { atomicWriteFileSync } from "./atomic-write.ts";
import * as path from "node:path";
import { getSchema, jsonElementToWikiPage, transitionTarget, listProcesses, getProcessSummary, getProcessElements, searchProcesses } from "./wiki.ts";
import { canAccess } from "./process-access.ts";
import { writeRuntime, getRuntime, setDtpSummary } from "./runtime-store.ts";
import { buildTargetReview, parseSummaryParts, buildIngestReport, clearIngestConflicts, buildApprovalPatch } from "./session-writes.ts";
import { writeDtpReport, writeDtpComparison } from "./dtp-report.ts";
import { buildNote, appendNote, resolveNotesInDoc } from "./session-notes.ts";
import {
  buildFoundationalQueue,
  newReviewState,
  advance,
  foundationalStatus,
  qerStatus,
  qerStatusWithPerspectives,
  QER_STEPS,
} from "./session-cursor.ts";
import { checkConformance } from "./conformance.ts";
import { updateElement } from "./wiki-write.ts";
import { buildProcessDoc } from "./gemini-worker.ts";
import { deriveProcessMeta, scaffoldClosing } from "./process-scaffold.ts";
import {
  replaceTempKeys,
  buildElement,
  applyElement,
  createElementsBatch,
  type BatchSpec,
} from "./session-create.ts";

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

// ---- Per-process access (R16) ----
// The session's signed-in identity, handed down by SessionWorker via env (the
// `claude` CLI inherits it and passes it to this stdio MCP server). Every
// slug-bearing tool is gated by canAccess, so a session can only reach the
// processes its user can see — not every process on disk. When the identity
// is absent (the env was not set — e.g. a non-session invocation), we leave
// access open: the session HTTP route is the trust boundary that requires a
// signed-in user, so a worker with no identity context only exists outside it.
const SESSION_USER = process.env.PM_SESSION_USER || null;
const SESSION_IS_ADMIN = process.env.PM_SESSION_IS_ADMIN === "1";
function hasAccess(slug: string): boolean {
  if (!SESSION_USER) return true; // no identity context — see note above
  return canAccess({ username: SESSION_USER, isAdmin: SESSION_IS_ADMIN }, slug);
}
function assertAccess(slug: string): void {
  if (!hasAccess(slug)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Access denied: you do not have access to process "${slug}".`,
    );
  }
}

// Whether a perspective's specialist skill is installed — a deterministic
// filesystem fact, so qer-session's Step 3 never has to guess which specialists
// exist. Used to compute the perspective map in getSessionStatus.
function qerSkillBuilt(skill: string): boolean {
  return fs.existsSync(path.join(process.cwd(), ".claude", "skills", skill, "SKILL.md"));
}

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
        name: "createElements",
        description: "Author a whole run of elements in one call. Each spec carries a 'type' (collection name), an 'element' payload (same shape as createElement, no id), and an optional 'tempKey'. Elements may cross-reference each other within the batch via '@tempKey'. The backend assigns every id, resolves every '@tempKey', and returns per-type 'counts' (use these for your report — there is no separate manifest). A failing element is reported in 'errors' and skipped; the rest still write.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            elements: {
              type: "array",
              description: "The element specs to create, in order.",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", description: "The collection name, e.g. 'market-trends'." },
                  tempKey: { type: "string", description: "Optional ephemeral key so a later element in this batch can reference this one via '@tempKey'." },
                  element: {
                    type: "object",
                    description: "The element payload (meta + content). Do not include 'id'.",
                    properties: {
                      meta: { type: "object" },
                      content: { type: "object" }
                    },
                    required: ["meta", "content"]
                  }
                },
                required: ["type", "element"]
              }
            }
          },
          required: ["slug", "elements"]
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
        name: "deriveProcessMeta",
        description: "Deterministically derive a new process's slug and `<PROC>` abbreviation from its name, and report whether the slug is taken (with non-colliding alternatives). Returns a guaranteed-valid abbreviation (2–6 uppercase letters) and the exact confirm-bullet template. Call this in the new-process skill before scaffolding; use exactly what it returns — never invent the slug or abbreviation.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "The raw process name the user gave." }
          },
          required: ["name"]
        }
      },
      {
        name: "scaffoldProcess",
        description: "Create a brand-new, empty process document (root meta + an empty overview). Used only by the new-process skill before any content exists. Refuses to overwrite an existing process. Returns the canonical closing message to relay verbatim.",
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
      },
      {
        name: "writeIngestReport",
        description: "Write the document-ingest result into the process JSON's `ingest` field (file, created/updated ids, conflicts/corrections). Stamps slug + generatedAt. The app's triage screen reads this. Used by document-ingest.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            report: {
              type: "object",
              description: "The ingest result.",
              properties: {
                file: { type: "string" },
                created: { type: "array", items: { type: "string" } },
                updated: { type: "array", items: { type: "string" } },
                conflicts: { type: "array", items: { type: "object" } },
                corrections: { type: "array", items: { type: "object" } }
              }
            }
          },
          required: ["slug", "report"]
        }
      },
      {
        name: "writeDtpReport",
        description: "Write a regenerated DTP and its critical-review report. Saves the Markdown as a new versioned file under raw-sources/<slug>/ (flagged generated), stamps finding ids (DTPF-…), and stores the report (generatedFile + findings) in the runtime store — never the wiki JSON. Returns the generated filename and finding count. Used by dtp-regenerate.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            report: {
              type: "object",
              description: "The regeneration result.",
              properties: {
                basis: { type: "string", description: "Always 'as-is' today." },
                sourceFile: { type: "string", description: "Original DTP filename the regeneration is based on (doc.ingest.file)." },
                markdown: { type: "string", description: "The full regenerated DTP, as Markdown." },
                findings: {
                  type: "array",
                  description: "Critical-review findings — the original DTP vs the corrected As-Is wiki.",
                  items: {
                    type: "object",
                    properties: {
                      kind: { type: "string", enum: ["outdated", "missing", "contradiction", "added"] },
                      headline: { type: "string", description: "One-line plain-English summary of the discrepancy, for scanning a list." },
                      dtpSays: { type: "string" },
                      wikiSays: { type: "string" },
                      elements: { type: "array", items: { type: "string" } },
                      severity: { type: "string", enum: ["high", "medium", "low"] },
                      rationale: { type: "string", description: "One line on why this severity / why it matters (e.g. 'control gap', 'wrong owner on a key step')." },
                      suggestedDisposition: { type: "string", enum: ["accepted", "dismissed"], description: "Suggested call: 'accepted' = a DTP correction; 'dismissed' = more likely a wiki issue to reconcile." }
                    },
                    required: ["kind", "headline", "wikiSays"]
                  }
                },
                coverage: {
                  type: "object",
                  description: "What the run reviewed, for the coverage map.",
                  properties: {
                    dtpSections: { type: "array", items: { type: "string" }, description: "The DTP sections/headings the run walked." }
                  }
                }
              },
              required: ["sourceFile", "markdown"]
            }
          },
          required: ["slug", "report"]
        }
      },
      {
        name: "writeDtpComparison",
        description: "Record a comparison-only DTP run: the chosen original DTP critically reviewed against the corrected As-Is wiki. Stamps finding ids (DTPF-…) and stores the findings + pointer in the runtime store as a new past-comparison entry — no Markdown is generated and no artifact is written. Returns the run id and finding count. Used by dtp-compare.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            report: {
              type: "object",
              description: "The comparison result.",
              properties: {
                sourceFile: { type: "string", description: "The DTP filename reviewed (under raw-sources/<slug>/)." },
                findings: {
                  type: "array",
                  description: "Critical-review findings — the chosen DTP vs the corrected As-Is wiki.",
                  items: {
                    type: "object",
                    properties: {
                      kind: { type: "string", enum: ["outdated", "missing", "contradiction", "added"] },
                      headline: { type: "string", description: "One-line plain-English summary of the discrepancy, for scanning a list." },
                      dtpSays: { type: "string" },
                      wikiSays: { type: "string" },
                      elements: { type: "array", items: { type: "string" } },
                      severity: { type: "string", enum: ["high", "medium", "low"] },
                      rationale: { type: "string", description: "One line on why this severity / why it matters (e.g. 'control gap', 'wrong owner on a key step')." },
                      suggestedDisposition: { type: "string", enum: ["accepted", "dismissed"], description: "Suggested call: 'accepted' = a DTP correction; 'dismissed' = more likely a wiki issue to reconcile." }
                    },
                    required: ["kind", "headline", "wikiSays"]
                  }
                },
                coverage: {
                  type: "object",
                  description: "What the comparison reviewed, for the coverage map.",
                  properties: {
                    dtpSections: { type: "array", items: { type: "string" }, description: "The DTP sections/headings the comparison walked." }
                  }
                }
              },
              required: ["sourceFile", "findings"]
            }
          },
          required: ["slug", "report"]
        }
      },
      {
        name: "writeDtpSummary",
        description: "Store the executive-summary memo for one past DTP comparison run, keyed by its run id. Markdown. Stored in the runtime store — never the wiki JSON. Used by dtp-summary.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            runId: { type: "string", description: "The DTP run id the memo summarises (e.g. DTP-REGEN-003)." },
            summary: { type: "string", description: "The executive-summary memo, as Markdown." }
          },
          required: ["slug", "runId", "summary"]
        }
      },
      {
        name: "clearConflicts",
        description: "Empty the `conflicts` array on the process JSON's `ingest` report once every conflict is resolved, so the triage screen stops flagging them. No-op if there is no ingest report. Used by conflict-resolution.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." }
          },
          required: ["slug"]
        }
      },
      {
        name: "createNote",
        description: "Post a note onto an element's discussion thread (the process JSON's `notes`). Used by comment-review to post its closing analyst summary. The id + timestamp are backend-assigned.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            elementId: { type: "string", description: "The element the note is attached to." },
            author: { type: "string", description: "Who is posting — the analyst / SME name." },
            content: { type: "string", description: "The note text." },
            type: { type: "string", description: "Optional note kind, e.g. 'summary'." },
            replyTo: { type: "string", description: "Optional id of the note this replies to." }
          },
          required: ["slug", "elementId", "content"]
        }
      },
      {
        name: "resolveNotes",
        description: "Mark the given note ids resolved across the process's discussion threads. Used by comment-review once each comment has a decision.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            noteIds: { type: "array", items: { type: "string" }, description: "The note ids to resolve." },
            resolvedBy: { type: "string", description: "Optional — who resolved them; defaults to 'SME'." }
          },
          required: ["slug", "noteIds"]
        }
      },
      {
        name: "setApproval",
        description: "Set an element's approval (in-progress | approved | rejected). The gate is enforced: 'approved' is refused while any heading's provenance is 'proposed'/'web'. Used by foundational-run and the specialists.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            id: { type: "string", description: "The element id." },
            status: { type: "string", description: "in-progress | approved | rejected." },
            approver: { type: "string", description: "The SME name signing it off." }
          },
          required: ["slug", "id", "status"]
        }
      },
      {
        name: "buildQueue",
        description: "Start a fresh foundational-run: build the ordered walk queue (overview first, current-state elements, process-gaps last) and persist the cursor. Returns position/total/done/current + outcomes_line.",
        inputSchema: {
          type: "object",
          properties: { slug: { type: "string", description: "The process slug." } },
          required: ["slug"]
        }
      },
      {
        name: "startSession",
        description: "Start a fresh qer-session: build the cursor over the fixed QER step sequence and persist it. Pass the SME's name/role as `actor` so a resumed session carries them. Returns position/total/done/current (the step name).",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            actor: {
              type: "object",
              description: "The SME running the session (from the session-scope preamble).",
              properties: { name: { type: "string" }, role: { type: "string" } }
            }
          },
          required: ["slug"]
        }
      },
      {
        name: "getSessionStatus",
        description: "Read the resumable cursor — exists/position/total/done/current, plus (foundational only) outcomes_line while running and closeout_template once done. `kind`: 'foundational' (default) or 'qer'.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            kind: { type: "string", description: "'foundational' (default) or 'qer'." }
          },
          required: ["slug"]
        }
      },
      {
        name: "advanceSession",
        description: "Advance the resumable cursor by one and persist it; returns the next position/total/done/current. `kind`: 'foundational' (default) or 'qer'.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            kind: { type: "string", description: "'foundational' (default) or 'qer'." }
          },
          required: ["slug"]
        }
      },
      // ---- Advisory Board: read-only cross-process tools ----
      {
        name: "listAccessibleProcesses",
        description: "ADVISORY BOARD (read-only). List the processes available to advise on — {slug,title} for each. Takes no arguments.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "getProcessSummary",
        description: "ADVISORY BOARD (read-only). A breadth-first view of one process: overview, per-section element counts (with confirmed counts) and section status — without dumping every element.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." }
          },
          required: ["slug"]
        }
      },
      {
        name: "getProcessElements",
        description: "ADVISORY BOARD (read-only). Return the elements of one section/collection of a process (id + title + content).",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The process slug." },
            collection: { type: "string", description: "The collection name, e.g. 'controls', 'process-steps'." }
          },
          required: ["slug", "collection"]
        }
      },
      {
        name: "searchProcesses",
        description: "ADVISORY BOARD (read-only). Keyword search across all accessible processes — matches element title, body and metadata. Returns capped hits with a snippet and the source {slug, id, section}.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The keyword or phrase to search for." }
          },
          required: ["query"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const slug = args?.slug as string;

  // ---- Advisory Board: read-only cross-process tools ----
  // Handled before the per-tool slug guard below — two of them take no slug,
  // and none mutate the wiki (they call no writer).
  if (name === "listAccessibleProcesses") {
    // Only the processes this session's user may see (R16) — the name is now
    // literal, not aspirational.
    const visible = listProcesses().filter((p) => hasAccess(p.slug));
    return { content: [{ type: "text", text: JSON.stringify(visible, null, 2) }] };
  }
  if (name === "searchProcesses") {
    const query = String(args?.query || "");
    // Scope the search to accessible slugs so hits never leak from governed
    // processes the user can't open.
    const allowed = listProcesses().map((p) => p.slug).filter(hasAccess);
    return { content: [{ type: "text", text: JSON.stringify(searchProcesses(query, allowed), null, 2) }] };
  }
  if (name === "getProcessSummary") {
    if (!slug) throw new McpError(ErrorCode.InvalidParams, "slug is required.");
    assertAccess(slug);
    const summary = getProcessSummary(slug);
    if (!summary) throw new McpError(ErrorCode.InvalidParams, `Process not found: ${slug}`);
    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
  }
  if (name === "getProcessElements") {
    if (!slug) throw new McpError(ErrorCode.InvalidParams, "slug is required.");
    assertAccess(slug);
    const collection = String(args?.collection || "");
    if (!collection) throw new McpError(ErrorCode.InvalidParams, "collection is required.");
    const elements = getProcessElements(slug, collection);
    if (elements === null) throw new McpError(ErrorCode.InvalidParams, `Process not found: ${slug}`);
    return { content: [{ type: "text", text: JSON.stringify({ slug, collection, elements }, null, 2) }] };
  }

  // deriveProcessMeta takes a name (not a slug) and runs before any process
  // exists, so it sits above the slug guard alongside the cross-process tools.
  if (name === "deriveProcessMeta") {
    const procName = String(args?.name || "").trim();
    if (!procName) throw new McpError(ErrorCode.InvalidParams, "name is required.");
    const slugExists = (s: string) =>
      fs.existsSync(path.join(process.cwd(), "wiki", "processes", `${s}.json`));
    const meta = deriveProcessMeta(procName, slugExists);
    return { content: [{ type: "text", text: JSON.stringify(meta, null, 2) }] };
  }

  if (!slug) {
    throw new McpError(ErrorCode.InvalidParams, "slug is required for all tools.");
  }

  // Per-process access gate (R16) for every slug-bearing tool — reads, writes
  // and expands alike. A scoped session operates on a slug its user can access
  // (the HTTP route already verified that), so this only ever blocks reaching
  // OUT to another process. scaffoldProcess creates a not-yet-existing slug,
  // which is ungoverned and therefore allowed.
  assertAccess(slug);

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
    atomicWriteFileSync(processFilePath, JSON.stringify(newDoc, null, 2) + "\n");
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, slug, id: newDoc.meta.id, created: true, closing: scaffoldClosing(title) }, null, 2) }] };
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
      const tempKey = args?.tempKey as string;
      const schema = getSchema();

      const built = buildElement(doc, schema, type, args?.element, tempKeyMap);
      if (!built.ok || !built.fullElement) {
        return { content: [{ type: "text", text: `Error: Element validation failed:\n- ${(built.issues || []).join("\n- ")}` }] };
      }

      applyElement(doc, type, built.fullElement, built.singularType!);
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");

      if (tempKey) {
        const cleanKey = tempKey.startsWith("@") ? tempKey.slice(1) : tempKey;
        tempKeyMap.set(cleanKey, built.id!);
      }

      return { content: [{ type: "text", text: JSON.stringify({ ok: true, id: built.id, element: built.fullElement }, null, 2) }] };
    }

    else if (name === "createElements") {
      const schema = getSchema();
      const elements = (args?.elements || []) as BatchSpec[];
      if (!Array.isArray(elements) || elements.length === 0) {
        throw new McpError(ErrorCode.InvalidParams, "createElements requires a non-empty `elements` array.");
      }
      const batch = createElementsBatch(doc, schema, elements);
      // Persist whatever wrote successfully (errors are isolated, the rest still land).
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");
      for (const c of batch.created) {
        if (c.tempKey) {
          const cleanKey = c.tempKey.startsWith("@") ? c.tempKey.slice(1) : c.tempKey;
          tempKeyMap.set(cleanKey, c.id);
        }
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { ok: batch.ok, created: batch.created, counts: batch.counts, errors: batch.errors },
              null,
              2
            ),
          },
        ],
      };
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
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, implicatedCount: implicated.size }, null, 2) }] };
    }

    else if (name === "writeTargetReview") {
      // Council-review result — a durable root field of the process JSON.
      doc.targetReview = buildTargetReview(slug, args?.reviewData as any);
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, items: doc.targetReview.items.length }, null, 2) }] };
    }

    else if (name === "writeSummary") {
      const area = args?.area as string;
      const parts = parseSummaryParts((args?.summary as string) || "");
      if (!doc.summaries || typeof doc.summaries !== "object") doc.summaries = {};
      doc.summaries[area] = { parts, generatedAt: new Date().toISOString() };
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, area, parts: parts.length }, null, 2) }] };
    }

    else if (name === "writeIngestReport") {
      doc.ingest = buildIngestReport(slug, args?.report as any);
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, created: doc.ingest.created.length, updated: doc.ingest.updated.length, conflicts: doc.ingest.conflicts.length, corrections: doc.ingest.corrections.length }, null, 2) }] };
    }

    else if (name === "writeDtpReport") {
      // Writes the .md artifact + runtime report; never touches the process JSON.
      const res = writeDtpReport(slug, (args?.report as any) ?? {});
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, ...res }, null, 2) }] };
    }

    else if (name === "writeDtpComparison") {
      // Review-only run: stores findings, writes no artifact, never touches the JSON.
      const res = writeDtpComparison(slug, (args?.report as any) ?? {});
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, ...res }, null, 2) }] };
    }

    else if (name === "writeDtpSummary") {
      const ok = setDtpSummary(slug, String(args?.runId ?? ""), String(args?.summary ?? ""));
      return { content: [{ type: "text", text: JSON.stringify({ ok }, null, 2) }] };
    }

    else if (name === "clearConflicts") {
      const { cleared } = clearIngestConflicts(doc);
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, cleared }, null, 2) }] };
    }

    else if (name === "createNote") {
      const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const note = buildNote(
        { author: args?.author as string, text: args?.content as string, type: args?.type as string, replyTo: args?.replyTo as string },
        { id, ts: new Date().toISOString() }
      );
      appendNote(doc, args?.elementId as string, note);
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, note }, null, 2) }] };
    }

    else if (name === "resolveNotes") {
      const noteIds = Array.isArray(args?.noteIds) ? (args!.noteIds as string[]) : [];
      const res = resolveNotesInDoc(doc, noteIds, args?.resolvedBy as string, new Date().toISOString().slice(0, 10));
      atomicWriteFileSync(processFilePath, JSON.stringify(doc, null, 2) + "\n");
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, ...res }, null, 2) }] };
    }

    else if (name === "setApproval") {
      const patch = buildApprovalPatch(args?.status as string, args?.approver as string, new Date().toISOString().slice(0, 10));
      const res = await updateElement(slug, args?.id as string, patch);
      if (!res.ok) {
        return { content: [{ type: "text", text: `Error: ${res.error}` }], isError: true };
      }
      return { content: [{ type: "text", text: JSON.stringify({ ok: true, id: args?.id, approval: args?.status }, null, 2) }] };
    }

    else if (name === "buildQueue") {
      const queue = buildFoundationalQueue(doc);
      const rs = newReviewState(slug, queue, new Date().toISOString());
      writeRuntime(slug, { reviewState: rs });
      return { content: [{ type: "text", text: JSON.stringify(foundationalStatus(rs), null, 2) }] };
    }

    else if (name === "startSession") {
      const actor = args?.actor as { name?: string; role?: string } | undefined;
      const qs = newReviewState(slug, QER_STEPS, new Date().toISOString(), actor);
      writeRuntime(slug, { qerState: qs });
      return { content: [{ type: "text", text: JSON.stringify(qerStatusWithPerspectives(qs, doc, qerSkillBuilt), null, 2) }] };
    }

    else if (name === "getSessionStatus") {
      const rt = getRuntime(slug);
      const view = args?.kind === "qer"
        ? qerStatusWithPerspectives(rt.qerState, doc, qerSkillBuilt)
        : foundationalStatus(rt.reviewState);
      return { content: [{ type: "text", text: JSON.stringify(view, null, 2) }] };
    }

    else if (name === "advanceSession") {
      const rt = getRuntime(slug);
      const now = new Date().toISOString();
      if (args?.kind === "qer") {
        if (!rt.qerState) throw new McpError(ErrorCode.InvalidParams, "No qer session to advance — call startSession first.");
        const next = advance(rt.qerState, now);
        writeRuntime(slug, { qerState: next });
        return { content: [{ type: "text", text: JSON.stringify(qerStatusWithPerspectives(next, doc, qerSkillBuilt), null, 2) }] };
      }
      if (!rt.reviewState) throw new McpError(ErrorCode.InvalidParams, "No foundational run to advance — call buildQueue first.");
      const next = advance(rt.reviewState, now);
      writeRuntime(slug, { reviewState: next });
      return { content: [{ type: "text", text: JSON.stringify(foundationalStatus(next), null, 2) }] };
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

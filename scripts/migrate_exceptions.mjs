import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const WIKI_DIR = path.join(ROOT, "wiki", "processes");
const PROCESS_JSON = path.join(WIKI_DIR, "cob-003.json");
const EXCEPTIONS_DIR = path.join(WIKI_DIR, "cob-003", "exceptions");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw.trim() };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      const inner = val.slice(1, -1).trim();
      meta[key] = inner ? inner.split(",").map((s) => s.trim()) : [];
    } else {
      meta[key] = val;
    }
  }
  return { meta, body: match[2].trim() };
}

function parseBlocks(body) {
  if (!/^## /m.test(body)) return [];
  return body
    .split(/^## /m)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const nl = p.indexOf("\n");
      return nl === -1
        ? { heading: p.trim(), text: "" }
        : { heading: p.slice(0, nl).trim(), text: p.slice(nl + 1).trim() };
    });
}

// 1. Load existing cob-003.json
const processData = JSON.parse(fs.readFileSync(PROCESS_JSON, "utf8"));

// 2. Parse Exceptions
const exceptions = [];
if (fs.existsSync(EXCEPTIONS_DIR)) {
  const files = fs.readdirSync(EXCEPTIONS_DIR).filter((f) => f.endsWith(".md"));
  for (const f of files) {
    const raw = fs.readFileSync(path.join(EXCEPTIONS_DIR, f), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const blocks = parseBlocks(body);
    
    const description = blocks.find(b => b.heading === "Description")?.text || "";
    const handling = blocks.find(b => b.heading === "Handling")?.text || "";
    const impactText = blocks.find(b => b.heading === "Impact")?.text || "";
    
    const freq = meta.frequencyPct ? parseInt(meta.frequencyPct, 10) : null;
    
    // Construct Exception JSON
    exceptions.push({
      meta: {
        id: meta.id,
        type: "exception",
        section: "exceptions",
        status: meta.status || "draft",
        confidence: meta.confidence,
        source: meta.source,
        category: meta.category,
        frequencyPct: isNaN(freq) ? null : freq,
        impact: meta.impact || "LOW",
        handlingOwner: meta.handlingOwner,
        affects: Array.isArray(meta.affects) ? meta.affects : (meta.affects ? [meta.affects] : [])
      },
      content: {
        title: meta.title,
        description,
        handling,
        impact: impactText
      }
    });
  }
}
exceptions.sort((a, b) => a.meta.id.localeCompare(b.meta.id));

// 3. Update and write back
processData.exceptions = exceptions;

fs.writeFileSync(PROCESS_JSON, JSON.stringify(processData, null, 2), "utf8");
console.log(`Successfully migrated ${exceptions.length} exceptions into ${PROCESS_JSON}!`);

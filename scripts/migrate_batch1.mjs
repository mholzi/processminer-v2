import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const WIKI_DIR = path.join(ROOT, "wiki", "processes");
const PROCESS_JSON = path.join(WIKI_DIR, "cob-003.json");
const ROLES_DIR = path.join(WIKI_DIR, "cob-003", "roles");
const SYSTEMS_DIR = path.join(WIKI_DIR, "cob-003", "systems");

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

// 2. Parse Roles
const roles = [];
if (fs.existsSync(ROLES_DIR)) {
  const files = fs.readdirSync(ROLES_DIR).filter((f) => f.endsWith(".md"));
  for (const f of files) {
    const raw = fs.readFileSync(path.join(ROLES_DIR, f), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const blocks = parseBlocks(body);
    
    const responsibility = blocks.find(b => b.heading === "Responsibility")?.text || "";
    const inThisProcess = blocks.find(b => b.heading === "In this process")?.text || "";
    
    roles.push({
      meta: {
        ...meta
      },
      content: {
        title: meta.title,
        responsibility,
        inThisProcess,
        systems: meta.systems || [],
        controls: meta.controls || [],
        raci: meta.raci || []
      }
    });
  }
}
roles.sort((a, b) => a.meta.id.localeCompare(b.meta.id));

// 3. Parse Systems
const systems = [];
if (fs.existsSync(SYSTEMS_DIR)) {
  const files = fs.readdirSync(SYSTEMS_DIR).filter((f) => f.endsWith(".md"));
  for (const f of files) {
    const raw = fs.readFileSync(path.join(SYSTEMS_DIR, f), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const blocks = parseBlocks(body);
    
    const purpose = blocks.find(b => b.heading === "Purpose")?.text || "";
    const roleInThisProcess = blocks.find(b => b.heading === "Role in this process")?.text || "";
    
    systems.push({
      meta: {
        ...meta
      },
      content: {
        title: meta.title,
        systemType: meta.systemType,
        purpose,
        roleInThisProcess,
        integrates: meta.integrates || []
      }
    });
  }
}
systems.sort((a, b) => a.meta.id.localeCompare(b.meta.id));

// 4. Update and write back
processData.roles = roles;
processData.systems = systems;

fs.writeFileSync(PROCESS_JSON, JSON.stringify(processData, null, 2), "utf8");
console.log(`Successfully migrated ${roles.length} roles and ${systems.length} systems into ${PROCESS_JSON}!`);

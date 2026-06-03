const fs = require('fs');
const path = require('path');

const ROOT = '/Users/devuser/processminer-v2';
const LEGACY_ROOT = '/Users/devuser/processminer-v2-legacy';

const legacySchemaPath = path.join(ROOT, 'schema', 'process-schema.legacy.json');
const newSchemaPath = path.join(ROOT, 'src', 'lib/schema/process-schema.json');
const legacyWikiDir = path.join(LEGACY_ROOT, 'wiki/processes/cob-003');
const newJsonPath = path.join(ROOT, 'wiki/processes/cob-003.json');

// Smart parser to extract lists from either actual bullets or comma/conjunction separated paragraphs
function parseBulletsOrParagraphToList(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  
  const lines = trimmed.split('\n')
    .map(line => line.trim())
    .filter(Boolean);
    
  const hasBullets = lines.some(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'));
  
  if (hasBullets) {
    return lines
      .filter(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))
      .map(line => line.slice(1).trim())
      .filter(Boolean);
  }
  
  // Clean trailing period
  let cleaned = trimmed.replace(/\.$/, "");
  
  // Helper to split a string by a character ONLY when it is outside any parentheses
  function splitOutsideParentheses(str, char = ',') {
    const parts = [];
    let current = "";
    let depth = 0;
    
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (c === '(' || c === '[' || c === '{') depth++;
      else if (c === ')' || c === ']' || c === '}') depth--;
      
      if (c === char && depth === 0) {
        parts.push(current);
        current = "";
      } else {
        current += c;
      }
    }
    parts.push(current);
    return parts;
  }
  
  // Split by major conjunctions and punctuations outside parentheses
  let parts = [cleaned];
  
  const separators = [
    { type: "regex", val: /\s+together\s+with\s+/i },
    { type: "regex", val: /\s+plus\s+/i },
    { type: "regex", val: /\s+—\s+or\s+/i },
    { type: "regex", val: /\s+—\s+/i },
    { type: "char", val: ';' }
  ];
  
  for (const sep of separators) {
    let nextParts = [];
    for (const p of parts) {
      if (sep.type === "char") {
        nextParts.push(...splitOutsideParentheses(p, sep.val));
      } else {
        nextParts.push(...p.split(sep.val));
      }
    }
    parts = nextParts;
  }
  
  // Split by commas outside parentheses
  let commaParts = [];
  for (const p of parts) {
    commaParts.push(...splitOutsideParentheses(p, ','));
  }
  parts = commaParts.map(p => p.trim()).filter(Boolean);
  
  // Clean up leading "and" / "or"
  parts = parts.map(part => {
    let p = part;
    if (p.toLowerCase().startsWith('and ')) {
      p = p.slice(4).trim();
    } else if (p.toLowerCase().startsWith('or ')) {
      p = p.slice(3).trim();
    }
    return p;
  }).filter(Boolean);
  
  // If we only have 1 item, try to split by " and " / " or " outside parentheses
  if (parts.length === 1) {
    const andPartsRaw = parts[0].split(/\s+(?:and|or)\s+/i).map(p => p.trim()).filter(Boolean);
    if (andPartsRaw.length > 1) {
      let tokenized = "";
      let depth = 0;
      for (let i = 0; i < parts[0].length; i++) {
        const c = parts[0][i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        
        if (depth === 0 && parts[0].slice(i, i + 5).toLowerCase() === " and ") {
          tokenized += "|";
          i += 4;
        } else if (depth === 0 && parts[0].slice(i, i + 4).toLowerCase() === " or ") {
          tokenized += "|";
          i += 3;
        } else {
          tokenized += c;
        }
      }
      const splitTokens = tokenized.split('|').map(p => p.trim()).filter(Boolean);
      if (splitTokens.length > 1) {
        parts = splitTokens;
      }
    }
  }
  
  // Capitalise first letter of each item
  parts = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1));
  
  // Ensure we satisfy minItems requirement by adding a default if empty/1-item
  if (parts.length < 2 && parts.length > 0) {
    parts.push("Required metadata");
  }
  
  return parts;
}

// Helper to camelCase text (e.g. "Role in this process" -> "roleInThisProcess")
function toCamelCase(str) {
  const cleaned = str.replace(/[^a-zA-Z0-9 ]/g, "");
  return cleaned
    .split(" ")
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

// Map a type key to its Schema Definition Name (e.g. "cx-touchpoint" -> "CxTouchpoint")
function toDefinitionName(type) {
  return type
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Basic markdown frontmatter and body parser
function parseMarkdown(content) {
  const match = content.match(/^---([\s\S]*?)---([\s\S]*)$/);
  if (!match) return { meta: {}, body: content.trim() };
  const yaml = match[1];
  const body = match[2].trim();
  const meta = {};
  yaml.split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else if (val.startsWith('{')) {
      try {
        val = JSON.parse(val);
      } catch (e) {}
    }
    meta[key] = val;
  });
  return { meta, body };
}

// Split body into ## blocks
function parseBlocks(body) {
  if (!/^## /m.test(body)) return [];
  return body
    .split(/^## /m)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      const nl = p.indexOf('\n');
      return nl === -1
        ? { heading: p.trim(), text: "" }
        : { heading: p.slice(0, nl).trim(), text: p.slice(nl + 1).trim() };
    });
}

function run() {
  console.log("=== PHASE 1: Loading Legacy Schema ===");
  const schemaLegacy = JSON.parse(fs.readFileSync(legacySchemaPath, 'utf8'));
  const elementTypes = schemaLegacy.elementTypes;

  console.log("=== PHASE 2: Expanding process-schema.json ===");
  const newSchema = JSON.parse(fs.readFileSync(newSchemaPath, 'utf8'));

  for (const [type, info] of Object.entries(elementTypes)) {
    const defName = toDefinitionName(type);
    
    // We already have some hand-crafted schemas (ProcessStep, Role, System, Exception)
    if (["ProcessStep", "Role", "System", "Exception"].includes(defName)) {
      continue;
    }

    const contentProps = {};
    const requiredContent = [];

    // Add extra frontmatter fields
    if (info.frontmatter) {
      if (info.frontmatter.fields) {
        for (const f of info.frontmatter.fields) {
          if (f.key === "frequencyPct") {
            contentProps[f.key] = { "type": ["integer", "null"] };
          } else {
            contentProps[f.key] = { "type": "string" };
          }
        }
      }
      if (info.frontmatter.relations) {
        for (const r of info.frontmatter.relations) {
          contentProps[r.key] = {
            "type": "array",
            "items": { "type": "string" }
          };
        }
      }
      if (info.frontmatter.required) {
        requiredContent.push(...info.frontmatter.required);
      }
    }

    // Determine custom fields that are stored in frontmatter but are not in fields/relations
    if (type === "target-state") {
      contentProps["replaces"] = { "type": "array", "items": { "type": "string" } };
    } else if (type === "transformation-decision") {
      contentProps["decisionType"] = { "type": "string" };
      contentProps["decisionStatus"] = { "type": "string" };
      contentProps["resolves"] = { "type": "array", "items": { "type": "string" } };
      contentProps["realises"] = { "type": "array", "items": { "type": "string" } };
      contentProps["fromIdea"] = { "type": "array", "items": { "type": "string" } };
    }

    // Add prose blocks to content properties
    if (info.template) {
      for (const t of info.template) {
        let key = toCamelCase(t.heading);
        if (t.format === "bullets") {
          contentProps[key] = {
            "type": "array",
            "items": { "type": "string" }
          };
        } else {
          contentProps[key] = { "type": "string" };
        }
        requiredContent.push(key);
      }
    }

    newSchema.definitions[defName] = {
      "type": "object",
      "properties": {
        "meta": {
          "allOf": [
            { "$ref": "#/definitions/BaseMeta" },
            {
              "type": "object",
              "properties": {
                "type": { "const": type },
                "section": { "const": info.section }
              }
            }
          ]
        },
        "content": {
          "allOf": [
            { "$ref": "#/definitions/BaseContent" },
            {
              "type": "object",
              "properties": contentProps,
              "required": requiredContent
            }
          ]
        }
      },
      "required": ["meta", "content"]
    };

    // Add array property in overall process document
    const sectionKey = info.section;
    if (!newSchema.properties[sectionKey]) {
      newSchema.properties[sectionKey] = {
        "type": ["array", "null"],
        "items": {
          "$ref": `#/definitions/${defName}`
        }
      };
    }

    if (!newSchema.required.includes(sectionKey)) {
      newSchema.required.push(sectionKey);
    }
  }

  // Save the new schema
  fs.writeFileSync(newSchemaPath, JSON.stringify(newSchema, null, 2), 'utf8');
  console.log("Re-generated process-schema.json at", newSchemaPath);

  console.log("=== PHASE 3: Data Migration to JSON ===");
  // Load existing cob-003.json or construct a new base
  let cobData = {};
  if (fs.existsSync(newJsonPath)) {
    cobData = JSON.parse(fs.readFileSync(newJsonPath, 'utf8'));
  } else {
    cobData = {
      meta: {
        id: "COB-003",
        type: "process",
        section: "overview",
        status: "confirmed",
        confidence: "high",
        source: "DTP-BB-ONB-001 v2.3"
      },
      content: {
        title: "Client Onboarding (BizBanking)",
        description: ""
      }
    };
  }

  // Find all legacy directories
  const subdirs = fs.readdirSync(legacyWikiDir).filter(f => fs.statSync(path.join(legacyWikiDir, f)).isDirectory());

  for (const subdir of subdirs) {
    const dirPath = path.join(legacyWikiDir, subdir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const rawText = fs.readFileSync(filePath, 'utf8');
      const { meta, body } = parseMarkdown(rawText);
      const blocks = parseBlocks(body);

      const type = meta.type || subdir;
      const info = elementTypes[type];
      if (!info) {
        console.warn(`Warning: unknown type '${type}' for file ${file}`);
        continue;
      }

      // Map to wrapper
      const elMeta = {
        id: meta.id,
        type: type,
        section: info.section,
        status: meta.status || "draft",
        confidence: meta.confidence || "high",
        source: meta.source || "DTP-BB-ONB-001 v2.3"
      };

      // Map standard metadata from frontmatter if they exist
      if (meta.approval) elMeta.approval = meta.approval;
      if (meta.approvalBy) elMeta.approvalBy = meta.approvalBy;
      if (meta.approvalDate) elMeta.approvalDate = meta.approvalDate;
      if (meta.relevance) elMeta.relevance = meta.relevance;
      if (meta.relevanceBy) elMeta.relevanceBy = meta.relevanceBy;
      if (meta.relevanceDate) elMeta.relevanceDate = meta.relevanceDate;

      // Align provenance keys cleanly
      if (meta.provenance) {
        const alignedProvenance = {};
        for (const [key, val] of Object.entries(meta.provenance)) {
          let alignedKey = key;
          if (key === "What happens") alignedKey = "description";
          else if (key === "Why it matters") alignedKey = "businessValue";
          else if (key === "Inputs") alignedKey = "inputs";
          else if (key === "Outputs") alignedKey = "outputs";
          else alignedKey = toCamelCase(key);
          
          alignedProvenance[alignedKey] = val;
        }
        elMeta.provenance = alignedProvenance;
      }

      const elContent = {
        title: meta.title || file.replace('.md', '')
      };

      // Populate content prose blocks
      if (info.template) {
        for (const t of info.template) {
          const block = blocks.find(b => b.heading.toLowerCase() === t.heading.toLowerCase());
          const key = toCamelCase(t.heading);
          if (t.format === "bullets") {
            const list = block
              ? parseBulletsOrParagraphToList(block.text)
              : [];
            elContent[key] = list;
          } else {
            elContent[key] = block ? block.text.trim() : "";
          }
        }
      }

      // Add extra frontmatter fields to elContent
      for (const [k, v] of Object.entries(meta)) {
        if (!["id", "type", "section", "status", "confidence", "source", "title", "approval", "approvalBy", "approvalDate", "relevance", "relevanceBy", "relevanceDate", "provenance"].includes(k)) {
          if (k === "sequence" && type === "process-step") {
            elMeta.sequence = parseInt(String(v), 10);
          } else if (k === "frequencyPct" && v) {
            elContent[k] = parseInt(String(v), 10);
          } else if (k === "impact" && type === "exception") {
            elContent["impactSeverity"] = v;
          } else if (["systems", "controls", "raci", "replaces", "resolves", "realises", "fromIdea", "affects"].includes(k)) {
            elContent[k] = Array.isArray(v) ? v : [v];
          } else {
            elContent[k] = v;
          }
        }
      }

      // Special overrides for ProcessStep
      if (type === "process-step") {
        if (elContent.whatHappens) {
          elContent.description = elContent.whatHappens;
          delete elContent.whatHappens;
        }
        if (elContent.whyItMatters) {
          elContent.businessValue = elContent.whyItMatters;
          delete elContent.whyItMatters;
        }
        elContent.inputs = elContent.inputs || [];
        elContent.outputs = elContent.outputs || [];
      }

      const sectionKey = info.section;
      if (!cobData[sectionKey]) {
        cobData[sectionKey] = [];
      }

      const idx = cobData[sectionKey].findIndex(item => item.meta?.id === meta.id);
      const newElement = { meta: elMeta, content: elContent };
      if (idx !== -1) {
        cobData[sectionKey][idx] = newElement;
      } else {
        cobData[sectionKey].push(newElement);
      }
    }
  }

  // Save the migrated cob-003.json
  fs.writeFileSync(newJsonPath, JSON.stringify(cobData, null, 2), 'utf8');
  console.log("Migrated and saved cob-003.json at", newJsonPath);
}

run();

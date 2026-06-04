// Schema drift-guard (R-track "schema consolidation", option C) — run: npm test
//
// The project keeps the process schema in two *different representations* that
// must describe the same set of element types:
//   - schema/process-schema.json            — the custom app schema
//     (`elementTypes`, templates, fieldValues). The source of truth: the UI,
//     conformance.ts, and the MCP/Gemini tool schemas all derive from it.
//   - src/lib/schema/process-schema.json     — the Draft-07 JSON Schema
//     (`definitions`), i.e. the "LLM output schema" used by AJV validation
//     (process-validator.ts) and scripts/verify_llm_schema.mjs.
//
// They are not duplicate copies, so they can't be merged into one file — but
// they can silently DRIFT: add/rename an element type in one and forget the
// other. This guard fails when their element-type sets diverge. (It does not
// check per-field parity — the two formats are too different to compare fields
// without brittleness; that's the job of a generator, option A, if ever taken.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const custom = JSON.parse(
  readFileSync(join(root, "schema", "process-schema.json"), "utf8"),
);
const ajv = JSON.parse(
  readFileSync(join(root, "src", "lib", "schema", "process-schema.json"), "utf8"),
);

// Definitions in the JSON Schema that are not element types.
const NON_ELEMENT_DEFS = new Set(["BaseMeta", "BaseContent"]);

// The custom schema keys element types in kebab-case ("process-step"); the JSON
// Schema names them in PascalCase ("ProcessStep"). Each hyphen segment is
// capitalised on its first letter only ("cx-touchpoint" → "CxTouchpoint",
// "adr" → "Adr"), so a plain segment-capitalise is the exact mapping.
function kebabToPascal(key: string): string {
  return key
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

test("schema drift-guard: element-type sets match across the two schema files", () => {
  const customTypes = new Set(
    Object.keys(custom.elementTypes).map(kebabToPascal),
  );
  const ajvTypes = new Set(
    Object.keys(ajv.definitions).filter((d) => !NON_ELEMENT_DEFS.has(d)),
  );

  const missingFromAjv = [...customTypes].filter((t) => !ajvTypes.has(t)).sort();
  const missingFromCustom = [...ajvTypes]
    .filter((t) => !customTypes.has(t))
    .sort();

  assert.deepEqual(
    missingFromAjv,
    [],
    `Element types in schema/process-schema.json (custom) with no matching definition in src/lib/schema/process-schema.json (JSON Schema): ${missingFromAjv.join(", ")}. Add them to both, or the LLM output schema will not validate them.`,
  );
  assert.deepEqual(
    missingFromCustom,
    [],
    `Definitions in src/lib/schema/process-schema.json (JSON Schema) with no matching element type in schema/process-schema.json (custom): ${missingFromCustom.join(", ")}. Add them to both, or update NON_ELEMENT_DEFS if the definition is not an element type.`,
  );
});

import fs from "fs";
import path from "path";
import { generateSchema } from "../src/lib/schema/generate.ts";

const customPath = path.resolve("schema/process-schema.json");
const outputPath = path.resolve("src/lib/schema/process-schema.json");

const custom = JSON.parse(fs.readFileSync(customPath, "utf8"));
const generated = generateSchema(custom);

fs.writeFileSync(outputPath, JSON.stringify(generated, null, 2) + "\n", "utf8");
console.log(`Successfully generated JSON schema from custom schema and wrote to ${outputPath}`);

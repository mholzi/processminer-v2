import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set.");
  process.exit(1);
}

const MODEL = process.env.SESSION_MODEL || "gemini-2.5-flash";
console.log(`Using model: ${MODEL}`);

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Read process-schema.json
const schemaPath = path.resolve("src/lib/schema/process-schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

async function verifyElement(elementName, definitionName, testPrompt) {
  console.log(`\n==================================================`);
  console.log(`Verifying element: ${elementName} using definition: ${definitionName}...`);
  console.log(`==================================================`);
  
  const contentSchema = schema.definitions[definitionName].properties.content;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: testPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: contentSchema,
      }
    });
    
    console.log(`[SUCCESS] Gemini successfully generated conforming output for ${elementName}!`);
    console.log("Output:");
    console.log(response.text);
    
    // Parse the output to make sure it matches
    const parsed = JSON.parse(response.text);
    console.log("Parsed content keys:", Object.keys(parsed));
  } catch (err) {
    console.error(`[FAILURE] Verification failed for ${elementName}:`, err);
    process.exit(1);
  }
}

// 1. Verify ProcessStep (existing)
await verifyElement("ProcessStep", "ProcessStep", "Generate a process step for 'Application Triage' performed by 'Operations Officer' using Salesforce. Describe it and explain the business value.");

// 2. Verify Role (new)
await verifyElement("Role", "Role", "Generate a Role element for 'KYC Analyst' responsible for customer identification and AML compliance. List systems [SYS-COB-003] and controls [CP-COB-001]. Assign RACI 'PS-COB-002:R'. Explain responsibility and what they do in this process.");

// 3. Verify System (new)
await verifyElement("System", "System", "Generate a System element for 'Salesforce CRM'. It is a CORE system type. Explain its purpose and its role in this process.");

// 4. Verify Exception (new)
await verifyElement("Exception", "Exception", "Generate an Exception element for 'Incomplete Documentation'. Category is 'Documentation', impact is 'MEDIUM', handlingOwner is 'Operations Officer', and affects process steps [PS-COB-001]. Describe the exception, how it is handled, and its impact.");


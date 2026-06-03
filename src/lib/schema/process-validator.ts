import Ajv from "ajv";
import schema from "./process-schema.json";

export interface ValidationError {
  path: string;
  message: string;
}

const ajv = new Ajv({ allErrors: true, verbose: true });
ajv.addSchema(schema, "process-schema");
const validateStep = ajv.getSchema("process-schema#/definitions/ProcessStep");
const validateRoleSchema = ajv.getSchema("process-schema#/definitions/Role");
const validateSystemSchema = ajv.getSchema("process-schema#/definitions/System");
const validateExceptionSchema = ajv.getSchema("process-schema#/definitions/Exception");

if (!validateStep) {
  throw new Error("Failed to compile ProcessStep schema definition");
}

function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function validateProcessStep(step: any): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // 1. AJV JSON Schema Validation
  if (!validateStep) {
    throw new Error("Failed to compile ProcessStep schema definition");
  }
  const schemaValid = validateStep(step);
  if (!schemaValid && validateStep.errors) {
    for (const err of validateStep.errors) {
      // Map instancePath like "/content/title" to "content.title"
      const path = err.instancePath.replace(/^\//, "").replace(/\//g, ".");
      errors.push({
        path: path || "step",
        message: err.message || "Invalid value",
      });
    }
  }

  // 2. Custom Stylistic Validation for Process Steps (Word Counts)
  if (step?.content) {
    const description = step.content.description || "";
    if (typeof description === "string" && description.trim()) {
      const descWords = wordCount(description);
      if (descWords < 20 || descWords > 95) {
        errors.push({
          path: "content.description",
          message: `Description must be between 20 and 95 words (currently ${descWords} words).`,
        });
      }
    }

    const businessValue = step.content.businessValue || "";
    if (typeof businessValue === "string" && businessValue.trim()) {
      const bvWords = wordCount(businessValue);
      if (bvWords < 10 || bvWords > 60) {
        errors.push({
          path: "content.businessValue",
          message: `Business Value must be between 10 and 60 words (currently ${bvWords} words).`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRole(role: any): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // 1. AJV JSON Schema Validation
  if (!validateRoleSchema) {
    throw new Error("Failed to compile Role schema definition");
  }
  const schemaValid = validateRoleSchema(role);
  if (!schemaValid && validateRoleSchema.errors) {
    for (const err of validateRoleSchema.errors) {
      const path = err.instancePath.replace(/^\//, "").replace(/\//g, ".");
      errors.push({
        path: path || "role",
        message: err.message || "Invalid value",
      });
    }
  }

  // 2. Custom Stylistic Validation for Roles (Word Counts)
  if (role?.content) {
    const responsibility = role.content.responsibility || "";
    if (typeof responsibility === "string" && responsibility.trim()) {
      const respWords = wordCount(responsibility);
      if (respWords < 8 || respWords > 45) {
        errors.push({
          path: "content.responsibility",
          message: `Responsibility must be between 8 and 45 words (currently ${respWords} words).`,
        });
      }
    }

    const inThisProcess = role.content.inThisProcess || "";
    if (typeof inThisProcess === "string" && inThisProcess.trim()) {
      const itpWords = wordCount(inThisProcess);
      if (itpWords < 10 || itpWords > 50) {
        errors.push({
          path: "content.inThisProcess",
          message: `In this process must be between 10 and 50 words (currently ${itpWords} words).`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSystem(system: any): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // 1. AJV JSON Schema Validation
  if (!validateSystemSchema) {
    throw new Error("Failed to compile System schema definition");
  }
  const schemaValid = validateSystemSchema(system);
  if (!schemaValid && validateSystemSchema.errors) {
    for (const err of validateSystemSchema.errors) {
      const path = err.instancePath.replace(/^\//, "").replace(/\//g, ".");
      errors.push({
        path: path || "system",
        message: err.message || "Invalid value",
      });
    }
  }

  // 2. Custom Stylistic Validation for Systems (Word Counts)
  if (system?.content) {
    const purpose = system.content.purpose || "";
    if (typeof purpose === "string" && purpose.trim()) {
      const purpWords = wordCount(purpose);
      if (purpWords < 4 || purpWords > 30) {
        errors.push({
          path: "content.purpose",
          message: `Purpose must be between 4 and 30 words (currently ${purpWords} words).`,
        });
      }
    }

    const roleInThisProcess = system.content.roleInThisProcess || "";
    if (typeof roleInThisProcess === "string" && roleInThisProcess.trim()) {
      const ritpWords = wordCount(roleInThisProcess);
      if (ritpWords < 6 || ritpWords > 40) {
        errors.push({
          path: "content.roleInThisProcess",
          message: `Role in this process must be between 6 and 40 words (currently ${ritpWords} words).`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateException(exception: any): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // 1. AJV JSON Schema Validation
  if (!validateExceptionSchema) {
    throw new Error("Failed to compile Exception schema definition");
  }
  const schemaValid = validateExceptionSchema(exception);
  if (!schemaValid && validateExceptionSchema.errors) {
    for (const err of validateExceptionSchema.errors) {
      const path = err.instancePath.replace(/^\//, "").replace(/\//g, ".");
      errors.push({
        path: path || "exception",
        message: err.message || "Invalid value",
      });
    }
  }

  // 2. Custom Stylistic Validation (Word Counts)
  if (exception?.content) {
    const description = exception.content.description || "";
    if (typeof description === "string" && description.trim()) {
      const descWords = wordCount(description);
      if (descWords < 12 || descWords > 50) {
        errors.push({
          path: "content.description",
          message: `Description must be between 12 and 50 words (currently ${descWords} words).`,
        });
      }
    }

    const handling = exception.content.handling || "";
    if (typeof handling === "string" && handling.trim()) {
      const handWords = wordCount(handling);
      if (handWords < 10 || handWords > 60) {
        errors.push({
          path: "content.handling",
          message: `Handling must be between 10 and 60 words (currently ${handWords} words).`,
        });
      }
    }

    const impact = exception.content.impact || "";
    if (typeof impact === "string" && impact.trim()) {
      const impWords = wordCount(impact);
      if (impWords < 8 || impWords > 40) {
        errors.push({
          path: "content.impact",
          message: `Impact must be between 8 and 40 words (currently ${impWords} words).`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


function kebabToPascal(key: string): string {
  return key
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function toCamelCase(str: string): string {
  const cleaned = str.replace(/[^a-zA-Z0-9 ]/g, "");
  return cleaned
    .split(" ")
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

// System metadata schemas
const BaseMeta = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "section": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "draft",
        "confirmed",
        "empty"
      ]
    },
    "confidence": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    },
    "source": {
      "type": "string"
    },
    "approval": {
      "type": "string",
      "enum": [
        "in-progress",
        "approved",
        "rejected"
      ]
    },
    "approvalBy": {
      "type": "string"
    },
    "approvalDate": {
      "type": "string"
    },
    "relevance": {
      "type": "string",
      "enum": [
        "",
        "relevant",
        "disregarded"
      ]
    },
    "relevanceBy": {
      "type": "string"
    },
    "relevanceDate": {
      "type": "string"
    },
    "provenance": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "source": {
            "type": "string",
            "enum": [
              "elicited",
              "document",
              "proposed",
              "web",
              "legacy-approved"
            ]
          },
          "evidence": {
            "type": "string"
          }
        },
        "required": [
          "source",
          "evidence"
        ]
      }
    }
  },
  "required": [
    "id",
    "type",
    "section",
    "status"
  ]
};

const BaseContent = {
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    }
  },
  "required": [
    "title"
  ]
};

export function generateSchema(custom: any): any {
  const generated: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$comment": "DO NOT EDIT BY HAND. Auto-generated from schema/process-schema.json",
    "title": "Process Document Schema (v3)",
    "type": "object",
    "description": "The golden source JSON Schema representing a full Process Document instance.",
    "properties": {
      "meta": {
        "type": "object",
        "description": "System-managed metadata for the overall process.",
        "properties": {
          "id": {
            "type": "string",
            "description": "Process ID (e.g. COB-003)"
          },
          "type": {
            "type": "string",
            "const": "process"
          },
          "section": {
            "type": "string",
            "const": "overview"
          },
          "status": {
            "type": "string",
            "enum": ["draft", "confirmed", "empty"]
          },
          "confidence": {
            "type": "string"
          },
          "source": {
            "type": "string"
          },
          "docStatus": {
            "type": "string"
          }
        },
        "required": ["id", "type", "status"]
      },
      "content": {
        "type": "object",
        "description": "Authored content for the overall process.",
        "properties": {
          "title": {
            "type": "string"
          },
          "processOwner": {
            "type": "string"
          },
          "trigger": {
            "type": "string"
          },
          "frequency": {
            "type": "string"
          },
          "scopeIn": {
            "type": "string"
          },
          "scopeOut": {
            "type": "string"
          },
          "processInput": {
            "type": "string"
          },
          "processOutput": {
            "type": "string"
          },
          "description": {
            "type": "string",
            "description": "The markdown body of the process overview."
          }
        },
        "required": ["title", "description"]
      }
    },
    "required": ["meta", "content"],
    "definitions": {
      "BaseMeta": BaseMeta,
      "BaseContent": BaseContent
    }
  };

  // 1. Generate root properties (the process section arrays)
  const sectionToTypes: { [key: string]: any[] } = {};
  for (const [type, info] of Object.entries(custom.elementTypes)) {
    const elementInfo = info as any;
    const section = elementInfo.section;
    if (!sectionToTypes[section]) {
      sectionToTypes[section] = [];
    }
    sectionToTypes[section].push({ type, info: elementInfo });
  }

  // Sort sections according to the areas and sections order in custom schema
  const sectionsInOrder: string[] = [];
  const areas = custom.areas as any[];
  areas.forEach(area => {
    const sections = area.sections as any[];
    sections.forEach(section => {
      if (sectionToTypes[section.id]) {
        sectionsInOrder.push(section.id);
      }
    });
  });

  sectionsInOrder.forEach(secId => {
    const list = sectionToTypes[secId];
    let desc = "";
    for (const area of areas) {
      const sections = area.sections as any[];
      const s = sections.find(sec => sec.id === secId);
      if (s) {
        desc = s.description || "";
        break;
      }
    }

    const defNames = list.map(item => kebabToPascal(item.type));
    const propVal: any = {
      "type": ["array", "null"],
      "items": {
        "$ref": `#/definitions/${defNames[0]}`
      }
    };
    if (desc) {
      propVal.description = desc;
    }
    
    generated.properties[secId] = propVal;
    generated.required.push(secId);
  });

  // 2. Generate definitions for each element type
  for (const [type, info] of Object.entries(custom.elementTypes)) {
    const elementInfo = info as any;
    const defName = kebabToPascal(type);
    const def: any = {
      "type": "object",
      "properties": {
        "meta": {
          "allOf": [
            { "$ref": "#/definitions/BaseMeta" },
            {
              "type": "object",
              "properties": {
                "type": { "const": type },
                "section": { "const": elementInfo.section }
              }
            }
          ]
        },
        "content": {
          "allOf": [
            { "$ref": "#/definitions/BaseContent" },
            {
              "type": "object",
              "properties": {},
              "required": []
            }
          ]
        }
      },
      "required": ["meta", "content"]
    };

    // Add sequence for ProcessStep meta
    if (type === 'process-step') {
      const metaSubObj = def.properties.meta.allOf[1];
      metaSubObj.properties.sequence = {
        "type": "number",
        "description": "Execution order"
      };
      metaSubObj.required = ["sequence"];
    }

    // Populate content properties
    const contentSubObj = def.properties.content.allOf[1];

    // A. Frontmatter Fields
    if (elementInfo.frontmatter) {
      if (elementInfo.frontmatter.fields) {
        const fields = elementInfo.frontmatter.fields as any[];
        fields.forEach(f => {
          const fieldVal: any = {};
          
          if (f.key === 'frequencyPct') {
            fieldVal.type = ["integer", "null"];
          } else {
            fieldVal.type = "string";
          }
          
          const fieldValues = custom.fieldValues as any;
          if (fieldValues[f.key]) {
            fieldVal.enum = fieldValues[f.key];
          }
          
          if (f.label || f.hint) {
            fieldVal.description = f.hint || f.label;
          }
          
          contentSubObj.properties[f.key] = fieldVal;
        });
      }

      // B. Frontmatter Relations
      if (elementInfo.frontmatter.relations) {
        const relations = elementInfo.frontmatter.relations as any[];
        relations.forEach(r => {
          const fieldVal: any = {
            "type": "array",
            "items": { "type": "string" }
          };
          if (r.label || r.hint) {
            fieldVal.description = r.hint || r.label;
          }
          contentSubObj.properties[r.key] = fieldVal;
        });
      }

      // C. Transitions
      if (elementInfo.frontmatter.transitions) {
        const transitionsVal: any = {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "to": { "type": "string" },
              "kind": {
                "type": "string",
                "enum": elementInfo.frontmatter.transitions.kinds
              },
              "when": { "type": "string" }
            },
            "required": ["to", "kind"]
          }
        };
        if (elementInfo.frontmatter.transitions.note) {
          transitionsVal.description = elementInfo.frontmatter.transitions.note;
        }
        contentSubObj.properties.transitions = transitionsVal;
      }

      // D. RACI
      if (elementInfo.frontmatter.raci) {
        contentSubObj.properties.raci = {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "step": { "type": "string" },
              "level": {
                "type": "string",
                "enum": ["R", "A", "C", "I"]
              }
            },
            "required": ["step", "level"]
          },
          "description": "RACI assignments mapping process step IDs to responsibility levels (R=Responsible, A=Accountable, C=Consulted, I=Informed)."
        };
      }

      // E. Required frontmatter fields
      if (elementInfo.frontmatter.required) {
        contentSubObj.required.push(...elementInfo.frontmatter.required);
      }
    }

    // F. Exceptions affects relation
    if (type === 'exception') {
      contentSubObj.properties.affects = {
        "type": "array",
        "items": { "type": "string" }
      };
    }

    // G. Template Prose blocks
    if (elementInfo.template) {
      const template = elementInfo.template as any[];
      template.forEach(t => {
        let key = toCamelCase(t.heading);
        if (type === 'process-step' && key === 'whatHappens') key = 'description';
        if (type === 'process-step' && key === 'whyItMatters') key = 'businessValue';

        const propVal: any = {};
        if (t.format === 'bullets') {
          propVal.type = "array";
          propVal.items = { "type": "string" };
        } else {
          propVal.type = "string";
        }

        // Enrich description with purpose and constraints
        const wordRange = t.words ? ` ${t.words} words` : '';
        const bulletRange = t.items ? ` ${t.items} items` : '';
        const constraint = wordRange ? ` Stylistic constraint:${wordRange}.` : (bulletRange ? ` Stylistic constraint:${bulletRange}.` : '');
        propVal.description = `${t.purpose}${constraint}`;

        contentSubObj.properties[key] = propVal;
        contentSubObj.required.push(key);
      });
    }

    generated.definitions[defName] = def;
  }

  return generated;
}

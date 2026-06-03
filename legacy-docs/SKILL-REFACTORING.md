# Skill Refactoring Strategy (Sprint 3)

## 1. Problem Statement: The Copy-Paste Explosion
A deep analysis of the legacy `SKILL.md` files (specifically comparing `process-specialist` with `control-compliance-specialist`) reveals significant code duplication. The original prompt engineers copied and pasted large blocks of instructional text into every skill to ensure the LLM behaved consistently. 

**Common Duplicated Blocks Identified:**
1. **The Wiki / File Format:** Extensive instructions on `yaml` frontmatter, markdown blocks, and how to use `show_template.py`.
2. **Interaction Patterns (Y / E / R):** The exact "Yes / Edit / Rewrite" loop and batching logic (`<!-- BATCHING-BLOCK -->`).
3. **Writing Procedure:** The mechanical steps to reserve IDs and run `write_element.py` or `patch_element.py` (`<!-- WRITING-PROCEDURE-BLOCK -->`).
4. **Provenance:** The strict rules around separating what the SME said from what the AI inflated (`<!-- PROVENANCE-BLOCK -->`).

**Why this is a maintenance headache:**
If we need to change how the "Y/E/R" loop works, we currently have to find and replace it across 21 separate files. Furthermore, it wastes thousands of tokens injecting identical boilerplate into every prompt.

---

## 2. The Solution: Compositional Prompts

To eliminate unnecessary junk and create beautiful, coherent skill files, we will move to a **Compositional Prompting** architecture. 

The Next.js backend will dynamically assemble the final system prompt by concatenating two parts: a universal core prompt, and the specialist's domain prompt.

### Part A: `CORE_SYSTEM_PROMPT.md`
We will create a single, centralized file that contains all the universal rules. This file will replace the legacy bash instructions with the new Native AI tool instructions.
* **The Document Map:** Explains how to read the `/*...*/` abridged context.
* **Universal Tools:** Explains how to use `expandElement`, `createElement`, and `updateElement` (replacing the `WRITING-PROCEDURE-BLOCK`).
* **Universal Interaction:** The Y/E/R loop and batching rules.
* **Universal Provenance:** The exact rules for `source: elicited` vs `proposed` (replacing the `PROVENANCE-BLOCK`).

### Part B: `SKILL.md` (The Domain Perspective)
The 21 individual `SKILL.md` files will be aggressively pruned down to contain **only domain-specific reasoning**. All mechanical filesystem junk will be deleted.

A refactored `process-specialist/SKILL.md` will look like this:
1. **Role Definition:** "You facilitate a SME through documenting the As-Is process..."
2. **What you produce:** The specific elements owned by this skill (process-step, exception, pain-point).
3. **Domain Principles:** specific rules like "Every process step must have a clear *why*".
4. **The Session Phases:** Phase 1 (Overview), Phase 2 (Steps), Phase 3 (Exceptions), etc.
5. **Stay in your lane:** Explicit boundaries to prevent hallucinating other perspectives.

---

## 3. Token-Efficient Execution Strategy

Since we need to repeat this process 20 more times, manual refactoring is out of the question. Our programmatic approach is:

1. **Extract & Delete:** We will write a Node.js script to parse all 21 `SKILL.md` files and programmatically delete the `WRITING-PROCEDURE-BLOCK`, `PROVENANCE-BLOCK`, `BATCHING-BLOCK`, and any section referencing `python3 scripts/wiki/`. 
2. **Standardize `CORE_SYSTEM_PROMPT.md`:** We will draft the new centralized AI tools prompt.
3. **Review:** We will review the stripped-down `process-specialist` as the pilot. If it looks "beautiful and perfect", we run the script across the rest of the skills.

This guarantees zero copy-paste explosion moving forward, and creates an architecture that is infinitely easier to maintain.

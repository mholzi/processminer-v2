import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKILLS_DIR = path.join(ROOT, ".claude", "skills");

// We exclude process-specialist as it is already hand-refactored and serves as our pilot.
const EXCLUDED_SKILLS = ["process-specialist"];

function cleanSkillFile(filePath, skillName) {
  let content = fs.readFileSync(filePath, "utf8");
  const originalLength = content.length;

  console.log(`Refactoring skill: ${skillName}`);

  // 1. Remove "## The wiki you write into" section
  // It starts with ## The wiki you write into and goes until the next ## section.
  const wikiHeaderRegex = /^## The wiki you write into\b[\s\S]*?(?=^## )/m;
  if (wikiHeaderRegex.test(content)) {
    content = content.replace(wikiHeaderRegex, "");
    console.log(`  - Removed "## The wiki you write into" section.`);
  }

  // 2. Remove standard HTML-comment-marked blocks
  const blocksToRemove = [
    { name: "WRITING-PROCEDURE-BLOCK", regex: /<!-- WRITING-PROCEDURE-BLOCK:start -->[\s\S]*?<!-- WRITING-PROCEDURE-BLOCK:end -->\s*/g },
    { name: "PROVENANCE-BLOCK", regex: /<!-- PROVENANCE-BLOCK:start -->[\s\S]*?<!-- PROVENANCE-BLOCK:end -->\s*/g },
    { name: "BATCHING-BLOCK", regex: /<!-- BATCHING-BLOCK:start -->[\s\S]*?<!-- BATCHING-BLOCK:end -->\s*/g },
    { name: "WEB-PROVENANCE-BLOCK", regex: /<!-- WEB-PROVENANCE-BLOCK:start -->[\s\S]*?<!-- WEB-PROVENANCE-BLOCK:end -->\s*/g }
  ];

  for (const block of blocksToRemove) {
    if (block.regex.test(content)) {
      content = content.replace(block.regex, "");
      console.log(`  - Removed ${block.name} block.`);
    }
  }

  // 3. Clean up python script references & update close-out references to the new template style
  // Replace references to next_id.py, write_element.py, patch_element.py, show_template.py, check_conformance.py with description of native actions
  content = content.replace(/python3 scripts\/wiki\/next_id\.py/g, "the backend ID generator");
  content = content.replace(/python3 scripts\/wiki\/write_element\.py/g, "createElement");
  content = content.replace(/python3 scripts\/wiki\/patch_element\.py/g, "updateElement");
  content = content.replace(/python3 scripts\/wiki\/check_conformance\.py/g, "conformance check");

  // If verbatim.py close-out is mentioned, clean it up or replace it with a clean close-out instruction
  if (content.includes("verbatim.py")) {
    const verbatimRegex = /run `python3 scripts\/wiki\/verbatim\.py specialist-closeout` and present what it prints[\s\S]*?never write the close-out from memory\./g;
    if (verbatimRegex.test(content)) {
      content = content.replace(verbatimRegex, `present the canonical close-out message verbatim (substituting the process title, total drafted count, and counts by type):

\`\`\`
{Perspective} perspective documented — **{process}**:

- **Drafted:** {n} element(s)
- **By type:** {type} {n} · {type} {n} · …

Elements you approved during this session are signed off; any left \`in-progress\` are yours to review and approve on their cards in the app. Approval is always your decision there.
\`\`\``);
      console.log(`  - Updated close-out pattern to native template.`);
    }
  }

  // 4. Update phase setup where it mentions listing directory files using CLI to using Document Map / database
  content = content.replace(/list the slugs under `wiki\/processes\/`/g, "refer to the Document Map or the list of processes");
  content = content.replace(/read its `index\.md` and the existing elements/g, "refer to the Document Map");

  // 5. Save if modified
  if (content.length !== originalLength) {
    // Normalise multiple blank lines caused by deletions
    content = content.replace(/\n{3,}/g, "\n\n");
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`  - Successfully saved changes to ${path.relative(ROOT, filePath)}.`);
  } else {
    console.log(`  - No changes needed.`);
  }
}

function main() {
  const skills = fs.readdirSync(SKILLS_DIR).filter(f => {
    return fs.statSync(path.join(SKILLS_DIR, f)).isDirectory() && !EXCLUDED_SKILLS.includes(f);
  });

  console.log(`Found ${skills.length} skills to refactor.`);
  for (const skill of skills) {
    const skillFilePath = path.join(SKILLS_DIR, skill, "SKILL.md");
    if (fs.existsSync(skillFilePath)) {
      cleanSkillFile(skillFilePath, skill);
    }
  }
  console.log("Skill refactoring complete!");
}

main();

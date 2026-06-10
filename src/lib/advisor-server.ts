// Server-only. Assembles the Advisory Board session preamble from the persona
// Markdown under .claude/advisors/ plus the allow-list of processes the user
// can advise on. Prepended to the FIRST turn of an advisor session (later turns
// inherit it via --resume), exactly like ProcessDocScreen's scopePreamble — but
// cross-process and read-only.
//
// Access control is prompt-level for now (plan §5, decision B): the allow-list
// is stated in the preamble; the read tools are not yet hard-gated by it. The
// allowed slugs come from the caller (the dashboard only shows a user the
// processes they can access) and are intersected with what's on disk.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getAdvisor } from "./advisor";
import { listProcesses } from "./wiki";

const ADVISORS_DIR = join(process.cwd(), ".claude", "advisors");

function readPrompt(...parts: string[]): string {
  const p = join(ADVISORS_DIR, ...parts);
  return existsSync(p) ? readFileSync(p, "utf8").trim() : "";
}

/**
 * Build the advisor scope preamble. Returns "" if the id is unknown — the
 * caller then treats the turn as ordinary free text rather than crashing.
 *
 * @param advisorId   one of the ADVISORS ids
 * @param allowedSlugs slugs the user may advise on (from the dashboard); empty = all on disk
 * @param userName    the signed-in user's display name, for addressing
 */
export function buildAdvisorPreamble(
  advisorId: string,
  allowedSlugs: string[],
  userName?: string,
  isStandalone?: boolean,
): string {
  const advisor = getAdvisor(advisorId);
  if (!advisor) return "";

  const core = readPrompt("CORE_ADVISOR_PROMPT.md");
  let persona = "";
  if (advisorId === "solution-architect" || advisorId === "domain-architect") {
    const skillPath = join(process.cwd(), ".claude", "skills", advisorId, "SKILL.md");
    persona = existsSync(skillPath) ? readFileSync(skillPath, "utf8").trim() : "";
  } else {
    persona = readPrompt(advisorId, "ADVISOR.md");
  }

  // Resolve allowed slugs to {slug,title}; intersect with what's on disk so a
  // stale/forged slug can't widen the set beyond real processes.
  const onDisk = listProcesses();
  const allowSet = new Set(allowedSlugs);
  const visible = isStandalone
    ? []
    : onDisk.filter(
        (p) => allowSet.size === 0 || allowSet.has(p.slug),
      );
  const roster =
    visible.length > 0
      ? visible.map((p) => `- ${p.slug} — ${p.title}`).join("\n")
      : "- (none available)";

  return [
    "[ADVISORY BOARD SESSION — applies to this whole conversation]",
    `You are the ${advisor.name}. The rules and persona below are in force for`,
    "every turn of this session.",
    "",
    core,
    "",
    persona,
    "",
    "## Processes you can advise on (the allow-list)",
    "",
    roster,
    "",
    userName
      ? `The user consulting you is ${userName}. Address them by name where natural.`
      : "",
    "",
    "The user's question follows below.",
    "",
    "---",
    "",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

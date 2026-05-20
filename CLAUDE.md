# Processminer

AI-native process documentation tool: Claude Code skills elicit a subject-matter
expert's process knowledge through interactive brainstorming, write it into a
file-backed wiki, and develop it into a target state. From-scratch rebuild of
the BMAD-Modul-v1 prototype as a Next.js web app, applying Karpathy's LLM Wiki
pattern with per-heading provenance and approval gating.

Reference docs in this repo:
- `DESIGN.md` — design system (typography, colour, spacing, motion)
- `SKILLS.md` — agent / skill architecture (perspective specialists, orchestration)
- `CONTENT-MODEL-PLAN.md` — schema decisions D1–D6
- `HALLUCINATION-PLAN.md` — per-heading provenance contract
- `TODOS.md` — open work items

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Agent Architecture
Read SKILLS.md before building or changing any agent/skill behaviour.
The skills are Claude Code skills (SKILL.md files) run in the CLI — not app
code. SKILLS.md defines the five perspective specialists, the shared functional
engine, the step-file orchestration workflow, and the approval model.
Do not deviate without explicit user approval.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Ship/deploy/PR → invoke /ship or /land-and-deploy

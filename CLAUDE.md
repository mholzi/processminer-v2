# Processminer v2

Internes Deutsche-Bank-Tool: KI-Agenten extrahieren im interaktiven
Brainstorming SME-Prozesswissen, dokumentieren es und entwickeln es in einen
Target State. From-scratch-Rebuild des BMAD-Modul-v1 (github.com/mholzi/Processminer)
als echte Web-App.

Planungs-Artefakte (aus /office-hours, /plan-ceo-review, /plan-design-review,
/design-consultation, 2026-05-16):
- Design-Doc + CEO-Plan + Reviews: `~/.gstack/projects/Processminer2/`
- TODOS: `TODOS.md`
- Wireframe + Designsystem-Preview: `~/.gstack/projects/Processminer2/designs/`

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

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

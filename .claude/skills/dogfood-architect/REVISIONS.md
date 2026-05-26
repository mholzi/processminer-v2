# dogfood-architect — applied revisions

Audit trail of `[walkthrough]` tweaks the skill applied to itself during
auto-tuning at the end of each run. Every entry: run id, stage touched,
tweak, and the SME-assessment shortfall it targets.

---

## Run 2026-05-26-1603 — three tweaks applied

SME assessment outcome: avg score 8.0/10, verdict READY_WITH_CAVEATS.

### 1. Stage 4 — added OBSERVABILITY to NFR categories
Targets SME gap #1 — "No observability NFR. OpenTelemetry / Grafana /
Prometheus / Datadog appear in components but no NFR fixes log/metric/trace
retention, alert thresholds or SLO error-budget policy. Gap for any DORA
Article 17 ICT-incident reporting evidence trail."
Edit: extended the NFR category list in the Stage 4 brief from
"PERFORMANCE, AVAILABILITY, SECURITY, COMPLIANCE" to include
"SCALABILITY, OBSERVABILITY", with explicit DORA Article 17 framing.

### 2. Stage 4 — added per-target-application resilience NFR rule
Targets SME gap #2 — "RTO/RPO + availability targets exist only for
TGTAPP-001; the AI Pre-Screener, World-Check adapter, Murex and DMS carry
no resilience NFR, leaving DORA criticality mapping incomplete."
Edit: added a "Resilience coverage rule" to the Stage 4 brief — every
target-application must carry at least one NFR setting
`availability + RTO + RPO`, OR an explicit "KEEP — vendor SLA inherited"
note. Never silently omit.

### 3. Stage 3 — added "close downstream platform choices" rule
Targets SME gap #3 — "ADR-004 and ADR-012 explicitly defer broker (Kafka)
and service-mesh/API-gateway choices to the Solution Architect, but
downstream integrations and components already commit to Apache Kafka and
Spring Kafka — the missing ADR(s) on Kafka selection and service-mesh
product would close the domain → solution traceability loop."
Edit: extended the Stage 3 brief — ADRs must close their downstream
platform choice; silent deferral is forbidden. If the choice is open, the
ADR name must be marked `pending — followed-up by ADR-XX-followup in
Stage 4`. Stage 4 brief mirrors this with a follow-up-ADR mandate.

To revert any of these: `git diff` on
`.claude/skills/dogfood-architect/SKILL.md` and the corresponding
walkthrough-tweaks.md.

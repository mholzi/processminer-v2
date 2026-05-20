---
id: TD-BGIT-003
type: transformation-decision
section: transformation-decisions
title: Replace email-based Legal handoff with in-TFS wording workflow and AI wording assistant
status: draft
confidence: high
source: source-target — bank-guarantee-issuance-test wiki
decisionType: build/buy
decisionStatus: agreed
resolves: [PP-BGIT-002, PG-BGIT-002, PG-BGIT-003]
realises: [TS-BGIT-002]
fromIdea: [II-BGIT-002]
provenance: {"Options considered": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}, "Rationale": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}, "The decision": {"evidence": "M. Berger Stage 5 refinement session, 2026-05-20 — confirmed transformation decision from source-target stub", "source": "elicited"}}
---
## The decision
Replace the current email-based bespoke wording handoff with an in-TFS Legal workflow that routes bespoke cases to Legal via the Trade Finance System, enforces a configurable SLA timer, and embeds an AI wording assistant to pre-screen wording before Legal review.

## Options considered
- In-TFS workflow with AI pre-screening and configurable SLA timer
- Email workflow retained but monitored via a shared Legal inbox and SLA dashboard
- Outsource bespoke wording pre-screening to a third-party legal-tech provider
- Expand the standard template library to reduce bespoke cases, deferring AI investment

## Rationale
An in-TFS workflow with a configurable SLA timer makes Legal review auditable and measurable for the first time, directly closing PG-BGIT-002 and PG-BGIT-003. The AI wording assistant — proven by Finastra Assist.AI and Surecomp RIVO — reduces the volume requiring full Legal review, improving throughput without increasing Legal headcount.

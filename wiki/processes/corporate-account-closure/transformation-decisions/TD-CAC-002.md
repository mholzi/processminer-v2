---
id: TD-CAC-002
type: transformation-decision
section: transformation-decisions
title: Build a client-facing digital closure portal with real-time status and automated confirmation
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
decisionType: build-buy-scope
decisionStatus: proposed
resolves: []
realises: [TS-CAC-002]
fromIdea: []
provenance: {"Options considered": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "The decision": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## The decision
Extend the Client Lifecycle Workflow Tool with a client-facing portal layer, or adopt a CLM platform (Fenergo, nCino, Appian, S&P CLM Pro) with a native client-facing status and document submission module, to give corporate clients a digital closure initiation and status channel.

## Options considered
- Extend the existing Client Lifecycle Workflow Tool with a client portal module
- Adopt a CLM platform with a native client-facing lifecycle portal
- Build a standalone closure microservice with a client-facing UI
- Retain the current RM-mediated model (no digital channel)

## Rationale
The CLM platform route delivers the broadest lifecycle management capability beyond just closure; the extend-existing route avoids vendor lock-in. The standalone build is high effort for narrow scope. Retaining the current model fails the benchmark gap (CXB-CAC-001, CXB-CAC-002) and the Citi comparison (CGL-CAC-001).

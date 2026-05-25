---
id: PS-BGI-002
type: process-step
section: process-steps
title: Credit and Facility Check
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
systems: [SYS-BGI-002]
transitions: [PS-BGI-003|normal|limit is sufficient, EX-BGI-001|exception|limit is insufficient]
provenance: {"Inputs": {"evidence": "Issuance is blocked in the Trade Finance System unless available facility limit covers the guarantee amount.", "source": "document"}, "Outputs": {"evidence": "If the limit is insufficient, the application is parked and routed to the Credit team.", "source": "document"}, "What happens": {"evidence": "The Trade Finance Officer confirms the client holds an approved guarantee facility with sufficient available limit. If the limit is insufficient, the application is parked and routed to the Credit team.", "source": "document"}, "Why it matters": {"evidence": "this is the most common reason for delay. Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit.", "source": "document"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## What happens
The Trade Finance Officer confirms the client holds an approved guarantee facility with sufficient available limit to cover the requested guarantee amount. If the limit is insufficient, the application is parked and routed to the Credit team.

## Inputs
- Validated application package
- Client guarantee facility record in Trade Finance System
- Requested guarantee amount

## Outputs
- Confirmed available facility limit
- Application routed to Credit team if limit is insufficient

## Why it matters
This is the most common reason for delay; clients who have not pre-arranged sufficient limit cause applications to stall here.

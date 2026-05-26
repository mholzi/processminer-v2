---
id: ROLE-SP-004
type: role
section: roles
title: Compliance
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
systems: [SYS-SP-004, SYS-SP-007]
controls: [CP-SP-004]
provenance: {"In this process": {"evidence": "Section 5.1 step 4: 'potential hits route to Compliance.' RACI: Compliance = A/R for Sanctions/AML screening. Exception E-3: 'escalated to Compliance and Financial Crime; release blocked pending investigation.' RACI: R-transaction handling — Compliance = C. RACI: Compliance = I for all remaining rows.", "source": "document"}, "Responsibility": {"evidence": "RACI table Section 4: Sanctions/AML screening — Compliance = A/R. Exception E-3: 'Payment frozen; escalated to Compliance and Financial Crime; release blocked pending investigation.'", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## Responsibility
Accountable for sanctions and AML screening outcomes, and for investigating and resolving confirmed sanctions or AML hits.

## In this process
Compliance owns the sanctions and AML screening step (ps-4): potential hits from the automated screening engine are routed to Compliance for review; confirmed hits result in the payment being frozen and escalated to Compliance and Financial Crime pending investigation (exception E-3). Compliance is also Consulted on R-transaction handling (ps-10). For all other steps Compliance is Informed.

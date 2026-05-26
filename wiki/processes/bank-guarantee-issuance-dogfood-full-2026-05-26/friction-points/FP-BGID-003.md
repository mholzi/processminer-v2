---
id: FP-BGID-003
type: friction-point
section: friction-points
title: Collateral Booking Status Opaque to Client
status: draft
confidence: medium
source: SME interview
severity: MEDIUM
occursAt: [PS-BGID-007]
provenance: {"Client impact": {"evidence": "clients don't know whether collateral has been booked — time-sensitive for underlying contracts with hard guarantee-delivery deadlines", "source": "elicited"}, "Description": {"evidence": "the collateral-confirmation journey when applicable — clients don't know whether collateral has been booked and the guarantee can therefore be released", "source": "elicited"}, "Root cause": {"evidence": "collateral blocking is an internal treasury operation with no client-facing notification step", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:15:47Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## Description
When a guarantee is partially secured by cash collateral, the client receives no confirmation of when the collateral has been received and blocked by the bank, leaving them unable to determine whether guarantee release is imminent.

## Root cause
Collateral blocking is handled as an internal treasury operation with no client-facing notification step; the trade-finance desk communicates with the client only once the full issuance is complete.

## Client impact
Clients with liquid funds committed as collateral face uncertainty about whether their money is blocked and whether issuance will proceed; the ambiguity is particularly acute where the underlying contract has a hard deadline for guarantee delivery.

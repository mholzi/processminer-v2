---
id: VG-DDMM-004
type: gap
section: gap-resolution
title: Query Channel SLA and Payments Operations Capacity Not Defined
status: draft
confidence: high
source: ddmm-transformation-agent
validationArea: Operations
gapStatus: OPEN
provenance: {"Resolution": {"evidence": "SME confirmed: SLA definition and capacity confirmation are hard prerequisites for TD-DDMM-004 deployment; must be defined before channel goes live.", "source": "elicited"}, "Status": {"evidence": "SME confirmed: OPEN; SLA definition is a hard prerequisite for deployment.", "source": "elicited"}, "The gap": {"evidence": "SME (M. Vogel) confirmed: TD-DDMM-004 commits to the in-portal query channel but no element defines a query-response SLA or Payments Operations capacity agreement — exactly the IR-DDMM-004 scenario.", "source": "elicited"}}
---
## The gap
TD-DDMM-004 commits to the in-portal mandate query channel but no element defines a query-response SLA or a Payments Operations capacity agreement. Without both, the channel creates implicit response-time commitments the team may not consistently meet.

## Resolution
Before the query channel goes live, Payments Operations must agree a query-response SLA — maximum response time and business-hours coverage — and confirm staffing headroom to meet it. The SLA is a hard prerequisite; the channel must not be deployed without it. Adherence tracked in MMS operational reporting from day one.

## Status
OPEN. SLA definition and capacity confirmation are hard prerequisites for TD-DDMM-004 deployment.

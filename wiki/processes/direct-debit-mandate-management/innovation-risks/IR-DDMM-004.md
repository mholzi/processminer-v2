---
id: IR-DDMM-004
type: innovation-risk
section: innovation-risks
title: In-Portal Query Channel Creates Unmanaged SLA Exposure
status: draft
confidence: high
source: ddmm-innovation-analyst
severity: MEDIUM
affects: [II-DDMM-008]
provenance: {"Likelihood & impact": {"evidence": "SME confirmed: creditors submitting structured queries will have implicit expectations of timely response; without a defined SLA, inconsistent response times damage creditor trust and create audit exposure.", "source": "elicited"}, "Mitigation": {"evidence": "SME confirmed: SLA definition and operational scope agreement with Payments Operations is a hard prerequisite before launch; SLA adherence tracked in MMS reporting.", "source": "elicited"}, "The risk": {"evidence": "SME (M. Vogel) confirmed: Payments Operations has no agreed query-response SLA today; surfacing a structured query channel without a defined SLA creates reputational and contractual risk if response times are inconsistent.", "source": "elicited"}}
---
## The risk
The in-portal query channel (II-DDMM-008) surfaces a direct communication path to Payments Operations. No query-response SLA exists today. Launching the channel without a defined SLA creates implicit response-time commitments that Payments Operations may not consistently meet, exposing the bank to creditor trust damage and potential contractual disputes.

## Likelihood & impact
High likelihood if the channel launches before operational readiness is confirmed. Impact is MEDIUM: inconsistent response times undermine the creditor experience improvement the idea targets and may generate more RM contact, not less.

## Mitigation
SLA definition and Payments Operations capacity agreement are hard prerequisites before build. Query-response SLA adherence tracked in MMS reporting from day one; query volume and type monitored to inform staffing adjustments.

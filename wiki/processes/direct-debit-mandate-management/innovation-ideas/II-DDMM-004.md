---
id: II-DDMM-004
type: innovation-idea
section: innovation-ideas
title: Automated R-Transaction Pre-Classification and Routing
status: draft
confidence: high
source: ddmm-innovation-analyst
category: Operations Automation
strategicFit: MEDIUM
complexity: MEDIUM
addresses: [PP-DDMM-001]
fromTrend: [TR-DDMM-001]
provenance: {"Expected benefit": {"evidence": "SME confirmed: reduces clerk investigation time for high-volume standard patterns; also lays groundwork for OAF-DDMM-002 remediation (structured resolution records).", "source": "elicited"}, "Feasibility": {"evidence": "SME confirmed: rules-based is sufficient for standard codes; ML optional; structured resolution-record template (OAF-DDMM-002 remediation) should exist first.", "source": "elicited"}, "The idea": {"evidence": "SME (M. Vogel) confirmed: PP-DDMM-001 spikes with volume but is bounded; standard R-transaction patterns (MD01/MD02/AC04) are the bulk of the load and lend themselves to rules-based pre-classification.", "source": "elicited"}}
---
## The idea
Deploy a rules engine in the R-transaction handling flow that pre-classifies each inbound R-transaction by reason code and, for standard patterns, auto-generates the resolution record and proposed action. The Mandate Clerk confirms or overrides; SL01 and edge cases route to full manual review.

## Expected benefit
Reduces clerk investigation time for high-volume standard R-transaction patterns. Addresses the volume-spike pain of PP-DDMM-001 by handling base load automatically, so clerks focus on genuine edge cases. Also lays groundwork for the OAF-DDMM-002 remediation requirement.

## Feasibility
Requires a rules engine fed by reason codes and MMS mandate history; rules-based is sufficient for standard codes, ML is optional. Dependency: the structured resolution-record template should exist first. Human confirmation step is the safeguard against over-automation of edge cases.

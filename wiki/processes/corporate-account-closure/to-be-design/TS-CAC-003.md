---
id: TS-CAC-003
type: target-state
section: to-be-design
title: Automated multi-regime-compliant record retention and data deletion
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
replaces: [PS-CAC-008]
provenance: {"Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Target description": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "What changes": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## Target description
A defined retention policy — reconciling GwG (5 years), HGB § 257 (6/10 years), and AO § 147 (10 years) into a single maximum-period schedule — is enforced automatically by the Records Archive: the system prevents premature deletion, logs all archiving events, and triggers automated data deletion or anonymisation of personal data once the longest applicable period expires. Archive retrieval is indexed and searchable to meet AMLA supervisory inspection requirements enforceable from July 2027.

## What changes
- The retention period and archive location are defined in a policy document (currently undocumented, PG-CAC-003)
- The Records Archive enforces the defined schedule automatically, replacing the quarterly manual CP-CAC-007 completeness review with continuous system-level enforcement
- A GDPR data deletion workflow triggers automatically when all retention obligations expire for a given file, closing the current absence of any deletion protocol flagged in REG-CAC-007
- Archive content is indexed and searchable for AMLA supervisory retrieval, meeting requirements coming into force July 2027

## Rationale
The AMLA/AMLR enforcement date of July 2027 creates a hard regulatory deadline. The current process documents no retention period, location, or deletion protocol — three gaps that automated enforcement resolves simultaneously and that TR-CAC-002 flags as an imminent supervisory risk.

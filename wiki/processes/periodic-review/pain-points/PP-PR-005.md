---
id: PP-PR-005
type: pain-point
section: pain-points
title: Audit fragility
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
category: record keeping
severity: HIGH
priority: P1
affects: [PS-PR-005, PS-PR-006, PS-PR-007]
provenance: {"Description": {"evidence": "Audit fragility. Reconstructing why a review was approved requires pulling four artefacts, none of which are timestamped consistently. (§2 Why it hurts, p.7)", "source": "document"}, "Impact": {"evidence": "Two regulatory findings (BaFin §44 KWG inspection, Sep 2025; internal audit report IA-2025-117) have been raised against control execution, ageing and evidence completeness. (Executive Summary, p.5); G-02: Evidence scattered across 4 systems — Critical — Q1 2027. (§9 Gap Log, p.16)", "source": "document"}, "Root cause": {"evidence": "", "source": "proposed"}}
---
## Description
Reconstructing why a review was approved requires pulling four artefacts, none of which are timestamped consistently. The four systems identified in the As-Is steps are the shared-drive document pack, the email thread, the SharePoint Compliance Log entry, and the core banking sign-off record.

## Impact
The inconsistency between artefacts makes it impossible to produce a complete, coherent audit trail on demand. Regulatory findings against evidence completeness have been raised (BaFin §44 KWG inspection Sep 2025; internal audit report IA-2025-117). This remains a Critical open gap (G-02, target close Q1 2027).

## Root cause
Each system records its own fragment with its own timestamp and format. No single append-only record is written at the time each decision is made, and there is no reconciliation process that verifies cross-system consistency after the fact.

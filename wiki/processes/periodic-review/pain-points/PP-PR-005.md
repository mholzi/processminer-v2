---
id: PP-PR-005
type: pain-point
section: pain-points
title: Audit fragility — reconstructing review decisions
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
category: data-quality
severity: HIGH
priority: P1
affects: []
provenance: {"Description": {"evidence": "Audit fragility. Reconstructing why a review was approved requires pulling four artefacts, none of which are timestamped consistently.", "source": "document"}, "Impact": {"evidence": "Two regulatory findings (BaFin §44 KWG inspection, Sep 2025; internal audit report IA-2025-117) have been raised against control execution, ageing and evidence completeness.", "source": "document"}, "Root cause": {"evidence": "", "source": "proposed"}}
---
## Description
Reconstructing why a review was approved requires pulling artefacts from four separate systems (shared drive, email, SharePoint, core banking), none of which are consistently timestamped.

## Impact
Cannot demonstrate a complete audit trail to regulators on demand. BaFin §44 KWG inspection (Sep 2025) and internal audit report IA-2025-117 both raised findings against control execution, ageing and evidence completeness.

## Root cause
No single system of record for decisions; evidence is distributed across ad-hoc systems with no enforced provenance trail.

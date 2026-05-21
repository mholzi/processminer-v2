---
id: PP-PR-002
type: pain-point
section: pain-points
title: No deterministic trigger
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
category: manual effort
severity: HIGH
priority: P1
affects: []
provenance: {"Description": {"evidence": "No deterministic trigger. A client whose RM leaves drops off the list for a full review cycle. [As-Is §2]: Owners change when an RM leaves; lists are not reconciled against the client master.", "source": "document"}, "Impact": {"evidence": "overdue on roughly 18.4 % of the High-Risk book as of Q1 2026. Two regulatory findings (BaFin §44 KWG inspection, Sep 2025; internal audit report IA-2025-117) have been raised against control execution, ageing and evidence completeness.", "source": "document"}, "Root cause": {"evidence": "RM receives a monthly Excel extract from Compliance listing her clients due for review. Owners change when an RM leaves; lists are not reconciled against the client master.", "source": "document"}}
---
## Description
A client whose RM leaves the bank drops off the review list for a full review cycle because the trigger depends on the RM receiving and acting on a monthly Excel extract.

## Impact
18.4% of the High-risk book is overdue as at Q1 2026, with regulatory findings raised by BaFin §44 KWG inspection (Sep 2025) and internal audit report IA-2025-117.

## Root cause
The trigger is owned by individual RMs via a manual Excel list distribution, with no system-of-record reconciliation against the client master.

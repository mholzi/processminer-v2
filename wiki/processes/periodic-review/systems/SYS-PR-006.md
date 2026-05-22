---
id: SYS-PR-006
type: system
section: systems
title: Risk Rating Service
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
systemType: SUPPORTING
integrates: [SYS-PR-001, SYS-PR-003]
provenance: {"Purpose": {"evidence": "§7.2 system inventory table: 'Risk Rating Service | Client risk score | Existing (model rebuilt 2025) | Connect'", "source": "document"}, "Role in this process": {"evidence": "§3.2 Step 3: 'Refreshes the client's risk rating (re-running the rating model)'; §3.2 Step 5: 'The risk model's rating with feature contributions'; §7.2: 'Existing (model rebuilt 2025) | Connect'", "source": "document"}}
---
## Purpose
Produces and refreshes the client risk score that determines review cadence and STP eligibility.

## Role in this process
Invoked by the STP Decision Engine at Step 3 to re-run the rating model on approval. The analyst sees the model's rating together with its feature contributions at Step 5 (Reviewer Triage). Existing system; model rebuilt 2025. Status: Connect.

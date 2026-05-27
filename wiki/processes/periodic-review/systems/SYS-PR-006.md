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
---
## Purpose
Produces and refreshes the client risk score that determines review cadence and STP eligibility.

## Role in this process
Invoked by the STP Decision Engine at Step 3 to re-run the rating model on approval. The analyst sees the model's rating together with its feature contributions at Step 5 (Reviewer Triage). Existing system; model rebuilt 2025. Status: Connect.

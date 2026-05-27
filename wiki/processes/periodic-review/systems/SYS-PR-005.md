---
id: SYS-PR-005
type: system
section: systems
title: Screening Service
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
systemType: SUPPORTING
integrates: [SYS-PR-001]
---
## Purpose
Existing sanctions, PEP and adverse-media screening platform (Dow Jones RC). Contract renewal required; status: Re-contract.

## Role in this process
Consulted at two points: Step 2 pre-fill (latest sanctions/PEP/adverse-media results; open hit flags the case as ineligible for STP) and Step 6 sign-off (mandatory re-run as control KYC-C-06). Also fires ReviewDue events when a new hit exceeds threshold.

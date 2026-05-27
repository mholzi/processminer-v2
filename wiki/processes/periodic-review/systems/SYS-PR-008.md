---
id: SYS-PR-008
type: system
section: systems
title: Audit Ledger
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: CORE
integrates: [SYS-PR-001]
---
## Purpose
Provides an immutable, append-only, hash-chained record of every KYC decision, actor identity, policy clause, and timestamp, retained for 10 years in line with AMLD record-keeping requirements.

## Role in this process
Receives every Case Manager state transition hash-chained for 10-year retention. At Step 3 the STP engine posts the full evidence snapshot; at Step 7 the entry is sealed. The hash chain satisfies control KYC-C-07 and closes the BaFin §44 finding.

---
id: SYS-PR-010
type: system
section: systems
title: Transaction Datamart
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: SUPPORTING
integrates: [SYS-PR-001]
---
## Purpose
Provides the source-of-wealth / source-of-funds signal derived from the client's transactional history.

## Role in this process
Consumed at Step 2 (Case Open & Pre-Fill): the source-of-funds signal from the last 12 months of transactions is extracted from the Datamart and loaded into the case evidence pack. Existing system; status is Connect.

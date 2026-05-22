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
provenance: {"Purpose": {"evidence": "§7.2: 'Transaction Datamart | SoW signal | Existing | Connect'", "source": "document"}, "Role in this process": {"evidence": "§3.2 Step 2: 'Source-of-funds signal from the last 12 months of transactions (Transaction Datamart)'; §7.2: 'Existing | Connect'", "source": "document"}}
---
## Purpose
Provides the source-of-wealth / source-of-funds signal derived from the client's transactional history.

## Role in this process
Consumed at Step 2 (Case Open & Pre-Fill): the source-of-funds signal from the last 12 months of transactions is extracted from the Datamart and loaded into the case evidence pack. Existing system; status is Connect.

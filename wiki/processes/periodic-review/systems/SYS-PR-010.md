---
id: SYS-PR-010
type: system
section: systems
title: Transaction Datamart
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
systemType: SUPPORTING
integrates: [SYS-PR-001]
provenance: {"Purpose": {"evidence": "§7.2: Role = 'SoW signal'; Build/Buy = 'Existing'; Status = 'Connect'. §3.2 Step 2: 'Source-of-funds signal from the last 12 months of transactions (Transaction Datamart).' Note: the §7.2 table labels the role 'SoW signal' while §3.2 Step 2 says 'source-of-funds signal'; the document uses both terms in different places for this system. 'Source-of-wealth' in the original Purpose was not directly supported by any single explicit passage; corrected to 'source-of-funds' per §3.2 Step 2.", "source": "document"}, "Role in this process": {"evidence": "§3.2 Step 2: 'Source-of-funds signal from the last 12 months of transactions (Transaction Datamart).' §7.2: 'Existing' / Status 'Connect'. 'Reducing the need to request evidence' is an inference from the pre-fill / data-minimisation context (§3.2 Step 4: 'No re-collection of documents the bank holds and can still verify').", "source": "document"}}
---
## Purpose
Stores transactional history used to generate a source-of-funds signal for the KYC pre-fill step.

## Role in this process
Feeds a source-of-funds signal derived from the client's last 12 months of transaction history into the pre-fill step (Step 2), reducing the need to request source-of-funds evidence from the client. Existing system. Status: Connect.

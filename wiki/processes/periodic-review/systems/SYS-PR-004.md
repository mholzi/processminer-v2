---
id: SYS-PR-004
type: system
section: systems
title: Document Vault
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
systemType: SUPPORTING
integrates: [SYS-PR-001]
provenance: {"Purpose": {"evidence": "§7.2 table: System 'Document Vault', Role 'Identity docs, SoW evidence', Build 'Existing (Hyland)', Status 'Integrate'. §3.2 Step 2: 'Identity documents and their expiry (Document Vault)'.", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Existing document management platform (Hyland) storing client identity documents and source-of-wealth evidence with document-expiry tracking. Integration action required; status: Integrate.

## Role in this process
Supplies identity documents and expiry dates at Step 2 pre-fill. Expiring documents surface as data deltas at Step 4 so only the expired item is requested from the client. Document content is included in the evidence pack at Step 5.

---
id: INT-PR-004
type: integration
section: integrations
title: KYC Case Manager → Core Banking
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-001]
provenance: {"What connects": {"evidence": "", "source": "proposed"}, "What flows": {"evidence": "§7.3: 'writes back nextReviewDate, riskRating, and any restrictions via the existing client-master update API.' Step 7 (§3.2): 'Next review date written to the client master.' 'Risk rating refreshed.' 'Client exit workflow opened, or product / channel restrictions applied via the Restrictions Service.'", "source": "document"}}
---
## What connects
The KYC Case Manager (SYS-PR-001) and Core Banking (Avaloq) via the existing client-master update API.

## What flows
- nextReviewDate written back to the client master on case close
- riskRating written back to the client master on case close
- Product or channel restrictions applied via the client-master update API when an exit or restriction decision is taken

---
id: INT-PR-003
type: integration
section: integrations
title: Outreach Service → Mobile App
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-007]
provenance: {"What connects": {"evidence": "§7.3: 'Outreach Service → Mobile App: uses the same secure-message rail as transactional approvals; supports step-up auth.'", "source": "document"}, "What flows": {"evidence": "§7.3: 'uses the same secure-message rail as transactional approvals; supports step-up auth.' Step 4 (§3.2): 'Owner. Client Outreach Service. Channel. Mobile app (primary)... The system computes the minimal data delta — what is missing or stale — and asks for only that.'", "source": "document"}}
---
## What connects
The Outreach Service (SYS-PR-007) and the bank's Mobile App. The integration uses the same secure-message rail as transactional approvals.

## What flows
- Minimal-delta outreach prompts pushed to the client via the mobile app secure-message rail
- Client responses (document uploads, data confirmations) returned via the app to the Case Manager
- Step-up authentication challenges issued via the same secure rail when required

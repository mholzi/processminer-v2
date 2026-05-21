---
id: INT-PR-002
type: integration
section: integrations
title: KYC Case Manager → Audit Ledger
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-001, SYS-PR-008]
provenance: {"What connects": {"evidence": "§7.3: 'Case Manager → Audit Ledger: every state transition, hash-chained, retained 10 years (matches AMLD record-keeping).' D5: 'append-only'. §5.2: 'Immutable audit ledger of decisions.'", "source": "document"}, "What flows": {"evidence": "§7.3: 'every state transition, hash-chained, retained 10 years (matches AMLD record-keeping).' §5.2: 'Every control writes to the Audit Ledger with the case ID, the actor (human or system), the policy clause it satisfies, and the timestamp.' Step 3: 'Posts the decision and the full evidence snapshot to the Audit Ledger.' Step 6: 'Sign-off is recorded against the FCO's identity (SSO) and is immutable.'", "source": "document"}}
---
## What connects
The KYC Case Manager (SYS-PR-001) and the Audit Ledger (SYS-PR-008). Every state transition the Case Manager records is written append-only to the Ledger; the Ledger never receives updates or deletes.

## What flows
- Every case state transition written append-only to the Audit Ledger, hash-chained so tampering is detectable
- Actor identity (human SSO ID or system actor) recorded per transition
- Policy clause reference attached to each transition
- Full evidence snapshot captured at STP auto-approval and at FCO sign-off
- All records retained for 10 years in line with AMLD record-keeping requirements

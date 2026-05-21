---
id: TS-PR-007
type: target-state
section: to-be-design
title: Step 7 — Close-Out
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: KYC Case Manager (system)
sla:
condition: Approval (Step 5 or Step 6), exit decision (Step 6), or restriction decision (Step 6) recorded
systems: [SYS-PR-001]
provenance: {"Rationale": {"evidence": "D5 — One Audit Ledger, append-only, hash-chained [D5, p.15]; Audit fragility: Reconstructing why a review was approved requires pulling four artefacts, none of which are timestamped consistently. [As-Is, p.7]", "source": "document"}, "Target description": {"evidence": "Owner. Case Manager (system). On approval: Risk rating refreshed. Next review date written to the client master. Outreach threads archived to the case. Audit Ledger entry sealed. RM notified (informational). On exit / restriction: Client Exit workflow opened, or product / channel restrictions applied via the Restrictions Service. Customer Communications notified to draft the regulatory-compliant exit letter. [Step 7, pp.9-10]", "source": "document"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
On approval, the Case Manager automatically: refreshes the risk rating; writes the next-review date to the client master; archives all outreach threads to the case record; seals the Audit Ledger entry; and sends an informational notification to the RM. On an exit decision: the Case Manager opens the Client Exit workflow and notifies Customer Communications to draft the regulatory-compliant exit letter. On a restriction decision: the Case Manager applies the specified product or channel restrictions via the Restrictions Service. No manual RM action is required for any close-out path.

## What changes
- All close-out actions are automated by the Case Manager — no manual RM steps required
- Audit Ledger entry is sealed at close-out, completing the immutable hash-chained decision record
- Client Exit workflow is triggered automatically on exit decisions
- Product and channel restrictions are applied programmatically via the Restrictions Service on restriction decisions
- Customer Communications is formally and automatically notified for exit letters — no RM-drafted letter

## Rationale
Automated close-out ensures every path (approve / exit / restrict) completes consistently and completely, eliminating the risk of manual steps being skipped or delayed. Sealing the Audit Ledger entry at this step closes the audit fragility of the As-Is process and satisfies the immutable-ledger requirement of decision D5.

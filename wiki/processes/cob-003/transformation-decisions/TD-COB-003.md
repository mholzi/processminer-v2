---
id: TD-COB-003
type: transformation-decision
section: transformation-decisions
title: Adopt EU Digital Identity Wallet acceptance
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
decisionType: ADOPTION
decisionStatus: PROPOSED
resolves: [PP-COB-001, FP-COB-001]
realises: [TS-COB-001]
fromIdea: [II-COB-006]
provenance: {"Options considered": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "The decision": {"evidence": "", "source": "proposed"}}
---
## The decision
Accept EU Digital Identity Wallet credentials at onboarding, letting clients share pre-verified identity and business attributes directly instead of sourcing, uploading and re-submitting identity documents for manual verification.

## Options considered
- Build a wallet connector now, ahead of the January 2027 acceptance mandate
- Wait and implement only when the eIDAS 2.0 acceptance deadline forces it
- Accept wallet credentials for identity only, keeping document upload for business attributes
- Decline to support the wallet and rely solely on document-based verification

## Rationale
eIDAS 2.0 makes wallet acceptance a January 2027 obligation, not an option, so the decision is about timing and scope rather than whether. Building ahead of the deadline turns a compliance requirement into an onboarding-speed advantage, while the connector and legal sign-off are non-trivial.

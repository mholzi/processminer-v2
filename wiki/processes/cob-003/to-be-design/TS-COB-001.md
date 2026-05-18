---
id: TS-COB-001
type: target-state
section: to-be-design
title: Digital, self-validating application front door
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
replaces: [PS-COB-001, PS-COB-002]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
The application front door is fully digital and self-validating. The client sees a checklist tailored to their business type and requested products, uploads are validated as they are entered, and any gap is flagged before submission rather than chased afterwards. Signatures are captured electronically inside the same flow, and where the client holds an EU Digital Identity Wallet, verified identity and business attributes are shared directly so fewer documents need sourcing at all.

## What changes
- A generic document checklist becomes one tailored to the client's entity type and requested products
- Uploads are validated in real time, so incomplete applications are caught before submission, not after
- Manual document chasing is replaced by an automated, escalating reminder sequence
- Wet-ink signatures are replaced by e-signature captured inside the digital flow
- EU Digital Identity Wallet credentials let clients share pre-verified identity instead of re-submitting documents

## Rationale
Incomplete first submissions and document chasing are the single biggest cycle-time drag on COB-003; moving validation upfront and removing the paper break attacks the problem at its source and matches the minutes-not-days front door fintech challengers already offer.

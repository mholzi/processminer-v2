---
id: INT-DDMM-007
type: integration
section: integrations
title: MMS to Creditor Portal — Status and Confirmation Push
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-002, SYS-DDMM-001]
provenance: {"What connects": {"evidence": "SME (M. Vogel) confirmed: one-directional event push from MMS to Creditor Portal; portal does not pull from MMS — MMS pushes the events.", "source": "elicited"}, "What flows": {"evidence": "SME confirmed: processing-status events (pending/in-progress), registration confirmation (type-specific), and R-transaction resolution notification (MD01/MD02/AC04) all flow MMS to portal.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What connects
One-directional event push from the Mandate Management System to the Creditor Portal; MMS pushes processing-status updates and confirmation events that the portal surfaces to the creditor.

## What flows
- Processing-status events (pending / in-progress state updates feeding the portal status display)
- Registration confirmation (type-specific: new mandate registered, amendment applied, cancellation confirmed)
- R-transaction resolution notification (for MD01 / MD02 / AC04 reason codes)

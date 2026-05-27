---
id: INT-DDMM-007
type: integration
section: integrations
title: MMS to Creditor Portal — Status and Confirmation Push
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-002, SYS-DDMM-001]
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

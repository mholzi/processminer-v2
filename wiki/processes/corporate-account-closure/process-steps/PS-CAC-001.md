---
id: PS-CAC-001
type: process-step
section: process-steps
title: Receive and log request
status: draft
confidence: high
source: account-closure-dtp-mockup.md
owner: Closure Analyst
sla: Within 1 business day
systems: [SYS-CAC-001]
transitions: [PS-CAC-002|normal|always]
provenance: {"Inputs": {"evidence": "A written closure instruction is received from an authorised signatory of the corporate client, or the Relationship Manager raises a bank-initiated closure request, or a dormancy review flags an account inactive beyond the dormancy threshold.", "source": "document"}, "Outputs": {"evidence": "Y — both blocks are correct. Approve. — M. Berger", "source": "elicited"}, "What happens": {"evidence": "", "source": "proposed"}, "Why it matters": {"evidence": "Y — both blocks are correct. Approve. — M. Berger", "source": "elicited"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## What happens
The closure request arrives via the Relationship Manager or the client portal. For dormancy-driven closures, the Closure Analyst creates the case manually from the dormancy review output; from that point the flow is identical to any other trigger. The Closure Analyst logs the request in the Client Lifecycle Workflow Tool, assigning one of four closure reason codes: CLIENT, BANK-COMMERCIAL, BANK-RISK or DORMANCY. BANK-RISK cases are priority-queued and carry a 5-business-day cycle-time target; all other codes carry the standard 10-business-day target. The control path at steps 3–4 is identical for all codes.

## Inputs
- Written closure instruction from an authorised signatory of the corporate client
- Bank-initiated closure request raised by the Relationship Manager following a commercial or risk review
- Dormancy review recommendation flagging an account inactive beyond the dormancy threshold

## Outputs
- Logged closure case in the Client Lifecycle Workflow Tool with a closure reason code
- Case routed for mandate verification

## Why it matters
Creates a formal record of the closure request in the workflow system, ensuring every case is captured and traceable from the outset.

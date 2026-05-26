---
id: PS-SP-009
type: process-step
section: process-steps
title: Settlement and confirmation
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Payment Hub
sla: SCT Inst: within 10 seconds of submission; Standard SCT: next STEP2 settlement cycle
condition: pacs.008 submitted and acknowledged by CSM
systems: [SYS-SP-002, SYS-SP-006]
provenance: {"Inputs": {"evidence": "Step 9 describes CSM settlement and beneficiary-bank confirmation signals. Decision D-6: 'SCT Inst confirmed in 10s?'", "source": "document"}, "Outputs": {"evidence": "Step 9: customer notified immediately (SCT Inst) or payment shown as executed (standard SCT). Exception E-5 triggered on timeout/rejection.", "source": "document"}, "What happens": {"evidence": "Step 9: 'For SCT Inst, settlement and the beneficiary-bank confirmation complete within 10 seconds; the customer is notified immediately. For standard SCT, settlement completes in the next STEP2 cycle and the customer sees the payment as executed. If an SCT Inst attempt times out or is rejected → see Exception E-5.'", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:15Z
---
## What happens
For SCT Inst, the CSM (RT1) settles the payment and returns a beneficiary-bank confirmation within 10 seconds; the customer is notified immediately. For standard SCT, settlement completes in the next scheduled STEP2 cycle and the customer sees the payment as executed. If an SCT Inst attempt times out or is rejected by the beneficiary bank within the 10-second window, Exception E-5 is triggered.

## Inputs
- CSM submission reference and timestamp
- Settlement confirmation or rejection message from CSM
- Beneficiary-bank acceptance or rejection signal (SCT Inst only)

## Outputs
- Settlement confirmation record
- Customer notification of successful execution
- Exception trigger to ex-5 if SCT Inst timeout or beneficiary-bank rejection occurs

## Why it matters
Settlement confirmation closes the payment lifecycle for the customer. The 10-second SLA for SCT Inst is a scheme obligation; breaches trigger a defined exception path. For standard SCT, the STEP2 cycle determines the execution date communicated to the customer.

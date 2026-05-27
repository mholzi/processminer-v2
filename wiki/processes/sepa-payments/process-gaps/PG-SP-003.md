---
id: PG-SP-003
type: process-gap
section: process-gaps
title: Bulk file approval above aggregate limit not documented
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
area: As-Is process
gapStatus: open
affects: [PS-SP-008]
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## The gap
Control C-6 states that bulk payment files require a 4-eyes release by an Ops Approver, but there is no documented process for what happens when the aggregate value of a bulk file exceeds the corporate daily aggregate limit. It is unclear who has authority to approve such files, whether a higher-level sign-off is required, or whether the file is automatically blocked.

## Impact
Large bulk files that cross the aggregate limit may be held without a clear escalation path, causing processing delays. The absence of a documented approval authority also creates a segregation-of-duties risk. The submit-to-clearing step (ps-8) cannot complete until the approval question is resolved.

## Next step
Establish and document the approval authority matrix for bulk files above the corporate daily aggregate limit, including who can approve and the escalation path if the approver is unavailable.

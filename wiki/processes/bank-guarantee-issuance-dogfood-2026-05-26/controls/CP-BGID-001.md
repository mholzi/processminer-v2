---
id: CP-BGID-001
type: control
section: controls
title: Four-Eyes Issuance Approval
status: draft
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: MANUAL
effectiveness:
owner: Trade Finance
step: [PS-BGID-005]
regulatedBy: []
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "", "source": "proposed"}, "What it checks": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-26T05:17:42Z
---
## What it checks
Verifies that every guarantee issuance has been reviewed and approved by an authorised Trade Finance Manager before the instrument is generated.

## Control activity
A Trade Finance Manager reviews the assembled guarantee package and approves issuance in the Trade Finance System. For guarantees above EUR 5 million, the Head of Trade Finance also provides sign-off. No guarantee proceeds without a recorded approval.

## Risk addressed
Without this control, a guarantee could be issued without adequate review, exposing the bank to unauthorised commitments, fraud or issuance errors that create direct financial liability.

## Timing
The control fires at every issuance event, at step 5 of the process, before the guarantee instrument is generated in the Trade Finance System.

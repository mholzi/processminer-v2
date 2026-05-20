---
id: PS-BGI-007
type: process-step
section: process-steps
title: Collateral Confirmation
status: draft
confidence: medium
source: bank-guarantee-issuance-v2.md
owner: Trade Finance Officer
condition: Guarantee is not fully covered by the client's approved guarantee facility (partially-secured guarantee)
transitions: [PS-BGI-005|normal|collateral confirmed and blocked]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "For guarantees not fully covered by an approved facility, the Trade Finance Officer confirms that cash collateral has been received and blocked before issuance can proceed. This step is now mandatory for every partially-secured guarantee.", "source": "document"}, "Why it matters": {"evidence": "C4 — Collateral block confirmation. For partially-secured guarantees, cash collateral must be confirmed received and blocked before issuance. Control owner: Trade Finance Officer.", "source": "document"}}
---
## What happens
The Trade Finance Officer confirms that cash collateral has been received and blocked before issuance proceeds. This step is mandatory for every partially-secured guarantee — any guarantee not fully covered by the client's approved guarantee facility.

## Inputs
- Partially-secured guarantee application
- Evidence of cash collateral receipt
- Confirmation that collateral has been blocked

## Outputs
- Confirmed and blocked collateral
- Application advances to issuance approval

## Why it matters
Cash collateral must be confirmed and blocked in place before the bank can proceed to issuance approval.

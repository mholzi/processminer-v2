---
id: INT-BGI-001
type: integration
section: integrations
title: Corporate Portal to Trade Finance System
status: draft
confidence: high
systems: [SYS-BGI-001, SYS-BGI-002]
provenance: {"What connects": {"evidence": "Basic capture fields (client, amount, currency, beneficiary name) flow into the Trade Finance System via an API integration; supporting fields and documents are uploaded separately and the TFO attaches them manually.", "source": "elicited"}, "What flows": {"evidence": "Basic capture fields flow via API on submission; supporting documents and fields not covered by the API — attached manually by the TFO.", "source": "elicited"}}
---
## What connects
Corporate Portal (SYS-BGI-001) to Trade Finance System (SYS-BGI-002) — partial API integration on application submission.

## What flows
- Basic capture fields (client ID, guarantee amount, currency, beneficiary name) pushed automatically via API on submission
- Commercial contract reference, beneficiary bank SWIFT details and supporting documents uploaded separately and attached manually by the TFO — not covered by the API

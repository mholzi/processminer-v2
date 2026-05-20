---
id: INT-BGI-002
type: integration
section: integrations
title: Sanctions Screening Tool to Trade Finance System
status: draft
confidence: high
systems: [SYS-BGI-003, SYS-BGI-002]
provenance: {"What connects": {"evidence": "There is a formal API integration. The tool writes screening results directly to the Trade Finance System application record.", "source": "elicited"}, "What flows": {"evidence": "The tool writes screening results directly to the Trade Finance System application record.", "source": "elicited"}}
---
## What connects
Sanctions Screening Tool (SYS-BGI-003) to Trade Finance System (SYS-BGI-002) — API integration for automatic result writing.

## What flows
- Screening result (pass or hit) written automatically to the application record on completion of the beneficiary and country screen
- Hit details (matched list, matched entry) written to the application record for Compliance investigation

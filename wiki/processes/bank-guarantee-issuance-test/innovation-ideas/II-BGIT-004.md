---
id: II-BGIT-004
type: innovation-idea
section: innovation-ideas
title: System-enforced post-approval generation gate in Trade Finance System
status: draft
confidence: medium
category: control
strategicFit: MEDIUM
complexity: LOW
addresses: [CG-BGIT-002]
provenance: {"Expected benefit": {"evidence": "", "source": "proposed"}, "Feasibility": {"evidence": "", "source": "proposed"}, "The idea": {"evidence": "", "source": "proposed"}}
---
## The idea
Implement a system-enforced gate in the Trade Finance System that prevents guarantee document generation unless a valid TFM approval record exists for the transaction — converting the current undocumented manual step into a hard system control.

## Expected benefit
Closes the control gap at Step 6 (CG-BGIT-002), making it technically impossible to dispatch a guarantee without a logged approval and strengthening the audit trail for regulatory review.

## Feasibility
TFS already stores TFM approval data; the gate requires a configuration change or workflow rule in the existing system. LOW complexity — no new infrastructure or process redesign required.

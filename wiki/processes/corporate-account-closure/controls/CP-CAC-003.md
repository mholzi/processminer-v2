---
id: CP-CAC-003
type: control
section: controls
title: Sanctions and compliance-case screening
status: draft
confidence: high
source: account-closure-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Compliance
step: [PS-CAC-004]
provenance: {"Control activity": {"evidence": "The client and account are screened for sanctions exposure and any open compliance case. An open case blocks closure until cleared.", "source": "document"}, "Risk addressed": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "Timing": {"evidence": "Every closure", "source": "document"}, "What it checks": {"evidence": "Sanctions & compliance-case screening | Preventive / automated | Every closure", "source": "document"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
regulatedBy: [REG-CAC-001, REG-CAC-003, REG-CAC-004]
---
## What it checks
That the client and account are clear of sanctions exposure and open compliance cases before closure proceeds.

## Control activity
When the Closure Analyst advances the case in the Client Lifecycle Workflow Tool, a combined automated query is triggered against the Sanctions Screening Engine covering both sanctions exposure and open compliance cases. Compliance reviews and adjudicates all results.

## Risk addressed
Closing an account subject to sanctions or an active compliance investigation, resulting in a regulatory breach.

## Timing
Performed at every closure, in step 4.

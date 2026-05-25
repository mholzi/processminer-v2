---
id: CP-NH-014
type: control
section: controls
title: Mandatory training Tier 1 before production access
status: draft
confidence: medium
source: new-hr-onboarding-dtp.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Learning & Development
step: [ps-17, ps-19, ps-23]
provenance: {"Control activity": {"evidence": "Step 2.5: Assign mandatory training in LMS (Code of Conduct, InfoSec, AML, Data Privacy) | L&D. Step 3.1: Complete mandatory training Tier 1 … | New Hire | Day 5. Step 3.5: Validate access — all role-required systems reachable; raise exceptions | New Hire / IT | Day 5. CTL-NHO-02 evidence: LMS completion record. LMS gating mechanism inferred from 'enforced' in CTL-NHO-02.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "CTL-NHO-02 | Mandatory training Tier 1 completion enforced before access to production systems | Per hire | LMS completion record", "source": "document"}, "What it checks": {"evidence": "CTL-NHO-02 | Mandatory training Tier 1 completion enforced before access to production systems | Per hire | LMS completion record. Step 3.1: Complete mandatory training Tier 1 (Code of Conduct, InfoSec, Data Privacy) | New Hire | Day 5. Note: AML appears in the Day-1 assignment list (step 2.5) but is not listed as Tier 1 in step 3.1; removed from Tier 1 description to match step 3.1.", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T14:01:22Z
---
## What it checks
Whether the new hire has completed Mandatory Training Tier 1 — Code of Conduct, InfoSec and Data Privacy — before access to production systems is granted.

## Control activity
Cornerstone LMS enforces completion of Tier 1 modules before production system access is validated as reachable (step 3.5). Learning & Development assigns the curriculum on Day 1 (step 2.5); completion must be achieved by Day 5. The LMS completion record serves as evidence.

## Risk addressed
Without this control, employees could access production systems before they understand the organisation's acceptable use, information security and data privacy obligations, increasing the risk of inadvertent data breach, conduct breach or regulatory non-compliance.

## Timing
Per hire. Assigned on Day 1; completion required by Day 5 (Week 1). The gating check runs at the access validation step (step 3.5).

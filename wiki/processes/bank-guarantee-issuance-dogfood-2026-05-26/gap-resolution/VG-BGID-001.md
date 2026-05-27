---
id: VG-BGID-001
type: gap
section: gap-resolution
title: Corporate Portal Has No Automated Field Validation at Intake
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
validationArea: intake
gapStatus: open
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The gap
The Corporate Portal performs no field-level validation at submission. The commercial contract reference, beneficiary details and wording-type flag are accepted in any state, leaving the Trade Finance Officer as the sole detection point for malformed or incomplete applications.

## Resolution
Enhance the Portal with structured validation rules for all required fields and integrate a real-time facility-headroom API call to the Trade Finance System, so the Portal rejects insufficient-limit applications at entry. This capability is the prerequisite for the same-day fast lane in TS-1 and directly closes PP-BGID-003.

## Status
Open. Portal validation enhancement is a prerequisite for the fast lane and must be delivered in the first transformation phase.

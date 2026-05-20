---
id: TS-BGI-006
type: target-state
section: to-be-design
title: Straight-Through Digital Issuance with System-Enforced Pre-Transmission Validation
status: draft
confidence: low
replaces: [PS-BGI-006]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
Guarantee generation and delivery are digitised via ICC-SWIFT API standards: the Trade Finance System generates the instrument and transmits it to the beneficiary's bank via API rather than manual MT 760 SWIFT message, with a system-enforced pre-transmission validation that checks all key fields against the approved application package before transmission. Facility utilisation updates automatically at transmission.

## What changes
- Manual SWIFT MT 760 handling replaced by API-driven transmission via ICC-SWIFT standards
- System-enforced pre-transmission field validation closes CG-BGI-003
- SWIFT rejections caused by wrong BIC details eliminated by automated field checks
- Facility utilisation update automated at transmission — eliminates manual step and tracking discrepancy risk
- MT 768 acknowledgement receipt remains as step 6 completion criterion

## Rationale
PP-BGI-006 and CG-BGI-003 are direct consequences of manual SWIFT handling. ICC-SWIFT API adoption closes the pre-transmission control gap and eliminates delivery errors in one architecture change, with precedent from Standard Chartered and BNP Paribas production pilots.

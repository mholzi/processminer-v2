---
id: CG-PR-002
type: compliance-gap
section: control-gaps
title: Evidence scattered across four systems
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
severity: HIGH
gapStatus: open
control: [CP-PR-007]
provenance: {"Remediation": {"evidence": "", "source": "proposed"}, "Risk": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "No system of record. Evidence lives in four places (shared drive, email, SharePoint, core banking). Reconciliation is manual. / Audit fragility. Reconstructing why a review was approved requires pulling four artefacts, none of which are timestamped consistently. / As-Is steps: shared drive \\\\fileshare\\KYC\\Reviews\\<year>\\<RM>\\; Compliance Log (SharePoint list); core banking system (Avaloq / Finnova).", "source": "document"}}
---
## The gap
KYC review evidence is stored across four separate systems — the shared drive (\\fileshare\KYC\Reviews), email, SharePoint (Compliance Log) and core banking (Avaloq / Finnova) — with no automated reconciliation, no consistent timestamping, and no single actor-stamped record of each decision.

## Risk
Critical regulatory exposure. The bank cannot produce a complete, timestamped evidence pack on regulatory demand. Reconstructing why a review was approved requires pulling four artefacts, none of which are timestamped consistently.

## Remediation
Implement the Audit Ledger as the single system of record for all KYC decisions and evidence (control KYC-C-07). Every state transition is hash-chained and actor-stamped; the ledger is append-only with a Merkle hash chain checkpointed to an external timestamping authority

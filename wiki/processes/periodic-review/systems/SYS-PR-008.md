---
id: SYS-PR-008
type: system
section: systems
title: Audit Ledger
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: CORE
integrates: [SYS-PR-001]
provenance: {"Purpose": {"evidence": "§7.2: 'Audit Ledger | Immutable decision log | Build (hash-chained) | In design'; §7.3: 'Case Manager → Audit Ledger: every state transition, hash-chained, retained 10 years (matches AMLD record-keeping)'; §5.2: 'Every control writes to the Audit Ledger with the case ID, the actor (human or system), the policy clause it satisfies, and the timestamp.'", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Provides an immutable, append-only, hash-chained record of every KYC decision, actor identity, policy clause, and timestamp, retained for 10 years in line with AMLD record-keeping requirements.

## Role in this process
Receives every Case Manager state transition hash-chained for 10-year retention. At Step 3 the STP engine posts the full evidence snapshot; at Step 7 the entry is sealed. The hash chain satisfies control KYC-C-07 and closes the BaFin §44 finding.

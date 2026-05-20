---
id: CG-BGI-003
type: compliance-gap
section: control-gaps
title: No Pre-Transmission Verification of Generated Guarantee Instrument
status: draft
confidence: high
severity: HIGH
gapStatus: open
provenance: {"Remediation": {"evidence": "", "source": "proposed"}, "Risk": {"evidence": "There is no formal pre-transmission check today, only the TFO's informal eyeball of the generated instrument. Given a SWIFT message is very hard to recall, that is a genuine missing control.", "source": "elicited"}, "The gap": {"evidence": "There is no formal pre-transmission check today, only the TFO's informal eyeball of the generated instrument. Given a SWIFT message is very hard to recall, that is a genuine missing control — a pre-transmission verification of the generated instrument (amount, beneficiary BIC, expiry, wording) against the approved package should exist.", "source": "elicited"}}
---
## The gap
No formal pre-transmission verification exists to confirm the generated guarantee instrument (amount, beneficiary BIC, expiry date, wording) matches the approved application package before SWIFT transmission; the only check is the TFO's informal visual inspection.

## Risk
An instrument with errors — wrong BIC, incorrect amount, wrong expiry, or unapproved wording — is transmitted via SWIFT. Recalling a SWIFT message is operationally costly; errors may reach the beneficiary's bank before correction.

## Remediation
Consider implementing a formal pre-transmission checklist or system-enforced validation in the Trade Finance System that checks the generated instrument fields against the approved application package before SWIFT transmission is permitted.

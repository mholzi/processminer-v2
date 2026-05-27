---
id: ASM-BGID-002
type: assumption
section: assumptions
title: AI Pre-Screener Achieves Acceptable False-Positive Rate on Live Wording Corpus
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
assumptionStatus: OPEN
bearsOn: [TD-BGID-002, TS-BGID-003]
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## The assumption
The AI wording pre-screener achieves a false-positive rate below 10% on the bank's live guarantee wording corpus, delivering material Legal workload reduction without unacceptable manual review overhead on misclassified standard wordings.

## Why it is unconfirmed
The bank's guarantee wording corpus has not been used to train or evaluate a pre-screener model; the variance in bespoke clause structures across the client base is unknown until the corpus is formally analysed by the implementation team.

## Impact if wrong
A false-positive rate above 10% reduces the Legal workload benefit and weakens the business case for the SLA commitment; TS-BGID-003's client-experience improvements are not achievable if Legal queue reduction falls below 40%.

---
id: REG-CAC-004
type: regulation
section: regulation
title: EU sanctions asset freeze at account closure
status: draft
confidence: medium
domain: Financial Crime
source: Council Regulation (EU) No 269/2014 Art. 2; Council Regulation (EC) No 2580/2001
sourceUrl: https://eur-lex.europa.eu/eli/reg/2014/269/oj/eng
provenance: {"How it is met": {"evidence": "https://eur-lex.europa.eu/eli/reg/2014/269/oj/eng — \"No funds or economic resources shall be made available, directly or indirectly, to or for the benefit of natural persons or natural or legal persons...\" — fetched 2026-05-19", "source": "web"}, "What it requires": {"evidence": "https://eur-lex.europa.eu/eli/reg/2014/269/oj/eng — \"All funds and economic resources belonging to, owned, held or controlled by any natural persons...listed in Annex I shall be frozen. No funds...shall be made available\" — fetched 2026-05-19", "source": "web"}, "Why it applies": {"evidence": "https://eur-lex.europa.eu/eli/reg/2014/269/oj/eng — \"All funds and economic resources belonging to, owned, held or controlled by any natural persons...listed in Annex I shall be frozen.\" — fetched 2026-05-19", "source": "web"}}
asOf: 2026-05-19
---
## What it requires
All funds and economic resources belonging to persons or entities on EU sanctions lists must be frozen. Banks must not release or make available any funds to designated parties, even in the context of account closure and residual balance disbursement.

## Why it applies
The residual balance disbursement at account closure is a transfer of funds. If the client, a beneficial owner, or the nominated beneficiary is subject to an EU asset freeze, the disbursement is legally prohibited and the funds must remain frozen.

## How it is met
CP-CAC-003 triggers an automated sanctions screening query via the Sanctions Screening Engine before closure proceeds. A positive hit blocks the case for Compliance adjudication. Frozen balances are handled outside this process per the bank's sanctions freeze protocol.

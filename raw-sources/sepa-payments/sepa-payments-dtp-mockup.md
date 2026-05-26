# SEPA Payments — Detailed Process Document (DTP)

> **MOCKUP** — Sample input for the Processminer v2 documentation engine.
> Illustrates the structure of a "current state" Detailed Process Document
> for ingestion ahead of an SME brainstorming session. Content is fictional.

---

## Document Control

| Field | Value |
|---|---|
| Document title | SEPA Payments — Detailed Process Document |
| Process ID | PRC-OPS-0173 |
| Version | 0.2 (Draft) |
| Status | In review |
| Process owner | Head of Payment Operations |
| Author (SME) | A. Vermeulen — Payments Product Owner |
| Documented by | Processminer v2 |
| Last updated | 2026-05-18 |
| Classification | Internal — Confidential |
| Review cycle | Annual |

**Change history**

| Version | Date | Author | Summary |
|---|---|---|---|
| 0.1 | 2026-05-15 | Processminer v2 | Initial draft from SME session |
| 0.2 | 2026-05-18 | A. Vermeulen | SME corrections to routing and R-transactions |

---

## 1. Purpose

This document describes the **SEPA Payments** process: the processing of
outbound euro credit transfers within the Single Euro Payments Area, on both
the standard SEPA Credit Transfer (SCT) and the SEPA Instant (SCT Inst) rails.

The document captures the **current state ("as-is")** of the process as
described by the subject matter expert. It is the basis for later target-state
design.

## 2. Scope

**In scope**

- Outbound SEPA Credit Transfers (SCT) initiated by corporate and retail
  customers.
- Outbound SEPA Instant Credit Transfers (SCT Inst).
- Single payments and bulk / file-based (host-to-host) payment batches.
- Handling of R-transactions (returns, rejects, recalls, refunds).

**Out of scope**

- Inbound SEPA payments and inbound R-transaction handling (PRC-OPS-0174).
- SEPA Direct Debit (SDD) collections.
- Non-euro and non-SEPA cross-border payments (covered by PRC-OPS-0151).
- Card payments.

## 3. Trigger

The process is triggered when **one** of the following occurs:

- A customer submits a euro payment instruction via online or mobile banking,
  **or**
- A corporate customer uploads a payment file via the host-to-host channel,
  **or**
- A branch user captures a payment on the customer's behalf.

## 4. Roles & Responsibilities (RACI)

| Activity | Customer / Channel | Payments Ops | Ops Approver | Compliance | Fraud |
|---|---|---|---|---|---|
| Submit payment instruction | A/R | I | I | I | I |
| Validate instruction (IBAN/BIC, fields) | I | R | I | I | I |
| Funds check & account hold | I | R | I | I | I |
| Sanctions / AML screening | I | C | I | A/R | I |
| Fraud screening | I | C | I | I | A/R |
| Bulk-file release approval (4-eyes) | I | R | A/R | I | I |
| Submit to clearing (CSM) | I | R | I | I | I |
| Confirmation to customer | I | R | I | I | I |
| R-transaction handling | I | A/R | I | C | I |

*R = Responsible, A = Accountable, C = Consulted, I = Informed.*

## 5. Process Steps

### 5.1 Process flow (narrative)

1. **Receive instruction** — The payment instruction arrives at the payment
   hub from one of the channels. Each carries debtor account, creditor IBAN,
   creditor name, BIC (optional for SEPA), amount in EUR, and a remittance
   reference. Bulk files arrive as pain.001 messages.

2. **Validate instruction** — The payment hub checks:
   - Creditor IBAN structure and check digits are valid.
   - The creditor bank is reachable in the SEPA scheme directory.
   - Currency is EUR and the creditor country is in the SEPA zone.
   - Mandatory fields are present; the remittance reference is well-formed.
   - The instruction is not a duplicate of one seen in the last 24 hours.

   *If validation fails →* see Exception E-1.

3. **Funds check & hold** — The debtor account is checked for available
   balance including intraday limits; the amount is earmarked on the account.

   *If funds are insufficient →* see Exception E-2.

4. **Sanctions & AML screening** — Debtor and creditor are screened against
   sanctions lists; the payment is checked by AML transaction monitoring.
   Clean items pass automatically; potential hits route to Compliance.

   *If a hit is confirmed →* see Exception E-3.

5. **Fraud screening** — The payment is scored in real time by the fraud
   engine. Low-risk items pass; high-risk items are held for review.

   *If flagged high-risk →* see Exception E-4.

6. **Routing decision** — The hub selects the rail:
   - **SCT Inst** if the amount is at or below the instant limit
     (currently **EUR 100,000**), the customer elected instant, and the
     creditor bank is instant-reachable.
   - **Standard SCT** otherwise, or if the SCT Inst attempt is declined.
   The standard-SCT cut-off for same-cycle processing is **16:00 CET**.

7. **Debit booking** — The customer account is debited and the held amount
   released into the payment.

8. **Submit to clearing** — The hub generates a pacs.008 message and submits
   it to the clearing and settlement mechanism (CSM): the instant gateway
   (RT1) for SCT Inst, or the batch gateway (STEP2) for standard SCT.

9. **Settlement & confirmation** — For SCT Inst, settlement and the
   beneficiary-bank confirmation complete within 10 seconds; the customer is
   notified immediately. For standard SCT, settlement completes in the next
   STEP2 cycle and the customer sees the payment as executed.

   *If an SCT Inst attempt times out or is rejected →* see Exception E-5.

10. **Reconciliation** — At end of day, submitted payments are reconciled
    against CSM settlement reports; any break is investigated.

### 5.2 Decision points

| ID | Decision | Outcome A | Outcome B |
|---|---|---|---|
| D-1 | Instruction valid & complete? | Continue to D-2 | Exception E-1 |
| D-2 | Sufficient funds? | Continue to D-3 | Exception E-2 |
| D-3 | Sanctions/AML clear? | Continue to D-4 | Exception E-3 |
| D-4 | Fraud score acceptable? | Continue to D-5 | Exception E-4 |
| D-5 | SCT Inst eligible & elected? | Route to SCT Inst | Route to standard SCT |
| D-6 | SCT Inst confirmed in 10s? | Notify customer | Exception E-5 |

## 6. Exceptions & Handling

| ID | Exception | Handling |
|---|---|---|
| E-1 | Invalid IBAN/BIC or incomplete instruction | Payment rejected to the customer with a reason code; correction and resubmission required. |
| E-2 | Insufficient funds | Single payments rejected; bulk-file items queued to next cycle and the customer notified. |
| E-3 | Confirmed sanctions/AML hit | Payment frozen; escalated to Compliance and Financial Crime; release blocked pending investigation. |
| E-4 | High fraud score | Payment held; customer contacted for step-up verification; released or cancelled on the outcome. |
| E-5 | SCT Inst timeout or beneficiary-bank rejection | Auto-fallback to standard SCT where eligible; otherwise returned to the customer. |
| E-6 | Inbound R-transaction (return / recall / refund) | Matched to the original payment; funds re-credited or recall actioned within scheme deadlines. |
| E-7 | Missed cut-off | Standard SCT rolls to the next cycle / next business day; customer informed of the revised execution date. |

## 7. Controls

| Control ID | Control | Type | Frequency |
|---|---|---|---|
| C-1 | IBAN / BIC validation against the scheme directory | Preventive / automated | Every item |
| C-2 | Duplicate-payment detection | Preventive / automated | Every item |
| C-3 | Funds & limit check before debit | Preventive / automated | Every item |
| C-4 | Sanctions & AML screening | Preventive / automated | Every item |
| C-5 | Real-time fraud scoring | Detective / automated | Every item |
| C-6 | 4-eyes release of bulk payment files | Preventive / manual | Per file |
| C-7 | End-of-day reconciliation vs CSM settlement | Detective / manual | Daily |
| C-8 | SCT Inst SLA monitoring (10-second rule) | Detective / automated | Continuous |

## 8. Systems & Data

| System | Role in process |
|---|---|
| Channel platforms (online / mobile / host-to-host) | Capture and submit payment instructions |
| Payment Hub | Validation, routing, orchestration, message generation |
| Core Banking System | Account balances, holds, debit booking |
| Sanctions Screening Engine | Real-time sanctions / AML screening |
| Fraud Engine | Real-time fraud scoring |
| CSM Gateway (STEP2 / RT1) | Clearing and settlement with the SEPA scheme |
| AML Transaction Monitoring | Post-event monitoring and alerting |

**Key inputs:** debtor account, creditor IBAN, creditor name, BIC, amount in
EUR, remittance reference, channel and customer election (instant or standard).

**Key outputs:** pacs.008 submission to the CSM, debit booking, customer
confirmation, settlement reconciliation record.

## 9. Service Levels (SLA)

| Metric | Target |
|---|---|
| SCT Inst end-to-end | Funds available to the beneficiary within 10 seconds |
| Standard SCT (before cut-off) | Executed same business day; settled next STEP2 cycle |
| Standard SCT (after cut-off) | Executed next business day (D+1, per the SEPA rulebook) |
| Exception resolution | Within 1 business day of identification |
| Recall / return action | Within the EPC scheme deadline (10 business days) |
| Standard-SCT cut-off | 16:00 CET |

## 10. Open Questions for SME

> *Captured by Processminer v2 — to be resolved before target-state design.*

- [ ] Is the EUR 100,000 SCT Inst limit a bank-set limit or the scheme maximum?
- [ ] What happens when a bulk file mixes instant-eligible and standard items?
- [ ] Who approves bulk files above the corporate daily aggregate limit?
- [ ] Is SCT Inst offered 24/7, including weekends and holidays?
- [ ] How are positive/negative beneficiary-name-check results handled today?

## 11. Glossary

| Term | Definition |
|---|---|
| SEPA | Single Euro Payments Area — the harmonised euro payment zone. |
| SCT | SEPA Credit Transfer — the standard euro credit-transfer scheme. |
| SCT Inst | SEPA Instant Credit Transfer — settles within 10 seconds. |
| CSM | Clearing and Settlement Mechanism (e.g. STEP2, RT1). |
| IBAN | International Bank Account Number. |
| pacs.008 | The ISO 20022 message that carries a credit transfer to the CSM. |
| pain.001 | The ISO 20022 customer payment-initiation (bulk file) message. |
| R-transaction | A return, reject, recall or refund of a SEPA payment. |
| Cut-off | The deadline for a payment to make the current processing cycle. |

---

*Generated by Processminer v2 — perspective specialists: Operations, Risk &
Controls, Compliance. Orchestrated draft, pending SME approval.*

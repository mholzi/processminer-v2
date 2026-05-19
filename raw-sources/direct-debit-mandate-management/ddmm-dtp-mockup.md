# Direct Debit Mandate Management — Detailed Process Document (DTP)

> **MOCKUP** — Sample input document for a Processminer v2 front-to-back
> walkthrough. Illustrates a "current state" Detailed Process Document handed
> to the documentation engine for ingest. Content is fictional.

---

## Document Control

| Field | Value |
|---|---|
| Document title | Direct Debit Mandate Management — Detailed Process Document |
| Process ID | PRC-OPS-0188 |
| Version | 0.2 (Draft) |
| Status | In review |
| Process owner | Head of Payments Operations |
| Author (SME) | M. Vogel — Senior Payments Operations Analyst |
| Documented by | Processminer v2 |
| Last updated | 2026-05-18 |
| Classification | Internal — Confidential |
| Review cycle | Annual |

**Change history**

| Version | Date | Author | Summary |
|---|---|---|---|
| 0.1 | 2026-05-14 | Processminer v2 | Initial draft from SME session |
| 0.2 | 2026-05-18 | M. Vogel | SME corrections to steps and R-transaction handling |

---

## 1. Purpose

This document describes the **Direct Debit Mandate Management** process: the
operational handling of SEPA Direct Debit (SDD) mandates that the bank
registers and maintains on behalf of its **corporate creditor clients**. A
mandate is the debtor's signed authorisation that allows a creditor to collect
direct debits from the debtor's account.

The document captures the **current state ("as-is")** of the process as
described by the subject matter expert, and is the basis for later
target-state design.

## 2. Scope

**In scope**

- Registration of new SDD mandates submitted by corporate creditor clients.
- Amendment of existing mandates (e.g. IBAN change, creditor name change).
- Cancellation of mandates.
- Handling of mandate-related R-transactions (rejects, refusals).
- Both single-mandate capture and bulk mandate file upload.

**Out of scope**

- The collection of the direct debit payments themselves (covered by
  PRC-OPS-0177, SEPA Collections).
- Onboarding of the corporate creditor and assignment of the Creditor
  Identifier (CI).
- Retail customers acting as creditors.

## 3. Trigger

The process is triggered when **one** of the following occurs:

- A corporate creditor submits a new mandate (or a bulk mandate file) via the
  Creditor Portal, **or**
- A creditor submits a mandate amendment or cancellation request, **or**
- An inbound R-transaction referencing a mandate is received from a debtor
  bank via the payment scheme.

## 4. Roles & Responsibilities (RACI)

| Activity | Creditor Client | Mandate Clerk | Mandate Checker | Compliance | Payments Ops Lead |
|---|---|---|---|---|---|
| Submit mandate request | A/R | I | I | I | I |
| Validate mandate data | I | R | I | I | I |
| Sanctions screening of parties | I | C | I | A/R | I |
| Dual-control check (bulk uploads) | I | R | A/R | I | I |
| Register mandate in MMS | I | R | I | I | I |
| Resolve R-transactions | I | R | C | C | A |
| Confirm to creditor | I | R | I | I | I |

*R = Responsible, A = Accountable, C = Consulted, I = Informed.*

## 5. Process Steps

### 5.1 Process flow (narrative)

1. **Receive request** — A mandate request arrives via the Creditor Portal.
   Each request carries the mandate reference (UMR), creditor identifier (CI),
   debtor name, debtor IBAN, mandate type (recurrent or one-off), and the
   signature date.

2. **Validate mandate data** — The Mandate Clerk checks completeness and
   plausibility:
   - The UMR is unique and well-formed.
   - The debtor IBAN passes checksum and reachability validation.
   - The Creditor Identifier is active for the submitting client.
   - Mandate type and sequence are consistent.

   *If validation fails →* see Exception E-1.

3. **Sanctions screening** — Debtor and creditor names are screened against
   sanctions lists. Clean parties pass automatically. Potential hits are
   routed to Compliance for adjudication.

   *If a hit is confirmed →* see Exception E-2.

4. **Dual-control check** — For bulk mandate file uploads (above 50 mandates),
   a second person (Mandate Checker) independently reviews the batch before it
   is registered. Single-mandate captures skip this step.

5. **Register mandate** — The mandate is created (or amended / cancelled) in
   the Mandate Management System (MMS) and a status of "Active" is set.

6. **Confirm to creditor** — A confirmation is returned to the creditor via
   the portal, including the registered UMR and effective date.

### 5.2 R-transaction handling

When an inbound R-transaction referencing a mandate is received, the Mandate
Clerk identifies the reason code and acts:

- **MD01** (no valid mandate) — the mandate is investigated; if genuinely
  absent, the creditor is notified and the collection is reversed.
- **MD02** (mandate data incorrect / incomplete) — the mandate record is
  corrected and the creditor asked to re-present.
- **AC04** (account closed) — the mandate is set to "Dormant" and the creditor
  notified to obtain a new mandate.
- **SL01** (debtor-requested specific service) — the mandate is flagged with
  the debtor's collection restrictions.

### 5.3 Decision points

| ID | Decision | Outcome A | Outcome B |
|---|---|---|---|
| D-1 | Mandate data valid & complete? | Continue to D-2 | Exception E-1 |
| D-2 | Sanctions screening clear? | Continue to D-3 | Exception E-2 |
| D-3 | Bulk upload above 50 mandates? | Dual-control check required | Skip to registration |
| D-4 | Registration successful in MMS? | Confirm to creditor | Exception E-4 |

## 6. Exceptions & Handling

| ID | Exception | Handling |
|---|---|---|
| E-1 | Invalid or incomplete mandate data | Request returned to creditor via portal with a reason code; resubmission required. |
| E-2 | Confirmed sanctions hit | Mandate frozen; escalated to Compliance and Financial Crime; registration blocked pending investigation. |
| E-3 | Duplicate UMR detected | Request rejected; creditor asked to supply a unique mandate reference. |
| E-4 | MMS registration failure (technical) | Item parked; escalated to Payments Ops Lead and IT support; retried after fix. |

## 7. Controls

| Control ID | Control | Type | Frequency |
|---|---|---|---|
| C-1 | Mandate data validation (IBAN, UMR, CI) | Preventive / automated | Every request |
| C-2 | Sanctions screening of debtor and creditor | Preventive / automated | Every request |
| C-3 | Dual-control on bulk mandate uploads | Preventive / manual | Per bulk file |
| C-4 | Daily reconciliation of MMS vs payment hub mandate store | Detective / manual | Daily |
| C-5 | Periodic review of dormant mandates | Detective / manual | Quarterly |

## 8. Systems & Data

| System | Role in process |
|---|---|
| Creditor Portal | Channel for creditors to submit mandate requests and files |
| Mandate Management System (MMS) | System of record for all mandates |
| Payment Hub | Holds the mandate store used by SEPA collections; receives R-transactions |
| Sanctions Screening Engine | Real-time screening of debtor and creditor names |
| Core Banking System | Debtor account reachability and status checks |

**Key inputs:** UMR, Creditor Identifier, debtor name, debtor IBAN, mandate
type, signature date, bulk mandate files.

**Key outputs:** registered mandate record, creditor confirmation, updated
mandate store, R-transaction resolution.

## 9. Service Levels (SLA)

| Metric | Target |
|---|---|
| Single mandate registration | Within 1 business day of receipt |
| Bulk file processing | Within 2 business days of receipt |
| R-transaction resolution | Within 2 business days of identification |
| Sanctions adjudication (Compliance) | Within 1 business day |

## 10. Open Questions for SME

> *Captured by Processminer v2 — to be resolved before target-state design.*

- [ ] Is the 50-mandate threshold for dual control fixed, or risk-based?
- [ ] How are mandates handled when a creditor's CI is itself deactivated?
- [ ] What is the retention period for cancelled and dormant mandates?
- [ ] Are amendments to a debtor IBAN treated as a new mandate under scheme rules?

## 11. Glossary

| Term | Definition |
|---|---|
| SDD | SEPA Direct Debit — euro direct debit scheme. |
| UMR | Unique Mandate Reference — identifies a single mandate. |
| CI | Creditor Identifier — identifies the creditor in the SEPA scheme. |
| R-transaction | A scheme message rejecting, returning or refusing a collection. |
| Mandate | A debtor's authorisation for a creditor to collect direct debits. |

---

*Generated by Processminer v2 — illustrative current-state input for ingest.*

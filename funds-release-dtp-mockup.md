# Funds Release — Detailed Process Document (DTP)

> **MOCKUP** — Sample output of the Processminer v2 documentation engine.
> Illustrates the structure of a "current state" Detailed Process Document
> produced after an SME brainstorming session. Content is fictional.

---

## Document Control

| Field | Value |
|---|---|
| Document title | Funds Release — Detailed Process Document |
| Process ID | PRC-OPS-0142 |
| Version | 0.3 (Draft) |
| Status | In review |
| Process owner | Head of Payment Operations |
| Author (SME) | J. Becker — Senior Operations Analyst |
| Documented by | Processminer v2 |
| Last updated | 2026-05-16 |
| Classification | Internal — Confidential |
| Review cycle | Annual |

**Change history**

| Version | Date | Author | Summary |
|---|---|---|---|
| 0.1 | 2026-05-12 | Processminer v2 | Initial draft from SME session |
| 0.2 | 2026-05-14 | J. Becker | SME corrections to steps 4–7 |
| 0.3 | 2026-05-16 | Processminer v2 | Added controls and exception handling |

---

## 1. Purpose

This document describes the **Funds Release** process: the controlled release
of funds that are held in a blocked or pending state until all release
conditions — verification, approvals, and compliance checks — have been
satisfied.

The document captures the **current state ("as-is")** of the process as
described by the subject matter expert. It is the basis for later target-state
design.

## 2. Scope

**In scope**

- Release of funds held against an approved corporate credit facility.
- Release following completed beneficiary and sanctions verification.
- Manual and straight-through (STP) release paths.

**Out of scope**

- Origination and approval of the underlying credit facility.
- Retail customer payments.
- Cross-border settlement mechanics (covered by PRC-OPS-0151).

## 3. Trigger

The process is triggered when **one** of the following occurs:

- A drawdown request is received from the front office for an approved
  facility, **or**
- A held payment reaches its scheduled release date, **or**
- An operations analyst manually initiates release of a flagged item.

## 4. Roles & Responsibilities (RACI)

| Activity | Front Office | Ops Analyst | Ops Approver | Compliance | Treasury |
|---|---|---|---|---|---|
| Submit release request | A/R | C | I | I | I |
| Verify request & documents | I | R | I | I | I |
| Sanctions / AML screening | I | C | I | A/R | I |
| First-line approval | I | R | I | I | I |
| Second-line approval (4-eyes) | I | I | A/R | I | I |
| Confirm liquidity / funding | I | I | C | I | A/R |
| Execute release in core system | I | R | I | I | I |
| Confirmation to front office | I | R | I | I | I |

*R = Responsible, A = Accountable, C = Consulted, I = Informed.*

## 5. Process Steps

### 5.1 Process flow (narrative)

1. **Receive request** — The release request arrives in the Operations
   queue via the payments workflow tool. Each item carries a facility ID,
   amount, currency, value date, and beneficiary details.

2. **Validate request** — The Ops Analyst checks completeness:
   - Facility ID exists and is in "Active" status.
   - Requested amount does not exceed the available (undrawn) limit.
   - Value date is a valid business day for the currency.
   - Supporting documents (drawdown notice, invoice) are attached.

   *If validation fails →* see Exception E-1.

3. **Compliance screening** — The item is screened for sanctions and AML
   hits. Clean items pass automatically. Potential hits are routed to
   Compliance for adjudication.

   *If a hit is confirmed →* see Exception E-2.

4. **First-line approval** — The Ops Analyst approves the release after
   confirming validation and screening results.

5. **Liquidity confirmation** — For amounts at or above the Treasury
   threshold (currently **EUR 5,000,000** equivalent), Treasury confirms
   funding availability for the value date.

   *If funding is unavailable →* see Exception E-3.

6. **Second-line approval (4-eyes)** — A separate Ops Approver independently
   reviews and authorises the release. The approver must not be the same
   person who performed step 4.

7. **Execute release** — The approved item is posted in the core banking
   system. Funds move from the held account to the beneficiary instruction.

8. **Confirm & close** — A confirmation is sent to the front office and the
   workflow item is closed. The audit log records all actors and timestamps.

### 5.2 Decision points

| ID | Decision | Outcome A | Outcome B |
|---|---|---|---|
| D-1 | Request valid & complete? | Continue to D-2 | Exception E-1 |
| D-2 | Sanctions/AML clear? | Continue to D-3 | Exception E-2 |
| D-3 | Amount ≥ EUR 5m threshold? | Treasury confirmation required | Skip to 4-eyes approval |
| D-4 | Funding available? | Continue to release | Exception E-3 |
| D-5 | 4-eyes approval granted? | Execute release | Return to Ops Analyst |

## 6. Exceptions & Handling

| ID | Exception | Handling |
|---|---|---|
| E-1 | Incomplete or invalid request | Item returned to front office with reason code; resubmission required. SLA clock pauses. |
| E-2 | Confirmed sanctions/AML hit | Item frozen; escalated to Compliance and Financial Crime; release blocked pending investigation. |
| E-3 | Insufficient funding for value date | Release deferred; Treasury and front office notified; rescheduled to next available value date. |
| E-4 | Approver unavailable / 4-eyes breach | Item parked; escalated to Ops Team Lead for reassignment. |

## 7. Controls

| Control ID | Control | Type | Frequency |
|---|---|---|---|
| C-1 | Limit check against available facility | Preventive / automated | Every item |
| C-2 | Sanctions & AML screening | Preventive / automated | Every item |
| C-3 | Segregation of duties (4-eyes) | Preventive / manual | Every item |
| C-4 | Treasury funding confirmation above threshold | Preventive / manual | Per threshold |
| C-5 | Daily reconciliation of held vs. released balances | Detective / manual | Daily |
| C-6 | Audit log completeness review | Detective | Monthly |

## 8. Systems & Data

| System | Role in process |
|---|---|
| Payments Workflow Tool | Queue, routing, approvals, audit log |
| Core Banking System | Account postings and fund movement |
| Sanctions Screening Engine | Real-time sanctions / AML screening |
| Treasury / Liquidity Platform | Funding availability confirmation |
| Facility Management System | Facility status and available limit |

**Key inputs:** facility ID, amount, currency, value date, beneficiary
details, supporting documents.

**Key outputs:** posted fund movement, front-office confirmation, completed
audit trail.

## 9. Service Levels (SLA)

| Metric | Target |
|---|---|
| STP release (clean item) | Same business day, within 2 hours of receipt |
| Manual release (no exception) | Same business day |
| Exception resolution | Within 1 business day of identification |
| Cut-off for same-day value | 14:00 CET |

## 10. Open Questions for SME

> *Captured by Processminer v2 — to be resolved before target-state design.*

- [ ] Is the EUR 5m Treasury threshold currency-specific or a fixed EUR equivalent?
- [ ] Who acts as backup approver when both nominated approvers are absent?
- [ ] Are partial releases against a single request permitted?
- [ ] How are weekend / holiday value dates currently handled?

## 11. Glossary

| Term | Definition |
|---|---|
| 4-eyes | Dual-control principle; two independent people authorise an action. |
| Drawdown | Utilisation of funds against an approved credit facility. |
| Held funds | Funds reserved but not yet released to a beneficiary. |
| STP | Straight-through processing — no manual intervention. |
| Value date | Date on which the fund movement takes economic effect. |

---

*Generated by Processminer v2 — perspective specialists: Operations, Risk &
Controls, Compliance. Orchestrated draft, pending SME approval.*

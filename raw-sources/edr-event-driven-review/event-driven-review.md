# Event-Driven Review — Detailed Process Document (DTP)

> **MOCKUP** — Sample input document for a Processminer v2 walkthrough.
> Illustrates a short "current state" Detailed Process Document handed to
> the documentation engine for ingest. Content is fictional.

---

## Document Control

| Field | Value |
|---|---|
| Document title | Event-Driven Review — Detailed Process Document |
| Process ID | PRC-AML-0412 |
| Version | 0.1 (Draft) |
| Status | In review |
| Process owner | Head of Financial Crime Operations |
| Author (SME) | M. Holzhauser — Compliance Operations Lead |
| Documented by | Processminer v2 |
| Last updated | 2026-05-20 |
| Classification | Internal — Confidential |
| Review cycle | Annual |

**Change history**

| Version | Date | Author | Summary |
|---|---|---|---|
| 0.1 | 2026-05-20 | Processminer v2 | Initial draft from SME session |

---

## 1. Purpose

This document describes the **Event-Driven Review (EDR)** process: how the
bank re-assesses a customer relationship when an event signals that the
customer's risk profile may have changed. EDR sits between scheduled periodic
KYC reviews — it ensures customer due diligence is refreshed when something
material happens rather than waiting for the next periodic cycle.

The document captures the **current state ("as-is")** of the process as
described by the subject matter expert, and is the basis for later
target-state design.

## 2. Scope

**In scope**

- Retail and corporate customers (excluding correspondent banks).
- Reviews triggered by transaction-monitoring escalations, sanctions / PEP
  screening hits, adverse media hits, fraud incidents, and material customer
  data changes.
- Re-assessment of customer risk rating and refresh of customer due diligence
  (CDD) where required.

**Out of scope**

- Scheduled periodic KYC reviews (covered by PRC-AML-0410, Periodic Review).
- New customer onboarding (covered by PRC-ONB-0101).
- Suspicious-activity reporting to authorities (covered by PRC-AML-0420).
- Account closure due to risk (covered by PRC-RET-0301, Corporate Account
  Closure).

## 3. Trigger

The process is triggered when one of the following **review events** is
raised against a live customer:

- A transaction-monitoring alert is escalated beyond first-line dismissal.
- A sanctions, PEP, or adverse-media screening hit is confirmed.
- A fraud incident closes with the customer still active.
- The customer notifies the bank of a material change (beneficial ownership,
  registered address, employment, source of wealth).
- An external referral (regulator, law enforcement, correspondent bank)
  raises a concern about the customer.

## 4. Roles & Responsibilities (RACI)

| Activity | Customer | Relationship Manager | Financial Crime Analyst (1LoD) | Financial Crime Officer (2LoD) | MLRO |
|---|---|---|---|---|---|
| Raise / escalate review event | I | I | A/R | I | I |
| Refresh CDD / KYC data | C | R | A | C | I |
| Re-screen against sanctions / PEP / adverse media | I | I | R | A | I |
| Re-assess customer risk rating | I | C | R | A | I |
| Approve high-risk rating | I | I | C | R | A |
| Decide further action (retain / exit) | I | C | C | R | A |

*R = Responsible, A = Accountable, C = Consulted, I = Informed.*

## 5. Process Steps

### 5.1 Process flow (narrative)

1. **Capture the event** — When a triggering event is identified, the
   Financial Crime Analyst opens an EDR case in the case-management system.
   Event source, severity, and date are recorded.

2. **Initial assessment** — Within 2 business days the Analyst reviews the
   event in context: transaction history, prior alerts, current risk rating,
   time since last KYC refresh. They decide whether a full CDD refresh is
   needed or whether enhanced monitoring alone is sufficient.

   *If enhanced monitoring only →* record decision, set 90-day review flag,
   close the case.

3. **Request updated information** — Where a CDD refresh is needed, the
   Analyst notifies the Relationship Manager, who contacts the customer to
   gather updated KYC documentation: identity, address, beneficial ownership,
   source of funds / source of wealth, expected activity.

   *If the customer is unresponsive after two chasers →* see Exception E-1.

4. **Re-screen the customer** — Once the data is updated the customer and
   beneficial owners are re-run through sanctions, PEP, and adverse-media
   screening. Hits are dispositioned.

   *If a true sanctions hit is found →* freeze the relationship and hand to
   PRC-AML-0420 (Suspicious Activity Reporting).

5. **Re-assess risk rating** — The Analyst recalculates the customer risk
   rating using the refreshed inputs. The rating is approved by the
   Financial Crime Officer; **high-risk** ratings additionally require MLRO
   sign-off.

6. **Decide further action** — Based on the new rating, the Officer decides
   to retain at standard monitoring, retain at enhanced monitoring, or
   recommend exit. The decision and rationale are recorded.

7. **Close the case** — The case is closed with the decision, the refreshed
   KYC pack, the new risk rating, and the next review date. The customer is
   notified only where the bank is taking customer-facing action.

### 5.2 Decision points

| ID | Decision | Outcome A | Outcome B |
|---|---|---|---|
| D-1 | CDD refresh needed? | Continue to step 3 | Set 90-day enhanced monitoring; close case |
| D-2 | Sanctions hit confirmed? | Hand to PRC-AML-0420 | Continue to risk rating |
| D-3 | New risk rating | Retain (standard or enhanced) | Recommend exit |

## 6. Exceptions & Handling

| ID | Exception | Handling |
|---|---|---|
| E-1 | Customer unresponsive to KYC refresh request | Case escalates to the Financial Crime Officer after the second chaser. The Officer decides between forced restriction (limit outgoing transactions) and exit recommendation. The case SLA pauses while the decision is pending. |
| E-2 | Beneficial owner is now a PEP | Triggers enhanced due diligence (EDD) within the EDR; MLRO sign-off becomes mandatory before closure. |
| E-3 | Source of wealth cannot be evidenced | Case is escalated to MLRO; outcome is typically exit recommendation. |
| E-4 | Customer is deceased / company dissolved | EDR pauses; case is referred to account closure (PRC-RET-0301). |

## 7. Controls

| Control ID | Control | Type | Frequency |
|---|---|---|---|
| C-1 | Mandatory case opened within 2 business days of event | Preventive / system | Every event |
| C-2 | Four-eyes review on every risk-rating change | Detective / manual | Every rating change |
| C-3 | MLRO sign-off on high-risk and exit recommendations | Preventive / manual | Every high-risk or exit case |
| C-4 | Automated re-screening before case closure | Detective / automated | Every case |
| C-5 | Audit log of decisions and rationale | Detective / automated | Every case |

## 8. Systems & Data

| System | Role in process |
|---|---|
| Financial Crime Case Management | System of record for EDR cases |
| Transaction Monitoring | Source of behavioural alerts |
| Sanctions / PEP / Adverse-Media Screening | Re-screening engine |
| KYC Repository | Holds CDD packs and refresh evidence |
| Customer Master | Customer demographics and risk rating of record |

**Key inputs:** trigger event, current risk rating, prior KYC pack,
transaction history.

**Key outputs:** refreshed KYC pack, new risk rating, EDR decision, next
review date.

## 9. Service Levels (SLA)

| Metric | Target |
|---|---|
| Case opened after event | Within 2 business days |
| Customer contacted for refresh | Within 5 business days of case opening |
| Case closed | Within 30 business days of opening (60 for complex EDD) |
| Sanctions-confirmed hit handed off | Same business day |

## 10. Open Questions for SME

> *Captured by Processminer v2 — to be resolved before target-state design.*

- [ ] Should low-confidence adverse-media hits automatically open an EDR or
      stay with enhanced monitoring?
- [ ] Where is the boundary between EDR and a Suspicious Activity Report —
      does an open EDR pause SAR considerations?
- [ ] Can the 2-business-day open SLA be met for non-business-day triggers
      (weekend alerts)?

## 11. Glossary

| Term | Definition |
|---|---|
| CDD | Customer Due Diligence — the KYC information held on a customer. |
| EDD | Enhanced Due Diligence — deeper CDD for high-risk customers. |
| EDR | Event-Driven Review — this process. |
| PEP | Politically Exposed Person. |
| MLRO | Money Laundering Reporting Officer. |
| 1LoD / 2LoD | First / Second Line of Defence. |

---

*Generated by Processminer v2 — illustrative current-state input for ingest.*
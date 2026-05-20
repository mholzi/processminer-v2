# Debit Card Replacement — Detailed Process Document (DTP)

> **MOCKUP** — Sample input document for a Processminer v2 front-to-back
> walkthrough. Illustrates a short "current state" Detailed Process Document
> handed to the documentation engine for ingest. Content is fictional.

---

## Document Control

| Field | Value |
|---|---|
| Document title | Debit Card Replacement — Detailed Process Document |
| Process ID | PRC-RET-0231 |
| Version | 0.2 (Draft) |
| Status | In review |
| Process owner | Head of Retail Card Operations |
| Author (SME) | S. Krause — Card Operations Analyst |
| Documented by | Processminer v2 |
| Last updated | 2026-05-19 |
| Classification | Internal — Confidential |
| Review cycle | Annual |

**Change history**

| Version | Date | Author | Summary |
|---|---|---|---|
| 0.1 | 2026-05-15 | Processminer v2 | Initial draft from SME session |
| 0.2 | 2026-05-19 | S. Krause | SME corrections to blocking and dispatch steps |

---

## 1. Purpose

This document describes the **Debit Card Replacement** process: how the bank
replaces a retail customer's debit card when the existing card has been
**lost, stolen, or physically damaged**. The process takes the customer from
the moment they report the problem through to a new card being produced and
dispatched.

The document captures the **current state ("as-is")** of the process as
described by the subject matter expert, and is the basis for later
target-state design.

## 2. Scope

**In scope**

- Replacement of retail (personal) debit cards reported lost, stolen, or
  damaged.
- Customer-initiated requests through the Contact Centre and the mobile app.
- Blocking the existing card and issuing a like-for-like replacement.

**Out of scope**

- Credit card replacement (covered by PRC-RET-0240).
- New card issuance for new accounts (covered by account onboarding).
- Card product upgrades or changes of card type.
- Fraud investigation and chargebacks (covered by PRC-RET-0255, Card Fraud).

## 3. Trigger

The process is triggered when a retail customer reports, via the Contact
Centre or the mobile app, that their debit card has been **lost, stolen, or
damaged** and requests a replacement.

## 4. Roles & Responsibilities (RACI)

| Activity | Customer | Contact Centre Agent | Card Operations Clerk | Fraud Analyst |
|---|---|---|---|---|
| Report lost/stolen/damaged card | A/R | I | I | I |
| Verify customer identity | I | R | I | I |
| Block existing card | I | R | I | C |
| Assess fraud exposure | I | C | I | A/R |
| Order replacement card | I | I | R | I |
| Confirm dispatch to customer | I | R | C | I |

*R = Responsible, A = Accountable, C = Consulted, I = Informed.*

## 5. Process Steps

### 5.1 Process flow (narrative)

1. **Receive replacement request** — The customer contacts the bank via the
   Contact Centre or raises a request in the mobile app, stating the card is
   lost, stolen, or damaged.

2. **Verify customer identity** — The Contact Centre Agent verifies the
   customer's identity. For phone requests this is knowledge-based
   verification (security questions); in the mobile app the customer is
   already authenticated by login.

   *If identity verification fails →* see Exception E-1.

3. **Block the existing card** — The agent places an immediate block on the
   existing card in the Card Management System so it can no longer be used.
   For lost or stolen cards the block is permanent; for damaged cards the
   block is also applied because the card number is reissued.

4. **Fraud exposure check** — For cards reported **lost or stolen**, the
   request is flagged to the Fraud Analyst, who reviews recent transactions
   for unauthorised activity. Damaged-card requests skip this check.

   *If suspicious transactions are found →* see Exception E-2.

5. **Order replacement card** — The Card Operations Clerk orders a
   like-for-like replacement card. The new card carries a new card number;
   the PIN is unchanged and is not reissued.

6. **Confirm dispatch** — The replacement card is produced by the card bureau
   and dispatched to the customer's registered address. The customer is told
   the expected delivery time (5–7 business days) and that the card must be
   activated on first use.

### 5.2 Decision points

| ID | Decision | Outcome A | Outcome B |
|---|---|---|---|
| D-1 | Identity verified? | Continue to block | Exception E-1 |
| D-2 | Card lost or stolen? | Fraud exposure check | Skip to card order |
| D-3 | Suspicious transactions found? | Exception E-2 | Continue to card order |

## 6. Exceptions & Handling

| ID | Exception | Handling |
|---|---|---|
| E-1 | Identity verification fails | Replacement is not processed on the call; customer is directed to a branch with photo ID. The existing card is still blocked if the customer reports it lost or stolen. |
| E-2 | Suspicious transactions found during fraud check | Request handed to the Card Fraud process (PRC-RET-0255); replacement is held until the fraud case is opened, then resumes. |
| E-3 | Customer's registered address is unconfirmed or stale | Card cannot be dispatched; customer must confirm or update their address before the order is released. |

## 7. Controls

| Control ID | Control | Type | Frequency |
|---|---|---|---|
| C-1 | Customer identity verification before any card action | Preventive / manual | Every request |
| C-2 | Immediate card block on lost/stolen report | Preventive / automated | Every lost/stolen request |
| C-3 | Fraud exposure review on lost/stolen cards | Detective / manual | Every lost/stolen request |
| C-4 | Dispatch only to the registered address on file | Preventive / automated | Every card order |

## 8. Systems & Data

| System | Role in process |
|---|---|
| Card Management System (CMS) | System of record for cards; blocks and orders cards |
| Contact Centre Telephony / CRM | Channel and identity-verification workspace for phone requests |
| Mobile Banking App | Self-service channel for raising a replacement request |
| Card Bureau Interface | Sends production and dispatch instructions to the external card bureau |

**Key inputs:** customer identifier, card number, reported reason (lost /
stolen / damaged), registered address.

**Key outputs:** blocked card, replacement card order, dispatched card,
customer confirmation.

## 9. Service Levels (SLA)

| Metric | Target |
|---|---|
| Card block applied | Immediately during the request |
| Replacement card ordered | Within 1 business day of the request |
| Card delivered to customer | Within 5–7 business days of the order |

## 10. Open Questions for SME

> *Captured by Processminer v2 — to be resolved before target-state design.*

- [ ] Is an expedited / express dispatch option available, and at what cost?
- [ ] Can a customer activate a digital card in the app while waiting for the
      physical card?
- [ ] How is a replacement handled when the customer is travelling abroad?

## 11. Glossary

| Term | Definition |
|---|---|
| CMS | Card Management System — system of record for debit cards. |
| Card bureau | External vendor that physically produces and dispatches cards. |
| Like-for-like | A replacement card of the same product and type as the original. |
| Block | A status that prevents any further use of a card. |

---

*Generated by Processminer v2 — illustrative current-state input for ingest.*

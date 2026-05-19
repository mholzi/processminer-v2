# Corporate Account Closure — Detailed Process Document (DTP)

## Document Control

| Field | Value |
|---|---|
| Document title | Corporate Account Closure — Detailed Process Document |
| Process ID | PRC-OPS-0173 |
| Version | 0.2 (Draft) |
| Status | In review |
| Process owner | Head of Client Lifecycle Operations |
| Author (SME) | A. Vogel — Senior Client Lifecycle Analyst |
| Last updated | 2026-05-18 |
| Classification | Internal — Confidential |
| Review cycle | Annual |

## 1. Purpose

This document describes the Corporate Account Closure process: the controlled offboarding of a corporate client's banking relationship, ending in the closure of all in-scope accounts once outstanding obligations are settled, residual balances are returned, and regulatory record-keeping is in place. It captures the current state ("as-is") as described by the subject matter expert and is the basis for later target-state design.

## 2. Scope

In scope:
- Voluntary closure requested by the corporate client.
- Bank-initiated closure for commercial or risk reasons.
- Closure of current accounts, call accounts and linked sub-accounts.

Out of scope:
- Closure of credit facilities and loans (covered by PRC-CR-0090).
- Closure driven by a confirmed financial-crime exit (covered by PRC-FC-0021).
- Retail customer account closure.

## 3. Trigger

The process is triggered when one of the following occurs:
- A written closure instruction is received from an authorised signatory of the corporate client, or
- The Relationship Manager raises a bank-initiated closure request following a commercial or risk review, or
- A dormancy review flags an account inactive beyond the dormancy threshold and recommends closure.

The process runs at a volume of roughly 30 corporate closures per week.

## 4. Roles & Responsibilities (RACI)

| Activity | Relationship Mgr | Closure Analyst | Closure Approver | Compliance | Finance |
|---|---|---|---|---|---|
| Receive & log closure request | A/R | C | I | I | I |
| Verify mandate & authority | I | R | I | C | I |
| Outstanding obligations check | I | R | I | I | C |
| Compliance & sanctions check | I | C | I | A/R | I |
| Residual balance disbursement | I | R | C | I | A/R |
| Closure approval (4-eyes) | I | I | A/R | I | I |
| Execute closure in core system | I | R | I | I | I |
| Client confirmation & archiving | A | R | I | I | I |

## 5. Process Steps

1. Receive & log request — The closure request arrives via the Relationship Manager or the client portal. The Closure Analyst logs it in the Client Lifecycle workflow tool with a closure reason code.

2. Verify mandate & authority — The Closure Analyst confirms the request comes from an authorised signatory by checking the account mandate. If authority cannot be confirmed, see Exception E-1.

3. Outstanding obligations check — The analyst checks for unsettled items: pending payments, uncleared cheques, fees due, and linked products with a balance. Finance confirms there are no open accounting items. If obligations are outstanding, see Exception E-2.

4. Compliance & sanctions check — The client and account are screened for sanctions exposure and any open compliance case. An open case blocks closure until cleared. If a compliance case is open, see Exception E-3.

5. Residual balance disbursement — Any credit balance is returned to the client's nominated account. Disbursements at or above the verification threshold (currently EUR 250,000 equivalent) require a callback confirmation of the destination account with the client.

6. Closure approval (4-eyes) — A separate Closure Approver independently reviews the file and authorises the closure. The approver must not be the analyst who performed steps 2-5.

7. Execute closure — The accounts are set to "Closed" in the core banking system; cards and payment instruments linked to the accounts are cancelled.

8. Confirm & archive — A closure confirmation is sent to the client. The account file is archived and retained per the record-retention schedule.

## 6. Exceptions & Handling

| ID | Exception | Handling |
|---|---|---|
| E-1 | Signatory authority not confirmed | Request returned to Relationship Manager; correct authorisation requested from the client. SLA clock pauses. |
| E-2 | Outstanding obligations remain | Closure suspended; client notified of items to settle; closure resumes once cleared. |
| E-3 | Open compliance case | Closure blocked; routed to Compliance; closure cannot proceed until the case is closed. |
| E-4 | Residual balance cannot be disbursed | Balance moved to a suspense account; treated as unclaimed funds per policy. |

## 7. Controls

| Control ID | Control | Type | Frequency |
|---|---|---|---|
| C-1 | Mandate / signatory authority verification | Preventive / manual | Every closure |
| C-2 | Outstanding obligations & accounting clearance | Preventive / manual | Every closure |
| C-3 | Sanctions & compliance-case screening | Preventive / automated | Every closure |
| C-4 | Callback confirmation for large disbursements | Preventive / manual | Per threshold |
| C-5 | Segregation of duties (4-eyes closure approval) | Preventive / manual | Every closure |
| C-6 | Post-closure reconciliation of closed-account balances | Detective / manual | Daily |
| C-7 | Record-retention completeness review | Detective | Quarterly |

## 8. Systems & Data

| System | Role in process |
|---|---|
| Client Lifecycle Workflow Tool | Request logging, routing, approvals, audit log |
| Core Banking System | Account status change, instrument cancellation |
| Sanctions Screening Engine | Sanctions and compliance-case screening |
| Payments Platform | Residual balance disbursement |
| Records Archive | Retention and archiving of the closed account file |

## 9. Service Levels (SLA)

| Metric | Target |
|---|---|
| Acknowledge closure request | Within 1 business day |
| Standard closure (no exception) | Within 10 business days |
| Exception resolution | Within 5 business days of identification |
| Residual balance disbursement | Within 3 business days of closure |

## 10. Open Questions for SME

- Is the EUR 250k callback threshold a fixed EUR equivalent or per-currency?
- What is the dormancy threshold that triggers a closure recommendation?
- How long are closed-account files retained, and where?
- Can a closure be reversed once executed, and within what window?
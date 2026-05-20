# Bank Guarantee Issuance — Process Description (v1)

*Operations handbook extract. Corporate Trade Finance. Internal use only.*

## Purpose and scope

This process covers the issuance of a Bank Guarantee (BG) on behalf of a corporate client in favour of a third-party beneficiary. It begins when a client submits a guarantee application and ends when the executed guarantee is delivered to the beneficiary and the client's facility is updated. It does not cover guarantee amendments, claims or cancellations, which are separate processes.

## Trigger

A corporate client submits a Bank Guarantee application through the Corporate Portal, or via a relationship manager who keys it into the portal on the client's behalf.

## Process steps

1. **Application intake.** The Trade Finance Officer receives the application and checks it is complete: beneficiary details, guarantee amount, currency, wording type (standard or bespoke), validity period and the underlying commercial contract reference.

2. **Credit and facility check.** The Trade Finance Officer confirms the client holds an approved guarantee facility with sufficient available limit. If the limit is insufficient, the application is parked and routed to the Credit team — this is the most common reason for delay.

3. **Wording review.** Standard-wording guarantees proceed directly. Bespoke wording is sent to the Legal team for review and sign-off before issuance.

4. **Sanctions and compliance screening.** The Compliance Analyst screens the beneficiary and the beneficiary's country against the sanctions list. A screening hit suspends the application pending Compliance investigation.

5. **Issuance approval.** A Trade Finance Manager reviews the assembled package and approves issuance. Guarantees above EUR 5 million additionally require sign-off by the Head of Trade Finance.

6. **Guarantee generation and delivery.** The Trade Finance Officer generates the guarantee instrument in the Trade Finance System and the guarantee is transmitted to the beneficiary's bank via SWIFT. The client's facility utilisation is updated.

## Standard service level

The target turnaround is 3 business days from a complete application to guarantee delivery, measured for standard-wording guarantees with no screening hit.

## Roles

- **Trade Finance Officer** — intake, checks, generation and delivery.
- **Trade Finance Manager** — issuance approval.
- **Head of Trade Finance** — additional approval for guarantees above EUR 5 million.
- **Compliance Analyst** — sanctions and compliance screening.
- **Credit team** — limit increases when the facility is insufficient.
- **Legal team** — bespoke wording review.

## Controls

- **C1 — Four-eyes issuance approval.** No guarantee is issued without a Trade Finance Manager's approval, recorded in the Trade Finance System. Control owner: Trade Finance Manager.
- **C2 — Sanctions screening.** Every beneficiary is screened before issuance; the screening result is attached to the application. Control owner: Compliance Analyst.
- **C3 — Facility limit check.** Issuance is blocked in the Trade Finance System unless available facility limit covers the guarantee amount.

## Regulatory context

The process is subject to anti-money-laundering and sanctions obligations (EU sanctions regulations, AML directives). Bank guarantees follow the ICC Uniform Rules for Demand Guarantees (URDG 758) where the guarantee is issued on demand terms.

## Systems

- **Corporate Portal** — client-facing application capture.
- **Trade Finance System** — the system of record for guarantee instruments, approvals and facility utilisation.
- **Sanctions Screening Tool** — used by Compliance for beneficiary screening.
- **SWIFT** — transmission of the executed guarantee to the beneficiary's bank.

## Known pain points

Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit. Bespoke wording adds unpredictable delay because Legal review has no committed turnaround.
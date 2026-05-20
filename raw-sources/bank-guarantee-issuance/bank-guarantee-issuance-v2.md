# Bank Guarantee Issuance — Process Description (v2, revised)

*Operations handbook extract. Corporate Trade Finance. Internal use only. This revision supersedes the earlier version and records process changes agreed in the last operations review.*

## Purpose and scope

This process covers the issuance of a Bank Guarantee (BG) on behalf of a corporate client in favour of a third-party beneficiary. It begins when a client submits a guarantee application and ends when the executed guarantee is delivered to the beneficiary and the client's facility is updated.

## Trigger

A corporate client submits a Bank Guarantee application through the Corporate Portal, or via a relationship manager who keys it into the portal on the client's behalf.

## Process steps

1. **Application intake.** The Trade Finance Officer receives the application and checks it is complete: beneficiary details, guarantee amount, currency, wording type, validity period and the underlying commercial contract reference.

2. **Credit and facility check.** The Trade Finance Officer confirms the client holds an approved guarantee facility with sufficient available limit.

3. **Wording review.** Standard-wording guarantees proceed directly. Bespoke wording is sent to the Legal team for review and sign-off.

4. **Sanctions and compliance screening.** The Compliance Analyst screens the beneficiary and the beneficiary's country against the sanctions list.

5. **Collateral confirmation.** *(New mandatory step.)* For guarantees not fully covered by an approved facility, the Trade Finance Officer confirms that cash collateral has been received and blocked before issuance can proceed. This step is now mandatory for every partially-secured guarantee.

6. **Issuance approval.** A Trade Finance Manager reviews the assembled package and approves issuance. Guarantees above EUR 2 million additionally require sign-off by the Head of Trade Finance.

7. **Guarantee generation and delivery.** The Trade Finance Officer generates the guarantee instrument in the Trade Finance System and the guarantee is transmitted to the beneficiary's bank via SWIFT. The client's facility utilisation is updated.

## Standard service level

The target turnaround is 5 business days from a complete application to guarantee delivery. The previous 3-day target was found to be unrealistic once collateral confirmation is included.

## Roles

- **Trade Finance Officer** — intake, checks, collateral confirmation, generation and delivery.
- **Trade Finance Manager** — issuance approval.
- **Head of Trade Finance** — additional approval for guarantees above EUR 2 million.
- **Compliance Analyst** — sanctions and compliance screening.
- **Credit team** — limit increases when the facility is insufficient.
- **Legal team** — bespoke wording review.

## Controls

- **C1 — Four-eyes issuance approval.** No guarantee is issued without a Trade Finance Manager's approval, recorded in the Trade Finance System. Control owner: Head of Trade Finance.
- **C2 — Sanctions screening.** Every beneficiary is screened before issuance. Control owner: Compliance Analyst.
- **C3 — Facility limit check.** Issuance is blocked in the Trade Finance System unless available facility limit covers the guarantee amount.
- **C4 — Collateral block confirmation.** For partially-secured guarantees, cash collateral must be confirmed received and blocked before issuance. Control owner: Trade Finance Officer.

## Regulatory context

The process is subject to anti-money-laundering and sanctions obligations (EU sanctions regulations, AML directives). Bank guarantees follow the ICC Uniform Rules for Demand Guarantees (URDG 758).

## Systems

- **Corporate Portal** — client-facing application capture.
- **Trade Finance System** — the system of record for guarantee instruments, approvals and facility utilisation.
- **Sanctions Screening Tool** — used by Compliance for beneficiary screening.
- **SWIFT** — transmission of the executed guarantee to the beneficiary's bank.

## Known pain points

Applications frequently stall at the credit and facility check when the client has not pre-arranged enough limit.
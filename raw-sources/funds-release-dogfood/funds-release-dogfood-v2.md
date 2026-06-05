# Funds Release — Process Description (v2, revised)

*Operations handbook extract. Payment Operations. Internal use only.
This revision supersedes the earlier version and records process changes
agreed in the last operations review.*

## Purpose and scope

This process covers the controlled release of funds held in a blocked or
pending state, once all verification, approval and compliance conditions have
been satisfied. It begins when a release is triggered and ends when the funds
are posted and the front office is confirmed.

## Trigger

The process is triggered when one of the following occurs: a drawdown request
is received from the front office for an approved facility; a held payment
reaches its scheduled release date; or an Operations Analyst manually initiates
release of a flagged item.

## Process steps

1. **Receive request.** The release request arrives in the Operations queue via
   the Payments Workflow Tool. Each item carries a facility ID, amount,
   currency, value date and beneficiary details.

2. **Validate request.** The Operations Analyst checks completeness of the
   facility ID, amount, value date and supporting documents.

3. **Compliance screening.** The item is screened for sanctions and AML hits.
   Clean items pass automatically; potential hits are routed to Compliance.

4. **First-line approval.** The Operations Analyst approves the release after
   confirming validation and screening results.

5. **Beneficiary callback verification.** *(New mandatory step.)* For every
   manual release, and for any release to a beneficiary used for the first
   time, the Operations Analyst must perform an independent callback to confirm
   the beneficiary account details before the release can proceed. This step is
   now mandatory and must be evidenced in the workflow item.

6. **Liquidity confirmation.** For amounts at or above the Treasury threshold
   (now **EUR 2,000,000** equivalent), Treasury confirms funding availability
   for the value date.

7. **Second-line approval (4-eyes).** A separate Operations Approver
   independently reviews and authorises the release.

8. **Execute release.** The approved item is posted in the Core Banking System.
   Funds move from the held account to the beneficiary instruction.

9. **Confirm and close.** A confirmation is sent to the front office and the
   workflow item is closed.

## Standard service level

The target for a clean STP release is **same business day, within 4 hours** of
receipt. The previous 2-hour target was found to be unrealistic once callback
verification is included. Exception resolution targets within 1 business day.
The cut-off for same-day value is now **12:00 CET**.

## Roles

- **Operations Analyst** — intake, validation, callback verification,
  first-line approval, execution and confirmation.
- **Operations Approver** — independent second-line (4-eyes) authorisation.
- **Treasury** — funding availability confirmation above the threshold.
- **Compliance** — sanctions and AML adjudication.
- **Front Office** — submits drawdown requests; receives confirmation.
- **Operations Team Lead** — reassignment and escalation.

## Controls

- **C-1 — Facility limit check.** Release is blocked unless the available
  facility limit covers the requested amount. Preventive / automated. Control
  owner: **Operations Analyst**.
- **C-2 — Sanctions and AML screening.** Every item is screened before release.
  Preventive / automated. Control owner: **Compliance**.
- **C-3 — Segregation of duties (4-eyes).** First-line and second-line approval
  must be performed by different people. Preventive / manual. Control owner:
  **Head of Payment Operations**.
- **C-4 — Treasury funding confirmation.** For amounts above the threshold,
  Treasury confirms funding before release. Preventive / manual. Control owner:
  **Treasury**.
- **C-5 — Daily reconciliation of held vs. released balances.** Detective /
  manual. Control owner: **Operations Team Lead**.
- **C-6 — Beneficiary callback verification.** For manual releases and
  first-time beneficiaries, an independent callback confirms account details
  before release. Preventive / manual. Control owner: **Operations Analyst**.

## Regulatory context

The process is subject to anti-money-laundering and sanctions obligations
(EU sanctions regulations, AML directives). Payment execution and operational
resilience expectations apply (e.g. the EU Funds Transfer Regulation for payer
/ payee information, and operational-risk controls).

## Systems

- **Payments Workflow Tool** — queue, routing, approvals and audit log.
- **Core Banking System** — account postings and fund movement.
- **Sanctions Screening Engine** — real-time sanctions / AML screening.
- **Treasury / Liquidity Platform** — funding availability confirmation.
- **Facility Management System** — facility status and available limit.

## Known pain points

Items frequently stall at validation when the front office submits an
incomplete request or an inactive facility ID.
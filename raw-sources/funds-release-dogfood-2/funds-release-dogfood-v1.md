# Funds Release — Process Description (v1)

*Operations handbook extract. Payment Operations. Internal use only.*

## Purpose and scope

This process covers the controlled release of funds held in a blocked or
pending state, once all verification, approval and compliance conditions have
been satisfied. It begins when a release is triggered and ends when the funds
are posted and the front office is confirmed. It covers release against an
approved corporate credit facility and both manual and straight-through (STP)
paths. It does not cover origination or approval of the underlying facility,
retail customer payments, or cross-border settlement mechanics, which are
separate processes.

## Trigger

The process is triggered when one of the following occurs: a drawdown request
is received from the front office for an approved facility; a held payment
reaches its scheduled release date; or an Operations Analyst manually initiates
release of a flagged item.

## Process steps

1. **Receive request.** The release request arrives in the Operations queue via
   the Payments Workflow Tool. Each item carries a facility ID, amount,
   currency, value date and beneficiary details.

2. **Validate request.** The Operations Analyst checks completeness: the
   facility ID exists and is in "Active" status, the requested amount does not
   exceed the available undrawn limit, the value date is a valid business day,
   and the supporting documents are attached. Incomplete requests are returned
   to the front office — this is the most common reason for delay.

3. **Compliance screening.** The item is screened for sanctions and AML hits.
   Clean items pass automatically; potential hits are routed to Compliance for
   adjudication. A confirmed hit freezes the item pending investigation.

4. **First-line approval.** The Operations Analyst approves the release after
   confirming validation and screening results.

5. **Liquidity confirmation.** For amounts at or above the Treasury threshold
   (currently **EUR 5,000,000** equivalent), Treasury confirms funding
   availability for the value date. If funding is unavailable the release is
   deferred and rescheduled to the next available value date.

6. **Second-line approval (4-eyes).** A separate Operations Approver
   independently reviews and authorises the release. The approver must not be
   the same person who performed the first-line approval.

7. **Execute release.** The approved item is posted in the Core Banking System.
   Funds move from the held account to the beneficiary instruction.

8. **Confirm and close.** A confirmation is sent to the front office and the
   workflow item is closed. The audit log records all actors and timestamps.

## Standard service level

The target for a clean STP release is **same business day, within 2 hours** of
receipt. Manual releases with no exception complete same business day.
Exception resolution targets **within 1 business day** of identification. The
cut-off for same-day value is **14:00 CET**.

## Roles

- **Operations Analyst** — intake, validation, first-line approval, execution
  and confirmation.
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
  **Operations Approver**.
- **C-4 — Treasury funding confirmation.** For amounts above the threshold,
  Treasury confirms funding before release. Preventive / manual. Control owner:
  **Treasury**.
- **C-5 — Daily reconciliation of held vs. released balances.** Detective /
  manual. Control owner: **Operations Team Lead**.

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
incomplete request or an inactive facility ID. Same-day value is at risk when a
request arrives close to the 14:00 cut-off and still needs Treasury
confirmation.
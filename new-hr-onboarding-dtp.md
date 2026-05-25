# Desktop Procedure — New HR Onboarding

| Field | Value |
|---|---|
| Document ID | DTP-NHO-001 |
| Process | New HR Onboarding |
| Version | 0.1 (Draft) |
| Owner | Head of HR Operations |
| Approver | Chief People Officer |
| Effective date | TBC |
| Review cycle | Annually, or on material change |

---

## 1. Purpose

This Desktop Procedure (DTP) provides the step-by-step instructions for HR Operations, IT, Facilities and Hiring Managers to onboard a newly hired employee — from signed offer to fully productive on the job. It ensures every new hire is set up consistently, compliantly and on time.

## 2. Scope

**In scope**
- Permanent and fixed-term employees joining the organisation
- All locations and business units
- Pre-boarding (offer accepted) through to end of probation review

**Out of scope**
- Contractors, contingent workers and agency staff (covered by DTP-CWO-001)
- Internal transfers and promotions (covered by DTP-IMV-001)
- Re-hires within 12 months (abbreviated flow — see §10)

## 3. Roles and responsibilities

| Role | Responsibility |
|---|---|
| **Hiring Manager** | Raise onboarding ticket, define role profile, approve equipment list, run first-week induction, complete 30/60/90-day check-ins |
| **HR Operations** | Own end-to-end orchestration, issue contract, collect documents, create employee record, trigger downstream provisioning |
| **HR Business Partner** | Sign off compensation, benefits enrolment, exceptions |
| **IT Service Desk** | Provision accounts, devices, access entitlements per role template |
| **Facilities** | Allocate desk/locker, issue building pass, parking if applicable |
| **Compliance / Risk** | Background screening, regulatory references, sanctions/PEP checks |
| **Payroll** | Set up payroll record, tax forms, benefits deductions |
| **Learning & Development** | Assign mandatory training curriculum, track completion |
| **New Hire** | Provide documentation, complete pre-boarding tasks, attend induction, complete mandatory training |

## 4. Prerequisites

Before starting this procedure the following must be true:

- [ ] Signed offer letter on file
- [ ] Approved requisition (REQ-####) closed in the ATS
- [ ] Start date confirmed in writing
- [ ] Role profile and reporting line documented
- [ ] Hiring manager has raised onboarding ticket (HR-####)

## 5. Systems and tools

| System | Used for |
|---|---|
| Workday (HRIS) | Employee master record, org structure, comp |
| Greenhouse (ATS) | Candidate-to-hire handover |
| ServiceNow | Onboarding ticket, IT/Facilities fulfilment |
| HireRight | Background screening |
| Okta / AD | Identity and SSO provisioning |
| Intune / Jamf | Device enrolment |
| Cornerstone (LMS) | Mandatory training assignments |
| DocuSign | Contract and policy acknowledgements |

## 6. Procedure

### Phase 1 — Pre-boarding (Offer accepted → T-10 working days)

| # | Step | Owner | SLA |
|---|---|---|---|
| 1.1 | Trigger onboarding workflow in Workday from accepted offer | HR Ops | T-10 |
| 1.2 | Send welcome email with pre-boarding portal link | HR Ops | T-10 |
| 1.3 | Initiate background and right-to-work checks via HireRight | Compliance | T-10 |
| 1.4 | Collect signed contract, ID, tax and bank details via DocuSign | HR Ops | T-7 |
| 1.5 | Confirm equipment list with hiring manager (role template + exceptions) | Hiring Manager | T-7 |
| 1.6 | Raise IT, Facilities and L&D sub-tickets in ServiceNow | HR Ops | T-7 |
| 1.7 | Create employee record in Workday; assign employee ID | HR Ops | T-5 |
| 1.8 | Provision Okta account, email, role-based access entitlements | IT | T-3 |
| 1.9 | Ship device pre-imaged and enrolled in MDM | IT | T-2 |
| 1.10 | Confirm desk, building pass and parking | Facilities | T-2 |
| 1.11 | Send Day-1 logistics email (arrival time, location, dress code, contact) | HR Ops | T-2 |
| 1.12 | Final go/no-go check: background clear, contract signed, kit shipped | HR Ops | T-1 |

### Phase 2 — Day 1

| # | Step | Owner |
|---|---|---|
| 2.1 | Greet new hire, complete I-9 / right-to-work verification in person | HR Ops |
| 2.2 | Issue building pass and complete H&S walk-through | Facilities |
| 2.3 | First login, MFA enrolment, password reset | IT / New Hire |
| 2.4 | Manager 1:1 — role expectations, team intros, first-week plan | Hiring Manager |
| 2.5 | Assign mandatory training in LMS (Code of Conduct, InfoSec, AML, Data Privacy) | L&D |
| 2.6 | Acknowledge policy pack in DocuSign | New Hire |

### Phase 3 — Week 1

| # | Step | Owner | Target |
|---|---|---|---|
| 3.1 | Complete mandatory training Tier 1 (Code of Conduct, InfoSec, Data Privacy) | New Hire | Day 5 |
| 3.2 | Benefits enrolment window opens | HR Ops / New Hire | Day 5 |
| 3.3 | Assign buddy / onboarding peer | Hiring Manager | Day 2 |
| 3.4 | Confirm payroll record active; verify first pay cycle alignment | Payroll | Day 5 |
| 3.5 | Validate access — all role-required systems reachable; raise exceptions | New Hire / IT | Day 5 |

### Phase 4 — First 30 days

| # | Step | Owner | Target |
|---|---|---|---|
| 4.1 | Complete role-specific training and certifications | New Hire | Day 30 |
| 4.2 | 30-day check-in with hiring manager; documented in Workday | Hiring Manager | Day 30 |
| 4.3 | HR onboarding pulse survey | HR Ops | Day 30 |

### Phase 5 — Days 60 and 90

| # | Step | Owner | Target |
|---|---|---|---|
| 5.1 | 60-day check-in: goals set in performance system | Hiring Manager | Day 60 |
| 5.2 | 90-day probation review and confirmation decision | Hiring Manager / HRBP | Day 90 |
| 5.3 | Close onboarding ticket; archive evidence | HR Ops | Day 95 |

## 7. Controls

| Control ID | Description | Frequency | Evidence |
|---|---|---|---|
| CTL-NHO-01 | No system access provisioned before background screening returns "clear" | Per hire | HireRight report + IT provisioning timestamp |
| CTL-NHO-02 | Mandatory training Tier 1 completion enforced before access to production systems | Per hire | LMS completion record |
| CTL-NHO-03 | Right-to-work / I-9 verified on or before Day 1 | Per hire | Signed I-9 / RTW form in employee file |
| CTL-NHO-04 | Role-based access reviewed and approved by line manager before grant | Per hire | ServiceNow approval audit trail |
| CTL-NHO-05 | Segregation of duties: HR Ops cannot self-approve own compensation entries | Continuous | Workday config + quarterly access review |
| CTL-NHO-06 | Probation decision documented within 95 days of start | Per hire | Workday probation record |

## 8. Exceptions

| Scenario | Handling |
|---|---|
| Background check returns adverse finding | Escalate to HRBP + Compliance; pause provisioning; follow adverse-action procedure |
| New hire no-show on Day 1 | HR Ops contacts within 2 hours; if no response within 24h, follow withdrawal procedure; revoke pre-issued access |
| Equipment delayed beyond Day 1 | Issue loaner kit from local hub; track shortage with IT |
| Right-to-work documentation incomplete | Do not start employment; HR Ops works with candidate to resolve before revised start date |
| Late contract signature (< T-3) | Manager + HRBP approve expedited flow; document in exception log |
| Cross-border / visa-sponsored hire | Add Phase 0 — visa/work permit verification before Phase 1 starts |

## 9. Metrics and SLAs

| Metric | Target |
|---|---|
| Time-to-productivity (self-assessed at 90d) | ≥ 80% rate "productive" or better |
| Day-1 readiness (laptop, access, desk all in place) | ≥ 95% |
| Mandatory training Tier 1 completion by Day 5 | 100% |
| Onboarding ticket cycle time | ≤ 12 working days end-to-end |
| New-hire 90-day attrition | ≤ 5% |
| Onboarding NPS (30-day survey) | ≥ +40 |

## 10. Variants

- **Re-hire within 12 months** — skip background re-screen if prior screen < 12 months old; reuse employee ID; abbreviated induction
- **Internal transfer** — see DTP-IMV-001 (Internal Movement)
- **Senior leader (VP+)** — adds executive onboarding track with stakeholder mapping and board introductions

## 11. Related documents

- POL-HR-001 — Recruitment and Selection Policy
- POL-IS-002 — Acceptable Use Policy
- POL-DP-003 — Data Privacy Policy (Employee Data)
- DTP-CWO-001 — Contingent Worker Onboarding
- DTP-IMV-001 — Internal Movement
- DTP-OFB-001 — Offboarding

## 12. Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-05-25 | (Draft) | Initial draft |

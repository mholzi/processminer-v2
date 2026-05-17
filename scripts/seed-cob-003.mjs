// Seed the Karpathy LLM-Wiki (layer 2) with process COB-003 — Client Onboarding.
// Slice-1 fixture: data from v1 (mholzi/Processminer, process 003), organised
// into the v2 four-area structure. Every element carries named prose blocks
// (## Heading) so it is self-explanatory for an SME reading it cold. In slice 2
// the QER agent + E1 ingest produce these pages instead.
// Re-runnable: overwrites wiki/processes/cob-003/.
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const WIKI = join(ROOT, "wiki", "processes", "cob-003");
rmSync(WIKI, { recursive: true, force: true });
const SOURCE = "DTP-BB-ONB-001 v2.3";

function page(rel, frontmatter, body) {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(", ")}]` : v}`)
    .join("\n");
  const full = join(WIKI, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, `---\n${fm}\n---\n${body.trim()}\n`);
}
const base = (id, type, section, title) => ({
  id, type, section, title, status: "confirmed", confidence: "high", source: SOURCE,
});
// Build a body of named prose blocks from [heading, text] pairs.
const blocks = (...pairs) =>
  pairs.map(([h, t]) => `## ${h}\n${t.trim()}`).join("\n\n");

// ── Process overview (Steckbrief in frontmatter, purpose in body) ─────────
page("index.md", {
  ...base("COB-003", "process", "overview", "Client Onboarding (BizBanking)"),
  processOwner: "ROLE-COB-005",
  trigger: "Online portal · RM paper application · Branch referral · Partner channel",
  frequency: "Continuous during business hours, real-time processing",
  scopeIn: "KYC identity verification, regulatory screening (AML/PEP/Sanctions), risk assessment, optional credit facility, account setup, activation",
  scopeOut: "Ongoing account servicing, product cross-selling, existing-client changes, offboarding",
  processInput: "Client application + required business documents",
  processOutput: "Fully operational business account (optionally incl. overdraft facility)",
  docStatus: "As-Is validated",
}, `
The Client Onboarding process establishes a new banking relationship with a
business client (annual turnover up to €10M). It takes the client from a
submitted application through to a fully operational account: collecting and
validating their information, verifying identity, screening for regulatory
risk, assessing credit where an overdraft is requested, configuring the
account, and activating the client.

It is a revenue-generating and a regulatory process at the same time — every
new account is both a commercial relationship and a compliance obligation.
That dual nature shapes every step that follows.
`);

// ── AS-IS · Process steps ─────────────────────────────────────────────────
const steps = [
  {
    id: "PS-COB-001", seq: 1, title: "Application Receipt & Initial Triage",
    owner: "Operations Officer", sla: "Same business day",
    systems: ["SYS-COB-001", "SYS-COB-002", "SYS-COB-007"],
    blocks: [
      ["What happens", "The Operations Officer receives the incoming application from one of the four intake channels and performs an initial triage. They confirm the mandatory documents are present, that the business is eligible for BizBanking, and that the case is routed to the correct downstream queue. Incomplete applications are flagged and returned to the client before they consume pipeline capacity."],
      ["Inputs", "A submitted client application (online portal, paper, branch referral or partner channel) together with whatever supporting documents the client attached."],
      ["Outputs", "A triaged application that has formally entered the pipeline with a CRM case record — or a rejection sent back to the client listing exactly what was missing."],
      ["Why it matters", "This is the gate that protects the rest of the process. Catching an incomplete or ineligible application here costs minutes; catching it three steps later costs days of rework and a frustrated client."],
    ],
  },
  {
    id: "PS-COB-002", seq: 2, title: "KYC & Identity Verification",
    owner: "KYC Analyst", sla: "2-5 business days",
    systems: ["SYS-COB-003", "SYS-COB-004"],
    blocks: [
      ["What happens", "The KYC Analyst verifies the identity of the business and its beneficial owners, runs regulatory screening for PEP, sanctions and adverse-media risk, and assigns a customer risk rating. Documents are checked against the KYC platform; any screening match is escalated to Compliance."],
      ["Inputs", "The triaged application, identity documents for directors and ultimate beneficial owners, and the company's ownership structure."],
      ["Outputs", "A completed KYC file with a risk rating and cleared screening — or an escalation case handed to the Compliance Officer."],
      ["Why it matters", "This step carries the bank's regulatory exposure. A missed screening hit or an unverified beneficial owner is a reportable compliance breach, not merely a process error."],
    ],
  },
  {
    id: "PS-COB-003", seq: 3, title: "Credit Assessment",
    owner: "Credit Analyst", sla: "3 business days", condition: "If overdraft requested",
    systems: ["SYS-COB-006"],
    blocks: [
      ["What happens", "When the client has requested an overdraft facility, the Credit Analyst assesses creditworthiness using the credit decisioning system and external bureau data, applies the scorecard, and reaches a decision within their approval authority."],
      ["Inputs", "The cleared KYC file plus the client's requested facility amount and financial information."],
      ["Outputs", "An approved credit limit, a decline, or a referral to a higher approval authority."],
      ["Why it matters", "Responsible lending and credit-risk management. This step runs only when an overdraft is requested — for deposit-only onboarding it is skipped entirely."],
    ],
  },
  {
    id: "PS-COB-004", seq: 4, title: "Account Setup & Configuration",
    owner: "Operations Officer", sla: "1 business day",
    systems: ["SYS-COB-005", "SYS-COB-008"],
    blocks: [
      ["What happens", "The Operations Officer creates the account in the core banking system, configures the agreed products, and triggers debit-card provisioning. A four-eyes check confirms the configuration before the account goes live."],
      ["Inputs", "The approved KYC file and, where applicable, the credit decision."],
      ["Outputs", "A live, fully configured business account ready to transact, with debit cards ordered."],
      ["Why it matters", "This is where the relationship becomes real. Configuration errors here surface as transaction failures the client sees on their very first day."],
    ],
  },
  {
    id: "PS-COB-005", seq: 5, title: "Client Communication & Activation",
    owner: "Relationship Manager", sla: "1 business day",
    systems: ["SYS-COB-001"],
    blocks: [
      ["What happens", "The Relationship Manager tells the client the account is open, shares access credentials, and runs a welcome call to walk through first steps and answer questions."],
      ["Inputs", "A live account and the client's contact details."],
      ["Outputs", "An activated, engaged client who knows how to use their account."],
      ["Why it matters", "A smooth activation sets the tone for the whole relationship. A silent hand-off leaves the client unsure whether onboarding actually finished."],
    ],
  },
  {
    id: "PS-COB-006", seq: 6, title: "Post-Onboarding Quality Check",
    owner: "Team Lead", sla: "Within 10 business days",
    systems: ["SYS-COB-002"],
    blocks: [
      ["What happens", "The Team Lead samples completed onboarding cases, checks them against the quality and compliance standard, and logs any defects for correction and trend analysis."],
      ["Inputs", "Completed onboarding cases from the preceding 10 business days."],
      ["Outputs", "A quality verdict per sampled case and a defect log that feeds continuous improvement."],
      ["Why it matters", "It is the feedback loop. Without it the same defects repeat unnoticed across hundreds of applications."],
    ],
  },
];
for (const s of steps) {
  const fm = { ...base(s.id, "process-step", "process-steps", s.title), sequence: s.seq, owner: s.owner, sla: s.sla, systems: s.systems };
  if (s.condition) fm.condition = s.condition;
  page(`steps/${s.id.toLowerCase()}.md`, fm, blocks(...s.blocks));
}

// ── RISK & COMPLIANCE · Controls ──────────────────────────────────────────
const controls = [
  {
    id: "CP-COB-001", title: "Customer Identification", controlType: "PREVENTIVE",
    execution: "MANUAL", regulatedBy: ["REG-COB-001"], step: "PS-COB-002",
    effectiveness: "HIGH", owner: "KYC Analyst",
    blocks: [
      ["What it checks", "That the identity of the business and the individuals acting for it is established and verified before the relationship proceeds."],
      ["Control activity", "The KYC Analyst collects identity evidence, validates it against the KYC platform and independent sources, and records the verification outcome in the case file."],
      ["Risk addressed", "Onboarding a client under a false or unverified identity — a direct breach of Customer Due Diligence rules."],
      ["Timing", "Performed once per application, during KYC & Identity Verification (PS-COB-002). A manual control."],
    ],
  },
  {
    id: "CP-COB-002", title: "Beneficial Owner Identification", controlType: "PREVENTIVE",
    execution: "MANUAL", regulatedBy: ["REG-COB-002"], step: "PS-COB-002",
    effectiveness: "HIGH", owner: "KYC Analyst",
    blocks: [
      ["What it checks", "That the ultimate beneficial owners behind the business are identified — even where ownership runs through several layers."],
      ["Control activity", "The KYC Analyst maps the ownership structure, identifies every individual owning or controlling the entity above the regulatory threshold, and verifies each one."],
      ["Risk addressed", "A hidden controlling party — the classic vector for laundering money through corporate structures."],
      ["Timing", "Once per application during PS-COB-002, repeated if the ownership structure changes. A manual control."],
    ],
  },
  {
    id: "CP-COB-003", title: "Data Protection Consent", controlType: "PREVENTIVE",
    execution: "MANUAL", regulatedBy: ["REG-COB-003"], step: "PS-COB-001",
    effectiveness: "HIGH", owner: "Operations Officer",
    blocks: [
      ["What it checks", "That the client has given valid, recorded consent for the bank to process their personal data."],
      ["Control activity", "The Operations Officer presents the data-protection notice at intake and records the client's consent before any personal data is processed downstream."],
      ["Risk addressed", "Processing personal data without a lawful basis — a GDPR violation with regulatory and reputational consequences."],
      ["Timing", "Once, at Application Receipt (PS-COB-001). A manual control."],
    ],
  },
  {
    id: "CP-COB-004", title: "Strong Customer Authentication", controlType: "PREVENTIVE",
    execution: "AUTOMATED", regulatedBy: ["REG-COB-004"], step: "PS-COB-004",
    effectiveness: "HIGH", owner: "IT/Operations",
    blocks: [
      ["What it checks", "That access to the new account is protected by strong, multi-factor authentication from the moment it goes live."],
      ["Control activity", "The system enforces SCA during account setup — no credentials are issued without it."],
      ["Risk addressed", "Unauthorised account access and payment fraud."],
      ["Timing", "Applied automatically during Account Setup (PS-COB-004). An automated control."],
    ],
  },
  {
    id: "CP-COB-005", title: "Product Disclosure", controlType: "PREVENTIVE",
    execution: "MANUAL", regulatedBy: ["REG-COB-005"], step: "PS-COB-005",
    effectiveness: "MEDIUM", owner: "Relationship Manager",
    blocks: [
      ["What it checks", "That the client is given clear, complete information about the products and terms they are signing up for."],
      ["Control activity", "The Relationship Manager presents the product disclosure during activation and confirms the client has received it."],
      ["Risk addressed", "Mis-selling and consumer-protection complaints arising from incomplete disclosure."],
      ["Timing", "Once, during Client Communication & Activation (PS-COB-005). A manual control — currently only medium-effective; see compliance gap CG-COB-001."],
    ],
  },
];
for (const c of controls) {
  page(`controls/${c.id.toLowerCase()}.md`, {
    ...base(c.id, "control", "controls", c.title),
    controlType: c.controlType, execution: c.execution, regulatedBy: c.regulatedBy,
    step: c.step, effectiveness: c.effectiveness, owner: c.owner,
  }, blocks(...c.blocks));
}

// ── RISK & COMPLIANCE · Regulations ───────────────────────────────────────
const regs = [
  {
    id: "REG-COB-001", title: "CDD Regulations 2010", domain: "Customer Due Diligence",
    controls: ["CP-COB-001"],
    blocks: [
      ["What it requires", "That the bank identifies and verifies every customer and understands the nature of the relationship before doing business."],
      ["Why it applies", "Client onboarding is the point at which a new banking relationship is established — the exact activity Customer Due Diligence rules govern."],
      ["How it is met", "Through control CP-COB-001 (Customer Identification) during the KYC step."],
    ],
  },
  {
    id: "REG-COB-002", title: "AML Act 2010", domain: "Anti-Money-Laundering",
    controls: ["CP-COB-002"],
    blocks: [
      ["What it requires", "That the bank identifies beneficial owners, screens for money-laundering risk, and reports suspicious activity."],
      ["Why it applies", "Onboarding businesses through corporate structures is a primary money-laundering risk surface."],
      ["How it is met", "Through CP-COB-002 (Beneficial Owner Identification) and the KYC screening performed in PS-COB-002."],
    ],
  },
  {
    id: "REG-COB-003", title: "GDPR", domain: "Data Protection",
    controls: ["CP-COB-003"],
    blocks: [
      ["What it requires", "A lawful basis for processing personal data, with the data subject informed and consenting."],
      ["Why it applies", "Onboarding collects and processes the personal data of directors and beneficial owners."],
      ["How it is met", "Through CP-COB-003 (Data Protection Consent), captured at application receipt."],
    ],
  },
  {
    id: "REG-COB-004", title: "PSD2", domain: "Payment Services Directive 2",
    controls: ["CP-COB-004"],
    blocks: [
      ["What it requires", "Strong Customer Authentication for account access and payments."],
      ["Why it applies", "The onboarded account is a payment account that falls in scope of PSD2."],
      ["How it is met", "Through the automated control CP-COB-004 during account setup."],
    ],
  },
  {
    id: "REG-COB-005", title: "Consumer Protection Code", domain: "Consumer Protection",
    controls: ["CP-COB-005"],
    blocks: [
      ["What it requires", "Clear, fair and complete information to the customer about products and terms."],
      ["Why it applies", "The bank is selling banking products to a business customer during onboarding."],
      ["How it is met", "Through CP-COB-005 (Product Disclosure) at activation."],
    ],
  },
  {
    id: "REG-COB-006", title: "SoD Policy", domain: "Segregation of Duties (internal policy)",
    controls: [],
    blocks: [
      ["What it requires", "That no single person both performs and approves a sensitive action. This is an internal segregation-of-duties policy rather than external law."],
      ["Why it applies", "Account creation is a sensitive action that must not be both carried out and signed off by the same person."],
      ["How it is met", "Through the four-eyes check performed during Account Setup (PS-COB-004)."],
    ],
  },
];
for (const r of regs) {
  page(`regulation/${r.id.toLowerCase()}.md`, {
    ...base(r.id, "regulation", "regulation", r.title), domain: r.domain, controls: r.controls,
  }, blocks(...r.blocks));
}

// ── RISK & COMPLIANCE · Control gaps + audit finding ──────────────────────
const complianceGaps = [
  {
    id: "CG-COB-001", title: "Product Disclosure only medium-effective",
    severity: "MEDIUM", gapStatus: "open", control: ["CP-COB-005"],
    blocks: [
      ["The gap", "Control CP-COB-005 (Product Disclosure) is rated only MEDIUM-effective. The disclosure is given, but its consistency and the evidence that the client understood it are weak."],
      ["Risk", "A consumer-protection complaint where the bank cannot demonstrate that disclosure was complete and understood."],
      ["Remediation", "Standardise the disclosure script, capture an explicit client acknowledgement, and re-rate the control after two quarters."],
    ],
  },
  {
    id: "CG-COB-002", title: "Account configuration verification not in the control set",
    severity: "MEDIUM", gapStatus: "open", control: null,
    blocks: [
      ["The gap", "Account configuration is verified in practice during PS-COB-004, but this verification is not captured as a formal, named control."],
      ["Risk", "An undocumented control is invisible to audit and can quietly erode — no owner, no testing schedule, no evidence trail."],
      ["Remediation", "Formalise account-configuration verification as a control with an owner, a testing cadence and recorded evidence."],
    ],
  },
];
for (const g of complianceGaps) {
  const fm = { ...base(g.id, "compliance-gap", "control-gaps", g.title), severity: g.severity, gapStatus: g.gapStatus };
  if (g.control) fm.control = g.control;
  page(`control-gaps/${g.id.toLowerCase()}.md`, fm, blocks(...g.blocks));
}
page("audit-findings/oaf-cob-001.md", {
  ...base("OAF-COB-001", "audit-finding", "audit-findings", "Internal Audit Q3 2024 — Control Testing"),
  auditDate: "2024-Q3", findingStatus: "closed", severity: "NONE",
}, blocks(
  ["Finding", "Internal Audit tested the COB-003 control framework in Q3 2024 and found no material weaknesses. The documented control points operated as designed across the audit sample."],
  ["Recommendation", "No remediation required. Audit suggested keeping an eye on the medium-effectiveness controls (product disclosure, welcome-call quality) and re-testing them in the next cycle."],
));

// ── AS-IS · Pain points ───────────────────────────────────────────────────
const pains = [
  {
    id: "PP-COB-001", title: "Manual document chasing", category: "PROCESS",
    affects: ["PS-COB-001", "PS-COB-002"], severity: "HIGH", priority: "P1",
    blocks: [
      ["Description", "When an application arrives incomplete, staff manually contact the client, wait, check what came back, and chase again. There is no automation around this loop."],
      ["Impact", "On average 2–3 follow-up rounds per application. Each round adds days to the cycle time and consumes Operations Officer capacity that should be doing assessment work."],
      ["Root cause", "Clients are not told clearly and upfront which documents their specific business needs, so the first submission is routinely incomplete."],
    ],
  },
  {
    id: "PP-COB-002", title: "System switching / no single client view", category: "SYSTEM",
    affects: ["PS-COB-001", "PS-COB-002", "PS-COB-003", "PS-COB-004", "PS-COB-005"],
    severity: "HIGH", priority: "P1",
    blocks: [
      ["Description", "Staff move between six or more systems to complete one onboarding — CRM, OWS, KYC platform, screening, core banking, card management — re-keying the same data along the way."],
      ["Impact", "Data-entry errors, slow handovers and visible staff frustration. No single screen shows the full state of a case."],
      ["Root cause", "The systems were added over time without an integration layer or a single case view stitched across them."],
    ],
  },
  {
    id: "PP-COB-003", title: "KYC screening false positives", category: "SYSTEM",
    affects: ["PS-COB-002"], severity: "MEDIUM", priority: "P2",
    blocks: [
      ["Description", "The screening tool flags a large share of applications for manual review, most of which turn out to be harmless name matches."],
      ["Impact", "A 40% false-positive rate. KYC Analysts spend significant time clearing matches that were never real risks."],
      ["Root cause", "Screening thresholds are tuned conservatively and there is no learning loop to suppress repeat false matches."],
    ],
  },
  {
    id: "PP-COB-004", title: "Paper-based signatures", category: "PROCESS",
    affects: ["PS-COB-001"], severity: "MEDIUM", priority: "P2",
    blocks: [
      ["Description", "Parts of onboarding still require a physical, wet-ink signature that must then be scanned and attached to the case."],
      ["Impact", "A 1–2 day digitisation delay and a broken digital flow for an otherwise online process."],
      ["Root cause", "Legacy form requirements were never migrated to an e-signature solution."],
    ],
  },
  {
    id: "PP-COB-005", title: "Credit bureau delays", category: "SYSTEM",
    affects: ["PS-COB-003"], severity: "LOW", priority: "P3",
    blocks: [
      ["Description", "During credit assessment the external bureau response time varies and is not visible to the analyst, who simply waits."],
      ["Impact", "Unpredictable delays on the credit step, with no way to set client expectations."],
      ["Root cause", "The bureau integration is fire-and-forget — no SLA, no status polling, no timeout handling."],
    ],
  },
  {
    id: "PP-COB-006", title: "Welcome call scheduling", category: "PROCESS",
    affects: ["PS-COB-005"], severity: "MEDIUM", priority: "P2",
    blocks: [
      ["Description", "Reaching the client for the welcome call takes several attempts across phone and email before a slot is agreed."],
      ["Impact", "On average three attempts per client; the activation step drags and the Relationship Manager's time is fragmented."],
      ["Root cause", "There is no client self-scheduling option — the bank initiates every contact attempt manually."],
    ],
  },
];
for (const p of pains) {
  page(`pain-points/${p.id.toLowerCase()}.md`, {
    ...base(p.id, "pain-point", "pain-points", p.title),
    category: p.category, severity: p.severity, priority: p.priority, affects: p.affects,
  }, blocks(...p.blocks));
}

// ── AS-IS · Exceptions ────────────────────────────────────────────────────
const exceptions = [
  {
    id: "EX-COB-001", title: "Incomplete Documentation", category: "Documentation",
    affects: ["PS-COB-001", "PS-COB-002"], frequencyPct: 30, impact: "MEDIUM",
    handlingOwner: "Operations Officer",
    blocks: [
      ["Description", "Triggered when required documents are missing after submission. It is the most common exception in the process, firing on roughly 30% of applications."],
      ["Handling", "The Operations Officer identifies the missing items, contacts the client, and holds the case until the documents arrive. The case does not advance to KYC until it is complete."],
      ["Impact", "Medium — mainly cycle-time loss. It is tied directly to pain point PP-COB-001 (manual document chasing)."],
    ],
  },
  {
    id: "EX-COB-002", title: "KYC Screening Hit", category: "Compliance",
    affects: ["PS-COB-002"], frequencyPct: 5, impact: "HIGH",
    handlingOwner: "Compliance Officer",
    blocks: [
      ["Description", "Triggered when screening returns a match on a director or beneficial owner. It occurs on about 5% of applications."],
      ["Handling", "The case is escalated to the Compliance Officer, who reviews the match, decides whether it is a true hit, and either clears it or stops onboarding."],
      ["Impact", "High — a genuine hit can mean declining the client and filing a regulatory report."],
    ],
  },
  {
    id: "EX-COB-003", title: "Credit Decline", category: "Credit",
    affects: ["PS-COB-003"], frequencyPct: 15, impact: "MEDIUM",
    handlingOwner: "Relationship Manager",
    blocks: [
      ["Description", "Triggered when the credit assessment fails the scorecard or lending policy. It occurs on about 15% of applications that requested an overdraft."],
      ["Handling", "The Relationship Manager informs the client, who may proceed with a deposit-only account or withdraw."],
      ["Impact", "Medium — the deposit account can still open; only the requested facility is refused."],
    ],
  },
  {
    id: "EX-COB-004", title: "System Downtime", category: "System",
    affects: ["PS-COB-004"], frequencyPct: 1, impact: "HIGH",
    handlingOwner: "IT Service Desk",
    blocks: [
      ["Description", "Triggered when the core banking system is unavailable for more than four hours during account setup. Rare — about 1% of applications."],
      ["Handling", "The IT Service Desk owns recovery; affected cases are queued and processed once the system is restored."],
      ["Impact", "High while it lasts — account setup stops entirely for every in-flight case."],
    ],
  },
  {
    id: "EX-COB-005", title: "Complex Ownership Structure", category: "Compliance",
    affects: ["PS-COB-002"], frequencyPct: 20, impact: "MEDIUM",
    handlingOwner: "Senior KYC Analyst",
    blocks: [
      ["Description", "Triggered when the business has more than three ownership layers, foreign shareholders or trust structures. It occurs on about 20% of applications."],
      ["Handling", "The case is routed to a Senior KYC Analyst for enhanced due diligence rather than standard KYC."],
      ["Impact", "Medium — a significantly longer KYC step, but a normal and expected path for complex businesses."],
    ],
  },
];
for (const e of exceptions) {
  page(`exceptions/${e.id.toLowerCase()}.md`, {
    ...base(e.id, "exception", "exceptions", e.title),
    category: e.category, frequencyPct: e.frequencyPct, impact: e.impact,
    handlingOwner: e.handlingOwner, affects: e.affects,
  }, blocks(...e.blocks));
}

// ── AS-IS · Friction points (client-side) ─────────────────────────────────
const frictions = [
  {
    id: "FP-COB-001", title: "Unclear Document Requirements", severity: "HIGH",
    occursAt: ["PS-COB-001"], painPoint: "PP-COB-001", addressedBy: "II-COB-001",
    blocks: [
      ["Description", "At the start of the journey the client is not given a precise, tailored list of the documents their specific business type needs."],
      ["Root cause", "The document checklist is generic — it is not adapted to the client's entity type or the products they requested."],
      ["Client impact", "The client guesses, submits the wrong or incomplete set, and is then asked for more. An avoidable bad first impression."],
    ],
  },
  {
    id: "FP-COB-002", title: "Repeated Document Chasing", severity: "HIGH",
    occursAt: ["PS-COB-001", "PS-COB-002"], painPoint: "PP-COB-001", addressedBy: "II-COB-002",
    blocks: [
      ["Description", "The client is contacted several times for missing documents, often one item at a time."],
      ["Root cause", "There is no single up-front completeness check, so gaps surface piecemeal across several rounds."],
      ["Client impact", "The client feels the bank is disorganised and that the process has no end in sight."],
    ],
  },
  {
    id: "FP-COB-003", title: "Paper Signature Requirement", severity: "MEDIUM",
    occursAt: ["PS-COB-001"], painPoint: "PP-COB-004", addressedBy: "II-COB-003",
    blocks: [
      ["Description", "After an otherwise digital application the client is asked to provide a physical signature."],
      ["Root cause", "Legacy forms were never moved to an e-signature solution."],
      ["Client impact", "The digital flow breaks — the client must print, sign and scan or post, friction that feels out of step with a modern bank."],
    ],
  },
  {
    id: "FP-COB-004", title: "Complex Ownership Questions", severity: "MEDIUM",
    occursAt: ["PS-COB-002"], painPoint: "PP-COB-003", addressedBy: null,
    blocks: [
      ["Description", "The client is asked detailed questions about their ownership and control structure that are hard to understand without guidance."],
      ["Root cause", "KYC questions are written in regulatory language rather than client language, with no examples."],
      ["Client impact", "The client struggles to answer, answers incorrectly, and triggers further back-and-forth."],
    ],
  },
];
for (const f of frictions) {
  const fm = { ...base(f.id, "friction-point", "friction-points", f.title), severity: f.severity, occursAt: f.occursAt, painPoint: f.painPoint };
  if (f.addressedBy) fm.addressedBy = f.addressedBy;
  page(`friction-points/${f.id.toLowerCase()}.md`, fm, blocks(...f.blocks));
}

// ── AS-IS · CX Journey · Touchpoints ──────────────────────────────────────
const touchpoints = [
  {
    id: "JT-COB-001", title: "Submit application", channel: "Online portal / Branch",
    occursAt: "PS-COB-001", ces: 4,
    blocks: [
      ["What the client does", "Completes and submits the onboarding application with supporting documents, via the online portal or in a branch."],
      ["What the bank does", "Receives the application into the pipeline and begins initial triage."],
      ["Experience", "Moderate effort (CES 4). The client invests time gathering documents and filling in forms, often unsure whether they have everything."],
    ],
  },
  {
    id: "JT-COB-002", title: "Provide missing documents", channel: "Email / Portal",
    occursAt: "PS-COB-001", ces: 6,
    blocks: [
      ["What the client does", "Responds to a request for missing documents — locating and re-submitting them."],
      ["What the bank does", "Re-checks the submission and either proceeds or asks again."],
      ["Experience", "High effort (CES 6) — the worst touchpoint of the journey. Repetition and uncertainty make it feel like the process is stalling."],
    ],
  },
  {
    id: "JT-COB-003", title: "Answer KYC questions", channel: "Phone / Email",
    occursAt: "PS-COB-002", ces: 5,
    blocks: [
      ["What the client does", "Answers questions about identity and ownership structure, by phone or email."],
      ["What the bank does", "Verifies identity and beneficial ownership and records the answers in the KYC file."],
      ["Experience", "Notable effort (CES 5). The questions feel intrusive and technical, and complex structures make them harder."],
    ],
  },
  {
    id: "JT-COB-004", title: "Receive account activation", channel: "Email",
    occursAt: "PS-COB-004", ces: 1,
    blocks: [
      ["What the client does", "Receives the confirmation that the account is ready and can start using it."],
      ["What the bank does", "Sends the activation notice with access details once the account is live."],
      ["Experience", "Very low effort (CES 1) — and the emotional high point of the journey. The client finally has what they came for."],
    ],
  },
  {
    id: "JT-COB-005", title: "Welcome call", channel: "Phone",
    occursAt: "PS-COB-005", ces: 3,
    blocks: [
      ["What the client does", "Takes a welcome call with the Relationship Manager and asks any first questions."],
      ["What the bank does", "Walks the client through first steps, confirms understanding, and opens the ongoing relationship."],
      ["Experience", "Low effort (CES 3) and reassuring when it lands — but scheduling it often takes several attempts."],
    ],
  },
];
for (const t of touchpoints) {
  page(`cx-journey/${t.id.toLowerCase()}.md`, {
    ...base(t.id, "cx-touchpoint", "cx-journey", t.title),
    channel: t.channel, occursAt: t.occursAt, ces: t.ces,
  }, blocks(...t.blocks));
}

// ── AS-IS · CX Journey · Moments That Matter ──────────────────────────────
const moments = [
  {
    id: "MT-COB-001", title: "First response from the bank", sentiment: "critical",
    touchpoint: "JT-COB-001",
    blocks: [
      ["The moment", "The first time the client hears back after submitting — an acknowledgement, a question, or silence."],
      ["Why it matters", "It sets the client's expectation for the entire relationship. Speed and clarity here are remembered; so is silence."],
      ["Design implication", "Guarantee a fast, substantive first response — ideally an automated acknowledgement plus a clear next step within hours."],
    ],
  },
  {
    id: "MT-COB-002", title: "The account is ready to use", sentiment: "positive",
    touchpoint: "JT-COB-004",
    blocks: [
      ["The moment", "The client learns the account is live and they can transact."],
      ["Why it matters", "This is the peak of the journey — the outcome the client actually wanted. A flat, transactional message wastes the moment."],
      ["Design implication", "Make activation feel like an arrival, not a system notification — confirm clearly, welcome warmly, point to the obvious first action."],
    ],
  },
  {
    id: "MT-COB-003", title: "Another document request", sentiment: "negative",
    touchpoint: "JT-COB-002",
    blocks: [
      ["The moment", "The client is asked, again, for something missing."],
      ["Why it matters", "It is the journey's recurring low point and the strongest driver of the perception that the bank is slow and disorganised."],
      ["Design implication", "Eliminate the repeat request entirely with up-front completeness validation, rather than just softening the message."],
    ],
  },
];
for (const m of moments) {
  page(`cx-journey/${m.id.toLowerCase()}.md`, {
    ...base(m.id, "moment", "cx-journey", m.title), sentiment: m.sentiment, touchpoint: m.touchpoint,
  }, blocks(...m.blocks));
}

// ── AS-IS · CX Journey · Channels ─────────────────────────────────────────
const channels = [
  {
    id: "CH-COB-001", title: "Online Portal", channelType: "DIGITAL",
    touchpoints: ["JT-COB-001", "JT-COB-002"],
    blocks: [
      ["Description", "The bank's self-service portal, where the client completes the application and uploads documents."],
      ["Usage", "The primary digital intake channel — used at Submit application and Provide missing documents."],
    ],
  },
  {
    id: "CH-COB-002", title: "Email", channelType: "DIGITAL",
    touchpoints: ["JT-COB-002", "JT-COB-003", "JT-COB-004"],
    blocks: [
      ["Description", "Asynchronous email between the bank and the client."],
      ["Usage", "Carries document requests, KYC follow-ups and the activation confirmation across three touchpoints."],
    ],
  },
  {
    id: "CH-COB-003", title: "Phone", channelType: "ASSISTED",
    touchpoints: ["JT-COB-003", "JT-COB-005"],
    blocks: [
      ["Description", "Direct voice contact between bank staff and the client."],
      ["Usage", "Used for KYC clarification questions and the welcome call — the assisted, personal moments of the journey."],
    ],
  },
  {
    id: "CH-COB-004", title: "Branch", channelType: "ASSISTED",
    touchpoints: ["JT-COB-001"],
    blocks: [
      ["Description", "In-person contact at a bank branch."],
      ["Usage", "An alternative intake channel for clients who prefer to apply with face-to-face advice."],
    ],
  },
];
for (const ch of channels) {
  page(`cx-journey/${ch.id.toLowerCase()}.md`, {
    ...base(ch.id, "cx-channel", "cx-journey", ch.title),
    channelType: ch.channelType, touchpoints: ch.touchpoints,
  }, blocks(...ch.blocks));
}

// ── AS-IS · Roles & Organisation ──────────────────────────────────────────
const roles = [
  {
    id: "ROLE-COB-001", title: "Operations Officer",
    raci: ["PS-COB-001:R", "PS-COB-002:I", "PS-COB-004:R", "PS-COB-006:R"],
    controls: ["CP-COB-003", "CP-COB-004"],
    systems: ["SYS-COB-001", "SYS-COB-002", "SYS-COB-005", "SYS-COB-007", "SYS-COB-008"],
    blocks: [
      ["Responsibility", "Owns the operational backbone of onboarding — taking applications in, setting accounts up, and keeping cases moving through the pipeline."],
      ["In this process", "Responsible for Application Receipt (PS-COB-001) and Account Setup (PS-COB-004), and runs the data-protection consent control."],
    ],
  },
  {
    id: "ROLE-COB-002", title: "KYC Analyst",
    raci: ["PS-COB-002:R"], controls: ["CP-COB-001", "CP-COB-002"],
    systems: ["SYS-COB-003", "SYS-COB-004", "SYS-COB-007"],
    blocks: [
      ["Responsibility", "Owns identity verification and the regulatory KYC assessment — the bank's first line of defence against financial crime at onboarding."],
      ["In this process", "Responsible for KYC & Identity Verification (PS-COB-002) and executes the customer- and beneficial-owner-identification controls."],
    ],
  },
  {
    id: "ROLE-COB-003", title: "Credit Analyst",
    raci: ["PS-COB-003:R"], controls: [],
    systems: ["SYS-COB-001", "SYS-COB-006"],
    blocks: [
      ["Responsibility", "Assesses credit risk and decides on requested lending facilities within their approval authority."],
      ["In this process", "Responsible for Credit Assessment (PS-COB-003), which runs only when an overdraft is requested."],
    ],
  },
  {
    id: "ROLE-COB-004", title: "Relationship Manager",
    raci: ["PS-COB-001:I", "PS-COB-003:C", "PS-COB-005:R"], controls: ["CP-COB-005"],
    systems: ["SYS-COB-001"],
    blocks: [
      ["Responsibility", "Owns the client relationship — communication, activation, and the ongoing commercial connection."],
      ["In this process", "Responsible for Client Communication & Activation (PS-COB-005) and delivers product disclosure to the client."],
    ],
  },
  {
    id: "ROLE-COB-005", title: "Team Lead",
    raci: ["PS-COB-001:A", "PS-COB-003:A", "PS-COB-004:A", "PS-COB-005:A", "PS-COB-006:A"],
    controls: [], systems: ["SYS-COB-002"],
    blocks: [
      ["Responsibility", "Supervises the onboarding team, gives the four-eyes approval on sensitive actions, and owns process quality — effectively the process owner."],
      ["In this process", "Accountable for five of the six steps and responsible for the Post-Onboarding Quality Check (PS-COB-006)."],
    ],
  },
  {
    id: "ROLE-COB-006", title: "Compliance Officer",
    raci: ["PS-COB-002:A"], controls: [],
    systems: ["SYS-COB-003", "SYS-COB-004"],
    blocks: [
      ["Responsibility", "Owns regulatory judgement calls that exceed an analyst's authority."],
      ["In this process", "Accountable for the KYC step's compliance outcome and handles every escalated KYC screening hit (EX-COB-002)."],
    ],
  },
];
for (const r of roles) {
  page(`roles/${r.id.toLowerCase()}.md`, {
    ...base(r.id, "role", "roles", r.title), raci: r.raci, controls: r.controls, systems: r.systems,
  }, blocks(...r.blocks));
}

// ── AS-IS · Metrics ───────────────────────────────────────────────────────
const metrics = [
  {
    id: "M-COB-001", title: "Application volume", value: "80–120 / month", trend: "+12–15% YoY",
    blocks: [
      ["Definition", "The number of onboarding applications received per month."],
      ["Current reading", "80–120 per month, growing 12–15% year on year. This is roughly 60% of the bank's total onboarding volume."],
      ["Why it matters", "It sizes the process. Capacity planning, staffing and any automation business case all start from this number."],
    ],
  },
  {
    id: "M-COB-002", title: "Cycle time (avg)", value: "4–6 hours", trend: "—",
    blocks: [
      ["Definition", "The average elapsed processing time from application receipt to a live, activated account."],
      ["Current reading", "4–6 hours of processing time on average — though calendar time is longer when documents must be chased."],
      ["Why it matters", "Cycle time is what the client feels. It is also the headline number any improvement effort will be judged against."],
    ],
  },
  {
    id: "M-COB-003", title: "Complexity mix", value: "70% Standard / 30% Complex", trend: "—",
    blocks: [
      ["Definition", "The split between standard applications and complex ones (multi-layer ownership, trusts, foreign shareholders)."],
      ["Current reading", "Roughly 70% standard, 30% complex."],
      ["Why it matters", "Complex cases take far longer in KYC. The mix drives where analyst capacity is really spent."],
    ],
  },
  {
    id: "M-COB-004", title: "KYC false-positive rate", value: "40%", trend: "—",
    blocks: [
      ["Definition", "The share of KYC screening hits that turn out to be false alarms."],
      ["Current reading", "About 40% — a large fraction of flagged cases were never real risks."],
      ["Why it matters", "It quantifies wasted KYC effort and is the clearest target for a screening-tuning improvement."],
    ],
  },
  {
    id: "M-COB-005", title: "Incomplete-application rate", value: "30%", trend: "—",
    blocks: [
      ["Definition", "The share of applications that arrive missing one or more required documents."],
      ["Current reading", "About 30% of all applications."],
      ["Why it matters", "It is the root metric behind manual document chasing — the single biggest cycle-time drag in the process."],
    ],
  },
];
for (const m of metrics) {
  page(`metrics/${m.id.toLowerCase()}.md`, {
    ...base(m.id, "metric", "metrics", m.title), value: m.value, trend: m.trend,
  }, blocks(...m.blocks));
}

// ── AS-IS · Process Gaps / open points ────────────────────────────────────
const gaps = [
  {
    id: "PG-COB-001", title: "SLA adherence not measured centrally", area: "Metrics", gapStatus: "open",
    blocks: [
      ["The gap", "Each step has a defined SLA, but whether those SLAs are actually being met is not measured or reported anywhere."],
      ["Impact", "The process cannot tell a healthy week from a slipping one. Problems are noticed only when a client complains."],
      ["Next step", "Instrument OWS to capture step start/end times and report SLA adherence on a dashboard."],
    ],
  },
  {
    id: "PG-COB-002", title: "Org responsibility unclear for the partner channel", area: "Roles", gapStatus: "open",
    blocks: [
      ["The gap", "The process is triggered through four channels, but for partner-channel submissions the initial-handling responsibility is not documented."],
      ["Impact", "Partner-channel applications can sit unassigned; accountability for the first triage is ambiguous."],
      ["Next step", "Define and document which role owns first-touch handling for partner-channel applications."],
    ],
  },
  {
    id: "PG-COB-003", title: "Per-step processing time not captured", area: "Metrics", gapStatus: "open",
    blocks: [
      ["The gap", "Only the total cycle time (4–6 h) is known; how that time splits across the six steps is not measured."],
      ["Impact", "Improvement effort is aimed by intuition rather than evidence — the real bottleneck step is unknown."],
      ["Next step", "Capture per-step durations so the slowest step can be targeted directly."],
    ],
  },
];
for (const g of gaps) {
  page(`process-gaps/${g.id.toLowerCase()}.md`, {
    ...base(g.id, "process-gap", "process-gaps", g.title), area: g.area, gapStatus: g.gapStatus,
  }, blocks(...g.blocks));
}

// ── INNOVATION · Ideas (from v1 friction-point enhancement ideas) ─────────
const ideas = [
  {
    id: "II-COB-001", title: "Smart document checklist", category: "Customer Experience",
    strategicFit: "HIGH", complexity: "MEDIUM", addresses: ["FP-COB-001"],
    blocks: [
      ["The idea", "An interactive checklist that adapts to the client's business type and validates uploads in real time, so the client sees immediately what is still missing or wrong."],
      ["Expected benefit", "Directly attacks the incomplete-application rate and manual document chasing. Estimated client-effort reduction of -6 on the worst touchpoint."],
      ["Feasibility", "Medium complexity, high strategic fit — it addresses friction point FP-COB-001 and the bank's single biggest cycle-time drag."],
    ],
  },
  {
    id: "II-COB-002", title: "Automated document reminder", category: "Process",
    strategicFit: "MEDIUM", complexity: "LOW", addresses: ["FP-COB-002"],
    blocks: [
      ["The idea", "Replace manual chasing with an automated reminder sequence that escalates if documents are still missing."],
      ["Expected benefit", "Frees Operations Officer capacity and gives the client a predictable, less nagging experience. Estimated effort reduction -3."],
      ["Feasibility", "Low complexity — a contained automation. Addresses friction point FP-COB-002."],
    ],
  },
  {
    id: "II-COB-003", title: "E-signature implementation", category: "Technology",
    strategicFit: "MEDIUM", complexity: "MEDIUM", addresses: ["FP-COB-003"],
    blocks: [
      ["The idea", "Adopt an e-signature solution (DocuSign / Adobe Sign) so signatures stay inside the digital flow."],
      ["Expected benefit", "Removes the 1–2 day digitisation delay and the broken paper step. Estimated effort reduction -2."],
      ["Feasibility", "Medium complexity — mostly integration and legal sign-off. Addresses friction point FP-COB-003."],
    ],
  },
];
for (const i of ideas) {
  page(`innovation-ideas/${i.id.toLowerCase()}.md`, {
    ...base(i.id, "innovation-idea", "innovation-ideas", i.title),
    confidence: "medium", category: i.category, strategicFit: i.strategicFit,
    complexity: i.complexity, addresses: i.addresses,
  }, blocks(...i.blocks));
}

// ── IT ARCHITECTURE · Systems ─────────────────────────────────────────────
const systems = [
  {
    id: "SYS-COB-001", title: "CRM (Salesforce)", systemType: "CORE",
    steps: ["PS-COB-001", "PS-COB-002", "PS-COB-003", "PS-COB-004", "PS-COB-005", "PS-COB-006"],
    integrates: ["SYS-COB-002"],
    blocks: [
      ["Purpose", "Manages the client relationship and tracks every onboarding case as a record."],
      ["Role in this process", "The case backbone — every step reads and updates the CRM case, from intake through activation and quality check."],
    ],
  },
  {
    id: "SYS-COB-002", title: "OWS (Onboarding Workflow System)", systemType: "CORE",
    steps: ["PS-COB-001", "PS-COB-002", "PS-COB-003", "PS-COB-004", "PS-COB-005", "PS-COB-006"],
    integrates: ["SYS-COB-001"],
    blocks: [
      ["Purpose", "Orchestrates the onboarding process and tracks SLAs."],
      ["Role in this process", "Drives the step sequence and timing for all six steps; it is where SLA instrumentation would live."],
    ],
  },
  {
    id: "SYS-COB-003", title: "KYC Platform (Fenergo)", systemType: "CORE",
    steps: ["PS-COB-002"], integrates: ["SYS-COB-004"],
    blocks: [
      ["Purpose", "Manages KYC cases and stores identity documentation."],
      ["Role in this process", "The working system for the KYC & Identity Verification step (PS-COB-002)."],
    ],
  },
  {
    id: "SYS-COB-004", title: "World-Check (Refinitiv)", systemType: "EXTERNAL",
    steps: ["PS-COB-002"], integrates: ["SYS-COB-003"],
    blocks: [
      ["Purpose", "External PEP and sanctions screening database."],
      ["Role in this process", "Called during KYC to screen directors and beneficial owners — an external dependency."],
    ],
  },
  {
    id: "SYS-COB-005", title: "CBS (Temenos T24)", systemType: "CORE",
    steps: ["PS-COB-004"], integrates: ["SYS-COB-008"],
    blocks: [
      ["Purpose", "The core banking system — creates accounts and processes transactions."],
      ["Role in this process", "Where the account is actually created and configured during Account Setup (PS-COB-004)."],
    ],
  },
  {
    id: "SYS-COB-006", title: "CDS (Credit Decisioning)", systemType: "SUPPORTING",
    steps: ["PS-COB-003"], integrates: [],
    blocks: [
      ["Purpose", "Runs credit assessment scorecards."],
      ["Role in this process", "Used only in the conditional Credit Assessment step (PS-COB-003)."],
    ],
  },
  {
    id: "SYS-COB-007", title: "DMS (OpenText)", systemType: "SUPPORTING",
    steps: ["PS-COB-001", "PS-COB-002"], integrates: [],
    blocks: [
      ["Purpose", "Document storage and archival."],
      ["Role in this process", "Holds the application documents from intake through KYC."],
    ],
  },
  {
    id: "SYS-COB-008", title: "Card Management (Marqeta)", systemType: "SUPPORTING",
    steps: ["PS-COB-004"], integrates: ["SYS-COB-005"],
    blocks: [
      ["Purpose", "Orders and manages debit cards."],
      ["Role in this process", "Triggered during Account Setup to provision the client's debit card."],
    ],
  },
];
for (const sy of systems) {
  page(`systems/${sy.id.toLowerCase()}.md`, {
    ...base(sy.id, "system", "systems", sy.title),
    systemType: sy.systemType, steps: sy.steps, integrates: sy.integrates,
  }, blocks(...sy.blocks));
}

// ── IT ARCHITECTURE · Integrations ────────────────────────────────────────
const integrations = [
  {
    id: "INT-COB-001", title: "CRM ↔ OWS", systems: ["SYS-COB-001", "SYS-COB-002"],
    blocks: [
      ["What connects", "The CRM (case management) and OWS (workflow orchestration)."],
      ["What flows", "Case and SLA data, kept in sync bidirectionally so both systems agree on the case state."],
    ],
  },
  {
    id: "INT-COB-002", title: "KYC Platform ↔ World-Check", systems: ["SYS-COB-003", "SYS-COB-004"],
    blocks: [
      ["What connects", "The Fenergo KYC platform and the World-Check screening database."],
      ["What flows", "The KYC platform sends names for PEP and sanctions screening and receives match results."],
    ],
  },
  {
    id: "INT-COB-003", title: "CBS ↔ Card Management", systems: ["SYS-COB-005", "SYS-COB-008"],
    blocks: [
      ["What connects", "The core banking system and the card management platform."],
      ["What flows", "Account creation triggers debit-card provisioning downstream."],
    ],
  },
];
for (const it of integrations) {
  page(`integrations/${it.id.toLowerCase()}.md`, {
    ...base(it.id, "integration", "integrations", it.title), systems: it.systems,
  }, blocks(...it.blocks));
}

// Target Process (TO-BE / transformation / gaps / validation) is intentionally
// left unseeded for COB-003 — v1 has no target state for 003. This demonstrates
// the empty state of those sections.

console.log("Seeded wiki/processes/cob-003 — 4 areas, 76 pages, each with named prose blocks.");

"use client";

// Personal Work views in the ArchitectMiner shell.
// Cross-process queues for the current architect — the "what am I working
// on across the portfolio" tier. All mock data; the architect-state
// machine and migration-plan store don't exist yet. JSX ports from
// public/architectminer.html frames 16-18.

import type { User } from "@/lib/user";

// ---------------------------------------------------------------------
// All processes — portfolio table
// ---------------------------------------------------------------------
type Stage = "upstream" | "ready" | "domain" | "solution" | "build" | "complete";
type ProgressTone = "" | "mid" | "hi";

function StageChip({ stage, label }: { stage: Stage; label: string }) {
  return <span className={`am-stage am-stage-${stage}`}>{label}</span>;
}

function MicroBar({ pct, tone }: { pct: number; tone: ProgressTone }) {
  return (
    <div className={`am-micro-bar${tone ? ` am-micro-bar-${tone}` : ""}`}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return <span className="am-avatar-inline">{initials}</span>;
}

export function AllProcesses() {
  return (
    <>
      <div className="am-lib-head">
        <h1>All processes</h1>
        <p className="am-sub">
          9 processes · 2 upstream · 1 ready · 3 in domain · 1 in solution ·
          2 in build · all driven from Processminer
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">9</span></button>
        <button type="button" className="am-chip">Upstream <span className="am-chip-n">2</span></button>
        <button type="button" className="am-chip">Ready <span className="am-chip-n">1</span></button>
        <button type="button" className="am-chip">In domain <span className="am-chip-n">3</span></button>
        <button type="button" className="am-chip">In solution <span className="am-chip-n">1</span></button>
        <button type="button" className="am-chip">In build <span className="am-chip-n">2</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search process or ID…" />
      </div>

      <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
        <thead>
          <tr>
            <th style={{ width: "24%" }}>Process</th>
            <th>Stage</th>
            <th>Target Process</th>
            <th>Architecture progress</th>
            <th>Last activity</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          <ProcessRow selected name="SEPA Payment Processing" id="SPP" domain="payments · corporate" stage="build" stageLabel="IN BUILD" tpLocked="2026-03-12" tpSub="14/14 elements approved" progress="14 ADRs · 9 caps · 6 apps · 4 NFRs" pct={100} tone="hi" progressSub="handed off to delivery" activity="5d ago" owner="Sara L." initials="SL" />
          <ProcessRow name="Direct Debit Mandate Management" id="DDMM" domain="payments · retail" stage="build" stageLabel="IN BUILD" tpLocked="2026-04-30" tpSub="17/17 elements approved" progress="20 ADRs · 9 caps · 6 apps · 8 NFRs" pct={88} tone="hi" progressSub="migration phase 2 · 60%" activity="1h ago" owner="Theo R." initials="TR" />
          <ProcessRow name="Funds Release" id="FR" domain="treasury" stage="solution" stageLabel="IN SOLUTION" tpLocked="2026-05-08" tpSub="9/9 elements approved" progress="11 ADRs · 5 caps · 4 apps · 5 NFRs" pct={55} tone="" progressSub="NFRs & migration in flight" activity="4h ago" owner="M. Holzhauser" initials="MH" />
          <ProcessRow name="Corporate Account Closure" id="CAC" domain="corporate · ops" stage="domain" stageLabel="IN DOMAIN" tpLocked="2026-05-14" tpSub="12/12 elements approved" progress="8 ADRs · 5 caps · 4 apps" pct={42} tone="mid" progressSub="capabilities done · ADRs ongoing" activity="yesterday" owner="M. Holzhauser" initials="MH" />
          <ProcessRow name="EDR — Event-Driven Review" id="EDR" domain="risk & compliance" stage="domain" stageLabel="IN DOMAIN" tpLocked="2026-05-16" tpSub="10/10 elements approved" progress="6 ADRs · 4 caps · 3 apps" pct={38} tone="mid" progressSub="capabilities done · 2 ADRs draft" activity="17h ago" owner="Anna K." initials="AK" />
          <ProcessRow name="Bank Guarantee Issuance" id="BGI" domain="trade finance · corporate" stage="domain" stageLabel="IN DOMAIN" tpLocked="2026-05-18" tpSub="11/11 elements approved" progress="5 ADRs · 4 caps · 3 apps" pct={28} tone="mid" progressSub="just started · 1 ADR accepted" activity="yesterday" owner="Theo R." initials="TR" />
          <ProcessRow name="Debit Card Replacement" id="DCR" domain="cards · retail" stage="ready" stageLabel="READY" tpLocked="2026-05-20" tpSub="8/8 elements approved" progress="—" pct={0} tone="" progressSub="awaits domain architect" activity="2d ago" owner="Sara L." initials="SL" />
          <ProcessRow name="Bank Guarantee Issuance Test" id="BGIT" domain="sandbox · trade finance" stage="upstream" stageLabel="UPSTREAM" tpLocked="not yet locked" tpSub="5/12 elements approved · still drafting" progress="—" pct={0} tone="" progressSub="unlocks when target process is locked" activity="3d ago" owner="Theo R." initials="TR" />
          <ProcessRow name="COB-003 (Cash Operations Batch)" id="COB-003" domain="treasury · ops" stage="upstream" stageLabel="UPSTREAM" tpLocked="not yet locked" tpSub="2/9 elements approved · early stages" progress="—" pct={0} tone="" progressSub="SME interviews in progress" activity="1w ago" owner="Anna K." initials="AK" />
        </tbody>
      </table>
    </>
  );
}

function ProcessRow({
  selected, name, id, domain, stage, stageLabel, tpLocked, tpSub,
  progress, pct, tone, progressSub, activity, owner, initials,
}: {
  selected?: boolean;
  name: string;
  id: string;
  domain: string;
  stage: Stage;
  stageLabel: string;
  tpLocked: string;
  tpSub: string;
  progress: string;
  pct: number;
  tone: ProgressTone;
  progressSub: string;
  activity: string;
  owner: string;
  initials: string;
}) {
  return (
    <tr className={selected ? "am-canvas-app-sel" : undefined}>
      <td>
        <div className="am-canvas-app-name">{name}</div>
        <div className="am-canvas-app-id">{id}</div>
        <div className="am-app-domain">{domain}</div>
      </td>
      <td><StageChip stage={stage} label={stageLabel} /></td>
      <td>
        <div>{tpLocked}</div>
        <div className="am-canvas-app-stack">{tpSub}</div>
      </td>
      <td>
        <div>{progress}</div>
        <MicroBar pct={pct} tone={tone} />
        <div className="am-canvas-app-stack">{progressSub}</div>
      </td>
      <td>
        <div>{activity}</div>
        <div className="am-canvas-app-stack">{owner}</div>
      </td>
      <td><Avatar initials={initials} /></td>
    </tr>
  );
}


// ---------------------------------------------------------------------
// My ADRs — personal queue
// ---------------------------------------------------------------------
type AdrStatus = "draft" | "proposed" | "accepted" | "rejected" | "superseded";

export function MyAdrs({ user }: { user: User }) {
  return (
    <>
      <div className="am-lib-head">
        <h1>My ADRs</h1>
        <p className="am-sub">
          23 total · 8 accepted · 9 proposed · 3 draft · 3 awaiting my review ·
          spans 4 processes · {user.name}
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">23</span></button>
        <button type="button" className="am-chip">My drafts <span className="am-chip-n">3</span></button>
        <button type="button" className="am-chip">Awaiting me <span className="am-chip-n">3</span></button>
        <button type="button" className="am-chip">Proposed <span className="am-chip-n">9</span></button>
        <button type="button" className="am-chip">Accepted <span className="am-chip-n">8</span></button>
        <button type="button" className="am-chip">Rejected / superseded <span className="am-chip-n">3</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search ADR title or ID…" />
      </div>

      <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
        <thead>
          <tr>
            <th style={{ width: 120 }}>ADR</th>
            <th>Title</th>
            <th>Process</th>
            <th>My role</th>
            <th>Status</th>
            <th>Last activity</th>
          </tr>
        </thead>
        <tbody>
          <AdrRow selected id="ADR-DDMM-007" title="Mandate revocation via Kafka event topic" titleSub="draft · 2/4 headings confirmed · NFR-DDMM-006 missing" process="Direct Debit Mandate" processId="DDMM" role="author" status="draft" activity="1h ago" activitySub="just edited Consequences" />
          <AdrRow id="ADR-FR-003" title="Saga choreography for funds-release reversal" titleSub="awaiting your review — 3 days open" process="Funds Release" processId="FR" role="reviewer" status="proposed" activity="3d ago" activitySub="by Sara L." />
          <AdrRow id="ADR-CAC-004" title="Account close — single-source SoR via Customer Master" titleSub="3/4 headings confirmed · awaiting your sign-off" process="Corporate Account Closure" processId="CAC" role="author" status="proposed" activity="6h ago" activitySub="2 reviewers approved" />
          <AdrRow id="ADR-DDMM-004" title="Outbox + CDC for mandate state changes" titleSub="accepted · cites pattern PTN-OUTBOX-CDC" process="Direct Debit Mandate" processId="DDMM" role="author" status="accepted" activity="yesterday" activitySub="approved by 3/3" />
          <AdrRow id="ADR-FR-004" title="Circuit breaker on settlement gateway" titleSub="accepted last week" process="Funds Release" processId="FR" role="reviewer" status="accepted" activity="5d ago" activitySub="by M. Holzhauser" />
          <AdrRow id="ADR-DDMM-001" title="API Gateway + per-channel BFF" titleSub="accepted · cites pattern PTN-APIGW-BFF" process="Direct Debit Mandate" processId="DDMM" role="author" status="accepted" activity="2w ago" activitySub="approved by 3/3" />
          <AdrRow id="ADR-DDMM-009" title="Zero-trust mTLS between Mandate Hub services" titleSub="proposed · 2 reviewers" process="Direct Debit Mandate" processId="DDMM" role="author" status="proposed" activity="3d ago" activitySub="awaiting Anna K." />
          <AdrRow id="ADR-CAC-002" title="Reversal flow via existing Saga orchestrator" titleSub="superseded by ADR-CAC-004 — historical" process="Corporate Account Closure" processId="CAC" role="author" status="superseded" activity="1w ago" activitySub="superseded yesterday" />
          <AdrRow id="ADR-EDR-002" title="Event-stream replay window — 30 days" titleSub="awaiting your review — late by 2 days" process="EDR — Event-Driven Review" processId="EDR" role="reviewer" status="proposed" activity="4d ago" activitySub="by Anna K." />
          <AdrRow id="ADR-FR-006" title="Snowflake DWH for FR reporting marts" titleSub="draft — outline only" process="Funds Release" processId="FR" role="author" status="draft" activity="5h ago" activitySub="just outlined" />
        </tbody>
      </table>
    </>
  );
}

function AdrRow({
  selected, id, title, titleSub, process, processId, role, status, activity, activitySub,
}: {
  selected?: boolean;
  id: string;
  title: string;
  titleSub: string;
  process: string;
  processId: string;
  role: "author" | "reviewer";
  status: AdrStatus;
  activity: string;
  activitySub: string;
}) {
  return (
    <tr className={selected ? "am-canvas-app-sel" : undefined}>
      <td className="am-canvas-app-id">{id}</td>
      <td>
        <div className="am-canvas-app-name">{title}</div>
        <div className="am-canvas-app-stack">{titleSub}</div>
      </td>
      <td>
        <div>{process}</div>
        <div className="am-canvas-app-stack">{processId}</div>
      </td>
      <td><span className={`am-role-chip am-role-chip-${role}`}>{role}</span></td>
      <td><span className={`am-adr-status am-adr-status-${status}`}>{status.toUpperCase()}</span></td>
      <td>
        <div>{activity}</div>
        <div className="am-canvas-app-stack">{activitySub}</div>
      </td>
    </tr>
  );
}


// ---------------------------------------------------------------------
// Migration plans — multi-process Gantt
// ---------------------------------------------------------------------
export function MigrationPlans() {
  return (
    <>
      <div className="am-lib-head">
        <h1>Migration plans</h1>
        <p className="am-sub">
          3 processes in flight across 11 phases · 1 done · 4 in flight ·
          6 planned · earliest go-live SEPA 2026 Q4 · latest DDMM 2027 Q2
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All (3 processes · 11 phases)</button>
        <button type="button" className="am-chip">SEPA (3 phases)</button>
        <button type="button" className="am-chip">DDMM (4 phases)</button>
        <button type="button" className="am-chip">FR (4 phases)</button>
        <span style={{ flex: 1 }} />
        <span className="am-pill am-pill-neu" style={{ fontFamily: "var(--font)", fontWeight: 500 }}>
          Range: 2026 Q2 → 2027 Q3
        </span>
      </div>

      <div className="am-canvas-gantt-wrap">
        <div className="am-canvas-gantt-legend">
          <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-done" />done</span>
          <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-flight" />in flight</span>
          <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-planned" />planned</span>
        </div>

        <svg viewBox="0 0 880 540" className="am-canvas-gantt-svg" style={{ height: 520 }}>
          <g>
            <line className="am-svg-grid-line" x1="200" y1="40" x2="200" y2="520" />
            <line className="am-svg-grid-line" x1="320" y1="40" x2="320" y2="520" />
            <line className="am-svg-grid-line" x1="440" y1="40" x2="440" y2="520" />
            <line className="am-svg-grid-line" x1="560" y1="40" x2="560" y2="520" />
            <line className="am-svg-grid-line" x1="680" y1="40" x2="680" y2="520" />
            <line className="am-svg-grid-line" x1="800" y1="40" x2="800" y2="520" />

            <text className="am-svg-axis-lbl" x="200" y="30" textAnchor="middle">2026 Q2</text>
            <text className="am-svg-axis-lbl" x="320" y="30" textAnchor="middle">2026 Q3</text>
            <text className="am-svg-axis-lbl" x="440" y="30" textAnchor="middle">2026 Q4</text>
            <text className="am-svg-axis-lbl" x="560" y="30" textAnchor="middle">2027 Q1</text>
            <text className="am-svg-axis-lbl" x="680" y="30" textAnchor="middle">2027 Q2</text>
            <text className="am-svg-axis-lbl" x="800" y="30" textAnchor="middle">2027 Q3</text>
          </g>

          <line className="am-svg-today" x1="240" y1="40" x2="240" y2="520" />
          <text className="am-svg-today-lbl" x="244" y="50">TODAY</text>

          {/* SEPA */}
          <text className="am-svg-process-lbl" x="14" y="72">SEPA Payment Processing</text>
          <text className="am-svg-process-sub" x="14" y="86">SPP · Sara L.</text>
          <text className="am-svg-row-id" x="14" y="120">MIG-SPP-001</text>
          <text className="am-svg-row-lbl" x="14" y="134">Gateway + onboarding</text>
          <rect className="am-svg-gantt-bar-done" x="200" y="110" width="120" height="28" rx="4" />
          <text className="am-svg-gantt-bar-lbl" x="210" y="128">Gateway · done</text>
          <text className="am-svg-row-id" x="14" y="168">MIG-SPP-002</text>
          <text className="am-svg-row-lbl" x="14" y="182">Dual-write to legacy</text>
          <rect className="am-svg-gantt-bar-done" x="200" y="158" width="240" height="28" rx="4" />
          <text className="am-svg-gantt-bar-lbl" x="210" y="176">Dual-write · done</text>
          <text className="am-svg-row-id" x="14" y="216">MIG-SPP-003</text>
          <text className="am-svg-row-lbl" x="14" y="230">Legacy cutover · go-live</text>
          <rect className="am-svg-gantt-bar-flight" x="320" y="206" width="120" height="28" rx="4" />
          <text className="am-svg-gantt-bar-lbl" x="330" y="224">Cutover · in flight</text>
          <line className="am-svg-divider" x1="0" y1="250" x2="880" y2="250" />

          {/* DDMM */}
          <text className="am-svg-process-lbl" x="14" y="276">Direct Debit Mandate Management</text>
          <text className="am-svg-process-sub" x="14" y="290">DDMM · Theo R.</text>
          <text className="am-svg-row-id" x="14" y="318">MIG-DDMM-001</text>
          <text className="am-svg-row-lbl" x="14" y="332">Foundations &amp; SSO</text>
          <rect className="am-svg-gantt-bar-done" x="200" y="308" width="120" height="28" rx="4" />
          <text className="am-svg-gantt-bar-lbl" x="210" y="326">Foundations · done</text>
          <text className="am-svg-row-id" x="14" y="356">MIG-DDMM-002</text>
          <text className="am-svg-row-lbl" x="14" y="370">Mandate Hub · dual-write</text>
          <rect className="am-svg-gantt-bar-flight" x="200" y="346" width="360" height="28" rx="4" />
          <text className="am-svg-gantt-bar-lbl" x="210" y="364">Mandate Hub · in flight · 60%</text>
          <text className="am-svg-row-id" x="14" y="394">MIG-DDMM-003</text>
          <text className="am-svg-row-lbl" x="14" y="408">Outbound SEPA integration</text>
          <rect className="am-svg-gantt-bar-planned" x="440" y="384" width="240" height="28" rx="4" />
          <text className="am-svg-gantt-bar-lbl am-svg-gantt-bar-lbl-planned" x="450" y="402">Planned · 8-week window</text>
          <text className="am-svg-row-id" x="14" y="432">MIG-DDMM-004</text>
          <text className="am-svg-row-lbl" x="14" y="446">Legacy decommission</text>
          <rect className="am-svg-gantt-bar-planned" x="560" y="422" width="240" height="28" rx="4" />
          <text className="am-svg-gantt-bar-lbl am-svg-gantt-bar-lbl-planned" x="570" y="440">Cutover · go-live 2027 Q2</text>
          <line className="am-svg-divider" x1="0" y1="466" x2="880" y2="466" />

          {/* FR */}
          <text className="am-svg-process-lbl" x="14" y="490">Funds Release</text>
          <text className="am-svg-process-sub" x="14" y="504">FR · M. Holzhauser</text>
          <text className="am-svg-row-id" x="14" y="528">MIG-FR-001</text>
          <text className="am-svg-row-lbl" x="14" y="540">Scoring vendor onboarding (Quantexa)</text>
          <rect className="am-svg-gantt-bar-flight" x="320" y="518" width="240" height="28" rx="4" />
          <text className="am-svg-gantt-bar-lbl" x="330" y="536">Onboarding · in flight</text>

          {/* Dependency arrows */}
          <path className="am-svg-dep" d="M560 360 C 580 360, 580 398, 600 398" />
          <polygon className="am-svg-dep-arrow" points="600,398 594,394 594,402" />
          <path className="am-svg-dep" d="M680 398 C 700 398, 700 436, 720 436" />
          <polygon className="am-svg-dep-arrow" points="720,436 714,432 714,440" />
          <path className="am-svg-dep" d="M440 172 C 460 172, 460 410, 380 410" style={{ opacity: 0.35 }} />
          <text className="am-svg-axis-lbl" x="450" y="290" style={{ opacity: 0.55 }}>cross-process dep</text>
        </svg>
      </div>

      <div className="am-migration-summary">
        <div className="am-mig-stat"><div className="am-mig-stat-v">11</div><div className="am-mig-stat-l">total phases</div></div>
        <div className="am-mig-stat"><div className="am-mig-stat-v am-mig-stat-v-hi">3</div><div className="am-mig-stat-l">done</div></div>
        <div className="am-mig-stat"><div className="am-mig-stat-v am-mig-stat-v-mid">3</div><div className="am-mig-stat-l">in flight</div></div>
        <div className="am-mig-stat"><div className="am-mig-stat-v">5</div><div className="am-mig-stat-l">planned</div></div>
      </div>

      <div className="am-resource-alert">
        ⚠ resource alert — solution-architect bandwidth overlaps in 2026 Q4:
        SEPA cutover (MIG-SPP-003) and Mandate Hub mid-flight (MIG-DDMM-002)
        both need the same solution architect
      </div>
    </>
  );
}

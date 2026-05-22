"use client";

// Cross-process Library views in the ArchitectMiner shell.
// Each component renders the <main> column inside HandoffInbox when the user
// clicks the matching item in the Library sidebar group. All content is
// mock; the library is a static reference until the architect data model
// lands. JSX ports from public/architectminer.html frames 12-15.

export function CapabilityCatalog() {
  return (
    <>
      <div className="am-lib-head">
        <h1>Capability catalog</h1>
        <p className="am-sub">
          47 capabilities authored across 12 processes · 18 used in 2+ processes ·
          check before declaring &ldquo;new&rdquo;
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">47</span></button>
        <button type="button" className="am-chip">Reused <span className="am-chip-n">18</span></button>
        <button type="button" className="am-chip">Critical <span className="am-chip-n">12</span></button>
        <button type="button" className="am-chip">Customer-facing <span className="am-chip-n">9</span></button>
        <button type="button" className="am-chip">Risk &amp; KYC <span className="am-chip-n">7</span></button>
        <button type="button" className="am-chip">Payments <span className="am-chip-n">11</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search by name, ID or hosted-in app…" />
      </div>

      <div className="am-cat-grid">
        <CatalogCard id="CAP-CAT-001" name="Customer identification" reuse={8} reuseClass="hi" critical host="Customer Master" hostTag="KEEP" procs={["Periodic Review", "DDM", "SEPA", "+5 more"]} prov="verified" provText="stable · owned by customer-master team" />
        <CatalogCard id="CAP-CAT-005" name="KYC refresh" reuse={6} reuseClass="hi" critical host="KYC Engine" hostTag="CONFIGURE" procs={["Account Opening", "EDR", "+4 more"]} prov="verified" provText="stable · group standard" />
        <CatalogCard id="CAP-CAT-012" name="Case orchestration" reuse={5} reuseClass="hi" high host="Case Hub" hostTag="BUILD" procs={["DDM", "Funds Release", "+3 more"]} prov="machine" provText="proposed for reuse · pending architect council" selected />
        <CatalogCard id="CAP-CAT-017" name="Document collection" reuse={4} host="Hyland ECM" hostTag="KEEP" procs={["Account Opening", "+3 more"]} prov="verified" provText="stable" />
        <CatalogCard id="CAP-CAT-023" name="Risk scoring" reuse={4} high host="Risk Score Service" hostTag="BUY" procs={["EDR", "Funds Release", "SEPA"]} prov="verified" provText="vendor-supported" />
        <CatalogCard id="CAP-CAT-031" name="Audit reporting" reuse={3} host="DWH (Snowflake)" hostTag="KEEP" procs={["DDM", "SEPA"]} prov="verified" provText="regulatory baseline" />
        <CatalogCard id="CAP-CAT-038" name="Mandate capture & validation" reuse={1} reuseClass="solo" high host="Mandate Hub" hostTag="BUILD" procs={["DDM"]} prov="machine" provText="new · DDM-specific" />
        <CatalogCard id="CAP-CAT-042" name="Guarantee issuance" reuse={1} reuseClass="solo" high host="Trade Finance Platform" hostTag="KEEP" procs={["Bank Guarantee Issuance"]} prov="verified" provText="trade-specific" />
        <CatalogCard id="CAP-CAT-044" name="SEPA outbound" reuse={1} reuseClass="solo" critical host="SEPA Gateway" hostTag="KEEP" procs={["SEPA Payment"]} prov="verified" provText="payments-specific" />
      </div>
    </>
  );
}

function CatalogCard({
  id, name, reuse, reuseClass, critical, high, host, hostTag, procs, prov, provText, selected,
}: {
  id: string;
  name: string;
  reuse: number;
  reuseClass?: "hi" | "solo";
  critical?: boolean;
  high?: boolean;
  host: string;
  hostTag: "BUILD" | "BUY" | "CONFIGURE" | "KEEP";
  procs: string[];
  prov: "verified" | "machine";
  provText: string;
  selected?: boolean;
}) {
  const reuseLabel = reuse === 1 ? `solo · ${procs[0]}` : `${reuseClass === "hi" ? "★ " : ""}used in ${reuse}`;
  return (
    <div className={`am-canvas-cap-card${selected ? " am-canvas-cap-card-sel" : ""}`}>
      <div className="am-canvas-cap-head">
        <span className="am-canvas-cap-id">{id}</span>
        <span className={`am-reuse-pill${reuseClass ? ` am-reuse-pill-${reuseClass}` : ""}`}>{reuseLabel}</span>
      </div>
      <div className="am-canvas-cap-name">{name}</div>
      <div className="am-canvas-cap-meta">
        {critical && <span className="am-pill am-pill-neu">Critical</span>}
        {high && <span className="am-pill am-pill-mid">High</span>}
      </div>
      <div className="am-canvas-cap-host">
        hosted in: <b>{host}</b> <span className={`am-verdict am-verdict-${hostTag.toLowerCase()}`}>{hostTag}</span>
      </div>
      <div className="am-cat-procs">
        {procs.map((p, i) => <span key={i} className="am-cat-pchip">{p}</span>)}
      </div>
      <div className={`am-canvas-cap-prov am-canvas-cap-prov-${prov}`}>
        {prov === "verified" ? "✓" : "▲"} {provText}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------
export function ApplicationRegister() {
  return (
    <>
      <div className="am-lib-head">
        <h1>Application register</h1>
        <p className="am-sub">
          28 applications across the bank · 19 KEEP / 4 BUILD / 3 BUY / 2 CONFIGURE ·
          governed by EA council
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">28</span></button>
        <button type="button" className="am-chip">BUILD <span className="am-chip-n">4</span></button>
        <button type="button" className="am-chip">BUY <span className="am-chip-n">3</span></button>
        <button type="button" className="am-chip">CONFIGURE <span className="am-chip-n">2</span></button>
        <button type="button" className="am-chip">KEEP <span className="am-chip-n">19</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search by name, vendor or capability…" />
      </div>

      <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
        <thead>
          <tr>
            <th style={{ width: "22%" }}>Application</th>
            <th>Verdict</th>
            <th>Vendor / tech</th>
            <th>Capabilities hosted</th>
            <th>Used by</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <RegisterRow selected name="Customer Master" id="APP-REG-001" domain="customer · core data" verdict="keep" tech="Oracle Siebel" techSub="vendor-supported · group-wide" caps={["customer identification", "party data"]} usedBy="+ 8 processes" status="Active" statusTone="hi" />
          <RegisterRow name="Case Hub" id="APP-REG-014" domain="case & lifecycle" verdict="build" tech="Camunda 8 + Postgres" techSub="self-hosted · eu-frankfurt" caps={["case orchestration", "case lifecycle"]} usedBy={["PR", "DDM", "+3 more"]} status="In flight" statusTone="mid" />
          <RegisterRow name="KYC Engine" id="APP-REG-007" domain="risk & KYC" verdict="configure" tech="Fenergo" techSub="vendor · 2-week config window" caps={["KYC refresh", "KYC onboarding"]} usedBy="+ 6 processes" status="Active" statusTone="hi" />
          <RegisterRow name="Risk Score Service" id="APP-REG-021" domain="risk & KYC" verdict="buy" tech="Quantexa" techSub="SaaS · €240k/yr · 8-week onboarding" caps={["risk scoring"]} usedBy="+ 4 processes" status="Onboarding" statusTone="mid" />
          <RegisterRow name="Hyland ECM" id="APP-REG-009" domain="document store" verdict="keep" tech="OnBase" techSub="existing · keep as-is" caps={["document collection"]} usedBy="+ 4 processes" status="Active" statusTone="hi" />
          <RegisterRow name="DWH (Snowflake)" id="APP-REG-002" domain="reporting & analytics" verdict="keep" tech="Snowflake" techSub="SaaS · multi-tenant marts" caps={["audit reporting", "regulatory feeds"]} usedBy="+ 12 processes" status="Active" statusTone="hi" />
          <RegisterRow name="Mandate Hub" id="APP-REG-018" domain="payments · mandates" verdict="build" tech="Camunda 8 + Postgres" techSub="self-hosted · in-flight" caps={["mandate capture", "mandate lifecycle"]} usedBy={["DDM"]} status="In flight" statusTone="mid" />
          <RegisterRow name="SEPA Gateway" id="APP-REG-024" domain="payments" verdict="keep" tech="in-house · Java 21" techSub="existing · STEP2/T2" caps={["SEPA outbound"]} usedBy={["SEPA Payment"]} status="Active" statusTone="hi" />
          <RegisterRow name="Keycloak" id="APP-REG-005" domain="identity & access" verdict="keep" tech="Red Hat SSO" techSub="existing · OIDC + SAML" caps={["SSO", "authz"]} usedBy="+ 12 processes" status="Active" statusTone="hi" />
        </tbody>
      </table>
    </>
  );
}

function RegisterRow({
  selected, name, id, domain, verdict, tech, techSub, caps, usedBy, status, statusTone,
}: {
  selected?: boolean;
  name: string;
  id: string;
  domain: string;
  verdict: "build" | "buy" | "configure" | "keep";
  tech: string;
  techSub: string;
  caps: string[];
  usedBy: string | string[];
  status: string;
  statusTone: "hi" | "mid";
}) {
  return (
    <tr className={selected ? "am-canvas-app-sel" : undefined}>
      <td>
        <div className="am-canvas-app-name">{name}</div>
        <div className="am-canvas-app-id">{id}</div>
        <div className="am-app-domain">{domain}</div>
      </td>
      <td><span className={`am-verdict am-verdict-${verdict}`}>{verdict.toUpperCase()}</span></td>
      <td>
        <div>{tech}</div>
        <div className="am-canvas-app-stack">{techSub}</div>
      </td>
      <td>
        <div className="am-canvas-app-chips">
          {caps.map((c, i) => <span key={i} className="am-canvas-app-chip">{c}</span>)}
        </div>
      </td>
      <td>
        <div className="am-cat-procs">
          {typeof usedBy === "string"
            ? <span className="am-cat-pchip">{usedBy}</span>
            : usedBy.map((p, i) => <span key={i} className="am-cat-pchip">{p}</span>)}
        </div>
      </td>
      <td><span className={`am-pill am-pill-${statusTone}`}><span className="am-dot" />{status}</span></td>
    </tr>
  );
}


// ---------------------------------------------------------------------
export function NfrTemplates() {
  return (
    <>
      <div className="am-lib-head">
        <h1>NFR templates</h1>
        <p className="am-sub">
          22 reusable NFR patterns · derive from group standards ·
          5 perf / 4 avail / 6 sec / 4 comp / 3 scale
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">22</span></button>
        <button type="button" className="am-chip">Performance <span className="am-chip-n">5</span></button>
        <button type="button" className="am-chip">Availability <span className="am-chip-n">4</span></button>
        <button type="button" className="am-chip">Security <span className="am-chip-n">6</span></button>
        <button type="button" className="am-chip">Compliance <span className="am-chip-n">4</span></button>
        <button type="button" className="am-chip">Scalability <span className="am-chip-n">3</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search templates…" />
      </div>

      <NfrTmplGroup title="Performance" count={5}>
        <NfrTmplCard id="TPL-NFR-001" cat="perf" name="Customer-facing API latency" target="p95 < 1.2s · p99 < 2.5s" satisfies={["CP-LAT-001", "CP-LAT-002"]} reuse={8} />
        <NfrTmplCard selected id="TPL-NFR-002" cat="perf" name="Bulk batch throughput" target="≥ 1k records / min" satisfies={["CP-BATCH-002"]} reuse={11} reuseClass="hi" />
        <NfrTmplCard id="TPL-NFR-003" cat="perf" name="Internal API latency" target="p95 < 800ms" satisfies={["CP-LAT-001"]} reuse={4} />
        <NfrTmplCard id="TPL-NFR-004" cat="perf" name="Cold-start budget" target="< 5s on container boot" satisfies={["CP-PERF-007"]} reuse={2} reuseClass="solo" />
      </NfrTmplGroup>

      <NfrTmplGroup title="Availability" count={4}>
        <NfrTmplCard id="TPL-NFR-006" cat="avail" name="Critical-system RTO" target="RTO ≤ 4h" satisfies={["CP-BCP-001", "DORA art. 12"]} reuse={14} reuseClass="hi" />
        <NfrTmplCard id="TPL-NFR-007" cat="avail" name="Critical-system RPO" target="RPO ≤ 15 min" satisfies={["CP-BCP-001"]} reuse={12} reuseClass="hi" />
        <NfrTmplCard id="TPL-NFR-008" cat="avail" name="SLA target" target="99.9% · monthly" satisfies={["CP-SLA-001"]} reuse={6} />
      </NfrTmplGroup>

      <NfrTmplGroup title="Security" count={6}>
        <NfrTmplCard id="TPL-NFR-011" cat="sec" name="Encryption in transit" target="TLS 1.3 · mTLS" satisfies={["CP-SEC-001", "DORA art. 9"]} reuse={18} reuseClass="hi" />
        <NfrTmplCard id="TPL-NFR-012" cat="sec" name="Encryption at rest" target="AES-256 · KMS-rotated" satisfies={["CP-SEC-002"]} reuse={16} reuseClass="hi" />
        <NfrTmplCard id="TPL-NFR-013" cat="sec" name="Segregation of duties" target="reviewer ≠ approver" satisfies={["CP-SoD-001", "CP-SoD-002"]} reuse={9} />
      </NfrTmplGroup>

      <NfrTmplGroup title="Compliance" count={4}>
        <NfrTmplCard id="TPL-NFR-017" cat="comp" name="Audit-log retention" target="10 years · immutable" satisfies={["PSD2 §95", "MaRisk"]} reuse={13} reuseClass="hi" />
        <NfrTmplCard id="TPL-NFR-018" cat="comp" name="PII data residency" target="EU-only" satisfies={["GDPR", "BAFIN MaRisk"]} reuse={11} reuseClass="hi" />
      </NfrTmplGroup>
    </>
  );
}

function NfrTmplGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="am-nfr-tmpl-group">
      <div className="am-nfr-tmpl-head">
        <h3>{title}</h3>
        <span className="am-nfr-tmpl-count">{count} templates</span>
      </div>
      <div className="am-nfr-tmpl-cards">{children}</div>
    </div>
  );
}

function NfrTmplCard({
  selected, id, cat, name, target, satisfies, reuse, reuseClass,
}: {
  selected?: boolean;
  id: string;
  cat: "perf" | "avail" | "sec" | "comp" | "scale";
  name: string;
  target: string;
  satisfies: string[];
  reuse: number;
  reuseClass?: "hi" | "solo";
}) {
  return (
    <div className={`am-nfr-tmpl-card${selected ? " am-nfr-tmpl-card-sel" : ""}`}>
      <div className="am-nfr-tmpl-head-row">
        <span className="am-nfr-tmpl-id">{id}</span>
        <span className={`am-nfr-cat am-nfr-cat-${cat}`}>{cat.toUpperCase()}</span>
        <span className={`am-reuse-pill${reuseClass ? ` am-reuse-pill-${reuseClass}` : ""}`} style={{ marginLeft: "auto" }}>
          {reuseClass === "hi" ? "★ " : ""}used in {reuse}
        </span>
      </div>
      <div className="am-nfr-tmpl-name">{name}</div>
      <div className="am-nfr-tmpl-target">{target}</div>
      <div className="am-nfr-tmpl-traces">
        <span className="am-nfr-tmpl-traces-lbl">satisfies</span>
        {satisfies.map((s, i) => <span key={i}>{s}</span>)}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------
export function PatternLibrary() {
  return (
    <>
      <div className="am-lib-head">
        <h1>Pattern library</h1>
        <p className="am-sub">
          14 architecture patterns · grouped by concern ·
          cite from ADRs to make decisions reviewable
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">14</span></button>
        <button type="button" className="am-chip">Data <span className="am-chip-n">3</span></button>
        <button type="button" className="am-chip">Integration <span className="am-chip-n">4</span></button>
        <button type="button" className="am-chip">Messaging <span className="am-chip-n">3</span></button>
        <button type="button" className="am-chip">Security <span className="am-chip-n">2</span></button>
        <button type="button" className="am-chip">Operations <span className="am-chip-n">2</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search patterns…" />
      </div>

      <div className="am-pattern-grid">
        <PatternCard
          selected
          name="Outbox + CDC"
          cat="msg"
          catLabel="MESSAGING"
          reuse={7}
          reuseClass="hi"
          summary="Write domain events to a Postgres outbox table inside the same transaction as the business write, then publish via Debezium / Kafka. Guarantees at-least-once delivery without distributed transactions."
          pros={["Need atomicity between DB write and event publish", "Existing Postgres infrastructure", "Cross-system state replication"]}
          cons={["NoSQL primary store", "Sub-100ms latency requirement"]}
          usedBy="ADR-PR-008 · ADR-DDM-004 · +5"
        />
        <PatternCard
          name="Saga (choreography)"
          cat="msg"
          catLabel="MESSAGING"
          reuse={4}
          summary="Long-running business transaction implemented as a chain of local transactions, each publishing an event that triggers the next. Compensating events on failure."
          pros={["Multi-system workflow with rollback needs", "No central orchestrator available"]}
          cons={["Cycle detection / tracing is critical (use orchestration)", "Single-system flow"]}
          usedBy="ADR-DDM-007 · ADR-FR-003 · +2"
        />
        <PatternCard
          name="CQRS"
          cat="data"
          catLabel="DATA"
          reuse={3}
          summary="Separate read and write models. Write side publishes events; read side projects them into denormalised stores tuned for query patterns."
          pros={["Read load >> write load", "Multiple distinct read shapes"]}
          cons={["Eventual consistency unacceptable", "Simple CRUD workload"]}
          usedBy="ADR-SPP-002 · ADR-DDM-006"
        />
        <PatternCard
          name="API Gateway + BFF"
          cat="int"
          catLabel="INTEGRATION"
          reuse={9}
          reuseClass="hi"
          summary="Single entry point (Kong / Apigee) handles auth, rate-limit, routing; per-channel BFF (backend-for-frontend) handles channel-specific composition."
          pros={["Multiple channels (web, mobile, branch)", "Need uniform auth / observability"]}
          cons={["Single internal consumer"]}
          usedBy="ADR-DDM-001 · +7"
        />
        <PatternCard
          name="Idempotency key"
          cat="int"
          catLabel="INTEGRATION"
          reuse={5}
          summary="Client supplies a stable key on every retryable write; server de-duplicates on that key with a TTL."
          pros={["Retryable operations (payments, mandate ops)", "Network-unreliable clients"]}
          cons={["Naturally idempotent reads"]}
          usedBy="ADR-SPP-001 · ADR-DDM-005 · +3"
        />
        <PatternCard
          name="Zero-trust mTLS"
          cat="sec"
          catLabel="SECURITY"
          reuse={8}
          reuseClass="hi"
          summary="Every service-to-service call authenticated with mutual TLS; certificates issued by a short-lived workload identity provider (SPIRE / Istio)."
          pros={["Multi-tenant cluster", "Regulatory pressure on internal traffic (DORA)"]}
          cons={["Single-process monolith"]}
          usedBy="ADR-DDM-009 · +6"
        />
        <PatternCard
          name="Circuit breaker"
          cat="ops"
          catLabel="OPS"
          reuse={4}
          summary="Wrap calls to a flaky downstream in a breaker that opens after N failures, returns a fallback for a cool-off period, then half-opens to probe recovery."
          pros={["Downstream is vendor or external", "Cascading failures observed"]}
          cons={["Hard consistency required (no fallback safe)"]}
          usedBy="ADR-FR-004 · +2"
        />
        <PatternCard
          name="Strangler fig"
          cat="ops"
          catLabel="OPS"
          reuse={3}
          summary="Route increasing percentages of traffic from a legacy system to its replacement while both run side-by-side; decommission once 100% cuts over."
          pros={["Risk-averse legacy migration", "Independent rollback per traffic slice"]}
          cons={["Hard cutover required by regulator"]}
          usedBy="MIG-DDM-001"
        />
      </div>
    </>
  );
}

function PatternCard({
  selected, name, cat, catLabel, reuse, reuseClass, summary, pros, cons, usedBy,
}: {
  selected?: boolean;
  name: string;
  cat: "data" | "int" | "msg" | "sec" | "ops";
  catLabel: string;
  reuse: number;
  reuseClass?: "hi";
  summary: string;
  pros: string[];
  cons: string[];
  usedBy: string;
}) {
  return (
    <div className={`am-pattern-card${selected ? " am-pattern-card-sel" : ""}`}>
      <div className="am-pattern-head">
        <span className="am-pattern-name">{name}</span>
        <span className={`am-pattern-cat am-pattern-cat-${cat}`}>{catLabel}</span>
        <span className={`am-reuse-pill${reuseClass ? ` am-reuse-pill-${reuseClass}` : ""}`} style={{ marginLeft: "auto" }}>
          {reuseClass === "hi" ? "★ " : ""}used in {reuse} ADRs
        </span>
      </div>
      <div className="am-pattern-summary">{summary}</div>
      <div className="am-pattern-list">
        <div className="am-pattern-list-lbl">When to use</div>
        <ul>{pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
      <div className="am-pattern-list">
        <div className="am-pattern-list-lbl">When not</div>
        <ul>{cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>
      <div className="am-pattern-foot">Used by: {usedBy}</div>
    </div>
  );
}

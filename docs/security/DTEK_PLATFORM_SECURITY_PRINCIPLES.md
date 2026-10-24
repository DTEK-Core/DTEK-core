# DTEK Platform Security Principles

`Статус: mandatory planning baseline / controls not yet implemented`
`Дата: 24.10.2026`
`Область: Business, Home, Personal, Exposure, Knowledge`

---

## 1. Security Preconditions

Расширение платформы запрещено до закрытия
`tasks/SECURITY_STABILIZATION_GATE.md`. Workspace и consumer modes увеличивают
blast radius текущих profile/RLS проблем, поэтому не могут быть реализованы
параллельно с Gate.

---

## 2. Trust Boundaries

| Boundary | Обязательный контроль |
|---|---|
| Account → Workspace | active membership, server-selected context, RLS |
| Workspace → Data | `workspace_id`, composite tenant FK, deny-by-default policies |
| Source → Evidence | authentication, provenance, validation, quarantine |
| Evidence → Finding | versioned rule, confidence, explainability |
| Finding → Risk/Score | policy/review gate, no silent projection |
| Cloud → Collector | pairing, signed short-lived credentials, scoped jobs |
| User → Scan target | ownership/authorization proof, explicit scope, expiry |
| Provider → Personal data | allowlisted contract, minimization, retention, audit |

---

## 3. Consent And Ownership

- Business assessment requires an authorized organization owner and recorded
  scope statement.
- Home discovery requires local pairing from the target network and explicit
  device/network scope.
- Personal checks accept only verified identifiers owned or controlled by the
  user. Unverified identifiers cannot start enrichment.
- Consent records include purpose, data categories, source, expiry, withdrawal
  and policy version.
- Withdrawal stops future collection and starts the documented deletion or
  retention workflow.

The final legal basis, operator duties, localization and notification process
must be reviewed for the deployment jurisdiction before Personal pilot. For the
Russian market, planning must account for Federal Law No. 152-FZ and current
Roskomnadzor operator guidance; product documentation is not legal advice.

Official references:

- https://pravo.gov.ru/ — official legal-information portal;
- https://82.rkn.gov.ru/directions/pers/p15375/ — Roskomnadzor operator guidance.

---

## 4. Personal And Breach Data

Never store or display:

- plaintext or recoverable leaked passwords;
- complete breach dumps;
- secrets/tokens/session material;
- private content unrelated to an explicit user request;
- profiles of unrelated third parties;
- provider payload not required for a finding.

Store only minimized result: verified identifier reference, exposure category,
source/provider reference, observed date, confidence, remediation status and
retention deadline. Sensitive identifiers should be encrypted or keyed-hashed
where exact plaintext is not needed.

---

## 5. OSINT And Abuse Prevention

DTEK Exposure is defensive self-assessment, not people search.

- verified ownership before personal identifier lookup;
- domain control proof for deeper domain assessment;
- public-source and licensed-provider allowlist;
- purpose-bound query and immutable audit;
- per-account/workspace/identifier rate and cost limits;
- no wildcard enumeration, relationship inference or bulk people search;
- no export of raw personal-source results;
- anomaly detection, suspension and abuse review;
- clear Terms of Use and reporting channel.

URL/domain fetchers apply OWASP SSRF guidance: canonical parsing, allowed
schemes, DNS/IP classification, redirect revalidation, metadata/loopback/private
range controls and strict time/size limits:
https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html

---

## 6. Scanner And Collector Security

- scanners run outside the web request process in a sandboxed least-privilege
  runtime;
- checks are code-owned and versioned; user input cannot become executable
  command or arbitrary flags;
- collector has unique identity, rotation, revoke and last-seen state;
- jobs are signed, scoped, expiring and replay-protected;
- no inbound cloud-to-home connection; collector pulls authorized work;
- execution enforces CPU, memory, process, time, network and result limits;
- updates are signed and support rollback;
- raw outputs are treated as hostile input;
- logs redact credentials, personal identifiers and internal topology.

OWASP command-injection guidance requires structured process APIs and allowlist
validation rather than shell interpolation:
https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html

---

## 7. API And Resource Controls

Expensive search, scan, enrichment and export endpoints require:

- per-user, per-workspace and per-target rate limits;
- maximum targets, depth, records, response bytes and execution time;
- concurrency and provider-spend limits;
- idempotency keys and replay prevention;
- cancellation and backpressure;
- safe pagination;
- authorization on object and property level;
- metrics without raw sensitive payload.

The baseline follows OWASP API4 resource-consumption controls:
https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/

---

## 8. Workspace Isolation

Every new multi-tenant table must prove:

- direct API cannot select, insert, update or delete another workspace row;
- foreign UUID does not bypass RLS;
- all relation endpoints share the same workspace;
- background/service jobs carry immutable workspace context;
- service credentials do not replace authorization;
- blocked membership and revoked collector immediately lose access;
- Personal, Home and Business records cannot be linked across workspaces by
  user-controlled identifiers.

Automated tests use at least two workspaces of different modes and negative
cross-mode cases.

---

## 9. Knowledge Safety

- remediation content is versioned, reviewed and attributed;
- destructive steps require warnings, backup and rollback;
- verification steps are safe and bounded;
- exploit code, credential theft and evasion instructions are excluded;
- generated text never silently becomes approved guidance;
- platform/version applicability and stale-content state are visible.

---

## 10. Security Gates By Phase

| Phase | Required evidence |
|---|---|
| Security Gate | SEC-01–04, STAB-01–05 PASS |
| Platform Foundation | workspace isolation, consent, evidence/finding tests |
| Business Discovery | connector SSRF/secrets/two-tenant tests |
| Home MVP | collector threat model, signed pairing, sandbox and local-scope tests |
| Personal MVP | privacy review, ownership verification, deletion/retention tests |
| Exposure/OSINT | provider review, abuse simulation, rate/cost controls |
| Platform Release | authenticated multi-mode QA, incident/restore rehearsal |

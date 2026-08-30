# Web R5 / M2 – G1 cross-surface content map

**State:** G1 prepared from founder lock; production implementation remains G3

**Scope:** English public surfaces only

## 1. Global locked statements

| Item | Canonical implementation value |
|---|---|
| Current product state | `Controlled-case validation of the governed Evidence Pack workflow – in progress.` |
| Product history | Idea completed → Product Concept and Illustrative Prototypes completed → Proof of Concept current → Paid Pilot next → Commercial Deployment target |
| Institution entry | Evidence Readiness Check; this is a separate axis from product history |
| Primary case | Fischamend, Lower Austria – Vienna Airport logistics park observation area |
| Secondary case | D4 infrastructure example; independent AOI and evidence review required |
| Status | `WATCH – EVIDENCE SUFFICIENCY`; evidence state, not project rating |
| Primary CTA | `View the Austrian Evidence Pack` |
| Secondary CTA | `Discuss an Evidence Readiness Check` |
| Investor CTA | Exact locked `mailto:investors@3brain.ai?subject=Request%3A%203BrainAI%20investor%20materials` |
| Public boundary | Human-reviewed decision support; no autonomous credit/payment decision and no deployed-customer claim |

## 2. Homepage – `/index.html`

### Current mismatch

- Hero says `Current – product development / Illustrative Evidence Pack
  prototypes`.
- The dominant cases are Lausitz and German North Sea.
- The primary CTA asks for an Evidence Pack prototype and the second asks to
  discuss a PoC.

### G3 mapping

| Existing surface | Required M2 result |
|---|---|
| Hero H1 | `Turn dated project evidence into a reviewable decision-support record.` |
| Hero lead | Governed Evidence Pack workflow for physical-asset risk; declared, observed and responsible human review explicitly separated |
| Maturity marker | Current PoC / controlled-case validation in progress |
| Primary CTA | `View the Austrian Evidence Pack` → `#portfolio` |
| Secondary CTA | `Discuss an Evidence Readiness Check` → `/validation/#readiness-form` |
| Evidence section | New `#portfolio` section: Fischamend primary; D4 secondary |
| Investor route | Restrained text link to `/investors/` after the bank-first actions |

The existing `#evidence-pack-sample` block remains available until its archive
position is explicitly implemented. Existing inbound fragments must not break.

## 3. CRI – `/cri/index.html`

### Current mismatch

- Hero maturity remains at general product development.
- Existing content explains the Evidence Pack well, but does not present the
  founder-locked four-part mechanism as one explicit review grammar.

### G3 mapping

- Replace the maturity marker with current controlled-case PoC wording.
- Add or refactor one mechanism row in this exact semantic order:
  `Declared review context` → `Observed dated evidence` → `Governed uncertainty
  and reasons` → `Human-review state`.
- Retain existing-controls, Evidence Pack and target-workflow content where it
  does not duplicate the new row.
- Keep Earth Observation as an input rather than the customer-facing product.
- Route the public example through the new portfolio/Fischamend path.

## 4. Validation – `/validation/index.html`

### Current mismatch

The current stage rail begins with `Current – product development` and then
mixes Evidence Readiness Check, PoC, Paid Pilot and Commercial Deployment into
one line. It therefore merges product history with institution engagement.

### G3 mapping

Create two visibly and semantically independent blocks:

1. **Product maturity – complete history**
   - Idea and problem definition – Completed
   - Product concept and illustrative prototypes – Completed
   - Proof of Concept – Current
   - Paid Pilot – Next
   - Commercial Deployment – Target
2. **Institution-specific engagement – separate axis**
   - Evidence Readiness Check – Entry gate
   - Institution-specific validation – As agreed
   - Paid Pilot – Contracted
   - Commercial Deployment – Accepted

The page hero must state that PoC is current/in progress. Existing shadow-mode,
readiness criteria, boundaries, Q&A and contact form remain useful and should be
preserved unless a direct contradiction is found.

## 5. Investors – `/investors/index.html`

### Current mismatch

- Hero and commercial-maturity sections still place the product before PoC.
- The current rail mixes maturity with institution engagement.

### G3 mapping

- Use `Public discipline, private diligence depth.` as the primary investor
  framing; retain the bank-first wedge as supporting logic.
- State the current controlled-case PoC and next contracted paid-pilot gate.
- Keep private market sizing, financing assumptions and detailed scenarios
  outside the public page.
- Preserve the exact locked investor `mailto:` action.
- Link public evidence first to Fischamend/portfolio rather than silently to one
  of the older German cases.
- Do not repeat a mixed maturity/engagement rail; refer to the full validation
  history or present a concise PoC → paid-pilot → target deployment path with
  correct labels.

## 6. Shared CSS – `/assets/css/style.css`

G3 may integrate the founder-approved hierarchy, spacing, card, badge, focus,
touch-target, responsive and reduced-motion behaviour. New rules should be
namespaced to the M2 components where possible. Existing unrelated selectors
must not be replaced wholesale.

## 7. Surfaces deliberately outside G1/G3

- `/mis/` – archival artefact; untouched.
- Czech and German placeholders – no translation or maturity update in this
  bounded English implementation unless separately authorised.
- Legal, privacy, security and imprint pages – no content change.
- D4 evidence details – unavailable and must not be invented.

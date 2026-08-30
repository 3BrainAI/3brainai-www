# R3 Homepage Integration Checkpoint

**Issue:** `R3 Homepage Integration – CRI-first structure below the approved hero`

**Checkpoint date:** 4 August 2026

**Working branch:** `work/r3-homepage-integration`

**Base branch:** `redesign/r3-day-one`

**Base HEAD before integration:** `4b4b6253a6b6bfacc167488e8a1f0d28c96e3a1e`

**K1 candidate HEAD:** `5857f35d78db807ef88d279694aacee91f8a31de`

**Status:** Homepage integration is visually approved after the KIMI K1 correction and has passed the deterministic GitHub Actions review gate. The checkpoint itself still requires its final CI run before PR #5 is merged into `redesign/r3-day-one`.

## Completed scope

The approved CRI-first hero and public-safe Evidence Pack remain the primary homepage entry. Legacy homepage sections below the hero were replaced with this sequence:

1. Evidence gap
2. Evidence Pack proof
3. Observed vs Declared
4. How it works
5. Validation path
6. Governance Layer – secondary
7. Founder/company proof
8. Final CTA

The homepage navigation is CRI-first and uses existing routes or valid homepage anchors. Navigation on other routes remains outside this issue.

## Approved hero integrity

- approved H1 and supporting copy preserved;
- approved CTA copy preserved;
- approved Evidence Pack content preserved;
- WATCH remains a restrained dot-plus-text status;
- `Human review – Required` appears exactly once in Assessment metadata;
- Findings and Uncertainty retain the approved visual hierarchy;
- Sentinel remains an explicitly labelled placeholder;
- no audit trail was added to the hero;
- only the permitted non-breaking hyphen in `physical-asset` was introduced.

## KIMI visual review

Independent implementation review returned `APPROVE WITH P1 CORRECTIONS`.

### K1 – resolved

The Evidence Pack anchor evidence originally captured an intermediate smooth-scroll position. The source already contained a 96 px scroll margin, but the screenshot was taken before scrolling settled.

Correction:

- the sticky-header offset is now an explicit design token;
- logical and physical scroll-margin properties use that token;
- Playwright waits for the target to settle below the sticky header;
- Playwright verifies the primary label, title and WATCH status in the viewport at 1280 and 390 px;
- deterministic desktop and mobile anchor-target screenshots are produced.

Acceptance result: passed on desktop and mobile. The complete top edge of the Evidence Pack is visible below the sticky header.

### Deferred P2 observations

- K2: optional future reduction of unused vertical space in the desktop hero Evidence Pack;
- K3: optional measured contrast check for Governance Layer body and label tokens.

Neither P2 observation blocks this integration.

## Deterministic validation evidence

**GitHub Actions workflow:** `R3 review checks`

**Successful K1 run:** `30897009643`

**Artifact:** `r3-review-30897009643`

**Artifact ID:** `8887459252`

**Artifact digest:** `sha256:39f840923974a6c23c55e4f189cfa85771f897318d5958b4609f349575990ba2`

Passed checks:

- pull-request whitespace check;
- HTML validation;
- CSS validation;
- 10 Playwright tests;
- section-order verification;
- local route and anchor verification;
- horizontal-overflow checks at 320, 390, 768, 1280 and 1920 px;
- Evidence Pack review-safety invariants;
- desktop and mobile anchor-offset acceptance test;
- deterministic screenshot generation and artifact upload.

## Review screenshots

The CI artifact contains eight native Playwright captures:

1. `r3-homepage-1280.png` – desktop full page
2. `r3-homepage-390.png` – mobile full page
3. `r3-homepage-desktop-1280.png` – desktop top viewport
4. `r3-homepage-mobile-390.png` – mobile top viewport
5. `r3-evidence-pack-mobile-390.png` – complete mobile Evidence Pack
6. `r3-evidence-pack-target-desktop-1280.png` – corrected desktop anchor state
7. `r3-evidence-pack-target-mobile-390.png` – corrected mobile anchor state
8. `r3-evidence-pack-closeup-1280.png` – desktop component close-up

The two corrected anchor captures were opened and visually verified after the successful run. They show the Evidence Pack primary label, title and WATCH status once, below the sticky header.

Earlier manually assembled screenshot montages are superseded by these GitHub Actions artefacts and are not release evidence.

## Files changed by PR #5

- `index.html`
- `assets/css/style.css`
- `docs/redesign-r3/01-homepage-integration-checkpoint.md`
- `tests/r3-homepage.spec.mjs`

The test specification changed only to encode the approved K1 acceptance contract and to produce the mobile anchor-target screenshot.

## Claims and IP boundary

- no real location is used;
- no borrower wording is used;
- no thresholds, machine reason codes or escalation rules are exposed;
- no live customer, pilot or automated-decision implication is introduced;
- no unverified partner or infrastructure claim is introduced;
- all product examples remain synthetic and public-safe;
- human review remains mandatory and visible.

## Production blockers and known follow-ups

1. Sentinel production use remains blocked until the approved original, exact acquisition date, processing status and Copernicus attribution are confirmed.
2. CRI-first navigation is homepage-only; site-wide navigation synchronization requires a separate bounded issue.
3. Dedicated staging and GitHub Pages source settings remain unconfirmed.
4. KIMI K2 and K3 remain optional non-blocking visual checks.

## Release safety

- PR #5 targets `redesign/r3-day-one`, not `main`;
- PR #4 remains the draft release PR to `main`;
- `main` remains unchanged at `8c02ad907bd7a979ca63371e65bb06674867cb0f` at this checkpoint;
- GitHub Pages settings are unchanged;
- no staging or production deployment was performed.

## Exact next step

Commit and push this checkpoint, require one final green `R3 review checks` run, then mark PR #5 ready and squash-merge it only into `redesign/r3-day-one`. After the merge, verify that PR #4 remains draft and that `main`, GitHub Pages and production remain unchanged.

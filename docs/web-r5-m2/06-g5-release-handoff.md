# Web R5 / M2 – G5 release handoff

**Date:** 30 August 2026

**State:** PREPARED – review handoff complete; no external repository action

**Feature branch:** `feat/web-r5-m2-founder-lock-v0-3`

**Release base:** `origin/main` at
`f0ae3b37fdd595c625b46c7875c5b6314389809d`

**Production publication:** Not authorised

## 1. G5 decision

G5 is complete as a review handoff. The candidate is suitable for the next
separately authorised repository event: exact staging and creation of one
feature-branch commit.

This gate does **not** stage, commit, push, open a pull request, merge, update
`main`, deploy production, remove the QA service or delete any retained branch.
Those actions remain separate authority events under the founder lock.

## 2. Candidate identity and release boundary

| Control | Result | Evidence |
|---|---|---|
| Base commit | PASS | Current GitHub `main` and local `origin/main` both resolve to `f0ae3b37fdd595c625b46c7875c5b6314389809d` |
| Dedicated branch | PASS | `feat/web-r5-m2-founder-lock-v0-3`, created directly from the release base |
| Open pull requests | PASS | None at the G5 read-only GitHub check |
| Main protection | ADVISORY | `main` is not protected and no repository ruleset is active; process gates must therefore remain manual and explicit |
| GitHub Pages | ACTIVE | The repository reports Pages enabled; prior release records identify `main` as the publishing branch |
| G4 QA source | PASS | Remote QA commit `fce1289f786c16696c0bbd2fe18fa4803f27c854`; approved content tree `6e6119580eebe7f649618b659ad4ecd1672a64bb` |
| Candidate/QA parity | PASS | All 17 runtime, quality-contract and evidence files match the deployed QA Git blobs; zero differences across 11 modified files and 6/6 new-file blob identities match |
| QA-only exclusions | PASS | `artifacts/g4-responsive.html`, `scripts/build-render-qa.mjs` and the temporary `package.json` build-script addition are not part of the feature candidate |
| Post-QA records | PASS | `05-g4-browser-and-visual-qa.md` and this G5 record were added after the tested implementation tree; G0–G4 Markdown headers received whitespace-only normalisation for a clean staged diff; none changes runtime behaviour |
| `/mis/` boundary | PASS | No diff under `/mis/` |

The public production check on 30 August still showed the pre-M2 homepage at
<https://www.3brain.ai/>. No production release occurred during G0–G5.

## 3. Exact release diff summary

The handoff contains 24 repository files:

- 11 modified files;
- 6 new public route/asset files;
- 7 new audit and gate records.

### Public runtime surfaces – modified

- `assets/css/style.css`
- `cri/index.html`
- `index.html`
- `investors/index.html`
- `llms.txt`
- `validation/index.html`

### Quality contracts – modified

- `scripts/validate-ai-visibility.mjs`
- `scripts/validate-site-polish.mjs`
- `tests/ai-visibility.spec.mjs`
- `tests/r3-homepage.spec.mjs`
- `tests/r3-navigation.spec.mjs`

### Public route and evidence assets – new

- `assets/img/cri/evidence/fischamend-t0-2023-08-20.png`
- `assets/img/cri/evidence/fischamend-t1-2025-08-19.png`
- `evidence-packs/fischamend/index.html`
- `evidence-packs/fischamend/3BrainAI_CRI_Fischamend_Evidence_Pack_v0_1.pdf`
- `evidence-packs/fischamend/assets/fischamend_t0_T0_2023-08-20_visual.png`
- `evidence-packs/fischamend/assets/fischamend_t1_T1_2025-08-19_visual.png`

### Audit and gate records – new

- `docs/web-r5-m2/00-g0-baseline.md`
- `docs/web-r5-m2/01-g1-content-map.md`
- `docs/web-r5-m2/02-g2-assets-and-portfolio-map.md`
- `docs/web-r5-m2/03-g0-g2-checkpoint.md`
- `docs/web-r5-m2/04-g3-implementation-checkpoint.md`
- `docs/web-r5-m2/05-g4-browser-and-visual-qa.md`
- `docs/web-r5-m2/06-g5-release-handoff.md`

No legal, privacy, security, Czech, German, DNS, CNAME, workflow, dependency,
package-lock or deployment-configuration file is changed.

## 4. Founder-lock outcomes carried by the release

- Public maturity is current controlled-case Proof of Concept validation.
- The complete history remains visible: Idea completed → Product Concept and
  Illustrative Prototypes completed → Proof of Concept current → Paid Pilot
  next → Commercial Deployment target.
- Institution-specific engagement remains a separate axis beginning with the
  Evidence Readiness Check.
- Fischamend, Lower Austria is the primary recognisable bank case.
- D4 remains a quiet secondary signal with no invented AOI, dates, evidence
  pair or finding.
- `WATCH – EVIDENCE SUFFICIENCY` remains an evidence/workflow state, not a
  project or credit rating.
- Public calls to action preserve the approved order: Austrian Evidence Pack,
  Evidence Readiness Check, controlled investor route.
- Lausitz and German North Sea remain accessible as earlier public-safe
  prototypes.
- The public boundary remains human-reviewed decision support; no autonomous
  credit/payment decision, deployed-customer, compliance or drawdown claim is
  introduced.
- `/mis/` remains an unchanged historical artefact.

## 5. Locked evidence integrity

| Asset | SHA-256 | Result |
|---|---|---|
| Fischamend T0 | `a0dafc4173b0a1800d43c738a97dccbbf555fe261929c5e5d019536bab41cb8f` | PASS |
| Fischamend T1 | `b938f6be662e6ecc996634b854dd28ebfd7607ff37030d0aa0fe878cf5eca6fa` | PASS |
| Accessible Evidence Pack HTML, v0.1 public-safe release | `a68630279a8447e0cfea306f0b0abf5c50074b37e15b089ac1279264523460c7` | PASS |
| Two-page A4 Evidence Pack PDF, v0.1 public-safe release | `525aba2f01b9d43c8c55d52349026ca5d2533747d46002bc8c3ed098cd0cfb05` | PASS |

The two repository image placements preserve identical bytes. The standalone
HTML, PDF and both local image references resolve without external runtime
dependencies.

## 6. G4 screenshot and live-review evidence

| Evidence | SHA-256 | Location |
|---|---|---|
| Live desktop capture | `30e7b44c27671830b063aae87e87515aa42a5853c7e7a8e0457663d7cf3e60d1` | `/workspace/scratch/g4-live-desktop-1440.jpg` |
| Live mobile capture | `c077cd0973f8aad75ad20ba8e5967528dee6539c0df508367d967b2c625c562c` | `/workspace/scratch/g4-live-mobile-390.jpg` |
| Live mobile menu/focus capture | `9d001369d1cca1c1e8e55e539bde48f36776298336cf365b739f18940c07f4c9` | `/workspace/scratch/g4-live-mobile-390-menu.jpg` |

Retained live QA surface:
<https://brainai-web-r5-m2-g4-v03.onrender.com>

Retained responsive harness:
<https://brainai-web-r5-m2-g4-v03.onrender.com/qa/g4-responsive.html?width=390&path=%2F>

The final G5 read-only Render check confirmed that the service is not
suspended, auto-deploy and PR previews remain off, deploy
`dep-daa2u8lg1s2s73bvnbeg` remains `live`, and the error-level service log is
empty.

The complete 20-surface browser matrix, interaction results, deviations and
non-blocking observations are recorded in
`docs/web-r5-m2/05-g4-browser-and-visual-qa.md`.

## 7. Final verification record

| Check | G5 result |
|---|---|
| `npm run validate` | PASS – HTML, CSS, 12-page AI visibility and 34-entry site-polish contracts |
| `git diff --check` | PASS |
| Test discovery | PASS – 60 Playwright tests in three specifications |
| Candidate versus deployed G4 implementation | PASS – exact common-file Git blob identity |
| Locked Evidence Pack hashes | PASS |
| `/mis/` diff | PASS – empty |
| G4 live browser matrix | PASS – five surfaces at 390, 768, 1024 and 1440 px |
| G4 keyboard/interactions | PASS – menu state, skip link, focus, tabs, lazy assets and routes |
| Runtime application console | PASS – no application warning/error entries |

### Local browser-run environment note

The ordinary local `npm run test:r3` command could not launch in this workspace
because the bundled `http-server` hit `uv_interface_addresses`, a host-runtime
network-interface error. A Python-bound localhost retry bypassed that launcher
condition and reached test execution, where the workspace reported that the
Playwright Chromium binary is not installed. This is an environment limitation,
not a product-test assertion failure.

The G4 Render validation and live cloud-browser matrix have already exercised
the implementation. The pull-request workflow remains the authoritative final
automated browser gate because it installs Chromium before running all 60
tests.

## 8. Proposed feature-branch commit

Suggested commit message:

```text
feat(web): add R5 M2 Austrian validation pathway
```

The commit must contain exactly the 24 files in section 3. Before committing:

1. verify that `origin/main` still equals
   `f0ae3b37fdd595c625b46c7875c5b6314389809d`;
2. stage only the explicit 24-file manifest;
3. run `git diff --cached --check`;
4. inspect `git diff --cached --name-status` against the manifest;
5. confirm `git diff --cached -- mis` is empty;
6. create one feature commit; do not amend or combine with the QA-only commit.

## 9. Draft pull-request proposal

**Title**

```text
Web R5 / M2 – controlled-case PoC and Austrian Evidence Pack
```

**Base / head**

```text
main <- feat/web-r5-m2-founder-lock-v0-3
```

**Initial state:** Draft

**Proposed body**

```markdown
## Summary

- positions CRI at current controlled-case Proof of Concept validation without
  implying deployment or completed customer validation
- preserves the complete product history from Idea through target Commercial
  Deployment and separates it from institution-specific engagement
- makes Fischamend, Lower Austria the primary public-safe bank case and keeps
  D4 secondary without invented evidence
- adds the accepted accessible Fischamend Evidence Pack HTML/PDF and dated T0/T1
  assets under `/evidence-packs/fischamend/`
- updates Homepage, CRI, Validation and Investors while preserving the earlier
  Lausitz and German North Sea prototypes
- keeps `WATCH – EVIDENCE SUFFICIENCY` bounded to evidence state and keeps
  `/mis/` unchanged
- extends static and browser contracts for the new maturity, route, CTA and
  claim boundaries

## Founder lock and scope

This implementation maps the approved Web R5 / M2 v0.3 founder lock into the
existing multi-page website. It does not replace the production template
wholesale, publish private investor material, or introduce customer, credit,
compliance, payment or drawdown claims.

## Validation completed

- `npm run validate` – PASS
  - HTML – zero warnings
  - CSS – PASS
  - AI visibility – 12 canonical pages
  - site polish – 34 HTML entry points
- `git diff --check` – PASS
- Evidence Pack HTML/PDF and dated T0/T1 hashes – PASS
- `/mis/` – unchanged
- G4 live browser matrix – PASS across five surfaces at 390, 768, 1024 and
  1440 px
- keyboard, focus, mobile menu, tabs, imagery, links and application console –
  PASS

## QA evidence

- G4 record: `docs/web-r5-m2/05-g4-browser-and-visual-qa.md`
- G5 handoff: `docs/web-r5-m2/06-g5-release-handoff.md`
- retained QA surface:
  https://brainai-web-r5-m2-g4-v03.onrender.com

## Required PR gate

The repository's `R3 review checks` workflow must install Chromium and pass all
60 Playwright tests. The PR must remain draft until the check and review
artifacts are green and the founder gives a separate ready/merge decision.

## Release boundary

Merging into `main` publishes GitHub Pages. Do not merge, auto-merge or deploy
from this PR without separate explicit founder approval.
```

## 10. PR, merge and production gates

Because `main` has no branch protection or ruleset, the following process is
mandatory even though GitHub will not enforce it automatically:

1. **Stage and commit approval** – exact 24-file manifest only.
2. **Push approval** – publish the feature branch; do not update `main`.
3. **Draft PR approval** – open the proposal above against `main`.
4. **CI gate** – require a green `R3 review checks` workflow and inspect its
   screenshot/report artifacts.
5. **Review gate** – verify the PR file list, claims boundary, Fischamend
   assets and `/mis/` no-change condition.
6. **Ready-for-review/merge approval** – separate founder decision after CI.
7. **Production verification** – after an approved squash merge, verify the
   live Homepage, CRI, Validation, Investors and Fischamend routes, their key
   assets and browser console.
8. **Cleanup approval** – only after production verification, separately
   approve removal of the temporary Render service, QA branch and any retained
   historical feature branch.

Auto-merge must remain off. The recommended integration is one squash merge so
the release has one reversible production commit.

## 11. Rollback plan

The pre-release production point is
`f0ae3b37fdd595c625b46c7875c5b6314389809d`.

If production verification finds a material regression:

1. do not rewrite or force-push shared history;
2. create a new revert branch from current `main`;
3. revert the R5/M2 squash commit in one new commit;
4. open and review a rollback PR;
5. merge only after the minimum static gate passes;
6. verify the live HTML, core routes, Fischamend route/assets and console after
   GitHub Pages republishes;
7. retain the QA service until rollback verification is complete.

## 12. Exact next authority event

The next action is **founder approval to stage the exact 24-file manifest and
create one local feature-branch commit**. Push, draft PR, merge and production
publication are not bundled with that approval.

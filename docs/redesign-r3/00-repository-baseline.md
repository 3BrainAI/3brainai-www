# Repository Baseline & Release Safety Note

**Audit date:** 2 August 2026

**Repository:** `3BrainAI/3brainai-www`

**Audited base:** `main` at `8c02ad907bd7a979ca63371e65bb06674867cb0f`

**Working branch:** `redesign/r3-day-one`

**Release target:** R3.1 prototype only; no production publication is authorised

## 1. Safety verdict

The repository is safe for a bounded local prototype on a separate branch.

- The checkout was clean before the branch was created.
- `main`, `origin/main` and the live homepage all represent the same current release.
- The site can be previewed locally without a build step.
- Git history provides a precise rollback point at commit `8c02ad9`.
- No production files, GitHub branch, pull request or deployment have been changed.

Production release is **not yet safe or authorised** because there is no verified staging environment, no automated validation pipeline and no independent production approval gate in the repository.

## 2. Repository and framework baseline

| Area | Finding |
|---|---|
| Implementation | Plain static HTML, one global CSS file and minimal vanilla JavaScript |
| Framework | None |
| Package manager | None |
| Build command | None |
| Local preview | `python3 -m http.server 4174 --bind 127.0.0.1` from the repository root |
| Homepage source | `/index.html` |
| Global CSS / current tokens | `/assets/css/style.css`; existing custom properties are defined in `:root` |
| JavaScript | `/assets/js/main.js`; mobile navigation toggle only |
| Asset roots | `/assets/img/`, `/assets/img/logo/`, `/assets/css/`, `/assets/js/` |
| Reuse model | No templates or component system; header, navigation and footer HTML are duplicated across pages |
| Repository size | Approximately 236 KB of tracked public assets plus HTML |

## 3. Deployment and hosting

- The custom domain is declared by `CNAME` as `www.3brain.ai`.
- `.nojekyll` and the live response header `server: GitHub.com` confirm GitHub Pages hosting.
- The live homepage returned HTTP 200 on 2 August 2026.
- The SHA-256 hash of live homepage HTML exactly matched the checked-out `/index.html` from `main`.
- There is no tracked `.github/workflows/` deployment workflow and no build configuration.
- The evidence strongly indicates branch-based GitHub Pages publication from repository content. The exact Pages source branch/folder is not independently exposed by the available repository metadata and must be confirmed in GitHub Pages settings before production publication.

## 4. Current routes

### Primary English routes

| Route | Source |
|---|---|
| `/` | `/index.html` |
| `/cri/` | `/cri/index.html` |
| `/use-cases/` | `/use-cases/index.html` |
| `/governance-layer/` | `/governance-layer/index.html` |
| `/mis/` | `/mis/index.html` |
| `/validation/` | `/validation/index.html` |
| `/investors/` | `/investors/index.html` |
| `/about/` | `/about/index.html` |
| `/contact/` | `/contact/index.html` |
| `/privacy/` | `/privacy/index.html` |
| `/imprint/` | `/imprint/index.html` |
| `/security/` | `/security/index.html` |

### Legacy compatibility pages

- `/product/` points users to `/mis/` through an HTML notice page.
- `/pilots/` points users to `/validation/` through an HTML notice page.
- `/how-it-works/` points users to `/governance-layer/` through an HTML notice page.

These are not HTTP redirects. They return HTML pages with `noindex,follow` and a canonical target.

### Localised placeholders

- `/cs/` and eight Czech subroutes are `noindex,follow` placeholders.
- `/de/` and eight German subroutes are `noindex,follow` placeholders.

## 5. Preview and link checks

- Local static preview returned HTTP 200 for the homepage.
- Every internal route and local asset referenced by tracked HTML returned HTTP 200 in the local preview.
- The live homepage DOM contains semantic `main`, headings and navigation.
- The only console error observed in the cloud-browser baseline came from the browser's own extension, not from website JavaScript.
- Responsive CSS breakpoints currently include 1100, 980, 720, 640 and 560 px rules.

## 6. Staging, backup and rollback

### Available now

- immutable Git commit history;
- clean base commit `8c02ad9`;
- separate local branch `redesign/r3-day-one`;
- local static preview;
- baseline live-homepage screenshot captured before modifications.

### Missing or unverified

- dedicated staging URL;
- deploy-preview automation;
- branch protection and required checks;
- automated HTML, accessibility or broken-link tests;
- release tags;
- exact GitHub Pages source setting.

### Rollback method

1. Do not overwrite `main` directly.
2. Keep R3 work isolated on `redesign/r3-day-one` or a later approved feature branch.
3. Before release, record the production commit SHA and verify it against the live homepage.
4. If a published release must be rolled back, create a new revert commit that restores the last approved production tree; do not rewrite shared history.
5. Verify the live HTML hash, core routes and homepage screenshot after GitHub Pages redeploys.

The current known-good rollback point is `8c02ad907bd7a979ca63371e65bb06674867cb0f`.

## 7. Technical risks

| Risk | Impact | Control for R3.1 |
|---|---|---|
| No staging environment | A merge to the publishing branch may change production immediately | Keep work local/feature-branch only; no push or merge without owner approval |
| No automated build or tests | Regressions rely on manual review | Run local link, viewport, console and accessibility checks before any release decision |
| Shared 1,859-line stylesheet | New rules may affect unrelated routes | Namespace R3 homepage and Evidence Pack styles; avoid changing legacy selectors where possible |
| Repeated header/footer markup | Navigation changes can diverge between pages | Day-One prototype changes the homepage only; site-wide navigation is out of scope |
| Legacy paths are notice pages, not redirects | Canonicalisation and user flow are weaker than real redirects | Preserve in R3.1; implement `/mis/` to `/records/` redirect only in a later bounded release |
| External Google Fonts dependency | Preview and typography can vary when the network is unavailable | Keep robust system-font fallback; do not add another external font dependency |
| No release tags | Rollback relies on commit SHA knowledge | Record the approved SHA in the release log before production |

## 8. First bounded issue proposal

### `[R3.1] Controlled Site Ledger foundation and CRI-first hero prototype`

**Goal**

Create the first reviewable desktop/mobile prototype without altering production or redesigning any secondary page.

**Allowed files**

- `/assets/css/style.css`
- `/index.html`
- `/docs/redesign-r3/00-repository-baseline.md`
- preview screenshots outside the tracked production tree

**In scope**

1. Add reusable R3 design-token roles while preserving legacy variables.
2. Add one public-safe HTML/CSS Evidence Pack component using only the approved synthetic sample.
3. Replace the homepage first-screen hierarchy with the approved CRI-first hero copy and CTA order.
4. Make the Evidence Pack the dominant hero object.
5. Verify desktop and mobile rendering locally and capture both previews.

**Explicitly out of scope**

- changes to any non-homepage route;
- Drive image download or publication;
- raw CRI Console screenshots;
- historical photography;
- Sentinel publication;
- `/mis/` to `/records/` migration;
- site-wide navigation rewrite;
- production deployment, push, pull request or merge;
- claims not present in the Source of Truth R3.

**Acceptance criteria**

- CRI is clear in the first viewport.
- The approved headline, supporting copy and CTA hierarchy are used verbatim.
- The Evidence Pack uses `DEMO-ASSET-01`, synthetic data and the required public label.
- WATCH is text plus colour, never colour alone.
- Uncertainty, provenance and human review are visible.
- No thresholds, machine reason-code strings, real site identifiers or live-customer implication appear.
- The component is understandable at 320 px and has no horizontal overflow.
- Desktop and mobile preview screenshots exist.
- Existing internal links continue to resolve locally.
- No production or GitHub remote write occurs.

## 9. Release gate after the prototype

After desktop and mobile screenshots exist:

1. run KIMI visual QA using `03_KIMI_Prototype_QA_Prompt_3BrainAI_R3.md`;
2. integrate only approved visual corrections;
3. complete ChatGPT claims/IP review;
4. agree a staging or deploy-preview method;
5. ask Dušan for an explicit production decision.

## 10. Checkpoint – R3.1 first bounded block

**Checkpoint time:** 2 August 2026

**Status:** implementation complete in the local working tree; visual screenshot gate incomplete; no remote write

### Completed

- repository, hosting, route, asset, preview and rollback audit;
- local branch `redesign/r3-day-one`;
- namespaced Controlled Site Ledger design-token roles;
- public-safe synthetic Evidence Pack HTML/CSS component;
- CRI-first homepage hero and approved CTA hierarchy;
- updated CRI-first title and meta description;
- local HTTP link check with HTTP 200 for every referenced internal route and asset;
- HTML validation with zero errors;
- CSS syntax validation with zero errors;
- claims scan for named demo sites, borrower wording, machine codes, thresholds and unverified infrastructure claims;
- self-contained clickable HTML preview outside the tracked production tree.

### Still open

- desktop and mobile prototype screenshots;
- KIMI visual QA;
- ChatGPT visual/claims acceptance after KIMI;
- staging or deploy-preview mechanism;
- commit, push, pull request and any production release.

The cloud browser captured the pre-change live baseline but blocked local/data URL rendering under its URL security policy. This block must not be bypassed. The standalone HTML preview is the current safe functional-preview artefact; screenshot-based Gate 2 remains open.

### Changed files

- `/assets/css/style.css`
- `/index.html`
- `/docs/redesign-r3/00-repository-baseline.md`

### Branch and commit

- branch: `redesign/r3-day-one` (local only)
- last commit: `8c02ad907bd7a979ca63371e65bb06674867cb0f`
- working tree: three uncommitted changed/new files

No files have been staged or committed because commit, push and pull-request actions require separate explicit authorisation.

### Known issues

- no dedicated staging URL or branch preview;
- screenshot capture of the current local prototype is unavailable in this environment;
- the homepage below the new hero remains the legacy Trusted Data Plane release and is intentionally outside this bounded issue;
- homepage navigation still lists Data Plane before CRI because site-wide navigation consistency is outside this issue;
- no automated accessibility engine was run; semantic HTML, focus treatment, status text-plus-colour and 320 px CSS rules were implemented and statically reviewed.

### Claims / IP open questions

- no Drive image, historical photograph, Sentinel image, raw console screenshot, real site identifier, threshold or machine reason code was added;
- Sentinel attribution and historical-image rights remain deferred because no such asset is included in this issue;
- legacy below-fold uses of `reason codes`, `audit trail` and named ecosystem signals remain unchanged and require a later claims pass before the complete R3.1 release;
- the new Evidence Pack uses only the approved synthetic wording from Source of Truth R3.

### Exact next step

Open the self-contained desktop/mobile-responsive HTML preview and capture one 1280 px and one 390 px screenshot. Then run the KIMI visual-review prompt against those two screenshots plus the Evidence Pack close-up. Do not extend the implementation or publish before that visual gate is complete.

## 11. Checkpoint – approved KIMI corrections C1–C4

**Checkpoint time:** 2 August 2026

**Status:** C1–C4 implemented locally; no stage, commit, push, pull request or production change

### Completed

- C1: WATCH is now a low-weight transparent outlined status with a small amber dot;
- C2: a small ledger-framed EO input position is integrated into Provenance without creating a third hero card;
- C3: metadata is grouped by spacing into Case, Assessment and Provenance, and the duplicate Human review state was removed;
- C4: Uncertainty now uses a very light tint, an amber label and a thin amber edge; Findings retains the stronger heading weight;
- navigation, approved hero and Evidence Pack copy, all legacy sections and all non-homepage routes remain unchanged.

### Changed files

- `/index.html`
- `/assets/css/style.css`
- `/docs/redesign-r3/00-repository-baseline.md`

### Branch and commit

- branch: `redesign/r3-day-one` (local only)
- last commit: `8c02ad907bd7a979ca63371e65bb06674867cb0f`
- working tree: uncommitted; nothing staged

### Open issues

- the approved June 2026 Sentinel originals were verified in `3BrainAI_web_foto`, but the Drive connector exposed them only as a protected file reference and did not materialize bytes in the local workspace;
- the EO input therefore remains an explicitly labelled placeholder and the approved Sentinel original remains a blocking input;
- production use of any Sentinel thumbnail remains blocked until the exact Copernicus attribution is verified;
- screenshot capture remains blocked by the previously confirmed local/data URL security policy and must not be bypassed;
- staging or deploy preview is still unavailable;
- legacy sections below the hero remain intentionally unchanged and still require a later claims pass.

### Exact next step

Open the updated self-contained checkpoint in an approved external rendering environment, capture the five requested desktop/mobile review states, and verify C1–C4 visually. Replace the EO placeholder only after the approved Sentinel file is transferred locally and exact Copernicus attribution is confirmed. Do not stage, commit, push or publish before Dušan approves the review result.

## 12. Checkpoint – final KIMI metadata correction

**Checkpoint time:** 2 August 2026

**Status:** final correction verified locally; prototype visually approved for the feature branch; production blockers remain; no stage, commit, push, pull request or production change

### Completed

- restored `Human review` / `Required` immediately below `Data quality` in the Assessment metadata group;
- confirmed exactly one `Human review` / `Required` item exists in the metadata rail;
- preserved the approved Recommended next step and human-review boundary text unchanged;
- confirmed the item remains in the normal desktop metadata flow and in the 390 px one-column metadata layout;
- HTML validation, CSS syntax validation and `git diff --check` passed;
- Sentinel placeholder, navigation, legacy homepage sections, approved copy and all other prototype scope remain unchanged.

### Changed files

- `/index.html`
- `/assets/css/style.css` (unchanged by this final correction; remains modified from the prior approved prototype block)
- `/docs/redesign-r3/00-repository-baseline.md`

### Branch and commit

- branch: `redesign/r3-day-one` (local only)
- last commit: `8c02ad907bd7a979ca63371e65bb06674867cb0f`
- working tree: uncommitted; staging area empty

### Known issues and production blockers

- approved Sentinel original must be transferred into the repository;
- exact acquisition date must be confirmed;
- processing status must be confirmed;
- Copernicus attribution must be verified and approved;
- no staging or deploy-preview environment is available;
- legacy homepage sections remain intentionally outside the R3 prototype scope.

### Claims / IP open questions

- the feature-branch prototype is visually approved, but no Sentinel imagery is approved for production until all four blockers above are closed;
- the public site must not load the private Drive original directly;
- no AI or stock replacement, audit trail, new claim, threshold, machine reason code or real customer identifier was added.

### Exact next step

The prototype may proceed to the local feature-branch commit gate only after separate authorisation. Keep production blocked until the Sentinel original, acquisition date, processing status and Copernicus attribution are all confirmed. Do not stage, commit, push or publish in the current state.

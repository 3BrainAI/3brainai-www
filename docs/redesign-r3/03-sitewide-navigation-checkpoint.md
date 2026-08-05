# R3 Site-wide Navigation Checkpoint

**Issue:** `R3 Site-wide CRI-first Navigation Sync — existing English routes only`

**Checkpoint date:** 5 August 2026

**Working branch:** `work/r3-sitewide-navigation` (local only)

**Base branch:** `redesign/r3-day-one`

**Base and current HEAD:** `007f598949e3852b0715e3965f499b3f33ec65c4`

**Status:** Implementation and local deterministic validation complete. All 16 approved files are staged for review. No commit, push, pull request, Pages change or deployment has been performed.

## Implemented scope

The repeated inline navigation on the 14 English pages that differed from the approved homepage was synchronized to this existing-route contract:

1. `CRI` → `/cri/`
2. `Evidence Pack` → `/#evidence-pack-sample`
3. `Validation` → `/validation/`
4. `Data Plane` → `/governance-layer/`
5. `Records` → `/mis/`
6. `Investors` → `/investors/`
7. `About` → `/about/`
8. `Contact` → `/contact/`

The homepage remains the canonical reference and was not changed. Its Evidence Pack link remains the equivalent local fragment `#evidence-pack-sample`.

No HTML generator or shared component owns the navigation. Each page contains duplicated inline markup, so the bounded page-level edits are the actual source-level change.

## Active-state mapping

| Route | Active navigation item | Decision |
|---|---|---|
| `/` | none | Homepage is the canonical entry, not one of the eight destination families. |
| `/about/` | About | Direct destination. |
| `/contact/` | Contact | Direct destination. |
| `/cri/` | CRI | Direct destination. |
| `/governance-layer/` | Data Plane | Direct destination. |
| `/how-it-works/` | Data Plane | Legacy compatibility page canonicalized to `/governance-layer/`. |
| `/imprint/` | none | Legal utility page has no canonical primary-navigation family. |
| `/investors/` | Investors | Direct destination. |
| `/mis/` | Records | Existing Records destination. |
| `/pilots/` | Validation | Legacy compatibility page canonicalized to `/validation/`. |
| `/privacy/` | none | Legal utility page has no canonical primary-navigation family. |
| `/product/` | Records | Legacy compatibility page canonicalized to `/mis/`. |
| `/security/` | none | Existing page is not represented by an approved canonical item. |
| `/use-cases/` | none | Existing page is not represented by an approved canonical item. |
| `/validation/` | Validation | Direct destination. |

## Changed files

Navigation-only edits:

- `about/index.html`
- `contact/index.html`
- `cri/index.html`
- `governance-layer/index.html`
- `how-it-works/index.html`
- `imprint/index.html`
- `investors/index.html`
- `mis/index.html`
- `pilots/index.html`
- `privacy/index.html`
- `product/index.html`
- `security/index.html`
- `use-cases/index.html`
- `validation/index.html`

New review files:

- `tests/r3-navigation.spec.mjs`
- `docs/redesign-r3/03-sitewide-navigation-checkpoint.md`

No CSS, JavaScript, body copy, hierarchy, footer, metadata, route, Czech/German page or homepage file changed.

## Deterministic validation evidence

Local results:

- `npm run validate`: passed — configured homepage HTML and global CSS validation;
- `git diff --check`: passed;
- Playwright: 32/32 passed, consisting of the 10 existing homepage tests and 22 new navigation tests;
- all 15 scoped English routes match the canonical labels, order, targets and active-state contract;
- every canonical route and the Evidence Pack fragment resolve;
- mobile navigation opens and exposes all eight links on every scoped route;
- representative routes have no horizontal overflow at 320, 390, 768, 1280 or 1920 px;
- keyboard focus remains visible on representative homepage and legacy-page navigation;
- the existing homepage review-safety, section-order, route, anchor and screenshot tests still pass.

The environment could not download Playwright's pinned Chromium from its CDN because the network gateway rejected the certificate. The same repository test suite was therefore run with an isolated temporary Chromium 149 binary and a temporary local Python static server. Neither fallback changed the repository.

Remote CI evidence for this branch is pending because push and pull-request creation are not authorized. The verified base-branch CI run remains `30897439151` with result `success`.

## Known issues and blockers

- No navigation defect or scope blocker was found.
- Running `html-validate` against all 15 pages reports 42 legacy errors concerning doctype casing, implicit button types, native-list preferences and raw ampersands. An untouched clone of base SHA `007f598` reports the same 42 errors at the same locations; the navigation change adds none. Correcting that baseline debt would require a separately approved scope.
- Dedicated staging and the exact GitHub Pages source setting remain unconfirmed. Pages and production were not touched.
- PR #4 remains the draft release PR into `main`; it was not retargeted, updated, merged or closed.

## Exact next step

Dušan reviews the staged diff and decides whether to authorize a commit containing exactly the 16 files listed above. Committing, pushing, creating a draft pull request into `redesign/r3-day-one`, and any later merge remain separate approval gates.

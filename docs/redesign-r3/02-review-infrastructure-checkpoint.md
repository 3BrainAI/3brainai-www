# R3 Review Infrastructure Checkpoint

**Issue:** `R3 Review Infrastructure – deterministic CI validation and Playwright previews`

**Date:** 4 August 2026

**Working branch:** `infra/r3-review-pipeline`

**Base branch:** `redesign/r3-day-one`

**Base HEAD:** `80c8b89fcbb742e8ac7d03ed24a1098b1ab23f5f`

## Purpose

Replace model-generated screenshot claims with deterministic repository checks and browser artefacts produced by GitHub Actions.

## Implemented scope

- pinned Node development dependencies and lockfile;
- HTML and CSS validation commands;
- Playwright checks for review-safety invariants, internal anchors and routes;
- responsive overflow checks at 320, 390, 768, 1280 and 1920 px;
- conditional verification of the approved CRI-first homepage section order;
- native Playwright full-page screenshots at 1280 and 390 px;
- a five-image review contract covering desktop and mobile homepage viewports, the complete mobile Evidence Pack, the desktop Evidence Pack anchor target and a desktop Evidence Pack close-up;
- GitHub artifact upload for screenshots, HTML report and failure traces;
- read-only workflow permissions and no deployment step.

## Explicit exclusions

- no change to `index.html` or `assets/css/style.css`;
- no GitHub Pages configuration;
- no staging or production deployment;
- no branch-protection change;
- no merge of the homepage integration PR;
- no Sentinel asset transfer or attribution decision.

## Release safety

The workflow runs only as a validation and rendering job. It has read-only repository permissions and does not publish website content.

## Validation status

- package installation: passed with the pinned lockfile;
- HTML/CSS validation: passed;
- Playwright test discovery: passed – 9 tests discovered in one specification file;
- first GitHub Actions run: failed before browser tests because the workflow used Node 20 while `html-validate@11.6.1` requires Node 22.22+ or Node 24.8+;
- compatibility correction: workflow moved to Node 24 and the package runtime contract set to `>=24.8.0 <25`;
- corrected GitHub Actions run: passed, including HTML/CSS validation, all 9 Playwright tests and artifact upload;
- first full-page desktop and mobile artifacts: visually verified without duplicated page content;
- expanded five-image review contract: passed in GitHub Actions run `30894915183`;
- final artifact set: 7 PNG files – 2 full-page captures and 5 focused review captures – visually verified without duplicated or stale content.

## Exact next step

Merge the green infrastructure PR only into `redesign/r3-day-one`, then update the homepage integration branch against that base and review its GitHub-generated artefacts. Do not merge any production branch at this gate.

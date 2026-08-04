# R3 Review Infrastructure Checkpoint

**Issue:** `R3 Review Infrastructure — deterministic CI validation and Playwright previews`

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
- native Playwright screenshots at 1280 and 390 px;
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
- Playwright test discovery: passed — 9 tests discovered in one specification file;
- first GitHub Actions run: failed before browser tests because the workflow used Node 20 while `html-validate@11.6.1` requires Node 22.22+ or Node 24.8+;
- compatibility correction: workflow moved to Node 24 and the package runtime contract set to `>=24.8.0 <25`;
- browser execution and draft PR checks: pending the corrected GitHub Actions run.

## Exact next step

Review the corrected draft infrastructure PR and its next GitHub Actions run. Merge it only into `redesign/r3-day-one` after all validation and browser checks pass; do not merge the homepage PR or any production branch at this gate.

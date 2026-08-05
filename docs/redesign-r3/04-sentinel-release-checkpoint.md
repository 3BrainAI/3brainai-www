# R3 Sentinel Release Checkpoint

**Checkpoint date:** 5 August 2026

**Working branch:** `work/r3-production-release`

**Base branch:** `redesign/r3-day-one`

**Base HEAD:** `1a67ea67a82b034bf49f62528cf6272f3d426f06`

**Status:** The approved placeholder has been replaced with the Bílina Sentinel image and a compact public caption. The five bounded files are staged for owner-approved commit; no commit, remote branch or pull request has been changed, and production remains unchanged.

## Selected asset

- Drive source: `sentinel_lom_bilina.jpg`
- Drive file ID: `1fqT-cmFfqmh4Ja72sHq99InwOyxYevZE`
- Repository path: `assets/img/cri/sentinel-lom-bilina.jpg`
- Dimensions: 3092 × 1668 px
- Size: 602,332 bytes
- SHA-256: `385565438dc0543045f23f05445606f585d594b14092abb23215f79e371db1a1`

The closer Bílina crop was selected because the open-pit mine remains legible in the 218 px desktop metadata column. The original JPEG bytes are preserved in the repository; CSS provides the responsive 16:9 presentation crop.

## Public card label

The card uses four compact rows:

1. `Open-pit lignite mining area`
2. `Sentinel-2 · Bílina, Northwest Czechia · 2 Aug 2026`
3. `Illustrative EO context — not a validated CRI assessment.`
4. `Contains modified Copernicus Sentinel data (2026).`

The owner confirmed on 5 August 2026 that the selected image was captured from the current Sentinel Workspace dashboard view on 2 August 2026 and uploaded to Drive immediately afterwards. `2 Aug 2026` therefore supersedes the provisional month-only label used by the earlier placeholder.

The supplied file is a website-ready JPEG rather than an unmodified Sentinel product. The modified-data notice follows the Copernicus Sentinel legal-notice wording referenced by the [Copernicus Data Space terms](https://dataspace.copernicus.eu/terms-and-conditions).

## Source and processing record

1. On 2 August 2026, the owner opened the current Sentinel-2 view of the Bílina mining area in the Sentinel Workspace dashboard.
2. The owner captured the displayed view as a screenshot and saved it as `sentinel_lom_bilina.jpg`.
3. The JPEG was uploaded to the `3BrainAI_web_foto` Drive folder immediately on the same date.
4. The repository asset preserves the supplied JPEG byte-for-byte.
5. The website applies only a responsive CSS 16:9 presentation crop; it does not rewrite the image pixels.

The public label records the dashboard capture date. The file is correctly treated as modified Sentinel data because the supplied public asset is a dashboard screenshot/JPEG rather than the underlying raw Sentinel product.

## Local validation

- `npm run validate`: passed for HTML and CSS.
- asset MIME type, dimensions, byte size and SHA-256: verified.
- Playwright test coverage now requires the real image, compact label and public-safety boundary and rejects restoration of the placeholder.
- the complete local Playwright run is pending because this execution environment has no Chromium binary and the browser download endpoint returned a certificate-timing error; GitHub Actions must provide the deterministic browser gate before merge.

## Provenance gate result

- exact public capture date: confirmed — 2 August 2026;
- source: confirmed by the owner — current Sentinel Workspace dashboard view;
- processing record: confirmed and documented above;
- modified-data status: confirmed — yes;
- Copernicus attribution: included using the required modified-data notice.

The underlying Sentinel product ID is not embedded in the screenshot and remains unavailable. The release claim is therefore intentionally limited to the dashboard capture and illustrative EO context; it does not claim a raw-product identifier, processing level or independently validated assessment.

## Release safety

- current production rollback point: `8c02ad907bd7a979ca63371e65bb06674867cb0f`;
- GitHub Pages publishes from `main`, so merging PR #4 triggers production deployment;
- the current work must first pass staging, commit, push, pull-request and green-CI gates into `redesign/r3-day-one`;
- PR #4 remains the final, separate owner-controlled release gate into `main`.

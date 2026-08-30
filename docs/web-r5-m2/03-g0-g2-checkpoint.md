# Web R5 / M2 — G0–G2 checkpoint

**Date:** 30 August 2026

**Branch:** `feat/web-r5-m2-founder-lock-v0-3`

**Baseline:** `f0ae3b37fdd595c625b46c7875c5b6314389809d`

**State:** G0, G1 and G2 complete; stop before G3 implementation

## Completed

- fetched current `origin/main` and created a clean, dedicated branch;
- recorded the founder-lock authority and stop conditions;
- mapped the locked architecture into Homepage, CRI, Validation and Investors;
- selected a non-destructive portfolio-ready route for Fischamend;
- copied locked HTML, PDF and dated T0/T1 images without byte changes;
- copied repository-safe Fischamend assets for later Homepage use;
- recorded an explicit migration plan that preserves Lausitz and German North
  Sea and prevents fabricated D4 evidence;
- extended the static site-polish contract to cover the standalone Evidence Pack
  and its exact source hashes.

## Verification

| Check | Result |
|---|---|
| Source/target hashes | PASS — all six repository copies match the founder-locked hashes |
| Evidence Pack PDF | PASS — 2 pages, A4 |
| HTML validation | PASS — zero warnings |
| CSS validation | PASS |
| AI visibility contract | PASS — 12 canonical pages unchanged |
| Site-polish contract | PASS — 34 HTML entry points covered |
| Local HTTP route | PASS — HTML, PDF and four image paths returned HTTP 200 |
| Local HTML image references | PASS — both resolve inside the route |
| Existing evidence assets | PASS — no overwrite or deletion |
| `/mis/` | PASS — untouched |

The first full validation run stopped at the expected entry-count guard because
the site gained its 34th HTML entry point. The guard was updated to recognise
the Fischamend page as a standalone, founder-locked artefact rather than forcing
the global website shell into its byte-locked HTML. Exact hash and local-runtime
asset checks were added. The complete validation suite then passed.

## Files prepared in G0–G2

- `docs/web-r5-m2/00-g0-baseline.md`
- `docs/web-r5-m2/01-g1-content-map.md`
- `docs/web-r5-m2/02-g2-assets-and-portfolio-map.md`
- `docs/web-r5-m2/03-g0-g2-checkpoint.md`
- `evidence-packs/fischamend/index.html`
- `evidence-packs/fischamend/3BrainAI_CRI_Fischamend_Evidence_Pack_v0_1.pdf`
- `evidence-packs/fischamend/assets/` (two dated images)
- `assets/img/cri/evidence/fischamend-t0-2023-08-20.png`
- `assets/img/cri/evidence/fischamend-t1-2025-08-19.png`
- `scripts/validate-site-polish.mjs` (new-route integrity contract)

## Open before public release

G3 must decide how the locked standalone Evidence Pack participates in public
metadata: canonical URL/indexability versus a controlled artefact linked from a
canonical portfolio surface. The Evidence Pack bytes must not be silently
changed to solve this; use an explicit wrapper or a documented parity-reviewed
metadata revision.

## Authority boundary

No Homepage, CRI, Validation, Investors or shared CSS implementation has begun.
No files are staged or committed. Nothing has been pushed, proposed for merge or
deployed. G3 requires a separate founder instruction.

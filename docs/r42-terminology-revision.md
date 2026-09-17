# Public-record terminology revision, 17 September 2026

The founder requested consistent hypothetical-scenario wording across the public website, including the document interiors and graphic previews. This extends PR #56 beyond its original explanatory-copy scope.

## Current public wording

| Context | Wording |
| --- | --- |
| Public label | Public example · Real Copernicus data · Hypothetical review scenario |
| Scenario | Hypothetical review scenario |
| Review question | Hypothetical review question |
| Declared field | Declared - Hypothetical |
| Fischamend context label | Hypothetical drawdown review scenario |
| Invented milestone document | Fictional milestone record |
| Radar technology | Synthetic aperture radar (unchanged) |

Fischamend is now **v0.2, terminology revision**. The current HTML, PDF, both page previews and social preview use the revised wording. Homepage and reading-guide previews point to versioned assets. The historical Lausitz and German North Sea routes carry an explicit dated revision notice and retain their archive-only status.

## Preservation

The satellite image files, observations, dates, source identifiers, hashes, retrieval envelope, reason codes, findings, WATCH meaning, confidence and qualifications have not changed. The current record differs only by the recorded term substitutions and revision labels. `scripts/validate-terminology.mjs` compares all three revisions against their archived original sources with those exact substitutions.

The original Fischamend v0.1 PDF remains at its existing URL. The original HTML sources, Fischamend PDF and its evidence images are preserved in `evidence-packs/archive/public-records-before-terminology-2026-09-17.zip`, with SHA-256 checksums. The original image previews and social graphic remain at their original paths. Links to the old PDF and source archive are visible from the current record and reading guide.

New social artwork has an editable SVG source. It embeds the original dated observation images and renders the revised text; the observation pixels have not been regenerated. Its new URL prevents new shares from using the old image path. Third-party cached shares may still require a refresh.

## Validation

- Local `npm run validate` passes for all 41 HTML entry points and the existing metadata, CSS, source-boundary and form contracts.
- Public HTML and `llms.txt` contain no remaining use of synthetic except the technical term synthetic aperture radar.
- Original release and image hashes remain checked; the archive sources retain their original bytes.
- The browser print check now validates the exact terminology map, two A4 pages and separation of page content from the document footers. It exports a PDF and screenshot for review.
- The new PDF and its page previews must be visually reviewed after the browser render is available. The final PR body records the completed CI result.

## Scope and publication

The nine private Brief cases are not stored in this public repository. No claim is made that their content has been revised. They require their current private application source or export.

The founder retains the merge/publication step. No automatic merge or production deployment is requested by this change.

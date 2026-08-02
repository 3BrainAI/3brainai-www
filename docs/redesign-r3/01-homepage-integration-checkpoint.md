# R3 Homepage Integration Checkpoint

**Issue:** `R3 Homepage Integration — CRI-first structure below the approved hero`
**Date:** 2 August 2026
**Working branch:** `work/r3-homepage-integration`
**Base branch:** `redesign/r3-day-one`
**Base HEAD:** `80c8b89fcbb742e8ac7d03ed24a1098b1ab23f5f`
**Status:** Source HTML/CSS approved for a checkpoint commit and draft review. No merge, deployment or production change.

## Screenshot method (actual result)

Chrome DevTools beyond-viewport full-page capture produced **invalid** review images (hero repetition / non-fresh content). That method is **not** claimed as successful in this package.

**Actual method used:**

1. Set exact viewports: desktop `1280×900`, mobile `390×844`.
2. Hide scrollbars.
3. Scroll each homepage section into view with `scrollIntoView`.
4. Capture a normal viewport screenshot at each scroll state.
5. Visually verify distinct section content (hero only at top; later panels show gap/proof/OVD/how/validation/governance/founder/final+footer).
6. Build `r3-homepage-1280.png` and `r3-homepage-390.png` as **vertical montages** of those nine verified viewport panels (dark 4 px separators). These files are **assembled review sheets**, not native single-pass full-page captures.

## Review screenshots in package

### Summary montages (required filenames)

| File | Size | Meaning |
|---|---|---|
| `docs/redesign-r3/r3-homepage-1280.png` | 1280 × 8132 | Montage of 9 desktop viewport panels |
| `docs/redesign-r3/r3-homepage-390.png` | 390 × 7628 | Montage of 9 mobile viewport panels |

### Desktop viewport panels (primary evidence)

1. `r3-1280-01-header-hero-evidence-pack.png`
2. `r3-1280-02-evidence-gap.png`
3. `r3-1280-03-evidence-pack-proof.png`
4. `r3-1280-04-observed-vs-declared.png`
5. `r3-1280-05-how-it-works.png`
6. `r3-1280-06-validation-path.png`
7. `r3-1280-07-governance-layer.png`
8. `r3-1280-08-founder-proof.png`
9. `r3-1280-09-final-cta-footer.png`

### Mobile viewport panels (primary evidence)

1. `r3-390-01-header-hero-evidence-pack.png`
2. `r3-390-02-evidence-gap.png`
3. `r3-390-03-evidence-pack-proof.png`
4. `r3-390-04-observed-vs-declared.png`
5. `r3-390-05-how-it-works.png`
6. `r3-390-06-validation-path.png`
7. `r3-390-07-governance-layer.png`
8. `r3-390-08-founder-proof.png`
9. `r3-390-09-final-cta-footer.png`

## Visual verification performed before packaging

- Desktop panel 01: header + H1 + Evidence Pack once.
- Desktop panel 02+: Evidence gap / proof / OVD / how / validation / governance / founder — not a repeated hero.
- Desktop panel 09: Final CTA + footer once.
- Mobile panel 01: header/menu + hero once (Evidence Pack begins below fold).
- Mobile panel 09: Final CTA + footer once.
- Sticky site header may appear in multiple viewport panels; that is expected and is not hero/Evidence Pack repetition.
- SHA-256 of both summary montages differs from the previous rejected files.

## Source integrity

- `index.html` and `assets/css/style.css` were **not** modified in this screenshot-repair cycle.
- Prior R2 source corrections remain in the working tree vs HEAD `80c8b89`.

## Changed files vs HEAD (implementation)

- `index.html`
- `assets/css/style.css`

## New / updated review files (untracked)

- checkpoint + summary montages + 18 viewport panel PNGs listed above

## Known limitations

1. No reliable native full-page capture in this browser automation environment.
2. Summary PNGs are montages of viewport panels, not one continuous browser paint.
3. Sticky header repeats across viewport panels by design.
4. Site-wide nav sync and Sentinel asset remain separate issues.

## Release gate reminder

Checkpoint commit and push are limited to the working branch for draft review. Nothing merged or published. Production unchanged.

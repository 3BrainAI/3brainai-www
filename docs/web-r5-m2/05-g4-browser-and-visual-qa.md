# Web R5 / M2 – G4 browser and visual QA

**Date:** 30 August 2026

**State:** PASS – full live viewport, interaction and visual coverage complete

**Publication:** Not authorised

**Source correction:** None justified in this pass

## 1. Isolated QA deployment

G4 used a temporary, Git-backed QA surface. It did not stage, commit, push or
deploy the founder-lock feature branch and did not modify `main`, production or
`/mis/`.

| Control | Result | Evidence |
|---|---|---|
| QA branch | PASS | `qa/web-r5-m2-g4-v0-3` |
| Remote QA commit | PASS | `fce1289f786c16696c0bbd2fe18fa4803f27c854` |
| Content tree identity | PASS | Remote tree `6e6119580eebe7f649618b659ad4ecd1672a64bb` equals the approved local QA tree |
| Parent boundary | PASS | Built directly on `main` commit `f0ae3b37fdd595c625b46c7875c5b6314389809d` |
| Render workspace | PASS | `My Workspace – prikryl@3brain.ai` (`tea-daa2lgijnfac73fbe4q0`) |
| Render service | PASS | `brainai-web-r5-m2-g4-v03` (`srv-daa2u7tg1s2s73bvn8og`) |
| Auto-deploy | PASS | Off |
| PR previews | PASS | Off |
| Deploy | PASS | `dep-daa2u8lg1s2s73bvnbeg`, status `live` |
| Runtime errors | PASS | Render returned no error-level service logs at final verification |

The Render build checked out the expected QA commit and ran:

```text
npm ci && npm run validate && npm run build:render-qa
```

The build log confirms:

- HTML validation: PASS, zero warnings;
- CSS validation: PASS;
- AI visibility contract: PASS for 12 canonical pages;
- site-polish contract: PASS for 34 HTML entry points;
- dependency audit: zero reported vulnerabilities;
- static QA bundle upload: PASS.

## 2. Full live responsive matrix

The live Render deployment was exercised through the same-origin G4 harness at
four exact CSS viewports: 390, 768, 1024 and 1440 px.

At every width the following five surfaces were loaded:

1. `/`
2. `/cri/`
3. `/validation/`
4. `/investors/`
5. `/evidence-packs/fischamend/`

This produced a 20-surface live-browser matrix.

| Check | 390 | 768 | 1024 | 1440 |
|---|---:|---:|---:|---:|
| Exact `window.innerWidth` | PASS | PASS | PASS | PASS |
| Expected title and visible H1 | PASS | PASS | PASS | PASS |
| H1 inside horizontal viewport | PASS | PASS | PASS | PASS |
| Horizontal document overflow | PASS | PASS | PASS | PASS |
| Visible broken images | 0 | 0 | 0 | 0 |
| Fischamend WATCH/title overlap | None | None | None | None |
| Shared stylesheet and font stack | PASS | PASS | PASS | PASS |
| Standalone Evidence Pack layout | PASS | PASS | PASS | PASS |

On the two longer 1024 px pages, the document content box measured 1009 px
because the classic vertical scrollbar consumed 15 px. The media-query viewport
remained exactly 1024 px and `scrollWidth === clientWidth`, so this is not
horizontal overflow.

The automated overflow-element scan excluded the deliberately off-canvas
`.skip-link` while unfocused. It does not increase document scroll width and
moves on-screen when keyboard-focused.

## 3. Maturity history and responsive composition

The complete product history remains present and ordered at every viewport:

| Order | State | Stage | Border semantics |
|---:|---|---|---|
| 01 | Completed | Idea and problem definition | Solid |
| 02 | Completed | Product concept and illustrative prototypes | Solid |
| 03 | Current | Proof of Concept | Solid |
| 04 | Next | Paid Pilot | Dashed |
| 05 | Target | Commercial Deployment | Dashed |

Live geometry confirmed:

- 390 px: five vertically stacked cards in historical order;
- 768 px: 2 + 2 cards with TARGET spanning the full third row;
- 1024 px: 2 + 2 cards with TARGET spanning the full third row;
- 1440 px: one continuous five-card axis;
- the institution-specific engagement path remains a separate axis and does
  not restart or erase the completed product history.

## 4. Interaction, accessibility and asset checks

| Check | Result | Evidence |
|---|---|---|
| Mobile menu state | PASS | `aria-expanded` changed `false → true → false`; navigation visibility followed the state |
| Skip link | PASS | First keyboard destination; moved on-screen at 16/16 with a 3 px solid focus outline |
| Menu focus | PASS | 3 px solid focus outline with 3 px offset |
| Case tabs | PASS | Lausitz and German North Sea exchanged `aria-selected` states and the corresponding panel visibility |
| Lazy imagery | PASS | Lausitz images loaded during the walkthrough; both North Sea images loaded after their tab became active |
| Primary imagery | PASS | Fischamend T0/T1 loaded with non-zero natural dimensions on Homepage and standalone pack |
| CRI white logo | PASS | Settled at 649 × 326 natural pixels; the earlier immediate-sampling advisory is resolved |
| Cross-surface navigation | PASS | Homepage → CRI → Validation → Investors → Homepage produced each expected H1 |
| Evidence Pack link | PASS | The portfolio link resolved to the standalone Fischamend Evidence Pack and its expected H1 |
| Application console | PASS | Zero warning/error entries from the application or Render origin |

The cloud browser itself emitted extension-metadata errors from a
`chrome-extension://` source. These are browser-harness messages, not web
application console errors.

## 5. Visual review

The accepted full-page previews at 1440, 768 and 390 px and fresh live captures
at 1440 and 390 px were inspected.

- typography, spacing and section hierarchy remain balanced;
- Fischamend remains the primary bank case and D4 remains visually secondary;
- the WATCH evidence-sufficiency badge is subordinate to the case title;
- the large desktop H1 and the Fischamend evidence card form a balanced first
  viewport without collision or clipping;
- the mobile H1, boundary language, maturity marker and bank-context labels
  remain legible and correctly ordered;
- all five maturity stages remain visible in the intended responsive layouts;
- the investor surface retains sufficient contrast and a clear controlled-
  access action;
- no clipped headings, cards, images or CTA labels were observed.

The repository implementation deliberately preserves the site's existing
mobile disclosure menu instead of literally copying the mock's exposed mobile
navigation row. This is an implementation mapping to the existing production
template, not a founder-content change.

## 6. Non-blocking observations

1. The mobile menu trigger measures approximately 61 × 37 px. It exceeds the
   WCAG 2.2 minimum target-size criterion of 24 × 24 px, but remains below the
   stricter 44/46 px internal heuristic used for primary CTA buttons. This is
   an advisory, not a G4 blocker; all sampled `.btn` controls met the 44 px
   threshold.
2. Pointer automation inside the nested responsive iframe can scroll the outer
   QA harness because of iframe scroll anchoring. Keyboard state tests and a
   direct physical pointer-open test confirmed the product interaction. The
   harness behaviour is not present on the unframed site and is not classified
   as a product defect.

## 7. Earlier browser interruption

The earlier cloud-browser session temporarily returned
`net::ERR_BLOCKED_BY_CLIENT`. A newly authorised fresh browser runtime later
loaded the same verified Render endpoint and completed the full matrix. The
temporary condition was therefore a browser-session policy interruption, not a
Render outage, application defect, bot challenge or page security issue.

## 8. Gate decision

**Decision: PASS – G4 browser and visual QA is closed.**

No confirmed implementation defect justified a CSS, HTML, copy, evidence-asset
or founder-locked content change. The temporary QA branch and Render service
remain retained for review. Their deletion, PR, merge, update of `main`, release
and production deployment remain outside this authorisation and require a
separate founder decision.

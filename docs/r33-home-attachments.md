# Homepage opening and document feedback - 15 September 2026

The founder requested two focused changes: put the homepage CTA pair back on
one desktop row, align the Evidence Pack preview to the top, and acknowledge
document loading throughout the public website.

## Scope

- Desktop homepage only: two equal CTA columns, top-aligned folio, less opening
  padding and viewport-height-aware typography/folio sizing on short laptops.
  Preserve text, button order, destinations, imagery and mobile stacked journeys.
- Every public HTML entry point loads one shared local stylesheet and deferred
  script. These head-only additions do not change the approved page bodies,
  headers or footers. No new page, dependency, tracking, fetch, authentication,
  storage or CSP relaxation.
- Ordinary clicks on record/file links receive an immediate accessible spinner
  and status. Same-tab Evidence Pack navigation allows the notice to paint before
  following the original URL. Back/forward restoration clears stale feedback.
- The three public record pages track their actual image load/error events.
  Lazy images are tracked on entering the viewport. Slow and failed loads offer
  a reload action. Reduced motion and print are respected.
- Native file links, download filenames, modifier keys and new tabs keep browser
  behavior. A source page cannot measure completion in another tab or the browser
  download manager. Its short opening spinner changes to an honest handoff message
  after eight seconds; this is not a progress percentage or completion claim.

## Frozen document

The Fischamend source checksum still verifies the original approved HTML after
removing only the exact two authorized feedback imports. The PDF, document text,
local print styling and all evidence image hashes remain unchanged. The existing
21 main/header/footer surface checks continue without new expected hashes.

## Verification

- Local HTML, CSS, claim, immutable asset, approved surface and form checks pass.
- Browser verification runs in the existing GitHub Actions review workflow.
  Added laptop viewport bounds at 1280x650, 1366x668, 1440x780, 1536x760 and
  1920x950, with opening screenshots and geometry in the review artifacts.
- Added slow navigation, delayed image, failed image/reload, native file handoff,
  Back navigation, new-tab and mobile behavior checks.
- Existing full responsive and public record checks remain required.

Draft PR only. The founder performs the merge. Production remains on the current
main commit until that merge and the subsequent successful Pages deployment.

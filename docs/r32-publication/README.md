# R3.2 publication candidate

This branch integrates the founder-approved R3.2 public website over main at `51f0d100ce07c3342bc7753a11011dae8043525f`. The founder completed the visual review; the final About hero selector fix is included. Approval of the design is distinct from production publication.

## What changes

- The approved CRI, Validation, Investors, Contact and Evidence Pack overview, with the mobile disclosure strategy and prepared email drafts.
- About's hero and editable sections use the refreshed design. Its programme section and all seven approved headers/footers are preserved.
- The homepage receives only the previously approved Brief CTA and navigation styling. Its evidence imagery and other modules stay unchanged.
- Brief access copy expressly includes paid professional access and individually selected free evaluation invitations. Requests do not grant access or buy a bank pilot.

## Integration-only corrections

- Uppercase DOCTYPE and trailing whitespace cleanup.
- The three draft forms use native submit buttons and their existing submit handler, enabling keyboard submission without duplicate preparation. They do not transmit requests.
- Two labelled visual groups receive `role="group"`.
- Complete favicon and sharing metadata on the new inner pages; retain the existing shared CRI JSON-LD product identity.
- Add the Evidence Pack overview to the sitemap and machine-readable site guide. Updated dates identify this source revision.
- Update repository contracts that previously required the superseded portraits, navigation and page modules. Keep immutable asset, institutional, entity, footer and public-claim checks.

## Verification

`npm ci` and `npm run validate` pass. This covers 37 HTML entry points, 13 indexed page metadata contracts, original CSS plus 13 new CSS layers, four new JavaScript layers, 21 frozen main/header/footer surfaces, 21 form-rule cases and the responsive logic fixture. A filesystem audit resolved 908 internal references with no missing files or fragments. Original R3.2 source checks are recorded separately (328 pass, zero fail).

The Playwright expectations have been updated and syntax checked. They were **not executed in this session**. A prior local preview URL was rejected by browser security policy; no alternate renderer was used to bypass it. This source validation is not a new visual, real-device, font/network, email-delivery or protected Brief sign-in test. Existing repository CI remains unchanged.

## Mobile composition check after the first CI run

The first GitHub Actions run passed 69 of 70 browser tests. Its only failure was the old 13.1-screen total-height budget at 390 × 844: the approved R3.2 homepage measured 13.206 screens. Compared with main, homepage source changes are confined to the approved navigation and the expanded two-step Brief journey. The old action row reserved 108px (two 48px buttons plus a 12px gap). A diagnostic CI rerun measured the approved expanded journey at 316px and the total page at 11146px; normalizing that block to its former allowance gives 10938px (12.960 screens). The initial 300px estimate for the journey did not account for its actual text wrapping with the test's fallback fonts and failed its independent cap.

The follow-up changes the test and this note only, with no website HTML, CSS, assets or copy changes. It independently caps the approved journey at 320px based on that measured 316px, checks that its explanations remain visible, and retains the original 13.1-screen budget after normalizing that one block to its former 108px allowance. The rest of the page remains subject to the original budget, and an oversized journey fails its own cap. Measured block and explanation geometry is attached to the test report. The full CI rerun determines the result; this note alone does not claim it passed.

## Release and rollback

The founder merges this branch after reviewing the exact commit and required repository checks. PR #40 is an older draft; this branch carries the later approved direction, so both should not be merged independently. This change does not modify or close PR #40.

The [14 September aerial-image review](AERIAL_SOURCES.md) resolves the earlier additional-receipt requirement for the four public aerial images using retained source records and official CC BY 4.0 product terms. Missing exact download requests or capture days remain documentation limits, not automatic blockers. This conclusion does not extend the aerial-image licences to other media or private Brief content.

Before merge, confirm that the contact addresses receive a real manually sent test message. Preserve applicable credits for other retained media. Verify the public host's cache/indexing behaviour after deployment. Do not submit IndexNow before the matching release is live. Private Brief operations and authentication are a separate release surface.

If a published regression is confirmed, revert the R3.2 merge through a reviewed revert PR and verify the deployed commit. Do not reset main, delete history, or point the public site at a private Brief bundle. A website rollback does not restore a database or revoke invitations.

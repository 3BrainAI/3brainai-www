# CRI Evidence Pack hub and The Brief: T06 integration draft

The public site needs one place to explain the public Evidence Pack and the private walkthrough. Previously its navigation led to homepage anchors and offered no consistent entry point for The Brief.

This change adds `/evidence-packs/`, aligns navigation and footers across 18 canonical English pages, and adds contextual links from the homepage, CRI, Validation, Investors and Use Cases. It extends the homepage visual direction while keeping the existing destination-page designs. Fischamend v0.1 HTML, PDF and image bytes are preserved. The historical prototypes keep their archive framing; their shared navigation is updated.

## Current state: contact route

All links in this draft resolve. The new hub describes The Brief and routes enquiries to the existing Contact page. It does not display a working invitation login or pretend to accept a request. Invited visitors are directed to the address accompanying their invitation.

The live invitation system and request form are a separate service. Its final origin, intake and deployment are not verified by this pull request. Keep this pull request as a draft until the agreed review and launch checks have been completed.

## Complete the service connection

| Public action | Verified application destination | Expected behavior |
| --- | --- | --- |
| Enter The Brief | Service origin followed by `/` | Continue a valid session or show invitation login |
| Request access | Service origin followed by `/request-access` | Accept the short request; no automatic grant of access |

Replace the `CRI_BRIEF_ACCESS_START` / `CRI_BRIEF_ACCESS_END` block with the two verified HTTPS links after the service passes its live checks. Add `rel="noreferrer"`. No invitation code, email, audience, campaign identifier or other visitor data belongs in either URL. The returning-visitor target is the root of the service, not a forced login page.

At that point update the shared The Brief navigation target and its navigation contracts together. Preserve `/evidence-packs/#brief-access` as the descriptive hub section and preserve the old homepage anchor aliases for existing links.

Before publishing, verify the request form with its four required fields, confirmation and operator receipt; session resume and logout; the transition between the public and private hosts; and navigation on an actual mobile browser. Publishing this static page alone does not complete qualified lead collection.

## Validation completed for this draft

- The existing HTML, CSS, metadata and content-preservation checks pass for 37 HTML entry points and 13 canonical metadata contracts.
- Local links, asset paths and fragment destinations on the 18 changed HTML pages were checked.
- Browser checks covered the hub, its section link and the contact destination on desktop, plus a 390 px iframe for the narrow layout and menu. This is a responsive layout check, not an actual mobile-device test.
- The hub's menu now closes after choosing a section link and supports Escape. This fixes content being covered after selecting The Brief in narrow layouts.
- The repository's existing CI navigation fixtures include the new hub and target. The remote browser suite is a separate result; do not infer its completion from the local static checks.

Founder merge remains manual. No private runtime source, visitor data, credentials or confidential documents are included in this change.

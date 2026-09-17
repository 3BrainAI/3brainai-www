# The Brief: one entry point and free invitations

An invited visitor could not reach sign-in from the public website. Links led to another access request, and the public copy restricted the free-access promise to editorial evaluation. The founder has clarified that access to The Brief is always free.

This change adds `/brief/` with separate routes for an existing code and a new invitation request. Homepage, current English navigation, primary footers, CRI, Contact, the Evidence Pack guide and the public record's web footer lead there. Old `/validation/#brief-request` bookmarks retain the request form and gain a link for visitors who already have a code. Paid bank pilots remain separate engagements.

The historical Lausitz and German North Sea records retain their frozen navigation. The protected cases, source imagery, public PDF and printable record bodies are unchanged.

The public page does not collect credentials. It links to the proposed application origin `https://brief.3brain.ai/login`. Requests use the existing local email-draft flow and do not provision access automatically. All invited visitors receive the same free-access wording.

## Release dependency

**Keep this PR in draft. Do not merge until the application address is ready and its invited-visitor journey has passed a live acceptance check.**

As verified on 17 September 2026, the proposed subdomain has no DNS record. The deployed application also has an additional identity gate in front of its invitation form. Website copy alone cannot deliver the intended email-and-code-only experience.

The founder must approve the application access change. Set up the branded application address and TLS, preserve server-side invitation and session checks for every case asset, and verify sign-in with a disposable invitation, wrong credentials, expiration, revocation and sign-out. Do not place real invitation codes in this repository, URLs, screenshots or test artifacts. Then mark the website PR ready for the founder's merge.

## Validation

Source contracts cover 42 HTML entry points, metadata, navigation, free-access copy and the existing request forms. Browser tests cover both entry routes at 320, 390, 768 and 1440 pixels, no horizontal overflow, navigation and the JavaScript-disabled request route. The sign-in destination is asserted as a link; these public-site tests do not certify the private deployment or DNS.

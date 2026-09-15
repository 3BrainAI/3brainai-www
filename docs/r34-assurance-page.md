# Assurance page: first public release

This change prepares `/assurance/` in the existing website. It adds a footer link,
retains `/security/`, preserves the homepage and primary navigation, and uses the
existing `contact@3brain.ai` address for initial enquiries.

## Content

The page covers the operator, the CRI product boundary and current validation
stage, Founder/CTO responsibilities, the public Fischamend evidence example,
independent-assurance terminology, due diligence and security contact.

The `data-assurance-claim` identifiers bind the proposed public copy to its
separate content review. They are not displayed as approval or control status.
This candidate does not include operational control assertions, certification
badges, vendor tables, private documents or detailed infrastructure information.

## Request behaviour

The form prepares a local, copyable email draft. Its fixed recipient and subject
cannot be selected through user input. Required fields include the professional
identity, purpose, an information category, NDA status and acknowledgement of the
existing Privacy information. It does not submit to a server, store answers or
provide access. For shorter drafts it also offers an ordinary email-client link;
longer drafts remain complete and copyable. Editing invalidates an old draft.

This is the site's existing email-based intake model. It is not an automated
request-record backend or document-access service. Received email and any later
disclosure remain separate operational steps.

## Review and publication

The Founder approved this first public version on 15 September 2026 and confirmed
the CTO role and prior alignment on the scope. The separate review record
attributes publication approval to the Founder; it does not invent a new CTO
sign-off. The published role descriptions remain limited to Founder and CTO.

The review stamp records that content approval date. The page is `index,follow`,
with matching metadata in `scripts/r32-canonical-pages.json`, a sitemap entry,
and an Assurance reference in `llms.txt`. The manual enquiry model remains
explicit and makes no automatic-access or operational service-level promise.

Release through the existing pull-request and Pages process, then verify the
public page, review date, footer link and enquiry controls after deployment.

## Verification

Local validation checks HTML, CSS, JavaScript, metadata, claim identifiers,
anchors, form labels, unchanged evidence assets and existing content boundaries.
The existing 21 approved R3.2 surfaces retain their hashes after removing only
the exact newly authorised Assurance footer link.

Browser checks cover desktop/tablet/mobile layout, keyboard focus, working
anchors, fixed email routing, no request transport or local storage, required
fields, stale drafts, long Unicode input and the no-JavaScript fallback. They
run with the full existing GitHub Actions suite and retain review screenshots.

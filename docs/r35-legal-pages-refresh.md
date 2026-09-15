# R35: Privacy, Security and Imprint refresh

User request: refresh the three existing public information pages after Assurance was published. Base: main 207e04e (PR #44). Founder retains manual merge.

## Changes

- Reuse the published Assurance typography, colours, spacing and responsive reading layout. Add scoped legal-page styling, section navigation, related-page links and a visible update date.
- Preserve all three URLs, legacy heading anchors, global header/footer navigation and every existing Imprint section and company identifier. Update descriptions and sitemap dates together.
- Privacy explains local email preparation on Contact, Validation, Investors and Assurance, the deliberate send step, and the separate access boundary for The Brief. It identifies public hosting, font requests and email services and gives an enquiry/privacy-rights contact.
- Security provides a direct reporting route and points to Assurance for roles and scoped due diligence. It removes the outdated blanket claim that the public site has no connection to archives or private sections.
- No new scripts, trackers, cookies, backend transport or access grants. Shared document-loading feedback is retained.

## Content basis and limits

Local draft behaviour is established by `assets/cri-web-r31/public.js`, the form configuration, `assets/js/assurance-request.js` and existing tests. The no-installed-analytics statement is limited to the public website's page scripts; it does not claim an absence of provider security logs. GitHub Pages hosting is established by the successful Pages deployment. Microsoft 365 / Outlook email and individually agreed Brief access follow the existing project context.

The correspondence purpose remains answering/routing enquiries. The updated Privacy copy specifies ordinary professional correspondence interests, conditional pre-contractual processing, retention criteria and a rights contact. It does not invent a fixed deletion period, data-residency guarantee, executed processor agreement or compliance certification. It covers the public website and initial enquiries; it is not a replacement notice for authenticated Brief activity or customer pilot processing.

Primary references consulted on 15 September 2026:

- [GitHub Pages data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection): visitor IP addresses are logged for security.
- [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement): provider processing and international-transfer information.
- [Your Europe: data protection under GDPR](https://europa.eu/youreurope/business/governance-and-sustainability/digital-and-data-compliance/data-protection-gdpr/index_en.htm): transparent information, processing bases and individual rights.
- [Czech Office for Personal Data Protection](https://uoou.gov.cz/en): supervisory-authority contact.

## Verification

`npm run validate` covers the 38 HTML entry points, CSS, metadata/sitemap consistency, company identifiers and the previously approved product surfaces. `tests/legal-pages.spec.mjs` renders all three refreshed pages at 390, 768 and 1366 px and checks horizontal overflow, readable typography and section destinations below the sticky header. The existing CI workflow retains the nine screenshots as review artifacts.

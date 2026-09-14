# Public aerial-image source review

Reviewed 14 September 2026. Scope: the four aerial images used on CRI and Investors in R3.2. This supersedes the earlier handoff's requirement to obtain an additional acquisition receipt before publishing these four images.

## Publication conclusion

The retained source records identify the providers and link the displayed files to the prepared source rasters. Official provider pages confirm CC BY 4.0 for the identified orthophoto products. On that evidence, this review finds no need to request a separate image permission or purchase another licence for this public use. Original download URLs and precise capture dates that remain unavailable are recorded as documentation limits, not automatic publication blockers. Provider identification for Brno relies on retained source metadata; it was not independently established by a new upstream download.

CC BY 4.0 permits commercial reuse under its conditions. Preserve supplied attribution and notices, reasonably practicable source links, the licence link and indications of modifications. Do not imply provider endorsement or impose restrictions contrary to the licence. The licence does not prescribe retaining a download receipt or discovering an unknown capture day. [CC BY 4.0, sections 2 and 3](https://creativecommons.org/licenses/by/4.0/legalcode.en)

## File-by-file findings

| Image | Evidence reviewed | Result and retained limits |
|---|---|---|
| Smíchov City | Source metadata contains the full ČÚZK ORTOFOTO WMS request, source and display grids, upstream and prepared-image hashes, and retrieval date 10 September 2026. The source image was reprojected and resampled before the web preview was made. | The earlier summary overlooked the acquisition URL and retrieval-date field. The image is linked to the ORTOFOTO service, whose product page specifies CC BY 4.0. Exact capture day remains unknown; the 2025 product reference is not a precise capture timestamp. |
| Nová Zbrojovka, Brno | Retained metadata names ČÚZK and CC BY 4.0, records the geographic grid and original raster hash. The source raster matches that hash and the public preview matches the retained preview record. | The official Ortofoto ČR product terms support the recorded licence. This review records the official product terms alongside the retained portal link. Exact download request, tile identifier and capture date remain unavailable; none was fabricated. Attribution to ČÚZK rests on the retained source record. |
| CTP Vienna East | Retained metadata identifies basemap.at, CC BY 4.0, layer `bmaporthofoto30cm`, geographic bounds and raster hash. Public preview matches the retained record. | The provider identifies its orthophoto product and explicitly permits commercial reuse with linked attribution. Exact tile-download request remains unavailable. The image's 2022 watermark is retained as historical context; no precise capture day is asserted. |
| Holland Hydrogen I | Retained metadata contains the full PDOK WMS request for `2025_ortho25`, geographic bounds and raster hash. The published JPEG bytes match the retained source raster. | Beeldmateriaal publishes its orthophoto imagery under CC BY 4.0. Attribution and provider link are present. The 2025 layer is identified; exact capture day remains unknown. |

Provider references checked for this review: [ČÚZK Ortofoto ČR](https://geoportal.cuzk.gov.cz/Default.aspx?lng=CZ&mapid=83&menu=23&metadataID=CZ-CUZK-ORTOFOTO-R&metadataXSL=metadata&mode=TextMeta&side=ortofoto), [ČÚZK ORTOFOTO service](https://ags.cuzk.gov.cz/arcgis1/rest/services/ORTOFOTO/MapServer), [basemap.at terms](https://basemap.at/en/), [basemap.at orthophoto product](https://basemap.at/en/orthofoto/), [Beeldmateriaal imagery and licensing](https://www.beeldmateriaal.nl/dataroom).

## Correction to the earlier audit

The N2 extraction script populated its provisional `rights_status` from whether a text label contained `CC BY`. Smíchov's label said `Open data · source terms`, so it received a generic clearance warning. This was not a provider refusal or a finding of an incompatible licence. The fuller Smíchov metadata and the official product terms resolve that warning for this use.

The old summaries also combined incomplete acquisition history with licence compliance. These are different checks. They remain useful records of what was available then, but their blanket additional-receipt requirement no longer applies to the four files assessed here.

## Verification and scope

The accompanying [source review record](aerial-source-review.json) records hashes, retained acquisition metadata and explicit unknowns. Hash matching verifies file continuity; it is not independent proof of authorship. No new upstream raster acquisition or image-generation operation was performed. The recorded Smíchov ATOM feed could not be read by the web lookup in this review; its contents are not represented as freshly verified. The live ORTOFOTO service and official product terms were readable.

Existing public credits identify providers, licence links, historical limits and prepared displays, and distinguish the images from model findings. The record here supplies the detailed processing history and product-term links. This follow-up changes documentation only; page source, image bytes, layout, headers and footers are unchanged. This review does not licence the whole website, third-party logos, portraits, private Brief content or model geometry under CC BY.

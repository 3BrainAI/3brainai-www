"""Render the reviewed v0.2 PDF and editable social SVG to website PNGs.

PDF source: fischamend-v0_2.pdf exported by the repository's Chromium print
check in tests/editorial-screening.spec.mjs. Keep the original v0.1 unchanged.
Requires PyMuPDF and CairoSVG. Run from the repository root.
After regeneration, visually inspect both pages and the social image before
updating scripts/r42-rendered-assets.json.
"""
from pathlib import Path
import os
import fitz
import cairosvg

root = Path(__file__).resolve().parents[1]
pdf = root / 'evidence-packs/fischamend/3BrainAI_CRI_Fischamend_Evidence_Pack_v0_2.pdf'
output = root / 'assets/img/fischamend-v0_2'
output.mkdir(exist_ok=True)
with fitz.open(pdf) as document:
    assert len(document) == 2
    for index, page in enumerate(document):
        matrix = fitz.Matrix(1190 / page.rect.width, 1684 / page.rect.height)
        image = page.get_pixmap(matrix=matrix, alpha=False)
        target = output / f'evidence-pack-page-{index + 1}.png'
        temporary = target.with_suffix('.tmp.png')
        image.save(temporary)
        os.replace(temporary, target)
svg = root / 'assets/img/og_fischamend_evidence_pack_v0_2.svg'
cairosvg.svg2png(url=str(svg), write_to=str(svg.with_suffix('.png')),
                output_width=1200, output_height=630)

"""One-off: public/WEF.jpg is really a lossy WebP with a transparency checkerboard
baked into the pixels. Turn light pixels into real transparency, trim the margins
and save public/wef-logo.png.

Run with: python3 scripts/clean-wef-logo.py
"""

from PIL import Image

SOURCE = "public/WEF.jpg"
TARGET = "public/wef-logo.png"
OPAQUE_BELOW = 170  # luminance kept fully opaque
CLEAR_ABOVE = 205  # luminance treated as background

source = Image.open(SOURCE).convert("RGB")
luminance = source.convert("L")

alpha = luminance.point(
    lambda value: 0
    if value >= CLEAR_ABOVE
    else 255
    if value <= OPAQUE_BELOW
    else round((CLEAR_ABOVE - value) / (CLEAR_ABOVE - OPAQUE_BELOW) * 255)
)

logo = source.copy()
logo.putalpha(alpha)

# Trim empty margins so the logo can be sized purely by CSS height.
box = alpha.point(lambda value: 255 if value > 24 else 0).getbbox()
if box:
    pad = 4
    left, top, right, bottom = box
    box = (
        max(left - pad, 0),
        max(top - pad, 0),
        min(right + pad, logo.width),
        min(bottom + pad, logo.height),
    )
    logo = logo.crop(box)

logo.save(TARGET, "PNG", optimize=True)
print(f"{SOURCE} {source.width}x{source.height} -> {TARGET} {logo.width}x{logo.height}")

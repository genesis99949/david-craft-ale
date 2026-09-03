from pathlib import Path

from PIL import Image

project = Path(r"F:\Projects\David Craft Beer")
html = (project / "products.html").read_text(encoding="utf-8")
section = html[html.index("<!-- FULL LINEUP"):html.index("<!-- REVIEWS -->")]
assets = [
    "can-blonde.png", "can-amber.png", "can-ipa.png", "can-dark.png",
    "sixpack-bottles-blonde.png", "sixpack-bottles-amber.png",
    "sixpack-bottles-ipa.png", "sixpack-bottles-dark.png",
    "sixpack-cans-blonde.png", "sixpack-cans-amber.png",
    "sixpack-cans-ipa.png", "sixpack-cans-dark.png",
    "hopper-beer-mats.png", "hopper-bottle-opener.png", "hopper-pint-glass.png",
]
transparency = {}
for name in assets:
    alpha = Image.open(project / "assets" / name).convert("RGBA").getchannel("A")
    transparency[name] = alpha.getextrema()[0] == 0

print({
    "groups": section.count('class="lineup-group"'),
    "cards": section.count("data-product-slug="),
    "buttons": section.count("data-add-to-cart="),
    "beer_399": section.count("3.99 USD"),
    "hopper_2999": section.count("29.99 USD"),
    "qty_500": section.count("<small>500 ml</small>"),
    "qty_six": section.count("<small>6 × 500 ml</small>"),
    "controls": html.count("lineup-carousel-control"),
    "drag_block": "dragstart" in html and "draggable=false" in html,
    "peek": "--carousel-peek" in html,
    "fade_150": "100% - 150px" in html,
    "teal_restored": "background:var(--teal-star);color:var(--cream-soft)" in html,
    "all_assets_transparent": all(transparency.values()),
    "missing_assets": [name for name in assets if not (project / "assets" / name).exists()],
})

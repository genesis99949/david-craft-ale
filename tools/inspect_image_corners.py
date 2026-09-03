from pathlib import Path
from PIL import Image

assets = Path(r"F:\Projects\David Craft Beer\assets")
names = [
    "can-blonde.png", "can-amber.png", "can-ipa.png", "can-dark.png",
    "sixpack-bottles-blonde.png", "sixpack-bottles-amber.png",
    "sixpack-bottles-ipa.png", "sixpack-bottles-dark.png",
    "sixpack-cans-blonde.png", "sixpack-cans-amber.png",
    "sixpack-cans-ipa.png", "sixpack-cans-dark.png",
]

for name in names:
    image = Image.open(assets / name).convert("RGBA")
    width, height = image.size
    corners = [
        image.getpixel((0, 0)),
        image.getpixel((width - 1, 0)),
        image.getpixel((0, height - 1)),
        image.getpixel((width - 1, height - 1)),
    ]
    print(name, image.size, corners)

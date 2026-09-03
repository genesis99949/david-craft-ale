from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ASSETS = Path(r"F:\Projects\David Craft Beer\assets")
NAMES = [
    "hopper-beer-mats.png",
    "hopper-bottle-opener.png",
    "hopper-pint-glass.png",
]


def is_background(pixel):
    red, green, blue, _ = pixel
    return min(red, green, blue) >= 218 and max(red, green, blue) - min(red, green, blue) <= 16


for name in NAMES:
    image = Image.open(ASSETS / name).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    queue = deque()

    def seed(x, y):
        index = y * width + x
        if not visited[index] and is_background(pixels[x, y]):
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        seed(x, 0)
        seed(x, height - 1)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                index = ny * width + nx
                if not visited[index] and is_background(pixels[nx, ny]):
                    visited[index] = 1
                    queue.append((nx, ny))

    background = Image.new("L", (width, height), 0)
    background.putdata([255 if value else 0 for value in visited])
    background = background.filter(ImageFilter.GaussianBlur(0.7))
    alpha = background.point(lambda value: 255 - value)
    image.putalpha(alpha)
    output = ASSETS / f"clean-{name}"
    image.save(output, optimize=True)
    print(output.name)

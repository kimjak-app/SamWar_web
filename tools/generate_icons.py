from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ICONS_DIR = ROOT / "assets" / "icons"

OUTPUTS = {
    "icon-192.png": (192, 192),
    "icon-512.png": (512, 512),
    "favicon-32.png": (32, 32),
    "apple-touch-icon.png": (180, 180),
}


def crop_to_square(image: Image.Image) -> Image.Image:
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def fit_square(image: Image.Image, size: int) -> Image.Image:
    square = crop_to_square(image)
    return square.resize((size, size), Image.LANCZOS)


def build_maskable(image: Image.Image) -> Image.Image:
    background = Image.new("RGBA", (512, 512), "#101010")
    safe_icon = fit_square(image, 410)
    offset = ((512 - 410) // 2, (512 - 410) // 2)
    background.alpha_composite(safe_icon, dest=offset)
    return background


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python tools/generate_icons.py <source-image>")
        return 1

    source_path = Path(sys.argv[1]).resolve()
    if not source_path.exists():
        print(f"Source image not found: {source_path}")
        return 1

    ICONS_DIR.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as source:
        rgba = source.convert("RGBA")

        for filename, size in OUTPUTS.items():
            output = fit_square(rgba, size[0])
            output.save(ICONS_DIR / filename, format="PNG")

        maskable = build_maskable(rgba)
        maskable.save(ICONS_DIR / "icon-maskable-512.png", format="PNG")

    print(f"Generated icons from {source_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

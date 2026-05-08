#!/usr/bin/env python3
"""Generate local lens image contact sheets for visual audit."""

from __future__ import annotations

import argparse
import io
import json
import math
import re
import textwrap
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "public" / "lens_data.json"
PROCESSED_DIR = ROOT / "public" / "lens_images_processed"
DEFAULT_OUTPUT_DIR = ROOT / "audit-output"

STATUSES_TO_PRIORITIZE = {"recommend", "caution"}
AVAILABILITY_TO_PRIORITIZE = {"current"}
ITEMS_PER_SHEET = 40
CARD_W = 280
CARD_H = 300
THUMB_W = 248
THUMB_H = 170
PADDING = 18
GAP = 14
COLS = 4


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc" if bold else "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


FONT_TITLE = load_font(15, bold=True)
FONT_META = load_font(12)
FONT_SMALL = load_font(10)
FONT_HEADER = load_font(20, bold=True)


def safe_slug(value: str) -> str:
    slug = value.lower()
    slug = slug.replace("/", " ")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-") or "unknown"


def lens_name_to_filename(name: str) -> str:
    safe = re.sub(r"[^\w\s.-]", "", name, flags=re.UNICODE)
    safe = re.sub(r"\s+", "_", safe.strip())
    return f"{safe}.png"


def normalize_mount(value: str | None) -> str:
    if not value:
        return "unknown"
    lower = value.lower()
    if "canon rf-s" in lower:
        return "canon-rf-s"
    if "canon rf" in lower:
        return "canon-rf"
    if "nikon z" in lower or lower == "z":
        return "nikon-z"
    if "fujifilm x" in lower or lower == "x":
        return "fuji-x"
    if "sony e" in lower or lower == "fe":
        return "sony-e"
    if "l mount" in lower or lower == "l":
        return "l-mount"
    if "leica m" in lower:
        return "leica-m"
    return safe_slug(value)


def mount_group(lens: dict[str, Any]) -> str:
    values = [lens.get("mount"), *(lens.get("supported_mounts") or [])]
    normalized = [normalize_mount(v) for v in values if v]
    if "canon-rf" in normalized:
        return "canon-rf"
    if "canon-rf-s" in normalized:
        return "canon-rf-s"
    if "nikon-z" in normalized:
        return "nikon-z"
    if "fuji-x" in normalized:
        return "fuji-x"
    if "sony-e" in normalized:
        return "sony-e"
    if "l-mount" in normalized:
        return "l-mount"
    if "leica-m" in normalized:
        return "leica-m"
    return normalized[0] if normalized else "unknown"


def mount_label(lens: dict[str, Any]) -> str:
    values = [lens.get("mount"), *(lens.get("supported_mounts") or [])]
    unique = []
    for value in values:
        if value and value not in unique:
            unique.append(value)
    return " / ".join(unique) or "unknown"


def is_priority_lens(lens: dict[str, Any]) -> bool:
    return (
        lens.get("recommendation_status") in STATUSES_TO_PRIORITIZE
        or lens.get("availability_status") in AVAILABILITY_TO_PRIORITIZE
    )


def local_public_path(url: str) -> Path | None:
    if not url.startswith("/"):
        return None
    return ROOT / "public" / url.lstrip("/")


def resolve_image_source(lens: dict[str, Any]) -> tuple[str | None, str]:
    processed_guess = PROCESSED_DIR / lens_name_to_filename(lens["name"])
    if processed_guess.exists():
        return str(processed_guess), "processed"

    image_url = lens.get("image_url")
    if image_url:
        local = local_public_path(image_url)
        if local and local.exists():
            return str(local), "image_url"
        if image_url.startswith("http://") or image_url.startswith("https://"):
            return image_url, "image_url"

    external = lens.get("image_url_external")
    if external:
        return external, "external"

    return None, "missing"


def load_image(source: str | None) -> Image.Image | None:
    if not source:
        return None
    try:
        if source.startswith("http://") or source.startswith("https://"):
            req = urllib.request.Request(source, headers={"User-Agent": "camera-concierge-image-audit/1.0"})
            with urllib.request.urlopen(req, timeout=8) as response:
                data = response.read()
            return Image.open(io.BytesIO(data)).convert("RGBA")
        return Image.open(source).convert("RGBA")
    except Exception:
        return None


def fit_thumbnail(image: Image.Image) -> Image.Image:
    fitted = ImageOps.contain(image, (THUMB_W, THUMB_H), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (THUMB_W, THUMB_H), (255, 255, 255, 0))
    x = (THUMB_W - fitted.width) // 2
    y = (THUMB_H - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))
    return canvas.convert("RGB")


def draw_wrapped(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], font: ImageFont.ImageFont, fill: tuple[int, int, int], width: int, lines: int) -> int:
    x, y = xy
    wrapped: list[str] = []
    for line in textwrap.wrap(text, width=width):
        wrapped.append(line)
        if len(wrapped) >= lines:
            break
    for line in wrapped:
        draw.text((x, y), line, font=font, fill=fill)
        y += font.size + 4
    return y


def draw_card(sheet: Image.Image, lens: dict[str, Any], index: int) -> None:
    draw = ImageDraw.Draw(sheet)
    row = index // COLS
    col = index % COLS
    x = PADDING + col * (CARD_W + GAP)
    y = 64 + row * (CARD_H + GAP)

    draw.rounded_rectangle((x, y, x + CARD_W, y + CARD_H), radius=14, fill=(255, 255, 255), outline=(221, 226, 235), width=1)

    source, source_type = resolve_image_source(lens)
    image = load_image(source)
    thumb_box = (x + 16, y + 14, x + 16 + THUMB_W, y + 14 + THUMB_H)
    draw.rounded_rectangle(thumb_box, radius=10, fill=(248, 250, 252), outline=(226, 232, 240), width=1)

    if image:
        thumb = fit_thumbnail(image)
        sheet.paste(thumb, (x + 16, y + 14))
    else:
        draw.text((x + 92, y + 82), "missing", font=FONT_TITLE, fill=(148, 163, 184))

    tag_fill = (15, 23, 42) if source_type != "missing" else (185, 28, 28)
    draw.rounded_rectangle((x + 24, y + 22, x + 96, y + 42), radius=9, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
    draw.text((x + 32, y + 26), source_type[:10], font=FONT_SMALL, fill=tag_fill)

    text_y = y + 198
    text_y = draw_wrapped(draw, lens["name"], (x + 16, text_y), FONT_TITLE, (15, 23, 42), width=28, lines=2)
    brand = lens.get("brand") or "brand unknown"
    draw.text((x + 16, text_y + 4), brand, font=FONT_META, fill=(71, 85, 105))
    draw.text((x + 16, text_y + 22), mount_label(lens), font=FONT_META, fill=(71, 85, 105))
    status = f"{lens.get('recommendation_status') or '-'} / {lens.get('availability_status') or '-'}"
    draw.text((x + 16, y + CARD_H - 28), status, font=FONT_SMALL, fill=(100, 116, 139))


def write_sheet(group_name: str, page: int, group_lenses: list[dict[str, Any]], output_dir: Path) -> Path:
    rows = math.ceil(len(group_lenses) / COLS)
    width = PADDING * 2 + COLS * CARD_W + (COLS - 1) * GAP
    height = 78 + rows * CARD_H + (rows - 1) * GAP + PADDING
    sheet = Image.new("RGB", (width, height), (248, 250, 252))
    draw = ImageDraw.Draw(sheet)
    title = f"{group_name} contact sheet {page:03d}"
    draw.text((PADDING, 22), title, font=FONT_HEADER, fill=(15, 23, 42))
    draw.text((PADDING, 48), f"{len(group_lenses)} lenses", font=FONT_META, fill=(100, 116, 139))

    for index, lens in enumerate(group_lenses):
        draw_card(sheet, lens, index)

    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"contact-sheet-{safe_slug(group_name)}-{page:03d}.png"
    sheet.save(path, "PNG", optimize=True)
    return path


def generate(output_dir: Path, items_per_sheet: int) -> list[Path]:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    all_lenses = data["lenses"]
    priority_lenses = [lens for lens in all_lenses if is_priority_lens(lens)]

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for lens in priority_lenses:
        grouped[mount_group(lens)].append(lens)

    paths: list[Path] = []
    for group_name in sorted(grouped):
        group_lenses = sorted(grouped[group_name], key=lambda lens: (lens.get("brand") or "", lens["name"]))
        for page_index, start in enumerate(range(0, len(group_lenses), items_per_sheet), start=1):
            paths.append(write_sheet(group_name, page_index, group_lenses[start:start + items_per_sheet], output_dir))
    return paths


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate lens image contact sheets for audit.")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Directory for generated contact sheets.")
    parser.add_argument("--items-per-sheet", type=int, default=ITEMS_PER_SHEET, help="Number of lenses per sheet.")
    args = parser.parse_args()

    paths = generate(Path(args.output_dir), args.items_per_sheet)
    print(f"generated {len(paths)} contact sheets")
    for path in paths:
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()

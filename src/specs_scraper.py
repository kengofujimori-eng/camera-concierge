#!/usr/bin/env python3
"""
specs_scraper.py v2
lens_links.json（または lens_data.json）を読み込み、各レンズページから
  - 商品画像 URL（複数ソースを優先順に試す）
  - 重量 / 全長 / フィルター径 / 最短撮影距離
を取得して lens_data.json に保存します。

【画像取得の優先順】
  1. Photo Yodobashi の og:image（最高品質の製品写真）
  2. Asobinet の og:image
  3. Lenstip の og:image

使い方:
  cd ~/camera-concierge/src
  python3 specs_scraper.py

  ※ 途中から再実行しても image_url 取得済みのレンズはスキップされます。
     強制再取得したい場合は --force オプションを付けてください。
  python3 specs_scraper.py --force
"""

import json
import time
import re
import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

INPUT_PATH  = "../public/lens_links.json"
OUTPUT_PATH = "../public/lens_data.json"
FORCE       = "--force" in sys.argv

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# Asobinet の内部ドメイン（これらの og:image は製品写真でないことが多い）
ASOBINET_HOSTS = ("asobinet.com",)

# 信頼できる画像ホスト（メーカー CDN / レビューサイト）
TRUSTED_IMAGE_HOSTS = (
    "photo.yodobashi.com",
    "lenstip.com",
    "cdn.sony.com",
    "www.sony.co.jp",
    "www.sony.com",
    "cdn.dpreview.com",
    "photography.life",
    "i.imgur.com",
    "images-na.ssl-images-amazon.com",
    "m.media-amazon.com",
)


def get_session():
    s = requests.Session()
    s.headers.update(HEADERS)
    return s


def fetch_og_image(url: str, session) -> "str | None":
    """URL から og:image を取得する"""
    try:
        r = session.get(url, timeout=12)
        soup = BeautifulSoup(r.text, "html.parser")
        og = soup.find("meta", property="og:image")
        if og:
            img_url = og.get("content", "").strip()
            if img_url and img_url.startswith("http"):
                return img_url
    except Exception:
        pass
    return None


def is_trusted_image(url: str | None) -> bool:
    """画像 URL が信頼できるホストから来ているかチェック"""
    if not url:
        return False
    return any(host in url for host in TRUSTED_IMAGE_HOSTS)


def is_asobinet_image(url: str | None) -> bool:
    """Asobinet 自身の画像かチェック（製品写真でない可能性大）"""
    if not url:
        return False
    return any(host in url for host in ASOBINET_HOSTS)


def extract_specs(url: str, session) -> dict:
    """ページテキストからスペックを抽出する"""
    specs = {
        "weight": None,
        "length": None,
        "filter_size": None,
        "min_focus": None,
    }
    try:
        r = session.get(url, timeout=12)
        soup = BeautifulSoup(r.text, "html.parser")
        text = soup.get_text(" ", strip=True)

        # 重量 例: 重量：480 g  /  質量480g  /  Weight: 480 g
        for pat in [
            r"(?:重量|質量)[^\d]{0,6}(\d{2,4})\s*g",
            r"Weight[^\d]{0,6}(\d{2,4})\s*g",
        ]:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                specs["weight"] = int(m.group(1))
                break

        # 全長 例: 全長：96.5mm / Length: 96.5 mm
        for pat in [
            r"全長[^\d]{0,6}(\d{2,5}\.?\d*)\s*mm",
            r"(?:Overall length|Length)[^\d]{0,6}(\d{2,5}\.?\d*)\s*mm",
        ]:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                specs["length"] = float(m.group(1))
                break

        # フィルター径 例: フィルター径：67mm / Filter diameter: 67 mm
        for pat in [
            r"フィルター径[^\d]{0,6}(\d{2,3})\s*mm",
            r"(?:Filter (?:diameter|thread|size))[^\d]{0,6}(\d{2,3})\s*mm",
        ]:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                specs["filter_size"] = int(m.group(1))
                break

        # 最短撮影距離 例: 最短撮影距離：0.27m / MFD: 27 cm
        for pat in [
            r"最短撮影距離[^\d]{0,6}(\d+\.?\d*)\s*m(?!m)",
            r"(?:MFD|Minimum focus(?:ing)? distance)[^\d]{0,6}(\d+\.?\d*)\s*(m|cm)",
        ]:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                unit = m.group(2) if m.lastindex >= 2 else "m"
                if "cm" in unit.lower():
                    specs["min_focus"] = round(val)
                else:
                    specs["min_focus"] = round(val * 100 if val < 10 else val)
                break

    except Exception:
        pass
    return specs


def scrape_lens(lens: dict, session) -> None:
    """1本のレンズについて画像 + スペックを取得してインプレースで更新"""
    review_links = lens.get("review_links", [])
    source_url   = lens.get("source_url", "")

    # ── 画像取得（優先順位付き）────────────────────────────
    image_url = None

    # 1. Photo Yodobashi
    py_link = next((l for l in review_links if l.get("site") == "Photo Yodobashi"), None)
    if py_link:
        image_url = fetch_og_image(py_link["url"], session)
        if image_url:
            print(f"    📷 [Photo Yodobashi] {image_url[:70]}")
        time.sleep(0.8)

    # 2. Lenstip
    if not image_url:
        lt_link = next((l for l in review_links if l.get("site") == "Lenstip"), None)
        if lt_link:
            image_url = fetch_og_image(lt_link["url"], session)
            if image_url:
                print(f"    📷 [Lenstip] {image_url[:70]}")
            time.sleep(0.8)

    # 3. Asobinet（サイト内画像でも一応セット、ただし後で上書き可能）
    if not image_url and source_url:
        asobi_img = fetch_og_image(source_url, session)
        if asobi_img and is_trusted_image(asobi_img):
            image_url = asobi_img
            print(f"    📷 [Asobinet trusted] {image_url[:70]}")
        elif asobi_img and not is_asobinet_image(asobi_img):
            image_url = asobi_img
            print(f"    📷 [Asobinet external] {image_url[:70]}")
        elif asobi_img:
            image_url = asobi_img   # サイト内でも無いよりはマシ
            print(f"    📷 [Asobinet fallback] {image_url[:70]}")
        time.sleep(0.8)

    if image_url:
        lens["image_url"] = image_url
    else:
        lens["image_url"] = None
        print("    ⚠️  画像が見つかりませんでした")

    # ── スペック取得 ──────────────────────────────────────
    # Asobinet ページを優先、なければ Photo Yodobashi ページ
    specs_url = source_url or (py_link["url"] if py_link else None)
    if specs_url:
        specs = extract_specs(specs_url, session)

        # Photo Yodobashi でも試す（Asobinet でスペックが取れなかった場合）
        if not specs["weight"] and py_link:
            specs2 = extract_specs(py_link["url"], session)
            for k, v in specs2.items():
                if v is not None and specs[k] is None:
                    specs[k] = v

        lens.update(specs)
        print(f"    ⚖️  {lens.get('weight')}g  📏 {lens.get('length')}mm  "
              f"💧 φ{lens.get('filter_size')}mm  🌸 {lens.get('min_focus')}cm")


def main():
    # ── 入力読み込み ─────────────────────────────────────
    import os
    input_file = OUTPUT_PATH if os.path.exists(OUTPUT_PATH) else INPUT_PATH
    try:
        with open(input_file, encoding="utf-8") as f:
            data = json.load(f)
        print(f"📂 入力: {input_file}")
    except FileNotFoundError:
        print(f"❌ {INPUT_PATH} が見つかりません。")
        print("   camera-concierge/src/ ディレクトリで実行してください。")
        return

    lenses = data.get("lenses", [])
    total  = len(lenses)
    print(f"📦 {total} 件のレンズを処理します（--force: {FORCE}）\n")

    session = get_session()

    for i, lens in enumerate(lenses):
        name = lens.get("name", "?")

        # スキップ判定（--force でなく、かつ image_url が None でない場合）
        if not FORCE and lens.get("image_url") is not None:
            status = "✓" if lens["image_url"] else "✗"
            print(f"[{i+1:3}/{total}] スキップ {status}: {name}")
            continue

        print(f"\n[{i+1:3}/{total}] 🔍 {name}")
        scrape_lens(lens, session)

        # 10 件ごとに途中保存
        if (i + 1) % 10 == 0:
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"    💾 途中保存 ({i+1}/{total})")

    # ── 最終保存 ────────────────────────────────────────
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # ── サマリー ────────────────────────────────────────
    with_image  = sum(1 for l in lenses if l.get("image_url"))
    with_weight = sum(1 for l in lenses if l.get("weight"))
    with_filter = sum(1 for l in lenses if l.get("filter_size"))
    print(f"\n{'='*50}")
    print(f"✅ 完了 → {OUTPUT_PATH}")
    print(f"   画像URL:     {with_image}/{total} ({with_image*100//total}%)")
    print(f"   重量:        {with_weight}/{total} ({with_weight*100//total}%)")
    print(f"   フィルター径: {with_filter}/{total} ({with_filter*100//total}%)")


if __name__ == "__main__":
    main()

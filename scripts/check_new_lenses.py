#!/usr/bin/env python3
"""
check_new_lenses.py
各メーカーの公式サイトをスクレイピングして、
lens_data.json に未登録のレンズ候補を検出する

使い方:
  python3 scripts/check_new_lenses.py              # 全メーカーチェック
  python3 scripts/check_new_lenses.py viltrox      # メーカー名で絞り込み（部分一致）
  python3 scripts/check_new_lenses.py --save       # candidates.json に結果を保存

インストール（初回のみ）:
  pip install requests beautifulsoup4

仕組み:
  各メーカーの製品一覧ページを取得 → レンズ名を抽出 →
  lens_data.json と比較 → 未登録のものをレポート出力
"""

import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ 必要なライブラリが不足しています。以下を実行してください:")
    print("   pip install requests beautifulsoup4")
    sys.exit(1)

# ─── 設定 ────────────────────────────────────────────────────────────────────

BASE_DIR   = Path(__file__).resolve().parent.parent
DATA_PATH  = BASE_DIR / "public" / "lens_data.json"
SAVE_PATH  = BASE_DIR / "public" / "new_lens_candidates.json"
TIMEOUT    = 15
HEADERS    = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ja,en;q=0.9",
}

# ─── 既存データ読み込み ───────────────────────────────────────────────────────

def load_existing_names():
    data = json.loads(DATA_PATH.read_text("utf-8"))
    return [l["name"] for l in data["lenses"]]

# ─── 名前正規化・マッチング ───────────────────────────────────────────────────

def normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[/＋+・×（）()【】「」『』、。\s　]+", " ", text)
    text = re.sub(r"f(\d)", r"f\1", text)     # F1.8 → f1.8
    text = re.sub(r"(\d)mm", r"\1mm", text)
    text = text.strip()
    return text

def token_overlap(a: str, b: str) -> float:
    """短い方のトークンが長い方に何割含まれるか（0.0〜1.0）"""
    ta = set(normalize(a).split())
    tb = set(normalize(b).split())
    if not ta:
        return 0.0
    return len(ta & tb) / len(ta)

def is_already_registered(name: str, existing: list[str], threshold=0.75) -> bool:
    for ex in existing:
        if token_overlap(name, ex) >= threshold or token_overlap(ex, name) >= threshold:
            return True
    return False

# ─── HTTPフェッチ ─────────────────────────────────────────────────────────────

def fetch(url: str) -> BeautifulSoup | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code == 200:
            return BeautifulSoup(r.text, "html.parser")
        print(f"  ⚠ HTTP {r.status_code}: {url}")
    except Exception as e:
        print(f"  ❌ エラー: {e} ({url})")
    return None

def fetch_json(url: str) -> dict | list | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code == 200:
            return r.json()
        print(f"  ⚠ HTTP {r.status_code}: {url}")
    except Exception as e:
        print(f"  ❌ エラー: {e} ({url})")
    return None

# ─── メーカー別スクレイパー ───────────────────────────────────────────────────

def scrape_viltrox():
    """Viltrox Japan (Shopify) - /products.json APIを利用"""
    results = []
    page = 1
    while True:
        data = fetch_json(
            f"https://viltroxjapan.jp/products.json?limit=250&page={page}"
        )
        if not data or not data.get("products"):
            break
        for p in data["products"]:
            title = p.get("title", "")
            handle = p.get("handle", "")
            if any(kw in title.lower() for kw in ["lens", "mm", "レンズ", "f1", "f2", "f4"]):
                results.append({
                    "name": title,
                    "url": f"https://viltroxjapan.jp/products/{handle}",
                })
        if len(data["products"]) < 250:
            break
        page += 1
        time.sleep(0.5)
    return results

def scrape_sigma():
    """Sigma Japan - レンズ一覧ページ"""
    results = []
    soup = fetch("https://www.sigma-global.com/jp/lenses/")
    if not soup:
        return results
    for a in soup.select("a[href*='/lenses/']"):
        name = a.get_text(strip=True)
        href = a.get("href", "")
        if re.search(r"\d+mm", name) and len(name) > 5:
            url = urljoin("https://www.sigma-global.com", href)
            results.append({"name": name, "url": url})
    return results

def scrape_tamron():
    """Tamron Japan - レンズ一覧"""
    results = []
    soup = fetch("https://www.tamron.com/jp/consumer/lenses/")
    if not soup:
        return results
    for a in soup.select("a"):
        name = a.get_text(strip=True)
        href = a.get("href", "")
        if re.search(r"\d+mm|DiIII|SP\s", name) and len(name) > 5:
            url = urljoin("https://www.tamron.com", href)
            results.append({"name": name, "url": url})
    return results

def scrape_sony():
    """Sony Japan - Eマウントレンズ一覧"""
    results = []
    # Sony の製品一覧ページ（複数の系統がある）
    for list_url in [
        "https://www.sony.jp/ichigan/products/lenses/",
        "https://www.sony.jp/ichigan/products/cinema-lenses/",
    ]:
        soup = fetch(list_url)
        if not soup:
            continue
        for a in soup.select("a[href*='/ichigan/products/']"):
            name = a.get_text(" ", strip=True)
            href = a.get("href", "")
            if re.search(r"(FE|E)\s*\d+", name) and len(name) > 5:
                url = urljoin("https://www.sony.jp", href)
                results.append({"name": name, "url": url})
    return results

def scrape_canon():
    """Canon Japan - RFレンズ・EFレンズ一覧"""
    results = []
    for list_url in [
        "https://cweb.canon.jp/ef/lineup/rf/",
        "https://cweb.canon.jp/ef/lineup/ef/",
        "https://cweb.canon.jp/ef/lineup/ef-s/",
    ]:
        soup = fetch(list_url)
        if not soup:
            continue
        for a in soup.select("a"):
            name = a.get_text(" ", strip=True)
            href = a.get("href", "")
            if re.search(r"(RF|EF)\s*\d+|mm.*f/", name, re.I) and len(name) > 5:
                url = urljoin("https://cweb.canon.jp", href)
                results.append({"name": name, "url": url})
    return results

def scrape_nikon():
    """Nikon Japan - NIKKORレンズ一覧"""
    results = []
    soup = fetch("https://www.nikon-image.com/products/nikkor/zmount/")
    if not soup:
        return results
    for a in soup.select("a[href*='/products/nikkor/']"):
        name = a.get_text(" ", strip=True)
        href = a.get("href", "")
        if re.search(r"\d+mm|NIKKOR|Z\s+\d+", name) and len(name) > 5:
            url = urljoin("https://www.nikon-image.com", href)
            results.append({"name": name, "url": url})
    return results

def scrape_fujifilm():
    """Fujifilm X - XFレンズ・GFレンズ一覧"""
    results = []
    for list_url in [
        "https://www.fujifilm-x.com/ja-jp/products/lenses/",
    ]:
        soup = fetch(list_url)
        if not soup:
            continue
        for a in soup.select("a"):
            name = a.get_text(" ", strip=True)
            href = a.get("href", "")
            if re.search(r"(XF|GF|XC)\s*\d+", name) and len(name) > 5:
                url = urljoin("https://www.fujifilm-x.com", href)
                results.append({"name": name, "url": url})
    return results

def scrape_samyang():
    """Samyang - 日本向けレンズ一覧"""
    results = []
    soup = fetch("https://www.samyanglens.com/ja/product/product-list.php")
    if not soup:
        return results
    for a in soup.select("a"):
        name = a.get_text(" ", strip=True)
        href = a.get("href", "")
        if re.search(r"\d+mm|AF\s+\d+|MF\s+\d+", name) and len(name) > 5:
            url = urljoin("https://www.samyanglens.com", href)
            results.append({"name": name, "url": url})
    return results

def scrape_laowa():
    """Laowa Japan"""
    results = []
    soup = fetch("https://www.laowa.jp/products/")
    if not soup:
        return results
    for a in soup.select("a"):
        name = a.get_text(" ", strip=True)
        href = a.get("href", "")
        if re.search(r"\d+mm", name) and len(name) > 5:
            url = urljoin("https://www.laowa.jp", href)
            results.append({"name": name, "url": url})
    return results

def scrape_cosina():
    """Cosina - Voigtlander"""
    results = []
    soup = fetch("https://www.cosina.co.jp/voigtlander/")
    if not soup:
        return results
    for a in soup.select("a"):
        name = a.get_text(" ", strip=True)
        href = a.get("href", "")
        if re.search(r"\d+mm", name) and len(name) > 5:
            url = urljoin("https://www.cosina.co.jp", href)
            results.append({"name": name, "url": url})
    return results

# ─── スクレイパー登録 ─────────────────────────────────────────────────────────

SCRAPERS = [
    {"maker": "Viltrox",     "fn": scrape_viltrox},
    {"maker": "Sigma",       "fn": scrape_sigma},
    {"maker": "Tamron",      "fn": scrape_tamron},
    {"maker": "Sony",        "fn": scrape_sony},
    {"maker": "Canon",       "fn": scrape_canon},
    {"maker": "Nikon",       "fn": scrape_nikon},
    {"maker": "Fujifilm",    "fn": scrape_fujifilm},
    {"maker": "Samyang",     "fn": scrape_samyang},
    {"maker": "Laowa",       "fn": scrape_laowa},
    {"maker": "Cosina",      "fn": scrape_cosina},
]

# ─── 重複除去 ─────────────────────────────────────────────────────────────────

def dedup(items: list[dict]) -> list[dict]:
    seen, out = set(), []
    for item in items:
        key = normalize(item["name"])
        if key not in seen:
            seen.add(key)
            out.append(item)
    return out

# ─── メイン ───────────────────────────────────────────────────────────────────

def main():
    args       = [a for a in sys.argv[1:] if not a.startswith("--")]
    save_flag  = "--save" in sys.argv
    filter_kw  = args[0].lower() if args else None

    existing   = load_existing_names()
    print(f"📦 既存レンズ数: {len(existing)}本\n")

    all_candidates = []

    for scraper in SCRAPERS:
        maker = scraper["maker"]
        if filter_kw and filter_kw not in maker.lower():
            continue

        print(f"🔍 {maker} をチェック中...")
        try:
            found = dedup(scraper["fn"]())
        except Exception as e:
            print(f"  ❌ スクレイパーエラー: {e}")
            found = []

        new_items = [
            item for item in found
            if not is_already_registered(item["name"], existing)
        ]

        print(f"  取得: {len(found)}本 / 未登録候補: {len(new_items)}本")
        for item in new_items:
            item["maker"] = maker
            all_candidates.append(item)
            print(f"  ✨ {item['name']}")
            print(f"     {item['url']}")
        time.sleep(1)

    # ─── レポート出力 ──────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"📊 合計未登録候補: {len(all_candidates)}本")
    print(f"{'='*60}")

    if not all_candidates:
        print("✅ 未登録のレンズは見つかりませんでした")
        return

    # メーカー別サマリー
    from collections import Counter
    by_maker = Counter(c["maker"] for c in all_candidates)
    for maker, count in by_maker.most_common():
        print(f"  {maker}: {count}本")

    if save_flag:
        SAVE_PATH.write_text(
            json.dumps({"candidates": all_candidates}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"\n💾 {SAVE_PATH.name} に保存しました")
        print(f"   → lens_data.json への追加は手動または add_lens.py で行ってください")

if __name__ == "__main__":
    main()

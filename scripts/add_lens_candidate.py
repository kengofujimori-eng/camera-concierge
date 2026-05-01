#!/usr/bin/env python3
"""
add_lens_candidate.py
new_lens_candidates.json を読み込み、
1件ずつ確認しながら lens_data.json に追加する対話スクリプト

使い方:
  python3 scripts/add_lens_candidate.py

check_new_lenses.py --save を先に実行してください
"""

import json
import re
import sys
from pathlib import Path

BASE_DIR    = Path(__file__).resolve().parent.parent
DATA_PATH   = BASE_DIR / "public" / "lens_data.json"
CANDS_PATH  = BASE_DIR / "public" / "new_lens_candidates.json"

# ─── マウント検出 ─────────────────────────────────────────────────────────────

MOUNT_KEYWORDS = {
    "Sony E":      ["FE", "ソニーE", "Sony E", "α", " E "],
    "Nikon Z":     ["ニコンZ", "Nikon Z", " Z ", "Zマウント", "NIKKOR Z"],
    "Canon RF":    ["RF", "キヤノンRF", "Canon RF"],
    "Fujifilm X":  ["XF", "XC", "フジフイルムX", "X Mount", "富士フイルム"],
    "Fujifilm GFX":["GF", "GFX"],
    "Micro 4/3":   ["MFT", "M4/3", "マイクロフォーサーズ", "Olympus", "Panasonic"],
    "L Mount":     ["Lマウント", "L Mount", "Leica L", "SL"],
}

def guess_mount(name: str) -> str:
    for mount, keywords in MOUNT_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in name.lower():
                return mount
    return ""

def guess_focal(name: str) -> str:
    m = re.search(r"(\d+)(?:-(\d+))?mm", name)
    if m:
        return m.group(2) if m.group(2) else m.group(1)
    return ""

def guess_aperture(name: str) -> str:
    m = re.search(r"[Ff][/\s]?(\d+\.?\d*)", name)
    if m:
        return m.group(1)
    return ""

# ─── テンプレート生成 ─────────────────────────────────────────────────────────

def make_template(candidate: dict) -> dict:
    name   = candidate["name"]
    url    = candidate["url"]
    maker  = candidate.get("maker", "")
    mount  = guess_mount(name)
    focal  = guess_focal(name)
    apert  = guess_aperture(name)

    search_query = name.replace(" ", "+")

    return {
        "name":     name,
        "source_url": url,
        "official_url": url,
        "review_links": {},
        "image_url_external": "",
        "purchase_links": {
            "new": {
                "amazon":  f"https://www.amazon.co.jp/s?k={search_query}&rh=n%3A2437276051&tag=techddd-22",
                "rakuten": f"https://hb.afl.rakuten.co.jp/ichiba/5317dc68.864f8157.5317dc69.50ddff71/?pc=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F{search_query}%2F&link_type=text",
                "yahoo":   f"https://shopping.yahoo.co.jp/search?p={search_query}&astid=12",
            },
            "used": {
                "kitamura": f"https://px.a8.net/svt/ejp?a8mat=4B1N9L+CONHRM+2O9U+BW8O2&a8ejpredirect=https%3A%2F%2Fwww.kitamura.jp%2Fused%2Fsearch%2F%3Fq%3D{search_query}",
            },
        },
        "price_info": {
            "new_price":  None,
            "used_price": None,
            "fetched_at": None,
        },
        "mount":              mount or f"【要確認: {maker}】",
        "focal_length":       int(focal) if focal.isdigit() else focal or None,
        "max_aperture":       float(apert) if apert else None,
        "maker":              maker,
        "full_frame":         True,
        "af":                 "AF" in name.upper(),
        "image_stabilization": False,
    }

# ─── メイン ───────────────────────────────────────────────────────────────────

def main():
    if not CANDS_PATH.exists():
        print("❌ new_lens_candidates.json が見つかりません")
        print("   先に: python3 scripts/check_new_lenses.py --save")
        sys.exit(1)

    cands_data = json.loads(CANDS_PATH.read_text("utf-8"))
    candidates = cands_data.get("candidates", [])

    if not candidates:
        print("✅ 追加候補はありません")
        return

    lens_data = json.loads(DATA_PATH.read_text("utf-8"))
    lenses    = lens_data["lenses"]
    added     = 0

    print(f"📋 追加候補: {len(candidates)}本\n")
    print("操作: y=追加する / n=スキップ / q=終了\n")

    remaining = []

    for i, cand in enumerate(candidates, 1):
        print(f"[{i}/{len(candidates)}] {cand['name']}")
        print(f"  URL: {cand['url']}")
        print(f"  マウント推定: {guess_mount(cand['name']) or '不明'}")
        print(f"  焦点距離推定: {guess_focal(cand['name']) or '不明'}mm")
        print(f"  開放F値推定: F{guess_aperture(cand['name']) or '不明'}")

        while True:
            ans = input("  追加しますか? [y/n/q] ").strip().lower()
            if ans in ("y", "n", "q"):
                break

        if ans == "q":
            remaining.extend(candidates[i-1:])  # 未処理分を残す
            break
        elif ans == "y":
            template = make_template(cand)
            lenses.append(template)
            added += 1
            print(f"  ✅ 追加しました\n")
        else:
            remaining.append(cand)
            print(f"  ⏭ スキップ\n")

    # 保存
    if added > 0:
        DATA_PATH.write_text(
            json.dumps(lens_data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"\n💾 lens_data.json に {added}本 追加しました")

    # 残った候補を上書き保存
    cands_data["candidates"] = remaining
    CANDS_PATH.write_text(
        json.dumps(cands_data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    if remaining:
        print(f"📝 {len(remaining)}本はスキップ済み（new_lens_candidates.json に残存）")

if __name__ == "__main__":
    main()

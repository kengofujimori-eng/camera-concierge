#!/usr/bin/env python3
"""
lens_cleanup.py
lens_data.json から非レンズエントリを削除する。

使い方:
  cd ~/camera-concierge/src
  python3 lens_cleanup.py          # ドライラン（削除予定を確認）
  python3 lens_cleanup.py --apply  # 実際に削除して保存
"""

import json, re, sys, os
from collections import defaultdict

INPUT_PATH  = "../public/lens_data.json"
OUTPUT_PATH = "../public/lens_data.json"
DRY_RUN     = "--apply" not in sys.argv

# ══════════════════════════════════════════════════════
#  レンズ判定
# ══════════════════════════════════════════════════════

# 焦点距離・絞りパターン（これがあればレンズとして扱う）
_LENS_RE = re.compile(
    r"(\d{1,3}[-]\d{1,3}\s*mm|\d{1,3}\s*mm|[Ff][/.]?\d+\.?\d*)",
    re.IGNORECASE,
)

# 既知ブランド名
_BRAND_RE = re.compile(
    r"(NIKKOR|Tamron|Viltrox|Voigtlander|Samyang|Rokinon|Laowa|Irix|Tokina|"
    r"Meike|TTArtisan|7Artisan|Mitakon|Zhongyi|Pergear|Neewer|"
    r"NOKTON|ULTRON|HELIAR|LANTHAR|COLOR-SKOPAR|SEPTON|"
    r"LUMIX\s+S|Batis|Loxia|Distagon|Planar|Sonnar|Vario-Tessar|"
    r"ELMARIT|SUMMILUX|APO-Summicron|VARIO-ELMARIT|"
    r"FiRIN|Yongnuo|YN\d)",
    re.IGNORECASE,
)

# ゴミ判定キーワードリスト（部分一致）
_JUNK_KEYWORDS = [
    # 英語ナビゲーション
    "Skip to content", "Log in", "Continue shopping", "Powered by Shopify",
    "About Us", "Contact Us", "Privacy Policy", "Terms of Service",
    "Shipping Policy", "Refund Policy", "Sitemap", "Support Center",
    "Firmware Update", "User Guide", "Become an Affiliate",
    "Intellectual Property", "Flash Guide", "File Download",
    "Camera Lenses", "Cine Lenses", "Lens Series",
    "Lens Firmware", "Adapter Firmware", "Monitor Firmware",
    "Facebook", "Instagram", "Twitter", "TikTok", "YouTube", "Reddit", "Discord",
    "404 Not Found",
    # 通貨・国名
    "USD", "EUR", "GBP", "CAD", "JPY", "AUD", "HUF", "PLN", "CZK", "DKK",
    "SEK", "RON", "HKD",
    "|Argentina", "|Australia", "|Austria", "|Belgium", "|Canada", "|France",
    "|Germany", "|Japan", "|United Kingdom", "|United States", "|Singapore",
    "|Hong Kong", "|Netherlands", "|Sweden", "|Switzerland", "|Spain",
    "|Poland", "|Italy", "|Korea", "|Taiwan", "|Malaysia", "|Thailand",
    # タムロンサイト（日本語）
    "総合TOP", "個人のお客さま", "ビジネスのお客さま", "Global",
    "ニュースルーム", "サステナビリティ", "スポーツ支援", "ソーシャルメディア",
    "タムロングループ", "タムロンストーリー", "タムロンの歴史", "タムロンのものづくり",
    "コーポレート・ガバナンス", "業績", "財務情報", "株式", "社債",
    "個人情報", "特定個人情報", "CSRライブラリ", "トップメッセージ", "社長メッセージ",
    "修理の流れ", "修理進捗", "点検サービス", "故障かなと", "カメラとの互換性",
    "サポートニュース", "よくあるご質問", "お問い合わせ",
    "監視カメラ", "FA/マシン", "カメラモジュール", "車載用", "医療用", "精密光学",
    "カスタマイズ製品", "レンズ加工", "光学開発", "アクチュエータ", "コーティング",
    "樹脂成形", "TAMRON LABS", "フォトコン", "キャンペーン",
    "撮影サンプル", "動画コンテンツ", "TAP-in", "TAMRON ID", "TAMRON Connection",
    "Lens Utility", "IR NEWS", "IR TOPICS", "IR受賞", "IRサイト", "IRイベント",
    "IR資料", "IR情報", "生産終了", "Φ67mm",
    "Sony E-mount", "Nikon Z mount", "FUJIFILM X mount", "CANON RF mount",
    # Viltrox ナビゲーション
    "Viltrox Hot Sale", "Viltrox Store", "About Viltrox", "Viltrox Store Membership",
    "Camera Flash", "Camera Monitor", "Photographic Light", "Lens Adapter",
    # ブログ・レビュー記事タイトル
    "海外の評価", "DPReview", "ライカ M11", "EOS R5", "EOS R3",
    "予約販売開始", "まとめ", "サンプルギャラリー",
]

# 完全一致で除外する短いナビゲーション項目
_JUNK_EXACT = {
    "Canon", "Nikon", "Sony", "Sigma", "Tamron", "Viltrox", "Fujifilm",
    "Leica", "Anamorphic", "Spherical", "Accessories", "Accessory",
    "Camera Flash", "Camera Monitor", "Photographic Light", "Lens Adapter",
    "Other", "Gallery", "New In", "Reviews", "Event", "Insights",
    "Support Center", "Firmware Update",
}


def is_real_lens(name: str) -> bool:
    name = (name or "").strip()
    if not name or len(name) < 4:
        return False

    # 完全一致ゴミ
    if name in _JUNK_EXACT:
        return False

    # キーワード部分一致ゴミ
    for kw in _JUNK_KEYWORDS:
        if kw.lower() in name.lower():
            return False

    # 焦点距離・絞りパターンがあればレンズ
    if _LENS_RE.search(name):
        return True

    # 既知ブランド名があればレンズ
    if _BRAND_RE.search(name):
        return True

    return False


def detect_brand(name: str) -> str:
    if re.search(r"NIKKOR", name, re.I) or re.match(r"Nikkor", name, re.I):
        return "Nikon"
    if re.match(r"RF[-\s]?S?\s?\d|RF[-\s]\d", name, re.I) or name.startswith("Canon"):
        return "Canon"
    if name.startswith("Sigma"):
        return "Sigma"
    if name.startswith("Tamron"):
        return "Tamron"
    if "Viltrox" in name:
        return "Viltrox"
    if re.search(r"NOKTON|ULTRON|HELIAR|LANTHAR|COLOR-SKOPAR|SEPTON|"
                 r"APO-SKOPAR|APO-ULTRON|PORTRAIT HELIAR|SUPER WIDE|SUPER NOKTON", name, re.I):
        return "Voigtlander"
    if re.match(r"(XF|GF|XC)\d", name) or name.startswith("Fujifilm"):
        return "Fujifilm"
    if name.startswith("Samyang"):
        return "Samyang"
    if re.match(r"(FE\s|E\s|FE PZ)", name) or name.startswith("Sony"):
        return "Sony"
    if "LUMIX" in name:
        return "Panasonic"
    if re.search(r"Batis|Loxia|Distagon|Planar|Sonnar|Vario-Tessar|FiRIN", name, re.I):
        return "Zeiss"
    if re.search(r"ELMARIT|SUMMILUX|APO-Summicron|VARIO-ELMARIT|APO-VARIO", name, re.I):
        return "Leica"
    return "OTHER"


def main():
    if not os.path.exists(INPUT_PATH):
        print(f"❌ {INPUT_PATH} が見つかりません")
        sys.exit(1)

    with open(INPUT_PATH, encoding="utf-8") as f:
        data = json.load(f)

    lenses = data.get("lenses", [])
    print(f"📂 入力: {INPUT_PATH}  ({len(lenses)} 件)")
    print(f"{'🔍 ドライラン（--apply で実際に削除）' if DRY_RUN else '⚠️  削除モード'}\n")

    # ── ステップ1: ブランド名プレフィックス補完 ──────────────
    # "17-28mm F/2.8 Di III RXD" → "Tamron 17-28mm F/2.8 Di III RXD"
    _TAMRON_SUFFIX = re.compile(r"\bDi\s+III", re.I)
    _SIGMA_SUFFIX  = re.compile(r"\bDG\s+(DN|HSM|OS)\b", re.I)

    prefixed = 0
    for l in lenses:
        name = l.get("name", "").strip()
        if _TAMRON_SUFFIX.search(name) and not name.lower().startswith("tamron"):
            l["name"] = "Tamron " + name
            prefixed += 1
        elif _SIGMA_SUFFIX.search(name) and not name.lower().startswith("sigma") \
                and not re.match(r"\d+", name):
            pass  # Sigmaはモデル番号が明確なのでスキップ

    if prefixed:
        print(f"🔧 ブランド名補完: {prefixed} 件 (Tamron プレフィックス追加)")

    # ── ステップ2: レビュー記事タイトルなど残存ゴミを除去 ──
    _REVIEW_RE = re.compile(r"(はズーム|はバランス|【海外|オールラウンド|幅広いプロ|最新情報)", re.I)

    keep   = []
    remove = []

    for l in lenses:
        name = l.get("name", "")
        if _REVIEW_RE.search(name):
            remove.append(l)
        elif is_real_lens(name):
            keep.append(l)
        else:
            remove.append(l)

    print(f"✅ 保持: {len(keep)} 件")
    print(f"🗑️  削除: {len(remove)} 件\n")

    print("── 削除対象 ──────────────────────────────────")
    for l in remove:
        img = "✅" if l.get("image_url") else "❌"
        print(f"  {img} {l.get('name','')[:80]}")

    brand_counts = defaultdict(int)
    for l in keep:
        brand_counts[detect_brand(l.get("name", ""))] += 1

    print("\n── 保持後のブランド別件数 ────────────────────")
    for brand, count in sorted(brand_counts.items()):
        print(f"  {brand:15s}: {count:3d} 件")

    if DRY_RUN:
        print("\n── ドライランのため変更なし ──────────────────")
        print("   実際に削除するには: python3 lens_cleanup.py --apply")
    else:
        data["lenses"] = keep
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        with_img = sum(1 for l in keep if l.get("image_url"))
        print(f"\n💾 保存完了: {OUTPUT_PATH}")
        print(f"   {len(keep)} 件 / 画像あり: {with_img} 件 ({with_img*100//len(keep) if keep else 0}%)")


if __name__ == "__main__":
    main()

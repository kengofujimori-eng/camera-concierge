#!/usr/bin/env python3
"""
lens_audit.py
lens_data.json の現在の登録状況を確認し、各メーカーの網羅性レポートを出力する。

使い方:
  cd ~/camera-concierge/src
  python3 lens_audit.py
"""

import json, re, os, sys
from datetime import date

INPUT_PATH = "../public/lens_data.json"

# ══════════════════════════════════════════════════════
#  各メーカーの現行レンズ「正解リスト」（2025年時点）
#  ブランドスクレーパーのフォールバックリストと同期
# ══════════════════════════════════════════════════════

EXPECTED_NIKON = [
    # フルサイズ単焦点
    "NIKKOR Z 20mm f/1.8 S",
    "NIKKOR Z 24mm f/1.8 S",
    "NIKKOR Z 28mm f/2.8",
    "NIKKOR Z 35mm f/1.8 S",
    "NIKKOR Z 40mm f/2",
    "NIKKOR Z 50mm f/1.2 S",
    "NIKKOR Z 50mm f/1.8 S",
    "NIKKOR Z 58mm f/0.95 S Noct",
    "NIKKOR Z 85mm f/1.2 S",
    "NIKKOR Z 85mm f/1.8 S",
    "NIKKOR Z 105mm f/2.8 VR S",     # MC macro
    "NIKKOR Z 135mm f/1.8 S Plena",
    "NIKKOR Z 400mm f/2.8 TC VR S",
    "NIKKOR Z 600mm f/4 TC VR S",
    "NIKKOR Z 800mm f/6.3 VR S",
    # フルサイズズーム
    "NIKKOR Z 14-24mm f/2.8 S",
    "NIKKOR Z 14-30mm f/4 S",
    "NIKKOR Z 17-28mm f/2.8",
    "NIKKOR Z 24-50mm f/4-6.3",
    "NIKKOR Z 24-70mm f/2.8 S",
    "NIKKOR Z 24-70mm f/4 S",
    "NIKKOR Z 24-120mm f/4 S",
    "NIKKOR Z 24-200mm f/4-6.3 VR",
    "NIKKOR Z 28-400mm f/4-8 VR",
    "NIKKOR Z 70-180mm f/2.8",
    "NIKKOR Z 70-200mm f/2.8 VR S",
    "NIKKOR Z 100-400mm f/4.5-5.6 VR S",
    "NIKKOR Z 180-600mm f/5.6-6.3 VR",
    # マクロ
    "NIKKOR Z MC 50mm f/2.8",
    # DX
    "NIKKOR Z DX 12-28mm f/3.5-5.6 PZ VR",
    "NIKKOR Z DX 16-50mm f/3.5-6.3 VR",
    "NIKKOR Z DX 18-140mm f/3.5-6.3 VR",
    "NIKKOR Z DX 50-250mm f/4.5-6.3 VR",
    "NIKKOR Z DX 24mm f/1.7",
]

EXPECTED_CANON = [
    # L 単焦点
    "RF 50mm F1.2 L USM",
    "RF 50mm F1.4 L VCM",
    "RF 85mm F1.2 L USM",
    "RF 85mm F1.2 L USM DS",
    "RF 100mm F2.8 L Macro IS USM",
    "RF 135mm F1.8 L IS USM",
    "RF 400mm F2.8 L IS USM",
    "RF 500mm F4 L IS USM",
    "RF 600mm F4 L IS USM",
    "RF 800mm F5.6 L IS USM",
    # L ズーム
    "RF 14-35mm F4 L IS USM",
    "RF 15-35mm F2.8 L IS USM",
    "RF 24-70mm F2.8 L IS USM",
    "RF 24-105mm F4 L IS USM",
    "RF 70-200mm F2.8 L IS USM",
    "RF 70-200mm F4 L IS USM",
    "RF 100-300mm F2.8 L IS USM",
    "RF 100-500mm F4.5-7.1 L IS USM",
    # STM / 廉価
    "RF 16mm F2.8 STM",
    "RF 24mm F1.8 Macro IS STM",
    "RF 28mm F2.8 STM",
    "RF 35mm F1.8 Macro IS STM",
    "RF 50mm F1.8 STM",
    "RF 85mm F2 Macro IS STM",
    "RF 24-50mm F4.5-6.3 IS STM",
    "RF 24-105mm F4-7.1 IS STM",
    "RF 100-400mm F5.6-8 IS USM",
    "RF 200-800mm F6.3-9 IS USM",
    "RF 600mm F11 IS STM",
    "RF 800mm F11 IS STM",
    # RF-S (APS-C)
    "RF-S 10-18mm F4.5-6.3 IS STM",
    "RF-S 18-45mm F4.5-6.3 IS STM",
    "RF-S 18-150mm F3.5-6.3 IS STM",
    "RF-S 55-210mm F5-7.1 IS STM",
    "RF-S 3.9mm F3.5 STM DUAL FISHEYE",
]

EXPECTED_SIGMA = [
    # Art
    "Sigma 14mm F1.4 DG DN Art",
    "Sigma 20mm F1.4 DG DN Art",
    "Sigma 24mm F1.4 DG DN Art",
    "Sigma 28mm F1.4 DG DN Art",
    "Sigma 35mm F1.2 DG DN Art",
    "Sigma 35mm F1.4 DG DN Art",
    "Sigma 50mm F1.2 DG DN Art",
    "Sigma 50mm F1.4 DG DN Art",
    "Sigma 85mm F1.4 DG DN Art",
    "Sigma 105mm F2.8 DG DN Macro Art",
    "Sigma 70mm F2.8 DG Macro Art",
    "Sigma 135mm F1.8 DG HSM Art",
    "Sigma 14-24mm F2.8 DG DN Art",
    "Sigma 24-70mm F2.8 DG DN Art",
    "Sigma 28-45mm F1.8 DG DN Art",
    "Sigma 28-105mm F2.8 DG DN Art",
    # Sports
    "Sigma 70-200mm F2.8 DG DN OS Sports",
    "Sigma 150-600mm F5-6.3 DG DN OS Sports",
    "Sigma 60-600mm F4.5-6.3 DG DN OS Sports",
    "Sigma 500mm F5.6 DG DN OS Sports",
    # Contemporary
    "Sigma 20mm F2 DG DN Contemporary",
    "Sigma 24mm F3.5 DG DN Contemporary",
    "Sigma 45mm F2.8 DG DN Contemporary",
    "Sigma 65mm F2 DG DN Contemporary",
    "Sigma 90mm F2.8 DG DN Contemporary",
    "Sigma 17-28mm F2.8 DN Contemporary",
    "Sigma 100-400mm F5-6.3 DG DN OS Contemporary",
    # DC DN (APS-C)
    "Sigma 10-18mm F2.8 DC DN Contemporary",
    "Sigma 16mm F1.4 DC DN Contemporary",
    "Sigma 18-50mm F2.8 DC DN Contemporary",
    "Sigma 23mm F1.4 DC DN Contemporary",
    "Sigma 30mm F1.4 DC DN Contemporary",
    "Sigma 56mm F1.4 DC DN Contemporary",
]

EXPECTED_TAMRON = [
    "Tamron 17-28mm F/2.8 Di III RXD",
    "Tamron 28-75mm F/2.8 Di III RXD",
    "Tamron 28-75mm F/2.8 Di III VXD G2",
    "Tamron 35-150mm F/2-2.8 Di III VXD",
    "Tamron 50-400mm Di III VC VXD",
    "Tamron 70-180mm F/2.8 Di III VXD",
    "Tamron 70-180mm F/2.8 Di III VC VXD G2",
    "Tamron 17-50mm F/4 Di III VXD",
    "Tamron 28-200mm F/2.8-5.6 Di III RXD",
    "Tamron 20mm F/2.8 Di III OSD M1:2",
    "Tamron 24mm F/2.8 Di III OSD M1:2",
    "Tamron 35mm F/2.8 Di III OSD M1:2",
    "Tamron 150-500mm F/5-6.7 Di III VC VXD",
    "Tamron 50-300mm F/4.5-6.3 Di III VC VXD",
    "Tamron 90mm F/2.8 Di III MACRO VXD",
    "Tamron 20-40mm F/2.8 Di III VXD",
    "Tamron 17-70mm F/2.8 Di III-A VC RXD",
    "Tamron 11-20mm F/2.8 Di III-A RXD",
    "Tamron 18-300mm F/3.5-6.3 Di III-A VC VXD",
]

EXPECTED_SONY = [
    # G Master
    "FE 12-24mm F2.8 GM",
    "FE 14mm F1.8 GM",
    "FE 16-35mm F2.8 GM",
    "FE 16-35mm F2.8 GM II",
    "FE 20mm F1.8 G",
    "FE 24mm F1.4 GM",
    "FE 24-70mm F2.8 GM",
    "FE 24-70mm F2.8 GM II",
    "FE 35mm F1.4 GM",
    "FE 50mm F1.2 GM",
    "FE 50mm F1.4 GM",
    "FE 70-200mm F2.8 GM OSS",
    "FE 70-200mm F2.8 GM OSS II",
    "FE 85mm F1.4 GM",
    "FE 85mm F1.4 GM II",
    "FE 100mm F2.8 STF GM OSS",
    "FE 100-400mm F4.5-5.6 GM OSS",
    "FE 135mm F1.8 GM",
    "FE 300mm F2.8 GM OSS",
    "FE 400mm F2.8 GM OSS",
    "FE 600mm F4 GM OSS",
    # G / ZA / standard
    "FE 12-24mm F4 G",
    "FE 16-25mm F2.8 G",
    "FE 16-35mm F4 ZA OSS",
    "FE 24mm F2.8 G",
    "FE 24-70mm F4 ZA OSS",
    "FE 24-105mm F4 G OSS",
    "FE 28mm F2",
    "FE 28-60mm F4-5.6",
    "FE 35mm F1.8",
    "FE 40mm F2.5 G",
    "FE 50mm F1.8",
    "FE 50mm F2.5 G",
    "FE 55mm F1.8 ZA",
    "FE 70-200mm F4 G OSS",
    "FE 70-200mm F4 Macro G OSS",
    "FE 70-300mm F4.5-5.6 G OSS",
    "FE 85mm F1.8",
    "FE 90mm F2.8 Macro G OSS",
    "FE 200-600mm F5.6-6.3 G OSS",
    # PZ
    "FE PZ 10-20mm F4 G",
    "FE PZ 16-35mm F4 G",
    "FE PZ 28-135mm F4 G OSS",
    # E (APS-C)
    "E 10-18mm F4 OSS",
    "E 11mm F1.8",
    "E 15mm F1.4 G",
    "E 16-55mm F2.8 G",
    "E 18-105mm F4 G OSS",
    "E 18-135mm F3.5-5.6 OSS",
    "E 24mm F1.8 ZA",
    "E 35mm F1.8 OSS",
    "E 50mm F1.8 OSS",
    "E 55-210mm F4.5-6.3 OSS",
    "E 70-350mm F4.5-6.3 G OSS",
]

EXPECTED_FUJIFILM = [
    # XF 単焦点
    "Fujifilm XF 8mm F3.5 R WR",
    "Fujifilm XF 14mm F2.8 R",
    "Fujifilm XF 16mm F1.4 R WR",
    "Fujifilm XF 16mm F2.8 R WR",
    "Fujifilm XF 18mm F1.4 R LM WR",
    "Fujifilm XF 18mm F2 R",
    "Fujifilm XF 23mm F1.4 R LM WR",
    "Fujifilm XF 23mm F2 R WR",
    "Fujifilm XF 27mm F2.8 R WR",
    "Fujifilm XF 33mm F1.4 R LM WR",
    "Fujifilm XF 35mm F1.4 R",
    "Fujifilm XF 35mm F2 R WR",
    "Fujifilm XF 50mm F1.0 R WR",
    "Fujifilm XF 50mm F2 R WR",
    "Fujifilm XF 56mm F1.2 R WR",
    "Fujifilm XF 60mm F2.4 R Macro",
    "Fujifilm XF 80mm F2.8 R LM OIS WR Macro",
    "Fujifilm XF 90mm F2 R LM WR",
    "Fujifilm XF 200mm F2 R LM OIS WR",
    # XF ズーム
    "Fujifilm XF 10-24mm F4 R OIS WR",
    "Fujifilm XF 16-55mm F2.8 R LM WR",
    "Fujifilm XF 16-80mm F4 R OIS WR",
    "Fujifilm XF 18-55mm F2.8-4 R LM OIS",
    "Fujifilm XF 18-120mm F4 LM PZ WR",
    "Fujifilm XF 50-140mm F2.8 R LM OIS WR",
    "Fujifilm XF 55-200mm F3.5-4.8 R LM OIS",
    "Fujifilm XF 70-300mm F4-5.6 R LM OIS WR",
    "Fujifilm XF 100-400mm F4.5-5.6 R LM OIS WR",
    "Fujifilm XF 150-600mm F5.6-8 R LM OIS WR",
    # GF (中判)
    "Fujifilm GF 23mm F4 R LM WR",
    "Fujifilm GF 30mm F3.5 R WR",
    "Fujifilm GF 45mm F2.8 R WR",
    "Fujifilm GF 50mm F3.5 R LM WR",
    "Fujifilm GF 55mm F1.7 R WR",
    "Fujifilm GF 63mm F2.8 R WR",
    "Fujifilm GF 80mm F1.7 R WR APD",
    "Fujifilm GF 100mm F4 R LM OIS WR Macro",
    "Fujifilm GF 110mm F2 R LM WR",
    "Fujifilm GF 120mm F4 R LM OIS WR Macro",
    "Fujifilm GF 250mm F4 R LM OIS WR",
    "Fujifilm GF 500mm F5.6 R LM OIS WR",
    "Fujifilm GF 20-35mm F4 R WR",
    "Fujifilm GF 32-64mm F4 R LM WR",
    "Fujifilm GF 35-70mm F4.5-5.6 WR",
    "Fujifilm GF 45-100mm F4 R LM OIS WR",
    "Fujifilm GF 100-200mm F5.6 R LM OIS WR",
    "Fujifilm GF 200mm F2 R LM OIS WR",
]

EXPECTED_SAMYANG = [
    "Samyang AF 12mm F2.0 FE",
    "Samyang AF 14mm F2.8 FE",
    "Samyang AF 18mm F2.8 FE",
    "Samyang AF 24mm F1.8 FE",
    "Samyang AF 35mm F1.4 FE",
    "Samyang AF 45mm F1.8 FE",
    "Samyang AF 50mm F1.4 FE",
    "Samyang AF 50mm F1.4 II FE",
    "Samyang AF 75mm F1.8 FE",
    "Samyang AF 85mm F1.4 FE",
    "Samyang AF 85mm F1.4 II FE",
    "Samyang AF 135mm F1.8 FE",
    "Samyang AF 24-70mm F2.8 FE",
    "Samyang 12mm F2.0 NCS CS",
    "Samyang 7.5mm F3.5 UMC Fish-eye MFT",
]


def norm(s: str) -> str:
    return re.sub(r"[^\w]", "", s.lower())


def detect_brand(name: str) -> str:
    n = name.upper()
    if "NIKKOR" in n or name.startswith("NIKKOR"):
        return "Nikon"
    if name.startswith("RF") or name.startswith("Canon"):
        return "Canon"
    if name.startswith("Sigma"):
        return "Sigma"
    if name.startswith("Tamron"):
        return "Tamron"
    if name.startswith("Viltrox") or "VILTROX" in n:
        return "Viltrox"
    if any(k in name for k in ("NOKTON", "ULTRON", "APO-LANTHAR", "COLOR-SKOPAR",
                                "HELIAR", "Voigtlander", "MACRO APO-LANTHAR")):
        return "Voigtlander"
    if re.match(r"(XF|GF|XC)\d", name) or name.startswith("Fujifilm"):
        return "Fujifilm"
    if name.startswith("Samyang"):
        return "Samyang"
    if name.startswith(("FE ", "E ", "FE PZ")):
        return "Sony"
    return "OTHER"


def compare(registered_names: list, expected: list, brand: str) -> dict:
    reg_norms = {norm(n): n for n in registered_names}
    exp_norms = {norm(n): n for n in expected}

    matched = []
    missing = []
    extra   = []

    for en, ename in exp_norms.items():
        if en in reg_norms:
            matched.append(ename)
        else:
            # 部分一致チェック
            found = False
            for rn in reg_norms:
                if (en in rn or rn in en) and min(len(en), len(rn)) >= 8:
                    matched.append(ename)
                    found = True
                    break
            if not found:
                missing.append(ename)

    for rn, rname in reg_norms.items():
        if rn not in exp_norms:
            # 部分一致チェック
            found = False
            for en in exp_norms:
                if (rn in en or en in rn) and min(len(rn), len(en)) >= 8:
                    found = True
                    break
            if not found:
                extra.append(rname)

    return {"matched": matched, "missing": missing, "extra": extra}


def main():
    if not os.path.exists(INPUT_PATH):
        print(f"❌ {INPUT_PATH} が見つかりません")
        print("   cd ~/camera-concierge/src && python3 lens_audit.py を実行してください")
        sys.exit(1)

    with open(INPUT_PATH, encoding="utf-8") as f:
        data = json.load(f)
    lenses = data.get("lenses", [])
    print(f"📂 {INPUT_PATH} → {len(lenses)} 件")

    # ブランド別に分類
    from collections import defaultdict
    by_brand = defaultdict(list)
    for l in lenses:
        brand = detect_brand(l.get("name", ""))
        by_brand[brand].append(l)

    EXPECTED = {
        "Sony":       EXPECTED_SONY,
        "Nikon":      EXPECTED_NIKON,
        "Canon":      EXPECTED_CANON,
        "Sigma":      EXPECTED_SIGMA,
        "Tamron":     EXPECTED_TAMRON,
        "Fujifilm":   EXPECTED_FUJIFILM,
        "Samyang":    EXPECTED_SAMYANG,
    }

    lines = []
    lines.append(f"# Camera Concierge レンズ登録状況 監査レポート")
    lines.append(f"生成日: {date.today()}")
    lines.append(f"総登録数: {len(lenses)} 件\n")

    total_missing = 0
    total_matched = 0

    for brand in ("Sony", "Nikon", "Canon", "Sigma", "Tamron", "Viltrox", "Voigtlander", "Fujifilm", "Samyang"):
        registered = by_brand.get(brand, [])
        reg_names = [l["name"] for l in registered]
        has_img = sum(1 for l in registered if l.get("image_url"))
        no_img  = [l["name"] for l in registered if not l.get("image_url")]

        lines.append(f"## {brand}")
        lines.append(f"登録数: {len(registered)} 件 | 画像あり: {has_img} 件 | 画像なし: {len(no_img)} 件")

        if brand in EXPECTED:
            exp = EXPECTED[brand]
            result = compare(reg_names, exp, brand)
            coverage = len(result["matched"]) * 100 // len(exp) if exp else 0
            lines.append(f"網羅率: {coverage}% ({len(result['matched'])}/{len(exp)} 件)")
            total_matched += len(result["matched"])
            total_missing += len(result["missing"])

            if result["missing"]:
                lines.append(f"\n### ❌ 未登録（{len(result['missing'])} 件）")
                for name in sorted(result["missing"]):
                    lines.append(f"- {name}")

            if result["extra"]:
                lines.append(f"\n### ➕ 追加登録（期待リスト外）（{len(result['extra'])} 件）")
                for name in sorted(result["extra"]):
                    lines.append(f"- {name}")
        else:
            lines.append("（期待リストなし）")

        if no_img:
            lines.append(f"\n### 🖼️ 画像なし（{len(no_img)} 件）")
            for name in sorted(no_img):
                lines.append(f"- {name}")

        lines.append("")  # blank line

    # OTHER
    other = by_brand.get("OTHER", [])
    if other:
        lines.append("## OTHER（ブランド不明）")
        for l in other:
            ok = "✅" if l.get("image_url") else "❌"
            lines.append(f"- {ok} {l['name']}")
        lines.append("")

    # サマリー
    lines.append("---")
    lines.append(f"## 総括")
    lines.append(f"- 総登録数: {len(lenses)} 件")
    lines.append(f"- 画像取得済み: {sum(1 for l in lenses if l.get('image_url'))} 件")
    lines.append(f"- 画像未取得: {sum(1 for l in lenses if not l.get('image_url'))} 件")
    lines.append(f"- 期待リストのうち登録済み: {total_matched} 件")
    lines.append(f"- 期待リストのうち未登録: {total_missing} 件")

    report = "\n".join(lines)
    out_path = "../public/lens_audit_report.md"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"\n✅ レポート保存: {out_path}")
    print(report)


if __name__ == "__main__":
    main()

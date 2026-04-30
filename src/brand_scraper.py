#!/usr/bin/env python3
"""
brand_scraper.py  v3
各メーカー公式サイトからレンズ製品情報を収集し lens_data.json を補完する

対応メーカー（ユーザー提供 URL を使用）:
  Sony / Nikon / Canon / Sigma / Tamron / Viltrox(Japan) / Voigtländer

使い方:
  cd ~/camera-concierge/src
  python3 brand_scraper.py           # 画像未取得のレンズのみ処理
  python3 brand_scraper.py --force   # 全件強制再取得
"""

import json, re, sys, time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote

INPUT_PATH  = "../public/lens_data.json"
FALLBACK    = "../public/lens_links.json"
OUTPUT_PATH = "../public/lens_data.json"
FORCE       = "--force" in sys.argv

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


# ══════════════════════════════════════════════════════
#  ユーザー提供 ラインナップ URL
# ══════════════════════════════════════════════════════
SONY_LINEUP_URL        = "https://www.sony.jp/ichigan/gallery_e-lens/"
NIKON_LINEUP_URL       = "https://nij.nikon.com/products/nikkor/zmount/"
NIKON_LINEUP_FALLBACK  = "https://www.nikon-image.com/products/nikkor/zmount/"
CANON_LINEUP_URL       = "https://personal.canon.jp/product/camera/rf"
CANON_LINEUP_FALLBACK  = "https://cweb.canon.jp/rf/lineup/"
SIGMA_LINEUP_URL       = "https://www.sigma-global.com/jp/lenses/"
TAMRON_LINEUP_URL      = "https://www.tamron.com/jp/consumer/lenses/"
VILTROX_LINEUP_URL     = "https://viltroxjapan.jp/collections/camera-lenses"
VOIGTLANDER_LINEUP_URL = "https://www.cosina.co.jp/voigtlander/"
FUJIFILM_LINEUP_URL    = "https://fujifilm-x.com/ja-jp/products/lenses/"
SAMYANG_LINEUP_URL     = "https://www.samyanglens.com/jp/product/product-list.php?cate=02"


# ══════════════════════════════════════════════════════
#  Nikon Z マウント ハードコードフォールバック
#  （nij.nikon.com / nikon-image.com が DNS 解決できない場合に使用）
# ══════════════════════════════════════════════════════
_NIJ = "https://nij.nikon.com/products/lineup/nikkor/zmount/"
NIKON_Z_FALLBACK = [
    # フルサイズ単焦点（スラッグ規則: nikkor_z_{focal}mm_f{aperture×10}_{grade}）
    ("NIKKOR Z 20mm f/1.8 S",             _NIJ + "nikkor_z_20mm_f18_s/"),
    ("NIKKOR Z 24mm f/1.8 S",             _NIJ + "nikkor_z_24mm_f18_s/"),
    ("NIKKOR Z 28mm f/2.8",               _NIJ + "nikkor_z_28mm_f28/"),
    ("NIKKOR Z 35mm f/1.8 S",             _NIJ + "nikkor_z_35mm_f18_s/"),
    ("NIKKOR Z 40mm f/2",                 _NIJ + "nikkor_z_40mm_f2/"),
    ("NIKKOR Z 50mm f/1.2 S",             _NIJ + "nikkor_z_50mm_f12_s/"),
    ("NIKKOR Z 50mm f/1.8 S",             _NIJ + "nikkor_z_50mm_f18_s/"),
    ("NIKKOR Z 58mm f/0.95 S Noct",       _NIJ + "nikkor_z_58mm_f095_s_noct/"),
    ("NIKKOR Z 85mm f/1.2 S",             _NIJ + "nikkor_z_85mm_f12_s/"),
    ("NIKKOR Z 85mm f/1.8 S",             _NIJ + "nikkor_z_85mm_f18_s/"),
    ("NIKKOR Z 105mm f/2.8 VR S",         _NIJ + "nikkor_z_mc_105mm_f28_vr_s/"),
    ("NIKKOR Z 135mm f/1.8 S Plena",      _NIJ + "nikkor_z_135mm_f18_s_plena/"),
    ("NIKKOR Z 400mm f/2.8 TC VR S",      _NIJ + "nikkor_z_400mm_f28_tc_vr_s/"),
    ("NIKKOR Z 600mm f/4 TC VR S",        _NIJ + "nikkor_z_600mm_f4_tc_vr_s/"),
    ("NIKKOR Z 800mm f/6.3 VR S",         _NIJ + "nikkor_z_800mm_f63_vr_s/"),
    # フルサイズズーム（ズーム域はハイフン区切り: 14-30mm → nikkor_z_14-30mm_...）
    ("NIKKOR Z 14-24mm f/2.8 S",          _NIJ + "nikkor_z_14-24mm_f28_s/"),
    ("NIKKOR Z 14-30mm f/4 S",            _NIJ + "nikkor_z_14-30mm_f4_s/"),
    ("NIKKOR Z 17-28mm f/2.8",            _NIJ + "nikkor_z_17-28mm_f28/"),
    ("NIKKOR Z 24-50mm f/4-6.3",          _NIJ + "nikkor_z_24-50mm_f4-63/"),
    ("NIKKOR Z 24-70mm f/2.8 S",          _NIJ + "nikkor_z_24-70mm_f28_s/"),
    ("NIKKOR Z 24-70mm f/4 S",            _NIJ + "nikkor_z_24-70mm_f4_s/"),
    ("NIKKOR Z 24-120mm f/4 S",           _NIJ + "nikkor_z_24-120mm_f4_s/"),
    ("NIKKOR Z 24-200mm f/4-6.3 VR",      _NIJ + "nikkor_z_24-200mm_f4-63_vr/"),
    ("NIKKOR Z 28-400mm f/4-8 VR",        _NIJ + "nikkor_z_28-400mm_f4-8_vr/"),
    ("NIKKOR Z 70-180mm f/2.8",           _NIJ + "nikkor_z_70-180mm_f28/"),
    ("NIKKOR Z 70-200mm f/2.8 VR S",      _NIJ + "nikkor_z_70-200mm_f28_vr_s/"),
    ("NIKKOR Z 100-400mm f/4.5-5.6 VR S", _NIJ + "nikkor_z_100-400mm_f45-56_vr_s/"),
    ("NIKKOR Z 180-600mm f/5.6-6.3 VR",   _NIJ + "nikkor_z_180-600mm_f56-63_vr/"),
    # マクロ
    ("NIKKOR Z MC 50mm f/2.8",            _NIJ + "nikkor_z_mc_50mm_f28/"),
    # 単焦点（追加）
    ("NIKKOR Z 35mm f/1.4",                  _NIJ + "nikkor_z_35mm_f14/"),
    # DX（APS-C）
    ("NIKKOR Z DX 12-28mm f/3.5-5.6 PZ VR", _NIJ + "nikkor_z_dx_12-28mm_f35-56_pz_vr/"),
    ("NIKKOR Z DX 16-50mm f/3.5-6.3 VR",  _NIJ + "nikkor_z_dx_16-50mm_f35-63_vr/"),
    ("NIKKOR Z DX 18-140mm f/3.5-6.3 VR", _NIJ + "nikkor_z_dx_18-140mm_f35-63_vr/"),
    ("NIKKOR Z DX 50-250mm f/4.5-6.3 VR", _NIJ + "nikkor_z_dx_50-250mm_f45-63_vr/"),
    ("NIKKOR Z DX 24mm f/1.7",            _NIJ + "nikkor_z_dx_24mm_f17/"),
]


# ══════════════════════════════════════════════════════
#  Canon RF マウント ハードコードフォールバック
#  （personal.canon.jp / cweb.canon.jp が取得できない場合に使用）
# ══════════════════════════════════════════════════════
CANON_RF_FALLBACK = [
    # L レンズ（単焦点）
    ("RF 50mm F1.2 L USM",               "https://cweb.canon.jp/rf/lineup/rf50-f1l/"),
    ("RF 50mm F1.4 L VCM",               "https://cweb.canon.jp/rf/lineup/rf50-f14l/"),
    ("RF 85mm F1.2 L USM",               "https://cweb.canon.jp/rf/lineup/rf85-f12l/"),
    ("RF 85mm F1.2 L USM DS",            "https://cweb.canon.jp/rf/lineup/rf85-f12l-ds/"),
    ("RF 100mm F2.8 L Macro IS USM",     "https://cweb.canon.jp/rf/lineup/rf100-f28l/"),
    ("RF 135mm F1.8 L IS USM",           "https://cweb.canon.jp/rf/lineup/rf135-f18l/"),
    ("RF 400mm F2.8 L IS USM",           "https://cweb.canon.jp/rf/lineup/rf400-f28l/"),
    ("RF 500mm F4 L IS USM",             "https://cweb.canon.jp/rf/lineup/rf500-f4l/"),
    ("RF 600mm F4 L IS USM",             "https://cweb.canon.jp/rf/lineup/rf600-f4l/"),
    ("RF 800mm F5.6 L IS USM",           "https://cweb.canon.jp/rf/lineup/rf800-f56l/"),
    # L レンズ（ズーム）
    ("RF 24-105mm F2.8 L IS USM Z",       "https://personal.canon.jp/product/camera/rf/rf24-105-f28lz"),
    ("RF 14-35mm F4 L IS USM",           "https://cweb.canon.jp/rf/lineup/rf14-35-f4l/"),
    ("RF 15-35mm F2.8 L IS USM",         "https://cweb.canon.jp/rf/lineup/rf15-35-f28l/"),
    ("RF 24-70mm F2.8 L IS USM",         "https://cweb.canon.jp/rf/lineup/rf24-70-f28l/"),
    ("RF 24-105mm F4 L IS USM",          "https://cweb.canon.jp/rf/lineup/rf24-105-f4l/"),
    ("RF 70-200mm F2.8 L IS USM",        "https://cweb.canon.jp/rf/lineup/rf70-200-f28l/"),
    ("RF 70-200mm F4 L IS USM",          "https://cweb.canon.jp/rf/lineup/rf70-200-f4l/"),
    ("RF 100-300mm F2.8 L IS USM",       "https://cweb.canon.jp/rf/lineup/rf100-300-f28l/"),
    ("RF 100-500mm F4.5-7.1 L IS USM",   "https://cweb.canon.jp/rf/lineup/rf100-500-f45-71l/"),
    # STM / 廉価
    ("RF 16mm F2.8 STM",                 "https://cweb.canon.jp/rf/lineup/rf16-f28/"),
    ("RF 24mm F1.8 Macro IS STM",        "https://cweb.canon.jp/rf/lineup/rf24-f18/"),
    ("RF 28mm F2.8 STM",                 "https://cweb.canon.jp/rf/lineup/rf28-f28/"),
    ("RF 35mm F1.8 Macro IS STM",        "https://cweb.canon.jp/rf/lineup/rf35-f18/"),
    ("RF 50mm F1.8 STM",                 "https://cweb.canon.jp/rf/lineup/rf50-f18/"),
    ("RF 85mm F2 Macro IS STM",          "https://cweb.canon.jp/rf/lineup/rf85-f2/"),
    ("RF 24-50mm F4.5-6.3 IS STM",       "https://cweb.canon.jp/rf/lineup/rf24-50-f45-63/"),
    ("RF 24-105mm F4-7.1 IS STM",        "https://cweb.canon.jp/rf/lineup/rf24-105-f4-71/"),
    ("RF 100-400mm F5.6-8 IS USM",       "https://cweb.canon.jp/rf/lineup/rf100-400-f56-8/"),
    ("RF 200-800mm F6.3-9 IS USM",       "https://cweb.canon.jp/rf/lineup/rf200-800-f63-9/"),
    ("RF 600mm F11 IS STM",              "https://cweb.canon.jp/rf/lineup/rf600-f11/"),
    ("RF 800mm F11 IS STM",              "https://cweb.canon.jp/rf/lineup/rf800-f11/"),
    # RF-S（APS-C）
    ("RF-S 10-18mm F4.5-6.3 IS STM",    "https://cweb.canon.jp/rf/lineup/rf-s10-18-f45-63/"),
    ("RF-S 18-45mm F4.5-6.3 IS STM",    "https://cweb.canon.jp/rf/lineup/rf-s18-45-f45-63/"),
    ("RF-S 18-150mm F3.5-6.3 IS STM",   "https://cweb.canon.jp/rf/lineup/rf-s18-150-f35-63/"),
    ("RF-S 55-210mm F5-7.1 IS STM",     "https://cweb.canon.jp/rf/lineup/rf-s55-210-f5-71/"),
    ("RF-S 3.9mm F3.5 STM DUAL FISHEYE","https://cweb.canon.jp/rf/lineup/rf-s39-f35/"),
]


# ══════════════════════════════════════════════════════
#  Tamron ハードコードフォールバック
#  （tamron.com がJS描画でリンク取得不可の場合に使用）
# ══════════════════════════════════════════════════════
# ══════════════════════════════════════════════════════
#  Sigma ハードコードフォールバック
#  （sigma-global.com は JavaScript 描画のため使用）
# ══════════════════════════════════════════════════════
SIGMA_FALLBACK = [
    # Art ライン（フルサイズ単焦点）
    ("Sigma 14mm F1.4 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a037_14_f14/"),
    ("Sigma 20mm F1.4 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a069_20_f14/"),
    ("Sigma 24mm F1.4 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a062_24_f14/"),
    ("Sigma 28mm F1.4 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a086_28_f14/"),
    ("Sigma 35mm F1.2 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a058_35_f12/"),
    ("Sigma 35mm F1.4 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a074_35_f14/"),
    ("Sigma 50mm F1.2 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a052_50_f12/"),
    ("Sigma 50mm F1.4 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a076_50_f14/"),
    ("Sigma 85mm F1.4 DG DN Art",         "https://www.sigma-global.com/jp/lenses/a059_85_f14/"),
    ("Sigma 105mm F2.8 DG DN Macro Art",  "https://www.sigma-global.com/jp/lenses/a072_105_f28_m/"),
    ("Sigma 70mm F2.8 DG Macro Art",      "https://www.sigma-global.com/jp/lenses/a018_70_f28_m/"),
    ("Sigma 135mm F1.8 DG HSM Art",       "https://www.sigma-global.com/jp/lenses/a017_135_f18/"),
    # Art ライン（フルサイズズーム）
    ("Sigma 14-24mm F2.8 DG DN Art",      "https://www.sigma-global.com/jp/lenses/a020_14_24/"),
    ("Sigma 24-70mm F2.8 DG DN Art",      "https://www.sigma-global.com/jp/lenses/a026_24_70/"),
    ("Sigma 28-45mm F1.8 DG DN Art",      "https://www.sigma-global.com/jp/lenses/a023_28_45/"),
    ("Sigma 70-200mm F2.8 DG DN OS Sports","https://www.sigma-global.com/jp/lenses/s026_70_200/"),
    # Contemporary ライン（フルサイズ）
    ("Sigma 20mm F2 DG DN Contemporary",  "https://www.sigma-global.com/jp/lenses/c021_20_f20/"),
    ("Sigma 24mm F3.5 DG DN Contemporary","https://www.sigma-global.com/jp/lenses/c025_24_f35/"),
    ("Sigma 45mm F2.8 DG DN Contemporary","https://www.sigma-global.com/jp/lenses/c019_45_f28/"),
    ("Sigma 65mm F2 DG DN Contemporary",  "https://www.sigma-global.com/jp/lenses/c028_65_f20/"),
    ("Sigma 90mm F2.8 DG DN Contemporary","https://www.sigma-global.com/jp/lenses/c029_90_f28/"),
    ("Sigma 17-28mm F2.8 DN Contemporary","https://www.sigma-global.com/jp/lenses/c030_17_28/"),
    ("Sigma 28-105mm F2.8 DG DN Art",     "https://www.sigma-global.com/jp/lenses/a087_28_105/"),
    ("Sigma 100-400mm F5-6.3 DG DN OS Contemporary","https://www.sigma-global.com/jp/lenses/c020_100_400/"),
    ("Sigma 150-600mm F5-6.3 DG DN OS Sports","https://www.sigma-global.com/jp/lenses/s023_150_600/"),
    ("Sigma 60-600mm F4.5-6.3 DG DN OS Sports","https://www.sigma-global.com/jp/lenses/s023_60_600/"),
    ("Sigma 500mm F5.6 DG DN OS Sports",  "https://www.sigma-global.com/jp/lenses/s027_500_f56/"),
    # DC DN ライン（APS-C専用）
    ("Sigma 10-18mm F2.8 DC DN Contemporary","https://www.sigma-global.com/jp/lenses/c023_10_18/"),
    ("Sigma 16mm F1.4 DC DN Contemporary","https://www.sigma-global.com/jp/lenses/c017_16_f14/"),
    ("Sigma 18-50mm F2.8 DC DN Contemporary","https://www.sigma-global.com/jp/lenses/c022_18_50/"),
    ("Sigma 23mm F1.4 DC DN Contemporary","https://www.sigma-global.com/jp/lenses/c021_23_f14/"),
    ("Sigma 30mm F1.4 DC DN Contemporary","https://www.sigma-global.com/jp/lenses/c020_30_f14/"),
    ("Sigma 56mm F1.4 DC DN Contemporary","https://www.sigma-global.com/jp/lenses/c019_56_f14/"),
]


# ══════════════════════════════════════════════════════
#  Fujifilm X マウント フォールバック
# ══════════════════════════════════════════════════════
FUJIFILM_FALLBACK = [
    # XF 単焦点
    ("Fujifilm XF 8mm F3.5 R WR",             "https://fujifilm-x.com/ja-jp/products/lenses/xf8mmf35-r-wr/"),
    ("Fujifilm XF 14mm F2.8 R",               "https://fujifilm-x.com/ja-jp/products/lenses/xf14mmf28-r/"),
    ("Fujifilm XF 16mm F1.4 R WR",            "https://fujifilm-x.com/ja-jp/products/lenses/xf16mmf14-r-wr/"),
    ("Fujifilm XF 16mm F2.8 R WR",            "https://fujifilm-x.com/ja-jp/products/lenses/xf16mmf28-r-wr/"),
    ("Fujifilm XF 18mm F1.4 R LM WR",         "https://fujifilm-x.com/ja-jp/products/lenses/xf18mmf14-r-lm-wr/"),
    ("Fujifilm XF 18mm F2 R",                 "https://fujifilm-x.com/ja-jp/products/lenses/xf18mmf2-r/"),
    ("Fujifilm XF 23mm F1.4 R LM WR",         "https://fujifilm-x.com/ja-jp/products/lenses/xf23mmf14-r-lm-wr/"),
    ("Fujifilm XF 23mm F2 R WR",              "https://fujifilm-x.com/ja-jp/products/lenses/xf23mmf2-r-wr/"),
    ("Fujifilm XF 27mm F2.8 R WR",            "https://fujifilm-x.com/ja-jp/products/lenses/xf27mmf28-r-wr/"),
    ("Fujifilm XF 33mm F1.4 R LM WR",         "https://fujifilm-x.com/ja-jp/products/lenses/xf33mmf14-r-lm-wr/"),
    ("Fujifilm XF 35mm F1.4 R",               "https://fujifilm-x.com/ja-jp/products/lenses/xf35mmf14-r/"),
    ("Fujifilm XF 35mm F2 R WR",              "https://fujifilm-x.com/ja-jp/products/lenses/xf35mmf2-r-wr/"),
    ("Fujifilm XF 50mm F1.0 R WR",            "https://fujifilm-x.com/ja-jp/products/lenses/xf50mmf10-r-wr/"),
    ("Fujifilm XF 50mm F2 R WR",              "https://fujifilm-x.com/ja-jp/products/lenses/xf50mmf2-r-wr/"),
    ("Fujifilm XF 56mm F1.2 R WR",            "https://fujifilm-x.com/ja-jp/products/lenses/xf56mmf12-r-wr/"),
    ("Fujifilm XF 60mm F2.4 R Macro",         "https://fujifilm-x.com/ja-jp/products/lenses/xf60mmf24-r-macro/"),
    ("Fujifilm XF 80mm F2.8 R LM OIS WR Macro","https://fujifilm-x.com/ja-jp/products/lenses/xf80mmf28-r-lm-ois-wr-macro/"),
    ("Fujifilm XF 90mm F2 R LM WR",           "https://fujifilm-x.com/ja-jp/products/lenses/xf90mmf2-r-lm-wr/"),
    ("Fujifilm XF 200mm F2 R LM OIS WR",      "https://fujifilm-x.com/ja-jp/products/lenses/xf200mmf2-r-lm-ois-wr/"),
    # XF ズーム
    ("Fujifilm XF 10-24mm F4 R OIS WR",       "https://fujifilm-x.com/ja-jp/products/lenses/xf10-24mmf4-r-ois-wr/"),
    ("Fujifilm XF 16-55mm F2.8 R LM WR",      "https://fujifilm-x.com/ja-jp/products/lenses/xf16-55mmf28-r-lm-wr/"),
    ("Fujifilm XF 16-80mm F4 R OIS WR",       "https://fujifilm-x.com/ja-jp/products/lenses/xf16-80mmf4-r-ois-wr/"),
    ("Fujifilm XF 18-55mm F2.8-4 R LM OIS",   "https://fujifilm-x.com/ja-jp/products/lenses/xf18-55mmf28-4-r-lm-ois/"),
    ("Fujifilm XF 18-120mm F4 LM PZ WR",      "https://fujifilm-x.com/ja-jp/products/lenses/xf18-120mmf4-lm-pz-wr/"),
    ("Fujifilm XF 50-140mm F2.8 R LM OIS WR", "https://fujifilm-x.com/ja-jp/products/lenses/xf50-140mmf28-r-lm-ois-wr/"),
    ("Fujifilm XF 55-200mm F3.5-4.8 R LM OIS","https://fujifilm-x.com/ja-jp/products/lenses/xf55-200mmf35-48-r-lm-ois/"),
    ("Fujifilm XF 70-300mm F4-5.6 R LM OIS WR","https://fujifilm-x.com/ja-jp/products/lenses/xf70-300mmf4-56-r-lm-ois-wr/"),
    ("Fujifilm XF 100-400mm F4.5-5.6 R LM OIS WR","https://fujifilm-x.com/ja-jp/products/lenses/xf100-400mmf45-56-r-lm-ois-wr/"),
    ("Fujifilm XF 150-600mm F5.6-8 R LM OIS WR","https://fujifilm-x.com/ja-jp/products/lenses/xf150-600mmf56-8-r-lm-ois-wr/"),
    # GF（スクレーパーで取れなかった分）
    ("Fujifilm GF 100mm F4 R LM OIS WR Macro", "https://fujifilm-x.com/ja-jp/products/lenses/gf100mmf4-r-lm-ois-wr-macro/"),
    ("Fujifilm GF 200mm F2 R LM OIS WR",        "https://fujifilm-x.com/ja-jp/products/lenses/gf200mmf2-r-lm-ois-wr/"),
]

# ══════════════════════════════════════════════════════
#  Samyang フォールバック
# ══════════════════════════════════════════════════════
SAMYANG_FALLBACK = [
    # AF レンズ（Sony E マウント）
    ("Samyang AF 12mm F2.0 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=466"),
    ("Samyang AF 14mm F2.8 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=350"),
    ("Samyang AF 18mm F2.8 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=432"),
    ("Samyang AF 24mm F1.8 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=416"),
    ("Samyang AF 35mm F1.4 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=351"),
    ("Samyang AF 45mm F1.8 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=395"),
    ("Samyang AF 50mm F1.4 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=352"),
    ("Samyang AF 50mm F1.4 II FE",            "https://www.samyanglens.com/jp/product/product-view.php?seq=454"),
    ("Samyang AF 75mm F1.8 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=415"),
    ("Samyang AF 85mm F1.4 FE",               "https://www.samyanglens.com/jp/product/product-view.php?seq=353"),
    ("Samyang AF 85mm F1.4 II FE",            "https://www.samyanglens.com/jp/product/product-view.php?seq=441"),
    ("Samyang AF 135mm F1.8 FE",              "https://www.samyanglens.com/jp/product/product-view.php?seq=461"),
    ("Samyang AF 24-70mm F2.8 FE",            "https://www.samyanglens.com/jp/product/product-view.php?seq=468"),
    # MF レンズ
    ("Samyang 12mm F2.0 NCS CS",              "https://www.samyanglens.com/jp/product/product-view.php?seq=304"),
    ("Samyang 7.5mm F3.5 UMC Fish-eye MFT",   "https://www.samyanglens.com/jp/product/product-view.php?seq=318"),
]


TAMRON_FALLBACK = [
    # Sony E マウント フルサイズ
    ("Tamron 17-28mm F/2.8 Di III RXD",    "https://www.tamron.com/jp/consumer/lenses/a046/"),
    ("Tamron 28-75mm F/2.8 Di III RXD",    "https://www.tamron.com/jp/consumer/lenses/a036/"),
    ("Tamron 28-75mm F/2.8 Di III VXD G2", "https://www.tamron.com/jp/consumer/lenses/a063/"),
    ("Tamron 35-150mm F/2-2.8 Di III VXD", "https://www.tamron.com/jp/consumer/lenses/a058/"),
    ("Tamron 50-400mm Di III VC VXD",       "https://www.tamron.com/jp/consumer/lenses/a067/"),
    ("Tamron 70-180mm F/2.8 Di III VXD",   "https://www.tamron.com/jp/consumer/lenses/a056/"),
    ("Tamron 70-180mm F/2.8 Di III VC VXD G2","https://www.tamron.com/jp/consumer/lenses/a065/"),
    ("Tamron 17-50mm F/4 Di III VXD",      "https://www.tamron.com/jp/consumer/lenses/a068/"),
    ("Tamron 28-200mm F/2.8-5.6 Di III RXD","https://www.tamron.com/jp/consumer/lenses/a071/"),
    ("Tamron 20mm F/2.8 Di III OSD M1:2",  "https://www.tamron.com/jp/consumer/lenses/f050/"),
    ("Tamron 24mm F/2.8 Di III OSD M1:2",  "https://www.tamron.com/jp/consumer/lenses/f051/"),
    ("Tamron 35mm F/2.8 Di III OSD M1:2",  "https://www.tamron.com/jp/consumer/lenses/f053/"),
    ("Tamron 150-500mm F/5-6.7 Di III VC VXD","https://www.tamron.com/jp/consumer/lenses/a057/"),
    ("Tamron 50-300mm F/4.5-6.3 Di III VC VXD","https://www.tamron.com/jp/consumer/lenses/a069/"),
    ("Tamron 90mm F/2.8 Di III MACRO VXD", "https://www.tamron.com/jp/consumer/lenses/f072/"),
    ("Tamron 20-40mm F/2.8 Di III VXD",    "https://www.tamron.com/jp/consumer/lenses/a062/"),
    # APS-C 兼用
    ("Tamron 17-70mm F/2.8 Di III-A VC RXD","https://www.tamron.com/jp/consumer/lenses/b070/"),
    ("Tamron 11-20mm F/2.8 Di III-A RXD",  "https://www.tamron.com/jp/consumer/lenses/b060/"),
    ("Tamron 18-300mm F/3.5-6.3 Di III-A VC VXD","https://www.tamron.com/jp/consumer/lenses/b061/"),
]


# ══════════════════════════════════════════════════════
#  Sony モデル番号テーブル（CDN 直接 URL 生成用）
# ══════════════════════════════════════════════════════
SONY_MODEL = {
    # G Master
    "FE 12-24mm F2.8 GM":           "SEL1224GM",
    "FE 14mm F1.8 GM":              "SEL1418GM",
    "FE 16-35mm F2.8 GM":           "SEL1635GM",
    "FE 16-35mm F2.8 GM II":        "SEL1635GM2",
    "FE 20mm F1.8 G":               "SEL20F18G",
    "FE 24mm F1.4 GM":              "SEL24F14GM",
    "FE 24-70mm F2.8 GM":           "SEL2470GM",
    "FE 24-70mm F2.8 GM II":        "SEL2470GM2",
    "FE 35mm F1.4 GM":              "SEL35F14GM",
    "FE 50mm F1.2 GM":              "SEL50F12GM",
    "FE 50mm F1.4 GM":              "SEL50F14GM",
    "FE 70-200mm F2.8 GM OSS":      "SEL70200GM",
    "FE 70-200mm F2.8 GM OSS II":   "SEL70200GM2",
    "FE 85mm F1.4 GM":              "SEL85F14GM",
    "FE 85mm F1.4 GM II":           "SEL85F14GM2",
    "FE 100mm F2.8 STF GM OSS":     "SEL100F28GM",
    "FE 100-400mm F4.5-5.6 GM OSS": "SEL100400GM",
    "FE 135mm F1.8 GM":             "SEL135F18GM",
    "FE 300mm F2.8 GM OSS":         "SEL300F28GM",
    "FE 400mm F2.8 GM OSS":         "SEL400F28GM",
    "FE 600mm F4 GM OSS":           "SEL600F40GM",
    # G / ZA / standard
    "FE 12-24mm F4 G":              "SEL1224G",
    "FE 16-25mm F2.8 G":            "SEL1625G",
    "FE 16-35mm F4 ZA OSS":         "SEL1635Z",
    "FE 24mm F2.8 G":               "SEL24F28G",
    "FE 24-70mm F4 ZA OSS":         "SEL2470Z",
    "FE 24-105mm F4 G OSS":         "SEL24105G",
    "FE 28mm F2":                   "SEL28F20",
    "FE 28-60mm F4-5.6":            "SEL2860",
    "FE 35mm F1.8":                 "SEL35F18F",
    "FE 40mm F2.5 G":               "SEL40F25G",
    "FE 50mm F1.8":                 "SEL50F18F",
    "FE 50mm F2.5 G":               "SEL50F25G",
    "FE 55mm F1.8 ZA":              "SEL55F18Z",
    "FE 70-200mm F4 G OSS":         "SEL70200G",
    "FE 70-200mm F4 Macro G OSS":   "SEL70200G2",
    "FE 70-300mm F4.5-5.6 G OSS":   "SEL70300G",
    "FE 85mm F1.8":                 "SEL85F18",
    "FE 90mm F2.8 Macro G OSS":     "SEL90M28G",
    "FE 200-600mm F5.6-6.3 G OSS":  "SEL200600G",
    # PZ
    "FE PZ 10-20mm F4 G":           "SELP1020G",
    "FE PZ 16-35mm F4 G":           "SELP1635G",
    "FE PZ 28-135mm F4 G OSS":      "SELP28135G",
    # E (APS-C)
    "E 10-18mm F4 OSS":             "SEL1018",
    "E 11mm F1.8":                  "SEL11F18",
    "E 15mm F1.4 G":                "SEL15F14G",
    "E 16-55mm F2.8 G":             "SEL1655G",
    "E 18-105mm F4 G OSS":          "SELP18105G",
    "E 18-135mm F3.5-5.6 OSS":      "SEL18135",
    "E 24mm F1.8 ZA":               "SEL24F18Z",
    "E 35mm F1.8 OSS":              "SEL35F18",
    "E 50mm F1.8 OSS":              "SEL50F18",
    "E 55-210mm F4.5-6.3 OSS":      "SEL55210",
    "E 70-350mm F4.5-6.3 G OSS":    "SEL70350G",
}


# ══════════════════════════════════════════════════════
#  ユーティリティ
# ══════════════════════════════════════════════════════
def norm(s: str) -> str:
    return re.sub(r"[^\w]", "", s.lower())

# レンズ名に必須の焦点距離・絞り値パターン
_LENS_RE = re.compile(
    r"(\d{1,3}[-–]\d{1,3}\s*mm|\d{1,3}\s*mm|[Ff][/.]?\d+\.?\d*)",
    re.IGNORECASE,
)
# ナビゲーション・UI テキストの除外パターン
_NAV_RE = re.compile(
    r"(skip\s+to|log\s+in|sign\s*up|cart|checkout|search|account|"
    r"shipping|faq|privacy|cookie|terms|sitemap|news|blog|event|gallery|"
    r"press|career|investor|USD|EUR|GBP|JPY|\$\s*\||€\s*\||support|about|contact)",
    re.IGNORECASE,
)
# ロゴ・汎用画像の除外キーワード
_GENERIC_IMG = (
    "logo", "ogp", "ogimage", "og-image", "og_image", "default",
    "banner", "noimage", "no-image", "placeholder", "favicon", "icon",
)

def is_generic_image(url: str) -> bool:
    if not url:
        return True
    low = url.lower()
    return any(p in low for p in _GENERIC_IMG)

def is_lens_name(name: str) -> bool:
    if not name or len(name) < 5 or len(name) > 100:
        return False
    if _NAV_RE.search(name):
        return False
    return bool(_LENS_RE.search(name))

def _extract_name(tag, fallback_tag=None) -> str:
    """タグからレンズ名テキストを抽出・正規化する"""
    t = tag or fallback_tag
    if t is None:
        return ""
    raw = t.get_text(" ", strip=True)
    return re.sub(r"\s+", " ", raw).strip()

def _find_title(a_tag) -> str:
    """<a> 内から製品タイトルを探す"""
    title = a_tag.find(
        ["h2","h3","h4","p","span","div"],
        class_=re.compile(r"(title|name|product|heading|item|label)", re.I),
    )
    return _extract_name(title, a_tag)

def _img_from_tag(a_tag, base_url: str) -> "str | None":
    """<a> 内の <img> から画像 URL を取得する"""
    img = a_tag.find("img")
    if not img:
        return None
    src = img.get("data-src") or img.get("data-lazy-src") or img.get("src") or ""
    if src and not src.startswith("http"):
        src = urljoin(base_url, src)
    # ドメイン名が含まれていない不正URL（例: http://93053）を弾く
    if not re.search(r"https?://[a-zA-Z0-9][^/]*\.[a-zA-Z]{2,}", src):
        return None
    return src if src and not is_generic_image(src) else None


# ══════════════════════════════════════════════════════
#  汎用スクレーパー（URL パターンでフィルタ）
# ══════════════════════════════════════════════════════
def scrape_by_url_pattern(
    lineup_url: str,
    product_pat: "re.Pattern",
    session,
    name_required: bool = True,
    max_pages: int = 1,
    page_param: str = "page",
) -> dict:
    """
    lineup_url のページを取得し、href が product_pat にマッチするリンクを製品として収集する。
    max_pages > 1 の場合は ?page=N でページネーションを処理する。
    """
    result = {}

    for page_num in range(1, max_pages + 1):
        url = lineup_url if page_num == 1 else f"{lineup_url}?{page_param}={page_num}"
        try:
            r = session.get(url, timeout=14)
            if r.status_code == 404:
                break  # ページ終端
            if r.status_code >= 400:
                print(f"   ⚠️  HTTP {r.status_code}: {url}")
                break
            soup = BeautifulSoup(r.text, "html.parser")
            found_on_page = 0

            for a in soup.find_all("a", href=True):
                href = a["href"]
                if not product_pat.search(href):
                    continue
                abs_href = urljoin(lineup_url, href)
                name = _find_title(a)
                if name_required and not is_lens_name(name):
                    continue
                img = _img_from_tag(a, lineup_url)
                key = norm(name) if name else norm(abs_href)
                if key and key not in result:
                    result[key] = {
                        "name":      name,
                        "page_url":  abs_href,
                        "image_url": img,
                    }
                    found_on_page += 1

            if found_on_page == 0 and page_num > 1:
                break  # 空ページ → 終端

        except Exception as e:
            print(f"   ⚠️  scrape error ({url}): {e}")
            break

    return result


# ══════════════════════════════════════════════════════
#  ブランド別スクレーパー
# ══════════════════════════════════════════════════════

def scrape_sony(session) -> dict:
    """Sony Eマウントレンズ一覧ページから製品を収集する"""
    print(f"📦 Sony: {SONY_LINEUP_URL}")
    db = {}

    # ① ラインナップページから製品ページリンクを収集
    #    URL パターン: /ichigan/products/{MODEL}/
    product_pat = re.compile(r"/ichigan/products/[A-Z]{3,}", re.I)
    scraped = scrape_by_url_pattern(SONY_LINEUP_URL, product_pat, session, name_required=False)

    # ② SONY_MODEL テーブルで CDN 画像 URL を付与
    for name, model in SONY_MODEL.items():
        page_url = f"https://www.sony.jp/ichigan/products/{model}/"
        cdn_img  = f"https://www.sony.jp/products/picture/{model}.jpg"
        key = norm(name)
        if key not in db:
            db[key] = {"name": name, "page_url": page_url, "image_url": cdn_img}

    # ③ ラインナップページで見つかった未登録モデルを追加（名前を補完）
    for key, entry in scraped.items():
        if key not in db:
            # モデルコードをURLから抽出して名前・CDN URLを生成
            m = re.search(r"/ichigan/products/([A-Z0-9]+)/", entry["page_url"], re.I)
            if m:
                model = m.group(1).upper()
                entry["image_url"] = entry["image_url"] or f"https://www.sony.jp/products/picture/{model}.jpg"
                if not entry["name"] or not is_lens_name(entry["name"]):
                    entry["name"] = model  # 暫定名（スペック取得後に上書きされる）
            db[key] = entry

    print(f"   → {len(db)} 件登録")
    return db


def scrape_nikon(session) -> dict:
    """Nikon Zマウントレンズ一覧ページから製品を収集する"""
    print(f"📦 Nikon: {NIKON_LINEUP_URL}")
    # 製品ページは /products/lineup/nikkor/zmount/{slug}/ の形式
    # ラインナップページ /products/nikkor/zmount/ からこの形式のリンクを探す
    product_pat = re.compile(r"/products/lineup/nikkor/zmount/[a-z0-9]", re.I)

    for base_url in (NIKON_LINEUP_URL, NIKON_LINEUP_FALLBACK):
        db = scrape_by_url_pattern(base_url, product_pat, session, name_required=False)
        if db:
            # 名前が取れなかった場合はスラッグから補完
            # スラッグ形式: nikkor_z_20mm_f18_s → "NIKKOR Z 20mm f/1.8 S"
            for key, entry in db.items():
                if not is_lens_name(entry.get("name", "")):
                    slug_m = re.search(r"/zmount/([^/?#]+)", entry["page_url"])
                    if slug_m:
                        slug = slug_m.group(1).strip("/").replace("_", " ")
                        entry["name"] = f"NIKKOR Z {slug}"
            print(f"   → {base_url} から {len(db)} 件登録")
            return db
        print(f"   ⚠️  {base_url} から取得できませんでした")

    # ── フォールバック: ハードコードリスト ──
    print("   → ウェブ取得失敗 → ハードコードリストを使用")
    db = {}
    for name, page_url in NIKON_Z_FALLBACK:
        db[norm(name)] = {"name": name, "page_url": page_url, "image_url": None}
    print(f"   → {len(db)} 件登録（ハードコード）")
    return db


def scrape_canon(session) -> dict:
    """Canon RFレンズ一覧ページから製品を収集する"""
    print(f"📦 Canon: {CANON_LINEUP_URL}")

    url_pats = [
        (CANON_LINEUP_URL,      re.compile(r"/product/camera/rf/lens/[a-z0-9]", re.I)),
        (CANON_LINEUP_FALLBACK, re.compile(r"/rf/lineup/[a-z0-9]", re.I)),
    ]
    for base_url, product_pat in url_pats:
        db = scrape_by_url_pattern(base_url, product_pat, session)
        if db:
            print(f"   → {base_url} から {len(db)} 件登録")
            return db
        print(f"   ⚠️  {base_url} から取得できませんでした")

    # ── フォールバック: ハードコードリスト ──
    print("   → ウェブ取得失敗 → ハードコードリストを使用")
    db = {}
    for name, page_url in CANON_RF_FALLBACK:
        db[norm(name)] = {"name": name, "page_url": page_url, "image_url": None}
    print(f"   → {len(db)} 件登録（ハードコード）")
    return db


def scrape_sigma(session) -> dict:
    """Sigmaレンズ一覧ページから製品を収集する（マウント重複は正規化して統合）"""
    print(f"📦 Sigma: {SIGMA_LINEUP_URL}")
    # 製品ページ URL パターン: /jp/lenses/{model_code}/ 例: /jp/lenses/a021_14_f18/
    # ※ model_code は「英字1文字 + 3桁数字」で始まる（Art=a, Contemporary=c, Sports=s など）
    product_pat = re.compile(r"/jp/lenses/[a-z]\d{3}[_a-z0-9-]+/?$", re.I)
    raw = scrape_by_url_pattern(SIGMA_LINEUP_URL, product_pat, session)

    # マウント重複の統合
    # Sigma の URL 末尾に "-se" (Sony E) / "-l" (Leica L) / "-sa" (SA) 等が付く場合がある
    # 同じモデル名のエントリーが複数あれば、Sony E マウント → Leica L → 最初の順で1件に統合
    _MOUNT_SUFFIX = re.compile(
        r"\s*[（(]?(Sony\s*E|Nikon\s*Z|Canon\s*EF-?M?|Leica\s*L|Fujifilm\s*X|SA)[)）]?\s*$",
        re.IGNORECASE,
    )
    _MOUNT_PREF = {"sonye": 0, "sonye-mount": 0, "leical": 1, "nikonz": 2, "canonef": 3, "fujifilmx": 4, "sa": 5}

    merged: dict[str, dict] = {}
    for key, entry in raw.items():
        base_name = _MOUNT_SUFFIX.sub("", entry["name"]).strip()
        base_key  = norm(base_name)
        mount_score = 99
        for mk, score in _MOUNT_PREF.items():
            if mk in key:
                mount_score = score
                break
        existing = merged.get(base_key)
        if existing is None:
            merged[base_key] = {**entry, "name": base_name, "_mount_score": mount_score}
        elif mount_score < existing.get("_mount_score", 99):
            # より優先度の高いマウントで上書き（画像・URLを更新）
            merged[base_key] = {**entry, "name": base_name, "_mount_score": mount_score}

    # 内部スコアフィールドを削除
    for e in merged.values():
        e.pop("_mount_score", None)

    if raw:
        print(f"   → {len(raw)} エントリ → マウント統合後 {len(merged)} 件登録")
        return merged

    # ── フォールバック: ハードコードリスト ──
    # sigma-global.com は JavaScript 描画のため静的 HTML にリンクが見つからない場合に使用
    print("   → ウェブ取得失敗（JS描画の可能性） → ハードコードリストを使用")
    fb: dict[str, dict] = {}
    for name, page_url in SIGMA_FALLBACK:
        fb[norm(name)] = {"name": name, "page_url": page_url, "image_url": None}
    print(f"   → {len(fb)} 件登録（ハードコード）")
    return fb


def scrape_tamron(session) -> dict:
    """Tamronレンズ一覧ページから製品を収集する（マウント重複を統合）"""
    print(f"📦 Tamron: {TAMRON_LINEUP_URL}")
    # 製品ページ URL パターン: /jp/consumer/lenses/{A-number}/
    # Tamron の型番は「A068」のようにモデル単位で固有 → マウント別ページは同じ型番URL
    product_pat = re.compile(r"/consumer/lenses/[a-z]\d{3,}", re.I)
    raw = scrape_by_url_pattern(TAMRON_LINEUP_URL, product_pat, session)

    if raw:
        # 型番（A068 など）を正規化キーとして重複除去
        merged: dict[str, dict] = {}
        for key, entry in raw.items():
            m = re.search(r"/consumer/lenses/([a-z]\d{3,})", entry["page_url"], re.I)
            model_key = m.group(1).lower() if m else key
            if model_key not in merged:
                merged[model_key] = entry
        print(f"   → {len(raw)} エントリ → 重複除去後 {len(merged)} 件登録")
        return merged

    # ── フォールバック: ハードコードリスト ──
    # tamron.com は JavaScript 描画のため静的 HTML にリンクがない場合に使用
    print("   → ウェブ取得失敗（JS描画の可能性） → ハードコードリストを使用")
    db = {}
    for name, page_url in TAMRON_FALLBACK:
        db[norm(name)] = {"name": name, "page_url": page_url, "image_url": None}
    print(f"   → {len(db)} 件登録（ハードコード）")
    return db


def scrape_viltrox(session) -> dict:
    """Viltrox Japan レンズ一覧ページから製品を収集する（ページネーション対応）"""
    print(f"📦 Viltrox: {VILTROX_LINEUP_URL}")
    # Shopify ストア: /products/{slug} パターン
    product_pat = re.compile(r"/products/[a-z0-9][a-z0-9-]+", re.I)

    # 最大10ページまで巡回（51製品なら3〜4ページ想定）
    db = scrape_by_url_pattern(
        VILTROX_LINEUP_URL, product_pat, session,
        name_required=False, max_pages=10, page_param="page",
    )
    # レンズ名フィルタ（アクセサリー・フラッシュ等を除外）
    db = {k: v for k, v in db.items() if is_lens_name(v.get("name", ""))}
    print(f"   → {len(db)} 件登録")
    return db


def scrape_fujifilm(session) -> dict:
    """Fujifilm X マウントレンズ一覧ページから製品を収集する"""
    print(f"📦 Fujifilm: {FUJIFILM_LINEUP_URL}")
    # fujifilm-x.com 製品ページ URL パターン: /ja-jp/products/lenses/xf{focal}/
    product_pat = re.compile(r"/ja-jp/products/lenses/(xf|gf|xc)\d", re.I)
    db = scrape_by_url_pattern(FUJIFILM_LINEUP_URL, product_pat, session, name_required=False)

    if db:
        # 名前が取れたものだけ残す（is_lens_name フィルタ）
        db = {k: v for k, v in db.items() if is_lens_name(v.get("name", ""))}
        print(f"   → {len(db)} 件登録")
        return db

    # フォールバック: ハードコードリスト
    print("   → ウェブ取得失敗 → ハードコードリストを使用")
    fb = {}
    for name, page_url in FUJIFILM_FALLBACK:
        fb[norm(name)] = {"name": name, "page_url": page_url, "image_url": None}
    print(f"   → {len(fb)} 件登録（ハードコード）")
    return fb


def scrape_samyang(session) -> dict:
    """Samyang レンズ一覧ページから製品を収集する"""
    print(f"📦 Samyang: {SAMYANG_LINEUP_URL}")
    # samyanglens.com 製品ページ URL パターン
    product_pat = re.compile(r"/product/product-view\.php\?seq=\d+", re.I)
    db = scrape_by_url_pattern(SAMYANG_LINEUP_URL, product_pat, session, name_required=True)

    if db:
        print(f"   → {len(db)} 件登録")
        return db

    # フォールバック: ハードコードリスト
    print("   → ウェブ取得失敗 → ハードコードリストを使用")
    fb = {}
    for name, page_url in SAMYANG_FALLBACK:
        fb[norm(name)] = {"name": name, "page_url": page_url, "image_url": None}
    print(f"   → {len(fb)} 件登録（ハードコード）")
    return fb


def scrape_voigtlander(session) -> dict:
    """Voigtländer (Cosina) レンズ一覧ページから製品を収集する"""
    print(f"📦 Voigtländer: {VOIGTLANDER_LINEUP_URL}")
    # cosina.co.jp の製品ページ URL パターン: /voigtlander/{mount}/{model}/
    product_pat = re.compile(r"/voigtlander/[a-z0-9_-]+/[a-z0-9_-]+/?$", re.I)
    db = scrape_by_url_pattern(VOIGTLANDER_LINEUP_URL, product_pat, session)
    print(f"   → {len(db)} 件登録")
    return db


# ══════════════════════════════════════════════════════
#  画像取得ユーティリティ
# ══════════════════════════════════════════════════════

# メーカー公式ドメイン（og:image フィルタを緩和する）
_MFR_DOMAINS = (
    "sony.jp", "nikon-image.com", "nij.nikon.com",
    "personal.canon.jp", "cweb.canon.jp",
    "sigma-global.com", "tamron.com",
    "viltroxjapan.jp", "viltrox.com",
    "cosina.co.jp",
)

# og:image が製品と無関係な汎用サムネを返すことが判明しているドメイン
# → og:image ステップをスキップして Amazon 等フォールバックへ直行させる
_SKIP_OG_DOMAINS = (
    "fujifilm-x.com",   # 全製品ページで同一の汎用 GF レンズサムネを返す
    "samyanglens.com",  # JS 描画のため og:image が取れない
)

def get_og_image(url: str, session) -> "str | None":
    """URL の og:image / twitter:image を取得する"""
    # 汎用画像しか返さないことが判明しているドメインはスキップ
    if any(d in url for d in _SKIP_OG_DOMAINS):
        return None
    try:
        r = session.get(url, timeout=14, allow_redirects=True)
        if r.status_code >= 400:
            return None
        soup = BeautifulSoup(r.text, "html.parser")
        is_mfr = any(d in url for d in _MFR_DOMAINS)

        # 有効な画像URLかを確認する関数（ドメイン名必須）
        def _valid_img_url(u: str) -> bool:
            return bool(u and u.startswith("http") and
                        re.search(r"https?://[a-zA-Z0-9][^/]*\.[a-zA-Z]{2,}", u))

        for prop in (("property", "og:image"), ("name", "twitter:image")):
            tag = soup.find("meta", {prop[0]: prop[1]})
            if tag:
                img = tag.get("content", "").strip()
                if not _valid_img_url(img):
                    continue
                if is_mfr or not is_generic_image(img):
                    if not any(p in img.lower() for p in ("logo", "favicon", "icon")):
                        return img

        # ページ内製品画像（フォールバック）
        for img_tag in soup.find_all("img"):
            src = img_tag.get("data-src") or img_tag.get("src") or ""
            if not _valid_img_url(src) or is_generic_image(src):
                continue
            alt = (img_tag.get("alt") or "").lower()
            if any(k in alt for k in ("lens","mm","f/","f1","f2","ズーム","単焦点","nikkor","canon","sony","sigma","tamron")):
                return src
    except Exception:
        pass
    return None


def get_manufacturer_cdn_image(name: str, page_url: str, session) -> "str | None":
    """メーカー既知 CDN URL パターンから画像を直接確認して取得する"""
    if not page_url:
        return None
    candidates = []

    # Sony CDN
    m = re.search(r"sony\.jp/ichigan/products/([A-Z0-9]+)/", page_url, re.I)
    if m:
        model = m.group(1).upper()
        candidates = [f"https://www.sony.jp/products/picture/{model}.jpg"]

    # Canon personal.canon.jp
    # URL形式1: /product/camera/rf/lens/{slug}/  (旧)
    # URL形式2: /product/camera/rf/{slug}         (新)
    elif re.search(r"personal\.canon\.jp", page_url):
        m = re.search(r"/rf/lens/([^/?#]+)", page_url, re.I) or \
            re.search(r"/camera/rf/([^/?#]+)$", page_url, re.I)
        if m:
            slug = m.group(1).strip("/")
            candidates = [
                f"https://personal.canon.jp/product/camera/rf/lens/{slug}/img/photo_01.jpg",
                f"https://personal.canon.jp/product/camera/rf/lens/{slug}/img/overview-01.jpg",
                f"https://personal.canon.jp/product/camera/rf/{slug}/img/photo_01.jpg",
                f"https://personal.canon.jp/product/camera/rf/{slug}/img/overview-01.jpg",
            ]

    # Canon cweb.canon.jp
    elif re.search(r"cweb\.canon\.jp", page_url):
        m = re.search(r"/rf/lineup/([^/]+)/", page_url, re.I)
        if m:
            slug = m.group(1)
            candidates = [
                f"https://cweb.canon.jp/rf/lineup/{slug}/img/overview-01.jpg",
                f"https://cweb.canon.jp/rf/lineup/{slug}/img/overview_01.jpg",
                f"https://cweb.canon.jp/rf/lineup/{slug}/img/top-main.jpg",
            ]

    # Nikon
    # nij.nikon.com の実際の CDN パス:
    #   /cms/products/nikkor/zmount/{slug}/img/index/product_01.jpg
    elif re.search(r"nikon", page_url, re.I):
        m = re.search(r"/zmount/([^/?#]+)", page_url, re.I)
        if m:
            slug = m.group(1).strip("/")
            # 公式 CDN パス（nij.nikon.com/cms/... が正しいパス）
            # product_01 = メイン画像（斜め俯瞰）。02/03 は別アングルのため不要
            candidates = [
                f"https://nij.nikon.com/cms/products/nikkor/zmount/{slug}/img/index/product_01.jpg",
            ]

    for cand in candidates:
        try:
            r = session.head(cand, timeout=8, allow_redirects=True)
            if r.status_code == 200 and "image" in r.headers.get("Content-Type", ""):
                return cand
        except Exception:
            pass
    return None


def get_yodobashi_image(lens_name: str, session) -> "str | None":
    """Yodobashi Camera 検索結果から製品画像を取得する"""
    url = f"https://www.yodobashi.com/ec/search/?query={quote(lens_name)}&oa=y"
    try:
        r = session.get(url, timeout=14, headers={
            **HEADERS,
            "Referer": "https://www.yodobashi.com/",
        })
        soup = BeautifulSoup(r.text, "html.parser")
        for img in soup.find_all("img"):
            src = img.get("src") or img.get("data-src") or img.get("data-original") or ""
            if not src.startswith("http") or is_generic_image(src):
                continue
            if "thumbnail.yodobashi.com" in src or (
                    "yodobashi.com" in src and ("/product/" in src or "/img/" in src)):
                return src
    except Exception:
        pass
    return None


def get_amazon_image(lens_name: str, session) -> "str | None":
    """Amazon.co.jp 検索から製品画像を取得する（Nikon/Canon などメーカーサイト不可の場合）"""
    url = f"https://www.amazon.co.jp/s?k={quote(lens_name)}&i=electronics"
    try:
        r = session.get(url, timeout=14, headers={
            **HEADERS,
            "Referer": "https://www.amazon.co.jp/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })
        soup = BeautifulSoup(r.text, "html.parser")
        for img in soup.find_all("img"):
            src = (
                img.get("data-old-hires")
                or img.get("data-src")
                or img.get("src")
                or ""
            )
            if not src.startswith("http") or is_generic_image(src):
                continue
            # Amazon の製品画像CDN: m.media-amazon.com または images-amazon.com
            if not (("m.media-amazon.com" in src or "images-amazon.com" in src) and "/images/I/" in src):
                continue
            # CB\d+ 付き URL はスポンサー・広告商品の可能性が高いためスキップ
            # 例: _CB1169409_ → 広告枠の汎用画像
            if re.search(r"CB\d{7,}", src):
                continue
            # alt テキストにブランド名またはレンズ関連ワードが含まれることを確認
            alt = (img.get("alt") or "").lower()
            brand_check = any(
                b in alt for b in ("nikon", "nikkor", "canon", "sigma", "fujifilm",
                                   "fuji", "samyang", "tamron", "viltrox", "mm", "lens")
            )
            if brand_check:
                return src
    except Exception:
        pass
    return None


def get_kakaku_image(lens_name: str, session) -> "str | None":
    """価格.com 検索から製品画像を取得する"""
    url = f"https://kakaku.com/search_results/?query={quote(lens_name)}&category=0050"
    try:
        r = session.get(url, timeout=14, headers={**HEADERS, "Referer": "https://kakaku.com/"})
        soup = BeautifulSoup(r.text, "html.parser")
        for img in soup.find_all("img"):
            src = img.get("src") or img.get("data-src") or ""
            if not src.startswith("http") or is_generic_image(src):
                continue
            if "img.kakaku.com" in src or "img1.kakaku.com" in src:
                return src
    except Exception:
        pass
    return None


def find_in_brand_db(lens_name: str, db: dict) -> "dict | None":
    """レンズ名でブランドDBを検索（完全一致 → 部分一致）"""
    q = norm(lens_name)
    if q in db:
        return db[q]
    if len(q) < 7:
        return None
    for key, entry in db.items():
        if (key in q or q in key) and min(len(key), len(q)) >= 8:
            return entry
    return None


# ══════════════════════════════════════════════════════
#  メイン
# ══════════════════════════════════════════════════════
def build_brand_db(session: requests.Session) -> dict:
    db = {}
    print("\n═══ ブランドDB構築フェーズ ═══")

    # 各ブランドを順番に収集
    for scraper in (
        scrape_sony,
        scrape_nikon,
        scrape_canon,
        scrape_sigma,
        scrape_tamron,
        scrape_viltrox,
        scrape_voigtlander,
        scrape_fujifilm,
        scrape_samyang,
    ):
        entries = scraper(session)
        db.update(entries)
        time.sleep(1.5)

    print(f"\n   ✅ ブランドDB 合計: {len(db)} 件")
    return db


def resolve_image(name: str, entry: dict, session: requests.Session) -> "str | None":
    """1レンズの画像 URL を取得する（優先順位付き）"""
    page_url = entry.get("page_url", "")

    # 1. ラインナップページ取得済みの画像
    img = entry.get("image_url")
    if img and not is_generic_image(img):
        return img

    # 2. 製品ページ og:image
    if page_url:
        img = get_og_image(page_url, session)
        if img:
            return img
        time.sleep(0.8)

    # 3. メーカー CDN 直接 URL
    img = get_manufacturer_cdn_image(name, page_url, session)
    if img:
        return img

    # 4. Amazon.co.jp フォールバック（メーカーサイト不可の場合に有効）
    # Fujifilm / Samyang はブランド名をプレフィックスして検索精度を上げる
    amazon_query = name
    for brand_prefix in ("XF", "GF", "XC"):  # Fujifilm マウント名で判定
        if name.startswith(brand_prefix):
            amazon_query = f"Fujifilm {name}"
            break
    if name.startswith("Samyang") is False and re.search(r"^(AF\s)?\d+mm", name):
        amazon_query = f"Samyang {name}"
    img = get_amazon_image(amazon_query, session)
    if img:
        return img
    time.sleep(0.5)

    # 5. Yodobashi フォールバック
    img = get_yodobashi_image(name, session)
    if img:
        return img
    time.sleep(1.0)

    # 6. 価格.com フォールバック
    img = get_kakaku_image(name, session)
    if img:
        return img
    time.sleep(1.0)

    return None


def main():
    import os

    # 入力読み込み
    src = INPUT_PATH if os.path.exists(INPUT_PATH) else FALLBACK
    with open(src, encoding="utf-8") as f:
        data = json.load(f)
    lenses: list = data.get("lenses", [])
    print(f"📂 入力: {src}  ({len(lenses)} 件)")

    session = requests.Session()
    session.headers.update(HEADERS)

    # ── ブランドDB 構築 ──────────────────────────────────
    brand_db = build_brand_db(session)

    # ── 新規レンズ追加フェーズ ────────────────────────────
    print("\n═══ 新規レンズ追加フェーズ ═══")
    existing_norms = {norm(l.get("name", "")) for l in lenses}
    added_new = 0
    for key, entry in brand_db.items():
        name = entry.get("name", "")
        if not name or not is_lens_name(name):
            continue
        if norm(name) not in existing_norms:
            lenses.append({
                "name":       name,
                "source_url": entry.get("page_url", ""),
                "review_links": [],
                "image_url":  entry.get("image_url"),
            })
            existing_norms.add(norm(name))
            added_new += 1
    print(f"   → {added_new} 件の新規レンズを追加（合計 {len(lenses)} 件）")

    # ── 画像取得フェーズ ──────────────────────────────────
    print("\n═══ 画像取得フェーズ ═══")
    updated = 0

    for i, lens in enumerate(lenses):
        name = lens.get("name", "")
        if not name:
            continue
        img_url = lens.get("image_url") or ""
        # CB\d{7,} 付きURL はAmazonのスポンサー広告画像 → 再取得する
        is_bad_cb  = bool(re.search(r"CB\d{7,}", img_url))
        # ドメインなし不正URL（例: http://93053）→ 再取得する
        is_bad_url = bool(img_url) and not re.search(r"https?://[a-zA-Z0-9][^/]*\.[a-zA-Z]{2,}", img_url)
        # Nikon汎用Amazon画像（319sNK+a1hL）→ 再取得する
        _BAD_IMG_IDS = ("319sNK+a1hL",)
        is_bad_generic = any(bid in img_url for bid in _BAD_IMG_IDS)
        if img_url and not is_bad_cb and not is_bad_url and not is_bad_generic and not FORCE:
            continue

        entry = find_in_brand_db(name, brand_db)
        if not entry:
            continue

        print(f"  [{i+1}] {name}")
        img = resolve_image(name, entry, session)

        if img:
            lens["image_url"]    = img
            lens["official_url"] = entry.get("page_url", "")
            updated += 1
            print(f"  ✅ {img[:80]}")
        else:
            print(f"  ⚠️  画像取得失敗")

        # 20件ごとに中間保存
        if (i + 1) % 20 == 0:
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  💾 途中保存 ({i+1}/{len(lenses)})")

    # 最終保存
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    with_img = sum(1 for l in lenses if l.get("image_url"))
    total = len(lenses)
    print(f"\n{'='*50}")
    print(f"✅ 完了 → {OUTPUT_PATH}")
    print(f"   今回更新: {updated} 件")
    print(f"   画像あり: {with_img}/{total} ({with_img*100//total if total else 0}%)")


if __name__ == "__main__":
    main()

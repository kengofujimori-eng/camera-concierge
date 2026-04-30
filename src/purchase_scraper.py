#!/usr/bin/env python3
"""
purchase_scraper.py
各レンズに購入リンク（新品・レンタル・中古）と目安価格を追加する。
価格は楽天市場 Ichiba Item Search API で取得。

【認証情報の設定】
環境変数で設定（推奨）:
  export RAKUTEN_APP_ID="ab1ea99e-a20c-4501-b6d1-ce2fa3efca0d"
  export RAKUTEN_AFFILIATE_ID="52ea4d1b.8eebe712.52ea4d1c.1881a922"

または .env ファイル（python-dotenv が入っている場合）:
  RAKUTEN_APP_ID=ab1ea99e-a20c-4501-b6d1-ce2fa3efca0d
  RAKUTEN_AFFILIATE_ID=52ea4d1b.8eebe712.52ea4d1c.1881a922

使い方:
  cd ~/camera-concierge/src
  python3 purchase_scraper.py              # 全レンズを処理
  python3 purchase_scraper.py --dry-run    # ドライラン（保存しない）
  python3 purchase_scraper.py --brand Canon --limit 3  # テスト用
  python3 purchase_scraper.py --force      # 既存データも上書き
  python3 purchase_scraper.py --links-only   # 購入リンク + Photo Yodobashi/Kasyapa URL を生成・保存
  python3 purchase_scraper.py --debug        # デバッグ出力
  # ※ Kasyapa URL は HTTP 検証なしで生成（MapCamera がスクリプトアクセスをブロックするため）

スキーマ追加:
  "purchase_links": {
    "new": {
      "amazon":    "https://...",
      "rakuten":   "https://...",
      "yahoo":     "https://...",
      "yodobashi": "https://...",
      "biccamera": "https://..."
    },
    "rental": {
      "goopass": "https://..."
    },
    "used": {
      "mapcamera": "https://...",
      "kitamura":  "https://..."
    }
  },
  "price_info": {
    "new_price":  123456,   # 円（楽天最安値）
    "used_price": 98765,    # 円（楽天中古最安値）
    "fetched_at": "2026-04-17"
  }
"""

import json, re, sys, os, time
import urllib.parse
import urllib.request
from datetime import date
from concurrent.futures import ThreadPoolExecutor, as_completed

# ────────────────────────────────────────────────────────
# オプション解析
# ────────────────────────────────────────────────────────
DRY_RUN         = "--dry-run"         in sys.argv
FORCE           = "--force"           in sys.argv
LINKS_ONLY      = "--links-only"      in sys.argv
DEBUG           = "--debug"           in sys.argv
RETRY_FAILED    = "--retry-failed"    in sys.argv  # 取得失敗（None）のみ再実行
VERIFY_KASYAPA  = "--verify-kasyapa"  in sys.argv  # Kasyapa URL を HTTP 検証してから保存

_brand_arg = None
for i, a in enumerate(sys.argv):
    if a == "--brand" and i + 1 < len(sys.argv):
        _brand_arg = sys.argv[i + 1]

_limit_arg = None
for i, a in enumerate(sys.argv):
    if a == "--limit" and i + 1 < len(sys.argv):
        try:
            _limit_arg = int(sys.argv[i + 1])
        except ValueError:
            pass

# ────────────────────────────────────────────────────────
# 定数
# ────────────────────────────────────────────────────────
INPUT_PATH  = "../public/lens_data.json"
OUTPUT_PATH = "../public/lens_data.json"

TODAY = date.today().isoformat()

# API リクエスト間隔（秒）- 楽天API推奨: 最低1秒、安全のため2秒
FETCH_DELAY = 2.0

# ────────────────────────────────────────────────────────
# 楽天API認証情報（環境変数 or フォールバック）
# ────────────────────────────────────────────────────────
RAKUTEN_APP_ID       = os.environ.get("RAKUTEN_APP_ID",       "ab1ea99e-a20c-4501-b6d1-ce2fa3efca0d")
RAKUTEN_ACCESS_KEY   = os.environ.get("RAKUTEN_ACCESS_KEY",   "pk_GAkXotcyBLeo0YZYqmAmYdff68Aa6UJgmmSQzKMY2AJ")
RAKUTEN_AFFILIATE_ID = os.environ.get("RAKUTEN_AFFILIATE_ID", "52ea4d1b.8eebe712.52ea4d1c.1881a922")

# 新ドメイン + Refererヘッダー必須
RAKUTEN_API_BASE    = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601"
RAKUTEN_APP_REFERER = os.environ.get("RAKUTEN_APP_REFERER", "https://camera-concierge.vercel.app/")

# ────────────────────────────────────────────────────────
# アクセサリー除外フィルタ
# ────────────────────────────────────────────────────────
_ACCESSORY_WORDS = [
    "フード", "hood", "レンズフード",
    "キャップ", "cap", "レンズキャップ", "リアキャップ",
    "ケース", "case", "ポーチ", "pouch", "ソフトケース",
    "カバー", "cover", "コート",
    "バッグ", "bag",
    "ストラップ", "strap",
    "フィルター", "filter",
    "プレート", "plate",
    "ホルスター", "holster",
    "アダプター", "adapter", "adaptor", "マウントアダプター",
    "互換品", "コンパチ", "交換用", "代替",
    "JJC", "Haoge", "Fotasy", "NEEWER", "ALTURA",
    "三脚座", "tripod collar", "リングアダプター",
]

# 正規ブランド表記（偽造品・誤記除外用）
_BRAND_SPELLINGS = {
    "Canon":     ["Canon", "キヤノン", "キャノン"],
    "Nikon":     ["Nikon", "ニコン", "NIKKOR"],
    "Sony":      ["Sony", "ソニー", "SONY"],
    "Sigma":     ["Sigma", "シグマ", "SIGMA"],
    "Tamron":    ["Tamron", "タムロン", "TAMRON"],
    "Fujifilm":  ["Fujifilm", "富士フイルム", "FUJIFILM", "FUJINON"],
    "Panasonic": ["Panasonic", "パナソニック", "LUMIX"],
    "Olympus":   ["Olympus", "オリンパス", "OM SYSTEM", "OM-SYSTEM"],
    "Voigtlander": ["Voigtlander", "フォクトレンダー", "COSINA", "コシナ"],
    "Samyang":   ["Samyang", "サムヤン", "Rokinon"],
    "Zeiss":     ["Zeiss", "ツァイス", "ZEISS"],
    "Viltrox":   ["Viltrox", "ビルトロックス"],
}

# 新品レンズとして現実的な最低価格（¥20,000未満はアクセサリーの可能性が高い）
MIN_NEW_PRICE  = 20_000
MIN_USED_PRICE = 8_000
MAX_LENS_PRICE = 3_000_000


def _is_accessory(title):
    """商品タイトルがアクセサリーかどうか判定"""
    tl = title.lower()
    return any(w.lower() in tl for w in _ACCESSORY_WORDS)


def _is_valid_brand(title, brand):
    """ブランド名が正しいスペルで含まれているか確認"""
    spellings = _BRAND_SPELLINGS.get(brand, [])
    if not spellings:
        return True  # 不明ブランドはスルー
    return any(s in title for s in spellings)


# ────────────────────────────────────────────────────────
# 検索クエリ正規化
# ────────────────────────────────────────────────────────

def normalize_lens_name(name):
    """検索用に正規化したレンズ名を返す"""
    # ｜（全角パイプ）区切りで英数字部分を優先抽出
    # 例: "完成度の高い超広角レンズ｜NIKKOR Z 20mm f/1.8 S" → "NIKKOR Z 20mm f/1.8 S"
    if "\uff5c" in name or "|" in name:
        parts = re.split(r"[|\uff5c]", name)
        # ASCII英数字を多く含む部分を選ぶ
        parts.sort(key=lambda p: sum(1 for c in p if c.isascii() and c.isalnum()), reverse=True)
        name = parts[0].strip()

    # 日本語テキスト（説明文）が含まれる場合、英数字部分のみ抽出
    # 例: "NOKTON 40mm F1.2 Aspherical なめらかなボケ..." → "NOKTON 40mm F1.2 Aspherical"
    jp_match = re.search(r'[\u3040-\u9fff]', name)
    if jp_match:
        after = name[jp_match.start():]
        before = name[:jp_match.start()].strip()
        # 前半が空でも後半に英数字モデル名があれば抽出
        ascii_parts = re.findall(r'[A-Za-z0-9][\w.\-/]*(?:\s+[A-Za-z0-9][\w.\-/]*)*', after)
        if not before and ascii_parts:
            name = max(ascii_parts, key=len)
        else:
            name = before

    # 数字間の "?" は "-" に置換（例: "70?200mm" → "70-200mm"）
    name = re.sub(r'(\d)\?(\d)', r'\1-\2', name)
    # 残った "?" は除去（例: "F4?" → "F4"）
    name = name.replace("?", "")
    # "*" を除去（Zeiss "T*" 表記など → Rakuten がワイルドカードと解釈するのを防ぐ）
    name = name.replace("*", "")
    # 括弧とその内容を除去（例: "(Type I)" → ""、"GA(" → "GA"）
    # 閉じ括弧がある場合はカッコ全体を除去: (Type I) → ""
    name = re.sub(r'\([^)]*\)', '', name)
    # 残った孤立括弧記号を除去: "GA(" → "GA"
    name = name.replace('(', '').replace(')', '').replace('[', '').replace(']', '')

    # Zeiss Batis/Loxia 方式 "F値/焦点距離" → "焦点距離mm FX" に変換
    # 例: "Batis 2/40 CF" → "Batis 40mm F2 CF"
    #     "Batis 1.8/85"  → "Batis 85mm F1.8"
    name = re.sub(r'\b(\d+(?:\.\d+)?)/(\d+)\b', r'\2mm F\1', name)

    # f/2.8 → F2.8 に変換（スラッシュ除去でf 2.8になるのを防ぐ）
    name = re.sub(r'\bf/(\d)', r'F\1', name)
    # 残ったスラッシュはスペースに
    name = name.replace("/", " ").replace("　", " ")
    # 連続空白を単一に
    name = re.sub(r"\s+", " ", name).strip()

    # 単独1文字トークンを除去（楽天APIがキーワード無効として拒否するため）
    # 例: "NIKKOR Z 14-30mm F4 S" → "NIKKOR 14-30mm F4"
    #     "Z" = ニコンZマウント指定子、"S" = S-Line品質指定子
    tokens = name.split()
    tokens = [t for t in tokens if not (len(t) == 1 and t.isalpha())]
    name = " ".join(tokens)

    return name


def make_search_query(name, brand=""):
    """レンズ名から検索クエリを生成"""
    if brand and brand.upper() not in name.upper() and brand != "OTHER":
        query = f"{brand} {name}"
    else:
        query = name
    return normalize_lens_name(query)


# ────────────────────────────────────────────────────────
# 購入リンク生成（検索URL）
# ────────────────────────────────────────────────────────

def make_amazon_url(query):
    q = urllib.parse.quote(query)
    return f"https://www.amazon.co.jp/s?k={q}&rh=n%3A2437276051&tag=techddd-22"


def make_rakuten_url(query):
    # 楽天アフィリエイト経由の検索リンク（内側URLはそのまま組み立て、外側で1回エンコード）
    inner = f"https://search.rakuten.co.jp/search/mall/{query}/"
    return f"https://hb.afl.rakuten.co.jp/ichiba/5317dc68.864f8157.5317dc69.50ddff71/?pc={urllib.parse.quote(inner, safe='')}&link_type=text"


def make_yahoo_url(query):
    q = urllib.parse.quote(query)
    return f"https://shopping.yahoo.co.jp/search?p={q}&astid=12"


def make_yodobashi_url(query):
    q = urllib.parse.quote(query)
    return f"https://www.yodobashi.com/?word={q}&typ=searchrecommend"


def make_biccamera_url(query):
    q = urllib.parse.quote(query)
    return f"https://www.biccamera.com/bc/main/search/search_results.do?q={q}"


def make_mapcamera_url(query):
    q = urllib.parse.quote(query)
    return f"https://www.mapcamera.com/used/?keyword={q}"


def make_kitamura_url(query):
    """
    カメラのキタムラ 中古検索URL（A8アフィリエイト経由）
    キタムラ提携URL: https://px.a8.net/svt/ejp?a8mat=...
    ランディング先: kitamura.jp/used/search/
    """
    # A8.net アフィリエイトリンク（キタムラ）
    q = urllib.parse.quote(query)
    # ベースのキタムラ中古検索URL
    kitamura_inner = f"https://www.kitamura.jp/used/search/?q={query}"
    # A8アフィリエイト（カメラのキタムラ提携済み）
    return f"https://px.a8.net/svt/ejp?a8mat=4B1N9L+CONHRM+2O9U+BW8O2&a8ejpredirect={urllib.parse.quote(kitamura_inner, safe='')}"


def make_photo_yodobashi_url(source_url):
    """
    メーカー公式 source_url からモデルコードを抽出し、Photo Yodobashi のレビューURLを生成。

    Sony    https://www.sony.jp/ichigan/products/SEL50F12GM/
            → https://photo.yodobashi.com/sony/lens/sel50f12gm/
    Canon   https://cweb.canon.jp/rf/lineup/rf14-35-f4l/
            → https://photo.yodobashi.com/canon/lens/rf14-35-f4l/
    Nikon   https://www.nikon-image.com/products/nikkor/zmount/z17-28mm_f28/
            → https://photo.yodobashi.com/nikon/lens/z17-28mm_f28/
    Sigma   https://www.sigma-global.com/jp/lenses/a037_14_f14/
            → https://photo.yodobashi.com/sigma/lens/a037_14_f14/
    Tamron  https://www.tamron.com/jp/consumer/lenses/a046/
            → https://photo.yodobashi.com/tamron/lens/a046/
    Fujifilm https://fujifilm-x.com/ja-jp/products/lenses/xf8mmf35-r-wr/
            → https://photo.yodobashi.com/fujifilm/lens/xf8mmf35-r-wr/
    """
    if not source_url:
        return None
    BASE = "https://photo.yodobashi.com"

    patterns = [
        # Sony: /ichigan/products/SEL50F12GM/
        (r'sony\.jp/ichigan/products/([A-Z][A-Z0-9]+)', 'sony'),
        # Canon: /rf/lineup/rf14-35-f4l/ または /ef/lineup/ef100-400mm-l/
        (r'canon\.jp/[^/]+/lineup/([^/?#]+)', 'canon'),
        # Nikon: /products/nikkor/zmount/z17-28mm_f28/
        (r'nikon-image\.com/products/nikkor/[^/]+/([^/?#]+)', 'nikon'),
        # Sigma: /jp/lenses/a037_14_f14/
        (r'sigma-global\.com/jp/lenses/([^/?#]+)', 'sigma'),
        # Tamron: /jp/consumer/lenses/a046/
        (r'tamron\.com/jp/consumer/lenses/([^/?#]+)', 'tamron'),
        # Fujifilm
        (r'fujifilm-x\.com/[^/]+/products/lenses/([^/?#]+)', 'fujifilm'),
        # Panasonic LUMIX
        (r'panasonic\.com/[^/]+/consumer/lumix-g-lenses/([^/?#]+)', 'panasonic'),
    ]
    for pattern, brand in patterns:
        m = re.search(pattern, source_url, re.I)
        if m:
            model = m.group(1).lower().strip('/')
            return f"{BASE}/{brand}/lens/{model}/"
    return None


def extract_model_code(source_url):
    """
    メーカー公式 source_url からモデルコードを抽出して返す。
    Google 検索クエリ生成などに利用。

    Sony   https://www.sony.jp/ichigan/products/SEL50F14GM/ → "SEL50F14GM"
    Canon  https://cweb.canon.jp/rf/lineup/rf14-35-f4l/    → "rf14-35-f4l"
    """
    if not source_url:
        return None
    patterns = [
        r'sony\.jp/ichigan/products/([A-Z][A-Z0-9]+)',
        r'canon\.jp/[^/]+/lineup/([^/?#]+)',
        r'nikon-image\.com/products/nikkor/[^/]+/([^/?#]+)',
        r'sigma-global\.com/jp/lenses/([^/?#]+)',
        r'tamron\.com/jp/consumer/lenses/([^/?#]+)',
        r'fujifilm-x\.com/[^/]+/products/lenses/([^/?#]+)',
    ]
    for pattern in patterns:
        m = re.search(pattern, source_url, re.I)
        if m:
            return m.group(1).strip('/')
    return None


def verify_url_exists(url, timeout=8):
    """
    URLが実際に存在するか確認。
    1. curl コマンド（ブラウザ風 UA + follow redirect）
    2. urllib フォールバック

    news.mapcamera.com は Cloudflare 保護があり urllib だけではブロックされる。
    """
    import subprocess

    # ── curl で試す（最も確実）────────────────────────────
    try:
        result = subprocess.run(
            [
                'curl', '-s', '-o', '/dev/null',
                '-w', '%{http_code}',
                '-L',                        # リダイレクトを追う
                '--max-time', str(timeout),
                '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                '-H', 'Accept-Language: ja,en-US;q=0.9,en;q=0.8',
                '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                url,
            ],
            capture_output=True, text=True, timeout=timeout + 2,
        )
        code = result.stdout.strip()
        if code.isdigit():
            status = int(code)
            return status == 200
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass  # curl が無い or タイムアウト → urllib フォールバック

    # ── urllib フォールバック ──────────────────────────────
    headers = {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as e:
        return False
    except Exception:
        return False


def verify_kasyapa_urls_batch(url_candidates, max_workers=8):
    """
    {url: lens_name} の dict を受け取り、実在する URL のみを返す set。
    並列リクエストで高速化。
    """
    valid = set()
    total = len(url_candidates)
    print(f"  🔍 Kasyapa URL 検証中 ({total} 件, {max_workers} 並列)...")

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(verify_url_exists, url): url for url in url_candidates}
        done = 0
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            done += 1
            try:
                if future.result():
                    valid.add(url)
            except Exception:
                pass
            if done % 10 == 0 or done == total:
                print(f"     {done}/{total} 完了 ({len(valid)} 件 有効)", end='\r')

    print(f"\n  ✅ Kasyapa 有効 URL: {len(valid)} / {total} 件")
    return valid


def make_goopass_url(query):
    """GOOPASS カメラ・レンズレンタル検索URL（A8アフィリエイト経由）"""
    q = urllib.parse.quote(query)
    # GOOPASS A8アフィリエイトリンク（10%、確認率76.56%）
    goopass_inner = f"https://goopass.jp/search/?q={query}"
    # A8アフィリエイト（GooPass申請中 → 承認後に PENDING を差し替え）
    GOOPASS_A8MAT = "PENDING"  # ← 承認後にA8管理画面のコードに差し替え
    return f"https://px.a8.net/svt/ejp?a8mat={GOOPASS_A8MAT}&a8ejpredirect={urllib.parse.quote(goopass_inner, safe='')}"


def build_purchase_links(name, brand=""):
    """購入リンクを生成（アフィリエイト有り or 主要ECのみ）"""
    query = make_search_query(name, brand)
    return {
        "new": {
            "amazon":  make_amazon_url(query),   # Amazon アフィリエイト
            "rakuten": make_rakuten_url(query),  # 楽天アフィリエイト
            "yahoo":   make_yahoo_url(query),    # Yahoo（ポイント活用）
        },
        "used": {
            "kitamura": make_kitamura_url(query),  # カメラのキタムラ中古（A8アフィリエイト）
        },
        # rental: GooPass は A8 提携承認後に追加
        # "rental": { "goopass": make_goopass_url(query) },
    }


# ────────────────────────────────────────────────────────
# 楽天 Ichiba Item Search API
# ────────────────────────────────────────────────────────

def _rakuten_search(keyword, hits=30, page=1):
    """
    楽天市場商品検索APIを呼び出し、Item dict のリストを返す。
    新API: openapi.rakuten.co.jp + accessKey + Refererヘッダー必須。

    戻り値: Item dict のリスト（itemName, itemPrice などを含む）
    失敗時: []
    """
    params = {
        "applicationId": RAKUTEN_APP_ID,
        "accessKey":     RAKUTEN_ACCESS_KEY,
        "affiliateId":   RAKUTEN_AFFILIATE_ID,
        "keyword":       keyword,
        "hits":          str(hits),
        "page":          str(page),
        "sort":          "%2BitemPrice",    # +itemPrice (価格昇順)
        "format":        "json",
    }
    url = RAKUTEN_API_BASE + "?" + urllib.parse.urlencode(params, safe="%")

    if DEBUG:
        print(f"     [DEBUG] Rakuten API: {keyword}")

    headers = {
        "User-Agent": "Mozilla/5.0 CameraConcierge/1.0",
        "Referer":    RAKUTEN_APP_REFERER,
        "Origin":     RAKUTEN_APP_REFERER.rstrip("/"),
    }

    for attempt in range(3):  # 最大3回リトライ
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw = resp.read().decode("utf-8")
                data = json.loads(raw)

            # レスポンス形式: {"Items": [{"Item": {...}}, ...]}
            raw_items = data.get("Items", [])
            items = []
            for entry in raw_items:
                if isinstance(entry, dict):
                    item = entry.get("Item", entry)
                    if "itemName" in item:
                        items.append(item)

            if DEBUG:
                print(f"     [DEBUG] ヒット数: {data.get('count', 0)}  取得: {len(items)}")
            return items

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:200]
            if DEBUG:
                print(f"     [DEBUG] HTTP {e.code} (attempt {attempt+1}): {body}")
            if e.code in (429, 503) or attempt < 2:
                wait = (attempt + 1) * 5  # 5秒, 10秒, 15秒
                if DEBUG:
                    print(f"     [DEBUG] {wait}秒待機してリトライ...")
                time.sleep(wait)
            else:
                return []
        except Exception as e:
            if DEBUG:
                print(f"     [DEBUG] API エラー (attempt {attempt+1}): {e}")
            if attempt < 2:
                time.sleep(5)
            else:
                return []
    return []


def _pick_price(items, brand="", used=False, keyword=""):
    """
    楽天APIのアイテムリストから適切な最安値を選ぶ。

    - アクセサリーを除外
    - ブランド名不一致を除外
    - 価格が MIN_NEW_PRICE / MIN_USED_PRICE 未満を除外
    - 中古モード(used=True)のとき: 「中古」を含まない商品を除外

    戻り値: (最安値 int|None, 画像URL str|None)
    """
    min_price = MIN_USED_PRICE if used else MIN_NEW_PRICE
    candidates = []  # (price, image_url)

    for item_wrap in items:
        # formatVersion=2 では Items は直接 item dict のリスト
        item = item_wrap if isinstance(item_wrap, dict) and "itemName" in item_wrap else item_wrap.get("Item", {})

        title = item.get("itemName", "")
        price = item.get("itemPrice", 0)

        if not title or not price:
            continue

        # 価格範囲チェック
        if price < min_price or price > MAX_LENS_PRICE:
            if DEBUG:
                print(f"     [DEBUG] 価格範囲外 ¥{price:,}: {title[:50]}")
            continue

        # アクセサリー除外
        if _is_accessory(title):
            if DEBUG:
                print(f"     [DEBUG] アクセサリー除外: {title[:50]}")
            continue

        # ブランド検証
        if brand and brand != "OTHER" and not _is_valid_brand(title, brand):
            if DEBUG:
                print(f"     [DEBUG] ブランド不一致: {title[:50]}")
            continue

        # 中古モード: 「中古」が含まれない商品は除外
        if used:
            title_lower = title.lower()
            if "中古" not in title and "used" not in title_lower and "ユーズド" not in title:
                if DEBUG:
                    print(f"     [DEBUG] 中古なし→除外: {title[:50]}")
                continue

        # 新品モード: 「中古」が含まれる商品は除外（誤マッチ防止）
        if not used:
            if "中古" in title:
                if DEBUG:
                    print(f"     [DEBUG] 中古品→新品検索から除外: {title[:50]}")
                continue

        if DEBUG:
            print(f"     [DEBUG] 採用 ¥{price:,}: {title[:55]}")

        # 画像URL取得（mediumImageUrls[0] を優先）
        img_url = None
        medium_imgs = item.get("mediumImageUrls", [])
        if medium_imgs:
            first = medium_imgs[0]
            img_url = first.get("imageUrl") if isinstance(first, dict) else str(first)

        candidates.append((price, img_url))

    if candidates:
        # 最安値で選択
        candidates.sort(key=lambda x: x[0])
        result_price, result_img = candidates[0]
        if DEBUG:
            print(f"     [DEBUG] → 最安値: ¥{result_price:,}")
        return result_price, result_img

    return None, None


def fetch_prices(lens_name, brand=""):
    """
    楽天APIで新品価格・中古価格・商品画像URLを取得。

    - 新品: "{ブランド} {レンズ名}" でジャンル検索、中古を除外
    - 中古: "{ブランド} {レンズ名} 中古" でジャンル検索

    戻り値: {"new_price": int|None, "used_price": int|None, "image_url": str|None, "fetched_at": str}
    """
    query = make_search_query(lens_name, brand)

    # ── Step 1: 新品価格（"新品"をキーワードに加えてアクセサリー・中古を排除）──
    new_p = None
    image_url = None
    new_query = f"{query} 新品"
    for page in range(1, 4):  # 最大3ページまで試す
        items_new = _rakuten_search(new_query, hits=30, page=page)
        if not items_new:
            break
        new_p, image_url = _pick_price(items_new, brand=brand, used=False, keyword=new_query)
        if new_p:
            break
        time.sleep(FETCH_DELAY)
    time.sleep(FETCH_DELAY)

    # ── Step 2: 中古価格 ──────────────────────────────────
    used_p = None
    used_query = f"{query} 中古"
    items_used = _rakuten_search(used_query, hits=30)
    if items_used:
        used_p, _ = _pick_price(items_used, brand=brand, used=True, keyword=used_query)
    time.sleep(FETCH_DELAY)

    if DEBUG:
        print(f"     [DEBUG] 結果 → 新品: {new_p}  中古: {used_p}  画像: {image_url}")

    return {
        "new_price":  new_p,
        "used_price": used_p,
        "image_url":  image_url,
        "fetched_at": TODAY,
    }


# ────────────────────────────────────────────────────────
# ブランド推定
# ────────────────────────────────────────────────────────

def detect_brand(name):
    if re.search(r"NIKKOR", name, re.I):
        return "Nikon"
    if re.match(r"RF[-\s]?S?\s?\d|RF[-\s]\d", name, re.I) or name.startswith("Canon"):
        return "Canon"
    if name.startswith("Sigma"):
        return "Sigma"
    if re.search(r"\bTamron\b", name, re.I) or re.search(r"Di\s+III", name, re.I):
        return "Tamron"
    if "Viltrox" in name:
        return "Viltrox"
    if re.search(r"NOKTON|ULTRON|HELIAR|LANTHAR|COLOR-SKOPAR", name, re.I):
        return "Voigtlander"
    if re.match(r"(XF|GF|XC)\d", name) or name.startswith("Fujifilm"):
        return "Fujifilm"
    if name.startswith("Samyang"):
        return "Samyang"
    # Sony ZA レンズ（Sonnar T*/Distagon T*/Planar T*/Vario-Tessar T* ～ ZA）は
    # 光学設計はZeissだが、販売はSony → 楽天ではソニー名義で出品される
    if re.search(r"\bZA\b", name):
        return "Sony"
    if re.match(r"(FE\s|E\s|FE PZ)", name) or name.startswith("Sony"):
        return "Sony"
    if "LUMIX" in name:
        return "Panasonic"
    # 純粋なZeissブランド（Batis/Loxia など）
    if re.search(r"Batis|Loxia|Distagon|Planar|Sonnar|Vario-Tessar|FiRIN", name, re.I):
        return "Zeiss"
    if re.search(r"ELMARIT|SUMMILUX|APO-Summicron|VARIO-ELMARIT", name, re.I):
        return "Leica"
    return "OTHER"


# ────────────────────────────────────────────────────────
# メイン処理
# ────────────────────────────────────────────────────────

def main():
    if not os.path.exists(INPUT_PATH):
        print(f"❌ {INPUT_PATH} が見つかりません")
        sys.exit(1)

    # API認証情報チェック
    if not LINKS_ONLY and not DRY_RUN:
        if not RAKUTEN_APP_ID or RAKUTEN_APP_ID == "YOUR_APP_ID":
            print("❌ RAKUTEN_APP_ID が設定されていません")
            print("   export RAKUTEN_APP_ID='...' を実行してください")
            sys.exit(1)
        print(f"✅ 楽天API: APP_ID={RAKUTEN_APP_ID[:8]}...  AFFILIATE_ID={RAKUTEN_AFFILIATE_ID[:8]}...")

    with open(INPUT_PATH, encoding="utf-8") as f:
        data = json.load(f)

    lenses = data.get("lenses", [])
    print(f"📂 読み込み: {INPUT_PATH}  ({len(lenses)} 件)")
    if DRY_RUN:
        print("🔍 ドライラン（--dry-run）: 保存しません")
    if LINKS_ONLY:
        print("🔗 リンクのみモード（--links-only）: 価格フェッチをスキップ")
    if FORCE:
        print("⚠️  強制モード（--force）: 既存データも上書きします")
    print()

    # フィルタ
    targets = lenses
    if _brand_arg:
        targets = [l for l in lenses if detect_brand(l.get("name", "")) == _brand_arg]
        print(f"🔎 ブランドフィルタ: {_brand_arg}  ({len(targets)} 件)")
    if _limit_arg:
        targets = targets[:_limit_arg]
        print(f"🔎 件数制限: {_limit_arg} 件")

    skipped        = 0
    updated_links  = 0
    updated_prices = 0
    price_new_ok   = 0
    price_used_ok  = 0
    updated_kasyapa = 0

    # ── Kasyapa URL バッチ検証（--verify-kasyapa 時のみ、参考用）──────────────
    # ※ MapCamera は Python/curl の自動アクセスをブロックするため通常は 0 件になります。
    #    デバッグ・将来の参考用として残しています。
    verified_kasyapa_urls: set = set()
    if VERIFY_KASYAPA:
        candidates = {}
        for lens in targets:
            src = lens.get("source_url", "")
            if not src:
                continue
            if not FORCE and lens.get("kasyapa_url"):
                continue
            url = make_kasyapa_url(src)
            if url:
                candidates[url] = lens.get("name", "")
        if candidates:
            verified_kasyapa_urls = verify_kasyapa_urls_batch(set(candidates.keys()))
        print()

    for i, lens in enumerate(targets):
        name  = lens.get("name", "")
        brand = lens.get("brand") or detect_brand(name)

        # ── 購入リンク ──────────────────────────────────
        has_links = bool(lens.get("purchase_links"))
        if not has_links or FORCE:
            lens["purchase_links"] = build_purchase_links(name, brand)
            updated_links += 1

        # ── Photo Yodobashi レビューURL（source_url から生成）──
        if not lens.get("photo_yodobashi_url") or FORCE:
            py_url = make_photo_yodobashi_url(lens.get("source_url", ""))
            if py_url:
                lens["photo_yodobashi_url"] = py_url

        # ── モデルコード抽出（Kasyapa Google検索・その他に利用）──────────
        # news.mapcamera.com は Akamai ACL で直リンク・サイト内検索ともにブロックされるため
        # モデルコードを保存し、フロントエンドで Google 検索 URL を生成する。
        if not lens.get("model_code") or FORCE:
            code = extract_model_code(lens.get("source_url", ""))
            if code:
                lens["model_code"] = code
                updated_kasyapa += 1

        # ── 価格情報 ────────────────────────────────────
        if LINKS_ONLY:
            if not lens.get("price_info"):
                lens["price_info"] = {
                    "new_price":  None,
                    "used_price": None,
                    "fetched_at": None,
                }
            continue

        has_price = bool(lens.get("price_info") and lens["price_info"].get("fetched_at"))

        # --retry-failed: fetched_at はあるが new_price か used_price が None のものだけ再実行
        if RETRY_FAILED and has_price:
            pi = lens["price_info"]
            if pi.get("new_price") is not None and pi.get("used_price") is not None:
                skipped += 1
                continue  # 両方取得済み → スキップ
            # どちらかが None → 再実行
        elif has_price and not FORCE:
            skipped += 1
            continue

        # 進捗表示
        print(f"  [{i+1}/{len(targets)}] {name[:60]}")

        if not DRY_RUN:
            price_info = fetch_prices(name, brand)
            lens["price_info"] = price_info
            updated_prices += 1
            new_str  = f"¥{price_info['new_price']:,}"  if price_info["new_price"]  else "取得失敗"
            used_str = f"¥{price_info['used_price']:,}" if price_info["used_price"] else "取得失敗"
            print(f"     新品: {new_str}  中古: {used_str}")
            if price_info["new_price"]:
                price_new_ok  += 1
            if price_info["used_price"]:
                price_used_ok += 1
        else:
            lens["price_info"] = {
                "new_price":  None,
                "used_price": None,
                "fetched_at": TODAY,
            }
            print(f"     [ドライラン] 価格フェッチをスキップ")

    print()
    print(f"── サマリー ──────────────────────────────────")
    print(f"  購入リンク追加/更新: {updated_links} 件")
    if updated_kasyapa:
        print(f"  モデルコード保存:    {updated_kasyapa} 件")
    if not LINKS_ONLY:
        print(f"  価格情報更新:        {updated_prices} 件  (スキップ: {skipped} 件)")
        if not DRY_RUN and updated_prices > 0:
            print(f"  新品価格取得成功:    {price_new_ok} 件 / {updated_prices} 件")
            print(f"  中古価格取得成功:    {price_used_ok} 件 / {updated_prices} 件")

    if DRY_RUN:
        print("\n── ドライランのため保存しません ──────────────")
    else:
        data["lenses"] = lenses
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n💾 保存完了 → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

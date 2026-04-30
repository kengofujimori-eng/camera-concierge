"""
remove_bg.py  –  レンズ画像の背景を一括除去して public/lens_images/ に保存する

【使い方】
1. 必要ライブラリをインストール（初回のみ）
   pip install rembg pillow requests

2. スクリプトをプロジェクトルートで実行
   python remove_bg.py

3. 完了後、lens_data.json のURLが /lens_images/xxx.png に更新されます

【オプション】
   python remove_bg.py --limit 10      # 最初の10件だけ処理（テスト用）
   python remove_bg.py --force         # 既存ファイルも再処理
   python remove_bg.py --skip-errors   # エラーのレンズはスキップして継続
"""

import json
import time
import argparse
import hashlib
from pathlib import Path

import requests
from PIL import Image
from rembg import remove
from io import BytesIO

# ── 設定 ──────────────────────────────────────────────────
LENS_DATA_PATH  = Path('public/lens_data.json')
OUTPUT_DIR      = Path('public/lens_images')
REQUEST_DELAY   = 0.5   # サーバー負荷軽減のため各リクエスト間の待機秒数
REQUEST_TIMEOUT = 15    # タイムアウト秒数

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'image/webp,image/png,image/jpeg,*/*',
    'Referer': 'https://techddd.com/',
}
# ────────────────────────────────────────────────────────────


def url_to_filename(url: str, lens_name: str) -> str:
    """URLとレンズ名からユニークなファイル名を生成"""
    safe_name = lens_name.replace('/', '_').replace(' ', '_').replace('|', '_')
    # URLのハッシュを付けて衝突防止
    url_hash = hashlib.md5(url.encode()).hexdigest()[:6]
    return f"{safe_name}_{url_hash}.png"


def download_image(url: str) -> Image.Image | None:
    """URLから画像をダウンロードしてPILイメージを返す"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content)).convert('RGBA')
    except Exception as e:
        print(f"    ⚠️  ダウンロード失敗: {e}")
        return None


def process_image(img: Image.Image) -> Image.Image:
    """rembg で背景を除去して透過PNGを返す"""
    # rembg に渡すため一度バイト列に変換
    buf = BytesIO()
    img.save(buf, format='PNG')
    result_bytes = remove(buf.getvalue())
    return Image.open(BytesIO(result_bytes)).convert('RGBA')


def main():
    parser = argparse.ArgumentParser(description='レンズ画像背景除去スクリプト')
    parser.add_argument('--limit',       type=int, default=0,     help='処理件数上限（0=全件）')
    parser.add_argument('--force',       action='store_true',      help='既存ファイルも再処理')
    parser.add_argument('--skip-errors', action='store_true',      help='エラー時にスキップして継続')
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(LENS_DATA_PATH, encoding='utf-8') as f:
        data = json.load(f)

    lenses = data.get('lenses', [])
    if args.limit:
        lenses = lenses[:args.limit]

    total   = len(lenses)
    success = 0
    skipped = 0
    failed  = 0

    print(f"\n🔍 処理対象: {total} 件\n{'─'*50}")

    for i, lens in enumerate(lenses, 1):
        name      = lens.get('name', f'lens_{i}')
        image_url = lens.get('image_url', '')

        print(f"[{i:3}/{total}] {name}")

        # image_url がない or すでにローカルパスならスキップ
        if not image_url:
            print("    → image_url なし、スキップ")
            skipped += 1
            continue
        if image_url.startswith('/lens_images/'):
            print("    → 処理済み、スキップ")
            skipped += 1
            continue

        # 出力ファイルパス
        filename    = url_to_filename(image_url, name)
        output_path = OUTPUT_DIR / filename
        local_url   = f'/lens_images/{filename}'

        # 既存ファイルがあれば --force でない限りスキップ
        if output_path.exists() and not args.force:
            print(f"    → 既存ファイルあり、スキップ ({filename})")
            lens['image_url'] = local_url
            skipped += 1
            continue

        # ダウンロード
        img = download_image(image_url)
        if img is None:
            failed += 1
            if not args.skip_errors:
                print("    ❌ エラーで停止。--skip-errors オプションで継続できます。")
                break
            continue

        # 背景除去
        try:
            print(f"    🤖 背景除去中...")
            processed = process_image(img)
            processed.save(output_path, 'PNG')
            lens['image_url'] = local_url
            print(f"    ✅ 保存: {filename}")
            success += 1
        except Exception as e:
            print(f"    ❌ 処理失敗: {e}")
            failed += 1
            if not args.skip_errors:
                break

        time.sleep(REQUEST_DELAY)

    # lens_data.json を上書き保存
    with open(LENS_DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n{'─'*50}")
    print(f"✅ 完了  成功: {success}件  スキップ: {skipped}件  失敗: {failed}件")
    print(f"📁 出力先: {OUTPUT_DIR.resolve()}")
    print(f"💾 lens_data.json を更新しました")


if __name__ == '__main__':
    main()

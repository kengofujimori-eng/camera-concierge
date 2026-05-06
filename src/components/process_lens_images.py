"""
レンズ画像 背景除去 + 方向統一スクリプト
===========================================
【事前準備】
  pip3 install rembg pillow numpy requests

【使い方】
  python3 process_lens_images.py

【出力】
  ./lens_images_processed/  ← 処理済みPNG（透明背景）
  ./lens_images_processed/report.json ← 処理結果レポート

【設定】
  - LONG_SIDE: 処理後の長辺サイズ (デフォルト 600px)
  - WORKERS: 並列処理数 (CPUコア数に応じて調整)
"""

import argparse
import json, os, re, time, io
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
import numpy as np
from PIL import Image
from rembg import remove, new_session

# ── 設定 ──────────────────────────────────────────────────
LENS_JSON   = str(Path.home() / "camera-concierge/public/lens_data.json")
OUTPUT_DIR  = Path.home() / "camera-concierge/public/lens_images_processed"
LONG_SIDE   = 600                  # 処理後の長辺px
WORKERS     = 4                    # 並列数
SKIP_EXISTING = True               # 処理済みをスキップ
LOCAL_IMAGE_PREFIX = "/lens_images_processed/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 Chrome/124.0 Safari/537.36"
}

# ── rembg セッション（モデルをキャッシュ） ──────────────────
SESSION = new_session("u2net")     # 初回のみモデルをDL（約170MB）


def slugify(name: str) -> str:
    """ファイル名に使える文字列に変換"""
    return re.sub(r'[^\w\-.]', '_', name)[:80]


def get_principal_angle(mask: np.ndarray) -> float:
    """
    マスク（白=レンズ部分）の主軸角度を PCA で求める。
    戻り値は度数（0=水平、90=垂直）
    """
    ys, xs = np.where(mask > 128)
    if len(xs) < 100:
        return 0.0
    pts = np.stack([xs - xs.mean(), ys - ys.mean()], axis=1).astype(float)
    cov = np.cov(pts.T)
    vals, vecs = np.linalg.eigh(cov)
    # 固有値が大きい方向 = 長手方向
    main_vec = vecs[:, np.argmax(vals)]
    angle_deg = np.degrees(np.arctan2(main_vec[1], main_vec[0]))
    return angle_deg


def local_image_url_for(name: str) -> str:
    return f"{LOCAL_IMAGE_PREFIX}{slugify(name)}.png"


def update_lens_image_url(lens_name: str, local_url: str) -> None:
    """lens_data.json の該当レコードだけに image_url を追加/更新する。"""
    json_path = Path(LENS_JSON)
    text = json_path.read_text(encoding="utf-8")
    name_line = f'"name": {json.dumps(lens_name, ensure_ascii=False)}'
    name_pos = text.find(name_line)
    if name_pos == -1:
        raise ValueError(f"lens_data.json に対象レンズが見つかりません: {lens_name}")

    block_start = text.rfind("\n    {", 0, name_pos)
    block_start = 0 if block_start == -1 else block_start + 1
    block_end = text.find("\n    },", name_pos)
    if block_end == -1:
        raise ValueError(f"対象レコードの終端を特定できません: {lens_name}")

    block = text[block_start:block_end]
    image_line = f'      "image_url": {json.dumps(local_url, ensure_ascii=False)},'
    image_url_re = re.compile(r'(?m)^      "image_url": ".*?",?$')

    if image_url_re.search(block):
        new_block = image_url_re.sub(image_line, block, count=1)
    else:
        external_line = re.search(r'(?m)^      "image_url_external": .+$', block)
        if external_line:
            insert_at = external_line.start()
            new_block = block[:insert_at] + image_line + "\n" + block[insert_at:]
        else:
            name_line_match = re.search(r'(?m)^      "name": .+$', block)
            if not name_line_match:
                raise ValueError(f"対象レコードの name 行を特定できません: {lens_name}")
            insert_at = name_line_match.end() + 1
            new_block = block[:insert_at] + image_line + "\n" + block[insert_at:]

    if new_block != block:
        json_path.write_text(text[:block_start] + new_block + text[block_end:], encoding="utf-8")


def process_one(lens: dict, allow_external: bool = False) -> dict:
    name = lens.get("name", "?")
    url  = lens.get("image_url", "")
    source_field = "image_url"
    if not url and allow_external:
        url = lens.get("image_url_external", "")
        source_field = "image_url_external"
    slug = slugify(name)
    out_path = OUTPUT_DIR / f"{slug}.png"
    local_url = local_image_url_for(name)

    result = {"name": name, "url": url, "source_field": source_field, "status": "", "file": "", "local_url": local_url}

    if not url:
        result["status"] = "NO_URL"
        return result

    if SKIP_EXISTING and out_path.exists():
        result["status"] = "SKIPPED"
        result["file"] = str(out_path)
        return result

    # 1. 画像ダウンロード
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        img_data = resp.content
    except Exception as e:
        result["status"] = f"DOWNLOAD_ERROR: {e}"
        return result

    # 2. 背景除去
    try:
        orig = Image.open(io.BytesIO(img_data)).convert("RGBA")
        removed = remove(orig, session=SESSION)   # 透明背景RGBA
    except Exception as e:
        result["status"] = f"REMBG_ERROR: {e}"
        return result

    # 3. 方向統一（長手を縦に）
    arr = np.array(removed)
    alpha = arr[:, :, 3]
    
    angle = get_principal_angle(alpha)
    # angle が -45〜45度の範囲 → ほぼ横置き → 90度回転して縦に
    # angle が 45〜135度の範囲 → ほぼ縦置き → そのまま
    # 斜めの場合は主軸を垂直に合わせる
    
    # 縦長に揃える: 主軸が水平に近ければ90度回転
    rotate_deg = 0.0
    if abs(angle) < 45:
        # 主軸が水平 → 90度回転してレンズを縦に
        rotate_deg = 90 - angle
    elif abs(angle) > 135:
        rotate_deg = -(angle + 90)
    else:
        # 主軸が垂直に近い場合でも微小補正
        rotate_deg = 90 - angle

    if abs(rotate_deg) > 1.0:
        removed = removed.rotate(-rotate_deg, expand=True, resample=Image.BICUBIC)

    # 4. クロップ（透明部分をトリム）
    bbox = removed.getbbox()
    if bbox:
        removed = removed.crop(bbox)

    # 5. リサイズ（長辺を LONG_SIDE に）
    w, h = removed.size
    if w > h:
        new_w, new_h = LONG_SIDE, int(LONG_SIDE * h / w)
    else:
        new_w, new_h = int(LONG_SIDE * w / h), LONG_SIDE
    removed = removed.resize((new_w, new_h), Image.LANCZOS)

    # 6. 保存
    removed.save(out_path, "PNG", optimize=True)
    result["status"] = "OK"
    result["file"] = str(out_path)
    result["rotated"] = round(rotate_deg, 1)
    return result


def main():
    parser = argparse.ArgumentParser(description="レンズ画像 背景除去 + 方向統一スクリプト")
    parser.add_argument("--lens-name", help="完全一致するレンズ名を1件だけ処理する")
    parser.add_argument("--use-external", action="store_true", help="image_url がない場合に image_url_external を入力元にする")
    parser.add_argument("--update-json", action="store_true", help="処理済み画像のローカルURLを lens_data.json の image_url に反映する")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(exist_ok=True)

    with open(LENS_JSON, encoding="utf-8") as f:
        db = json.load(f)

    if args.lens_name:
        lenses = [l for l in db["lenses"] if l.get("name") == args.lens_name]
        if not lenses:
            raise SystemExit(f"対象レンズが見つかりません: {args.lens_name}")
        if len(lenses) > 1:
            raise SystemExit(f"対象レンズ名が重複しています: {args.lens_name}")
        allow_external = True if args.use_external else False
    else:
        lenses = [l for l in db["lenses"] if l.get("image_url")]
        allow_external = False

    print(f"処理対象: {len(lenses)}本 (URL未設定は除外)")
    print(f"出力先: {OUTPUT_DIR.resolve()}\n")

    report = []
    ok = err = skip = 0
    t0 = time.time()

    worker_count = 1 if args.lens_name else WORKERS
    with ThreadPoolExecutor(max_workers=worker_count) as ex:
        futs = {ex.submit(process_one, l, allow_external=allow_external): l for l in lenses}
        done = 0
        for fut in as_completed(futs):
            res = fut.result()
            report.append(res)
            done += 1
            st = res["status"]
            if st == "OK":       ok += 1
            elif st == "SKIPPED": skip += 1
            else:                err += 1
            # 進捗表示
            bar = "#" * (done * 30 // len(lenses))
            print(f"\r[{bar:<30}] {done}/{len(lenses)} OK={ok} ERR={err}", end="", flush=True)

    elapsed = time.time() - t0
    print(f"\n\n完了! OK={ok} ERR={err} SKIP={skip}  ({elapsed:.0f}秒)")

    # エラー一覧
    errors = [r for r in report if r["status"] not in ("OK","SKIPPED","NO_URL")]
    if errors:
        print("\n⚠️ エラー一覧:")
        for r in errors:
            print(f"  {r['name']}: {r['status']}")

    if args.update_json:
        if not args.lens_name:
            raise SystemExit("--update-json は --lens-name と一緒に使ってください")
        if len(report) != 1 or report[0]["status"] not in ("OK", "SKIPPED"):
            raise SystemExit("画像処理が成功していないため lens_data.json は更新しません")
        update_lens_image_url(args.lens_name, report[0]["local_url"])
        print(f"lens_data.json image_url: {report[0]['local_url']}")

    # レポート保存
    rep_path = OUTPUT_DIR / "report.json"
    with open(rep_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\nレポート: {rep_path}")


if __name__ == "__main__":
    main()

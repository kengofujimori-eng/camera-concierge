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


def process_one(lens: dict) -> dict:
    name = lens.get("name", "?")
    url  = lens.get("image_url", "")
    slug = slugify(name)
    out_path = OUTPUT_DIR / f"{slug}.png"

    result = {"name": name, "url": url, "status": "", "file": ""}

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
    OUTPUT_DIR.mkdir(exist_ok=True)

    with open(LENS_JSON, encoding="utf-8") as f:
        db = json.load(f)

    lenses = [l for l in db["lenses"] if l.get("image_url")]
    print(f"処理対象: {len(lenses)}本 (URL未設定は除外)")
    print(f"出力先: {OUTPUT_DIR.resolve()}\n")

    report = []
    ok = err = skip = 0
    t0 = time.time()

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(process_one, l): l for l in lenses}
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

    # レポート保存
    rep_path = OUTPUT_DIR / "report.json"
    with open(rep_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\nレポート: {rep_path}")


if __name__ == "__main__":
    main()

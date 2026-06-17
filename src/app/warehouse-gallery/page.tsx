'use client'

/**
 * 武器庫ギャラリー（実験ページ / プロトタイプ v3）
 * ─────────────────────────────────────────────────────────────
 * 倉庫(warehouse)UIを「データ一覧」から「レンズを愛でるコレクション体験」へ
 * 刷新する方向を検証するための隔離プロトタイプ。本番倉庫・データ層・localStorage
 * とは一切接続しない。デモ用にレンズ数本をハードコードしている。
 *
 * v3 の方向: 「奥は緩やかに動き、手前は静かなガラス」
 *  - 第2版の幾何学装飾（グリッド/同心円/座標軸/コーナー目盛り/照準リング）は全撤去。
 *  - モノクロ／オニキス基調。色はブルー〜バイオレット〜マゼンタを選択アクセントに一点挿し。
 *  - 各レンズの足元にフロストグラス台座。諸元もフロストグラスのパネルで静かに出す。
 *  - 背景に淡いラジアルグローがゆっくり移ろい、選択レンズ背後のグローが呼吸する。
 *    すべて軽量 CSS @keyframes。prefers-reduced-motion で停止。
 *
 * 実装は素のCSS(styled-jsx) + transform 中心。重いライブラリは使わない。
 */

import { useCallback, useEffect, useRef, useState } from 'react'

interface DemoLens {
  name: string
  image: string
  focal: string
  aperture: string
  weight: string
  price: string
  mount: string
}

// デモ専用ハードコード（本番データには触れない）
const LENSES: DemoLens[] = [
  {
    name: 'FE 16-35mm F2.8 GM',
    image: '/lens_images_processed/FE_16-35mm_F2.8_GM.png',
    focal: '16–35mm',
    aperture: 'F2.8',
    weight: '680g',
    price: '¥245,000',
    mount: 'Sony E',
  },
  {
    name: 'FE 24-70mm F2.8 GM II',
    image: '/lens_images_processed/FE_24-70mm_F2.8_GM_II.png',
    focal: '24–70mm',
    aperture: 'F2.8',
    weight: '695g',
    price: '¥258,000',
    mount: 'Sony E',
  },
  {
    name: 'FE 35mm F1.4 GM',
    image: '/lens_images_processed/FE_35mm_F1.4_GM.png',
    focal: '35mm',
    aperture: 'F1.4',
    weight: '524g',
    price: '¥219,000',
    mount: 'Sony E',
  },
  {
    name: 'FE 50mm F1.4 GM',
    image: '/lens_images_processed/FE_50mm_F1.4_GM.png',
    focal: '50mm',
    aperture: 'F1.4',
    weight: '516g',
    price: '¥198,000',
    mount: 'Sony E',
  },
  {
    name: 'FE 85mm F1.4 GM II',
    image: '/lens_images_processed/FE_85mm_F1.4_GM_II.png',
    focal: '85mm',
    aperture: 'F1.4',
    weight: '642g',
    price: '¥285,000',
    mount: 'Sony E',
  },
]

export default function WarehouseGalleryPage() {
  const [active, setActive] = useState(2)
  const [open, setOpen] = useState(false)

  const clamp = (i: number) => Math.min(LENSES.length - 1, Math.max(0, i))
  const go = useCallback((dir: number) => {
    setActive((i) => {
      const next = clamp(i + dir)
      if (next !== i) setOpen(false)
      return next
    })
  }, [])

  // 任意のレンズを中央へ。既に中央ならパネル開閉。
  const selectLens = useCallback((idx: number) => {
    setActive((cur) => {
      if (idx === cur) {
        setOpen((o) => !o)
        return cur
      }
      setOpen(false)
      return idx
    })
  }, [])

  // キーボード操作（補助）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // ホイールで横移動（補助・連続発火を間引く）
  const wheelLock = useRef(0)
  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now()
    if (now - wheelLock.current < 320) return
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(d) < 6) return
    wheelLock.current = now
    go(d > 0 ? 1 : -1)
  }

  // ドラッグ / スワイプで横移動（主にタッチ）
  const drag = useRef({ down: false, startX: 0, moved: 0 })
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { down: true, startX: e.clientX, moved: 0 }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return
    drag.current.moved = e.clientX - drag.current.startX
  }
  const endDrag = () => {
    if (!drag.current.down) return
    const m = drag.current.moved
    drag.current.down = false
    if (m > 55) go(-1)
    else if (m < -55) go(1)
  }

  const onLensClick = (idx: number) => {
    if (Math.abs(drag.current.moved) > 10) return
    selectLens(idx)
  }

  const current = LENSES[active]

  return (
    <main className="rack-root">
      {/* ── 背景: 奥で緩やかに移ろう淡いグロー ── */}
      <div className="ambient" aria-hidden>
        <span className="orb orb-a" />
        <span className="orb orb-b" />
      </div>

      {/* ── 横移動するラック ── */}
      <section
        className="stage"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="rack">
          {LENSES.map((lens, idx) => {
            const offset = idx - active
            const abs = Math.abs(offset)
            const isActive = idx === active
            const visible = abs <= 2
            const style: React.CSSProperties = {
              transform: `translateX(${offset * 230}px) translateZ(${-abs * 140}px) rotateY(${offset * -7}deg) scale(${1 - abs * 0.16})`,
              opacity: visible ? 1 - abs * 0.26 : 0,
              zIndex: 100 - abs,
              filter: `brightness(${1 - abs * 0.3})`,
              pointerEvents: visible ? 'auto' : 'none',
            }
            return (
              <div
                key={lens.name}
                className={`slot${isActive ? ' is-active' : ''}`}
                style={style}
                onClick={() => onLensClick(idx)}
              >
                {/* 選択レンズ背後の呼吸するグロー */}
                <div className="halo" />
                <div className="lens-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lens.image} alt={lens.name} className="lens-img" draggable={false} />
                </div>
                {/* フロストグラスの台座 */}
                <div className="pedestal">
                  <span className="sheen" />
                </div>
                {isActive && <span className="lens-label">{lens.name}</span>}
              </div>
            )
          })}
        </div>

        {/* 隅に極小カウンター（低コントラスト） */}
        <div className="counter">
          {String(active + 1).padStart(2, '0')}<span>/</span>{String(LENSES.length).padStart(2, '0')}
        </div>
      </section>

      {/* ── 情報パネル（フロストグラス・中央クリックで静かに出る） ── */}
      <div className={`info-panel${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="info-inner">
          <div className="info-title">
            <span className="info-mount">{current.mount}</span>
            <h2>{current.name}</h2>
          </div>
          <dl className="specs">
            <div><dt>焦点距離</dt><dd>{current.focal}</dd></div>
            <div><dt>開放F値</dt><dd>{current.aperture}</dd></div>
            <div><dt>重量</dt><dd>{current.weight}</dd></div>
            <div><dt>参考価格</dt><dd>{current.price}</dd></div>
          </dl>
          <button className="info-close" onClick={() => setOpen(false)} aria-label="閉じる">閉じる</button>
        </div>
      </div>

      <style jsx>{`
        .rack-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          /* モノクロ／オニキス基調。完全な黒は避け、ごく淡い陰影だけ */
          background:
            radial-gradient(130% 90% at 50% 38%, #16161b 0%, #101014 55%, #0b0b0d 100%);
          color: #e8e8ee;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          user-select: none;
        }

        /* ── 背景アンビエント: ごく淡い色グローがゆっくり移ろう ── */
        .ambient {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.5;
          will-change: transform, opacity;
        }
        .orb-a {
          width: 46vw;
          height: 46vw;
          left: 18%;
          top: 22%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.30), transparent 68%);
          animation: drift-a 26s ease-in-out infinite;
        }
        .orb-b {
          width: 40vw;
          height: 40vw;
          right: 16%;
          top: 34%;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.26), transparent 68%);
          animation: drift-b 32s ease-in-out infinite;
        }
        @keyframes drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50%      { transform: translate(8vw, 5vh) scale(1.12); opacity: 0.6; }
        }
        @keyframes drift-b {
          0%, 100% { transform: translate(0, 0) scale(1.05); opacity: 0.34; }
          50%      { transform: translate(-7vw, -4vh) scale(0.95); opacity: 0.5; }
        }

        /* ── ラック ── */
        .stage {
          position: relative;
          z-index: 5;
          height: 100vh;
          min-height: 520px;
          perspective: 1600px;
          touch-action: pan-y;
          cursor: grab;
        }
        .stage:active { cursor: grabbing; }

        .rack {
          position: absolute;
          inset: 0;
          top: -4%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
        }

        .slot {
          position: absolute;
          width: 200px;
          height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          transition:
            transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
            opacity 0.6s ease,
            filter 0.6s ease;
          cursor: pointer;
          will-change: transform, opacity;
        }

        .lens-img-wrap {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          padding-bottom: 4px;
        }
        .lens-img {
          max-height: 312px;
          max-width: 178px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 16px 24px rgba(0, 0, 0, 0.72)) contrast(1.04);
          transition: filter 0.5s ease;
        }
        .slot.is-active .lens-img {
          filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.8))
            drop-shadow(0 0 24px rgba(124, 92, 220, 0.18)) contrast(1.05);
        }

        /* 選択レンズ背後の呼吸するグロー（一点挿し色） */
        .halo {
          position: absolute;
          z-index: 1;
          top: 38%;
          left: 50%;
          width: 260px;
          height: 260px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(124, 58, 237, 0.26) 0%,
            rgba(37, 99, 235, 0.12) 42%,
            transparent 70%
          );
          filter: blur(14px);
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
        }
        .slot.is-active .halo {
          opacity: 1;
          animation: breathe 6s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.96); }
          50%      { opacity: 1;   transform: translate(-50%, -50%) scale(1.06); }
        }

        /* ── フロストグラス台座 ── */
        .pedestal {
          position: relative;
          z-index: 2;
          width: 168px;
          height: 26px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px) saturate(1.1);
          -webkit-backdrop-filter: blur(10px) saturate(1.1);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.14),
            0 8px 22px rgba(0, 0, 0, 0.5);
          transition: width 0.6s ease, background 0.6s ease, box-shadow 0.6s ease;
        }
        .slot.is-active .pedestal {
          width: 210px;
          background: rgba(140, 130, 200, 0.09);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.18),
            0 10px 28px rgba(0, 0, 0, 0.55),
            0 0 26px rgba(124, 58, 237, 0.12);
        }
        /* 台座を時折横切るかすかなハイライト */
        .sheen {
          position: absolute;
          top: 0;
          left: -40%;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(255, 255, 255, 0.16),
            transparent
          );
          transform: skewX(-18deg);
        }
        .slot.is-active .sheen {
          animation: sweep 7s ease-in-out infinite;
        }
        @keyframes sweep {
          0%   { left: -40%; }
          22%  { left: 120%; }
          100% { left: 120%; }
        }

        .lens-label {
          position: relative;
          z-index: 3;
          margin-top: 18px;
          font-size: 12px;
          letter-spacing: 0.12em;
          color: #c5c9d2;
          text-align: center;
          white-space: nowrap;
          opacity: 0.82;
        }

        .counter {
          position: absolute;
          right: 22px;
          bottom: 18px;
          z-index: 8;
          font-size: 10.5px;
          letter-spacing: 0.22em;
          color: rgba(255, 255, 255, 0.2);
          font-variant-numeric: tabular-nums;
        }
        .counter span { margin: 0 4px; }

        /* ── 情報パネル（フロストグラス） ── */
        .info-panel {
          position: fixed;
          left: 50%;
          bottom: 0;
          transform: translate(-50%, 110%);
          z-index: 40;
          width: min(680px, 92vw);
          opacity: 0;
          transition: transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.55s ease;
          pointer-events: none;
        }
        .info-panel.open {
          transform: translate(-50%, -28px);
          opacity: 1;
          pointer-events: auto;
        }
        .info-inner {
          position: relative;
          border-radius: 16px;
          padding: 22px 26px 24px;
          background: rgba(22, 22, 27, 0.55);
          backdrop-filter: blur(22px) saturate(1.2);
          -webkit-backdrop-filter: blur(22px) saturate(1.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.1),
            0 24px 64px rgba(0, 0, 0, 0.6);
        }
        .info-title {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .info-mount {
          font-size: 10.5px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #b9a6ee;
          border: 1px solid rgba(168, 85, 247, 0.32);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .info-title h2 {
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #f3f5f8;
        }
        .specs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .specs > div {
          border-left: 1px solid rgba(255, 255, 255, 0.12);
          padding-left: 12px;
        }
        .specs dt {
          font-size: 10.5px;
          letter-spacing: 0.14em;
          color: #8b8b96;
          margin-bottom: 6px;
        }
        .specs dd {
          font-size: 18px;
          font-weight: 300;
          color: #eef2f6;
          letter-spacing: 0.02em;
        }
        .info-close {
          position: absolute;
          top: 16px;
          right: 18px;
          background: none;
          border: none;
          color: #8a8a96;
          font-size: 12px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .info-close:hover { color: #e8e8ee; }

        @media (max-width: 720px) {
          .slot { width: 150px; }
          .lens-img { max-width: 130px; max-height: 240px; }
          .pedestal { width: 128px; }
          .slot.is-active .pedestal { width: 160px; }
          .specs { grid-template-columns: repeat(2, 1fr); }
        }

        /* 動きを抑える設定では背景・呼吸・反射を停止 */
        @media (prefers-reduced-motion: reduce) {
          .orb-a, .orb-b,
          .slot.is-active .halo,
          .slot.is-active .sheen {
            animation: none;
          }
        }
      `}</style>
    </main>
  )
}

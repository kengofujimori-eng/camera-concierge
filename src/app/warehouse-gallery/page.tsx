'use client'

/**
 * 武器庫ギャラリー（実験ページ / プロトタイプ）
 * ─────────────────────────────────────────────────────────────
 * 倉庫(warehouse)UIを「データ一覧」から「レンズを愛でるコレクション体験」へ
 * 刷新する方向を検証するための隔離プロトタイプ。本番倉庫・データ層・localStorage
 * とは一切接続しない。デモ用にレンズ数本をハードコードしている。
 *
 * 世界観: マトリックスの仮想武器庫。近未来・ミニマル・高級感。
 * オニキス基調の深い黒に、レンズが水平一列で整列し、中央が最前面で明るい。
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
  const [hovered, setHovered] = useState<number | null>(null)

  const clamp = (i: number) => Math.min(LENSES.length - 1, Math.max(0, i))
  const go = useCallback((dir: number) => {
    setActive((i) => {
      const next = clamp(i + dir)
      if (next !== i) setOpen(false) // 別のレンズへ移ったらパネルは閉じる
      return next
    })
  }, [])

  // キーボード操作（左右で移動・Escでパネル閉じ）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // ホイールで横スライド（連続発火を間引く）
  const wheelLock = useRef(0)
  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now()
    if (now - wheelLock.current < 320) return
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(d) < 6) return
    wheelLock.current = now
    go(d > 0 ? 1 : -1)
  }

  // ドラッグで横スライド
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
    if (m > 60) go(-1)
    else if (m < -60) go(1)
  }

  // レンズクリック: 中央でなければ寄せる / 中央ならパネル開閉（ドラッグ後は無視）
  const onLensClick = (idx: number) => {
    if (Math.abs(drag.current.moved) > 10) return
    if (idx !== active) {
      setOpen(false)
      setActive(idx)
    } else {
      setOpen((o) => !o)
    }
  }

  const current = LENSES[active]

  return (
    <main className="rack-root">
      {/* ヘッダー: HUD的な見出し */}
      <header className="hud-head">
        <span className="eyebrow">ARMORY · PROTOTYPE</span>
        <h1>武器庫</h1>
        <p className="sub">所有レンズを呼び出し、整列させる。クリックで諸元を展開。</p>
      </header>

      {/* 横スライドするラック */}
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
            const lift = hovered === idx && visible ? -16 : 0
            const style: React.CSSProperties = {
              transform: `translateX(${offset * 230}px) translateZ(${-abs * 140}px) translateY(${lift}px) rotateY(${offset * -7}deg) scale(${1 - abs * 0.16})`,
              opacity: visible ? 1 - abs * 0.26 : 0,
              zIndex: 100 - abs,
              filter: `brightness(${1 - abs * 0.3})`,
              pointerEvents: visible ? 'auto' : 'none',
            }
            return (
              <div
                key={lens.name}
                className={`slot${isActive ? ' is-active' : ''}${hovered === idx ? ' is-hover' : ''}`}
                style={style}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered((h) => (h === idx ? null : h))}
                onClick={() => onLensClick(idx)}
              >
                {/* 足元の間接照明グロー */}
                <div className="floor-glow" />
                {/* 選択時のHUD枠 */}
                <div className="hud-frame">
                  <span className="tick tl" />
                  <span className="tick tr" />
                  <span className="tick bl" />
                  <span className="tick br" />
                </div>
                <div className="lens-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lens.image} alt={lens.name} className="lens-img" draggable={false} />
                </div>
                <span className="lens-label">{lens.name}</span>
              </div>
            )
          })}
        </div>

        {/* ナビ矢印 */}
        <button className="nav prev" onClick={() => go(-1)} disabled={active === 0} aria-label="前へ">
          ‹
        </button>
        <button
          className="nav next"
          onClick={() => go(1)}
          disabled={active === LENSES.length - 1}
          aria-label="次へ"
        >
          ›
        </button>

        {/* インデックス */}
        <div className="counter">
          <span className="cur">{String(active + 1).padStart(2, '0')}</span>
          <span className="sep">/</span>
          <span className="tot">{String(LENSES.length).padStart(2, '0')}</span>
        </div>
      </section>

      {/* レンズ情報パネル（HUD的にせり上がる） */}
      <div className={`info-panel${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="info-inner">
          <div className="info-title">
            <span className="info-mount">{current.mount}</span>
            <h2>{current.name}</h2>
          </div>
          <dl className="specs">
            <div>
              <dt>焦点距離</dt>
              <dd>{current.focal}</dd>
            </div>
            <div>
              <dt>開放F値</dt>
              <dd>{current.aperture}</dd>
            </div>
            <div>
              <dt>重量</dt>
              <dd>{current.weight}</dd>
            </div>
            <div>
              <dt>参考価格</dt>
              <dd>{current.price}</dd>
            </div>
          </dl>
          <button className="info-close" onClick={() => setOpen(false)} aria-label="閉じる">
            閉じる
          </button>
        </div>
      </div>

      <footer className="hint">
        {open ? '' : 'ドラッグ / ホイール / ← → で移動 ・ 中央のレンズをクリックで諸元'}
      </footer>

      <style jsx>{`
        .rack-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          background:
            radial-gradient(120% 80% at 50% 18%, #17171c 0%, #0e0e11 55%, #0b0b0d 100%);
          color: #e8e8ee;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          user-select: none;
        }
        /* 微かなビネットで中央へ視線を集める */
        .rack-root::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(110% 70% at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
        }

        .hud-head {
          position: relative;
          z-index: 5;
          text-align: center;
          padding: 48px 24px 0;
        }
        .eyebrow {
          font-size: 11px;
          letter-spacing: 0.42em;
          color: #6fd3e6;
          opacity: 0.7;
          text-transform: uppercase;
        }
        .hud-head h1 {
          margin: 10px 0 6px;
          font-size: 30px;
          font-weight: 300;
          letter-spacing: 0.5em;
          padding-left: 0.5em;
          color: #f4f4f8;
        }
        .sub {
          font-size: 12.5px;
          color: #8a8a96;
          letter-spacing: 0.05em;
        }

        .stage {
          position: relative;
          height: 66vh;
          min-height: 440px;
          perspective: 1600px;
          touch-action: pan-y;
          cursor: grab;
        }
        .stage:active {
          cursor: grabbing;
        }

        .rack {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
        }

        .slot {
          position: absolute;
          width: 200px;
          height: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          transition:
            transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1),
            opacity 0.55s ease,
            filter 0.55s ease;
          cursor: pointer;
          will-change: transform, opacity;
        }

        .lens-img-wrap {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .lens-img {
          max-height: 320px;
          max-width: 180px;
          width: auto;
          height: auto;
          object-fit: contain;
          /* 暗背景で輪郭を馴染ませる控えめなドロップシャドウ */
          filter: drop-shadow(0 18px 26px rgba(0, 0, 0, 0.7)) contrast(1.04);
          transition: filter 0.4s ease;
        }
        .slot.is-active .lens-img {
          filter: drop-shadow(0 22px 34px rgba(0, 0, 0, 0.8))
            drop-shadow(0 0 26px rgba(150, 210, 235, 0.18)) contrast(1.06);
        }
        .slot.is-hover .lens-img {
          filter: drop-shadow(0 26px 34px rgba(0, 0, 0, 0.8))
            drop-shadow(0 0 30px rgba(150, 210, 235, 0.28)) contrast(1.06);
        }

        /* 足元の間接照明（ソフトな光だまり） */
        .floor-glow {
          position: absolute;
          bottom: 18px;
          left: 50%;
          width: 190px;
          height: 54px;
          transform: translateX(-50%);
          background: radial-gradient(
            ellipse at center,
            rgba(150, 205, 232, 0.22) 0%,
            rgba(120, 180, 210, 0.08) 40%,
            transparent 72%
          );
          filter: blur(3px);
          opacity: 0.5;
          transition: opacity 0.5s ease, width 0.5s ease;
          pointer-events: none;
        }
        .slot.is-active .floor-glow {
          opacity: 1;
          width: 230px;
        }

        /* 選択時のHUD枠（細いライン + コーナーティック） */
        .hud-frame {
          position: absolute;
          inset: 6px 2px 70px;
          border: 1px solid rgba(150, 210, 235, 0.28);
          opacity: 0;
          transform: scale(0.97);
          transition: opacity 0.45s ease, transform 0.45s ease;
          pointer-events: none;
        }
        .slot.is-active .hud-frame {
          opacity: 1;
          transform: scale(1);
        }
        .tick {
          position: absolute;
          width: 12px;
          height: 12px;
          border: 1px solid rgba(170, 225, 245, 0.85);
        }
        .tick.tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .tick.tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
        .tick.bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
        .tick.br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

        .lens-label {
          margin-top: 14px;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #9a9aa6;
          text-align: center;
          white-space: nowrap;
          transition: color 0.4s ease, opacity 0.4s ease;
          opacity: 0.7;
        }
        .slot.is-active .lens-label {
          color: #eef2f6;
          opacity: 1;
        }

        .nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid rgba(180, 220, 240, 0.2);
          background: rgba(20, 20, 24, 0.55);
          backdrop-filter: blur(6px);
          color: #cfd6dd;
          font-size: 26px;
          line-height: 1;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .nav:hover:not(:disabled) {
          border-color: rgba(170, 225, 245, 0.6);
          color: #fff;
          box-shadow: 0 0 18px rgba(150, 210, 235, 0.25);
        }
        .nav:disabled {
          opacity: 0.18;
          cursor: default;
        }
        .nav.prev { left: 6%; }
        .nav.next { right: 6%; }

        .counter {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          font-size: 13px;
          letter-spacing: 0.2em;
          color: #76808a;
        }
        .counter .cur { color: #dfe6ec; }
        .counter .sep { margin: 0 6px; opacity: 0.5; }

        /* 情報パネル: 下からせり上がる */
        .info-panel {
          position: fixed;
          left: 50%;
          bottom: 0;
          transform: translate(-50%, 110%);
          z-index: 40;
          width: min(680px, 92vw);
          opacity: 0;
          transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.5s ease;
          pointer-events: none;
        }
        .info-panel.open {
          transform: translate(-50%, -28px);
          opacity: 1;
          pointer-events: auto;
        }
        .info-inner {
          position: relative;
          border: 1px solid rgba(160, 215, 238, 0.22);
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(22, 23, 28, 0.92), rgba(13, 13, 16, 0.94));
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(120, 180, 210, 0.06);
          padding: 22px 26px 24px;
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
          color: #6fd3e6;
          border: 1px solid rgba(111, 211, 230, 0.3);
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
          border-left: 1px solid rgba(160, 215, 238, 0.18);
          padding-left: 12px;
        }
        .specs dt {
          font-size: 10.5px;
          letter-spacing: 0.14em;
          color: #7d7d89;
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

        .hint {
          position: fixed;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          font-size: 11.5px;
          letter-spacing: 0.1em;
          color: #5d6168;
          text-align: center;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        @media (max-width: 720px) {
          .hud-head h1 { font-size: 24px; }
          .slot { width: 150px; }
          .lens-img { max-width: 130px; max-height: 240px; }
          .specs { grid-template-columns: repeat(2, 1fr); }
          .nav.prev { left: 2%; }
          .nav.next { right: 2%; }
        }
      `}</style>
    </main>
  )
}

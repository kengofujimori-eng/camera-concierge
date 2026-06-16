'use client'

/**
 * 武器庫ギャラリー（実験ページ / プロトタイプ v2）
 * ─────────────────────────────────────────────────────────────
 * 倉庫(warehouse)UIを「データ一覧」から「レンズを愛でるコレクション体験」へ
 * 刷新する方向を検証するための隔離プロトタイプ。本番倉庫・データ層・localStorage
 * とは一切接続しない。デモ用にレンズ数本をハードコードしている。
 *
 * v2 のフィードバック反映:
 *  - 操作は「直接クリック」中心: 脇のレンズを押すと中央へ回り込む。中央クリックで諸元。
 *  - 選択時に AI 的グラデ細線(ブルー〜バイオレット〜マゼンタ)のグローが縁取る。
 *  - 文字を大幅削減（見出し/説明を撤去、レンズ名と諸元だけ）。
 *  - 世界観を「幾何学グラフィック」方向へ: 薄いグリッド・同心レティクル・設計図的目盛り。
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
  const [hovered, setHovered] = useState<number | null>(null)
  // 選択の瞬間にグラデ細線グローを走らせるためのトリガ（キーで再アニメ）
  const [pulse, setPulse] = useState(0)

  const clamp = (i: number) => Math.min(LENSES.length - 1, Math.max(0, i))
  const go = useCallback((dir: number) => {
    setActive((i) => {
      const next = clamp(i + dir)
      if (next !== i) {
        setOpen(false)
        setPulse((p) => p + 1)
      }
      return next
    })
  }, [])

  // 任意のレンズを中央へ。既に中央ならパネル開閉。
  const selectLens = useCallback(
    (idx: number) => {
      setActive((cur) => {
        if (idx === cur) {
          setOpen((o) => !o)
          return cur
        }
        setOpen(false)
        setPulse((p) => p + 1)
        return idx
      })
    },
    [],
  )

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

  // ホイールで横回転（補助・連続発火を間引く）
  const wheelLock = useRef(0)
  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now()
    if (now - wheelLock.current < 320) return
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(d) < 6) return
    wheelLock.current = now
    go(d > 0 ? 1 : -1)
  }

  // ドラッグ / スワイプでロータリー回転（主にタッチ）
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

  // レンズクリック（ドラッグと区別）
  const onLensClick = (idx: number) => {
    if (Math.abs(drag.current.moved) > 10) return
    selectLens(idx)
  }

  const current = LENSES[active]

  return (
    <main className="rack-root">
      {/* ── 幾何学グラフィック層（背景・低コントラスト・細線） ── */}
      <div className="geo" aria-hidden>
        <div className="grid" />
        <div className="scan-x" />
        <div className="scan-y" />
        {/* 中央フォーカスの同心レティクル */}
        <div className={`reticle${open ? ' is-open' : ''}`} key={pulse}>
          <span className="ring r1" />
          <span className="ring r2" />
          <span className="ring r3" />
          <span className="cross cx" />
          <span className="cross cy" />
        </div>
        {/* コーナーの設計図的目盛り */}
        <div className="corner tl"><span /><span /><i /></div>
        <div className="corner tr"><span /><span /><i /></div>
        <div className="corner bl"><span /><span /><i /></div>
        <div className="corner br"><span /><span /><i /></div>
      </div>

      {/* ── 横回転するラック ── */}
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
                <div className="floor-glow" />
                {/* 選択時: グラデ細線の縁取り（走るグロー） */}
                <div className="sel-frame" key={isActive ? pulse : 'idle'}>
                  <span className="tick tl" />
                  <span className="tick tr" />
                  <span className="tick bl" />
                  <span className="tick br" />
                </div>
                <div className="lens-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lens.image} alt={lens.name} className="lens-img" draggable={false} />
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

      {/* ── 情報パネル（中央クリックでせり上がる） ── */}
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
          /* 完全な真っ黒を避け、ごく淡いラジアル+斜めグラデで黒の面積を減らす */
          background:
            radial-gradient(125% 85% at 50% 42%, #18181e 0%, #101015 52%, #0b0b0d 100%),
            linear-gradient(135deg, #0c0c10 0%, #0b0b0d 60%);
          color: #e8e8ee;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          user-select: none;
        }
        .rack-root::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(115% 75% at 50% 50%, transparent 58%, rgba(0, 0, 0, 0.5) 100%);
          z-index: 6;
        }

        /* ── 幾何学グラフィック層 ── */
        .geo {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        /* 薄いグリッド（細線・低コントラスト） */
        .grid {
          position: absolute;
          inset: -2px;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 44px 44px;
          /* 中央を明るく、周縁でグリッドをフェードして主役を邪魔しない */
          -webkit-mask-image: radial-gradient(80% 70% at 50% 46%, #000 0%, transparent 88%);
          mask-image: radial-gradient(80% 70% at 50% 46%, #000 0%, transparent 88%);
        }
        /* 中央を通る設計図的な座標軸 */
        .scan-x {
          position: absolute;
          left: 0;
          right: 0;
          top: 46%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124, 110, 245, 0.14) 30%, rgba(124, 110, 245, 0.14) 70%, transparent);
        }
        .scan-y {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(124, 110, 245, 0.12) 30%, rgba(124, 110, 245, 0.12) 70%, transparent);
        }

        /* 中央フォーカスの同心レティクル */
        .reticle {
          position: absolute;
          top: 46%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 520px;
          height: 520px;
        }
        .ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ring.r1 { width: 300px; height: 300px; border-color: rgba(150, 210, 235, 0.10); }
        .ring.r2 { width: 420px; height: 420px; }
        .ring.r3 {
          width: 520px; height: 520px;
          border-style: dashed;
          border-color: rgba(255, 255, 255, 0.045);
          animation: spin 60s linear infinite;
        }
        @keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
        .cross {
          position: absolute;
          top: 50%;
          left: 50%;
          background: rgba(150, 210, 235, 0.10);
        }
        .cross.cx { transform: translate(-50%, -50%); width: 540px; height: 1px; }
        .cross.cy { transform: translate(-50%, -50%); width: 1px; height: 540px; }
        .reticle.is-open .ring.r1 { border-color: rgba(168, 85, 247, 0.22); }

        /* コーナーの設計図的目盛り */
        .corner {
          position: absolute;
          width: 72px;
          height: 72px;
          opacity: 0.5;
        }
        .corner span {
          position: absolute;
          background: rgba(255, 255, 255, 0.14);
        }
        .corner span:first-child { width: 36px; height: 1px; }
        .corner span:nth-child(2) { width: 1px; height: 36px; }
        .corner i {
          position: absolute;
          width: 5px; height: 5px;
          border: 1px solid rgba(150, 210, 235, 0.4);
        }
        .corner.tl { top: 26px; left: 26px; }
        .corner.tl span:first-child { top: 0; left: 0; }
        .corner.tl span:nth-child(2) { top: 0; left: 0; }
        .corner.tl i { top: -2px; left: -2px; }
        .corner.tr { top: 26px; right: 26px; }
        .corner.tr span:first-child { top: 0; right: 0; }
        .corner.tr span:nth-child(2) { top: 0; right: 0; }
        .corner.tr i { top: -2px; right: -2px; }
        .corner.bl { bottom: 26px; left: 26px; }
        .corner.bl span:first-child { bottom: 0; left: 0; }
        .corner.bl span:nth-child(2) { bottom: 0; left: 0; }
        .corner.bl i { bottom: -2px; left: -2px; }
        .corner.br { bottom: 26px; right: 26px; }
        .corner.br span:first-child { bottom: 0; right: 0; }
        .corner.br span:nth-child(2) { bottom: 0; right: 0; }
        .corner.br i { bottom: -2px; right: -2px; }

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
          filter: drop-shadow(0 18px 26px rgba(0, 0, 0, 0.7)) contrast(1.04);
          transition: filter 0.4s ease;
        }
        .slot.is-active .lens-img {
          filter: drop-shadow(0 22px 34px rgba(0, 0, 0, 0.8))
            drop-shadow(0 0 26px rgba(150, 210, 235, 0.16)) contrast(1.06);
        }
        .slot.is-hover .lens-img {
          filter: drop-shadow(0 26px 34px rgba(0, 0, 0, 0.8))
            drop-shadow(0 0 30px rgba(150, 210, 235, 0.26)) contrast(1.06);
        }

        .floor-glow {
          position: absolute;
          bottom: 18px;
          left: 50%;
          width: 190px;
          height: 54px;
          transform: translateX(-50%);
          background: radial-gradient(
            ellipse at center,
            rgba(150, 205, 232, 0.20) 0%,
            rgba(120, 180, 210, 0.07) 40%,
            transparent 72%
          );
          filter: blur(3px);
          opacity: 0.5;
          transition: opacity 0.5s ease, width 0.5s ease;
          pointer-events: none;
        }
        .slot.is-active .floor-glow { opacity: 1; width: 230px; }

        /* ── 選択時グラデ細線フレーム（ブルー→バイオレット→マゼンタ） ── */
        .sel-frame {
          position: absolute;
          inset: 6px 6px 56px;
          opacity: 0;
          pointer-events: none;
          border-radius: 3px;
          padding: 1px; /* 細線の太さ */
          background:
            linear-gradient(135deg, #2563eb, #7c3aed 50%, #d946ef) border-box;
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
        }
        .slot.is-active .sel-frame {
          /* 選択の瞬間に走り、その後うっすら定常表示 */
          animation: sel-run 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        @keyframes sel-run {
          0%   { opacity: 0; clip-path: inset(0 100% 0 0); filter: drop-shadow(0 0 6px rgba(124, 58, 237, 0.7)); }
          55%  { opacity: 1; clip-path: inset(0 0 0 0); filter: drop-shadow(0 0 12px rgba(217, 70, 239, 0.7)); }
          100% { opacity: 0.55; clip-path: inset(0 0 0 0); filter: drop-shadow(0 0 5px rgba(124, 58, 237, 0.35)); }
        }
        /* 繊細なコーナーティック（グラデ色） */
        .tick {
          position: absolute;
          width: 9px;
          height: 9px;
          opacity: 0;
        }
        .slot.is-active .tick { opacity: 0.9; transition: opacity 0.5s ease 0.2s; }
        .tick.tl { top: 2px;  left: 2px;  border-top: 1px solid #5b8def; border-left: 1px solid #5b8def; }
        .tick.tr { top: 2px;  right: 2px; border-top: 1px solid #9b5cf0; border-right: 1px solid #9b5cf0; }
        .tick.bl { bottom: 56px; left: 2px;  border-bottom: 1px solid #b65bf0; border-left: 1px solid #b65bf0; }
        .tick.br { bottom: 56px; right: 2px; border-bottom: 1px solid #d946ef; border-right: 1px solid #d946ef; }

        .lens-label {
          margin-top: 16px;
          font-size: 12px;
          letter-spacing: 0.1em;
          color: #c5c9d2;
          text-align: center;
          white-space: nowrap;
          opacity: 0.85;
        }

        .counter {
          position: absolute;
          right: 22px;
          bottom: 18px;
          z-index: 8;
          font-size: 10.5px;
          letter-spacing: 0.22em;
          color: rgba(255, 255, 255, 0.22);
          font-variant-numeric: tabular-nums;
        }
        .counter span { margin: 0 4px; }

        /* ── 情報パネル ── */
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
          border-radius: 14px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.5), rgba(124, 58, 237, 0.45) 50%, rgba(217, 70, 239, 0.5));
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(124, 58, 237, 0.1);
        }
        .info-inner > * { position: relative; z-index: 1; }
        .info-inner::before {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 13px;
          background: linear-gradient(180deg, rgba(20, 21, 26, 0.95), rgba(12, 12, 15, 0.96));
          backdrop-filter: blur(14px);
          z-index: 0;
        }
        .info-title {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          padding: 22px 26px 0;
          margin-bottom: 18px;
        }
        .info-mount {
          font-size: 10.5px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #c4a4f7;
          border: 1px solid rgba(168, 85, 247, 0.35);
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
          padding: 0 26px 24px;
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
          z-index: 2;
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
          .specs { grid-template-columns: repeat(2, 1fr); }
          .reticle { width: 360px; height: 360px; }
          .ring.r3, .ring.r2 { width: 360px; height: 360px; }
        }
      `}</style>
    </main>
  )
}

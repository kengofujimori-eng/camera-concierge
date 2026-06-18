'use client'

/**
 * 武器庫ギャラリー（実験ページ / プロトタイプ v4）
 * ─────────────────────────────────────────────────────────────
 * 倉庫(warehouse)UIを「データ一覧」から「レンズを愛でるコレクション体験」へ
 * 刷新する方向を検証するための隔離プロトタイプ。本番倉庫・データ層・localStorage
 * とは一切接続しない。デモ用にレンズ数本をハードコードしている。
 *
 * v4 の骨格: カバーフロー(中央フォーカス遠近)を廃止し、
 *  「横一列に並ぶ対等なフロストグラスカード」へ刷新（Apple/Air × Sigma 製品一覧）。
 *  - 全カードがほぼ対等な大きさで横並び。横スクロール(ホイール/ドラッグ/スワイプ)。
 *  - 通常は画像＋レンズ名のみ。クリックでそのカードが拡大し諸元が展開。
 *  - モノクロ/オニキス基調。色は選択アクセントに一点挿し（ブルー〜バイオレット〜マゼンタ）。
 *  - 背景の淡いグローがゆっくり移ろう（第3版より知覚できる程度）。reduced-motionで停止。
 *  - 幾何学装飾は入れない。
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
  { name: 'FE 14mm F1.8 GM',        image: '/lens_images_processed/FE_14mm_F1.8_GM.png',        focal: '14mm',    aperture: 'F1.8', weight: '460g', price: '¥198,000', mount: 'Sony E' },
  { name: 'FE 16-35mm F2.8 GM',     image: '/lens_images_processed/FE_16-35mm_F2.8_GM.png',     focal: '16–35mm', aperture: 'F2.8', weight: '680g', price: '¥245,000', mount: 'Sony E' },
  { name: 'FE 24mm F1.4 GM',        image: '/lens_images_processed/FE_24mm_F1.4_GM.png',        focal: '24mm',    aperture: 'F1.4', weight: '445g', price: '¥168,000', mount: 'Sony E' },
  { name: 'FE 24-70mm F2.8 GM II',  image: '/lens_images_processed/FE_24-70mm_F2.8_GM_II.png',  focal: '24–70mm', aperture: 'F2.8', weight: '695g', price: '¥258,000', mount: 'Sony E' },
  { name: 'FE 35mm F1.4 GM',        image: '/lens_images_processed/FE_35mm_F1.4_GM.png',        focal: '35mm',    aperture: 'F1.4', weight: '524g', price: '¥219,000', mount: 'Sony E' },
  { name: 'FE 50mm F1.2 GM',        image: '/lens_images_processed/FE_50mm_F1.2_GM.png',        focal: '50mm',    aperture: 'F1.2', weight: '778g', price: '¥298,000', mount: 'Sony E' },
  { name: 'FE 85mm F1.4 GM II',     image: '/lens_images_processed/FE_85mm_F1.4_GM_II.png',     focal: '85mm',    aperture: 'F1.4', weight: '642g', price: '¥285,000', mount: 'Sony E' },
  { name: 'FE 135mm F1.8 GM',       image: '/lens_images_processed/FE_135mm_F1.8_GM.png',       focal: '135mm',   aperture: 'F1.8', weight: '950g', price: '¥235,000', mount: 'Sony E' },
]

export default function WarehouseGalleryPage() {
  const [selected, setSelected] = useState<number | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const toggle = useCallback((idx: number) => {
    setSelected((cur) => (cur === idx ? null : idx))
  }, [])

  // Escで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 縦ホイールを横スクロールへ変換（トラックパッドの横スワイプはそのまま効く）
  const onWheel = (e: React.WheelEvent) => {
    const el = scrollerRef.current
    if (!el) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY
    }
  }

  // ポインタドラッグで横スクロール
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: 0 })
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollerRef.current
    if (!el) return
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: 0 }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollerRef.current
    if (!el || !drag.current.down) return
    const dx = e.clientX - drag.current.startX
    drag.current.moved = dx
    el.scrollLeft = drag.current.startLeft - dx
  }
  const endDrag = () => {
    drag.current.down = false
  }

  // ドラッグ後の誤クリック抑制
  const onCardClick = (idx: number) => {
    if (Math.abs(drag.current.moved) > 8) return
    toggle(idx)
  }

  const scrollBy = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  return (
    <main className="rack-root">
      {/* 背景: 無彩色の霧がゆっくり移ろう（有彩色は使わない） */}
      <div className="ambient" aria-hidden>
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>

      <div
        ref={scrollerRef}
        className="scroller"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="row">
          {LENSES.map((lens, idx) => {
            const isOpen = selected === idx
            const dim = selected !== null && !isOpen
            return (
              <article
                key={lens.name}
                className={`card${isOpen ? ' is-open' : ''}${dim ? ' is-dim' : ''}`}
                onClick={() => onCardClick(idx)}
              >
                <div className="card-glow" />
                <div className="card-body">
                  <div className="img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lens.image} alt={lens.name} className="lens-img" draggable={false} />
                  </div>
                  <span className="lens-name">{lens.name}</span>

                  {/* クリックで初めて出る諸元 */}
                  <div className="specs" aria-hidden={!isOpen}>
                    <span className="mount">{lens.mount}</span>
                    <dl>
                      <div><dt>焦点距離</dt><dd>{lens.focal}</dd></div>
                      <div><dt>開放F値</dt><dd>{lens.aperture}</dd></div>
                      <div><dt>重量</dt><dd>{lens.weight}</dd></div>
                      <div><dt>参考価格</dt><dd>{lens.price}</dd></div>
                    </dl>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* 最小限のナビ矢印 */}
      <button className="nav prev" onClick={() => scrollBy(-1)} aria-label="左へ">‹</button>
      <button className="nav next" onClick={() => scrollBy(1)} aria-label="右へ">›</button>

      <style jsx>{`
        .rack-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: radial-gradient(130% 92% at 50% 40%, #16161b 0%, #101014 55%, #0b0b0d 100%);
          color: #e8e8ee;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ── 背景アンビエント: 無彩色の霧（彩度を持つ色は使わない） ──
           白〜淡いグレーのにじみを複数重ね、位置・大きさ・濃度をゆっくり変えて
           霧が流れるような有機的な動きを作る。規則的な幾何学は使わない。 */
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
          will-change: transform, opacity;
        }
        .orb-a {
          width: 60vw;
          height: 60vw;
          left: 4%;
          top: 8%;
          background: radial-gradient(circle, rgba(232, 234, 240, 0.07), transparent 64%);
          filter: blur(110px);
          animation: drift-a 34s ease-in-out infinite;
        }
        .orb-b {
          width: 50vw;
          height: 50vw;
          right: 2%;
          top: 28%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent 66%);
          filter: blur(120px);
          animation: drift-b 40s ease-in-out infinite;
        }
        .orb-c {
          width: 44vw;
          height: 44vw;
          left: 34%;
          bottom: 2%;
          background: radial-gradient(circle, rgba(150, 154, 168, 0.06), transparent 68%);
          filter: blur(100px);
          animation: drift-c 28s ease-in-out infinite;
        }
        /* それぞれ周期・経路をずらし、同期しない＝霧のように不規則に見せる */
        @keyframes drift-a {
          0%, 100% { transform: translate(0, 0) scale(1);        opacity: 0.5; }
          50%      { transform: translate(14vw, 8vh) scale(1.25); opacity: 0.95; }
        }
        @keyframes drift-b {
          0%, 100% { transform: translate(0, 0) scale(1.1);       opacity: 0.4; }
          50%      { transform: translate(-12vw, 6vh) scale(0.88); opacity: 0.85; }
        }
        @keyframes drift-c {
          0%, 100% { transform: translate(0, 0) scale(0.95);      opacity: 0.35; }
          50%      { transform: translate(9vw, -10vh) scale(1.2);  opacity: 0.7; }
        }

        /* ── 横スクロール領域 ── */
        .scroller {
          position: relative;
          z-index: 5;
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          cursor: grab;
          scroll-snap-type: x proximity;
        }
        .scroller::-webkit-scrollbar { display: none; }
        .scroller:active { cursor: grabbing; }

        .row {
          display: flex;
          align-items: center;
          gap: 30px;
          padding: 12vh max(8vw, 80px);
          width: max-content;
        }

        /* ── カード（フロストグラス・対等な大きさ） ── */
        .card {
          position: relative;
          flex: 0 0 auto;
          width: 248px;
          height: 460px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px) saturate(1.15);
          -webkit-backdrop-filter: blur(16px) saturate(1.15);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.08),
            0 18px 44px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          scroll-snap-align: center;
          transition:
            width 0.55s cubic-bezier(0.22, 0.61, 0.36, 1),
            background 0.5s ease,
            opacity 0.5s ease,
            box-shadow 0.5s ease,
            transform 0.5s ease;
        }
        .card:hover { background: rgba(255, 255, 255, 0.07); }
        .card.is-dim { opacity: 0.4; }
        .card.is-open {
          width: 470px;
          /* 拡大カードも無彩色のフロストグラスのまま。色は外周ラインとバッジだけに灯す */
          background: rgba(255, 255, 255, 0.06);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.14),
            0 24px 60px rgba(0, 0, 0, 0.6);
        }

        /* 選択時の外周グラデ細線 */
        .card-glow {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, #2563eb, #7c3aed 50%, #d946ef);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
        }
        .card.is-open .card-glow { opacity: 0.85; }

        .card-body {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          /* 未選択カードは上下にゆとりをとり、画像を上に貼り付けない（開いた状態は下で上書き） */
          padding: 52px 24px 40px;
        }
        .card.is-open .card-body {
          flex-direction: row;
          align-items: center;
          gap: 8px;
          padding: 28px;
        }

        .img-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 0;
        }
        .card.is-open .img-wrap {
          flex: 0 0 200px;
          height: 100%;
        }
        .lens-img {
          max-height: 330px;
          max-width: 150px;
          width: auto;
          height: auto;
          object-fit: contain;
          /* 暗いガラス上で輪郭が映える控えめなシャドウ */
          filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.7)) contrast(1.05);
          transition: filter 0.5s ease, max-height 0.5s ease;
        }
        /* 未選択カードのみ: 画像を一回り小さくして上下の余白を確保（選択カードは不変） */
        .card:not(.is-open) .lens-img {
          max-height: 280px;
          max-width: 138px;
        }
        .card.is-open .lens-img {
          filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.8))
            drop-shadow(0 0 22px rgba(255, 255, 255, 0.12)) contrast(1.06);
        }

        .lens-name {
          margin-top: 16px;
          font-size: 12.5px;
          letter-spacing: 0.08em;
          color: #c5c9d2;
          text-align: center;
          white-space: nowrap;
          opacity: 0.86;
          transition: opacity 0.4s ease;
        }
        /* 未選択カードのみ: 画像から十分に離した下部キャプション。細め・字間広め・低コントラスト */
        .card:not(.is-open) .lens-name {
          margin-top: 30px;
          font-weight: 300;
          font-size: 11.5px;
          letter-spacing: 0.05em;
          color: rgba(223, 226, 234, 0.56);
          opacity: 1;
        }
        .card.is-open .lens-name {
          position: absolute;
          top: 20px;
          left: 28px;
          margin: 0;
          font-size: 15px;
          color: #f1f3f7;
          opacity: 1;
        }

        /* ── 諸元（クリックで展開） ── */
        .specs {
          /* 既定は完全に畳む。列レイアウトで縦に伸びないよう grow させず max-height:0 でクリップ。
             （:not(.is-open) のセレクタは styled-jsx で落ちる場合があるため、開いた状態側で展開する） */
          flex: 0 0 auto;
          max-height: 0;
          align-self: stretch;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
          padding-left: 22px;
          margin-left: 6px;
          border-left: 1px solid rgba(255, 255, 255, 0.12);
          opacity: 0;
          transform: translateX(8px);
          transition: opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s, max-height 0.5s ease;
          pointer-events: none;
          width: 0;
          overflow: hidden;
        }
        .card.is-open .specs {
          flex: 1 1 auto;
          max-height: 600px;
          opacity: 1;
          transform: translateX(0);
          width: auto;
          pointer-events: auto;
        }
        .specs .mount {
          align-self: flex-start;
          font-size: 10px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #b9a6ee;
          border: 1px solid rgba(168, 85, 247, 0.32);
          padding: 3px 8px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .specs dl {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 18px;
        }
        .specs dt {
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #8b8b96;
          margin-bottom: 4px;
          white-space: nowrap;
        }
        .specs dd {
          font-size: 17px;
          font-weight: 300;
          color: #eef2f6;
          white-space: nowrap;
        }

        /* ── 最小ナビ矢印 ── */
        .nav {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(20, 20, 24, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #c8ccd4;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          opacity: 0.55;
          transition: opacity 0.25s ease, border-color 0.25s ease;
        }
        .nav:hover { opacity: 1; border-color: rgba(255, 255, 255, 0.35); }
        .nav.prev { left: 18px; }
        .nav.next { right: 18px; }

        @media (max-width: 720px) {
          .row { gap: 18px; padding: 10vh 24px; }
          .card { width: 200px; height: 400px; }
          .card.is-open { width: 88vw; }
          .lens-img { max-height: 280px; }
        }

        /* 動きを抑える設定では背景アニメーションを停止 */
        @media (prefers-reduced-motion: reduce) {
          .orb-a, .orb-b, .orb-c { animation: none; }
        }
      `}</style>
    </main>
  )
}

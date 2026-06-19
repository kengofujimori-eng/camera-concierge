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
  /* ↓ 第二段階（詳細パネル）用のダミー。実データ接続は別タスク。 */
  priceUsed: string
  ai: string
}

// デモ専用ハードコード（本番データには触れない）。
// priceUsed / ai は詳細パネル用のダミーテキスト（本番ではAI解析・実価格に差し替え）。
const LENSES: DemoLens[] = [
  { name: 'FE 14mm F1.8 GM',        image: '/lens_images_processed/FE_14mm_F1.8_GM.png',        focal: '14mm',    aperture: 'F1.8', weight: '460g', price: '¥198,000', mount: 'Sony E', priceUsed: '¥148,000〜', ai: '超広角ながら460gと軽量。星景・建築・狭所での広い画づくりに強く、開放から周辺まで安定。歪曲は電子補正前提の設計。' },
  { name: 'FE 16-35mm F2.8 GM',     image: '/lens_images_processed/FE_16-35mm_F2.8_GM.png',     focal: '16–35mm', aperture: 'F2.8', weight: '680g', price: '¥245,000', mount: 'Sony E', priceUsed: '¥178,000〜', ai: '風景からスナップ、室内まで一本で回せる定番の広角ズーム。F2.8通しで暗所にも対応し、動画用途でも扱いやすい。' },
  { name: 'FE 24mm F1.4 GM',        image: '/lens_images_processed/FE_24mm_F1.4_GM.png',        focal: '24mm',    aperture: 'F1.4', weight: '445g', price: '¥168,000', mount: 'Sony E', priceUsed: '¥118,000〜', ai: '445gの軽量大口径。環境を含めたポートレートや夜景スナップに最適で、開放のボケと点像再現に定評。' },
  { name: 'FE 24-70mm F2.8 GM II',  image: '/lens_images_processed/FE_24-70mm_F2.8_GM_II.png',  focal: '24–70mm', aperture: 'F2.8', weight: '695g', price: '¥258,000', mount: 'Sony E', priceUsed: '¥198,000〜', ai: '標準ズームの最高峰。前世代比で大幅に軽量化し、解像とAF速度を両立。仕事用の主力として死角が少ない。' },
  { name: 'FE 35mm F1.4 GM',        image: '/lens_images_processed/FE_35mm_F1.4_GM.png',        focal: '35mm',    aperture: 'F1.4', weight: '524g', price: '¥219,000', mount: 'Sony E', priceUsed: '¥158,000〜', ai: '自然な画角の大口径単。スナップ・ドキュメンタリー・ポートレートまで万能で、開放の線の細さが魅力。' },
  { name: 'FE 50mm F1.2 GM',        image: '/lens_images_processed/FE_50mm_F1.2_GM.png',        focal: '50mm',    aperture: 'F1.2', weight: '778g', price: '¥298,000', mount: 'Sony E', priceUsed: '¥228,000〜', ai: 'F1.2の圧倒的なボケと立体感。標準域の表現力を突き詰めた一本で、開放から芯のある描写を見せる。' },
  { name: 'FE 85mm F1.4 GM II',     image: '/lens_images_processed/FE_85mm_F1.4_GM_II.png',     focal: '85mm',    aperture: 'F1.4', weight: '642g', price: '¥285,000', mount: 'Sony E', priceUsed: '¥218,000〜', ai: 'ポートレートの王道。前世代から軽量化し、とろけるボケと高速AFを両立。背景分離と肌の階調が秀逸。' },
  { name: 'FE 135mm F1.8 GM',       image: '/lens_images_processed/FE_135mm_F1.8_GM.png',       focal: '135mm',   aperture: 'F1.8', weight: '950g', price: '¥235,000', mount: 'Sony E', priceUsed: '¥168,000〜', ai: '中望遠の決定版。強い圧縮効果と大きなボケで被写体を際立たせる。舞台・ポートレート・物撮りに最適。' },
]

export default function WarehouseGalleryPage() {
  const [selected, setSelected] = useState<number | null>(null)
  // 第二段階: 詳細パネルを開いているレンズの index（null=閉じている＝静かな概要）
  const [detailFor, setDetailFor] = useState<number | null>(null)
  // 詳細パネル内のアクティブタブ（AI解析 / 価格・購入 / レビュー・作例）
  const [activeTab, setActiveTab] = useState<'ai' | 'price' | 'review'>('ai')
  // 動きに敏感なユーザー向け: prefers-reduced-motion のときは背景動画を自動再生しない
  const [reduceMotion, setReduceMotion] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)

  // 別レンズで開き直したら（または閉じたら）タブを 'ai' に戻す
  useEffect(() => {
    setActiveTab('ai')
  }, [detailFor])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback((idx: number) => {
    setSelected((cur) => {
      if (cur === idx) {
        // 同じカードを再クリックで閉じるときは詳細パネルも畳む
        setDetailFor(null)
        return null
      }
      return idx
    })
  }, [])

  // Escで閉じる: 詳細パネルが開いていればまずそれを閉じ、なければ選択を解除
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setDetailFor((d) => {
        if (d !== null) return null
        setSelected(null)
        return d
      })
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
      {/* 背景: ループ動画（モノクロ抽象映像）。動画は暗く沈めて気配程度に。
          読み込み失敗時や reduced-motion 時は rack-root のオニキス単色背景にフォールバック。 */}
      <div className="bg" aria-hidden>
        {!reduceMotion && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video className="bg-video" autoPlay muted loop playsInline preload="auto">
            <source src="/gallery-bg.mp4" type="video/mp4" />
          </video>
        )}
        <div className="bg-veil" />
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

                  {/* 第一段階「静かな概要」: クリックで初めて出る主要諸元のみ。
                      AI解析・購入リンク・レビュー等の詳細は出さず、静謐さを保つ。 */}
                  <div className="specs" aria-hidden={!isOpen}>
                    <span className="mount">{lens.mount}</span>
                    <dl>
                      <div><dt>焦点距離</dt><dd>{lens.focal}</dd></div>
                      <div><dt>開放F値</dt><dd>{lens.aperture}</dd></div>
                      <div><dt>重量</dt><dd>{lens.weight}</dd></div>
                      <div><dt>参考価格</dt><dd>{lens.price}</dd></div>
                    </dl>
                    {/* 第二段階への控えめなトリガー。詳細は引き出しの中に隠す。 */}
                    <button
                      type="button"
                      className="detail-trigger"
                      tabIndex={isOpen ? 0 : -1}
                      onClick={(e) => {
                        e.stopPropagation()
                        setDetailFor(idx)
                      }}
                    >
                      詳しく見る<span className="arrow" aria-hidden>→</span>
                    </button>
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

      {/* ── 第二段階「詳細パネル」: 画面下からせり上がるフロストグラスのシート ──
          AI解析・新品/中古価格・購入リンク・レビューのダミーを別レイヤーで表示。
          背景クリック / 閉じるボタン / Esc で閉じ、第一段階の静かな概要へ戻る。
          世界観維持のため余白を広くとり、台帳のように詰め込まない。 */}
      <div
        className={`detail-layer${detailFor !== null ? ' is-open' : ''}`}
        aria-hidden={detailFor === null}
      >
        <div className="detail-scrim" onClick={() => setDetailFor(null)} />
        <section
          className="sheet"
          role="dialog"
          aria-modal="true"
          aria-label={detailFor !== null ? `${LENSES[detailFor].name} の詳細` : undefined}
        >
          {detailFor !== null && (
            <>
              <div className="sheet-head">
                <div className="sheet-title">
                  <span className="sheet-mount">{LENSES[detailFor].mount}</span>
                  <h2>{LENSES[detailFor].name}</h2>
                </div>
                <button
                  type="button"
                  className="sheet-close"
                  onClick={() => setDetailFor(null)}
                  aria-label="閉じる"
                >
                  ×
                </button>
              </div>

              {/* 文字タブ: 1つずつ切り替えて表示。装飾は最小限・文字主体で静謐さを保つ */}
              <div className="sheet-tabs" role="tablist" aria-label="詳細の表示切り替え">
                {([
                  ['ai', 'AI解析'],
                  ['price', '価格・購入'],
                  ['review', 'レビュー・作例'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === key}
                    className={`sheet-tab${activeTab === key ? ' is-active' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="sheet-panels">
                {activeTab === 'ai' && (
                  <div className="panel ai" role="tabpanel">
                    <p>{LENSES[detailFor].ai}</p>
                    <p className="muted">
                      ※ デモ用のダミーテキストです。本番では撮影意図や所有レンズに応じた解析がここに入ります。
                    </p>
                  </div>
                )}

                {activeTab === 'price' && (
                  <div className="panel price" role="tabpanel">
                    <div className="price-row">
                      <div>
                        <span className="price-label">新品</span>
                        <span className="price-val">{LENSES[detailFor].price}</span>
                      </div>
                      <div>
                        <span className="price-label">中古</span>
                        <span className="price-val used">{LENSES[detailFor].priceUsed}</span>
                      </div>
                    </div>
                    <div className="buy-row">
                      <button type="button" className="buy primary">新品で買う</button>
                      <button type="button" className="buy">中古で買う</button>
                    </div>
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="panel review" role="tabpanel">
                    <p className="muted">
                      「開放から芯のある描写で、ポートレートの定番として手放せない。」— ダミーレビュー
                    </p>
                    <p className="muted">
                      作例ギャラリー（準備中）。本番では実際の作例サムネイルが並びます。
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

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

        /* ── 背景動画レイヤー（最背面・モノクロ・沈める） ── */
        .bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* 映像を主張させない: モノクロ維持・暗く沈めるが黒すぎを避け、
             リングの輪郭をやわらげるため前版より少し強めにぼかす。 */
          filter: grayscale(1) brightness(0.68) contrast(1.0) blur(3.5px);
        }
        /* 暗いベール + ビネットで映像を沈め、カードの可読性を最優先にする。
           新映像は上部が少し明るいため、上側にわずかに濃いめのグラデを足す。 */
        .bg-veil {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(0, 0, 0, 0.22) 0%, transparent 32%),
            radial-gradient(120% 80% at 50% 45%, transparent 48%, rgba(0, 0, 0, 0.55) 100%),
            rgba(8, 8, 11, 0.58);
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

        /* ── 第二段階への控えめなトリガー ── */
        .detail-trigger {
          align-self: flex-start;
          margin-top: 6px;
          padding: 6px 2px;
          background: none;
          border: none;
          color: rgba(214, 218, 228, 0.8);
          font-size: 12.5px;
          letter-spacing: 0.16em;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: color 0.25s ease;
        }
        .detail-trigger:hover { color: #eef2f6; }
        .detail-trigger .arrow {
          font-size: 12px;
          transform: translateX(2px);
          transition: transform 0.25s ease;
        }
        .detail-trigger:hover .arrow { transform: translateX(4px); }

        /* ── 第二段階「詳細パネル」: 下からせり上がるシート ── */
        .detail-layer {
          position: fixed;
          inset: 0;
          z-index: 40;
          visibility: hidden;
          pointer-events: none;
        }
        .detail-layer.is-open {
          visibility: visible;
          pointer-events: auto;
        }
        .detail-scrim {
          position: absolute;
          inset: 0;
          background: rgba(6, 6, 9, 0.55);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .detail-layer.is-open .detail-scrim { opacity: 1; }

        .sheet {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          max-height: 82vh;
          overflow-y: auto;
          padding: 30px max(8vw, 48px) 44px;
          /* フロストグラス: 暗いオニキスのガラス板。世界観に馴染ませる */
          background: rgba(18, 18, 23, 0.72);
          backdrop-filter: blur(26px) saturate(1.15);
          -webkit-backdrop-filter: blur(26px) saturate(1.15);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px 22px 0 0;
          box-shadow: 0 -24px 70px rgba(0, 0, 0, 0.6);
          transform: translateY(102%);
          transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .detail-layer.is-open .sheet { transform: translateY(0); }

        .sheet-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }
        .sheet-title { display: flex; flex-direction: column; gap: 10px; }
        .sheet-mount {
          align-self: flex-start;
          font-size: 10px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #b9a6ee;
          border: 1px solid rgba(168, 85, 247, 0.32);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .sheet-title h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: #f1f3f7;
        }
        .sheet-close {
          flex: 0 0 auto;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: #c8ccd4;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          transition: border-color 0.25s ease, color 0.25s ease;
        }
        .sheet-close:hover { border-color: rgba(255, 255, 255, 0.4); color: #fff; }

        /* ── 文字タブ ── */
        .sheet-tabs {
          display: flex;
          gap: 28px;
          margin-bottom: 26px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .sheet-tab {
          position: relative;
          background: none;
          border: none;
          padding: 0 0 12px;
          font-size: 13px;
          letter-spacing: 0.12em;
          color: rgba(214, 218, 228, 0.5);
          cursor: pointer;
          transition: color 0.25s ease;
        }
        .sheet-tab:hover { color: rgba(238, 241, 247, 0.85); }
        .sheet-tab.is-active { color: #f1f3f7; }
        /* 現在地は控えめなアンダーバーで示す（発光・色相追加はしない） */
        .sheet-tab.is-active::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 1px;
          background: rgba(241, 243, 247, 0.85);
        }

        /* タブ切り替えで高さが大きくガタつかないよう最小高さを確保 */
        .sheet-panels { min-height: 200px; }
        .panel {
          max-width: 640px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 26px 28px;
        }
        .panel p {
          margin: 0 0 12px;
          font-size: 14px;
          line-height: 1.8;
          font-weight: 300;
          color: #dfe2ea;
        }
        .panel p:last-child { margin-bottom: 0; }
        .panel .muted { color: rgba(178, 182, 192, 0.62); font-size: 12.5px; }

        .price-row { display: flex; gap: 32px; margin-bottom: 20px; }
        .price-row > div { display: flex; flex-direction: column; gap: 6px; }
        .price-label {
          font-size: 10px;
          letter-spacing: 0.16em;
          color: #8b8b96;
        }
        .price-val { font-size: 21px; font-weight: 300; color: #f1f3f7; }
        .price-val.used { color: #c5c9d2; }

        .buy-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .buy {
          flex: 1 1 auto;
          min-width: 120px;
          padding: 11px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
          color: #e8e8ee;
          font-size: 12.5px;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .buy:hover { border-color: rgba(255, 255, 255, 0.4); }
        /* 唯一の一点挿し: 「新品で買う」だけ控えめなグラデのアクセント */
        .buy.primary {
          border-color: transparent;
          /* 左端の彩度の高い青を外し、紫〜マゼンタの落ち着いた2色グラデへ。
             明度も一段下げ、マットなカード上で派手に光らせず一点挿しに留める。 */
          background: linear-gradient(90deg, #5a4fcf, #9d3c83);
          color: #f3eef7;
        }
        .buy.primary:hover { filter: brightness(1.08); }

        @media (max-width: 720px) {
          .sheet-tabs { gap: 18px; }
          .sheet-tab { font-size: 12px; letter-spacing: 0.08em; }
          .panel { max-width: none; }
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
        /* 背景動画の自動再生抑制は JS 側（reduceMotion で <video> を描画しない）で処理する */
      `}</style>
    </main>
  )
}

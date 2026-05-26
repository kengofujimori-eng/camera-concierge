'use client'

import { useState, useEffect } from 'react'
import { Trash2, PackageOpen, Plus, ChevronDown, ChevronUp, Camera } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { generateFallbackShoppingLinks, applyAffiliateToLinks, type ShoppingLinks } from '@/lib/affiliateLinks'

// ── DB 型定義 ───────────────────────────────────────────
interface DbReviewLink { site: string; url: string; label: string }

interface LensPriceDb {
  name: string
  image_url?: string            // ローカル処理済みPNG or 外部画像URL
  image_url_external?: string  // 外部URLバックアップ
  photo_yodobashi_url?: string  // Photo Yodobashi レビュー直リンク
  model_code?: string           // メーカーモデルコード（SEL50F14GM 等）Kasyapa Google検索に使用
  source_url?: string
  weight?: string
  price_info?: { new_price: number | null; used_price: number | null; fetched_at: string | null }
  purchase_links?: {
    new?: { amazon?: string; rakuten?: string; yahoo?: string } | null
    used?: { kitamura?: string; mapcamera?: string } | null
  }
}

interface LensLinkDb {
  name: string
  review_links?: DbReviewLink[]
}

// ── localStorage アイテム型 ─────────────────────────────
interface LensItem {
  id: number
  name: string
  addedAt: string
  type: 'owned' | 'wishlist'
  tag?: string        // 【最強の選択肢】などのラベル
  pros?: string       // 長所
  cons?: string       // 短所
  advice?: string     // マスターのアドバイス
  aiComment?: string  // 私の結論（チャット応答から保存）
  focalMin?: number
  focalMax?: number
}

// ── ユーティリティ ────────────────────────────────────────
function normalizeN(s: string) { return s.toLowerCase().replace(/[^\w]/g, '') }

const BRAND_PREFIX_RE = /^(Sony|Canon|Nikon|Sigma|Tamron|Viltrox|Tokina|Samyang|LAOWA|Fujifilm)\s+/i
function stripBrand(name: string) { return name.replace(BRAND_PREFIX_RE, '') }

function findInDb<T extends { name: string }>(name: string, db: T[]): T | null {
  const candidates = [name, stripBrand(name)]
  for (const c of candidates) {
    const q = normalizeN(c)
    if (q.length < 5) continue
    const exact = db.find((l) => normalizeN(l.name) === q)
    if (exact) return exact
    const partial = db.find((l) => {
      const n = normalizeN(l.name)
      return (n.includes(q) || q.includes(n)) && Math.min(n.length, q.length) >= 7
    })
    if (partial) return partial
  }
  return null
}

function formatPrice(n: number) { return `¥${n.toLocaleString('ja-JP')}` }

function extractFocal(name: string): { min: number; max: number } | null {
  const zoom = name.match(/(\d+)[–\-](\d+)\s*mm/i)
  if (zoom) return { min: parseInt(zoom[1]), max: parseInt(zoom[2]) }
  const prime = name.match(/(\d+)\s*mm/i)
  if (prime) return { min: parseInt(prime[1]), max: parseInt(prime[1]) }
  return null
}

// ── Sony 画像 URL 推定 ────────────────────────────────────
const SONY_MODEL_MAP: Record<string, string> = {
  'fe 35mm f1.4 gm': 'SEL35F14GM', 'fe 50mm f1.4 gm': 'SEL50F14GM',
  'fe 50mm f1.2 gm': 'SEL50F12GM', 'fe 85mm f1.4 gm': 'SEL85F14GM',
  'fe 135mm f1.8 gm': 'SEL135F18GM', 'fe 14mm f1.8 gm': 'SEL1418GM',
  'fe 24mm f1.4 gm': 'SEL24F14GM', 'fe 24-70mm f2.8 gm ii': 'SEL2470GM2',
  'fe 24-70mm f2.8 gm': 'SEL2470GM', 'fe 70-200mm f2.8 gm oss ii': 'SEL70200GM2',
  'fe 70-200mm f2.8 gm oss': 'SEL70200GM', 'fe 16-35mm f2.8 gm ii': 'SEL1635GM2',
  'fe 16-35mm f2.8 gm': 'SEL1635GM', 'fe 12-24mm f2.8 gm': 'SEL1224GM',
  'fe 16-25mm f2.8 g': 'SEL1625G', 'fe 85mm f1.8': 'SEL85F18',
  'fe 50mm f1.8': 'SEL50F18F', 'fe 24mm f2.8 g': 'SEL24F28G',
  'fe 40mm f2.5 g': 'SEL40F25G', 'fe 50mm f2.5 g': 'SEL50F25G',
}
function normalizeName(s: string) {
  return s.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}
function getFallbackImageUrl(name: string): string | null {
  const lower = normalizeName(name)
  for (const [key, model] of Object.entries(SONY_MODEL_MAP)) {
    // キー側もドット等を正規化して比較
    if (lower.includes(normalizeName(key))) {
      return `https://www.sony.jp/ichigan/products/${model}/img/photo/photo_01.jpg`
    }
  }
  return null
}

// ── レビューサイト分類 ─────────────────────────────────────
const SAMPLE_SITES = new Set(['Photo Yodobashi'])

function mergeShoppingLinks(primary: ShoppingLinks, fallback: ShoppingLinks): ShoppingLinks {
  return {
    new: primary.new.length > 0 ? primary.new : fallback.new,
    used: primary.used.length > 0 ? primary.used : fallback.used,
  }
}
const SITE_ICONS: Record<string, string> = {
  'Photo Yodobashi': '📷', 'Kasyapa': '🎞️', 'DPReview': '📸',
  'DxOMark': '📊', 'The Digital Picture': '🖼️', 'Photography Life': '🌿', 'Lenstip': '🔬',
}
const REVIEW_PRIORITY = ['Photo Yodobashi', 'Kasyapa', 'DPReview', 'DxOMark', 'The Digital Picture', 'Photography Life', 'Lenstip']
function sortLinks(links: DbReviewLink[]) {
  return [...links].sort((a, b) => {
    const ai = REVIEW_PRIORITY.indexOf(a.site), bi = REVIEW_PRIORITY.indexOf(b.site)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

// ── Markdown除去 ─────────────────────────────────────────
function stripMd(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/^\s*[-・•]\s/gm, '')
    .trim()
}

// ── AIレンズ分析ブロック（長所・短所・アドバイス・結論）────
interface AnalysisBlockProps {
  pros?: string; cons?: string; advice?: string; aiComment?: string
  defaultOpen?: boolean; itemType?: 'owned' | 'wishlist'; lensName?: string
}
function AnalysisBlock({ pros, cons, advice, aiComment, defaultOpen = false, itemType, lensName }: AnalysisBlockProps) {
  const [open, setOpen] = useState(defaultOpen)
  const hasContent = pros || cons || advice || aiComment

  // 欲しいリストで分析なしの場合はチャット誘導を表示
  if (!hasContent) {
    if (itemType !== 'wishlist') return null
    const chatQuery = lensName ? `${lensName}について教えて` : 'このレンズについて教えて'
    return (
      <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 px-3 py-2">
        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-1">🤖 AI分析未取得</p>
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
          チャットでこのレンズについて質問すると、AI分析（長所・短所・アドバイス）が保存されます。
        </p>
        <a
          href={`/?q=${encodeURIComponent(chatQuery)}`}
          className="mt-1.5 inline-block text-[10px] text-amber-600 dark:text-amber-400 hover:underline"
        >
          → チャットで質問する
        </a>
      </div>
    )
  }

  const sections = [
    pros     && { icon: '✅', label: '長所',                  text: stripMd(pros),     color: 'text-green-700 dark:text-green-400' },
    cons     && { icon: '⚠️', label: '短所',                  text: stripMd(cons),     color: 'text-amber-700 dark:text-amber-400' },
    advice   && { icon: '💡', label: 'マスターのアドバイス',  text: stripMd(advice),   color: 'text-blue-700 dark:text-blue-400'   },
    aiComment && { icon: '🎯', label: '私の結論',              text: stripMd(aiComment),color: 'text-slate-600 dark:text-slate-300'  },
  ].filter(Boolean) as { icon: string; label: string; text: string; color: string }[]

  const preview = stripMd(pros ?? aiComment ?? '').slice(0, 60) + '…'

  return (
    <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/50 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">🤖 AIの分析</p>
          {!open && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{preview}</p>}
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
               : <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2.5">
          {sections.map(s => (
            <div key={s.label}>
              <p className={`text-[10px] font-bold mb-0.5 ${s.color}`}>{s.icon} {s.label}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 折りたたみセクション ──────────────────────────────────
function Collapse({ label, children, defaultOpen = false }: {
  label: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-slate-100 dark:border-slate-700/60">
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
               : <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

// ── 焦点距離マップ ─────────────────────────────────────────
function focalToPercent(mm: number) {
  const MIN = Math.log(10), MAX = Math.log(600)
  return ((Math.log(Math.max(10, Math.min(600, mm))) - MIN) / (MAX - MIN)) * 100
}
const ZONE_RANGES = [[10, 24], [24, 35], [35, 85], [85, 300], [300, 600]]
const ZONE_LABELS = ['超広角', '広角', '標準', '望遠', '超望遠']
const TICKS = [10, 14, 20, 28, 35, 50, 85, 135, 200, 300, 500]

function FocalMap({ items }: { items: LensItem[] }) {
  const lenses = items.filter(i => i.focalMin)
  if (lenses.length === 0) return null
  const owned = lenses.filter(i => i.type === 'owned')
  const wishlist = lenses.filter(i => i.type === 'wishlist')
  return (
    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/80">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">焦点距離カバレッジ</h2>
        <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-[linear-gradient(90deg,#418CB7_0%,#FF8570_100%)]" />所有</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full border border-dashed border-[#418CB7]/60 bg-[#418CB7]/10 dark:bg-[#418CB7]/15" />欲しい</span>
        </div>
      </div>
      {/* 目盛り軸 */}
      <div className="flex items-start mb-1">
        <div className="w-32 flex-shrink-0" />
        <div className="flex-1 relative h-5">
          {ZONE_LABELS.map((label, i) => {
            const lo = ZONE_RANGES[i][0], hi = ZONE_RANGES[i][1]
            const left = focalToPercent(lo), width = focalToPercent(hi) - focalToPercent(lo)
            return (
              <div key={i} className="absolute top-0 bottom-0 flex items-center justify-center"
                style={{ left: `${left}%`, width: `${width}%` }}>
                <span className="text-[9px] text-slate-300 dark:text-slate-600">{label}</span>
              </div>
            )
          })}
          {TICKS.map(mm => (
            <span key={mm} className="absolute text-[9px] text-slate-400 -translate-x-1/2 bottom-0"
              style={{ left: `${focalToPercent(mm)}%` }}>{mm}</span>
          ))}
        </div>
      </div>
      {/* レンズ行 */}
      {[...owned.map(l => ({ l, color: 'linear-gradient(90deg,#418CB7 0%,#FF8570 100%)', dashed: false })),
        ...wishlist.map(l => ({ l, color: 'linear-gradient(90deg,rgba(65,140,183,0.12) 0%,rgba(255,133,112,0.16) 100%)', dashed: true }))].map(({ l, color, dashed }) => {
        const left = focalToPercent(l.focalMin!)
        const right = focalToPercent(l.focalMax ?? l.focalMin!)
        const width = Math.max(right - left, 1.5)
        const label = l.focalMin === l.focalMax ? `${l.focalMin}mm` : `${l.focalMin}–${l.focalMax}mm`
        const clean = l.name.replace(/<[^>]*>/g, '').trim()
        return (
          <div key={l.id} className="flex items-center gap-2 py-0.5">
            <div className="w-32 flex-shrink-0 text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">{clean}</span>
            </div>
            <div className="flex-1 relative h-5 rounded-lg border border-slate-200/70 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]">
              {ZONE_RANGES.slice(1).map(([lo], i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700"
                  style={{ left: `${focalToPercent(lo)}%` }} />
              ))}
              <div className="absolute top-0.5 bottom-0.5 rounded-md flex items-center overflow-hidden"
                style={{ left: `${left}%`, width: `${width}%`, background: color,
                  border: dashed ? '1.5px dashed rgba(217,70,239,0.65)' : 'none' }}>
                {width > 8 && <span className="text-[9px] text-white font-semibold px-1 truncate">{label}</span>}
              </div>
              {width <= 8 && (
                <span className="absolute text-[9px] text-slate-500 font-medium"
                  style={{ left: `calc(${left}% + ${width}% + 3px)`, top: '50%', transform: 'translateY(-50%)' }}>
                  {label}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── レンズカード ─────────────────────────────────────────
function LensCard({ item, priceDb, linkDb, onDelete }: {
  item: LensItem
  priceDb: LensPriceDb[]
  linkDb: LensLinkDb[]
  onDelete: (id: number) => void
}) {
  const cleanName = item.name.replace(/<[^>]*>/g, '').trim()
  // 画像URLを順番に試す: lens_data.json の URL → getFallbackImageUrl → プレースホルダー
  const [imgUrlIndex, setImgUrlIndex] = useState(0)

  const priceEntry = findInDb(cleanName, priceDb)
  const linkEntry  = findInDb(cleanName, linkDb)

  const priceInfo     = priceEntry?.price_info
  const purchaseLinks = priceEntry?.purchase_links
  const reviewLinks   = linkEntry?.review_links
    ? sortLinks(Object.values(
        linkEntry.review_links.reduce((acc, l) => { if (!acc[l.site]) acc[l.site] = l; return acc }, {} as Record<string, DbReviewLink>)
      ))
    : []

  // Photo Yodobashi: lens_links.json 直リンク → lens_data.json 生成URL → Googleサイト検索
  const pyDirectFromLinks = reviewLinks.find(l => l.site === 'Photo Yodobashi')
  const pyGeneratedUrl    = priceEntry?.photo_yodobashi_url
  const q = encodeURIComponent(cleanName)
  const photoYodobashiUrl = pyDirectFromLinks?.url
    ?? pyGeneratedUrl
    ?? `https://www.google.com/search?q=site%3Aphoto.yodobashi.com+${q}`

  // Google作例検索: モデルコードがあれば精度高め、なければレンズ名
  const modelCode = priceEntry?.model_code
  const googleSampleQuery = modelCode
    ? `${modelCode} 作例`
    : `${cleanName} 作例`
  const googleSampleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleSampleQuery)}`

  const reviewOnly  = reviewLinks.filter(l => !SAMPLE_SITES.has(l.site))

  // lens_data.json のリンクにはアフィリエイトタグを付与、なければフォールバック
  const fallbackLinks = generateFallbackShoppingLinks(cleanName)
  const { new: newLinks, used: usedLinks } = purchaseLinks
    ? mergeShoppingLinks(applyAffiliateToLinks(purchaseLinks), fallbackLinks)
    : fallbackLinks
  const fallbackNew = fallbackLinks.new
  const fallbackUsed = fallbackLinks.used
  const fallbackSample = [
    {
      label: '📷 Photo Yodobashi',
      url: pyGeneratedUrl ?? `https://www.google.com/search?q=site%3Aphoto.yodobashi.com+${q}`,
    },
    { label: '🔍 Google作例検索', url: googleSampleUrl },
  ]

  // 画像URL候補リスト: ローカル処理済みPNG → 外部URLバックアップ → null(プレースホルダー)
  const imgCandidates: (string | null)[] = [
    priceEntry?.image_url ?? null,
    priceEntry?.image_url_external ?? null,
    null,
  ].filter((url, i, arr) => i === 0 || url !== arr[i - 1]) // 重複URLは除外
  const imageUrl = imgCandidates[Math.min(imgUrlIndex, imgCandidates.length - 1)] ?? null
  function handleImgError() { setImgUrlIndex(i => i + 1) }

  const focalLabel = item.focalMin
    ? (item.focalMin === item.focalMax ? `${item.focalMin}mm` : `${item.focalMin}–${item.focalMax}mm`)
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group rounded-2xl bg-slate-200/80 p-[1px] shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition-all hover:bg-[linear-gradient(135deg,#418CB7_0%,#FF8570_100%)] hover:shadow-[0_18px_46px_rgba(65,140,183,0.12)] dark:bg-white/10"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[15px] bg-white dark:bg-slate-950/95">
      {/* 画像 */}
      {imageUrl ? (
        <div className="h-32 flex-shrink-0 overflow-hidden border-b border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]">
          <img src={imageUrl} alt={cleanName} onError={handleImgError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain p-2" />
        </div>
      ) : (
        <div className="flex h-20 flex-shrink-0 items-center justify-center border-b border-slate-100 bg-slate-50 px-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="text-center">
            <Camera className="h-6 w-6 text-slate-500 mx-auto mb-1" />
            <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{cleanName}</p>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* タグ + 焦点距離 */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {item.tag && (
                <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                  {item.tag}
                </span>
              )}
              {focalLabel && (
                <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                  {focalLabel}
                </span>
              )}
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                item.type === 'wishlist'
                  ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {item.type === 'wishlist' ? '⭐ 欲しい' : '📦 所有'}
              </span>
            </div>
            {/* レンズ名 */}
            <h3 className="font-semibold text-slate-900 dark:text-white leading-snug text-sm">{cleanName}</h3>
          </div>
          <button onClick={() => onDelete(item.id)}
            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 flex-shrink-0 transition-colors"
            aria-label="削除">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* AI分析（長所・短所・アドバイス・結論）— デフォルト折りたたみ */}
        <AnalysisBlock pros={item.pros} cons={item.cons} advice={item.advice} aiComment={item.aiComment} defaultOpen={false} itemType={item.type} lensName={cleanName} />

        {/* 価格バッジ */}
        <div className="flex gap-2 flex-wrap mt-2.5">
          {priceInfo?.new_price ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
              🆕 {formatPrice(priceInfo.new_price)}〜
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-400 dark:bg-slate-700 dark:border-slate-600">
              🆕 ―
            </span>
          )}
          {priceInfo?.used_price ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
              ♻️ {formatPrice(priceInfo.used_price)}〜
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-400 dark:bg-slate-700 dark:border-slate-600">
              ♻️ ―
            </span>
          )}
        </div>
      </div>

      {/* 折りたたみセクション */}
      <div className="flex flex-col mt-1">
        {/* 新品で買う */}
        <Collapse label={`🛒 新品で買う${priceInfo?.new_price ? `（${formatPrice(priceInfo.new_price)}〜）` : ''}`}>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {(newLinks.length > 0 ? newLinks : fallbackNew).map(l => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                {l.label}
              </a>
            ))}
          </div>
        </Collapse>

        {/* 中古で買う */}
        <Collapse label={`♻️ 中古で買う${priceInfo?.used_price ? `（${formatPrice(priceInfo.used_price)}〜）` : ''}`}>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {(usedLinks.length > 0 ? usedLinks : fallbackUsed).map(l => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                {l.label}
              </a>
            ))}
          </div>
        </Collapse>

        {/* 作例 */}
        <Collapse label="📸 作例・レビュー">
          <div className="flex flex-col gap-1.5">
            <a href={photoYodobashiUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
              📷 Photo Yodobashi{pyDirectFromLinks ? '' : pyGeneratedUrl ? ' ↗' : '（検索）'}
            </a>
            <a href={googleSampleUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
              🔍 Google作例検索{modelCode ? ` (${modelCode})` : ''}
            </a>
          </div>
        </Collapse>

        {/* レビュー */}
        {reviewOnly.length > 0 && (
          <Collapse label="📋 海外レビュー">
            <div className="flex flex-col gap-1.5">
              {reviewOnly.map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                  {SITE_ICONS[l.site] ?? '🔗'} {l.site}
                </a>
              ))}
            </div>
          </Collapse>
        )}
      </div>
      </div>
    </motion.div>
  )
}

// ── 手動追加フォーム ─────────────────────────────────────
function AddForm({ onAdd }: { onAdd: (name: string, type: 'owned' | 'wishlist') => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'owned' | 'wishlist'>('wishlist')
  function submit() {
    if (!name.trim()) return
    onAdd(name.trim(), type)
    setName(''); setOpen(false)
  }
  return (
    <div className="mb-4">
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white py-3 text-sm font-medium text-slate-500 transition-all hover:border-[#418CB7]/45 hover:text-slate-800 hover:shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400 dark:hover:border-[#418CB7]/40 dark:hover:text-slate-200">
          <Plus className="h-4 w-4" /> レンズを手動追加
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/80">
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="例: Sigma 50mm F1.4 DG DN Art"
            className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#418CB7]/20 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:focus:ring-[#418CB7]/30"
            onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
          <div className="flex gap-2 mb-3">
            {(['owned', 'wishlist'] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 rounded-xl p-[1px] text-xs font-medium transition-all ${type === t ? 'bg-[linear-gradient(135deg,#418CB7_0%,#FF8570_100%)] shadow-[0_10px_24px_rgba(65,140,183,0.12)]' : 'bg-slate-200/80 hover:bg-[#418CB7]/20 dark:bg-white/10 dark:hover:bg-[#418CB7]/20'}`}>
                <span className={`block rounded-[11px] px-3 py-1.5 ${type === t ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white' : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400'}`}>
                  {t === 'owned' ? '所有済み' : '欲しいリスト'}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="flex-1 rounded-xl bg-slate-950 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">追加</button>
            <button onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200">キャンセル</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── メインページ ─────────────────────────────────────────
export default function WarehousePage() {
  const [items, setItems] = useState<LensItem[]>([])
  const [tab, setTab] = useState<'owned' | 'wishlist'>('wishlist')
  const [loaded, setLoaded] = useState(false)
  const [priceDb, setPriceDb] = useState<LensPriceDb[]>([])
  const [linkDb, setLinkDb] = useState<LensLinkDb[]>([])

  // lens_data.json（価格・購入リンク）
  useEffect(() => {
    fetch('/lens_data.json').then(r => r.json()).then(d => setPriceDb(d.lenses ?? [])).catch(() => setPriceDb([]))
  }, [])

  // lens_links.json（レビューリンク）
  useEffect(() => {
    fetch('/lens_links.json').then(r => r.json()).then(d => setLinkDb(d.lenses ?? [])).catch(() => setLinkDb([]))
  }, [])

  // URLパラメータでタブ初期値
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('tab')
    if (t === 'wishlist' || t === 'owned') setTab(t)
  }, [])

  // localStorage 読み込み・マイグレーション
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('warehouse') ?? '[]') as LensItem[]
      const migrated = raw.map(item => {
        const focal = item.focalMin ? null : extractFocal(item.name)
        return { ...item, type: item.type ?? 'owned', focalMin: item.focalMin ?? focal?.min, focalMax: item.focalMax ?? focal?.max }
      })
      setItems(migrated)
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  // warehouseUpdated イベントをリッスン（チャットから追加された場合）
  useEffect(() => {
    function onUpdate() {
      try {
        const raw = JSON.parse(localStorage.getItem('warehouse') ?? '[]') as LensItem[]
        setItems(raw)
      } catch { /* ignore */ }
    }
    window.addEventListener('warehouseUpdated', onUpdate)
    return () => window.removeEventListener('warehouseUpdated', onUpdate)
  }, [])

  function save(updated: LensItem[]) {
    setItems(updated)
    localStorage.setItem('warehouse', JSON.stringify(updated))
    window.dispatchEvent(new Event('warehouseUpdated'))
  }

  function handleDelete(id: number) { save(items.filter(i => i.id !== id)) }

  function handleAdd(name: string, type: 'owned' | 'wishlist') {
    const focal = extractFocal(name)
    save([...items, { id: Date.now(), name, addedAt: new Date().toISOString(), type, focalMin: focal?.min, focalMax: focal?.max }])
    setTab(type)
  }

  const owned = items.filter(i => i.type === 'owned')
  const wishlist = items.filter(i => i.type === 'wishlist')
  const displayed = tab === 'owned' ? owned : wishlist

  if (!loaded) return null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-slate-900 dark:text-slate-100">
      {/* ヘッダー */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/80">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(90deg,#418CB7_0%,#FF8570_100%)]" />
          Lens warehouse
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">デジタルレンズ倉庫</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">保存したレンズを、所有と欲しいリストで整理します。</p>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">所有 {owned.length}本 ／ 欲しい {wishlist.length}本</p>
        </div>
      </div>

      {items.length > 0 && <FocalMap items={items} />}

      {/* タブ */}
      <div className="mb-4 flex gap-2 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-slate-950/80">
        {(['owned', 'wishlist'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`group flex-1 rounded-xl p-[1px] text-sm font-medium transition-all ${tab === t ? 'bg-[linear-gradient(135deg,#418CB7_0%,#FF8570_100%)] shadow-[0_10px_24px_rgba(65,140,183,0.12)]' : 'bg-transparent hover:bg-slate-200/80 dark:hover:bg-white/10'}`}>
            <span className={`block rounded-[11px] px-4 py-2 transition-colors ${tab === t ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white' : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200'}`}>
              {t === 'owned' ? `所有レンズ (${owned.length})` : `欲しいレンズ (${wishlist.length})`}
            </span>
          </button>
        ))}
      </div>

      <AddForm onAdd={handleAdd} />

      {displayed.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <PackageOpen className="h-14 w-14 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            {tab === 'owned'
              ? 'チャットでレンズを提案されたら「所有済み」ボタンで保存できます'
              : 'チャットで気になったレンズを「欲しいリスト」ボタンで保存しましょう'}
          </p>
          <Link href="/" className="mt-4 text-sm text-blue-500 hover:underline">← チャットへ戻る</Link>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}>
          <AnimatePresence>
            {displayed.map(item => (
              <LensCard key={item.id} item={item} priceDb={priceDb} linkDb={linkDb} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

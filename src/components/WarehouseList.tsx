'use client'

import { useState, useEffect } from 'react'
import { Trash2, PackageOpen, Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

// localStorage に保存されるアイテム
interface StoredItem {
  id: number
  name: string
  addedAt: string
  type?: 'owned' | 'wishlist'
  focalMin?: number
  focalMax?: number
  memo?: string
}

// lens_links.json
interface ReviewLink { site: string; url: string; label: string }
interface LensLinkData { name: string; source_url: string; review_links: ReviewLink[] }

// lens_data.json
interface PurchaseLinks {
  new: { amazon?: string; rakuten?: string; yahoo?: string }
  used: { kitamura?: string; mapcamera?: string }
}
interface PriceInfo {
  new_price: number | null
  used_price: number | null
  fetched_at: string | null
}
interface LensPriceData {
  name: string
  purchase_links?: PurchaseLinks
  price_info?: PriceInfo
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^\w]/g, '')
}

function findInDb<T extends { name: string }>(name: string, db: T[]): T | null {
  const q = normalize(name)
  if (q.length < 6) return null
  const exact = db.find((l) => normalize(l.name) === q)
  if (exact) return exact
  return db.find((l) => {
    const n = normalize(l.name)
    return (n.includes(q) || q.includes(n)) && Math.min(n.length, q.length) >= 8
  }) ?? null
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`
}

const REVIEW_PRIORITY = [
  'Photo Yodobashi', 'Kasyapa', 'DPReview', 'DxOMark',
  'The Digital Picture', 'Photography Life', 'Lenstip',
]
const SITE_ICONS: Record<string, string> = {
  'Photo Yodobashi': '📷', 'Kasyapa': '🎞️', 'DPReview': '📸',
  'DxOMark': '📊', 'The Digital Picture': '🖼️', 'Photography Life': '🌿', 'Lenstip': '🔬',
}

function sortReviewLinks(links: ReviewLink[]): ReviewLink[] {
  return [...links].sort((a, b) => {
    const ai = REVIEW_PRIORITY.indexOf(a.site)
    const bi = REVIEW_PRIORITY.indexOf(b.site)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

function kasyapaSearchUrl(name: string) {
  return `https://www.google.com/search?q=kasyapa+${encodeURIComponent(name)}`
}
function yodobashiSearchUrl(name: string) {
  return `https://photo.yodobashi.com/?s=${encodeURIComponent(name)}`
}

// ────────────────────────────────
// 折りたたみセクション
// ────────────────────────────────
function Collapse({
  label, defaultOpen = false, children,
}: { label: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />}
      </button>
      {open && <div className="mt-1.5">{children}</div>}
    </div>
  )
}

// ────────────────────────────────
// カード本体
// ────────────────────────────────
interface WarehouseCardProps {
  item: StoredItem
  onDelete: (id: number) => void
  onUpdateMemo: (id: number, memo: string) => void
  isDeleting: boolean
  lensLinkDb: LensLinkData[] | null
  lensPriceDb: LensPriceData[] | null
}

function WarehouseCard({ item, onDelete, onUpdateMemo, isDeleting, lensLinkDb, lensPriceDb }: WarehouseCardProps) {
  const cleanName = item.name.replace(/<[^>]*>/g, '').trim()
  const [editingMemo, setEditingMemo] = useState(false)
  const [memoText, setMemoText] = useState(item.memo ?? '')

  // レビューリンク
  const linkData = lensLinkDb ? findInDb(cleanName, lensLinkDb) : null
  const reviewLinks = linkData
    ? sortReviewLinks(
        Object.values(
          linkData.review_links.reduce((acc, l) => { if (!acc[l.site]) acc[l.site] = l; return acc }, {} as Record<string, ReviewLink>)
        )
      )
    : []
  const hasPhotYodo = reviewLinks.some((l) => l.site === 'Photo Yodobashi')
  const hasKasyapa  = reviewLinks.some((l) => l.site === 'Kasyapa')

  // 価格・購入リンク
  const priceData = lensPriceDb ? findInDb(cleanName, lensPriceDb) : null
  const priceInfo = priceData?.price_info
  const purchaseLinks = priceData?.purchase_links

  const newLinks = [
    purchaseLinks?.new.amazon  && { label: '🛒 Amazon', url: purchaseLinks.new.amazon },
    purchaseLinks?.new.rakuten && { label: '🔴 楽天',   url: purchaseLinks.new.rakuten },
    purchaseLinks?.new.yahoo   && { label: '🟡 Yahoo',  url: purchaseLinks.new.yahoo },
  ].filter(Boolean) as { label: string; url: string }[]

  const usedLinks = [
    purchaseLinks?.used.kitamura  && { label: '🗺️ キタムラ', url: purchaseLinks.used.kitamura },
    purchaseLinks?.used.mapcamera && { label: '📸 MapCamera', url: purchaseLinks.used.mapcamera },
  ].filter(Boolean) as { label: string; url: string }[]

  // フォールバック
  const fallbackNew = [
    { label: '🛒 Amazon', url: `https://www.amazon.co.jp/s?k=${encodeURIComponent(cleanName)}&tag=techddd-22` },
    { label: '🔴 楽天',   url: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(cleanName)}/` },
    { label: '🟡 Yahoo',  url: `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(cleanName)}` },
  ]
  const fallbackUsed = [
    { label: '🗺️ キタムラ', url: `https://www.kitamura.jp/used/search/?q=${encodeURIComponent(cleanName)}` },
  ]

  function saveMemo() {
    onUpdateMemo(item.id, memoText)
    setEditingMemo(false)
  }

  return (
    <motion.div
      variants={itemVariants}
      exit="exit"
      layout
      className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 flex flex-col overflow-hidden"
    >
      {/* ── ヘッダー ── */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          {/* タイプバッジ */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              item.type === 'wishlist'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {item.type === 'wishlist' ? '⭐ 欲しいリスト' : '📦 所有済み'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {new Date(item.addedAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
          {/* レンズ名 */}
          <h3 className="font-semibold text-slate-900 dark:text-white leading-snug text-sm truncate">
            {cleanName}
          </h3>
        </div>
        <motion.button
          onClick={() => onDelete(item.id)}
          disabled={isDeleting}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-900/20 disabled:opacity-40 flex-shrink-0"
          aria-label="削除"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>

      {/* ── 価格バッジ（常時表示）── */}
      <div className="flex gap-2 flex-wrap px-4 pb-3">
        {priceInfo?.new_price ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
            🆕 {formatPrice(priceInfo.new_price)}〜
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-500">
            🆕 価格取得中
          </span>
        )}
        {priceInfo?.used_price ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
            ♻️ {formatPrice(priceInfo.used_price)}〜
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-500">
            ♻️ 中古情報なし
          </span>
        )}
      </div>

      {/* ── 折りたたみセクション群 ── */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/60 border-t border-slate-100 dark:border-slate-700/60">

        {/* メモ（欲しいリストのみ） */}
        {item.type === 'wishlist' && (
          <div className="px-4 py-2.5">
            <Collapse label="📝 なぜ欲しいか・メモ" defaultOpen={true}>
              {editingMemo ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    placeholder="なぜ欲しいか、どんな撮影に使いたいか…"
                    rows={3}
                    className="w-full rounded-md border border-amber-300 bg-white dark:bg-slate-700 dark:border-amber-600 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setMemoText(item.memo ?? ''); setEditingMemo(false) }}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400">
                      <X className="h-3 w-3" /> キャンセル
                    </button>
                    <button onClick={saveMemo}
                      className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400">
                      <Check className="h-3 w-3" /> 保存
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingMemo(true)}
                  className="flex items-start justify-between gap-2 cursor-pointer rounded-md px-2 py-1.5 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <p className="text-xs text-amber-800 dark:text-amber-300 flex-1 leading-relaxed">
                    {item.memo
                      ? item.memo
                      : <span className="italic text-amber-500/70">タップしてメモを追加…</span>}
                  </p>
                  <Pencil className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
                </div>
              )}
            </Collapse>
          </div>
        )}

        {/* レビュー・作例 */}
        <div className="px-4 py-2.5">
          <Collapse label="📋 レビュー・作例">
            <div className="flex flex-col gap-1.5">
              {hasPhotYodo
                ? reviewLinks.filter(l => l.site === 'Photo Yodobashi').map(l => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                      📷 Photo Yodobashi
                    </a>
                  ))
                : <a href={yodobashiSearchUrl(cleanName)} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                    📷 Photo Yodobashi（検索）
                  </a>
              }
              {hasKasyapa
                ? reviewLinks.filter(l => l.site === 'Kasyapa').map(l => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                      🎞️ Kasyapa
                    </a>
                  ))
                : <a href={kasyapaSearchUrl(cleanName)} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                    🎞️ Kasyapa（検索）
                  </a>
              }
              {reviewLinks.filter(l => l.site !== 'Photo Yodobashi' && l.site !== 'Kasyapa').map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                  {SITE_ICONS[l.site] ?? '🔗'} {l.site}
                </a>
              ))}
            </div>
          </Collapse>
        </div>

        {/* 新品購入リンク */}
        <div className="px-4 py-2.5">
          <Collapse label={`🛒 新品で買う${priceInfo?.new_price ? `（${formatPrice(priceInfo.new_price)}〜）` : ''}`}>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {(newLinks.length > 0 ? newLinks : fallbackNew).map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                  {l.label}
                </a>
              ))}
            </div>
          </Collapse>
        </div>

        {/* 中古購入リンク */}
        <div className="px-4 py-2.5">
          <Collapse label={`♻️ 中古で買う${priceInfo?.used_price ? `（${formatPrice(priceInfo.used_price)}〜）` : ''}`}>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {(usedLinks.length > 0 ? usedLinks : fallbackUsed).map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                  {l.label}
                </a>
              ))}
            </div>
          </Collapse>
        </div>

      </div>
    </motion.div>
  )
}

// ────────────────────────────────
// メインコンポーネント
// ────────────────────────────────
export default function WarehouseList({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const [items, setItems] = useState<StoredItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [lensLinkDb, setLensLinkDb] = useState<LensLinkData[] | null>(null)
  const [lensPriceDb, setLensPriceDb] = useState<LensPriceData[] | null>(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('warehouse') || '[]') as StoredItem[]
    setItems(stored)
    setLoaded(true)
    onCountChange?.(stored.length)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch('/lens_links.json').then(r => r.json()).then(d => setLensLinkDb(d.lenses)).catch(() => setLensLinkDb([]))
  }, [])

  useEffect(() => {
    fetch('/lens_data.json').then(r => r.json()).then(d => setLensPriceDb(d.lenses)).catch(() => setLensPriceDb([]))
  }, [])

  function handleDelete(id: number) {
    setDeletingId(id)
    const updated = items.filter((item) => item.id !== id)
    localStorage.setItem('warehouse', JSON.stringify(updated))
    setItems(updated)
    onCountChange?.(updated.length)
    setDeletingId(null)
  }

  function handleUpdateMemo(id: number, memo: string) {
    const updated = items.map(item => item.id === id ? { ...item, memo } : item)
    localStorage.setItem('warehouse', JSON.stringify(updated))
    setItems(updated)
  }

  if (!loaded) return null

  if (items.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-24 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <PackageOpen className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">倉庫は空です</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          チャットで気になったレンズを保存しましょう
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {items.map((item) => (
          <WarehouseCard
            key={item.id}
            item={item}
            onDelete={handleDelete}
            onUpdateMemo={handleUpdateMemo}
            isDeleting={deletingId === item.id}
            lensLinkDb={lensLinkDb}
            lensPriceDb={lensPriceDb}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

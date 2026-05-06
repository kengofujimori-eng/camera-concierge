'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Star, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { generateFallbackShoppingLinks, applyAffiliateToLinks } from '@/lib/affiliateLinks'

interface WarehouseItem {
  id: number
  name: string
  addedAt: string
  type: 'owned' | 'wishlist'
  tag?: string
  pros?: string
  cons?: string
  advice?: string
  aiComment?: string
  focalMin?: number
  focalMax?: number
}

// lens_links.json 型
interface ReviewLink { site: string; url: string; label: string }
interface LensLinkData { name: string; source_url: string; review_links: ReviewLink[] }
interface LensLinkDatabase { total: number; lenses: LensLinkData[] }

// lens_data.json 型
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
  image_url?: string
  image_url_external?: string
  purchase_links?: PurchaseLinks
  price_info?: PriceInfo
  photo_yodobashi_url?: string
  model_code?: string
  discontinued?: boolean
  discontinued_reason?: string
  replacement?: string
  availability_status?: 'current' | 'discontinued' | 'rare_used' | 'unknown'
  recommendation_status?: 'recommend' | 'caution' | 'avoid'
  recommendation_note?: string
}
interface LensPriceDatabase { lenses: LensPriceData[] }

// Dify の応答に「Sony」「Canon」等のブランド名が付く場合と付かない場合がある
const BRAND_PREFIX_RE = /^(Sony|Canon|Nikon|Sigma|Tamron|Viltrox|Tokina|Samyang|LAOWA|Fujifilm)\s+/i

function stripBrandPrefix(name: string): string {
  return name.replace(BRAND_PREFIX_RE, '')
}

interface LensEntry {
  name: string
  tag: string
  reason?: string
  caution?: string
}

// レンズ名として有効かを判定（mm / F数字 / 既知キーワードを含む）
const LENS_NAME_RE = /(?:\d+(?:[.\-]\d+)?mm|[Ff]\d+(?:\.\d+)?|GM|Art|Contemporary|DG\s*DN|Di\s*III|OSS|IS\b|VC\b|STF|PF\b|APO|HSM)/i

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractLensEntries(text: string): LensEntry[] {
  // ** などマークダウン装飾を除去してからマッチング
  const cleaned = text.replace(/\*{1,3}/g, '')
  const entries: LensEntry[] = []

  // ── メインパターン: 【タグ】レンズ名 ──────────────────────
  // レンズ名は英字・数字で始まり、改行／括弧／説明ダッシュの直前で終わる
  const MAIN = /【([^】]*)】\s*([A-Za-z\d][^\n（(\[—―]{3,65}?)(?=\s*[（(\[—―]|\s*\n|$)/g
  let m: RegExpExecArray | null
  while ((m = MAIN.exec(cleaned)) !== null) {
    const tag = m[1].trim()
    let name  = m[2]
      .replace(/\s+[-–—]\s+.*$/, '')   // "レンズ名 - 説明" の説明部分を除去
      .replace(/[\s、。：:・]+$/, '')   // 末尾の句読点を除去
      .trim()
    if (name.length >= 5 && LENS_NAME_RE.test(name) && !entries.some(e => e.name === name)) {
      entries.push({ name, tag })
    }
  }

  // ── フォールバック: 【...】がない場合に番号付きリストから抽出 ──
  if (entries.length === 0) {
    const FALLBACK = /(?:^|\n)(?:\d+[.．]|[-•])\s+([A-Za-z\d][A-Za-z\d\s\-/.]+)(?=\s*[-–—（\n]|$)/gm
    while ((m = FALLBACK.exec(cleaned)) !== null) {
      let name = m[1].replace(/[\s]+$/, '').trim()
      if (name.length >= 8 && LENS_NAME_RE.test(name) && !entries.some(e => e.name === name)) {
        entries.push({ name, tag: '候補' })
      }
    }
  }

  // ── 各候補ブロックから「おすすめ理由」「注意点」を抽出 ──
  const optionBlocks = cleaned
    .split(/\n\s*✨?\s*(?=【選択肢\d+】)/)
    .filter(block => /【選択肢\d+】/.test(block))

  for (const block of optionBlocks) {
    const optionMatch = block.match(/【(選択肢\d+)】\s*([^\n]+)/)
    if (!optionMatch) continue

    const tag = optionMatch[1]
    const rawName = optionMatch[2]
      .replace(/（.*?）/g, '')
      .replace(/\(.*?\)/g, '')
      .trim()

    const entry = entries.find(item => item.tag === tag)
      ?? entries.find(item => rawName.includes(item.name) || item.name.includes(rawName))

    if (!entry) continue

    const reasonMatch = block.match(/おすすめ理由\s*[：:]\s*([^\n]+)/)
    const cautionMatch = block.match(/注意点\s*[：:]\s*([^\n]+)/)

    entry.reason = reasonMatch?.[1]?.trim()
    entry.caution = cautionMatch?.[1]?.trim()
  }

  return entries
}

export function extractLensNames(text: string): string[] {
  return extractLensEntries(text).map(e => e.name)
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^\w]/g, '')
}

// マウント名・メーカー名サフィックスを除去してコアモデル名だけ残す
// 例: "VILTROX AF 75mm F1.2 Pro FE" → "viltroxaf75mmf12pro"
//     "Viltrox AF 75mm F1.2 PRO ソニーEマウント" → "viltroxaf75mmf12pro"
function stripMountInfo(str: string): string {
  return str
    // 日本語のマウント表記を除去（例: ソニーEマウント、ニコンZマウント）
    .replace(/[\u3040-\u30FF\u4E00-\u9FFF]+[A-Z]?マウント/g, '')
    // 末尾のFE, RF, Z, L, XF, GFX, E等のマウント略称を除去
    .replace(/\s+(FE|RF|Z|L|XF|GFX|EF|EF-M|EF-S|MFT|M4\/3|M43|FX|GX|EF-M)\s*$/i, '')
    // 末尾の富士フイルム、ソニー、ニコン等のブランド名を除去
    .replace(/\s+(富士フイルム|ソニー|ニコン|キヤノン|パナソニック|ライカ|シグマ)(.*?)?(マウント|用|対応)?\s*$/g, '')
}

function findLensInDatabase<T extends { name: string }>(lensName: string, db: T[]): T | null {
  const candidates = [lensName, stripBrandPrefix(lensName)]
  for (const candidate of candidates) {
    const q = normalize(candidate)
    if (q.length < 6) continue
    const exact = db.find((l) => normalize(l.name) === q)
    if (exact) return exact
    const contains = db.find((l) => {
      const n = normalize(l.name)
      return (n.includes(q) || q.includes(n)) && Math.min(n.length, q.length) >= 8
    })
    if (contains) return contains
    // マウント名を除去して再試行
    const qCore = normalize(stripMountInfo(candidate))
    if (qCore.length >= 8 && qCore !== q) {
      const mountStripped = db.find((l) => {
        const nCore = normalize(stripMountInfo(l.name))
        return nCore === qCore || (nCore.includes(qCore) && Math.min(nCore.length, qCore.length) >= 8)
      })
      if (mountStripped) return mountStripped
    }
  }
  return null
}

function extractFocal(name: string): { min: number; max: number } | null {
  const zoom = name.match(/(\d+)[–\-](\d+)\s*mm/i)
  if (zoom) return { min: parseInt(zoom[1]), max: parseInt(zoom[2]) }
  const prime = name.match(/(\d+)\s*mm/i)
  if (prime) return { min: parseInt(prime[1]), max: parseInt(prime[1]) }
  return null
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`
}

const SITE_ICONS: Record<string, string> = {
  'Photo Yodobashi': '📷',
  'Lenstip': '🔬',
  'The Digital Picture': '🖼️',
  'DPReview': '📸',
  'DxOMark': '📊',
  'Photography Life': '🌿',
}

function generateFallbackLinks(lensName: string, photoYodobashiUrl?: string, googleSampleUrl?: string) {
  const q = encodeURIComponent(lensName)
  return [
    {
      label: '📷 Photo Yodobashi',
      url: photoYodobashiUrl ?? `https://www.google.com/search?q=site:photo.yodobashi.com+${q}`,
    },
    {
      label: '🔍 Google作例検索',
      url: googleSampleUrl ?? `https://www.google.com/search?q=${q}+作例`,
    },
  ]
}

// generateFallbackShoppingLinks は @/lib/affiliateLinks から import して使用

interface LensCardProps {
  lensName: string
  lensTag: string
  index: number
  addedType: 'owned' | 'wishlist' | null
  onAdd: (name: string, type: 'owned' | 'wishlist', tag: string) => void
  lensLinkDb: LensLinkData[] | null
  lensPriceDb: LensPriceData[] | null
  aiReason?: string
  aiCaution?: string
}

function LensCard({ lensName, lensTag, index, addedType, onAdd, lensLinkDb, lensPriceDb, aiReason, aiCaution }: LensCardProps) {
  const cleanName = lensName.replace(/<[^>]*>/g, '').trim()
  const [imgUrlIndex, setImgUrlIndex] = useState(0)

  // レビューリンク (lens_links.json)
  const dbLens = lensLinkDb ? findLensInDatabase(cleanName, lensLinkDb) : null
  const uniqueReviewLinks = dbLens
    ? Object.values(
        dbLens.review_links.reduce((acc, link) => {
          if (!acc[link.site]) acc[link.site] = link
          return acc
        }, {} as Record<string, ReviewLink>)
      )
    : []
  const hasRealLinks = uniqueReviewLinks.length > 0

  // 価格・購入リンク (lens_data.json)
  const priceData = lensPriceDb ? findLensInDatabase(cleanName, lensPriceDb) : null
  const priceInfo = priceData?.price_info
  const purchaseLinks = priceData?.purchase_links
  const photoYodobashiUrl = priceData?.photo_yodobashi_url
  const modelCode = priceData?.model_code
  const googleSampleQuery = modelCode ? `${modelCode} 作例` : `${cleanName} 作例`
  const googleSampleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleSampleQuery)}`
  const fallback = generateFallbackShoppingLinks(cleanName)

  // 画像URL候補: ローカル処理済みPNG → lens_data.json外部URL → null(プレースホルダー)
  const imgCandidates: (string | null)[] = [
    priceData?.image_url ?? null,          // /lens_images_processed/[slug].png or 外部URL
    priceData?.image_url_external ?? null, // 外部URLバックアップ
    null,
  ].filter((url, i, arr) => i === 0 || url !== arr[i - 1])
  const cardImageUrl = imgCandidates[Math.min(imgUrlIndex, imgCandidates.length - 1)] ?? null
  function handleImgError() { setImgUrlIndex(i => i + 1) }

  // lens_data.json のリンクにはアフィリエイトタグを付与、なければフォールバック
  const { new: newLinks, used: usedLinks } = purchaseLinks
    ? applyAffiliateToLinks(purchaseLinks)
    : fallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: 'easeOut' }}
      className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60 overflow-hidden flex"
    >
      {/* 左: レンズ画像 */}
      <div className="w-28 flex-shrink-0 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
        {cardImageUrl ? (
          <img
            src={cardImageUrl}
            alt={cleanName}
            onError={handleImgError}
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-3xl">📷</span>
        )}
      </div>

      {/* 右: コンテンツ */}
      <div className="flex-1 p-3 min-w-0 flex flex-col">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 leading-snug">🔍 {cleanName}</p>

        {/* 価格情報バッジ */}
        {priceInfo && (priceInfo.new_price || priceInfo.used_price) && (
          <div className="mb-2 flex gap-1.5 flex-wrap">
            {priceInfo.new_price && (
              <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                🆕 {formatPrice(priceInfo.new_price)}〜
              </span>
            )}
            {priceInfo.used_price && (
              <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
                ♻️ {formatPrice(priceInfo.used_price)}〜
              </span>
            )}
          </div>
        )}

        {/* AI分析 */}
        {(aiReason || aiCaution) && (
          <details className="mb-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            <summary className="cursor-pointer select-none px-2.5 py-2 font-semibold text-slate-600 dark:text-slate-300">
              🤖 AI分析を表示
            </summary>
            <div className="border-t border-slate-200 px-2.5 py-2 dark:border-slate-700">
              {aiReason && (
                <p className="mb-1 leading-relaxed">
                  <span className="font-semibold">おすすめ理由：</span>{aiReason}
                </p>
              )}
              {aiCaution && (
                <p className="leading-relaxed">
                  <span className="font-semibold">注意点：</span>{aiCaution}
                </p>
              )}
            </div>
          </details>
        )}

        {/* レビューリンク */}
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {hasRealLinks ? '📋 レビュー・作例' : '🔎 レビュー（検索）'}
          </p>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {hasRealLinks
              ? uniqueReviewLinks.map((link) => {
                  const href = link.site === 'Photo Yodobashi' && photoYodobashiUrl ? photoYodobashiUrl : link.url
                  return (
                    <a key={link.url} href={href} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                      {SITE_ICONS[link.site] ?? '🔗'} {link.site}
                    </a>
                  )
                })
              : generateFallbackLinks(cleanName, photoYodobashiUrl, googleSampleUrl).map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                    {link.label}
                  </a>
                ))}
          </div>
        </div>

        {/* 購入リンク */}
        <div className="mb-3 space-y-1">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">
              🛒 新品{priceInfo?.new_price ? `（${formatPrice(priceInfo.new_price)}〜）` : ''}
            </p>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              {newLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">
              ♻️ 中古{priceInfo?.used_price ? `（${formatPrice(priceInfo.used_price)}〜）` : ''}
            </p>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              {usedLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 倉庫追加ボタン */}
        <div className="mt-auto">
          {addedType ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
                <Check className="h-3 w-3" />
                {addedType === 'owned' ? '所有済みに追加済み' : '欲しいリストに追加済み'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onAdd(cleanName, addedType === 'owned' ? 'wishlist' : 'owned', lensTag)}
                  className="flex-1 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 underline transition-colors py-0.5">
                  {addedType === 'owned' ? '→ 欲しいリストに変更' : '→ 所有済みに変更'}
                </button>
                {addedType === 'wishlist' && (
                  <Link href="/warehouse?tab=wishlist"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline py-0.5">
                    倉庫で確認 <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={() => onAdd(cleanName, 'owned', lensTag)}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25 dark:hover:bg-blue-500/25 transition-colors">
                <Package className="h-3 w-3" />
                所有済み
              </button>
              <button
                onClick={() => onAdd(cleanName, 'wishlist', lensTag)}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25 dark:hover:bg-amber-500/25 transition-colors">
                <Star className="h-3 w-3" />
                欲しいリスト
              </button>
            </div>
          )}
        </div>
      </div>{/* /右コンテンツ */}
    </motion.div>
  )
}

export default function LensRecommendationCards({ responseText }: { responseText: string }) {
  const lensEntries = extractLensEntries(responseText)
  const [addedItems, setAddedItems] = useState<Record<string, 'owned' | 'wishlist'>>({})
  const [lensLinkDb, setLensLinkDb] = useState<LensLinkData[] | null>(null)
  const [lensPriceDb, setLensPriceDb] = useState<LensPriceData[] | null>(null)

  // lens_links.json（レビューリンク）
  useEffect(() => {
    fetch('/lens_links.json')
      .then((r) => r.json())
      .then((d: LensLinkDatabase) => setLensLinkDb(d.lenses))
      .catch(() => setLensLinkDb([]))
  }, [])

  // lens_data.json（価格・購入リンク）
  useEffect(() => {
    fetch('/lens_data.json')
      .then((r) => r.json())
      .then((d: LensPriceDatabase) => setLensPriceDb(d.lenses))
      .catch(() => setLensPriceDb([]))
  }, [])

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('warehouse') ?? '[]') as WarehouseItem[]
      const added: Record<string, 'owned' | 'wishlist'> = {}
      existing.forEach((item) => { added[item.name] = item.type ?? 'owned' })
      setAddedItems(added)
    } catch { /* ignore */ }
  }, [])

  // lens_data.json で discontinued: true のレンズは推薦カードに表示しない
  const visibleLensEntries = lensPriceDb
    ? lensEntries.filter((entry) => {
        const priceData = findLensInDatabase(entry.name, lensPriceDb)
        return priceData?.discontinued !== true
      })
    : []

  function addToWarehouse(lensName: string, type: 'owned' | 'wishlist', tag: string) {
    // ── このレンズの【タグ】セクション内テキストを抽出 ──
    function extractLensSection(text: string, lensTag: string): string {
      const esc = lensTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const start = new RegExp(`【${esc}】[^\n]*\n`, 'i')
      const m = text.match(start)
      if (!m) return ''
      const idx = text.indexOf(m[0]) + m[0].length
      const rest = text.slice(idx)
      // 次の【（この機材...】以外）か 私の結論 で終了
      const end = rest.search(/\n【(?!この機材|[🛒📦])/)
      return end === -1 ? rest.slice(0, 800) : rest.slice(0, end)
    }

    // ── 特定ラベルの箇条書きを抽出 ──
    function extractBullet(section: string, label: string): string | undefined {
      const pattern = new RegExp(`\\*\\*${label}[：:]\\*\\*\\s*([^\n]+(?:\n(?![•\\*])[^\n]+)*)`, 'i')
      const alt     = new RegExp(`${label}[：:]\\s*([^\n]+(?:\n(?![•\\*])[^\n]+)*)`, 'i')
      const m = section.match(pattern) ?? section.match(alt)
      return m ? m[1].trim() : undefined
    }

    // ── 私の結論 を抽出 ──
    function extractConclusion(text: string): string {
      const clean = text
        .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
        .replace(/【[^】]*】[^\n]*/g, '').replace(/（※[^）]*）/g, '')
        .replace(/\n{3,}/g, '\n\n').trim()
      const m = clean.match(/私の結論[：:\s][\s\S]{10,}/)
        ?? clean.match(/結論[：:\s][\s\S]{10,}/)
        ?? clean.match(/まとめ[：:\s][\s\S]{10,}/)
      if (m) return m[0].trim().slice(0, 350)
      const paras = clean.split(/\n\n+/).filter(p => p.trim().length > 15)
      return paras.slice(-2).join('\n\n').slice(0, 300)
    }

    const lensSection = extractLensSection(responseText, tag)
    const pros    = extractBullet(lensSection, '長所')
    const cons    = extractBullet(lensSection, '短所')
    const advice  = extractBullet(lensSection, 'マスターのアドバイス')
      ?? extractBullet(lensSection, 'アドバイス')
    const aiComment = extractConclusion(responseText)
    try {
      const existing = JSON.parse(localStorage.getItem('warehouse') ?? '[]') as WarehouseItem[]
      const existingIndex = existing.findIndex((item) => item.name === lensName)

      if (existingIndex === -1) {
        const focal = extractFocal(lensName)
        existing.push({
          id: Date.now(),
          name: lensName,
          addedAt: new Date().toISOString(),
          type, tag, pros, cons, advice, aiComment,
          focalMin: focal?.min,
          focalMax: focal?.max,
        })
      } else {
        // typeの切り替え時は既存のanalysisを保持し、新しい値がある場合だけ上書き
        const prev = existing[existingIndex]
        existing[existingIndex] = {
          ...prev,
          type,
          tag:       tag       || prev.tag,
          pros:      pros      ?? prev.pros,
          cons:      cons      ?? prev.cons,
          advice:    advice    ?? prev.advice,
          aiComment: aiComment ?? prev.aiComment,
        }
      }

      localStorage.setItem('warehouse', JSON.stringify(existing))
      window.dispatchEvent(new Event('warehouseUpdated'))
      setAddedItems((prev) => ({ ...prev, [lensName]: type }))
    } catch (e) { console.error(e) }
  }

  if (lensEntries.length === 0) return null
  if (lensPriceDb === null) return null
  if (visibleLensEntries.length === 0) return null

  return (
    <div className="mt-4 space-y-3">
      {visibleLensEntries.map((entry, i) => (
        <LensCard
          key={entry.name}
          lensName={entry.name}
          lensTag={entry.tag}
          index={i}
          addedType={addedItems[entry.name] ?? null}
          onAdd={addToWarehouse}
          lensLinkDb={lensLinkDb}
          lensPriceDb={lensPriceDb}
          aiReason={entry.reason}
          aiCaution={entry.caution}
        />
      ))}
    </div>
  )
}

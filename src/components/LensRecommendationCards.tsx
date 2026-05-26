'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Star, Check, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { generateFallbackShoppingLinks, applyAffiliateToLinks, type ShoppingLinks } from '@/lib/affiliateLinks'

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
interface LensLinkData { name: string; source_url: string; review_links: ReviewLink[]; model_code?: string; brand?: string; maker?: string }
interface LensLinkDatabase { total: number; lenses: LensLinkData[] }

// lens_data.json 型
interface PurchaseLinks {
  new?: { amazon?: string; rakuten?: string; yahoo?: string } | null
  used?: { kitamura?: string; mapcamera?: string } | null
}
interface PriceInfo {
  new_price: number | null
  used_price: number | null
  fetched_at: string | null
}
interface LensPriceData {
  name: string
  aliases?: string[]
  source_url?: string
  official_url?: string
  brand?: string
  maker?: string
  mount?: string
  supported_mounts?: string[]
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

function mergeShoppingLinks(primary: ShoppingLinks, fallback: ShoppingLinks): ShoppingLinks {
  return {
    new: primary.new.length > 0 ? primary.new : fallback.new,
    used: primary.used.length > 0 ? primary.used : fallback.used,
  }
}

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

function normalizeModelCode(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function tokenizeName(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/f(\d+)\.(\d+)/g, 'f$1$2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function canonicalTokenKey(str: string): string {
  return tokenizeName(str).sort().join('|')
}

function inferBrandFromText(text?: string): string | null {
  if (!text) return null
  const normalizedText = text.toLowerCase()
  const brands = ['sony', 'canon', 'nikon', 'sigma', 'tamron', 'viltrox', 'tokina', 'samyang', 'laowa', 'fujifilm']
  return brands.find((brand) => normalizedText.includes(brand)) ?? null
}

function inferBrand<T extends { name: string; brand?: string; maker?: string; source_url?: string; official_url?: string }>(lens: T): string | null {
  return (
    inferBrandFromText(lens.brand)
    ?? inferBrandFromText(lens.maker)
    ?? inferBrandFromText(lens.name)
    ?? inferBrandFromText(lens.official_url)
    ?? inferBrandFromText(lens.source_url)
  )
}

// マウント名・メーカー名サフィックスを除去してコアモデル名だけ残す
// 例: "VILTROX AF 75mm F1.2 Pro FE" → "viltroxaf75mmf12pro"
//     "Viltrox AF 75mm F1.2 PRO ソニーEマウント" → "viltroxaf75mmf12pro"
function stripMountInfo(str: string): string {
  return str
    // 日本語のマウント表記を除去（例: ソニーEマウント、ニコンZマウント）
    .replace(/[\u3040-\u30FF\u4E00-\u9FFF]+[A-Z]?マウント/g, '')
    // 英語のマウント表記を除去（例: Z-mount, RF mount, L mount）
    .replace(/\s+(sony\s*e|e-?mount|nikon\s*z|z-?mount|canon\s*rf|rf-?s?|rf-?mount|leica\s*l|l-?mount|leica\s*m|m-?mount|fujifilm\s*x|x-?mount|mft|micro\s*4\/?3)\s*$/i, '')
    // 末尾のFE, RF, Z, L, XF, GFX, E等のマウント略称を除去
    .replace(/\s+(FE|RF|Z|L|XF|GFX|EF|EF-M|EF-S|MFT|M4\/3|M43|FX|GX|EF-M)\s*$/i, '')
    // 末尾の富士フイルム、ソニー、ニコン等のブランド名を除去
    .replace(/\s+(富士フイルム|ソニー|ニコン|キヤノン|パナソニック|ライカ|シグマ)(.*?)?(マウント|用|対応)?\s*$/g, '')
}

function findLensInDatabase<T extends { name: string; aliases?: string[]; brand?: string; maker?: string; source_url?: string; official_url?: string; model_code?: string }>(lensName: string, db: T[]): T | null {
  const candidates = [lensName, stripBrandPrefix(lensName)]
  const queryBrand = inferBrandFromText(lensName)

  for (const candidate of candidates) {
    const q = normalize(candidate)
    if (q.length < 6) continue
    const exactMatches = db.filter((l) => [l.name, ...(l.aliases ?? [])].some((name) => normalize(name) === q))
    if (exactMatches.length > 0) {
      return exactMatches.find((l) => !queryBrand || inferBrand(l) === queryBrand) ?? exactMatches[0]
    }

    // マウント名を除去して再試行
    const qCore = normalize(stripMountInfo(candidate))
    if (qCore.length >= 8 && qCore !== q) {
      const mountStripped = db.filter((l) => {
        return [l.name, ...(l.aliases ?? [])].some((name) => normalize(stripMountInfo(name)) === qCore)
      })
      if (mountStripped.length > 0) {
        return mountStripped.find((l) => !queryBrand || inferBrand(l) === queryBrand) ?? mountStripped[0]
      }
    }
  }

  const scored = db
    .map((lens) => {
      const lensBrand = inferBrand(lens)
      const brandMatches = !queryBrand || lensBrand === queryBrand
      const qFull = normalize(lensName)
      const qCore = normalize(stripMountInfo(stripBrandPrefix(lensName)))
      const qTokens = canonicalTokenKey(lensName)
      const qCoreTokens = canonicalTokenKey(stripMountInfo(stripBrandPrefix(lensName)))
      const names = [lens.name, ...(lens.aliases ?? [])]
      const modelCode = lens.model_code ? normalizeModelCode(lens.model_code) : ''
      const qModel = normalizeModelCode(lensName)

      let score = 0
      if (modelCode && (qModel === modelCode || qModel.includes(modelCode))) score = Math.max(score, 120)
      for (const candidateName of names) {
        const nameFull = normalize(candidateName)
        const nameCore = normalize(stripMountInfo(stripBrandPrefix(candidateName)))
        const nameTokens = canonicalTokenKey(candidateName)
        const nameCoreTokens = canonicalTokenKey(stripMountInfo(stripBrandPrefix(candidateName)))

        if (nameTokens && nameTokens === qTokens) score = Math.max(score, 100)
        if (nameCoreTokens && nameCoreTokens === qCoreTokens) score = Math.max(score, 92)
        if (nameFull === qFull) score = Math.max(score, 90)
        if (nameCore === qCore) score = Math.max(score, 82)
        if ((nameFull.includes(qFull) || qFull.includes(nameFull)) && Math.min(nameFull.length, qFull.length) >= 10) {
          score = Math.max(score, 45)
        }
        if ((nameCore.includes(qCore) || qCore.includes(nameCore)) && Math.min(nameCore.length, qCore.length) >= 10) {
          score = Math.max(score, 40)
        }
      }

      if (queryBrand) score += brandMatches ? 20 : -80
      score += Math.min(normalize(lens.name).length, 30) / 100
      return { lens, score }
    })
    .filter(({ score }) => score >= 60)
    .sort((a, b) => b.score - a.score)

  if (scored.length > 0) return scored[0].lens

  return null
}

type MountFamily =
  | 'sony-e'
  | 'canon-rf'
  | 'canon-rf-s'
  | 'nikon-z'
  | 'fujifilm-x'
  | 'fujifilm-gfx'
  | 'l-mount'
  | 'leica-m'
  | 'm43'

function normalizeMountFamily(text?: string): MountFamily | null {
  if (!text) return null
  const normalized = text.toLowerCase()

  if (/leica\s*m|ライカm/.test(normalized)) return 'leica-m'
  if (/micro\s*4\/?3|mft|m4\/?3|マイクロフォーサーズ/.test(normalized)) return 'm43'
  if (/fujifilm\s*gfx|fuji\s*gfx|gfx|富士フイルムgfx/.test(normalized)) return 'fujifilm-gfx'
  if (/fujifilm\s*x|fuji\s*x|xf\b|富士フイルムx/.test(normalized)) return 'fujifilm-x'
  if (/nikon\s*z|z\s*mount|zマウント|ニコンz/.test(normalized)) return 'nikon-z'
  if (/canon\s*rf-?s|rf-?s|rf-sマウント|rf-s|キヤノンrf-s|キャノンrf-s/.test(normalized)) return 'canon-rf-s'
  if (/canon\s*rf|rf\s*mount|rfマウント|キヤノンrf|キャノンrf/.test(normalized)) return 'canon-rf'
  if (/sony\s*e|e\s*mount|eマウント|ソニーe|\bfe\b/.test(normalized)) return 'sony-e'
  if (/\bl\s*mount\b|lマウント|ライカl|leica\s*l/.test(normalized)) return 'l-mount'

  return null
}

function getLensMountFamilies(lens?: Pick<LensPriceData, 'mount' | 'supported_mounts'> | null): MountFamily[] {
  if (!lens) return []
  const rawMounts = lens.supported_mounts?.length ? lens.supported_mounts : lens.mount ? lens.mount.split(/[、,/]+|\s+\+\s+/) : []
  const families = rawMounts
    .map((mount) => normalizeMountFamily(mount))
    .filter((mount): mount is MountFamily => mount !== null)

  return Array.from(new Set(families))
}

function getAllowedLensFamiliesForSelectedMount(selectedFamily: MountFamily): MountFamily[] {
  if (selectedFamily === 'canon-rf-s') return ['canon-rf-s', 'canon-rf']
  return [selectedFamily]
}

function hasClearlyIncompatibleMountToken(lensName: string, selectedMountPrompt?: string): boolean {
  const selectedFamily = normalizeMountFamily(selectedMountPrompt)
  if (!selectedFamily) return false

  const normalized = lensName.toLowerCase()

  if (selectedFamily === 'canon-rf' || selectedFamily === 'canon-rf-s') {
    return (
      /\bxf\b/i.test(lensName)
      || /fujifilm|fuji\s*x|x-?mount|xマウント|富士フイルムx|富士フイルム.*マウント/i.test(lensName)
      || /sony\s*e|e-?mount|eマウント|\bfe\b/i.test(lensName)
      || /nikon\s*z|z-?mount|zマウント|ニコンz/i.test(lensName)
      || /micro\s*4\/?3|mft|m4\/?3|マイクロフォーサーズ/i.test(lensName)
      || /leica\s*l|l-?mount|lマウント|ライカl/i.test(lensName)
      || /Viltrox\s+AF\s+75mm\s+F1\.2/i.test(lensName)
      || /Viltrox\s+AF\s+85mm\s+F1\.8/i.test(lensName)
      || /アダプター併用|アダプター前提|adapter/i.test(normalized)
    )
  }

  return false
}

function isClearlyIncompatibleWithSelectedMount(
  lens: Pick<LensPriceData, 'mount' | 'supported_mounts'> | null,
  selectedMountPrompt?: string
): boolean {
  const selectedFamily = normalizeMountFamily(selectedMountPrompt)
  if (!selectedFamily) return false

  const lensFamilies = getLensMountFamilies(lens)
  if (lensFamilies.length === 0) return false

  const allowedFamilies = getAllowedLensFamiliesForSelectedMount(selectedFamily)
  return !lensFamilies.some((family) => allowedFamilies.includes(family))
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
  const uniqueReviewLinks = dbLens?.review_links?.length
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
    ? mergeShoppingLinks(applyAffiliateToLinks(purchaseLinks), fallback)
    : fallback

  return (
    <motion.div
      data-testid="lens-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: 'easeOut' }}
      className="group rounded-2xl bg-slate-200/90 p-[1.5px] shadow-lg shadow-slate-200/70 transition-all hover:bg-[linear-gradient(90deg,#418CB7_0%,#FF8570_100%)] hover:shadow-xl hover:shadow-slate-300/60 dark:bg-white/10 dark:shadow-black/20 dark:hover:bg-[linear-gradient(90deg,#418CB7_0%,#FF8570_100%)]"
    >
      <div className="flex overflow-hidden rounded-[14.5px] bg-white dark:bg-slate-900">
        {/* 左: レンズ画像 */}
      <div className="w-24 sm:w-28 flex-shrink-0 bg-white dark:bg-slate-950 flex items-center justify-center overflow-hidden border-r border-slate-200/80 dark:border-white/10">
        {cardImageUrl ? (
          <img
            data-testid="lens-card-image"
            src={cardImageUrl}
            alt={cleanName}
            onError={handleImgError}
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain p-2.5"
          />
        ) : (
          <span data-testid="lens-card-placeholder" className="text-2xl text-slate-300 dark:text-slate-600">📷</span>
        )}
      </div>

      {/* 右: コンテンツ */}
      <div className="flex-1 min-w-0 p-3.5 flex flex-col">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug tracking-normal">{cleanName}</p>

        {/* 価格情報バッジ */}
        {priceInfo && (priceInfo.new_price || priceInfo.used_price) && (
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {priceInfo.new_price && (
              <span data-testid="price-badge" className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300">
                新品 {formatPrice(priceInfo.new_price)}〜
              </span>
            )}
            {priceInfo.used_price && (
              <span data-testid="price-badge" className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300">
                中古 {formatPrice(priceInfo.used_price)}〜
              </span>
            )}
          </div>
        )}

        {/* AI分析 */}
        {(aiReason || aiCaution) && (
          <details className="mt-3 overflow-hidden rounded-xl border border-indigo-200/80 bg-indigo-50/40 text-xs text-slate-700 shadow-sm shadow-indigo-500/5 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-slate-300">
            <summary className="cursor-pointer select-none px-3 py-2.5 font-semibold text-violet-700 transition-colors hover:text-violet-900 dark:text-indigo-200 dark:hover:text-white">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AIが選んだ理由を見る
              </span>
              <span className="ml-2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                推薦理由・注意点
              </span>
            </summary>
            <div className="border-t border-indigo-100/80 bg-white/70 px-3 py-2.5 dark:border-indigo-400/20 dark:bg-slate-950/30">
              {aiReason && (
                <p className="mb-1.5 leading-relaxed">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">おすすめ理由：</span>{aiReason}
                </p>
              )}
              {aiCaution && (
                <p className="leading-relaxed">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">注意点：</span>{aiCaution}
                </p>
              )}
            </div>
          </details>
        )}

        {/* レビューリンク */}
        <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-700/60">
          <p className="mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {hasRealLinks ? 'レビュー・作例' : 'レビュー検索'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {hasRealLinks
              ? uniqueReviewLinks.map((link) => {
                  const href = link.site === 'Photo Yodobashi' && photoYodobashiUrl ? photoYodobashiUrl : link.url
                  return (
                    <a key={link.url} href={href} target="_blank" rel="noopener noreferrer"
                      className="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300">
                      {SITE_ICONS[link.site] ? `${SITE_ICONS[link.site]} ` : ''}{link.site}
                    </a>
                  )
                })
              : generateFallbackLinks(cleanName, photoYodobashiUrl, googleSampleUrl).map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300">
                    {link.label.replace(/^[📷🔍]\s*/, '')}
                  </a>
                ))}
          </div>
        </div>

        {/* 購入リンク */}
        <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-700/60">
          <p className="mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">購入先</p>
          <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-700/60 dark:bg-slate-900/25">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start">
              <p className="shrink-0 text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:w-24">
                新品{priceInfo?.new_price ? ` ${formatPrice(priceInfo.new_price)}〜` : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
              {newLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-7 items-center rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15">
                  {link.label}
                </a>
              ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start">
              <p className="shrink-0 text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:w-24">
                中古{priceInfo?.used_price ? ` ${formatPrice(priceInfo.used_price)}〜` : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
              {usedLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-7 items-center rounded-full border border-emerald-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/15">
                  {link.label}
                </a>
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* 倉庫追加ボタン */}
        <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-700/60">
          {addedType ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25">
                <Check className="h-3 w-3" />
                {addedType === 'owned' ? '所有済みに追加済み' : '欲しいリストに追加済み'}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <button
                  onClick={() => onAdd(cleanName, addedType === 'owned' ? 'wishlist' : 'owned', lensTag)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-2 decoration-slate-300 transition-colors py-0.5">
                  {addedType === 'owned' ? '→ 欲しいリストに変更' : '→ 所有済みに変更'}
                </button>
                {addedType === 'wishlist' && (
                  <Link href="/warehouse?tab=wishlist"
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 decoration-blue-200 py-0.5">
                    倉庫で確認 <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAdd(cleanName, 'owned', lensTag)}
                className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25 dark:hover:bg-blue-500/25 transition-colors">
                <Package className="h-3 w-3" />
                所有済み
              </button>
              <button
                onClick={() => onAdd(cleanName, 'wishlist', lensTag)}
                className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25 dark:hover:bg-amber-500/25 transition-colors">
                <Star className="h-3 w-3" />
                欲しいリスト
              </button>
            </div>
          )}
        </div>
      </div>{/* /右コンテンツ */}
      </div>
    </motion.div>
  )
}

export default function LensRecommendationCards({
  responseText,
  selectedMountPrompt,
}: {
  responseText: string
  selectedMountPrompt?: string
}) {
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
        if (priceData?.discontinued === true) return false
        if (hasClearlyIncompatibleMountToken(entry.name, selectedMountPrompt)) return false
        if (isClearlyIncompatibleWithSelectedMount(priceData, selectedMountPrompt)) return false
        return true
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

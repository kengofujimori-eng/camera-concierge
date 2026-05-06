/**
 * lensContext.ts
 * ユーザーのメッセージからレンズ名を検出し、
 * lens_data.json の価格情報・レビューリンクを
 * Difyへの送信前にコンテキストとして注入するためのユーティリティ
 */

import path from 'path'
import fs from 'fs'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

interface ReviewLinkEntry {
  site: string
  url: string
  label?: string
}

// 旧形式 {"0": {site, url, label}, ...} と新形式 {"asobinet": "url", ...} の両方に対応
type ReviewLinks = Record<string, string | ReviewLinkEntry>

interface PriceInfo {
  new_price?: number | null
  used_price?: number | null
  fetched_at?: string
  kakaku_url?: string
}

interface Lens {
  name: string
  review_links?: ReviewLinks
  price_info?: PriceInfo
  discontinued?: boolean
  discontinued_reason?: string
  replacement?: string
  availability_status?: 'current' | 'discontinued' | 'rare_used' | 'unknown'
  recommendation_status?: 'recommend' | 'caution' | 'avoid'
  recommendation_note?: string
  [key: string]: unknown
}

// ─── キャッシュ ───────────────────────────────────────────────────────────────

let _cache: Lens[] | null = null
let _cacheTime = 0
const CACHE_TTL_MS = 60 * 60 * 1000  // 1時間

// 廃盤レンズリストのキャッシュ
let _discontinuedCache: string | null = null

function getLenses(): Lens[] {
  const now = Date.now()
  if (_cache && now - _cacheTime < CACHE_TTL_MS) return _cache

  const filePath = path.join(process.cwd(), 'public', 'lens_data.json')
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as { lenses: Lens[] }
  _cache = raw.lenses
  _cacheTime = now
  return _cache
}

// ─── 名前正規化・マッチング ───────────────────────────────────────────────────

function normalizeForMatch(text: string): string {
  return text
    .replace(/[　-鿿＀-￯]+/g, ' ')       // 日本語→スペース（日本語レンズ名に対応）
    .replace(/f\//gi, 'f')               // f/1.4 → f1.4
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenScore(lensName: string, message: string): number {
  const normLens = normalizeForMatch(lensName)
  const normMsg  = normalizeForMatch(message)
  const tokens   = normLens.split(' ').filter(t => t.length > 1)
  if (tokens.length === 0) return 0
  const hits = tokens.filter(t => normMsg.includes(t)).length
  return hits / tokens.length
}

/**
 * メッセージ中で言及されているレンズを検出して返す（最大 maxResults 本）
 * スコア閾値 0.6 以上のみ（誤検出を減らすため高めに設定）
 */
export function findMentionedLenses(message: string, maxResults = 2): Lens[] {
  const lenses = getLenses()

  const scored = lenses
    .map(lens => ({ lens, score: tokenScore(lens.name, message) }))
    .filter(s => s.score >= 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  return scored.map(s => s.lens)
}

// ─── コンテキスト組み立て ─────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  asobinet: 'とるなら (asobinet)',
  lenstip:  'Lenstip',
  dpreview: 'DPReview',
}

function formatReviewLinks(links: ReviewLinks | undefined): string[] {
  if (!links) return []
  const lines: string[] = []

  for (const [key, value] of Object.entries(links)) {
    // _meta 系フィールドはスキップ
    if (key.startsWith('_')) continue

    if (typeof value === 'string') {
      // 新形式: asobinet / lenstip / dpreview
      const label = SOURCE_LABELS[key] || key
      lines.push(`  ・${label}: ${value}`)
    } else if (value && typeof value === 'object' && 'url' in value) {
      // 旧形式: {site, url, label}
      const label = value.label || value.site
      lines.push(`  ・${label}: ${value.url}`)
    }
  }

  return lines
}

/**
 * 廃盤・販売終了レンズのリストをDifyへの推薦禁止コンテキストとして返す
 * discontinued_lenses.json を読み込み、キャッシュする
 */
export function buildDiscontinuedContext(): string {
  if (_discontinuedCache !== null) return _discontinuedCache

  try {
    const discontinuedMap = new Map<string, string>()

    // 手動管理の廃盤・旧世代レンズリスト
    try {
      const filePath = path.join(process.cwd(), 'public', 'discontinued_lenses.json')
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
        lenses: { name: string; reason: string }[]
      }

      for (const lens of raw.lenses ?? []) {
        if (lens.name) {
          discontinuedMap.set(lens.name, lens.reason || '廃盤・販売終了・旧世代品')
        }
      }
    } catch {
      // discontinued_lenses.json が読めない場合も lens_data.json 側の情報は使う
    }

    // lens_data.json 側で discontinued: true のものも推薦禁止に含める
    for (const lens of getLenses()) {
      if (lens.discontinued === true) {
        const reason = [
          typeof lens.discontinued_reason === 'string' ? lens.discontinued_reason : '廃盤・販売終了・旧世代品',
          typeof lens.replacement === 'string' ? `代替候補: ${lens.replacement}` : '',
        ].filter(Boolean).join(' / ')

        discontinuedMap.set(lens.name, reason)
      }
    }

    if (discontinuedMap.size === 0) {
      _discontinuedCache = ''
      return ''
    }

    const items = Array.from(discontinuedMap.entries())
      .map(([name, reason]) => `・${name}（${reason}）`)
      .join('\n')

    _discontinuedCache = [
      '[推薦禁止レンズリスト（廃盤・旧世代品）ユーザーには表示不要]',
      '以下のレンズは廃盤・販売終了・旧世代、または現時点で通常購入しづらいため、ユーザーへの通常推薦に使わないでください。',
      'ユーザーがそのレンズ名を明示的に質問した場合のみ、廃盤・旧世代であることを説明し、現行の代替候補を優先してください。',
      items,
      '[推薦禁止リスト終わり]',
    ].join('\n')
  } catch {
    _discontinuedCache = ''
  }

  return _discontinuedCache
}

/**
 * 検出されたレンズ群からDify注入用のコンテキスト文字列を生成する
 * レンズが見つからない場合は空文字列を返す（そのまま送信）
 */
export function buildLensContext(lenses: Lens[]): string {
  if (lenses.length === 0) return ''

  const blocks = lenses.map(lens => {
    const lines: string[] = [`■ ${lens.name}`]

    // 推薦ステータス
    if (lens.availability_status) {
      lines.push(`  入手性ステータス : ${lens.availability_status}`)
    }
    if (lens.recommendation_status) {
      lines.push(`  推薦ステータス : ${lens.recommendation_status}`)
    }
    if (lens.recommendation_note) {
      lines.push(`  推薦メモ : ${lens.recommendation_note}`)
    }

    // 価格情報
    const pi = lens.price_info
    if (pi?.new_price) {
      lines.push(`  新品最安値 : ¥${pi.new_price.toLocaleString()} (価格.com / ${pi.fetched_at ?? ''})`)
    }
    if (pi?.used_price) {
      lines.push(`  中古最安値 : ¥${pi.used_price.toLocaleString()} (価格.com / ${pi.fetched_at ?? ''})`)
    }

    // レビューリンク
    const reviewLines = formatReviewLinks(lens.review_links)
    if (reviewLines.length > 0) {
      lines.push('  レビュー参考リンク（AIが参照可能）:')
      lines.push(...reviewLines)
    }

    return lines.join('\n')
  })

  return [
    '[参考データ: lens_data.json より自動取得 / ユーザーには表示不要]',
    blocks.join('\n\n'),
    '[ここからユーザーの質問]',
  ].join('\n')
}

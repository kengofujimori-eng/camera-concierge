#!/usr/bin/env node
/**
 * update-amazon-links.js
 * Amazonの検索URL (/s?k=...) をASIN直リンク (/dp/{ASIN}) に置き換えるスクリプト
 *
 * 背景:
 *   検索URLは検索結果に競合商品・中古出品が並ぶためCVRが低い。
 *   ASIN直リンクは generateAmazonProductUrl() と同形式に統一する。
 *
 * データソース:
 *   data/amazon_asin_map.json  … { "レンズ名": "ASIN" } のマッピング
 *   ※ ASINの収集は --worklist で生成したCSVを手動で埋める。
 *     Amazon検索結果の自動スクレイピングはアソシエイト規約違反のため行わない。
 *
 * 使い方:
 *   node scripts/update-amazon-links.js --worklist        # 優先順位付きCSVを audit-output/ に生成
 *   node scripts/update-amazon-links.js --import <csv>    # 記入済みCSVを asin_map にマージ
 *   node scripts/update-amazon-links.js --dry-run         # 適用内容の確認のみ
 *   node scripts/update-amazon-links.js                   # asin_map を lens_data.json に適用
 *   node scripts/update-amazon-links.js --report          # ASIN化のカバレッジを表示
 */

const fs = require('fs')
const path = require('path')

// ─── 設定 ─────────────────────────────────────────────────────────────────────

// src/lib/affiliateLinks.ts の AMAZON_TAG と必ず一致させること
const AMAZON_TAG = 'techddd-22'
const AMAZON_JP_HOST = 'www.amazon.co.jp'

const ROOT = path.join(__dirname, '..')
const LENS_DATA_PATH = path.join(ROOT, 'public', 'lens_data.json')
const ASIN_MAP_PATH = path.join(ROOT, 'data', 'amazon_asin_map.json')
const AUDIT_DIR = path.join(ROOT, 'audit-output')
const WORKLIST_PATH = path.join(AUDIT_DIR, 'amazon-asin-worklist.csv')

const ASIN_RE = /^[A-Z0-9]{10}$/
const DP_PATH_RE = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i

// ─── ユーティリティ ───────────────────────────────────────────────────────────

function loadJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    if (fallback !== undefined) return fallback
    console.error(`❌ 読み込み失敗: ${p}`)
    process.exit(1)
  }
}

function saveJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n')
}

/** generateAmazonProductUrl() と同形式のASIN直リンクを生成 */
function buildDpUrl(asin) {
  return `https://${AMAZON_JP_HOST}/dp/${asin.toUpperCase()}/ref=nosim?tag=${AMAZON_TAG}`
}

function getAmazonUrl(lens) {
  return lens.purchase_links?.new?.amazon ?? null
}

function classifyUrl(url) {
  if (!url) return 'none'
  if (DP_PATH_RE.test(url)) return 'dp'
  if (url.includes('/s?k=') || url.includes('/s/?')) return 'search'
  return 'other'
}

// ─── CSV (簡易・引用符対応) ───────────────────────────────────────────────────

function csvEscape(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function parseCsv(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field); field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(f => f !== '')) rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

// ─── worklist 生成 ────────────────────────────────────────────────────────────

/**
 * 優先順位スコア:
 *   実際にクリック→購入されやすいレンズから埋める。
 *   - recommend は最優先、avoid / discontinued は後回し
 *   - Amazonで現実的に売れる価格帯 (3万〜50万) を優遇
 *     (超望遠の100万円超はAmazon経由の成約がほぼ見込めない)
 */
function priorityScore(lens) {
  let score = 0
  const price = lens.price_info?.new_price ?? 0

  if (lens.recommendation_status === 'recommend') score += 1000
  if (lens.recommendation_status === 'avoid') score -= 1000
  if (lens.availability_status === 'discontinued') score -= 800
  if (lens.availability_status === 'rare_used') score -= 500

  if (price >= 30000 && price <= 500000) score += 500
  // 同価格帯内では高いほどインパクト大
  score += Math.min(price, 500000) / 10000

  return score
}

function cmdWorklist(lenses, asinMap) {
  const targets = lenses
    .filter(l => classifyUrl(getAmazonUrl(l)) === 'search' && !asinMap[l.name])
    .sort((a, b) => priorityScore(b) - priorityScore(a))

  const header = ['name', 'mount', 'brand', 'new_price', 'recommendation_status', 'amazon_search_url', 'asin']
  const lines = [header.join(',')]
  for (const l of targets) {
    lines.push([
      csvEscape(l.name),
      csvEscape(l.mount ?? ''),
      csvEscape(l.brand ?? ''),
      l.price_info?.new_price ?? '',
      l.recommendation_status ?? '',
      csvEscape(getAmazonUrl(l) ?? ''),
      '', // ← ここにASINを記入する
    ].join(','))
  }

  fs.mkdirSync(AUDIT_DIR, { recursive: true })
  fs.writeFileSync(WORKLIST_PATH, lines.join('\n') + '\n')
  console.log(`✅ ワークリスト生成: ${path.relative(ROOT, WORKLIST_PATH)} (${targets.length}件)`)
  console.log('   amazon_search_url を開く → 該当商品ページのURLから /dp/ 直後の10桁を asin 列に記入')
  console.log('   記入後: node scripts/update-amazon-links.js --import audit-output/amazon-asin-worklist.csv')
}

// ─── CSV インポート ───────────────────────────────────────────────────────────

function cmdImport(csvPath, lenses, asinMap) {
  const text = fs.readFileSync(csvPath, 'utf8')
  const rows = parseCsv(text)
  const header = rows[0].map(h => h.trim().toLowerCase())
  const nameIdx = header.indexOf('name')
  const asinIdx = header.indexOf('asin')
  if (nameIdx === -1 || asinIdx === -1) {
    console.error('❌ CSVに name / asin 列が見つかりません')
    process.exit(1)
  }

  const knownNames = new Set(lenses.map(l => l.name))
  let added = 0, updated = 0, invalid = 0, unknown = 0

  for (const row of rows.slice(1)) {
    const name = row[nameIdx]?.trim()
    const asin = row[asinIdx]?.trim().toUpperCase()
    if (!name || !asin) continue

    if (!ASIN_RE.test(asin)) {
      console.warn(`⚠️  ASIN形式不正 (10桁英数字): ${name} → "${asin}"`)
      invalid++
      continue
    }
    if (!knownNames.has(name)) {
      console.warn(`⚠️  lens_data.json に存在しない名前: ${name}`)
      unknown++
      continue
    }
    if (asinMap[name] === asin) continue
    if (asinMap[name]) updated++
    else added++
    asinMap[name] = asin
  }

  // 同一ASINが複数レンズに割当たっていないか確認（コピペミス検出）
  const byAsin = {}
  for (const [name, asin] of Object.entries(asinMap)) {
    ;(byAsin[asin] ??= []).push(name)
  }
  for (const [asin, names] of Object.entries(byAsin)) {
    if (names.length > 1) console.warn(`⚠️  重複ASIN ${asin}: ${names.join(' / ')}`)
  }

  saveJson(ASIN_MAP_PATH, asinMap)
  console.log(`✅ asin_map 更新: 追加 ${added} / 上書き ${updated} / 形式不正 ${invalid} / 不明な名前 ${unknown}`)
  console.log(`   合計 ${Object.keys(asinMap).length} 件 → ${path.relative(ROOT, ASIN_MAP_PATH)}`)
}

// ─── 適用 ─────────────────────────────────────────────────────────────────────

function cmdApply(data, lenses, asinMap, dryRun) {
  // AGENTS.md「JSONを全体リフォーマットしない」に従い、
  // JSON.stringify での全体再シリアライズはせず、
  // 対象レンズの amazon URL 文字列だけを生テキスト上で置換する。
  let raw = fs.readFileSync(LENS_DATA_PATH, 'utf8')

  let applied = 0, skipped = 0, alreadyDp = 0
  const changes = []

  for (const lens of lenses) {
    const asin = asinMap[lens.name]
    if (!asin) continue

    if (!ASIN_RE.test(asin)) {
      console.warn(`⚠️  ASIN形式不正のためスキップ: ${lens.name} → "${asin}"`)
      skipped++
      continue
    }

    const newUrl = buildDpUrl(asin)
    const current = getAmazonUrl(lens)
    if (current === newUrl) { alreadyDp++; continue }

    if (!current) {
      console.warn(`⚠️  purchase_links.new.amazon が存在しないためスキップ: ${lens.name}`)
      skipped++
      continue
    }

    // JSONリテラル形式 ("..." エスケープ込み) で唯一一致する場合のみ置換
    const oldLiteral = JSON.stringify(current)
    const newLiteral = JSON.stringify(newUrl)
    const occurrences = raw.split(oldLiteral).length - 1
    if (occurrences !== 1) {
      console.warn(`⚠️  URLが一意に特定できない (${occurrences}箇所) ためスキップ: ${lens.name}`)
      skipped++
      continue
    }

    changes.push({ name: lens.name, from: classifyUrl(current), asin })
    if (!dryRun) raw = raw.replace(oldLiteral, newLiteral)
    applied++
  }

  for (const c of changes.slice(0, 20)) {
    console.log(`  ${dryRun ? '[dry]' : '✏️ '} ${c.name} (${c.from} → dp/${c.asin})`)
  }
  if (changes.length > 20) console.log(`  ... 他 ${changes.length - 20} 件`)

  if (!dryRun && applied > 0) {
    JSON.parse(raw) // 置換後も正しいJSONであることを検証してから書き込む
    fs.writeFileSync(LENS_DATA_PATH, raw)
    console.log(`\n✅ lens_data.json 更新: ${applied} 件をASIN直リンク化 (適用済み ${alreadyDp} / スキップ ${skipped})`)
  } else if (dryRun) {
    console.log(`\n[dry-run] 適用対象 ${applied} 件 (適用済み ${alreadyDp} / スキップ ${skipped})`)
  } else {
    console.log(`変更なし (適用済み ${alreadyDp} / スキップ ${skipped})`)
  }
}

// ─── レポート ─────────────────────────────────────────────────────────────────

function cmdReport(lenses, asinMap) {
  const counts = { dp: 0, search: 0, other: 0, none: 0 }
  for (const l of lenses) counts[classifyUrl(getAmazonUrl(l))]++
  const total = lenses.length
  console.log('Amazonリンク カバレッジ:')
  console.log(`  ASIN直リンク : ${counts.dp} / ${total} (${Math.round((counts.dp / total) * 100)}%)`)
  console.log(`  検索URL      : ${counts.search}`)
  console.log(`  その他/なし  : ${counts.other + counts.none}`)
  console.log(`  asin_map登録 : ${Object.keys(asinMap).length} 件（未適用分は実行で反映）`)
}

// ─── main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  const data = loadJson(LENS_DATA_PATH)
  const lenses = data.lenses ?? []
  const asinMap = loadJson(ASIN_MAP_PATH, {})

  if (args.includes('--worklist')) return cmdWorklist(lenses, asinMap)
  if (args.includes('--report')) return cmdReport(lenses, asinMap)

  const importIdx = args.indexOf('--import')
  if (importIdx !== -1) {
    const csvPath = args[importIdx + 1]
    if (!csvPath) {
      console.error('❌ --import <csvファイル> を指定してください')
      process.exit(1)
    }
    return cmdImport(path.resolve(csvPath), lenses, asinMap)
  }

  cmdApply(data, lenses, asinMap, dryRun)
}

main()

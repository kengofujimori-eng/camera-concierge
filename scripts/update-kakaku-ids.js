#!/usr/bin/env node
/**
 * update-kakaku-ids.js
 * kakaku.com の正しい製品ページ（K番号）を人手で確定し、
 * data/kakaku_id_map.json に記録するためのスクリプト。
 *
 * 背景:
 *   update-prices.js の検索フォールバックが世代・グレード語を削るため、
 *   無印とII型、単焦点とズーム等が同じ kakaku_url を共有して価格を取り違える
 *   （docs/price-matching-reliability-plan.md の section 2/4.4）。
 *   ASIN直リンク化 (update-amazon-links.js) と同じ「worklist記入 → import」方式で、
 *   取り違えの疑いのあるレンズの正しいK番号を確定する。
 *
 * データソース:
 *   public/lens_data.json      … 取り違えグループの検出元（読むだけ・変更しない）
 *   data/kakaku_id_map.json     … { "レンズ名": "K0001234567" } のマッピング（ここに書き込む）
 *   ※ このスクリプトは lens_data.json を一切変更しない。
 *     確定後の価格反映は update-prices.js を別途実行して行う。
 *
 * 使い方:
 *   node scripts/update-kakaku-ids.js --worklist          # 取り違えグループのCSVを audit-output/ に生成
 *   node scripts/update-kakaku-ids.js --worklist --force  # 記入済み worklist を上書きして再生成
 *   node scripts/update-kakaku-ids.js --import <csv>      # 記入済みCSVを kakaku_id_map にマージ
 *   node scripts/update-kakaku-ids.js --report            # 登録件数と取り違え解消状況を表示
 */

const fs = require('fs')
const path = require('path')

// ─── 設定 ─────────────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..')
const LENS_DATA_PATH = path.join(ROOT, 'public', 'lens_data.json')
const KAKAKU_ID_MAP_PATH = path.join(ROOT, 'data', 'kakaku_id_map.json')
const AUDIT_DIR = path.join(ROOT, 'audit-output')
const WORKLIST_PATH = path.join(AUDIT_DIR, 'kakaku-id-worklist.csv')

// 価格.comの商品ID（K番号）形式。update-prices.js の KAKAKU_ID_RE と一致させること。
const KAKAKU_ID_RE = /^K\d+$/
// kakaku 商品ページURLからK番号を抽出する（/item/K0001234567/ 等）
const ITEM_PATH_RE = /\/item\/(K\d+)/

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

// 大文字小文字・空白を無視した名前。表記ゆれ判定に使う（update-prices.js と同一ロジック）。
function normalizeName(name) {
  return String(name).toLowerCase().replace(/\s+/g, '')
}

// ─── CSV (簡易・引用符対応) ───────────────────────────────────────────────────
// update-amazon-links.js と同一実装

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

// ─── 取り違えグループ検出 ─────────────────────────────────────────────────────
// update-prices.js の --audit と同じロジック。
// 複数レンズが同じ price_info.kakaku_url を共有し、大文字小文字・空白を無視しても
// 名前が一致しない（＝実質的に異なるレンズ）グループを「取り違えの疑い」とする。

function findMismatchGroups(lenses) {
  const byUrl = new Map()
  for (const lens of lenses) {
    const url = lens.price_info?.kakaku_url
    if (!url) continue
    if (!byUrl.has(url)) byUrl.set(url, [])
    byUrl.get(url).push(lens)
  }

  const groups = []
  for (const [url, group] of byUrl) {
    if (group.length < 2) continue
    const normalized = new Set(group.map(l => normalizeName(l.name)))
    if (normalized.size > 1) groups.push({ url, lenses: group }) // 表記ゆれのみ（size===1）は除外
  }
  return groups
}

// ─── worklist 生成 ────────────────────────────────────────────────────────────

function cmdWorklist(lenses, idMap, force) {
  const groups = findMismatchGroups(lenses)

  // 取り違えグループに含まれる全レンズ（map登録済みは除外）を対象にする
  const targets = []
  const seen = new Set()
  for (const g of groups) {
    for (const lens of g.lenses) {
      if (idMap[lens.name] || seen.has(lens.name)) continue
      seen.add(lens.name)
      targets.push({ lens, sharedUrl: g.url })
    }
  }

  // 上書きガード: 既存 worklist の kakaku_url 列に記入がある場合は中止（--force で上書き）
  if (fs.existsSync(WORKLIST_PATH) && !force) {
    const existing = parseCsv(fs.readFileSync(WORKLIST_PATH, 'utf8'))
    const hdr = (existing[0] ?? []).map(h => h.trim().toLowerCase())
    const kIdx = hdr.indexOf('kakaku_url')
    const hasEntries = kIdx !== -1 && existing.slice(1).some(r => r[kIdx]?.trim())
    if (hasEntries) {
      console.error(`❌ 既存の worklist に記入があります: ${path.relative(ROOT, WORKLIST_PATH)}`)
      console.error('   記入内容を失わないため中止しました。上書きするには --force を付けてください。')
      process.exit(1)
    }
  }

  const header = ['name', 'mount', 'brand', 'new_price', 'shared_kakaku_url', 'kakaku_url']
  const lines = [header.join(',')]
  for (const { lens, sharedUrl } of targets) {
    lines.push([
      csvEscape(lens.name),
      csvEscape(lens.mount ?? ''),
      csvEscape(lens.brand ?? ''),
      lens.price_info?.new_price ?? '',
      csvEscape(sharedUrl),
      '', // ← 確認した正しい kakaku 商品ページURL（または素のK番号）を記入する
    ].join(','))
  }

  fs.mkdirSync(AUDIT_DIR, { recursive: true })
  fs.writeFileSync(WORKLIST_PATH, lines.join('\n') + '\n')
  console.log(`✅ ワークリスト生成: ${path.relative(ROOT, WORKLIST_PATH)} (取り違え ${groups.length} グループ / ${targets.length} 本)`)
  console.log('   shared_kakaku_url を開いて世代・型番を確認 → 各レンズの正しい商品ページURLを kakaku_url 列に記入')
  console.log('   記入後: node scripts/update-kakaku-ids.js --import audit-output/kakaku-id-worklist.csv')
}

// ─── CSV インポート ───────────────────────────────────────────────────────────

function cmdImport(csvPath, lenses, idMap) {
  const text = fs.readFileSync(csvPath, 'utf8')
  const rows = parseCsv(text)
  const header = rows[0].map(h => h.trim().toLowerCase())
  const nameIdx = header.indexOf('name')
  const urlIdx = header.indexOf('kakaku_url')
  if (nameIdx === -1 || urlIdx === -1) {
    console.error('❌ CSVに name / kakaku_url 列が見つかりません')
    process.exit(1)
  }

  const knownNames = new Set(lenses.map(l => l.name))
  let added = 0, updated = 0, invalid = 0, unknown = 0, skipped = 0

  for (const row of rows.slice(1)) {
    const name = row[nameIdx]?.trim()
    const value = row[urlIdx]?.trim()
    if (!name || !value) continue

    // URLが貼られていたら /item/K\d+/ から抽出。素のK番号ならそのまま使う。
    let kid
    if (value.includes('/')) {
      const m = value.match(ITEM_PATH_RE)
      if (!m) {
        console.warn(`⚠️  URLからK番号を抽出できません (検索URL等のためスキップ): ${name}`)
        skipped++
        continue
      }
      kid = m[1]
    } else {
      kid = value
    }

    if (!KAKAKU_ID_RE.test(kid)) {
      console.warn(`⚠️  K番号形式不正 (^K\\d+$): ${name} → "${kid}"`)
      invalid++
      continue
    }
    if (!knownNames.has(name)) {
      console.warn(`⚠️  lens_data.json に存在しない名前: ${name}`)
      unknown++
      continue
    }
    if (idMap[name] === kid) continue
    if (idMap[name]) updated++
    else added++
    idMap[name] = kid
  }

  // 同一K番号が複数レンズに割当たっていないか確認（コピペミス検出）
  const byId = {}
  for (const [name, kid] of Object.entries(idMap)) {
    ;(byId[kid] ??= []).push(name)
  }
  for (const [kid, names] of Object.entries(byId)) {
    if (names.length > 1) console.warn(`⚠️  重複K番号 ${kid}: ${names.join(' / ')}`)
  }

  saveJson(KAKAKU_ID_MAP_PATH, idMap)
  console.log(`✅ kakaku_id_map 更新: 追加 ${added} / 上書き ${updated} / 形式不正 ${invalid} / 抽出不可 ${skipped} / 不明な名前 ${unknown}`)
  console.log(`   合計 ${Object.keys(idMap).length} 件 → ${path.relative(ROOT, KAKAKU_ID_MAP_PATH)}`)
}

// ─── レポート ─────────────────────────────────────────────────────────────────

function cmdReport(lenses, idMap) {
  const groups = findMismatchGroups(lenses)
  let resolved = 0

  console.log('kakaku ID マップ:')
  console.log(`  登録件数 : ${Object.keys(idMap).length} 件`)
  console.log(`  取り違えの疑いグループ : ${groups.length}\n`)

  for (const g of groups) {
    const total = g.lenses.length
    const done = g.lenses.filter(l => idMap[l.name]).length
    if (done === total) resolved++
    console.log(`  [${done === total ? '✓ 解消' : `${done}/${total} 確定`}] ${g.url}`)
    for (const lens of g.lenses) {
      const kid = idMap[lens.name]
      console.log(`      ${kid ? '●' : '○'} ${lens.name}${kid ? ` → ${kid}` : ''}`)
    }
  }

  console.log(`\n解消済みグループ ${resolved} / ${groups.length}（全レンズのK番号が確定済み）`)
}

// ─── main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')

  const data = loadJson(LENS_DATA_PATH)
  const lenses = data.lenses ?? []
  const idMap = loadJson(KAKAKU_ID_MAP_PATH, {})

  if (args.includes('--worklist')) return cmdWorklist(lenses, idMap, force)
  if (args.includes('--report')) return cmdReport(lenses, idMap)

  const importIdx = args.indexOf('--import')
  if (importIdx !== -1) {
    const csvPath = args[importIdx + 1]
    if (!csvPath) {
      console.error('❌ --import <csvファイル> を指定してください')
      process.exit(1)
    }
    return cmdImport(path.resolve(csvPath), lenses, idMap)
  }

  console.log('使い方: --worklist [--force] | --import <csv> | --report')
  console.log('  ※ このスクリプトは lens_data.json を変更しません。書き込むのは data/kakaku_id_map.json のみです。')
}

main()

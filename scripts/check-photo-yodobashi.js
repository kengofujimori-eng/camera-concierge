#!/usr/bin/env node
/**
 * check-photo-yodobashi.js
 * photo_yodobashi_url の死活チェック＋asobinet作例URL付与
 *
 * 使い方:
 *   node scripts/check-photo-yodobashi.js           # 404チェックのみ
 *   node scripts/check-photo-yodobashi.js --fix      # 404をasobinet作例URLで補完して保存
 *   node scripts/check-photo-yodobashi.js --dry-run  # 保存せず結果だけ表示
 */

const https = require('https')
const http  = require('http')
const fs    = require('fs')
const path  = require('path')

const DATA_PATH = path.join(__dirname, '..', 'public', 'lens_data.json')
const args      = process.argv.slice(2)
const FIX       = args.includes('--fix')
const DRY_RUN   = args.includes('--dry-run')
const CONCURRENCY = 5
const TIMEOUT_MS  = 8000

// ─── HTTP GET リクエスト（ブラウザ偽装）──────────────────────────────────────
function checkUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.request(url, {
      method: 'GET',
      timeout: TIMEOUT_MS,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      }
    }, (res) => {
      // リダイレクト先が404になるケースも追跡
      req.destroy()
      resolve({ url, status: res.statusCode })
    })
    req.on('error', () => resolve({ url, status: 0 }))
    req.on('timeout', () => { req.destroy(); resolve({ url, status: -1 }) })
    req.end()
  })
}

// ─── 並列実行ヘルパー ──────────────────────────────────────────────────────
async function runConcurrent(tasks, concurrency) {
  const results = []
  let i = 0
  async function worker() {
    while (i < tasks.length) {
      const idx = i++
      results[idx] = await tasks[idx]()
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

// ─── メイン ───────────────────────────────────────────────────────────────
async function main() {
  const raw  = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  const lenses = raw.lenses

  // photo_yodobashi_url を持つレンズを収集
  const targets = lenses
    .map((l, i) => ({ lens: l, idx: i }))
    .filter(({ lens }) => lens.photo_yodobashi_url)

  console.log(`\n📸 Photo Yodobashi リンクチェック (${targets.length}本)\n`)

  let ok = 0, ng = 0, fixed = 0

  const tasks = targets.map(({ lens, idx }) => async () => {
    const url    = lens.photo_yodobashi_url
    const result = await checkUrl(url)
    const isOk   = result.status >= 200 && result.status < 400

    if (isOk) {
      ok++
      process.stdout.write('.')
    } else {
      ng++
      const statusLabel = result.status === 0 ? 'ERR' : result.status === -1 ? 'TIMEOUT' : result.status
      console.log(`\n  ❌ [${statusLabel}] ${lens.name}`)
      console.log(`       ${url}`)

      // --fix: asobinet URLがあれば photo_yodobashi_url を null に
      if (FIX) {
        const asoUrl = lens.review_links?.asobinet
        if (asoUrl) {
          console.log(`       → asobinetで代替: ${asoUrl}`)
          lenses[idx].photo_yodobashi_url = null
          lenses[idx]._py_broken = url   // 元URLを記録
          fixed++
        } else {
          console.log(`       → asobinet URLなし、そのまま保持`)
        }
      }
    }
  })

  await runConcurrent(tasks, CONCURRENCY)

  console.log(`\n\n📊 結果: ✅ ${ok}本 OK  /  ❌ ${ng}本 404/エラー  /  🔧 ${fixed}本 修正対象`)

  if (FIX && !DRY_RUN && fixed > 0) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(raw, null, 2), 'utf8')
    console.log(`\n💾 lens_data.json を更新しました`)
  } else if (DRY_RUN) {
    console.log(`\n（--dry-run のため保存なし）`)
  }

  if (ng > 0 && !FIX) {
    console.log(`\n💡 --fix オプションで404のURLをasobinetで補完できます`)
  }
}

main().catch(console.error)

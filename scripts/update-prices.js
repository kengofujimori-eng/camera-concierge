#!/usr/bin/env node
/**
 * update-prices.js
 * 価格.comから新品・中古最安値を取得して public/lens_data.json を更新するスクリプト
 *
 * 使い方:
 *   node scripts/update-prices.js              # 未取得 or 7日超のみ更新
 *   node scripts/update-prices.js --force-all  # 全レンズ強制更新
 *   node scripts/update-prices.js --dry-run    # 対象確認のみ（実際には更新しない）
 *   node scripts/update-prices.js --reset      # 進捗ファイルをリセットして全再実行
 */

// puppeteer または puppeteer-core を自動選択
// puppeteer-core はシステムのChromeを使うので170MBのダウンロード不要
let puppeteer
try {
  puppeteer = require('puppeteer')
} catch {
  puppeteer = require('puppeteer-core')
}
const fs = require('fs')
const path = require('path')

// macOSのChromeパス（puppeteer-core使用時）
const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
]

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p
  }
  return null
}

// ─── 検索クエリ正規化 ────────────────────────────────────────────────────────
// 価格.comのURL検索で問題が起きる文字を修正する

// 日本語レンズ用語 → 英語置換マップ
const JP_TO_EN = {
  'マクロ': 'Macro',
  '魚眼': 'Fisheye',
  'フィッシュアイ': 'Fisheye',
  '標準': '',
  '単焦点': '',
}

function normalizeSearchQuery(name) {
  let q = name

  // 日本語用語を英語に変換
  for (const [jp, en] of Object.entries(JP_TO_EN)) {
    q = q.replace(new RegExp(jp, 'g'), en)
  }

  // 日本語文字（ひらがな・カタカナ・漢字）をすべて除去
  // 例: "Viltrox AF 75mm F1.2 PRO ソニーEマウント" → "Viltrox AF 75mm F1.2 PRO"
  q = q.replace(/[　-鿿＀-￯]+/g, '').trim()

  // アクセント付き文字をASCIIに正規化 (FíRIN → FiRIN)
  q = q.normalize('NFD').replace(/[̀-ͯ]/g, '')

  // f/3.5-6.3 のスラッシュを除去（URLエンコードでも404になるケースに対応）
  q = q.replace(/\bf\/(\d)/g, 'f$1')

  // "/RF" "/FE" などデュアルマウント表記を除去
  q = q.replace(/\/[A-Z]{1,3}\b/g, '')

  // 余分な空白を除去
  q = q.trim().replace(/\s+/g, ' ')

  return q
}

// 段階的に短くした検索クエリのバリエーションを生成
function searchVariants(name) {
  const base = normalizeSearchQuery(name)
  const variants = [base]

  // f値を除いたバリエーション（例: "NIKKOR Z DX 16-50mm f3.5-6.3 PZ VR" → "NIKKOR Z DX 16-50mm"）
  const withoutAperture = base.replace(/\s+f[\d./-]+\s*/gi, ' ').trim()
  if (withoutAperture !== base) variants.push(withoutAperture)

  // PZ/VR/OSS/IS等の修飾子を除いたバリエーション
  const withoutSuffix = base.replace(/\s+(PZ|VR|OSS|IS|STM|USM|OIS|XD|APD|GM|G|L)\b/gi, '').trim()
  if (withoutSuffix !== base && withoutSuffix !== withoutAperture) variants.push(withoutSuffix)

  return [...new Set(variants)]
}

const LENS_DATA_PATH  = path.join(__dirname, '../public/lens_data.json')
const PROGRESS_PATH   = path.join(__dirname, '../.price-update-progress.json')
const DELAY_MS        = 2500   // リクエスト間隔（ms）
const TIMEOUT_MS      = 18000  // ページロードタイムアウト（ms）
const SAVE_INTERVAL   = 10     // 何レンズごとに中間保存するか
const STALE_DAYS      = 7      // 何日以上経過で再取得するか

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 価格.com 商品ページから新品・中古価格を抽出
async function extractPricesFromPage(page) {
  return page.evaluate(() => {
    function parseEl(selector) {
      const el = document.querySelector(selector)
      if (!el) return null
      const num = parseInt(el.innerText.replace(/[^0-9]/g, ''), 10)
      return isNaN(num) ? null : num
    }
    return {
      priceNew:  parseEl('.p-prdInfoLowprice_entity'),
      priceUsed: parseEl('.p-prdInfoUsedLowprice_entity'),
      kakakuUrl: location.href,
      itemId:    (location.href.match(/\/item\/(K\d+)\//) || [])[1] || null,
    }
  })
}

// 検索クエリで価格.comを検索し、商品ページのURLを返す
async function searchKakaku(page, query) {
  const searchUrl = `https://kakaku.com/search_results/${encodeURIComponent(query)}/?category=0045`
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
  await sleep(700)

  const currentUrl = page.url()

  // 直接商品ページにリダイレクトされた
  if (currentUrl.includes('/item/K')) return currentUrl

  // 検索結果ページ → 最初の /item/K リンクを返す
  return page.evaluate(() => {
    const link = document.querySelector('a[href*="/item/K"]')
    return link ? link.href : null
  })
}

// 1本分のレンズを価格.comで検索して価格を取得
async function scrapePrice(page, lens) {
  // 既存のKakaku URLがあれば直接アクセス（高速・正確）
  const cachedUrl = lens.price_info?.kakaku_url
  if (cachedUrl && cachedUrl.includes('/item/K')) {
    try {
      await page.goto(cachedUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
      await sleep(600)
      const prices = await extractPricesFromPage(page)
      if (prices.priceNew || prices.priceUsed) return prices
    } catch {
      // キャッシュURLが失効している可能性 → 検索にフォールバック
    }
  }

  // 段階的なクエリバリエーションで検索（正規化 → 短縮版）
  const variants = searchVariants(lens.name)
  for (const query of variants) {
    try {
      const productUrl = await searchKakaku(page, query)
      if (!productUrl) continue

      await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
      await sleep(600)
      const prices = await extractPricesFromPage(page)
      if (prices.priceNew || prices.priceUsed) return prices
    } catch {
      // このバリエーションは失敗 → 次を試す
    }
    await sleep(500)
  }

  return null
}

async function main() {
  const args = process.argv.slice(2)
  const forceAll = args.includes('--force-all')
  const dryRun   = args.includes('--dry-run')
  const reset    = args.includes('--reset')

  console.log('=== Camera Concierge 価格更新スクリプト ===')

  // 進捗ファイル管理
  let progress = { completed: [], failed: [] }
  if (!reset && fs.existsSync(PROGRESS_PATH)) {
    try { progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8')) } catch {}
  }
  if (reset && fs.existsSync(PROGRESS_PATH)) {
    fs.unlinkSync(PROGRESS_PATH)
    console.log('進捗ファイルをリセットしました')
  }

  // データ読み込み
  const data = JSON.parse(fs.readFileSync(LENS_DATA_PATH, 'utf8'))
  const lenses = data.lenses

  // 更新対象フィルタリング
  const today = new Date().toISOString().slice(0, 10)
  const targets = lenses.filter(lens => {
    if (forceAll) return true
    if (progress.completed.includes(lens.name)) return false
    const fetched = lens.price_info?.fetched_at
    if (!fetched) return true
    const daysSince = (Date.now() - new Date(fetched).getTime()) / 86400000
    return daysSince >= STALE_DAYS
  })

  console.log(`モード: ${forceAll ? '全件強制更新' : `未取得 or ${STALE_DAYS}日超`} ${dryRun ? '[DRY RUN]' : ''}`)
  console.log(`対象: ${targets.length}本 / 全${lenses.length}本\n`)

  if (dryRun) {
    targets.slice(0, 20).forEach((l, i) =>
      console.log(`  ${i+1}. ${l.name} (最終取得: ${l.price_info?.fetched_at || '未取得'})`)
    )
    if (targets.length > 20) console.log(`  ... and ${targets.length - 20} more`)
    return
  }

  if (targets.length === 0) {
    console.log('更新対象なし')
    return
  }

  // ブラウザ起動（puppeteer-coreの場合はシステムChromeを使用）
  const launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
  const chromePath = findChrome()
  if (chromePath) {
    launchOptions.executablePath = chromePath
    console.log(`Chrome: ${chromePath}`)
  }
  const browser = await puppeteer.launch(launchOptions)
  const page = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  )
  await page.setViewport({ width: 1280, height: 800 })

  let updated = 0, failed = 0

  for (let i = 0; i < targets.length; i++) {
    const lens = targets[i]
    const lensIdx = lenses.findIndex(l => l.name === lens.name)
    const prefix = `[${String(i + 1).padStart(3)}/${targets.length}]`

    process.stdout.write(`${prefix} ${lens.name} ... `)

    try {
      const prices = await scrapePrice(page, lens)

      // ¥10,000以下の「新品価格」は誤マッチと判定して無視
      if (prices && prices.priceNew && prices.priceNew < 10000) {
        console.log(`  ⚠ 価格異常スキップ (新品¥${prices.priceNew.toLocaleString()} は低すぎる)`)
        prices.priceNew = null
      }

      if (prices && (prices.priceNew || prices.priceUsed)) {
        lenses[lensIdx].price_info = {
          ...lenses[lensIdx].price_info,
          new_price:  prices.priceNew  ?? lenses[lensIdx].price_info?.new_price  ?? null,
          used_price: prices.priceUsed ?? lenses[lensIdx].price_info?.used_price ?? null,
          fetched_at: today,
          kakaku_url: prices.kakakuUrl,
        }
        const n = prices.priceNew  ? `¥${prices.priceNew.toLocaleString()}`  : '-'
        const u = prices.priceUsed ? `¥${prices.priceUsed.toLocaleString()}` : '-'
        console.log(`✓  新品:${n}  中古:${u}`)
        progress.completed.push(lens.name)
        updated++
      } else {
        console.log('×  価格取得できず')
        progress.failed.push(lens.name)
        failed++
      }
    } catch (err) {
      console.log(`×  エラー: ${err.message.slice(0, 60)}`)
      progress.failed.push(lens.name)
      failed++
    }

    // 定期保存（途中で止まっても安全）
    if ((i + 1) % SAVE_INTERVAL === 0) {
      data.lenses = lenses
      fs.writeFileSync(LENS_DATA_PATH, JSON.stringify(data, null, 2))
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2))
      console.log(`  💾 中間保存 (${i + 1}/${targets.length})`)
    }

    await sleep(DELAY_MS)
  }

  await browser.close()

  // 最終保存
  data.lenses = lenses
  data.scraped_at = today
  fs.writeFileSync(LENS_DATA_PATH, JSON.stringify(data, null, 2))
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2))

  console.log('\n' + '='.repeat(40))
  console.log(`完了: 更新 ${updated}本  失敗 ${failed}本  合計 ${targets.length}本`)
  console.log(`lens_data.json を更新しました`)
  if (failed > 0) {
    console.log(`\n失敗したレンズ (${progress.failed.length}件):`)
    progress.failed.slice(-10).forEach(name => console.log(`  - ${name}`))
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})

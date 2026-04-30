#!/usr/bin/env node
/**
 * update-review-links.js
 * 複数のレビューサイトからURLを収集して lens_data.json の review_links フィールドに保存する
 *
 * 対応ソース:
 *   asobinet  - review-index を1回スクレイプして一括マッチング（高速）
 *   lenstip   - レンズごとに検索（低速）
 *   dpreview  - レンズごとに検索（低速）
 *
 * 設計方針:
 *   - URLだけを保存。スコアや画像は取り込まない（特定サイト依存を避ける）
 *   - AIがチャット中に review_links を見てリアルタイムで参照する想定
 *   - 将来ソースを追加するときは SOURCES に関数を足すだけ
 *
 * 使い方:
 *   node scripts/update-review-links.js                      # 未取得のみ・全ソース
 *   node scripts/update-review-links.js --source asobinet   # asobi のみ
 *   node scripts/update-review-links.js --source lenstip    # lenstip のみ
 *   node scripts/update-review-links.js --source dpreview   # dpreview のみ
 *   node scripts/update-review-links.js --force-all         # 全レンズ強制更新
 *   node scripts/update-review-links.js --dry-run           # 保存せず結果確認のみ
 *   node scripts/update-review-links.js --scan-new          # 新発売レンズの検出
 */

let puppeteer
try {
  puppeteer = require('puppeteer')
} catch {
  puppeteer = require('puppeteer-core')
}
const fs   = require('fs')
const path = require('path')

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
]
function findChrome() {
  for (const p of CHROME_PATHS) { if (fs.existsSync(p)) return p }
  return null
}

const LENS_DATA_PATH = path.join(__dirname, '../public/lens_data.json')
const TIMEOUT_MS     = 18000
const DELAY_BETWEEN  = 2000   // サイト間・レンズ間のウェイト（ms）
const SAVE_INTERVAL  = 20     // 何レンズごとに中間保存するか

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── 名前正規化・マッチングユーティリティ ──────────────────────────────────

function normalizeName(name) {
  let n = name
  n = n.replace(/[　-鿿＀-￯]+/g, '')                         // 日本語除去
  n = n.normalize('NFD').replace(/[̀-ͯ]/g, '')              // アクセント除去
  n = n.replace(/\b(E|FE|RF|Z|X|EF|EF-S|EF-M|MFT|m4\/3)\s*(Mount|mount)?\b/g, '')
  n = n.replace(/\bf\//gi, 'f')                              // f/1.8 → f1.8
  n = n.replace(/\s+/g, ' ').trim().toLowerCase()
  return n
}

function parseLensKey(name) {
  const norm = normalizeName(name)
  const zoom  = norm.match(/(\d+)-(\d+)mm/)
  const prime = norm.match(/(\d+(?:\.\d+)?)mm/)
  const fval  = norm.match(/f(\d+(?:\.\d+)?)/)
  return {
    focal:    zoom  ? `${zoom[1]}-${zoom[2]}mm` : prime ? `${prime[1]}mm` : '',
    aperture: fval  ? `f${parseFloat(fval[1])}` : '',
    norm,
  }
}

function jaccard(a, b) {
  const wa = new Set(a.split(' ').filter(w => w.length > 1))
  const wb = new Set(b.split(' ').filter(w => w.length > 1))
  const inter = [...wa].filter(w => wb.has(w)).length
  const union = new Set([...wa, ...wb]).size
  return union === 0 ? 0 : inter / union
}

function findBestMatch(lensName, entries) {
  const { focal: lf, aperture: la, norm: ln } = parseLensKey(lensName)
  let best = null, bestScore = 0
  for (const entry of entries) {
    const { focal: af, aperture: aa, norm: an } = parseLensKey(entry.name)
    if (lf && af && lf !== af) continue
    if (la && aa && la !== aa) continue
    const score = jaccard(ln, an)
    if (score > bestScore && score >= 0.4) { bestScore = score; best = entry }
  }
  return best ? { entry: best, score: bestScore } : null
}

// 検索クエリ生成（英数字のみ・サイト向け）
function buildSearchQuery(lensName) {
  let q = normalizeName(lensName)
  // "contemporary" "art" などのシリーズ名は検索ノイズになりがちなので除去
  q = q.replace(/\b(contemporary|art|sports|global vision|pro|premium|classic)\b/gi, '').trim()
  q = q.replace(/\s+/g, ' ')
  return q
}

// ─── asobinet ───────────────────────────────────────────────────────────────

async function fetchAsobi(page) {
  console.log('\n[asobinet] レビューINDEXを取得中...')
  await page.goto('https://asobinet.com/review-index/', { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
  await sleep(800)

  const entries = await page.evaluate(() => {
    const content = document.querySelector('.entry-content')
    const results = []
    let brand = ''
    Array.from(content?.querySelectorAll('h2, h3') || []).forEach(el => {
      if (el.tagName === 'H2') { brand = el.textContent.trim(); return }
      const name = el.textContent.trim()
      const links = []
      let s = el.nextElementSibling, d = 0
      while (s && s.tagName !== 'H3' && s.tagName !== 'H2' && d < 8) {
        s.querySelectorAll('a').forEach(a => {
          if (a.href?.includes('asobinet') &&
              (a.href.includes('/fullreview-') || a.href.includes('/review-') || a.href.includes('/info-review-')))
            links.push({ text: a.textContent.trim(), url: a.href })
        })
        s = s.nextElementSibling; d++
      }
      if (!links.length) return
      const preferred = links.find(l => l.url.includes('/fullreview-')) || links[0]
      results.push({ brand, name, reviewUrl: preferred.url,
                     hasFullReview: links.some(l => l.url.includes('/fullreview-')), reviewCount: links.length })
    })
    return results
  })

  const lensOnly = entries.filter(e => /\d+mm|F[\d.]+|f\/[\d.]+/i.test(e.name))
  console.log(`  → ${lensOnly.length}本のレンズレビューを検出`)
  return lensOnly
}

function matchAsobi(lensName, asobEntries) {
  const result = findBestMatch(lensName, asobEntries)
  return result ? result.entry.reviewUrl : null
}

// ─── Lenstip ────────────────────────────────────────────────────────────────

async function searchLenstip(page, lensName) {
  const q = buildSearchQuery(lensName)
  const url = `https://www.lenstip.com/szukaj.html?s=${encodeURIComponent(q)}`
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
    await sleep(500)
    const found = await page.evaluate(() => {
      // 最初のレビューリンク（".N.1-Lens_review-" 形式）
      const a = document.querySelector('a[href*=".1-Lens_review-"]')
      return a ? a.href : null
    })
    return found
  } catch { return null }
}

// ─── DPReview ───────────────────────────────────────────────────────────────

async function searchDPReview(page, lensName) {
  const q = buildSearchQuery(lensName)
  const url = `https://www.dpreview.com/products/search/lenses?query=${encodeURIComponent(q)}`
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
    await sleep(500)
    const found = await page.evaluate(() => {
      // .productList 内の最初のレンズ製品リンク
      const a = document.querySelector('.productList a[href*="/products/"][href*="/lenses/"]')
      return a ? a.href : null
    })
    return found
  } catch { return null }
}

// ─── 新発売レンズスキャン ────────────────────────────────────────────────────

async function scanNewLenses(page, existingLenses) {
  console.log('新発売レンズをスキャン中...')
  await page.goto('https://asobinet.com/category/review/review-torunara/', { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
  await sleep(800)

  const recent = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h2 a, h3 a, .entry-title a'))
      .filter(a => a.href?.includes('asobinet') &&
                   (a.href.includes('/fullreview-') || a.href.includes('/review-')))
      .map(a => ({ title: a.textContent.trim(), url: a.href }))
      .slice(0, 60)
  )

  const existingNorms = new Set(existingLenses.map(l => normalizeName(l.name)))

  return recent
    .map(r => {
      const guessed = r.title
        .replace(/\s*(レンズ)?レビュー(Vol\.\d+\s*.+|完全版.*)$/i, '')
        .replace(/^[\s\S]*?\s+/, '')
        .trim()
      return { guessedName: guessed, reviewTitle: r.title, url: r.url }
    })
    .filter(c => {
      if (!c.guessedName) return false
      const norm = normalizeName(c.guessedName)
      if (existingNorms.has(norm)) return false
      return ![...existingLenses].some(l => jaccard(normalizeName(l.name), norm) > 0.72)
    })
}

// ─── メイン ──────────────────────────────────────────────────────────────────

async function main() {
  const args     = process.argv.slice(2)
  const forceAll = args.includes('--force-all')
  const dryRun   = args.includes('--dry-run')
  const scanNew  = args.includes('--scan-new')
  const srcArg   = args.find(a => a.startsWith('--source='))?.split('=')[1]
              || (args[args.indexOf('--source') + 1])

  // どのソースを実行するか
  const runAsobi    = !srcArg || srcArg === 'asobinet'
  const runLenstip  = !srcArg || srcArg === 'lenstip'
  const runDPReview = !srcArg || srcArg === 'dpreview'

  console.log('=== Camera Concierge レビューリンク更新 ===')
  const activeStr = [runAsobi && 'asobinet', runLenstip && 'lenstip', runDPReview && 'dpreview']
    .filter(Boolean).join(', ')
  console.log(`ソース: ${activeStr}`)
  if (dryRun)   console.log('[DRY RUN モード]')
  if (forceAll) console.log('[強制全件更新]')

  const data   = JSON.parse(fs.readFileSync(LENS_DATA_PATH, 'utf8'))
  const lenses = data.lenses
  const today  = new Date().toISOString().slice(0, 10)

  // ブラウザ起動
  const launchOptions = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  const chromePath = findChrome()
  if (chromePath) { launchOptions.executablePath = chromePath; console.log(`Chrome: ${chromePath}`) }
  const browser = await puppeteer.launch(launchOptions)
  const page    = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  await page.setViewport({ width: 1280, height: 800 })

  try {
    // ── 新レンズスキャン ─────────────────────────────────────────────────
    if (scanNew) {
      const candidates = await scanNewLenses(page, lenses)
      console.log()
      if (!candidates.length) {
        console.log('新しいレンズは見つかりませんでした。')
      } else {
        console.log(`新発売候補: ${candidates.length}本\n`)
        candidates.forEach((c, i) => {
          console.log(`  ${String(i + 1).padStart(2)}. ${c.guessedName}`)
          console.log(`      記事: ${c.reviewTitle.slice(0, 70)}`)
          console.log(`      URL : ${c.url}`)
        })
        console.log('\n上記を lens_data.json に追加する場合は手動で確認・追記してください。')
      }
      await browser.close()
      return
    }

    // ── 更新対象を絞り込む ────────────────────────────────────────────────
    function needsUpdate(lens, source) {
      if (forceAll) return true
      return !lens.review_links?.[source]
    }

    // ── asobinet（一括・高速）────────────────────────────────────────────
    let asobEntries = []
    if (runAsobi) {
      asobEntries = await fetchAsobi(page)
      const targets = lenses.filter(l => needsUpdate(l, 'asobinet'))
      console.log(`  更新対象: ${targets.length}本`)

      let matched = 0
      for (const lens of targets) {
        const url = matchAsobi(lens.name, asobEntries)
        const idx = lenses.findIndex(l => l.name === lens.name)
        if (url) {
          if (!dryRun) {
            lenses[idx].review_links = { ...(lenses[idx].review_links || {}), asobinet: url }
          }
          matched++
          if (dryRun) console.log(`  ✓  ${lens.name.slice(0, 50)} -> ${url}`)
        }
      }
      console.log(`  → マッチ: ${matched}本  未マッチ: ${targets.length - matched}本`)
    }

    // ── Lenstip・DPReview（レンズごとに検索・低速）───────────────────────
    const perLensTargets = lenses.filter(lens =>
      (runLenstip  && needsUpdate(lens, 'lenstip')) ||
      (runDPReview && needsUpdate(lens, 'dpreview'))
    )

    if (perLensTargets.length > 0) {
      console.log(`\n検索ベース更新: ${perLensTargets.length}本`)
      if (runLenstip)  console.log('  lenstip  を検索します')
      if (runDPReview) console.log('  dpreview を検索します')

      let lenstipHit = 0, dpreviewHit = 0
      const total = perLensTargets.length

      for (let i = 0; i < total; i++) {
        const lens = perLensTargets[i]
        const idx  = lenses.findIndex(l => l.name === lens.name)
        const prefix = `[${String(i + 1).padStart(3)}/${total}]`
        process.stdout.write(`${prefix} ${lens.name.slice(0, 42).padEnd(42)} `)

        const updates = {}

        if (runLenstip && needsUpdate(lens, 'lenstip')) {
          const url = await searchLenstip(page, lens.name)
          if (url) { updates.lenstip = url; lenstipHit++; process.stdout.write('L✓ ') }
          else       process.stdout.write('L- ')
          await sleep(DELAY_BETWEEN)
        }

        if (runDPReview && needsUpdate(lens, 'dpreview')) {
          const url = await searchDPReview(page, lens.name)
          if (url) { updates.dpreview = url; dpreviewHit++; process.stdout.write('D✓') }
          else       process.stdout.write('D-')
          await sleep(DELAY_BETWEEN)
        }

        process.stdout.write('\n')

        if (!dryRun && Object.keys(updates).length > 0) {
          lenses[idx].review_links = { ...(lenses[idx].review_links || {}), ...updates }
        }

        // 中間保存
        if (!dryRun && (i + 1) % SAVE_INTERVAL === 0) {
          data.lenses = lenses
          fs.writeFileSync(LENS_DATA_PATH, JSON.stringify(data, null, 2))
          console.log(`  💾 中間保存 (${i + 1}/${total})`)
        }
      }

      console.log(`\n  Lenstip  マッチ: ${lenstipHit}本`)
      console.log(`  DPReview マッチ: ${dpreviewHit}本`)
    }

    // ── 最終保存 ──────────────────────────────────────────────────────────
    if (!dryRun) {
      data.lenses = lenses
      fs.writeFileSync(LENS_DATA_PATH, JSON.stringify(data, null, 2))
      console.log('\n✅ lens_data.json を更新しました')
    }

    // ── 現在のカバレッジサマリー ──────────────────────────────────────────
    console.log('\n=== review_links カバレッジ ===')
    const counts = { asobinet: 0, lenstip: 0, dpreview: 0, any: 0 }
    lenses.forEach(l => {
      const rl = l.review_links || {}
      if (rl.asobinet) counts.asobinet++
      if (rl.lenstip)  counts.lenstip++
      if (rl.dpreview) counts.dpreview++
      if (rl.asobinet || rl.lenstip || rl.dpreview) counts.any++
    })
    const total = lenses.length
    const pct = n => `${n}本 (${Math.round(n / total * 100)}%)`
    console.log(`  asobinet : ${pct(counts.asobinet)}`)
    console.log(`  lenstip  : ${pct(counts.lenstip)}`)
    console.log(`  dpreview : ${pct(counts.dpreview)}`)
    console.log(`  いずれか : ${pct(counts.any)}  / 全${total}本`)

  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})

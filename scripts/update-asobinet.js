#!/usr/bin/env node
/**
 * update-asobinet.js
 * asobinet.com（とるなら）のレビューINDEXを参照し、
 * 各レンズの「レビューページURL」だけを lens_data.json に記録するスクリプト。
 *
 * 設計方針:
 *   - スコアや画像をここで取り込まない（特定サイトへの依存を避ける）
 *   - review_links.asobinet にURLを保存し、AIが必要に応じてリアルタイム参照できる構造にする
 *   - 将来的に lenstip / dpreview 等のURLも同じフィールドに追加できる
 *
 * 使い方:
 *   node scripts/update-asobinet.js              # 未取得のみ更新
 *   node scripts/update-asobinet.js --force-all  # 全レンズ強制更新
 *   node scripts/update-asobinet.js --dry-run    # マッチング確認のみ（保存しない）
 *   node scripts/update-asobinet.js --scan-new   # 新発売レンズの検出
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
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p
  }
  return null
}

const LENS_DATA_PATH   = path.join(__dirname, '../public/lens_data.json')
const REVIEW_INDEX_URL = 'https://asobinet.com/review-index/'
const NEW_REVIEWS_URL  = 'https://asobinet.com/category/review/review-torunara/'
const TIMEOUT_MS       = 18000

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── 名前正規化 ──────────────────────────────────────────────────────────────

function normalizeName(name) {
  let n = name
  // 日本語文字（ひらがな・カタカナ・漢字・全角記号）を除去
  n = n.replace(/[　-鿿＀-￯]+/g, '')
  // アクセント付き文字をASCIIに正規化（FíRIN → FiRIN）
  n = n.normalize('NFD').replace(/[̀-ͯ]/g, '')
  // マウント名を除去（末尾の "FE" "Eマウント" "Z" 等）
  n = n.replace(/\b(Sony|Nikon|Canon|Fuji|E|FE|RF|Z|X|EF|EF-S|EF-M|MFT|m43|m4\/3)\s*(Mount|mount)?\b/g, '')
  // f/ スラッシュを除去
  n = n.replace(/\bf\//gi, 'f')
  // 余分な空白を整理
  n = n.replace(/\s+/g, ' ').trim().toLowerCase()
  return n
}

// 焦点距離・F値を構造化（マッチングの制約として使用）
function parseLensKey(name) {
  const norm = normalizeName(name)
  const zoom  = norm.match(/(\d+)-(\d+)mm/)
  const prime = norm.match(/(\d+(?:\.\d+)?)mm/)
  const fval  = norm.match(/f(\d+(?:\.\d+)?)/)
  return {
    focal:    zoom  ? `${zoom[1]}-${zoom[2]}mm` : prime ? `${prime[1]}mm` : '',
    aperture: fval  ? `f${fval[1]}` : '',
    norm,
  }
}

// Jaccard係数（共通トークン / 全トークン）
function jaccard(a, b) {
  const wa = new Set(a.split(' ').filter(w => w.length > 1))
  const wb = new Set(b.split(' ').filter(w => w.length > 1))
  const intersection = [...wa].filter(w => wb.has(w)).length
  const union = new Set([...wa, ...wb]).size
  return union === 0 ? 0 : intersection / union
}

// lens_data.json のレンズ名に対してasobinetエントリで最もスコアが高いものを返す
function findBestMatch(lensName, asobEntries) {
  const { focal: lFocal, aperture: lAperture, norm: lNorm } = parseLensKey(lensName)

  let bestEntry = null
  let bestScore = 0

  for (const entry of asobEntries) {
    const { focal: aFocal, aperture: aAperture, norm: aNorm } = parseLensKey(entry.name)

    // 焦点距離・F値が明示されている場合は不一致をスキップ（誤マッチ防止）
    if (lFocal && aFocal && lFocal !== aFocal) continue
    if (lAperture && aAperture && lAperture !== aAperture) continue

    const score = jaccard(lNorm, aNorm)
    if (score > bestScore && score >= 0.4) {
      bestScore = score
      bestEntry = entry
    }
  }

  return bestEntry ? { entry: bestEntry, score: bestScore } : null
}

// ─── asobinet スクレイピング ─────────────────────────────────────────────────

// レビューINDEXページを1回だけ読み込み、全レンズ→URLのマップを返す
async function fetchReviewIndex(page) {
  console.log('レビューINDEXを取得中...')
  await page.goto(REVIEW_INDEX_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
  await sleep(800)

  const entries = await page.evaluate(() => {
    const content = document.querySelector('.entry-content')
    const results = []
    let currentBrand = ''

    Array.from(content?.querySelectorAll('h2, h3') || []).forEach(el => {
      if (el.tagName === 'H2') {
        currentBrand = el.textContent.trim()
        return
      }

      const lensName = el.textContent.trim()
      const links = []
      let sibling = el.nextElementSibling
      let depth = 0

      while (sibling && sibling.tagName !== 'H3' && sibling.tagName !== 'H2' && depth < 8) {
        sibling.querySelectorAll('a').forEach(a => {
          if (
            a.href?.includes('asobinet') &&
            (a.href.includes('/fullreview-') ||
             a.href.includes('/review-')    ||
             a.href.includes('/info-review-'))
          ) {
            links.push({ text: a.textContent.trim(), url: a.href })
          }
        })
        sibling = sibling.nextElementSibling
        depth++
      }

      if (links.length === 0) return

      // 完全版（fullreview）を優先、なければ最初のリンク
      const preferred = links.find(l => l.url.includes('/fullreview-')) || links[0]

      results.push({
        brand:         currentBrand,
        name:          lensName,
        reviewUrl:     preferred.url,
        hasFullReview: links.some(l => l.url.includes('/fullreview-')),
        reviewCount:   links.length,
      })
    })

    return results
  })

  // レンズエントリのみ（焦点距離かF値の表記があるもの）
  return entries.filter(e => /\d+mm|F[\d.]+|f\/[\d.]+/i.test(e.name))
}

// 新発売レンズをスキャン（管理人レビューカテゴリの最新記事を確認）
async function scanNewLenses(page, existingLenses) {
  console.log('新発売レンズをスキャン中...')
  await page.goto(NEW_REVIEWS_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS })
  await sleep(800)

  const recentReviews = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h2 a, h3 a, .entry-title a'))
      .filter(a => a.href?.includes('asobinet') &&
                   (a.href.includes('/fullreview-') || a.href.includes('/review-')))
      .map(a => ({ title: a.textContent.trim(), url: a.href }))
      .slice(0, 60)
  )

  // 既存レンズの正規化済みセット
  const existingNorms = new Set(existingLenses.map(l => normalizeName(l.name)))

  const newCandidates = []
  for (const review of recentReviews) {
    // タイトルから「レビューVol.X」「完全版」等の接尾語を除去してレンズ名を推定
    const guessedName = review.title
      .replace(/\s*(レンズ)?レビュー(Vol\.\d+\s*.+|完全版.*)$/i, '')
      .replace(/^.+?\s+/, '')  // 先頭の「キヤノン」「ニコン」等メーカー名を除去
      .trim()

    if (!guessedName) continue

    const norm = normalizeName(guessedName)
    if (!norm || existingNorms.has(norm)) continue

    // 既存レンズとの類似度が高い場合は別バリアントとみなしてスキップ
    const isSimilar = [...existingLenses].some(l => jaccard(normalizeName(l.name), norm) > 0.72)
    if (isSimilar) continue

    newCandidates.push({
      guessedName,
      reviewTitle: review.title,
      url:         review.url,
    })
  }

  return newCandidates
}

// ─── メイン ──────────────────────────────────────────────────────────────────

async function main() {
  const args     = process.argv.slice(2)
  const forceAll = args.includes('--force-all')
  const dryRun   = args.includes('--dry-run')
  const scanNew  = args.includes('--scan-new')

  console.log('=== Camera Concierge asobinet レビューリンク更新 ===')

  const data   = JSON.parse(fs.readFileSync(LENS_DATA_PATH, 'utf8'))
  const lenses = data.lenses
  const today  = new Date().toISOString().slice(0, 10)

  // ブラウザ起動
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
  const page    = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  )
  await page.setViewport({ width: 1280, height: 800 })

  try {
    // ── 新レンズスキャンモード ─────────────────────────────────────────────
    if (scanNew) {
      const candidates = await scanNewLenses(page, lenses)
      console.log()
      if (candidates.length === 0) {
        console.log('新しいレンズは見つかりませんでした。')
      } else {
        console.log(`新発売候補: ${candidates.length}本\n`)
        candidates.forEach((c, i) => {
          console.log(`  ${String(i + 1).padStart(2)}. ${c.guessedName}`)
          console.log(`      記事: ${c.reviewTitle.slice(0, 60)}`)
          console.log(`      URL : ${c.url}`)
        })
        console.log('\n上記をlens_data.jsonに追加する場合は手動で確認・追記してください。')
      }
      await browser.close()
      return
    }

    // ── レビューINDEXを1回だけ読み込む ──────────────────────────────────────
    const asobEntries = await fetchReviewIndex(page)
    console.log(`${asobEntries.length}本のレンズレビューを検出\n`)

    // ── 更新対象を絞り込む ────────────────────────────────────────────────
    const targets = lenses.filter(lens => {
      if (forceAll) return true
      return !lens.review_links?.asobinet  // asobi URLがまだないものだけ
    })
    console.log(`更新対象: ${targets.length}本 / 全${lenses.length}本`)

    // ── マッチング ───────────────────────────────────────────────────────
    const matched   = []
    const unmatched = []

    for (const lens of targets) {
      const result = findBestMatch(lens.name, asobEntries)
      if (result) {
        matched.push({ lens, asobEntry: result.entry, score: result.score })
      } else {
        unmatched.push(lens.name)
      }
    }

    console.log(`マッチ: ${matched.length}本  未マッチ: ${unmatched.length}本\n`)

    if (dryRun) {
      console.log('[DRY RUN] マッチング結果:')
      matched.forEach((m, i) => {
        const tag = m.asobEntry.hasFullReview ? '[完全版]' : `[${m.asobEntry.reviewCount}記事]`
        console.log(`  ${String(i + 1).padStart(3)}. ${m.lens.name.slice(0, 48).padEnd(48)} score:${m.score.toFixed(2)} ${tag}`)
        console.log(`        -> ${m.asobEntry.name}`)
        console.log(`           ${m.asobEntry.reviewUrl}`)
      })
      if (unmatched.length > 0) {
        console.log(`\n未マッチ (${unmatched.length}本):`)
        unmatched.slice(0, 20).forEach(n => console.log(`  - ${n}`))
        if (unmatched.length > 20) console.log(`  ... and ${unmatched.length - 20} more`)
      }
      await browser.close()
      return
    }

    // ── review_links.asobinet にURLを保存 ─────────────────────────────────
    // ページアクセスは一切不要（URLだけなのでINDEXから取得済み）
    let savedCount = 0
    for (const { lens, asobEntry } of matched) {
      const idx = lenses.findIndex(l => l.name === lens.name)
      if (idx === -1) continue

      // review_links フィールドを初期化または既存値を保持
      lenses[idx].review_links = {
        ...(lenses[idx].review_links || {}),
        asobinet: asobEntry.reviewUrl,
      }

      // メタ情報（スコアは保存しない）
      lenses[idx].review_links._asobinet_meta = {
        matched_name:   asobEntry.name,
        has_full_review: asobEntry.hasFullReview,
        review_count:   asobEntry.reviewCount,
        linked_at:      today,
      }

      savedCount++
    }

    // 保存
    data.lenses = lenses
    fs.writeFileSync(LENS_DATA_PATH, JSON.stringify(data, null, 2))

    console.log('='.repeat(50))
    console.log(`完了: ${savedCount}本にasobinet URLを設定しました`)
    console.log(`lens_data.json を更新しました\n`)

    if (unmatched.length > 0) {
      console.log(`未マッチ (${unmatched.length}本):`)
      unmatched.forEach(n => console.log(`  - ${n}`))
    }

  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})

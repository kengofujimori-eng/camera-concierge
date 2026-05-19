#!/usr/bin/env node
/**
 * Public beta audit triage report.
 *
 * Detection and triage only. This script does not edit lens_data.json, image
 * files, recommendation logic, API contracts, localStorage, or audit-output.
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_PATH = path.join(ROOT, 'public', 'lens_data.json')
const PUBLIC_DIR = path.join(ROOT, 'public')
const MANUAL_REVIEW_PATH = path.join(ROOT, 'docs', 'public-beta-manual-review.md')
const REPORT_PATH = path.join(os.tmpdir(), `camera-concierge-public-beta-triage-${timestamp()}.md`)

const SAMPLE_LIMIT = 20

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function readLenses() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  return Array.isArray(data.lenses) ? data.lenses : []
}

function hasValue(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
}

function hasNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function isLocalPublicImage(imageUrl) {
  return typeof imageUrl === 'string' && imageUrl.startsWith('/')
}

function localImageExists(imageUrl) {
  if (!isLocalPublicImage(imageUrl)) return false
  return fs.existsSync(path.join(PUBLIC_DIR, imageUrl.replace(/^\/+/, '')))
}

function isMajorLens(lens) {
  return Boolean(lens.recommendation_status || lens.availability_status === 'current')
}

function isRareOrCollectorLens(lens) {
  const text = `${lens.brand || ''} ${lens.name || ''}`
  return /Voigtlander|Leica|Noct|Plena|APO-LANTHAR|NOKTON|rare|限定|生産終了/i.test(text)
}

function label(lens) {
  return lens.name || '(no name)'
}

function item(area, lens, reason, action) {
  return {
    area,
    lens: label(lens),
    reason,
    action,
  }
}

function runAuditBeta() {
  const result = spawnSync('node', ['scripts/audit_public_beta.js'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })

  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    reportPath: (result.stdout || '').match(/Report written to:\s*(.+)$/m)?.[1] || '',
    summary: parseAuditSummary(result.stdout || ''),
  }
}

function parseAuditSummary(stdout) {
  const summary = {}
  for (const severity of ['P1', 'P2', 'P3']) {
    const match = stdout.match(new RegExp(`- ${severity}:\\s*(\\d+)`))
    if (match) summary[severity] = Number(match[1])
  }
  return summary
}

function triageLenses(lenses) {
  const autoFix = []
  const humanReview = []
  const later = []
  const unresolved = knownUnresolvedIssues()

  for (const lens of lenses) {
    const major = isMajorLens(lens)
    const hasImageSource = hasValue(lens.image_url) || hasValue(lens.image_url_external)

    if (major && !hasImageSource) {
      autoFix.push(item(
        'image-source',
        lens,
        'image_url / image_url_external が両方ない主要レンズ',
        '公式商品画像または検証済みソースを探し、レンズ単体画像だけを候補化する'
      ))
    }

    if (isLocalPublicImage(lens.image_url) && !localImageExists(lens.image_url)) {
      autoFix.push(item(
        'local-image',
        lens,
        `ローカル画像が missing: ${lens.image_url}`,
        '参照先の正しい processed PNG を用意する。画像の自動取得はしない'
      ))
    }

    const priceInfo = lens.price_info
    if (!priceInfo || (priceInfo.new_price == null && priceInfo.used_price == null)) {
      const target = major ? autoFix : later
      target.push(item(
        'price-source',
        lens,
        'price_info missing or empty',
        '価格ソース確認必須。公式/販売ページの同一製品確認後に個別修正する'
      ))
      continue
    }

    const newPrice = priceInfo.new_price
    const usedPrice = priceInfo.used_price
    if (hasNumber(newPrice) && hasNumber(usedPrice) && usedPrice > newPrice) {
      if (isRareOrCollectorLens(lens)) {
        later.push(item(
          'price-collector',
          lens,
          `rare lens の中古高騰候補: used ${usedPrice}, new ${newPrice}`,
          'Voigtlander / Leica / rare lens は相場理由の可能性があるため保留寄りで確認する'
        ))
      } else if (usedPrice >= newPrice * 1.2) {
        humanReview.push(item(
          'price-anomaly',
          lens,
          `used_price >= 1.2x new_price: used ${usedPrice}, new ${newPrice}`,
          '価格ソースの誤マッチや中古プレミアを人間が確認する'
        ))
      } else {
        later.push(item(
          'price-small-gap',
          lens,
          `used_price > new_price の小差: used ${usedPrice}, new ${newPrice}`,
          '小差は保留または P2。主要候補に頻出する場合だけ先に確認する'
        ))
      }
    }
  }

  for (const known of semanticImageReviewItems()) {
    humanReview.push(known)
  }

  return { autoFix, humanReview, later, unresolved }
}

function semanticImageReviewItems() {
  return [
    {
      area: 'semantic-image',
      lens: '明らかなフード/別製品画像',
      reason: 'フード単体、説明図、装着例、迷彩カバー、別製品疑いは pixel check だけでは確定しにくい',
      action: 'audit:images の contact sheet と実カード表示を人間が確認する',
    },
  ]
}

function knownUnresolvedIssues() {
  const issues = []
  if (!fs.existsSync(MANUAL_REVIEW_PATH)) return issues

  const text = fs.readFileSync(MANUAL_REVIEW_PATH, 'utf8')
  if (/RF500mm F4 L IS USM は unresolved/.test(text)) {
    issues.push({
      area: 'known-unresolved',
      lens: 'RF500mm F4 L IS USM',
      reason: '公式根拠不足。現状画像は Canon 100-500 に見える別製品候補として記録済み',
      action: 'Canon 公式または信頼できる同一製品の単体画像が確認できるまで差し替えない',
    })
  }
  return issues
}

function promptFor(items, title) {
  const sample = items.slice(0, 8)
  if (sample.length === 0) return ''

  const names = sample.map((entry) => `- ${entry.lens}: ${entry.reason}`).join('\n')
  return [
    `### ${title}`,
    '',
    '```text',
    'camera-concierge の公開β前 audit triage 結果に基づく修正候補対応です。',
    '',
    '今回は自動修正せず、以下の対象だけを人間確認したうえで最小差分で対応してください。',
    '',
    names,
    '',
    '禁止:',
    '- lens_data.json の大規模整形',
    '- 画像の自動取得',
    '- 価格の根拠なし書き換え',
    '- API / Dify / localStorage / UI 変更',
    '- audit-output/ のコミット',
    '',
    '実施後:',
    '- npm run audit:beta',
    '- npm run audit:triage',
    '- npm run build',
    '- git status --short',
    '```',
  ].join('\n')
}

function formatItems(items) {
  if (items.length === 0) return ['- none']
  const lines = []
  for (const entry of items.slice(0, SAMPLE_LIMIT)) {
    lines.push(`- [${entry.area}] ${entry.lens}: ${entry.reason}`)
    lines.push(`  - next: ${entry.action}`)
  }
  if (items.length > SAMPLE_LIMIT) lines.push(`- ... and ${items.length - SAMPLE_LIMIT} more`)
  return lines
}

function formatReport({ audit, triage }) {
  const lines = []
  lines.push('# Camera Concierge public beta audit triage')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('mode: detection and prompt generation only; no repo files are modified by this script')
  lines.push('')

  lines.push('## audit:beta source')
  lines.push(`- status: ${audit.status}`)
  lines.push(`- report: ${audit.reportPath || '(not found in stdout)'}`)
  for (const severity of ['P1', 'P2', 'P3']) {
    lines.push(`- ${severity}: ${audit.summary[severity] ?? 'unknown'}`)
  }
  if (audit.stderr.trim()) {
    lines.push(`- stderr: ${audit.stderr.trim().split('\n')[0]}`)
  }
  lines.push('')

  lines.push('## P1 auto-fix candidate')
  lines.push(...formatItems(triage.autoFix))
  lines.push('')

  lines.push('## P1 human review required')
  lines.push(...formatItems(triage.humanReview))
  lines.push('')

  lines.push('## P2 later')
  lines.push(...formatItems(triage.later))
  lines.push('')

  lines.push('## unresolved known issues')
  lines.push(...formatItems(triage.unresolved))
  lines.push('')

  lines.push('## Codex fix prompt drafts')
  lines.push('')
  lines.push(promptFor(triage.autoFix, 'P1 auto-fix candidate prompt') || '- P1 auto-fix candidate はありません。')
  lines.push('')
  lines.push(promptFor(triage.humanReview, 'P1 human review prompt') || '- P1 human review required はありません。')
  lines.push('')

  lines.push('## Human review still required')
  lines.push('- 実Dify回答の自然さとブランドらしさ。')
  lines.push('- フード単体、別製品、装着例、説明図など画像の意味的正誤。')
  lines.push('- 価格ソースの同一製品確認。特に used_price >= 1.2x new_price。')
  lines.push('- RF500mm F4 のような公式根拠不足の unresolved issue。')
  lines.push('')

  return lines.join('\n')
}

function main() {
  const audit = runAuditBeta()
  const lenses = readLenses()
  const triage = triageLenses(lenses)
  const report = formatReport({ audit, triage })

  fs.writeFileSync(REPORT_PATH, report)
  console.log(report)
  console.log(`Triage report written to: ${REPORT_PATH}`)

  if (audit.status !== 0) {
    process.exitCode = audit.status || 1
  }
}

main()

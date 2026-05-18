#!/usr/bin/env node
/**
 * Public beta audit report.
 *
 * Detection only. This script does not edit lens_data.json, image files,
 * recommendation logic, API contracts, localStorage, or generated audit-output.
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const zlib = require('zlib')

const ROOT = path.join(__dirname, '..')
const DATA_PATH = path.join(ROOT, 'public', 'lens_data.json')
const PROCESSED_DIR = path.join(ROOT, 'public', 'lens_images_processed')
const E2E_PATH = path.join(ROOT, 'tests', 'e2e', 'recommendations.spec.ts')
const MANUAL_REVIEW_PATH = path.join(ROOT, 'docs', 'public-beta-manual-review.md')
const REPORT_PATH = path.join(os.tmpdir(), `camera-concierge-public-beta-audit-${timestamp()}.md`)

const SAMPLE_LIMIT = 20
const OLD_PRICE_DAYS = 90

const MOUNT_RULES = {
  'canon-rf-s': {
    label: 'Canon RF-S',
    forbiddenText: [
      /\bXF\b/i,
      /Fujifilm\s*X/i,
      /Xマウント/i,
      /Sony\s*E/i,
      /\bFE\b/i,
      /Nikon\s*Z/i,
      /\bEF-M\b/i,
      /adapter|アダプター|アダプタ前提/i,
    ],
    allowedFamilies: new Set(['canon-rf', 'canon-rf-s']),
  },
  'fuji-x': {
    label: 'Fujifilm X',
    forbiddenText: [/\bGF\b/i, /\bGFX\b/i, /Fujifilm\s*GFX/i],
    allowedFamilies: new Set(['fuji-x']),
  },
  'nikon-z-ff': {
    label: 'Nikon Z',
    forbiddenText: [/Canon\s*RF/i, /Sony\s*E/i, /\bFE\b/i, /Fujifilm\s*X/i, /\bXF\b/i],
    allowedFamilies: new Set(['nikon-z']),
  },
  'nikon-z-apsc': {
    label: 'Nikon Z DX',
    forbiddenText: [/Canon\s*RF/i, /Sony\s*E/i, /\bFE\b/i, /Fujifilm\s*X/i, /\bXF\b/i],
    allowedFamilies: new Set(['nikon-z']),
  },
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeName(value) {
  return normalizeText(value)
    .replace(/^\s*(Sony|Canon|Nikon|Sigma|Tamron|Viltrox|Tokina|Samyang|LAOWA|Fujifilm|FUJINON)\s+/i, '')
    .replace(/\s*\[(?:Fujifilm X|Nikon Z|Canon RF|Sony E)[^\]]*\]\s*$/i, '')
    .replace(/\bf\/\s*/gi, 'F')
    .replace(/[^a-z0-9.]+/gi, '')
    .toLowerCase()
}

function lensNameToFilename(name) {
  const safe = String(name || '')
    .replace(/[^\w\s.-]/gu, '')
    .replace(/\s+/g, '_')
    .trim()
  return `${safe}.png`
}

function mountFamily(value) {
  const text = normalizeText(value).toLowerCase()
  if (!text) return null
  if (text.includes('canon rf-s')) return 'canon-rf-s'
  if (text.includes('canon rf')) return 'canon-rf'
  if (text.includes('fujifilm x') || text === 'x') return 'fuji-x'
  if (text.includes('fujifilm gfx') || text.includes('gfx')) return 'fuji-gfx'
  if (text.includes('nikon z') || text === 'z') return 'nikon-z'
  if (text.includes('sony e') || text === 'fe') return 'sony-e'
  return null
}

function lensFamilies(lens) {
  const values = [lens.mount, ...(Array.isArray(lens.supported_mounts) ? lens.supported_mounts : [])]
  return new Set(values.map(mountFamily).filter(Boolean))
}

function getLensImagePath(lens) {
  const imageUrl = lens.image_url
  if (typeof imageUrl === 'string' && imageUrl.startsWith('/')) {
    return path.join(ROOT, 'public', imageUrl.replace(/^\/+/, ''))
  }
  const guessed = path.join(PROCESSED_DIR, lensNameToFilename(lens.name))
  return fs.existsSync(guessed) ? guessed : null
}

function readPngInfo(filePath) {
  const buffer = fs.readFileSync(filePath)
  if (buffer.length < 33 || buffer.toString('ascii', 1, 4) !== 'PNG') {
    return { ok: false, reason: 'not a PNG' }
  }
  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)
  const colorType = buffer[25]
  const hasAlpha = colorType === 4 || colorType === 6
  let alphaBBox = null
  let alphaAreaRatio = null

  if (hasAlpha) {
    const chunks = []
    let offset = 8
    while (offset + 8 < buffer.length) {
      const length = buffer.readUInt32BE(offset)
      const type = buffer.toString('ascii', offset + 4, offset + 8)
      const dataStart = offset + 8
      const dataEnd = dataStart + length
      if (type === 'IDAT') chunks.push(buffer.subarray(dataStart, dataEnd))
      offset = dataEnd + 4
      if (type === 'IEND') break
    }

    try {
      const inflated = zlib.inflateSync(Buffer.concat(chunks))
      const channels = colorType === 6 ? 4 : 2
      const rowBytes = width * channels
      const unfiltered = Buffer.alloc(height * rowBytes)
      let cursor = 0
      for (let y = 0; y < height; y += 1) {
        const filter = inflated[cursor]
        cursor += 1
        const rowStart = y * rowBytes
        for (let i = 0; i < rowBytes; i += 1) {
          const raw = inflated[cursor + i]
          const left = i >= channels ? unfiltered[rowStart + i - channels] : 0
          const up = y > 0 ? unfiltered[rowStart + i - rowBytes] : 0
          const upLeft = y > 0 && i >= channels ? unfiltered[rowStart + i - rowBytes - channels] : 0
          let value
          if (filter === 0) value = raw
          else if (filter === 1) value = raw + left
          else if (filter === 2) value = raw + up
          else if (filter === 3) value = raw + Math.floor((left + up) / 2)
          else if (filter === 4) value = raw + paeth(left, up, upLeft)
          else value = raw
          unfiltered[rowStart + i] = value & 0xff
        }
        cursor += rowBytes
      }

      let minX = width
      let minY = height
      let maxX = -1
      let maxY = -1
      for (let y = 0; y < height; y += 1) {
        const rowStart = y * rowBytes
        for (let x = 0; x < width; x += 1) {
          const alpha = unfiltered[rowStart + x * channels + channels - 1]
          if (alpha > 8) {
            if (x < minX) minX = x
            if (y < minY) minY = y
            if (x > maxX) maxX = x
            if (y > maxY) maxY = y
          }
        }
      }
      if (maxX >= 0) {
        alphaBBox = { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
        alphaAreaRatio = (alphaBBox.width * alphaBBox.height) / (width * height)
      }
    } catch (error) {
      return { ok: true, width, height, colorType, hasAlpha, alphaError: error.message }
    }
  }

  return { ok: true, width, height, colorType, hasAlpha, alphaBBox, alphaAreaRatio }
}

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

function addFinding(bucket, severity, area, item, detail) {
  bucket.push({ severity, area, item, detail })
}

function loadData() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  const lenses = Array.isArray(data.lenses) ? data.lenses : []
  const byNormalizedName = new Map()
  const byExactName = new Map()
  for (const lens of lenses) {
    const key = normalizeName(lens.name)
    if (!byNormalizedName.has(key)) byNormalizedName.set(key, [])
    byNormalizedName.get(key).push(lens)
    byExactName.set(normalizeText(lens.name).toLowerCase(), lens)
  }
  return { lenses, byNormalizedName, byExactName }
}

function findLens(name, byNormalizedName, byExactName) {
  const exact = byExactName.get(normalizeText(name).toLowerCase())
  if (exact) return exact

  const key = normalizeName(name)
  const direct = byNormalizedName.get(key)
  if (direct?.length === 1) return direct[0]
  if (direct?.length > 1) {
    const nameFamilies = familyHintsFromName(name)
    const hinted = direct.find((lens) => [...lensFamilies(lens)].some((family) => nameFamilies.has(family)))
    return hinted || direct[0]
  }

  const nameFamilies = familyHintsFromName(name)
  let best = null
  let bestScore = 0
  for (const [candidateKey, lenses] of byNormalizedName.entries()) {
    for (const lens of lenses) {
      let score = tokenOverlapScore(key, candidateKey)
      if ([...lensFamilies(lens)].some((family) => nameFamilies.has(family))) score += 0.3
      if (score > bestScore) {
        bestScore = score
        best = lens
      }
    }
  }
  return bestScore >= 0.55 ? best : null
}

function familyHintsFromName(name) {
  const text = normalizeText(name).toLowerCase()
  const families = new Set()
  if (text.includes('fujifilm x') || /\bxf\b/.test(text)) families.add('fuji-x')
  if (text.includes('nikon z') || /\bz\b/.test(text)) families.add('nikon-z')
  if (text.includes('canon rf') || /\brf\b/.test(text)) families.add('canon-rf')
  if (text.includes('sony e') || /\bfe\b/.test(text)) families.add('sony-e')
  return families
}

function tokenOverlapScore(a, b) {
  const aTokens = new Set(String(a).match(/[a-z]+|[0-9.]+/g) || [])
  const bTokens = new Set(String(b).match(/[a-z]+|[0-9.]+/g) || [])
  if (aTokens.size === 0 || bTokens.size === 0) return 0
  let hits = 0
  for (const token of aTokens) {
    if (bTokens.has(token)) hits += 1
  }
  return hits / aTokens.size
}

function parseSmokeCases() {
  if (!fs.existsSync(E2E_PATH)) return []
  const source = fs.readFileSync(E2E_PATH, 'utf8')
  const chunks = source.split(/\n  \{\n    name:/).slice(1)
  return chunks.map((chunk) => {
    const block = `name:${chunk.split(/\n  \},?\n/)[0]}`
    const name = matchString(block, /name:\s*'([^']+)'/)
    const mountId = matchString(block, /mountId:\s*'([^']+)'/)
    const prompt = matchString(block, /prompt:\s*'([^']+)'/)
    const answerArray = block.match(/answer:\s*\[([\s\S]*?)\]\.join\('\\n'\)/)?.[1] || ''
    const answer = extractQuotedStrings(answerArray).join('\n')
    const expectedBlock = block.match(/expectedCardNames:\s*\[([\s\S]*?)\]/)?.[1] || ''
    const expectedCardNames = extractQuotedStrings(expectedBlock)
    return {
      name,
      mountId,
      prompt,
      answer,
      expectedCardNames,
      optionNames: extractOptionNames(answer),
    }
  }).filter((item) => item.name && item.mountId)
}

function matchString(text, re) {
  return text.match(re)?.[1]?.replace(/\\'/g, "'") || ''
}

function extractQuotedStrings(text) {
  const values = []
  const re = /'((?:\\'|[^'])*)'/g
  let match
  while ((match = re.exec(text))) values.push(match[1].replace(/\\'/g, "'"))
  return values
}

function extractOptionNames(answer) {
  return String(answer || '')
    .split('\n')
    .map((line) => line.match(/【選択肢\s*\d+】\s*(.+)$/)?.[1]?.trim())
    .filter(Boolean)
}

function auditSmokeCases(cases, byNormalizedName, byExactName, findings) {
  for (const testCase of cases) {
    const rule = MOUNT_RULES[testCase.mountId]
    const optionCount = testCase.optionNames.length
    if (optionCount < 1 || optionCount > 3) {
      addFinding(findings, 'P1', 'answer-quality', testCase.name, `option count is ${optionCount}`)
    }

    if (/Image unavailable/i.test(testCase.answer)) {
      addFinding(findings, 'P1', 'answer-quality', testCase.name, 'answer includes Image unavailable')
    }

    if (rule) {
      for (const forbidden of rule.forbiddenText) {
        if (forbidden.test(testCase.answer)) {
          addFinding(findings, 'P1', 'mount-compatibility', testCase.name, `answer matched forbidden pattern ${forbidden}`)
        }
      }
    }

    for (const optionName of testCase.optionNames) {
      const lens = findLens(optionName, byNormalizedName, byExactName)
      if (!lens) {
        addFinding(findings, 'P1', 'answer-quality', testCase.name, `candidate not found in lens_data.json: ${optionName}`)
        continue
      }

      if (rule) {
        const families = lensFamilies(lens)
        const compatible = [...families].some((family) => rule.allowedFamilies.has(family))
        if (!compatible) {
          addFinding(
            findings,
            'P1',
            'mount-compatibility',
            testCase.name,
            `${optionName} has families ${[...families].join(', ') || 'unknown'}`
          )
        }
      }

      const imagePath = getLensImagePath(lens)
      if (!imagePath || !fs.existsSync(imagePath)) {
        addFinding(findings, 'P1', 'image-quality', optionName, 'local image file is missing')
      }

      const pi = lens.price_info
      if (!pi || (pi.new_price == null && pi.used_price == null)) {
        addFinding(findings, 'P2', 'price-quality', optionName, 'major smoke candidate has no useful price_info')
      }
    }
  }
}

function auditAllImages(lenses, findings) {
  for (const lens of lenses) {
    const imagePath = getLensImagePath(lens)
    if (!imagePath || !fs.existsSync(imagePath)) {
      addFinding(findings, 'P2', 'image-quality', lens.name, 'local image file is missing')
      continue
    }
    if (path.extname(imagePath).toLowerCase() !== '.png') continue

    const info = readPngInfo(imagePath)
    if (!info.ok) {
      addFinding(findings, 'P2', 'image-quality', lens.name, info.reason || 'image could not be inspected')
      continue
    }
    if (info.width < 160 || info.height < 160) {
      addFinding(findings, 'P2', 'image-quality', lens.name, `very small image: ${info.width}x${info.height}`)
    }
    if (info.width > 1200 || info.height > 1200) {
      addFinding(findings, 'P3', 'image-quality', lens.name, `large processed image: ${info.width}x${info.height}`)
    }
    if (info.hasAlpha && typeof info.alphaAreaRatio === 'number' && info.alphaAreaRatio < 0.18) {
      addFinding(
        findings,
        'P2',
        'image-quality',
        lens.name,
        `transparent PNG may have too much empty space: alpha bbox area ${(info.alphaAreaRatio * 100).toFixed(1)}%`
      )
    }
  }
}

function auditPrices(lenses, findings) {
  const now = Date.now()
  for (const lens of lenses) {
    const pi = lens.price_info
    const isMajor = Boolean(lens.recommendation_status || lens.availability_status === 'current')
    if (!pi || (pi.new_price == null && pi.used_price == null)) {
      addFinding(findings, isMajor ? 'P1' : 'P2', 'price-quality', lens.name, 'price_info missing or empty')
      continue
    }

    const newPrice = numberOrNull(pi.new_price)
    const usedPrice = numberOrNull(pi.used_price)
    if (newPrice != null && usedPrice != null) {
      if (usedPrice > newPrice) {
        addFinding(findings, isMajor ? 'P1' : 'P2', 'price-quality', lens.name, `used_price > new_price (${usedPrice} > ${newPrice})`)
      }
      if (usedPrice >= newPrice * 1.2) {
        addFinding(findings, isMajor ? 'P1' : 'P2', 'price-quality', lens.name, `used_price is >= 1.2x new_price (${usedPrice} vs ${newPrice})`)
      }
    }

    if (typeof pi.fetched_at === 'string') {
      const date = Date.parse(pi.fetched_at)
      if (Number.isFinite(date)) {
        const ageDays = Math.floor((now - date) / 86_400_000)
        if (ageDays > OLD_PRICE_DAYS) {
          addFinding(findings, 'P2', 'price-quality', lens.name, `fetched_at is ${ageDays} days old (${pi.fetched_at})`)
        }
      }
    } else if (isMajor) {
      addFinding(findings, 'P2', 'price-quality', lens.name, 'major lens price_info has no fetched_at')
    }

    if (isMajor && newPrice != null && isExtremePrice(lens, newPrice)) {
      addFinding(findings, 'P2', 'price-quality', lens.name, `major candidate new_price looks high for non-flagship lens (${newPrice})`)
    }
  }
}

function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function isExtremePrice(lens, price) {
  const name = lens.name || ''
  const telephotoOrPro = /400|500|600|800|1200|F1\.0|F1\.2|Noct|Plena|GM|L\b|S\b|50-140|8-16/i.test(name)
  return price >= 180000 && !telephotoOrPro
}

function auditManualReview(findings) {
  if (!fs.existsSync(MANUAL_REVIEW_PATH)) {
    addFinding(findings, 'P2', 'manual-review', 'docs/public-beta-manual-review.md', 'manual review doc is missing')
    return
  }
  const text = fs.readFileSync(MANUAL_REVIEW_PATH, 'utf8')
  for (const phrase of ['Canon RF-S: pass', 'Sony E: pass', 'Nikon Z: pass', 'Fujifilm X: pass', 'RF500mm F4']) {
    if (!text.includes(phrase)) {
      addFinding(findings, 'P3', 'manual-review', 'docs/public-beta-manual-review.md', `missing review note: ${phrase}`)
    }
  }
}

function formatReport({ lenses, cases, findings }) {
  const lines = []
  lines.push('# Camera Concierge public beta audit')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push(`lens_data.json lenses: ${lenses.length}`)
  lines.push(`recommendation smoke cases parsed: ${cases.length}`)
  lines.push('mode: detection only; no files were modified by this script')
  lines.push('')

  const bySeverity = groupBy(findings, (finding) => finding.severity)
  lines.push('## Summary')
  for (const severity of ['P1', 'P2', 'P3']) {
    lines.push(`- ${severity}: ${(bySeverity.get(severity) || []).length}`)
  }
  lines.push('')

  for (const severity of ['P1', 'P2', 'P3']) {
    const items = bySeverity.get(severity) || []
    lines.push(`## ${severity}`)
    if (items.length === 0) {
      lines.push('- none')
      lines.push('')
      continue
    }
    for (const finding of items.slice(0, SAMPLE_LIMIT)) {
      lines.push(`- [${finding.area}] ${finding.item}: ${finding.detail}`)
    }
    if (items.length > SAMPLE_LIMIT) {
      lines.push(`- ... and ${items.length - SAMPLE_LIMIT} more`)
    }
    lines.push('')
  }

  lines.push('## Smoke scenarios')
  for (const testCase of cases) {
    lines.push(`- ${testCase.name}: ${testCase.optionNames.length} option(s) -> ${testCase.optionNames.join(' / ') || 'none'}`)
  }
  lines.push('')

  lines.push('## Human review still required')
  lines.push('- Actual Dify answers in production, because this audit reads mocked smoke fixtures and local DB.')
  lines.push('- Visual correctness of product photos, especially hood/accessory/kit images that are hard to detect from pixels alone.')
  lines.push('- Price source correctness, because numeric anomaly checks cannot verify whether the matched store item is the same lens.')
  lines.push('- Brand voice quality, especially Fujifilm X lightness/snap/film-like recommendation tone.')
  lines.push('')

  return lines.join('\n')
}

function groupBy(items, keyFn) {
  const map = new Map()
  for (const item of items) {
    const key = keyFn(item)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return map
}

function main() {
  const { lenses, byNormalizedName, byExactName } = loadData()
  const cases = parseSmokeCases()
  const findings = []

  auditSmokeCases(cases, byNormalizedName, byExactName, findings)
  auditAllImages(lenses, findings)
  auditPrices(lenses, findings)
  auditManualReview(findings)

  const report = formatReport({ lenses, cases, findings })
  fs.writeFileSync(REPORT_PATH, report)
  console.log(report)
  console.log(`Report written to: ${REPORT_PATH}`)
}

main()

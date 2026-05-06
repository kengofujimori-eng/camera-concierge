#!/usr/bin/env node
/**
 * lens_data.json quality check.
 *
 * 警告表示のみ。現状把握用なので検出があっても exit code 0 で終了する。
 */

const fs = require('fs')
const path = require('path')

const DATA_PATH = path.join(__dirname, '..', 'public', 'lens_data.json')
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const SAMPLE_LIMIT = 12

function lensLabel(lens, index) {
  return `${index + 1}. ${lens.name || '(no name)'}`
}

function printSection(title, items, formatItem) {
  console.log(`\n## ${title}`)
  console.log(`count: ${items.length}`)
  if (items.length === 0) return

  const sample = items.slice(0, SAMPLE_LIMIT)
  sample.forEach((item) => {
    console.log(`- ${formatItem(item)}`)
  })
  if (items.length > sample.length) {
    console.log(`... and ${items.length - sample.length} more`)
  }
}

function isLocalPublicImage(imageUrl) {
  return typeof imageUrl === 'string' && imageUrl.startsWith('/')
}

function localImageExists(imageUrl) {
  const relativePath = imageUrl.replace(/^\/+/, '')
  const filePath = path.join(PUBLIC_DIR, relativePath)
  return fs.existsSync(filePath)
}

function hasKnownMount(lens) {
  if (Array.isArray(lens.supported_mounts) && lens.supported_mounts.length > 0) {
    return true
  }

  if (typeof lens.mount !== 'string') return false

  const normalized = lens.mount.trim().toLowerCase()
  if (!normalized) return false

  return !['unknown', '不明', '要確認', 'n/a', 'na'].includes(normalized)
}

function isMajorLens(lens) {
  return Boolean(lens.recommendation_status || lens.availability_status)
}

function hasNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function main() {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  const lenses = Array.isArray(raw.lenses) ? raw.lenses : []

  const noImage = []
  const missingLocalImage = []
  const noRecommendationStatus = []
  const discontinuedWithoutReplacement = []
  const noUsefulPriceInfo = []
  const usedPriceHigherThanNew = []
  const usedPriceAtLeast20PctHigher = []
  const majorLensMissingMount = []
  const names = new Map()

  lenses.forEach((lens, index) => {
    const imageUrl = lens.image_url
    const imageUrlExternal = lens.image_url_external

    if (!imageUrl && !imageUrlExternal) {
      noImage.push({ lens, index })
    }

    if (isLocalPublicImage(imageUrl) && !localImageExists(imageUrl)) {
      missingLocalImage.push({ lens, index, imageUrl })
    }

    if (!lens.recommendation_status) {
      noRecommendationStatus.push({ lens, index })
    }

    if (lens.discontinued === true && !lens.replacement) {
      discontinuedWithoutReplacement.push({ lens, index })
    }

    const priceInfo = lens.price_info
    if (!priceInfo || (priceInfo.new_price == null && priceInfo.used_price == null)) {
      noUsefulPriceInfo.push({ lens, index })
    }

    if (priceInfo && hasNumber(priceInfo.new_price) && hasNumber(priceInfo.used_price)) {
      if (priceInfo.used_price > priceInfo.new_price) {
        usedPriceHigherThanNew.push({ lens, index, priceInfo })
      }

      if (priceInfo.used_price >= priceInfo.new_price * 1.2) {
        usedPriceAtLeast20PctHigher.push({ lens, index, priceInfo })
      }
    }

    if (isMajorLens(lens) && !hasKnownMount(lens)) {
      majorLensMissingMount.push({ lens, index })
    }

    const name = lens.name || ''
    if (name) {
      if (!names.has(name)) names.set(name, [])
      names.get(name).push(index)
    }
  })

  const duplicateNames = Array.from(names.entries())
    .filter(([, indexes]) => indexes.length > 1)
    .map(([name, indexes]) => ({ name, indexes }))

  console.log('lens_data.json quality check')
  console.log(`file: ${path.relative(process.cwd(), DATA_PATH)}`)
  console.log(`total lenses: ${lenses.length}`)
  console.log('mode: warnings only (exit code 0)')

  printSection(
    'image_url / image_url_external が両方ない',
    noImage,
    ({ lens, index }) => lensLabel(lens, index)
  )

  printSection(
    'ローカル image_url の参照先ファイルが存在しない',
    missingLocalImage,
    ({ lens, index, imageUrl }) => `${lensLabel(lens, index)} -> ${imageUrl}`
  )

  printSection(
    'recommendation_status がない',
    noRecommendationStatus,
    ({ lens, index }) => lensLabel(lens, index)
  )

  printSection(
    'discontinued: true だが replacement がない',
    discontinuedWithoutReplacement,
    ({ lens, index }) => lensLabel(lens, index)
  )

  printSection(
    '同名レンズの重複',
    duplicateNames,
    ({ name, indexes }) => `${name} -> indexes ${indexes.join(', ')}`
  )

  printSection(
    'price_info がない、または new_price / used_price が両方 null',
    noUsefulPriceInfo,
    ({ lens, index }) => lensLabel(lens, index)
  )

  printSection(
    'used_price が new_price より高い',
    usedPriceHigherThanNew,
    ({ lens, index, priceInfo }) =>
      `${lensLabel(lens, index)} -> new ${priceInfo.new_price}, used ${priceInfo.used_price}`
  )

  printSection(
    'used_price が new_price の1.2倍以上',
    usedPriceAtLeast20PctHigher,
    ({ lens, index, priceInfo }) =>
      `${lensLabel(lens, index)} -> new ${priceInfo.new_price}, used ${priceInfo.used_price}`
  )

  printSection(
    '主要レンズだが mount / supported_mounts がない、または不明',
    majorLensMissingMount,
    ({ lens, index }) => lensLabel(lens, index)
  )

  const warningCount =
    noImage.length +
    missingLocalImage.length +
    noRecommendationStatus.length +
    discontinuedWithoutReplacement.length +
    duplicateNames.length +
    noUsefulPriceInfo.length +
    usedPriceHigherThanNew.length +
    usedPriceAtLeast20PctHigher.length +
    majorLensMissingMount.length

  console.log(`\nsummary: ${warningCount} warnings across ${lenses.length} lenses`)
}

main()

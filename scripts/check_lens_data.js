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

function main() {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  const lenses = Array.isArray(raw.lenses) ? raw.lenses : []

  const noImage = []
  const missingLocalImage = []
  const noRecommendationStatus = []
  const discontinuedWithoutReplacement = []
  const noUsefulPriceInfo = []
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

  const warningCount =
    noImage.length +
    missingLocalImage.length +
    noRecommendationStatus.length +
    discontinuedWithoutReplacement.length +
    duplicateNames.length +
    noUsefulPriceInfo.length

  console.log(`\nsummary: ${warningCount} warnings across ${lenses.length} lenses`)
}

main()

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'warehouse.db')

function getDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  const db = new Database(DB_PATH)

  db.exec(`
    CREATE TABLE IF NOT EXISTS warehouse (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      maker      TEXT NOT NULL,
      category   TEXT NOT NULL,
      price_range TEXT NOT NULL,
      weight     TEXT NOT NULL,
      features   TEXT NOT NULL,
      amazon_url TEXT NOT NULL,
      added_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  return db
}

export function getAllWarehouseItems() {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM warehouse ORDER BY added_at DESC').all() as Array<{
    id: number
    name: string
    maker: string
    category: string
    price_range: string
    weight: string
    features: string
    amazon_url: string
    added_at: string
  }>

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    maker: row.maker,
    category: row.category as 'camera' | 'lens',
    priceRange: row.price_range,
    weight: row.weight,
    features: JSON.parse(row.features) as string[],
    amazonUrl: row.amazon_url,
    addedAt: row.added_at,
  }))
}

export function addWarehouseItem(item: {
  name: string
  maker: string
  category: string
  priceRange: string
  weight: string
  features: string[]
  amazonUrl: string
}) {
  const db = getDb()

  const existing = db
    .prepare('SELECT id FROM warehouse WHERE name = ? AND maker = ?')
    .get(item.name, item.maker)

  if (existing) {
    return { success: false, message: 'すでに倉庫に追加済みです' }
  }

  const stmt = db.prepare(`
    INSERT INTO warehouse (name, maker, category, price_range, weight, features, amazon_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    item.name,
    item.maker,
    item.category,
    item.priceRange,
    item.weight,
    JSON.stringify(item.features),
    item.amazonUrl,
  )

  return { success: true, message: '倉庫に追加しました' }
}

export function removeWarehouseItem(id: number) {
  const db = getDb()
  db.prepare('DELETE FROM warehouse WHERE id = ?').run(id)
  return { success: true }
}

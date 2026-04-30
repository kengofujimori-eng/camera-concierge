import { NextRequest, NextResponse } from 'next/server'
import { getAllWarehouseItems, addWarehouseItem, removeWarehouseItem } from '@/lib/db'
import { Product } from '@/types'

export async function GET() {
  try {
    const items = getAllWarehouseItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Warehouse GET error:', error)
    return NextResponse.json({ error: '倉庫データの取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const product = (await req.json()) as Product
    const result = addWarehouseItem({
      name: product.name,
      maker: product.maker,
      category: product.category,
      priceRange: product.priceRange,
      weight: product.weight,
      features: product.features,
      amazonUrl: product.amazonUrl,
    })
    return NextResponse.json(result, { status: result.success ? 201 : 409 })
  } catch (error) {
    console.error('Warehouse POST error:', error)
    return NextResponse.json({ error: '倉庫への追加に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = (await req.json()) as { id: number }
    const result = removeWarehouseItem(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Warehouse DELETE error:', error)
    return NextResponse.json({ error: '倉庫からの削除に失敗しました' }, { status: 500 })
  }
}

'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Check, Camera, Aperture } from 'lucide-react'
import { Product } from '@/types'
import { withAmazonTag } from '@/lib/affiliateLinks'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  async function handleAddToWarehouse() {
    if (saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const data = (await res.json()) as { success: boolean; message: string }
      setMessage(data.message)
      if (data.success) setSaved(true)
    } catch {
      setMessage('保存に失敗しました')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const isCamera = product.category === 'camera'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
            {isCamera ? (
              <Camera className="h-4 w-4 text-blue-500" />
            ) : (
              <Aperture className="h-4 w-4 text-blue-500" />
            )}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {isCamera ? 'カメラ' : 'レンズ'}
          </span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">{product.maker}</span>
      </div>

      {/* Product name */}
      <h3 className="mb-3 font-semibold text-slate-900 dark:text-white leading-snug">
        {product.name}
      </h3>

      {/* Specs */}
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700/50">
          <p className="text-xs text-slate-400 dark:text-slate-500">価格帯</p>
          <p className="font-medium text-slate-700 dark:text-slate-200">{product.priceRange}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700/50">
          <p className="text-xs text-slate-400 dark:text-slate-500">重量</p>
          <p className="font-medium text-slate-700 dark:text-slate-200">{product.weight}</p>
        </div>
      </div>

      {/* Features */}
      <ul className="mb-4 space-y-1">
        {product.features.map((f, i) => (
          <li key={i} className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
            {f}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={withAmazonTag(product.amazonUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-amber-500"
        >
          <ShoppingCart className="h-4 w-4" />
          Amazon で見る
        </a>
        <button
          onClick={handleAddToWarehouse}
          disabled={saving || saved}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            saved
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {saved ? '保存済' : '倉庫へ'}
        </button>
      </div>
      <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">PR / アフィリエイト広告を含みます</p>

      {/* Feedback message */}
      {message && (
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">{message}</p>
      )}
    </div>
  )
}

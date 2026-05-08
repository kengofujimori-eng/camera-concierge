'use client'

import { useEffect, useMemo, useState } from 'react'
import lensData from '../../../public/lens_data.json'

type ReviewStatus =
  | 'unreviewed'
  | 'ok'
  | 'missing'
  | 'placeholder'
  | 'hood'
  | 'accessory'
  | 'wrong-product'
  | 'low-quality'

type LensRecord = {
  name: string
  brand?: string
  mount?: string
  supported_mounts?: string[]
  recommendation_status?: string
  availability_status?: string
  image_url?: string
  image_url_external?: string
  official_url?: string
  source_url?: string
  price_info?: unknown
}

type StoredReview = {
  status: ReviewStatus
  updatedAt: string
}

const STORAGE_KEY = 'lens-image-audit-results-v1'

const REVIEW_STATUSES: { value: ReviewStatus; label: string }[] = [
  { value: 'unreviewed', label: '未確認' },
  { value: 'ok', label: 'OK' },
  { value: 'missing', label: '画像なし' },
  { value: 'placeholder', label: 'プレースホルダー' },
  { value: 'hood', label: 'フード' },
  { value: 'accessory', label: 'アクセサリ' },
  { value: 'wrong-product', label: '別製品' },
  { value: 'low-quality', label: '低品質' },
]

const PROBLEMATIC_STATUSES = new Set<ReviewStatus>([
  'missing',
  'placeholder',
  'hood',
  'accessory',
  'wrong-product',
  'low-quality',
])

const lenses = (lensData as { lenses: LensRecord[] }).lenses

function formatMount(lens: LensRecord) {
  const values = [lens.mount, ...(lens.supported_mounts ?? [])].filter(Boolean) as string[]
  return Array.from(new Set(values)).join(' / ') || '未設定'
}

function hasPriceInfo(lens: LensRecord) {
  return Boolean(lens.price_info)
}

function statusLabel(status: ReviewStatus) {
  return REVIEW_STATUSES.find((item) => item.value === status)?.label ?? status
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function downloadText(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function AuditImage({ lens }: { lens: LensRecord }) {
  const [src, setSrc] = useState(lens.image_url || lens.image_url_external || '')
  const [failedProcessed, setFailedProcessed] = useState(false)

  useEffect(() => {
    setSrc(lens.image_url || lens.image_url_external || '')
    setFailedProcessed(false)
  }, [lens.image_url, lens.image_url_external])

  if (!src) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
        no image
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <img
        src={src}
        alt={lens.name}
        className="aspect-[4/3] w-full object-contain p-3"
        loading="lazy"
        onError={() => {
          if (src === lens.image_url && lens.image_url_external && !failedProcessed) {
            setFailedProcessed(true)
            setSrc(lens.image_url_external)
          } else {
            setSrc('')
          }
        }}
      />
      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:bg-slate-950/85 dark:text-slate-300">
        {src === lens.image_url ? 'processed' : 'external'}
      </span>
    </div>
  )
}

function LinkOrEmpty({ href, label }: { href?: string; label: string }) {
  if (!href) return <span className="text-slate-400">なし</span>
  return (
    <a className="text-slate-600 underline-offset-4 hover:text-amber-600 hover:underline dark:text-slate-300" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  )
}

export default function ImageAuditPage() {
  const [reviews, setReviews] = useState<Record<string, StoredReview>>({})
  const [search, setSearch] = useState('')
  const [mountFilter, setMountFilter] = useState('all')
  const [onlyUnreviewed, setOnlyUnreviewed] = useState(false)
  const [onlyProblematic, setOnlyProblematic] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setReviews(JSON.parse(raw) as Record<string, StoredReview>)
    } catch {
      setReviews({})
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
    } catch {
      // localStorage can be unavailable in private contexts.
    }
  }, [reviews])

  const mountOptions = useMemo(() => {
    const values = new Set<string>()
    for (const lens of lenses) {
      if (lens.mount) values.add(lens.mount)
      for (const mount of lens.supported_mounts ?? []) values.add(mount)
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [])

  const summary = useMemo(() => {
    const counts = Object.fromEntries(REVIEW_STATUSES.map((status) => [status.value, 0])) as Record<ReviewStatus, number>
    for (const lens of lenses) {
      const status = reviews[lens.name]?.status ?? 'unreviewed'
      counts[status] += 1
    }
    return counts
  }, [reviews])

  const filteredLenses = useMemo(() => {
    const q = search.trim().toLowerCase()
    return lenses.filter((lens) => {
      const status = reviews[lens.name]?.status ?? 'unreviewed'
      const mountValues = [lens.mount, ...(lens.supported_mounts ?? [])].filter(Boolean)

      if (q && !lens.name.toLowerCase().includes(q)) return false
      if (mountFilter !== 'all' && !mountValues.includes(mountFilter)) return false
      if (onlyUnreviewed && status !== 'unreviewed') return false
      if (onlyProblematic && !PROBLEMATIC_STATUSES.has(status)) return false
      return true
    })
  }, [mountFilter, onlyProblematic, onlyUnreviewed, reviews, search])

  function setReviewStatus(lensName: string, status: ReviewStatus) {
    setReviews((current) => ({
      ...current,
      [lensName]: {
        status,
        updatedAt: new Date().toISOString(),
      },
    }))
  }

  function buildExportRows() {
    return lenses.map((lens) => {
      const review = reviews[lens.name]
      return {
        name: lens.name,
        brand: lens.brand ?? '',
        mount: lens.mount ?? '',
        supported_mounts: (lens.supported_mounts ?? []).join('|'),
        review_status: review?.status ?? 'unreviewed',
        updated_at: review?.updatedAt ?? '',
        image_url: lens.image_url ?? '',
        image_url_external: lens.image_url_external ?? '',
        has_price_info: hasPriceInfo(lens),
      }
    })
  }

  function exportJson() {
    downloadText('lens-image-audit-results.json', JSON.stringify(buildExportRows(), null, 2), 'application/json')
  }

  function exportCsv() {
    const rows = buildExportRows()
    const headers = Object.keys(rows[0] ?? {})
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => csvEscape(String(row[header as keyof typeof row]))).join(',')),
    ].join('\n')
    downloadText('lens-image-audit-results.csv', csv, 'text/csv;charset=utf-8')
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Local Tool</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Lens Image Audit</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              画像の欠落、プレースホルダー、フード、アクセサリ、別製品をローカルで確認します。DBへの書き込みは行いません。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportJson} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Export JSON
            </button>
            <button onClick={exportCsv} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Export CSV
            </button>
          </div>
        </div>

        <section data-testid="image-audit-summary" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {REVIEW_STATUSES.map((status) => (
            <div key={status.value} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{status.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{summary[status.value]}</p>
            </div>
          ))}
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_auto_auto] lg:items-center">
            <input
              data-testid="image-audit-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="レンズ名で検索..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:focus:border-amber-500"
            />
            <select
              data-testid="image-audit-mount-filter"
              value={mountFilter}
              onChange={(event) => setMountFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-amber-500"
            >
              <option value="all">すべてのマウント</option>
              {mountOptions.map((mount) => (
                <option key={mount} value={mount}>{mount}</option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={onlyUnreviewed} onChange={(event) => setOnlyUnreviewed(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-amber-500" />
              unreviewedのみ
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={onlyProblematic} onChange={(event) => setOnlyProblematic(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-amber-500" />
              problematicのみ
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-400">{filteredLenses.length} / {lenses.length} 件を表示中</p>
        </section>

        <section data-testid="image-audit-grid" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredLenses.map((lens) => {
            const status = reviews[lens.name]?.status ?? 'unreviewed'
            return (
              <article key={lens.name} data-testid="image-audit-card" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <AuditImage lens={lens} />
                <div className="mt-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-sm font-bold leading-snug">{lens.name}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      PROBLEMATIC_STATUSES.has(status)
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
                        : status === 'ok'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {statusLabel(status)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5 text-xs">
                    <dt className="text-slate-400">brand</dt><dd>{lens.brand || '未設定'}</dd>
                    <dt className="text-slate-400">mount</dt><dd>{formatMount(lens)}</dd>
                    <dt className="text-slate-400">recommend</dt><dd>{lens.recommendation_status || '未設定'}</dd>
                    <dt className="text-slate-400">available</dt><dd>{lens.availability_status || '未設定'}</dd>
                    <dt className="text-slate-400">price_info</dt><dd>{hasPriceInfo(lens) ? 'あり' : 'なし'}</dd>
                    <dt className="text-slate-400">official</dt><dd><LinkOrEmpty href={lens.official_url} label="open" /></dd>
                    <dt className="text-slate-400">source</dt><dd><LinkOrEmpty href={lens.source_url} label="open" /></dd>
                  </dl>
                  <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-[11px] dark:bg-slate-950">
                    <p className="break-all"><span className="font-semibold text-slate-500">image_url:</span> {lens.image_url || 'なし'}</p>
                    <p className="break-all"><span className="font-semibold text-slate-500">external:</span> {lens.image_url_external || 'なし'}</p>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">review status</label>
                    <select
                      data-testid="image-audit-status"
                      value={status}
                      onChange={(event) => setReviewStatus(lens.name, event.target.value as ReviewStatus)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-amber-500"
                    >
                      {REVIEW_STATUSES.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}

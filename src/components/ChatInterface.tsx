'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Warehouse, Camera as CameraIcon, ChevronRight, ChevronDown, Check, Settings, RotateCcw, X } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ChatMessage } from '@/types'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import LensRecommendationCards from './LensRecommendationCards'
import { generateAmazonSearchUrl } from '@/lib/affiliateLinks'

marked.setOptions({ breaks: true })

// ── マウント定義 ───────────────────────────────────────────
interface MountOption {
  id: string
  label: string       // 表示名
  sub: string         // センサーサイズ等
  prompt: string      // Difyに送るテキスト
}

const MOUNTS: MountOption[] = [
  { id: 'sony-e-ff',   label: 'Sony E',        sub: 'フルサイズ',          prompt: 'Sony Eマウント（フルサイズ）' },
  { id: 'sony-e-apsc', label: 'Sony E',        sub: 'APS-C',              prompt: 'Sony Eマウント（APS-C）' },
  { id: 'canon-rf',    label: 'Canon RF',      sub: 'フルサイズ',          prompt: 'Canon RFマウント（フルサイズ）' },
  { id: 'canon-rf-s',  label: 'Canon RF-S',   sub: 'APS-C',              prompt: 'Canon RF-Sマウント（APS-C）' },
  { id: 'nikon-z-ff',  label: 'Nikon Z',       sub: 'フルサイズ',          prompt: 'Nikon Zマウント（フルサイズ）' },
  { id: 'nikon-z-apsc',label: 'Nikon Z',       sub: 'APS-C (DX)',         prompt: 'Nikon Zマウント（APS-C / DX）' },
  { id: 'fuji-x',      label: 'Fujifilm X',    sub: 'APS-C',              prompt: 'Fujifilm Xマウント（APS-C）' },
  { id: 'fuji-gfx',    label: 'Fujifilm GFX',  sub: '中判',               prompt: 'Fujifilm GFXマウント（中判）' },
  { id: 'm43',         label: 'Micro 4/3',     sub: 'マイクロフォーサーズ', prompt: 'マイクロフォーサーズマウント（MFT）' },
  { id: 'leica-m',     label: 'Leica M',       sub: 'フルサイズ',          prompt: 'Leica Mマウント（フルサイズ）' },
]

// ── マウント別ボディ一覧 ──────────────────────────────────
const BODIES_BY_MOUNT: Record<string, string[]> = {
  'sony-e-ff': [
    // α7シリーズ（現行〜旧世代）
    'α7 IV','α7 III','α7 II','α7',
    // α7Rシリーズ
    'α7R V','α7R IV','α7R III','α7R II','α7R',
    // α7Sシリーズ
    'α7S III','α7S II','α7S',
    // α7Cシリーズ
    'α7C II','α7C R','α7C',
    // α9シリーズ
    'α9 III','α9 II','α9',
    // その他
    'ZV-E1',
  ],
  'sony-e-apsc': [
    'α6700','α6600','α6500','α6400','α6300','α6100','α6000',
    'ZV-E10 II','ZV-E10',
    'α5100','α5000',
    'NEX-7','NEX-6','NEX-5T','NEX-5R','NEX-3N',
  ],
  'canon-rf': [
    // プロ・ハイエンド
    'EOS R1','EOS R3','EOS R5 Mark II','EOS R5',
    // ミドル
    'EOS R6 Mark II','EOS R6',
    // エントリー
    'EOS R8','EOS RP','EOS R',
    // 特殊
    'EOS Ra',
  ],
  'canon-rf-s': [
    'EOS R7','EOS R10','EOS R50','EOS R100',
  ],
  'nikon-z-ff': [
    // プロ・ハイエンド
    'Z9','Z8',
    // ミドル
    'Z7 III','Z7 II','Z7',
    'Z6 III','Z6 II','Z6',
    'Z5 II','Z5',
    // クリエイティブ
    'Zf',
  ],
  'nikon-z-apsc': [
    'Z50 II','Z50','Z30','Zfc',
  ],
  'fuji-x': [
    // X-Tシリーズ
    'X-T5','X-T4','X-T3','X-T2','X-T1',
    'X-T50','X-T30 II','X-T30','X-T20','X-T10',
    // X-Hシリーズ
    'X-H2S','X-H2','X-H1',
    // X-Sシリーズ
    'X-S20','X-S10',
    // X-Proシリーズ
    'X-Pro3','X-Pro2','X-Pro1',
    // X-Eシリーズ
    'X-E4','X-E3','X-E2S','X-E2',
    // コンパクト（レンズ交換式）
    'X-M5',
  ],
  'fuji-gfx': [
    'GFX100S II','GFX100 II','GFX100S','GFX100',
    'GFX50S II','GFX50S','GFX50R',
  ],
  'm43': [
    // OM SYSTEM / Olympus
    'OM-1 Mark II','OM-1','OM-5',
    'OM-D E-M1 Mark III','OM-D E-M1 Mark II','OM-D E-M1',
    'OM-D E-M5 Mark III','OM-D E-M5 Mark II','OM-D E-M5',
    'OM-D E-M10 Mark IV','OM-D E-M10 Mark III',
    'PEN-F',
    // Panasonic LUMIX G
    'Lumix GH7','Lumix GH6','Lumix GH5 II','Lumix GH5',
    'Lumix G9 II','Lumix G9',
    'Lumix G95','Lumix G85','Lumix G7',
    'Lumix GX9','Lumix GX8',
  ],
  'leica-m': [
    'M11-P','M11 Monochrom','M11',
    'M10-R','M10-P','M10 Monochrom','M10',
    'M Typ 240','M-E Typ 240',
    'M9','M8',
  ],
}

// ── 予算定義 ─────────────────────────────────────────────
interface BudgetOption { id: string; label: string; prompt: string }
const BUDGETS: BudgetOption[] = [
  { id: 'b50k',  label: '〜5万',   prompt: '予算5万円以下' },
  { id: 'b100k', label: '〜10万',  prompt: '予算10万円以下' },
  { id: 'b200k', label: '〜20万',  prompt: '予算20万円以下' },
  { id: 'b300k', label: '〜30万',  prompt: '予算30万円以下' },
  { id: 'bany',  label: '無制限',  prompt: '予算は特に問わない' },
]

// ── 焦点距離レンジ ────────────────────────────────────────
interface FocalRange { minMm: number; maxMm: number }

const FOCAL_LOG_MIN = Math.log10(12)
const FOCAL_LOG_MAX = Math.log10(600)
const FOCAL_SNAP_MMS = [12, 14, 16, 18, 20, 24, 28, 35, 50, 55, 85, 100, 105, 135, 150, 200, 300, 400, 600]

function mmToLogPct(mm: number): number {
  return (Math.log10(Math.max(12, Math.min(600, mm))) - FOCAL_LOG_MIN) / (FOCAL_LOG_MAX - FOCAL_LOG_MIN)
}
function logPctToMm(pct: number): number {
  return 10 ** (pct * (FOCAL_LOG_MAX - FOCAL_LOG_MIN) + FOCAL_LOG_MIN)
}
function snapMm(mm: number): number {
  return FOCAL_SNAP_MMS.reduce((best, v) => (Math.abs(v - mm) < Math.abs(best - mm) ? v : best))
}
function getFocalRangePrompt(r: FocalRange): string {
  const { minMm, maxMm } = r
  const zones: string[] = []
  if (minMm < 24) zones.push('超広角')
  if (minMm < 35 && maxMm > 24) zones.push('広角')
  if (minMm < 85 && maxMm > 35) zones.push('標準')
  if (minMm < 135 && maxMm > 85) zones.push('ポートレート')
  if (maxMm >= 135) zones.push('望遠')
  const zoneText =
    zones.length >= 2
      ? `（${zones[0]}〜${zones[zones.length - 1]}域）`
      : zones.length === 1
      ? `（${zones[0]}域）`
      : ''
  return `焦点距離は${minMm}mm〜${maxMm}mmの範囲${zoneText}を希望`
}

// ── AI選択肢の自動検出 ───────────────────────────────────
interface Choice { number: string; label: string; sendText: string }

function parseChoices(text: string): Choice[] {
  const choices: Choice[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    const stripped = line.trim()
    // 「1. 「label」...」「1. **label**...」「1. label →...」パターン
    const m =
      stripped.match(/^(\d+)[.．]\s*[「『]([^」』\n]{2,30})[」』]/) ||
      stripped.match(/^(\d+)[.．]\s*\*\*([^*\n]{2,30})\*\*/) ||
      stripped.match(/^(\d+)[.．]\s*([^\s\n→➤][^\n→➤]{2,28}?)\s*[→➤]/)
    if (m) {
      const label = m[2].trim()
      choices.push({
        number: m[1],
        label,
        sendText: `「${label}」で提案してください`,
      })
    }
  }
  // 2件以上連続して検出できた場合のみ有効
  return choices.length >= 2 ? choices.slice(0, 6) : []
}

// ── 選択肢ボタン ──────────────────────────────────────────
function ChoiceButtons({ text, onSelect }: { text: string; onSelect: (t: string) => void }) {
  const choices = parseChoices(text)
  if (choices.length === 0) return null
  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-[11px] text-slate-500 dark:text-slate-400 px-0.5">👆 選択して続ける</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <motion.button
            key={c.number}
            onClick={() => onSelect(c.sendText)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100 hover:border-amber-400 transition-colors dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
          >
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/30 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              {c.number}
            </span>
            {c.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── 撮影シーン ────────────────────────────────────────────
const SCENES = [
  { emoji: '👶', label: '子供・家族',    q: '子供を室内で撮りたい' },
  { emoji: '👤', label: 'ポートレート',  q: 'ポートレートを美しく撮りたい' },
  { emoji: '🌄', label: '風景・星空',    q: '風景や星空を撮りたい' },
  { emoji: '🏃', label: 'スポーツ・動体', q: '動き回る被写体をしっかり撮りたい' },
  { emoji: '🐦', label: '野鳥・望遠',    q: '野鳥や飛行機を望遠で撮りたい' },
  { emoji: '🍽️', label: '料理・物撮り',  q: '料理やテーブルフォトを撮りたい' },
  { emoji: '✈️', label: '旅行・街歩き',  q: '旅行に持ち出せる軽いレンズが欲しい' },
  { emoji: '💰', label: 'コスパ重視',    q: 'コスパ最強のレンズを教えてほしい' },
]

const QUICK_QUESTIONS = SCENES.map((s) => s.q)

// ── マウント選択パネル ────────────────────────────────────
function MountSelector({
  selected,
  onChange,
}: {
  selected: MountOption | null
  onChange: (m: MountOption) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* 現在のマウント表示 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-md bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <CameraIcon className="h-3.5 w-3.5 text-amber-400" />
          </div>
          {selected ? (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{selected.label}</p>
              <p className="text-[10px] text-slate-500 truncate">{selected.sub}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">マウントを選択...</p>
          )}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* ドロップダウン */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-slate-800 border border-white/10 shadow-xl overflow-hidden z-50"
          >
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              使用マウント
            </p>
            <div className="pb-1.5 max-h-60 overflow-y-auto">
              {MOUNTS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onChange(m); setOpen(false) }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-200">{m.label}</p>
                    <p className="text-[10px] text-slate-500">{m.sub}</p>
                  </div>
                  {selected?.id === m.id && (
                    <Check className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── 予算スライダー ────────────────────────────────────────
function BudgetSlider({
  selected,
  onChange,
}: {
  selected: BudgetOption | null
  onChange: (b: BudgetOption | null) => void
}) {
  const idx = selected ? BUDGETS.findIndex((b) => b.id === selected.id) : -1

  return (
    <div className="px-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-slate-500">レンズ予算</p>
        {selected && (
          <button
            onClick={() => onChange(null)}
            className="text-[9px] text-slate-600 hover:text-slate-400 transition-colors"
          >
            ✕ 解除
          </button>
        )}
      </div>
      {/* ラベル行 */}
      <div className="flex justify-between mb-1.5 px-1">
        {BUDGETS.map((b, i) => (
          <span
            key={b.id}
            className={`text-[9px] font-medium transition-colors ${
              i === idx ? 'text-amber-400' : 'text-slate-600'
            }`}
          >
            {b.label}
          </span>
        ))}
      </div>
      {/* トラック + ステップドット */}
      <div className="relative h-5 flex items-center px-1">
        {/* ベーストラック */}
        <div className="absolute inset-x-1 h-0.5 rounded-full bg-slate-700" />
        {/* アクティブ部分 */}
        {idx >= 0 && (
          <div
            className="absolute left-1 h-0.5 rounded-full bg-amber-500 transition-all duration-200"
            style={{ width: `${(idx / (BUDGETS.length - 1)) * (100)}%` }}
          />
        )}
        {/* ドット */}
        <div className="relative w-full flex justify-between">
          {BUDGETS.map((b, i) => (
            <button
              key={b.id}
              title={b.prompt}
              onClick={() => onChange(idx === i ? null : b)}
              className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-150 hover:scale-125 focus:outline-none ${
                i <= idx
                  ? 'bg-amber-500 border-amber-400 shadow-sm shadow-amber-500/40'
                  : 'bg-slate-800 border-slate-600 hover:border-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 焦点距離レンジスライダー ──────────────────────────────
interface ZoneBand { label: string; short: string; startMm: number; endMm: number; color: string }
const ZONE_BANDS: ZoneBand[] = [
  { label: '超広角', short: '超広角', startMm: 12,  endMm: 24,  color: '#7c3aed' },
  { label: '広角',   short: '広角',   startMm: 24,  endMm: 35,  color: '#0284c7' },
  { label: '標準',   short: '標準',   startMm: 35,  endMm: 85,  color: '#059669' },
  { label: 'ポート', short: 'ポート', startMm: 85,  endMm: 135, color: '#d97706' },
  { label: '望遠',   short: '望遠',   startMm: 135, endMm: 600, color: '#dc2626' },
]
const ZONE_TICKS = [24, 35, 85, 135]

function FocalRangeSlider({
  range,
  onChange,
  macro,
  onMacroChange,
}: {
  range: FocalRange | null
  onChange: (r: FocalRange | null) => void
  macro: boolean
  onMacroChange: (v: boolean) => void
}) {
  const DEFAULT: FocalRange = { minMm: 24, maxMm: 85 }
  const trackRef = useRef<HTMLDivElement>(null)
  const liveRef  = useRef<FocalRange>(range ?? DEFAULT)
  const [display, setDisplay] = useState<FocalRange>(range ?? DEFAULT)
  const [active,  setActive]  = useState(range !== null)

  useEffect(() => {
    if (range) { liveRef.current = range; setDisplay(range); setActive(true) }
    else setActive(false)
  }, [range])

  function startDrag(handle: 'min' | 'max') {
    return (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!active) {
        liveRef.current = DEFAULT
        setDisplay(DEFAULT)
        setActive(true)
      }

      function getX(ev: MouseEvent | TouchEvent): number {
        return 'touches' in ev ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX
      }
      function onMove(ev: MouseEvent | TouchEvent) {
        if (!trackRef.current) return
        const rect = trackRef.current.getBoundingClientRect()
        const pct  = Math.max(0, Math.min(1, (getX(ev) - rect.left) / rect.width))
        const mm   = snapMm(logPctToMm(pct))
        const cur  = liveRef.current
        const next: FocalRange = handle === 'min'
          ? { minMm: Math.min(mm, cur.maxMm - 12), maxMm: cur.maxMm }
          : { minMm: cur.minMm, maxMm: Math.max(mm, cur.minMm + 12) }
        liveRef.current = next
        setDisplay({ ...next })
      }
      function onUp() {
        onChange(liveRef.current)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup',   onUp)
        document.removeEventListener('touchmove', onMove as EventListener)
        document.removeEventListener('touchend',  onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup',   onUp)
      document.addEventListener('touchmove', onMove as EventListener, { passive: false })
      document.addEventListener('touchend',  onUp)
    }
  }

  const minPct = mmToLogPct(display.minMm) * 100
  const maxPct = mmToLogPct(display.maxMm) * 100

  return (
    <div className="px-1">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] text-slate-500">焦点距離</p>
        {active && (
          <button
            onClick={() => { setActive(false); setDisplay(DEFAULT); liveRef.current = DEFAULT; onChange(null) }}
            className="text-[9px] text-slate-600 hover:text-slate-400 transition-colors"
          >
            ✕ 解除
          </button>
        )}
      </div>

      {/* ゾーンラベル行 */}
      <div className="relative h-4 mb-0.5">
        {ZONE_BANDS.map((z) => {
          const left = mmToLogPct(z.startMm) * 100
          const w    = (mmToLogPct(z.endMm) - mmToLogPct(z.startMm)) * 100
          return (
            <div key={z.label} className="absolute inset-y-0 flex items-center justify-center overflow-hidden"
              style={{ left: `${left}%`, width: `${w}%` }}>
              <span className="text-[7.5px] font-semibold truncate" style={{ color: z.color, opacity: 0.75 }}>
                {z.short}
              </span>
            </div>
          )
        })}
      </div>

      {/* スライダートラック */}
      <div ref={trackRef} className="relative h-8 flex items-center select-none">
        {/* ゾーン色帯（背景） */}
        <div className="absolute inset-x-0 h-2 rounded-full overflow-hidden flex">
          {ZONE_BANDS.map((z) => (
            <div key={z.label}
              style={{ flex: mmToLogPct(z.endMm) - mmToLogPct(z.startMm), backgroundColor: z.color, opacity: active ? 0.2 : 0.1 }}
            />
          ))}
        </div>
        {/* 選択範囲ハイライト */}
        <div className="absolute h-2 rounded-full"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%`, background: active ? 'rgba(14,165,233,0.55)' : 'transparent' }}
        />
        {/* Min ハンドル */}
        <div
          className={`absolute w-5 h-5 rounded-full border-2 cursor-grab active:cursor-grabbing shadow-md z-10 transition-colors ${
            active ? 'bg-sky-500 border-sky-300 shadow-sky-500/40' : 'bg-slate-700 border-slate-500 hover:border-slate-400'
          }`}
          style={{ left: `${minPct}%`, top: '50%', transform: 'translate(-50%,-50%)' }}
          onMouseDown={startDrag('min')}
          onTouchStart={startDrag('min')}
        />
        {/* Max ハンドル */}
        <div
          className={`absolute w-5 h-5 rounded-full border-2 cursor-grab active:cursor-grabbing shadow-md z-10 transition-colors ${
            active ? 'bg-sky-500 border-sky-300 shadow-sky-500/40' : 'bg-slate-700 border-slate-500 hover:border-slate-400'
          }`}
          style={{ left: `${maxPct}%`, top: '50%', transform: 'translate(-50%,-50%)' }}
          onMouseDown={startDrag('max')}
          onTouchStart={startDrag('max')}
        />
      </div>

      {/* mm 値ラベル */}
      <div className="relative h-4 mt-0.5">
        {maxPct - minPct > 14 ? (
          <>
            <span className={`absolute text-[10px] font-mono font-semibold -translate-x-1/2 ${active ? 'text-sky-400' : 'text-slate-600'}`}
              style={{ left: `${minPct}%` }}>{display.minMm}</span>
            <span className={`absolute text-[10px] font-mono font-semibold -translate-x-1/2 ${active ? 'text-sky-400' : 'text-slate-600'}`}
              style={{ left: `${maxPct}%` }}>{display.maxMm}</span>
          </>
        ) : (
          <span className={`absolute text-[10px] font-mono font-semibold -translate-x-1/2 ${active ? 'text-sky-400' : 'text-slate-600'}`}
            style={{ left: `${(minPct + maxPct) / 2}%` }}>{display.minMm}–{display.maxMm}</span>
        )}
      </div>

      {/* ゾーン境界ティック */}
      <div className="relative h-3">
        <span className="absolute text-[8px] text-slate-700" style={{ left: '0%' }}>12</span>
        {ZONE_TICKS.map((mm) => (
          <span key={mm} className="absolute text-[8px] text-slate-700 -translate-x-1/2"
            style={{ left: `${mmToLogPct(mm) * 100}%` }}>{mm}</span>
        ))}
        <span className="absolute text-[8px] text-slate-700 -translate-x-full" style={{ left: '100%' }}>600</span>
      </div>

      {/* マクロトグル */}
      <button
        onClick={() => onMacroChange(!macro)}
        className={`mt-2 w-full rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all flex items-center justify-between ${
          macro
            ? 'bg-purple-600 text-white'
            : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-white/10'
        }`}
      >
        <span>🔬 マクロ</span>
        <span className={`text-[9px] ${macro ? 'text-purple-200' : 'text-slate-600'}`}>等倍近接</span>
      </button>

      {/* 送信内容プレビュー */}
      {(active || macro) && (
        <p className="text-[10px] text-sky-400/70 mt-1.5 leading-snug">
          {[active && getFocalRangePrompt(display), macro && 'マクロ撮影を含む'].filter(Boolean).join('・')}
        </p>
      )}
    </div>
  )
}

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// summaryテキストから製品名を抽出（倉庫DOM注入ボタン用）
function extractNameFromSummary(text: string): string {
  const noEmoji = Array.from(text)
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0
      return !(
        (code >= 0x1f000 && code <= 0x1ffff) ||
        (code >= 0x2600 && code <= 0x27bf) ||
        (code >= 0x2300 && code <= 0x23ff) ||
        code === 0x2b50 || code === 0x2b55 || code === 0xfe0f
      )
    })
    .join('')
  return noEmoji
    .replace(/【[^】]*】/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/^\s*[0-9]+[.．、。:：]\s*/, '')
    .trim()
}

// localStorage から安全に読み込むヘルパー
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

export default function ChatInterface() {
  // 初期値をlocalStorageから直接読み込む（競合状態なし）
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadFromStorage<ChatMessage[]>('chatMessages', [])
    return saved.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(() =>
    loadFromStorage<string | null>('chatConversationId', null) ?? undefined
  )
  const [warehouseCount, setWarehouseCount] = useState(0)

  // ── マウント設定（localStorage で永続化）────────────────
  const [selectedMount, setSelectedMount] = useState<MountOption | null>(() => {
    const savedId = loadFromStorage<string | null>('selectedMountId', null)
    return MOUNTS.find((m) => m.id === savedId) ?? null
  })
  function handleMountChange(mount: MountOption) {
    setSelectedMount(mount)
    try { localStorage.setItem('selectedMountId', mount.id) } catch { /* ignore */ }
  }

  // ── 予算設定（localStorage で永続化）─────────────────────
  const [selectedBudget, setSelectedBudget] = useState<BudgetOption | null>(() => {
    const savedId = loadFromStorage<string | null>('selectedBudgetId', null)
    return BUDGETS.find((b) => b.id === savedId) ?? null
  })
  function handleBudgetChange(budget: BudgetOption | null) {
    setSelectedBudget(budget)
    try {
      if (budget) localStorage.setItem('selectedBudgetId', budget.id)
      else localStorage.removeItem('selectedBudgetId')
    } catch { /* ignore */ }
  }

  // ── 焦点距離レンジ設定（localStorage で永続化）──────────
  const [selectedFocal, setSelectedFocal] = useState<FocalRange | null>(() =>
    loadFromStorage<FocalRange | null>('selectedFocalRange', null)
  )
  function handleFocalChange(range: FocalRange | null) {
    setSelectedFocal(range)
    try {
      if (range) localStorage.setItem('selectedFocalRange', JSON.stringify(range))
      else localStorage.removeItem('selectedFocalRange')
    } catch { /* ignore */ }
  }

  // ── マクロフラグ（localStorage で永続化）────────────────
  const [isMacro, setIsMacro] = useState<boolean>(() =>
    loadFromStorage<string | null>('isMacro', null) === 'true'
  )
  function handleMacroChange(val: boolean) {
    setIsMacro(val)
    try {
      if (val) localStorage.setItem('isMacro', 'true')
      else localStorage.removeItem('isMacro')
    } catch { /* ignore */ }
  }

  // ── ボディ設定（localStorage で永続化）───────────────────
  const [bodyInput, setBodyInput] = useState<string>(() =>
    loadFromStorage<string>('cameraBody', '')
  )
  function handleBodySave(val: string) {
    setBodyInput(val)
    try {
      if (val.trim()) localStorage.setItem('cameraBody', val.trim())
      else localStorage.removeItem('cameraBody')
    } catch { /* ignore */ }
  }

  const [showMobileSettings, setShowMobileSettings] = useState(false)

  const isComposingRef = useRef(false)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // メッセージが変わるたびに保存（最新30件）
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages.slice(-30)))
    } catch { /* ignore */ }
  }, [messages])

  // conversationIdが変わったら保存
  useEffect(() => {
    if (conversationId) localStorage.setItem('chatConversationId', conversationId)
  }, [conversationId])

  // 倉庫件数をlocalStorageから取得（リアルタイム更新）
  useEffect(() => {
    function updateCount() {
      try {
        const items = JSON.parse(localStorage.getItem('warehouse') ?? '[]')
        if (Array.isArray(items)) setWarehouseCount(items.length)
      } catch { /* ignore */ }
    }
    updateCount()
    // 他のコンポーネントが追加したときも検知
    window.addEventListener('storage', updateCount)
    window.addEventListener('warehouseUpdated', updateCount)
    return () => {
      window.removeEventListener('storage', updateCount)
      window.removeEventListener('warehouseUpdated', updateCount)
    }
  }, [])

  // <details>要素への倉庫ボタン注入（DOM操作）
  useEffect(() => {
    if (!chatAreaRef.current) return

    const details = chatAreaRef.current.querySelectorAll(
      '.prose-dify details:not([data-warehouse-injected])',
    )

    details.forEach((detail) => {
      detail.setAttribute('data-warehouse-injected', 'true')

      const summary = detail.querySelector('summary')
      const productName = extractNameFromSummary(summary?.textContent ?? '')
      if (!productName) return

      const btnWrapper = document.createElement('div')
      btnWrapper.className = 'warehouse-inject-btn'

      const btn = document.createElement('button')
      btn.textContent = '＋ 倉庫へ追加'
      btn.className = 'warehouse-add-btn'

      btn.addEventListener('click', async () => {
        btn.disabled = true
        btn.textContent = '保存中...'
        try {
          const res = await fetch('/api/warehouse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: productName,
              maker: '',
              category: 'lens',
              priceRange: '要確認',
              weight: '要確認',
              features: [],
              amazonUrl: generateAmazonSearchUrl(productName),
            }),
          })
          if (res.ok) {
            btn.textContent = '✓ 追加済み'
            btn.classList.add('saved')
            setWarehouseCount((prev) => prev + 1)
          } else if (res.status === 409) {
            btn.textContent = '✓ 追加済み'
            btn.classList.add('saved')
          } else {
            btn.disabled = false
            btn.textContent = '＋ 倉庫へ追加'
          }
        } catch {
          btn.disabled = false
          btn.textContent = '＋ 倉庫へ追加'
        }
      })

      btnWrapper.appendChild(btn)
      detail.appendChild(btnWrapper)
    })
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    // プロフィール情報をプレフィックスとして自動付与（ユーザー画面には表示しない）
    const profileLines: string[] = []
    if (selectedMount)          profileLines.push(`使用マウント: ${selectedMount.prompt}`)
    if (bodyInput.trim())       profileLines.push(`使用ボディ: ${bodyInput.trim()}`)
    if (selectedBudget)         profileLines.push(selectedBudget.prompt)
    if (selectedFocal)          profileLines.push(getFocalRangePrompt(selectedFocal))
    if (isMacro)                profileLines.push('マクロ撮影（等倍近接）ができるレンズを希望')

    const macroHint = isMacro
      ? 'マクロの場合はLAOWA（65mm F2.8 2X Ultra Macro APO、100mm F2.8 2X Ultra Macro APOなど）もレビュアーに評価されていれば選択肢の1つとして含めてください。'
      : ''

    const profilePrefix = profileLines.length > 0
      ? `【プロフィール】${profileLines.join(' / ')}\n【補足】2023〜2025年発売の最新レンズも積極的に含めて提案してください。${macroHint ? `\n${macroHint}` : ''}\n\n`
      : ''

    const displayText = trimmed
    const sendText = profilePrefix + trimmed

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: displayText, timestamp: new Date() },
    ])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sendText, conversationId }),
      })

      const data = (await res.json()) as {
        answer?: string
        conversationId?: string
        error?: string
      }

      if (!res.ok) throw new Error(data.error || 'エラーが発生しました')
      if (data.conversationId) setConversationId(data.conversationId)

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.answer ?? '',
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `エラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && e.shiftKey && !isComposingRef.current) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function renderAnswer(text: string): string {
    const rawHtml = marked.parse(text) as string
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['details', 'summary'],
      ADD_ATTR: ['target', 'rel'],
    })
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">

      {/* ── サイドバー（デスクトップのみ） ── */}
      <aside className="hidden md:flex flex-col w-[280px] flex-shrink-0 bg-slate-950 border-r border-white/5 overflow-visible">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 ring-1 ring-amber-500/30">
              <CameraIcon className="h-4 w-4 text-amber-400" />
            </div>
            <span className="font-bold text-white text-sm tracking-wide">Camera Concierge</span>
          </div>
          <p className="text-[11px] text-slate-500 ml-[42px]">AI カメラ・レンズ相談</p>
        </div>

        {/* プロフィール設定 */}
        <div className="px-3 py-3 border-b border-white/5 relative z-10 space-y-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-1">
            マイプロフィール
          </p>

          {/* マウント */}
          <MountSelector selected={selectedMount} onChange={handleMountChange} />

          {/* 使用ボディ */}
          <div className="px-1">
            <p className="text-[10px] text-slate-500 mb-1">使用ボディ</p>
            {selectedMount && BODIES_BY_MOUNT[selectedMount.id] ? (
              /* マウント選択済み → ドロップダウン + 自由入力 */
              <div className="space-y-1">
                <select
                  value={BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) ? bodyInput : '__custom__'}
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') handleBodySave(e.target.value)
                  }}
                  className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                >
                  <option value="">-- 選択してください --</option>
                  {BODIES_BY_MOUNT[selectedMount.id].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__custom__">その他（直接入力）</option>
                </select>
                {/* 「その他」選択時または一覧外のボディの場合は自由入力も表示 */}
                {(!BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) || bodyInput === '') && (
                  <input
                    type="text"
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                    onBlur={(e) => handleBodySave(e.target.value)}
                    placeholder="機種名を直接入力..."
                    className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                )}
              </div>
            ) : (
              /* マウント未選択 → 自由入力のみ */
              <input
                type="text"
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                onBlur={(e) => handleBodySave(e.target.value)}
                placeholder="マウントを先に選択すると候補が出ます"
                className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
              />
            )}
          </div>

          {/* 予算スライダー */}
          <BudgetSlider selected={selectedBudget} onChange={handleBudgetChange} />

          {/* 焦点距離レンジスライダー */}
          <FocalRangeSlider
            range={selectedFocal}
            onChange={handleFocalChange}
            macro={isMacro}
            onMacroChange={handleMacroChange}
          />

          {/* 設定済みバッジ */}
          {(selectedMount || bodyInput || selectedBudget || selectedFocal || isMacro) && (
            <p className="px-1 text-[10px] text-amber-500/70">
              ✓ 質問に自動付与されます
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 px-1">
            クイック質問
          </p>
          <div className="space-y-1">
            {QUICK_QUESTIONS.map((q, i) => (
              <motion.button
                key={q}
                onClick={() => sendMessage(q)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.97 }}
                className="group w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-slate-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-600 group-hover:text-amber-400 transition-colors" />
                <span className="leading-snug">{q}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          {/* 新規会話ボタン */}
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm('会話履歴をリセットしますか？')) {
                  localStorage.removeItem('chatMessages')
                  localStorage.removeItem('chatConversationId')
                  setMessages([])
                  setConversationId(undefined)
                }
              }}
              className="w-full rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors text-left"
            >
              🗑️ 新規会話を開始
            </button>
          )}
          <Link
            href="/warehouse"
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              <span>デジタル倉庫</span>
            </div>
            {warehouseCount > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400 font-semibold tabular-nums">
                {warehouseCount}
              </span>
            )}
          </Link>
        </div>
      </aside>

      {/* ── メインチャットエリア ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div ref={chatAreaRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-6">

            {messages.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20 mb-4">
                  <CameraIcon className="h-8 w-8 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  何を撮りたいですか？
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  シーンを選ぶか、自由に話しかけてください
                </p>
                {/* シーン選択グリッド（全画面サイズで表示） */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto mb-4">
                  {SCENES.map((s, i) => (
                    <motion.button
                      key={s.q}
                      onClick={() => sendMessage(s.q)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-slate-700 shadow-sm hover:border-amber-300 hover:shadow-md hover:bg-amber-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-amber-500 dark:hover:bg-amber-500/10"
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-xs font-medium leading-tight">{s.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-amber-500' : 'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="h-4 w-4 text-white" />
                      : <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    }
                  </div>

                  <div className="flex-1">
                    {msg.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-amber-500 px-4 py-3 text-sm leading-relaxed text-white whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* HTMLレンダリング */}
                        <div
                          className="chat-answer prose-dify rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-700 px-4 py-3 text-sm leading-relaxed text-slate-900 dark:text-slate-100"
                          dangerouslySetInnerHTML={{ __html: renderAnswer(msg.content) }}
                        />
                        {/* レンズ推薦カード（Reactコンポーネント） */}
                        <LensRecommendationCards responseText={msg.content} />
                        {/* AI選択肢ボタン */}
                        <ChoiceButtons text={msg.content} onSelect={sendMessage} />
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* タイピングインジケーター */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-700 px-4 py-3">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        </div>

        {/* モバイル設定ボトムシート */}
        <AnimatePresence>
          {showMobileSettings && (
            <>
              {/* オーバーレイ */}
              <motion.div
                className="md:hidden fixed inset-0 bg-black/60 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileSettings(false)}
              />
              {/* パネル */}
              <motion.div
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 rounded-t-2xl border-t border-white/10 max-h-[80vh] overflow-y-auto"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                {/* ハンドル */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">プロフィール設定</p>
                  <button onClick={() => setShowMobileSettings(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-4 py-4 space-y-4">
                  <MountSelector selected={selectedMount} onChange={handleMountChange} />
                  <div className="px-1">
                    <p className="text-[10px] text-slate-500 mb-1">使用ボディ</p>
                    {selectedMount && BODIES_BY_MOUNT[selectedMount.id] ? (
                      <div className="space-y-1">
                        <select
                          value={BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) ? bodyInput : '__custom__'}
                          onChange={(e) => { if (e.target.value !== '__custom__') handleBodySave(e.target.value) }}
                          className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-2.5 py-2 text-sm text-slate-200 focus:outline-none"
                        >
                          <option value="">-- 選択してください --</option>
                          {BODIES_BY_MOUNT[selectedMount.id].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                          <option value="__custom__">その他（直接入力）</option>
                        </select>
                        {(!BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) || bodyInput === '') && (
                          <input type="text" value={bodyInput}
                            onChange={(e) => setBodyInput(e.target.value)}
                            onBlur={(e) => handleBodySave(e.target.value)}
                            placeholder="機種名を直接入力..."
                            className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-2.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
                          />
                        )}
                      </div>
                    ) : (
                      <input type="text" value={bodyInput}
                        onChange={(e) => setBodyInput(e.target.value)}
                        onBlur={(e) => handleBodySave(e.target.value)}
                        placeholder="マウントを先に選択すると候補が出ます"
                        className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-2.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
                      />
                    )}
                  </div>
                  <BudgetSlider selected={selectedBudget} onChange={handleBudgetChange} />
                  <FocalRangeSlider range={selectedFocal} onChange={handleFocalChange} macro={isMacro} onMacroChange={handleMacroChange} />
                  {(selectedMount || bodyInput || selectedBudget || selectedFocal || isMacro) && (
                    <p className="px-1 text-[11px] text-amber-500/70">✓ 質問に自動付与されます</p>
                  )}
                  <button
                    onClick={() => setShowMobileSettings(false)}
                    className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white"
                  >
                    設定を保存して閉じる
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 入力エリア */}
        <div className="border-t border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900 px-4 py-3">
          <div className="mx-auto max-w-3xl">
            {/* モバイル用ツールバー */}
            <div className="md:hidden flex items-center justify-between mb-2">
              {/* 設定バッジ */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                {selectedMount && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] text-amber-600 dark:text-amber-400">
                    <CameraIcon className="h-2.5 w-2.5" />{selectedMount.label}
                  </span>
                )}
                {selectedBudget && (
                  <span className="rounded-full bg-slate-700/50 border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">
                    {selectedBudget.label}
                  </span>
                )}
                {selectedFocal && (
                  <span className="rounded-full bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 text-[11px] text-sky-400 font-mono">
                    {selectedFocal.minMm}–{selectedFocal.maxMm}mm
                  </span>
                )}
                {!selectedMount && !selectedBudget && !selectedFocal && (
                  <span className="text-[11px] text-slate-500">設定未選択</span>
                )}
              </div>
              {/* アクションボタン */}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('会話履歴をリセットしますか？')) {
                        localStorage.removeItem('chatMessages')
                        localStorage.removeItem('chatConversationId')
                        setMessages([])
                        setConversationId(undefined)
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-400"
                    title="会話をリセット"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowMobileSettings(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-400"
                  title="設定"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => { isComposingRef.current = true }}
                onCompositionEnd={() => { isComposingRef.current = false }}
                placeholder="例：運動会で動く子供を撮りたい..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30 max-h-32 overflow-y-auto dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
                }}
              />
              <motion.button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-600 hidden md:block">
              Shift+Enter で送信 / Enter で改行
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
